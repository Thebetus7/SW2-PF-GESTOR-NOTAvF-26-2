# 🚀 04. Desplegar y Verificar la Aplicación

[← Paso Anterior: 03_INSTALAR_HERRAMIENTAS.md](./03_INSTALAR_HERRAMIENTAS.md) | [↑ Índice General](./00_RESUMEN_GENERAL.md) | [Siguiente Paso: 05_ACTUALIZAR_PRODUCCION.md →](./05_ACTUALIZAR_PRODUCCION.md)

---

## 1. Visión de la Fase

En esta fase ejecutamos el primer despliegue real de punta a punta: clonamos el repositorio en el servidor, configuramos las variables de entorno de producción, compilamos las imágenes Docker optimizadas, aplicamos las migraciones de PostgreSQL, configuramos el Virtual Host de Nginx y realizamos la batería de pruebas de verificación física y troubleshooting.

---

## 2. Pasos Estructurados de Despliegue

### 🚀 Paso 1: Clonar el Repositorio en el Servidor

> [!NOTE]
> **Propósito:** Descargar el código fuente completo y los artefactos de despliegue configurados en el Paso 01 al directorio de inicio de tu usuario en la máquina virtual.
> **Contexto de Ejecución:** `[SSH / SERVIDOR]`
> **Ruta de Trabajo:** `/home/usuario`

```bash
# 1. Posicionarse en el directorio home del usuario
cd ~

# 2. Clonar el repositorio del proyecto
git clone https://github.com/Thebetus7/SW2-G17-SDD-26-2.git proyecto-gestor-notas

# 3. Ingresar al directorio del proyecto
cd proyecto-gestor-notas
```

> [!TIP]
> **Verificación Observable & Salida Esperada:**
> Comprueba que los archivos de producción estén presentes:
> ```bash
> ls -la docker-compose.prod.yml .env.production.example frontend/Dockerfile.prod
> ```
> *Salida esperada:* Se listan los tres archivos sin errores.

---

### 🚀 Paso 2: Crear el Archivo `.env` de Producción en el Servidor

> [!NOTE]
> **Propósito:** Instanciar el archivo `.env` definitivo con los secretos reales de PostgreSQL, Django Secret Key, Gemini API Key y la IP pública estática de Google Cloud obtenida en el Paso 02.
> **Contexto de Ejecución:** `[SSH / SERVIDOR]`
> **Ruta de Trabajo:** `~/proyecto-gestor-notas`

Copia la plantilla y edita las variables:

```bash
# Copiar plantilla
cp .env.production.example .env

# Editar con nano
nano .env
```

Configura los valores reales (reemplaza los `<PLACEHOLDERS>`):

```ini
# ==============================================================================
# GESTOR DE NOTAS - VARIABLES DE ENTORNO DE PRODUCCIÓN REALES
# ==============================================================================

# Base de Datos PostgreSQL
POSTGRES_DB=gestornotas_prod_db
POSTGRES_USER=gestornotas_admin
POSTGRES_PASSWORD=<TU_DB_PASSWORD_GENERADA_EN_PASO_01>
POSTGRES_PORT=5432

# Backend Django
DJANGO_SECRET_KEY=<TU_DJANGO_SECRET_KEY_GENERADA_EN_PASO_01>
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1,<TU_IP_PUBLICA_GCP>,backend,web
CORS_ALLOWED_ORIGINS=http://<TU_IP_PUBLICA_GCP>,http://localhost:3000

# Google Gemini API
GEMINI_API_KEY=<TU_GEMINI_API_KEY_DE_AI_STUDIO>

# Frontend Web Next.js (apuntando a Nginx en puerto 80)
NEXT_PUBLIC_API_URL=http://<TU_IP_PUBLICA_GCP>/api/v1
```

> [!TIP]
> **Guardar en Nano:** Presiona `Ctrl + O`, pulsa `Enter` para confirmar el nombre, y luego sal con `Ctrl + X`.

---

### 🚀 Paso 3: Construir y Levantar los Contenedores con Docker Compose

> [!NOTE]
> **Propósito:** Construir las imágenes de producción (compilando Next.js en `frontend/Dockerfile.prod` e instalando paquetes en `backend/Dockerfile`), descargar la imagen de PostgreSQL 16 Alpine y levantar los 3 servicios en segundo plano.
> **Contexto de Ejecución:** `[SSH / SERVIDOR]`
> **Ruta de Trabajo:** `~/proyecto-gestor-notas`

```bash
# Construir imágenes de producción e iniciar contenedores
docker compose -f docker-compose.prod.yml up -d --build
```

> [!TIP]
> **Verificación Observable & Salida Esperada:**
> Comprueba el estado de los contenedores una vez finalizado el build (tarda 1 a 3 minutos):
> ```bash
> docker compose -f docker-compose.prod.yml ps
> ```
> *Salida esperada:*
> ```text
> NAME                   IMAGE                          STATUS                    PORTS
> gestornotas_backend    proyecto-gestor-notas-backend  Up (healthy/running)     127.0.0.1:8000->8000/tcp
> gestornotas_frontend   proyecto-gestor-notas-web      Up (running)             127.0.0.1:3000->3000/tcp
> gestornotas_postgres   postgres:16-alpine             Up (healthy)             5432/tcp
> ```

