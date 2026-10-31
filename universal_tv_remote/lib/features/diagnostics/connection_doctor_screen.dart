import 'package:flutter/material.dart';
import '../../core/theme.dart';
import '../../diagnostics/connection_doctor/connection_doctor.dart';
import '../../diagnostics/redacted_report.dart';
import '../remote/widgets/tactile_button.dart';

/// Connection Doctor Guided Diagnostic Screen
class ConnectionDoctorScreen extends StatefulWidget {
  final String? targetIp;
  final int? targetPort;

  const ConnectionDoctorScreen({
    super.key,
    this.targetIp,
    this.targetPort,
  });

  @override
  State<ConnectionDoctorScreen> createState() => _ConnectionDoctorScreenState();
}

class _ConnectionDoctorScreenState extends State<ConnectionDoctorScreen> {
  final ConnectionDoctor _doctor = ConnectionDoctor();
  List<DoctorStep> _steps = [];
  bool _isRunning = true;

  @override
  void initState() {
    super.initState();
    _startDiagnostics();
  }

  void _startDiagnostics() {
    setState(() {
      _isRunning = true;
      _steps = _doctor.steps;
    });

    _doctor
        .runDiagnostics(targetIp: widget.targetIp, targetPort: widget.targetPort)
        .listen((updatedSteps) {
      if (mounted) {
        setState(() {
          _steps = updatedSteps;
          _isRunning = updatedSteps.any((s) => s.status == DoctorStepStatus.running);
        });
      }
    });
  }

  void _showReportDialog() {
    final report = RedactedReport.generateReport(
      appVersion: '1.0.0+1',
      osVersion: 'Android / Cross-Platform',
      currentIp: widget.targetIp,
    );

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: AppTokens.surface,
        title: const Text('Redacted Diagnostic Report', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800)),
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
        title: const Text('Connection Doctor'),
        actions: [
          IconButton(
            icon: const Icon(Icons.share_outlined),
            onPressed: _showReportDialog,
            tooltip: 'View Redacted Diagnostic Report',
          ),
        ],
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            children: [
              // Header description
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: AppTokens.surface,
                  borderRadius: BorderRadius.circular(AppTokens.radiusMd),
                  border: Border.all(color: AppTokens.surfaceBorder),
                ),
                child: const Row(
                  children: [
                    Icon(Icons.healing_rounded, size: 28, color: AppTokens.accentCyan),
                    SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        'Self-diagnosing Wi-Fi, subnet routing, router AP isolation and TV socket readiness.',
                        style: TextStyle(fontSize: 12, color: AppTokens.textSecondary, height: 1.3),
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 16),

              // Steps List
              Expanded(
                child: ListView.separated(
                  physics: const BouncingScrollPhysics(),
                  itemCount: _steps.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 10),
                  itemBuilder: (context, index) {
                    final step = _steps[index];
                    return _buildStepCard(step);
                  },
                ),
              ),

              const SizedBox(height: 12),

              // Bottom Actions
              Row(
                children: [
                  Expanded(
                    child: TactileButton(
                      height: 50,
                      backgroundColor: AppTokens.surfaceElevated,
                      onTap: _showReportDialog,
                      child: const Text('Copy Redacted Report', style: TextStyle(fontWeight: FontWeight.w700)),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: TactileButton(
                      height: 50,
                      backgroundColor: AppTokens.primary,
                      onTap: _isRunning ? null : _startDiagnostics,
                      child: Text(
                        _isRunning ? 'Scanning...' : 'Re-Run Checks',
                        style: const TextStyle(fontWeight: FontWeight.w800, color: Colors.white),
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

  Widget _buildStepCard(DoctorStep step) {
    Widget icon;
    Color borderColor = AppTokens.surfaceBorder;

    switch (step.status) {
      case DoctorStepStatus.passed:
        icon = const Icon(Icons.check_circle_rounded, color: AppTokens.accentEmerald, size: 20);
        borderColor = AppTokens.accentEmerald.withOpacity(0.3);
        break;
      case DoctorStepStatus.failed:
        icon = const Icon(Icons.cancel_rounded, color: AppTokens.accentRose, size: 20);
        borderColor = AppTokens.accentRose.withOpacity(0.4);
        break;
      case DoctorStepStatus.warning:
        icon = const Icon(Icons.warning_amber_rounded, color: AppTokens.accentAmber, size: 20);
        borderColor = AppTokens.accentAmber.withOpacity(0.4);
        break;
      case DoctorStepStatus.running:
        icon = const SizedBox(
          width: 18,
          height: 18,
          child: CircularProgressIndicator(strokeWidth: 2, color: AppTokens.primary),
        );
        borderColor = AppTokens.primary;
        break;
      case DoctorStepStatus.pending:
        icon = const Icon(Icons.radio_button_unchecked_rounded, color: AppTokens.textMuted, size: 20);
        break;
    }

    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppTokens.surface,
        borderRadius: BorderRadius.circular(AppTokens.radiusMd),
        border: Border.all(color: borderColor),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              icon,
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  step.title,
                  style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppTokens.textPrimary),
                ),
              ),
            ],
          ),
          if (step.details != null) ...[
            const SizedBox(height: 6),
            Padding(
              padding: const EdgeInsets.only(left: 30),
              child: Text(
                step.details!,
                style: const TextStyle(fontSize: 11, color: AppTokens.textSecondary),
              ),
            ),
          ],
          if (step.fixSuggestion != null) ...[
            const SizedBox(height: 8),
            Container(
              margin: const EdgeInsets.only(left: 30),
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: AppTokens.accentAmber.withOpacity(0.1),
                borderRadius: BorderRadius.circular(AppTokens.radiusSm),
                border: Border.all(color: AppTokens.accentAmber.withOpacity(0.3)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.lightbulb_outline_rounded, size: 16, color: AppTokens.accentAmber),
                  const SizedBox(width: 6),
                  Expanded(
                    child: Text(
                      step.fixSuggestion!,
                      style: const TextStyle(fontSize: 11, color: AppTokens.accentAmber, fontWeight: FontWeight.w600),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }
}
