import 'package:flutter/material.dart';

/// Design tokens for Universal Remote
class AppTokens {
  AppTokens._();

  // Color Palette - Deep OLED Dark Luxury Theme
  static const Color background = Color(0xFF070B14);
  static const Color surface = Color(0xFF0F172A);
  static const Color surfaceElevated = Color(0xFF1E293B);
  static const Color surfaceBorder = Color(0xFF334155);

  // Accent Colors
  static const Color primary = Color(0xFF3B82F6); // Electric Blue
  static const Color primaryGlow = Color(0x663B82F6);
  static const Color accentCyan = Color(0xFF06B6D4);
  static const Color accentIndigo = Color(0xFF6366F1);
  static const Color accentAmber = Color(0xFFF59E0B);
  static const Color accentEmerald = Color(0xFF10B981);
  static const Color accentRose = Color(0xFFF43F5E);

  // Text Colors
  static const Color textPrimary = Color(0xFFF8FAFC);
  static const Color textSecondary = Color(0xFF94A3B8);
  static const Color textMuted = Color(0xFF64748B);

  // Border Radii
  static const double radiusSm = 12.0;
  static const double radiusMd = 18.0;
  static const double radiusLg = 24.0;
  static const double radiusFull = 999.0;

  // Animation Durations
  static const Duration durationFast = Duration(milliseconds: 150);
  static const Duration durationNormal = Duration(milliseconds: 250);
  static const Duration durationSlow = Duration(milliseconds: 400);

  // Animation Curves
  static const Curve curveSpring = Curves.easeOutCubic;
  static const Curve curveBouncy = Curves.elasticOut;
}

/// Theme definition for Universal Smart Remote
class AppTheme {
  AppTheme._();

  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      scaffoldBackgroundColor: AppTokens.background,
      colorScheme: const ColorScheme.dark(
        primary: AppTokens.primary,
        surface: AppTokens.surface,
        onSurface: AppTokens.textPrimary,
        error: AppTokens.accentRose,
      ),
      fontFamily: null, // Use system font to minimize APK size
      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: false,
        titleTextStyle: TextStyle(
          fontSize: 18,
          fontWeight: FontWeight.w800,
          letterSpacing: 0.8,
          color: AppTokens.textPrimary,
        ),
      ),
      cardTheme: CardThemeData(
        color: AppTokens.surface,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppTokens.radiusMd),
          side: const BorderSide(color: AppTokens.surfaceBorder, width: 1),
        ),
      ),
    );
  }
}
