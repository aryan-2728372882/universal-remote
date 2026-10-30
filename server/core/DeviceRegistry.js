const store = require('./Store');
const eventBus = require('./EventBus');

class DeviceRegistry {
  constructor() {
    this.driverClasses = new Map();
    this.activeInstances = new Map();
    this.pollInterval = null;
    this.isPolling = false;
  }

  registerDriver(type, DriverClass) {
    this.driverClasses.set(type, DriverClass);
    console.log(`[DeviceRegistry] Registered driver for type: ${type}`);
  }

  getDriverClass(type) {
    return this.driverClasses.get(type);
  }

  init() {
    // Load persisted devices from Store
    const savedDevices = store.get('devices', []);
    console.log(`[DeviceRegistry] Loading ${savedDevices.length} saved devices...`);

    for (const dev of savedDevices) {
      this.initDeviceInstance(dev);
    }

    // Start background health check (every 30 seconds)
    this.startHealthPolling();
  }

  initDeviceInstance(devConfig) {
    try {
      const DriverClass = this.driverClasses.get(devConfig.type);
      if (!DriverClass) {
        console.warn(`[DeviceRegistry] No driver found for type "${devConfig.type}" (device: ${devConfig.id})`);
        return null;
      }

      // If instance already exists, disconnect first
      if (this.activeInstances.has(devConfig.id)) {
        try {
          this.activeInstances.get(devConfig.id).disconnect();
        } catch {}
      }

      const instance = new DriverClass(devConfig);
      
      // Wire driver state notifications to EventBus
      instance.subscribe((state) => {
        eventBus.emitDeviceState(devConfig.id, state);
      });

      this.activeInstances.set(devConfig.id, instance);

      // Connect asynchronously with error isolation
      instance.connect().catch((err) => {
        console.log(`[DeviceRegistry] Background connect note for ${devConfig.name} (${devConfig.id}): ${err.message}`);
      });

      return instance;
    } catch (err) {
      console.error(`[DeviceRegistry] Failed to initialize device ${devConfig.id}:`, err.message);
      return null;
    }
  }

  getDevice(id) {
    return this.activeInstances.get(id) || null;
  }

  getAllDevices() {
    const list = [];
    for (const [id, instance] of this.activeInstances.entries()) {
      try {
        const state = instance.getState();
        const capabilities = instance.capabilities();
        list.push({
          ...state,
          capabilities,
          config: {
            ip: instance.config.ip,
            mac: instance.config.mac,
            type: instance.config.type
          }
        });
      } catch (err) {
        console.warn(`[DeviceRegistry] Failed to get state for ${id}:`, err.message);
      }
    }
    return list;
  }

  addOrUpdateDevice(deviceData) {
    if (!deviceData.id || !deviceData.type) {
      throw new Error('Device id and type are required');
    }

    const savedDevices = store.get('devices', []);
    const existingIndex = savedDevices.findIndex((d) => d.id === deviceData.id);

    if (existingIndex >= 0) {
      savedDevices[existingIndex] = { ...savedDevices[existingIndex], ...deviceData };
    } else {
      savedDevices.push(deviceData);
    }

    store.set('devices', savedDevices);

    // Initialize or re-initialize driver instance
    const instance = this.initDeviceInstance(deviceData);
    return instance ? instance.getState() : null;
  }

  removeDevice(id) {
    if (this.activeInstances.has(id)) {
      try {
        this.activeInstances.get(id).disconnect();
      } catch {}
      this.activeInstances.delete(id);
    }

    const savedDevices = store.get('devices', []);
    const filtered = savedDevices.filter((d) => d.id !== id);
    store.set('devices', filtered);
    return true;
  }

  async executeCommand(deviceId, capabilityId, value = null) {
    const instance = this.activeInstances.get(deviceId);
    if (!instance) {
      return { ok: false, error: `Device not found or not registered: ${deviceId}` };
    }

    try {
      const result = await instance.execute(capabilityId, value);
      // Immediately broadcast new state if available
      if (result && result.state) {
        eventBus.emitDeviceState(deviceId, result.state);
      }
      return result;
    } catch (err) {
      console.error(`[DeviceRegistry] Error executing ${capabilityId} on ${deviceId}:`, err.message);
      return { ok: false, error: err.message };
    }
  }

  async pairDevice(deviceId, input = null) {
    const instance = this.activeInstances.get(deviceId);
    if (!instance) {
      return { ok: false, error: `Device not found: ${deviceId}` };
    }

    try {
      const res = await instance.pair(deviceId, input);
      return res;
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }

  startHealthPolling() {
    if (this.pollInterval) return;

    this.pollInterval = setInterval(async () => {
      for (const [id, instance] of this.activeInstances.entries()) {
        try {
          // If device status is OFFLINE or UNREACHABLE, attempt non-blocking reconnect
          const state = instance.getState();
          if (state.status === 'OFFLINE' || state.status === 'UNREACHABLE') {
            instance.connect().catch(() => {});
          }
        } catch {}
      }
    }, 30000);
  }

  stop() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
    for (const instance of this.activeInstances.values()) {
      try {
        instance.disconnect();
      } catch {}
    }
    this.activeInstances.clear();
  }
}

module.exports = new DeviceRegistry();
