import 'dart:async';
import 'dart:convert';
import 'dart:io';
import '../remote_adapter.dart';
import '../../core/logging.dart';
import '../../data/models/device.dart';
import '../../data/secure_token_store.dart';
import '../../discovery/wol/wake_on_lan.dart';

/// LG webOS Remote Adapter (SSAP & Pointer Socket)
class LgWebosAdapter implements RemoteAdapter {
  final SecureTokenStore tokenStore;
  final _connectionController = StreamController<RemoteConnectionState>.broadcast();
  RemoteConnectionState _state = RemoteConnectionState.disconnected;
  RemoteConnectionState get state => _state;

  WebSocket? _ws;
  WebSocket? _pointerWs;
  String? _clientKey;
  int _requestId = 1;
  final Map<String, Completer<dynamic>> _callbacks = {};
  Device? _activeDevice;

  LgWebosAdapter({required this.tokenStore});

  @override
  String get brandId => 'lg_webos';

  @override
  String get protocolVersion => 'SSAP v2 (webOS 3.5 - webOS 23)';

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
      final connected = await _tryConnect(d.ip);
      if (!connected) {
        _setState(RemoteConnectionState.lost);
        return PairResult.failed('Could not connect to LG TV on ${d.ip}:3001 or 3000');
      }

      cb.onShowPromptOnTv?.call();
      final completer = Completer<PairResult>();

      // Send registration handshake
      _sendRegistration(completer);

