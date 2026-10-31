import 'dart:async';
import 'package:universal_tv_remote/adapters/remote_adapter.dart';
import 'package:universal_tv_remote/data/models/device.dart';

/// Test double adapter implementing RemoteAdapter for unit tests
class TestDeviceAdapter implements RemoteAdapter {
  final _connectionController = StreamController<RemoteConnectionState>.broadcast();
  RemoteConnectionState _currentState = RemoteConnectionState.disconnected;

  bool power = true;
  int volume = 20;
  bool isMuted = false;
  String currentApp = 'Netflix';
  final List<RemoteKey> keyHistory = [];
  final List<String> textHistory = [];
  double pointerX = 0;
  double pointerY = 0;

  @override
  String get brandId => 'lg_webos';

  @override
  String get protocolVersion => '1.0';

  @override
  String get lastVerifiedDate => '2026-10-31';

  @override
  Stream<RemoteConnectionState> get connection => _connectionController.stream;

  RemoteConnectionState get currentState => _currentState;

  void _setState(RemoteConnectionState state) {
    _currentState = state;
    _connectionController.add(state);
  }

  @override
  Future<PairResult> pair(Device d, PairingCallbacks cb) async {
    _setState(RemoteConnectionState.connecting);
    if (cb.onRequestPin != null) {
      final pin = await cb.onRequestPin!();
      if (pin != '1234' && pin != 'W3K9P1') {
        _setState(RemoteConnectionState.authRequired);
        return PairResult.failed('Invalid pairing PIN');
      }
    }
    _setState(RemoteConnectionState.ready);
    return PairResult.success('auth-token-12345');
  }

  @override
  Future<void> connect(Device d) async {
    _setState(RemoteConnectionState.connecting);
    await Future.delayed(const Duration(milliseconds: 30));
    _setState(RemoteConnectionState.ready);
  }

  @override
  Future<void> disconnect() async {
    _setState(RemoteConnectionState.disconnected);
  }

  @override
  Future<void> sendKey(RemoteKey key, {KeyPress press = KeyPress.tap}) async {
    keyHistory.add(key);
    switch (key) {
      case RemoteKey.power:
        power = !power;
        break;
      case RemoteKey.volumeUp:
        if (volume < 100) volume++;
        isMuted = false;
        break;
      case RemoteKey.volumeDown:
        if (volume > 0) volume--;
        break;
      case RemoteKey.mute:
        isMuted = !isMuted;
        break;
      default:
        break;
    }
  }

  @override
  Future<void> powerOn(Device d) async {
    power = true;
    _setState(RemoteConnectionState.ready);
  }

  @override
  Future<void> powerOff() async {
    power = false;
  }

  @override
  Future<void> setVolume(int level) async {
    volume = level.clamp(0, 100);
    isMuted = false;
  }

  @override
  Future<List<AppInfo>> listApps() async {
    return const [
      AppInfo(id: 'netflix', name: 'Netflix'),
      AppInfo(id: 'youtube', name: 'YouTube'),
      AppInfo(id: 'prime', name: 'Prime Video'),
      AppInfo(id: 'disney', name: 'Disney+'),
    ];
  }

  @override
  Future<void> launchApp(String appId) async {
    currentApp = appId;
  }

  @override
  Future<void> typeText(String text) async {
    textHistory.add(text);
  }

  @override
  Future<void> pointerMove(double dx, double dy) async {
    pointerX += dx;
    pointerY += dy;
  }

  @override
  Capabilities get capabilities => const Capabilities(
        hasPower: true,
        hasVolume: true,
        hasVolumeSlider: true,
        hasDpad: true,
        hasPointer: true,
        hasNumberPad: true,
        hasColorKeys: true,
        hasApps: true,
        hasKeyboard: true,
        hasChannels: true,
        powerOnReliability: PowerOnReliability.reliable,
      );

  void dispose() {
    _connectionController.close();
  }
}
