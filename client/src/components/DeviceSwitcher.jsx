import React from 'react';
import { Wind, Tv, Settings, QrCode } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

export default function DeviceSwitcher({ currentDevice, onSelect, onOpenSettings, onOpenQr }) {
  const devices = [
    { id: 'lg-ac', label: 'LG Inverter AC', short: 'LG AC', icon: Wind, badge: 'Wi-Fi' },
    { id: 'lg-tv', label: 'LG webOS TV', short: 'LG TV', icon: Tv, badge: 'webOS' },
    { id: 'nokia-tv', label: 'Nokia Smart TV', short: 'Nokia TV', icon: Tv, badge: 'Android TV' }
  ];

  return (
    <div className="flex items-center justify-between w-full max-w-5xl mx-auto px-1 sm:px-2 py-1.5 mb-2 gap-2">
      {/* Device Switcher Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-inner flex-1 max-w-md sm:max-w-lg">
        {devices.map((device) => {
          const Icon = device.icon;
          const isActive = currentDevice === device.id;
          return (
            <button
              key={device.id}
              onClick={() => {
                triggerHaptic('light');
                onSelect(device.id);
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2 px-2 sm:px-3 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 scale-[1.02]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon size={15} className={isActive ? 'text-white' : 'text-slate-400'} />
              <span className="hidden sm:inline">{device.label}</span>
              <span className="inline sm:hidden">{device.short}</span>
              <span className={`text-[9px] px-1.5 py-0.2 rounded-full hidden xs:inline ${
                isActive ? 'bg-blue-700 text-blue-100' : 'bg-slate-800 text-slate-400'
              }`}>
                {device.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* Action shortcuts */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={() => {
            triggerHaptic('light');
            onOpenQr();
          }}
          className="flex items-center gap-1.5 p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-all shadow-sm text-xs font-medium"
          title="Open on Mobile via QR"
        >
          <QrCode size={15} />
          <span className="hidden sm:inline">Phone QR</span>
        </button>
        <button
          onClick={() => {
            triggerHaptic('light');
            onOpenSettings();
          }}
          className="p-2 sm:p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-all shadow-sm"
          title="Settings & Cloud Keep-Alive"
        >
          <Settings size={15} />
        </button>
      </div>
    </div>
  );
}
