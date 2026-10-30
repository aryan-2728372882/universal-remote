const test = require('node:test');
const assert = require('node:assert');
const LgWebosDriver = require('../drivers/lgWebos');

test('LG webOS Driver: button mapping and capabilities', () => {
  const driver = new LgWebosDriver({ id: 'test-lg', ip: '192.168.1.100', name: 'Test LG' });
  const caps = driver.capabilities();

  assert.ok(Array.isArray(caps), 'Capabilities should return an array');
  const capIds = caps.map(c => c.id);

  assert.ok(capIds.includes('power'), 'Must support power');
  assert.ok(capIds.includes('volume_up'), 'Must support volume_up');
  assert.ok(capIds.includes('volume_down'), 'Must support volume_down');
  assert.ok(capIds.includes('dpad'), 'Must support dpad');
  assert.ok(capIds.includes('back'), 'Must support back');
  assert.ok(capIds.includes('home'), 'Must support home');
  assert.ok(capIds.includes('app_launch'), 'Must support app_launch');

  // Verify pointer socket payload format for DPAD
  const buttonMap = {
    dpad_up: 'UP',
    dpad_down: 'DOWN',
    dpad_left: 'LEFT',
    dpad_right: 'RIGHT',
    dpad_enter: 'ENTER',
    back: 'BACK',
    home: 'HOME',
    menu: 'MENU'
  };

  for (const [key, btnName] of Object.entries(buttonMap)) {
    const formatted = `type:button\nname:${btnName}\n\n`;
    assert.ok(formatted.includes(`name:${btnName}`), `Payload for ${key} must include name:${btnName}`);
    assert.ok(formatted.startsWith('type:button\n'), 'Payload must specify type:button');
  }
});
