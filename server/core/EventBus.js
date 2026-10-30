const EventEmitter = require('events');

class EventBus extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(100);
  }

  emitDeviceState(deviceId, state) {
    this.emit('device_state', { deviceId, state, timestamp: Date.now() });
  }

  emitDeviceDiscovered(device) {
    this.emit('device_discovered', { device, timestamp: Date.now() });
  }

  emitPairingPrompt(deviceId, promptData) {
    this.emit('pairing_prompt', { deviceId, ...promptData, timestamp: Date.now() });
  }
}

module.exports = new EventBus();
