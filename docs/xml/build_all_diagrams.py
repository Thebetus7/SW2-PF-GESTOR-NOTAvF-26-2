# -*- coding: utf-8 -*-
"""
Script que genera todos los archivos XML de Enterprise Architect para el proyecto Gestor de Notas.
Sprint 1, Sprint 2, Sprint 3, Diagramas de Clases y Proyecto Completo.
"""

import os
from generate_all import generate_sequence_diagram, generate_class_diagram

BASE_DIR = r"c:\EDBERTO\ULTIMO\SW2\SW2-PF-GESTOR-NOTAvF-26-2\docs\xml"
AUTHOR = "Ybanera Herrera Edberto"

# ==============================================================================
# SPRINT 1
# ==============================================================================

# HU-01: Administracion de docentes y padron estudiantil
lifelines_hu01 = [
    ("EA_LL_ADM_1", "admin : Administrador", "Actor", 60, 160),
    ("EA_LL_ADM_2", ":WebAdminUI", "Boundary", 220, 330),
    ("EA_LL_ADM_3", ":ApiClient", "Boundary", 390, 490),
    ("EA_LL_ADM_4", ":TeacherManagementViewSet", "Control", 550, 710),
    ("EA_LL_ADM_5", ":ClassroomParallelViewSet", "Control", 770, 930),
    ("EA_LL_ADM_6", ":ExcelStudentImporter", "Control", 990, 1140),
    ("EA_LL_ADM_7", ":PostgreSQL", "Entity", 1200, 1310),
]

messages_hu01 = [
    ("MSG_01_01", "1. ingresarGestionDocentes()", "EA_LL_ADM_1", "EA_LL_ADM_2", 1),
    ("MSG_01_02", "2. GET /api/v1/academics/teachers/", "EA_LL_ADM_2", "EA_LL_ADM_3", 2),
    ("MSG_01_03", "3. list()", "EA_LL_ADM_3", "EA_LL_ADM_4", 3),
    ("MSG_01_04", "4. SELECT * FROM User WHERE role='TEACHER'", "EA_LL_ADM_4", "EA_LL_ADM_7", 4),
    ("MSG_01_05", "5. 200 OK (lista docentes)", "EA_LL_ADM_7", "EA_LL_ADM_2", 5),
    ("MSG_01_06", "6. ingresarDatosDocente(email, nombres, apellidos, pass)", "EA_LL_ADM_1", "EA_LL_ADM_2", 6),
    ("MSG_01_07", "7. POST /api/v1/academics/teachers/ (payload)", "EA_LL_ADM_2", "EA_LL_ADM_3", 7),
    ("MSG_01_08", "8. create(validated_data)", "EA_LL_ADM_3", "EA_LL_ADM_4", 8),
    ("MSG_01_09", "9. create_user(role='TEACHER')", "EA_LL_ADM_4", "EA_LL_ADM_7", 9),
    ("MSG_01_10", "10. 201 Created (Docente guardado)", "EA_LL_ADM_7", "EA_LL_ADM_4", 10),
    ("MSG_01_11", "11. notificarRegistroExitoso()", "EA_LL_ADM_4", "EA_LL_ADM_2", 11),
    ("MSG_01_12", "12. seleccionarParaleloYSubirExcel(paraleloId, padron.xlsx)", "EA_LL_ADM_1", "EA_LL_ADM_2", 12),
    ("MSG_01_13", "13. POST /api/v1/academics/parallels/{id}/import-students/ (multipart)", "EA_LL_ADM_2", "EA_LL_ADM_3", 13),
    ("MSG_01_14", "14. import_students(file_obj, pk)", "EA_LL_ADM_3", "EA_LL_ADM_5", 14),
    ("MSG_01_15", "15. import_from_file(file, parallel)", "EA_LL_ADM_5", "EA_LL_ADM_6", 15),
    ("MSG_01_16", "16. validarEstructuraColumnas(MATRICULA, NOMBRE)", "EA_LL_ADM_6", "EA_LL_ADM_6", 16),
    ("MSG_01_17", "17. procesarFilasYCrearEstudiantes(student_id_code, full_name)", "EA_LL_ADM_6", "EA_LL_ADM_7", 17),
    ("MSG_01_18", "18. crearStudentEnrollment(student, parallel)", "EA_LL_ADM_6", "EA_LL_ADM_7", 18),
    ("MSG_01_19", "19. commit atomic transaction", "EA_LL_ADM_7", "EA_LL_ADM_6", 19),
    ("MSG_01_20", "20. { success: true, count: N, errors: [] }", "EA_LL_ADM_6", "EA_LL_ADM_5", 20),
    ("MSG_01_21", "21. 200 OK (Reporte de importación)", "EA_LL_ADM_5", "EA_LL_ADM_2", 21),
    ("MSG_01_22", "22. mostrarResumenImportacion(totalImportados)", "EA_LL_ADM_2", "EA_LL_ADM_1", 22),
]

# HU-02: Gestion de materias, paralelos y ficha estudiantil
lifelines_hu02 = [
    ("EA_LL_DOC_1", "docente : Docente", "Actor", 60, 160),
    ("EA_LL_DOC_2", ":WebTeacherUI", "Boundary", 220, 330),
    ("EA_LL_DOC_3", ":SubjectViewSet", "Control", 390, 510),
    ("EA_LL_DOC_4", ":ClassroomParallelViewSet", "Control", 570, 720),
    ("EA_LL_DOC_5", ":StudentDetailView", "Control", 780, 920),
    ("EA_LL_DOC_6", ":PostgreSQL", "Entity", 980, 1090),
]

messages_hu02 = [
    ("MSG_02_01", "1. ingresarGestionCursos()", "EA_LL_DOC_1", "EA_LL_DOC_2", 1),
    ("MSG_02_02", "2. GET /api/v1/academics/subjects/", "EA_LL_DOC_2", "EA_LL_DOC_3", 2),
    ("MSG_02_03", "3. filter(teacher=request.user)", "EA_LL_DOC_3", "EA_LL_DOC_6", 3),
    ("MSG_02_04", "4. 200 OK (Materias asignadas)", "EA_LL_DOC_6", "EA_LL_DOC_2", 4),
    ("MSG_02_05", "5. crearMateria(codigo, nombre, descripcion)", "EA_LL_DOC_1", "EA_LL_DOC_2", 5),
    ("MSG_02_06", "6. POST /api/v1/academics/subjects/", "EA_LL_DOC_2", "EA_LL_DOC_3", 6),
    ("MSG_02_07", "7. save(teacher=request.user)", "EA_LL_DOC_3", "EA_LL_DOC_6", 7),
    ("MSG_02_08", "8. 201 Created", "EA_LL_DOC_6", "EA_LL_DOC_2", 8),
    ("MSG_02_09", "9. crearParalelo(subject_id, aula='Aula A', periodo='1-2026')", "EA_LL_DOC_1", "EA_LL_DOC_2", 9),
    ("MSG_02_10", "10. POST /api/v1/academics/parallels/", "EA_LL_DOC_2", "EA_LL_DOC_4", 10),
    ("MSG_02_11", "11. validarUnicidadYGuardar()", "EA_LL_DOC_4", "EA_LL_DOC_6", 11),
    ("MSG_02_12", "12. 201 Created (Paralelo creado)", "EA_LL_DOC_6", "EA_LL_DOC_2", 12),
    ("MSG_02_13", "13. seleccionarEstudianteDeParalelo(student_id)", "EA_LL_DOC_1", "EA_LL_DOC_2", 13),
    ("MSG_02_14", "14. GET /api/v1/academics/students/{student_id}/", "EA_LL_DOC_2", "EA_LL_DOC_5", 14),
    ("MSG_02_15", "15. verificarPermisoDocente(paralelosDocente)", "EA_LL_DOC_5", "EA_LL_DOC_5", 15),
    ("MSG_02_16", "16. consultarMatriculaHistorialYPromedio()", "EA_LL_DOC_5", "EA_LL_DOC_6", 16),
    ("MSG_02_17", "17. 200 OK (Ficha académica)", "EA_LL_DOC_6", "EA_LL_DOC_5", 17),
    ("MSG_02_18", "18. renderizarFicha(matricula, nombre, examenes, notas, promedio)", "EA_LL_DOC_5", "EA_LL_DOC_2", 18),
    ("MSG_02_19", "19. visualizaFichaEstudiante()", "EA_LL_DOC_2", "EA_LL_DOC_1", 19),
]

