# Especificación y Guía de Importación en Sparx Enterprise Architect

Este directorio contiene los modelos de análisis y diseño en formato **XMI 1.1 / UML 1.3 con extensiones completas de Enterprise Architect 2.5**, generados para el proyecto **Sistema Gestor de Notas y Evaluaciones Asistido por IA** (UAGRM - FICCT - Ingeniería de Software II, Grupo 22).

Todos los archivos XML incluyen la definición formal de elementos UML (Actores, ClassifierRoles, Mensajes, Clases, Atributos, Operaciones, Asociaciones y Estereotipos) y la **definición explícita de su Lienzo Principal (Canvas)** con geometrías y coordenadas visuales (`<Diagram>` y `<DiagramElement geometry="Left=...;Top=...;Right=...;Bottom=...;">`) para que al importarse en Enterprise Architect, los diagramas se abran automáticamente desplegando todo su contenido.

---

## 1. Estructura de Carpetas y Archivos Generados

```text
docs/xml/
├── proyecto_completo_enterprise_architect.xml   # Archivo Maestro Unificado (3 Sprints, 11 Diagramas)
│
├── sprint_1/
│   ├── HU-01_Secuencia_Administracion_Docentes_Padron.xml
│   ├── HU-02_Secuencia_Gestion_Materias_Paralelos_Ficha.xml
│   └── Sprint_1_Diagrama_Clases.xml
│
├── sprint_2/
│   ├── HU-03_Secuencia_Diseno_Modular_Examenes_PDF.xml
│   ├── HU-04_Secuencia_Escaneo_Movil_Multipagina.xml
│   └── Sprint_2_Diagrama_Clases.xml
│
├── sprint_3/
│   ├── HU-05_Secuencia_Calificacion_IA_Revision_Auditoria.xml
│   ├── HU-06_Secuencia_Publicacion_Consulta_Estudiante.xml
│   ├── HU-07_Secuencia_Acceso_Usuarios_Prueba_Demo.xml
│   └── Sprint_3_Diagrama_Clases.xml
│
└── diagrama_clases/
    └── Diagrama_Clases_Completo_Sistema.xml
```

---

## 2. Detalle de Diagramas por Sprint

### Sprint 1: Base Académica y Administrativa
* **HU-01 — Secuencia: Administración de docentes y padrón estudiantil**
  * **Objetivo:** Creación y activación de cuentas docentes con validación de roles (`ADMIN`), e importación masiva de estudiantes desde Excel (.xlsx) hacia el paralelo seleccionado.
  * **Líneas de Vida:** `admin : Administrador`, `:WebAdminUI`, `:ApiClient`, `:TeacherManagementViewSet`, `:ClassroomParallelViewSet`, `:ExcelStudentImporter`, `:PostgreSQL`.
  * **Mensajes:** 22 pasos con validación de permisos, control transaccional atómico y reporte de filas procesadas.
* **HU-02 — Secuencia: Gestión de materias, paralelos y ficha estudiantil**
  * **Objetivo:** Docente organiza sus asignaturas y aulas/periodos, consulta listas de inscritos y examina la ficha académica del estudiante (historial, notas y promedio).
  * **Líneas de Vida:** `docente : Docente`, `:WebTeacherUI`, `:SubjectViewSet`, `:ClassroomParallelViewSet`, `:StudentDetailView`, `:PostgreSQL`.
  * **Mensajes:** 19 pasos con aislamiento de registros por docente y cálculo de métricas académicas.
* **Sprint 1 — Diagrama de Clases: Modelo de Dominio Académico**
  * **Clases:** `User`, `UserRole`, `Subject`, `ClassroomParallel`, `Student`, `StudentEnrollment`, `TeacherManagementViewSet`, `SubjectViewSet`, `ClassroomParallelViewSet`, `StudentDetailView`, `ExcelStudentImporter`.
  * **Lienzo:** Canvas con disposición modular de entidades y controladores.

### Sprint 2: Diseño de Exámenes y Digitalización Móvil
* **HU-03 — Secuencia: Diseño modular de exámenes**
  * **Objetivo:** Docente diseña evaluaciones con componentes abiertos, opción múltiple y verdadero/falso, valida sumatoria en tiempo real (100 pts) y exporta PDF imprimible con/sin código QR de formato.
  * **Líneas de Vida:** `docente : Docente`, `:WebExamBuilderUI`, `:ScoreValidatorEngine`, `:ExamViewSet`, `:ExamPDFGenerator`, `:PostgreSQL`.
  * **Mensajes:** 18 pasos con validación de consistencia y streaming de archivo PDF.
* **HU-04 — Secuencia: Escaneo móvil multipágina**
  * **Objetivo:** Captura de hojas físicas manuscritas en Flutter mediante disparo automático por QR o encuadre manual asistido, agrupación de 1 a N páginas JPG y envío multipart al backend.
  * **Líneas de Vida:** `docente : Docente`, `:CameraScannerView`, `:ScannerController`, `:MobileApiClient`, `:EvaluationSubmitView`, `:MediaStorage`, `:PostgreSQL`.
  * **Mensajes:** 18 pasos de captura, previsualización de miniaturas, subida multipart y encolado en pipeline.
* **Sprint 2 — Diagrama de Clases: Constructor y Digitalización**
  * **Clases:** `Exam`, `ExamComponent`, `ComponentType`, `ExamViewSet`, `ExamPDFGenerator`, `CameraScannerView`, `ScannerController`, `MobileApiClient`, `EvaluationSubmitView`.

