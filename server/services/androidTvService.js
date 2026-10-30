/**
 * Nokia Android TV Service
 * Controls Android TV / Google TV devices (Nokia Smart TV).
 * Supports:
 * - Directional Pad (Up, Down, Left, Right, OK, Back, Home, Menu)
 * - Volume (+ / - / Mute)
 * - Power Toggle
 * - Media Keys (Play, Pause, Rewind, FastForward)
 * - Direct App Launch (YouTube, Netflix, Prime Video, Hotstar, Play Store)
 * - Outbound WebSocket Companion Bridge for Cloud (Render) connection
 */

const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(__dirname, '../data/nokia_tv_config.json');

// Standard Android TV Keycodes
const ANDROID_KEYCODES = {
  POWER: 26,
  HOME: 3,
  BACK: 4,
  UP: 19,
  DOWN: 20,
  LEFT: 21,
  RIGHT: 22,
  OK: 66, // KEYCODE_ENTER / DPAD_CENTER (23)
  VOLUME_UP: 24,
  VOLUME_DOWN: 25,
  MUTE: 164,
  PLAY_PAUSE: 85,
  PLAY: 126,
  PAUSE: 127,
  FAST_FORWARD: 90,
  REWIND: 89,
  MENU: 82,
  SETTINGS: 176
};

class AndroidTvService {
  constructor() {
    this.tvState = {
      id: 'nokia-android-tv-01',
      name: 'Nokia Smart Android TV',
      type: 'ANDROID_TV',
      ip: '192.168.1.55', // Configurable
      paired: true,
      power: true,
      volume: 24,
      isMuted: false,
      currentApp: 'YouTube',
      connectionMode: 'CLOUD_BRIDGE', // 'CLOUD_BRIDGE' or 'LOCAL_ADB'
      lastCommand: null
    };

    this.connectedSockets = new Set();
    this.loadConfig();
  }

  loadConfig() {
    try {
      if (fs.existsSync(CONFIG_PATH)) {
        const raw = fs.readFileSync(CONFIG_PATH, 'utf-8');
        const data = JSON.parse(raw);
        if (data.tvState) {
          this.tvState = { ...this.tvState, ...data.tvState };
        }
      }
    } catch (e) {
      console.warn('[AndroidTvService] Failed to load config:', e.message);
    }
  }

  saveConfig() {
    try {
      const dir = path.dirname(CONFIG_PATH);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(CONFIG_PATH, JSON.stringify({ tvState: this.tvState }, null, 2));
    } catch (e) {
      console.warn('[AndroidTvService] Failed to save config:', e.message);
    }
  }

  registerCompanionSocket(ws) {
    this.connectedSockets.add(ws);
    console.log(`[AndroidTvService] TV companion client connected. Total clients: ${this.connectedSockets.size}`);

    ws.on('close', () => {
      this.connectedSockets.delete(ws);
      console.log(`[AndroidTvService] TV companion client disconnected. Remaining: ${this.connectedSockets.size}`);
    });
  }

  async sendCommand(command, payload = {}) {
    console.log(`[AndroidTvService] Executing TV command: ${command}`, payload);
    this.tvState.lastCommand = { command, payload, timestamp: new Date().toISOString() };

    // Update virtual state
    switch (command) {
      case 'POWER':
        this.tvState.power = !this.tvState.power;
        break;
      case 'VOLUME_UP':
        if (this.tvState.volume < 100) this.tvState.volume += 1;
        this.tvState.isMuted = false;
        break;
      case 'VOLUME_DOWN':
        if (this.tvState.volume > 0) this.tvState.volume -= 1;
        break;
      case 'MUTE':
        this.tvState.isMuted = !this.tvState.isMuted;
        break;
      case 'SET_VOLUME':
        this.tvState.volume = Math.max(0, Math.min(100, Number(payload.volume || 0)));
        this.tvState.isMuted = false;
        break;
      case 'LAUNCH_APP':
        if (payload.app) this.tvState.currentApp = payload.app;
        break;
      default:
        break;
    }

    // Broadcast to any connected TV companion clients
    const keycode = ANDROID_KEYCODES[command] || null;
    const packet = JSON.stringify({
      type: 'REMOTE_COMMAND',
      command,
      keycode,
      payload,
      state: this.tvState
    });

    for (const client of this.connectedSockets) {
      if (client.readyState === 1) { // OPEN
        client.send(packet);
      }
    }

    this.saveConfig();
    return { success: true, command, state: this.tvState };
  }

  updateConfig(updates) {
    this.tvState = { ...this.tvState, ...updates };
    this.saveConfig();
    return this.tvState;
  }

  getState() {
    return {
      ...this.tvState,
      hasActiveCompanion: this.connectedSockets.size > 0
    };
  }
}

module.exports = new AndroidTvService();
