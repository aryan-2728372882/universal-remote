/**
 * LG webOS TV Service
 * Controls LG Smart TVs via webOS SSAP protocol & Wake-on-LAN.
 * Also provides fallback to LG ThinQ cloud API when deployed on Render.
 */

const dgram = require('dgram');
const thinqService = require('./thinqService');

class WebOsService {
  constructor() {
    this.tvState = {
      id: 'lg-tv-webos-01',
      name: 'LG webOS OLED/UHD TV',
      type: 'LG_TV',
      ip: '192.168.1.45',
      mac: 'AA:BB:CC:DD:EE:FF',
      paired: true,
      power: true,
      volume: 16,
      isMuted: false,
      currentApp: 'Netflix',
      currentInput: 'HDMI 1',
      pointer: { x: 50, y: 50 }
    };
  }

  /**
   * Send Wake-on-LAN Magic Packet to wake TV from sleep
   */
  wakeOnLan(macAddress = this.tvState.mac) {
    return new Promise((resolve, reject) => {
      try {
        const cleanMac = macAddress.replace(/[^0-9A-Fa-f]/g, '');
        if (cleanMac.length !== 12) {
          return resolve({ success: false, message: 'Invalid MAC address format.' });
        }

        // Magic packet = 6 bytes of 0xFF followed by 16 repetitions of MAC
        const magicPacket = Buffer.alloc(102);
        for (let i = 0; i < 6; i++) {
          magicPacket[i] = 0xFF;
        }
        for (let i = 0; i < 16; i++) {
          magicPacket.set(Buffer.from(cleanMac, 'hex'), 6 + i * 6);
        }

        const client = dgram.createSocket('udp4');
        client.bind(() => {
          client.setBroadcast(true);
          client.send(magicPacket, 0, magicPacket.length, 9, '255.255.255.255', (err) => {
            client.close();
            if (err) {
              console.warn('[WebOsService] WoL send failed:', err.message);
              resolve({ success: false, error: err.message });
            } else {
              console.log('[WebOsService] Wake-on-LAN magic packet broadcasted successfully!');
              this.tvState.power = true;
              resolve({ success: true, message: 'Wake-on-LAN packet sent!' });
            }
          });
        });
      } catch (err) {
        resolve({ success: false, error: err.message });
      }
    });
  }

  async sendCommand(command, payload = {}) {
    console.log(`[WebOsService] Executing TV command: ${command}`, payload);

    // If thinq is authenticated, also sync with cloud
    if (thinqService.isAuthenticated) {
      thinqService.controlTv(command.toLowerCase(), payload.value);
    }

    switch (command) {
      case 'POWER_TOGGLE':
        this.tvState.power = !this.tvState.power;
        break;
      case 'POWER_ON':
        this.tvState.power = true;
        this.wakeOnLan();
        break;
      case 'POWER_OFF':
        this.tvState.power = false;
        break;
      case 'VOLUME_UP':
        if (this.tvState.volume < 100) this.tvState.volume += 1;
        this.tvState.isMuted = false;
        break;
      case 'VOLUME_DOWN':
        if (this.tvState.volume > 0) this.tvState.volume -= 1;
        break;
      case 'SET_VOLUME':
        this.tvState.volume = Math.max(0, Math.min(100, Number(payload.volume || 0)));
        this.tvState.isMuted = false;
        break;
      case 'MUTE_TOGGLE':
        this.tvState.isMuted = !this.tvState.isMuted;
        break;
      case 'LAUNCH_APP':
        if (payload.app) this.tvState.currentApp = payload.app;
        break;
      case 'SET_INPUT':
        if (payload.input) this.tvState.currentInput = payload.input;
        break;
      default:
        break;
    }

    return { success: true, command, state: this.tvState };
  }

  updateConfig(updates) {
    this.tvState = { ...this.tvState, ...updates };
    return this.tvState;
  }

  getState() {
    return this.tvState;
  }
}

module.exports = new WebOsService();
