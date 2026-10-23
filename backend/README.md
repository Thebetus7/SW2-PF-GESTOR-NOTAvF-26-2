# 🧠 Gestor de Notas & Evaluaciones — Backend API

Backend del sistema desarrollado con **Django 5**, **Django REST Framework (DRF)** y el SDK oficial de **Google Gemini API**. Proporciona la lógica de negocio, autenticación JWT multi-rol, generación de exámenes en PDF con códigos QR, corrección automatizada con IA y cálculo ponderado de calificaciones.

---

## 📋 Requisitos Previos

* **Python 3.11+** instalado.
* **pip** (administrador de paquetes de Python).
* **Git** para control de versiones.
* *(Opcional)* **Docker** y **Docker Compose** si deseas ejecutar la base de datos PostgreSQL en contenedor.
* *(Opcional pero recomendado)* Clave de API de **Google Gemini** ([Google AI Studio](https://aistudio.google.com/)) para la corrección inteligente.

---

## 🚀 Cómo Levantar el Proyecto

Puedes levantar el backend de dos formas: **Modo Local Rápido (SQLite)** o **Modo Contenedor (Docker + PostgreSQL)**.

---

### Opción 1: Modo Local con SQLite (Recomendado para desarrollo ágil)

Este modo no requiere tener PostgreSQL instalado en tu sistema; utiliza SQLite localmente.

#### 1. Navegar a la carpeta del backend
```bash
cd backend
```

#### 2. Crear y activar un entorno virtual

* **En Windows (PowerShell):**
  ```powershell
  python -m venv venv
  .\venv\Scripts\Activate.ps1
  ```
  *(Si PowerShell bloquea scripts, ejecuta antes: `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass`)*

* **En Linux / macOS:**
  ```bash
  python3 -m venv venv
  source venv/bin/activate
  ```

#### 3. Instalar dependencias
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

#### 4. Configurar variables de entorno
Copia la plantilla de variables de entorno:
* En Windows (PowerShell):
  ```powershell
  Copy-Item .env.example .env
  ```
* En Linux / macOS:
  ```bash
  cp .env.example .env
  ```

Abre el archivo `.env` generado y verifica que `USE_SQLITE=True`:
```env
DJANGO_SECRET_KEY=clave-secreta-desarrollo-local-2026
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1,backend,web

# Activar SQLite para no depender de PostgreSQL local
USE_SQLITE=True

# API Key de Gemini (puedes dejar tu clave de Google AI Studio)
GEMINI_API_KEY=tu_api_key_aqui
```

#### 5. Aplicar migraciones
```bash
python manage.py migrate
```

#### 6. Crear un usuario administrador (Superuser)
```bash
python manage.py createsuperuser
```
*(Ingresa tu correo, nombre, rol y contraseña cuando el prompt te lo solicite)*.

#### 7. Iniciar el servidor de desarrollo
```bash
python manage.py runserver 0.0.0.0:8000
```

El servidor estará escuchando en:
* **API Health Check:** [http://127.0.0.1:8000/api/v1/health/](http://127.0.0.1:8000/api/v1/health/)
* **Panel de Administración Django:** [http://127.0.0.1:8000/admin/](http://127.0.0.1:8000/admin/)

---

### Opción 2: Modo Docker + PostgreSQL (Desde la raíz del repositorio)

Si deseas el entorno idéntico a producción con base de datos PostgreSQL:

#### 1. Asegúrate de estar en la raíz del proyecto
```bash
cd .. # Si estás dentro de backend/
```

#### 2. Configurar el archivo `.env` en la raíz
```bash
cp .env.example .env
```

#### 3. Levantar los contenedores de backend y base de datos
```bash
docker compose up -d postgres backend
```

#### 4. Ejecutar migraciones en el contenedor
```bash
docker compose exec backend python manage.py migrate
```

#### 5. Crear superusuario en el contenedor
```bash
docker compose exec backend python manage.py createsuperuser
```

#### 6. Ver logs en tiempo real
```bash
docker compose logs -f backend
```

---

## 🧪 Ejecución de Pruebas Automatizadas

El proyecto utiliza **pytest** y **pytest-django** para asegurar la calidad de los modelos, servicios de IA y endpoints:

```bash
# Estando dentro de la carpeta backend con el entorno virtual activo:
pytest

# O mediante Django Test Runner:
python manage.py test
```

---

## 📡 Catálogo de Endpoints Principales

| Prefijo de Ruta | Módulo | Descripción |
| :--- | :--- | :--- |
| `GET /api/v1/health/` | Health Check | Monitoreo del estado y versión de la API |
| `POST /api/v1/auth/login/` | Autenticación | Login con credenciales, retorna par de tokens JWT (`access` y `refresh`) |
| `POST /api/v1/auth/refresh/` | Autenticación | Refresco de token de acceso JWT |
| `GET /api/v1/auth/me/` | Autenticación | Perfil del usuario autenticado actual y su rol |
| `/api/v1/academics/` | Académico | Gestión de carreras, materias, periodos, grupos y matrículas |
| `/api/v1/exams/` | Exámenes | Creación de evaluaciones, preguntas y descarga de PDFs con códigos QR |
| `/api/v1/evaluations/` | Evaluaciones | Recepción de capturas JPG, pipeline de evaluación IA y auditoría docente |
| `/admin/` | Backoffice | Panel administrativo nativo de Django |

---

## 🤖 Integración con Google Gemini (Free Tier)

El motor de IA utiliza una cascada de modelos en caso de saturación o límite de cuota (Rate Limits):
1. `gemini-2.5-flash` *(Modelo principal de evaluación)*
2. `gemini-2.5-pro` *(Fallback con mayor capacidad analítica)*
3. `gemini-2.5-flash-lite` *(Fallback rápido)*
4. `gemini-3.8-flash` *(Modelo vigente de última generación)*

Asegúrate de agregar tu `GEMINI_API_KEY` en tu archivo `.env` para habilitar la corrección automática de hojas escaneadas.

---

## 📂 Estructura de Directorios

```text
backend/
├── apps/
│   ├── academics/       # Gestión de carreras, periodos, materias y grupos
│   ├── ai_engine/       # Cliente y servicios de Google Gemini API
│   ├── authentication/  # Modelo personalizado User, JWT y roles
│   ├── evaluations/     # Entregas de exámenes, corrección IA y notas
│   └── exams/           # Modelos de examen, preguntas y generador PDF QR
├── config/              # Configuración principal Django (settings, urls, wsgi)
├── media/               # Archivos multimedia generados (exámenes PDF, fotos escaneadas)
├── tests/               # Pruebas automatizadas de integración y unitarias
├── Dockerfile           # Imagen Docker optimizada (Python 3.11-slim)
├── manage.py            # CLI de Django
├── pytest.ini           # Configuración de pruebas pytest
└── requirements.txt     # Dependencias del proyecto
```
