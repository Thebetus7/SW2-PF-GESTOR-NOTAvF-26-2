from rest_framework import serializers
from apps.evaluations.models import (
    StudentEvaluation,
    EvaluationPage,
    GradeDetail,
    EvaluationStatus,
)
from apps.exams.models import ExamComponent

class EvaluationPageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = EvaluationPage
        fields = [
            "id",
            "page_number",
            "image",
            "image_url",
            "qr_data",
            "ocr_raw_text",
            "created_at",
        ]

    def get_image_url(self, obj):
        request = self.context.get("request")
        if obj.image and hasattr(obj.image, "url"):
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None

class GradeDetailSerializer(serializers.ModelSerializer):
    component_prompt = serializers.CharField(source="component.prompt", read_only=True)
    component_type = serializers.CharField(source="component.type", read_only=True)
    max_score = serializers.DecimalField(source="component.max_score", max_digits=5, decimal_places=2, read_only=True)
    order = serializers.IntegerField(source="component.order", read_only=True)

    class Meta:
        model = GradeDetail
        fields = [
            "id",
            "component",
            "order",
            "component_prompt",
            "component_type",
            "max_score",
            "ai_score",
            "final_score",
            "transcribed_answer",
            "ai_feedback",
            "is_overridden",
            "teacher_comment",
        ]
        read_only_fields = ["id", "component", "ai_score", "ai_feedback", "transcribed_answer"]

class GradeOverrideSerializer(serializers.Serializer):
    final_score = serializers.DecimalField(max_digits=5, decimal_places=2)
    teacher_comment = serializers.CharField(required=True, allow_blank=False)

    def validate_teacher_comment(self, value):
        if not value or len(value.strip()) < 5:
            raise serializers.ValidationError("Debe ingresar una observación justificada de al menos 5 caracteres.")
        return value.strip()

class StudentEvaluationListSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    student_identifier = serializers.SerializerMethodField()
    pages_count = serializers.IntegerField(source="pages.count", read_only=True)

    class Meta:
        model = StudentEvaluation
        fields = [
            "id",
            "exam",
            "parallel",
            "student",
            "student_name",
            "student_identifier",
            "status",
            "ai_total_score",
            "final_score",
            "is_score_overridden",
            "teacher_notes",
            "is_published",
            "published_at",
            "pages_count",
            "created_at",
            "updated_at",
        ]

    def get_student_name(self, obj):
        if obj.student:
            return obj.student.full_name
        return obj.raw_student_name or "Sin identificar"

    def get_student_identifier(self, obj):
        if obj.student:
            return obj.student.student_id_code
        return obj.raw_student_identifier or "N/A"

class StudentEvaluationDetailSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    student_identifier = serializers.SerializerMethodField()
    pages = EvaluationPageSerializer(many=True, read_only=True)
    grades = GradeDetailSerializer(many=True, read_only=True)

    class Meta:
        model = StudentEvaluation
        fields = [
            "id",
            "exam",
            "parallel",
            "student",
            "student_name",
            "student_identifier",
            "status",
            "ai_total_score",
            "final_score",
            "is_score_overridden",
            "teacher_notes",
            "is_published",
            "published_at",
            "pages",
            "grades",
            "created_at",
            "updated_at",
        ]

    def get_student_name(self, obj):
        if obj.student:
            return obj.student.full_name
        return obj.raw_student_name or "Sin identificar"

    def get_student_identifier(self, obj):
        if obj.student:
            return obj.student.student_id_code
        return obj.raw_student_identifier or "N/A"
