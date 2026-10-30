import React from 'react';
import { Wifi, RefreshCw, Tv, Wind } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

export default function WifiDiscoveryBanner({
  discoveryData,
  onScan,
  onSelectDevice,
  activeDeviceId
}) {
  const isScanning = discoveryData?.isScanning;
  const devices = discoveryData?.devices || [];
  const networkInfo = discoveryData?.networkInfo || {};

  const onlineCount = devices.filter((d) => d.status === 'ONLINE' || d.isLive).length;
  const offlineCount = devices.filter((d) => d.status === 'OFFLINE' || !d.isLive).length;

  const handleScanClick = (e) => {
    e.stopPropagation();
    triggerHaptic('medium');
    onScan();
  };

  return (
    <div className="w-full max-w-5xl mx-auto mb-3">
      {/* Auto-Discovered Wi-Fi Devices Strip */}
      <div className="p-2 sm:p-3 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-2.5">
        
        {/* Left: Wi-Fi Status Indicator */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2">
            <div className="relative flex h-3 w-3">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                onlineCount > 0 ? 'bg-emerald-400' : 'bg-amber-400'
              }`}></span>
              <span className={`relative inline-flex rounded-full h-3 w-3 ${
                onlineCount > 0 ? 'bg-emerald-500' : 'bg-amber-500'
              }`}></span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white tracking-wide">Same Wi-Fi Network</span>
                <span className={`text-[10px] px-2 py-0.2 rounded-full font-mono border ${
                  onlineCount > 0 
                    ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                    : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}>
                  {onlineCount > 0 ? `${onlineCount} Online` : 'All Devices Switched Off'}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono hidden sm:block">
                Subnet: {networkInfo.subnetPrefix ? `${networkInfo.subnetPrefix}0/24` : '192.168.1.0/24'}
                {offlineCount > 0 && ` • (${offlineCount} off at switch)`}
              </p>
            </div>
          </div>

          <button
            disabled={isScanning}
            onClick={handleScanClick}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold shadow-sm transition-all md:hidden ${
              isScanning
                ? 'bg-blue-900/60 text-blue-300 border border-blue-700 animate-pulse'
                : 'bg-blue-600 hover:bg-blue-500 text-white'
            }`}
          >
            <RefreshCw size={12} className={isScanning ? 'animate-spin' : ''} />
            <span>{isScanning ? 'Probing...' : 'Re-Scan'}</span>
          </button>
        </div>

        {/* Center: Discovered Devices Cards */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto no-scrollbar py-0.5">
          {devices.map((device) => {
            const isAC = device.category === 'AC' || device.deviceType?.includes('AC');
            const Icon = isAC ? Wind : Tv;
            const isLive = device.status === 'ONLINE' || device.isLive;

            const isTargetActive =
              (isAC && activeDeviceId === 'lg-ac') ||
              (device.deviceType === 'LG_WEBOS_TV' && activeDeviceId === 'lg-tv') ||
              (device.deviceType === 'ANDROID_TV' && activeDeviceId === 'nokia-tv') ||
              activeDeviceId === device.id;

            return (
              <button
                key={device.id}
                onClick={() => {
                  triggerHaptic('medium');
                  if (isAC) {
                    onSelectDevice('lg-ac');
                  } else if (device.deviceType === 'LG_WEBOS_TV' || device.name?.toLowerCase().includes('lg')) {
                    onSelectDevice('lg-tv');
                  } else {
                    onSelectDevice('nokia-tv');
                  }
                }}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all shrink-0 ${
                  isTargetActive
                    ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-500/25 scale-[1.02]'
                    : isLive
                    ? 'bg-slate-950/80 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800/80'
                    : 'bg-slate-950/40 border-slate-800/60 text-slate-400 opacity-75 hover:opacity-100 hover:bg-slate-800/50'
                }`}
                title={isLive ? `${device.name} is Online on Wi-Fi` : `${device.name} is switched off from wall`}
              >
                <Icon size={14} className={isTargetActive ? 'text-white' : isAC ? 'text-cyan-400' : 'text-blue-400'} />
                <span className="font-semibold">{device.name.replace(' (Wi-Fi)', '').replace(' Smart TV', ' TV')}</span>
                
                {/* Real-time Status Badge */}
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-mono flex items-center gap-1 ${
                  isTargetActive 
                    ? 'bg-blue-800 text-blue-100'
                    : isLive
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    : 'bg-slate-800 text-rose-300 border border-slate-700'
                }`}>
                  <span className={`w-1 h-1 rounded-full ${isLive ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
                  {isTargetActive ? 'ACTIVE' : isLive ? 'ONLINE' : 'OFF'}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right: Desktop Scan Button */}
        <button
          disabled={isScanning}
          onClick={handleScanClick}
          className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold shadow-sm transition-all ${
            isScanning
              ? 'bg-blue-900/60 text-blue-300 border border-blue-700 animate-pulse'
              : 'bg-blue-600 hover:bg-blue-500 text-white'
          }`}
        >
          <RefreshCw size={12} className={isScanning ? 'animate-spin' : ''} />
          <span>{isScanning ? 'Probing Network...' : 'Re-Scan Wi-Fi'}</span>
        </button>

      </div>
    </div>
  );
}
