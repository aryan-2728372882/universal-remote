import React from 'react';
import { Power, Volume2, VolumeX, ChevronUp, ChevronDown, ArrowLeft, Home, Play, Pause, LogOut } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';
import { playTactileClick } from '../utils/audioFeedback';

export default function ElderRemote({ device = {}, onExecute, onExit }) {
  const isAndroidTv =
    device?.type === 'android-tv' ||
    device?.type === 'android_tv' ||
    device?.name?.toLowerCase().includes('android') ||
    device?.name?.toLowerCase().includes('nokia') ||
    true; // By default all modern smart streaming TVs prioritize Home/Back over linear channels

  const handleAction = (capId, val = null) => {
    playTactileClick('heavy');
    triggerHaptic(30);
    if (onExecute && device?.id) {
      onExecute(device.id, capId, val);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-black p-4 sm:p-5 text-white rounded-3xl border-2 border-slate-700 shadow-2xl flex flex-col gap-3 select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-amber-400 font-extrabold font-mono">Elder Mode Active</span>
          <h2 className="text-base font-black text-white truncate max-w-[200px]">{device.name || 'Smart TV'}</h2>
        </div>
        {onExit && (
          <button
            onClick={onExit}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400 text-black font-extrabold text-xs shadow hover:bg-amber-300 active:scale-95 transition-all"
          >
            <LogOut size={14} />
            <span>Exit</span>
          </button>
        )}
      </div>

      {/* 1. Big Power Button */}
      <button
        onClick={() => handleAction('power')}
        className="w-full py-4 rounded-2xl bg-red-600 hover:bg-red-500 border-2 border-white text-white font-black text-lg flex items-center justify-center gap-3 shadow-lg shadow-red-600/30 active:scale-95 transition-all"
      >
        <Power size={26} />
        <span>POWER</span>
      </button>

      {/* 2. Massive Volume & Navigation Blocks (ZERO legacy channels) */}
      <div className="grid grid-cols-2 gap-3 flex-1">
        {/* Volume Column */}
        <div className="flex flex-col gap-2.5">
          <button
            onClick={() => handleAction('volume_up')}
            className="flex-1 py-5 rounded-2xl bg-slate-900 border-2 border-slate-400 hover:border-white text-white flex flex-col items-center justify-center gap-1 active:scale-95 shadow-md"
          >
            <ChevronUp size={36} />
            <span className="text-lg font-black">VOL +</span>
          </button>
          <button
            onClick={() => handleAction('volume_down')}
            className="flex-1 py-5 rounded-2xl bg-slate-900 border-2 border-slate-400 hover:border-white text-white flex flex-col items-center justify-center gap-1 active:scale-95 shadow-md"
          >
            <ChevronDown size={36} />
            <span className="text-lg font-black">VOL -</span>
          </button>
        </div>

        {/* Smart TV Navigation Column: Home & Back (essential for seniors to escape app menus) */}
        <div className="flex flex-col gap-2.5">
          <button
            onClick={() => handleAction('home')}
            className="flex-1 py-5 rounded-2xl bg-cyan-950 border-2 border-cyan-500 hover:border-cyan-300 text-cyan-200 flex flex-col items-center justify-center gap-1 active:scale-95 shadow-md"
          >
            <Home size={34} />
            <span className="text-lg font-black tracking-wide">HOME</span>
          </button>
          <button
            onClick={() => handleAction('back')}
            className="flex-1 py-5 rounded-2xl bg-slate-900 border-2 border-slate-400 hover:border-white text-white flex flex-col items-center justify-center gap-1 active:scale-95 shadow-md"
          >
            <ArrowLeft size={34} />
            <span className="text-lg font-black tracking-wide">BACK</span>
          </button>
        </div>
      </div>

      {/* 3. Bottom Row: Mute, OK, Play/Pause */}
      <div className="grid grid-cols-3 gap-2.5 pt-1">
        <button
          onClick={() => handleAction('mute')}
          className="py-3 rounded-2xl bg-slate-800 border border-slate-600 text-white font-extrabold text-xs flex flex-col items-center justify-center gap-1 active:scale-95"
        >
          <VolumeX size={20} className="text-rose-400" />
          <span>MUTE</span>
        </button>
        <button
          onClick={() => handleAction('dpad_enter')}
          className="py-3 rounded-2xl bg-blue-600 border-2 border-white text-white font-black text-lg flex items-center justify-center shadow-lg active:scale-95"
        >
          <span>OK</span>
        </button>
        <button
          onClick={() => handleAction('media_play_pause')}
          className="py-3 rounded-2xl bg-slate-800 border border-slate-600 text-emerald-400 font-extrabold text-xs flex flex-col items-center justify-center gap-1 active:scale-95"
        >
          <Play size={20} />
          <span>PLAY</span>
        </button>
      </div>
    </div>
  );
}
