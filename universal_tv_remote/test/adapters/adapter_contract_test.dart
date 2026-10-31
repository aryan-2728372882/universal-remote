import 'package:flutter_test/flutter_test.dart';
import 'package:universal_tv_remote/adapters/remote_adapter.dart';
import 'package:universal_tv_remote/data/models/device.dart';
import '../test_helpers/test_device_adapter.dart';

void main() {
  group('RemoteAdapter Contract and TestDeviceAdapter tests', () {
    late TestDeviceAdapter adapter;
    final testDevice = Device(
      id: 'living_room_tv_1',
      name: 'LG webOS Smart TV',
      brand: DeviceBrand.lgWebos,
      ip: '192.168.1.50',
      mac: '00:11:22:33:44:55',
      protocol: 'SSAP',
      port: 3001,
      lastSeen: DateTime.now(),
      createdAt: DateTime.now(),
    );

    setUp(() {
      adapter = TestDeviceAdapter();
    });

    tearDown(() {
      adapter.dispose();
    });

    test('Initial connection state is disconnected', () {
      expect(adapter.currentState, RemoteConnectionState.disconnected);
      expect(adapter.brandId, 'lg_webos');
      expect(adapter.protocolVersion, '1.0');
      expect(adapter.lastVerifiedDate, isNotEmpty);
    });

    test('Connect and disconnect update connection state stream', () async {
      final states = <RemoteConnectionState>[];
      final sub = adapter.connection.listen(states.add);

      await adapter.connect(testDevice);
      expect(adapter.currentState, RemoteConnectionState.ready);

      await adapter.disconnect();
      await Future.delayed(const Duration(milliseconds: 20));
      expect(adapter.currentState, RemoteConnectionState.disconnected);

      await sub.cancel();
      expect(states, [RemoteConnectionState.connecting, RemoteConnectionState.ready, RemoteConnectionState.disconnected]);
    });

    test('Pairing with valid PIN succeeds and returns token', () async {
      final result = await adapter.pair(
        testDevice,
        PairingCallbacks(onRequestPin: () async => '1234'),
      );

      expect(result.ok, isTrue);
      expect(result.token, 'auth-token-12345');
      expect(adapter.currentState, RemoteConnectionState.ready);
    });

    test('Pairing with invalid PIN fails', () async {
      final result = await adapter.pair(
        testDevice,
        PairingCallbacks(onRequestPin: () async => '9999'),
      );

      expect(result.ok, isFalse);
      expect(result.error, contains('Invalid pairing PIN'));
      expect(adapter.currentState, RemoteConnectionState.authRequired);
    });

    test('Keys modify volume and mute states predictably', () async {
      final initialVol = adapter.volume;
      await adapter.sendKey(RemoteKey.volumeUp);
      expect(adapter.volume, initialVol + 1);

      await adapter.sendKey(RemoteKey.mute);
      expect(adapter.isMuted, isTrue);

      await adapter.sendKey(RemoteKey.volumeUp);
      expect(adapter.isMuted, isFalse); // Volume up unmutes

      await adapter.setVolume(55);
      expect(adapter.volume, 55);
    });

    test('D-pad and media keys are logged into keyHistory', () async {
      await adapter.sendKey(RemoteKey.up);
      await adapter.sendKey(RemoteKey.down);
      await adapter.sendKey(RemoteKey.enter);
      await adapter.sendKey(RemoteKey.back);

      expect(adapter.keyHistory, [
        RemoteKey.up,
        RemoteKey.down,
        RemoteKey.enter,
        RemoteKey.back,
      ]);
    });

    test('App listing and launch work correctly', () async {
      final apps = await adapter.listApps();
      expect(apps.length, 4);
      expect(apps.first.name, 'Netflix');

      await adapter.launchApp('youtube');
      expect(adapter.currentApp, 'youtube');
    });

    test('Pointer move and type text record coordinates and text', () async {
      await adapter.pointerMove(10.5, -5.2);
      expect(adapter.pointerX, 10.5);
      expect(adapter.pointerY, -5.2);

      await adapter.typeText('Search Query');
      expect(adapter.textHistory, ['Search Query']);
    });

    test('Capabilities expose all expected remote controls', () {
      final caps = adapter.capabilities;
      expect(caps.hasPower, isTrue);
      expect(caps.hasVolume, isTrue);
      expect(caps.hasDpad, isTrue);
      expect(caps.hasPointer, isTrue);
      expect(caps.hasApps, isTrue);
      expect(caps.hasKeyboard, isTrue);
      expect(caps.powerOnReliability, PowerOnReliability.reliable);
    });
  });
}
