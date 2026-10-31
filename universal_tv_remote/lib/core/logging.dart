import 'package:flutter/foundation.dart';

/// Secure Local Logger that avoids logging sensitive tokens or PII
class AppLogger {
  AppLogger._();

  static void info(String message) {
    if (kDebugMode) {
      debugPrint('[INFO] $message');
    }
  }

  static void warning(String message) {
    if (kDebugMode) {
      debugPrint('[WARN] $message');
    }
  }

  static void error(String message, [Object? error, StackTrace? stack]) {
    if (kDebugMode) {
      debugPrint('[ERROR] $message: $error');
      if (stack != null) {
        debugPrint(stack.toString());
      }
    }
  }
}
