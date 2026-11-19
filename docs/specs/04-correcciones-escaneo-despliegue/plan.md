# Plan: 04-correcciones-escaneo-despliegue
Status: APPROVED
Version: 1
Spec-SHA256: c09be26acd0fd8c31dc25e8d0f66279fb701bdbd23e72852fbddb24e18c8bdbf
Constitution-SHA256: a726869c15a091c769d54e19e825801d04ba2ae10cb890679dc43bc7a7e07212

## 1. Arquitectura y decisiones

- **PLAN-01 (Armonización del Constructor de Exámenes Web):**
  - El módulo `/teacher/exams/builder` se vincula directamente a `parallel_id` y `exam_id`.
  - Incorpora la barra de navegación `Breadcrumbs`: `Mis Materias > [Materia] > [Aula] > Constructor de Exámenes`.
  - Aislamiento estricto (RB-01): El constructor opera exclusivamente sobre endpoints de `apps.exams` (`Exam` y `ExamComponent`). No modifica registros de `Subject` ni `ClassroomParallel`.
- **PLAN-02 (Seeder de Datos para Pruebas Rápidas):**
  - Implementación de un comando de gestión en Django (`seed_demo_data`) que provisiona automáticamente para el profesor demo (`profesor.demo@evaluacion.edu.bo`):
    1. Materia 1: *Cálculo I (MAT-101)* - *Aula A (1-2026)* con *Primer Examen Parcial* (100 pts: Pregunta 1 Derivada 50 pts, Pregunta 2 Límite 50 pts).
    2. Materia 2: *Álgebra Lineal (MAT-102)* - *Aula B (1-2026)* con *Examen Matrices y Sistemas* (100 pts: Pregunta 1 Determinante 50 pts, Pregunta 2 Rango y Solución 50 pts).
    3. Estudiante demo matriculado con perfil completo (`EST-2026-001`).
- **PLAN-03 (Fallback de Transcripción Libre y Estudiante Borrador):**
  - En `backend/apps/evaluations/services/evaluation_pipeline.py`:
    - Si Gemini analiza la imagen y detecta texto pero no logra emparejar los componentes con la rúbrica del examen, no eleva error 400 ni 500.
    - Se almacena la transcripción textual integral en `teacher_notes` y `ocr_raw_text`.
    - La evaluación se asigna a un identificador borrador (`raw_student_identifier="ESTUDIANTE_BORRADOR"`).
    - Estado asignado: `REVISION_DOCENTE`.
- **PLAN-04 (Resiliencia Gemini Free Tier & Pausa Manual en Mobile):**
  - En `mobile/lib/modules/scanner/controllers/submission_controller.dart`:
    - Manejo específico de excepciones HTTP 429 (`Too Many Requests` / `ResourceExhausted`).
    - Estado reactivo `SubmissionStatus.rateLimited` que reporta el contador de reintento progresivo (ej. reintento 1 de 3).
    - Método `pauseAnalysis()` que detiene la espera sin descartar las imágenes JPG de la cola de captura.
    - Método `retrySubmission()` para reanudar el análisis con IA sobre las mismas fotografías cuando el usuario lo decida.
- **PLAN-05 (Doble Modalidad de Digitalización en Mobile):**
  - En `mobile/lib/modules/courses/views/exams_list_view.dart`:
    - El botón "Escanear" despliega un menú modal CafeBlend con dos opciones:
      1. *Modo General (IA Automático):* Inicia el visor de cámara para detección automática.
      2. *Modo Dirigido (Seleccionar Alumno):* Abre un listado de estudiantes inscritos en el aula; al seleccionar uno, inicia la cámara con su matrícula y nombre pre-asignados.
- **PLAN-06 (Rediseño UX/UI del Diálogo de Resultados en Mobile):**
  - En `mobile/lib/modules/scanner/views/review_pages_view.dart`:
    - Rediseño de la tarjeta modal con tokens CafeBlend:
      - Encabezado con estado pedagógico y avatar del estudiante.
      - Desglose componente por componente (pregunta, transcripción y puntaje).
      - Acciones diferenciadas: "Publicar Nota al Alumno" y "Escanear Siguiente Examen".
