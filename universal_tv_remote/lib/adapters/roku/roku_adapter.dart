import 'dart:async';
import 'dart:io';
import '../remote_adapter.dart';
import '../../core/logging.dart';
import '../../data/models/device.dart';
import '../../discovery/wol/wake_on_lan.dart';

/// Roku External Control Protocol (ECP) Adapter
class RokuAdapter implements RemoteAdapter {
  final _connectionController = StreamController<RemoteConnectionState>.broadcast();
  RemoteConnectionState _state = RemoteConnectionState.disconnected;
  RemoteConnectionState get state => _state;

  Device? _activeDevice;
  final HttpClient _client = HttpClient()..connectionTimeout = const Duration(milliseconds: 1500);

  @override
  String get brandId => 'roku';

  @override
  String get protocolVersion => 'Roku ECP v1.0';

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

    // Roku needs no PIN pairing; verify presence via /query/device-info
    try {
      final req = await _client.getUrl(Uri.parse('http://${d.ip}:8060/query/device-info'));
      final res = await req.close();
      if (res.statusCode == 200) {
        _setState(RemoteConnectionState.ready);
        return PairResult.success();
      }
      _setState(RemoteConnectionState.lost);
      return PairResult.failed('Roku did not respond with 200 OK');
    } catch (e) {
      _setState(RemoteConnectionState.lost);
      return PairResult.failed('Failed to reach Roku device: $e');
    }
  }

  @override
  Future<void> connect(Device d) async {
    _activeDevice = d;
    _setState(RemoteConnectionState.ready);
  }

  Future<bool> _post(String path) async {
    if (_activeDevice == null) return false;
    try {
      final req = await _client.postUrl(Uri.parse('http://${_activeDevice!.ip}:8060$path'));
      final res = await req.close();
      return res.statusCode == 200;
    } catch (e) {
      AppLogger.warning('Roku command failed: $path, $e');
      return false;
    }
  }

  @override
  Future<void> sendKey(RemoteKey key, {KeyPress press = KeyPress.tap}) async {
    final keyMap = {
      RemoteKey.home: 'Home',
      RemoteKey.back: 'Back',
      RemoteKey.up: 'Up',
      RemoteKey.down: 'Down',
      RemoteKey.left: 'Left',
      RemoteKey.right: 'Right',
      RemoteKey.enter: 'Select',
      RemoteKey.volumeUp: 'VolumeUp',
      RemoteKey.volumeDown: 'VolumeDown',
      RemoteKey.mute: 'VolumeMute',
      RemoteKey.play: 'Play',
      RemoteKey.pause: 'Play',
      RemoteKey.playPause: 'Play',
      RemoteKey.rewind: 'Rev',
      RemoteKey.fastForward: 'Fwd',
      RemoteKey.info: 'Info',
      RemoteKey.power: 'Power',
    };

    final command = keyMap[key];
    if (command != null) {
      await _post('/keypress/$command');
    }
  }

  @override
  Future<void> powerOn(Device d) async {
    if (d.mac != null) {
      await WakeOnLan.send(mac: d.mac!, ip: d.ip);
    }
    await _post('/keypress/PowerOn');
  }

  @override
  Future<void> powerOff() async {
    await _post('/keypress/PowerOff');
  }

  @override
  Future<void> setVolume(int level) async {}

  @override
  Future<List<AppInfo>> listApps() async {
    if (_activeDevice == null) return [];
    try {
      final req = await _client.getUrl(Uri.parse('http://${_activeDevice!.ip}:8060/query/apps'));
      final res = await req.close();
      if (res.statusCode == 200) {
        // Return standard popular app shortcuts
        return const [
          AppInfo(id: '12', name: 'Netflix'),
          AppInfo(id: '837', name: 'YouTube'),
          AppInfo(id: '13', name: 'Prime Video'),
          AppInfo(id: '291097', name: 'Disney+'),
        ];
      }
    } catch (_) {}
    return [];
  }

  @override
  Future<void> launchApp(String appId) async {
    await _post('/launch/$appId');
  }

  @override
  Future<void> typeText(String text) async {
    for (final char in text.runes) {
      final c = String.fromCharCode(char);
      await _post('/keypress/Lit_${Uri.encodeComponent(c)}');
    }
  }

  @override
  Future<void> pointerMove(double dx, double dy) async {}

  @override
  Future<void> disconnect() async {
    _setState(RemoteConnectionState.disconnected);
  }

  @override
  Capabilities get capabilities => const Capabilities(
        hasPower: true,
        hasVolume: true,
        hasVolumeSlider: false,
        hasDpad: true,
        hasPointer: false,
        hasNumberPad: false,
        hasColorKeys: false,
        hasApps: true,
        hasKeyboard: true,
        hasChannels: true,
        powerOnReliability: PowerOnReliability.unreliable,
      );
}
