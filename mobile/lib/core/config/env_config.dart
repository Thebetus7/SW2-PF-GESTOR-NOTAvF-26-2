import 'package:flutter_dotenv/flutter_dotenv.dart';

class EnvConfig {
  static const String defaultEmulatorUrl = 'http://10.0.2.2:8000/api/v1';

  static String get apiBaseUrl {
    try {
      final envUrl = dotenv.env['API_BASE_URL'];
      if (envUrl != null && envUrl.trim().isNotEmpty) {
        return envUrl.trim();
      }
    } catch (_) {
      // Si dotenv no fue inicializado aún
    }
    return defaultEmulatorUrl;
  }

  static const int connectTimeoutSeconds = 15;
  static const int receiveTimeoutSeconds = 30;
}
