# 📱 Universal Remote Hub (Local-First PWA)

A genuine **local-first smart home hub** and Progressive Web App (PWA) designed to run inside your home network (on a laptop, Raspberry Pi, home server, or old Android phone via Termux).

Any phone, tablet, or laptop on the same Wi-Fi opens `http://<hub-ip>:3000` to control your devices instantly with **sub-millisecond local latency**.

- **Zero Cloud Dependence**: Works even if your internet connection is down for all local-protocol devices (LG webOS TV, Nokia Android TV, Samsung Tizen, Roku, etc.).
- **Hardware-Enforced Security**: PIN authentication, encrypted persistent storage (AES-256-GCM), rate-limiting, and Helmet security headers.
- **Genuine Protocols**:
  - **LG webOS TV**: WebSocket SSAP, direct pointer socket binary buttons (`UP`, `DOWN`, `LEFT`, `RIGHT`, `ENTER`, `BACK`, `HOME`), state subscriptions, directed Subnet Broadcast Wake-on-LAN.
  - **Nokia Smart TV (Android TV / Google TV)**: Android TV Remote Protocol v2 over TLS (ports 6466/6467) with on-screen PIN pairing, persisted TLS certificates, and deep-link app launchers.
  - **LG Dual Inverter AC**: Official LG ThinQ Connect REST API with encrypted Personal Access Token (PAT). Transparently flags that AC requires internet because LG ACs communicate via the LG Cloud.

---

## 🚀 Quick Start Deployment

### 1. Requirements
- Node.js `v18.0.0` or higher (`v20+` recommended).
- All devices must be connected to the same Wi-Fi router.

### 2. Installation
```bash
git clone https://github.com/aryan-2728372882/universal-remote.git
cd universal-remote

# Install dependencies for both server and client
npm install

# Build client production bundle
npm run build

# Start the hub
npm start
```

### 3. Finding Your Hub IP
When the hub starts, it automatically detects your private Wi-Fi interface and logs the exact URL:
```
================================================================
🚀 UNIVERSAL REMOTE LOCAL-FIRST HUB RUNNING
   Local URL:    http://localhost:3000
   Wi-Fi URL:    http://192.168.1.34:3000
   PIN Security: FIRST-RUN SETUP REQUIRED
================================================================
```

You can also find your IP manually:
- **Windows**: Run `ipconfig` in PowerShell/CMD (look for *IPv4 Address* under your Wi-Fi adapter, e.g., `192.168.1.x`).
- **Linux / Raspberry Pi**: Run `hostname -I` or `ip addr show`.
- **macOS**: Run `ipconfig getifaddr en0`.
- **Android (Termux)**: Run `ifconfig wlan0` or check Android Wi-Fi Details in Settings.

---

## 🔄 Auto-Start on Boot

To keep the hub running 24/7 inside your home without keeping a terminal open:

### Option A: PM2 (Recommended for Windows, macOS, Linux, Raspberry Pi)
```bash
# Install PM2 process manager globally
npm install -g pm2

# From the universal-remote directory:
pm2 start server/index.js --name "universal-remote"

# Save configuration and register system boot startup
pm2 save
pm2 startup
```

### Option B: systemd Service (Linux & Raspberry Pi)
1. Create a service file:
   ```bash
   sudo nano /etc/systemd/system/universal-remote.service
   ```
2. Paste the following configuration (replace `pi` with your user and `/home/pi/universal-remote` with your path):
   ```ini
   [Unit]
   Description=Universal Remote Local Hub
   After=network.target

   [Service]
   Type=simple
   User=pi
   WorkingDirectory=/home/pi/universal-remote
   ExecStart=/usr/bin/node server/index.js
   Restart=always
   RestartSec=5
   Environment=NODE_ENV=production
   Environment=PORT=3000

   [Install]
   WantedBy=multi-user.target
   ```
