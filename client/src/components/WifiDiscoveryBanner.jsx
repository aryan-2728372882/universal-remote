import React from 'react';
import { Wifi, RefreshCw, Tv, Wind, AlertCircle, Plus } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

export default function WifiDiscoveryBanner({
  discoveryData,
  onScan,
  onAddDiscoveredDevice,
  isScanning
}) {
  const discovered = discoveryData?.discovered || [];
  const primarySubnet = discoveryData?.primarySubnet || {};

  const handleScanClick = (e) => {
    e.stopPropagation();
    triggerHaptic('medium');
    onScan();
  };

  return (
    <div className="w-full max-w-5xl mx-auto mb-3">
      <div className="p-2 sm:p-3 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-2.5">
        
        {/* Left: Wi-Fi Subnet Status */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2">
            <div className="relative flex h-3 w-3">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                discovered.length > 0 ? 'bg-emerald-400' : 'bg-blue-400'
              }`}></span>
              <span className={`relative inline-flex rounded-full h-3 w-3 ${
                discovered.length > 0 ? 'bg-emerald-500' : 'bg-blue-500'
              }`}></span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white tracking-wide">Local Wi-Fi Network</span>
                <span className="text-[10px] px-2 py-0.2 rounded-full font-mono border bg-slate-950 text-slate-300 border-slate-800">
                  {discovered.length} Discovered
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono hidden sm:block">
                Subnet: {primarySubnet.cidr || `${primarySubnet.ip || '192.168.1.x'}/24`}
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
            <span>{isScanning ? 'Scanning...' : 'Scan Wi-Fi'}</span>
          </button>
        </div>

        {/* Center: Discovered Devices Chips */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto no-scrollbar py-0.5">
          {discovered.length === 0 ? (
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5 px-2 py-1">
              <AlertCircle size={14} className="text-slate-500" />
              <span>mDNS & SSDP listening for devices on same Wi-Fi...</span>
            </div>
          ) : (
            discovered.map((dev, idx) => (
              <button
                key={`${dev.ip}-${idx}`}
                onClick={() => {
                  triggerHaptic('light');
                  onAddDiscoveredDevice(dev);
                }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-950/80 hover:bg-slate-850 hover:border-blue-500/50 text-slate-300 hover:text-white text-xs font-medium transition-all shrink-0 active:scale-95"
                title={`Click to register ${dev.name} (${dev.ip})`}
              >
                <Tv size={14} className="text-blue-400" />
                <span className="font-semibold">{dev.name}</span>
                <span className="text-[9px] font-mono text-slate-500">{dev.ip}</span>
                <span className="p-0.5 rounded bg-blue-600/30 text-blue-300">
                  <Plus size={11} />
                </span>
              </button>
            ))
          )}
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
          <span>{isScanning ? 'Probing Network...' : 'Scan Wi-Fi'}</span>
        </button>

      </div>
    </div>
  );
}