      // 30s timeout waiting for user to click Accept on physical remote
      return await completer.future.timeout(
        const Duration(seconds: 30),
        onTimeout: () {
          _setState(RemoteConnectionState.authRequired);
          return PairResult.failed('Pairing prompt timed out. Select Accept on TV screen.');
        },
      );
    } catch (e) {
      _setState(RemoteConnectionState.authRequired);
      return PairResult.failed(e.toString());
    }
  }

  @override
  Future<void> connect(Device d) async {
    _activeDevice = d;
    _clientKey = await tokenStore.getToken(d.id);
    _setState(RemoteConnectionState.connecting);

    final ok = await _tryConnect(d.ip);
    if (!ok) {
      _setState(RemoteConnectionState.lost);
      return;
    }

    _sendRegistration(null);
    _setState(RemoteConnectionState.ready);
  }

  Future<bool> _tryConnect(String ip) async {
    // 1. Try wss://:3001 with custom self-signed security context
    try {
      final client = HttpClient()
        ..badCertificateCallback = (cert, host, port) => true;
      _ws = await WebSocket.connect('wss://$ip:3001', customClient: client)
          .timeout(const Duration(milliseconds: 2000));
      _setupSocketListener(_ws!);
      return true;
    } catch (_) {
      // 2. Fall back to ws://:3000
      try {
        _ws = await WebSocket.connect('ws://$ip:3000')
            .timeout(const Duration(milliseconds: 2000));
        _setupSocketListener(_ws!);
        return true;
      } catch (e) {
        AppLogger.warning('LG webOS connection failed on $ip: $e');
        return false;
      }
    }
  }

  void _setupSocketListener(WebSocket ws) {
    ws.listen(
      (data) {
        try {
          final msg = json.decode(data.toString()) as Map<String, dynamic>;
          _handleMessage(msg);
        } catch (_) {}
      },
      onDone: () {
        _ws = null;
        _pointerWs?.close();
        _pointerWs = null;
        _setState(RemoteConnectionState.lost);
      },
      onError: (_) {
        _setState(RemoteConnectionState.lost);
      },
    );
  }

  void _sendRegistration(Completer<PairResult>? pairCompleter) {
    final reqId = 'reg_${_requestId++}';
    if (pairCompleter != null) {
      _callbacks[reqId] = pairCompleter;
    }

    final packet = {
      'type': 'register',
      'id': reqId,
      'payload': {
        'forcePairing': false,
        'pairingType': 'PROMPT',
        'client-key': _clientKey,
        'manifest': {
          'manifestVersion': 1,
          'appVersion': '1.0',
          'signed': {
            'created': '20240101',
            'appId': 'com.universaltv.remote',
            'vendorId': 'com.universal',
            'localizedAppNames': {'': 'Universal Remote'},
            'permissions': [
              'LAUNCH', 'CONTROL_AUDIO', 'CONTROL_INPUT_JOYSTICK', 'CONTROL_INPUT_TV',
              'READ_RUNNING_APPS', 'WRITE_NOTIFICATION_TOAST'
            ]
          }
        }
      }
    };

    _ws?.add(json.encode(packet));
  }

  void _handleMessage(Map<String, dynamic> msg) {
    final type = msg['type'] as String?;
    final id = msg['id'] as String?;

    if (type == 'registered') {
      final key = msg['payload']?['client-key'] as String?;
      if (key != null && _activeDevice != null) {
        _clientKey = key;
        tokenStore.saveToken(_activeDevice!.id, key);
        _initPointerSocket();
        _setState(RemoteConnectionState.ready);
      }
      if (id != null && _callbacks.containsKey(id)) {
        _callbacks[id]!.complete(PairResult.success(key));
        _callbacks.remove(id);
      }
    } else if (type == 'response' && id != null && _callbacks.containsKey(id)) {
      _callbacks[id]!.complete(msg);
      _callbacks.remove(id);
    }
  }

  Future<void> _initPointerSocket() async {
    try {
      final res = await _request('ssap://com.webos.service.networkinput/getPointerInputSocket');
      final socketPath = res?['payload']?['socketPath'] as String?;
      if (socketPath != null) {
        final client = HttpClient()
          ..badCertificateCallback = (cert, host, port) => true;
        _pointerWs = await WebSocket.connect(socketPath, customClient: client);
        AppLogger.info('LG Pointer input socket connected');
      }
    } catch (e) {
      AppLogger.warning('Failed to open pointer socket: $e');
    }
  }

  Future<dynamic> _request(String uri, [Map<String, dynamic>? payload]) {
    final id = 'req_${_requestId++}';
    final completer = Completer<dynamic>();
    _callbacks[id] = completer;

    final packet = {
      'type': 'request',
      'id': id,
      'uri': uri,
      'payload': payload ?? {},
    };

    _ws?.add(json.encode(packet));

    return completer.future.timeout(
      const Duration(milliseconds: 2500),
      onTimeout: () {
        _callbacks.remove(id);
        return null;
      },
    );
  }

  @override
  Future<void> sendKey(RemoteKey key, {KeyPress press = KeyPress.tap}) async {
    final pointerButtons = {
      RemoteKey.up: 'UP',
      RemoteKey.down: 'DOWN',
      RemoteKey.left: 'LEFT',
      RemoteKey.right: 'RIGHT',
      RemoteKey.enter: 'ENTER',
      RemoteKey.back: 'BACK',
      RemoteKey.home: 'HOME',
      RemoteKey.menu: 'MENU',
      RemoteKey.red: 'RED',
      RemoteKey.green: 'GREEN',
      RemoteKey.yellow: 'YELLOW',
      RemoteKey.blue: 'BLUE',
    };

    if (pointerButtons.containsKey(key)) {
      final btn = pointerButtons[key]!;
      if (_pointerWs != null) {
        _pointerWs!.add('type:button\nname:$btn\n\n');
        return;
      }
    }

    // Direct SSAP URIs for Audio, Channels and Media
    switch (key) {
      case RemoteKey.volumeUp:
        await _request('ssap://audio/volumeUp');
        break;
      case RemoteKey.volumeDown:
        await _request('ssap://audio/volumeDown');
        break;
      case RemoteKey.mute:
        await _request('ssap://audio/setMuted', {'mute': true});
        break;
      case RemoteKey.channelUp:
        await _request('ssap://tv/channelUp');
        break;
      case RemoteKey.channelDown:
        await _request('ssap://tv/channelDown');
        break;
      case RemoteKey.play:
      case RemoteKey.playPause:
        await _request('ssap://media.controls/play');
        break;
      case RemoteKey.pause:
        await _request('ssap://media.controls/pause');
        break;
      case RemoteKey.rewind:
        await _request('ssap://media.controls/rewind');
        break;
      case RemoteKey.fastForward:
        await _request('ssap://media.controls/fastForward');
        break;
      case RemoteKey.power:
        await powerOff();
        break;
      default:
        break;
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
    await _request('ssap://system/turnOff');
  }

  @override
  Future<void> setVolume(int level) async {
    await _request('ssap://audio/setVolume', {'volume': level});
  }

  @override
  Future<List<AppInfo>> listApps() async {
    final res = await _request('ssap://com.webos.applicationManager/listLaunchPoints');
    final launchPoints = res?['payload']?['launchPoints'] as List<dynamic>?;
    if (launchPoints == null) return [];
    return launchPoints.map((p) {
      return AppInfo(
        id: p['id'] as String,
        name: p['title'] as String,
        iconUrl: p['icon'] as String?,
      );
    }).toList();
  }

  @override
  Future<void> launchApp(String appId) async {
    await _request('ssap://system.launcher/launch', {'id': appId});
  }

  @override
  Future<void> typeText(String text) async {
    await _request('ssap://com.webos.service.ime/insertText', {'text': text, 'replace': 0});
  }

  @override
  Future<void> pointerMove(double dx, double dy) async {
    if (_pointerWs != null) {
      _pointerWs!.add('type:move\ndx:$dx\ndy:$dy\ndown:0\n\n');
    }
  }

  @override
  Future<void> disconnect() async {
    _pointerWs?.close();
    _pointerWs = null;
    _ws?.close();
    _ws = null;
    _setState(RemoteConnectionState.disconnected);
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
        powerOnReliability: PowerOnReliability.unreliable,
      );
}
