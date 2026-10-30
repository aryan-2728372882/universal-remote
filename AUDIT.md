# Universal Remote Codebase Audit (Real vs Fake)

Date: 2026-10-30
Auditor: Senior Full-Stack & Embedded-Protocols Engineer

---

## 1. Executive Summary

The initial version of `universal-remote` was built around an inverted architecture: attempting to control private, non-routable local network home devices (`192.168.x.x`) from a cloud web service hosted on Render.com, held awake by a 11-minute self-ping loop. 

Crucial device control services (`thinqService.js`, `androidTvService.js`, and navigation in `webosService.js`) either fabricated authentication tokens and mutated in-memory Javascript objects, or used superficial workarounds (such as asking the user to open a web page on their TV or mapping D-Pad clicks to media rewind/fast-forward). Network discovery was based on rudimentary port scanning rather than standard multicast protocols (mDNS/Bonjour and SSDP/UPnP), with no security, no authentication, and hardcoded per-device UI components.

Below is the file-by-file audit of what is real, what is fake, and what must be replaced.

---

## 2. File-by-File Breakdown

### Root & Deployment
| File | Status | Audit Findings |
| :--- | :--- | :--- |
| `render.yaml` | **DELETE** | Cloud-first deployment configuration. Render is isolated from the user's LAN and cannot reach local IoT hardware. Must be removed in favor of a local hub deployment (Node.js/pm2/systemd/Termux). |
| `package.json` | **REVISE** | Missing essential packages for real device communications: `bonjour-service`, `node-ssdp`, `androidtv-remote`, `helmet`, `express-rate-limit`, `cookie-parser`, `jsonwebtoken`, `bcryptjs`, and testing frameworks. |
| `README.md` | **REWRITE** | Instructs user to deploy to Render.com and connect through cloud URLs. Must be completely rewritten for local hub deployment (Windows, Linux, Raspberry Pi, Termux), local IP discovery, device pairing, and troubleshooting. |

---

### Server (`/server`)

| File | Status | Audit Findings |
| :--- | :--- | :--- |
| `server/index.js` | **REFACTOR** | Uses open `cors()`, unauthenticated WebSocket server (`/ws`), lacks security headers (`helmet`), no rate limiting, and initializes the fake `pingService`. Must be replaced with clean Express + authenticated WS (`/core/Auth.js`, session/PIN validation, rate limiting). |
| `server/routes/api.js` | **REWRITE** | Endpoints are hardcoded to `lg-ac`, `lg-tv`, `nokia-tv`. No authentication. Accepts any command without validating driver capability. Must be replaced with generic `/api/devices`, `/api/devices/:id/execute`, `/api/discovery`, `/api/auth`, `/api/scenes`. |
| `server/services/pingService.js` | **DELETE** | Fake keep-alive service designed solely to prevent Render from idling. Irrelevant for a local hub running 24/7 on a home network. |
| `server/services/thinqService.js` | **COMPLETELY FAKE** | **Fake:** `setCredentials()` generates a fake token (`lg_session_${Date.now()}`) without calling any LG servers. `controlAc()` simply updates local variables (`this.acState.targetTemp`, `this.acState.power`). **Fix:** Replace with LG ThinQ Connect REST integration using Personal Access Token (PAT) + region/country, reading real telemetry and dispatching real state changes. Save encrypted tokens on disk. Show "Not Connected" if no token or offline. |
| `server/services/androidTvService.js` | **PARTIALLY FAKE** | **Real:** DIAL app launching on port 8008. **Fake:** Volume, mute, and power only mutate in-memory state. Key navigation depends on a browser WebSocket client (`tv-receiver.html`). **Fix:** Implement real Android TV Remote Protocol v2 (TLS on ports 6466/6467) using `androidtv-remote`. Implement certificate generation, PIN pairing handshake with on-screen code, and direct key injection (D-pad, OK, Home, Back, Volume, Power, Media, Text). Keep ADB as an optional fallback. |
| `server/services/webosService.js` | **BUGGY & INCOMPLETE** | **Real:** Base WebSocket client on port 3000 and registration payload. **Broken/Fake:** 1. D-Pad UP/DOWN/OK were mapped to `ssap://api/media.controls/rewind`, `fastForward`, and `play`! 2. Lacks `ssap://com.webos.service.networkinput/getPointerInputSocket` required for actual menu navigation and directional keys. 3. Hardcoded default IPs. 4. Wake-on-LAN sends only to `255.255.255.255` instead of the local subnet broadcast. 5. No state subscriptions. **Fix:** Implement pointer input socket, support `wss://:3001` with fallback to `ws://:3000`, persist client-keys per TV, real WoL subnet broadcast, and subscribe to volume/input/power events. |
| `server/services/discoveryService.js` | **FRAGILE PORT GUESSING** | Sweeps port 3000 and assumes "LG webOS", sweeps 8008/8009 and assumes "Nokia". Subnet detection was hardcoded to `192.168.1.`. **Fix:** Replace with standard mDNS/Bonjour (`_androidtvremote2._tcp`, `_googlecast._tcp`) and SSDP M-SEARCH (`urn:lge-com...`), followed by deep fingerprinting (querying device endpoints). Support any private subnet (10.x, 172.16-31.x, 192.168.x). Persist discovered devices and periodic health checks. |

