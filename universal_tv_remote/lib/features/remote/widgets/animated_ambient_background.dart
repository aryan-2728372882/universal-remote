import 'dart:math' as math;
import 'package:flutter/material.dart';

/// Luxury Animated Ambient Background with drifting glowing aurora orbs and tech grid
/// Designed for high-end Smart TV remote immersion with zero external asset overhead.
class AnimatedAmbientBackground extends StatefulWidget {
  final Widget child;
  final bool showGrid;
  final bool animActive;
  final String activeTheme;

  const AnimatedAmbientBackground({
    super.key,
    required this.child,
    this.showGrid = true,
    this.animActive = true,
    this.activeTheme = 'cyan',
  });

  @override
  State<AnimatedAmbientBackground> createState() => _AnimatedAmbientBackgroundState();
}

class _AnimatedAmbientBackgroundState extends State<AnimatedAmbientBackground>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 14),
    );
    if (widget.animActive) {
      _controller.repeat();
    }
  }

  @override
  void didUpdateWidget(covariant AnimatedAmbientBackground oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.animActive != oldWidget.animActive) {
      if (widget.animActive) {
        _controller.repeat();
      } else {
        _controller.stop();
      }
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Color _getPrimaryColor() {
    switch (widget.activeTheme) {
      case 'crimson':
        return const Color(0xFFFF3366);
      case 'emerald':
        return const Color(0xFF00E676);
      case 'midnight':
        return const Color(0xFF7928CA);
      case 'cyan':
      default:
        return const Color(0xFF00F2FE);
    }
  }

  Color _getBaseBg() {
    switch (widget.activeTheme) {
      case 'crimson':
        return const Color(0xFF0A0406);
      case 'emerald':
        return const Color(0xFF050A08);
      case 'midnight':
        return const Color(0xFF030305);
      case 'cyan':
      default:
        return const Color(0xFF080A10);
    }
  }

  @override
  Widget build(BuildContext context) {
    final primary = _getPrimaryColor();
    final baseBg = _getBaseBg();

    return Stack(
      children: [
        // 1. Deep solid dark base
        Positioned.fill(
          child: Container(
            color: baseBg,
          ),
        ),

        // 2. Animated Aurora Glow Painter
        if (widget.animActive)
          Positioned.fill(
            child: AnimatedBuilder(
              animation: _controller,
              builder: (context, _) {
                return CustomPaint(
                  painter: _AuroraPainter(
                    progress: _controller.value,
                    themeColor: primary,
                  ),
                );
              },
            ),
          ),

        // 3. Cyber Tech Grid Matrix (subtle micro dots)
        if (widget.showGrid)
          Positioned.fill(
            child: IgnorePointer(
              child: CustomPaint(
                painter: _TechGridPainter(),
              ),
            ),
          ),

        // 4. Foreground Content
        Positioned.fill(child: widget.child),
      ],
    );
  }
}

class _AuroraPainter extends CustomPainter {
  final double progress;
  final Color themeColor;

  _AuroraPainter({required this.progress, required this.themeColor});

  @override
  void paint(Canvas canvas, Size size) {
    final t = progress * 2 * math.pi;

    // Orb 1: Primary theme accent glow (Top-Center drifting)
    final dx1 = size.width * (0.50 + 0.20 * math.sin(t));
    final dy1 = size.height * (0.15 + 0.10 * math.cos(t));
    final radius1 = size.width * 0.75;

    final paint1 = Paint()
      ..shader = RadialGradient(
        colors: [
          themeColor.withOpacity(0.24),
          themeColor.withOpacity(0.08),
          Colors.transparent,
        ],
        stops: const [0.0, 0.45, 1.0],
      ).createShader(Rect.fromCircle(center: Offset(dx1, dy1), radius: radius1));

    canvas.drawCircle(Offset(dx1, dy1), radius1, paint1);

    // Orb 2: Deep Indigo / Sky secondary
    final dx2 = size.width * (0.80 - 0.25 * math.cos(t * 0.8));
    final dy2 = size.height * (0.50 + 0.15 * math.sin(t * 0.8));
    final radius2 = size.width * 0.65;

    final paint2 = Paint()
      ..shader = RadialGradient(
        colors: [
          const Color(0xFF4F46E5).withOpacity(0.18),
          const Color(0xFF312E81).withOpacity(0.06),
          Colors.transparent,
        ],
        stops: const [0.0, 0.40, 1.0],
      ).createShader(Rect.fromCircle(center: Offset(dx2, dy2), radius: radius2));

    canvas.drawCircle(Offset(dx2, dy2), radius2, paint2);

    // Orb 3: Purple / Magenta anchor
    final dx3 = size.width * (0.35 + 0.20 * math.sin(t * 1.2 + 1.0));
    final dy3 = size.height * (0.85 - 0.12 * math.cos(t * 1.2));
    final radius3 = size.width * 0.80;

    final paint3 = Paint()
      ..shader = RadialGradient(
        colors: [
          const Color(0xFF9333EA).withOpacity(0.15),
          Colors.transparent,
        ],
        stops: const [0.0, 0.50],
      ).createShader(Rect.fromCircle(center: Offset(dx3, dy3), radius: radius3));

    canvas.drawCircle(Offset(dx3, dy3), radius3, paint3);
  }

  @override
  bool shouldRepaint(covariant _AuroraPainter oldDelegate) =>
      oldDelegate.progress != progress || oldDelegate.themeColor != themeColor;
}

class _TechGridPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.white.withOpacity(0.035)
      ..strokeWidth = 1.0;

    const spacing = 32.0;

    for (double x = 0; x < size.width; x += spacing) {
      for (double y = 0; y < size.height; y += spacing) {
        canvas.drawCircle(Offset(x, y), 0.75, paint);
      }
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
