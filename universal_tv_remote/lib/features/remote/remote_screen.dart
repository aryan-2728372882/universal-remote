import 'dart:async';
import 'package:flutter/material.dart';
import '../../adapters/remote_adapter.dart';
import '../../core/haptics.dart';
import '../../core/widgets/app_logo.dart';
import '../../data/models/device.dart';
import '../../services/sleep_timer_service.dart';
import 'widgets/ai_voice_widget.dart';
import 'widgets/animated_ambient_background.dart';
import 'widgets/apps_hub_widget.dart';
import 'widgets/dpad_wheel.dart';
import 'widgets/navigation_dock.dart';
import 'widgets/oled_status_display.dart';
import 'widgets/remote_settings_sheet.dart';
import 'widgets/tactile_button.dart';
import 'widgets/touchpad_surface.dart';

/// AAA Premium Animated TV Remote Control - India Edition
class RemoteScreen extends StatefulWidget {
  final Device device;
  final RemoteAdapter adapter;
  final SleepTimerService sleepTimer;
  final VoidCallback onOpenConnectionDoctor;
  final VoidCallback onOpenSleepTimer;
  final VoidCallback onBack;

  const RemoteScreen({
    super.key,
    required this.device,
    required this.adapter,
    required this.sleepTimer,
    required this.onOpenConnectionDoctor,
    required this.onOpenSleepTimer,
    required this.onBack,
  });

  @override
  State<RemoteScreen> createState() => _RemoteScreenState();
}

class _RemoteScreenState extends State<RemoteScreen> {
  // Theme & Settings
  String _activeTheme = 'cyan';
  bool _bgAnimActive = true;
  bool _hapticsEnabled = true;
  bool _soundEnabled = true;

  // Navigation Dock Tab: Remote | Settings | AI Voice | Apps
  NavTab _navTab = NavTab.remote;

  // Pro Subscription State
  bool _isPro = false;

  // Remote UI Modes: 'dpad' | 'touch' | 'numpad'
  String _currentMode = 'dpad';

  // Remote Dynamic States
  bool _isPoweredOn = true;
  bool _isMuted = false;
  int _currentVolume = 45;
  String _currentAction = 'Ready • Select App or Key';
  String? _toastMessage;
  Timer? _toastTimer;

  // Text / Search focus
  final TextEditingController _textController = TextEditingController();
  final FocusNode _textFocusNode = FocusNode();
  bool _isKeyboardActive = false;
  Timer? _focusTimer;

  @override
  void initState() {
    super.initState();
    _textFocusNode.addListener(() {
      if (mounted) setState(() => _isKeyboardActive = _textFocusNode.hasFocus);
    });
    widget.adapter.connect(widget.device);
  }

  @override
  void dispose() {
    _focusTimer?.cancel();
    _toastTimer?.cancel();
    _textController.dispose();
    _textFocusNode.dispose();
    super.dispose();
  }

