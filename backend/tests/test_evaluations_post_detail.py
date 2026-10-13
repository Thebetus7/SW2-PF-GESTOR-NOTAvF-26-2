import pytest
from decimal import Decimal
from unittest.mock import patch
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIClient
from rest_framework import status

from apps.authentication.models import User, UserRole
from apps.academics.models import Subject, ClassroomParallel, Student, StudentEnrollment
from apps.exams.models import Exam, ExamComponent, ComponentType
from apps.evaluations.models import (
    StudentEvaluation,
    EvaluationStatus,
    GradeDetail,
    EvaluationPage,
)

@pytest.mark.django_db
class TestEvaluationsPostDetailAndPublish:

    @pytest.fixture
    def setup_data(self):
        teacher = User.objects.create_user(
            email="prof_post@test.com",
            password="password123",
            role=UserRole.TEACHER,
        )
        other_teacher = User.objects.create_user(
            email="other_prof@test.com",
            password="password123",
            role=UserRole.TEACHER,
        )
        subject = Subject.objects.create(name="Matemáticas Discretas", code="MAT200", teacher=teacher)
        parallel = ClassroomParallel.objects.create(subject=subject, group_code="A", period="1-2026")
        
        student = Student.objects.create(
            student_id_code="MAT-777",
            full_name="Maria Lopez",
            email="maria@test.com",
        )
        StudentEnrollment.objects.create(student=student, parallel=parallel)

        exam = Exam.objects.create(
            parallel=parallel,
            title="Examen Parcial 1",
            application_date="2026-03-20",
            total_score=100.0,
        )
        comp1 = ExamComponent.objects.create(
            exam=exam,
            order=1,
            type=ComponentType.OPEN,
            prompt="Demuestre por inducción",
            max_score=50.0,
        )
        comp2 = ExamComponent.objects.create(
            exam=exam,
            order=2,
            type=ComponentType.MULTIPLE_CHOICE,
            prompt="¿Cuál es la cardinalidad?",
            max_score=50.0,
        )

        evaluation = StudentEvaluation.objects.create(
            exam=exam,
            parallel=parallel,
            student=student,
            status=EvaluationStatus.EN_REVISION,
            ai_total_score=60.0,
            final_score=60.0,
        )
        g1 = GradeDetail.objects.create(
            evaluation=evaluation,
            component=comp1,
            ai_score=30.0,
            final_score=30.0,
            transcribed_answer="Base n=1 cumplida...",
            ai_feedback="Paso inductivo incompleto",
        )
        g2 = GradeDetail.objects.create(
            evaluation=evaluation,
            component=comp2,
            ai_score=30.0,
            final_score=30.0,
            transcribed_answer="Opción B",
            ai_feedback="Respuesta correcta",
        )

        return {
            "teacher": teacher,
            "other_teacher": other_teacher,
            "subject": subject,
            "parallel": parallel,
            "student": student,
            "exam": exam,
            "comp1": comp1,
            "comp2": comp2,
            "evaluation": evaluation,
            "g1": g1,
            "g2": g2,
        }

    def test_teacher_can_override_grade_with_mandatory_comment(self, setup_data):
        """El docente ajusta la nota de una pregunta y deja observación obligatoria."""
        client = APIClient()
        client.force_authenticate(user=setup_data["teacher"])

        eval_id = setup_data["evaluation"].id
        grade_id = setup_data["g1"].id
        url = f"/api/v1/evaluations/{eval_id}/grades/{grade_id}/"

        # Intento sin comentario válido debe fallar (HTTP 400)
        res_fail = client.patch(url, {"final_score": 45.0, "teacher_comment": "   "})
        assert res_fail.status_code == status.HTTP_400_BAD_REQUEST

        # Intento con nota mayor al puntaje máximo permitido (50) debe fallar (HTTP 400)
        res_overflow = client.patch(url, {"final_score": 60.0, "teacher_comment": "Muy buen razonamiento"})
        assert res_overflow.status_code == status.HTTP_400_BAD_REQUEST

        # Ajuste válido: sube de 30 a 45 con comentario docente
        res_ok = client.patch(
            url,
            {"final_score": 45.0, "teacher_comment": "Revisado físicamente: el paso inductivo es válido."},
        )
        assert res_ok.status_code == status.HTTP_200_OK
        data = res_ok.json()

        # Comprobar recalculo total (45 + 30 = 75)
        assert float(data["final_score"]) == 75.0
        assert data["is_score_overridden"] is True

        setup_data["g1"].refresh_from_db()
        assert setup_data["g1"].final_score == Decimal("45.0")
        assert setup_data["g1"].is_overridden is True
        assert "Revisado físicamente" in setup_data["g1"].teacher_comment

    def test_publish_exam_grades_forbidden_to_other_teacher(self, setup_data):
        """Un docente ajeno a la materia no puede publicar las calificaciones."""
        client = APIClient()
        client.force_authenticate(user=setup_data["other_teacher"])

        exam_id = setup_data["exam"].id
        url = f"/api/v1/evaluations/exams/{exam_id}/publish/"

        res = client.post(url)
        assert res.status_code == status.HTTP_403_FORBIDDEN

    def test_publish_exam_grades_success_by_owner_teacher(self, setup_data):
        """El docente titular publica las notas del aula con éxito."""
        client = APIClient()
        client.force_authenticate(user=setup_data["teacher"])

        exam_id = setup_data["exam"].id
        url = f"/api/v1/evaluations/exams/{exam_id}/publish/"

        res = client.post(url)
        assert res.status_code == status.HTTP_200_OK
        data = res.json()
        assert data["published_count"] == 1

        setup_data["evaluation"].refresh_from_db()
        assert setup_data["evaluation"].is_published is True
        assert setup_data["evaluation"].status == EvaluationStatus.PUBLICADO
        assert setup_data["evaluation"].published_at is not None
