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
      await triggerNetworkScan();
      const updated = await fetchDiscoveredDevices();
      setDiscoveryData(updated);
    } catch (err) {
      console.warn('Wi-Fi Scan notice:', err.message);
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
        setTimeout(connectWs, 3000);
      };

      ws.onerror = () => {
        ws.close();
      };
    };

    connectWs();

    // Auto-refresh ping status every 30 seconds
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
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'COMMAND',
        deviceId,
        action,
        value,
        payload
      }));
    } else {
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
    <div className="min-h-[100dvh] w-full bg-[#070b14] text-slate-100 flex flex-col items-center justify-between p-2 sm:p-4 lg:p-6 select-none font-sans overflow-x-hidden">
      
      {/* Top Header Bar */}
      <header className="w-full max-w-5xl flex items-center justify-between py-1.5 sm:py-2 mb-1">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-md shadow-blue-400/50 animate-pulse" />
          <h1 className="text-xs sm:text-sm font-extrabold tracking-wider uppercase text-slate-200">
            Universal Smart Remote
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

      {/* Auto-Discovered Wi-Fi Devices Strip */}
      <WifiDiscoveryBanner
        discoveryData={discoveryData}
        onScan={handleScanWifi}
        onSelectDevice={setActiveDeviceId}
        activeDeviceId={activeDeviceId}
        onAddManualDevice={handleAddManualDevice}
      />

      {/* Device Switcher Tab Bar */}
      <DeviceSwitcher
        currentDevice={activeDeviceId}
        onSelect={setActiveDeviceId}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenQr={() => setIsQrOpen(true)}
      />

      {/* Main Responsive Remote Canvas */}
      <main className="w-full flex-1 flex items-center justify-center py-1 sm:py-2">
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

      {/* Footer Info */}
      <footer className="w-full max-w-5xl text-center py-2 text-[10px] sm:text-xs text-slate-500 flex items-center justify-center gap-2">
        <span>Auto-responsive viewport</span>
        <span>•</span>
        <span>Zero-password Wi-Fi Control</span>
        <span>•</span>
        <span className="text-emerald-500 font-medium">Render 24/7 Keep-Alive Active</span>
      </footer>

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
