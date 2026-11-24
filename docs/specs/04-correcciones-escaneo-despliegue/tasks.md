# Tasks: 04-correcciones-escaneo-despliegue
<!-- sdd:progress:start -->
## Task Progress

Status: IN_PROGRESS

| Métrica | Cantidad |
| --- | ---: |
| Total de tareas | 9 |
| Tareas realizadas | 8 |
| Tareas por realizar | 1 |
| Tareas bloqueadas | 0 |
| Tareas en progreso | 1 |
| Progreso | 88.9% |

## Registro de tareas

| ID | Estado | Tarea | Evidencia actual |
| --- | --- | --- | --- |
| T1.1 | COMPLETED | [IMPL] Comando Seeder con 2 Materias, Aulas y Exámenes Completos | 2 exámenes generados: "Primer Examen Parcial" (Cálculo I - Aula A, 2 componentes) y "Examen Diagnóstico de Álgebra Lineal" (Álgebra Lineal - Aula B, 2 componentes) vinculando estudiantes Juan Carlos Pérez y María Gómez. |
| T1.2 | COMPLETED | [IMPL] Fallback de Transcripción Libre y Estudiante Borrador en Backend | `test_unstructured_exam_fallback_to_draft_student` y `test_gemini_rate_limit_returns_429_with_structured_payload` ejecutadas exitosamente (HTTP 201 con `ESTUDIANTE_BORRADOR` y OCR transcrito). |
| T2.1 | COMPLETED | [IMPL] Resiliencia ante Saturación de Gemini (HTTP 429), Notificación y Pausa en Mobile | Pruebas unitarias de `pauseAnalysis` (estado `paused` conservando páginas) y `retrySubmission` (incremento de `retryAttempt`) aprobadas con código 0. |
| T2.2 | COMPLETED | [IMPL] Doble Modalidad de Escaneo (Modo General vs Modo Dirigido por Alumno) en Mobile | Selector BottomSheet modal implementado con Modo General (IA/QR) y Modo Dirigido integrado al endpoint `/academics/parallels/{id}/students/`; badge indicador en visor de cámara. |
| T2.3 | COMPLETED | [IMPL] Rediseño UX/UI del Diálogo de Resultados de Digitalización | Modal con avatar, badge dinámico, desglose pregunta por pregunta de texto manuscrito y retroalimentación IA, fallback de OCR general y acciones de publicación directa. |
| T3.1 | COMPLETED | [IMPL] Armonización y Breadcrumbs en Constructor de Exámenes Web | Barra de migas de pan integrada (`Mis Materias > [Materia] > [Aula] > Constructor de Exámenes`); build exitoso de Next.js sin errores de tipado. |
| T3.2 | COMPLETED | [IMPL] Configuración de Producción Nginx (Landing Page en Raíz `20.51.189.52` y Botón hacia App) | `HeroSection` y `Navbar` vinculan con `appUrl` ('http://20.51.189.52:3000/login' o `/app`); VirtualHost Nginx documentado en `04_DESPLEGAR_Y_VERIFICAR.md`; compilación exitosa de Next.js Landing. |
| T4.1 | COMPLETED | [TEST] Verificación Integral de Suites de Pruebas y Flujo Completo | 29 pruebas backend aprobadas (29 passed), 9 pruebas Flutter mobile aprobadas (9 passed), frontend y landing build exitosos. |
| T5.1 | TESTING | [IMPL] Mejorar el flujo móvil docente | El parser de Dart 3.14.0 procesó los ocho archivos Dart modificados. Verificación funcional y compilación Android en curso. |

## Checklist rápido

