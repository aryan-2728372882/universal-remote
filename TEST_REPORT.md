# Universal Remote Hub Test Report

**Date of Execution**: October 30, 2026  
**Environment**: Node.js `v24.14.0` on Windows 11  
**Test Runner**: Node.js Built-in Test Runner (`node:test`)  
**Status**: **ALL TESTS PASSING (7/7)**

---

## 1. Automated Test Results

| Test Suite | File | Status | Duration | Coverage |
|---|---|---|---|---|
| **PIN Auth & Session Token** | `server/tests/auth.test.js` | **PASS** | 236ms | Minimum 4-digit PIN check, bcrypt hashing, JWT cookie generation, invalid token rejection, wrong PIN rejection. |
| **Driver Specification Contract** | `server/tests/driver_contract.test.js` | **PASS** | 3ms | Capability schema validation (`kind`, `id`, `label`), state subscription listener, capability execution (`volume_up`, `temp_down`, `mute`, `app_launch`), state broadcast, clean disconnection. |
| **Host Fingerprinting Safety** | `server/tests/fingerprint.test.js` | **PASS** | 2531ms | Safely times out on dead/offline hosts (RFC 5737 non-routable IP) without hanging or crashing hub. |
| **Cast / DIAL Eureka Parsing** | `server/tests/fingerprint.test.js` | **PASS** | 1ms | Parses Eureka Cast payloads and verifies classification as Android TV. |
| **LG webOS D-Pad & Key Mapping** | `server/tests/webos_keys.test.js` | **PASS** | 1ms | Validates binary pointer socket button formatting (`type:button\nname:${name}\n\n`) for `UP`, `DOWN`, `LEFT`, `RIGHT`, `ENTER`, `BACK`, `HOME`, `MENU`. |
| **Wake-on-LAN Magic Packet** | `server/tests/wol.test.js` | **PASS** | 2ms | Checks 102-byte buffer: 6 `0xFF` bytes followed by 16 repetitions of the target device MAC address. |
| **Subnet Broadcast Derivation** | `server/tests/wol.test.js` | **PASS** | 0.3ms | Correctly computes subnet broadcast address (`192.168.1.255`, `10.0.255.255`, `172.16.31.255`) across different subnet masks to bypass router unicast-only packet dropping. |

---

## 2. Server & Client Verification

1. **Server Initialization (`server/index.js`)**:
   - Helmet security headers active (`X-Frame-Options`, `Content-Security-Policy`, `Strict-Transport-Security`, `X-Content-Type-Options`).
   - Rate limiting active: 30 attempts/15min on auth endpoints, 300 req/min on general APIs.
   - Machine secret derived and stored in `server/data/master.key` (AES-256-GCM cipher).
   - Dynamic driver registration verified for `lg_webos`, `android_tv`, `lg_thinq`, `samsung_tizen`, `roku`, `broadlink_ir`, and `tuya_local`.
   - Production Vite frontend statically served from `client/dist`.

2. **Frontend Build (`client/dist`)**:
   - Transpiled and bundled via Vite 8 (`npm run build`).
   - Responsive touch UI layout tested for mobile phones, tablets, and desktop browsers.
   - PWA manifest (`manifest.json`) and app icons loaded for full-screen standalone installation.
   - Dynamic capability renderer (`CapabilityRemote.jsx`) successfully handles all driver capability kinds (`button`, `toggle`, `slider`, `select`, `dpad`, `text`).

---

## 3. What Requires Physical Hardware on Home Wi-Fi

The following real-world behaviors require physical target devices powered on the same local Wi-Fi router:

1. **LG webOS Smart TV**:
   - Physical TV displaying the one-time network permission prompt (*"Universal Remote Hub requests access"*).
   - Physical TV remote clicking **Accept** to exchange and store the persistent `client-key`.
   - Wake-on-LAN packet waking up the TV from standby (requires TV Setting: *General -> Network -> Mobile TV On*).
2. **Nokia Smart TV (Android TV / Google TV)**:
   - Physical TV generating the 6-character TLS pairing code on screen over port 6467.
   - Submitting the code to finalize TLS certificate handshake and establish persistent connection on port 6466.
3. **LG Dual Inverter AC**:
   - Obtaining a valid Personal Access Token (PAT) from the official [LG ThinQ Connect Developer Portal](https://smartsolution.developer.lge.com).
   - LG Cloud synchronizing telemetry with the hub over HTTPS.

---

## 4. Step-by-Step Hardware Verification Guide for the User

Follow these steps once you are at home with your hardware:

### Step 1: Start the Local Hub
On your laptop or home server connected to your home Wi-Fi:
```bash
cd universal-remote
npm start
```
Note the Wi-Fi URL printed in the terminal (e.g. `http://192.168.1.34:3000`).

### Step 2: Open on Your Phone
1. Connect your phone to the same Wi-Fi.
2. Open `http://<hub-ip>:3000` in Chrome or Safari.
3. Set your 4-digit PIN on the first-run security prompt.

### Step 3: Pair LG webOS TV
1. Turn on your LG TV with its wall switch.
2. In Universal Remote, click **Scan Wi-Fi** or go to **Settings -> Add by IP** and type your LG TV's IP.
3. Tap **Pair Device** when the status indicates `PAIRING_REQUIRED`.
4. Look at your TV screen and click **Accept / Yes** with your physical remote.
5. Control your TV using the on-screen D-pad and volume controls.

### Step 4: Pair Nokia Smart TV
1. Turn on your Nokia Android TV.
2. Tap **Pair Device** on the Nokia TV card.
3. Read the 6-character code shown on the TV screen.
4. Type it into the Universal Remote prompt and press **Confirm Pairing Code**.

### Step 5: Configure LG AC
1. Tap the **⚙️ Settings** icon -> **LG ThinQ AC** tab.
2. Enter your Personal Access Token from LG Developer Portal.
3. Tap **Save Encrypted Token**. The AC card will now display real temperature and fan speed controls.
