# 📱 Gestor de Notas & Evaluaciones — Aplicación Móvil (Flutter)

Aplicación móvil desarrollada en **Flutter** para docentes y evaluadores. Permite la digitalización rápida de exámenes físicos mediante la lectura del código QR del estudiante, la captura multicara de hojas en formato JPG de alta calidad y el envío directo al motor de evaluación asistido por IA del backend.

---

## 📋 Requisitos Previos

* **Flutter SDK**: Versión `3.x` instalada y configurada en las variables de entorno (`flutter --version`).
* **Dart SDK**: Versión `3.0.0` o superior (incluido con Flutter).
* **Entorno de Ejecución**:
  * **Android**: Android Studio con Android SDK Command-line Tools y un dispositivo virtual (AVD) o físico.
  * **iOS**: macOS con Xcode y CocoaPods instalado (si vas a compilar para iPhone / iPad).
* **Diagnóstico del Entorno**:
  Ejecuta en tu terminal para validar que no existan componentes faltantes:
  ```bash
  flutter doctor
  ```

---

## ⚙️ Configuración de Conexión con la API

El archivo encargado de la dirección base del backend es:
📂 `lib/core/config/env_config.dart`

Dependiendo de dónde estés ejecutando la aplicación, configura la URL correspondiente:

| Entorno de Prueba | URL a Configurar en `env_config.dart` | Razón / Detalle |
| :--- | :--- | :--- |
| **Emulador Android (AVD)** | `http://10.0.2.2:8000/api/v1` | *(Configuración por defecto)* En Android Emulator, `10.0.2.2` es el alias reservado que mapea al `localhost` de tu computadora de desarrollo. |
| **Simulador iOS / Flutter Web** | `http://localhost:8000/api/v1` | Los simuladores de iOS comparten la interfaz de red directamente con la máquina anfitriona. |
| **Dispositivo Físico (Celular Real)** | `http://<IP_LOCAL_DE_TU_PC>:8000/api/v1` | Por ejemplo: `http://192.168.1.35:8000/api/v1`. Tu celular y tu PC deben estar conectados a la **misma red Wi-Fi**. |

> 💡 **Nota para Dispositivos Físicos:**
> Asegúrate de que el backend de Django esté corriendo escuchando en todas las interfaces de red:
> ```bash
> python manage.py runserver 0.0.0.0:8000
> ```
> Y verifica que el Firewall de Windows / Linux permita conexiones entrantes en el puerto `8000`.

---

## 🚀 Cómo Levantar la Aplicación

#### 1. Navegar a la carpeta mobile
```bash
cd mobile
```

#### 2. Instalar dependencias de Flutter
```bash
flutter pub get
```

#### 3. Inicializar plataformas nativas (si clonas por primera vez)
Si la carpeta no contiene aún los directorios nativos `android/` o `ios/`, genéralos ejecutando:
```bash
flutter create . --platforms=android,ios
```

#### 4. Listar dispositivos y emuladores disponibles
```bash
flutter devices
```

Verás una lista con los identificadores de tus emuladores y dispositivos físicos conectados (por ejemplo: `emulator-5554`, `chrome`, o el modelo de tu teléfono).

#### 5. Ejecutar la aplicación en modo desarrollo
```bash
# Ejecutar en el dispositivo por defecto o único conectado:
flutter run

# O especificar un dispositivo en particular:
flutter run -d <DEVICE_ID>
```

---

## 🧪 Pruebas Automatizadas y Calidad

El proyecto incluye pruebas de controladores de envío y flujos de escaneo:

```bash
# Ejecutar todos los tests unitarios y de widgets:
flutter test

# Análisis estático y linter de Dart:
flutter analyze
```

---

## 📷 Permisos Nativos Requeridos

La aplicación requiere acceso a los sensores físicos para el escaneo:
1. **Cámara (`Camera`):** Para la vista previa del visor, detección del código QR impreso en el examen y captura de las hojas de respuestas.
2. **Almacenamiento / Galería (`ImagePicker`):** Para procesar temporalmente los archivos JPG antes de ser empaquetados en la solicitud multipart.

* **Android:** Asegúrate de contar con los permisos en `android/app/src/main/AndroidManifest.xml`:
  ```xml
  <uses-permission android:name="android.permission.CAMERA" />
  <uses-permission android:name="android.permission.INTERNET" />
  ```
* **iOS:** Asegúrate de contar con las claves en `ios/Runner/Info.plist`:
  * `NSCameraUsageDescription`
  * `NSPhotoLibraryUsageDescription`

---

## 🧩 Flujo Funcional de la App Móvil

```text
[Inicio Sesión Docente]
         ↓
[Escanear Código QR del Examen Físico] → Identifica Estudiante, Asignatura y Examen
         ↓
[Captura Multicara JPG (Página 1..N)]   → Control de enfoque e iluminación
         ↓
[Previsualización y Validación]        → Permite recapturar páginas borrosas
         ↓
[Envío Seguro al Backend (Multipart)]  → Dispara el Pipeline de Calificación con Gemini
         ↓
[Visualización de Resultados/Feedback] → Puntaje sugerido y desglose por pregunta
```

---

## 📂 Estructura del Código Fuente

```text
mobile/
├── lib/
│   ├── core/
│   │   ├── config/      # Configuración de URLs y variables de entorno (env_config.dart)
│   │   ├── network/     # Cliente HTTP Dio con interceptores de autenticación JWT
│   │   └── theme/       # Sistema de diseño CafeBlend (Dark Espresso & Warm Cream)
│   ├── modules/
│   │   └── scanner/     # Módulo de escaneo, captura JPG y envío al pipeline IA
│   │       ├── controllers/ # Lógica de estado (SubmissionController)
│   │       ├── models/      # Entidades de datos y resultados de evaluación
│   │       ├── views/       # Pantallas de cámara, visor y confirmación
│   │       └── widgets/     # Componentes visuales de cámara y botones de acción
│   └── main.dart        # Punto de entrada de la aplicación Flutter
├── test/                # Pruebas automatizadas (scanner_flow_test, submission_controller_test)
├── pubspec.yaml         # Dependencias del proyecto (Dio, Camera, QR Scanner, Provider)
└── analysis_options.yaml# Reglas del linter de Dart
```
