# 🚀 03. Instalar Herramientas en el Servidor

[← Paso Anterior: 02_CREAR_INFRAESTRUCTURA_GCP.md](./02_CREAR_INFRAESTRUCTURA_GCP.md) | [↑ Índice General](./00_RESUMEN_GENERAL.md) | [Siguiente Paso: 04_DESPLEGAR_Y_VERIFICAR.md →](./04_DESPLEGAR_Y_VERIFICAR.md)

---

## 1. Visión de la Fase

En esta fase preparamos el entorno de ejecución dentro del servidor Ubuntu 22.04 LTS en Google Cloud: actualizamos el sistema base, aprovisionamos memoria Swap de seguridad, instalamos el motor oficial de Docker y Docker Compose, configuramos Nginx y reforzamos la seguridad con el firewall UFW.

---

## 2. Pasos Estructurados de Instalación

### 🚀 Paso 1: Actualizar Repositorios y Paquetes Base del Sistema Operativo

> [!NOTE]
> **Propósito:** Descargar los parches de seguridad más recientes de Ubuntu e instalar utilidades fundamentales (`curl`, `git`, `htop`, `ca-certificates`).
> **Contexto de Ejecución:** `[SSH / SERVIDOR]`
> **Ruta de Trabajo:** `/home/usuario`

```bash
# Actualizar lista de paquetes e instalar actualizaciones de seguridad
sudo apt update && sudo apt upgrade -y

# Instalar dependencias esenciales de sistema
sudo apt install -y curl wget git htop ufw software-properties-common ca-certificates apt-transport-https
```

> [!TIP]
> **Verificación Observable & Salida Esperada:**
> Comprueba que Git y Curl respondan con su versión instalada:
> ```bash
> git --version && curl --version | head -n 1
> ```
> *Salida esperada:*
> ```text
> git version 2.34.1
> curl 7.81.0 ...
> ```

---

### 🚀 Paso 2: Configurar 2 GB de Memoria Swap Preventiva

> [!NOTE]
> **Propósito:** Proporcionar un espacio de intercambio en disco que actúe como amortiguador de memoria RAM. Durante la compilación de Next.js (`npm run build`), Node.js puede experimentar picos de consumo de memoria que activarían el OOM Killer si no existe Swap disponible.
> **Contexto de Ejecución:** `[SSH / SERVIDOR]`
> **Ruta de Trabajo:** `/`

```bash
# 1. Crear el archivo swap de 2 GB
sudo fallocate -l 2G /swapfile

# 2. Restringir permisos de acceso exclusivamente a root
sudo chmod 600 /swapfile

# 3. Formatear como área de intercambio
sudo mkswap /swapfile

# 4. Habilitar el swap en el kernel
sudo swapon /swapfile

# 5. Configurar persistencia permanente en fstab tras reinicios
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# 6. Ajustar agresividad de swap (swappiness = 10 para priorizar RAM física)
sudo sysctl vm.swappiness=10
echo 'vm.swappiness=10' | sudo tee -a /etc/sysctl.conf
```

> [!TIP]
> **Verificación Observable & Salida Esperada:**
> Inspecciona la memoria activa del servidor:
> ```bash
> free -h
> ```
> *Salida esperada:*
> ```text
>                total        used        free      shared  buff/cache   available
> Mem:           3.8Gi       450Mi       2.8Gi       1.0Mi       600Mi       3.1Gi
> Swap:          2.0Gi          0B       2.0Gi
> ```

---

### 🚀 Paso 3: Instalar Docker Engine y Docker Compose Plugin Oficial

> [!NOTE]
> **Propósito:** Instalar la versión comunitaria más reciente y estable de Docker directamente desde el repositorio oficial de Docker Inc. (evitando los paquetes desactualizados de `apt` genérico).
> **Contexto de Ejecución:** `[SSH / SERVIDOR]`
> **Ruta de Trabajo:** `/home/usuario`

```bash
# 1. Descargar y ejecutar el script oficial de instalación automatizada de Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 2. Habilitar el servicio Docker para que arranque automáticamente al encender la VM
sudo systemctl enable docker
sudo systemctl start docker

# 3. Limpiar instalador temporal
rm get-docker.sh
```

> [!TIP]
> **Verificación Observable & Salida Esperada:**
> Comprueba las versiones instaladas:
> ```bash
> docker --version && docker compose version
> ```
> *Salida esperada:*
> ```text
> Docker version 27.x.x, build ...
> Docker Compose version v2.x.x
> ```

---

### 🚀 Paso 4: Asignar Permisos de Usuario Docker (No-Root)

