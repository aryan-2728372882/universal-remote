const DeviceDriver = require('../core/DeviceDriver');

/**
 * Broadlink Universal IR/RF Blaster Driver Stub
 * Controls legacy non-smart ACs and TVs via infrared codes over local network.
 * Protocol: UDP packet discovery on port 80/custom AES-128 key.
 */
class BroadlinkIrDriver extends DeviceDriver {
  static type = 'broadlink_ir';

  constructor(config = {}) {
    super(config);
    this.name = config.name || 'Broadlink IR Blaster';
  }

  capabilities() {
    return [
      { id: 'ir_power', kind: 'button', label: 'Send Power IR', group: 'IR' },
      { id: 'ir_temp_up', kind: 'button', label: 'AC Temp +', group: 'IR' },
      { id: 'ir_temp_down', kind: 'button', label: 'AC Temp -', group: 'IR' }
    ];
  }

  async execute(capabilityId, value = null) {
    return { ok: false, error: 'Broadlink IR driver is a stub. Implementation pending.' };
  }
}

module.exports = BroadlinkIrDriver;