classes_sp1 = [
    {
        "id": "EA_CLS_USER",
        "name": "User",
        "attributes": [
            ("id", "UUID", "private"),
            ("email", "String", "public"),
            ("first_name", "String", "public"),
            ("last_name", "String", "public"),
            ("role", "UserRole", "public"),
            ("student_id_code", "String", "public"),
            ("is_active", "Boolean", "public"),
            ("is_staff", "Boolean", "public"),
            ("date_joined", "DateTime", "public"),
        ],
        "operations": [
            ("create_user(email, password, role)", "User", "public"),
            ("create_superuser(email, password)", "User", "public"),
            ("full_name()", "String", "public"),
        ],
        "geometry": (50, 50, 280, 260),
    },
    {
        "id": "EA_CLS_USER_ROLE",
        "name": "UserRole",
        "stereotype": "enumeration",
        "attributes": [
            ("ADMIN", "String", "public"),
            ("TEACHER", "String", "public"),
            ("STUDENT", "String", "public"),
        ],
        "operations": [],
        "geometry": (50, 310, 220, 420),
    },
    {
        "id": "EA_CLS_SUBJECT",
        "name": "Subject",
        "attributes": [
            ("id", "UUID", "private"),
            ("code", "String", "public"),
            ("name", "String", "public"),
            ("description", "String", "public"),
            ("created_at", "DateTime", "public"),
            ("updated_at", "DateTime", "public"),
        ],
        "operations": [],
        "geometry": (360, 50, 580, 220),
    },
    {
        "id": "EA_CLS_PARALLEL",
        "name": "ClassroomParallel",
        "attributes": [
            ("id", "UUID", "private"),
            ("group_code", "String", "public"),
            ("period", "String", "public"),
            ("created_at", "DateTime", "public"),
        ],
        "operations": [],
        "geometry": (660, 50, 880, 210),
    },
    {
        "id": "EA_CLS_STUDENT",
        "name": "Student",
        "attributes": [
            ("id", "UUID", "private"),
            ("student_id_code", "String", "public"),
            ("full_name", "String", "public"),
            ("email", "String", "public"),
            ("created_at", "DateTime", "public"),
        ],
        "operations": [],
        "geometry": (360, 280, 580, 420),
    },
    {
        "id": "EA_CLS_ENROLLMENT",
        "name": "StudentEnrollment",
        "attributes": [
            ("id", "UUID", "private"),
            ("enrolled_at", "DateTime", "public"),
        ],
        "operations": [],
        "geometry": (660, 280, 880, 390),
    },
    {
        "id": "EA_CLS_TEACHER_VS",
        "name": "TeacherManagementViewSet",
        "attributes": [
            ("serializer_class", "Serializer", "private"),
            ("permission_classes", "List", "private"),
        ],
        "operations": [
            ("get_queryset()", "QuerySet", "public"),
            ("create(request)", "Response", "public"),
            ("list(request)", "Response", "public"),
        ],
        "geometry": (50, 470, 290, 610),
    },
    {
        "id": "EA_CLS_SUBJECT_VS",
        "name": "SubjectViewSet",
        "attributes": [
            ("serializer_class", "Serializer", "private"),
        ],
        "operations": [
            ("get_queryset()", "QuerySet", "public"),
            ("perform_create(serializer)", "void", "public"),
        ],
        "geometry": (360, 470, 580, 600),
    },
    {
        "id": "EA_CLS_PARALLEL_VS",
        "name": "ClassroomParallelViewSet",
        "attributes": [
            ("serializer_class", "Serializer", "private"),
        ],
        "operations": [
            ("get_queryset()", "QuerySet", "public"),
            ("import_students(request, pk)", "Response", "public"),
        ],
        "geometry": (660, 470, 890, 610),
    },
    {
        "id": "EA_CLS_STUDENT_DV",
        "name": "StudentDetailView",
        "attributes": [
            ("permission_classes", "List", "private"),
        ],
        "operations": [
            ("get(request, student_id)", "Response", "public"),
        ],
        "geometry": (950, 280, 1180, 390),
    },
    {
        "id": "EA_CLS_EXCEL_IMP",
        "name": "ExcelStudentImporter",
        "attributes": [],
        "operations": [
            ("import_from_file(file, parallel)", "Dict", "public"),
            ("validate_headers(sheet)", "Boolean", "private"),
        ],
        "geometry": (950, 470, 1200, 590),
    },
]

assoc_sp1 = [
    {
        "id": "EA_ASC_USR_SUB",
        "source_id": "EA_CLS_USER",
        "target_id": "EA_CLS_SUBJECT",
        "source_name": "teacher",
        "target_name": "subjects",
        "source_multiplicity": "1",
        "target_multiplicity": "0..*",
        "name": "Asignado",
    },
    {
        "id": "EA_ASC_SUB_PAR",
        "source_id": "EA_CLS_SUBJECT",
        "target_id": "EA_CLS_PARALLEL",
        "source_name": "subject",
        "target_name": "parallels",
        "source_multiplicity": "1",
        "target_multiplicity": "1..*",
        "name": "Contiene",
    },
    {
        "id": "EA_ASC_PAR_ENR",
        "source_id": "EA_CLS_PARALLEL",
        "target_id": "EA_CLS_ENROLLMENT",
        "source_name": "parallel",
        "target_name": "enrollments",
        "source_multiplicity": "1",
        "target_multiplicity": "0..*",
        "name": "Registra",
    },
    {
        "id": "EA_ASC_STU_ENR",
        "source_id": "EA_CLS_STUDENT",
        "target_id": "EA_CLS_ENROLLMENT",
        "source_name": "student",
        "target_name": "enrollments",
        "source_multiplicity": "1",
        "target_multiplicity": "0..*",
        "name": "Participa",
    },
    {
        "id": "EA_ASC_USR_STU",
        "source_id": "EA_CLS_USER",
        "target_id": "EA_CLS_STUDENT",
        "source_name": "user",
        "target_name": "student_profile",
        "source_multiplicity": "0..1",
        "target_multiplicity": "0..1",
        "name": "Perfil",
    },
]

