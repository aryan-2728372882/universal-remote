const test = require('node:test');
const assert = require('node:assert');
const MockDriver = require('../drivers/mock');

test('Driver Contract: MockDriver adheres to DeviceDriver specification', async () => {
  const driver = new MockDriver({ id: 'test-mock', name: 'Mock Test Device' });

  // 1. Capabilities structure
  const caps = driver.capabilities();
  assert.ok(Array.isArray(caps), 'capabilities() must return array');
  assert.ok(caps.length > 0, 'capabilities() should not be empty');

  for (const cap of caps) {
    assert.ok(cap.id, 'Capability must have id');
    assert.ok(cap.kind, 'Capability must have kind');
    assert.ok(['button', 'toggle', 'slider', 'select', 'text', 'dpad'].includes(cap.kind), `Valid kind: ${cap.kind}`);
    assert.ok(cap.label, 'Capability must have label');
  }

  // 2. State & Subscription
  let stateReceived = null;
  const unsubscribe = driver.subscribe((st) => {
    stateReceived = st;
  });

  // 3. Execution of volume_up
  const initialVol = driver.getState().volume;
  const res = await driver.execute('volume_up');
  assert.strictEqual(res.ok, true, 'Execution should succeed');
  assert.strictEqual(driver.getState().volume, initialVol + 1, 'Volume should have incremented');
  assert.ok(stateReceived, 'State listener should have received notification');

  // 4. Execution of climate temp_down
  const initialTemp = driver.getState().targetTemp;
  await driver.execute('temp_down');
  assert.strictEqual(driver.getState().targetTemp, initialTemp - 1, 'Target temp should have decremented');

  // 5. Execution of toggle mute
  await driver.execute('mute', true);
  assert.strictEqual(driver.getState().isMuted, true, 'isMuted should be true');

  // 6. Execution of app launch
  await driver.execute('app_launch', 'YouTube');
  assert.strictEqual(driver.getState().currentApp, 'YouTube', 'currentApp should be YouTube');

  // 7. Cleanup
  unsubscribe();
  await driver.disconnect();
  assert.strictEqual(driver.getState().status, 'OFFLINE', 'Status after disconnect should be OFFLINE');
});