- [x] T1.1 [IMPL] Comando Seeder con 2 Materias, Aulas y Exámenes Completos
- [x] T1.2 [IMPL] Fallback de Transcripción Libre y Estudiante Borrador en Backend
- [x] T2.1 [IMPL] Resiliencia ante Saturación de Gemini (HTTP 429), Notificación y Pausa en Mobile
- [x] T2.2 [IMPL] Doble Modalidad de Escaneo (Modo General vs Modo Dirigido por Alumno) en Mobile
- [x] T2.3 [IMPL] Rediseño UX/UI del Diálogo de Resultados de Digitalización
- [x] T3.1 [IMPL] Armonización y Breadcrumbs en Constructor de Exámenes Web
- [x] T3.2 [IMPL] Configuración de Producción Nginx (Landing Page en Raíz `20.51.189.52` y Botón hacia App)
- [x] T4.1 [TEST] Verificación Integral de Suites de Pruebas y Flujo Completo
- [?] T5.1 [IMPL] Mejorar el flujo móvil docente

<!-- sdd:progress:end -->

Version: 2
Spec-SHA256: 3e758455e71f052adc6a11b9062419685166cd3e5ebca9a0095ac2d861967cdb
Plan-SHA256: cbaab3028fcc45f12591749a6d2708882a4134ccfe005a5566268d1c6ec27865

## 1. Trazabilidad y estrategia

- **Slice 1 (Backend & Datos):** Seeder con 2 exámenes y soporte de transcripción libre ante fallos de estructura.
- **Slice 2 (Mobile Scanner & UX):** Modos General vs Dirigido, resiliencia 429 con pausa, y diálogo renovado de resultados.
- **Slice 3 (Web & Despliegue):** Constructor de exámenes armonizado y Nginx configurado para servir la Landing Page en la raíz del servidor Azure.

---

## 2. Tareas detalladas

### T1.1 [IMPL] Comando Seeder con 2 Materias, Aulas y Exámenes Completos
**Status:** COMPLETED
**Depends on:** —
**Traceability:** PLAN-02, RF-04.1
**Files:** `backend/apps/academics/management/commands/seed_demo_data.py`
**Objective:** Proveer 2 exámenes completos con componentes ya configurados para pruebas rápidas del docente demo.
**Work:** Crear el comando de gestión Django que cree o actualice para el profesor demo: Cálculo I (Aula A) con 2 preguntas de desarrollo/límite y Álgebra Lineal (Aula B) con 2 preguntas de matrices, vinculando estudiantes demo.
**Done when:** El comando `python manage.py seed_demo_data` se ejecute sin errores y cree los 2 exámenes con sus componentes en base de datos.
**Verification:** PASS
**Command:** `python backend/manage.py seed_demo_data`
**Exit code:** 0
**Evidence:** 2 exámenes generados: "Primer Examen Parcial" (Cálculo I - Aula A, 2 componentes) y "Examen Diagnóstico de Álgebra Lineal" (Álgebra Lineal - Aula B, 2 componentes) vinculando estudiantes Juan Carlos Pérez y María Gómez.

### T1.2 [IMPL] Fallback de Transcripción Libre y Estudiante Borrador en Backend
**Status:** COMPLETED
**Depends on:** T1.1
**Traceability:** PLAN-03, RF-03.1, SC-02
**Files:** `backend/apps/evaluations/services/evaluation_pipeline.py`
**Objective:** Permitir que exámenes no estructurados o sin coincidencia capturen la transcripción completa sin fallar.
**Work:** Modificar el pipeline de evaluación para que, si no se detectan componentes estructurados, almacene la transcripción total en el borrador con estado `REVISION_DOCENTE` y estudiante no asignado.
**Done when:** Una prueba de evaluación sin preguntas estructuradas retorne 201 Created con el texto transcrito intacto.
**Verification:** PASS
**Command:** `pytest backend/tests/test_evaluations_post_detail.py`
**Exit code:** 0
**Evidence:** `test_unstructured_exam_fallback_to_draft_student` y `test_gemini_rate_limit_returns_429_with_structured_payload` ejecutadas exitosamente (HTTP 201 con `ESTUDIANTE_BORRADOR` y OCR transcrito).

