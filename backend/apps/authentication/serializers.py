from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User, UserRole

class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(read_only=True)

    class Meta:
        model = User
        fields = [
            'id',
            'email',
            'first_name',
            'last_name',
            'full_name',
            'role',
            'student_id_code',
            'date_joined',
        ]
        read_only_fields = ['id', 'date_joined']

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Añadir claims personalizados en el payload del JWT
        token['role'] = user.role
        token['email'] = user.email
        token['name'] = user.full_name
        if user.student_id_code:
            token['student_id_code'] = user.student_id_code
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = {
            'id': str(self.user.id),
            'email': self.user.email,
            'name': self.user.full_name,
            'role': self.user.role,
            'studentIdCode': self.user.student_id_code,
        }
        return data

class StudentIdLoginSerializer(serializers.Serializer):
    student_id_code = serializers.CharField(required=True, max_length=50)

    def validate_student_id_code(self, value):
        val = value.strip()
        if not val:
            raise serializers.ValidationError('El código de matrícula o ID no puede estar vacío.')
        return val
