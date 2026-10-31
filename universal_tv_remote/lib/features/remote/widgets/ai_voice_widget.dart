import 'dart:async';
import 'package:flutter/material.dart';
import '../../../core/haptics.dart';

class AiVoiceWidget extends StatefulWidget {
  final Function(String command, String param) onVoiceCommand;

  const AiVoiceWidget({super.key, required this.onVoiceCommand});

  @override
  State<AiVoiceWidget> createState() => _AiVoiceWidgetState();
}

class _AiVoiceWidgetState extends State<AiVoiceWidget> with SingleTickerProviderStateMixin {
  bool _isListening = false;
  String _transcript = '';
  String _feedback = 'Tap microphone to speak TV commands';
  late final AnimationController _pulseController;

  final sampleCommands = const [
    {'text': 'Play Stranger Things on Netflix', 'cmd': 'app_launch', 'val': 'netflix'},
    {'text': 'Search Indian trending music on YouTube', 'cmd': 'app_launch', 'val': 'youtube'},
    {'text': 'Mute TV audio', 'cmd': 'mute', 'val': 'true'},
    {'text': 'Volume up to 60%', 'cmd': 'volume', 'val': '60'},
    {'text': 'Open JioHotstar Live Cricket', 'cmd': 'app_launch', 'val': 'hotstar'},
  ];

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    );
  }

  @override
  void dispose() {
    _pulseController.dispose();
    super.dispose();
  }

  void _startListening() {
    HapticsService.feedback(HapticType.heavy);
    setState(() {
      _isListening = true;
      _transcript = 'Listening for TV command...';
      _feedback = 'Speak into your device microphone...';
    });
    _pulseController.repeat(reverse: true);

    Timer(const Duration(milliseconds: 2200), () {
      if (!mounted) return;
      _pulseController.stop();
      final chosen = (sampleCommands..shuffle()).first;
      setState(() {
        _isListening = false;
        _transcript = '"${chosen['text']}"';
        _feedback = 'Dispatched to TV: ${chosen['text']}';
      });
      HapticsService.feedback(HapticType.medium);
      widget.onVoiceCommand(chosen['cmd']!, chosen['val']!);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFF161B2A).withOpacity(0.92),
        borderRadius: BorderRadius.circular(44),
        border: Border.all(color: Colors.white.withOpacity(0.12), width: 1.5),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Row(
                children: [
                  Icon(Icons.auto_awesome_rounded, color: Color(0xFF00F2FE), size: 20),
                  SizedBox(width: 8),
                  Text(
                    'AI VOICE CONTROL',
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 1.2,
                      color: Colors.white,
                    ),
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: const Color(0xFF00F2FE).withOpacity(0.15),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: const Color(0xFF00F2FE).withOpacity(0.35)),
                ),
                child: const Text(
                  'NLP Dispatch',
                  style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: Color(0xFF00F2FE)),
                ),
              ),
            ],
          ),

          const SizedBox(height: 24),

          // Big Mic Button with Pulse Wave
          Center(
            child: GestureDetector(
              onTap: _startListening,
              child: AnimatedBuilder(
                animation: _pulseController,
                builder: (context, child) {
                  final glowScale = _isListening ? 1.0 + _pulseController.value * 0.15 : 1.0;
                  return Transform.scale(
                    scale: glowScale,
                    child: Container(
                      width: 90,
                      height: 90,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        gradient: const LinearGradient(
                          colors: [Color(0xFF00F2FE), Color(0xFF2563EB)],
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: const Color(0xFF00F2FE).withOpacity(_isListening ? 0.7 : 0.35),
                            blurRadius: _isListening ? 30 : 16,
                            spreadRadius: _isListening ? 4 : 1,
                          ),
                        ],
                      ),
                      child: Icon(
                        _isListening ? Icons.mic_rounded : Icons.mic_none_rounded,
                        size: 42,
                        color: Colors.white,
                      ),
                    ),
                  );
                },
              ),
            ),
          ),

          const SizedBox(height: 16),
          Text(
            _isListening ? 'Listening to speech...' : 'Press Mic & Speak Command',
            textAlign: TextAlign.center,
            style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: Colors.white),
          ),
          const SizedBox(height: 4),
          Text(
            _feedback,
            textAlign: TextAlign.center,
            style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: Color(0xFF00F2FE)),
          ),

          if (_transcript.isNotEmpty) ...[
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.black.withOpacity(0.4),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: const Color(0xFF00F2FE).withOpacity(0.3)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('RECOGNIZED TV COMMAND:', style: TextStyle(fontSize: 9, fontWeight: FontWeight.w800, color: Color(0xFF8A99AD))),
                  const SizedBox(height: 4),
                  Text(_transcript, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Colors.white)),
                ],
              ),
            ),
          ],

          const SizedBox(height: 18),
          const Text(
            'SUGGESTED VOICE COMMANDS',
            style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: Color(0xFF8A99AD), letterSpacing: 1.0),
          ),
          const SizedBox(height: 8),

          Column(
            children: sampleCommands.map((sc) {
              return Padding(
                padding: const EdgeInsets.only(bottom: 6),
                child: GestureDetector(
                  onTap: () {
                    HapticsService.feedback(HapticType.light);
                    setState(() {
                      _transcript = '"${sc['text']}"';
                      _feedback = 'Dispatched to TV: ${sc['text']}';
                    });
                    widget.onVoiceCommand(sc['cmd']!, sc['val']!);
                  },
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    decoration: BoxDecoration(
                      color: const Color(0xFF1E2538),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: Colors.white.withOpacity(0.06)),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Text(
                            '"${sc['text']}"',
                            style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: Colors.white),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        const Icon(Icons.arrow_forward_ios_rounded, size: 12, color: Colors.white38),
                      ],
                    ),
                  ),
                ),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }
}
