# 🎓 Gestor de Notas & Evaluaciones con Inteligencia Artificial

Plataforma integral para la gestión académica, generación de exámenes impresos con códigos QR, digitalización multicara vía aplicación móvil y calificación automatizada con **Google Gemini AI**.

---

## 🏗️ Arquitectura del Sistema

El proyecto está estructurado como un monorepo que integra tres aplicaciones principales:

```text
SW2-PF-GESTOR-NOTAvF-26-2/
├── backend/    → API REST en Django 5 + DRF + Google Gemini API Free Tier
├── frontend/   → Aplicación Web Next.js 14 + React 18 + Tailwind CSS (CafeBlend)
├── mobile/     → Aplicación Móvil Flutter (Escaneo de QR + Captura JPG)
└── docs/       → Especificaciones funcionales, planes de arquitectura y despliegue
```

---

## 📖 Guías Específicas de Cada Proyecto

Para consultar las instrucciones detalladas de configuración, dependencias y comandos de cada componente, visita sus respectivos manuales:

* 🧠 **[Backend (Django REST API)](./backend/README.md)**: Configuración con SQLite local o PostgreSQL, migraciones, superusuario, tests con `pytest` y catálogo de endpoints.
* 💻 **[Frontend (Next.js Web)](./frontend/README.md)**: Configuración con npm, variables de entorno, arquitectura App Router y paneles docente/administrador/estudiante.
* 📱 **[Mobile (Flutter App)](./mobile/README.md)**: Configuración en emuladores y dispositivos físicos, permisos de cámara, pruebas y conexión de red con el backend.

---

## ⚡ Inicio Rápido con Docker Compose (Backend + Frontend + Base de Datos)

Si dispones de Docker instalado, puedes iniciar todo el entorno web y de base de datos con un único comando:

### 1. Configurar variables de entorno globales
```bash
cp .env.example .env
```
*(Edita el archivo `.env` para colocar tu `GEMINI_API_KEY` de Google AI Studio si vas a procesar exámenes con IA).*

### 2. Construir e iniciar los servicios
```bash
docker compose up --build
```

### 3. Servicios disponibles:
* **Frontend Web:** [http://localhost:3000](http://localhost:3000)
* **Backend API REST:** [http://localhost:8000/api/v1/health/](http://localhost:8000/api/v1/health/)
* **Admin Django:** [http://localhost:8000/admin/](http://localhost:8000/admin/)
* **PostgreSQL:** Puerto `5432`

---

## 🧪 Verificación y Pruebas

* **Pruebas Backend:** `cd backend && pytest`
* **Pruebas Frontend:** `cd frontend && npm run lint`
* **Pruebas Mobile:** `cd mobile && flutter test`
