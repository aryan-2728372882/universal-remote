/// User entitlement tiers
enum EntitlementTier {
  free,
  proMonthly,
  proYearly,
  proLifetime,
}

/// Entitlement profile reflecting plan permissions
class EntitlementProfile {
  final EntitlementTier tier;
  final bool isPro;
  final int maxSavedDevices;
  final bool hasAds;
  final bool hasScenes;
  final bool hasCloudSync;

  const EntitlementProfile({
    required this.tier,
    required this.isPro,
    required this.maxSavedDevices,
    required this.hasAds,
    required this.hasScenes,
    required this.hasCloudSync,
  });

  /// Lite / Free-with-switch-off profile: 100% unlocked, zero ads
  factory EntitlementProfile.unlocked() => const EntitlementProfile(
        tier: EntitlementTier.proLifetime,
        isPro: true,
        maxSavedDevices: 999,
        hasAds: false,
        hasScenes: true,
        hasCloudSync: false,
      );

  factory EntitlementProfile.free() => const EntitlementProfile(
        tier: EntitlementTier.free,
        isPro: false,
        maxSavedDevices: 2,
        hasAds: true,
        hasScenes: false,
        hasCloudSync: false,
      );
}

/// Plan SKU representation compliant with Section 16
class PlanSku {
  final String id;
  final String name;
  final String priceInr;
  final String billingPeriod;

  const PlanSku({
    required this.id,
    required this.name,
    required this.priceInr,
    required this.billingPeriod,
  });
}

/// Entitlement Service with Mandatory Compile-Time & Runtime Master Switch
class EntitlementService {
  /// Section 16 Rule 1: Master switch defaults to false.
  /// If false, every user gets all features, no ads, and no paywall.
  static const bool monetizationEnabled = false;

  /// Section 16 Pricing: Only Monthly (starting ₹49), Yearly, and Lifetime.
  /// Strictly NO weekly subscriptions ever.
  static const List<PlanSku> availablePlans = [
    PlanSku(id: 'pro_monthly_49', name: 'Monthly Pro', priceInr: '₹49', billingPeriod: 'month'),
    PlanSku(id: 'pro_yearly_399', name: 'Yearly Pro', priceInr: '₹399', billingPeriod: 'year'),
    PlanSku(id: 'pro_lifetime_899', name: 'Lifetime Pro', priceInr: '₹899', billingPeriod: 'one-time'),
  ];

  EntitlementProfile get currentEntitlement {
    if (!monetizationEnabled) {
      return EntitlementProfile.unlocked();
    }
    return EntitlementProfile.free();
  }

  bool canAddDevice(int currentDeviceCount) {
    if (!monetizationEnabled) return true;
    return currentDeviceCount < currentEntitlement.maxSavedDevices;
  }
}
