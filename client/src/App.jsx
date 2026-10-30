import React, { useState, useEffect, useRef } from 'react';
import DeviceSwitcher from './components/DeviceSwitcher';
import LgAcRemote from './components/LgAcRemote';
import LgTvRemote from './components/LgTvRemote';
import NokiaTvRemote from './components/NokiaTvRemote';
import KeepAliveBadge from './components/KeepAliveBadge';
import SettingsModal from './components/SettingsModal';
import QrModal from './components/QrModal';
import WifiDiscoveryBanner from './components/WifiDiscoveryBanner';
import {
  fetchDevices,
  sendCommand,
  fetchKeepAliveStatus,
  fetchNetworkInfo,
  fetchDiscoveredDevices,
  triggerNetworkScan,
  addCustomDiscoveredDevice,
  wakeLgTv
} from './utils/api';
import { triggerHaptic } from './utils/haptics';

export default function App() {
  const [activeDeviceId, setActiveDeviceId] = useState('lg-ac'); // 'lg-ac', 'lg-tv', 'nokia-tv'
  const [deviceStates, setDeviceStates] = useState({
    ac: null,
    lgTv: null,
    nokiaTv: null
  });
  const [discoveryData, setDiscoveryData] = useState({
    devices: [],
    isScanning: false,
    networkInfo: {}
  });
  const [keepAliveStatus, setKeepAliveStatus] = useState(null);
  const [networkInfo, setNetworkInfo] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const wsRef = useRef(null);

  // Load initial data
  const loadData = async () => {
    try {
      const devRes = await fetchDevices();
      const acDev = devRes.devices.find((d) => d.id === 'lg-ac');
      const lgTvDev = devRes.devices.find((d) => d.id === 'lg-tv');
      const nokiaDev = devRes.devices.find((d) => d.id === 'nokia-tv');

      setDeviceStates({
        ac: acDev?.state,
        lgTv: lgTvDev?.state,
        nokiaTv: nokiaDev?.state
      });

      const pingRes = await fetchKeepAliveStatus();
      setKeepAliveStatus(pingRes);

      const netRes = await fetchNetworkInfo();
      setNetworkInfo(netRes);

      const discRes = await fetchDiscoveredDevices();
      setDiscoveryData(discRes);
    } catch (err) {
      console.warn('Initial load warning:', err.message);
    }
  };

  // Trigger network scan
  const handleScanWifi = async () => {
    setDiscoveryData((prev) => ({ ...prev, isScanning: true }));
    try {
      const res = await triggerNetworkScan();
      const updated = await fetchDiscoveredDevices();
      setDiscoveryData(updated);
    } catch (err) {
      alert('Wi-Fi Scan failed: ' + err.message);
    } finally {
      setDiscoveryData((prev) => ({ ...prev, isScanning: false }));
    }
  };

  // Add manual device
  const handleAddManualDevice = async (device) => {
    try {
      await addCustomDiscoveredDevice(device);
      const updated = await fetchDiscoveredDevices();
      setDiscoveryData(updated);
      if (device.category === 'AC') {
        setActiveDeviceId('lg-ac');
      } else if (device.name?.toLowerCase().includes('lg')) {
        setActiveDeviceId('lg-tv');
      } else {
        setActiveDeviceId('nokia-tv');
      }
    } catch (err) {
      alert('Failed to add device: ' + err.message);
    }
  };

  // Setup WebSocket for live real-time state synchronization
  useEffect(() => {
    loadData();

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    const connectWs = () => {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'INITIAL_STATE' && data.devices) {
            setDeviceStates({
              ac: data.devices.ac,
              lgTv: data.devices.lgTv,
              nokiaTv: data.devices.nokiaTv
            });
            if (data.devices.keepAlive) setKeepAliveStatus(data.devices.keepAlive);
          } else if (data.type === 'STATE_UPDATE' && data.states) {
            setDeviceStates({
              ac: data.states.ac,
              lgTv: data.states.lgTv,
              nokiaTv: data.states.nokiaTv
            });
          }
        } catch (err) {
          console.warn('WebSocket message error:', err);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        setTimeout(connectWs, 3000); // Reconnect
      };

      ws.onerror = () => {
        ws.close();
      };
    };

    connectWs();

    // Refresh keep-alive status every 30 seconds
    const pingInterval = setInterval(async () => {
      try {
        const pingRes = await fetchKeepAliveStatus();
        setKeepAliveStatus(pingRes);
      } catch {}
    }, 30000);

    return () => {
      clearInterval(pingInterval);
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  // Handle command dispatch
  const handleCommand = async (deviceId, action, value = null, payload = null) => {
    // Optimistic UI updates
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'COMMAND',
        deviceId,
        action,
        value,
        payload
      }));
    } else {
      // Fallback to REST API
      try {
        await sendCommand(deviceId, action, value, payload);
        loadData();
      } catch (err) {
        console.error('Command dispatch error:', err);
      }
    }
  };

  const handleWakeLgTv = async () => {
    try {
      await wakeLgTv();
      alert('Wake-on-LAN magic packet sent to LG TV!');
    } catch (err) {
      alert('WoL error: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col items-center justify-start p-3 sm:p-6 pb-16 select-none font-sans">
      {/* Top Bar with Keep-Alive Status */}
      <header className="w-full max-w-md flex items-center justify-between py-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm shadow-blue-400/50" />
          <h1 className="text-sm font-extrabold tracking-wide uppercase text-slate-200">
            Universal Remote
          </h1>
        </div>

        <KeepAliveBadge
          status={keepAliveStatus}
          onClick={() => {
            triggerHaptic('light');
            setIsSettingsOpen(true);
          }}
        />
      </header>

      {/* Discovered Wi-Fi Devices Banner */}
      <WifiDiscoveryBanner
        discoveryData={discoveryData}
        onScan={handleScanWifi}
        onSelectDevice={setActiveDeviceId}
        activeDeviceId={activeDeviceId}
        onAddManualDevice={handleAddManualDevice}
      />

      {/* Device Switcher Navigation Bar */}
      <DeviceSwitcher
        currentDevice={activeDeviceId}
        onSelect={setActiveDeviceId}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenQr={() => setIsQrOpen(true)}
      />

      {/* Main Remote Body */}
      <main className="w-full flex justify-center">
        {activeDeviceId === 'lg-ac' && (
          <LgAcRemote
            state={deviceStates.ac}
            onCommand={handleCommand}
          />
        )}

        {activeDeviceId === 'lg-tv' && (
          <LgTvRemote
            state={deviceStates.lgTv}
            onCommand={handleCommand}
            onWakeOnLan={handleWakeLgTv}
          />
        )}

        {activeDeviceId === 'nokia-tv' && (
          <NokiaTvRemote
            state={deviceStates.nokiaTv}
            onCommand={handleCommand}
          />
        )}
      </main>

      {/* Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        keepAliveStatus={keepAliveStatus}
        onReload={loadData}
      />

      <QrModal
        isOpen={isQrOpen}
        onClose={() => setIsQrOpen(false)}
        networkInfo={networkInfo}
      />
    </div>
  );
}
