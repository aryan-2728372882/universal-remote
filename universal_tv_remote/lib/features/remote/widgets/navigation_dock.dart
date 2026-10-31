import 'package:flutter/material.dart';

enum NavTab { remote, settings, voice, apps }

/// Navigation Dock replicating the 4-tab pill design from the screenshot:
/// [Remote] [Settings] [AI Voice] [Apps]
class NavigationDock extends StatelessWidget {
  final NavTab activeTab;
  final Function(NavTab tab) onSelectTab;

  const NavigationDock({
    super.key,
    required this.activeTab,
    required this.onSelectTab,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
      padding: const EdgeInsets.all(5),
      decoration: BoxDecoration(
        color: const Color(0xFF0B0F19).withOpacity(0.95),
        borderRadius: BorderRadius.circular(28),
        border: Border.all(color: Colors.white.withOpacity(0.1)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.7),
            blurRadius: 24,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Row(
        children: [
          _buildTab(
            tab: NavTab.remote,
            icon: Icons.sports_esports_rounded,
            label: 'Remote',
          ),
          _buildTab(
            tab: NavTab.settings,
            icon: Icons.tune_rounded, // Sliders icon from screenshot, labeled Settings
            label: 'Settings',
          ),
          _buildTab(
            tab: NavTab.voice,
            icon: Icons.auto_awesome_rounded,
            label: 'AI Voice',
          ),
          _buildTab(
            tab: NavTab.apps,
            icon: Icons.tv_rounded,
            label: 'Apps',
          ),
        ],
      ),
    );
  }

  Widget _buildTab({
    required NavTab tab,
    required IconData icon,
    required String label,
  }) {
    final isActive = activeTab == tab;

    return Expanded(
      child: GestureDetector(
        onTap: () => onSelectTab(tab),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 4),
          decoration: BoxDecoration(
            color: isActive ? const Color(0xFF0A2E33) : Colors.transparent,
            borderRadius: BorderRadius.circular(22),
            border: Border.all(
              color: isActive
                  ? const Color(0xFF00F2FE).withOpacity(0.4)
                  : Colors.transparent,
            ),
            boxShadow: isActive
                ? [
                    BoxShadow(
                      color: const Color(0xFF00F2FE).withOpacity(0.25),
                      blurRadius: 14,
                    ),
                  ]
                : [],
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                icon,
                size: 20,
                color: isActive ? const Color(0xFF00F2FE) : const Color(0xFF94A3B8),
              ),
              const SizedBox(height: 3),
              Text(
                label,
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: isActive ? FontWeight.bold : FontWeight.w600,
                  color: isActive ? const Color(0xFF00F2FE) : const Color(0xFF94A3B8),
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
