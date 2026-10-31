import React from 'react';
import { Gamepad2, SlidersHorizontal, Wand2, Tv } from 'lucide-react';

export default function NavigationDock({ activeTab, onSelectTab }) {
  const tabs = [
    { id: 'remote', label: 'Remote', icon: Gamepad2 },
    { id: 'settings', label: 'Settings', icon: SlidersHorizontal },
    { id: 'voice', label: 'AI Voice', icon: Wand2 },
    { id: 'apps', label: 'Apps', icon: Tv },
  ];

  return (
    <div className="w-full max-w-[420px] mx-auto px-4 pb-2 pt-1">
      <div className="bg-[#0b0f19]/95 border border-white/10 rounded-[28px] p-1.5 flex items-center justify-between shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center py-2 px-2 rounded-[22px] transition-all duration-200 relative ${
                isActive
                  ? 'bg-[#0a2e33] border border-cyan-500/50 text-cyan-300 shadow-[0_0_18px_rgba(6,182,212,0.3)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
              }`}
            >
              <Icon
                size={20}
                className={`transition-transform duration-200 ${
                  isActive ? 'scale-110 text-cyan-400' : 'text-slate-400'
                }`}
              />
              <span
                className={`text-[11px] font-semibold mt-1 tracking-wide ${
                  isActive ? 'text-cyan-300 font-bold' : 'text-slate-400'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
