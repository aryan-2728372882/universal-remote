/**
 * LG webOS TV Service - Genuine Local Network Protocol
 * Implements LG's official WebSocket SSAP (Smart TV Simple Access Protocol)
 * Connects directly to ws://<tv_ip>:3000 over local Wi-Fi.
 */

const WebSocket = require('ws');
const dgram = require('dgram');
const fs = require('fs');
const path = require('path');

const KEY_FILE = path.join(__dirname, '../data/webos_key.json');

class WebOsService {
  constructor() {
    this.tvIp = '192.168.1.45';
    this.tvMac = 'AA:BB:CC:DD:EE:FF';
    this.ws = null;
    this.clientKey = null;
    this.isConnecting = false;
    this.isConnected = false;
    this.reqId = 1;
    this.callbacks = new Map();
    this.lastPacketLog = null;

    this.tvState = {
      id: 'lg-tv',
      name: 'LG webOS Smart TV',
      type: 'LG_TV',
      ip: this.tvIp,
      mac: this.tvMac,
      power: false,
      volume: 18,
      isMuted: false,
      currentApp: 'Netflix',
      currentInput: 'HDMI 1',
      paired: false,
      status: 'DISCONNECTED'
    };

    this.loadKey();
  }

  loadKey() {
    try {
      if (fs.existsSync(KEY_FILE)) {
        const data = JSON.parse(fs.readFileSync(KEY_FILE, 'utf-8'));
        if (data.clientKey) this.clientKey = data.clientKey;
        if (data.tvIp) this.tvIp = data.tvIp;
        if (data.tvMac) this.tvMac = data.tvMac;
        this.tvState.paired = !!this.clientKey;
      }
    } catch (e) {
      console.warn('[WebOsService] Could not load saved webOS key:', e.message);
    }
  }

  saveKey() {
    try {
      const dir = path.dirname(KEY_FILE);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(KEY_FILE, JSON.stringify({
        clientKey: this.clientKey,
        tvIp: this.tvIp,
        tvMac: this.tvMac,
        updatedAt: new Date().toISOString()
      }, null, 2));
    } catch (e) {
      console.warn('[WebOsService] Could not save webOS key:', e.message);
    }
  }

  setTvIp(ip, mac = null) {
    if (ip && ip !== this.tvIp) {
      console.log(`[WebOsService] Binding LG TV to IP: ${ip}`);
      this.tvIp = ip;
      this.tvState.ip = ip;
      if (mac) {
        this.tvMac = mac;
        this.tvState.mac = mac;
      }
      this.disconnect();
      this.connect();
    }
  }

  /**
   * Connect to LG TV WebSocket on port 3000
   */
  connect() {
    if (this.ws || this.isConnecting || !this.tvIp) return;
    this.isConnecting = true;

    const wsUrl = `ws://${this.tvIp}:3000/`;
    console.log(`[WebOsService] Connecting to LG TV at ${wsUrl}...`);

    try {
      this.ws = new WebSocket(wsUrl, { handshakeTimeout: 2500 });

      this.ws.on('open', () => {
        this.isConnecting = false;
        this.isConnected = true;
        this.tvState.power = true;
        this.tvState.status = 'CONNECTED';
        console.log(`[WebOsService] Connected to LG webOS TV at ${this.tvIp}:3000! Sending handshake...`);
        this.sendHandshake();
      });

      this.ws.on('message', (data) => {
        try {
          const msg = JSON.parse(data.toString());
          this.handleMessage(msg);
        } catch (e) {
          console.warn('[WebOsService] Failed to parse TV response:', e.message);
        }
      });

      this.ws.on('close', () => {
        this.isConnecting = false;
        this.isConnected = false;
        this.ws = null;
        this.tvState.status = 'DISCONNECTED';
        console.log('[WebOsService] Disconnected from LG TV.');
      });

      this.ws.on('error', (err) => {
        this.isConnecting = false;
        this.isConnected = false;
        this.ws = null;
        this.tvState.status = 'UNREACHABLE';
        console.log(`[WebOsService] TV socket error (${this.tvIp}): ${err.message}`);
      });
    } catch (err) {
      this.isConnecting = false;
      this.isConnected = false;
      this.ws = null;
      console.warn(`[WebOsService] Connection error: ${err.message}`);
    }
  }

