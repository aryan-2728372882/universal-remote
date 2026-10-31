import 'dart:async';
import 'package:flutter/material.dart';
import '../../adapters/remote_adapter.dart';
import '../../core/haptics.dart';
import '../../core/theme.dart';
import '../../data/models/device.dart';
import '../remote/widgets/tactile_button.dart';

/// Guided Pairing Wizard Screen with Lost-Remote Rescue Flow
class PairingWizardScreen extends StatefulWidget {
  final Device device;
  final RemoteAdapter adapter;
  final VoidCallback onPaired;
  final VoidCallback onCancel;

  const PairingWizardScreen({
    super.key,
    required this.device,
    required this.adapter,
    required this.onPaired,
    required this.onCancel,
  });

  @override
  State<PairingWizardScreen> createState() => _PairingWizardScreenState();
}

class _PairingWizardScreenState extends State<PairingWizardScreen> {
  bool _isLoading = false;
  bool _showRescue = false;
  String? _errorMessage;
  final TextEditingController _pinController = TextEditingController();
  Completer<String>? _pinCompleter;

  @override
  void initState() {
    super.initState();
    _startPairing();
  }

  @override
  void dispose() {
    _pinController.dispose();
    super.dispose();
  }

  Future<void> _startPairing() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final result = await widget.adapter.pair(
        widget.device,
        PairingCallbacks(
          onRequestPin: () {
            _pinCompleter = Completer<String>();
            setState(() {}); // refresh to show pin input
            return _pinCompleter!.future;
          },
          onShowPromptOnTv: () {
            setState(() {});
          },
        ),
      );

      if (result.ok) {
        HapticsService.feedback(HapticType.heavy);
        widget.onPaired();
      } else {
        setState(() {
          _errorMessage = result.error ?? 'Pairing failed';
          _isLoading = false;
        });
      }
    } catch (e) {
      setState(() {
        _errorMessage = e.toString();
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTokens.background,
      appBar: AppBar(
        title: Text('Pair ${widget.device.name}'),
        leading: IconButton(
          icon: const Icon(Icons.close_rounded),
          onPressed: widget.onCancel,
        ),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Top Device Info Pill
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppTokens.surface,
                  borderRadius: BorderRadius.circular(AppTokens.radiusMd),
                  border: Border.all(color: AppTokens.surfaceBorder),
                ),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: AppTokens.primary.withOpacity(0.15),
                        borderRadius: BorderRadius.circular(AppTokens.radiusSm),
                      ),
                      child: const Icon(Icons.tv_rounded, size: 28, color: AppTokens.primary),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            widget.device.name,
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w800,
                              color: AppTokens.textPrimary,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            'IP: ${widget.device.ip} • ${widget.device.brand.displayName}',
                            style: const TextStyle(fontSize: 12, color: AppTokens.textMuted),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 24),

              // Main Instruction Block
              Expanded(
                child: _showRescue ? _buildRescueFlow() : _buildStandardPairingFlow(),
              ),

              // Bottom Rescue Link or Back to Pairing
              TextButton(
                onPressed: () => setState(() => _showRescue = !_showRescue),
                child: Text(
                  _showRescue ? '← Back to Pairing' : "Don't have a working TV remote? Click here",
                  style: const TextStyle(
                    color: AppTokens.accentAmber,
                    fontWeight: FontWeight.w700,
                    fontSize: 13,
                  ),
                ),
              ),

              const SizedBox(height: 8),

              // Action Button
              if (_errorMessage != null)
                TactileButton(
                  height: 52,
                  backgroundColor: AppTokens.primary,
                  onTap: _startPairing,
                  child: const Text(
                    'Retry Pairing',
                    style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: Colors.white),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStandardPairingFlow() {
    final isWebos = widget.device.brand == DeviceBrand.lgWebos;

    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        if (_isLoading && _pinCompleter == null) ...[
          const SizedBox(
            width: 48,
            height: 48,
            child: CircularProgressIndicator(strokeWidth: 3, color: AppTokens.primary),
          ),
          const SizedBox(height: 20),
          Text(
            isWebos
              ? 'Look at your TV screen and press "Accept" with your physical remote.'
              : 'Connecting to TV protocol...',
            textAlign: TextAlign.center,
            style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: AppTokens.textPrimary),
          ),
        ],

        // PIN Input prompt for Android TV
        if (_pinCompleter != null) ...[
          const Icon(Icons.pin_rounded, size: 40, color: AppTokens.primary),
          const SizedBox(height: 12),
          const Text(
            'Enter 6-Character Code on TV',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppTokens.textPrimary),
          ),
          const SizedBox(height: 6),
          const Text(
            'Your TV screen should display a code (e.g. W3K9P1)',
            style: TextStyle(fontSize: 13, color: AppTokens.textMuted),
          ),
          const SizedBox(height: 20),
          TextField(
            controller: _pinController,
            autofocus: true,
            textAlign: TextAlign.center,
            textCapitalization: TextCapitalization.characters,
            style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w900, letterSpacing: 4),
            decoration: InputDecoration(
              filled: true,
              fillColor: AppTokens.surfaceElevated,
              hintText: 'CODE',
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(AppTokens.radiusMd),
                borderSide: const BorderSide(color: AppTokens.primary),
              ),
            ),
          ),
          const SizedBox(height: 16),
          TactileButton(
            height: 48,
            backgroundColor: AppTokens.primary,
            onTap: () {
              if (_pinController.text.isNotEmpty) {
                _pinCompleter?.complete(_pinController.text.trim());
              }
            },
            child: const Text('Confirm Code', style: TextStyle(fontWeight: FontWeight.w800, color: Colors.white)),
          ),
        ],

        if (_errorMessage != null) ...[
          const Icon(Icons.error_outline_rounded, size: 40, color: AppTokens.accentRose),
          const SizedBox(height: 12),
          Text(
            _errorMessage!,
            textAlign: TextAlign.center,
            style: const TextStyle(fontSize: 14, color: AppTokens.accentRose, fontWeight: FontWeight.w600),
          ),
        ],
      ],
    );
  }

  Widget _buildRescueFlow() {
    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(Icons.health_and_safety_rounded, color: AppTokens.accentAmber, size: 24),
              SizedBox(width: 8),
              Text(
                'Lost-Remote Rescue Steps',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: Colors.white),
              ),
            ],
          ),
          const SizedBox(height: 12),
          const Text(
            'If you do not have a working physical remote to click "Accept", use the hardware buttons located on your TV casing:',
            style: TextStyle(fontSize: 13, color: AppTokens.textSecondary, height: 1.4),
          ),
          const SizedBox(height: 16),
          _rescueCard('LG webOS TV', 'Locate the single jog button directly under the LG logo on the bottom bezel. Short-press to highlight "Accept", then long-press for 2 seconds to select OK.'),
          _rescueCard('Android TV / Sony', 'Press the power button beneath the front center. A short press moves cursor, long press confirms.'),
          _rescueCard('Samsung TV', 'Find the 5-way jog controller on the rear right side near the bottom corner.'),
        ],
      ),
    );
  }

  Widget _rescueCard(String brand, String instructions) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppTokens.surface,
        borderRadius: BorderRadius.circular(AppTokens.radiusMd),
        border: Border.all(color: AppTokens.surfaceBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(brand, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: AppTokens.accentCyan)),
          const SizedBox(height: 6),
          Text(instructions, style: const TextStyle(fontSize: 12, color: AppTokens.textSecondary, height: 1.4)),
        ],
      ),
    );
  }
}
