const test = require('node:test');
const assert = require('node:assert');

test('Wake-on-LAN: magic packet structure and MAC parsing', () => {
  const mac = 'AA:BB:CC:DD:EE:FF';
  const cleanMac = mac.replace(/[^0-9A-Fa-f]/g, '');
  assert.strictEqual(cleanMac.length, 12, 'Clean MAC should be 12 hex chars');

  const macBuffer = Buffer.from(cleanMac, 'hex');
  assert.strictEqual(macBuffer.length, 6, 'MAC buffer should be 6 bytes');

  // Magic packet construction
  const magicPacket = Buffer.alloc(102);
  for (let i = 0; i < 6; i++) magicPacket[i] = 0xFF;
  for (let i = 0; i < 16; i++) magicPacket.set(macBuffer, 6 + i * 6);

  assert.strictEqual(magicPacket.length, 102, 'Magic packet must be exactly 102 bytes');

  // Verify prefix is 6 0xFF bytes
  for (let i = 0; i < 6; i++) {
    assert.strictEqual(magicPacket[i], 0xFF, `Header byte ${i} must be 0xFF`);
  }

  // Verify 16 repetitions of MAC
  for (let rep = 0; rep < 16; rep++) {
    const offset = 6 + rep * 6;
    const slice = magicPacket.subarray(offset, offset + 6);
    assert.deepStrictEqual(slice, macBuffer, `Repetition ${rep} must match MAC buffer`);
  }
});

test('Subnet Broadcast Calculation: correctly derives broadcast address from IP and Netmask', () => {
  const testCases = [
    { ip: '192.168.1.45', netmask: '255.255.255.0', expected: '192.168.1.255' },
    { ip: '10.0.5.12', netmask: '255.255.0.0', expected: '10.0.255.255' },
    { ip: '172.16.20.100', netmask: '255.255.240.0', expected: '172.16.31.255' }
  ];

  for (const { ip, netmask, expected } of testCases) {
    const ipParts = ip.split('.').map(Number);
    const maskParts = netmask.split('.').map(Number);
    const broadcastParts = ipParts.map((b, i) => (b | (~maskParts[i] & 255)));
    const calculated = broadcastParts.join('.');
    assert.strictEqual(calculated, expected, `Calculated broadcast for ${ip} should be ${expected}`);
  }
});
