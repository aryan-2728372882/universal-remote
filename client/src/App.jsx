import React, { useState, useEffect, useRef } from 'react';
import DeviceSwitcher from './components/DeviceSwitcher';
import CapabilityRemote from './components/CapabilityRemote';
import SettingsModal from './components/SettingsModal';
import ScenesModal from './components/ScenesModal';
import QrModal from './components/QrModal';
import WifiDiscoveryBanner from './components/WifiDiscoveryBanner';
import PinAuthModal from './components/PinAuthModal';
import PairingWizardModal from './components/PairingWizardModal';
import {
  getAuthStatus,
  fetchDevices,
  executeCommand,
  fetchDiscoveredDevices,
  triggerNetworkScan,
  addOrUpdateDevice,
  fetchHubInfo
} from './utils/api';
import { triggerHaptic } from './utils/haptics';
import { WifiOff, RefreshCw, AlertCircle, Sparkles, Shield, Wifi } from 'lucide-react';

export default function App() {
  // Auth state
  const [authStatus, setAuthStatus] = useState({ isConfigured: false, authenticated: false, checked: false });
  
  // Hub connectivity
  const [hubOnline, setHubOnline] = useState(true);
  const [hubInfo, setHubInfo] = useState(null);

  // Devices & Registry
  const [devices, setDevices] = useState([]);
  const [activeDeviceId, setActiveDeviceId] = useState(null);

  // Discovery
  const [discoveryData, setDiscoveryData] = useState({ discovered: [], primarySubnet: null });
  const [isScanning, setIsScanning] = useState(false);

  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isScenesOpen, setIsScenesOpen] = useState(false);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [pairingDevice, setPairingDevice] = useState(null);

  const wsRef = useRef(null);

  // 1. Initial Authentication and Hub Info check
  const checkAuth = async () => {
    try {
      const status = await getAuthStatus();
      setAuthStatus({ ...status, checked: true });
      setHubOnline(true);
      if (status.authenticated) {
        loadHubData();
      }
    } catch (err) {
      console.warn('Auth/Hub connectivity check error:', err.message);
      setHubOnline(false);
      setAuthStatus(prev => ({ ...prev, checked: true }));
    }
  };

  // 2. Load all devices, discovery and hub info
  const loadHubData = async () => {
    try {
      const [devRes, discRes, infoRes] = await Promise.all([
        fetchDevices().catch(() => ({ devices: [] })),
        fetchDiscoveredDevices().catch(() => ({ discovered: [] })),
        fetchHubInfo().catch(() => null)
      ]);

      const deviceList = devRes.devices || [];
      setDevices(deviceList);
      setDiscoveryData(discRes);
      setHubInfo(infoRes);
      setHubOnline(true);

      // Auto-select active device if not chosen or outdated
      if (deviceList.length > 0) {
        setActiveDeviceId((prev) => {
          if (prev && deviceList.some(d => d.id === prev)) return prev;
          // Prefer first ONLINE device
          const onlineDev = deviceList.find(d => d.status === 'ONLINE');
          return onlineDev ? onlineDev.id : deviceList[0].id;
        });
      }
    } catch (err) {
      console.error('Error loading hub data:', err);
    }
  };

  // 3. Setup Authenticated WebSocket
  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (!authStatus.authenticated) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    let reconnectTimer = null;

    const connectWs = () => {
      try {
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          setHubOnline(true);
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);

            if (data.type === 'INITIAL_STATE') {
              if (data.devices) {
                setDevices(data.devices);
              }
            } else if (data.type === 'DEVICE_STATUS') {
              setDevices((prev) =>
                prev.map((d) => (d.id === data.deviceId ? { ...d, status: data.status, error: data.error } : d))
              );
            } else if (data.type === 'DEVICE_STATE') {
              setDevices((prev) =>
                prev.map((d) => (d.id === data.deviceId ? { ...d, ...data.state } : d))
              );
            } else if (data.type === 'DISCOVERY') {
              setDiscoveryData((prev) => {
                if (prev.discovered.some((x) => x.ip === data.device.ip)) return prev;
                return { ...prev, discovered: [...prev.discovered, data.device] };
              });
            } else if (data.type === 'PAIRING_PROMPT') {
              // Open pairing wizard automatically for this device
              const target = devices.find((d) => d.id === data.deviceId);
              if (target) {
                setPairingDevice(target);
              }
            }
          } catch (err) {
            console.warn('WS Message parsing error:', err);
          }
        };

        ws.onclose = () => {
          reconnectTimer = setTimeout(connectWs, 3000);
        };

        ws.onerror = () => {
          ws.close();
        };
      } catch (e) {
        reconnectTimer = setTimeout(connectWs, 3000);
      }
    };

    connectWs();

    const pollInterval = setInterval(loadHubData, 15000);

    return () => {
      clearInterval(pollInterval);
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (wsRef.current) wsRef.current.close();
    };
  }, [authStatus.authenticated]);

  // Handle Command Execution
  const handleExecute = async (deviceId, capabilityId, value = null) => {
    // If WS open, send via WS for sub-millisecond local latency
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'EXECUTE',
          deviceId,
          capabilityId,
          value
        })
      );
    } else {
      try {
        await executeCommand(deviceId, capabilityId, value);
      } catch (err) {
        console.error('Command failed:', err);
      }
    }
  };

  // Handle Scan Network
  const handleScanWifi = async () => {
    setIsScanning(true);
    try {
      await triggerNetworkScan();
      const disc = await fetchDiscoveredDevices();
      setDiscoveryData(disc);
    } catch (err) {
      console.warn('Network scan error:', err);
    } finally {
      setIsScanning(false);
    }
  };

  // Register discovered device
  const handleAddDiscoveredDevice = async (disc) => {
    try {
      const devId = (disc.name || 'device').toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Date.now().toString(36);
      await addOrUpdateDevice({
        id: devId,
        type: disc.deviceType?.toLowerCase().includes('lg') ? 'lg-webos' : 'android-tv',
        name: disc.name,
        config: {
          ip: disc.ip,
          mac: disc.mac
        }
      });
      await loadHubData();
      setActiveDeviceId(devId);
      triggerHaptic('medium');
    } catch (err) {
      alert('Failed to register device: ' + err.message);
    }
  };

  const activeDevice = devices.find((d) => d.id === activeDeviceId);

  // If auth check not complete yet, show sleek splash
  if (!authStatus.checked) {
    return (
      <div className="min-h-[100dvh] w-full bg-[#070b14] flex items-center justify-center text-slate-400 font-mono text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping" />
          <span>Connecting to Local Hub...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] w-full bg-[#070b14] text-slate-100 flex flex-col items-center justify-between p-2 sm:p-4 lg:p-6 select-none font-sans overflow-x-hidden">
      
      {/* 1. Hub Unreachable Warning Banner (Local Network Alert) */}
      {!hubOnline && (
        <div className="w-full max-w-5xl mb-2 p-3 rounded-2xl bg-rose-950/90 border border-rose-800 text-rose-200 text-xs flex items-center justify-between shadow-lg animate-in fade-in">
          <div className="flex items-center gap-2">
            <WifiOff size={16} className="text-rose-400 shrink-0" />
            <span>
              <strong>Not on the same Wi-Fi as the hub:</strong> Ensure your phone or laptop is connected to the same home Wi-Fi network as the hub.
            </span>
          </div>
          <button
            onClick={checkAuth}
            className="px-3 py-1 rounded-xl bg-rose-900 hover:bg-rose-800 text-white font-semibold flex items-center gap-1 shrink-0"
          >
            <RefreshCw size={12} />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* 2. Top Header Bar */}
      <header className="w-full max-w-5xl flex items-center justify-between py-1.5 sm:py-2 mb-1">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${hubOnline ? 'bg-emerald-500 shadow-md shadow-emerald-400/50' : 'bg-rose-500'}`} />
          <h1 className="text-xs sm:text-sm font-extrabold tracking-wider uppercase text-slate-200">
            Universal Smart Remote Hub
          </h1>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
          <span className="hidden sm:inline">Hub IP: {hubInfo?.hostIp || '127.0.0.1'}</span>
          <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-emerald-400 font-semibold">
            LOCAL FIRST
          </span>
        </div>
      </header>

      {/* 3. Auto-Discovered Devices Strip */}
      <WifiDiscoveryBanner
        discoveryData={discoveryData}
        onScan={handleScanWifi}
        onAddDiscoveredDevice={handleAddDiscoveredDevice}
        isScanning={isScanning}
      />

      {/* 4. Dynamic Device Switcher Tabs */}
      <DeviceSwitcher
        currentDeviceId={activeDeviceId}
        onSelect={setActiveDeviceId}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenQr={() => setIsQrOpen(true)}
        onOpenScenes={() => setIsScenesOpen(true)}
        devices={devices}
      />

      {/* 5. Main Canvas: Dynamic Capability Remote */}
      <main className="w-full flex-1 flex items-center justify-center py-2 sm:py-4">
        {devices.length === 0 ? (
          <div className="w-full max-w-md mx-auto p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl text-center flex flex-col items-center gap-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 rounded-2xl bg-blue-950/60 text-blue-400 border border-blue-800/60 shadow-lg">
              <Wifi size={36} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-white">No Registered Devices</h2>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Turn on your LG TV, Nokia TV, or LG AC and click "Scan Wi-Fi" above, or add its IP manually in Settings.
              </p>
            </div>

            <button
              onClick={() => setIsSettingsOpen(true)}
              className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 font-bold text-sm text-white shadow-lg shadow-blue-500/25 active:scale-95 transition-all"
            >
              Open Settings & Add Device
            </button>
          </div>
        ) : activeDevice ? (
          <CapabilityRemote
            device={activeDevice}
            onExecute={handleExecute}
            onPair={(dev) => setPairingDevice(dev)}
          />
        ) : (
          <div className="text-xs text-slate-500">Select a device from the tabs above.</div>
        )}
      </main>

      {/* 6. Footer Info */}
      <footer className="w-full max-w-5xl text-center py-2 text-[10px] sm:text-xs text-slate-500 flex items-center justify-center gap-2">
        <span>Zero-Cloud Local Protocol</span>
        <span>•</span>
        <span>mDNS & SSDP Active</span>
        <span>•</span>
        <span className="text-emerald-500 font-medium">Offline Capable PWA</span>
      </footer>

      {/* 7. PIN Security Modal (If not authenticated) */}
      {!authStatus.authenticated && (
        <PinAuthModal
          isConfigured={authStatus.isConfigured}
          onAuthenticated={checkAuth}
        />
      )}

      {/* 8. Pairing Wizard Modal */}
      <PairingWizardModal
        isOpen={Boolean(pairingDevice)}
        onClose={() => setPairingDevice(null)}
        device={pairingDevice}
        onPaired={loadHubData}
      />

      {/* 9. Hub Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onReload={loadHubData}
        devices={devices}
      />

      {/* 10. Scenes & Schedules Modal */}
      <ScenesModal
        isOpen={isScenesOpen}
        onClose={() => setIsScenesOpen(false)}
      />

      {/* 11. Phone QR Code Modal */}
      <QrModal
        isOpen={isQrOpen}
        onClose={() => setIsQrOpen(false)}
        hubInfo={hubInfo}
      />

    </div>
  );
}