3. Enable and start:
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable --now universal-remote
   sudo systemctl status universal-remote
   ```

### Option C: Android Phone via Termux
You can repurpose an old Android phone into a silent 24/7 hub:
1. Install **Termux** from F-Droid.
2. In Termux, run:
   ```bash
   pkg update && pkg install nodejs git
   git clone https://github.com/aryan-2728372882/universal-remote.git
   cd universal-remote
   npm install && npm run build
   node server/index.js
   ```
3. Acquire a Wake Lock in Termux (`termux-wake-lock`) so Android does not sleep the CPU.

---

## 🔒 Security & First-Run Setup

1. Open `http://<hub-ip>:3000` on any device on your Wi-Fi.
2. On first visit, the UI presents the **Setup Hub Security PIN** prompt. Enter a 4-8 digit numeric PIN.
3. The PIN is hashed using `bcrypt` and stored in `server/data/store.json`. A cryptographically signed session JWT cookie (`hub_session`) is created.
4. Any phone opening the URL subsequently will be prompted to enter the PIN before control is granted.
5. All secrets (LG webOS client keys, Android TV TLS certs, LG ThinQ PAT tokens) are encrypted on disk with AES-256-GCM using an auto-generated per-install machine key (`master.key`).

---

## 📺 Device Pairing Guide

### 1. LG webOS Smart TV
1. Turn on the LG TV and ensure it is connected to the same Wi-Fi.
2. In the Universal Remote banner, click **Scan Wi-Fi** or click **Settings** -> **Add by IP** (`192.168.1.x`).
3. If not already paired, the TV status will display `PAIRING_REQUIRED`. Click **Pair Device**.
4. The TV screen will display an on-screen dialog: *"Universal Remote Hub requests connection"*.
5. Select **Accept / Yes** using your physical TV remote.
6. The TV and Hub exchange client-keys. The key is securely saved, and full D-pad, app launcher, volume, and WoL controls become active.

### 2. Nokia Smart TV (Android TV / Google TV)
1. Turn on the Nokia TV.
2. Register the device via auto-discovery or by entering its IP in Settings.
3. When the status displays `PAIRING_REQUIRED`, click **Pair Device**.
4. The hub initiates Android TV Remote v2 TLS pairing on port 6467.
5. A **6-character alphanumeric pairing code** appears on your TV screen.
6. Type the code into the Universal Remote pairing wizard modal and click **Confirm**.
7. The hub stores the client certificate and connects to remote port 6466 for responsive D-pad, media, and text input.

### 3. LG Dual Inverter Air Conditioner (ThinQ Wi-Fi)
1. Register your LG AC in the official **LG ThinQ mobile app** on your phone.
2. Go to the official [LG ThinQ Connect Developer Portal](https://smartsolution.developer.lge.com).
3. Log in with your LG account, create a Personal Access Token (PAT), and select the region (`IN` for India, `US`, etc.).
4. In Universal Remote, click **Settings** -> **LG ThinQ AC**. Paste your PAT token and select your region.
5. Real AC telemetry (power, room temp, humidity, target temp, fan speed, swing) will synchronize.
> **Note**: LG ACs do not have a local LAN control API; they communicate through LG Cloud servers. The AC therefore requires internet access.

---

## 🌐 Troubleshooting Network & AP Isolation

| Issue | Cause | Fix |
|---|---|---|
| Auto-discovery doesn't find TV | Router **AP Isolation** or **VLAN / Guest Mode** separates Wi-Fi clients from talking to each other. | 1. Disable "AP Isolation" or "Client Isolation" in your Wi-Fi router settings.<br>2. Add the device manually in Universal Remote under **Settings -> Add by IP**. |
| TV not found on 5GHz vs 2.4GHz | Some home routers do not bridge multicast across 2.4GHz and 5GHz bands. | Ensure hub and TVs are on the same Wi-Fi band or enable multicast forwarding / IGMP Snooping in router settings. |
| Wake-on-LAN doesn't turn TV ON | Router drops general `255.255.255.255` UDP broadcasts. | Universal Remote automatically calculates and sends WoL packets to your specific subnet broadcast (e.g., `192.168.1.255`). Ensure "Wake On Wi-Fi / Mobile TV On" is enabled in your LG TV Settings. |

---

## 🧪 Testing & Verification

Run the automated test suite:
```bash
npm test
```

To run offline mock simulation mode without hardware:
```bash
ENABLE_MOCK=1 npm start
```
This registers a mock multi-device driver clearly tagged `[MOCK TEST MODE]` in the UI to test all UI controls, sliders, D-pad, scenes, and schedules.

---

## 📄 License
MIT. Made for genuine, local-first smart home freedom.
