const test = require('node:test');
const assert = require('node:assert');
const auth = require('../core/Auth');

test('Auth: PIN validation and session verification', async () => {
  // 1. PIN length check
  await assert.rejects(
    async () => {
      await auth.setPin('12');
    },
    { message: 'PIN must be at least 4 digits' }
  );

  // 2. Set valid PIN
  const testPin = '9876';
  const token = await auth.setPin(testPin);
  assert.ok(token, 'Setting PIN should return a session token');
  assert.strictEqual(auth.isConfigured(), true, 'Auth should now be configured');

  // 3. Verify valid token
  assert.strictEqual(auth.verifyToken(token), true, 'Valid token should verify true');

  // 4. Verify invalid token
  assert.strictEqual(auth.verifyToken('invalid.jwt.token'), false, 'Invalid token should return false');
  assert.strictEqual(auth.verifyToken(''), false, 'Empty token should return false');

  // 5. Verify correct PIN login
  const loginToken = await auth.verifyPin(testPin);
  assert.ok(loginToken, 'Correct PIN should return valid token');
  assert.strictEqual(auth.verifyToken(loginToken), true);

  // 6. Verify incorrect PIN login
  const failToken = await auth.verifyPin('0000');
  assert.strictEqual(failToken, null, 'Incorrect PIN should return null');
});
