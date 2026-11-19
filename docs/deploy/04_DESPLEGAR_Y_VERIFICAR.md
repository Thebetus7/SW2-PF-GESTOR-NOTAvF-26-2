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
git clone https://github.com/Thebetus7/SW2-PF-GESTOR-NOTAvF-26-2.git proyecto-gestor-notas

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
> **Propósito:** Instanciar el archivo `.env` definitivo con los secretos reales de PostgreSQL, Django Secret Key, Gemini API Key y la IP pública o nombre FQDN de Azure obtenidos en el Paso 02.
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
# GESTOR DE NOTAS - VARIABLES DE ENTORNO DE PRODUCCIÓN REALES (AZURE)
# ==============================================================================

# Base de Datos PostgreSQL
POSTGRES_DB=gestornotas_prod_db
POSTGRES_USER=gestornotas_admin
POSTGRES_PASSWORD=<TU_DB_PASSWORD_GENERADA_EN_PASO_01>
POSTGRES_PORT=5432

# Backend Django
DJANGO_SECRET_KEY=<TU_DJANGO_SECRET_KEY_GENERADA_EN_PASO_01>
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1,<TU_IP_PUBLICA_AZURE>,<TU_FQDN_AZURE>,backend,web
CORS_ALLOWED_ORIGINS=http://<TU_IP_PUBLICA_AZURE>,http://<TU_FQDN_AZURE>,https://<TU_FQDN_AZURE>,http://localhost:3000

# Google Gemini API
GEMINI_API_KEY=<TU_GEMINI_API_KEY_DE_AI_STUDIO>

# Frontend Web Next.js (apuntando a Nginx en puerto 80 / 443)
NEXT_PUBLIC_API_URL=http://<TU_IP_PUBLICA_AZURE>/api/v1
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
> gestornotas_landing    proyecto-gestor-notas-landing  Up (running)             127.0.0.1:3002->3000/tcp
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

### 🚀 Paso 5.1: Poblar Datos Demo con Exámenes y Componentes Listos

> [!NOTE]
> **Propósito:** Sembrar en producción las materias, aulas y los 2 exámenes completos predefinidos con sus componentes de rúbrica para el docente demo, permitiendo realizar pruebas inmediatas de escaneo móvil y visualización web sin requerir carga manual inicial.
> **Contexto de Ejecución:** `[SSH / SERVIDOR]`
> **Ruta de Trabajo:** `~/proyecto-gestor-notas`

```bash
# Sembrar datos demo pedagógicos
docker compose -f docker-compose.prod.yml exec backend python manage.py seed_demo_data
```

> [!TIP]
> **Verificación Observable & Salida Esperada:**
> ```text
> Iniciando sembrado de datos demo para evaluaciones...
> Docente listo: profesor.demo@evaluacion.edu.bo
> Estudiante listo: EST-2026-001 - Juan Carlos Pérez Demo
> Estudiante listo: EST-2026-002 - María Gómez Quispe
> Examen 1 listo con 2 componentes: Primer Examen Parcial (Cálculo I - Aula A)
> Examen 2 listo con 2 componentes: Examen Diagnóstico de Álgebra Lineal (Álgebra Lineal - Aula B)
> [OK] Datos demo creados exitosamente.
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
    server_name 20.51.189.52 <TU_IP_PUBLICA_AZURE> <TU_FQDN_AZURE> _;

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

    # 5. Plataforma Académica Web Next.js (Sistema de Evaluación)
    location /app/ {
        proxy_pass http://127.0.0.1:3000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # 6. Landing Page Comercial en la URL principal (http://20.51.189.52/)
    location / {
        proxy_pass http://127.0.0.1:3002;
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

### 🚀 Paso 7: Habilitar Certificado SSL/TLS Gratuito con Let's Encrypt (Certbot)

> [!NOTE]
> **Propósito:** Cifrar todo el tráfico web con HTTPS (puerto 443) y configurar la renovación automática utilizando el FQDN de Azure (`<DNS_LABEL>.eastus.cloudapp.azure.com`) o tu dominio propio.
> **Contexto de Ejecución:** `[SSH / SERVIDOR]`

```bash
# 1. Instalar Certbot y el plugin de Nginx
sudo apt install -y certbot python3-certbot-nginx

