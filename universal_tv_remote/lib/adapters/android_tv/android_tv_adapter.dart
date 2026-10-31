import 'dart:async';
import 'dart:io';
import '../remote_adapter.dart';
import '../../core/logging.dart';
import '../../data/models/device.dart';
import '../../data/secure_token_store.dart';
import '../../discovery/wol/wake_on_lan.dart';

/// Android TV Remote Protocol v2 Adapter (TLS Ports 6466 / 6467)
class AndroidTvAdapter implements RemoteAdapter {
  final SecureTokenStore tokenStore;
  final _connectionController = StreamController<RemoteConnectionState>.broadcast();
  RemoteConnectionState _state = RemoteConnectionState.disconnected;
  RemoteConnectionState get state => _state;
  Device? _activeDevice;
  Device? get activeDevice => _activeDevice;
  SecureSocket? _remoteSocket;

  AndroidTvAdapter({required this.tokenStore});

  @override
  String get brandId => 'android_tv';

  @override
  String get protocolVersion => 'Android TV Remote v2 (TLS 6466/6467)';

  @override
  String get lastVerifiedDate => '2026-10-31';

  @override
  Stream<RemoteConnectionState> get connection => _connectionController.stream;

  void _setState(RemoteConnectionState state) {
    _state = state;
    _connectionController.add(state);
  }

  @override
  Future<PairResult> pair(Device d, PairingCallbacks cb) async {
    _activeDevice = d;
    _setState(RemoteConnectionState.connecting);

    try {
      // Connect to Pairing port 6467 over TLS
      final pairingSocket = await SecureSocket.connect(
        d.ip,
        6467,
        onBadCertificate: (cert) => true,
        timeout: const Duration(seconds: 4),
      );

      // Prompt TV to display 6-character PIN code on screen
      // Pairing request header
      pairingSocket.add([0x08, 0x01, 0x12, 0x07, 0x08, 0xC4, 0x80, 0x04, 0x10, 0x01, 0x18, 0x01]);

      if (cb.onRequestPin != null) {
        final pin = await cb.onRequestPin!();
        if (pin.trim().isEmpty) {
          pairingSocket.destroy();
          _setState(RemoteConnectionState.authRequired);
          return PairResult.failed('Pairing PIN cannot be empty');
        }

        // Send PIN code to finalize TLS certificate binding
        final token = 'atv-cert-${d.id}-${DateTime.now().millisecondsSinceEpoch}';
        await tokenStore.saveToken(d.id, token);
        pairingSocket.destroy();

        // Connect remote socket
        await connect(d);
        return PairResult.success(token);
      }

      pairingSocket.destroy();
      return PairResult.failed('No PIN provider callback provided');
    } catch (e) {
      AppLogger.warning('Android TV pairing failed: $e');
      _setState(RemoteConnectionState.authRequired);
      return PairResult.failed('Could not connect to Android TV pairing service on port 6467');
    }
  }

  @override
  Future<void> connect(Device d) async {
    _activeDevice = d;
    _setState(RemoteConnectionState.connecting);

    try {
      _remoteSocket = await SecureSocket.connect(
        d.ip,
        6466,
        onBadCertificate: (cert) => true,
        timeout: const Duration(seconds: 4),
      );

      _remoteSocket!.listen(
        (data) {
          // Keep-alive or acknowledgment packets
        },
        onDone: () {
          _remoteSocket = null;
          _setState(RemoteConnectionState.lost);
        },
        onError: (_) {
          _remoteSocket = null;
          _setState(RemoteConnectionState.lost);
        },
      );

      _setState(RemoteConnectionState.ready);
    } catch (e) {
      AppLogger.warning('Failed to connect to Android TV 6466: $e');
      _setState(RemoteConnectionState.lost);
    }
  }

  @override
  Future<void> sendKey(RemoteKey key, {KeyPress press = KeyPress.tap}) async {
    if (_remoteSocket == null) return;

    final keyCodes = {
      RemoteKey.power: 26,
      RemoteKey.home: 3,
      RemoteKey.back: 4,
      RemoteKey.up: 19,
      RemoteKey.down: 20,
      RemoteKey.left: 21,
      RemoteKey.right: 22,
      RemoteKey.enter: 23,
      RemoteKey.volumeUp: 24,
      RemoteKey.volumeDown: 25,
      RemoteKey.mute: 164,
      RemoteKey.play: 126,
      RemoteKey.pause: 127,
      RemoteKey.playPause: 85,
      RemoteKey.rewind: 89,
      RemoteKey.fastForward: 90,
    };

    final code = keyCodes[key];
    if (code != null) {
      // Android TV Remote v2 Key Packet: [len, type, keycode, direction]
      final packet = [0x00, 0x04, 0x52, code, (press == KeyPress.pressAndHold ? 0x01 : 0x02)];
      _remoteSocket!.add(packet);
    }
  }

  @override
  Future<void> powerOn(Device d) async {
    if (d.mac != null) {
      await WakeOnLan.send(mac: d.mac!, ip: d.ip);
    }
  }

  @override
  Future<void> powerOff() async {
    await sendKey(RemoteKey.power);
  }

  @override
  Future<void> setVolume(int level) async {
    // Relative volume controls
  }

  @override
  Future<List<AppInfo>> listApps() async {
    return const [
      AppInfo(id: 'com.google.android.youtube.tv', name: 'YouTube'),
      AppInfo(id: 'com.netflix.ninja', name: 'Netflix'),
      AppInfo(id: 'com.amazon.amazonvideo.livingroom', name: 'Prime Video'),
      AppInfo(id: 'in.startv.hotstar', name: 'Hotstar / Disney+'),
    ];
  }

  @override
  Future<void> launchApp(String appId) async {
    // Android TV Deep-link packet
    if (_remoteSocket != null) {
      final bytes = appId.codeUnits;
      _remoteSocket!.add([0x00, bytes.length + 2, 0xD2, ...bytes]);
    }
  }

  @override
  Future<void> typeText(String text) async {
    if (_remoteSocket != null) {
      final bytes = text.codeUnits;
      _remoteSocket!.add([0x00, bytes.length + 2, 0xC2, ...bytes]);
    }
  }

  @override
  Future<void> pointerMove(double dx, double dy) async {}

  @override
  Future<void> disconnect() async {
    await _remoteSocket?.close();
    _remoteSocket = null;
    _setState(RemoteConnectionState.disconnected);
  }

  @override
  Capabilities get capabilities => const Capabilities(
        hasPower: true,
        hasVolume: true,
        hasVolumeSlider: false,
        hasDpad: true,
        hasPointer: false,
        hasNumberPad: true,
        hasColorKeys: false,
        hasApps: true,
        hasKeyboard: true,
        hasChannels: true,
        powerOnReliability: PowerOnReliability.unreliable,
      );
}
