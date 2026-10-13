import base64
import difflib
import logging
from typing import Optional
from decimal import Decimal
from django.db import transaction

from apps.evaluations.models import (
    StudentEvaluation,
    EvaluationStatus,
    GradeDetail,
)
from apps.exams.models import ExamComponent
from apps.academics.models import Student
from apps.ai_engine.services.gemini_client import GeminiResilientClient
from apps.ai_engine.services.prompt_builder import build_exam_evaluation_prompt
from apps.ai_engine.exceptions import GeminiAPIError

logger = logging.getLogger(__name__)

class EvaluationPipeline:
    """
    Pipeline que orquesta la lectura multimodal por IA, emparejamiento con el padrón
    de estudiantes y cómputo de calificaciones para exámenes manuscritos.
    """

    def __init__(self, gemini_client: Optional[GeminiResilientClient] = None):
        self.gemini_client = gemini_client or GeminiResilientClient()

    def process_evaluation(self, evaluation: StudentEvaluation) -> StudentEvaluation:
        """
        Ejecuta el procesamiento completo de la evaluación.
        Si la IA falla, aplica degradación elegante a REVISION_DOCENTE.
        """
        evaluation.status = EvaluationStatus.PROCESANDO_IA
        evaluation.save(update_fields=["status"])

        # 1. Obtener páginas JPG en Base64
        pages = evaluation.pages.all().order_by("page_number")
        if not pages.exists():
            evaluation.status = EvaluationStatus.REVISION_DOCENTE
            evaluation.teacher_notes = "No se encontraron páginas digitalizadas asociadas al examen."
            evaluation.save(update_fields=["status", "teacher_notes"])
            return evaluation

        images_b64 = []
        for p in pages:
            try:
                with p.image.open("rb") as f:
                    data = f.read()
                    images_b64.append(base64.b64encode(data).decode("utf-8"))
            except Exception as e:
                logger.error("Error al leer imagen de página %s: %s", p.id, e)

        # 2. Lista de estudiantes inscritos para emparejamiento
        enrolled_students = []
        parallel_students = []
        if evaluation.parallel:
            parallel_students = [
                enr.student for enr in evaluation.parallel.enrollments.select_related("student").all()
            ]
            for s in parallel_students:
                enrolled_students.append({
                    "id": str(s.id),
                    "student_identifier": s.student_id_code,
                    "full_name": s.full_name,
                })

        # 3. Construir prompt pedagógico
        prompt = build_exam_evaluation_prompt(evaluation.exam, enrolled_students)

        # 4. Invocar cliente Gemini con Cascade Fallback
        try:
            ai_result = self.gemini_client.evaluate_exam_multimodal(
                prompt=prompt,
                images_base64=images_b64,
            )
        except Exception as exc:
            logger.warning("Fallo en inferencia IA para evaluación %s: %s", evaluation.id, exc)
            evaluation.status = EvaluationStatus.REVISION_DOCENTE
            evaluation.teacher_notes = (
                f"Calificación asistida no disponible ({type(exc).__name__}). "
                "Requiere revisión y calificación manual del docente."
            )
            evaluation.save(update_fields=["status", "teacher_notes"])
            return evaluation

        # 5. Aplicar resultados exitosos con transacción atómica
        with transaction.atomic():
            detected_id = ai_result.get("student_identifier_detected")
            detected_name = ai_result.get("student_name_detected")

            if detected_id:
                evaluation.raw_student_identifier = str(detected_id)
            if detected_name:
                evaluation.raw_student_name = str(detected_name)

            # Emparejamiento con el estudiante si aún no está asignado
            if not evaluation.student and parallel_students:
                matched_student = self._match_student(
                    enrolled_students=parallel_students,
                    identifier=detected_id,
                    name=detected_name,
                )
                if matched_student:
                    evaluation.student = matched_student

            # Crear o actualizar detalles de notas por componente
            components_map = {
                str(c.id): c for c in evaluation.exam.components.all()
            }
            # También mapear por orden 1, 2, 3... como fallback
            components_by_order = {
                c.order: c for c in evaluation.exam.components.all()
            }

            accumulated_score = Decimal("0.0")

            for comp_data in ai_result.get("components_evaluation", []):
                raw_comp_id = str(comp_data.get("component_id", ""))
                comp_instance = components_map.get(raw_comp_id)

                if not comp_instance:
                    # Intento de fallback si el LLM devolvió orden numérico
                    try:
                        order_idx = int(raw_comp_id)
                        comp_instance = components_by_order.get(order_idx)
                    except (ValueError, TypeError):
                        comp_instance = None

                if not comp_instance:
                    continue

                score_assigned = Decimal(str(comp_data.get("score_assigned", 0.0)))
                # Acotar entre 0 y el puntaje máximo del componente
                max_pts = Decimal(str(comp_instance.max_score))
                clamped_score = max(Decimal("0.0"), min(score_assigned, max_pts))
                accumulated_score += clamped_score

                GradeDetail.objects.update_or_create(
                    evaluation=evaluation,
                    component=comp_instance,
                    defaults={
                        "ai_score": clamped_score,
                        "final_score": clamped_score,
                        "transcribed_answer": comp_data.get("transcribed_answer", ""),
                        "ai_feedback": comp_data.get("feedback", ""),
                        "is_overridden": False,
                    },
                )

            evaluation.ai_total_score = accumulated_score
            evaluation.final_score = accumulated_score
            evaluation.status = (
                EvaluationStatus.EN_REVISION
                if evaluation.student
                else EvaluationStatus.REVISION_DOCENTE
            )
            if not evaluation.student:
                evaluation.teacher_notes = "Estudiante no identificado con certeza. Requiere asignación manual."

            evaluation.save()

        return evaluation

    def _match_student(
        self,
        enrolled_students,
        identifier: Optional[str],
        name: Optional[str],
    ) -> Optional[Student]:
        """Empareja un estudiante por matrícula exacta o similitud de nombre (> 0.75)."""
        if identifier:
            ident_clean = str(identifier).strip().upper()
            for s in enrolled_students:
                if s.student_id_code.strip().upper() == ident_clean:
                    return s

        if name:
            name_clean = str(name).strip().lower()
            best_match = None
            best_ratio = 0.0

            for s in enrolled_students:
                ratio = difflib.SequenceMatcher(
                    None, name_clean, s.full_name.strip().lower()
                ).ratio()
                if ratio > best_ratio:
                    best_ratio = ratio
                    best_match = s

            if best_ratio >= 0.75:
                return best_match

        return None