# 2. Solicitar e instalar el certificado SSL automáticamente en Nginx
sudo certbot --nginx -d <TU_FQDN_AZURE_O_DOMINIO> --non-interactive --agree-tos -m admin@institucion.edu --redirect

# 3. Probar la renovación automática programada
sudo certbot renew --dry-run
```

> [!TIP]
> **Verificación Observable & Salida Esperada:**
> Certbot confirmará:
> ```text
> Successfully received certificate.
> Certificate is saved at: /etc/letsencrypt/live/.../fullchain.pem
> Key is saved at:         /etc/letsencrypt/live/.../privkey.pem
> Congratulations! You have successfully enabled HTTPS.
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

### Test 4: Comprobar Nginx en Puerto 80 (Landing Page en Raíz)
[SSH / SERVIDOR]
```bash
curl -s -I http://localhost | head -n 3
```
*Salida esperada:* Código HTTP `200 OK` (sirviendo la Landing Page comercial desde el puerto 3002).

### Test 4.1: Comprobar Contenedor de la Landing Page
[SSH / SERVIDOR]
```bash
curl -s -I http://127.0.0.1:3002 | head -n 3
```
*Salida esperada:* Código HTTP `200 OK`.

### Test 5: Verificación Externa desde el Navegador Web de tu PC
[PC LOCAL]
1. Abre tu navegador web e ingresa a: `http://20.51.189.52/` (o con tu FQDN de Azure)
   * **Resultado esperado:** Carga la **Landing Page comercial** en la raíz directa, con diseño CafeBlend y el botón "Ingresar a la Plataforma".
2. Pulsa en **"Ingresar a la Plataforma"** (o navega a `http://20.51.189.52/app/login` / `http://20.51.189.52:3000/login`):
   * **Resultado esperado:** Carga la **Plataforma Académica Web Next.js** para iniciar sesión como Docente, Estudiante o Administrador.
3. Ingresa a: `http://20.51.189.52/admin`
   * **Resultado esperado:** Carga el panel de administración de Django. Inicia sesión con el superusuario creado en el Paso 5.

### Test 6: Verificación de Conexión de la App Móvil Flutter con el Servidor Cloud
[PC LOCAL / EMULADOR / DISPOSITIVO FÍSICO]
1. La aplicación móvil Flutter se conecta al servidor en la nube a través de su cliente HTTP (`mobile/lib/core/network/api_client.dart`):
   * **URL Base de Producción:** `http://20.51.189.52/api/v1`
2. **Arquitectura Segura de Inferencia:** La app móvil **NO** almacena ni requiere la clave de Google Gemini. La app envía las fotografías JPG al endpoint `/api/v1/evaluaciones/submit/`, y es el backend Django en Azure quien realiza de forma segura la llamada multimodal a Gemini, aplicando la cascada de modelos y retornando la calificación estructurada.

---

## 4. Troubleshooting Contextual de Fallos Frecuentes

### Fallo 1: Error 502 Bad Gateway al acceder a la IP
* **Síntoma:** Al abrir la URL el navegador devuelve error 502 Bad Gateway.
* **Causa:** Nginx está corriendo pero no puede conectarse a los contenedores locales (puertos 3000, 3002 u 8000 caídos).
* **Solución:**
  1. Revisa el estado de los contenedores: `docker compose -f docker-compose.prod.yml ps`.
  2. Si alguno muestra estado `Exit 1`, inspecciona sus logs:
     ```bash
     docker compose -f docker-compose.prod.yml logs --tail=50 backend
     docker compose -f docker-compose.prod.yml logs --tail=50 web
     docker compose -f docker-compose.prod.yml logs --tail=50 landing
     ```

### Fallo 2: Error 413 Request Entity Too Large al subir fotos de exámenes
* **Síntoma:** La subida de imágenes JPG de pruebas manuscritas o archivos Excel falla con error 413.
* **Causa:** Nginx tiene configurado por defecto un límite estricto de 1 MB por petición.
* **Solución:** Comprueba que la línea `client_max_body_size 50M;` esté dentro del bloque `server` en `/etc/nginx/sites-available/gestornotas` y ejecuta `sudo systemctl reload nginx`.

