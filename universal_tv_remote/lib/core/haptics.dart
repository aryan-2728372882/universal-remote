import 'package:flutter/services.dart';

enum HapticType {
  light,
  medium,
  heavy,
  selection,
  error,
}

/// Tactile Haptics Service
class HapticsService {
  HapticsService._();

  static bool enabled = true;

  static Future<void> feedback([HapticType type = HapticType.light]) async {
    if (!enabled) return;
    try {
      switch (type) {
        case HapticType.light:
          await HapticFeedback.lightImpact();
          break;
        case HapticType.medium:
          await HapticFeedback.mediumImpact();
          break;
        case HapticType.heavy:
          await HapticFeedback.heavyImpact();
          break;
        case HapticType.selection:
          await HapticFeedback.selectionClick();
          break;
        case HapticType.error:
          await HapticFeedback.vibrate();
          break;
      }
    } catch (_) {
      // Ignore haptic failures on unsupported hardware
    }
  }
}
