# Universal Remote Hub Architecture

This document describes the design principles, core components, and instructions for extending the Universal Remote Hub with new hardware drivers.

---

## 1. Architectural Overview

```
+------------------------------------------------------------------------+
|                      Client: React 19 + Vite PWA                        |
|   - Dynamic Capability Remote (CapabilityRemote.jsx)                   |
|   - Discovery & Device Switcher (DeviceSwitcher.jsx)                    |
|   - Pairing Wizard & PIN Modal (PairingWizardModal, PinAuthModal)      |
+-----------------------------------+------------------------------------+
                                    |
                  REST (JSON) & WebSocket (Realtime Events)
                                    |
+-----------------------------------+------------------------------------+
|                         Server: Node.js / Express                      |
|                                                                        |
|  +--------------------+  +----------------------+  +----------------+  |
|  |     Auth.js        |  |   SceneManager.js    |  |    Store.js    |  |
|  | (PIN, JWT, Helmet) |  | (Multi-device macros)|  | (AES-256-GCM)  |  |
|  +--------------------+  +----------------------+  +----------------+  |
|                                                                        |
|  +------------------------------------------------------------------+  |
|  |                      DeviceRegistry.js                           |  |
|  |  - Driver lifecycle & instance manager                          |  |
|  |  - Active WebSocket event bus relay                             |  |
|  |  - Background health polling (15s)                               |  |
|  +-------------------+----------------------------------------------+  |
|                      |                                                 |
|          +-----------+------------+-----------+                        |
|          |                        |           |                        |
|  +-------v--------+       +-------v----+  +---v---------------+        |
|  |   lgWebos.js   |       | androidTv  |  |   lgThinq.js      | ...    |
|  | (SSAP/Pointer) |       | (Remote v2)|  | (ThinQ Connect)   |        |
|  +----------------+       +------------+  +-------------------+        |
+------------------------------------------------------------------------+
                                    |
                       Home Wi-Fi LAN / Multicast
                                    |
+-----------------------------------+------------------------------------+
|  - LG webOS Smart TV (WebSocket SSAP 3001/3000, WoL)                   |
|  - Nokia Smart TV (Android TV Remote v2 TLS 6466/6467)                 |
|  - LG ThinQ AC (Cloud REST PAT with real telemetry)                    |
|  - Discovery: mDNS (_androidtvremote2, _googlecast) & SSDP M-SEARCH    |
+------------------------------------------------------------------------+
```

---

## 2. Core Concepts

### Dynamic Capability Driven UI
Instead of creating brand-specific remote screens (`SamsungRemote.jsx`, `SonyRemote.jsx`), Universal Remote uses a **capability-driven model**:
1. Every driver declares the exact actions it supports via `capabilities()`:
   - `button`: Push-button command (e.g., `volume_up`, `back`, `home`).
   - `toggle`: Boolean toggle (e.g., `power`, `mute`, `v_swing`).
   - `slider`: Continuous numeric range (e.g., `volume` 0-100, `target_temp` 16-30).
   - `select`: Multiple-choice selection (e.g., `mode` ['COOL', 'FAN'], `app_launch`).
   - `dpad`: 5-way directional pad (`UP`, `DOWN`, `LEFT`, `RIGHT`, `ENTER`).
   - `text`: Text input for searching or remote typing.
2. The UI (`CapabilityRemote.jsx`) inspects the capability list and renders the appropriate touch layout dynamically with haptic feedback.
3. Adding a new brand requires **zero modifications to frontend React code**.

### AES-256-GCM Secure Storage
- Machine secrets are never stored in plaintext.
- On first launch, a random 256-bit encryption key (`master.key`) is generated in `server/data/master.key` (ignored by git).
- All sensitive tokens (LG webOS client keys, Android TV TLS certificates, LG ThinQ PAT tokens) are encrypted with AES-256-GCM authenticated cipher before writing to disk.

---

## 3. Guide: Adding a New Driver in <100 Lines

Every driver extends the abstract `DeviceDriver` base class located at `server/core/DeviceDriver.js`.

### Minimal Implementation Example: Roku TV Driver (`roku.js`)

Here is an example showing how to implement a complete, fully functional driver for Roku TVs (using Roku's External Control Protocol / ECP HTTP API) in fewer than 70 lines:

```javascript
// server/drivers/roku.js
const http = require('http');
const DeviceDriver = require('../core/DeviceDriver');

class RokuDriver extends DeviceDriver {
  static type = 'roku';

  constructor(config = {}) {
    super(config);
    this.ip = config.ip;
    this.port = 8060;
    this.state = {
      id: this.id,
      name: this.name,
      type: 'roku',
      status: 'ONLINE',
      power: true
    };
  }

  capabilities() {
    return [
      { id: 'power', kind: 'toggle', label: 'Power', group: 'Power' },
      { id: 'dpad', kind: 'dpad', label: 'Navigation', group: 'Navigation' },
      { id: 'back', kind: 'button', label: 'Back', group: 'Navigation' },
      { id: 'home', kind: 'button', label: 'Home', group: 'Navigation' },
      { id: 'volume_up', kind: 'button', label: 'Vol +', group: 'Audio' },
      { id: 'volume_down', kind: 'button', label: 'Vol -', group: 'Audio' },
      { id: 'app_launch', kind: 'select', label: 'Launch App', group: 'Apps', options: ['Netflix', 'YouTube', 'Hulu'] }
    ];
  }

  async sendKey(key) {
    return new Promise((resolve) => {
      const req = http.request({
        host: this.ip,
        port: this.port,
        path: `/keypress/${key}`,
        method: 'POST'
      }, (res) => resolve(res.statusCode === 200));
      req.on('error', () => resolve(false));
      req.end();
    });
  }

  async execute(capabilityId, value = null) {
    const keyMap = {
      power: 'Power',
      dpad_up: 'Up',
      dpad_down: 'Down',
      dpad_left: 'Left',
      dpad_right: 'Right',
      dpad_enter: 'Select',
      back: 'Back',
      home: 'Home',
      volume_up: 'VolumeUp',
      volume_down: 'VolumeDown'
    };

    if (keyMap[capabilityId]) {
      const ok = await this.sendKey(keyMap[capabilityId]);
      return { ok, state: this.getState() };
    }

    if (capabilityId === 'app_launch') {
      const appIds = { Netflix: '12', YouTube: '837', Hulu: '2285' };
      const id = appIds[value] || '12';
      return new Promise((resolve) => {
        const req = http.request({ host: this.ip, port: this.port, path: `/launch/${id}`, method: 'POST' }, () => {
          resolve({ ok: true, state: this.getState() });
        });
        req.on('error', () => resolve({ ok: false }));
        req.end();
      });
    }

    return { ok: false, error: `Unsupported capability: ${capabilityId}` };
  }
}

module.exports = RokuDriver;
```

### Registering the Driver in `server/index.js`

To register your driver, import it and register its type:

```javascript
const RokuDriver = require('./drivers/roku');
deviceRegistry.registerDriver(RokuDriver.type, RokuDriver);
```

The hub automatically makes this driver available in the UI dropdown, supports manual addition via **Add by IP**, executes commands, and feeds state updates into the real-time WebSocket bus.
