# APK & Dependency Size Report (docs/SIZE_REPORT.md)

**Target**: arm64-v8a Release APK <= 15 MB (Stretch goal: < 10 MB).  
**Status**: **PASSED (7.93 MB - Exceeds stretch goal < 10 MB)**

---

## 1. Verified Release Build Sizes

Output directory: `build/app/outputs/flutter-apk/`

| Artifact | Architecture | Target Size | Actual Size | Status |
|---|---|---|---|---|
| `app-arm64-v8a-release.apk` | ARM 64-bit | <= 15.0 MB | **7.93 MB** | **PASS (Stretch Goal < 10MB Met)** |
| `app-armeabi-v7a-release.apk` | ARM 32-bit | <= 15.0 MB | **7.39 MB** | **PASS** |
| `app-x86_64-release.apk` | x86 64-bit | <= 15.0 MB | **8.09 MB** | **PASS** |

---

## 2. Dependency Delta Budget

| Package | Version | Estimated Binary Delta | Justification |
|---|---|---|---|
| `flutter_riverpod` | `^2.6.1` | ~120 KB | Core reactive state management |
| `shared_preferences` | `^2.3.5` | ~45 KB | Zero-native-C SQLite replacement |
| `flutter_secure_storage`| `^9.2.4` | ~80 KB | Keystore / Keychain hardware encryption |
| `crypto` | `^3.0.6` | ~60 KB | SHA-256 HMAC for PIN / fingerprinting |
| `uuid` | `^4.5.1` | ~25 KB | UUID v4 generation |
| `cupertino_icons` | `^1.0.8` | ~180 KB | Vector glyphs (tree-shaken in release) |
| **Total Dependencies** | - | **~510 KB** | Strictly under the 1 MB budget |

---

## 3. Release Optimization Strategy
1. **R8 / ProGuard Full Mode**: Strips unreferenced classes, dead code, and inlines getters.
2. **Resource Shrinking**: `shrinkResources true` removes unreferenced XML/drawables.
3. **ABI Split**: `--split-per-abi` produces dedicated packages per architecture.
4. **Dart Obfuscation & Tree-Shaking**: `--obfuscate --split-debug-info=build/symbols --tree-shake-icons` (99.5% reduction in icon assets).
5. **Native Lib Legacy Packaging**: Enabled standard deflate compression for native shared libraries (`packaging { jniLibs { useLegacyPackaging = true } }`), cutting the binary from 16.9 MB down to 7.93 MB.
6. **No Raster Bloat**: All buttons, D-pad wheels, and diagnostic controls are custom code-drawn vector components (`CustomPainter` and Flutter Canvas).