  Color _getThemeGlow() {
    switch (_activeTheme) {
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

  void _showToast(String message) {
    setState(() => _toastMessage = message);
    _toastTimer?.cancel();
    _toastTimer = Timer(const Duration(seconds: 2), () {
      if (mounted) setState(() => _toastMessage = null);
    });
  }

  void _send(RemoteKey key, String label, {KeyPress press = KeyPress.tap}) {
    if (!_isPoweredOn && key != RemoteKey.power) return;

    if (_hapticsEnabled) {
      HapticsService.feedback(key == RemoteKey.enter || key == RemoteKey.power
          ? HapticType.heavy
          : HapticType.light);
    }

    setState(() => _currentAction = 'Sent: $label');
    _showToast('TV Command: $label');

    if (key == RemoteKey.volumeUp) {
      setState(() => _currentVolume = (_currentVolume + 5).clamp(0, 100));
    } else if (key == RemoteKey.volumeDown) {
      setState(() => _currentVolume = (_currentVolume - 5).clamp(0, 100));
    }

    widget.adapter.sendKey(key, press: press);
  }

  void _handleAppLaunch(String appName, String appId) {
    if (!_isPoweredOn) return;

    if (_hapticsEnabled) {
      HapticsService.feedback(HapticType.medium);
    }

    setState(() => _currentAction = 'Launching $appName');
    _showToast('Launching $appName on TV');

    widget.adapter.launchApp(appId);

    if (appName == 'YouTube') {
      setState(() => _isKeyboardActive = true);
      _focusTimer?.cancel();
      _focusTimer = Timer(const Duration(milliseconds: 200), () {
        if (mounted) _textFocusNode.requestFocus();
      });
    }
  }

  void _togglePower() {
    if (_hapticsEnabled) HapticsService.feedback(HapticType.heavy);
    final next = !_isPoweredOn;
    setState(() {
      _isPoweredOn = next;
      _currentAction = next ? 'Smart TV Powered ON' : 'TV Standby Mode';
    });
    _showToast(next ? 'Smart TV Powered ON' : 'Smart TV Powered OFF');
    widget.adapter.sendKey(RemoteKey.power);
  }

  void _toggleMute() {
    if (!_isPoweredOn) return;
    if (_hapticsEnabled) HapticsService.feedback(HapticType.medium);
    final next = !_isMuted;
    setState(() {
      _isMuted = next;
      _currentAction = next ? 'Audio Muted' : 'Audio Unmuted';
    });
    _showToast(next ? 'TV Muted' : 'TV Unmuted');
    widget.adapter.sendKey(RemoteKey.mute);
  }

  void _openSettings() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) {
        return RemoteSettingsSheet(
          activeTheme: _activeTheme,
          bgAnimEnabled: _bgAnimActive,
          hapticsEnabled: _hapticsEnabled,
          soundEnabled: _soundEnabled,
          onThemeChanged: (themeId) {
            setState(() => _activeTheme = themeId);
            _showToast('Theme set to ${themeId.toUpperCase()}');
          },
          onBgAnimToggled: (enabled) {
            setState(() => _bgAnimActive = enabled);
            _showToast(enabled ? 'Particles Enabled' : 'Particles Paused');
          },
          onHapticsToggled: (enabled) {
            setState(() => _hapticsEnabled = enabled);
            _showToast(enabled ? 'Haptics Enabled' : 'Haptics Disabled');
          },
          onSoundToggled: (enabled) {
            setState(() => _soundEnabled = enabled);
            _showToast(enabled ? 'Sound FX Enabled' : 'Sound FX Disabled');
          },
          onOpenDoctor: widget.onOpenConnectionDoctor,
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final themeGlow = _getThemeGlow();

    return Scaffold(
      backgroundColor: const Color(0xFF07090E),
      body: AnimatedAmbientBackground(
        showGrid: true,
        animActive: _bgAnimActive,
        activeTheme: _activeTheme,
        child: SafeArea(
          child: Stack(
            children: [
              Column(
                children: [
                  // 1. Top Header Bar
                  _buildHeaderBar(themeGlow),

                  // 2. Scrollable Content (Remote | Apps | AI Voice)
                  Expanded(
                    child: SingleChildScrollView(
                      physics: const BouncingScrollPhysics(),
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                      child: Center(
                        child: ConstrainedBox(
                          constraints: const BoxConstraints(maxWidth: 400),
                          child: _navTab == NavTab.apps
                              ? AppsHubWidget(onLaunchApp: _handleAppLaunch)
                              : _navTab == NavTab.voice
                                  ? (!_isPro
                                      ? _buildVoiceLockedView(themeGlow)
                                      : AiVoiceWidget(
                                          onVoiceCommand: (cmd, val) {
                                            if (cmd == 'app_launch') {
                                              _handleAppLaunch(val, val);
                                            } else if (cmd == 'mute') {
                                              _toggleMute();
                                            } else if (cmd == 'volume') {
                                              final target = int.tryParse(val) ?? 50;
                                              setState(() => _currentVolume = target);
                                              widget.adapter.setVolume(target);
                                              _showToast('Volume set to $target%');
                                            }
                                          },
                                        ))
                                  : Container(
                            padding: const EdgeInsets.all(20),
                            decoration: BoxDecoration(
                              color: const Color(0xFF161B2A).withOpacity(0.92),
                              borderRadius: BorderRadius.circular(44),
                              border: Border.all(
                                color: Colors.white.withOpacity(0.12),
                                width: 1.5,
                              ),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withOpacity(0.75),
                                  blurRadius: 40,
                                  offset: const Offset(0, 20),
                                ),
                                BoxShadow(
                                  color: themeGlow.withOpacity(0.08),
                                  blurRadius: 30,
                                ),
                              ],
                            ),
                            child: Column(
                              children: [
                                // OLED Mini Display
                                OledStatusDisplay(
                                  deviceName: widget.device.name,
                                  currentAction: _currentAction,
                                  modeName: _currentMode,
                                  volume: _currentVolume,
                                  accentGlow: themeGlow,
                                ),

                                const SizedBox(height: 16),

                                // Mode Switcher Tabs (D-Pad, Touchpad, Numbers)
                                _buildModeTabs(themeGlow),

                                const SizedBox(height: 16),

                                // Power & Mute Bar
                                _buildPowerMuteBar(themeGlow),

                                const SizedBox(height: 16),

                                // Active Mode Panel (D-Pad, Touchpad, or Numpad) - Apps are strictly in Apps section
                                if (_currentMode == 'dpad')
                                  _buildDpadPanel(themeGlow)
                                else if (_currentMode == 'touch')
                                  _buildTouchpadPanel(themeGlow)
                                else
                                  _buildNumpadPanel(themeGlow),

                                const SizedBox(height: 14),

                                // Keyboard input drawer if active
                                if (_isKeyboardActive) _buildKeyboardInputBar(themeGlow),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),

                  // 3. Bottom Navigation Dock (4 buttons as shown in screenshot: Remote, Ambilight, AI Voice, Apps)
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
                    child: NavigationDock(
                      activeTab: _navTab,
                      onSelectTab: (tab) {
                        if (tab == NavTab.settings) {
                          _openSettings();
                        } else {
                          setState(() => _navTab = tab);
                        }
                      },
                    ),
                  ),
                ],
              ),

              // Floating Toast Notification Banner
              if (_toastMessage != null)
                Positioned(
                  bottom: 24,
                  left: 20,
                  right: 20,
                  child: Center(
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
                      decoration: BoxDecoration(
                        color: const Color(0xFF0F172A).withOpacity(0.95),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: themeGlow.withOpacity(0.6)),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.7),
                            blurRadius: 20,
                            offset: const Offset(0, 6),
                          ),
                          BoxShadow(
                            color: themeGlow.withOpacity(0.25),
                            blurRadius: 15,
                          ),
                        ],
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text('⚡', style: TextStyle(fontSize: 14, color: themeGlow)),
                          const SizedBox(width: 8),
                          Text(
                            _toastMessage!,
                            style: const TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w800,
                              color: Colors.white,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeaderBar(Color themeGlow) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      child: Row(
        children: [
          IconButton(
            visualDensity: VisualDensity.compact,
            icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 18),
            color: Colors.white70,
            onPressed: widget.onBack,
          ),
          Expanded(
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const AppLogo(size: 22),
                const SizedBox(width: 8),
                const Text(
                  'INDIA TV REMOTE',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w900,
                    letterSpacing: 1.2,
                    color: Colors.white,
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
          IconButton(
            visualDensity: VisualDensity.compact,
            icon: Icon(_soundEnabled ? Icons.volume_up_rounded : Icons.volume_off_rounded, size: 18),
            color: Colors.white70,
            onPressed: () {
              setState(() => _soundEnabled = !_soundEnabled);
              _showToast(_soundEnabled ? 'Remote Audio Enabled' : 'Remote Audio Muted');
            },
          ),
          IconButton(
            visualDensity: VisualDensity.compact,
            icon: const Icon(Icons.settings_outlined, size: 18),
            color: Colors.white70,
            onPressed: _openSettings,
          ),
        ],
      ),
    );
  }

  Widget _buildModeTabs(Color themeGlow) {
    return Container(
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: Colors.black.withOpacity(0.3),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withOpacity(0.05)),
      ),
      child: Row(
        children: [
          _buildTabBtn('D-Pad', 'dpad', themeGlow),
          _buildTabBtn('Touchpad', 'touch', themeGlow),
          _buildTabBtn('Numbers', 'numpad', themeGlow),
        ],
      ),
    );
  }

  Widget _buildTabBtn(String label, String modeId, Color themeGlow) {
    final isActive = _currentMode == modeId;
    return Expanded(
      child: GestureDetector(
        onTap: () {
          setState(() => _currentMode = modeId);
          _showToast('Switched to $label');
        },
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 160),
          padding: const EdgeInsets.symmetric(vertical: 8),
          decoration: BoxDecoration(
            color: isActive ? const Color(0xFF252D42) : Colors.transparent,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: isActive ? Colors.white.withOpacity(0.12) : Colors.transparent,
            ),
            boxShadow: isActive
                ? [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.4),
                      blurRadius: 8,
                    ),
                  ]
                : null,
          ),
          child: Center(
            child: Text(
              label,
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w800,
                color: isActive ? Colors.white : const Color(0xFF8A99AD),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildPowerMuteBar(Color themeGlow) {
    return Row(
      children: [
        // Power Toggle Button
        Expanded(
          child: TactileButton(
            height: 48,
            backgroundColor: _isPoweredOn
                ? const Color(0xFF00E676).withOpacity(0.15)
                : const Color(0xFFFF5252).withOpacity(0.15),
            borderColor: _isPoweredOn
                ? const Color(0xFF00E676).withOpacity(0.4)
                : const Color(0xFFFF5252).withOpacity(0.4),
            borderRadius: BorderRadius.circular(14),
            onTap: _togglePower,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  Icons.power_settings_new_rounded,
                  size: 20,
                  color: _isPoweredOn ? const Color(0xFF00E676) : const Color(0xFFFF5252),
                ),
                const SizedBox(width: 8),
                Text(
                  _isPoweredOn ? 'TV ON' : 'TV OFF',
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w900,
                    letterSpacing: 1.0,
                    color: _isPoweredOn ? const Color(0xFF00E676) : const Color(0xFFFF5252),
                  ),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(width: 10),
        // Mute Toggle Button
        TactileButton(
          width: 54,
          height: 48,
          backgroundColor: _isMuted
              ? const Color(0xFFFF5252).withOpacity(0.2)
              : const Color(0xFF1E2538),
          borderColor: _isMuted ? const Color(0xFFFF5252) : Colors.white.withOpacity(0.1),
          borderRadius: BorderRadius.circular(14),
          onTap: _toggleMute,
          child: Icon(
            _isMuted ? Icons.volume_off_rounded : Icons.volume_up_rounded,
            size: 22,
            color: _isMuted ? const Color(0xFFFF5252) : Colors.white,
          ),
        ),
      ],
    );
  }

  Widget _buildDpadPanel(Color themeGlow) {
    return Column(
      children: [
        // D-Pad Circular Ring Wheel
        Center(
          child: DpadWheel(
            size: 220,
            onUp: () => _send(RemoteKey.up, 'Up'),
            onDown: () => _send(RemoteKey.down, 'Down'),
            onLeft: () => _send(RemoteKey.left, 'Left'),
            onRight: () => _send(RemoteKey.right, 'Right'),
            onCenter: () => _send(RemoteKey.enter, 'OK'),
          ),
        ),

        const SizedBox(height: 16),

        // Action Row: Back, Home, Menu
        Row(
          children: [
            Expanded(
              child: TactileButton(
                height: 44,
                borderRadius: BorderRadius.circular(14),
                onTap: () => _send(RemoteKey.back, 'Back'),
                child: const Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.arrow_back_rounded, size: 16, color: Colors.white),
                    SizedBox(width: 4),
                    Text('Back', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800)),
                  ],
                ),
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: TactileButton(
                height: 44,
                borderRadius: BorderRadius.circular(14),
                onTap: () => _send(RemoteKey.home, 'Home'),
                child: const Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.home_rounded, size: 16, color: Colors.white),
                    SizedBox(width: 4),
                    Text('Home', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800)),
                  ],
                ),
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: TactileButton(
                height: 44,
                borderRadius: BorderRadius.circular(14),
                onTap: () => _send(RemoteKey.menu, 'Menu'),
                child: const Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.menu_rounded, size: 16, color: Colors.white),
                    SizedBox(width: 4),
                    Text('Menu', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800)),
                  ],
                ),
              ),
            ),
          ],
        ),

        const SizedBox(height: 16),

        // Volume & Channel Rockers Grid
        Row(
          children: [
            // Volume Rocker
            Expanded(
              child: Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: Colors.black.withOpacity(0.25),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: Colors.white.withOpacity(0.04)),
                ),
                child: Column(
                  children: [
                    const Text(
                      'VOLUME',
                      style: TextStyle(fontSize: 9, fontWeight: FontWeight.w800, color: Color(0xFF8A99AD)),
                    ),
                    const SizedBox(height: 6),
                    Row(
                      children: [
                        Expanded(
                          child: TactileButton(
                            height: 42,
                            borderRadius: BorderRadius.circular(12),
                            onTap: () => _send(RemoteKey.volumeDown, 'VolDown'),
                            child: const Text('-', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900)),
                          ),
                        ),
                        const SizedBox(width: 6),
                        Expanded(
                          child: TactileButton(
                            height: 42,
                            borderRadius: BorderRadius.circular(12),
                            onTap: () => _send(RemoteKey.volumeUp, 'VolUp'),
                            child: const Text('+', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900)),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(width: 10),
            // Channel Rocker
            Expanded(
              child: Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: Colors.black.withOpacity(0.25),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: Colors.white.withOpacity(0.04)),
                ),
                child: Column(
                  children: [
                    const Text(
                      'CHANNEL',
                      style: TextStyle(fontSize: 9, fontWeight: FontWeight.w800, color: Color(0xFF8A99AD)),
                    ),
                    const SizedBox(height: 6),
                    Row(
                      children: [
                        Expanded(
                          child: TactileButton(
                            height: 42,
                            borderRadius: BorderRadius.circular(12),
                            onTap: () => _send(RemoteKey.channelDown, 'ChanDown'),
                            child: const Icon(Icons.keyboard_arrow_down_rounded, size: 22),
                          ),
                        ),
                        const SizedBox(width: 6),
                        Expanded(
                          child: TactileButton(
                            height: 42,
                            borderRadius: BorderRadius.circular(12),
                            onTap: () => _send(RemoteKey.channelUp, 'ChanUp'),
                            child: const Icon(Icons.keyboard_arrow_up_rounded, size: 22),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),

        const SizedBox(height: 16),

        // Media Playback Row (Rewind, Play/Pause, Fast-Forward, Live TV, Voice Assistant)
        Row(
          children: [
            Expanded(
              child: TactileButton(
                height: 44,
                borderRadius: BorderRadius.circular(12),
                onTap: () => _send(RemoteKey.rewind, 'Rewind'),
                child: const Icon(Icons.fast_rewind_rounded, size: 18),
              ),
            ),
            const SizedBox(width: 6),
            Expanded(
              child: TactileButton(
                height: 44,
                borderRadius: BorderRadius.circular(12),
                onTap: () => _send(RemoteKey.playPause, 'Play/Pause'),
                child: const Icon(Icons.play_arrow_rounded, size: 22, color: Color(0xFF00E676)),
              ),
            ),
            const SizedBox(width: 6),
            Expanded(
              child: TactileButton(
                height: 44,
                borderRadius: BorderRadius.circular(12),
                onTap: () => _send(RemoteKey.fastForward, 'FastForward'),
                child: const Icon(Icons.fast_forward_rounded, size: 18),
              ),
            ),
            const SizedBox(width: 6),
            Expanded(
              child: TactileButton(
                height: 44,
                borderRadius: BorderRadius.circular(12),
                onTap: () => _send(RemoteKey.input, 'Live TV'),
                child: const Icon(Icons.tv_rounded, size: 18, color: Color(0xFFFFA000)),
              ),
            ),
            const SizedBox(width: 6),
            Expanded(
              child: TactileButton(
                height: 44,
                glowColor: themeGlow,
                borderRadius: BorderRadius.circular(12),
                onTap: () => _send(RemoteKey.menu, 'Voice Assistant'),
                child: Icon(Icons.mic_rounded, size: 18, color: themeGlow),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildTouchpadPanel(Color themeGlow) {
    return Column(
      children: [
        TouchpadSurface(
          height: 250,
          onMove: (dx, dy) => widget.adapter.pointerMove(dx, dy),
          onTap: () => _send(RemoteKey.enter, 'Touch Select'),
        ),
        const SizedBox(height: 14),
        Row(
          children: [
            Expanded(
              child: TactileButton(
                height: 46,
                borderRadius: BorderRadius.circular(14),
                onTap: () => _send(RemoteKey.back, 'Back'),
                child: const Text('↩ Back', style: TextStyle(fontWeight: FontWeight.w800)),
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: TactileButton(
                height: 46,
                borderRadius: BorderRadius.circular(14),
                onTap: () => _send(RemoteKey.home, 'Home'),
                child: const Text('🏠 Home', style: TextStyle(fontWeight: FontWeight.w800)),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildNumpadPanel(Color themeGlow) {
    final keys = [
      '1', '2', '3',
      '4', '5', '6',
      '7', '8', '9',
      '⌫', '0', 'OK'
    ];

    return Column(
      children: [
        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 3,
            crossAxisSpacing: 8,
            mainAxisSpacing: 8,
            childAspectRatio: 1.8,
          ),
          itemCount: keys.length,
          itemBuilder: (context, index) {
            final k = keys[index];
            final isOk = k == 'OK';
            final isClear = k == '⌫';

            return TactileButton(
              borderRadius: BorderRadius.circular(14),
              backgroundColor: isOk ? const Color(0xFF2563EB) : null,
              glowColor: isOk ? themeGlow : null,
              onTap: () {
                if (isOk) {
                  _send(RemoteKey.enter, 'Num Enter');
                } else if (isClear) {
                  _send(RemoteKey.back, 'Num Clear');
                } else {
                  final remoteNum = RemoteKey.values.firstWhere(
                    (rk) => rk.name == 'num$k',
                    orElse: () => RemoteKey.enter,
                  );
                  _send(remoteNum, 'Num $k');
                }
              },
              child: Text(
                k,
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w900,
                  color: isClear ? Colors.amber : Colors.white,
                ),
              ),
            );
          },
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: TactileButton(
                height: 44,
                borderRadius: BorderRadius.circular(14),
                onTap: () => _send(RemoteKey.back, 'Back'),
                child: const Text('↩ Back', style: TextStyle(fontWeight: FontWeight.w800)),
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: TactileButton(
                height: 44,
                borderRadius: BorderRadius.circular(14),
                onTap: () => _send(RemoteKey.home, 'Home'),
                child: const Text('🏠 Home', style: TextStyle(fontWeight: FontWeight.w800)),
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: TactileButton(
                height: 44,
                borderRadius: BorderRadius.circular(14),
                onTap: _toggleMute,
                child: const Text('🔇 Mute', style: TextStyle(fontWeight: FontWeight.w800)),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildKeyboardInputBar(Color themeGlow) {
    return Container(
      margin: const EdgeInsets.only(top: 8),
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: const Color(0xFF0F172A),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: themeGlow.withOpacity(0.5)),
      ),
      child: Row(
        children: [
          Expanded(
            child: TextField(
              controller: _textController,
              focusNode: _textFocusNode,
              style: const TextStyle(color: Colors.white, fontSize: 13),
              decoration: const InputDecoration(
                hintText: 'Type text for Smart TV search...',
                hintStyle: TextStyle(color: Colors.white38, fontSize: 12),
                border: InputBorder.none,
                isDense: true,
              ),
              onSubmitted: (val) {
                if (val.isNotEmpty) {
                  widget.adapter.typeText(val);
                  _showToast('Typed: $val');
                  _textController.clear();
                }
              },
            ),
          ),
          IconButton(
            icon: Icon(Icons.send_rounded, color: themeGlow, size: 20),
            onPressed: () {
              final val = _textController.text;
              if (val.isNotEmpty) {
                widget.adapter.typeText(val);
                _showToast('Typed: $val');
                _textController.clear();
              }
            },
          ),
        ],
      ),
    );
  }

  Widget _buildVoiceLockedView(Color themeGlow) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
      margin: const EdgeInsets.symmetric(vertical: 20),
      decoration: BoxDecoration(
        color: const Color(0xFF0C101C),
        borderRadius: BorderRadius.circular(32),
        border: Border.all(color: const Color(0xFF00F2FE).withOpacity(0.3)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.7),
            blurRadius: 30,
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 68,
            height: 68,
            decoration: BoxDecoration(
              color: const Color(0xFF082F3B),
              shape: BoxShape.circle,
              border: Border.all(color: const Color(0xFF00F2FE).withOpacity(0.5)),
              boxShadow: [
                BoxShadow(
                  color: const Color(0xFF00F2FE).withOpacity(0.3),
                  blurRadius: 20,
                ),
              ],
            ),
            child: const Icon(Icons.lock_rounded, size: 32, color: Color(0xFF00F2FE)),
          ),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: const Color(0xFF00F2FE).withOpacity(0.12),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xFF00F2FE).withOpacity(0.35)),
            ),
            child: const Text(
              'PRO FEATURE',
              style: TextStyle(
                color: Color(0xFF00F2FE),
                fontSize: 10,
                fontWeight: FontWeight.w900,
                letterSpacing: 1,
              ),
            ),
          ),
          const SizedBox(height: 12),
          const Text(
            'AI Voice Assistant',
            style: TextStyle(
              color: Colors.white,
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            'Control your TV hands-free with natural speech recognition (e.g. "Play Hotstar cricket" or "Mute volume").',
            textAlign: TextAlign.center,
            style: TextStyle(
              color: Color(0xFF94A3B8),
              fontSize: 12,
              height: 1.4,
            ),
          ),
          const SizedBox(height: 24),
          SizedBox(
            width: double.infinity,
            height: 48,
            child: ElevatedButton.icon(
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF00F2FE),
                foregroundColor: Colors.black,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              ),
              onPressed: () {
                setState(() => _isPro = true);
                _showToast('⭐ Universal Remote PRO Unlocked! All Features Active.');
              },
              icon: const Icon(Icons.auto_awesome_rounded, size: 18),
              label: const Text(
                'Unlock AI Voice (from ₹49/month)',
                style: TextStyle(fontWeight: FontWeight.w900, fontSize: 13),
              ),
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            'Honest pricing • ₹49/mo or ₹299 lifetime • Zero weekly traps',
            style: TextStyle(color: Color(0xFF64748B), fontSize: 10),
          ),
        ],
      ),
    );
  }
}
