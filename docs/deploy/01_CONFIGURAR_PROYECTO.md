# 🚀 01. Configurar el Proyecto para Producción

[← Paso Anterior: 00_RESUMEN_GENERAL.md](./00_RESUMEN_GENERAL.md) | [↑ Índice General](./00_RESUMEN_GENERAL.md) | [Siguiente Paso: 02_CREAR_INFRAESTRUCTURA_GCP.md →](./02_CREAR_INFRAESTRUCTURA_GCP.md)

---

## 1. Visión de la Fase

En esta fase preparamos los artefactos de configuración del proyecto en tu computadora local antes de conectarte al servidor. Adaptaremos la compilación multicapa de Next.js, configuraremos el orquestador de Docker para producción y estructuraremos la plantilla de variables de entorno seguras sin exponer credenciales.

---

## 2. Pasos Estructurados de Configuración

### 🚀 Paso 1: Crear Dockerfile de Producción para Next.js

> [!NOTE]
> **Propósito:** Generar una imagen ligera multicapa que ejecute `next build` en una etapa previa y sirva únicamente los artefactos compilados (`.next/standalone` o runner de producción), reduciendo el tamaño de la imagen de 1.2 GB a menos de 180 MB y eliminando el hot-reload.
> **Contexto de Ejecución:** `[PC LOCAL]`
> **Ruta de Trabajo:** `frontend/Dockerfile.prod`

Crea el archivo `frontend/Dockerfile.prod` con la siguiente definición:

```dockerfile
# Etapa 1: Dependencias
FROM node:20-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json* ./
RUN npm install --frozen-lockfile || npm install

# Etapa 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Argumento para embeber la URL pública de la API durante la compilación
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NODE_ENV=production

RUN npm run build

# Etapa 3: Runner de Producción
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Crear usuario de sistema no-root para mayor seguridad
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

USER nextjs

EXPOSE 3000

CMD ["npm", "run", "start"]
```

> [!TIP]
> **Verificación Observable & Salida Esperada:**
> Comprueba que el archivo exista y esté formateado correctamente:
> ```bash
> ls -lh frontend/Dockerfile.prod
> ```
> *Salida esperada:* Archivo visible de aproximadamente 800 bytes a 1 KB.

> [!WARNING]
> **Solución de Fallos Frecuentes (Troubleshooting):**
> - **Síntoma:** Error `npm run build` falla por falta de memoria o tipos faltantes de TypeScript.
> - **Causa:** El compilador de Next.js verifica tipos y ESLint de manera estricta durante el build.
> - **Solución:** Ejecuta `npm run build` localmente en la carpeta `frontend/` para corregir advertencias de sintaxis o rutas relativas antes de construir en Docker.

---

### 🚀 Paso 2: Crear el Orquestador `docker-compose.prod.yml`

> [!NOTE]
> **Propósito:** Definir el stack de producción desacoplado del entorno de desarrollo: aislamos PostgreSQL en red interna (sin exponer puerto 5432 a Internet), vinculamos volúmenes nombrados para persistencia y asociamos puertos a `127.0.0.1` para que Nginx sea el único punto de acceso.
> **Contexto de Ejecución:** `[PC LOCAL]`
> **Ruta de Trabajo:** `./docker-compose.prod.yml`

Crea el archivo `docker-compose.prod.yml` en la raíz del repositorio:

