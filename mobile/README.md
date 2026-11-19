# Gestor de Notas & Evaluaciones - Mobile App

Aplicación móvil desarrollada en Flutter para la digitalización de exámenes físicos, calibración por código QR y calificación pedagógica asistida con Google Gemini AI.

---

## 🛠️ Generación del APK de Depuración (`app-debug.apk`)

Para compilar e instalar el archivo APK en modo Debug, sigue los pasos a continuación:

### 1. Requisitos Previos

* **Flutter SDK**: 3.50+ configurado en el sistema o en `C:\PROGRAMAS\flutter\bin`.
* **Android SDK**: Android 14 (API 34) con platform-tools (`adb`).
* **Java JDK**: JDK 17 o compatible.

### 2. Comandos de Compilación

Abre una terminal (PowerShell o Git Bash) y navega a la carpeta `mobile/`:

```bash
cd mobile
```

Si el comando `flutter` no está en tu PATH global de Windows, agrégalo temporalmente:
```powershell
$env:PATH = "C:\PROGRAMAS\flutter\bin;$env:PATH"
```

Genera el APK en modo depuración ejecutando:
```bash
flutter build apk --debug
```

### 3. Ubicación del Archivo Generado

Al finalizar la compilación con éxito, el instalador APK se encuentra en:
```text
mobile/build/app/outputs/flutter-apk/app-debug.apk
```

---

## 📲 Instalación y Ejecución

### Opción A: Instalar directamente mediante ADB (Emulador o Teléfono Físico)
Con tu emulador encendido o tu dispositivo físico conectado con depuración USB habilitada:

```bash
adb install -r build/app/outputs/flutter-apk/app-debug.apk
```

Para iniciar la aplicación automáticamente:
```bash
adb shell am start -n com.evaluacion.gestornotas_mobile/.MainActivity
```

### Opción B: Ejecución en Tiempo Real con Hot Reload
Para ejecutar directamente en tu dispositivo o emulador:

```bash
# Ver lista de dispositivos detectados
flutter devices

# Ejecutar en el dispositivo activo
flutter run
```

---

## ⚙️ Configuración de Red y Endpoints (`.env`)

El archivo `.env` dentro de `mobile/` gestiona la URL base del backend:
* **Emulador Android**: `API_BASE_URL=http://10.0.2.2:8000/api/v1`
* **Navegador Web**: `API_BASE_URL=http://127.0.0.1:8000/api/v1`
* **Dispositivo Físico**: `API_BASE_URL=http://<IP_LOCAL_DE_TU_PC>:8000/api/v1`

