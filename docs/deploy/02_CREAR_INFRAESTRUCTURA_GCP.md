# 🚀 02. Crear Infraestructura en Google Cloud Platform (GCP)

[← Paso Anterior: 01_CONFIGURAR_PROYECTO.md](./01_CONFIGURAR_PROYECTO.md) | [↑ Índice General](./00_RESUMEN_GENERAL.md) | [Siguiente Paso: 03_INSTALAR_HERRAMIENTAS.md →](./03_INSTALAR_HERRAMIENTAS.md)

---

## 1. Visión de la Fase

En esta fase creamos los recursos de nube en **Google Cloud Compute Engine**: la máquina virtual `e2-medium`, la reserva de una IP externa estática para que la dirección no cambie al apagar la máquina, las políticas de red y las reglas de Firewall estrictas que permitirán el tráfico seguro hacia la aplicación.

---

## 2. Pasos Estructurados de Infraestructura

### 🚀 Paso 1: Habilitar Compute Engine API y Seleccionar Proyecto

> [!NOTE]
> **Propósito:** Activar los servicios de virtualización en tu proyecto de Google Cloud para permitir el despliegue y administración de máquinas virtuales.
> **Contexto de Ejecución:** `[PC LOCAL]` o `[CONSOLA CLOUD WEB]`
> **Ruta de Trabajo:** https://console.cloud.google.com/

```bash
# Definir ID de tu proyecto en GCP
export PROJECT_ID="<TU_PROJECT_ID_GCP>"

# Establecer proyecto activo en gcloud CLI
gcloud config set project $PROJECT_ID

# Habilitar la API de Compute Engine
gcloud services enable compute.googleapis.com
```

> [!TIP]
> **Verificación Observable & Salida Esperada:**
> Comprueba que la API esté activa:
> ```bash
> gcloud services list --enabled --filter="NAME:compute.googleapis.com"
> ```
> *Salida esperada:*
> ```text
> NAME                    TITLE
> compute.googleapis.com  Compute Engine API
> ```

---

### 🚀 Paso 2: Reservar Dirección IPv4 Externa Estática

> [!NOTE]
> **Propósito:** Asignar una IP pública fija e inmutable. Por defecto, las VMs en la nube tienen IPs efímeras que cambian cada vez que la máquina se detiene o reinicia, lo cual rompería la configuración de la app móvil y el frontend.
> **Contexto de Ejecución:** `[PC LOCAL]`
> **Ruta de Trabajo:** Terminal gcloud

```bash
# Reservar una IP pública estática en la región us-central1 (Iowa)
gcloud compute addresses create gestornotas-ip-estatica \
    --region=us-central1

# Consultar y almacenar la dirección IP obtenida
export STATIC_IP=$(gcloud compute addresses describe gestornotas-ip-estatica --region=us-central1 --format='value(address)')

echo "=========================================================="
echo "Tu IP Externa Estática de GCP es: $STATIC_IP"
echo "=========================================================="
```

> [!TIP]
> **Verificación Observable & Salida Esperada:**
> ```text
> Tu IP Externa Estática de GCP es: 34.123.45.67
> ```
> *Anota esta IP:* La utilizaremos en todos los pasos subsiguientes para el archivo `.env`, Nginx y la app móvil.

---

### 🚀 Paso 3: Crear la Instancia de Máquina Virtual (`e2-medium`)

> [!NOTE]
> **Propósito:** Instanciar un servidor virtual en Compute Engine con 2 vCPUs virtuales, 4 GB de RAM, 30 GB de almacenamiento balanceado y el sistema operativo Ubuntu 22.04 LTS, vinculada a la IP fija reservada.
> **Contexto de Ejecución:** `[PC LOCAL]` (CLI) o `[CONSOLA CLOUD WEB]`

#### Opción A: Mediante comando automatizado `gcloud CLI`
```bash
gcloud compute instances create gestornotas-vm-prod \
    --zone=us-central1-a \
    --machine-type=e2-medium \
    --network-interface=address=$STATIC_IP,network-tier=PREMIUM \
    --image-family=ubuntu-2204-lts \
    --image-project=ubuntu-os-cloud \
    --boot-disk-size=30GB \
    --boot-disk-type=pd-balanced \
    --tags=http-server,https-server
```

