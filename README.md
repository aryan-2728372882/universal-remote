# 📱 Universal Remote Web App (PWA)

A full-featured, zero-cost **Universal Smart Home Remote** designed for your:
1. ❄️ **LG Dual Inverter Air Conditioner** (LG ThinQ Wi-Fi)
2. 📺 **LG webOS Smart TV** (webOS & LG ThinQ)
3. 📺 **Nokia Smart TV** (Android TV / Google TV)

Runs seamlessly on **Render.com Free Web Service** with an automated **24/7 Keep-Alive Self-Ping Engine**, meaning:
- **No laptop needed** to stay on 24/7.
- **100% Free of Cost** (Zero server bills, zero subscriptions).
- Responsive **Mobile-First PWA**: Install on your phone via *"Add to Home Screen"* with realistic tactile haptic button clicks!

---

## 🚀 Features

### ❄️ LG Air Conditioner Remote
- **Power On / Off** with live status indicator.
- **Circular Thermostat Dial**: Precise target temperature steppers (`16°C` to `30°C`) & touch slider.
- **Room Sensor Readout**: Live indoor room temperature & humidity readout.
- **Modes**: Cool (❄️), Dry (💧), Fan (🌀), Heat (☀️), Auto (🔄).
- **Fan Speeds**: Low, Medium, High, Auto, Turbo.
- **Air Swings**: Independent toggles for Vertical Swing & Horizontal Oscillation.
- **Special Modes**: **Jet Cool (18°C Turbo)** and **Energy Saver**.

### 📺 LG webOS Smart TV Remote
- **Power**: Turn Off and **Wake-on-LAN (WoL)** to power on sleeping TVs.
- **Volume & Channel Rockers**: Dedicated step controls with instant mute toggle.
- **Magic Remote Directional Pad**: Up, Down, Left, Right, and Center Click OK button.
- **Navigation Triad**: Back, Home Dashboard, and Settings Menu.
- **Quick App Launchers**: Netflix, YouTube, Prime Video, Disney+, HDMI 1, HDMI 2, Live TV.
- **Media Controls**: Play, Pause, Rewind, Fast Forward.
- **Interactive Numpad**: Toggleable 0-9 drawer for direct channel typing.

### 📺 Nokia Smart Android TV Remote
- **Android TV Remote Interface**: Full Google TV / Android TV remote layout.
- **Google Assistant Voice Button**: Dedicated trigger.
- **TV Keyboard Input**: Type text or search queries directly from your phone into the TV.
- **Media & App Launchers**: One-tap launch for YouTube, Netflix, Prime Video, and Hotstar.
- **Cloud Companion Bridge**: Connects to Render's WebSocket relay so commands reach your Nokia TV from the cloud.

### ⚡ 24/7 Render Keep-Alive Engine
- Render's free tier spins down services after 15 minutes of idle time.
- Our built-in **Ping Engine** automatically pings your Render URL every **11 minutes** to keep your remote active 24 hours a day, 7 days a week, completely free!
- Built-in status badge in the header displays live ping counts and health.

---

## 🛠️ Instant Deployment to Render (3 Minutes, 100% Free)

1. **Push this folder to your GitHub**:
   ```bash
   cd universal-remote
   git init
   git add .
   git commit -m "Initial commit of Universal Remote"
   git branch -M main
   git remote add origin https://github.com/<your-username>/universal-remote.git
   git push -u origin main
   ```

2. **Deploy on Render**:
   - Go to [Render.com](https://render.com) and sign in for free.
   - Click **New +** -> **Web Service**.
   - Select your GitHub repository.
   - Settings:
     - **Name**: `my-universal-remote` (or any name you like)
     - **Language**: `Node`
     - **Build Command**: `npm install && npm run build`
     - **Start Command**: `npm start`
     - **Instance Type**: `Free`
   - Click **Deploy Web Service**!

3. **Activate 24/7 Keep-Alive**:
   - Once deployed, copy your Render URL (e.g. `https://my-universal-remote.onrender.com`).
   - Open your remote website, click **⚙️ Settings**, paste your Render URL, and click **Save**.
   - Your remote will now self-ping every 11 minutes and stay awake 24/7!

---

## 📲 How to Use on Your Phone (Install as PWA)

1. Open your Render link (or scan the QR code from the app) on your iPhone (Safari) or Android phone (Chrome).
2. Tap the browser share/menu icon:
   - **iPhone (Safari)**: Tap **Share** -> **Add to Home Screen**.
   - **Android (Chrome)**: Tap the **three dots** -> **Add to Home Screen** / **Install App**.
3. It will install as an app with an icon, full-screen UI, and zero browser address bars!

---

## 🔌 Device Connection Guide

### 1. LG Air Conditioner & LG TV (via LG ThinQ Cloud)
- Make sure your LG AC is registered in the official **LG ThinQ mobile app**.
- If you have an LG webOS TV, sign in to your LG ThinQ account in the TV Settings as well.
- In your Universal Remote app, tap **⚙️ Settings** -> **LG ThinQ** tab.
- Enter your LG account email and password.
- Both your AC and TV will now be controllable from anywhere in the world!

### 2. Nokia Smart TV (Android TV)
- Open the built-in browser on your Nokia TV.
- Visit: `https://<your-render-url>/tv-receiver.html`.
- It will automatically connect to your Render cloud WebSocket and execute remote clicks in real-time!

---

## 💻 Local Testing (Running on your laptop)

If you ever want to run it on your laptop:
```bash
# In the universal-remote directory
npm install
npm run build
npm start
```
Then visit `http://localhost:3000` in your browser.