### Sprint 3: Calificación Asistida por IA, Publicación y Consulta
* **HU-05 — Secuencia: Calificación, revisión y auditoría**
  * **Objetivo:** Pipeline de inferencia multimodal Google Gemini API v1beta con Cascade Fallback (429/timeout), transcripción OCR, derivación por ilegibilidad (`REVISION_DOCENTE`) y ajuste manual docente con observación obligatoria.
  * **Líneas de Vida:** `docente : Docente`, `:WebGradeReviewUI`, `:StudentEvaluationViewSet`, `:EvaluationPipeline`, `:PromptBuilder`, `:GeminiResilientClient`, `:GoogleGeminiAPI`, `:PostgreSQL`.
  * **Mensajes:** 20 pasos de orquestación IA, resiliencia y recálculo de notas.
* **HU-06 — Secuencia: Publicación y consulta de calificaciones**
  * **Objetivo:** Publicación docente en lote y portal de autoservicio del estudiante con autenticación mediante matrícula/ID, con acceso restringido a evaluaciones publicadas, desglose por pregunta, feedback y fotos originales JPG.
  * **Líneas de Vida:** `docente : Docente`, `estudiante : Estudiante`, `:WebTeacherUI`, `:WebStudentPortalUI`, `:StudentEvaluationViewSet`, `:StudentIdLoginView`, `:PostgreSQL`.
  * **Mensajes:** 14 pasos con filtros de seguridad y trazabilidad completa.
* **HU-07 — Secuencia: Acceso rápido con usuarios de prueba (Demo Login)**
  * **Objetivo:** Acceso instantáneo con 1 clic desde la pantalla de login para perfiles de prueba de Administrador, Docente y Estudiante sin ingreso manual de credenciales.
  * **Líneas de Vida:** `evaluador : Evaluador`, `:WebLoginUI`, `:ApiClient`, `:DemoLoginView`, `:PostgreSQL`.
  * **Mensajes:** 12 pasos de aprovisionamiento demo, emisión de tokens JWT y redirección a dashboard por rol.
* **Sprint 3 — Diagrama de Clases: Evaluaciones e Inferencia IA**
  * **Clases:** `StudentEvaluation`, `EvaluationStatus`, `EvaluationPage`, `GradeDetail`, `StudentEvaluationViewSet`, `EvaluationPipeline`, `GeminiResilientClient`, `PromptBuilder`, `ResponseSanitizer`, `DemoLoginView`, `StudentIdLoginView`.

### Diagrama de Clases Completo del Sistema
* **`Diagrama_Clases_Completo_Sistema.xml`**:
  * Unifica todos los subsistemas: Autenticación (`User`, `UserRole`), Académico (`Subject`, `ClassroomParallel`, `Student`, `StudentEnrollment`), Exámenes (`Exam`, `ExamComponent`), Evaluaciones (`StudentEvaluation`, `EvaluationPage`, `GradeDetail`) y Servicios de IA (`EvaluationPipeline`, `GeminiResilientClient`).
  * Cuenta con multiplicidades precisas, nombres de roles en asociaciones y lienzo ampliado (`1400x800 px`).

---

## 3. Instrucciones de Importación en Enterprise Architect

Para abrir y visualizar los diagramas en Sparx Enterprise Architect (versiones 12, 13, 14, 15, 16 o 17):

### Opción A: Importar el Proyecto Completo (Recomendado)
1. Abrir **Enterprise Architect** y crear o abrir un proyecto (`.eap`, `.eapx` o `.qea`).
2. En el panel **Project Browser**, hacer clic derecho sobre la raíz (o sobre el paquete destino).
3. Seleccionar **Import/Export** > **Import Package from XMI File...** (o presionar `Ctrl + Alt + I`).
4. En el campo **Filename**, buscar y seleccionar:
   `c:\EDBERTO\ULTIMO\SW2\SW2-PF-GESTOR-NOTAvF-26-2\docs\xml\proyecto_completo_enterprise_architect.xml`
5. Asegurarse de que la opción **Import Diagrams** esté marcada.
6. Hacer clic en **Import**.
7. En el Project Browser se desplegará el árbol con todos los paquetes de los Sprints. Al hacer doble clic en cualquiera de los diagramas, **se abrirá directamente el lienzo principal mostrando todos los objetos, líneas de vida y mensajes**.

### Opción B: Importar un Sprint o Diagrama Individual
1. En el Project Browser de EA, crear un nuevo paquete (ej. "Sprint 1").
2. Clic derecho sobre el paquete > **Import/Export** > **Import Package from XMI File...**
3. Seleccionar el archivo deseado dentro de `docs/xml/sprint_1/`, `docs/xml/sprint_2/`, `docs/xml/sprint_3/` o `docs/xml/diagrama_clases/`.
4. Clic en **Import**.
5. Doble clic sobre el diagrama importado para abrir su lienzo.

---

## 4. Metadatos del Proyecto
* **Universidad:** Universidad Autónoma Gabriel René Moreno (UAGRM)
* **Facultad:** Facultad de Ingeniería en Ciencias de la Computación y Telecomunicaciones (FICCT)
* **Materia:** Ingeniería de Software II (INF-412)
* **Grupo:** 22
* **Desarrollador / Autor:** Ybanera Herrera Edberto (Registro: 219059829)
* **Docente:** Ing. Rolando Martínez
