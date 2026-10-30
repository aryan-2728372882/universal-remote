const DeviceDriver = require('../core/DeviceDriver');

/**
 * Roku TV / Streaming Device Driver Stub
 * Protocol: Roku External Control Protocol (ECP) over HTTP port 8060
 * Docs: https://developer.roku.com/docs/developer-program/dev-tools/external-control-api.md
 */
class RokuDriver extends DeviceDriver {
  static type = 'roku';

  constructor(config = {}) {
    super(config);
    this.name = config.name || 'Roku Streaming Device';
  }

  // TODO: Implement HTTP POST http://<ip>:8060/keypress/<key>
  async connect() {
    return false;
  }

  capabilities() {
    return [
      { id: 'power', kind: 'toggle', label: 'Power', group: 'Power' },
      { id: 'dpad', kind: 'dpad', label: 'Navigation', group: 'Navigation' },
      { id: 'home', kind: 'button', label: 'Home', group: 'Navigation' },
      { id: 'back', kind: 'button', label: 'Back', group: 'Navigation' }
    ];
  }

  async execute(capabilityId, value = null) {
    return { ok: false, error: 'Roku ECP driver is a stub. Implementation pending.' };
  }
}

module.exports = RokuDriver;
