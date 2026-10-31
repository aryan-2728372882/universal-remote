import 'dart:async';
import '../data/models/device.dart';

/// Connection state of the remote adapter
enum RemoteConnectionState {
  disconnected,
  connecting,
  ready,
  lost,
  authRequired,
}

/// Remote Key actions
enum RemoteKey {
  power,
  home,
  back,
  menu,
  info,
  input,
  up,
  down,
  left,
  right,
  enter,
  volumeUp,
  volumeDown,
  mute,
  channelUp,
  channelDown,
  play,
  pause,
  playPause,
  rewind,
  fastForward,
  num0,
  num1,
  num2,
  num3,
  num4,
  num5,
  num6,
  num7,
  num8,
  num9,
  red,
  green,
  yellow,
  blue,
}

/// Key Press Type
enum KeyPress {
  tap,
  pressAndHold,
  release,
}

/// Installed TV Application
class AppInfo {
  final String id;
  final String name;
  final String? iconUrl;

  const AppInfo({
    required this.id,
    required this.name,
    this.iconUrl,
  });

  @override
  String toString() => 'AppInfo($name, id: $id)';
}

/// TV Capability profile - UI hides what is unsupported
class Capabilities {
  final bool hasPower;
  final bool hasVolume;
  final bool hasVolumeSlider;
  final bool hasDpad;
  final bool hasPointer; // Touchpad support
  final bool hasNumberPad;
  final bool hasColorKeys;
  final bool hasApps;
  final bool hasKeyboard;
  final bool hasChannels;
  final PowerOnReliability powerOnReliability;

  const Capabilities({
    this.hasPower = true,
    this.hasVolume = true,
    this.hasVolumeSlider = false,
    this.hasDpad = true,
    this.hasPointer = false,
    this.hasNumberPad = true,
    this.hasColorKeys = false,
    this.hasApps = false,
    this.hasKeyboard = false,
    this.hasChannels = true,
    this.powerOnReliability = PowerOnReliability.unreliable,
  });
}

/// Result of pairing attempt
class PairResult {
  final bool ok;
  final String? error;
  final String? token;

  const PairResult({
    required this.ok,
    this.error,
    this.token,
  });

  factory PairResult.success([String? token]) => PairResult(ok: true, token: token);
  factory PairResult.failed(String error) => PairResult(ok: false, error: error);
}

/// Callbacks passed during pairing
class PairingCallbacks {
  final Future<String> Function()? onRequestPin;
  final void Function()? onShowPromptOnTv;

  const PairingCallbacks({
    this.onRequestPin,
    this.onShowPromptOnTv,
  });
}

/// Common Interface for all TV Brand Adapters
abstract class RemoteAdapter {
  String get brandId;
  String get protocolVersion;
  String get lastVerifiedDate;

  Future<PairResult> pair(Device d, PairingCallbacks cb);
  Future<void> connect(Device d);
  Future<void> disconnect();
  Stream<RemoteConnectionState> get connection;
  Future<void> sendKey(RemoteKey key, {KeyPress press = KeyPress.tap});
  Future<void> powerOn(Device d);
  Future<void> powerOff();
  Future<void> setVolume(int level);
  Future<List<AppInfo>> listApps();
  Future<void> launchApp(String appId);
  Future<void> typeText(String text);
  Future<void> pointerMove(double dx, double dy);
  Capabilities get capabilities;
}
