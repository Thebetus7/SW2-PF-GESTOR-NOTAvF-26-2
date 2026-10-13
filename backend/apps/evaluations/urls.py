from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.evaluations.views import (
    EvaluationSubmitView,
    StudentEvaluationViewSet,
)

router = DefaultRouter()
router.register(r"", StudentEvaluationViewSet, basename="evaluations")

urlpatterns = [
    path("submit/", EvaluationSubmitView.as_view(), name="evaluation-submit"),
    path("", include(router.urls)),
]
