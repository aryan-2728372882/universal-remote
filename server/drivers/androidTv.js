const { AndroidRemote, RemoteKeyCode, RemoteDirection } = require('androidtv-remote');
const DeviceDriver = require('../core/DeviceDriver');
const store = require('../core/Store');
const eventBus = require('../core/EventBus');
const net = require('net');

class AndroidTvDriver extends DeviceDriver {
  static type = 'android_tv';

  constructor(config = {}) {
    super(config);
    this.ip = config.ip;
    this.savedCert = store.getEncrypted(`atv_cert_${this.id}`, null);
    this.remote = null;
    this.pairingInProgress = false;

    this.state = {
      id: this.id,
      name: this.name,
      type: 'android_tv',
      status: this.savedCert ? 'OFFLINE' : 'PAIRING_REQUIRED',
      power: true,
      volume: 20,
      isMuted: false,
      currentApp: 'YouTube',
      paired: Boolean(this.savedCert),
      ip: this.ip
    };
  }

  getState() {
    return {
      ...this.state,
      paired: Boolean(this.savedCert)
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
      { id: 'app_launch', kind: 'select', label: 'Launch App', group: 'Apps', options: ['YouTube', 'Netflix', 'Prime Video', 'Hotstar'] },
      { id: 'media_play_pause', kind: 'button', label: 'Play / Pause', group: 'Media' },
      { id: 'text_input', kind: 'text', label: 'TV Keyboard', group: 'Input' }
    ];
  }

  async connect() {
    if (!this.ip) return;

    // Check if device is reachable on TCP port 6466 or 6467
    const isReachable = await this.probePort(this.ip, 6467, 1000);
    if (!isReachable) {
      this.state.status = 'OFFLINE';
      this.notifyStateChange();
      return;
    }

    try {
      this.remote = new AndroidRemote(this.ip, {
        pairing_port: 6467,
        remote_port: 6466,
        service_name: 'Universal Remote Hub',
        cert: this.savedCert || undefined
      });

      this.remote.on('secret', () => {
        console.log(`[AndroidTvDriver] Pairing code displayed on TV screen (${this.ip})`);
        this.state.status = 'PAIRING_REQUIRED';
        this.notifyStateChange();
        eventBus.emitPairingPrompt(this.id, {
          title: `Pair with ${this.name}`,
          message: 'Please enter the 6-character code shown on your Nokia/Android TV screen',
          type: 'PIN_CODE'
        });
      });

      this.remote.on('ready', () => {
        console.log(`[AndroidTvDriver] Android TV connection ready & verified for ${this.id}`);
        this.state.status = 'ONLINE';
        this.state.paired = true;
        this.notifyStateChange();

        // Persist certificate on successful link
        try {
          const cert = this.remote.getCertificate();
          if (cert && cert.key) {
            this.savedCert = cert;
            store.setEncrypted(`atv_cert_${this.id}`, cert);
          }
        } catch {}
      });

      this.remote.on('powered', (powered) => {
        this.state.power = Boolean(powered);
        this.notifyStateChange();
      });

      this.remote.on('volume', (vol) => {
        if (vol && typeof vol.level === 'number') {
          this.state.volume = vol.level;
          this.state.isMuted = Boolean(vol.muted);
          this.notifyStateChange();
        }
      });

      this.remote.on('current_app', (app) => {
        if (app) {
          this.state.currentApp = app;
          this.notifyStateChange();
        }
      });

      this.remote.on('unpaired', () => {
        console.log(`[AndroidTvDriver] TV unpaired ${this.id}`);
        this.state.status = 'PAIRING_REQUIRED';
        this.state.paired = false;
        store.delete(`atv_cert_${this.id}`);
        this.savedCert = null;
        this.notifyStateChange();
      });

      await this.remote.start();
    } catch (err) {
      console.warn(`[AndroidTvDriver] Connect error (${this.ip}):`, err.message);
      this.state.status = 'OFFLINE';
      this.notifyStateChange();
    }
  }

