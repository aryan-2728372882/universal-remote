const express = require('express');
const http = require('http');
const path = require('path');
const { WebSocketServer } = require('ws');
require('dotenv').config();

const auth = require('./core/Auth');
const store = require('./core/Store');
const deviceRegistry = require('./core/DeviceRegistry');

// Drivers
const LgWebosDriver = require('./drivers/lgWebos');
const AndroidTvDriver = require('./drivers/androidTv');
const LgThinqDriver = require('./drivers/lgThinq');
const MockDriver = require('./drivers/mock');
const SamsungTizenDriver = require('./drivers/samsungTizen');
const RokuDriver = require('./drivers/roku');
const BroadlinkIrDriver = require('./drivers/broadlinkIr');
const TuyaDriver = require('./drivers/tuya');

// Routes
const apiRoutes = require('./routes/api');
const setupWebSocket = require('./routes/ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const PORT = process.env.PORT || 3000;

// Register Hardware & Protocol Drivers
deviceRegistry.registerDriver(LgWebosDriver.type, LgWebosDriver);
deviceRegistry.registerDriver(AndroidTvDriver.type, AndroidTvDriver);
deviceRegistry.registerDriver(LgThinqDriver.type, LgThinqDriver);
deviceRegistry.registerDriver(SamsungTizenDriver.type, SamsungTizenDriver);
deviceRegistry.registerDriver(RokuDriver.type, RokuDriver);
deviceRegistry.registerDriver(BroadlinkIrDriver.type, BroadlinkIrDriver);
deviceRegistry.registerDriver(TuyaDriver.type, TuyaDriver);

// Enable Mock Driver only when explicit flag is passed
if (process.env.ENABLE_MOCK === '1') {
  deviceRegistry.registerDriver(MockDriver.type, MockDriver);
  console.log('[Universal Remote] ENABLE_MOCK=1: Mock driver registered for offline testing.');
}

// Security & Infrastructure Middlewares
const { helmet, cookieParser, authLimiter, apiLimiter } = auth.securityMiddlewares();
app.use(helmet);
app.use(cookieParser);
app.use(express.json());

// Apply rate limiting specifically on auth & general APIs
app.use('/api/auth/login', authLimiter);
app.use('/api', apiLimiter);

// Enforce Session/PIN Authentication
app.use('/api', auth.middleware());

// Mount REST APIs
app.use('/api', apiRoutes);

// Mount WebSocket handler
setupWebSocket(wss);

// Serve Vite frontend in production
const distPath = path.join(__dirname, '../client/dist');
app.use(express.static(distPath));

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
  const indexPath = path.join(distPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(200).send(`
        <!DOCTYPE html>
        <html>
          <head><title>Universal Remote Hub</title></head>
          <body style="font-family:sans-serif;background:#090d16;color:#e2e8f0;padding:40px;text-align:center;">
            <h2>Universal Remote Local Hub Initializing</h2>
            <p>Frontend assets are compiling. Please run <code>npm run build</code> in the root directory.</p>
          </body>
        </html>
      `);
    }
  });
});

// Initialize Device Registry and saved devices
deviceRegistry.init();

// Start Server binding to 0.0.0.0
server.listen(PORT, '0.0.0.0', () => {
  const subnetScan = require('./discovery/subnetScan');
  const nets = subnetScan.getPrivateInterfaces();
  const hostIp = nets[0]?.ip || 'localhost';

  console.log('================================================================');
  console.log('🚀 UNIVERSAL REMOTE LOCAL-FIRST HUB RUNNING');
  console.log(`   Local URL:    http://localhost:${PORT}`);
  console.log(`   Wi-Fi URL:    http://${hostIp}:${PORT}`);
  console.log(`   PIN Security: ${auth.isConfigured() ? 'CONFIGURED' : 'FIRST-RUN SETUP REQUIRED'}`);
  console.log(`   Active Drivers: ${Array.from(deviceRegistry.driverClasses.keys()).join(', ')}`);
  console.log('================================================================');
});
