import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from apps.authentication.models import User, UserRole
from apps.academics.models import Subject, ClassroomParallel
from apps.exams.models import Exam, ExamComponent, ComponentType

@pytest.mark.django_db
class TestPDFGenerator:
    def setup_method(self):
        self.client = APIClient()
        self.teacher_user = User.objects.create_user(
            email='teacher.pdf@test.com',
            password='Password123!',
            role=UserRole.TEACHER,
            first_name='Profesor',
            last_name='PDF'
        )
        self.subject = Subject.objects.create(
            code='SIS-300',
            name='Bases de Datos II',
            teacher=self.teacher_user
        )
        self.parallel = ClassroomParallel.objects.create(
            subject=self.subject,
            group_code='C',
            period='1-2026'
        )
        self.exam = Exam.objects.create(
            parallel=self.parallel,
            title='Examen Final de Bases de Datos',
            description='Escriba con letra de imprenta clara dentro de los recuadros.',
            application_date='2026-06-20',
            total_score=100.00,
            has_qr_code=True
        )
        ExamComponent.objects.create(
            exam=self.exam,
            type=ComponentType.OPEN,
            prompt='Explique el teorema CAP y cómo afecta a bases de datos distribuidas.',
            options_or_rubric={'context': 'Consistencia, Disponibilidad, Tolerancia a Particiones.'},
            max_score=50.00,
            order=1
        )
        ExamComponent.objects.create(
            exam=self.exam,
            type=ComponentType.MULTIPLE_CHOICE,
            prompt='¿Cuál nivel de aislamiento previene lecturas fantasmas?',
            options_or_rubric={'options': ['Read Uncommitted', 'Read Committed', 'Repeatable Read', 'Serializable'], 'correct_answer': 'Serializable'},
            max_score=30.00,
            order=2
        )
        ExamComponent.objects.create(
            exam=self.exam,
            type=ComponentType.TRUE_FALSE,
            prompt='Redis es un motor NoSQL clave-valor en memoria.',
            options_or_rubric={'correct_answer': True},
            max_score=20.00,
            order=3
        )

    def test_export_pdf_with_qr_success(self):
        self.client.force_authenticate(user=self.teacher_user)
        url = reverse('exams:exams-export-pdf', kwargs={'pk': self.exam.id})
        response = self.client.get(url, {'mode': 'with_qr'})

        assert response.status_code == status.HTTP_200_OK
        assert response['Content-Type'] == 'application/pdf'
        assert b'%PDF-' in response.content[:10]
        assert len(response.content) > 1000

    def test_export_pdf_without_qr_success(self):
        self.client.force_authenticate(user=self.teacher_user)
        url = reverse('exams:exams-export-pdf', kwargs={'pk': self.exam.id})
        response = self.client.get(url, {'mode': 'without_qr'})

        assert response.status_code == status.HTTP_200_OK
        assert response['Content-Type'] == 'application/pdf'
        assert b'%PDF-' in response.content[:10]
