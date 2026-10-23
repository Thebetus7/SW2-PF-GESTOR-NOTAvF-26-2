# 💻 Gestor de Notas & Evaluaciones — Frontend Web

Aplicación web cliente desarrollada con **Next.js 14 (App Router)**, **React 18**, **TypeScript** y **Tailwind CSS**. Implementa el sistema de diseño visual **CafeBlend** para ofrecer paneles interactivos orientados a docentes, administradores y estudiantes.

---

## 📋 Requisitos Previos

* **Node.js**: Versión 18.17+ o 20+ (LTS recomendada).
* **npm** (o el gestor de paquetes de tu preferencia).
* Tener el **Backend Django en ejecución** en `http://localhost:8000` para consumir la API REST.

---

## 🚀 Cómo Levantar el Proyecto

---

### Opción 1: Modo Local (Recomendado para desarrollo)

#### 1. Navegar a la carpeta del frontend
```bash
cd frontend
```

#### 2. Configurar variables de entorno
Copia el archivo de ejemplo para crear tu configuración local:
* **En Windows (PowerShell):**
  ```powershell
  Copy-Item .env.example .env.local
  ```
* **En Linux / macOS:**
  ```bash
  cp .env.example .env.local
  ```

El contenido de `.env.local` debe apuntar a la URL de tu API backend:
```env
# URL base de los endpoints REST del backend
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
PORT=3000
```

#### 3. Instalar dependencias
```bash
npm install
```

#### 4. Iniciar el servidor de desarrollo
```bash
npm run dev
```

Abre tu navegador en:
👉 **[http://localhost:3000](http://localhost:3000)**

---

### Opción 2: Modo Docker (Desde la raíz del repositorio)

Si prefieres ejecutar todo el stack unificado mediante Docker:

```bash
# Estando en la raíz del proyecto
docker compose up -d web
```

Para ver los logs del frontend en tiempo real:
```bash
docker compose logs -f web
```

---

## 📦 Scripts Disponibles

En el archivo `package.json` dispones de los siguientes comandos:

| Comando | Descripción |
| :--- | :--- |
| `npm run dev` | Inicia el servidor de desarrollo con Hot Module Replacement (HMR) en el puerto `3000`. |
| `npm run build` | Compila y optimiza la aplicación para el despliegue en producción. |
| `npm run start` | Levanta el servidor Node en producción sirviendo la compilación previa. |
| `npm run lint` | Ejecuta el análisis estático de código para verificar estilos y buenas prácticas. |

---

## 🧭 Estructura de Rutas y Módulos

El proyecto está organizado bajo la arquitectura **Next.js App Router**:

* `/` — Página de bienvenida (Landing institucional y acceso rápido).
* `/login` — Formulario de inicio de sesión seguro con tokens JWT (`access` y `refresh`).
* `/teacher` — Panel del Docente:
  * Lista de materias y grupos asignados.
  * Diseñador y generador de exámenes físicos en PDF con códigos QR únicos por estudiante.
  * Visor de resultados corregidos por IA y auditoría manual de puntajes.
  * Exportación de actas de notas a formato Excel (`.xlsx`).
* `/admin` — Panel Administrativo:
  * Gestión de usuarios, periodos lectivos y asignaturas.
* `/student` — Portal del Estudiante:
  * Consulta de notas, exámenes calificados y retroalimentación analítica.

---

## 📂 Estructura del Código Fuente

```text
frontend/
├── src/
│   ├── app/                 # Rutas y páginas del Next.js App Router
│   │   ├── admin/           # Páginas del panel de administración
│   │   ├── login/           # Inicio de sesión
│   │   ├── student/         # Vista del estudiante
│   │   ├── teacher/         # Flujo docente (exámenes, notas, auditoría)
│   │   ├── globals.css      # Tokens del Design System CafeBlend
│   │   ├── layout.tsx       # Layout raíz HTML y estilos globales
│   │   └── page.tsx         # Página de inicio (Landing)
│   ├── components/          # Componentes reutilizables (Navbar, Cards, Modales)
│   ├── lib/                 # Clientes HTTP (Fetch/Axios), interceptores y utilidades
│   └── types/               # Definiciones TypeScript de entidades y respuestas API
├── public/                  # Recursos estáticos (imágenes, iconos, tipografías)
├── Dockerfile               # Configuración Docker para desarrollo
├── Dockerfile.prod          # Multi-stage build optimizado para producción
├── next.config.mjs          # Configuración de Next.js
├── tailwind.config.js       # Paleta y extensiones de diseño Tailwind
└── tsconfig.json            # Configuración de TypeScript
```

---

## 🔗 Vinculación con el Backend

1. **Tokens JWT:** Cuando el usuario se autentica en `/login`, el token `access` se envía automáticamente en el encabezado `Authorization: Bearer <token>` de cada petición hacia el backend.
2. **CORS:** Si accedes desde una IP o dominio distinto a `localhost:3000`, asegúrate de agregarlo a la variable `CORS_ALLOWED_ORIGINS` en el backend.
