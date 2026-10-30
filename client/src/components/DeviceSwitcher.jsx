import React from 'react';
import { Wind, Tv, Settings, QrCode, Sparkles, Smartphone, Radio } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

export default function DeviceSwitcher({
  currentDeviceId,
  onSelect,
  onOpenSettings,
  onOpenQr,
  onOpenScenes,
  devices = []
}) {
  const getIcon = (type, category) => {
    if (category === 'AC' || type?.includes('ac') || type?.includes('thinq')) return Wind;
    return Tv;
  };

  return (
    <div className="flex items-center justify-between w-full max-w-5xl mx-auto px-1 sm:px-2 py-1.5 mb-2 gap-2">
      {/* Dynamic Device Switcher Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-inner flex-1 max-w-2xl overflow-x-auto no-scrollbar">
        {devices.length === 0 ? (
          <div className="text-xs text-slate-400 px-3 py-1.5">No devices registered. Click Settings to add one.</div>
        ) : (
          devices.map((device) => {
            const Icon = getIcon(device.type, device.category);
            const isActive = currentDeviceId === device.id;
            const isOnline = device.status === 'ONLINE';
            const isPairing = device.status === 'PAIRING_REQUIRED';

            return (
              <button
                key={device.id}
                onClick={() => {
                  triggerHaptic('light');
                  onSelect(device.id);
                }}
                className={`flex items-center gap-1.5 sm:gap-2 py-2 px-2.5 sm:px-3 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 scale-[1.02]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon size={15} className={isActive ? 'text-white' : 'text-slate-400'} />
                <span>{device.name}</span>

                {/* Status Dot */}
                <span className={`w-2 h-2 rounded-full ${
                  isOnline
                    ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50'
                    : isPairing
                    ? 'bg-amber-400 animate-pulse'
                    : 'bg-slate-600'
                }`} />

                {isPairing && (
                  <span className="text-[9px] bg-amber-500/30 text-amber-300 px-1 py-0.2 rounded font-mono">
                    PAIR
                  </span>
                )}
              </button>
            );
          })
        )}
      </div>

      {/* Action shortcuts */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={() => {
            triggerHaptic('light');
            onOpenScenes();
          }}
          className="flex items-center gap-1.5 p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-all shadow-sm text-xs font-medium"
          title="Scenes & Automation"
        >
          <Sparkles size={15} className="text-indigo-400" />
          <span className="hidden sm:inline">Scenes</span>
        </button>

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
          title="Hub Settings & Devices"
        >
          <Settings size={15} />
        </button>
      </div>
    </div>
  );
}
