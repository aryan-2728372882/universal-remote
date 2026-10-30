const WebSocket = require('ws');
const dgram = require('dgram');
const DeviceDriver = require('../core/DeviceDriver');
const store = require('../core/Store');
const subnetScan = require('../discovery/subnetScan');

class LgWebosDriver extends DeviceDriver {
  static type = 'lg_webos';

  constructor(config = {}) {
    super(config);
    this.ip = config.ip;
    this.mac = config.mac || null;
    this.ws = null;
    this.inputWs = null;
    this.clientKey = store.getEncrypted(`webos_key_${this.id}`, null);
    this.reqId = 1;
    this.callbacks = new Map();
    this.isConnecting = false;
    this.reconnectTimer = null;

    this.state = {
      id: this.id,
      name: this.name,
      type: 'lg_webos',
      status: 'OFFLINE', // ONLINE | OFFLINE | PAIRING_REQUIRED
      power: false,
      volume: 15,
      isMuted: false,
      currentApp: 'Netflix',
      paired: Boolean(this.clientKey),
      ip: this.ip,
      mac: this.mac
    };
  }

  getState() {
    return {
      ...this.state,
      paired: Boolean(this.clientKey)
    };
  }

  capabilities() {
    return [
      { id: 'power', kind: 'toggle', label: 'Power', group: 'Power' },
      { id: 'volume', kind: 'slider', label: 'Volume', group: 'Audio', range: [0, 100] },
      { id: 'volume_up', kind: 'button', label: 'Vol +', group: 'Audio' },
      { id: 'volume_down', kind: 'button', label: 'Vol -', group: 'Audio' },
      { id: 'mute', kind: 'toggle', label: 'Mute', group: 'Audio' },
      { id: 'dpad', kind: 'dpad', label: 'Navigation', group: 'Navigation' },
      { id: 'back', kind: 'button', label: 'Back', group: 'Navigation' },
      { id: 'home', kind: 'button', label: 'Home', group: 'Navigation' },
      { id: 'menu', kind: 'button', label: 'Menu', group: 'Navigation' },
      { id: 'channel_up', kind: 'button', label: 'CH +', group: 'Tuner' },
      { id: 'channel_down', kind: 'button', label: 'CH -', group: 'Tuner' },
      { id: 'app_launch', kind: 'select', label: 'Launch App', group: 'Apps', options: ['Netflix', 'YouTube', 'Prime Video', 'Disney+'] },
      { id: 'media_play', kind: 'button', label: 'Play', group: 'Media' },
      { id: 'media_pause', kind: 'button', label: 'Pause', group: 'Media' },
      { id: 'media_rewind', kind: 'button', label: 'Rewind', group: 'Media' },
      { id: 'media_fastforward', kind: 'button', label: 'Fast Forward', group: 'Media' }
    ];
  }

  /**
   * Connect to LG TV trying wss://:3001 (TLS) first, falling back to ws://:3000
   */
  async connect() {
    if (!this.ip || this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
      return;
    }
    this.isConnecting = true;

    try {
      // 1. Try secure WebSocket wss://:3001 (modern webOS 4.0+)
      const connected = await this.tryConnect(`wss://${this.ip}:3001`, true);
      if (!connected) {
        // 2. Fall back to unsecured ws://:3000
        await this.tryConnect(`ws://${this.ip}:3000`, false);
      }
    } catch (err) {
      console.log(`[LgWebosDriver] Connect error (${this.ip}):`, err.message);
    } finally {
      this.isConnecting = false;
    }
  }

  tryConnect(url, isSecure) {
    return new Promise((resolve) => {
      let resolved = false;
      const ws = new WebSocket(url, {
        rejectUnauthorized: false,
        handshakeTimeout: 2000
      });

      const timer = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          try { ws.close(); } catch {}
          resolve(false);
        }
      }, 2500);