# ==============================================================================
# SPRINT 2
# ==============================================================================

# HU-03: Diseno modular de examenes
lifelines_hu03 = [
    ("EA_LL_EX_1", "docente : Docente", "Actor", 60, 160),
    ("EA_LL_EX_2", ":WebExamBuilderUI", "Boundary", 220, 340),
    ("EA_LL_EX_3", ":ScoreValidatorEngine", "Control", 400, 540),
    ("EA_LL_EX_4", ":ExamViewSet", "Control", 600, 720),
    ("EA_LL_EX_5", ":ExamPDFGenerator", "Control", 780, 930),
    ("EA_LL_EX_6", ":PostgreSQL", "Entity", 990, 1090),
]

messages_hu03 = [
    ("MSG_03_01", "1. iniciarConstructorExamen(materia, paralelo, total=100)", "EA_LL_EX_1", "EA_LL_EX_2", 1),
    ("MSG_03_02", "2. agregarPreguntaAbierta(prompt, contexto, tolerancia, max=40)", "EA_LL_EX_1", "EA_LL_EX_2", 2),
    ("MSG_03_03", "3. agregarOpcionMultiple(prompt, opciones[A,B,C,D], clave, max=30)", "EA_LL_EX_1", "EA_LL_EX_2", 3),
    ("MSG_03_04", "4. agregarVerdaderoFalso(prompt, valor=V, max=30)", "EA_LL_EX_1", "EA_LL_EX_2", 4),
    ("MSG_03_05", "5. validarSumatoriaPuntajes()", "EA_LL_EX_2", "EA_LL_EX_3", 5),
    ("MSG_03_06", "6. sumatoriaValida(40 + 30 + 30 == 100)", "EA_LL_EX_3", "EA_LL_EX_2", 6),
    ("MSG_03_07", "7. clicGuardarExamen()", "EA_LL_EX_1", "EA_LL_EX_2", 7),
    ("MSG_03_08", "8. POST /api/v1/exams/ (payload examen y componentes)", "EA_LL_EX_2", "EA_LL_EX_4", 8),
    ("MSG_03_09", "9. atomic_create(Exam, ExamComponents)", "EA_LL_EX_4", "EA_LL_EX_6", 9),
    ("MSG_03_10", "10. 201 Created (Examen guardado en DB)", "EA_LL_EX_6", "EA_LL_EX_4", 10),
    ("MSG_03_11", "11. notificarExamenGuardado()", "EA_LL_EX_4", "EA_LL_EX_2", 11),
    ("MSG_03_12", "12. solicitarExportacionPDF(modo='with_qr')", "EA_LL_EX_1", "EA_LL_EX_2", 12),
    ("MSG_03_13", "13. GET /api/v1/exams/{id}/export-pdf/?mode=with_qr", "EA_LL_EX_2", "EA_LL_EX_4", 13),
    ("MSG_03_14", "14. generate(exam, with_qr=True)", "EA_LL_EX_4", "EA_LL_EX_5", 14),
    ("MSG_03_15", "15. dibujarEncabezadoConQRDeFormato()", "EA_LL_EX_5", "EA_LL_EX_5", 15),
    ("MSG_03_16", "16. renderizarEspaciosManuscritosYLineas()", "EA_LL_EX_5", "EA_LL_EX_5", 16),
    ("MSG_03_17", "17. 200 OK (application/pdf stream)", "EA_LL_EX_5", "EA_LL_EX_4", 17),
    ("MSG_03_18", "18. descargarDocumentoImprimible(Examen_Mat_AulaA.pdf)", "EA_LL_EX_4", "EA_LL_EX_2", 18),
]

# HU-04: Escaneo movil multipagina
lifelines_hu04 = [
    ("EA_LL_MOB_1", "docente : Docente", "Actor", 60, 160),
    ("EA_LL_MOB_2", ":CameraScannerView", "Boundary", 220, 350),
    ("EA_LL_MOB_3", ":ScannerController", "Control", 410, 550),
    ("EA_LL_MOB_4", ":MobileApiClient", "Boundary", 610, 730),
    ("EA_LL_MOB_5", ":EvaluationSubmitView", "Control", 790, 930),
    ("EA_LL_MOB_6", ":MediaStorage", "Entity", 990, 1090),
    ("EA_LL_MOB_7", ":PostgreSQL", "Entity", 1150, 1250),
]

messages_hu04 = [
    ("MSG_04_01", "1. seleccionarMateriaParaleloYExamen()", "EA_LL_MOB_1", "EA_LL_MOB_2", 1),
    ("MSG_04_02", "2. iniciarModoEscaneo(conQR o sinQR)", "EA_LL_MOB_1", "EA_LL_MOB_2", 2),
    ("MSG_04_03", "3. [Modo QR] Detección automática y captura de hoja 1 JPG", "EA_LL_MOB_2", "EA_LL_MOB_3", 3),
    ("MSG_04_04", "4. [Modo sin QR] Encuadre asistido y disparo manual hoja 1 JPG", "EA_LL_MOB_2", "EA_LL_MOB_3", 4),
    ("MSG_04_05", "5. almacenarTemporalJPG(pagina_1.jpg)", "EA_LL_MOB_3", "EA_LL_MOB_3", 5),
    ("MSG_04_06", "6. capturarPaginaSiguiente(pagina_2.jpg)", "EA_LL_MOB_1", "EA_LL_MOB_2", 6),
    ("MSG_04_07", "7. agruparPaginasEnEntrega([p1, p2])", "EA_LL_MOB_2", "EA_LL_MOB_3", 7),
    ("MSG_04_08", "8. renderizarMiniaturasDeRevision()", "EA_LL_MOB_3", "EA_LL_MOB_2", 8),
    ("MSG_04_09", "9. confirmarEnvioPaqueteEntrega()", "EA_LL_MOB_1", "EA_LL_MOB_2", 9),
    ("MSG_04_10", "10. POST /api/v1/evaluations/submit/ (multipart exam_id, pages)", "EA_LL_MOB_2", "EA_LL_MOB_4", 10),
    ("MSG_04_11", "11. submit_multipart(request)", "EA_LL_MOB_4", "EA_LL_MOB_5", 11),
    ("MSG_04_12", "12. guardarArchivosJPGEnVolumen(/media/evaluations/)", "EA_LL_MOB_5", "EA_LL_MOB_6", 12),
    ("MSG_04_13", "13. create(StudentEvaluation, EvaluationPage 1..N, status=BORRADOR)", "EA_LL_MOB_5", "EA_LL_MOB_7", 13),
    ("MSG_04_14", "14. encolarPipelineDeInferenciaIA()", "EA_LL_MOB_5", "EA_LL_MOB_5", 14),
    ("MSG_04_15", "15. 201 Created (Entrega recibida exitosamente)", "EA_LL_MOB_5", "EA_LL_MOB_4", 15),
    ("MSG_04_16", "16. notificarSubidaExitosa()", "EA_LL_MOB_4", "EA_LL_MOB_2", 16),
    ("MSG_04_17", "17. limpiarBufferYPrepararSiguienteAlumno()", "EA_LL_MOB_2", "EA_LL_MOB_3", 17),
    ("MSG_04_18", "18. cámara lista para siguiente estudiante", "EA_LL_MOB_3", "EA_LL_MOB_1", 18),
]