#### Opción B: Mediante la Consola Web de GCP
1. Navega a **Compute Engine** $\rightarrow$ **Instancias de VM** $\rightarrow$ Clic en **"Crear instancia"**.
2. **Nombre:** `gestornotas-vm-prod` | **Región:** `us-central1` | **Zona:** `us-central1-a`.
3. **Tipo de máquina:** `e2-medium` (2 vCPU, 4 GB de memoria).
4. **Disco de arranque:** Haz clic en *Cambiar* $\rightarrow$ SO: `Ubuntu` $\rightarrow$ Versión: `Ubuntu 22.04 LTS x86/64` $\rightarrow$ Tamaño: `30 GB` $\rightarrow$ Tipo: `pd-balanced`.
5. **Firewall:** Marca [x] *Permitir tráfico HTTP* y [x] *Permitir tráfico HTTPS*.
6. **Redes (Avanzado):** En la interfaz `default`, selecciona en IPv4 Externa la IP estática reservada en el Paso 2 (`gestornotas-ip-estatica`).
7. Haz clic en **Crear**.

> [!TIP]
> **Verificación Observable & Salida Esperada:**
> Comprueba el estado de la VM con:
> ```bash
> gcloud compute instances describe gestornotas-vm-prod --zone=us-central1-a --format='value(status)'
> ```
> *Salida esperada:*
> ```text
> RUNNING
> ```

---

### 🚀 Paso 4: Configurar Reglas de Firewall en Google Cloud

> [!NOTE]
> **Propósito:** Permitir que los puertos de administración (22 SSH) y de tráfico web público (80 HTTP y 443 HTTPS) alcancen la máquina virtual, bloqueando cualquier otro puerto (como el 5432 de PostgreSQL).
> **Contexto de Ejecución:** `[PC LOCAL]`

```bash
# Crear regla de firewall para tráfico Web (HTTP 80 y HTTPS 443)
gcloud compute firewall-rules create allow-http-https \
    --direction=INGRESS \
    --priority=1000 \
    --network=default \
    --action=ALLOW \
    --rules=tcp:80,tcp:443 \
    --source-ranges=0.0.0.0/0 \
    --target-tags=http-server,https-server
```

> [!TIP]
> **Verificación Observable & Salida Esperada:**
> ```bash
> gcloud compute firewall-rules list --filter="name=allow-http-https"
> ```
> *Salida esperada:*
> ```text
> NAME              NETWORK  DIRECTION  PRIORITY  ALLOW        DENY  DISABLED
> allow-http-https  default  INGRESS    1000      tcp:80,443         False
> ```

---

### 🚀 Paso 5: Conexión Remota Inicial por SSH

> [!NOTE]
> **Propósito:** Establecer comunicación remota cifrada con la máquina virtual para comenzar con el aprovisionamiento de herramientas y configuración del sistema operativo.
> **Contexto de Ejecución:** `[PC LOCAL]`

Ejecuta la conexión remota SSH:

```bash
# Conectar por SSH con gcloud (inyecta automáticamente tus llaves seguras)
gcloud compute ssh gestornotas-vm-prod --zone=us-central1-a
```

*Alternativa web:* En la consola web de Google Cloud, haz clic en el botón **"SSH"** en la fila de tu máquina virtual `gestornotas-vm-prod` para abrir una terminal directamente en el navegador.

> [!TIP]
> **Verificación Observable & Salida Esperada:**
> El prompt del terminal cambiará a:
> ```text
> usuario@gestornotas-vm-prod:~$
> ```
> Comprueba la versión del sistema operativo recién conectado:
> ```bash
> lsb_release -a
> ```
> *Salida esperada:*
> ```text
> Description: Ubuntu 22.04.x LTS
> ```

> [!WARNING]
> **Solución de Fallos Frecuentes (Troubleshooting):**
> - **Síntoma:** Error `Permission denied (publickey)` al intentar conectar por SSH tradicional.
> - **Causa:** No se han agregado las llaves públicas SSH a los metadatos de GCP.
> - **Solución:** Utiliza el comando `gcloud compute ssh` que gestiona e intercambia el par de llaves automáticamente sin necesidad de subirlas manualmente.

---

## 3. Checklist de Cierre del Paso 02

- [ ] Compute Engine API habilitada en el proyecto de GCP.
- [ ] Dirección IPv4 Externa Estática creada y anotada (`$STATIC_IP`).
- [ ] Máquina virtual `gestornotas-vm-prod` de tipo `e2-medium` en estado `RUNNING`.
- [ ] Reglas de Firewall configuradas exclusivamente para puertos 22, 80 y 443.
- [ ] Conexión SSH establecida exitosamente con el prompt de Ubuntu.

---

[← Paso Anterior: 01_CONFIGURAR_PROYECTO.md](./01_CONFIGURAR_PROYECTO.md) | [↑ Índice General](./00_RESUMEN_GENERAL.md) | [Siguiente Paso: 03_INSTALAR_HERRAMIENTAS.md →](./03_INSTALAR_HERRAMIENTAS.md)
