import React from 'react';
import { Wind, Tv, Settings, QrCode } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

export default function DeviceSwitcher({ currentDevice, onSelect, onOpenSettings, onOpenQr }) {
  const devices = [
    { id: 'lg-ac', label: 'LG AC', icon: Wind, badge: 'ThinQ' },
    { id: 'lg-tv', label: 'LG TV', icon: Tv, badge: 'webOS' },
    { id: 'nokia-tv', label: 'Nokia TV', icon: Tv, badge: 'Android TV' }
  ];

  return (
    <div className="flex items-center justify-between w-full max-w-md mx-auto px-2 py-2 mb-3">
      <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-inner">
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
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon size={15} />
              <span>{device.label}</span>
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                isActive ? 'bg-blue-700 text-blue-100' : 'bg-slate-800 text-slate-400'
              }`}>
                {device.badge}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => {
            triggerHaptic('light');
            onOpenQr();
          }}
          className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-all shadow-sm"
          title="Scan QR on Mobile"
        >
          <QrCode size={16} />
        </button>
        <button
          onClick={() => {
            triggerHaptic('light');
            onOpenSettings();
          }}
          className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-all shadow-sm"
          title="Device Settings & Render Keep-Alive"
        >
          <Settings size={16} />
        </button>
      </div>
    </div>
  );
}
