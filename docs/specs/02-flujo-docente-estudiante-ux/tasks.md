# Tasks: Rediseño de Flujo Docente, Configuración y Aislamiento Estudiantil
<!-- sdd:progress:start -->
## Task Progress

Status: COMPLETED

| Métrica | Cantidad |
| --- | ---: |
| Total de tareas | 5 |
| Tareas realizadas | 5 |
| Tareas por realizar | 0 |
| Tareas bloqueadas | 0 |
| Tareas en progreso | 0 |
| Progreso | 100.0% |

## Registro de tareas

| ID | Estado | Tarea | Evidencia actual |
| --- | --- | --- | --- |
| T1.1 | COMPLETED | [IMPL] Implementar UserMenuDropdown y Refactorizar Navbar | UserMenuDropdown.tsx implementado con avatar, información de usuario, alternador CafeBlend Warm Cream / Dark Espresso, modal accesible con tecla Escape y logout. Integrado en Navbar.tsx sustituyendo botón aislado. Verificado sin errores de tipos. |
| T1.2 | COMPLETED | [IMPL] Rediseñar Vista Mis Materias y Crear SubjectModal | SubjectModal.tsx implementado con backdrop blur y accesibilidad Escape. courses/page.tsx refactorizado eliminando formularios estáticos inline, mostrando catálogo en cards limpias con botón '+ Nueva Materia' (modal) y botón 'Gestionar Aulas'. |
| T1.3 | COMPLETED | [IMPL] Crear Vistas Jerárquicas de Aulas y Exámenes con Modales | Rutas jerárquicas implementadas: /teacher/courses/[id]/parallels con ParallelModal y /teacher/parallels/[id]/exams con listado de parciales y exportación PDF. Breadcrumbs.tsx integrado en ambas vistas manteniendo contexto de navegación. |
| T1.4 | COMPLETED | [IMPL] Blindar Aislamiento y Filtrado en el Portal Estudiantil | Portal estudiantil /student/portal blindado pasando userRole="STUDENT" al Navbar para ocultar menús administrativos/docentes y filtrado estricto de evaluaciones con is_published=True. |
| T1.5 | COMPLETED | [VERIFY] Compilación Global y Verificación de Flujos | Compilación global de producción con Next.js 14 exitosa. Las 10 rutas estáticas y dinámicas generadas y optimizadas sin advertencias ni errores. |

## Checklist rápido

- [x] T1.1 [IMPL] Implementar UserMenuDropdown y Refactorizar Navbar
- [x] T1.2 [IMPL] Rediseñar Vista Mis Materias y Crear SubjectModal
- [x] T1.3 [IMPL] Crear Vistas Jerárquicas de Aulas y Exámenes con Modales
- [x] T1.4 [IMPL] Blindar Aislamiento y Filtrado en el Portal Estudiantil
- [x] T1.5 [VERIFY] Compilación Global y Verificación de Flujos

<!-- sdd:progress:end -->

Version: 1
Spec-SHA256: 818c7a5509d79591c3ddb131d8a49fe6aaec39daa08f9ec53a6badcd0155b49e
Plan-SHA256: 8a0bc22cbc68582dad674ee9cebaef42aa0e68726f10a711b303cc0746328cac

## 1. Trazabilidad y estrategia

Este plan de tareas descompone el trabajo en 4 vertical slices ejecutables:
- Slice 1: Menú de Configuración y Perfil en Navbar (`UserMenuDropdown`).
- Slice 2: Vista limpia "Mis Materias" con `SubjectModal` y breadcrumbs.
- Slice 3: Rutas jerárquicas `/teacher/courses/[id]/parallels` y `/teacher/parallels/[id]/exams` con modales.
- Slice 4: Blindaje y aislamiento del portal estudiantil (`StudentPortalPage`).

## 2. Tareas detalladas

### T1.1 [IMPL] Implementar UserMenuDropdown y Refactorizar Navbar
**Status:** COMPLETED
**Depends on:** —
**Traceability:** PLAN-03, RF-03.1, RF-03.2, SC-03.1.1
**Files:** frontend/src/components/ui/UserMenuDropdown.tsx, frontend/src/components/ui/Navbar.tsx
**Objective:** Agrupar perfil, modo oscuro y cierre de sesión en un menú flotante con diseño CafeBlend.
**Work:** Crear componente `UserMenuDropdown` con avatar, información del usuario, switch integrado de tema oscuro, modal de perfil y botón de logout; sustituir el botón de salir aislado en `Navbar.tsx`.
**Done when:** El menú se despliega al hacer clic, permite alternar modo oscuro, abrir modal de perfil y cerrar sesión limpiando tokens.
**Verification:** PASS
**Command:** npx --prefix frontend tsc -p frontend/tsconfig.json --noEmit
**Exit code:** 0
**Evidence:** UserMenuDropdown.tsx implementado con avatar, información de usuario, alternador CafeBlend Warm Cream / Dark Espresso, modal accesible con tecla Escape y logout. Integrado en Navbar.tsx sustituyendo botón aislado. Verificado sin errores de tipos.

