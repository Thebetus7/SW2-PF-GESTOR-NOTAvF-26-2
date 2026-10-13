from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ExamViewSet

app_name = 'exams'

router = DefaultRouter()
router.register(r'exams', ExamViewSet, basename='exams')

urlpatterns = [
    path('', include(router.urls)),
]
