import io
import pytest
import openpyxl
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from apps.authentication.models import User, UserRole
from apps.academics.models import Subject, ClassroomParallel, Student, StudentEnrollment

@pytest.mark.django_db
class TestExcelImporter:
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
            first_name='Docente',
            last_name='Titular'
        )
        self.subject = Subject.objects.create(
            code='SIS-101',
            name='Sistemas Operativos',
            teacher=self.teacher_user
        )
        self.parallel = ClassroomParallel.objects.create(
            subject=self.subject,
            group_code='A',
            period='1-2026'
        )

    def _generate_excel_file(self, rows_data):
        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = "Estudiantes"
        for row in rows_data:
            ws.append(row)
        file_buffer = io.BytesIO()
        wb.save(file_buffer)
        file_buffer.seek(0)
        file_buffer.name = 'estudiantes_test.xlsx'
        return file_buffer

    def test_admin_import_students_success(self):
        self.client.force_authenticate(user=self.admin_user)
        excel_data = [
            ['Matricula', 'Nombre Completo', 'Email'],
            ['EST-2026-001', 'Juan Carlos Perez', 'juan.perez@test.com'],
            ['EST-2026-002', 'Laura Beatriz Gomez', 'laura.gomez@test.com'],
            ['EST-2026-003', 'Carlos Eduardo Lopez', ''],
            ['', 'Fila Invalida Sin ID', ''],
        ]
        excel_file = self._generate_excel_file(excel_data)

        url = reverse('academics:parallels-import-students', kwargs={'pk': self.parallel.id})
        response = self.client.post(url, {'file': excel_file}, format='multipart')

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data['success'] is True
        assert data['imported_count'] == 3
        assert data['enrolled_count'] == 3
        assert data['skipped_count'] == 1

        # Verificar en base de datos
        assert Student.objects.filter(student_id_code='EST-2026-001').exists()
        student1 = Student.objects.get(student_id_code='EST-2026-001')
        assert student1.full_name == 'Juan Carlos Perez'
        assert StudentEnrollment.objects.filter(student=student1, parallel=self.parallel).exists()

        # Verificar usuario creado para login de estudiante
        assert User.objects.filter(student_id_code='EST-2026-001', role=UserRole.STUDENT).exists()

    def test_teacher_cannot_import_students_forbidden(self):
        self.client.force_authenticate(user=self.teacher_user)
        excel_data = [
            ['Matricula', 'Nombre Completo'],
            ['EST-2026-999', 'Estudiante Ilegal'],
        ]
        excel_file = self._generate_excel_file(excel_data)

        url = reverse('academics:parallels-import-students', kwargs={'pk': self.parallel.id})
        response = self.client.post(url, {'file': excel_file}, format='multipart')

        assert response.status_code == status.HTTP_403_FORBIDDEN
