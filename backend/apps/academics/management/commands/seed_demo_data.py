from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone
from datetime import date
from apps.authentication.models import User, UserRole
from apps.academics.models import Subject, ClassroomParallel, Student, StudentEnrollment
from apps.exams.models import Exam, ExamComponent, ComponentType


class Command(BaseCommand):
    help = "Puebla datos demo consistentes con 2 materias, aulas, estudiantes y exámenes completos con componentes."

    @transaction.atomic
    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Iniciando sembrado de datos demo para evaluaciones..."))

        # 1. Asegurar Docente Demo
        teacher, created = User.objects.get_or_create(
            email="profesor.demo@evaluacion.edu.bo",
            defaults={
                "first_name": "Profesor",
                "last_name": "Demo",
                "role": UserRole.TEACHER,
                "is_active": True,
            }
        )
        if created:
            teacher.set_password("ProfesorDemo2026!")
            teacher.save()
            self.stdout.write(self.style.SUCCESS(f"Docente creado: {teacher.email}"))
        else:
            self.stdout.write(f"Docente existente: {teacher.email}")

        # 2. Asegurar Estudiantes Demo
        students_data = [
            {
                "email": "estudiante.demo@evaluacion.edu.bo",
                "first_name": "Juan Carlos",
                "last_name": "Pérez Demo",
                "student_id_code": "EST-2026-001",
            },
            {
                "email": "maria.gomez@evaluacion.edu.bo",
                "first_name": "María",
                "last_name": "Gómez Quispe",
                "student_id_code": "EST-2026-002",
            },
        ]

        students_objs = []
        for sdata in students_data:
            s_user, u_created = User.objects.get_or_create(
                email=sdata["email"],
                defaults={
                    "first_name": sdata["first_name"],
                    "last_name": sdata["last_name"],
                    "role": UserRole.STUDENT,
                    "student_id_code": sdata["student_id_code"],
                    "is_active": True,
                }
            )
            if u_created:
                s_user.set_password("EstudianteDemo2026!")
                s_user.save()

            student, s_created = Student.objects.get_or_create(
                student_id_code=sdata["student_id_code"],
                defaults={
                    "user": s_user,
                    "full_name": f"{sdata['first_name']} {sdata['last_name']}",
                    "email": sdata["email"],
                }
            )
            if not student.user:
                student.user = s_user
                student.save()
            students_objs.append(student)
            self.stdout.write(f"Estudiante listo: {student.student_id_code} - {student.full_name}")

        # 3. Materia 1: Cálculo I (Aula A)
        sub1, _ = Subject.objects.get_or_create(
            code="MAT-101",
            defaults={
                "name": "Cálculo I",
                "description": "Cálculo diferencial e integral para ciencias e ingeniería.",
                "teacher": teacher,
            }
        )
        if sub1.teacher != teacher:
            sub1.teacher = teacher
            sub1.save()

        par1, _ = ClassroomParallel.objects.get_or_create(
            subject=sub1,
            group_code="A",
            period="1-2026",
        )

        # 4. Materia 2: Álgebra Lineal (Aula B)
        sub2, _ = Subject.objects.get_or_create(
            code="MAT-102",
            defaults={
                "name": "Álgebra Lineal",
                "description": "Espacios vectoriales, matrices, transformaciones lineales y determinantes.",
                "teacher": teacher,
            }
        )
        if sub2.teacher != teacher:
            sub2.teacher = teacher
            sub2.save()

        par2, _ = ClassroomParallel.objects.get_or_create(
            subject=sub2,
            group_code="B",
            period="1-2026",
        )

        # 5. Inscripciones de los estudiantes en ambas aulas
        for par in [par1, par2]:
            for st in students_objs:
                StudentEnrollment.objects.get_or_create(
                    student=st,
                    parallel=par,
                )

        # 6. Examen 1: Primer Examen Parcial (Cálculo I - Aula A)
        exam1, _ = Exam.objects.get_or_create(
            parallel=par1,
            title="Primer Examen Parcial",
            defaults={
                "description": "Evaluación de derivadas, continuidad y análisis de límites.",
                "application_date": date(2026, 3, 15),
                "total_score": 100.00,
                "has_qr_code": True,
            }
        )

        # Componentes para Examen 1
        ExamComponent.objects.update_or_create(
            exam=exam1,
            order=1,
            defaults={
                "type": ComponentType.OPEN,
                "prompt": "Calcule la derivada de f(x) = 3x^3 - 5x + 2 en el punto x = 2.",
                "max_score": 50.00,
                "options_or_rubric": {
                    "criterio": "Derivación analítica correcta f'(x)=9x^2-5 y evaluación f'(2)=31.",
                    "tolerancia": 0.05
                }
            }
        )
        ExamComponent.objects.update_or_create(
            exam=exam1,
            order=2,
            defaults={
                "type": ComponentType.MULTIPLE_CHOICE,
                "prompt": "Indique el valor del límite de f(x) = (x^2 - 1)/(x - 1) cuando x tiende a 1.",
                "max_score": 50.00,
                "options_or_rubric": {
                    "opciones": ["Existe y es 2", "Existe y es 0", "No existe"],
                    "correcta": "Existe y es 2"
                }
            }
        )
        self.stdout.write(self.style.SUCCESS(f"Examen 1 listo con {exam1.components.count()} componentes: {exam1.title}"))

        # 7. Examen 2: Examen Diagnóstico (Álgebra Lineal - Aula B)
        exam2, _ = Exam.objects.get_or_create(
            parallel=par2,
            title="Examen Diagnóstico de Álgebra Lineal",
            defaults={
                "description": "Evaluación de conceptos fundamentales sobre matrices y determinantes.",
                "application_date": date(2026, 3, 20),
                "total_score": 100.00,
                "has_qr_code": True,
            }
        )

        # Componentes para Examen 2
        ExamComponent.objects.update_or_create(
            exam=exam2,
            order=1,
            defaults={
                "type": ComponentType.OPEN,
                "prompt": "Dada la matriz A = [[2, 1], [1, 3]], calcule su determinante det(A) y su matriz inversa A^-1.",
                "max_score": 60.00,
                "options_or_rubric": {
                    "criterio": "Cálculo de determinante det(A)=5 y matriz inversa [[3/5, -1/5], [-1/5, 2/5]]."
                }
            }
        )
        ExamComponent.objects.update_or_create(
            exam=exam2,
            order=2,
            defaults={
                "type": ComponentType.TRUE_FALSE,
                "prompt": "¿El producto matricial de dos matrices cuadradas arbitrarias A y B siempre es conmutativo (A*B = B*A)?",
                "max_score": 40.00,
                "options_or_rubric": {
                    "correcta": "Falso",
                    "justificacion": "En general, el producto matricial no conmuta (AB != BA)."
                }
            }
        )
        self.stdout.write(self.style.SUCCESS(f"Examen 2 listo con {exam2.components.count()} componentes: {exam2.title}"))

        self.stdout.write(self.style.SUCCESS(
            "\n[OK] Datos demo creados exitosamente:\n"
            f"- Docente: {teacher.email}\n"
            f"- Materia 1: {sub1.name} (Aula {par1.group_code}) -> Examen: {exam1.title} (2 componentes)\n"
            f"- Materia 2: {sub2.name} (Aula {par2.group_code}) -> Examen: {exam2.title} (2 componentes)\n"
            f"- Estudiantes inscritos: {len(students_objs)}"
        ))
