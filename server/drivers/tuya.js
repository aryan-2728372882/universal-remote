const DeviceDriver = require('../core/DeviceDriver');

/**
 * Tuya / Smart Life Local Protocol Driver Stub
 * Protocol: Tuya Local TCP Protocol v3.3/3.4 (Port 6668/6667)
 */
class TuyaDriver extends DeviceDriver {
  static type = 'tuya_local';

  constructor(config = {}) {
    super(config);
    this.name = config.name || 'Tuya Smart Device';
  }

  capabilities() {
    return [
      { id: 'power', kind: 'toggle', label: 'Power', group: 'Power' }
    ];
  }

  async execute(capabilityId, value = null) {
    return { ok: false, error: 'Tuya local driver is a stub. Implementation pending.' };
  }
}

module.exports = TuyaDriver;
