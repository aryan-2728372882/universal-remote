import 'package:flutter/material.dart';
import '../../../core/widgets/app_logo.dart';

class RemoteSettingsSheet extends StatefulWidget {
  final String activeTheme;
  final bool bgAnimEnabled;
  final bool hapticsEnabled;
  final bool soundEnabled;
  final Function(String themeId) onThemeChanged;
  final Function(bool enabled) onBgAnimToggled;
  final Function(bool enabled) onHapticsToggled;
  final Function(bool enabled) onSoundToggled;
  final VoidCallback onOpenDoctor;

  const RemoteSettingsSheet({
    super.key,
    required this.activeTheme,
    required this.bgAnimEnabled,
    required this.hapticsEnabled,
    required this.soundEnabled,
    required this.onThemeChanged,
    required this.onBgAnimToggled,
    required this.onHapticsToggled,
    required this.onSoundToggled,
    required this.onOpenDoctor,
  });

  @override
  State<RemoteSettingsSheet> createState() => _RemoteSettingsSheetState();
}

class _RemoteSettingsSheetState extends State<RemoteSettingsSheet> {
  bool _isLoggedIn = false;
  String _userName = 'Guest User';
  String _activePlan = 'Free Core';
  String _hapticLevel = 'Medium';

  void _showLoginDialog() {
    final emailController = TextEditingController();
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF161B2A),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        title: const Text('User Sign In', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w900)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: emailController,
              style: const TextStyle(color: Colors.white),
              decoration: InputDecoration(
                hintText: 'Enter your email',
                hintStyle: const TextStyle(color: Colors.white38),
                filled: true,
                fillColor: Colors.black26,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel', style: TextStyle(color: Colors.white60)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF00F2FE), foregroundColor: Colors.black),
            onPressed: () {
              if (emailController.text.isNotEmpty) {
                setState(() {
                  _isLoggedIn = true;
                  _userName = emailController.text.split('@').first;
                });
                Navigator.pop(ctx);
              }
            },
            child: const Text('Sign In', style: TextStyle(fontWeight: FontWeight.w900)),
          ),
        ],
      ),
    );
  }

  void _showPaymentDialog() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF161B2A),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        title: const Text('Transparent Pricing', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w900)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text(
              'Zero weekly subscriptions • Cancel anytime',
              style: TextStyle(color: Color(0xFF00E676), fontSize: 11, fontWeight: FontWeight.w700),
            ),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFF1E2538),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: const Color(0xFF00E676)),
              ),
              child: const Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Monthly Pro', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                  Text('₹49 / mo', style: TextStyle(color: Color(0xFF00E676), fontWeight: FontWeight.w900)),
                ],
              ),
            ),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFF1E2538),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: const Color(0xFF9333EA)),
              ),
              child: const Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Lifetime Pro', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                  Text('₹299 once', style: TextStyle(color: Color(0xFFC084FC), fontWeight: FontWeight.w900)),
                ],
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Close', style: TextStyle(color: Colors.white60)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF00E676), foregroundColor: Colors.black),
            onPressed: () {
              setState(() => _activePlan = 'Pro Active (₹49)');
              Navigator.pop(ctx);
            },
            child: const Text('Complete UPI Payment', style: TextStyle(fontWeight: FontWeight.w900)),
          ),
        ],
      ),
    );
  }

  void _showBugReportDialog() {
    final bugController = TextEditingController();
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF161B2A),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        title: const Row(
          children: [
            Icon(Icons.bug_report_rounded, color: Color(0xFFF59E0B)),
            SizedBox(width: 8),
            Text('Report a Bug', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w900)),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text(
              'Describe the issue encountered on your Smart TV:',
              style: TextStyle(color: Colors.white70, fontSize: 12),
            ),
            const SizedBox(height: 10),
            TextField(
              controller: bugController,
              maxLines: 3,
              style: const TextStyle(color: Colors.white, fontSize: 13),
              decoration: InputDecoration(
                hintText: 'E.g. Volume keys failed or app refused pairing...',
                hintStyle: const TextStyle(color: Colors.white38),
                filled: true,
                fillColor: Colors.black26,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
            const SizedBox(height: 6),
            const Text('✔ Redacted network logs will be attached automatically.', style: TextStyle(color: Colors.white38, fontSize: 10)),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel', style: TextStyle(color: Colors.white60)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFF59E0B), foregroundColor: Colors.black),
            onPressed: () {
              Navigator.pop(ctx);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Bug report submitted! Ticket ID: BUG-9842')),
              );
            },
            child: const Text('Submit Report', style: TextStyle(fontWeight: FontWeight.w900)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final themes = [
      {'id': 'cyan', 'name': 'Cyan', 'color': const Color(0xFF00F2FE)},
      {'id': 'crimson', 'name': 'Crimson', 'color': const Color(0xFFFF3366)},
      {'id': 'emerald', 'name': 'Emerald', 'color': const Color(0xFF00E676)},
      {'id': 'midnight', 'name': 'Midnight', 'color': const Color(0xFF7928CA)},
    ];

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
      decoration: const BoxDecoration(
        color: Color(0xFF161B2A),
        borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
      ),
      child: SafeArea(
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Header with App Logo
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Row(
                    children: [
                      AppLogo(size: 28),
                      SizedBox(width: 8),
                      Text(
                        'APP SETTINGS',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w900,
                          letterSpacing: 1.2,
                          color: Colors.white,
                        ),
                      ),
                    ],
                  ),
                  IconButton(
                    icon: const Icon(Icons.close_rounded, color: Colors.white70),
                    onPressed: () => Navigator.pop(context),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // 1. Account & User Login Section
              _buildSectionCard(
                title: 'USER ACCOUNT & SYNC',
                icon: Icons.person_rounded,
                iconColor: const Color(0xFF00F2FE),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(_userName, style: const TextStyle(fontWeight: FontWeight.w900, color: Colors.white)),
                        Text(_isLoggedIn ? 'Cloud Sync Active' : 'Local LAN Mode', style: const TextStyle(fontSize: 10, color: Colors.white54)),
                      ],
                    ),
                    ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF00F2FE),
                        foregroundColor: Colors.black,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                      ),
                      onPressed: _isLoggedIn
                          ? () => setState(() {
                                _isLoggedIn = false;
                                _userName = 'Guest User';
                              })
                          : _showLoginDialog,
                      child: Text(_isLoggedIn ? 'Logout' : 'Sign In', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 11)),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 12),

              // 2. Subscription & Transparent Payment Section
              _buildSectionCard(
                title: 'SUBSCRIPTION & PRICING',
                icon: Icons.credit_card_rounded,
                iconColor: const Color(0xFF00E676),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(_activePlan, style: const TextStyle(fontWeight: FontWeight.w900, color: Colors.white)),
                        const Text('Zero weekly dark patterns', style: TextStyle(fontSize: 10, color: Colors.white54)),
                      ],
                    ),
                    ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF00E676),
                        foregroundColor: Colors.black,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      ),
                      onPressed: _showPaymentDialog,
                      child: const Text('Upgrade Plan', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11)),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 12),

              // 3. Haptics Feedback Section
              _buildSectionCard(
                title: 'HAPTIC VIBRATION FEEDBACK',
                icon: Icons.vibration_rounded,
                iconColor: const Color(0xFF9333EA),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Button Vibration', style: TextStyle(color: Colors.white, fontSize: 12)),
                        Switch.adaptive(
                          value: widget.hapticsEnabled,
                          activeColor: const Color(0xFF00F2FE),
                          onChanged: widget.onHapticsToggled,
                        ),
                      ],
                    ),
                    if (widget.hapticsEnabled)
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text('Intensity Preset', style: TextStyle(color: Colors.white54, fontSize: 11)),
                          Row(
                            children: ['Light', 'Medium', 'Heavy'].map((lvl) {
                              final isSel = _hapticLevel == lvl;
                              return GestureDetector(
                                onTap: () => setState(() => _hapticLevel = lvl),
                                child: Container(
                                  margin: const EdgeInsets.only(left: 4),
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: isSel ? const Color(0xFF00F2FE) : Colors.white10,
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: Text(
                                    lvl,
                                    style: TextStyle(
                                      fontSize: 10,
                                      fontWeight: FontWeight.bold,
                                      color: isSel ? Colors.black : Colors.white70,
                                    ),
                                  ),
                                ),
                              );
                            }).toList(),
                          ),
                        ],
                      ),
                  ],
                ),
              ),

              const SizedBox(height: 12),

              // 4. Themes Section
              _buildSectionCard(
                title: 'REMOTE THEME COLOR',
                icon: Icons.palette_rounded,
                iconColor: const Color(0xFFFF3366),
                child: Row(
                  children: themes.map((t) {
                    final isSelected = widget.activeTheme == t['id'];
                    final color = t['color'] as Color;
                    return Expanded(
                      child: Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 4),
                        child: GestureDetector(
                          onTap: () => widget.onThemeChanged(t['id'] as String),
                          child: Container(
                            height: 38,
                            decoration: BoxDecoration(
                              color: color.withOpacity(0.25),
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(
                                color: isSelected ? Colors.white : color.withOpacity(0.4),
                                width: isSelected ? 2.0 : 1.0,
                              ),
                            ),
                            child: Center(
                              child: isSelected
                                  ? const Icon(Icons.check_rounded, color: Colors.white, size: 18)
                                  : Container(width: 8, height: 8, decoration: BoxDecoration(shape: BoxShape.circle, color: color)),
                            ),
                          ),
                        ),
                      ),
                    );
                  }).toList(),
                ),
              ),

              const SizedBox(height: 12),

              // 5. Bug Report & Connection Doctor Actions
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      style: OutlinedButton.styleFrom(
                        foregroundColor: const Color(0xFFF59E0B),
                        side: const BorderSide(color: Color(0xFFF59E0B)),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                        padding: const EdgeInsets.symmetric(vertical: 12),
                      ),
                      onPressed: _showBugReportDialog,
                      icon: const Icon(Icons.bug_report_rounded, size: 16),
                      label: const Text('Report Bug', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11)),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF00F2FE),
                        foregroundColor: Colors.black,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                        padding: const EdgeInsets.symmetric(vertical: 12),
                      ),
                      onPressed: () {
                        Navigator.pop(context);
                        widget.onOpenDoctor();
                      },
                      icon: const Icon(Icons.medical_services_rounded, size: 16),
                      label: const Text('Doctor', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11)),
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

  Widget _buildSectionCard({
    required String title,
    required IconData icon,
    required Color iconColor,
    required Widget child,
  }) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFF1E2538),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: Colors.white.withOpacity(0.06)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              Icon(icon, size: 14, color: iconColor),
              const SizedBox(width: 6),
              Text(
                title,
                style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: Color(0xFF8A99AD), letterSpacing: 1),
              ),
            ],
          ),
          const SizedBox(height: 10),
          child,
        ],
      ),
    );
  }
}
