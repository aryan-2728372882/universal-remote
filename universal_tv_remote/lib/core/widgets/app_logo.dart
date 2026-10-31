import 'dart:math' as math;
import 'package:flutter/material.dart';

/// Simple but Complex Aura App Logo
/// Precision squircle chassis, cyber glowing rim, concentric tech grid,
/// radiating Wi-Fi LAN waves, tactile D-pad diamond, and embossed glowing core.
class AppLogo extends StatelessWidget {
  final double size;

  const AppLogo({super.key, this.size = 36});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: size,
      height: size,
      child: CustomPaint(
        painter: _AppLogoPainter(),
      ),
    );
  }
}

class _AppLogoPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final scale = size.width / 512.0;
    canvas.save();
    canvas.scale(scale, scale);

    final squircleRect = RRect.fromRectAndRadius(
      const Rect.fromLTWH(36, 36, 440, 440),
      const Radius.circular(110),
    );

    // 1. Chassis Shadow
    final shadowPaint = Paint()
      ..color = Colors.black.withOpacity(0.7)
      ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 20);
    canvas.drawRRect(squircleRect.shift(const Offset(0, 10)), shadowPaint);

    // 2. Chassis Base Gradient
    final chassisPaint = Paint()
      ..shader = const LinearGradient(
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
        colors: [Color(0xFF1E2538), Color(0xFF121622), Color(0xFF07090E)],
      ).createShader(const Rect.fromLTWH(36, 36, 440, 440));
    canvas.drawRRect(squircleRect, chassisPaint);

    // 3. Cyber Glowing Rim
    final rimPaint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = 6.0
      ..shader = const LinearGradient(
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
        colors: [Color(0xFF00F2FE), Color(0xFF3B82F6), Color(0xFF9333EA), Color(0xFFFF3366)],
      ).createShader(const Rect.fromLTWH(36, 36, 440, 440));
    canvas.drawRRect(squircleRect, rimPaint);

    // 4. Concentric Tech Grid
    final gridPaint = Paint()
      ..color = Colors.white.withOpacity(0.08)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.5;
    canvas.drawCircle(const Offset(256, 256), 180, gridPaint);
    canvas.drawCircle(const Offset(256, 256), 130, gridPaint);
    canvas.drawCircle(const Offset(256, 256), 80, gridPaint);
    canvas.drawLine(const Offset(76, 256), const Offset(436, 256), gridPaint);
    canvas.drawLine(const Offset(256, 76), const Offset(256, 436), gridPaint);

    // 5. Radiating Wi-Fi Waves
    final wavePaint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;

    // Wave 3
    wavePaint
      ..color = const Color(0xFF00F2FE).withOpacity(0.4)
      ..strokeWidth = 10;
    canvas.drawArc(
      const Rect.fromLTWH(142, 42, 228, 228),
      math.pi * 1.25,
      math.pi * 0.5,
      false,
      wavePaint,
    );

    // Wave 2
    wavePaint
      ..color = const Color(0xFF00F2FE).withOpacity(0.75)
      ..strokeWidth = 12;
    canvas.drawArc(
      const Rect.fromLTWH(182, 112, 148, 148),
      math.pi * 1.25,
      math.pi * 0.5,
      false,
      wavePaint,
    );

    // Wave 1
    wavePaint
      ..color = const Color(0xFF00F2FE)
      ..strokeWidth = 14;
    canvas.drawArc(
      const Rect.fromLTWH(222, 182, 68, 68),
      math.pi * 1.25,
      math.pi * 0.5,
      false,
      wavePaint,
    );

    // 6. Directional Facets (D-Pad Cross)
    final facetPaint = Paint()
      ..color = const Color(0xFF1E293B)
      ..style = PaintingStyle.fill;
    final facetBorder = Paint()
      ..color = Colors.white.withOpacity(0.25)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.0;

    void drawTriangle(Offset p1, Offset p2, Offset p3) {
      final path = Path()
        ..moveTo(p1.dx, p1.dy)
        ..lineTo(p2.dx, p2.dy)
        ..lineTo(p3.dx, p3.dy)
        ..close();
      canvas.drawPath(path, facetPaint);
      canvas.drawPath(path, facetBorder);
    }

    drawTriangle(const Offset(256, 172), const Offset(290, 210), const Offset(222, 210)); // Up
    drawTriangle(const Offset(256, 340), const Offset(290, 302), const Offset(222, 302)); // Down
    drawTriangle(const Offset(172, 256), const Offset(210, 222), const Offset(210, 290)); // Left
    drawTriangle(const Offset(340, 256), const Offset(302, 222), const Offset(302, 290)); // Right

    // 7. Embossed Center Core Disc
    final corePaint = Paint()
      ..shader = const RadialGradient(
        colors: [Color(0xFF38BDF8), Color(0xFF0284C7), Color(0xFF0C4A6E)],
      ).createShader(const Rect.fromLTWH(210, 210, 92, 92));
    canvas.drawCircle(const Offset(256, 256), 46, corePaint);

    final coreGlowPaint = Paint()
      ..color = const Color(0xFF7DD3FC)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 3.5;
    canvas.drawCircle(const Offset(256, 256), 46, coreGlowPaint);
    canvas.drawCircle(const Offset(256, 256), 18, Paint()..color = Colors.white);

    // 8. TV Bevel Base Bar
    final tvBaseRect = RRect.fromRectAndRadius(
      const Rect.fromLTWH(206, 380, 100, 14),
      const Radius.circular(7),
    );
    canvas.drawRRect(tvBaseRect, Paint()..color = const Color(0xFF0284C7));
    canvas.drawCircle(const Offset(256, 387), 3.5, Paint()..color = const Color(0xFF00F2FE));

    // 9. Glass Sheen Top Arc
    final glassPath = Path()
      ..moveTo(36, 146)
      ..cubicTo(36, 85, 85, 36, 146, 36)
      ..lineTo(366, 36)
      ..cubicTo(427, 36, 476, 85, 476, 146)
      ..lineTo(476, 200)
      ..cubicTo(370, 160, 140, 160, 36, 200)
      ..close();
    final glassPaint = Paint()
      ..shader = LinearGradient(
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
        colors: [Colors.white.withOpacity(0.25), Colors.white.withOpacity(0.0)],
      ).createShader(const Rect.fromLTWH(36, 36, 440, 164));
    canvas.drawPath(glassPath, glassPaint);

    canvas.restore();
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
