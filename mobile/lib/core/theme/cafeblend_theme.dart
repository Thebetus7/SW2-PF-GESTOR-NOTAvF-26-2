import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class CafeBlendTheme {
  // Colores principales — CafeBlend Warm Cream & Dark Espresso
  static const Color primary = Color(0xFF8B5E3C);
  static const Color primaryHover = Color(0xFF724A2D);
  static const Color secondary = Color(0xFFC4956A);
  static const Color tertiary = Color(0xFFFDF6EC);

  static const Color backgroundLight = Color(0xFFFDF6EC);
  static const Color surfaceLight = Color(0xFFFFFFFF);
  static const Color surfaceInsetLight = Color(0xFFF0E6D6);
  static const Color textLight = Color(0xFF2C1810);
  static const Color textSecondaryLight = Color(0xFF6B5B52);
  static const Color borderLight = Color(0xFFE8DCC8);

  static const Color backgroundDark = Color(0xFF1E140F);
  static const Color surfaceDark = Color(0xFF2A1C14);
  static const Color textDark = Color(0xFFF5EBE1);
  static const Color textSecondaryDark = Color(0xFFA8988C);
  static const Color borderDark = Color(0xFF3D2A1E);

  static const Color success = Color(0xFF059669);
  static const Color warning = Color(0xFFD97706);
  static const Color error = Color(0xFFEF4444);

  static ThemeData lightTheme() {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      primaryColor: primary,
      scaffoldBackgroundColor: backgroundLight,
      colorScheme: const ColorScheme.light(
        primary: primary,
        secondary: secondary,
        surface: surfaceLight,
        background: backgroundLight,
        error: error,
        onPrimary: Colors.white,
        onSecondary: Colors.white,
        onSurface: textLight,
        onBackground: textLight,
        onError: Colors.white,
      ),
      textTheme: TextTheme(
        headlineLarge: GoogleFonts.dmSerifDisplay(
          fontSize: 28,
          fontWeight: FontWeight.bold,
          color: textLight,
        ),
        headlineMedium: GoogleFonts.dmSerifDisplay(
          fontSize: 22,
          fontWeight: FontWeight.w600,
          color: textLight,
        ),
        titleLarge: GoogleFonts.workSans(
          fontSize: 18,
          fontWeight: FontWeight.bold,
          color: textLight,
        ),
        bodyLarge: GoogleFonts.workSans(
          fontSize: 16,
          color: textLight,
        ),
        bodyMedium: GoogleFonts.workSans(
          fontSize: 14,
          color: textLight,
        ),
        bodySmall: GoogleFonts.workSans(
          fontSize: 12,
          color: textSecondaryLight,
        ),
      ),
      cardTheme: CardThemeData(
        color: surfaceLight,
        elevation: 2,
        shadowColor: primary.withOpacity(0.08),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: borderLight, width: 1),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primary,
          foregroundColor: Colors.white,
          elevation: 2,
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          textStyle: GoogleFonts.workSans(
            fontSize: 15,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: surfaceLight,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: borderLight),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: borderLight),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: primary, width: 2),
        ),
      ),
    );
  }

  static ThemeData darkTheme() {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      primaryColor: secondary,
      scaffoldBackgroundColor: backgroundDark,
      colorScheme: const ColorScheme.dark(
        primary: secondary,
        secondary: primary,
        surface: surfaceDark,
        background: backgroundDark,
        error: error,
        onPrimary: Colors.black,
        onSecondary: Colors.white,
        onSurface: textDark,
        onBackground: textDark,
        onError: Colors.white,
      ),
    );
  }
}