  disconnect() {
    if (this.ws) {
      try { this.ws.close(); } catch {}
      this.ws = null;
    }
    this.isConnected = false;
    this.isConnecting = false;
  }

  /**
   * Official webOS Pairing Handshake
   */
  sendHandshake() {
    const handshakePacket = {
      type: 'register',
      id: 'register_0',
      payload: {
        forcePairing: false,
        pairingType: 'PROMPT',
        'client-key': this.clientKey || undefined,
        manifest: {
          manifestVersion: 1,
          appVersion: '1.0',
          signed: {
            created: '20240101',
            appId: 'com.universal.remote',
            vendorId: 'com.universal',
            localizedAppNames: { '': 'Universal Remote' },
            permissions: [
              'LAUNCH', 'LAUNCH_WEBAPP', 'APP_TO_APP', 'CONTROL_AUDIO',
              'CONTROL_DISPLAY', 'CONTROL_INPUT_JOYSTICK', 'CONTROL_INPUT_MEDIA_PLAYBACK',
              'CONTROL_INPUT_TV', 'READ_APP_STATUS', 'READ_CURRENT_CHANNEL',
              'READ_INPUT_DEVICE_LIST', 'READ_NETWORK_STATUS', 'READ_RUNNING_APPS',
              'READ_TV_CHANNEL_LIST', 'WRITE_NOTIFICATION_TOAST'
            ],
            serial: '2f930e2d2'
          }
        }
      }
    };

    this.sendRaw(handshakePacket);
  }

  handleMessage(msg) {
    if (msg.type === 'registered') {
      const key = msg.payload?.['client-key'];
      if (key) {
        this.clientKey = key;
        this.tvState.paired = true;
        this.saveKey();
        console.log(`[WebOsService] Pairing approved by TV! Saved client-key.`);
        this.showToast('Universal Remote connected successfully!');
      }
    }

    if (msg.id && this.callbacks.has(msg.id)) {
      const cb = this.callbacks.get(msg.id);
      this.callbacks.delete(msg.id);
      cb(msg);
    }
  }

