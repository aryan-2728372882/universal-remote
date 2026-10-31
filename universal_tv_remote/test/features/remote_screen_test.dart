import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:universal_tv_remote/adapters/remote_adapter.dart';
import 'package:universal_tv_remote/data/models/device.dart';
import 'package:universal_tv_remote/features/remote/remote_screen.dart';
import 'package:universal_tv_remote/features/remote/widgets/oled_status_display.dart';
import 'package:universal_tv_remote/features/remote/widgets/dpad_wheel.dart';
import 'package:universal_tv_remote/services/sleep_timer_service.dart';
import '../test_helpers/test_device_adapter.dart';

void main() {
  group('RemoteScreen Star UI Widget Tests', () {
    late TestDeviceAdapter adapter;
    late SleepTimerService sleepTimer;
    final testDevice = Device(
      id: 'living_room_tv',
      name: 'LG webOS Smart TV',
      brand: DeviceBrand.lgWebos,
      ip: '192.168.1.100',
      protocol: 'SSAP',
      port: 3001,
      lastSeen: DateTime.now(),
      createdAt: DateTime.now(),
    );

    setUp(() {
      adapter = TestDeviceAdapter();
      sleepTimer = SleepTimerService();
    });

    tearDown(() {
      adapter.dispose();
      sleepTimer.dispose();
    });

    testWidgets('Renders TV name, OLED display, D-pad, and Indian OTT shortcut buttons', (tester) async {
      tester.view.physicalSize = const Size(1080, 2400);
      tester.view.devicePixelRatio = 2.625;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);

      await tester.pumpWidget(
        MaterialApp(
          home: RemoteScreen(
            device: testDevice,
            adapter: adapter,
            sleepTimer: sleepTimer,
            onOpenConnectionDoctor: () {},
            onOpenSleepTimer: () {},
            onBack: () {},
          ),
        ),
      );

      // Allow connect 30ms timer to fire
      await tester.pump(const Duration(milliseconds: 50));

      // OLED Status Display is present
      expect(find.byType(OledStatusDisplay), findsOneWidget);
      expect(find.text('LG webOS Smart TV'), findsWidgets);

      // Volume & Channel indicators
      expect(find.text('VOLUME'), findsOneWidget);
      expect(find.text('CHANNEL'), findsOneWidget);

      // D-Pad navigation wheel is present
      expect(find.byType(DpadWheel), findsOneWidget);

      // Switch to Apps section via Navigation Dock
      await tester.tap(find.text('Apps'));
      await tester.pump(const Duration(milliseconds: 50));

      // Indian OTT App shortcuts grid in Apps section
      expect(find.text('JioHotstar'), findsOneWidget);
      expect(find.text('Netflix'), findsOneWidget);
      expect(find.text('Prime Video'), findsOneWidget);
      expect(find.text('YouTube'), findsOneWidget);

      // Finish any pending frames
      await tester.pump(const Duration(milliseconds: 50));
    });

    testWidgets('Tapping app shortcut triggers launchApp on adapter', (tester) async {
      tester.view.physicalSize = const Size(1080, 2400);
      tester.view.devicePixelRatio = 2.625;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);

      await tester.pumpWidget(
        MaterialApp(
          home: RemoteScreen(
            device: testDevice,
            adapter: adapter,
            sleepTimer: sleepTimer,
            onOpenConnectionDoctor: () {},
            onOpenSleepTimer: () {},
            onBack: () {},
          ),
        ),
      );

      await tester.pump(const Duration(milliseconds: 50));

      // Switch to Apps section via Navigation Dock
      await tester.tap(find.text('Apps'));
      await tester.pump(const Duration(milliseconds: 50));

      // Tap Netflix pill in Apps Hub
      await tester.tap(find.text('Netflix'));
      await tester.pump(const Duration(milliseconds: 50));

      expect(adapter.currentApp, 'netflix');

      // Let toast timer fire or clear
      await tester.pump(const Duration(seconds: 3));
    });

    testWidgets('Tapping power button sends RemoteKey.power and toggles power state', (tester) async {
      tester.view.physicalSize = const Size(1080, 2400);
      tester.view.devicePixelRatio = 2.625;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);

      await tester.pumpWidget(
        MaterialApp(
          home: RemoteScreen(
            device: testDevice,
            adapter: adapter,
            sleepTimer: sleepTimer,
            onOpenConnectionDoctor: () {},
            onOpenSleepTimer: () {},
            onBack: () {},
          ),
        ),
      );

      await tester.pump(const Duration(milliseconds: 50));

      final powerButton = find.text('TV ON');
      expect(powerButton, findsOneWidget);

      await tester.tap(powerButton);
      await tester.pump(const Duration(milliseconds: 50));

      expect(adapter.keyHistory, contains(RemoteKey.power));
      expect(find.text('TV OFF'), findsOneWidget);

      // Let toast timer fire or clear
      await tester.pump(const Duration(seconds: 3));
    });
  });
}