---

### 🚀 Paso 4: Ejecutar Migraciones y Recolectar Archivos Estáticos

> [!NOTE]
> **Propósito:** Crear la estructura de tablas relacionales en PostgreSQL (usuarios, materias, paralelos, exámenes, evaluaciones y notas) y recolectar los estilos CSS y JavaScript del panel administrativo de Django en el volumen estático.
> **Contexto de Ejecución:** `[SSH / SERVIDOR]`
> **Ruta de Trabajo:** `~/proyecto-gestor-notas`

```bash
# 1. Aplicar migraciones pendientes
docker compose -f docker-compose.prod.yml exec backend python manage.py migrate --noinput

# 2. Recolectar estáticos para el panel de administración
docker compose -f docker-compose.prod.yml exec backend python manage.py collectstatic --noinput
```

> [!TIP]
> **Verificación Observable & Salida Esperada:**
> La consola debe confirmar las migraciones aplicadas:
> ```text
> Operations to perform:
>   Apply all migrations: admin, auth, contenttypes, evaluations, exams, sessions, users
> Running migrations:
>   Applying ... OK
> 135 static files copied to '/app/staticfiles'.
> ```

---

### 🚀 Paso 5: Crear Superusuario Administrador Inicial de Django

> [!NOTE]
> **Propósito:** Generar la cuenta administrativa principal institucional para poder acceder al panel de Django y a la plataforma web como Administrador.
> **Contexto de Ejecución:** `[SSH / SERVIDOR]`
> **Ruta de Trabajo:** `~/proyecto-gestor-notas`

```bash
# Crear superusuario interactivo
docker compose -f docker-compose.prod.yml exec -it backend python manage.py createsuperuser
```

*Introduce los datos solicitados:*
- **Username:** `admin` (o tu usuario institucional)
- **Email address:** `admin@institucion.edu`
- **Password:** `<TU_CONTRASEÑA_ADMIN_SEGURA>`
- **Password (again):** `<TU_CONTRASEÑA_ADMIN_SEGURA>`

> [!TIP]
> **Verificación Observable & Salida Esperada:**
> ```text
> Superuser created successfully.
> ```

---

### 🚀 Paso 6: Configurar y Habilitar Nginx Reverse Proxy

> [!NOTE]
> **Propósito:** Configurar el servidor web Nginx en el host para recibir peticiones en el puerto 80 y derivarlas eficientemente: la raíz `/` a Next.js (3000), `/api/` y `/admin/` a Django (8000), `/media/` a las fotos de exámenes, y aumentar el límite de subida a **50 MB** para fotos de alta resolución y archivos Excel.
> **Contexto de Ejecución:** `[SSH / SERVIDOR]`
> **Ruta de Trabajo:** `/etc/nginx/sites-available`

Crea la configuración del sitio:

```bash
sudo nano /etc/nginx/sites-available/gestornotas
```

Pega el siguiente bloque de configuración completo:

```nginx
server {
    listen 80;
    server_name <TU_IP_PUBLICA_GCP> _;

    # Límite de carga ampliado para fotos JPG de exámenes y planillas Excel
    client_max_body_size 50M;

    # Encabezados de proxy estándar para reenviar IP real del cliente
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;

    # 1. API REST Backend (Django)
    location /api/ {
        proxy_pass http://127.0.0.1:8000/api/;
        proxy_read_timeout 180s;
        proxy_connect_timeout 180s;
    }

    # 2. Panel Administrativo Django
    location /admin/ {
        proxy_pass http://127.0.0.1:8000/admin/;
    }

    # 3. Archivos multimedia (imágenes escaneadas de exámenes)
    location /media/ {
        proxy_pass http://127.0.0.1:8000/media/;
    }

    # 4. Archivos estáticos de Django Admin
    location /static/ {
        proxy_pass http://127.0.0.1:8000/static/;
    }

    # 5. Frontend Web Next.js (Páginas y componentes)
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

Activa el sitio y recarga Nginx:

```bash
# 1. Deshabilitar el sitio default
sudo rm -f /etc/nginx/sites-enabled/default

# 2. Crear enlace simbólico de activación
sudo ln -sf /etc/nginx/sites-available/gestornotas /etc/nginx/sites-enabled/

# 3. Probar sintaxis de Nginx
sudo nginx -t

