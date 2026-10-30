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
import { WifiOff, RefreshCw, Power, Sparkles, Tv, Wind } from 'lucide-react';

export default function App() {
  const [activeDeviceId, setActiveDeviceId] = useState(null); // null by default if no devices online
  const [isDemoMode, setIsDemoMode] = useState(false);
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
      const discRes = await fetchDiscoveredDevices();
      setDiscoveryData(discRes);

      const liveList = discRes.devices || [];
      if (liveList.length > 0 && !activeDeviceId) {
        // Auto-select first real online device
        const first = liveList[0];
        if (first.category === 'AC' || first.deviceType?.includes('AC')) {
          setActiveDeviceId('lg-ac');
        } else if (first.deviceType === 'LG_WEBOS_TV' || first.name?.toLowerCase().includes('lg')) {
          setActiveDeviceId('lg-tv');
        } else {
          setActiveDeviceId('nokia-tv');
        }
      }

      const pingRes = await fetchKeepAliveStatus();
      setKeepAliveStatus(pingRes);

      const netRes = await fetchNetworkInfo();
      setNetworkInfo(netRes);
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

      const liveList = updated.devices || [];
      if (liveList.length > 0) {
        const first = liveList[0];
        if (first.category === 'AC' || first.deviceType?.includes('AC')) {
          setActiveDeviceId('lg-ac');
        } else if (first.deviceType === 'LG_WEBOS_TV' || first.name?.toLowerCase().includes('lg')) {
          setActiveDeviceId('lg-tv');
        } else {
          setActiveDeviceId('nokia-tv');
        }
      } else if (!isDemoMode) {
        setActiveDeviceId(null);
      }
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

  const liveDevices = discoveryData.devices || [];
  const hasActiveDevices = liveDevices.length > 0 || isDemoMode;

  return (
    <div className="min-h-[100dvh] w-full bg-[#070b14] text-slate-100 flex flex-col items-center justify-between p-2 sm:p-4 lg:p-6 select-none font-sans overflow-x-hidden">
      
      {/* Top Header Bar */}
      <header className="w-full max-w-5xl flex items-center justify-between py-1.5 sm:py-2 mb-1">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${hasActiveDevices ? 'bg-blue-500 shadow-md shadow-blue-400/50 animate-pulse' : 'bg-slate-600'}`} />
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

      {/* Device Switcher Tab Bar (ONLY shown when devices are detected or in demo mode) */}
      <DeviceSwitcher
        currentDevice={activeDeviceId}
        onSelect={setActiveDeviceId}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenQr={() => setIsQrOpen(true)}
        availableDevices={liveDevices}
        isDemoMode={isDemoMode}
      />

      {/* Main Canvas */}
      <main className="w-full flex-1 flex items-center justify-center py-2 sm:py-4">
        
        {/* CASE 1: No devices detected online & not in demo mode */}
        {!hasActiveDevices ? (
          <div className="w-full max-w-md mx-auto p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl text-center flex flex-col items-center gap-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 rounded-2xl bg-rose-950/60 text-rose-400 border border-rose-800/60 shadow-lg">
              <WifiOff size={36} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-white">No Connected Devices Found</h2>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                All your devices (LG AC, LG TV, Nokia TV) are currently switched off from the wall socket.
              </p>
            </div>

            <div className="w-full p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-left text-xs text-slate-300 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-600/30 text-blue-400 flex items-center justify-center font-bold text-[11px]">1</span>
                <span>Turn ON the power switch on your TV or AC</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-600/30 text-blue-400 flex items-center justify-center font-bold text-[11px]">2</span>
                <span>Wait ~10 seconds for it to reconnect to Wi-Fi</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-600/30 text-blue-400 flex items-center justify-center font-bold text-[11px]">3</span>
                <span>Click the button below to detect and control it</span>
              </div>
            </div>

            <button
              onClick={handleScanWifi}
              disabled={discoveryData.isScanning}
              className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 font-bold text-sm text-white shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <RefreshCw size={16} className={discoveryData.isScanning ? 'animate-spin' : ''} />
              <span>{discoveryData.isScanning ? 'Scanning Home Wi-Fi...' : 'Scan Wi-Fi Now'}</span>
            </button>

            <button
              onClick={() => {
                triggerHaptic('light');
                setIsDemoMode(true);
                setActiveDeviceId('lg-ac');
              }}
              className="text-xs text-slate-500 hover:text-slate-300 underline transition-all pt-1"
            >
              Preview Remote in Offline Test Mode
            </button>
          </div>
        ) : (
          /* CASE 2: Live device selected */
          <>
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
          </>
        )}

      </main>

      {/* Footer Info */}
      <footer className="w-full max-w-5xl text-center py-2 text-[10px] sm:text-xs text-slate-500 flex items-center justify-center gap-2">
        <span>Wi-Fi Live Device Detection</span>
        <span>•</span>
        <span>Zero-password Control</span>
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
