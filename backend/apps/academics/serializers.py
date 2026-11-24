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

class StudentAdminSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, allow_blank=True, min_length=4)
    parallel_id = serializers.UUIDField(write_only=True, required=False, allow_null=True)
    parallel_name = serializers.SerializerMethodField(read_only=True)
    parallel_id_display = serializers.SerializerMethodField(read_only=True)
    courses = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Student
        fields = [
            'id',
            'student_id_code',
            'full_name',
            'email',
            'password',
            'parallel_id',
            'parallel_name',
            'parallel_id_display',
            'courses',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']

    def get_courses(self, obj):
        enrollments = obj.enrollments.select_related('parallel__subject').all()
        return [
            {
                'parallelId': str(enr.parallel.id),
                'subjectName': enr.parallel.subject.name,
                'subjectCode': enr.parallel.subject.code,
                'groupCode': enr.parallel.group_code,
                'period': enr.parallel.period,
                'enrolledAt': enr.enrolled_at.isoformat(),
            }
            for enr in enrollments
        ]

    def get_parallel_name(self, obj):
        latest_enr = obj.enrollments.select_related('parallel__subject').first()
        if latest_enr and latest_enr.parallel:
            return f"{latest_enr.parallel.subject.name} - Aula {latest_enr.parallel.group_code} ({latest_enr.parallel.period})"
        return 'Sin Aula Asignada'

    def get_parallel_id_display(self, obj):
        latest_enr = obj.enrollments.first()
        return str(latest_enr.parallel.id) if latest_enr else None

    def validate(self, attrs):
        full_name = attrs.get('full_name', '').strip()
        email = attrs.get('email', '').strip() if attrs.get('email') else ''
        student_id_code = attrs.get('student_id_code', '').strip() if attrs.get('student_id_code') else ''

        if not full_name:
            raise serializers.ValidationError({'full_name': 'El nombre del estudiante es obligatorio.'})

        if not student_id_code:
            if email and '@' in email:
                prefix = email.split('@')[0].upper().replace('.', '-')
                student_id_code = f"EST-{prefix}"
            else:
                import random
                student_id_code = f"EST-{random.randint(1000, 9999)}"
            orig = student_id_code
            counter = 1
            while Student.objects.filter(student_id_code=student_id_code).exists():
                student_id_code = f"{orig}-{counter}"
                counter += 1
            attrs['student_id_code'] = student_id_code

        if not email:
            safe_code = student_id_code.lower().replace(' ', '').replace('-', '.')
            email = f"{safe_code}@estudiante.edu.bo"
            attrs['email'] = email
        elif '@' not in email:
            email = f"{email.lower().strip()}@estudiante.edu.bo"
            attrs['email'] = email

        return attrs

    def create(self, validated_data):
        from django.db import transaction
        parallel_id = validated_data.pop('parallel_id', None)
        password = validated_data.pop('password', None) or '123456'
        email = validated_data.get('email')
        full_name = validated_data.get('full_name')
        student_id_code = validated_data.get('student_id_code')

        with transaction.atomic():
            names = full_name.split()
            first_name = names[0] if names else 'Estudiante'
            last_name = ' '.join(names[1:]) if len(names) > 1 else ''

            user = User.objects.filter(email=email).first()
            if not user:
                user = User.objects.filter(student_id_code=student_id_code).first()

            if user:
                user.set_password(password)
                user.first_name = first_name
                user.last_name = last_name
                user.role = UserRole.STUDENT
                user.student_id_code = student_id_code
                user.save()
            else:
                user = User.objects.create_user(
                    email=email,
                    password=password,
                    role=UserRole.STUDENT,
                    first_name=first_name,
                    last_name=last_name,
                    student_id_code=student_id_code,
                )

            student, _ = Student.objects.update_or_create(
                student_id_code=student_id_code,
                defaults={
                    'user': user,
                    'full_name': full_name,
                    'email': email,
                }
            )

            if parallel_id:
                parallel = ClassroomParallel.objects.filter(id=parallel_id).first()
                if parallel:
                    StudentEnrollment.objects.get_or_create(
                        student=student,
                        parallel=parallel,
                    )

            return student
