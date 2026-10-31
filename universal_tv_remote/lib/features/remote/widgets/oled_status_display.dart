import 'package:flutter/material.dart';

/// OLED Mini Display with Scanline Animation, Live Volume Bar & Status Indicators
class OledStatusDisplay extends StatefulWidget {
  final String deviceName;
  final String currentAction;
  final String modeName;
  final int volume;
  final Color accentGlow;

  const OledStatusDisplay({
    super.key,
    required this.deviceName,
    required this.currentAction,
    required this.modeName,
    required this.volume,
    this.accentGlow = const Color(0xFF00F2FE),
  });

  @override
  State<OledStatusDisplay> createState() => _OledStatusDisplayState();
}

class _OledStatusDisplayState extends State<OledStatusDisplay>
    with SingleTickerProviderStateMixin {
  late final AnimationController _scanlineController;

  @override
  void initState() {
    super.initState();
    _scanlineController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 5),
    )..repeat();
  }

  @override
  void dispose() {
    _scanlineController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFF05070A),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: Colors.white.withOpacity(0.08)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.8),
            blurRadius: 16,
            offset: const Offset(0, 4),
          ),
          BoxShadow(
            color: widget.accentGlow.withOpacity(0.08),
            blurRadius: 20,
          ),
        ],
      ),
      child: Stack(
        children: [
          // Scanline light sweep
          Positioned.fill(
            child: AnimatedBuilder(
              animation: _scanlineController,
              builder: (context, _) {
                return FractionallySizedBox(
                  alignment: Alignment(-2.0 + _scanlineController.value * 4.0, 0),
                  widthFactor: 0.35,
                  child: Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [
                          Colors.transparent,
                          Colors.white.withOpacity(0.04),
                          Colors.transparent,
                        ],
                      ),
                    ),
                  ),
                );
              },
            ),
          ),

          // OLED Content
          Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // 1. Top row: Connection status + Battery
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Container(
                        width: 7,
                        height: 7,
                        decoration: const BoxDecoration(
                          shape: BoxShape.circle,
                          color: Color(0xFF00E676),
                          boxShadow: [
                            BoxShadow(
                              color: Color(0xFF00E676),
                              blurRadius: 8,
                              spreadRadius: 1,
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 6),
                      Text(
                        widget.deviceName,
                        style: const TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                          color: Color(0xFF00E676),
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                  const Text(
                    '⚡ 98%',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: Color(0xFF8A99AD),
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 8),

              // 2. Main Action Display + Mode Badge
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Text(
                      widget.currentAction,
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w800,
                        color: Color(0xFFF0F4F8),
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: widget.accentGlow.withOpacity(0.15),
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(color: widget.accentGlow.withOpacity(0.35)),
                    ),
                    child: Text(
                      widget.modeName.toUpperCase(),
                      style: TextStyle(
                        fontSize: 9,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 0.6,
                        color: widget.accentGlow,
                      ),
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 10),

              // 3. Volume Indicator Progress Bar
              Row(
                children: [
                  const Text(
                    'Vol',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                      color: Color(0xFF8A99AD),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Container(
                      height: 5,
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.08),
                        borderRadius: BorderRadius.circular(3),
                      ),
                      child: FractionallySizedBox(
                        alignment: Alignment.centerLeft,
                        widthFactor: (widget.volume.clamp(0, 100)) / 100.0,
                        child: Container(
                          decoration: BoxDecoration(
                            color: widget.accentGlow,
                            borderRadius: BorderRadius.circular(3),
                            boxShadow: [
                              BoxShadow(
                                color: widget.accentGlow,
                                blurRadius: 8,
                                spreadRadius: 0.5,
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    '${widget.volume}%',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w800,
                      fontFamily: 'monospace',
                      color: Colors.white.withOpacity(0.9),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }
}
