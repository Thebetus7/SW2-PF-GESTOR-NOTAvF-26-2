import uuid
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager

class UserRole(models.TextChoices):
    ADMIN = 'ADMIN', 'Administrador'
    TEACHER = 'TEACHER', 'Docente'
    STUDENT = 'STUDENT', 'Estudiante'

class UserManager(BaseUserManager):
    def create_user(self, email, password=None, role=UserRole.TEACHER, **extra_fields):
        if not email:
            raise ValueError('El correo electrónico es obligatorio')
        email = self.normalize_email(email)
        user = self.model(email=email, role=role, **extra_fields)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('El superusuario debe tener is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('El superusuario debe tener is_superuser=True.')

        return self.create_user(email, password, role=UserRole.ADMIN, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True, max_length=255, verbose_name='Correo Electrónico')
    first_name = models.CharField(max_length=150, verbose_name='Nombres')
    last_name = models.CharField(max_length=150, verbose_name='Apellidos')
    role = models.CharField(
        max_length=20,
        choices=UserRole.choices,
        default=UserRole.TEACHER,
        verbose_name='Rol en el Sistema'
    )
    student_id_code = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        unique=True,
        verbose_name='ID / Matrícula de Estudiante'
    )
    is_active = models.BooleanField(default=True, verbose_name='Activo')
    is_staff = models.BooleanField(default=False, verbose_name='Acceso Administrativo')
    date_joined = models.DateTimeField(auto_now_add=True, verbose_name='Fecha de Registro')

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']

    class Meta:
        verbose_name = 'Usuario'
        verbose_name_plural = 'Usuarios'
        ordering = ['-date_joined']

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip()

    def __str__(self):
        return f"{self.full_name} ({self.role}) - {self.email}"
