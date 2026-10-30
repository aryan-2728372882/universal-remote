import React, { useState } from 'react';
import {
  Power,
  Volume2,
  VolumeX,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Home,
  ArrowLeft,
  Menu,
  Play,
  Pause,
  FastForward,
  Rewind,
  Wifi,
  Hash
} from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

export default function LgTvRemote({ state, onCommand, onWakeOnLan }) {
  const [showNumpad, setShowNumpad] = useState(false);
  const isPowerOn = state?.power ?? true;
  const volume = state?.volume ?? 18;
  const isMuted = state?.isMuted ?? false;
  const currentApp = state?.currentApp || 'Netflix';
  const currentInput = state?.currentInput || 'HDMI 1';

  const handleAction = (action, val = null, hapticType = 'light') => {
    triggerHaptic(hapticType);
    onCommand('lg-tv', action, val);
  };

  const apps = [
    { id: 'netflix', label: 'Netflix', color: 'bg-red-950/80 text-red-400 border-red-800/60' },
    { id: 'youtube', label: 'YouTube', color: 'bg-rose-950/80 text-rose-400 border-rose-800/60' },
    { id: 'amazon', label: 'Prime', color: 'bg-sky-950/80 text-sky-400 border-sky-800/60' },
    { id: 'disney', label: 'Disney+', color: 'bg-blue-950/80 text-blue-400 border-blue-800/60' }
  ];

  return (
    <div className="w-full max-w-md lg:max-w-xl mx-auto rounded-3xl remote-surface p-4 sm:p-6 text-slate-100 flex flex-col gap-4 sm:gap-5 border border-slate-700/60 shadow-2xl relative transition-all duration-300">
      
      {/* Remote Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold tracking-wider text-base sm:text-lg text-white">LG webOS TV</span>
            <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Ready
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5 font-medium">Input: {currentInput} • App: {currentApp}</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Wake on LAN button for deep sleep wake */}
          <button
            onClick={() => {
              triggerHaptic('medium');
              onWakeOnLan();
            }}
            className="p-3 sm:p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-blue-400 hover:border-blue-500/50 transition-all shadow-md active:scale-95"
            title="Wake-on-LAN (Wake TV if Sleeping)"
          >
            <Wifi size={18} />
          </button>

          {/* Power toggle */}
          <button
            onClick={() => handleAction('POWER_TOGGLE', null, 'heavy')}
            className={`p-3.5 sm:p-4 rounded-2xl transition-all shadow-xl flex items-center justify-center active:scale-95 ${
              isPowerOn
                ? 'bg-rose-600 text-white shadow-rose-600/40 ring-4 ring-rose-500/20'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700 border border-slate-700'
            }`}
            title="Power Toggle"
          >
            <Power size={22} />
          </button>
        </div>
      </div>

      {/* Volume and Channel Dual Rockers */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 p-3.5 sm:p-5 rounded-3xl bg-slate-950/70 border border-slate-800">
        {/* Volume Column */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-[10px] sm:text-xs font-bold tracking-wider text-slate-400 uppercase">Volume</span>
          <div className="flex flex-col items-center gap-1.5 w-full">
            <button
              onClick={() => handleAction('VOLUME_UP')}
              className="w-full py-3 sm:py-4 rounded-2xl remote-btn flex items-center justify-center text-slate-200 hover:text-white active:scale-95"
            >
              <ChevronUp size={24} />
            </button>

            <button
              onClick={() => handleAction('MUTE_TOGGLE', null, 'medium')}
              className={`w-full py-2.5 sm:py-3 rounded-xl border flex items-center justify-center gap-1.5 text-xs sm:text-sm transition-all active:scale-95 ${
                isMuted
                  ? 'bg-rose-950/80 border-rose-500/50 text-rose-400 font-bold'
                  : 'bg-slate-900/90 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              <span className="font-mono text-xs">{isMuted ? 'MUTED' : volume}</span>
            </button>

            <button
              onClick={() => handleAction('VOLUME_DOWN')}
              className="w-full py-3 sm:py-4 rounded-2xl remote-btn flex items-center justify-center text-slate-200 hover:text-white active:scale-95"
            >
              <ChevronDown size={24} />
            </button>
          </div>
        </div>

        {/* Channel Column */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-[10px] sm:text-xs font-bold tracking-wider text-slate-400 uppercase">Channel</span>
          <div className="flex flex-col items-center gap-1.5 w-full">
            <button
              onClick={() => handleAction('CHANNEL_UP')}
              className="w-full py-3 sm:py-4 rounded-2xl remote-btn flex items-center justify-center text-slate-200 hover:text-white active:scale-95"
            >
              <ChevronUp size={24} />
            </button>

            <button
              onClick={() => {
                triggerHaptic('light');
                setShowNumpad(!showNumpad);
              }}
              className={`w-full py-2.5 sm:py-3 rounded-xl border flex items-center justify-center gap-1.5 text-xs sm:text-sm transition-all active:scale-95 ${
                showNumpad
                  ? 'bg-blue-950/80 border-blue-500/50 text-blue-300 font-bold'
                  : 'bg-slate-900/90 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Hash size={15} />
              <span>123</span>
            </button>

            <button
              onClick={() => handleAction('CHANNEL_DOWN')}
              className="w-full py-3 sm:py-4 rounded-2xl remote-btn flex items-center justify-center text-slate-200 hover:text-white active:scale-95"
            >
              <ChevronDown size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* Optional Numpad Drawer */}
      {showNumpad && (
        <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-950/90 border border-slate-800 animate-in fade-in zoom-in-95 duration-200">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, '.', 0, 'Enter'].map((digit) => (
            <button
              key={digit}
              onClick={() => handleAction('NUMPAD_INPUT', digit)}
              className="py-3 rounded-xl remote-btn text-sm font-semibold text-slate-200 hover:text-white active:scale-95"
            >
              {digit}
            </button>
          ))}
        </div>
      )}

      {/* Responsive Directional Pad (D-PAD) */}
      <div className="flex flex-col items-center my-1 sm:my-2">
        <div className="relative w-48 h-48 sm:w-60 sm:h-60 rounded-full bg-slate-950/90 border border-slate-800 shadow-2xl flex items-center justify-center p-3">
          {/* UP Button */}
          <button
            onClick={() => handleAction('DPAD_UP')}
            className="absolute top-2 w-20 h-14 flex items-center justify-center text-slate-400 hover:text-white active:scale-95 transition-all"
            title="Navigate Up"
          >
            <ChevronUp size={34} />
          </button>

          {/* DOWN Button */}
          <button
            onClick={() => handleAction('DPAD_DOWN')}
            className="absolute bottom-2 w-20 h-14 flex items-center justify-center text-slate-400 hover:text-white active:scale-95 transition-all"
            title="Navigate Down"
          >
            <ChevronDown size={34} />
          </button>

          {/* LEFT Button */}
          <button
            onClick={() => handleAction('DPAD_LEFT')}
            className="absolute left-2 w-14 h-20 flex items-center justify-center text-slate-400 hover:text-white active:scale-95 transition-all"
            title="Navigate Left"
          >
            <ChevronLeft size={34} />
          </button>

          {/* RIGHT Button */}
          <button
            onClick={() => handleAction('DPAD_RIGHT')}
            className="absolute right-2 w-14 h-20 flex items-center justify-center text-slate-400 hover:text-white active:scale-95 transition-all"
            title="Navigate Right"
          >
            <ChevronRight size={34} />
          </button>

          {/* OK Center Click */}
          <button
            onClick={() => handleAction('OK', null, 'medium')}
            className="w-22 h-22 sm:w-26 sm:h-26 rounded-full dpad-center border border-slate-700/80 flex flex-col items-center justify-center text-white font-extrabold text-sm sm:text-base tracking-wider shadow-inner active:scale-95"
            title="OK / Select"
          >
            <span>OK</span>
            <span className="text-[9px] text-slate-400 font-normal">Click</span>
          </button>
        </div>
      </div>

      {/* Navigation Keys: Back, Home, Menu */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <button
          onClick={() => handleAction('BACK')}
          className="flex flex-col items-center justify-center py-3 sm:py-3.5 rounded-2xl remote-btn text-slate-300 hover:text-white gap-1 active:scale-95"
          title="Back"
        >
          <ArrowLeft size={18} />
          <span className="text-[10px] sm:text-xs font-medium">Back</span>
        </button>

        <button
          onClick={() => handleAction('HOME', null, 'medium')}
          className="flex flex-col items-center justify-center py-3 sm:py-3.5 rounded-2xl remote-btn-primary text-white gap-1 active:scale-95"
          title="Home Dashboard"
        >
          <Home size={18} />
          <span className="text-[10px] sm:text-xs font-semibold">Home</span>
        </button>

        <button
          onClick={() => handleAction('MENU')}
          className="flex flex-col items-center justify-center py-3 sm:py-3.5 rounded-2xl remote-btn text-slate-300 hover:text-white gap-1 active:scale-95"
          title="Settings / Menu"
        >
          <Menu size={18} />
          <span className="text-[10px] sm:text-xs font-medium">Menu</span>
        </button>
      </div>

      {/* Quick App Launchers */}
      <div className="flex flex-col gap-1.5 sm:gap-2">
        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Quick App Launch</label>
        <div className="grid grid-cols-4 gap-2">
          {apps.map((app) => (
            <button
              key={app.id}
              onClick={() => handleAction('LAUNCH_APP', { app: app.label })}
              className={`py-2.5 sm:py-3 px-1 rounded-2xl border text-xs sm:text-sm font-semibold transition-all shadow-sm ${app.color} hover:brightness-125 active:scale-95`}
            >
              {app.label}
            </button>
          ))}
        </div>
      </div>

      {/* Media Controls Bar */}
      <div className="grid grid-cols-4 gap-2 p-2 bg-slate-950/80 rounded-2xl border border-slate-800">
        <button
          onClick={() => handleAction('MEDIA_REWIND')}
          className="py-2.5 rounded-xl text-slate-400 hover:text-white flex items-center justify-center active:scale-95"
        >
          <Rewind size={20} />
        </button>
        <button
          onClick={() => handleAction('MEDIA_PLAY')}
          className="py-2.5 rounded-xl text-slate-200 hover:text-white flex items-center justify-center active:scale-95"
        >
          <Play size={20} />
        </button>
        <button
          onClick={() => handleAction('MEDIA_PAUSE')}
          className="py-2.5 rounded-xl text-slate-200 hover:text-white flex items-center justify-center active:scale-95"
        >
          <Pause size={20} />
        </button>
        <button
          onClick={() => handleAction('MEDIA_FAST_FORWARD')}
          className="py-2.5 rounded-xl text-slate-400 hover:text-white flex items-center justify-center active:scale-95"
        >
          <FastForward size={20} />
        </button>
      </div>

    </div>
  );
}
