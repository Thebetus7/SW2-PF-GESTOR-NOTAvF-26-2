# Specification: Rediseño de Flujo Docente, Configuración y Aislamiento Estudiantil

Status: APPROVED
Version: 1
Risk: estándar

---

## 1. Objetivo, contexto y alcance

### 1.1 Objetivo
Optimizar la experiencia de usuario (UX) del docente y del estudiante, aplicando principios de **Clean Code**, **Frontend Design** y **Web Design Guidelines**:
1. Desacoplar la vista monolítica del docente en un flujo jerárquico intuitivo de 4 niveles (`Mis Materias` -> `Aulas` -> `Exámenes` -> `Editor`).
2. Sustituir formularios estáticos fijos en pantalla por **Modales Contextuales Accesibles**.
3. Reemplazar el botón de salida simple por un **Menú Dropdown de Configuración** (Perfil, Modo Oscuro, Cerrar Sesión).
4. **Aislar de forma estricta el portal del estudiante**, impidiendo el acceso o visualización de módulos administrativos o docentes, limitando su vista a sus exámenes calificados y publicados.

### 1.2 Alcance
- **In Scope:**
  - Rediseño de `/teacher/courses` (Mis Materias) enfocado en catálogo y cards limpias.
  - Creación de rutas jerárquicas: `/teacher/courses/[subjectId]/parallels` y `/teacher/parallels/[parallelId]/exams`.
  - Componentes modales: `SubjectModal` (Crear/Editar Materia), `ParallelModal` (Crear/Editar Aula), `ExamModal` (Crear Parcial).
  - Rediseño de `Navbar.tsx` con menú dropdown flotante: Perfil (modal informativo), Switch Modo Oscuro/Claro integrado y Cerrar Sesión.
  - Aislamiento en `/student/portal` pasando `userRole="STUDENT"` al Navbar y restringiendo el listado a exámenes en estado `PUBLICADO` de los paralelos en que está inscrito.
  - Route guards en frontend para proteger rutas docentes y administrativas contra acceso de estudiantes.
- **Out of Scope:**
  - Cambios en el motor de IA de Django backend (mantiene sus endpoints existentes).
  - Modificación de modelos en base de datos PostgreSQL.

---

## 2. Actores y permisos

| Actor | Permisos Permitidos | Acciones Denegadas |
| :--- | :--- | :--- |
| **Docente** | CRUD de sus materias, paralelos, exámenes, edición de rúbricas y publicación de notas. | Acceso a gestión de profesores y subida de nómina general Excel (exclusivo de Admin). |
| **Estudiante** | Consulta de sus materias inscritas y exámenes calificados en estado `PUBLICADO`. | Creación/edición de materias, aulas, exámenes, calificaciones y acceso a `/teacher/*` o `/admin/*`. |

---

## 3. Datos funcionales e invariantes

### 3.1 Reglas de Negocio (RB)
- **RB-01 (Jerarquía Académica):** Un examen pertenece a un paralelo; un paralelo pertenece a una materia; una materia pertenece al docente titular.
- **RB-02 (Aislamiento de Rol Estudiantil):** Un estudiante bajo ninguna circunstancia puede ver enlaces o acceder a vistas de administración o docencia.
- **RB-03 (Exámenes Publicados):** El estudiante solo puede ver calificaciones y hojas escaneadas de exámenes con `is_published=True`.
- **RB-04 (Ergonomía de Modales):** Toda acción de creación o edición de entidades académicas debe realizarse mediante diálogo modal accesible con tecla `Escape` y backdrop blur.

---

## 4. Requisitos Funcionales EARS

