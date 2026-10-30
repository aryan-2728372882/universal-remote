const DeviceDriver = require('../core/DeviceDriver');

/**
 * Mock Driver for testing without physical hardware.
 * Clearly marked as MOCK in the UI. Enabled when ENABLE_MOCK=1 or manually configured.
 */
class MockDriver extends DeviceDriver {
  static type = 'mock';

  constructor(config = {}) {
    super(config);
    this.name = config.name || 'Mock Multi-Device (TEST ONLY)';
    this.state = {
      id: this.id,
      name: this.name,
      type: 'mock',
      isMock: true,
      status: 'ONLINE',
      power: true,
      volume: 20,
      isMuted: false,
      currentApp: 'Netflix',
      targetTemp: 22,
      currentTemp: 24,
      mode: 'COOL',
      fanSpeed: 'AUTO',
      vSwing: false,
      hSwing: false,
      lastCommand: null
    };
  }

  async connect() {
    this.state.status = 'ONLINE';
    this.notifyStateChange(this.state);
    return true;
  }

  async disconnect() {
    this.state.status = 'OFFLINE';
    this.state.power = false;
    this.notifyStateChange(this.state);
    await super.disconnect();
  }

  async pair(deviceId, input = null) {
    return { ok: true, message: 'Mock device paired successfully' };
  }

  getState() {
    return {
      ...this.state,
      status: this.state.status
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
      { id: 'target_temp', kind: 'slider', label: 'Target Temp (°C)', group: 'Climate', range: [16, 30] },
      { id: 'temp_up', kind: 'button', label: 'Temp +', group: 'Climate' },
      { id: 'temp_down', kind: 'button', label: 'Temp -', group: 'Climate' },
      { id: 'mode', kind: 'select', label: 'AC Mode', group: 'Climate', options: ['COOL', 'DRY', 'FAN', 'HEAT', 'AUTO'] },
      { id: 'fan_speed', kind: 'select', label: 'Fan Speed', group: 'Climate', options: ['LOW', 'MID', 'HIGH', 'AUTO', 'TURBO'] },
      { id: 'v_swing', kind: 'toggle', label: 'Vertical Swing', group: 'Climate' },
      { id: 'app_launch', kind: 'select', label: 'Launch App', group: 'Apps', options: ['Netflix', 'YouTube', 'Prime Video', 'Disney+'] },
      { id: 'text_input', kind: 'text', label: 'Type Text', group: 'Input' }
    ];
  }

  async execute(capabilityId, value = null) {
    this.state.lastCommand = { capabilityId, value, timestamp: Date.now() };

    switch (capabilityId) {
      case 'power':
        this.state.power = typeof value === 'boolean' ? value : !this.state.power;
        break;
      case 'volume':
        this.state.volume = Math.max(0, Math.min(100, Number(value)));
        this.state.isMuted = false;
        break;
      case 'volume_up':
        if (this.state.volume < 100) this.state.volume += 1;
        this.state.isMuted = false;
        break;
      case 'volume_down':
        if (this.state.volume > 0) this.state.volume -= 1;
        break;
      case 'mute':
        this.state.isMuted = typeof value === 'boolean' ? value : !this.state.isMuted;
        break;
      case 'target_temp':
        this.state.targetTemp = Math.max(16, Math.min(30, Number(value)));
        break;
      case 'temp_up':
        if (this.state.targetTemp < 30) this.state.targetTemp += 1;
        break;
      case 'temp_down':
        if (this.state.targetTemp > 16) this.state.targetTemp -= 1;
        break;
      case 'mode':
        this.state.mode = value;
        break;
      case 'fan_speed':
        this.state.fanSpeed = value;
        break;
      case 'v_swing':
        this.state.vSwing = typeof value === 'boolean' ? value : !this.state.vSwing;
        break;
      case 'app_launch':
        this.state.currentApp = value;
        break;
      default:
        // button or dpad action
        break;
    }

    this.notifyStateChange(this.getState());
    return { ok: true, state: this.getState() };
  }
}

module.exports = MockDriver;
