from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User, UserRole
from .serializers import (
    UserSerializer,
    CustomTokenObtainPairSerializer,
    StudentIdLoginSerializer,
)

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    permission_classes = [permissions.AllowAny]

class StudentIdLoginView(APIView):
    """
    Permite a los estudiantes autenticarse exclusivamente con su código / ID de estudiante.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = StudentIdLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        code = serializer.validated_data['student_id_code']

        user = User.objects.filter(student_id_code__iexact=code, role=UserRole.STUDENT).first()
        if not user:
            return Response(
                {'error': f'No se encontró ningún estudiante registrado con el ID "{code}".'},
                status=status.HTTP_404_NOT_FOUND
            )

        if not user.is_active:
            return Response(
                {'error': 'La cuenta del estudiante se encuentra inactiva.'},
                status=status.HTTP_403_FORBIDDEN
            )

        refresh = RefreshToken.for_user(user)
        refresh['role'] = user.role
        refresh['email'] = user.email
        refresh['name'] = user.full_name
        refresh['student_id_code'] = user.student_id_code

        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': {
                'id': str(user.id),
                'email': user.email,
                'name': user.full_name,
                'role': user.role,
                'studentIdCode': user.student_id_code,
            }
        }, status=status.HTTP_200_OK)

class DemoLoginView(APIView):
    """
    Endpoint 1-clic para inicializar y autenticar perfiles de prueba (Admin, Docente, Estudiante).
    """
    permission_classes = [permissions.AllowAny]

    DEMO_ACCOUNTS = {
        'admin': {
            'email': 'admin.demo@evaluacion.edu.bo',
            'first_name': 'Administrador',
            'last_name': 'Principal',
            'role': UserRole.ADMIN,
            'is_staff': True,
        },
        'teacher': {
            'email': 'profesor.demo@evaluacion.edu.bo',
            'first_name': 'Profesor',
            'last_name': 'Demo Evaluador',
            'role': UserRole.TEACHER,
            'is_staff': False,
        },
        'student': {
            'email': 'estudiante.demo@evaluacion.edu.bo',
            'first_name': 'Juan Carlos',
            'last_name': 'Pérez Demo',
            'role': UserRole.STUDENT,
            'student_id_code': 'EST-2026-001',
            'is_staff': False,
        }
    }

    def post(self, request):
        role_type = request.data.get('role', '').lower().strip()
        if role_type not in self.DEMO_ACCOUNTS:
            return Response(
                {'error': f'Rol demo inválido. Use "admin", "teacher" o "student".'},
                status=status.HTTP_400_BAD_REQUEST
            )

        account_info = self.DEMO_ACCOUNTS[role_type]
        user, created = User.objects.get_or_create(
            email=account_info['email'],
            defaults={
                'first_name': account_info['first_name'],
                'last_name': account_info['last_name'],
                'role': account_info['role'],
                'student_id_code': account_info.get('student_id_code'),
                'is_staff': account_info.get('is_staff', False),
            }
        )

        # Si el usuario ya existía pero con contraseña no seteada, asegurar password estándar
        if not user.has_usable_password():
            user.set_password('demo1234')
            user.save()

        refresh = RefreshToken.for_user(user)
        refresh['role'] = user.role
        refresh['email'] = user.email
        refresh['name'] = user.full_name
        if user.student_id_code:
            refresh['student_id_code'] = user.student_id_code

        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': {
                'id': str(user.id),
                'email': user.email,
                'name': user.full_name,
                'role': user.role,
                'studentIdCode': user.student_id_code,
            },
            'demoNotice': f'Sesión iniciada con éxito como {user.get_role_display()} Demo'
        }, status=status.HTTP_200_OK)

class UserProfileView(APIView):
    """
    Retorna la información del usuario autenticado actual.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)