classes_sp2 = [
    {
        "id": "EA_CLS_EXAM",
        "name": "Exam",
        "attributes": [
            ("id", "UUID", "private"),
            ("title", "String", "public"),
            ("description", "String", "public"),
            ("application_date", "Date", "public"),
            ("total_score", "Decimal", "public"),
            ("has_qr_code", "Boolean", "public"),
            ("created_at", "DateTime", "public"),
            ("updated_at", "DateTime", "public"),
        ],
        "operations": [
            ("current_components_score_sum()", "Decimal", "public"),
        ],
        "geometry": (50, 50, 290, 250),
    },
    {
        "id": "EA_CLS_EXAM_COMP",
        "name": "ExamComponent",
        "attributes": [
            ("id", "UUID", "private"),
            ("type", "ComponentType", "public"),
            ("prompt", "String", "public"),
            ("options_or_rubric", "JSON", "public"),
            ("max_score", "Decimal", "public"),
            ("order", "Integer", "public"),
        ],
        "operations": [],
        "geometry": (370, 50, 610, 240),
    },
    {
        "id": "EA_CLS_COMP_TYPE",
        "name": "ComponentType",
        "stereotype": "enumeration",
        "attributes": [
            ("OPEN", "String", "public"),
            ("MULTIPLE_CHOICE", "String", "public"),
            ("TRUE_FALSE", "String", "public"),
        ],
        "operations": [],
        "geometry": (690, 50, 870, 180),
    },
    {
        "id": "EA_CLS_EXAM_VS",
        "name": "ExamViewSet",
        "attributes": [
            ("serializer_class", "Serializer", "private"),
            ("permission_classes", "List", "private"),
        ],
        "operations": [
            ("get_queryset()", "QuerySet", "public"),
            ("summary(request, pk)", "Response", "public"),
            ("export_pdf(request, pk)", "HttpResponse", "public"),
        ],
        "geometry": (50, 310, 280, 460),
    },
    {
        "id": "EA_CLS_PDF_GEN",
        "name": "ExamPDFGenerator",
        "attributes": [],
        "operations": [
            ("generate(exam, with_qr)", "BytesIO", "public"),
            ("draw_header(canvas, exam)", "void", "private"),
            ("draw_qr(canvas, qr_data)", "void", "private"),
            ("draw_components(canvas, exam)", "void", "private"),
        ],
        "geometry": (370, 310, 610, 450),
    },
    {
        "id": "EA_CLS_CAM_VIEW",
        "name": "CameraScannerView",
        "stereotype": "boundary",
        "attributes": [
            ("examId", "String", "public"),
            ("parallelId", "String", "public"),
            ("isQrMode", "Boolean", "public"),
        ],
        "operations": [
            ("initState()", "void", "public"),
            ("build(context)", "Widget", "public"),
            ("onQRDetected(code)", "void", "private"),
            ("onManualCapture()", "void", "private"),
        ],
        "geometry": (690, 240, 920, 410),
    },
    {
        "id": "EA_CLS_SCAN_CTRL",
        "name": "ScannerController",
        "attributes": [
            ("capturedPages", "List<File>", "public"),
            ("isProcessing", "Boolean", "public"),
        ],
        "operations": [
            ("addPage(file)", "void", "public"),
            ("removePage(index)", "void", "public"),
            ("submitEvaluation()", "Future<Boolean>", "public"),
            ("clearBuffer()", "void", "public"),
        ],
        "geometry": (690, 460, 920, 610),
    },
    {
        "id": "EA_CLS_MOB_API",
        "name": "MobileApiClient",
        "attributes": [
            ("dio", "Dio", "private"),
            ("baseUrl", "String", "private"),
        ],
        "operations": [
            ("login(email, pass)", "Future<Token>", "public"),
            ("submitEvaluation(examId, pages)", "Future<Response>", "public"),
        ],
        "geometry": (370, 500, 610, 630),
    },
    {
        "id": "EA_CLS_EVAL_SUBMIT_V",
        "name": "EvaluationSubmitView",
        "attributes": [
            ("permission_classes", "List", "private"),
            ("parser_classes", "List", "private"),
        ],
        "operations": [
            ("post(request)", "Response", "public"),
        ],
        "geometry": (50, 510, 280, 630),
    },
]

assoc_sp2 = [
    {
        "id": "EA_ASC_EXM_CMP",
        "source_id": "EA_CLS_EXAM",
        "target_id": "EA_CLS_EXAM_COMP",
        "source_name": "exam",
        "target_name": "components",
        "source_multiplicity": "1",
        "target_multiplicity": "1..*",
        "name": "CompuestoPor",
    },
    {
        "id": "EA_ASC_EXM_PDF",
        "source_id": "EA_CLS_EXAM_VS",
        "target_id": "EA_CLS_PDF_GEN",
        "source_name": "",
        "target_name": "",
        "source_multiplicity": "",
        "target_multiplicity": "",
        "name": "Utiliza",
    },
    {
        "id": "EA_ASC_CAM_CTRL",
        "source_id": "EA_CLS_CAM_VIEW",
        "target_id": "EA_CLS_SCAN_CTRL",
        "source_name": "",
        "target_name": "",
        "source_multiplicity": "",
        "target_multiplicity": "",
        "name": "Coordina",
    },
    {
        "id": "EA_ASC_CTRL_API",
        "source_id": "EA_CLS_SCAN_CTRL",
        "target_id": "EA_CLS_MOB_API",
        "source_name": "",
        "target_name": "",
        "source_multiplicity": "",
        "target_multiplicity": "",
        "name": "Consume",
    },
    {
        "id": "EA_ASC_API_SUBMIT",
        "source_id": "EA_CLS_MOB_API",
        "target_id": "EA_CLS_EVAL_SUBMIT_V",
        "source_name": "",
        "target_name": "",
        "source_multiplicity": "",
        "target_multiplicity": "",
        "name": "HTTP_POST",
    },
]

# ==============================================================================
# SPRINT 3
# ==============================================================================

# HU-05: Calificacion, revision y auditoria
lifelines_hu05 = [
    ("EA_LL_AI_1", "docente : Docente", "Actor", 60, 160),
    ("EA_LL_AI_2", ":WebGradeReviewUI", "Boundary", 220, 350),
    ("EA_LL_AI_3", ":StudentEvaluationViewSet", "Control", 410, 570),
    ("EA_LL_AI_4", ":EvaluationPipeline", "Control", 630, 760),
    ("EA_LL_AI_5", ":PromptBuilder", "Control", 820, 930),
    ("EA_LL_AI_6", ":GeminiResilientClient", "Control", 990, 1130),
    ("EA_LL_AI_7", ":GoogleGeminiAPI", "Boundary", 1190, 1310),
    ("EA_LL_AI_8", ":PostgreSQL", "Entity", 1370, 1470),
]

