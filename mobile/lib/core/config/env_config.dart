import 'package:flutter/foundation.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

class EnvConfig {
  static const String defaultServerUrl = 'http://20.51.189.52/api/v1';
  static const String defaultEmulatorUrl = 'http://20.51.189.52/api/v1';
  static const String defaultLocalhostUrl = 'http://20.51.189.52/api/v1';

  static String get apiBaseUrl {
    // Si corre en Web (navegador Chrome/Edge), 10.0.2.2 no existe
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
    return defaultServerUrl;
  }

  static const int connectTimeoutSeconds = 15;
  static const int receiveTimeoutSeconds = 30;
}