  sendRaw(packet) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const json = JSON.stringify(packet);
      this.ws.send(json);
      this.lastPacketLog = {
        sentAt: new Date().toISOString(),
        packet,
        status: 'DISPATCHED_TO_TV'
      };
      return true;
    }
    return false;
  }

  request(uri, payload = {}) {
    return new Promise((resolve) => {
      const id = `req_${this.reqId++}`;
      const packet = { type: 'request', id, uri, payload };

      const startTime = Date.now();
      const dispatched = this.sendRaw(packet);

      if (!dispatched) {
        this.connect();
        return resolve({ success: false, reason: 'TV_SOCKET_NOT_CONNECTED', uri });
      }

      const timer = setTimeout(() => {
        this.callbacks.delete(id);
        resolve({ success: true, uri, timeout: true });
      }, 2000);

      this.callbacks.set(id, (res) => {
        clearTimeout(timer);
        const duration = Date.now() - startTime;
        console.log(`[WebOsService] TV ACK for ${uri} in ${duration}ms:`, res.payload || res.type);
        resolve({ success: true, uri, response: res.payload, duration });
      });
    });
  }

  showToast(message) {
    return this.request('ssap://system.notifications/createToast', { message, iconUrl: '' });
  }

  wakeOnLan(macAddress = this.tvMac) {
    return new Promise((resolve) => {
      try {
        const cleanMac = (macAddress || '').replace(/[^0-9A-Fa-f]/g, '');
        if (cleanMac.length !== 12) {
          return resolve({ success: false, message: 'Invalid MAC address format' });
        }

        const magicPacket = Buffer.alloc(102);
        for (let i = 0; i < 6; i++) magicPacket[i] = 0xFF;
        for (let i = 0; i < 16; i++) magicPacket.set(Buffer.from(cleanMac, 'hex'), 6 + i * 6);

        const client = dgram.createSocket('udp4');
        client.bind(() => {
          client.setBroadcast(true);
          client.send(magicPacket, 0, magicPacket.length, 9, '255.255.255.255', (err) => {
            client.close();
            if (err) {
              console.warn('[WebOsService] WoL broadcast failed:', err.message);
              resolve({ success: false, error: err.message });
            } else {
              console.log(`[WebOsService] Wake-on-LAN magic packet broadcasted for MAC: ${macAddress}`);
              this.tvState.power = true;
              setTimeout(() => this.connect(), 3500);
              resolve({ success: true, message: 'Wake-on-LAN packet broadcasted successfully!' });
            }
          });
        });
      } catch (err) {
        resolve({ success: false, error: err.message });
      }
    });
  }

  async sendCommand(command, payload = {}) {
    console.log(`[WebOsService] Executing real command: ${command}`);

    if (!this.isConnected) {
      this.connect();
    }

    let uri = null;
    let reqPayload = {};

    switch (command) {
      case 'POWER_TOGGLE':
        if (this.tvState.power) {
          uri = 'ssap://system/turnOff';
          this.tvState.power = false;
        } else {
          return this.wakeOnLan();
        }
        break;

      case 'POWER_OFF':
        uri = 'ssap://system/turnOff';
        this.tvState.power = false;
        break;

      case 'POWER_ON':
        return this.wakeOnLan();

      case 'VOLUME_UP':
        uri = 'ssap://audio/volumeUp';
        if (this.tvState.volume < 100) this.tvState.volume += 1;
        this.tvState.isMuted = false;
        break;

      case 'VOLUME_DOWN':
        uri = 'ssap://audio/volumeDown';
        if (this.tvState.volume > 0) this.tvState.volume -= 1;
        break;

      case 'SET_VOLUME':
        uri = 'ssap://audio/setVolume';
        const targetVol = Math.max(0, Math.min(100, Number(payload.volume || payload.value || 0)));
        reqPayload = { volume: targetVol };
        this.tvState.volume = targetVol;
        this.tvState.isMuted = false;
        break;

      case 'MUTE_TOGGLE':
        uri = 'ssap://audio/setMuted';
        this.tvState.isMuted = !this.tvState.isMuted;
        reqPayload = { mute: this.tvState.isMuted };
        break;

      case 'CHANNEL_UP':
        uri = 'ssap://tv/channelUp';
        break;

      case 'CHANNEL_DOWN':
        uri = 'ssap://tv/channelDown';
        break;

      case 'DPAD_UP':
        uri = 'ssap://api/media.controls/rewind';
        break;

      case 'DPAD_DOWN':
        uri = 'ssap://api/media.controls/fastForward';
        break;

      case 'OK':
        uri = 'ssap://media.controls/play';
        break;

      case 'HOME':
        uri = 'ssap://system.launcher/launch';
        reqPayload = { id: 'com.webos.app.home' };
        break;

      case 'LAUNCH_APP':
        uri = 'ssap://system.launcher/launch';
        const appName = (payload.app || '').toLowerCase();
        let appId = 'netflix';
        if (appName.includes('youtube')) appId = 'youtube.leanback.v4';
        else if (appName.includes('prime') || appName.includes('amazon')) appId = 'amazon';
        else if (appName.includes('disney')) appId = 'com.disney.disneyplus-prod';
        reqPayload = { id: appId };
        this.tvState.currentApp = payload.app;
        break;

      case 'MEDIA_PLAY':
        uri = 'ssap://media.controls/play';
        break;

      case 'MEDIA_PAUSE':
        uri = 'ssap://media.controls/pause';
        break;

      case 'MEDIA_REWIND':
        uri = 'ssap://media.controls/rewind';
        break;

      case 'MEDIA_FAST_FORWARD':
        uri = 'ssap://media.controls/fastForward';
        break;

      default:
        console.warn(`[WebOsService] Unhandled command: ${command}`);
        break;
    }

    if (uri) {
      const res = await this.request(uri, reqPayload);
      return { success: true, command, uri, res, state: this.tvState };
    }

    return { success: true, command, state: this.tvState };
  }

  updateConfig(updates) {
    this.tvState = { ...this.tvState, ...updates };
    if (updates.ip) this.setTvIp(updates.ip, updates.mac);
    return this.tvState;
  }

  getState() {
    return {
      ...this.tvState,
      isConnected: this.isConnected,
      lastPacketLog: this.lastPacketLog
    };
  }
}

module.exports = new WebOsService();
