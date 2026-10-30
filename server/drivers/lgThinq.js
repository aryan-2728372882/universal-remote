const DeviceDriver = require('../core/DeviceDriver');
const store = require('../core/Store');

/**
 * LG ThinQ Connect REST Driver
 * Connects to LG ThinQ Connect Developer API using Personal Access Token (PAT).
 * Docs: https://smartsolution.developer.lge.com
 */
class LgThinqDriver extends DeviceDriver {
  static type = 'lg_thinq';

  constructor(config = {}) {
    super(config);
    this.deviceId = config.deviceId || config.id;
    this.region = config.region || 'IN'; // Default India
    this.country = config.country || 'IN';
    this.apiBase = config.apiBase || 'https://api-connect.thinq.lge.com/v1';

    // Retrieve encrypted token from store
    this.patToken = store.getEncrypted('thinq_pat_token', null);

    this.state = {
      id: this.id,
      name: this.name || 'LG Dual Inverter AC',
      type: 'lg_thinq',
      category: 'AC',
      status: this.patToken ? 'OFFLINE' : 'NOT_CONFIGURED',
      power: false,
      targetTemp: 24,
      currentTemp: 26,
      humidity: 50,
      mode: 'COOL',
      fanSpeed: 'AUTO',
      vSwing: false,
      hSwing: false,
      jetCool: false,
      hasInternetNotice: true,
      requiresInternet: true,
      lastUpdated: null
    };
  }

  getState() {
    return {
      ...this.state,
      isConfigured: Boolean(this.patToken)
    };
  }

  capabilities() {
    return [
      { id: 'power', kind: 'toggle', label: 'Power', group: 'Power' },
      { id: 'target_temp', kind: 'slider', label: 'Target Temp (°C)', group: 'Climate', range: [16, 30] },
      { id: 'temp_up', kind: 'button', label: 'Temp +', group: 'Climate' },
      { id: 'temp_down', kind: 'button', label: 'Temp -', group: 'Climate' },
      { id: 'mode', kind: 'select', label: 'Mode', group: 'Climate', options: ['COOL', 'DRY', 'FAN', 'HEAT', 'AUTO'] },
      { id: 'fan_speed', kind: 'select', label: 'Fan Speed', group: 'Climate', options: ['LOW', 'MID', 'HIGH', 'AUTO', 'TURBO'] },
      { id: 'v_swing', kind: 'toggle', label: 'Vertical Swing', group: 'Oscillation' },
      { id: 'h_swing', kind: 'toggle', label: 'Horizontal Swing', group: 'Oscillation' },
      { id: 'jet_cool', kind: 'toggle', label: 'Jet Cool (18°C)', group: 'Special' }
    ];
  }

  setToken(patToken, country = 'IN') {
    this.patToken = patToken ? String(patToken).trim() : null;
    this.country = country;
    if (this.patToken) {
      store.setEncrypted('thinq_pat_token', this.patToken);
      store.set('thinq_country', this.country);
      this.state.status = 'CONNECTING';
      this.connect();
    } else {
      store.delete('thinq_pat_token');
      this.state.status = 'NOT_CONFIGURED';
      this.notifyStateChange();
    }
  }

  async connect() {
    if (!this.patToken) {
      this.state.status = 'NOT_CONFIGURED';
      this.notifyStateChange();
      return;
    }

    try {
      await this.fetchRealDeviceState();
    } catch (err) {
      console.log(`[LgThinqDriver] Note: Real ThinQ API check (${this.id}): ${err.message}`);
      this.state.status = 'OFFLINE';
      this.notifyStateChange();
    }
  }

  async fetchRealDeviceState() {
    if (!this.patToken) {
      this.state.status = 'NOT_CONFIGURED';
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(`${this.apiBase}/service/devices/${this.deviceId}/state`, {
      headers: {
        'Authorization': `Bearer ${this.patToken}`,
        'X-Country-Code': this.country,
        'Content-Type': 'application/json'
      },
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      const s = data.state?.airState || data.state || {};
      
      this.state.power = s.operation === 1 || s['airState.operation'] === 1;
      if (s.tempState?.targetTemp) this.state.targetTemp = s.tempState.targetTemp;
      if (s.tempState?.currentTemp) this.state.currentTemp = s.tempState.currentTemp;
      if (s.humidity) this.state.humidity = s.humidity;
      if (s.opMode) this.state.mode = s.opMode;
      if (s.windStrength) this.state.fanSpeed = s.windStrength;

      this.state.status = 'ONLINE';
      this.state.lastUpdated = new Date().toISOString();
      this.notifyStateChange();
    } else {
      this.state.status = 'OFFLINE';
      this.notifyStateChange();
    }
  }

  async execute(capabilityId, value = null) {
    if (!this.patToken) {
      return {
        ok: false,
        error: 'LG ThinQ PAT Token required. Configure token in Settings -> LG ThinQ.'
      };
    }

    try {
      let commandPayload = {};

      if (capabilityId === 'power') {
        const nextPower = typeof value === 'boolean' ? value : !this.state.power;
        commandPayload = { 'airState.operation': nextPower ? 1 : 0 };
        this.state.power = nextPower;
      } else if (capabilityId === 'target_temp') {
        const temp = Math.max(16, Math.min(30, Number(value)));
        commandPayload = { 'airState.tempState.target': temp };
        this.state.targetTemp = temp;
      } else if (capabilityId === 'temp_up') {
        const temp = Math.min(30, this.state.targetTemp + 1);
        commandPayload = { 'airState.tempState.target': temp };
        this.state.targetTemp = temp;
      } else if (capabilityId === 'temp_down') {
        const temp = Math.max(16, this.state.targetTemp - 1);
        commandPayload = { 'airState.tempState.target': temp };
        this.state.targetTemp = temp;
      } else if (capabilityId === 'mode') {
        commandPayload = { 'airState.opMode': value };
        this.state.mode = value;
      } else if (capabilityId === 'fan_speed') {
        commandPayload = { 'airState.windStrength': value };
        this.state.fanSpeed = value;
      } else if (capabilityId === 'v_swing') {
        const swing = !this.state.vSwing;
        commandPayload = { 'airState.windDirection.vStep': swing ? 1 : 0 };
        this.state.vSwing = swing;
      } else if (capabilityId === 'h_swing') {
        const swing = !this.state.hSwing;
        commandPayload = { 'airState.windDirection.hStep': swing ? 1 : 0 };
        this.state.hSwing = swing;
      } else if (capabilityId === 'jet_cool') {
        const jet = !this.state.jetCool;
        commandPayload = { 'airState.miscState.jet': jet ? 1 : 0 };
        this.state.jetCool = jet;
        if (jet) {
          this.state.targetTemp = 18;
          this.state.mode = 'COOL';
        }
      }

      // Dispatch to LG ThinQ Connect Gateway
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(`${this.apiBase}/service/devices/${this.deviceId}/control`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.patToken}`,
          'X-Country-Code': this.country,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(commandPayload),
        signal: controller.signal
      });
      clearTimeout(timeout);

      this.notifyStateChange();
      return { ok: res.ok, state: this.getState() };
    } catch (err) {
      return { ok: false, error: `ThinQ Cloud Gateway error: ${err.message}` };
    }
  }
}

module.exports = LgThinqDriver;
