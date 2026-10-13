import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from apps.authentication.models import User, UserRole

@pytest.mark.django_db
class TestAuthentication:
    def setup_method(self):
        self.client = APIClient()

    def test_create_custom_user_roles(self):
        admin = User.objects.create_user(
            email='admin@test.com',
            password='Password123!',
            role=UserRole.ADMIN,
            first_name='Admin',
            last_name='User'
        )
        teacher = User.objects.create_user(
            email='teacher@test.com',
            password='Password123!',
            role=UserRole.TEACHER,
            first_name='Profesor',
            last_name='Docente'
        )
        student = User.objects.create_user(
            email='student@test.com',
            role=UserRole.STUDENT,
            first_name='Alumno',
            last_name='Estudiante',
            student_id_code='EST-TEST-001'
        )

        assert admin.role == UserRole.ADMIN
        assert teacher.role == UserRole.TEACHER
        assert student.role == UserRole.STUDENT
        assert student.student_id_code == 'EST-TEST-001'
        assert admin.full_name == 'Admin User'

    def test_demo_login_admin(self):
        url = reverse('authentication:demo_login')
        response = self.client.post(url, {'role': 'admin'}, format='json')
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert 'access' in data
        assert 'refresh' in data
        assert data['user']['role'] == 'ADMIN'
        assert data['user']['email'] == 'admin.demo@evaluacion.edu.bo'

    def test_demo_login_teacher(self):
        url = reverse('authentication:demo_login')
        response = self.client.post(url, {'role': 'teacher'}, format='json')
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data['user']['role'] == 'TEACHER'

    def test_demo_login_student(self):
        url = reverse('authentication:demo_login')
        response = self.client.post(url, {'role': 'student'}, format='json')
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data['user']['role'] == 'STUDENT'
        assert data['user']['studentIdCode'] == 'EST-2026-001'

    def test_student_login_by_id_success(self):
        # Crear estudiante
        User.objects.create_user(
            email='alumno1@test.com',
            role=UserRole.STUDENT,
            first_name='María',
            last_name='Gómez',
            student_id_code='SIS-2026-999'
        )

        url = reverse('authentication:student_id_login')
        response = self.client.post(url, {'student_id_code': 'SIS-2026-999'}, format='json')
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert 'access' in data
        assert data['user']['name'] == 'María Gómez'
        assert data['user']['studentIdCode'] == 'SIS-2026-999'

    def test_student_login_by_id_not_found(self):
        url = reverse('authentication:student_id_login')
        response = self.client.post(url, {'student_id_code': 'INEXISTENTE-123'}, format='json')
        assert response.status_code == status.HTTP_404_NOT_FOUND
