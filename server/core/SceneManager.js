const store = require('./Store');
const deviceRegistry = require('./DeviceRegistry');

class SceneManager {
  constructor() {
    this.timer = null;
    this.init();
  }

  init() {
    // Default preset scenes if none exist
    const scenes = store.get('scenes', null);
    if (!scenes) {
      store.set('scenes', [
        {
          id: 'scene-movie-mode',
          name: 'Movie Night',
          icon: 'Film',
          actions: [
            { deviceType: 'lg_webos', capabilityId: 'power', value: true },
            { deviceType: 'lg_webos', capabilityId: 'app_launch', value: 'Netflix' },
            { deviceType: 'lg_webos', capabilityId: 'volume', value: 18 }
          ]
        },
        {
          id: 'scene-leave-home',
          name: 'All Off / Leave Home',
          icon: 'PowerOff',
          actions: [
            { deviceType: 'lg_webos', capabilityId: 'power', value: false },
            { deviceType: 'android_tv', capabilityId: 'power', value: false }
          ]
        }
      ]);
    }

    // Initialize simple schedule runner (checks every minute)
    this.timer = setInterval(() => this.checkSchedules(), 60000);
  }

  getScenes() {
    return store.get('scenes', []);
  }

  saveScene(scene) {
    const scenes = this.getScenes();
    const idx = scenes.findIndex((s) => s.id === scene.id);
    if (idx >= 0) {
      scenes[idx] = scene;
    } else {
      scenes.push({ ...scene, id: scene.id || `scene-${Date.now()}` });
    }
    store.set('scenes', scenes);
    return scenes;
  }

  deleteScene(id) {
    const scenes = this.getScenes().filter((s) => s.id !== id);
    store.set('scenes', scenes);
    return scenes;
  }

  async triggerScene(sceneId) {
    const scene = this.getScenes().find((s) => s.id === sceneId);
    if (!scene) throw new Error(`Scene not found: ${sceneId}`);

    console.log(`[SceneManager] Triggering scene: ${scene.name}`);
    const results = [];

    for (const action of scene.actions) {
      // Find matching device(s) in registry
      const all = deviceRegistry.getAllDevices();
      const target = all.find(
        (d) => d.id === action.deviceId || d.type === action.deviceType
      );

      if (target) {
        try {
          const res = await deviceRegistry.executeCommand(target.id, action.capabilityId, action.value);
          results.push({ deviceId: target.id, ok: res.ok });
        } catch (err) {
          results.push({ deviceId: target.id, ok: false, error: err.message });
        }
      }
    }

    return { ok: true, scene: scene.name, executedActions: results };
  }

  getSchedules() {
    return store.get('schedules', []);
  }

  saveSchedule(schedule) {
    const schedules = this.getSchedules();
    const idx = schedules.findIndex((s) => s.id === schedule.id);
    if (idx >= 0) {
      schedules[idx] = schedule;
    } else {
      schedules.push({ ...schedule, id: schedule.id || `sched-${Date.now()}` });
    }
    store.set('schedules', schedules);
    return schedules;
  }

  deleteSchedule(id) {
    const schedules = this.getSchedules().filter((s) => s.id !== id);
    store.set('schedules', schedules);
    return schedules;
  }

  async checkSchedules() {
    const schedules = this.getSchedules();
    if (schedules.length === 0) return;

    const now = new Date();
    const currentHours = String(now.getHours()).padStart(2, '0');
    const currentMinutes = String(now.getMinutes()).padStart(2, '0');
    const currentTimeStr = `${currentHours}:${currentMinutes}`;
    const currentDay = now.getDay(); // 0 = Sun, 6 = Sat

    for (const s of schedules) {
      if (s.enabled && s.time === currentTimeStr) {
        if (!s.days || s.days.includes(currentDay)) {
          console.log(`[SceneManager] Running scheduled scene: ${s.sceneId}`);
          try {
            await this.triggerScene(s.sceneId);
          } catch (err) {
            console.error(`[SceneManager] Schedule run error:`, err.message);
          }
        }
      }
    }
  }
}

module.exports = new SceneManager();
