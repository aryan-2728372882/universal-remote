const express = require('express');
const http = require('http');
const path = require('path');
const cors = require('cors');
const { WebSocketServer } = require('ws');
require('dotenv').config();

const apiRoutes = require('./routes/api');
const pingService = require('./services/pingService');
const androidTvService = require('./services/androidTvService');
const thinqService = require('./services/thinqService');
const webosService = require('./services/webosService');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', apiRoutes);

// WebSocket real-time synchronization
wss.on('connection', (ws, req) => {
  const url = req.url || '';

  // Companion endpoint for Android TV receiver
  if (url.includes('/ws/tv-companion')) {
    androidTvService.registerCompanionSocket(ws);
    return;
  }

  console.log('[WebSocket] Remote client connected');

  // Send initial device states to newly connected client
  ws.send(JSON.stringify({
    type: 'INITIAL_STATE',
    devices: {
      ac: thinqService.getAcState(),
      lgTv: webosService.getState(),
      nokiaTv: androidTvService.getState(),
      keepAlive: pingService.getStatus()
    }
  }));

  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);
      if (data.type === 'COMMAND') {
        const { deviceId, action, value, payload } = data;
        let result;

        if (deviceId === 'lg-ac') {
          result = await thinqService.controlAc(action, value);
        } else if (deviceId === 'lg-tv') {
          result = await webosService.sendCommand(action, { value, ...(payload || {}) });
        } else if (deviceId === 'nokia-tv') {
          result = await androidTvService.sendCommand(action, payload || { value });
        }

        // Broadcast updated state to all connected web clients
        const broadcastMsg = JSON.stringify({
          type: 'STATE_UPDATE',
          deviceId,
          result,
          states: {
            ac: thinqService.getAcState(),
            lgTv: webosService.getState(),
            nokiaTv: androidTvService.getState()
          }
        });

        wss.clients.forEach((client) => {
          if (client.readyState === 1) client.send(broadcastMsg);
        });
      }
    } catch (err) {
      console.warn('[WebSocket] Error processing message:', err.message);
    }
  });

  ws.on('close', () => {
    console.log('[WebSocket] Remote client disconnected');
  });
});

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
          <head>
            <title>Universal Remote API</title>
            <style>
              body { font-family: sans-serif; background: #0f172a; color: #f8fafc; padding: 40px; text-align: center; }
              .card { background: #1e293b; max-width: 600px; margin: 0 auto; padding: 30px; border-radius: 12px; }
              code { background: #334155; padding: 4px 8px; border-radius: 4px; }
            </style>
          </head>
          <body>
            <div class="card">
              <h2>Universal Remote Web Server Running!</h2>
              <p>The client build is currently compiling or needs to be built.</p>
              <p>Run <code>npm run build</code> in the root or start Vite dev server.</p>
              <p>API Endpoint: <a href="/api/devices" style="color: #38bdf8;">/api/devices</a></p>
              <p>Keep-Alive Status: <a href="/api/ping/status" style="color: #38bdf8;">/api/ping/status</a></p>
            </div>
          </body>
        </html>
      `);
    }
  });
});

// Start keep-alive ping engine
pingService.start();

server.listen(PORT, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(`🚀 Universal Remote Server running on http://0.0.0.0:${PORT}`);
  console.log(`   Keep-Alive Engine: ACTIVE (Interval: ${pingService.intervalMinutes}m)`);
  console.log(`   Render Mode: ${process.env.RENDER ? 'YES (Cloud)' : 'Local'}`);
  console.log(`=======================================================`);
});
