import uuid
from django.db import models

class ComponentType(models.TextChoices):
    OPEN = 'OPEN', 'Pregunta Abierta / Desarrollo'
    MULTIPLE_CHOICE = 'MULTIPLE_CHOICE', 'Opción Múltiple'
    TRUE_FALSE = 'TRUE_FALSE', 'Verdadero o Falso'

class Exam(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    parallel = models.ForeignKey(
        'academics.ClassroomParallel',
        on_delete=models.RESTRICT,
        related_name='exams',
        verbose_name='Paralelo / Aula'
    )
    title = models.CharField(max_length=200, verbose_name='Título del Examen')
    description = models.TextField(blank=True, verbose_name='Instrucciones Generales')
    application_date = models.DateField(verbose_name='Fecha de Aplicación')
    total_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=100.00,
        verbose_name='Puntaje Total Nominal'
    )
    has_qr_code = models.BooleanField(default=True, verbose_name='Incluye QR de Formato')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Examen'
        verbose_name_plural = 'Exámenes'
        ordering = ['-application_date', '-created_at']

    @property
    def current_components_score_sum(self):
        return sum(c.max_score for c in self.components.all())

    def __str__(self):
        return f"{self.title} - {self.parallel.subject.name} (Aula {self.parallel.group_code})"

class ExamComponent(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    exam = models.ForeignKey(
        Exam,
        on_delete=models.CASCADE,
        related_name='components',
        verbose_name='Examen'
    )
    type = models.CharField(
        max_length=20,
        choices=ComponentType.choices,
        default=ComponentType.OPEN,
        verbose_name='Tipo de Componente'
    )
    prompt = models.TextField(verbose_name='Enunciado de la Pregunta')
    options_or_rubric = models.JSONField(
        default=dict,
        blank=True,
        verbose_name='Opciones, Rúbrica, Contexto y Tolerancia'
    )
    max_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        verbose_name='Puntaje Máximo Asignado'
    )
    order = models.PositiveIntegerField(default=1, verbose_name='Orden en la Hoja')

    class Meta:
        verbose_name = 'Componente de Examen'
        verbose_name_plural = 'Componentes de Examen'
        ordering = ['order']

    def __str__(self):
        return f"P{self.order}. [{self.type}] {self.prompt[:40]}... ({self.max_score} pts)"
