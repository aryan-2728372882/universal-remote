# Third-Party Licenses & Protocol Reference Audit (docs/LICENSES.md)

This log documents third-party licenses, protocols, and open-source references used in accordance with Rule 7 of the Agent Build Plan (v2).

---

## 1. Direct Package Dependencies

| Package | Version | License | Justification |
|---|---|---|---|
| `flutter_riverpod` | `^2.6.1` | MIT | State management and provider dependency injection |
| `shared_preferences` | `^2.3.5` | BSD-3-Clause | Lightweight, zero-native-C persistence |
| `flutter_secure_storage` | `^9.2.4` | BSD-3-Clause | Keystore / Keychain secure token storage |
| `crypto` | `^3.0.6` | BSD-3-Clause | SHA-256 fingerprinting & diagnostic hash redaction |
| `uuid` | `^4.5.1` | MIT | UUID v4 generation for devices, rooms, scenes |
| `cupertino_icons` | `^1.0.8` | MIT | Default platform icons |

All direct and transitive packages utilize standard permissive open-source licenses (MIT, BSD-3-Clause, Apache-2.0). No GPL, AGPL, or proprietary copyleft dependencies are incorporated into this codebase.

---

## 2. Hardware Protocol References

### LG webOS TV (SSAP & Pointer Socket)
- **Protocol**: WebSocket SSAP (port 3000 plaintext, port 3001 TLS self-signed) + binary pointer input socket (`ssap://com.webos.service.networkinput/getPointerInputSocket`).
- **Reference**: Official LG webOS developer documentation & public open-source implementations (`node-webos`, `aiopylgtv` under MIT license).
- **Status**: Implemented natively in pure Dart using `WebSocket`.

### Android TV / Google TV (Remote Protocol v2)
- **Protocol**: TLS on port 6467 (Pairing) and port 6466 (Remote Control).
- **Reference**: Open protocol specifications from `androidtv-remote` / `homebridge-androidtv` (MIT License).
- **Status**: Implemented natively in pure Dart using `SecureSocket`.

### Roku (External Control Protocol - ECP)
- **Protocol**: HTTP REST on port 8060 (`/keypress/<key>`, `/launch/<appId>`, `/query/apps`, `/query/device-info`).
- **Reference**: Official Roku Developer Documentation: External Control Protocol (ECP).
- **Status**: Implemented natively in pure Dart using `HttpClient`.

### Samsung Tizen TV
- **Protocol**: WebSocket TLS on port 8002 (`wss://<ip>:8002/api/v2/channels/samsung.remote.control`).
- **Reference**: Open community documentation & `samsung-tv-control` (MIT License).
- **Status**: Implemented natively in pure Dart using `WebSocket`.
