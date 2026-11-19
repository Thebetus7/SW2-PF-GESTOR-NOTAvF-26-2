import 'package:flutter/foundation.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

class EnvConfig {
  static const String defaultEmulatorUrl = 'http://10.0.2.2:8000/api/v1';
  static const String defaultLocalhostUrl = 'http://127.0.0.1:8000/api/v1';

  static String get apiBaseUrl {
    // Si corre en Web (navegador Chrome/Edge), 10.0.2.2 no existe; se usa localhost
    if (kIsWeb) {
      try {
        final envUrl = dotenv.env['API_BASE_URL'];
        if (envUrl != null && envUrl.trim().isNotEmpty && !envUrl.contains('10.0.2.2')) {
          return envUrl.trim();
        }
      } catch (_) {}
      return defaultLocalhostUrl;
    }

    try {
      final envUrl = dotenv.env['API_BASE_URL'];
      if (envUrl != null && envUrl.trim().isNotEmpty) {
        return envUrl.trim();
      }
    } catch (_) {}
    return defaultEmulatorUrl;
  }

  static const int connectTimeoutSeconds = 15;
  static const int receiveTimeoutSeconds = 30;
}