messages_hu05 = [
    ("MSG_05_01", "1. process_evaluation(evaluation)", "EA_LL_AI_3", "EA_LL_AI_4", 1),
    ("MSG_05_02", "2. transcribirEncabezadoYAsociarEstudiante()", "EA_LL_AI_4", "EA_LL_AI_8", 2),
    ("MSG_05_03", "3. build_multimodal_prompt(component, jpg_page)", "EA_LL_AI_4", "EA_LL_AI_5", 3),
    ("MSG_05_04", "4. generate_content(prompt, image_bytes)", "EA_LL_AI_5", "EA_LL_AI_6", 4),
    ("MSG_05_05", "5. POST /v1beta/models/gemini-2.5-flash:generateContent", "EA_LL_AI_6", "EA_LL_AI_7", 5),
    ("MSG_05_06", "6. [Alt Error 429/Timeout] Cascade Fallback -> gemini-2.5-pro", "EA_LL_AI_6", "EA_LL_AI_7", 6),
    ("MSG_05_07", "7. [Alt Ilegible / Fallo persistente] Status = REVISION_DOCENTE", "EA_LL_AI_6", "EA_LL_AI_4", 7),
    ("MSG_05_08", "8. 200 OK JSON (puntuacion, transcripcion, feedback)", "EA_LL_AI_7", "EA_LL_AI_6", 8),
    ("MSG_05_09", "9. sanitizarYCrearGradeDetail(ai_score, feedback)", "EA_LL_AI_6", "EA_LL_AI_4", 9),
    ("MSG_05_10", "10. actualizarEvaluacion(ai_total_score, status='EN_REVISION')", "EA_LL_AI_4", "EA_LL_AI_8", 10),
    ("MSG_05_11", "11. consultarRevisionCalificaciones(exam_id)", "EA_LL_AI_1", "EA_LL_AI_2", 11),
    ("MSG_05_12", "12. GET /api/v1/evaluations/?exam_id={id}", "EA_LL_AI_2", "EA_LL_AI_3", 12),
    ("MSG_05_13", "13. 200 OK (evaluaciones, notas desglosadas, fotos JPG)", "EA_LL_AI_8", "EA_LL_AI_2", 13),
    ("MSG_05_14", "14. compararImagenOriginalConEvaluacionIA()", "EA_LL_AI_1", "EA_LL_AI_2", 14),
    ("MSG_05_15", "15. ajustarNota(grade_id, final_score=18, obs='Paso correcto')", "EA_LL_AI_1", "EA_LL_AI_2", 15),
    ("MSG_05_16", "16. PATCH /api/v1/evaluations/{id}/grades/{grade_id}/", "EA_LL_AI_2", "EA_LL_AI_3", 16),
    ("MSG_05_17", "17. override_grade(final_score, teacher_comment)", "EA_LL_AI_3", "EA_LL_AI_8", 17),
    ("MSG_05_18", "18. recalcularTotalYMarcarOverridden(is_score_overridden=True)", "EA_LL_AI_8", "EA_LL_AI_3", 18),
    ("MSG_05_19", "19. 200 OK (Evaluacion con nota recalculada y observacion)", "EA_LL_AI_3", "EA_LL_AI_2", 19),
    ("MSG_05_20", "20. visualizaAuditoriaActualizada()", "EA_LL_AI_2", "EA_LL_AI_1", 20),
]

# HU-06: Publicacion y consulta de calificaciones
lifelines_hu06 = [
    ("EA_LL_PUB_1", "docente : Docente", "Actor", 60, 160),
    ("EA_LL_PUB_2", "estudiante : Estudiante", "Actor", 210, 310),
    ("EA_LL_PUB_3", ":WebTeacherUI", "Boundary", 370, 490),
    ("EA_LL_PUB_4", ":WebStudentPortalUI", "Boundary", 550, 690),
    ("EA_LL_PUB_5", ":StudentEvaluationViewSet", "Control", 750, 910),
    ("EA_LL_PUB_6", ":StudentIdLoginView", "Control", 970, 1100),
    ("EA_LL_PUB_7", ":PostgreSQL", "Entity", 1160, 1260),
]

messages_hu06 = [
    ("MSG_06_01", "1. solicitarPublicacionNotas(exam_id)", "EA_LL_PUB_1", "EA_LL_PUB_3", 1),
    ("MSG_06_02", "2. POST /api/v1/evaluations/exams/{id}/publish/", "EA_LL_PUB_3", "EA_LL_PUB_5", 2),
    ("MSG_06_03", "3. verificarPermisoTitularMateria()", "EA_LL_PUB_5", "EA_LL_PUB_5", 3),
    ("MSG_06_04", "4. update(is_published=True, status=PUBLICADO, published_at=now)", "EA_LL_PUB_5", "EA_LL_PUB_7", 4),
    ("MSG_06_05", "5. 200 OK (N notas publicadas)", "EA_LL_PUB_7", "EA_LL_PUB_3", 5),
    ("MSG_06_06", "6. ingresarAlPortalEstudiantil(student_id_code)", "EA_LL_PUB_2", "EA_LL_PUB_4", 6),
    ("MSG_06_07", "7. POST /api/v1/auth/login/student-id/ { student_id_code }", "EA_LL_PUB_4", "EA_LL_PUB_6", 7),
    ("MSG_06_08", "8. autenticarMatriculaEstudiante()", "EA_LL_PUB_6", "EA_LL_PUB_7", 8),
    ("MSG_06_09", "9. 200 OK (JWT Token para rol STUDENT)", "EA_LL_PUB_6", "EA_LL_PUB_4", 9),
    ("MSG_06_10", "10. GET /api/v1/evaluations/ (con Bearer Token)", "EA_LL_PUB_4", "EA_LL_PUB_5", 10),
    ("MSG_06_11", "11. filter(student=request.user.student_profile, is_published=True)", "EA_LL_PUB_5", "EA_LL_PUB_7", 11),
    ("MSG_06_12", "12. 200 OK (Evaluaciones del estudiante)", "EA_LL_PUB_7", "EA_LL_PUB_5", 12),
    ("MSG_06_13", "13. renderizarDesgloseYFotos(notaFinal, preguntas, feedback, JPGs)", "EA_LL_PUB_5", "EA_LL_PUB_4", 13),
    ("MSG_06_14", "14. consultaResultadosYRetroalimentacion()", "EA_LL_PUB_4", "EA_LL_PUB_2", 14),
]

# HU-07: Acceso con usuarios de prueba (Demo Login)
lifelines_hu07 = [
    ("EA_LL_DEM_1", "evaluador : Evaluador", "Actor", 60, 170),
    ("EA_LL_DEM_2", ":WebLoginUI", "Boundary", 240, 360),
    ("EA_LL_DEM_3", ":ApiClient", "Boundary", 430, 540),
    ("EA_LL_DEM_4", ":DemoLoginView", "Control", 610, 750),
    ("EA_LL_DEM_5", ":PostgreSQL", "Entity", 820, 920),
]

