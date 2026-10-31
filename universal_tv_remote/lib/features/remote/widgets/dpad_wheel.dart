import 'package:flutter/material.dart';
import '../../../core/haptics.dart';
import '../../../core/theme.dart';

/// Premium Circular Directional Pad Wheel with Concentric Grooves & Spring Center OK
class DpadWheel extends StatelessWidget {
  final VoidCallback onUp;
  final VoidCallback onDown;
  final VoidCallback onLeft;
  final VoidCallback onRight;
  final VoidCallback onCenter;
  final double size;

  const DpadWheel({
    super.key,
    required this.onUp,
    required this.onDown,
    required this.onLeft,
    required this.onRight,
    required this.onCenter,
    this.size = 230,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: const Color(0xFF0D1322),
        border: Border.all(color: const Color(0xFF1E293B), width: 2),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.65),
            blurRadius: 24,
            offset: const Offset(0, 8),
          ),
          BoxShadow(
            color: AppTokens.primary.withOpacity(0.12),
            blurRadius: 36,
            spreadRadius: 2,
          ),
        ],
      ),
      child: Stack(
        alignment: Alignment.center,
        children: [
          // Concentric micro-groove ring for luxury haptic look
          Container(
            width: size * 0.72,
            height: size * 0.72,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              border: Border.all(
                color: Colors.white.withOpacity(0.04),
                width: 1,
              ),
            ),
          ),

          // UP
          Positioned(
            top: 4,
            child: _AnimatedDpadWedge(
              icon: Icons.keyboard_arrow_up_rounded,
              onTap: onUp,
              width: 82,
              height: 60,
            ),
          ),
          // DOWN
          Positioned(
            bottom: 4,
            child: _AnimatedDpadWedge(
              icon: Icons.keyboard_arrow_down_rounded,
              onTap: onDown,
              width: 82,
              height: 60,
            ),
          ),
          // LEFT
          Positioned(
            left: 4,
            child: _AnimatedDpadWedge(
              icon: Icons.keyboard_arrow_left_rounded,
              onTap: onLeft,
              width: 60,
              height: 82,
            ),
          ),
          // RIGHT
          Positioned(
            right: 4,
            child: _AnimatedDpadWedge(
              icon: Icons.keyboard_arrow_right_rounded,
              onTap: onRight,
              width: 60,
              height: 82,
            ),
          ),
          // CENTER OK BUTTON
          _AnimatedCenterOk(
            size: size * 0.38,
            onTap: onCenter,
          ),
        ],
      ),
    );
  }
}

class _AnimatedDpadWedge extends StatefulWidget {
  final IconData icon;
  final VoidCallback onTap;
  final double width;
  final double height;

  const _AnimatedDpadWedge({
    required this.icon,
    required this.onTap,
    required this.width,
    required this.height,
  });

  @override
  State<_AnimatedDpadWedge> createState() => _AnimatedDpadWedgeState();
}

class _AnimatedDpadWedgeState extends State<_AnimatedDpadWedge> {
  bool _pressed = false;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTapDown: (_) {
        setState(() => _pressed = true);
        HapticsService.feedback(HapticType.light);
      },
      onTapUp: (_) {
        setState(() => _pressed = false);
        widget.onTap();
      },
      onTapCancel: () => setState(() => _pressed = false),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 100),
        width: widget.width,
        height: widget.height,
        decoration: BoxDecoration(
          color: _pressed ? AppTokens.primary.withOpacity(0.25) : Colors.transparent,
          borderRadius: BorderRadius.circular(AppTokens.radiusMd),
        ),
        child: Center(
          child: AnimatedScale(
            scale: _pressed ? 0.88 : 1.0,
            duration: const Duration(milliseconds: 100),
            child: Icon(
              widget.icon,
              size: 34,
              color: _pressed ? const Color(0xFF38BDF8) : AppTokens.textSecondary,
            ),
          ),
        ),
      ),
    );
  }
}

class _AnimatedCenterOk extends StatefulWidget {
  final double size;
  final VoidCallback onTap;

  const _AnimatedCenterOk({
    required this.size,
    required this.onTap,
  });

  @override
  State<_AnimatedCenterOk> createState() => _AnimatedCenterOkState();
}

class _AnimatedCenterOkState extends State<_AnimatedCenterOk>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late final Animation<double> _scale;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 100),
      reverseDuration: const Duration(milliseconds: 200),
    );
    _scale = Tween<double>(begin: 1.0, end: 0.90).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeOutBack),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _scale,
      builder: (context, child) => Transform.scale(
        scale: _scale.value,
        child: child,
      ),
      child: GestureDetector(
        onTapDown: (_) {
          _controller.forward();
          HapticsService.feedback(HapticType.medium);
        },
        onTapUp: (_) {
          _controller.reverse();
          widget.onTap();
        },
        onTapCancel: () => _controller.reverse(),
        child: Container(
          width: widget.size,
          height: widget.size,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            gradient: const RadialGradient(
              colors: [
                Color(0xFF3B82F6),
                Color(0xFF2563EB),
                Color(0xFF1E3A8A),
              ],
              stops: [0.0, 0.55, 1.0],
            ),
            border: Border.all(color: const Color(0xFF93C5FD), width: 1.8),
            boxShadow: [
              BoxShadow(
                color: const Color(0xFF2563EB).withOpacity(0.55),
                blurRadius: 18,
                spreadRadius: 1.5,
              ),
              BoxShadow(
                color: Colors.black.withOpacity(0.5),
                blurRadius: 8,
                offset: const Offset(0, 3),
              ),
            ],
          ),
          child: const Center(
            child: Text(
              'OK',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w900,
                letterSpacing: 1.2,
                color: Colors.white,
              ),
            ),
          ),
        ),
      ),
    );
  }
}
