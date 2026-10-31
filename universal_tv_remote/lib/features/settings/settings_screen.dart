import 'package:flutter/material.dart';
import '../../core/haptics.dart';
import '../../core/theme.dart';
import '../../data/device_repository.dart';
import '../../data/models/room.dart';
import '../../diagnostics/redacted_report.dart';

/// App Settings Screen
class SettingsScreen extends StatefulWidget {
  final DeviceRepository repository;
  final VoidCallback onSettingsChanged;

  const SettingsScreen({
    super.key,
    required this.repository,
    required this.onSettingsChanged,
  });

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  AppSettings _settings = const AppSettings();

  @override
  void initState() {
    super.initState();
    _loadSettings();
  }

  Future<void> _loadSettings() async {
    final s = await widget.repository.getSettings();
    setState(() => _settings = s);
  }

  Future<void> _updateSettings(AppSettings s) async {
    setState(() => _settings = s);
    await widget.repository.saveSettings(s);
    HapticsService.enabled = s.hapticsEnabled;
    widget.onSettingsChanged();
  }

  void _showReportDialog() {
    final report = RedactedReport.generateReport(
      appVersion: '1.0.0+1',
      osVersion: 'Android / Cross-Platform',
    );

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: AppTokens.surface,
        title: const Text('Diagnostic Report', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800)),
        content: SizedBox(
          width: double.maxFinite,
          child: SingleChildScrollView(
            child: SelectableText(
              report,
              style: const TextStyle(fontFamily: 'monospace', fontSize: 11, color: AppTokens.textSecondary),
            ),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Close'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTokens.background,
      appBar: AppBar(
        title: const Text('Settings'),
      ),
      body: SafeArea(
        child: ListView(
          physics: const BouncingScrollPhysics(),
          padding: const EdgeInsets.all(16),
          children: [
            // Section 1: Accessibility & Remote Mode
            _sectionHeader('REMOTE ACCESSIBILITY'),
            _switchTile(
              title: 'Elder Mode (Simplified Layout)',
              subtitle: '6 very large high-contrast buttons with zero scrolling',
              value: _settings.elderMode,
              onChanged: (val) => _updateSettings(_settings.copyWith(elderMode: val)),
            ),
            _switchTile(
              title: 'Haptic Feedback',
              subtitle: 'Tactile vibration tick on button taps',
              value: _settings.hapticsEnabled,
              onChanged: (val) => _updateSettings(_settings.copyWith(hapticsEnabled: val)),
            ),

            const SizedBox(height: 20),

            // Section 2: Diagnostics & Privacy
            _sectionHeader('DIAGNOSTICS & PRIVACY'),
            ListTile(
              tileColor: AppTokens.surface,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(AppTokens.radiusMd),
                side: const BorderSide(color: AppTokens.surfaceBorder),
              ),
              leading: const Icon(Icons.document_scanner_outlined, color: AppTokens.primary),
              title: const Text('Send Diagnostic Report', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
              subtitle: const Text('Generates redacted text report (IPs/tokens masked)', style: TextStyle(fontSize: 11, color: AppTokens.textMuted)),
              trailing: const Icon(Icons.arrow_forward_ios_rounded, size: 14, color: AppTokens.textMuted),
              onTap: _showReportDialog,
            ),

            const SizedBox(height: 20),

            // Section 3: Legal & Trademarks (Mandatory Section 11)
            _sectionHeader('LEGAL & TRADEMARKS'),
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: AppTokens.surface,
                borderRadius: BorderRadius.circular(AppTokens.radiusMd),
                border: Border.all(color: AppTokens.surfaceBorder),
              ),
              child: const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Brand Compatibility Notice',
                    style: TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: AppTokens.textPrimary),
                  ),
                  SizedBox(height: 6),
                  Text(
                    'All product and brand names (LG, Samsung, Sony, Roku, Android TV, Google TV, Netflix, YouTube, Prime Video, Disney+) are trademarks or registered trademarks of their respective holders.\n\n'
                    'Universal Smart Remote is an independent application and is not affiliated with, endorsed by, or sponsored by any TV manufacturer or streaming service.',
                    style: TextStyle(fontSize: 11, color: AppTokens.textSecondary, height: 1.4),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 12),

            ListTile(
              tileColor: AppTokens.surface,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(AppTokens.radiusMd),
                side: const BorderSide(color: AppTokens.surfaceBorder),
              ),
              leading: const Icon(Icons.gavel_rounded, color: AppTokens.textSecondary),
              title: const Text('Open-Source Licenses', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
              trailing: const Icon(Icons.arrow_forward_ios_rounded, size: 14, color: AppTokens.textMuted),
              onTap: () => showLicensePage(context: context),
            ),
          ],
        ),
      ),
    );
  }

  Widget _sectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.only(left: 4, bottom: 8),
      child: Text(
        title,
        style: const TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w800,
          letterSpacing: 1.0,
          color: AppTokens.textMuted,
        ),
      ),
    );
  }

  Widget _switchTile({
    required String title,
    required String subtitle,
    required bool value,
    required Function(bool) onChanged,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      decoration: BoxDecoration(
        color: AppTokens.surface,
        borderRadius: BorderRadius.circular(AppTokens.radiusMd),
        border: Border.all(color: AppTokens.surfaceBorder),
      ),
      child: SwitchListTile(
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
        subtitle: Text(subtitle, style: const TextStyle(fontSize: 11, color: AppTokens.textMuted)),
        value: value,
        activeColor: AppTokens.primary,
        onChanged: onChanged,
      ),
    );
  }
}
