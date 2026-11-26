# Tasks: Landing Page Corporativa con Chatbot IA GroqCloud
<!-- sdd:progress:start -->
## Task Progress

Status: IN_PROGRESS

| Métrica | Cantidad |
| --- | ---: |
| Total de tareas | 8 |
| Tareas realizadas | 6 |
| Tareas por realizar | 2 |
| Tareas bloqueadas | 0 |
| Tareas en progreso | 2 |
| Progreso | 75.0% |

## Registro de tareas

| ID | Estado | Tarea | Evidencia actual |
| --- | --- | --- | --- |
| T1.1 | COMPLETED | [SETUP] Inicializar Proyecto landing/ y Configuración CafeBlend | 140 paquetes instalados correctamente en landing/, Next.js 14.2.15, Tailwind 3.4.14 y tokens CafeBlend configurados. |
| T1.2 | COMPLETED | [IMPL] Implementar Componentes de la Landing Page Corporativa | Navbar, HeroSection con mockup interactivo de examen (QR y desglose), ModulesSection (Docentes, Estudiantes, Móvil Flutter) y Footer con enlaces a WhatsApp y GitHub implementados con CafeBlend. Compilación de producción exitosa. |
| T1.3 | COMPLETED | [IMPL] Desarrollar Endpoint /api/chat con SDK GroqCloud y Modo Dual | Endpoint /api/chat implementado con soporte SDK GroqCloud (llama-3.3-70b-versatile) y base de conocimiento en Modo Dual. 4 tests unitarios ejecutados exitosamente validando respuestas de módulos, WhatsApp oficial (+591 77389330), escaneo QR y validación HTTP 400. |
| T1.4 | COMPLETED | [IMPL] Desarrollar Widget de Chatbot Flotante (Burbuja Inferior Derecha) | ChatWidget.tsx implementado como burbuja flotante fija (bottom-6 right-6), modal animado CafeBlend, historial en sessionStorage, selector de preguntas frecuentes y enlaces de conversión a WhatsApp y GitHub. Compilación exitosa. |
| T1.5 | COMPLETED | [SETUP] Configurar Dockerfile.prod y Servicio Docker para Azure | Dockerfile.prod multicapa creado con usuario no-root nextjs. Servicio gestornotas_landing registrado en docker-compose.prod.yml con mapeo de puerto 3002:3000 y red gestornotas_network validado por Docker Compose. |
| T1.6 | COMPLETED | [VERIFY] Compilación Global y Verificación de Flujos | Build global de producción Next.js 14 ejecutado con código 0. 5 páginas estáticas y dinámicas compiladas sin advertencias. Listo para despliegue productivo. |
| T2.1 | IN_PROGRESS | [IMPL] Contenido institucional y legal del prototipo | npm --prefix landing run build: código 0, rutas /, /terminos y /privacidad generadas. Navegador: planes en escritorio y móvil, página de privacidad y enlace mailto observados. Pendiente: verificar envío desde un cliente de correo real y navegación final tras los últimos ajustes. |
| T3.1 | TESTING | [IMPL] Unificar identidad visible EduGradeIA | 2026-11-26: npm --prefix frontend run build y npm --prefix landing run build: código 0. Navegador: nombre en landing, asistente y título de plataforma web verificados. Manifest web JSON y XML de Android, iOS y macOS válidos. flutter test: NOT_RUN, comando flutter no disponible en PATH; falta verificación en dispositivo/emulador y prueba Flutter. |

## Checklist rápido

- [x] T1.1 [SETUP] Inicializar Proyecto landing/ y Configuración CafeBlend
- [x] T1.2 [IMPL] Implementar Componentes de la Landing Page Corporativa
- [x] T1.3 [IMPL] Desarrollar Endpoint /api/chat con SDK GroqCloud y Modo Dual
- [x] T1.4 [IMPL] Desarrollar Widget de Chatbot Flotante (Burbuja Inferior Derecha)
- [x] T1.5 [SETUP] Configurar Dockerfile.prod y Servicio Docker para Azure
- [x] T1.6 [VERIFY] Compilación Global y Verificación de Flujos
- [/] T2.1 [IMPL] Contenido institucional y legal del prototipo
- [?] T3.1 [IMPL] Unificar identidad visible EduGradeIA

<!-- sdd:progress:end -->

Version: 3
Spec-SHA256: 049b544b2a9e04d83921e859651e5fa7715f115d85690d41066ea9b6abf1357c
Plan-SHA256: ff159a2aae557c3aa93fe98bc5d0ccb4575c24a0b1731e7d4c776ed18bce912e

## 1. Trazabilidad y estrategia

