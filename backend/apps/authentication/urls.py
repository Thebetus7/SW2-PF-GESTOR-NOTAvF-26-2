from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    CustomTokenObtainPairView,
    StudentIdLoginView,
    DemoLoginView,
    UserProfileView,
)

app_name = 'authentication'

urlpatterns = [
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('login/student-id/', StudentIdLoginView.as_view(), name='student_id_login'),
    path('demo-login/', DemoLoginView.as_view(), name='demo_login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('me/', UserProfileView.as_view(), name='user_profile'),
]
