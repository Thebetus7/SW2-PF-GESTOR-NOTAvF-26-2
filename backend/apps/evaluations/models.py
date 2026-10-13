import uuid
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from apps.exams.models import Exam, ExamComponent
from apps.academics.models import Student, ClassroomParallel

class EvaluationStatus(models.TextChoices):
    BORRADOR = "BORRADOR", "Borrador"
    PROCESANDO_IA = "PROCESANDO_IA", "Procesando con IA"
    EN_REVISION = "EN_REVISION", "En Revisión Docente"
    REVISION_DOCENTE = "REVISION_DOCENTE", "Requiere Revisión Manual (Fallo IA/Ilegible)"
    CALIFICADO = "CALIFICADO", "Calificado"
    PUBLICADO = "PUBLICADO", "Publicado"

class StudentEvaluation(models.Model):
    """
    Representa la evaluación completa de un estudiante para un examen específico,
    agrupando de 1 a N páginas manuscritas escaneadas en formato JPG.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name="evaluations")
    parallel = models.ForeignKey(
        ClassroomParallel,
        on_delete=models.RESTRICT,
        related_name="evaluations",
        null=True,
        blank=True,
    )
    student = models.ForeignKey(
        Student,
        on_delete=models.RESTRICT,
        related_name="evaluations",
        null=True,
        blank=True,
    )
    status = models.CharField(
        max_length=30,
        choices=EvaluationStatus.choices,
        default=EvaluationStatus.BORRADOR,
    )
    raw_student_name = models.CharField(max_length=255, blank=True, default="")
    raw_student_identifier = models.CharField(max_length=100, blank=True, default="")
    
    ai_total_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0.0,
        validators=[MinValueValidator(0.0), MaxValueValidator(100.0)],
    )
    final_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0.0,
        validators=[MinValueValidator(0.0), MaxValueValidator(100.0)],
    )
    is_score_overridden = models.BooleanField(default=False)
    teacher_notes = models.TextField(blank=True, default="")
    is_published = models.BooleanField(default=False)
    published_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Evaluación de Estudiante"
        verbose_name_plural = "Evaluaciones de Estudiantes"

    def __str__(self):
        student_str = self.student.full_name if self.student else (self.raw_student_name or "Sin identificar")
        return f"Evaluación {self.exam.title} - {student_str} ({self.status})"

class EvaluationPage(models.Model):
    """
    Página física escaneada en formato JPG perteneciente a la entrega del examen de un alumno.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    evaluation = models.ForeignKey(
        StudentEvaluation,
        on_delete=models.CASCADE,
        related_name="pages",
    )
    page_number = models.PositiveIntegerField()
    image = models.ImageField(upload_to="evaluations/pages/%Y/%m/")
    qr_data = models.CharField(max_length=255, blank=True, null=True)
    ocr_raw_text = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["page_number"]
        unique_together = ("evaluation", "page_number")
        verbose_name = "Página de Examen"
        verbose_name_plural = "Páginas de Examen"

    def __str__(self):
        return f"Pág {self.page_number} - Evaluación {self.evaluation.id}"

class GradeDetail(models.Model):
    """
    Puntaje detallado y retroalimentación para cada componente de examen evaluado por IA o docente.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    evaluation = models.ForeignKey(
        StudentEvaluation,
        on_delete=models.CASCADE,
        related_name="grades",
    )
    component = models.ForeignKey(
        ExamComponent,
        on_delete=models.RESTRICT,
        related_name="grades",
    )
    ai_score = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    final_score = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    transcribed_answer = models.TextField(blank=True, default="")
    ai_feedback = models.TextField(blank=True, default="")
    is_overridden = models.BooleanField(default=False)
    teacher_comment = models.TextField(blank=True, default="")

    class Meta:
        unique_together = ("evaluation", "component")
        verbose_name = "Detalle de Calificación"
        verbose_name_plural = "Detalles de Calificaciones"

    def __str__(self):
        return f"{self.component.order}. {self.component.prompt[:30]} -> {self.final_score} pts"