### T2.1 [IMPL] Resiliencia ante Saturación de Gemini (HTTP 429), Notificación y Pausa en Mobile
**Status:** COMPLETED
**Depends on:** —
**Traceability:** PLAN-04, RF-03.2, SC-04
**Files:** `mobile/lib/modules/scanner/controllers/submission_controller.dart`, `mobile/lib/modules/scanner/views/review_pages_view.dart`
**Objective:** Gestionar cuota saturada de la API gratuita informando al docente y permitiendo pausar/reintentar.
**Work:** Agregar estado `rateLimited` y métodos `pauseAnalysis()` y `retrySubmission()` en el controlador; incorporar banner con animación de progreso en `review_pages_view.dart`.
**Done when:** Ante respuesta 429, el controlador notifique a la UI y el botón de pausa detenga el reintento conservando la foto.
**Verification:** PASS
**Command:** `flutter test mobile/test/submission_controller_test.dart`
**Exit code:** 0
**Evidence:** Pruebas unitarias de `pauseAnalysis` (estado `paused` conservando páginas) y `retrySubmission` (incremento de `retryAttempt`) aprobadas con código 0.

### T2.2 [IMPL] Doble Modalidad de Escaneo (Modo General vs Modo Dirigido por Alumno) en Mobile
**Status:** COMPLETED
**Depends on:** —
**Traceability:** PLAN-05, RF-02.1, RF-02.2, SC-01
**Files:** `mobile/lib/modules/courses/views/exams_list_view.dart`, `mobile/lib/modules/scanner/views/camera_scanner_view.dart`
**Objective:** Ofrecer selector de escaneo general automático o escaneo con estudiante pre-seleccionado.
**Work:** Al pulsar "Escanear" en la lista de exámenes, mostrar un BottomSheet modal para elegir entre Modo General (directo a cámara) o Modo Dirigido (lista de estudiantes inscritos en el aula para fijar el ID).
**Done when:** El docente pueda seleccionar un estudiante específico antes de tomar la foto y verificar que su matrícula viaje asignada.
**Verification:** PASS
**Command:** `flutter test mobile/test/scanner_flow_test.dart`
**Exit code:** 0
**Evidence:** Selector BottomSheet modal implementado con Modo General (IA/QR) y Modo Dirigido integrado al endpoint `/academics/parallels/{id}/students/`; badge indicador en visor de cámara.

### T2.3 [IMPL] Rediseño UX/UI del Diálogo de Resultados de Digitalización
**Status:** COMPLETED
**Depends on:** T2.1
**Traceability:** PLAN-06
**Files:** `mobile/lib/modules/scanner/views/review_pages_view.dart`
**Objective:** Presentar una tarjeta de resultados con información rica de preguntas, transcripciones y notas asignadas.
**Work:** Reemplazar el diálogo básico por un modal completo con avatar de estudiante, badge de estado, lista de respuestas transcritas por la IA y botones de acción rápida.
**Done when:** Al completar la evaluación, el diálogo muestre el desglose individual de preguntas con diseño CafeBlend.
**Verification:** PASS
**Command:** `flutter test mobile/test/scanner_flow_test.dart`
**Exit code:** 0
**Evidence:** Modal con avatar, badge dinámico, desglose pregunta por pregunta de texto manuscrito y retroalimentación IA, fallback de OCR general y acciones de publicación directa.

### T3.1 [IMPL] Armonización y Breadcrumbs en Constructor de Exámenes Web
**Status:** COMPLETED
**Depends on:** —
**Traceability:** PLAN-01, RF-01.1
**Files:** `frontend/src/app/teacher/exams/builder/page.tsx`
**Objective:** Vincular el constructor al aula y examen sin permitir edición de materias base.
**Work:** Integrar barra de migas de pan y parámetros de contexto para que el docente solo configure la rúbrica y componentes del examen respectivo.
**Done when:** La página `/teacher/exams/builder` muestre los breadcrumbs contextuales del aula correspondiente.
**Verification:** PASS
**Command:** `npm --prefix frontend run build`
**Exit code:** 0
**Evidence:** Barra de migas de pan integrada (`Mis Materias > [Materia] > [Aula] > Constructor de Exámenes`); build exitoso de Next.js sin errores de tipado.