### T1.2 [IMPL] Rediseñar Vista Mis Materias y Crear SubjectModal
**Status:** COMPLETED
**Depends on:** T1.1
**Traceability:** PLAN-01, PLAN-02, RF-01.1, RF-01.2, SC-01.1.1, SC-01.2.1
**Files:** frontend/src/components/ui/SubjectModal.tsx, frontend/src/app/teacher/courses/page.tsx
**Objective:** Eliminar formularios fijos en pantalla y presentar el catálogo de asignaturas con modal accesible.
**Work:** Desarrollar `SubjectModal` para creación y edición; refactorizar `/teacher/courses` para mostrar tarjetas con código, nombre, conteo de aulas y botón primario "Gestionar Aulas".
**Done when:** La página `/teacher/courses` no muestra formularios inline y el botón "+ Nueva Materia" abre el modal reactivo.
**Verification:** PASS
**Command:** npx --prefix frontend tsc -p frontend/tsconfig.json --noEmit
**Exit code:** 0
**Evidence:** SubjectModal.tsx implementado con backdrop blur y accesibilidad Escape. courses/page.tsx refactorizado eliminando formularios estáticos inline, mostrando catálogo en cards limpias con botón '+ Nueva Materia' (modal) y botón 'Gestionar Aulas'.

### T1.3 [IMPL] Crear Vistas Jerárquicas de Aulas y Exámenes con Modales
**Status:** COMPLETED
**Depends on:** T1.2
**Traceability:** PLAN-01, PLAN-02, RF-02.1, RF-02.2, RF-02.3, SC-02.1.1, SC-02.2.1
**Files:** frontend/src/app/teacher/courses/[id]/parallels/page.tsx, frontend/src/app/teacher/parallels/[id]/exams/page.tsx, frontend/src/components/ui/ParallelModal.tsx, frontend/src/components/ui/Breadcrumbs.tsx
**Objective:** Habilitar la navegación fluida `Mis Materias -> Aulas de la Materia -> Exámenes del Aula`.
**Work:** Implementar componentes de página con Breadcrumbs contextuales y modales para aperturar aulas y registrar parciales.
**Done when:** El docente puede navegar entre los 4 niveles de la jerarquía conservando el contexto del aula y la materia.
**Verification:** PASS
**Command:** npx --prefix frontend tsc -p frontend/tsconfig.json --noEmit
**Exit code:** 0
**Evidence:** Rutas jerárquicas implementadas: /teacher/courses/[id]/parallels con ParallelModal y /teacher/parallels/[id]/exams con listado de parciales y exportación PDF. Breadcrumbs.tsx integrado en ambas vistas manteniendo contexto de navegación.

### T1.4 [IMPL] Blindar Aislamiento y Filtrado en el Portal Estudiantil
**Status:** COMPLETED
**Depends on:** T1.3
**Traceability:** PLAN-04, RF-04.1, RF-04.2, SC-04.1.1
**Files:** frontend/src/app/student/portal/page.tsx
**Objective:** Ocultar módulos administrativos/docentes al estudiante y mostrar únicamente sus exámenes publicados.
**Work:** Inyectar prop `userRole="STUDENT"` en el Navbar de la página estudiantil, ocultando menús ajenos y filtrando notas con `is_published=True`.
**Done when:** El estudiante ve una barra de navegación limpia sin módulos ajenos y solo consulta sus propias evaluaciones oficiales.
**Verification:** PASS
**Command:** npx --prefix frontend tsc -p frontend/tsconfig.json --noEmit
**Exit code:** 0
**Evidence:** Portal estudiantil /student/portal blindado pasando userRole="STUDENT" al Navbar para ocultar menús administrativos/docentes y filtrado estricto de evaluaciones con is_published=True.

### T1.5 [VERIFY] Compilación Global y Verificación de Flujos
**Status:** COMPLETED
**Depends on:** T1.4
**Traceability:** PLAN-01, PLAN-02, PLAN-03, PLAN-04, SC-01.1.1, SC-04.1.1
**Files:** frontend/package.json
**Objective:** Asegurar la integridad de tipos en TypeScript y ausencia de errores de compilación.
**Work:** Ejecutar el build de producción en Next.js para validar tipado estricto, enlaces y rutas estáticas.
**Done when:** El comando de build finaliza con código de salida 0 sin advertencias críticas.
**Verification:** PASS
**Command:** npm --prefix frontend run build
**Exit code:** 0
**Evidence:** Compilación global de producción con Next.js 14 exitosa. Las 10 rutas estáticas y dinámicas generadas y optimizadas sin advertencias ni errores.

## 3. Bitácora

- 2026-11-19: Plan de tareas inicializado para rediseño jerárquico docente y aislamiento estudiantil.
- 2026-11-19: Implementadas tareas T1.1 a T1.5 satisfactoriamente con build de producción verificado.