messages_hu07 = [
    ("MSG_07_01", "1. abrirPantallaInicio()", "EA_LL_DEM_1", "EA_LL_DEM_2", 1),
    ("MSG_07_02", "2. mostrarBotonesAccesoRapidoDemo(Admin, Docente, Estudiante)", "EA_LL_DEM_2", "EA_LL_DEM_1", 2),
    ("MSG_07_03", "3. clicAccesoDemo(role='TEACHER')", "EA_LL_DEM_1", "EA_LL_DEM_2", 3),
    ("MSG_07_04", "4. POST /api/v1/auth/demo-login/ { role: 'TEACHER' }", "EA_LL_DEM_2", "EA_LL_DEM_3", 4),
    ("MSG_07_05", "5. demo_login(request)", "EA_LL_DEM_3", "EA_LL_DEM_4", 5),
    ("MSG_07_06", "6. obtenerOProvisionarUsuarioDemo(role='TEACHER')", "EA_LL_DEM_4", "EA_LL_DEM_5", 6),
    ("MSG_07_07", "7. 200 OK (Usuario demo obtenido)", "EA_LL_DEM_5", "EA_LL_DEM_4", 7),
    ("MSG_07_08", "8. generarTokensJWT(access, refresh)", "EA_LL_DEM_4", "EA_LL_DEM_4", 8),
    ("MSG_07_09", "9. 200 OK { access, refresh, role, user }", "EA_LL_DEM_4", "EA_LL_DEM_3", 9),
    ("MSG_07_10", "10. almacenarTokensEnLocalStorage()", "EA_LL_DEM_3", "EA_LL_DEM_2", 10),
    ("MSG_07_11", "11. redirigirAVistaRol('/teacher/courses')", "EA_LL_DEM_2", "EA_LL_DEM_1", 11),
    ("MSG_07_12", "12. navegacion activa sin credenciales manuales", "EA_LL_DEM_2", "EA_LL_DEM_1", 12),
]

classes_sp3 = [
    {
        "id": "EA_CLS_STU_EVAL",
        "name": "StudentEvaluation",
        "attributes": [
            ("id", "UUID", "private"),
            ("status", "EvaluationStatus", "public"),
            ("raw_student_name", "String", "public"),
            ("raw_student_identifier", "String", "public"),
            ("ai_total_score", "Decimal", "public"),
            ("final_score", "Decimal", "public"),
            ("is_score_overridden", "Boolean", "public"),
            ("teacher_notes", "String", "public"),
            ("is_published", "Boolean", "public"),
            ("published_at", "DateTime", "public"),
            ("created_at", "DateTime", "public"),
        ],
        "operations": [],
        "geometry": (50, 50, 310, 290),
    },
    {
        "id": "EA_CLS_EVAL_STATUS",
        "name": "EvaluationStatus",
        "stereotype": "enumeration",
        "attributes": [
            ("BORRADOR", "String", "public"),
            ("PROCESANDO_IA", "String", "public"),
            ("EN_REVISION", "String", "public"),
            ("REVISION_DOCENTE", "String", "public"),
            ("CALIFICADO", "String", "public"),
            ("PUBLICADO", "String", "public"),
        ],
        "operations": [],
        "geometry": (50, 340, 260, 520),
    },
    {
        "id": "EA_CLS_EVAL_PAGE",
        "name": "EvaluationPage",
        "attributes": [
            ("id", "UUID", "private"),
            ("page_number", "Integer", "public"),
            ("image", "ImageField", "public"),
            ("qr_data", "String", "public"),
            ("ocr_raw_text", "String", "public"),
            ("created_at", "DateTime", "public"),
        ],
        "operations": [],
        "geometry": (380, 50, 610, 230),
    },
    {
        "id": "EA_CLS_GRADE_DETAIL",
        "name": "GradeDetail",
        "attributes": [
            ("id", "UUID", "private"),
            ("ai_score", "Decimal", "public"),
            ("final_score", "Decimal", "public"),
            ("transcribed_answer", "String", "public"),
            ("ai_feedback", "String", "public"),
            ("is_overridden", "Boolean", "public"),
            ("teacher_comment", "String", "public"),
        ],
        "operations": [],
        "geometry": (670, 50, 920, 240),
    },
    {
        "id": "EA_CLS_EVAL_VS",
        "name": "StudentEvaluationViewSet",
        "attributes": [
            ("permission_classes", "List", "private"),
        ],
        "operations": [
            ("get_queryset()", "QuerySet", "public"),
            ("override_grade(request, pk, grade_id)", "Response", "public"),
            ("publish_exam_grades(request, exam_id)", "Response", "public"),
        ],
        "geometry": (380, 280, 620, 430),
    },
    {
        "id": "EA_CLS_EVAL_PIPE",
        "name": "EvaluationPipeline",
        "attributes": [
            ("gemini_client", "GeminiResilientClient", "private"),
            ("prompt_builder", "PromptBuilder", "private"),
        ],
        "operations": [
            ("process_evaluation(eval)", "StudentEvaluation", "public"),
            ("extract_header(page)", "Dict", "private"),
            ("grade_components(eval)", "void", "private"),
        ],
        "geometry": (670, 280, 920, 430),
    },
    {
        "id": "EA_CLS_GEMINI_CLIENT",
        "name": "GeminiResilientClient",
        "attributes": [
            ("api_key", "String", "private"),
            ("primary_model", "String", "private"),
            ("fallback_model", "String", "private"),
            ("timeout_seconds", "Integer", "private"),
        ],
        "operations": [
            ("generate_content(prompt, images)", "Dict", "public"),
            ("cascade_fallback(e)", "Dict", "private"),
        ],
        "geometry": (980, 280, 1220, 440),
    },
    {
        "id": "EA_CLS_PROMPT_BLD",
        "name": "PromptBuilder",
        "attributes": [],
        "operations": [
            ("build_multimodal_prompt(comp, img)", "String", "public"),
            ("format_rubric(rubric_dict)", "String", "private"),
        ],
        "geometry": (980, 50, 1220, 190),
    },
    {
        "id": "EA_CLS_RESP_SAN",
        "name": "ResponseSanitizer",
        "attributes": [],
        "operations": [
            ("clean_json_markdown(text)", "String", "public"),
            ("parse_grade_json(text)", "Dict", "public"),
        ],
        "geometry": (980, 480, 1220, 600),
    },
    {
        "id": "EA_CLS_DEMO_LOGIN_V",
        "name": "DemoLoginView",
        "attributes": [],
        "operations": [
            ("post(request)", "Response", "public"),
        ],
        "geometry": (380, 480, 580, 590),
    },
    {
        "id": "EA_CLS_STU_LOGIN_V",
        "name": "StudentIdLoginView",
        "attributes": [],
        "operations": [
            ("post(request)", "Response", "public"),
        ],
        "geometry": (670, 480, 880, 590),
    },
]

