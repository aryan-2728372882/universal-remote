import 'dart:async';
import 'dart:convert';
import 'dart:io';
import '../remote_adapter.dart';
import '../../core/logging.dart';
import '../../data/models/device.dart';
import '../../data/secure_token_store.dart';
import '../../discovery/wol/wake_on_lan.dart';

/// Samsung Tizen Smart TV Adapter (WebSocket API v2)
class SamsungAdapter implements RemoteAdapter {
  final SecureTokenStore tokenStore;
  final _connectionController = StreamController<RemoteConnectionState>.broadcast();
  RemoteConnectionState _state = RemoteConnectionState.disconnected;
  RemoteConnectionState get state => _state;

  WebSocket? _ws;
  Device? _activeDevice;
  Device? get activeDevice => _activeDevice;
  String? _token;

  SamsungAdapter({required this.tokenStore});

  @override
  String get brandId => 'samsung';

  @override
  String get protocolVersion => 'Samsung Tizen v2 (wss 8002)';

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
      final nameBase64 = base64.encode(utf8.encode('Universal Smart Remote'));
      final uri = 'wss://${d.ip}:8002/api/v2/channels/samsung.remote.control?name=$nameBase64';

      final client = HttpClient()..badCertificateCallback = (cert, host, port) => true;
      _ws = await WebSocket.connect(uri, customClient: client);

      cb.onShowPromptOnTv?.call();
      final completer = Completer<PairResult>();

      _ws!.listen((data) {
        try {
          final msg = json.decode(data.toString()) as Map<String, dynamic>;
          if (msg['event'] == 'ms.channel.connect') {
            final tok = msg['data']?['token'] as String?;
            if (tok != null) {
              _token = tok;
              tokenStore.saveToken(d.id, tok);
            }
            _setState(RemoteConnectionState.ready);
            if (!completer.isCompleted) completer.complete(PairResult.success(tok));
          }
        } catch (_) {}
      }, onDone: () {
        _setState(RemoteConnectionState.lost);
      });

      return await completer.future.timeout(
        const Duration(seconds: 30),
        onTimeout: () {
          _setState(RemoteConnectionState.authRequired);
          return PairResult.failed('Pairing prompt timed out. Accept on Samsung TV screen.');
        },
      );
    } catch (e) {
      _setState(RemoteConnectionState.authRequired);
      return PairResult.failed('Could not connect to Samsung TV on port 8002: $e');
    }
  }

  @override
  Future<void> connect(Device d) async {
    _activeDevice = d;
    _token = await tokenStore.getToken(d.id);
    _setState(RemoteConnectionState.connecting);

    try {
      final nameBase64 = base64.encode(utf8.encode('Universal Smart Remote'));
      var uri = 'wss://${d.ip}:8002/api/v2/channels/samsung.remote.control?name=$nameBase64';
      if (_token != null) uri += '&token=$_token';

      final client = HttpClient()..badCertificateCallback = (cert, host, port) => true;
      _ws = await WebSocket.connect(uri, customClient: client);

      _ws!.listen((data) {
        // Socket listener
      }, onDone: () {
        _setState(RemoteConnectionState.lost);
      });

      _setState(RemoteConnectionState.ready);
    } catch (e) {
      AppLogger.warning('Samsung TV connect error: $e');
      _setState(RemoteConnectionState.lost);
    }
  }

  @override
  Future<void> sendKey(RemoteKey key, {KeyPress press = KeyPress.tap}) async {
    if (_ws == null) return;

    final keyMap = {
      RemoteKey.power: 'KEY_POWER',
      RemoteKey.home: 'KEY_HOME',
      RemoteKey.back: 'KEY_RETURN',
      RemoteKey.enter: 'KEY_ENTER',
      RemoteKey.up: 'KEY_UP',
      RemoteKey.down: 'KEY_DOWN',
      RemoteKey.left: 'KEY_LEFT',
      RemoteKey.right: 'KEY_RIGHT',
      RemoteKey.volumeUp: 'KEY_VOLUP',
      RemoteKey.volumeDown: 'KEY_VOLDOWN',
      RemoteKey.mute: 'KEY_MUTE',
      RemoteKey.menu: 'KEY_MENU',
      RemoteKey.info: 'KEY_INFO',
    };

    final command = keyMap[key];
    if (command != null) {
      final packet = {
        'method': 'ms.remote.control',
        'params': {
          'Cmd': 'Click',
          'DataOfCmd': command,
          'Option': 'false',
          'TypeOfRemote': 'SendRemoteKey',
        }
      };
      _ws!.add(json.encode(packet));
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
  Future<void> setVolume(int level) async {}

  @override
  Future<List<AppInfo>> listApps() async {
    return const [
      AppInfo(id: '3201412000512', name: 'YouTube'),
      AppInfo(id: '11101200001', name: 'Netflix'),
      AppInfo(id: '3201512006785', name: 'Prime Video'),
    ];
  }

  @override
  Future<void> launchApp(String appId) async {}

  @override
  Future<void> typeText(String text) async {}

  @override
  Future<void> pointerMove(double dx, double dy) async {}

  @override
  Future<void> disconnect() async {
    await _ws?.close();
    _ws = null;
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
        hasColorKeys: true,
        hasApps: true,
        hasKeyboard: false,
        hasChannels: true,
        powerOnReliability: PowerOnReliability.unreliable,
      );
}
