from rest_framework import serializers
from apps.authentication.models import User, UserRole
from .models import Subject, ClassroomParallel, Student, StudentEnrollment

class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = [
            'id',
            'student_id_code',
            'full_name',
            'email',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']

class ClassroomParallelSerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    student_count = serializers.SerializerMethodField()

    class Meta:
        model = ClassroomParallel
        fields = [
            'id',
            'subject',
            'subject_name',
            'group_code',
            'period',
            'student_count',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']

    def get_student_count(self, obj):
        return obj.enrollments.count()

class SubjectSerializer(serializers.ModelSerializer):
    teacher = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role=UserRole.TEACHER),
        required=False
    )
    teacher_name = serializers.CharField(source='teacher.full_name', read_only=True)
    parallels = ClassroomParallelSerializer(many=True, read_only=True)

    class Meta:
        model = Subject
        fields = [
            'id',
            'code',
            'name',
            'description',
            'teacher',
            'teacher_name',
            'parallels',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']

class TeacherAdminSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, min_length=6)

    class Meta:
        model = User
        fields = [
            'id',
            'email',
            'first_name',
            'last_name',
            'full_name',
            'password',
            'is_active',
            'date_joined',
        ]
        read_only_fields = ['id', 'full_name', 'date_joined']

    def create(self, validated_data):
        password = validated_data.pop('password')
        validated_data['role'] = UserRole.TEACHER
        return User.objects.create_user(password=password, **validated_data)