```yaml
services:
  postgres:
    image: postgres:16-alpine
    container_name: gestornotas_postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${POSTGRES_DB:-gestornotas_db}
      POSTGRES_USER: ${POSTGRES_USER:-gestornotas_user}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - gestornotas_network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-gestornotas_user} -d ${POSTGRES_DB:-gestornotas_db}"]
      interval: 10s
      timeout: 5s
      retries: 5
    # Por seguridad, el puerto 5432 NO está expuesto al host

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: gestornotas_backend
    restart: unless-stopped
    command: >
      sh -c "python manage.py migrate --noinput &&
             python manage.py collectstatic --noinput &&
             python manage.py runserver 0.0.0.0:8000"
    volumes:
      - media_volume:/app/media
      - static_volume:/app/staticfiles
    ports:
      - "127.0.0.1:8000:8000"
    environment:
      DJANGO_SECRET_KEY: ${DJANGO_SECRET_KEY}
      DJANGO_DEBUG: "False"
      DJANGO_ALLOWED_HOSTS: ${DJANGO_ALLOWED_HOSTS}
      USE_SQLITE: "False"
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_HOST: postgres
      POSTGRES_PORT: 5432
      GEMINI_API_KEY: ${GEMINI_API_KEY}
      CORS_ALLOWED_ORIGINS: ${CORS_ALLOWED_ORIGINS}
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - gestornotas_network

  web:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
      args:
        NEXT_PUBLIC_API_URL: ${NEXT_PUBLIC_API_URL}
    container_name: gestornotas_frontend
    restart: unless-stopped
    ports:
      - "127.0.0.1:3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: ${NEXT_PUBLIC_API_URL}
      PORT: 3000
    depends_on:
      - backend
    networks:
      - gestornotas_network

volumes:
  postgres_data:
    driver: local
  media_volume:
    driver: local
  static_volume:
    driver: local

networks:
  gestornotas_network:
    driver: bridge
```

> [!TIP]
> **Verificación Observable & Salida Esperada:**
> Valida la sintaxis del archivo YAML con docker compose en local:
> ```bash
> docker compose -f docker-compose.prod.yml config
> ```
> *Salida esperada:* Salida limpia que imprime la estructura resuelta de servicios sin errores de indentación.

> [!WARNING]
> **Solución de Fallos Frecuentes (Troubleshooting):**
> - **Síntoma:** Error `variable is not set. Defaulting to a blank string`.
> - **Causa:** No se ha creado aún el archivo `.env` en la raíz local.
> - **Solución:** Esto es normal durante la prueba de sintaxis; en el Paso 3 creamos la plantilla y en el servidor creamos el `.env` definitivo.

---

### 🚀 Paso 3: Crear la Plantilla `.env.production.example`

> [!NOTE]
> **Propósito:** Ofrecer una guía exhaustiva de variables de entorno para producción, con explicaciones claras de seguridad y placeholders estándar para evitar filtrar claves privadas.
> **Contexto de Ejecución:** `[PC LOCAL]`
> **Ruta de Trabajo:** `./.env.production.example`

Crea el archivo `.env.production.example` con la totalidad de variables requeridas:

```bash
# ==============================================================================
# PLANTILLA DE VARIABLES DE ENTORNO DE PRODUCCIÓN (GOOGLE CLOUD COMPUTE ENGINE)
# ==============================================================================
# Copia este archivo a `.env` en el servidor remoto y asigna los valores reales.

# --- BASE DE DATOS POSTGRESQL (Aislada en red Docker) ---
POSTGRES_DB=gestornotas_prod_db
POSTGRES_USER=gestornotas_admin
# Contraseña de alta entropía (generada con: python -c "import secrets; print(secrets.token_hex(24))")
POSTGRES_PASSWORD=<TU_DB_PASSWORD_PRODUCCION>
POSTGRES_PORT=5432

# --- BACKEND DJANGO ---
# Clave criptográfica secreta de 50 caracteres (python -c "import secrets; print(secrets.token_urlsafe(50))")
DJANGO_SECRET_KEY=<TU_DJANGO_SECRET_KEY_PRODUCCION>
# OBLIGATORIO en producción: oculta páginas de depuración con trazas y variables
DJANGO_DEBUG=False
# Lista separada por comas de hosts permitidos (incluye localhost, tu IP estática de GCP y dominio si aplica)
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1,<TU_IP_PUBLICA>,backend,web

# Orígenes autorizados para llamadas AJAX desde el frontend Next.js hacia Django REST
CORS_ALLOWED_ORIGINS=http://<TU_IP_PUBLICA>,http://localhost:3000

# --- INTELIGENCIA ARTIFICIAL MULTIMODAL (GOOGLE GEMINI API) ---
# Clave API Free Tier obtenida desde Google AI Studio (https://aistudio.google.com/)
GEMINI_API_KEY=<TU_GEMINI_API_KEY>

# --- FRONTEND WEB (NEXT.JS) ---
# URL base pública de la API REST que consumirá el navegador web del usuario a través de Nginx
NEXT_PUBLIC_API_URL=http://<TU_IP_PUBLICA>/api/v1
```

