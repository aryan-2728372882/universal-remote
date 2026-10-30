const express = require('express');
const router = express.Router();
const qrcode = require('qrcode');
const auth = require('../core/Auth');
const store = require('../core/Store');
const deviceRegistry = require('../core/DeviceRegistry');
const sceneManager = require('../core/SceneManager');
const subnetScan = require('../discovery/subnetScan');
const mdnsDiscovery = require('../discovery/mdns');
const ssdpDiscovery = require('../discovery/ssdp');

// In-memory discovered cache
let discoveredCache = [];

// Initialize continuous discovery listeners
mdnsDiscovery.start((device) => {
  if (!discoveredCache.some(d => d.ip === device.ip)) {
    discoveredCache.push(device);
  }
});

ssdpDiscovery.start((device) => {
  if (!discoveredCache.some(d => d.ip === device.ip)) {
    discoveredCache.push(device);
  }
});

/**
 * Authentication Endpoints
 */
router.get('/auth/status', (req, res) => {
  const token = req.cookies?.hub_session || req.headers.authorization?.replace(/^Bearer\s+/, '');
  res.json({
    isConfigured: auth.isConfigured(),
    authenticated: auth.verifyToken(token)
  });
});

router.post('/auth/setup', async (req, res) => {
  if (auth.isConfigured()) {
    return res.status(400).json({ error: 'PIN already configured' });
  }

  try {
    const { pin } = req.body;
    const token = await auth.setPin(pin);
    res.cookie('hub_session', token, { httpOnly: true, sameSite: 'strict', maxAge: 30 * 86400000 });
    res.json({ ok: true, token });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/auth/login', async (req, res) => {
  try {
    const { pin } = req.body;
    const token = await auth.verifyPin(pin);
    if (!token) {
      return res.status(401).json({ error: 'INVALID_PIN', message: 'Incorrect PIN' });
    }
    res.cookie('hub_session', token, { httpOnly: true, sameSite: 'strict', maxAge: 30 * 86400000 });
    res.json({ ok: true, token });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/auth/logout', (req, res) => {
  res.clearCookie('hub_session');
  res.json({ ok: true });
});

/**
 * Device Management & Control (Protected)
 */
router.get('/devices', (req, res) => {
  res.json({ devices: deviceRegistry.getAllDevices() });
});

router.post('/devices', (req, res) => {
  try {
    const dev = deviceRegistry.addOrUpdateDevice(req.body);
    res.json({ ok: true, device: dev });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/devices/:id', (req, res) => {
  const ok = deviceRegistry.removeDevice(req.params.id);
  res.json({ ok });
});

router.post('/devices/:id/execute', async (req, res) => {
  const { capabilityId, value } = req.body;
  if (!capabilityId) {
    return res.status(400).json({ error: 'capabilityId is required' });
  }
  const result = await deviceRegistry.executeCommand(req.params.id, capabilityId, value);
  res.json(result);
});

router.post('/devices/:id/pair', async (req, res) => {
  const { input } = req.body;
  const result = await deviceRegistry.pairDevice(req.params.id, input);
  res.json(result);
});

/**
 * Discovery Endpoints
 */
router.get('/discovery', (req, res) => {
  const nets = subnetScan.getPrivateInterfaces();
  res.json({
    discovered: discoveredCache,
    interfaces: nets,
    primarySubnet: nets[0] || null
  });
});

router.post('/discovery/scan', async (req, res) => {
  try {
    const fallbackResults = await subnetScan.scan();
    for (const r of fallbackResults) {
      if (!discoveredCache.some(d => d.ip === r.ip)) {
        discoveredCache.push(r);
      }
    }
    res.json({ ok: true, discovered: discoveredCache });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Scenes & Schedules
 */
router.get('/scenes', (req, res) => {
  res.json({ scenes: sceneManager.getScenes() });
});

router.post('/scenes', (req, res) => {
  res.json({ scenes: sceneManager.saveScene(req.body) });
});

router.delete('/scenes/:id', (req, res) => {
  res.json({ scenes: sceneManager.deleteScene(req.params.id) });
});

router.post('/scenes/:id/trigger', async (req, res) => {
  try {
    const result = await sceneManager.triggerScene(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/schedules', (req, res) => {
  res.json({ schedules: sceneManager.getSchedules() });
});

router.post('/schedules', (req, res) => {
  res.json({ schedules: sceneManager.saveSchedule(req.body) });
});

router.delete('/schedules/:id', (req, res) => {
  res.json({ schedules: sceneManager.deleteSchedule(req.params.id) });
});

/**
 * Hub Info & Settings
 */
router.get('/hub/info', async (req, res) => {
  const nets = subnetScan.getPrivateInterfaces();
  const hostIp = nets[0]?.ip || '127.0.0.1';
  const port = process.env.PORT || 3000;
  const hubUrl = `http://${hostIp}:${port}`;

  let qrCode = null;
  try {
    qrCode = await qrcode.toDataURL(hubUrl, { margin: 2, width: 220 });
  } catch {}

  res.json({
    hubUrl,
    hostIp,
    port,
    qrCode,
    platform: process.platform,
    nodeVersion: process.version,
    uptime: Math.floor(process.uptime()),
    hasThinqPat: Boolean(store.getEncrypted('thinq_pat_token'))
  });
});

router.post('/hub/thinq', (req, res) => {
  const { patToken, country = 'IN' } = req.body;
  if (patToken) {
    store.setEncrypted('thinq_pat_token', patToken.trim());
    store.set('thinq_country', country);
  } else {
    store.delete('thinq_pat_token');
  }

  // Update any existing thinq driver instances
  const thinqInstance = deviceRegistry.getDevice('lg-ac-thinq');
  if (thinqInstance && thinqInstance.setToken) {
    thinqInstance.setToken(patToken, country);
  }

  res.json({ ok: true, hasToken: Boolean(patToken) });
});

module.exports = router;
