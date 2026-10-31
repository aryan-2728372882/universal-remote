import 'package:flutter_test/flutter_test.dart';
import 'package:universal_tv_remote/services/sleep_timer_service.dart';

void main() {
  group('SleepTimerService Tests', () {
    late SleepTimerService service;

    setUp(() {
      service = SleepTimerService();
    });

    tearDown(() {
      service.dispose();
    });

    test('Initial state is inactive with 0 remaining seconds', () {
      expect(service.isActive, isFalse);
      expect(service.remainingSeconds, 0);
    });

    test('Starting timer sets remaining seconds and active flag', () {
      service.start(minutes: 15, onExpire: () async {});

      expect(service.isActive, isTrue);
      expect(service.remainingSeconds, 15 * 60);
    });

    test('Cancel resets remaining seconds to 0 and becomes inactive', () {
      service.start(minutes: 30, onExpire: () async {});
      expect(service.isActive, isTrue);

      service.cancel();
      expect(service.isActive, isFalse);
      expect(service.remainingSeconds, 0);
    });
  });
}
