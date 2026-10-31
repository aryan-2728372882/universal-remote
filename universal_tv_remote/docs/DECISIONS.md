# Architecture and Technical Decisions (docs/DECISIONS.md)

This log records major technical and architecture decisions, trade-offs, and justifications according to Rule 6 of the Agent Build Plan (v2).

---

## Decision 1: Architecture & State Management
- **Decision**: Adopt Flutter with Riverpod (`flutter_riverpod: ^2.6.1`).
- **Rationale**: Riverpod provides compile-time safe dependency injection, seamless provider composition, predictable reactivity, and easy unit/widget test mocking without `BuildContext` pollution.
- **Alternatives Considered**: BLoC (heavier boilerplate, larger bundle delta), Provider (lacks clean test overrides outside widget tree).

---

## Decision 2: Local Persistence & Secure Storage
- **Decision**: Use `shared_preferences` with a typed JSON document store for non-sensitive data (devices, rooms, scenes, app settings) and `flutter_secure_storage` for sensitive secrets (LG client keys, Android TV TLS certificates, auth tokens).
- **Rationale**:
  - `sqflite` and `drift` bundle native SQLite C binaries or require build-time code generation, increasing APK size by 2–4 MB.
  - Device and room metadata is small (typically <100 KB total). Using a structured local store saves native footprint and avoids complex migration crashes while keeping the APK strictly under the 15 MB limit (Section 12).
  - All pairing credentials remain exclusively inside the OS Keystore / Keychain.

---

## Decision 3: Network Transport Layer (Pure `dart:io`)
- **Decision**: Implement all network protocols directly on Dart standard library `dart:io` primitives (`RawDatagramSocket`, `WebSocket`, `HttpClient`, `SecureSocket`).
- **Rationale**:
  - Zero third-party network library overhead.
  - Complete control over timeouts, socket reuse, keep-alive headers, self-signed certificate pinning, and raw packet inspection.
  - Sub-100ms phone-side dispatch latency achieved by reusing persistent TCP/WebSocket connections rather than reconnecting per keypress.

---

## Decision 4: Multicast Discovery & Android MulticastLock
- **Decision**: Provide standard `RawDatagramSocket` mDNS/SSDP discovery with a native MethodChannel fallback (`WifiManager.MulticastLock`).
- **Rationale**:
  - On many Android devices, the Wi-Fi chip filters multicast UDP packets by default to preserve battery unless `acquireMulticastLock()` is invoked.
  - A tiny native channel (under 30 lines of Kotlin) acquires and releases this lock only during active scan passes, keeping APK impact < 5 KB.

---

## Decision 5: Trademark & Policy Compliance
- **Decision**: All brand names (LG, Samsung, Sony, Roku, Android TV, Google TV, etc.) appear strictly as unstyled plain text for compatibility. No trademarked logos or brand assets are included in the repository or binary.
- **Rationale**: Fully compliant with Google Play and Apple App Store Impersonation and Intellectual Property policies.

---

## Decision 6: Monetization Flavor & Locking
- **Decision**: Maintain dual flavors (`lite` and `full`). Master switch `monetization_enabled` defaults to `false` at compile-time and runtime.
- **Rationale**: All core remote features, unlimited buttons, sleep timer, Connection Doctor, and elder mode remain 100% free and offline. Monetization artifacts are placed in `release-locked/` and labeled `DO NOT PUBLISH`.
