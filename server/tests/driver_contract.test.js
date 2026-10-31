const test = require('node:test');
const assert = require('node:assert');
const LgWebosDriver = require('../drivers/lgWebos');
const AndroidTvDriver = require('../drivers/androidTv');
const RokuDriver = require('../drivers/roku');
const SamsungTizenDriver = require('../drivers/samsungTizen');
const TuyaDriver = require('../drivers/tuya');
const BroadlinkIrDriver = require('../drivers/broadlinkIr');

const drivers = [
  { name: 'LG webOS Driver', cls: LgWebosDriver, config: { id: 'test-lg-webos', ip: '192.168.1.50' } },
  { name: 'Android TV Driver', cls: AndroidTvDriver, config: { id: 'test-android-tv', ip: '192.168.1.60' } },
  { name: 'Roku Driver', cls: RokuDriver, config: { id: 'test-roku', ip: '192.168.1.70' } },
  { name: 'Samsung Tizen Driver', cls: SamsungTizenDriver, config: { id: 'test-samsung', ip: '192.168.1.80' } },
  { name: 'Tuya Driver', cls: TuyaDriver, config: { id: 'test-tuya', ip: '192.168.1.90', localKey: 'key', devId: 'dev' } },
  { name: 'Broadlink IR Driver', cls: BroadlinkIrDriver, config: { id: 'test-broadlink', ip: '192.168.1.100', mac: 'AA:BB:CC:DD:EE:FF' } },
];

for (const { name, cls, config } of drivers) {
  test(`Driver Contract: ${name} adheres to DeviceDriver specification`, () => {
    const driver = new cls(config);

    // 1. Static type
    assert.ok(typeof cls.type === 'string' && cls.type.length > 0, `${name} must declare a static type string`);

    // 2. Capabilities structure
    const caps = driver.capabilities();
    assert.ok(Array.isArray(caps), `${name} capabilities() must return array`);
    assert.ok(caps.length > 0, `${name} capabilities() should not be empty`);

    for (const cap of caps) {
      assert.ok(cap.id, `${name}: Capability must have id`);
      assert.ok(cap.kind, `${name}: Capability must have kind`);
      assert.ok(
        ['button', 'toggle', 'slider', 'select', 'text', 'dpad'].includes(cap.kind),
        `${name}: Valid kind: ${cap.kind}`
      );
      assert.ok(cap.label, `${name}: Capability must have label`);
    }

    // 3. State & Subscription contract
    const state = driver.getState();
    assert.ok(state, `${name} getState() must return an object`);
    assert.strictEqual(state.id, config.id, `${name} state.id must match config.id`);

    let notified = false;
    const unsub = driver.subscribe(() => {
      notified = true;
    });
    driver.notifyStateChange();
    assert.strictEqual(notified, true, `${name} subscriber must be notified on state update`);
    unsub();
  });
}
