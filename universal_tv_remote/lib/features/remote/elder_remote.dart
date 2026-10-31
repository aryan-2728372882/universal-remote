import 'package:flutter/material.dart';
import '../../adapters/remote_adapter.dart';
import '../../core/haptics.dart';
import '../../data/models/device.dart';
import 'widgets/tactile_button.dart';

/// Simplified High-Contrast Elder Mode Remote Screen
/// Tailored specifically for Smart TVs (streaming apps):
/// - Giant Power button
/// - Giant Volume controls
/// - Giant escape buttons (HOME & BACK) to rescue seniors stuck in app sub-menus
/// - Quick Play/Pause & Mute
/// - ZERO linear broadcast channel buttons (useless on Android TV / webOS)
class ElderRemoteScreen extends StatelessWidget {
  final Device device;
  final RemoteAdapter adapter;
  final VoidCallback onExitElderMode;

  const ElderRemoteScreen({
    super.key,
    required this.device,
    required this.adapter,
    required this.onExitElderMode,
  });

  void _send(RemoteKey key) {
    HapticsService.feedback(HapticType.heavy);
    adapter.sendKey(key);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black, // Pure black for extreme contrast
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
          child: Column(
            children: [
              // Header
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Row(
                      children: [
                        const Icon(Icons.tv_rounded, color: Colors.amber, size: 22),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            device.name,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.w900,
                              color: Colors.white,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  TextButton.icon(
                    onPressed: onExitElderMode,
                    icon: const Icon(Icons.close_fullscreen_rounded, color: Colors.amber, size: 18),
                    label: const Text(
                      'Standard Mode',
                      style: TextStyle(color: Colors.amber, fontWeight: FontWeight.bold, fontSize: 13),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),

              // 1. Giant Power Button
              TactileButton(
                height: 68,
                backgroundColor: const Color(0xFFDC2626),
                borderColor: Colors.white,
                borderRadius: BorderRadius.circular(20),
                onTap: () => _send(RemoteKey.power),
                child: const Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.power_settings_new_rounded, size: 36, color: Colors.white),
                    SizedBox(width: 12),
                    Text(
                      'TV POWER',
                      style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: Colors.white, letterSpacing: 1),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 14),

              // 2. Main 2-Column Grid: Volume on Left, Streaming Escape on Right
              Expanded(
                child: Row(
                  children: [
                    // Left Column: Giant Volume Rockers
                    Expanded(
                      child: Column(
                        children: [
                          Expanded(
                            child: TactileButton(
                              backgroundColor: const Color(0xFF1E293B),
                              borderColor: Colors.white70,
                              borderRadius: BorderRadius.circular(22),
                              onTap: () => _send(RemoteKey.volumeUp),
                              child: const Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Icon(Icons.volume_up_rounded, size: 48, color: Colors.white),
                                  SizedBox(height: 6),
                                  Text('VOL +', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: Colors.white)),
                                  Text('LOUDER', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: Colors.white60)),
                                ],
                              ),
                            ),
                          ),
                          const SizedBox(height: 12),
                          Expanded(
                            child: TactileButton(
                              backgroundColor: const Color(0xFF1E293B),
                              borderColor: Colors.white70,
                              borderRadius: BorderRadius.circular(22),
                              onTap: () => _send(RemoteKey.volumeDown),
                              child: const Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Icon(Icons.volume_down_rounded, size: 48, color: Colors.white),
                                  SizedBox(height: 6),
                                  Text('VOL -', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: Colors.white)),
                                  Text('QUIETER', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: Colors.white60)),
                                ],
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(width: 14),

                    // Right Column: Giant HOME & BACK (Escape buttons for seniors)
                    Expanded(
                      child: Column(
                        children: [
                          Expanded(
                            child: TactileButton(
                              backgroundColor: const Color(0xFFD97706),
                              borderColor: Colors.white,
                              borderRadius: BorderRadius.circular(22),
                              onTap: () => _send(RemoteKey.home),
                              child: const Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Icon(Icons.home_rounded, size: 48, color: Colors.white),
                                  SizedBox(height: 6),
                                  Text('HOME', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: Colors.white)),
                                  Text('GO TO APPS', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: Colors.white)),
                                ],
                              ),
                            ),
                          ),
                          const SizedBox(height: 12),
                          Expanded(
                            child: TactileButton(
                              backgroundColor: const Color(0xFF2563EB),
                              borderColor: Colors.white70,
                              borderRadius: BorderRadius.circular(22),
                              onTap: () => _send(RemoteKey.back),
                              child: const Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Icon(Icons.arrow_back_rounded, size: 48, color: Colors.white),
                                  SizedBox(height: 6),
                                  Text('BACK', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: Colors.white)),
                                  Text('PREVIOUS', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: Colors.white70)),
                                ],
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 14),

              // 3. Bottom Row: MUTE, PLAY/PAUSE, OK SELECT
              Row(
                children: [
                  Expanded(
                    child: TactileButton(
                      height: 68,
                      padding: const EdgeInsets.symmetric(horizontal: 2, vertical: 2),
                      backgroundColor: const Color(0xFF7C3AED),
                      borderColor: Colors.white60,
                      borderRadius: BorderRadius.circular(18),
                      onTap: () => _send(RemoteKey.mute),
                      child: const Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.volume_off_rounded, size: 24, color: Colors.white),
                          SizedBox(height: 2),
                          Text('MUTE', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w900, color: Colors.white)),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: TactileButton(
                      height: 68,
                      padding: const EdgeInsets.symmetric(horizontal: 2, vertical: 2),
                      backgroundColor: const Color(0xFF059669),
                      borderColor: Colors.white,
                      borderRadius: BorderRadius.circular(18),
                      onTap: () => _send(RemoteKey.playPause),
                      child: const Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.play_arrow_rounded, size: 24, color: Colors.white),
                          SizedBox(height: 2),
                          Text('PLAY/PAUSE', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w900, color: Colors.white)),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: TactileButton(
                      height: 68,
                      padding: const EdgeInsets.symmetric(horizontal: 2, vertical: 2),
                      backgroundColor: const Color(0xFF1E293B),
                      borderColor: Colors.white,
                      borderRadius: BorderRadius.circular(18),
                      onTap: () => _send(RemoteKey.enter),
                      child: const Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.check_circle_outline_rounded, size: 24, color: Colors.white),
                          SizedBox(height: 2),
                          Text('OK', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: Colors.white)),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