      ws.on('open', () => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timer);
          this.ws = ws;
          this.state.status = this.clientKey ? 'ONLINE' : 'PAIRING_REQUIRED';
          this.state.power = true;
          this.setupSocketEvents(ws);
          this.sendRegistrationHandshake();
          resolve(true);
        }
      });

      ws.on('error', (err) => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timer);
          resolve(false);
        }
      });
    });
  }

  setupSocketEvents(ws) {
    ws.on('message', (data) => {
      try {
        const msg = JSON.parse(data.toString());
        this.handleMessage(msg);
      } catch {}
    });

    ws.on('close', () => {
      this.ws = null;
      this.state.status = 'OFFLINE';
      this.state.power = false;
      this.notifyStateChange();
      if (this.inputWs) {
        try { this.inputWs.close(); } catch {}
        this.inputWs = null;
      }
    });
  }

  sendRegistrationHandshake() {
    const handshake = {
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
            appId: 'com.universal.remote.hub',
            vendorId: 'com.universal',
            localizedAppNames: { '': 'Universal Remote Hub' },
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

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(handshake));
    }
  }

  handleMessage(msg) {
    // Pairing approved
    if (msg.type === 'registered' && msg.payload?.['client-key']) {
      this.clientKey = msg.payload['client-key'];
      this.state.paired = true;
      this.state.status = 'ONLINE';
      store.setEncrypted(`webos_key_${this.id}`, this.clientKey);
      console.log(`[LgWebosDriver] Client key successfully paired & persisted for ${this.id}`);

      // Initialize network input socket for true DPAD navigation
      this.initInputSocket();
      this.subscribeState();
      this.notifyStateChange();
    }

    // Handshake prompt active on TV screen
    if (msg.type === 'response' && msg.id === 'register_0' && msg.payload?.pairingType === 'PROMPT') {
      this.state.status = 'PAIRING_REQUIRED';
      this.notifyStateChange();
    }

    // Volume subscription updates
    if (msg.uri === 'ssap://audio/getVolume' && msg.payload) {
      if (typeof msg.payload.volume === 'number') this.state.volume = msg.payload.volume;
      if (typeof msg.payload.muted === 'boolean') this.state.isMuted = msg.payload.muted;
      this.notifyStateChange();
    }

    // App foreground subscription updates
    if (msg.uri === 'ssap://com.webos.applicationManager/getForegroundAppInfo' && msg.payload?.appId) {
      this.state.currentApp = msg.payload.appId;
      this.notifyStateChange();
    }

    // Resolve one-off callbacks
    if (msg.id && this.callbacks.has(msg.id)) {
      const cb = this.callbacks.get(msg.id);
      this.callbacks.delete(msg.id);
      cb(msg);
    }
  }

  /**
   * Request and initialize the network input pointer socket (ssap://com.webos.service.networkinput/getPointerInputSocket)
   */
  async initInputSocket() {
    try {
      const res = await this.request('ssap://com.webos.service.networkinput/getPointerInputSocket');
      const socketPath = res?.payload?.socketPath;
      if (socketPath) {
        this.inputWs = new WebSocket(socketPath, { rejectUnauthorized: false });
        this.inputWs.on('open', () => {
          console.log(`[LgWebosDriver] Pointer/Button input socket connected for ${this.id}`);
        });
        this.inputWs.on('error', () => {
          this.inputWs = null;
        });
      }
    } catch (err) {
      console.warn('[LgWebosDriver] Input socket init error:', err.message);
    }
  }

  sendInputButton(buttonName) {
    if (this.inputWs && this.inputWs.readyState === WebSocket.OPEN) {
      this.inputWs.send(`type:button\nname:${buttonName}\n\n`);
      return true;
    }
    return false;
  }

  subscribeState() {
    // Subscribe to volume changes
    this.request('ssap://audio/getVolume', {}, true);
    // Subscribe to active foreground app
    this.request('ssap://com.webos.applicationManager/getForegroundAppInfo', {}, true);
  }

  request(uri, payload = {}, isSubscription = false) {
    return new Promise((resolve, reject) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        return reject(new Error('TV not connected'));
      }

      const id = `${isSubscription ? 'sub' : 'req'}_${this.reqId++}`;
      const packet = {
        type: isSubscription ? 'subscribe' : 'request',
        id,
        uri,
        payload
      };

      const timer = setTimeout(() => {
        this.callbacks.delete(id);
        resolve({ timeout: true });
      }, 3000);

      this.callbacks.set(id, (res) => {
        clearTimeout(timer);
        resolve(res);
      });

      this.ws.send(JSON.stringify(packet));
    });
  }

  /**
   * Send directed Wake-on-LAN magic packet to subnet broadcast
   */
  wakeOnLan() {
    return new Promise((resolve) => {
      if (!this.mac) {
        return resolve({ ok: false, error: 'MAC address required for Wake-on-LAN' });
      }

      const cleanMac = this.mac.replace(/[^0-9A-Fa-f]/g, '');
      if (cleanMac.length !== 12) {
        return resolve({ ok: false, error: 'Invalid MAC address format' });
      }

      const magicPacket = Buffer.alloc(102);
      for (let i = 0; i < 6; i++) magicPacket[i] = 0xFF;
      for (let i = 0; i < 16; i++) magicPacket.set(Buffer.from(cleanMac, 'hex'), 6 + i * 6);

      // Find local subnet broadcast addresses
      const subnets = subnetScan.getPrivateInterfaces();
      const broadcastTargets = ['255.255.255.255'];
      for (const s of subnets) {
        if (s.broadcastAddress && !broadcastTargets.includes(s.broadcastAddress)) {
          broadcastTargets.push(s.broadcastAddress);
        }
      }

      const client = dgram.createSocket('udp4');
      client.bind(() => {
        client.setBroadcast(true);
        for (const target of broadcastTargets) {
          client.send(magicPacket, 0, magicPacket.length, 9, target, () => {});
        }
        setTimeout(() => {
          try { client.close(); } catch {}
          this.state.status = 'WAKING';
          this.notifyStateChange();
          // Auto-reconnect after TV boots
          setTimeout(() => this.connect(), 4000);
          resolve({ ok: true, message: `Wake-on-LAN sent to ${broadcastTargets.join(', ')}` });
        }, 300);
      });
    });
  }

  async execute(capabilityId, value = null) {
    // 1. Navigation D-pad and buttons via real input socket
    const buttonMap = {
      dpad_up: 'UP',
      dpad_down: 'DOWN',
      dpad_left: 'LEFT',
      dpad_right: 'RIGHT',
      dpad_enter: 'ENTER',
      back: 'BACK',
      home: 'HOME',
      menu: 'MENU'
    };

    if (buttonMap[capabilityId]) {
      const buttonSent = this.sendInputButton(buttonMap[capabilityId]);
      if (buttonSent) return { ok: true, state: this.getState() };
      // Fallback: Re-init input socket
      await this.initInputSocket();
      this.sendInputButton(buttonMap[capabilityId]);
      return { ok: true, state: this.getState() };
    }

    // 2. Volume controls
    if (capabilityId === 'volume_up') {
      await this.request('ssap://audio/volumeUp');
      return { ok: true, state: this.getState() };
    }
    if (capabilityId === 'volume_down') {
      await this.request('ssap://audio/volumeDown');
      return { ok: true, state: this.getState() };
    }
    if (capabilityId === 'volume') {
      await this.request('ssap://audio/setVolume', { volume: Number(value) });
      return { ok: true, state: this.getState() };
    }
    if (capabilityId === 'mute') {
      const newMute = typeof value === 'boolean' ? value : !this.state.isMuted;
      await this.request('ssap://audio/setMuted', { mute: newMute });
      return { ok: true, state: this.getState() };
    }

    // 3. Channels
    if (capabilityId === 'channel_up') {
      await this.request('ssap://tv/channelUp');
      return { ok: true, state: this.getState() };
    }
    if (capabilityId === 'channel_down') {
      await this.request('ssap://tv/channelDown');
      return { ok: true, state: this.getState() };
    }

    // 4. Power
    if (capabilityId === 'power') {
      if (this.state.power) {
        await this.request('ssap://system/turnOff');
        this.state.power = false;
        this.state.status = 'OFFLINE';
        this.notifyStateChange();
        return { ok: true, state: this.getState() };
      } else {
        return this.wakeOnLan();
      }
    }

    // 5. App Launching
    if (capabilityId === 'app_launch') {
      const appName = String(value).toLowerCase();
      let appId = 'netflix';
      if (appName.includes('youtube')) appId = 'youtube.leanback.v4';
      else if (appName.includes('prime') || appName.includes('amazon')) appId = 'amazon';
      else if (appName.includes('disney')) appId = 'com.disney.disneyplus-prod';
      await this.request('ssap://system.launcher/launch', { id: appId });
      this.state.currentApp = value;
      this.notifyStateChange();
      return { ok: true, state: this.getState() };
    }

    // 6. Media
    if (capabilityId === 'media_play') {
      await this.request('ssap://media.controls/play');
      return { ok: true, state: this.getState() };
    }
    if (capabilityId === 'media_pause') {
      await this.request('ssap://media.controls/pause');
      return { ok: true, state: this.getState() };
    }
    if (capabilityId === 'media_rewind') {
      await this.request('ssap://media.controls/rewind');
      return { ok: true, state: this.getState() };
    }
    if (capabilityId === 'media_fastforward') {
      await this.request('ssap://media.controls/fastForward');
      return { ok: true, state: this.getState() };
    }

    return { ok: false, error: `Unsupported capability: ${capabilityId}` };
  }

  async disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.inputWs) {
      try { this.inputWs.close(); } catch {}
      this.inputWs = null;
    }
    if (this.ws) {
      try { this.ws.close(); } catch {}
      this.ws = null;
    }
    this.state.status = 'OFFLINE';
    await super.disconnect();
  }
}

module.exports = LgWebosDriver;
