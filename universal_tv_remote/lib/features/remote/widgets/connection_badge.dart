import 'package:flutter/material.dart';
import '../../../adapters/remote_adapter.dart';
import '../../../core/theme.dart';

/// Animated Connection Status Pill
class ConnectionBadge extends StatelessWidget {
  final RemoteConnectionState state;
  final VoidCallback? onFixConnection;

  const ConnectionBadge({
    super.key,
    required this.state,
    this.onFixConnection,
  });

  @override
  Widget build(BuildContext context) {
    Color dotColor;
    String label;
    bool isWarning = false;

    switch (state) {
      case RemoteConnectionState.ready:
        dotColor = AppTokens.accentEmerald;
        label = 'ONLINE';
        break;
      case RemoteConnectionState.connecting:
        dotColor = AppTokens.accentAmber;
        label = 'CONNECTING...';
        break;
      case RemoteConnectionState.authRequired:
        dotColor = AppTokens.accentAmber;
        label = 'PAIRING NEEDED';
        isWarning = true;
        break;
      case RemoteConnectionState.lost:
      case RemoteConnectionState.disconnected:
        dotColor = AppTokens.accentRose;
        label = 'OFFLINE';
        isWarning = true;
        break;
    }

    return GestureDetector(
      onTap: isWarning ? onFixConnection : null,
      child: AnimatedContainer(
        duration: AppTokens.durationNormal,
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
        decoration: BoxDecoration(
          color: dotColor.withOpacity(0.12),
          borderRadius: BorderRadius.circular(AppTokens.radiusFull),
          border: Border.all(color: dotColor.withOpacity(0.4), width: 1),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 7,
              height: 7,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: dotColor,
                boxShadow: [
                  BoxShadow(
                    color: dotColor.withOpacity(0.6),
                    blurRadius: 6,
                    spreadRadius: 1,
                  ),
                ],
              ),
            ),
            const SizedBox(width: 6),
            Text(
              label,
              style: TextStyle(
                fontSize: 10,
                fontWeight: FontWeight.w800,
                letterSpacing: 0.8,
                color: dotColor,
              ),
            ),
            if (isWarning) ...[
              const SizedBox(width: 4),
              Icon(Icons.arrow_forward_ios_rounded, size: 9, color: dotColor),
            ],
          ],
        ),
      ),
    );
  }
}