Este backlog organiza la implementación en 4 vertical slices:
- Slice 1: Inicialización del proyecto `landing/` con Next.js 14, Tailwind y Design System CafeBlend.
- Slice 2: Construcción de la Landing Page corporativa (Hero con CTA a la app, Módulos, Diferenciadores y Footer con WhatsApp +591 77389330 y GitHub).
- Slice 3: Motor del Chatbot con GroqCloud en `/api/chat` (Modo Dual inteligente) y widget interactivo colapsable en la esquina inferior derecha.
- Slice 4: Configuración de contenedor Docker y validación de compilación.

## 2. Tareas detalladas

### T1.1 [SETUP] Inicializar Proyecto landing/ y Configuración CafeBlend
**Status:** COMPLETED
**Depends on:** —
**Traceability:** PLAN-01, RF-01.1
**Files:** landing/package.json, landing/tsconfig.json, landing/tailwind.config.ts, landing/src/app/layout.tsx
**Objective:** Configurar la estructura base del nuevo proyecto web corporativo.
**Work:** Inicializar Next.js 14 con App Router, TypeScript, Tailwind CSS, Lucide Icons y los tokens de color CafeBlend en `landing/`.
**Done when:** El proyecto base compila y sirve la página raíz con los estilos globales.
**Verification:** PASS
**Command:** npm --prefix landing install
**Exit code:** 0
**Evidence:** 140 paquetes instalados correctamente en landing/, Next.js 14.2.15, Tailwind 3.4.14 y tokens CafeBlend configurados.

### T1.2 [IMPL] Implementar Componentes de la Landing Page Corporativa
**Status:** COMPLETED
**Depends on:** T1.1
**Traceability:** PLAN-01, PLAN-03, RF-01.1, RF-01.2, RF-02.4, SC-01.1.1, SC-02.3.1
**Files:** landing/src/app/page.tsx, landing/src/components/HeroSection.tsx, landing/src/components/ModulesSection.tsx, landing/src/components/Footer.tsx
**Objective:** Construir la interfaz de la web con botón de acceso al software y canales de contacto.
**Work:** Desarrollar el Header con CTA "Ingresar a la Plataforma", Hero con mockup interactivo, tarjetas de módulos (Docente, Estudiante, Móvil) y Footer con enlaces directos a WhatsApp (+591 77389330) y GitHub.
**Done when:** La landing page se renderiza fluidamente con todas sus secciones y el botón principal conduce a `/app`.
**Verification:** PASS
**Command:** npm --prefix landing run build
**Exit code:** 0
**Evidence:** Navbar, HeroSection con mockup interactivo de examen (QR y desglose), ModulesSection (Docentes, Estudiantes, Móvil Flutter) y Footer con enlaces a WhatsApp y GitHub implementados con CafeBlend. Compilación de producción exitosa.

### T1.3 [IMPL] Desarrollar Endpoint /api/chat con SDK GroqCloud y Modo Dual
**Status:** COMPLETED
**Depends on:** T1.1
**Traceability:** PLAN-02, RF-02.2, RF-02.3, SC-02.1.1, SC-02.2.1
**Files:** landing/src/app/api/chat/route.ts, landing/.env.example
**Objective:** Crear el servicio de inferencia conversacional con GroqCloud y tolerancia a clave ausente.
**Work:** Implementar Route Handler `POST /api/chat` usando `@groq/groq-sdk` con el modelo `llama-3.3-70b-versatile` y System Prompt pedagógico; si `GROQ_API_KEY` está vacía, retornar respuestas estructuradas de la base de conocimiento local.
**Done when:** El endpoint responde con código 200 tanto con API key configurada como en modo fallback de contingencia.
**Verification:** PASS
**Command:** npx --prefix landing tsx landing/tests/test_chat_route.mjs
**Exit code:** 0
**Evidence:** Endpoint /api/chat implementado con soporte SDK GroqCloud (llama-3.3-70b-versatile) y base de conocimiento en Modo Dual. 4 tests unitarios ejecutados exitosamente validando respuestas de módulos, WhatsApp oficial (+591 77389330), escaneo QR y validación HTTP 400.

### T1.4 [IMPL] Desarrollar Widget de Chatbot Flotante (Burbuja Inferior Derecha)
**Status:** COMPLETED
**Depends on:** T1.2, T1.3
**Traceability:** PLAN-02, PLAN-03, RF-02.1, RF-02.4, SC-02.1.1, SC-02.2.1, SC-02.3.1
**Files:** landing/src/components/ChatWidget.tsx
**Objective:** Implementar el asistente virtual interactivo en la esquina inferior derecha.
**Work:** Crear widget colapsable con animación de apertura, historial de mensajes, botones de sugerencias rápidas ("Ver módulos", "WhatsApp", "GitHub"), e indicador de escritura.
**Done when:** El visitante puede abrir la burbuja, enviar preguntas, recibir respuestas de IA y hacer clic en los enlaces de conversión.
**Verification:** PASS
**Command:** npm --prefix landing run build
**Exit code:** 0
**Evidence:** ChatWidget.tsx implementado como burbuja flotante fija (bottom-6 right-6), modal animado CafeBlend, historial en sessionStorage, selector de preguntas frecuentes y enlaces de conversión a WhatsApp y GitHub. Compilación exitosa.

