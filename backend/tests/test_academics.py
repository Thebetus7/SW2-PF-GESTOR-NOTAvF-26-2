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

    def test_list_enrolled_students_in_parallel(self):
        """Docente consulta la lista de alumnos inscritos en un aula específica."""
        self.client.force_authenticate(user=self.teacher_user)
        subject = Subject.objects.create(name='Álgebra Lineal', code='MAT102', teacher=self.teacher_user)
        parallel = ClassroomParallel.objects.create(subject=subject, group_code='B', period='1-2026')
        student = Student.objects.create(student_id_code='EST-102', full_name='Lucía Ramos')
        StudentEnrollment.objects.create(student=student, parallel=parallel)

        url = f"/api/v1/academics/parallels/{parallel.id}/students/"
        response = self.client.get(url)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data) == 1
        assert data[0]['student_id_code'] == 'EST-102'
        assert data[0]['full_name'] == 'Lucía Ramos'

    def test_admin_create_student_and_login_flexible(self):
        """Admin puede crear estudiante manualmente y el estudiante puede autenticarse con email o matrícula."""
        self.client.force_authenticate(user=self.admin_user)
        subject = Subject.objects.create(name='Física I', code='FIS101', teacher=self.teacher_user)
        parallel = ClassroomParallel.objects.create(subject=subject, group_code='A', period='1-2026')

        payload = {
            'full_name': 'Mario Hugo Morales',
            'email': 'mario.morales@estudiante.edu.bo',
            'student_id_code': 'EST-2026-999',
            'password': 'password123',
            'parallel_id': str(parallel.id),
        }

        url = '/api/v1/academics/students/'
        response = self.client.post(url, payload, format='json')
        assert response.status_code == status.HTTP_201_CREATED
        created_data = response.json()
        assert created_data['full_name'] == 'Mario Hugo Morales'
        assert created_data['student_id_code'] == 'EST-2026-999'
        assert created_data['email'] == 'mario.morales@estudiante.edu.bo'
        assert 'Física I' in created_data['parallel_name']

        # Desautenticar cliente para probar logins
        self.client.force_authenticate(user=None)

        # 1. Login con email y password
        login_res_email = self.client.post('/api/v1/auth/login/', {
            'email': 'mario.morales@estudiante.edu.bo',
            'password': 'password123',
        }, format='json')
        assert login_res_email.status_code == status.HTTP_200_OK
        assert 'access' in login_res_email.json()
        assert login_res_email.json()['user']['role'] == 'STUDENT'

        # 2. Login con student_id_code en campo de credenciales
        login_res_code = self.client.post('/api/v1/auth/login/', {
            'email': 'EST-2026-999',
            'password': 'password123',
        }, format='json')
        assert login_res_code.status_code == status.HTTP_200_OK
        assert 'access' in login_res_code.json()

        # 3. Login rápido por student_id_code
        login_res_fast = self.client.post('/api/v1/auth/login/student-id/', {
            'student_id_code': 'EST-2026-999',
        }, format='json')
        assert login_res_fast.status_code == status.HTTP_200_OK
        assert login_res_fast.json()['user']['studentIdCode'] == 'EST-2026-999'
