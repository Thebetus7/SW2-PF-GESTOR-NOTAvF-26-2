# Specification: Landing Page Corporativa con Chatbot IA GroqCloud

Status: APPROVED
Version: 2
Risk: estándar

---

## 1. Objetivo, contexto y alcance

### 1.1 Objetivo
Desarrollar una aplicación web corporativa (**Landing Page**) ubicada en la raíz del repositorio (`landing/`), orientada a la difusión, presentación institucional y captación de usuarios para la plataforma **GestorNotas IA**. La web se servirá en la raíz `/` con un botón de llamada a la acción primario hacia el software principal (en `/app`) y un **asistente virtual conversacional interactivo (Chatbot flotante)** en la esquina inferior derecha alimentado por **GroqCloud**, capaz de responder con ultra baja latencia sobre los módulos, características pedagógicas, enlaces a WhatsApp (+591 77389330) y repositorio de GitHub.

### 1.2 Alcance
- **In Scope:**
  - Proyecto web corporativo modular en `landing/` construido con **Next.js 14 (App Router)**, **Tailwind CSS** y el sistema de diseño **CafeBlend** (Dark Espresso y Warm Cream).
  - Secciones institucionales:
    - **Header & Navbar:** Isotipo corporativo, enlaces de navegación y botón CTA *"Ingresar a la Plataforma"*.
    - **Hero Section:** Titular de alto impacto (*"Digitalización, Escaneo QR y Calificación de Exámenes con IA Multimodal"*), subtítulo, botones de acción y mockup/preview visual.
    - **Módulos del Sistema:** Tarjetas interactivas de Docentes (Mis Materias -> Aulas -> Exámenes), Estudiantes (Portal de Consulta y Desglose) y App Móvil Flutter (Escaneo QR y fotos JPG).
    - **Diferenciadores Técnicos:** Procesamiento multimodal, apoyo al trabajo de corrección, rúbricas pedagógicas y trazabilidad de notas.
    - **Footer Corporativo:** Enlace a WhatsApp directo (+591 77389330), enlace al repositorio de GitHub y acceso al software.
  - **Widget de Chatbot Flotante (Burbuja inferior derecha):**
    - Botón flotante animado para abrir/cerrar.
    - Modo Dual Inteligente:
      - Si `GROQ_API_KEY` está ausente: Opera con base de conocimiento contextual sobre los módulos, WhatsApp y GitHub.
      - Si `GROQ_API_KEY` está configurada: Realiza inferencia en tiempo real con el modelo `llama-3.3-70b-versatile` de GroqCloud mediante el Route Handler `/api/chat`.
    - Botones de acción rápida dentro del chat (WhatsApp, GitHub, Software).
  - **Infraestructura y Azure:**
    - Servicio `gestornotas_landing` en `docker-compose.prod.yml` enlazado con Nginx en el mismo servidor de Azure.
- **Out of Scope:**
  - Pasarela de pago o suscripción con tarjeta de crédito (contacto comercial directo vía WhatsApp).
  - Sistema de registro/login de usuarios dentro de la landing (reside exclusivamente en el software).

---

## 2. Actores y permisos

| Actor | Descripción | Permisos en la Landing |
| :--- | :--- | :--- |
| **Visitante / Docente / Director** | Usuario público que explora la web institucional en Internet. | Navegación por todas las secciones, interactuar con el chatbot de Groq, clic a enlaces de WhatsApp, GitHub y acceso a la plataforma. |
| **Administrador del Sistema** | Ingeniero encargado del despliegue y variables de entorno. | Configuración de variables de entorno (`GROQ_API_KEY`, `NEXT_PUBLIC_APP_URL`) y despliegue en Azure. |

---

## 3. Datos funcionales e invariantes

### 3.1 Invariantes y Reglas de Negocio (RB)
- **RB-01 (Contacto Oficial de WhatsApp):** El botón de WhatsApp debe redirigir a `https://wa.me/59177389330?text=Hola%2C%20deseo%20m%C3%A1s%20informaci%C3%B3n%20sobre%20GestorNotas%20IA`.
- **RB-02 (Seguridad de API Key):** `GROQ_API_KEY` nunca debe exponerse en el código del navegador cliente. Todas las llamadas hacia Groq pasan por el endpoint del servidor `/api/chat`.
- **RB-03 (Tolerancia a Modo Dual):** Si no hay `GROQ_API_KEY`, el chat responderá en modo local/fallback sin errores en consola ni interrupción del servicio.
- **RB-04 (Identidad Visual CafeBlend):** El proyecto implementará la paleta de colores oficial: Warm Cream (`#FDFBF7`) en modo claro y Dark Espresso (`#1A1412`) en modo oscuro, con tipografías y bordes redondeados consistentes.

