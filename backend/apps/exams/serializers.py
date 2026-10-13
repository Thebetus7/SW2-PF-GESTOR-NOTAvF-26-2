from decimal import Decimal
from rest_framework import serializers
from django.db import transaction
from .models import Exam, ExamComponent, ComponentType

class ExamComponentSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExamComponent
        fields = [
            'id',
            'type',
            'prompt',
            'options_or_rubric',
            'max_score',
            'order',
        ]
        read_only_fields = ['id']

    def validate_max_score(self, value):
        if value <= Decimal('0'):
            raise serializers.ValidationError('El puntaje del componente debe ser mayor a 0.')
        return value

    def validate(self, attrs):
        comp_type = attrs.get('type')
        rubric = attrs.get('options_or_rubric', {})

        if comp_type == ComponentType.MULTIPLE_CHOICE:
            options = rubric.get('options', [])
            if not isinstance(options, list) or len(options) < 2:
                raise serializers.ValidationError({
                    'options_or_rubric': 'Las preguntas de opción múltiple requieren al menos 2 opciones en "options".'
                })
            if 'correct_answer' not in rubric:
                raise serializers.ValidationError({
                    'options_or_rubric': 'Debe especificar la clave "correct_answer" con la opción correcta.'
                })

        elif comp_type == ComponentType.TRUE_FALSE:
            if 'correct_answer' not in rubric:
                raise serializers.ValidationError({
                    'options_or_rubric': 'Debe especificar "correct_answer" como True/False o "V"/"F".'
                })

        return attrs

class ExamSerializer(serializers.ModelSerializer):
    components = ExamComponentSerializer(many=True, required=False)
    parallel_name = serializers.CharField(source='parallel.__str__', read_only=True)
    components_sum = serializers.DecimalField(
        source='current_components_score_sum',
        max_digits=5,
        decimal_places=2,
        read_only=True
    )

    class Meta:
        model = Exam
        fields = [
            'id',
            'parallel',
            'parallel_name',
            'title',
            'description',
            'application_date',
            'total_score',
            'has_qr_code',
            'components_sum',
            'components',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate(self, attrs):
        components_data = attrs.get('components')
        total_score = attrs.get('total_score')

        if components_data is not None and total_score is not None:
            comp_sum = sum(Decimal(str(c['max_score'])) for c in components_data)
            if abs(comp_sum - Decimal(str(total_score))) > Decimal('0.01'):
                raise serializers.ValidationError({
                    'total_score': f'La suma de puntajes de los componentes ({comp_sum}) no coincide con el total nominal ({total_score}).'
                })
        return attrs

    def create(self, validated_data):
        components_data = validated_data.pop('components', [])
        with transaction.atomic():
            exam = Exam.objects.create(**validated_data)
            for order_idx, comp_data in enumerate(components_data, start=1):
                comp_data.setdefault('order', order_idx)
                ExamComponent.objects.create(exam=exam, **comp_data)
        return exam

    def update(self, instance, validated_data):
        components_data = validated_data.pop('components', None)
        with transaction.atomic():
            for attr, val in validated_data.items():
                setattr(instance, attr, val)
            instance.save()

            if components_data is not None:
                instance.components.all().delete()
                for order_idx, comp_data in enumerate(components_data, start=1):
                    comp_data.setdefault('order', order_idx)
                    ExamComponent.objects.create(exam=instance, **comp_data)
        return instance