> [!NOTE]
> **Propósito:** Permitir que tu usuario habitual ejecute comandos `docker` y `docker compose` sin requerir `sudo`, mejorando la ergonomía y seguridad operativa.
> **Contexto de Ejecución:** `[SSH / SERVIDOR]`

```bash
# Agregar tu usuario actual al grupo docker
sudo usermod -aG docker $USER

# Aplicar el cambio de grupo en la sesión activa sin reiniciar sesión
newgrp docker
```

> [!TIP]
> **Verificación Observable & Salida Esperada:**
> Ejecuta un contenedor de prueba sin usar `sudo`:
> ```bash
> docker run --rm hello-world
> ```
> *Salida esperada:*
> ```text
> Hello from Docker!
> This message shows that your installation appears to be working correctly.
> ```

---

### 🚀 Paso 5: Instalar y Habilitar Nginx Reverse Proxy

> [!NOTE]
> **Propósito:** Instalar Nginx en el sistema host para actuar como terminación HTTP/HTTPS, balanceador local y enrutador hacia los contenedores de Next.js y Django.
> **Contexto de Ejecución:** `[SSH / SERVIDOR]`

```bash
# 1. Instalar Nginx
sudo apt install -y nginx

# 2. Habilitar e iniciar servicio Nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

> [!TIP]
> **Verificación Observable & Salida Esperada:**
> Valida que el servicio Nginx esté activo y escuchando en el puerto 80:
> ```bash
> sudo systemctl is-active nginx
> ```
> *Salida esperada:*
> ```text
> active
> ```

---

### 🚀 Paso 6: Configurar Firewall Local UFW

> [!NOTE]
> **Propósito:** Reforzar la seguridad a nivel del kernel de Linux, permitiendo únicamente el tráfico de entrada en los puertos 22 (SSH), 80 (HTTP) y 443 (HTTPS), y descartando cualquier intento de conexión no autorizado.
> **Contexto de Ejecución:** `[SSH / SERVIDOR]`

```bash
# 1. Permitir SSH (¡OBLIGATORIO para no desconectar la sesión actual!)
sudo ufw allow 22/tcp comment 'OpenSSH Remote Admin'

# 2. Permitir tráfico web HTTP y HTTPS
sudo ufw allow 80/tcp comment 'Nginx HTTP'
sudo ufw allow 443/tcp comment 'Nginx HTTPS'

# 3. Activar UFW con confirmación forzada
sudo ufw --force enable
```

> [!TIP]
> **Verificación Observable & Salida Esperada:**
> Consulta el estado de las reglas activas:
> ```bash
> sudo ufw status verbose
> ```
> *Salida esperada:*
> ```text
> Status: active
> To                         Action      From
> --                         ------      ----
> 22/tcp                     ALLOW IN    Anywhere (OpenSSH Remote Admin)
> 80/tcp                     ALLOW IN    Anywhere (Nginx HTTP)
> 443/tcp                    ALLOW IN    Anywhere (Nginx HTTPS)
> ```

---

## 3. Matriz de Verificación Global de Herramientas

| Herramienta | Comando de Prueba Observable | Salida Exitosa Esperada |
| :--- | :--- | :--- |
| **Git** | `git --version` | `git version 2.x.x` |
| **Swap de 2 GB** | `swapon --show` | `/swapfile file 2G ...` |
| **Docker Engine** | `docker info --format '{{.ServerVersion}}'` | `27.x.x` |
| **Docker Compose** | `docker compose version --short` | `2.x.x` |
| **Nginx Web Server** | `curl -s -I http://localhost \| head -n 1` | `HTTP/1.1 200 OK` |
| **Firewall UFW** | `sudo ufw status \| grep -i Status` | `Status: active` |

---

## 4. Checklist de Cierre del Paso 03

- [ ] Paquetes de Ubuntu actualizados al día.
- [ ] Swapfile de 2 GB configurado y activado permanentemente en `/etc/fstab`.
- [ ] Docker Engine y Docker Compose plugin instalados.
- [ ] Permisos de grupo `docker` asignados al usuario y contenedor `hello-world` ejecutado sin `sudo`.
- [ ] Nginx instalado y en ejecución activa.
- [ ] Firewall UFW activo permitiendo exclusivamente puertos 22, 80 y 443.

---

[← Paso Anterior: 02_CREAR_INFRAESTRUCTURA_GCP.md](./02_CREAR_INFRAESTRUCTURA_GCP.md) | [↑ Índice General](./00_RESUMEN_GENERAL.md) | [Siguiente Paso: 04_DESPLEGAR_Y_VERIFICAR.md →](./04_DESPLEGAR_Y_VERIFICAR.md)