  probePort(ip, port, timeout = 750) {
    return new Promise((resolve) => {
      const socket = new net.Socket();
      socket.setTimeout(timeout);
      socket.on('connect', () => {
        socket.destroy();
        resolve(true);
      });
      socket.on('timeout', () => {
        socket.destroy();
        resolve(false);
      });
      socket.on('error', () => {
        socket.destroy();
        resolve(false);
      });
      socket.connect(port, ip);
    });
  }

  /**
   * Enter the 6-character pairing code shown on TV screen
   */
  async pair(deviceId, code) {
    if (!code || !this.remote) {
      return { ok: false, error: 'Pairing code is required' };
    }

    try {
      console.log(`[AndroidTvDriver] Submitting pairing code "${code}" to TV...`);
      await this.remote.sendCode(String(code).trim());
      this.state.status = 'ONLINE';
      this.state.paired = true;
      this.notifyStateChange();
      return { ok: true, message: 'Paired successfully with Android TV!' };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }

  async execute(capabilityId, value = null) {
    if (!this.remote) {
      await this.connect();
    }

    const keyMap = {
      dpad_up: RemoteKeyCode.KEYCODE_DPAD_UP,
      dpad_down: RemoteKeyCode.KEYCODE_DPAD_DOWN,
      dpad_left: RemoteKeyCode.KEYCODE_DPAD_LEFT,
      dpad_right: RemoteKeyCode.KEYCODE_DPAD_RIGHT,
      dpad_enter: RemoteKeyCode.KEYCODE_ENTER,
      back: RemoteKeyCode.KEYCODE_BACK,
      home: RemoteKeyCode.KEYCODE_HOME,
      menu: RemoteKeyCode.KEYCODE_MENU,
      volume_up: RemoteKeyCode.KEYCODE_VOLUME_UP,
      volume_down: RemoteKeyCode.KEYCODE_VOLUME_DOWN,
      mute: RemoteKeyCode.KEYCODE_MUTE,
      media_play_pause: RemoteKeyCode.KEYCODE_MEDIA_PLAY_PAUSE
    };

    try {
      if (keyMap[capabilityId]) {
        await this.remote.sendKey(keyMap[capabilityId], RemoteDirection.SHORT);
        return { ok: true, state: this.getState() };
      }

      if (capabilityId === 'power') {
        await this.remote.sendPower();
        this.state.power = !this.state.power;
        this.notifyStateChange();
        return { ok: true, state: this.getState() };
      }

      if (capabilityId === 'app_launch') {
        const app = String(value).toLowerCase();
        let appLink = 'https://www.youtube.com';
        if (app.includes('netflix')) appLink = 'https://www.netflix.com/title';
        else if (app.includes('prime')) appLink = 'https://app.primevideo.com';
        else if (app.includes('hotstar')) appLink = 'https://www.hotstar.com';
        await this.remote.sendAppLink(appLink);
        this.state.currentApp = value;
        this.notifyStateChange();
        return { ok: true, state: this.getState() };
      }

      if (capabilityId === 'text_input' && value) {
        // Send string character by character
        for (const char of String(value)) {
          const upper = char.toUpperCase();
          const code = RemoteKeyCode[`KEYCODE_${upper}`] || RemoteKeyCode.KEYCODE_SPACE;
          await this.remote.sendKey(code, RemoteDirection.SHORT);
          await new Promise(r => setTimeout(r, 50));
        }
        return { ok: true, state: this.getState() };
      }

      return { ok: false, error: `Unsupported capability: ${capabilityId}` };
    } catch (err) {
      console.error(`[AndroidTvDriver] Command error:`, err.message);
      return { ok: false, error: err.message };
    }
  }

  async disconnect() {
    if (this.remote) {
      try { this.remote.stop(); } catch {}
      this.remote = null;
    }
    this.state.status = 'OFFLINE';
    await super.disconnect();
  }
}

module.exports = AndroidTvDriver;