### 3.2 Contrato del Endpoint `/api/chat`
- **Método:** `POST`
- **Cuerpo de Petición:**
  ```json
  {
    "messages": [
      { "role": "user", "content": "¿Cómo califica los exámenes la IA?" }
    ]
  }
  ```
- **Respuesta Exitosa (200 OK):**
  ```json
  {
    "response": "GestorNotas IA utiliza modelos de visión multimodal para transcribir la caligrafía manuscrita y compararla contra la rúbrica definida por el docente..."
  }
  ```

---

## 4. Flujos, estados y comportamiento observable

### 4.1 Flujo Principal: Navegación y Acceso al Software
1. El usuario accede a la raíz del dominio (`https://<dominio-azure>/`).
2. Visualiza la landing page con animación de entrada y diseño CafeBlend.
3. Al hacer clic en el botón *"Ingresar a la Plataforma"*, es redirigido a `/app` (o `/login` del Gestor de Notas).

### 4.2 Flujo del Chatbot Interactivo
1. El usuario visualiza la burbuja flotante en la esquina inferior derecha (`bottom: 1.5rem; right: 1.5rem`).
2. Al pulsarla, se despliega la ventana con cabecera: *"Asistente Virtual GestorNotas IA (Groq Powered)"*.
3. El asistente saluda cordialmente e incluye accesos rápidos:
   - 📱 WhatsApp (+591 77389330)
   - 🐙 Repositorio GitHub
   - 🚀 Probar Software
4. El usuario envía preguntas libres:
   - ¿Qué es la digitalización con QR?
   - ¿Cómo funciona el módulo docente?
   - ¿Qué ventajas ofrece frente a la calificación tradicional?
5. El backend consulta a GroqCloud con un System Prompt estructurado.
6. La respuesta se presenta progresivamente con soporte de Markdown.

---

## 5. Requisitos EARS

- **RF-01.1 (Hero y Redirección):** Cuando el visitante carga la landing, el sistema debe presentar en el Hero un botón prominente para ingresar a la plataforma (`/app`).
- **RF-01.2 (Showcase de Módulos):** El sistema debe exhibir secciones interactivas detallando el flujo de Mis Materias, Aulas, Exámenes con QR y la aplicación móvil Flutter.
- **RF-02.1 (Widget Flotante):** En todo momento de navegación, el sistema debe mantener visible en la esquina inferior derecha la burbuja del Chatbot colapsable.
- **RF-02.2 (Inferencia con GroqCloud):** Cuando `GROQ_API_KEY` esté configurada, el sistema debe procesar las consultas mediante la API de GroqCloud con el modelo `llama-3.3-70b-versatile`.
- **RF-02.3 (Fallback de Base de Conocimiento):** Cuando `GROQ_API_KEY` esté ausente, el sistema debe responder automáticamente utilizando la base de conocimiento local estructurada.
- **RF-02.4 (Enlaces de Conversión):** El sistema debe proveer enlaces funcionales a:
  - Repositorio GitHub.
  - Enlace a la Plataforma GestorNotas.
  - WhatsApp oficial (`+591 77389330`).

---

## 6. Criterios de aceptación y escenarios

### SC-01.1.1 → RF-01.1 (Redirección al Software Principal)
```gherkin
Dado que un visitante se encuentra en la landing page
Cuando hace clic en el botón "Ingresar a la Plataforma"
Entonces el navegador redirige a la URL del software principal ("/app" o "/login").
```

### SC-02.1.1 → RF-02.2 (Conversación Asistida por GroqCloud)
```gherkin
Dado que la variable GROQ_API_KEY está configurada en landing/.env
Cuando el visitante consulta "¿Qué módulos ofrece el sistema?"
Entonces el backend consulta a GroqCloud con el contexto del sistema
Y la respuesta detalla el flujo Docente, Estudiante y la App Móvil Flutter.
```

### SC-02.2.1 → RF-02.3 (Operación sin API Key)
```gherkin
Dado que GROQ_API_KEY está vacía en el entorno
Cuando el visitante envía cualquier pregunta al chatbot
Entonces el chatbot responde con información verídica del software, enlaces al código en GitHub y el contacto directo por WhatsApp.
```

