from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    TeacherManagementViewSet,
    SubjectViewSet,
    ClassroomParallelViewSet,
    StudentManagementViewSet,
    StudentDetailView,
)

app_name = 'academics'

router = DefaultRouter()
router.register(r'teachers', TeacherManagementViewSet, basename='teachers')
router.register(r'subjects', SubjectViewSet, basename='subjects')
router.register(r'parallels', ClassroomParallelViewSet, basename='parallels')
router.register(r'students', StudentManagementViewSet, basename='students')

urlpatterns = [
    path('', include(router.urls)),
    path('students/<uuid:student_id>/', StudentDetailView.as_view(), name='student-detail'),
]
