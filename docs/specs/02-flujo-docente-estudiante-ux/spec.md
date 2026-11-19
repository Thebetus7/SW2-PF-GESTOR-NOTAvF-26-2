# Especificación de Requerimiento (Spec): Rediseño de Flujo Docente, Configuración y Aislamiento Estudiantil

**Feature Code:** `02-flujo-docente-estudiante-ux`  
**Estado:** `APPROVED` (Alineado vía `/grill-me`)  
**Fecha:** 2026-11-19  
**Design System:** CafeBlend (Warm Cream / Dark Espresso)  

---

## 1. Visión y Objetivos

Optimizar la experiencia de usuario (UX) del docente y del estudiante, aplicando principios de **Clean Code**, **Frontend Design** y **Web Design Guidelines**:
1. Desacoplar la vista monolítica del docente en un flujo jerárquico intuitivo de 4 niveles (`Mis Materias` -> `Aulas` -> `Exámenes` -> `Editor`).
2. Sustituir formularios estáticos fijos en pantalla por **Modales Contextuales Accesibles**.
3. Reemplazar el botón de salida simple por un **Menú Dropdown de Configuración** (Perfil, Modo Oscuro, Cerrar Sesión).
4. **Aislar de forma estricta el portal del estudiante**, impidiendo el acceso o visualización de módulos administrativos o docentes, limitando su vista a sus exámenes calificados y publicados.

---

## 2. Requerimientos Funcionales (RF)

### RF-01: Módulo "Mis Materias" y Separación de Responsabilidades
- **RF-01.1:** La ruta `/teacher/courses` se convertirá en una vista limpia de catálogo de materias dictadas por el profesor.
- **RF-01.2:** La creación y edición de materias se gestionará exclusivamente a través de modales (`SubjectModal`), eliminando los formularios inline estáticos.
- **RF-01.3:** Cada tarjeta de materia expondrá el botón primario `[Gestionar Aulas / Paralelos]` que navegará a la ruta `/teacher/courses/[subjectId]/parallels`.

### RF-02: Flujo Jerárquico de 4 Niveles del Docente
- **Nivel 1 (`/teacher/courses`):** Mis Materias (Catálogo + Modal `Nueva Materia`).
- **Nivel 2 (`/teacher/courses/[subjectId]/parallels`):** Aulas/Paralelos de la materia seleccionada (Grid de Aulas + Modal `Nueva Aula` + enlace a estudiantes inscritos).
- **Nivel 3 (`/teacher/parallels/[parallelId]/exams`):** Exámenes del Aula (Lista de parciales + Modal `Nuevo Examen` + Descarga PDF Oficial con QR + Estado de Publicación).
- **Nivel 4 (`/teacher/exams/[examId]/builder`):** Editor y Constructor de Examen (Formulario reactivo de preguntas, opciones, V/F, rúbricas de IA y balanceo de 100 puntos).
- **RF-02.1:** Cada nivel contará con una barra de navegación tipo **Breadcrumbs** accesible y contextual.

### RF-03: Botón de Configuración y Menú de Usuario
- **RF-03.1:** En `Navbar.tsx`, el botón aislado de "Salir" y el toggle independiente se unifican en un botón interactivo de usuario/configuración.
- **RF-03.2:** El botón desplegará un menú flotante accesible (Dropdown) con:
  - Encabezado con Nombre, Correo y Rol del usuario.
  - Opción `Mi Perfil` (apertura de modal con información de la cuenta).
  - Interruptor `Modo Oscuro / Claro` (con tokens de color CafeBlend).
  - Opción `Cerrar Sesión` (limpieza de `localStorage` y redirección a `/login`).
- **RF-03.3:** El menú debe cerrarse al hacer clic en el exterior o al pulsar la tecla `Escape`.

### RF-04: Aislamiento Estricto del Portal del Estudiante
- **RF-04.1:** Si el usuario autenticado tiene el rol `STUDENT`:
  - El `Navbar` no mostrará ningún enlace a rutas de gestión docente o administrativa (`/admin/*`, `/teacher/*`).
  - Solo se mostrará el logo `GestorNotas IA` y el botón de Configuración.
- **RF-04.2:** En `/student/portal`, el estudiante solo verá los exámenes evaluados que pertenezcan a aulas en las que está inscrito (`StudentEnrollment`) y que tengan el estado `PUBLICADO` (`is_published=True`).
- **RF-04.3:** Cada examen listado dispondrá del botón `[Ver Corrección y Hoja Escaneada]`, abriendo el visor interactivo de sus páginas manuscritas (JPG) con la retroalimentación de la IA y el desglose de puntajes.
- **RF-04.4:** Protección de rutas mediante Route Guard: si un estudiante navega manualmente a rutas protegidas de docente/admin, será redirigido inmediatamente a `/student/portal`.

---

## 3. Matriz de Trazabilidad y Criterios de Aceptación (Gherkin)

### Escenario 1: Navegación del Docente por el Flujo Jerárquico
```gherkin
Dado que el docente inicia sesión en el sistema
Cuando accede a "Mis Materias"
Entonces visualiza la lista de sus asignaturas sin formularios estáticos invasivos
Y al hacer clic en "Gestionar Aulas" de una materia
Es redirigido a "/teacher/courses/[subjectId]/parallels" con Breadcrumbs claros
Y al seleccionar un aula accede a "/teacher/parallels/[parallelId]/exams" para administrar sus exámenes parciales.
```

### Escenario 2: Creación de Materia y Aula mediante Modales
```gherkin
Dado que el docente se encuentra en "Mis Materias"
Cuando hace clic en "+ Nueva Materia"
Entonces se abre un modal con campos "Código", "Nombre" y "Descripción"
Y al guardar con éxito, la materia se agrega a la lista y el modal se cierra.
```

### Escenario 3: Dropdown de Configuración de Usuario
```gherkin
Dado que un usuario (docente o estudiante) está en cualquier vista con Navbar
Cuando hace clic en el botón de su perfil/configuración
Entonces se despliega el menú con su información, botón de "Mi Perfil", toggle de "Modo Oscuro" y "Cerrar Sesión"
Y al presionar fuera del menú, este se cierra de forma accesible.
```

### Escenario 4: Restricción del Estudiante a sus Propios Exámenes
```gherkin
Dado que un estudiante inicia sesión con su matrícula o credenciales
Cuando carga la aplicación
Entonces es conducido exclusivamente a "/student/portal"
Y en la barra de navegación no existe ningún enlace a módulos de profesores o administración
Y en el cuerpo de la página únicamente figuran los exámenes que sus profesores han publicado para su paralelo.
```