assoc_sp3 = [
    {
        "id": "EA_ASC_EVL_PAG",
        "source_id": "EA_CLS_STU_EVAL",
        "target_id": "EA_CLS_EVAL_PAGE",
        "source_name": "evaluation",
        "target_name": "pages",
        "source_multiplicity": "1",
        "target_multiplicity": "1..*",
        "name": "Contiene",
    },
    {
        "id": "EA_ASC_EVL_GRD",
        "source_id": "EA_CLS_STU_EVAL",
        "target_id": "EA_CLS_GRADE_DETAIL",
        "source_name": "evaluation",
        "target_name": "grades",
        "source_multiplicity": "1",
        "target_multiplicity": "1..*",
        "name": "DesglosadoEn",
    },
    {
        "id": "EA_ASC_EVL_VS",
        "source_id": "EA_CLS_EVAL_VS",
        "target_id": "EA_CLS_STU_EVAL",
        "source_name": "",
        "target_name": "",
        "source_multiplicity": "",
        "target_multiplicity": "",
        "name": "Administra",
    },
    {
        "id": "EA_ASC_PIPE_GEMINI",
        "source_id": "EA_CLS_EVAL_PIPE",
        "target_id": "EA_CLS_GEMINI_CLIENT",
        "source_name": "",
        "target_name": "",
        "source_multiplicity": "",
        "target_multiplicity": "",
        "name": "Invoca",
    },
    {
        "id": "EA_ASC_PIPE_PROMPT",
        "source_id": "EA_CLS_EVAL_PIPE",
        "target_id": "EA_CLS_PROMPT_BLD",
        "source_name": "",
        "target_name": "",
        "source_multiplicity": "",
        "target_multiplicity": "",
        "name": "Construye",
    },
    {
        "id": "EA_ASC_GEMINI_SAN",
        "source_id": "EA_CLS_GEMINI_CLIENT",
        "target_id": "EA_CLS_RESP_SAN",
        "source_name": "",
        "target_name": "",
        "source_multiplicity": "",
        "target_multiplicity": "",
        "name": "Sanitiza",
    },
]

# ==============================================================================
# DIAGRAMA DE CLASES COMPLETO DEL SISTEMA
# ==============================================================================

classes_global = [
    # Auth
    {
        "id": "EA_GCLS_USER",
        "name": "User",
        "attributes": [
            ("id", "UUID", "private"),
            ("email", "String", "public"),
            ("role", "UserRole", "public"),
            ("student_id_code", "String", "public"),
        ],
        "operations": [
            ("full_name()", "String", "public"),
        ],
        "geometry": (50, 50, 240, 200),
    },
    {
        "id": "EA_GCLS_USER_ROLE",
        "name": "UserRole",
        "stereotype": "enumeration",
        "attributes": [
            ("ADMIN", "String", "public"),
            ("TEACHER", "String", "public"),
            ("STUDENT", "String", "public"),
        ],
        "operations": [],
        "geometry": (50, 240, 200, 340),
    },
    # Academics
    {
        "id": "EA_GCLS_SUBJECT",
        "name": "Subject",
        "attributes": [
            ("id", "UUID", "private"),
            ("code", "String", "public"),
            ("name", "String", "public"),
        ],
        "operations": [],
        "geometry": (300, 50, 480, 180),
    },
    {
        "id": "EA_GCLS_PARALLEL",
        "name": "ClassroomParallel",
        "attributes": [
            ("id", "UUID", "private"),
            ("group_code", "String", "public"),
            ("period", "String", "public"),
        ],
        "operations": [],
        "geometry": (540, 50, 740, 180),
    },
    {
        "id": "EA_GCLS_STUDENT",
        "name": "Student",
        "attributes": [
            ("id", "UUID", "private"),
            ("student_id_code", "String", "public"),
            ("full_name", "String", "public"),
        ],
        "operations": [],
        "geometry": (300, 230, 480, 350),
    },
    {
        "id": "EA_GCLS_ENROLLMENT",
        "name": "StudentEnrollment",
        "attributes": [
            ("id", "UUID", "private"),
            ("enrolled_at", "DateTime", "public"),
        ],
        "operations": [],
        "geometry": (540, 230, 740, 330),
    },
    # Exams
    {
        "id": "EA_GCLS_EXAM",
        "name": "Exam",
        "attributes": [
            ("id", "UUID", "private"),
            ("title", "String", "public"),
            ("total_score", "Decimal", "public"),
            ("has_qr_code", "Boolean", "public"),
        ],
        "operations": [
            ("current_components_score_sum()", "Decimal", "public"),
        ],
        "geometry": (800, 50, 1020, 200),
    },
    {
        "id": "EA_GCLS_EXAM_COMP",
        "name": "ExamComponent",
        "attributes": [
            ("id", "UUID", "private"),
            ("type", "ComponentType", "public"),
            ("prompt", "String", "public"),
            ("max_score", "Decimal", "public"),
            ("order", "Integer", "public"),
        ],
        "operations": [],
        "geometry": (1080, 50, 1300, 210),
    },
    # Evaluations
    {
        "id": "EA_GCLS_EVAL",
        "name": "StudentEvaluation",
        "attributes": [
            ("id", "UUID", "private"),
            ("status", "EvaluationStatus", "public"),
            ("ai_total_score", "Decimal", "public"),
            ("final_score", "Decimal", "public"),
            ("is_published", "Boolean", "public"),
        ],
        "operations": [],
        "geometry": (800, 260, 1040, 420),
    },
    {
        "id": "EA_GCLS_EVAL_PAGE",
        "name": "EvaluationPage",
        "attributes": [
            ("id", "UUID", "private"),
            ("page_number", "Integer", "public"),
            ("image", "ImageField", "public"),
            ("qr_data", "String", "public"),
        ],
        "operations": [],
        "geometry": (1100, 260, 1300, 390),
    },
    {
        "id": "EA_GCLS_GRADE_DETAIL",
        "name": "GradeDetail",
        "attributes": [
            ("id", "UUID", "private"),
            ("ai_score", "Decimal", "public"),
            ("final_score", "Decimal", "public"),
            ("is_overridden", "Boolean", "public"),
            ("teacher_comment", "String", "public"),
        ],
        "operations": [],
        "geometry": (800, 470, 1040, 620),
    },
    # Services / Controllers
    {
        "id": "EA_GCLS_PIPE",
        "name": "EvaluationPipeline",
        "attributes": [],
        "operations": [
            ("process_evaluation(eval)", "StudentEvaluation", "public"),
        ],
        "geometry": (1100, 470, 1320, 580),
    },
    {
        "id": "EA_GCLS_GEMINI",
        "name": "GeminiResilientClient",
        "attributes": [
            ("primary_model", "String", "private"),
        ],
        "operations": [
            ("generate_content(prompt, img)", "Dict", "public"),
        ],
        "geometry": (1100, 620, 1340, 730),
    },
]