### Fallo 3: Error de CORS o DisallowedHost en llamadas API
* **Síntoma:** La página web carga pero no puede listar materias o estudiantes (error 400 Bad Request en la consola del navegador).
* **Causa:** La IP pública o FQDN de Azure no están agregados a `DJANGO_ALLOWED_HOSTS` o `CORS_ALLOWED_ORIGINS` en el `.env`.
* **Solución:** Edita `.env`, añade tu IP pública (`20.51.189.52`) y FQDN de Azure a ambas variables y reinicia el backend:
  ```bash
  docker compose -f docker-compose.prod.yml restart backend
  ```

### Fallo 4: Fallo de Conexión a Base de Datos en el Backend (`Connection refused`)
* **Síntoma:** El backend falla con mensaje `django.db.utils.OperationalError: could not connect to server`.
* **Causa:** El contenedor de PostgreSQL aún no ha completado su inicialización inicial o las contraseñas no coinciden.
* **Solución:** Revisa los logs de postgres con `docker compose -f docker-compose.prod.yml logs postgres` y verifica que `POSTGRES_PASSWORD` en `.env` sea idéntico para el servicio `postgres` y `backend`.

### Fallo 5: Saturación de Cuota de Gemini API (HTTP 429) y Pausa en la App Móvil
* **Síntoma:** El análisis devuelve HTTP 429 (Too Many Requests / Quota Exceeded) en la capa gratuita.
* **Causa:** Se superó temporalmente el límite por minuto de la API gratuita de Gemini.
* **Solución:**
  1. En el backend, el pipeline de resiliencia degrada a `REVISION_DOCENTE` guardando el texto OCR en el borrador (`ESTUDIANTE_BORRADOR`).
  2. En la app móvil, la interfaz muestra el banner interactivo: `"IA saturada, reintentando análisis... Intento #X"`.
  3. El docente puede pulsar **"Pausar Análisis"** para detener los reintentos manteniendo las fotos capturadas intactas, y pulsar **"Reintentar Ahora"** cuando la cuota se haya restablecido sin repetir la sesión de escaneo.

### Fallo 6: Error `COPY --from=builder /app/public ./public: not found` al construir Docker Web
* **Síntoma:** Al ejecutar `docker compose build web`, el proceso se cancela con código de error en la instrucción COPY de la carpeta public.
* **Causa:** La carpeta `frontend/public` estaba vacía y no fue incluida por Git en el clon del repositorio en el servidor.
* **Solución:** Se incluyó el archivo `frontend/public/.gitkeep` en el repositorio y la instrucción `RUN mkdir -p /app/public` en el `Dockerfile.prod` de Next.js. Si persiste en el servidor, ejecuta:
  ```bash
  mkdir -p frontend/public
  docker compose -f docker-compose.prod.yml build web
  ```

---

## 5. Checklist de Cierre del Paso 04

- [ ] Repositorio clonado en `~/proyecto-gestor-notas`.
- [ ] Archivo `.env` configurado con IP pública `20.51.189.52` y secretos de producción.
- [ ] 4 contenedores (`gestornotas_backend`, `gestornotas_frontend`, `gestornotas_landing`, `gestornotas_postgres`) en estado `Up`.
- [ ] Migraciones de Django aplicadas exitosamente en PostgreSQL.
- [ ] Datos demo cargados con `seed_demo_data` (2 exámenes con rúbricas y componentes).
- [ ] Superusuario administrador creado y probado.
- [ ] Nginx configurado: Landing Page en raíz `/`, Web en `/app/`, API en `/api/`, y límite de 50MB.
- [ ] Batería de pruebas físicas superada con código HTTP 200.

---

[← Paso Anterior: 03_INSTALAR_HERRAMIENTAS.md](./03_INSTALAR_HERRAMIENTAS.md) | [↑ Índice General](./00_RESUMEN_GENERAL.md) | [Siguiente Paso: 05_ACTUALIZAR_PRODUCCION.md →](./05_ACTUALIZAR_PRODUCCION.md)
