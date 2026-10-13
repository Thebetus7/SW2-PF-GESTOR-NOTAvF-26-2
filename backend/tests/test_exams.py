import pytest
from decimal import Decimal
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from apps.authentication.models import User, UserRole
from apps.academics.models import Subject, ClassroomParallel
from apps.exams.models import Exam, ExamComponent, ComponentType

@pytest.mark.django_db
class TestExams:
    def setup_method(self):
        self.client = APIClient()
        self.teacher_user = User.objects.create_user(
            email='teacher.exam@test.com',
            password='Password123!',
            role=UserRole.TEACHER,
            first_name='Profesor',
            last_name='Exámenes'
        )
        self.subject = Subject.objects.create(
            code='SW2-01',
            name='Ingeniería de Software 2',
            teacher=self.teacher_user
        )
        self.parallel = ClassroomParallel.objects.create(
            subject=self.subject,
            group_code='A',
            period='1-2026'
        )

    def test_create_modular_exam_success(self):
        self.client.force_authenticate(user=self.teacher_user)
        url = reverse('exams:exams-list')

        payload = {
            'parallel': str(self.parallel.id),
            'title': 'Primer Parcial de Arquitectura',
            'description': 'Resuelva de forma clara y manuscrita en los espacios asignados.',
            'application_date': '2026-05-10',
            'total_score': '100.00',
            'has_qr_code': True,
            'components': [
                {
                    'type': ComponentType.OPEN,
                    'prompt': 'Explique la diferencia entre Clean Architecture y Arquitectura Hexagonal.',
                    'options_or_rubric': {
                        'context': 'Ambas aíslan el núcleo de negocio, pero Hexagonal usa puertos/adaptadores y Clean usa capas concéntricas con regla de dependencias.',
                        'tolerance_keywords': ['puertos', 'adaptadores', 'regla de dependencia', 'independencia'],
                    },
                    'max_score': '50.00',
                    'order': 1,
                },
                {
                    'type': ComponentType.MULTIPLE_CHOICE,
                    'prompt': '¿Cuál de los siguientes principios corresponde a SOLID?',
                    'options_or_rubric': {
                        'options': ['Inversión de Dependencias', 'Programación Reactiva', 'Microservicios', 'Docker'],
                        'correct_answer': 'Inversión de Dependencias',
                    },
                    'max_score': '30.00',
                    'order': 2,
                },
                {
                    'type': ComponentType.TRUE_FALSE,
                    'prompt': 'En TDD, las pruebas se escriben antes del código de producción.',
                    'options_or_rubric': {
                        'correct_answer': True,
                    },
                    'max_score': '20.00',
                    'order': 3,
                },
            ]
        }

        response = self.client.post(url, payload, format='json')
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data['title'] == 'Primer Parcial de Arquitectura'
        assert len(data['components']) == 3
        assert data['components_sum'] == '100.00'

        # Verificar en base de datos
        created_exam = Exam.objects.get(id=data['id'])
        assert created_exam.components.count() == 3
        assert created_exam.current_components_score_sum == Decimal('100.00')

    def test_create_exam_with_invalid_sum_fails(self):
        self.client.force_authenticate(user=self.teacher_user)
        url = reverse('exams:exams-list')

        # La suma da 40 + 20 = 60, pero el total es 100
        payload = {
            'parallel': str(self.parallel.id),
            'title': 'Examen Mal Balanceado',
            'application_date': '2026-05-10',
            'total_score': '100.00',
            'components': [
                {
                    'type': ComponentType.OPEN,
                    'prompt': 'Pregunta corta',
                    'max_score': '40.00',
                },
                {
                    'type': ComponentType.OPEN,
                    'prompt': 'Pregunta dos',
                    'max_score': '20.00',
                }
            ]
        }

        response = self.client.post(url, payload, format='json')
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'total_score' in response.json()