---

### Client (`/client`)

| File | Status | Audit Findings |
| :--- | :--- | :--- |
| `client/public/tv-receiver.html` | **DELETE** | Clunky workaround asking user to visit a website on their TV browser to receive remote clicks. Unnecessary when using native TV protocols (webOS SSAP & Android TV Remote v2). |
| `client/src/components/KeepAliveBadge.jsx` | **DELETE** | Cloud ping status badge. Irrelevant for a local hub. |
| `client/src/components/LgAcRemote.jsx` | **REFACTOR TO DYNAMIC** | Hardcoded specific UI layout. Must be refactored into a capability-driven component renderer. |
| `client/src/components/LgTvRemote.jsx` | **REFACTOR TO DYNAMIC** | Hardcoded specific UI layout. Must render from driver capabilities. |
| `client/src/components/NokiaTvRemote.jsx` | **REFACTOR TO DYNAMIC** | Hardcoded specific UI layout. Must render from driver capabilities. |
| `client/src/components/SettingsModal.jsx` | **REVISE** | Contains Render URL settings. Must be replaced with PIN security, ThinQ PAT configuration, pairing wizards, and device management. |
| `client/src/App.jsx` | **REVISE** | Hardcoded to switch between the 3 static remote components. Needs PIN lock screen, dynamic capability renderer, device pairing wizard, scenes, and offline hub detection banner. |

---

## 3. Action Plan & Target Implementation Order

1. **Phase 1: Core Architecture, Persistence & Security**
   - Implement `Store.js`: Persistent JSON storage with AES-256 encryption for secrets (ThinQ tokens, pairing keys) using an auto-generated machine secret.
   - Implement `Auth.js`: First-run PIN configuration (bcrypt), JWT/cookie session tokens for REST & WebSocket, helmet, rate-limiting.
   - Implement `DeviceDriver.js`: Strict abstract base class for all hardware drivers.
   - Implement `DeviceRegistry.js` & `EventBus.js`: Registry managing driver lifecycles, health polling, and event broadcasting.
   - Implement `drivers/mock.js`: Explicit mock driver for testing without physical hardware, guarded behind `ENABLE_MOCK=1`.

2. **Phase 2: Local Network Discovery**
   - Implement `discovery/ssdp.js`: UPnP/SSDP M-SEARCH for LG webOS, Roku, Samsung, DLNA.
   - Implement `discovery/mdns.js`: Bonjour/mDNS listener for Android TV (`_androidtvremote2._tcp`), Google Cast (`_googlecast._tcp`).
   - Implement `discovery/fingerprint.js`: Active validation step confirming device model before adding to registry.
   - Implement `discovery/subnetScan.js`: Broad private subnet detection (10.x, 172.x, 192.168.x) as fallback.

3. **Phase 3: LG webOS Driver (`drivers/lgWebos.js`)**
   - Dual port support: `wss://<ip>:3001` (modern webOS with TLS/self-signed cert support) and `ws://<ip>:3000`.
   - Implement network input socket (`ssap://com.webos.service.networkinput/getPointerInputSocket`) for genuine DPAD (UP/DOWN/LEFT/RIGHT), ENTER, BACK, HOME, MENU button presses.
   - State subscriptions (`ssap://audio/getVolume`, `ssap://com.webos.applicationManager/getForegroundAppInfo`).
   - Accurate Wake-on-LAN sending magic packet to directed subnet broadcast.

4. **Phase 4: Android TV Driver (`drivers/androidTv.js`)**
   - Integrate Android TV Remote Protocol v2 (TLS, ports 6466/6467) using `androidtv-remote`.
   - Implement pairing flow: trigger pairing prompt on TV, accept 6-character PIN in UI, store certificate.
   - Direct key events: D-Pad, OK, Back, Home, Power, Volume, Play/Pause, App launch deep links, text input.
   - Retain ADB over Wi-Fi as optional fallback.

5. **Phase 5: LG ThinQ Driver (`drivers/lgThinq.js`)**
   - Implement LG ThinQ Connect API client using Personal Access Token (PAT) + region code.
   - True bidirectional state: Read real target temp, current room temp, mode, fan speed, swing, and energy saver.
   - True command dispatch for AC state changes.
   - Graceful offline handling: Clearly label that LG ACs require cloud/internet due to LG's architecture.

6. **Phase 6: Capability-Driven Frontend & Pairing Wizard**
   - Dynamic Remote UI: Renders controls based on driver capability descriptors (`button`, `toggle`, `slider`, `select`, `dpad`, `text`).
   - Interactive Pairing Wizard for Android TV PIN and webOS on-screen prompt.
   - PIN Authentication barrier: First-run setup & login modal.
   - Hub Offline Banner: Shows when the user's phone disconnects from the local Wi-Fi hub.

7. **Phase 7: Automation & Scenes**
   - Scenes engine (e.g. "Movie Mode", "Turn Off Everything").
   - Simple cron/timer schedules running locally on the hub.

8. **Phase 8: Tests & Documentation**
   - Unit and integration tests (WoL packet, webOS key mappings, discovery fingerprints, auth, mock driver contract).
   - Local hub deployment guide (`README.md`), driver authoring guide (`ARCHITECTURE.md`), and final `TEST_REPORT.md`.
