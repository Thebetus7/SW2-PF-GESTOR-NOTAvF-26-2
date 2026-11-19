"""
URL configuration for config project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse

def health_check(request):
    return JsonResponse({
        'status': 'healthy',
        'service': 'gestornotas-backend-api',
        'version': '1.0.0',
    })

def system_knowledge(request):
    try:
        from apps.academics.models import Subject, ClassroomParallel
        from apps.exams.models import Exam
        from apps.authentication.models import User, UserRole

        subjects = list(Subject.objects.values('code', 'name', 'description')[:10])
        parallels = []
        for p in ClassroomParallel.objects.select_related('subject')[:10]:
            parallels.append({
                'subject': p.subject.name,
                'group': p.group_code,
                'period': p.period,
            })
        exams = []
        for e in Exam.objects.select_related('parallel__subject')[:10]:
            exams.append({
                'title': e.title,
                'subject': e.parallel.subject.name if e.parallel else 'N/A',
                'total_score': float(e.total_score),
                'components_count': e.components.count(),
            })

        return JsonResponse({
            'status': 'success',
            'summary': {
                'total_subjects': Subject.objects.count(),
                'total_parallels': ClassroomParallel.objects.count(),
                'total_exams': Exam.objects.count(),
                'total_teachers': User.objects.filter(role=UserRole.TEACHER).count(),
                'total_students': User.objects.filter(role=UserRole.STUDENT).count(),
            },
            'subjects': subjects,
            'parallels': parallels,
            'exams': exams,
        })
    except Exception as ex:
        return JsonResponse({'status': 'fallback', 'error': str(ex)})

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/health/', health_check, name='health-check'),
    path('api/v1/system-knowledge/', system_knowledge, name='system-knowledge'),
    path('api/v1/auth/', include('apps.authentication.urls')),
    path('api/v1/academics/', include('apps.academics.urls')),
    path('api/v1/exams/', include('apps.exams.urls')),
    path('api/v1/evaluations/', include('apps.evaluations.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
