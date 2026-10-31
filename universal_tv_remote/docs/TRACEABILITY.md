# Requirements Traceability Matrix (docs/TRACEABILITY.md)

This table maps every requirement from the Universal TV Remote: Agent Build Plan (v2) to its corresponding specification document, implementation file, and test case.

| Requirement | Section | Specification Document | Implementation File | Automated Test Case | Status |
|---|---|---|---|---|---|
| **Gate Order & Rules** | 0 | `docs/DECISIONS.md` | `tool/release_gate.dart` | `test/core/rules_test.dart` | PASS |
| **Android First Platform** | 2 | `docs/features/discovery.md` | `android/` | Build & unit tests | PASS |
| **Tech Stack (Riverpod + pure dart:io)** | 3 | `docs/DECISIONS.md` | `pubspec.yaml`, `lib/core/` | `test/core/theme_test.dart` | PASS |
| **RemoteAdapter Contract** | 4 | `docs/protocols/` | `lib/adapters/remote_adapter.dart` | `test/adapters/adapter_contract_test.dart` | PASS |
| **LG webOS Adapter** | 5 | `docs/protocols/lg_webos.md` | `lib/adapters/lg_webos/lg_webos_adapter.dart` | `test/adapters/lg_webos_test.dart` | PASS |
| **Android TV Adapter** | 5 | `docs/protocols/android_tv.md` | `lib/adapters/android_tv/android_tv_adapter.dart` | `test/adapters/android_tv_test.dart` | PASS |
| **Roku ECP Adapter** | 5 | `docs/protocols/roku.md` | `lib/adapters/roku/roku_adapter.dart` | `test/adapters/roku_test.dart` | PASS |
| **Samsung Tizen Adapter** | 5 | `docs/protocols/samsung.md` | `lib/adapters/samsung/samsung_adapter.dart` | `test/adapters/samsung_test.dart` | PASS |
| **Protocol Adapter Engine** | 5 | `docs/protocols/` | `lib/adapters/remote_adapter.dart` | `test/adapters/adapter_contract_test.dart` | PASS |
| **Discovery Engine (mDNS/SSDP/Subnet)** | 6 | `docs/features/discovery.md` | `lib/discovery/discovery_service.dart` | `test/discovery/discovery_test.dart` | PASS |
| **Wake-on-LAN Subnet Broadcast** | 6 | `docs/protocols/` | `lib/discovery/wol/wake_on_lan.dart` | `test/discovery/wol_test.dart` | PASS |
| **Connection Doctor** | 6, 17 | `docs/features/connection_doctor.md` | `lib/diagnostics/connection_doctor/` | `test/diagnostics/connection_doctor_test.dart` | PASS |
| **Secure Token Storage** | 7 | `docs/DECISIONS.md` | `lib/data/secure_token_store.dart` | `test/data/secure_store_test.dart` | PASS |
| **Data Repository (Devices/Rooms/Scenes)** | 7 | `docs/DECISIONS.md` | `lib/data/device_repository.dart` | `test/data/device_repository_test.dart` | PASS |
| **Remote Screen & Controls** | 9 | `docs/features/remote.md` | `lib/features/remote/` | `test/features/remote_screen_test.dart` | PASS |
| **Pairing Wizard & Lost-Remote Rescue** | 9, 17 | `docs/features/pairing.md` | `lib/features/pairing/` | `test/features/pairing_test.dart` | PASS |
| **Sleep Timer** | 9, 17 | `docs/features/sleep_timer.md` | `lib/features/remote/sleep_timer.dart` | `test/features/sleep_timer_test.dart` | PASS |
| **Elder Mode** | 9, 17 | `docs/features/elder_mode.md` | `lib/features/remote/elder_remote.dart` | `test/features/elder_mode_test.dart` | PASS |
| **Diagnostic Report Redaction** | 11 | `docs/features/diagnostic_report.md` | `lib/diagnostics/redacted_report.dart` | `test/diagnostics/redacted_report_test.dart` | PASS |
| **Trademark & Non-Affiliation Text** | 11 | `docs/DECISIONS.md` | `lib/features/settings/` | `test/features/trademark_test.dart` | PASS |
| **APK Size & Dependency Budget** | 12 | `docs/SIZE_REPORT.md` | `tool/size_check.dart` | `test/core/size_budget_test.dart` | PASS |
| **Monetization & Locking (Phase 5 Stub)** | 16 | `docs/DECISIONS.md` | `lib/services/entitlement_service.dart` | `test/services/monetization_test.dart` | PASS |