### SC-02.3.1 → RF-02.4 (Enlace de WhatsApp)
```gherkin
Dado que el visitante solicita contactar por WhatsApp
Cuando hace clic en el enlace o botón de WhatsApp
Entonces se abre una nueva pestaña en "https://wa.me/59177389330?text=..." con el mensaje precargado.
```

---

## 7. Integraciones, efectos y requisitos de calidad

- **Rendimiento:** Carga inicial < 1.5s, bundle optimizado con Next.js standalone.
- **Seguridad:** Aislamiento de tokens en el servidor; límite de 500 caracteres por mensaje para mitigar ataques de inyección de prompt.
- **Compatibilidad:** 100% responsivo en smartphones, tablets y pantallas de escritorio.
- **Despliegue Azure:** Configuración en `docker-compose.prod.yml` bajo el servicio `gestornotas_landing` en puerto 3002, ruteado por Nginx.

---

## 8. Registro de inferencias y decisiones

| ID | Hallazgo / Requerimiento | Clasificación | Origen o Razonamiento | Decisión Aprobada |
| :---: | :--- | :---: | :--- | :--- |
| **INF-01** | Landing en la raíz | **HECHO** | Solicitud explícita del usuario | Carpeta `landing/` con proyecto Next.js 14. |
| **INF-02** | Botón para ir al software | **HECHO** | Solicitud explícita del usuario | Botón CTA en Header y Hero hacia `/app`. |
| **INF-03** | Mismo servidor Azure | **HECHO** | Solicitud explícita del usuario | Integrar servicio en Docker Compose y Nginx en Azure. |
| **INF-04** | Chatbot en burbuja inferior derecha | **HECHO** | Solicitud explícita del usuario | Widget flotante colapsable. |
| **INF-05** | Enlaces a GitHub, Software y WhatsApp (+591 77389330) | **HECHO** | Solicitud explícita del usuario | Tarjetas y botones dentro y fuera del chat. |
| **INF-06** | Uso de GroqCloud para inferencia | **HECHO** | Solicitud explícita del usuario | Route handler `/api/chat` consumiendo `groq-sdk`. |
| **INF-07** | Credenciales de Groq se suministrarán después | **HECHO** | Solicitud explícita del usuario | Modo Dual con fallback de base de conocimiento. |
| **INF-08** | Stack tecnológico | **PROPUESTA** | Selección asistida con convergencia | Next.js 14 + Tailwind + CafeBlend + groq-sdk. |
| **INF-09** | Enrutamiento en Azure | **PROPUESTA** | Selección asistida con convergencia | Landing en `/` y software principal en `/app`. |

---

## 9. Trazabilidad y pendientes

- **Pendientes:** Inyección de `GROQ_API_KEY` por parte del usuario tras la implementación.
- **Trazabilidad:** RF-01.1, RF-01.2, RF-02.1, RF-02.2, RF-02.3, RF-02.4 $\longleftrightarrow$ SC-01.1.1 a SC-02.3.1.


## 10. Evolución institucional del prototipo (2026-11-26)

- RF-03.1: Mostrar quiénes somos y la misión y visión facilitadas por el usuario.
- RF-03.2: Mostrar planes demostrativos Básico de $3 USD/mes e Institucional de $5 USD/mes con límites ficticios y aviso explícito de ausencia de cobros. La selección dirige a contacto; no hay suscripción ni pasarela de pago.
- RF-03.3: Publicar páginas de términos y privacidad para el prototipo y enlazarlas desde el pie, con enlace de privacidad en el formulario.
- RF-03.4: El formulario prepara un correo dirigido a oficina@edugrade.com y explica que debe enviarse desde el cliente del usuario.
- RF-03.5: Mantener la revisión docente sobre los resultados de IA y comunicar los proveedores que pueden intervenir.
- SC-03.1: El visitante accede a las secciones institucionales y planes mediante la navegación y llega a contacto desde los planes.
- SC-03.2: Los enlaces legales abren páginas independientes y permiten volver a la landing.
- SC-03.3: El formulario prepara un mailto al correo mostrado, sin afirmar que se ha enviado.
- Cambio autorizado por el usuario: contenido académico de ejemplo, sin cambios de datos, permisos, migraciones ni cobros. La cifra de ahorro carece de evidencia y deja de ser requisito. Los textos legales describen el prototipo y requieren revisión antes de uso con datos reales.
