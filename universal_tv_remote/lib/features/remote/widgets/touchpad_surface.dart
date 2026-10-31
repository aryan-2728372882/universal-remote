import 'package:flutter/material.dart';
import '../../../core/haptics.dart';
import '../../../core/theme.dart';

/// Touchpad / Swipe Surface for Pointer Navigation
class TouchpadSurface extends StatefulWidget {
  final Function(double dx, double dy) onMove;
  final VoidCallback onTap;
  final double height;

  const TouchpadSurface({
    super.key,
    required this.onMove,
    required this.onTap,
    this.height = 220,
  });

  @override
  State<TouchpadSurface> createState() => _TouchpadSurfaceState();
}

class _TouchpadSurfaceState extends State<TouchpadSurface> {
  Offset? _touchPosition;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        HapticsService.feedback(HapticType.medium);
        widget.onTap();
      },
      onPanDown: (details) {
        setState(() => _touchPosition = details.localPosition);
      },
      onPanUpdate: (details) {
        setState(() => _touchPosition = details.localPosition);
        widget.onMove(details.delta.dx, details.delta.dy);
      },
      onPanEnd: (_) {
        setState(() => _touchPosition = null);
      },
      onPanCancel: () {
        setState(() => _touchPosition = null);
      },
      child: Container(
        height: widget.height,
        width: double.infinity,
        decoration: BoxDecoration(
          color: const Color(0xFF0D1526),
          borderRadius: BorderRadius.circular(AppTokens.radiusLg),
          border: Border.all(color: AppTokens.surfaceBorder, width: 1.5),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.4),
              blurRadius: 16,
              offset: const Offset(0, 6),
            ),
          ],
        ),
        child: Stack(
          alignment: Alignment.center,
          children: [
            Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  Icons.touch_app_rounded,
                  size: 32,
                  color: AppTokens.textMuted.withOpacity(0.4),
                ),
                const SizedBox(height: 8),
                Text(
                  'Swipe to move pointer • Tap to select',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: AppTokens.textMuted.withOpacity(0.6),
                  ),
                ),
              ],
            ),
            if (_touchPosition != null)
              Positioned(
                left: _touchPosition!.dx - 20,
                top: _touchPosition!.dy - 20,
                child: Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: AppTokens.primary.withOpacity(0.25),
                    border: Border.all(color: AppTokens.primary, width: 1.5),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