> [!TIP]
> **Verificación Observable & Salida Esperada:**
> Comprueba que la plantilla esté presente en el árbol de trabajo:
> ```bash
> cat .env.production.example
> ```
> *Salida esperada:* Contenido completo sin valores sensibles prellenados.

---

### 🚀 Paso 4: Generar Claves Criptográficas Fuertes

> [!NOTE]
> **Propósito:** Generar valores con suficiente entropía para `DJANGO_SECRET_KEY` y `POSTGRES_PASSWORD` utilizando la librería estándar de Python en tu PC local.
> **Contexto de Ejecución:** `[PC LOCAL]`
> **Ruta de Trabajo:** Cualquier terminal

Ejecuta los generadores de entropía:

```bash
# Generar Django Secret Key (50+ caracteres seguros)
python -c "import secrets; print(secrets.token_urlsafe(50))"

# Generar Contraseña de Base de Datos PostgreSQL (24 bytes en hexadecimal)
python -c "import secrets; print(secrets.token_hex(24))"
```

> [!TIP]
> **Verificación Observable & Salida Esperada:**
> Se imprimirán dos cadenas alfanuméricas complejas en consola. Anótalas temporalmente en un bloc de notas seguro para introducirlas en el Paso 04 en el servidor.

---

### 🚀 Paso 5: Confirmar y Subir Archivos de Producción al Repositorio

> [!NOTE]
> **Propósito:** Asegurar que los artefactos (`Dockerfile.prod`, `docker-compose.prod.yml` y `.env.production.example`) estén en GitHub para poder descargarlos en la máquina virtual de GCP.
> **Contexto de Ejecución:** `[PC LOCAL]`
> **Ruta de Trabajo:** Raíz del proyecto

```bash
# 1. Verificar estado de Git
git status

# 2. Agregar los archivos recién creados
git add frontend/Dockerfile.prod docker-compose.prod.yml .env.production.example docs/deploy/

# 3. Confirmar commit
git commit -m "build(deploy): configurar artefactos y suite de despliegue para producción GCP"

# 4. Enviar cambios al repositorio remoto
git push origin main
```

> [!TIP]
> **Verificación Observable & Salida Esperada:**
> ```text
> To https://github.com/usuario/SW2-PF-GESTOR-NOTAvF-26-2.git
>    abcdef1..1234567  main -> main
> ```

---

## 3. Checklist de Cierre del Paso 01

- [ ] `frontend/Dockerfile.prod` creado y optimizado para Next.js en producción.
- [ ] `docker-compose.prod.yml` configurado con aislamiento de base de datos y puertos locales.
- [ ] `.env.production.example` documentado con placeholders seguros.
- [ ] Claves criptográficas generadas y resguardadas.
- [ ] Cambios confirmados y sincronizados en la rama principal de Git.

---

[← Paso Anterior: 00_RESUMEN_GENERAL.md](./00_RESUMEN_GENERAL.md) | [↑ Índice General](./00_RESUMEN_GENERAL.md) | [Siguiente Paso: 02_CREAR_INFRAESTRUCTURA_GCP.md →](./02_CREAR_INFRAESTRUCTURA_GCP.md)
