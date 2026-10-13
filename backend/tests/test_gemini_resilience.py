import json
from unittest.mock import patch, MagicMock
import pytest
import requests
from django.core.files.uploadedfile import SimpleUploadedFile
from apps.ai_engine.services.response_sanitizer import sanitize_gemini_json_response
from apps.ai_engine.services.gemini_client import GeminiResilientClient
from apps.ai_engine.exceptions import (
    GeminiResponseParsingError,
    GeminiAllModelsExhaustedError,
)
from apps.evaluations.models import (
    StudentEvaluation,
    EvaluationStatus,
    EvaluationPage,
    GradeDetail,
)
from apps.evaluations.services.evaluation_pipeline import EvaluationPipeline
from apps.exams.models import Exam, ExamComponent, ComponentType
from apps.academics.models import Subject, ClassroomParallel, Student, StudentEnrollment
from apps.authentication.models import User, UserRole

@pytest.mark.django_db
class TestGeminiResilienceAndSanitization:

    def test_sanitize_gemini_json_markdown_blocks(self):
        """Verifica que el sanitizador elimine bloques de código markdown ```json y ```."""
        raw_markdown = """```json
        {
            "student_identifier_detected": "EST-1234",
            "score_assigned": 9.5
        }
        ```"""
        result = sanitize_gemini_json_response(raw_markdown)
        assert result["student_identifier_detected"] == "EST-1234"
        assert result["score_assigned"] == 9.5

    def test_sanitize_gemini_json_with_surrounding_text(self):
        """Verifica que extraiga el JSON válido aunque el modelo agregue texto conversacional."""
        raw_with_text = """Aquí está el resultado del examen analizado:
        {
            "total_score": 85.0,
            "overall_feedback": "Buen desempeño conceptual"
        }
        Espero que sea de ayuda."""
        result = sanitize_gemini_json_response(raw_with_text)
        assert result["total_score"] == 85.0
        assert result["overall_feedback"] == "Buen desempeño conceptual"

    def test_sanitize_gemini_json_invalid_raises_error(self):
        """Verifica que una respuesta completamente corrupta levante GeminiResponseParsingError."""
        with pytest.raises(GeminiResponseParsingError):
            sanitize_gemini_json_response("Respuesta en texto puro sin ningún JSON válido")

    @patch("apps.ai_engine.services.gemini_client.requests.post")
    def test_gemini_cascade_fallback_success_on_second_model(self, mock_post):
        """
        Simula que el modelo 1 (gemini-2.5-flash) devuelve HTTP 429,
        y el modelo 2 (gemini-2.5-pro) responde 200 con JSON válido.
        """
        mock_429 = MagicMock()
        mock_429.status_code = 429

        mock_200 = MagicMock()
        mock_200.status_code = 200
        mock_200.json.return_value = {
            "candidates": [{
                "content": {
                    "parts": [{"text": '{"student_identifier_detected": "EST-ROTATED", "total_score": 100.0}'}]
                }
            }]
        }

        mock_post.side_effect = [mock_429, mock_200]

        client = GeminiResilientClient(
            api_key="valid-test-key",
            models_cascade=["gemini-2.5-flash", "gemini-2.5-pro"],
            timeout_seconds=5,
        )

        result = client.evaluate_exam_multimodal(
            prompt="Evaluar examen",
            images_base64=["fake_b64"],
        )

        assert mock_post.call_count == 2
        assert result["student_identifier_detected"] == "EST-ROTATED"
        assert result["total_score"] == 100.0

    @patch("apps.ai_engine.services.gemini_client.requests.post")
    def test_gemini_cascade_exhausted_raises_exception(self, mock_post):
        """Simula que todos los modelos de la cascada fallan por 429, levantando GeminiAllModelsExhaustedError."""
        mock_429 = MagicMock()
        mock_429.status_code = 429
        mock_post.return_value = mock_429

        client = GeminiResilientClient(
            api_key="valid-test-key",
            models_cascade=["gemini-2.5-flash", "gemini-2.5-pro"],
        )

        with pytest.raises(GeminiAllModelsExhaustedError):
            client.evaluate_exam_multimodal("prompt", ["img_b64"])

    @patch.object(GeminiResilientClient, "evaluate_exam_multimodal")
    def test_pipeline_graceful_degradation_on_ai_failure(self, mock_evaluate):
        """
        Verifica que ante un fallo de la IA (GeminiAllModelsExhaustedError),
        el pipeline no lance 500 y degrade el examen a REVISION_DOCENTE.
        """
        mock_evaluate.side_effect = GeminiAllModelsExhaustedError("All models quota exhausted")

        teacher = User.objects.create_user(
            email="prof_pipe@test.com",
            password="pass",
            role=UserRole.TEACHER,
        )
        subject = Subject.objects.create(name="Física II", code="FIS202", teacher=teacher)
        parallel = ClassroomParallel.objects.create(subject=subject, group_code="B", period="1-2026")
        exam = Exam.objects.create(
            parallel=parallel,
            title="Primer Parcial",
            application_date="2026-03-15",
            total_score=100.0,
        )

        evaluation = StudentEvaluation.objects.create(
            exam=exam,
            parallel=parallel,
            status=EvaluationStatus.BORRADOR,
        )
        fake_img = SimpleUploadedFile("page1.jpg", b"fake image bytes", content_type="image/jpeg")
        EvaluationPage.objects.create(evaluation=evaluation, page_number=1, image=fake_img)

        pipeline = EvaluationPipeline()
        processed = pipeline.process_evaluation(evaluation)

        assert processed.status == EvaluationStatus.REVISION_DOCENTE
        assert "Calificación asistida no disponible" in processed.teacher_notes

    @patch.object(GeminiResilientClient, "evaluate_exam_multimodal")
    def test_pipeline_successful_processing_and_student_matching(self, mock_evaluate):
        """
        Verifica que ante una respuesta exitosa de la IA, el pipeline:
        1. Empareja al estudiante del paralelo por matrícula o similitud.
        2. Registra las notas por componente.
        3. Pasa el estado a EN_REVISION.
        """
        mock_evaluate.return_value = {
            "student_identifier_detected": "EST-0099",
            "student_name_detected": "Carlos Gomez",
            "ocr_confidence": 0.98,
            "components_evaluation": [
                {
                    "component_id": 1,
                    "score_assigned": 45.0,
                    "max_score": 50.0,
                    "is_correct": True,
                    "transcribed_answer": "Respuesta manuscrita de Carlos",
                    "feedback": "Bien razonado",
                }
            ],
            "total_score": 45.0,
            "overall_feedback": "Aprobado con buen desempeño",
        }

        teacher = User.objects.create_user(
            email="prof_pipe2@test.com",
            password="pass",
            role=UserRole.TEACHER,
        )
        subject = Subject.objects.create(name="Química General", code="QMC101", teacher=teacher)
        parallel = ClassroomParallel.objects.create(subject=subject, group_code="C", period="1-2026")
        student = Student.objects.create(
            student_id_code="EST-0099",
            full_name="Carlos Gomez",
            email="carlos@test.com",
        )
        StudentEnrollment.objects.create(student=student, parallel=parallel)

        exam = Exam.objects.create(
            parallel=parallel,
            title="Examen Química",
            application_date="2026-03-15",
            total_score=50.0,
        )
        comp = ExamComponent.objects.create(
            exam=exam,
            order=1,
            type=ComponentType.OPEN,
            prompt="Explique el enlace iónico",
            max_score=50.0,
            options_or_rubric={"expected_answer": "Transferencia de electrones"},
        )

        evaluation = StudentEvaluation.objects.create(
            exam=exam,
            parallel=parallel,
            status=EvaluationStatus.BORRADOR,
        )
        fake_img = SimpleUploadedFile("page1.jpg", b"fake image bytes", content_type="image/jpeg")
        EvaluationPage.objects.create(evaluation=evaluation, page_number=1, image=fake_img)

        pipeline = EvaluationPipeline()
        processed = pipeline.process_evaluation(evaluation)

        assert processed.status == EvaluationStatus.EN_REVISION
        assert processed.student == student
        assert processed.final_score == 45.0
        assert GradeDetail.objects.filter(evaluation=processed, component=comp).exists()
        grade = GradeDetail.objects.get(evaluation=processed, component=comp)
        assert grade.final_score == 45.0
        assert grade.transcribed_answer == "Respuesta manuscrita de Carlos"

