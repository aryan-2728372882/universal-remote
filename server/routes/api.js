const express = require('express');
const router = express.Router();
const qrcode = require('qrcode');
const pingService = require('../services/pingService');
const thinqService = require('../services/thinqService');
const androidTvService = require('../services/androidTvService');
const webosService = require('../services/webosService');
const discoveryService = require('../services/discoveryService');

// Initial background scan on server start
setTimeout(() => {
  discoveryService.scanNetwork().catch(() => {});
}, 2000);

/**
 * GET /api/devices
 * Returns all configured devices and live status
 */
router.get('/devices', (req, res) => {
  res.json({
    devices: [
      {
        id: 'lg-ac',
        name: 'LG Dual Inverter AC',
        category: 'AC',
        brand: 'LG',
        protocol: 'LG ThinQ Cloud',
        state: thinqService.getAcState(),
        authenticated: thinqService.isAuthenticated
      },
      {
        id: 'lg-tv',
        name: 'LG webOS Smart TV',
        category: 'TV',
        brand: 'LG',
        protocol: thinqService.isAuthenticated ? 'LG ThinQ Cloud' : 'Local webOS SSAP',
        state: webosService.getState()
      },
      {
        id: 'nokia-tv',
        name: 'Nokia Smart Android TV',
        category: 'TV',
        brand: 'Nokia / Android TV',
        protocol: 'Android TV Remote / Companion Bridge',
        state: androidTvService.getState()
      }
    ]
  });
});

/**
 * Wi-Fi Discovery Routes
 */
router.get('/discovery', (req, res) => {
  res.json(discoveryService.getDiscoveredDevices());
});

router.post('/discovery/scan', async (req, res) => {
  try {
    const result = await discoveryService.scanNetwork();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/discovery/add', (req, res) => {
  try {
    const { ip, name, category, type } = req.body;
    const device = discoveryService.addCustomDevice({ ip, name, category, type });
    res.json({ success: true, device });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * POST /api/commands
 * Sends a command to a specific device
 */
router.post('/commands', async (req, res) => {
  const { deviceId, action, value, payload } = req.body;

  if (!deviceId || !action) {
    return res.status(400).json({ error: 'deviceId and action are required' });
  }

  try {
    let result;
    if (deviceId.startsWith('lg-ac')) {
      result = await thinqService.controlAc(action, value);
    } else if (deviceId.startsWith('lg-tv')) {
      result = await webosService.sendCommand(action, { value, ...(payload || {}) });
    } else if (deviceId.startsWith('nokia-tv')) {
      result = await androidTvService.sendCommand(action, payload || { value });
    } else {
      // Default to android TV or webos based on action
      result = await androidTvService.sendCommand(action, payload || { value });
    }

    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Render Keep-Alive Endpoints
 */
router.get('/ping', (req, res) => {
  res.json({
    status: 'ACTIVE',
    service: 'Universal Remote Web Service',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

router.get('/ping/status', (req, res) => {
  res.json(pingService.getStatus());
});

router.post('/ping/configure', (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL required' });
  pingService.setTargetUrl(url);
  res.json({ success: true, status: pingService.getStatus() });
});

/**
 * LG ThinQ Authentication
 */
router.get('/auth/thinq', (req, res) => {
  res.json(thinqService.getStatus());
});

router.post('/auth/thinq', async (req, res) => {
  const { username, password, country } = req.body;
  const result = await thinqService.setCredentials({ username, password, country });
  res.json(result);
});

router.post('/auth/thinq/disconnect', (req, res) => {
  const result = thinqService.disconnect();
  res.json(result);
});

/**
 * TV Specific routes
 */
router.post('/devices/lg-tv/wol', async (req, res) => {
  const result = await webosService.wakeOnLan();
  res.json(result);
});

router.post('/devices/update', (req, res) => {
  const { deviceId, updates } = req.body;
  if (deviceId.startsWith('lg-tv')) {
    res.json(webosService.updateConfig(updates));
  } else if (deviceId.startsWith('nokia-tv')) {
    res.json(androidTvService.updateConfig(updates));
  } else {
    res.status(400).json({ error: 'Unsupported device for direct update' });
  }
});

/**
 * QR Code & Network Info for Mobile
 */
router.get('/network-info', async (req, res) => {
  const host = req.get('host') || 'localhost:3000';
  const protocol = req.protocol;
  const { localIp } = discoveryService.getLocalNetworkInfo();

  // If accessed from localhost or 127.0.0.1, use the real Wi-Fi IP for phone QR scanning
  let mobileUrl = `${protocol}://${host}`;
  if (host.includes('localhost') || host.includes('127.0.0.1')) {
    const port = host.split(':')[1] || '3000';
    mobileUrl = `http://${localIp}:${port}`;
  }

  try {
    const qrDataUrl = await qrcode.toDataURL(mobileUrl, {
      margin: 2,
      width: 250,
      color: { dark: '#000000', light: '#ffffff' }
    });

    res.json({
      url: mobileUrl,
      localIp,
      host,
      isRender: !!process.env.RENDER,
      qrCode: qrDataUrl
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate QR' });
  }
});

module.exports = router;
