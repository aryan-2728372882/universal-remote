import React, { useState } from 'react';
import {
  Wifi,
  RefreshCw,
  Tv,
  Wind,
  Plus,
  CheckCircle2,
  Clock,
  Radio,
  ChevronDown,
  ChevronUp,
  Sliders,
  AlertCircle
} from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

export default function WifiDiscoveryBanner({
  discoveryData,
  onScan,
  onSelectDevice,
  activeDeviceId,
  onAddManualDevice
}) {
  const [isOpen, setIsOpen] = useState(true);
  const [showManualAdd, setShowManualAdd] = useState(false);
  const [manualIp, setManualIp] = useState('');
  const [manualName, setManualName] = useState('');
  const [manualType, setManualType] = useState('TV');

  const isScanning = discoveryData?.isScanning;
  const devices = discoveryData?.devices || [];
  const networkInfo = discoveryData?.networkInfo || {};

  const handleScanClick = () => {
    triggerHaptic('medium');
    onScan();
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualIp) return;
    triggerHaptic('medium');
    onAddManualDevice({
      ip: manualIp,
      name: manualName || `Smart TV (${manualIp})`,
      category: manualType,
      type: manualType === 'AC' ? 'LG_THINQ_AC' : 'SMART_TV'
    });
    setManualIp('');
    setManualName('');
    setShowManualAdd(false);
  };

  return (
    <div className="w-full max-w-md mx-auto mb-3 px-2">
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden backdrop-blur-md">
        {/* Banner Header */}
        <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-950/80 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400">
              <Wifi size={14} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white">Same Wi-Fi Devices</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-950 text-blue-300 border border-blue-800 font-mono">
                  {devices.length} found
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">
                Subnet: {networkInfo.subnetPrefix ? `${networkInfo.subnetPrefix}0/24` : '192.168.1.0/24'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              disabled={isScanning}
              onClick={handleScanClick}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold shadow-sm transition-all ${
                isScanning
                  ? 'bg-blue-900/60 text-blue-300 border border-blue-700 animate-pulse'
                  : 'bg-blue-600 hover:bg-blue-500 text-white'
              }`}
              title="Scan local Wi-Fi subnet"
            >
              <RefreshCw size={12} className={isScanning ? 'animate-spin' : ''} />
              <span>{isScanning ? 'Scanning...' : 'Scan Wi-Fi'}</span>
            </button>

            <button
              onClick={() => {
                triggerHaptic('light');
                setIsOpen(!isOpen);
              }}
              className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
            >
              {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>
        </div>

        {/* Collapsible Device List */}
        {isOpen && (
          <div className="p-3 flex flex-col gap-2">
            {devices.length === 0 ? (
              <div className="text-center py-4 text-xs text-slate-400 flex flex-col items-center gap-1">
                <Radio size={20} className="text-slate-500 animate-pulse" />
                <span>No devices detected on Wi-Fi yet.</span>
                <button
                  onClick={handleScanClick}
                  className="mt-1 text-blue-400 underline hover:text-blue-300 text-xs font-medium"
                >
                  Click here to scan your home network
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-1.5 max-h-56 overflow-y-auto no-scrollbar">
                {devices.map((device) => {
                  const isAC = device.category === 'AC' || device.deviceType?.includes('AC');
                  const Icon = isAC ? Wind : Tv;
                  const isTargetActive =
                    (isAC && activeDeviceId === 'lg-ac') ||
                    (device.deviceType === 'LG_WEBOS_TV' && activeDeviceId === 'lg-tv') ||
                    (device.deviceType === 'ANDROID_TV' && activeDeviceId === 'nokia-tv') ||
                    activeDeviceId === device.id;

                  return (
                    <div
                      key={device.id}
                      className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                        isTargetActive
                          ? 'bg-blue-950/70 border-blue-500/60 shadow-sm ring-1 ring-blue-500/40'
                          : 'bg-slate-950/70 border-slate-800/80 hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`p-2 rounded-xl shrink-0 ${
                            isAC
                              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                              : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                          }`}
                        >
                          <Icon size={16} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold text-white truncate">
                              {device.name}
                            </span>
                            {isTargetActive && (
                              <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5">
                            <span className="text-blue-300">{device.ip}</span>
                            <span>•</span>
                            <span className="truncate">{device.protocol || device.brand}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          triggerHaptic('medium');
                          if (isAC) {
                            onSelectDevice('lg-ac');
                          } else if (device.deviceType === 'LG_WEBOS_TV' || device.id.includes('lg')) {
                            onSelectDevice('lg-tv');
                          } else {
                            onSelectDevice('nokia-tv');
                          }
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all ${
                          isTargetActive
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
                        }`}
                      >
                        {isTargetActive ? 'Connected' : 'Control'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Quick Manual Add or IP Input */}
            <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[10px] text-slate-400">
                Can't find your TV? Make sure it's turned on.
              </span>
              <button
                onClick={() => {
                  triggerHaptic('light');
                  setShowManualAdd(!showManualAdd);
                }}
                className="text-[11px] text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
              >
                <Plus size={12} />
                <span>Add IP Manually</span>
              </button>
            </div>

            {/* Manual IP Drawer */}
            {showManualAdd && (
              <form
                onSubmit={handleManualSubmit}
                className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-2 mt-1 animate-in fade-in duration-150"
              >
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={manualIp}
                    onChange={(e) => setManualIp(e.target.value)}
                    placeholder="TV IP (e.g. 192.168.1.50)"
                    required
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                  />
                  <select
                    value={manualType}
                    onChange={(e) => setManualType(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="TV">TV</option>
                    <option value="AC">AC</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={manualName}
                    onChange={(e) => setManualName(e.target.value)}
                    placeholder="Device Name (e.g. Living Room Nokia TV)"
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-blue-600 rounded-lg text-xs font-semibold text-white hover:bg-blue-500"
                  >
                    Add Device
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
