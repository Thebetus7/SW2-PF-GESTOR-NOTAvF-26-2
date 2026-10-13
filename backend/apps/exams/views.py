from django.http import HttpResponse
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from apps.authentication.models import UserRole
from apps.academics.views import IsTeacherOrAdminRole
from .models import Exam, ExamComponent
from .serializers import ExamSerializer, ExamComponentSerializer
from .services.pdf_generator import ExamPDFGenerator

class ExamViewSet(viewsets.ModelViewSet):
    """
    CRUD para gestión y diseño modular de Exámenes.
    """
    serializer_class = ExamSerializer
    permission_classes = [IsTeacherOrAdminRole]

    def get_queryset(self):
        user = self.request.user
        parallel_id = self.request.query_params.get('parallel_id')
        qs = Exam.objects.all().select_related('parallel__subject').prefetch_related('components')

        if user.role == UserRole.TEACHER:
            qs = qs.filter(parallel__subject__teacher=user)

        if parallel_id:
            qs = qs.filter(parallel_id=parallel_id)

        return qs

    @action(detail=True, methods=['get'], url_path='summary')
    def summary(self, request, pk=None):
        exam = self.get_object()
        return Response({
            'id': str(exam.id),
            'title': exam.title,
            'parallel': str(exam.parallel),
            'total_score': float(exam.total_score),
            'components_count': exam.components.count(),
            'components_sum': float(exam.current_components_score_sum),
            'is_valid_sum': abs(exam.current_components_score_sum - exam.total_score) < 0.01,
        })

    @action(detail=True, methods=['get'], url_path='export-pdf')
    def export_pdf(self, request, pk=None):
        exam = self.get_object()
        mode = request.query_params.get('mode', 'with_qr')
        with_qr = (mode == 'with_qr')
        pdf_buffer = ExamPDFGenerator.generate(exam, with_qr=with_qr)

        filename = f"Examen_{exam.title.replace(' ', '_')}_{exam.parallel.group_code}.pdf"
        response = HttpResponse(pdf_buffer.read(), content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response
