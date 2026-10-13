import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from apps.authentication.models import User, UserRole
from apps.academics.models import Subject, ClassroomParallel, Student, StudentEnrollment

@pytest.mark.django_db
class TestAcademics:
    def setup_method(self):
        self.client = APIClient()
        self.admin_user = User.objects.create_user(
            email='admin@test.com',
            password='Password123!',
            role=UserRole.ADMIN,
            first_name='Admin',
            last_name='Principal'
        )
        self.teacher_user = User.objects.create_user(
            email='teacher@test.com',
            password='Password123!',
            role=UserRole.TEACHER,
            first_name='Carlos',
            last_name='Docente'
        )

    def test_admin_can_create_teacher(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('academics:teachers-list')
        payload = {
            'email': 'nuevo.profe@test.com',
            'first_name': 'Roberto',
            'last_name': 'Gómez',
            'password': 'SecurePassword2026!',
        }
        response = self.client.post(url, payload, format='json')
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data['email'] == 'nuevo.profe@test.com'
        assert data['full_name'] == 'Roberto Gómez'

        created_teacher = User.objects.get(email='nuevo.profe@test.com')
        assert created_teacher.role == UserRole.TEACHER

    def test_teacher_cannot_create_teacher(self):
        self.client.force_authenticate(user=self.teacher_user)
        url = reverse('academics:teachers-list')
        payload = {
            'email': 'hacker.profe@test.com',
            'first_name': 'No',
            'last_name': 'Permitido',
            'password': 'Password123!',
        }
        response = self.client.post(url, payload, format='json')
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_teacher_create_subject_and_parallel(self):
        self.client.force_authenticate(user=self.teacher_user)
        # Crear materia
        sub_url = reverse('academics:subjects-list')
        sub_payload = {
            'code': 'SW2-2026',
            'name': 'Ingeniería de Software II',
            'description': 'Materia avanzada de arquitectura',
        }
        sub_resp = self.client.post(sub_url, sub_payload, format='json')
        assert sub_resp.status_code == status.HTTP_201_CREATED
        sub_id = sub_resp.json()['id']

        # Crear paralelo
        par_url = reverse('academics:parallels-list')
        par_payload = {
            'subject': sub_id,
            'group_code': 'A',
            'period': '1-2026',
        }
        par_resp = self.client.post(par_url, par_payload, format='json')
        assert par_resp.status_code == status.HTTP_201_CREATED
        assert par_resp.json()['group_code'] == 'A'

    def test_student_detail_view(self):
        self.client.force_authenticate(user=self.teacher_user)
        subject = Subject.objects.create(
            code='MAT-101',
            name='Cálculo I',
            teacher=self.teacher_user
        )
        parallel = ClassroomParallel.objects.create(
            subject=subject,
            group_code='B',
            period='1-2026'
        )
        student = Student.objects.create(
            student_id_code='EST-998877',
            full_name='Ana Lucía Flores',
            email='ana@test.com'
        )
        StudentEnrollment.objects.create(student=student, parallel=parallel)

        url = reverse('academics:student-detail', kwargs={'student_id': student.id})
        response = self.client.get(url)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data['student_id_code'] == 'EST-998877'
        assert data['full_name'] == 'Ana Lucía Flores'
        assert len(data['courses']) == 1
        assert data['courses'][0]['subjectName'] == 'Cálculo I'
