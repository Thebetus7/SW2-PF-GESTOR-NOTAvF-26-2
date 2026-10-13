import uuid
from django.db import models
from django.conf import settings

class Subject(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    code = models.CharField(max_length=50, unique=True, verbose_name='Código de Materia')
    name = models.CharField(max_length=150, verbose_name='Nombre de la Materia')
    description = models.TextField(blank=True, verbose_name='Descripción')
    teacher = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.RESTRICT,
        related_name='subjects',
        verbose_name='Docente Titular'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Materia'
        verbose_name_plural = 'Materias'
        ordering = ['name']

    def __str__(self):
        return f"{self.code} - {self.name}"

class ClassroomParallel(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    subject = models.ForeignKey(
        Subject,
        on_delete=models.RESTRICT,
        related_name='parallels',
        verbose_name='Materia'
    )
    group_code = models.CharField(max_length=20, verbose_name='Grupo / Aula (ej. A, B)')
    period = models.CharField(max_length=50, default='1-2026', verbose_name='Periodo / Semestre')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Paralelo / Aula'
        verbose_name_plural = 'Paralelos / Aulas'
        constraints = [
            models.UniqueConstraint(
                fields=['subject', 'group_code', 'period'],
                name='unique_parallel_per_subject_period'
            )
        ]
        ordering = ['subject__name', 'group_code']

    def __str__(self):
        return f"{self.subject.name} - Aula {self.group_code} ({self.period})"

class Student(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='student_profile',
        verbose_name='Cuenta de Usuario'
    )
    student_id_code = models.CharField(
        max_length=50,
        unique=True,
        db_index=True,
        verbose_name='Matrícula / ID'
    )
    full_name = models.CharField(max_length=255, verbose_name='Nombre Completo')
    email = models.EmailField(blank=True, null=True, verbose_name='Correo Electrónico')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Estudiante'
        verbose_name_plural = 'Estudiantes'
        ordering = ['full_name']

    def __str__(self):
        return f"{self.student_id_code} - {self.full_name}"

class StudentEnrollment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(
        Student,
        on_delete=models.RESTRICT,
        related_name='enrollments',
        verbose_name='Estudiante'
    )
    parallel = models.ForeignKey(
        ClassroomParallel,
        on_delete=models.RESTRICT,
        related_name='enrollments',
        verbose_name='Paralelo / Aula'
    )
    enrolled_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Inscripción'
        verbose_name_plural = 'Inscripciones'
        constraints = [
            models.UniqueConstraint(
                fields=['student', 'parallel'],
                name='unique_student_enrollment_per_parallel'
            )
        ]

    def __str__(self):
        return f"{self.student.full_name} -> {self.parallel}"
