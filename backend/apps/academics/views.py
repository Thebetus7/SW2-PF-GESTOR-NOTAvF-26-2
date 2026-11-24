from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db import models
from apps.authentication.models import User, UserRole
from .models import Subject, ClassroomParallel, Student, StudentEnrollment
from .serializers import (
    SubjectSerializer,
    ClassroomParallelSerializer,
    StudentSerializer,
    TeacherAdminSerializer,
    StudentAdminSerializer,
)
from .services.excel_importer import ExcelStudentImporter

class IsAdminUserRole(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role == UserRole.ADMIN
        )

class IsTeacherOrAdminRole(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role in [UserRole.ADMIN, UserRole.TEACHER]
        )

class TeacherManagementViewSet(viewsets.ModelViewSet):
    """
    CRUD exclusivo para el Administrador para crear y gestionar cuentas de profesores.
    """
    serializer_class = TeacherAdminSerializer
    permission_classes = [IsAdminUserRole]

    def get_queryset(self):
        return User.objects.filter(role=UserRole.TEACHER).order_by('-date_joined')

class StudentManagementViewSet(viewsets.ModelViewSet):
    """
    CRUD para que el Administrador registre y gestione estudiantes individuales de forma ágil.
    """
    serializer_class = StudentAdminSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsTeacherOrAdminRole()]
        return [IsAdminUserRole()]

    def get_queryset(self):
        qs = Student.objects.all().prefetch_related('enrollments__parallel__subject').order_by('-created_at')
        parallel_id = self.request.query_params.get('parallel_id')
        if parallel_id:
            qs = qs.filter(enrollments__parallel_id=parallel_id)
        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(
                models.Q(full_name__icontains=search) |
                models.Q(student_id_code__icontains=search) |
                models.Q(email__icontains=search)
            )
        return qs

class SubjectViewSet(viewsets.ModelViewSet):
    """
    Gestión de Materias académicas.
    """
    serializer_class = SubjectSerializer
    permission_classes = [IsTeacherOrAdminRole]

    def get_queryset(self):
        user = self.request.user
        if user.role == UserRole.ADMIN:
            return Subject.objects.all().prefetch_related('parallels')
        return Subject.objects.filter(teacher=user).prefetch_related('parallels')

    def perform_create(self, serializer):
        user = self.request.user
        if user.role == UserRole.TEACHER:
            serializer.save(teacher=user)
        else:
            serializer.save()

class ClassroomParallelViewSet(viewsets.ModelViewSet):
    """
    Gestión de Paralelos / Aulas.
    """
    serializer_class = ClassroomParallelSerializer
    permission_classes = [IsTeacherOrAdminRole]

    def get_queryset(self):
        user = self.request.user
        subject_id = self.request.query_params.get('subject_id')
        qs = ClassroomParallel.objects.all().select_related('subject')

        if user.role == UserRole.TEACHER:
            qs = qs.filter(subject__teacher=user)

        if subject_id:
            qs = qs.filter(subject_id=subject_id)

        return qs

    @action(detail=True, methods=['post'], url_path='import-students', permission_classes=[IsAdminUserRole])
    def import_students(self, request, pk=None):
        parallel = self.get_object()
        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response(
                {'error': 'Debe proporcionar un archivo Excel (.xlsx) en el campo "file".'},
                status=status.HTTP_400_BAD_REQUEST
            )
        try:
            result = ExcelStudentImporter.import_from_file(file_obj, parallel)
            if not result['success']:
                return Response(result, status=status.HTTP_400_BAD_REQUEST)
            return Response(result, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {'error': f'Error al procesar el archivo Excel: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['get'], url_path='students')
    def list_students(self, request, pk=None):
        """Retorna la lista de estudiantes inscritos en el aula/paralelo."""
        parallel = self.get_object()
        enrollments = parallel.enrollments.select_related('student').all()
        students = [enr.student for enr in enrollments]
        serializer = StudentSerializer(students, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class StudentDetailView(APIView):
    """
    Permite al docente consultar la ficha y detalle individual del estudiante.
    """
    permission_classes = [IsTeacherOrAdminRole]

    def get(self, request, student_id):
        student = Student.objects.filter(id=student_id).first()
        if not student:
            return Response(
                {'error': 'Estudiante no encontrado'},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = StudentSerializer(student)
        enrollments = student.enrollments.select_related('parallel__subject').all()

        courses = [
            {
                'parallelId': str(enr.parallel.id),
                'subjectName': enr.parallel.subject.name,
                'subjectCode': enr.parallel.subject.code,
                'groupCode': enr.parallel.group_code,
                'period': enr.parallel.period,
                'enrolledAt': enr.enrolled_at.isoformat(),
            }
            for enr in enrollments
        ]

        data = serializer.data
        data['courses'] = courses
        return Response(data, status=status.HTTP_200_OK)
