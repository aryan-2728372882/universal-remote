const auth = require('../core/Auth');
const eventBus = require('../core/EventBus');
const deviceRegistry = require('../core/DeviceRegistry');
const url = require('url');

function setupWebSocket(wss) {
  wss.on('connection', (ws, req) => {
    const parsedUrl = url.parse(req.url, true);
    const token = parsedUrl.query?.token;

    // Authenticate WS connection if PIN is configured
    if (auth.isConfigured() && !auth.verifyToken(token)) {
      console.log('[WebSocket] Unauthorized connection attempt rejected');
      ws.close(4001, 'Unauthorized');
      return;
    }

    console.log('[WebSocket] Authenticated client connected');

    // Send initial device states and discovery
    ws.send(JSON.stringify({
      type: 'INITIAL_STATE',
      devices: deviceRegistry.getAllDevices()
    }));

    // Forward EventBus events to this client
    const onState = (data) => {
      if (ws.readyState === 1) {
        ws.send(JSON.stringify({ type: 'DEVICE_STATE', ...data }));
      }
    };

    const onDiscovered = (data) => {
      if (ws.readyState === 1) {
        ws.send(JSON.stringify({ type: 'DEVICE_DISCOVERED', ...data }));
      }
    };

    const onPairingPrompt = (data) => {
      if (ws.readyState === 1) {
        ws.send(JSON.stringify({ type: 'PAIRING_PROMPT', ...data }));
      }
    };

    eventBus.on('device_state', onState);
    eventBus.on('device_discovered', onDiscovered);
    eventBus.on('pairing_prompt', onPairingPrompt);

    // Handle incoming commands over WebSocket
    ws.on('message', async (raw) => {
      try {
        const msg = JSON.parse(raw.toString());
        if (msg.type === 'EXECUTE') {
          const { deviceId, capabilityId, value } = msg;
          const result = await deviceRegistry.executeCommand(deviceId, capabilityId, value);
          ws.send(JSON.stringify({ type: 'EXECUTE_RESULT', reqId: msg.reqId, result }));
        }
      } catch (err) {
        console.warn('[WebSocket] Message handling error:', err.message);
      }
    });

    ws.on('close', () => {
      eventBus.off('device_state', onState);
      eventBus.off('device_discovered', onDiscovered);
      eventBus.off('pairing_prompt', onPairingPrompt);
      console.log('[WebSocket] Client disconnected');
    });
  });
}

module.exports = setupWebSocket;
