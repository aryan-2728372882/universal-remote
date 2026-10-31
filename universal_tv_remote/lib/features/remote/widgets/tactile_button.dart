import 'package:flutter/material.dart';
import '../../../core/haptics.dart';
import '../../../core/theme.dart';

/// Ultra-Tactile Hardware Button with Spring Bounce Physics, Specular Sheen & Dynamic Glow
class TactileButton extends StatefulWidget {
  final Widget child;
  final VoidCallback? onTap;
  final VoidCallback? onLongPress;
  final double? width;
  final double? height;
  final EdgeInsetsGeometry padding;
  final BorderRadius? borderRadius;
  final Color? backgroundColor;
  final Color? borderColor;
  final Color? glowColor;
  final bool isPulsing;
  final bool isSecondary;

  const TactileButton({
    super.key,
    required this.child,
    this.onTap,
    this.onLongPress,
    this.width,
    this.height,
    this.padding = const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
    this.borderRadius,
    this.backgroundColor,
    this.borderColor,
    this.glowColor,
    this.isPulsing = false,
    this.isSecondary = false,
  });

  @override
  State<TactileButton> createState() => _TactileButtonState();
}

class _TactileButtonState extends State<TactileButton> with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late final Animation<double> _scaleAnimation;
  bool _isPressed = false;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 120),
      reverseDuration: const Duration(milliseconds: 240),
    );

    // Spring press curve: dips down to 0.90, springs smoothly back on release
    _scaleAnimation = Tween<double>(begin: 1.0, end: 0.90).animate(
      CurvedAnimation(
        parent: _controller,
        curve: Curves.easeOutCubic,
        reverseCurve: Curves.easeOutBack,
      ),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _handleTapDown(TapDownDetails _) {
    setState(() => _isPressed = true);
    _controller.forward();
    HapticsService.feedback(HapticType.light);
  }

  void _handleTapUp(TapUpDetails _) {
    setState(() => _isPressed = false);
    _controller.reverse();
    widget.onTap?.call();
  }

  void _handleTapCancel() {
    setState(() => _isPressed = false);
    _controller.reverse();
  }

  @override
  Widget build(BuildContext context) {
    final radius = widget.borderRadius ?? BorderRadius.circular(AppTokens.radiusMd);
    final bg = widget.backgroundColor ??
        (widget.isSecondary ? AppTokens.surface : AppTokens.surfaceElevated);
    final border = widget.borderColor ?? AppTokens.surfaceBorder;
    final activeGlow = widget.glowColor ?? AppTokens.primary;

    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        return Transform.scale(
          scale: _scaleAnimation.value,
          child: child,
        );
      },
      child: GestureDetector(
        onTapDown: widget.onTap != null ? _handleTapDown : null,
        onTapUp: widget.onTap != null ? _handleTapUp : null,
        onTapCancel: widget.onTap != null ? _handleTapCancel : null,
        onLongPress: widget.onLongPress,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 140),
          width: widget.width,
          height: widget.height,
          padding: widget.padding,
          decoration: BoxDecoration(
            color: _isPressed ? bg.withOpacity(0.85) : bg,
            borderRadius: radius,
            border: Border.all(
              color: _isPressed
                  ? activeGlow
                  : (widget.isPulsing ? activeGlow.withOpacity(0.6) : border),
              width: _isPressed ? 1.6 : 1.0,
            ),
            boxShadow: [
              // Dynamic Glow Shadow on press or pulse
              if (_isPressed || widget.isPulsing)
                BoxShadow(
                  color: activeGlow.withOpacity(_isPressed ? 0.45 : 0.25),
                  blurRadius: _isPressed ? 20 : 12,
                  spreadRadius: _isPressed ? 1.5 : 0.5,
                ),
              // Base 3D hardware depth shadow
              BoxShadow(
                color: Colors.black.withOpacity(_isPressed ? 0.15 : 0.45),
                blurRadius: _isPressed ? 3 : 8,
                offset: _isPressed ? const Offset(0, 1) : const Offset(0, 4),
              ),
            ],
            // Precision hardware gradient with subtle top specular glint
            gradient: LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              colors: [
                _isPressed ? bg.withOpacity(0.9) : bg.withOpacity(1.0),
                bg.withOpacity(0.82),
              ],
            ),
          ),
          child: Stack(
            alignment: Alignment.center,
            children: [
              // Specular light reflection arc across top rim
              Positioned(
                top: 0,
                left: 8,
                right: 8,
                height: 1,
                child: Container(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [
                        Colors.transparent,
                        Colors.white.withOpacity(_isPressed ? 0.35 : 0.18),
                        Colors.transparent,
                      ],
                    ),
                  ),
                ),
              ),
              Center(child: widget.child),
            ],
          ),
        ),
      ),
    );
  }
}