- **PLAN-07 (Enrutamiento Nginx & Landing Page en Servidor Azure `20.51.189.52`):**
  - Nginx configurado en el servidor para servir:
    - `location /` -> `http://127.0.0.1:3002` (Landing Page en raíz sin puerto).
    - `location /app/` -> `http://127.0.0.1:3000/` (Plataforma Web Next.js).
    - `location /api/` -> `http://127.0.0.1:8000/api/` (Backend Django).
    - `location /admin/` -> `http://127.0.0.1:8000/admin/`.
  - Botón "Ingresar a la Plataforma" en la Landing Page configurado hacia `/app` (o variable `NEXT_PUBLIC_APP_URL=/app`).

---

## 2. Alcance físico de cambios

| Acción | Archivo | Propósito |
| :--- | :--- | :--- |
| **MODIFY** | `frontend/src/app/teacher/exams/builder/page.tsx` | Armonizar breadcrumbs y vincular a paralelo/examen sin tocar materias. |
| **CREATE** | `backend/apps/academics/management/commands/seed_demo_data.py` | Comando seeder con 2 materias, 2 aulas y 2 exámenes completos con componentes. |
| **MODIFY** | `backend/apps/evaluations/services/evaluation_pipeline.py` | Fallback para exámenes no estructurados con transcripción cruda y estudiante borrador. |
| **MODIFY** | `mobile/lib/modules/scanner/controllers/submission_controller.dart` | Soporte para HTTP 429, estado `rateLimited`, pausa y reintento manual. |
| **MODIFY** | `mobile/lib/modules/courses/views/exams_list_view.dart` | Selector de digitalización: Modo General vs Modo Dirigido con lista de alumnos. |
| **MODIFY** | `mobile/lib/modules/scanner/views/review_pages_view.dart` | Rediseño UX/UI del diálogo de resultados y banner de reintento/pausa. |
| **MODIFY** | `landing/src/components/Hero.tsx` | Botón "Acceder a la Plataforma" apuntando a `/app/login`. |
| **MODIFY** | `docs/deploy/04_DESPLEGAR_Y_VERIFICAR.md` | Actualización de la configuración Nginx para la Landing Page en puerto 80 raíz. |

---

## 3. Persistencia e integraciones

- **Modelos:** Se reutilizan los modelos existentes `Exam`, `ExamComponent`, `StudentEvaluation`, `GradeDetail`, `ClassroomParallel` y `Student`. No requiere migraciones destructivas de base de datos.
- **Transaccionalidad:** El fallback de transcripción y guardado de borrador opera en bloque atómico (`transaction.atomic()`).

---

## 4. Contratos frontend/backend

1. **Consulta de Estudiantes del Paralelo:**
   - `GET /api/v1/academics/parallels/{id}/students/` o filtrado en inscripciones.
   - Retorna lista de estudiantes: `[{ id, student_id_code, full_name }]`.
2. **Envío de Examen con Fallback:**
   - `POST /api/v1/evaluations/submit/`
   - Parámetros multipart: `exam_id`, `parallel_id`, `student_identifier` (opcional), `pages`.
   - Retorna: Objeto `StudentEvaluationDetailSerializer` con estado `EN_REVISION` o `REVISION_DOCENTE`.

---

## 5. Diseño visual e interacción

- **Sistema de Diseño:** CafeBlend (Warm Cream `#FDF6EC`, Dark Espresso `#1A120B`, Rich Caramel `#8B5E3C`, Mint Green `#059669`).
- **Modal de Selección de Modo en Mobile:** Tarjeta emergente inferior con opciones gráficas claras (icono de cámara libre vs icono de usuario matriculado).
- **Banner de Pausa/Reintento:** Notificación con barra de progreso indeterminada, mensaje de saturación de cuota y botón de acción rápida para pausar o forzar reintento manual.

---

## 6. Vertical slices

- **Slice 1 (Backend & Seeders):** Comando seeder con 2 exámenes y soporte de fallback de transcripción libre en el pipeline de IA.
- **Slice 2 (Mobile Flow & Modos Duales):** Selector de modo general vs dirigido, banner de saturación 429 con pausa, y diálogo de resultados renovado.
- **Slice 3 (Web Navigation & Despliegue Nginx):** Constructor de exámenes con breadcrumbs aislados y configuración de Nginx para Landing Page en raíz `20.51.189.52`.

---

## 7. Verificación

- `python manage.py seed_demo_data` -> Genera 2 exámenes con componentes.
- `flutter test` en `mobile/` -> Todos los tests pasan.
- Verificación física de los dos modos de escaneo en emulador.
- Verificación de la configuración Nginx en `04_DESPLEGAR_Y_VERIFICAR.md`.
