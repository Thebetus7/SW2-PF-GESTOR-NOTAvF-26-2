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

  // Comprobar si existe sesión activa previa
  final prefs = await SharedPreferences.getInstance();
  final hasSession = prefs.getString('access_token') != null;

  runApp(GestorNotasMobileApp(initialHasSession: hasSession));
}

class GestorNotasMobileApp extends StatelessWidget {
  final bool initialHasSession;

  const GestorNotasMobileApp({Key? key, required this.initialHasSession}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Gestor de Notas & Evaluaciones',
      debugShowCheckedModeBanner: false,
      theme: CafeBlendTheme.lightTheme(),
      darkTheme: CafeBlendTheme.darkTheme(),
      themeMode: ThemeMode.light,
      home: initialHasSession ? const CourseSelectionView() : const LoginView(),
    );
  }
}
