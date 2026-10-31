import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:universal_tv_remote/adapters/remote_adapter.dart';
import 'package:universal_tv_remote/data/models/device.dart';
import 'package:universal_tv_remote/features/remote/elder_remote.dart';
import '../test_helpers/test_device_adapter.dart';

void main() {
  group('ElderRemoteScreen Widget Tests', () {
    late TestDeviceAdapter adapter;
    final testDevice = Device(
      id: 'elder_tv_1',
      name: 'Nokia Smart TV',
      brand: DeviceBrand.androidTv,
      ip: '192.168.1.99',
      protocol: 'ANDROID_REMOTE_V2',
      port: 6467,
      lastSeen: DateTime.now(),
      createdAt: DateTime.now(),
    );

    setUp(() {
      adapter = TestDeviceAdapter();
    });

    tearDown(() {
      adapter.dispose();
    });

    testWidgets('Renders simplified streaming TV escape layout for seniors', (tester) async {
      tester.view.physicalSize = const Size(1080, 2400);
      tester.view.devicePixelRatio = 2.625;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);

      bool exited = false;

      await tester.pumpWidget(
        MaterialApp(
          home: ElderRemoteScreen(
            device: testDevice,
            adapter: adapter,
            onExitElderMode: () => exited = true,
          ),
        ),
      );

      // Verify device title
      expect(find.text('Nokia Smart TV'), findsOneWidget);

      // Verify high contrast large streaming TV action buttons
      expect(find.text('TV POWER'), findsOneWidget);
      expect(find.text('VOL +'), findsOneWidget);
      expect(find.text('VOL -'), findsOneWidget);
      expect(find.text('HOME'), findsOneWidget);
      expect(find.text('BACK'), findsOneWidget);
      expect(find.text('MUTE'), findsOneWidget);
      expect(find.text('PLAY/PAUSE'), findsOneWidget);
      expect(find.text('OK'), findsOneWidget);

      // Tap POWER button
      await tester.tap(find.text('TV POWER'));
      await tester.pump();
      expect(adapter.keyHistory, contains(RemoteKey.power));

      // Tap VOL + button
      await tester.tap(find.text('VOL +'));
      await tester.pump();
      expect(adapter.keyHistory, contains(RemoteKey.volumeUp));

      // Tap HOME button
      await tester.tap(find.text('HOME'));
      await tester.pump();
      expect(adapter.keyHistory, contains(RemoteKey.home));

      // Tap Exit
      await tester.tap(find.text('Standard Mode'));
      await tester.pump();
      expect(exited, isTrue);
    });
  });
}