# 4. Recargar el servicio Nginx
sudo systemctl reload nginx
```

> [!TIP]
> **Verificación Observable & Salida Esperada:**
> ```text
> nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
> nginx: configuration file /etc/nginx/nginx.conf test is successful
> ```

---

## 3. Batería de Pruebas de Verificación Física

Ejecuta estas comprobaciones para confirmar el estado 100% operativo del despliegue:

### Test 1: Comprobar Conectividad Interna de PostgreSQL
[SSH / SERVIDOR]
```bash
docker compose -f docker-compose.prod.yml exec postgres pg_isready -U gestornotas_admin -d gestornotas_prod_db
```
*Salida esperada:* `gestornotas_prod_db:5432 - accepting connections`

### Test 2: Comprobar Respuesta Local de Next.js
[SSH / SERVIDOR]
```bash
curl -s -I http://127.0.0.1:3000 | head -n 3
```
*Salida esperada:* Código HTTP `200 OK` o `304 Not Modified`

### Test 3: Comprobar Respuesta Local de Django API
[SSH / SERVIDOR]
```bash
curl -s -I http://127.0.0.1:8000/api/v1/ | head -n 3
```
*Salida esperada:* Código HTTP `200 OK`, `401 Unauthorized` o `404 Not Found` generado por Django REST Framework

### Test 4: Comprobar Nginx en Puerto 80
[SSH / SERVIDOR]
```bash
curl -s -I http://localhost | head -n 3
```
*Salida esperada:* Código HTTP `200 OK`

### Test 5: Verificación Externa desde el Navegador Web de tu PC
[PC LOCAL]
1. Abre tu navegador web e ingresa a: `http://<TU_IP_PUBLICA_GCP>/`
   * **Resultado esperado:** Carga la página de bienvenida / login del Gestor de Notas.
2. Ingresa a: `http://<TU_IP_PUBLICA_GCP>/admin`
   * **Resultado esperado:** Carga el panel de administración de Django. Inicia sesión con el superusuario creado en el Paso 5.

---

## 4. Troubleshooting Contextual de Fallos Frecuentes

### Fallo 1: Error 502 Bad Gateway al acceder a la IP
* **Síntoma:** Al abrir `http://<TU_IP_PUBLICA>` el navegador devuelve error 502 Bad Gateway.
* **Causa:** Nginx está corriendo pero no puede conectarse a los contenedores locales (puerto 3000 o 8000 caídos).
* **Solución:**
  1. Revisa el estado de los contenedores: `docker compose -f docker-compose.prod.yml ps`.
  2. Si alguno muestra estado `Exit 1`, inspecciona sus logs:
     ```bash
     docker compose -f docker-compose.prod.yml logs --tail=50 backend
     docker compose -f docker-compose.prod.yml logs --tail=50 web
     ```

### Fallo 2: Error 413 Request Entity Too Large al subir fotos de exámenes
* **Síntoma:** La subida de imágenes JPG de pruebas manuscritas o archivos Excel falla con error 413.
* **Causa:** Nginx tiene configurado por defecto un límite estricto de 1 MB por petición.
* **Solución:** Comprueba que la línea `client_max_body_size 50M;` esté dentro del bloque `server` en `/etc/nginx/sites-available/gestornotas` y ejecuta `sudo systemctl reload nginx`.

### Fallo 3: Error de CORS o DisallowedHost en llamadas API
* **Síntoma:** La página web carga pero no puede listar materias o estudiantes (error 400 Bad Request en la consola del navegador).
* **Causa:** La IP pública estática de Google Cloud no está agregada a `DJANGO_ALLOWED_HOSTS` o `CORS_ALLOWED_ORIGINS` en el `.env`.
* **Solución:** Edita `.env`, añade tu IP pública exacta a ambas variables y reinicia el backend:
  ```bash
  docker compose -f docker-compose.prod.yml restart backend
  ```

### Fallo 4: Fallo de Conexión a Base de Datos en el Backend (`Connection refused`)
* **Síntoma:** El backend falla con mensaje `django.db.utils.OperationalError: could not connect to server`.
* **Causa:** El contenedor de PostgreSQL aún no ha completado su inicialización inicial o las contraseñas no coinciden.
* **Solución:** Revisa los logs de postgres con `docker compose -f docker-compose.prod.yml logs postgres` y verifica que `POSTGRES_PASSWORD` en `.env` sea idéntico para el servicio `postgres` y `backend`.

### Fallo 5: Error 429 Too Many Requests de Gemini API
* **Síntoma:** La calificación con IA devuelve error de cuota o rate limit.
* **Causa:** Se superaron las 15 peticiones por minuto del Free Tier de Google AI Studio.
* **Solución:** El backend implementa un mecanismo de reintento exponencial (*Exponential Backoff*). Espera 60 segundos antes de enviar un nuevo lote de exámenes.

---

## 5. Checklist de Cierre del Paso 04

- [ ] Repositorio clonado en `~/proyecto-gestor-notas`.
- [ ] Archivo `.env` configurado con IP pública y secretos de producción.
- [ ] 3 contenedores (`gestornotas_backend`, `gestornotas_frontend`, `gestornotas_postgres`) en estado `Up`.
- [ ] Migraciones de Django aplicadas exitosamente en PostgreSQL.
- [ ] Superusuario administrador creado y probado.
- [ ] Nginx configurado con límite de 50MB y recargado.
- [ ] Batería de 5 pruebas físicas superada con código HTTP 200.

---

[← Paso Anterior: 03_INSTALAR_HERRAMIENTAS.md](./03_INSTALAR_HERRAMIENTAS.md) | [↑ Índice General](./00_RESUMEN_GENERAL.md) | [Siguiente Paso: 05_ACTUALIZAR_PRODUCCION.md →](./05_ACTUALIZAR_PRODUCCION.md)
