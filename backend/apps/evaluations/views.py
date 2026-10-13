from decimal import Decimal
from django.utils import timezone
from django.shortcuts import get_object_or_404
from django.db import transaction
from rest_framework import viewsets, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

from apps.authentication.models import UserRole
from apps.exams.models import Exam
from apps.academics.models import ClassroomParallel, Student
from apps.evaluations.models import (
    StudentEvaluation,
    EvaluationPage,
    GradeDetail,
    EvaluationStatus,
)
from apps.evaluations.serializers import (
    StudentEvaluationListSerializer,
    StudentEvaluationDetailSerializer,
    GradeDetailSerializer,
    GradeOverrideSerializer,
)
from apps.evaluations.services.evaluation_pipeline import EvaluationPipeline

class IsTeacherOrAdmin(permissions.BasePermission):
    """Permite acceso únicamente a Administradores y Docentes."""
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role in [UserRole.ADMIN, UserRole.TEACHER]
        )

class EvaluationSubmitView(APIView):
    """
    Recibe la entrega multipágina digitalizada desde Flutter (1..N hojas JPG),
    crea la evaluación y dispara el pipeline de calificación IA.
    """
    permission_classes = [permissions.IsAuthenticated, IsTeacherOrAdmin]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, *args, **kwargs):
        exam_id = request.data.get("exam_id")
        parallel_id = request.data.get("parallel_id")
        student_identifier = request.data.get("student_identifier")
        uploaded_pages = request.FILES.getlist("pages")

        if not exam_id:
            return Response(
                {"error": "El campo 'exam_id' es obligatorio."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        exam = get_object_or_404(Exam, id=exam_id)
        parallel = None
        if parallel_id:
            parallel = get_object_or_404(ClassroomParallel, id=parallel_id)
        else:
            parallel = exam.parallel

        with transaction.atomic():
            student = None
            if student_identifier:
                student = Student.objects.filter(
                    student_id_code=student_identifier.strip()
                ).first()

            evaluation = StudentEvaluation.objects.create(
                exam=exam,
                parallel=parallel,
                student=student,
                raw_student_identifier=student_identifier or "",
                status=EvaluationStatus.BORRADOR,
            )

            for idx, page_file in enumerate(uploaded_pages, start=1):
                EvaluationPage.objects.create(
                    evaluation=evaluation,
                    page_number=idx,
                    image=page_file,
                )

        # Ejecutar pipeline de inferencia y emparejamiento con IA
        pipeline = EvaluationPipeline()
        processed_eval = pipeline.process_evaluation(evaluation)

        serializer = StudentEvaluationDetailSerializer(
            processed_eval, context={"request": request}
        )
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class StudentEvaluationViewSet(viewsets.ModelViewSet):
    """
    ViewSet para la auditoría, consulta post-detalle y ajuste docente de evaluaciones.
    """
    queryset = StudentEvaluation.objects.all().select_related("exam", "parallel", "student").prefetch_related("pages", "grades")
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action == "list":
            return StudentEvaluationListSerializer
        return StudentEvaluationDetailSerializer

    def get_queryset(self):
        user = self.request.user
        qs = super().get_queryset()

        if user.role == UserRole.STUDENT:
            # Estudiante solo puede ver sus propias evaluaciones ya PUBLICADAS
            if hasattr(user, "student_profile") and user.student_profile:
                return qs.filter(student=user.student_profile, is_published=True)
            return qs.none()

        if user.role == UserRole.TEACHER:
            # Docente solo ve evaluaciones de sus materias
            qs = qs.filter(exam__parallel__subject__teacher=user)

        # Filtros opcionales
        exam_id = self.request.query_params.get("exam_id")
        if exam_id:
            qs = qs.filter(exam_id=exam_id)

        parallel_id = self.request.query_params.get("parallel_id")
        if parallel_id:
            qs = qs.filter(parallel_id=parallel_id)

        student_id = self.request.query_params.get("student_id")
        if student_id:
            qs = qs.filter(student_id=student_id)

        return qs

    @action(detail=True, methods=["patch"], url_path="grades/(?P<grade_id>[^/.]+)", permission_classes=[permissions.IsAuthenticated, IsTeacherOrAdmin])
    def override_grade(self, request, pk=None, grade_id=None):
        """
        Ajuste manual de calificación por parte del docente con observación obligatoria.
        """
        evaluation = self.get_object()
        grade = get_object_or_404(GradeDetail, id=grade_id, evaluation=evaluation)

        serializer = GradeOverrideSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        new_score = serializer.validated_data["final_score"]
        teacher_comment = serializer.validated_data["teacher_comment"]

        max_allowed = grade.component.max_score
        if new_score < Decimal("0.0") or new_score > max_allowed:
            return Response(
                {"error": f"La nota debe estar entre 0.0 y el máximo de {max_allowed} puntos."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        with transaction.atomic():
            grade.final_score = new_score
            grade.teacher_comment = teacher_comment
            grade.is_overridden = True
            grade.save(update_fields=["final_score", "teacher_comment", "is_overridden"])

            # Recalcular puntaje total de la evaluación directamente desde BD
            total_recalculated = sum(
                g.final_score for g in GradeDetail.objects.filter(evaluation=evaluation)
            )
            evaluation.final_score = total_recalculated
            evaluation.is_score_overridden = True
            evaluation.save(update_fields=["final_score", "is_score_overridden"])

        evaluation.refresh_from_db()
        detail_serializer = StudentEvaluationDetailSerializer(
            evaluation, context={"request": request}
        )
        return Response(detail_serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=["post"], url_path="exams/(?P<exam_id>[^/.]+)/publish", permission_classes=[permissions.IsAuthenticated, IsTeacherOrAdmin])
    def publish_exam_grades(self, request, exam_id=None):
        """
        Publica todas las evaluaciones de un examen para que los alumnos puedan visualizarlas.
        """
        exam = get_object_or_404(Exam, id=exam_id)

        # Verificar permisos sobre la materia
        if request.user.role == UserRole.TEACHER and exam.parallel.subject.teacher != request.user:
            return Response(
                {"error": "No tiene autorización para publicar notas de este examen."},
                status=status.HTTP_403_FORBIDDEN,
            )

        now = timezone.now()
        with transaction.atomic():
            evaluations = StudentEvaluation.objects.filter(exam=exam)
            updated_count = evaluations.update(
                is_published=True,
                published_at=now,
                status=EvaluationStatus.PUBLICADO,
            )

        return Response(
            {
                "message": f"Se publicaron con éxito {updated_count} evaluaciones del examen '{exam.title}'.",
                "published_count": updated_count,
                "published_at": now.isoformat(),
            },
            status=status.HTTP_200_OK,
        )
