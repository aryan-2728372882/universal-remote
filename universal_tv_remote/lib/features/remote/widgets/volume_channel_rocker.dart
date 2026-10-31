import 'dart:async';
import 'package:flutter/material.dart';
import '../../../core/haptics.dart';
import '../../../core/theme.dart';

/// Tactile Rocker Pill for Volume & Channels with Press-and-Hold repeat
class VerticalRockerPill extends StatefulWidget {
  final IconData topIcon;
  final IconData bottomIcon;
  final String label;
  final VoidCallback onTopTap;
  final VoidCallback onBottomTap;
  final double width;
  final double height;

  const VerticalRockerPill({
    super.key,
    required this.topIcon,
    required this.bottomIcon,
    required this.label,
    required this.onTopTap,
    required this.onBottomTap,
    this.width = 68,
    this.height = 145,
  });

  @override
  State<VerticalRockerPill> createState() => _VerticalRockerPillState();
}

class _VerticalRockerPillState extends State<VerticalRockerPill> {
  Timer? _repeatTimer;

  void _startRepeat(VoidCallback action) {
    HapticsService.feedback(HapticType.light);
    action();
    _repeatTimer?.cancel();
    _repeatTimer = Timer.periodic(const Duration(milliseconds: 160), (_) {
      HapticsService.feedback(HapticType.light);
      action();
    });
  }

  void _stopRepeat() {
    _repeatTimer?.cancel();
    _repeatTimer = null;
  }

  @override
  void dispose() {
    _repeatTimer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      width: widget.width,
      height: widget.height,
      decoration: BoxDecoration(
        color: const Color(0xFF0F172A),
        borderRadius: BorderRadius.circular(AppTokens.radiusLg),
        border: Border.all(color: AppTokens.surfaceBorder, width: 1.5),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.3),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        children: [
          // Top Button
          Expanded(
            child: GestureDetector(
              onTapDown: (_) => _startRepeat(widget.onTopTap),
              onTapUp: (_) => _stopRepeat(),
              onTapCancel: () => _stopRepeat(),
              child: Container(
                width: double.infinity,
                color: Colors.transparent,
                child: Center(
                  child: Icon(widget.topIcon, size: 24, color: AppTokens.textPrimary),
                ),
              ),
            ),
          ),
          // Middle Label
          Text(
            widget.label,
            style: const TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.w800,
              letterSpacing: 1.0,
              color: AppTokens.textMuted,
            ),
          ),
          // Bottom Button
          Expanded(
            child: GestureDetector(
              onTapDown: (_) => _startRepeat(widget.onBottomTap),
              onTapUp: (_) => _stopRepeat(),
              onTapCancel: () => _stopRepeat(),
              child: Container(
                width: double.infinity,
                color: Colors.transparent,
                child: Center(
                  child: Icon(widget.bottomIcon, size: 24, color: AppTokens.textPrimary),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
