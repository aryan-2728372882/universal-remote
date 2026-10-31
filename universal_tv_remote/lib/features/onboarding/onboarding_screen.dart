import 'package:flutter/material.dart';
import '../../core/haptics.dart';
import '../../core/theme.dart';
import '../remote/widgets/tactile_button.dart';

/// 3-Screen Calm Onboarding
class OnboardingScreen extends StatefulWidget {
  final VoidCallback onFinish;

  const OnboardingScreen({super.key, required this.onFinish});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final PageController _pageController = PageController();
  int _currentPage = 0;

  final List<Map<String, dynamic>> _pages = [
    {
      'title': 'One Remote for Every TV',
      'subtitle': 'Control LG webOS, Android TV, Google TV, Samsung, and Roku with instant local responsiveness.',
      'icon': Icons.settings_remote_rounded,
      'color': AppTokens.primary,
    },
    {
      'title': '100% Local-First & Private',
      'subtitle': 'No accounts, no cloud relays, no tracking. Sockets communicate directly inside your home Wi-Fi.',
      'icon': Icons.security_rounded,
      'color': AppTokens.accentEmerald,
    },
    {
      'title': 'Self-Diagnosing Network',
      'subtitle': 'Built-in Connection Doctor detects router AP isolation, deep standby, and expired tokens automatically.',
      'icon': Icons.healing_rounded,
      'color': AppTokens.accentCyan,
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTokens.background,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            children: [
              // Skip button
              Align(
                alignment: Alignment.topRight,
                child: TextButton(
                  onPressed: widget.onFinish,
                  child: const Text('Skip', style: TextStyle(color: AppTokens.textMuted, fontWeight: FontWeight.w700)),
                ),
              ),

              // Page View
              Expanded(
                child: PageView.builder(
                  controller: _pageController,
                  physics: const BouncingScrollPhysics(),
                  itemCount: _pages.length,
                  onPageChanged: (i) => setState(() => _currentPage = i),
                  itemBuilder: (context, index) {
                    final p = _pages[index];
                    return Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Container(
                          width: 100,
                          height: 100,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: (p['color'] as Color).withOpacity(0.12),
                            border: Border.all(color: (p['color'] as Color).withOpacity(0.3), width: 2),
                          ),
                          child: Icon(p['icon'] as IconData, size: 48, color: p['color'] as Color),
                        ),
                        const SizedBox(height: 32),
                        Text(
                          p['title'] as String,
                          textAlign: TextAlign.center,
                          style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: AppTokens.textPrimary),
                        ),
                        const SizedBox(height: 12),
                        Text(
                          p['subtitle'] as String,
                          textAlign: TextAlign.center,
                          style: const TextStyle(fontSize: 14, color: AppTokens.textSecondary, height: 1.4),
                        ),
                      ],
                    );
                  },
                ),
              ),

              // Dots indicator
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(
                  _pages.length,
                  (i) => AnimatedContainer(
                    duration: AppTokens.durationFast,
                    margin: const EdgeInsets.symmetric(horizontal: 4),
                    width: _currentPage == i ? 24 : 8,
                    height: 8,
                    decoration: BoxDecoration(
                      color: _currentPage == i ? AppTokens.primary : AppTokens.surfaceBorder,
                      borderRadius: BorderRadius.circular(4),
                    ),
                  ),
                ),
              ),

              const SizedBox(height: 32),

              // Bottom Button
              TactileButton(
                height: 52,
                backgroundColor: AppTokens.primary,
                onTap: () {
                  HapticsService.feedback(HapticType.light);
                  if (_currentPage < _pages.length - 1) {
                    _pageController.nextPage(duration: AppTokens.durationNormal, curve: Curves.easeOutCubic);
                  } else {
                    widget.onFinish();
                  }
                },
                child: Text(
                  _currentPage == _pages.length - 1 ? 'Get Started' : 'Next',
                  style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: Colors.white),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