- **RF-01.1 (Catálogo de Materias):** Cuando el docente accede a `/teacher/courses`, el sistema debe presentar la lista de sus asignaturas en tarjetas limpias sin formularios estáticos invasivos.
- **RF-01.2 (Modales de Materia):** Cuando el docente hace clic en "+ Nueva Materia" o "Editar", el sistema debe abrir el modal `SubjectModal` para registrar o actualizar código, nombre y descripción.
- **RF-02.1 (Aulas por Materia):** Cuando el docente selecciona una materia, el sistema debe navegar a `/teacher/courses/[subjectId]/parallels` mostrando sus aulas con breadcrumbs y el modal `ParallelModal` para aperturar nuevas aulas.
- **RF-02.2 (Exámenes por Aula):** Cuando el docente selecciona un aula, el sistema debe navegar a `/teacher/parallels/[parallelId]/exams` mostrando la lista de parciales y el botón para "+ Nuevo Examen".
- **RF-02.3 (Constructor de Examen):** Cuando el docente crea o edita un examen, el sistema debe conducirlo a `/teacher/exams/[examId]/builder` para definir preguntas, rúbricas de IA y puntajes.
- **RF-03.1 (Dropdown de Configuración):** Cuando cualquier usuario autenticado hace clic en el botón de su perfil en la barra de navegación, el sistema debe desplegar un menú con opciones: `Mi Perfil`, `Modo Oscuro` y `Cerrar Sesión`.
- **RF-03.2 (Modal de Perfil):** Cuando el usuario selecciona `Mi Perfil`, el sistema debe abrir un modal informativo con su nombre completo, rol, correo y matrícula.
- **RF-04.1 (Navbar Estudiantil Limpio):** Cuando un estudiante carga el sistema, el Navbar debe ocultar todos los enlaces docentes y de administración.
- **RF-04.2 (Restricción de Exámenes):** Cuando un estudiante entra al portal, el sistema debe listar únicamente sus exámenes evaluados y publicados por sus profesores.

---

## 5. Criterios de Aceptación y Escenarios

### SC-01.1.1 → RF-01.1
```gherkin
Dado que el docente inicia sesión en el sistema
Cuando accede a "Mis Materias"
Entonces visualiza la lista de sus asignaturas en cards sin formularios inline persistentes
Y cada card cuenta con el botón "Gestionar Aulas".
```

### SC-01.2.1 → RF-01.2
```gherkin
Dado que el docente se encuentra en "Mis Materias"
Cuando hace clic en "+ Nueva Materia"
Entonces se abre el modal "SubjectModal"
Y al guardar con éxito, la materia se incorpora al listado y el modal se cierra.
```

### SC-02.1.1 → RF-02.1
```gherkin
Dado que el docente selecciona "Gestionar Aulas" en una materia
Cuando carga la página "/teacher/courses/[subjectId]/parallels"
Entonces visualiza las aulas activas con Breadcrumbs navegables "Mis Materias > [Nombre Materia] > Aulas"
Y un botón para aperturar nueva aula vía modal.
```

### SC-02.2.1 → RF-02.2
```gherkin
Dado que el docente selecciona un aula
Cuando carga "/teacher/parallels/[parallelId]/exams"
Entonces visualiza los exámenes parciales registrados, el estado de publicación y el botón para crear un nuevo parcial.
```

### SC-03.1.1 → RF-03.1
```gherkin
Dado que un usuario se encuentra en cualquier vista con Navbar
Cuando hace clic en el botón de su perfil en la esquina superior derecha
Entonces se abre el menú desplegable con su información, opción "Mi Perfil", toggle de "Modo Oscuro" y "Cerrar Sesión".
```

### SC-04.1.1 → RF-04.1
```gherkin
Dado que un estudiante inicia sesión con su matrícula
Cuando accede a "/student/portal"
Entonces el Navbar no muestra enlaces a módulos docentes ni administrativos
Y en el cuerpo de la página únicamente figuran sus exámenes calificados en estado PUBLICADO.
```

---

## 6. Registro de Trazabilidad y Calidad

- **Trazabilidad:** RB-01 a RB-04, RF-01.1 a RF-04.2 $\longleftrightarrow$ SC-01.1.1 a SC-04.1.1.
