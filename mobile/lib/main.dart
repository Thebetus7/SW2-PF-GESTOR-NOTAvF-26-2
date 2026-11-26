import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'core/config/env_config.dart';
import 'core/theme/cafeblend_theme.dart';
import 'modules/auth/views/login_view.dart';
import 'modules/courses/views/course_selection_view.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Carga segura del archivo .env para configuración de IP/puerto backend
  try {
    await dotenv.load(fileName: 'assets/.env');
  } catch (_) {
    try {
      await dotenv.load(fileName: '.env');
    } catch (e) {
      debugPrint('Aviso: No se pudo cargar .env en Flutter ($e). Se usará URL por defecto (${EnvConfig.apiBaseUrl}).');
    }
  }

  // Comprobar si existe sesión activa previa.
  // Si el almacenamiento falla, se continúa en la pantalla de login en lugar
  // de bloquear el arranque de la aplicación.
  bool hasSession = false;
  try {
    final prefs = await SharedPreferences.getInstance();
    hasSession = prefs.getString('access_token') != null;
  } catch (e) {
    debugPrint('Aviso: no se pudo leer la sesión guardada ($e). Se mostrará el login.');
  }

  runApp(GestorNotasMobileApp(initialHasSession: hasSession));
}

class GestorNotasMobileApp extends StatelessWidget {
  final bool initialHasSession;

  const GestorNotasMobileApp({Key? key, required this.initialHasSession}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'EduGradeIA',
      debugShowCheckedModeBanner: false,
      theme: CafeBlendTheme.lightTheme(),
      darkTheme: CafeBlendTheme.darkTheme(),
      themeMode: ThemeMode.light,
      home: initialHasSession ? const CourseSelectionView() : const LoginView(),
    );
  }
}