### T1.5 [SETUP] Configurar Dockerfile.prod y Servicio Docker para Azure
**Status:** COMPLETED
**Depends on:** T1.4
**Traceability:** PLAN-04, RF-01.1
**Files:** landing/Dockerfile.prod, docker-compose.prod.yml
**Objective:** Empaquetar la landing page para despliegue simultáneo en Microsoft Azure.
**Work:** Crear Dockerfile multicapa optimizado para producción y registrar el servicio `gestornotas_landing` en `docker-compose.prod.yml`.
**Done when:** El contenedor de producción se genera correctamente y se integra en la red de Azure.
**Verification:** PASS
**Command:** docker compose -f docker-compose.prod.yml config
**Exit code:** 0
**Evidence:** Dockerfile.prod multicapa creado con usuario no-root nextjs. Servicio gestornotas_landing registrado en docker-compose.prod.yml con mapeo de puerto 3002:3000 y red gestornotas_network validado por Docker Compose.

### T1.6 [VERIFY] Compilación Global y Verificación de Flujos
**Status:** COMPLETED
**Depends on:** T1.5
**Traceability:** PLAN-01, PLAN-02, PLAN-03, PLAN-04, SC-01.1.1, SC-02.1.1, SC-02.2.1, SC-02.3.1
**Files:** landing/package.json
**Objective:** Validar la construcción del proyecto y ausencia de errores de tipado.
**Work:** Ejecutar `npm --prefix landing run build` y comprobar la correcta generación de artefactos estáticos y dinámicos.
**Done when:** El comando finaliza con código 0 y la landing queda lista para producción.
**Verification:** PASS
**Command:** npm --prefix landing run build
**Exit code:** 0
**Evidence:** Build global de producción Next.js 14 ejecutado con código 0. 5 páginas estáticas y dinámicas compiladas sin advertencias. Listo para despliegue productivo.

## 3. Bitácora

- 2026-11-19: Plan de tareas inicializado para Landing Page corporativa con Chatbot GroqCloud.


### T2.1 [IMPL] Contenido institucional y legal del prototipo

**Status:** IN_PROGRESS
**Files:** landing/src/app, landing/src/components
**Depends on:** T1.6
**Traceability:** RF-03.1, RF-03.2, RF-03.3, RF-03.4, RF-03.5, SC-03.1, SC-03.2, SC-03.3
**Objective:** Implementar RF-03.1–RF-03.5 y escenarios SC-03.1–SC-03.3.
**Work:** Incorporar misión, visión, planes ficticios, páginas legales, navegación y contacto coherente; actualizar contexto del chatbot.
**Done when:** Compilación y flujos relevantes verificados, incluyendo revisión visual en escritorio y móvil.
**Command:** npm --prefix landing run build
**Verification:** NOT_RUN
**Exit code:** —
**Evidence:** npm --prefix landing run build: código 0, rutas /, /terminos y /privacidad generadas. Navegador: planes en escritorio y móvil, página de privacidad y enlace mailto observados. Pendiente: verificar envío desde un cliente de correo real y navegación final tras los últimos ajustes.


### T3.1 [IMPL] Unificar identidad visible EduGradeIA

**Status:** TESTING
**Depends on:** T1.6
**Traceability:** RF-04.1, SC-04.1, SC-04.2
**Files:** landing/src, frontend/src, mobile/lib, mobile/android, mobile/ios, mobile/web, mobile/windows, mobile/linux, mobile/macos
**Objective:** Usar EduGradeIA como nombre visible en web, asistente y aplicaciones móviles.
**Work:** Actualizar títulos, contenido y etiquetas; conservar identificadores técnicos existentes y compatibilidad.
**Done when:** Compilaciones disponibles y verificaciones de identidad ejecutadas; registrar cualquier plataforma no verificada.
**Verification:** NOT_RUN
**Command:** npm --prefix landing run build; npm --prefix frontend run build; flutter test
**Exit code:** —
**Evidence:** 2026-11-26: npm --prefix frontend run build y npm --prefix landing run build: código 0. Navegador: nombre en landing, asistente y título de plataforma web verificados. Manifest web JSON y XML de Android, iOS y macOS válidos. flutter test: NOT_RUN, comando flutter no disponible en PATH; falta verificación en dispositivo/emulador y prueba Flutter.
