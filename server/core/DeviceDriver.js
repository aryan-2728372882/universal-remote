/**
 * DeviceDriver Base Interface
 * Every device integration inherits from this class.
 */
class DeviceDriver {
  static type = 'base';

  constructor(deviceConfig = {}) {
    this.config = deviceConfig;
    this.id = deviceConfig.id;
    this.name = deviceConfig.name || 'Unnamed Device';
    this.subscribers = new Set();
  }

  /**
   * Static discovery hook called by discovery engine
   */
  static async discover() {
    return [];
  }

  /**
   * Perform pairing handshake (e.g. Android TV PIN or LG TV Prompt)
   * @param {string} deviceId
   * @param {any} input Optional PIN or approval token
   */
  async pair(deviceId, input = null) {
    throw new Error('pair() not implemented for driver ' + this.constructor.type);
  }

  /**
   * Connect to the device hardware
   */
  async connect() {
    throw new Error('connect() not implemented for driver ' + this.constructor.type);
  }

  /**
   * Disconnect from the device hardware
   */
  async disconnect() {
    this.subscribers.clear();
  }

  /**
   * Return real live state (no guessing)
   */
  getState() {
    return {
      id: this.id,
      name: this.name,
      type: this.constructor.type,
      status: 'OFFLINE' // ONLINE | OFFLINE | UNPAIRED | PAIRING_REQUIRED | ERROR
    };
  }

  /**
   * Return list of capabilities that UI dynamically renders
   * Each item: { id, kind: 'button'|'toggle'|'slider'|'select'|'text'|'dpad', label, group?, range?, options? }
   */
  capabilities() {
    return [];
  }

  /**
   * Execute a capability action
   * @param {string} capabilityId
   * @param {any} value
   * @returns {Promise<{ ok: boolean, error?: string, state?: any }>}
   */
  async execute(capabilityId, value = null) {
    throw new Error(`execute(${capabilityId}) not implemented for driver ${this.constructor.type}`);
  }

  /**
   * Subscribe to real state changes
   * @param {(state: any) => void} callback
   */
  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  /**
   * Emit updated state to all subscribers
   */
  notifyStateChange(newState = null) {
    const state = newState || this.getState();
    for (const cb of this.subscribers) {
      try {
        cb(state);
      } catch (err) {
        console.error(`[${this.constructor.type}] Subscriber callback error:`, err);
      }
    }
  }
}

module.exports = DeviceDriver;