assoc_global = [
    {
        "id": "EA_GASC_1",
        "source_id": "EA_GCLS_USER",
        "target_id": "EA_GCLS_SUBJECT",
        "source_name": "teacher",
        "target_name": "subjects",
        "source_multiplicity": "1",
        "target_multiplicity": "0..*",
        "name": "Dicta",
    },
    {
        "id": "EA_GASC_2",
        "source_id": "EA_GCLS_SUBJECT",
        "target_id": "EA_GCLS_PARALLEL",
        "source_name": "subject",
        "target_name": "parallels",
        "source_multiplicity": "1",
        "target_multiplicity": "1..*",
        "name": "DivideEn",
    },
    {
        "id": "EA_GASC_3",
        "source_id": "EA_GCLS_PARALLEL",
        "target_id": "EA_GCLS_ENROLLMENT",
        "source_name": "parallel",
        "target_name": "enrollments",
        "source_multiplicity": "1",
        "target_multiplicity": "0..*",
        "name": "Matriculados",
    },
    {
        "id": "EA_GASC_4",
        "source_id": "EA_GCLS_STUDENT",
        "target_id": "EA_GCLS_ENROLLMENT",
        "source_name": "student",
        "target_name": "enrollments",
        "source_multiplicity": "1",
        "target_multiplicity": "0..*",
        "name": "Inscrito",
    },
    {
        "id": "EA_GASC_5",
        "source_id": "EA_GCLS_PARALLEL",
        "target_id": "EA_GCLS_EXAM",
        "source_name": "parallel",
        "target_name": "exams",
        "source_multiplicity": "1",
        "target_multiplicity": "0..*",
        "name": "Aplica",
    },
    {
        "id": "EA_GASC_6",
        "source_id": "EA_GCLS_EXAM",
        "target_id": "EA_GCLS_EXAM_COMP",
        "source_name": "exam",
        "target_name": "components",
        "source_multiplicity": "1",
        "target_multiplicity": "1..*",
        "name": "EstructuradoEn",
    },
    {
        "id": "EA_GASC_7",
        "source_id": "EA_GCLS_EXAM",
        "target_id": "EA_GCLS_EVAL",
        "source_name": "exam",
        "target_name": "evaluations",
        "source_multiplicity": "1",
        "target_multiplicity": "0..*",
        "name": "Genera",
    },
    {
        "id": "EA_GASC_8",
        "source_id": "EA_GCLS_EVAL",
        "target_id": "EA_GCLS_EVAL_PAGE",
        "source_name": "evaluation",
        "target_name": "pages",
        "source_multiplicity": "1",
        "target_multiplicity": "1..*",
        "name": "HojasEscaneadas",
    },
    {
        "id": "EA_GASC_9",
        "source_id": "EA_GCLS_EVAL",
        "target_id": "EA_GCLS_GRADE_DETAIL",
        "source_name": "evaluation",
        "target_name": "grades",
        "source_multiplicity": "1",
        "target_multiplicity": "1..*",
        "name": "Calificaciones",
    },
    {
        "id": "EA_GASC_10",
        "source_id": "EA_GCLS_GRADE_DETAIL",
        "target_id": "EA_GCLS_EXAM_COMP",
        "source_name": "grade",
        "target_name": "component",
        "source_multiplicity": "0..*",
        "target_multiplicity": "1",
        "name": "RespondeA",
    },
]

# ==============================================================================
# EJECUTAR GENERACION DE ARCHIVOS INDIVIDUALES
# ==============================================================================

print("\n--- INICIANDO GENERACION DE ARCHIVOS XML ENTERPRISE ARCHITECT ---")

# Sprint 1
sp1_dir = os.path.join(BASE_DIR, "sprint_1")
generate_sequence_diagram(
    os.path.join(sp1_dir, "HU-01_Secuencia_Administracion_Docentes_Padron.xml"),
    "EAPK_SP1_HU01", "Sprint 1 - HU-01",
    "EA_DIAG_SP1_HU01", "HU-01 Diagrama de Secuencia - Administracion Docentes y Padron",
    lifelines_hu01, messages_hu01, AUTHOR
)

generate_sequence_diagram(
    os.path.join(sp1_dir, "HU-02_Secuencia_Gestion_Materias_Paralelos_Ficha.xml"),
    "EAPK_SP1_HU02", "Sprint 1 - HU-02",
    "EA_DIAG_SP1_HU02", "HU-02 Diagrama de Secuencia - Gestion Materias Paralelos y Ficha",
    lifelines_hu02, messages_hu02, AUTHOR
)

generate_class_diagram(
    os.path.join(sp1_dir, "Sprint_1_Diagrama_Clases.xml"),
    "EAPK_SP1_CLASS", "Sprint 1 - Modelo de Dominio",
    "EA_DIAG_SP1_CLASS", "Sprint 1 - Diagrama de Clases Academico y Cuentas",
    classes_sp1, assoc_sp1, AUTHOR
)

# Sprint 2
sp2_dir = os.path.join(BASE_DIR, "sprint_2")
generate_sequence_diagram(
    os.path.join(sp2_dir, "HU-03_Secuencia_Diseno_Modular_Examenes_PDF.xml"),
    "EAPK_SP2_HU03", "Sprint 2 - HU-03",
    "EA_DIAG_SP2_HU03", "HU-03 Diagrama de Secuencia - Diseno Modular de Examenes y PDF",
    lifelines_hu03, messages_hu03, AUTHOR
)

generate_sequence_diagram(
    os.path.join(sp2_dir, "HU-04_Secuencia_Escaneo_Movil_Multipagina.xml"),
    "EAPK_SP2_HU04", "Sprint 2 - HU-04",
    "EA_DIAG_SP2_HU04", "HU-04 Diagrama de Secuencia - Escaneo Movil Multipagina Flutter",
    lifelines_hu04, messages_hu04, AUTHOR
)

generate_class_diagram(
    os.path.join(sp2_dir, "Sprint_2_Diagrama_Clases.xml"),
    "EAPK_SP2_CLASS", "Sprint 2 - Modelo de Dominio",
    "EA_DIAG_SP2_CLASS", "Sprint 2 - Diagrama de Clases Constructor y Movil",
    classes_sp2, assoc_sp2, AUTHOR
)

# Sprint 3
sp3_dir = os.path.join(BASE_DIR, "sprint_3")
generate_sequence_diagram(
    os.path.join(sp3_dir, "HU-05_Secuencia_Calificacion_IA_Revision_Auditoria.xml"),
    "EAPK_SP3_HU05", "Sprint 3 - HU-05",
    "EA_DIAG_SP3_HU05", "HU-05 Diagrama de Secuencia - Calificacion IA y Ajuste Docente",
    lifelines_hu05, messages_hu05, AUTHOR
)

generate_sequence_diagram(
    os.path.join(sp3_dir, "HU-06_Secuencia_Publicacion_Consulta_Estudiante.xml"),
    "EAPK_SP3_HU06", "Sprint 3 - HU-06",
    "EA_DIAG_SP3_HU06", "HU-06 Diagrama de Secuencia - Publicacion y Consulta Estudiante",
    lifelines_hu06, messages_hu06, AUTHOR
)

generate_sequence_diagram(
    os.path.join(sp3_dir, "HU-07_Secuencia_Acceso_Usuarios_Prueba_Demo.xml"),
    "EAPK_SP3_HU07", "Sprint 3 - HU-07",
    "EA_DIAG_SP3_HU07", "HU-07 Diagrama de Secuencia - Acceso Rapido Demo 1-Clic",
    lifelines_hu07, messages_hu07, AUTHOR
)

generate_class_diagram(
    os.path.join(sp3_dir, "Sprint_3_Diagrama_Clases.xml"),
    "EAPK_SP3_CLASS", "Sprint 3 - Modelo de Dominio",
    "EA_DIAG_SP3_CLASS", "Sprint 3 - Diagrama de Clases Evaluaciones e IA",
    classes_sp3, assoc_sp3, AUTHOR
)

# Diagrama de Clases General
diag_clases_dir = os.path.join(BASE_DIR, "diagrama_clases")
generate_class_diagram(
    os.path.join(diag_clases_dir, "Diagrama_Clases_Completo_Sistema.xml"),
    "EAPK_GLOBAL_CLASS", "Sistema Completo - Modelo de Clases Integral",
    "EA_DIAG_GLOBAL_CLASS", "Diagrama de Clases Completo del Sistema Gestor de Notas",
    classes_global, assoc_global, AUTHOR
)

print("\n--- TODOS LOS ARCHIVOS INDIVIDUALES GENERADOS EXITOSAMENTE ---")
