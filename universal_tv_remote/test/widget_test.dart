import 'package:flutter_test/flutter_test.dart';
import 'package:universal_tv_remote/data/device_repository.dart';
import 'package:universal_tv_remote/data/secure_token_store.dart';
import 'package:universal_tv_remote/discovery/discovery_service.dart';
import 'package:universal_tv_remote/main.dart';
import 'package:universal_tv_remote/services/sleep_timer_service.dart';

void main() {
  testWidgets('UniversalRemoteApp smoke test renders onboarding or home', (WidgetTester tester) async {
    final tokenStore = SecureTokenStore(useMemoryOnly: true);
    final repository = DeviceRepository(useMemoryOnly: true);
    final discovery = DiscoveryService();
    final sleepTimer = SleepTimerService();

    await tester.pumpWidget(
      UniversalRemoteApp(
        repository: repository,
        tokenStore: tokenStore,
        discovery: discovery,
        sleepTimer: sleepTimer,
      ),
    );

    await tester.pump();
    expect(find.byType(UniversalRemoteApp), findsOneWidget);
  });
}
