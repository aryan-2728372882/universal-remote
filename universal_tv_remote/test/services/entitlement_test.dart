import 'package:flutter_test/flutter_test.dart';
import 'package:universal_tv_remote/services/entitlement_service.dart';

void main() {
  group('EntitlementService & Section 16 Monetization Tests', () {
    final service = EntitlementService();

    test('Master switch monetizationEnabled is FALSE by default', () {
      expect(EntitlementService.monetizationEnabled, isFalse);
    });

    test('When monetization is disabled, user is unlocked with no ad limits', () {
      final entitlement = service.currentEntitlement;
      expect(entitlement.isPro, isTrue);
      expect(entitlement.hasAds, isFalse);
      expect(entitlement.hasScenes, isTrue);
      expect(entitlement.maxSavedDevices, greaterThan(100));
      expect(service.canAddDevice(50), isTrue);
    });

    test('Section 16: Strictly NO weekly plans exist in catalog', () {
      final plans = EntitlementService.availablePlans;
      final hasWeekly = plans.any((p) =>
          p.billingPeriod.toLowerCase().contains('week') ||
          p.id.toLowerCase().contains('week') ||
          p.name.toLowerCase().contains('week'));
      expect(hasWeekly, isFalse, reason: 'Weekly plans are prohibited by Section 16');
    });

    test('Section 16: Only Monthly, Yearly, and Lifetime tiers are permitted', () {
      final periods = EntitlementService.availablePlans.map((p) => p.billingPeriod).toSet();
      expect(periods, containsAll(['month', 'year', 'one-time']));
      expect(periods.length, 3);
    });

    test('Section 16: Monthly plan starts at ₹49', () {
      final monthly = EntitlementService.availablePlans.firstWhere((p) => p.billingPeriod == 'month');
      expect(monthly.priceInr, '₹49');
    });
  });
}
