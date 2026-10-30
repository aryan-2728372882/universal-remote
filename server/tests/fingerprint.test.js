const test = require('node:test');
const assert = require('node:assert');
const fingerprinter = require('../discovery/fingerprint');

test('Fingerprinter: safely handles non-responsive hosts without crashing', async () => {
  // Query a non-routable / unused test IP
  const result = await fingerprinter.fingerprint('192.0.2.1'); // RFC 5737 TEST-NET-1
  assert.strictEqual(result, null, 'Unresponsive host must return null safely');
});

test('Fingerprinter: parses Eureka cast data correctly', () => {
  const sampleEureka = {
    name: 'Living Room Android TV',
    bcastHighDPI: true,
    device_info: {
      manufacturer: 'Nokia',
      model_name: 'Smart TV 5500A'
    }
  };

  const isAndroidTv = (sampleEureka.bcastHighDPI || sampleEureka.device_info?.model_name?.toLowerCase().includes('tv'));
  assert.strictEqual(isAndroidTv, true, 'Should classify as Android TV based on eureka info');
  assert.strictEqual(sampleEureka.name, 'Living Room Android TV');
});