### T3.2 [IMPL] Configuración de Producción Nginx (Landing Page en Raíz `20.51.189.52` y Botón hacia App)
**Status:** COMPLETED
**Depends on:** —
**Traceability:** PLAN-07, RF-05.1, RF-05.2, SC-03
**Files:** `landing/src/components/HeroSection.tsx`, `docs/deploy/04_DESPLEGAR_Y_VERIFICAR.md`
**Objective:** Servir la Landing Page en la URL principal `http://20.51.189.52/` y conectar el botón hacia el software.
**Work:** Actualizar `04_DESPLEGAR_Y_VERIFICAR.md` con el VirtualHost Nginx que rutea `/` a la Landing Page (3002) y `/app/` a la web (3000); actualizar el botón en `Hero.tsx`.
**Done when:** La configuración de Nginx esté documentada y el enlace de la Landing Page dirija a la aplicación académica.
**Verification:** PASS
**Command:** `npm --prefix landing run build`
**Exit code:** 0
**Evidence:** `HeroSection` y `Navbar` vinculan con `appUrl` ('http://20.51.189.52:3000/login' o `/app`); VirtualHost Nginx documentado en `04_DESPLEGAR_Y_VERIFICAR.md`; compilación exitosa de Next.js Landing.

### T4.1 [TEST] Verificación Integral de Suites de Pruebas y Flujo Completo
**Status:** COMPLETED
**Depends on:** T1.1, T1.2, T2.1, T2.2, T2.3, T3.1, T3.2
**Traceability:** PLAN-01, PLAN-02, PLAN-03, PLAN-04, PLAN-05, PLAN-06, PLAN-07, RF-01.1, RF-02.1, RF-03.1, RF-04.1, RF-05.1, SC-01, SC-02, SC-03, SC-04
**Files:** `mobile/test/`
**Objective:** Garantizar que todas las suites de pruebas pasen sin errores.
**Work:** Ejecutar pruebas unitarias de backend, web y mobile.
**Done when:** Todas las pruebas automatizadas finalicen con código de salida 0.
**Verification:** PASS
**Command:** `pytest backend/tests && cd mobile && flutter test`
**Exit code:** 0
**Evidence:** 29 pruebas backend aprobadas (29 passed), 9 pruebas Flutter mobile aprobadas (9 passed), frontend y landing build exitosos.

---

## 3. Bitácora
- **2026-11-19:** Backlog inicial generado con 8 tareas estructuradas en vertical slices.
- **2026-11-19:** Implementado y verificado Seeder con 2 exámenes y componentes para docente demo.
- **2026-11-19:** Implementado fallback de transcripción libre y captura de ESTUDIANTE_BORRADOR con HTTP 201 en backend.
- **2026-11-19:** Implementada detección de HTTP 429 con pausa manual y reintento en SubmissionController y ReviewPagesView.
- **2026-11-19:** Implementada doble modalidad de escaneo (General IA vs Dirigido por Alumno) en ExamsListView y CameraScannerView.
- **2026-11-19:** Rediseñado el diálogo de resultados con desglose de transcripción de preguntas y UI CafeBlend.
- **2026-11-19:** Armonizados breadcrumbs en Constructor de Exámenes Web y documentada configuración de Landing Page en raíz Nginx.
- **2026-11-19:** Ejecutadas suites de pruebas completas con 100% de éxito.

## Mejoras del flujo móvil

### T5.1 [IMPL] Mejorar el flujo móvil docente

**Status:** TESTING
**Depends on:** —
**Traceability:** RF-04.9, SC-04.9.1, PLAN-49
**Files:** `mobile/`
**Objective:** Completar el flujo móvil aprobado.
**Work:** Implementar y verificar el recorrido y compilar APK debug.
**Done when:** Pruebas del flujo y APK debug verificadas.
**Verification:** NOT_RUN
**Command:** `dart format --output=none`; `flutter test --no-pub`; `flutter build apk --debug --no-pub`
**Exit code:** —
**Evidence:** El parser de Dart 3.14.0 procesó los ocho archivos Dart modificados. Verificación funcional y compilación Android en curso.
