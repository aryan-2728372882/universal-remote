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
  Mic,
  Keyboard,
  Radio,
  Play,
  Pause
} from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

export default function NokiaTvRemote({ state, onCommand }) {
  const [inputText, setInputText] = useState('');
  const [showKeyboard, setShowKeyboard] = useState(false);

  const isPowerOn = state?.power ?? true;
  const volume = state?.volume ?? 24;
  const isMuted = state?.isMuted ?? false;
  const currentApp = state?.currentApp || 'YouTube';

  const handleAction = (command, payload = {}, hapticType = 'light') => {
    triggerHaptic(hapticType);
    onCommand('nokia-tv', command, null, payload);
  };

  const handleSendText = (e) => {
    e.preventDefault();
    if (!inputText) return;
    handleAction('TYPE_TEXT', { text: inputText });
    setInputText('');
  };

  const apps = [
    { id: 'youtube', label: 'YouTube', color: 'bg-red-950/80 text-red-400 border-red-800/60' },
    { id: 'netflix', label: 'Netflix', color: 'bg-rose-950/80 text-rose-400 border-rose-800/60' },
    { id: 'prime', label: 'Prime', color: 'bg-sky-950/80 text-sky-400 border-sky-800/60' },
    { id: 'hotstar', label: 'Hotstar', color: 'bg-blue-950/80 text-blue-400 border-blue-800/60' }
  ];

  return (
    <div className="w-full max-w-md lg:max-w-xl mx-auto rounded-3xl remote-surface p-4 sm:p-6 text-slate-100 flex flex-col gap-4 sm:gap-5 border border-slate-700/60 shadow-2xl relative transition-all duration-300">
      
      {/* Header with Brand & Connection Status */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold tracking-wider text-base sm:text-lg text-white">NOKIA SMART TV</span>
            <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Connected
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5 font-medium">Android TV • App: {currentApp}</p>
        </div>

        {/* Power Button */}
        <button
          onClick={() => handleAction('POWER', {}, 'heavy')}
          className={`p-3.5 sm:p-4 rounded-2xl transition-all shadow-xl flex items-center justify-center active:scale-95 ${
            isPowerOn
              ? 'bg-rose-600 text-white shadow-rose-600/40 ring-4 ring-rose-500/20'
              : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700'
          }`}
          title="Power Toggle"
        >
          <Power size={22} />
        </button>
      </div>

      {/* Google Assistant Voice and Keyboard Bar */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
        <button
          onClick={() => handleAction('GOOGLE_ASSISTANT', {}, 'medium')}
          className="flex items-center justify-center gap-2 py-3 sm:py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-xs sm:text-sm shadow-md shadow-blue-500/25 active:scale-95"
        >
          <Mic size={18} />
          <span>Google Assistant</span>
        </button>

        <button
          onClick={() => {
            triggerHaptic('light');
            setShowKeyboard(!showKeyboard);
          }}
          className={`flex items-center justify-center gap-2 py-3 sm:py-3.5 rounded-2xl border text-xs sm:text-sm font-semibold transition-all active:scale-95 ${
            showKeyboard
              ? 'bg-blue-950/80 border-blue-500/60 text-blue-300'
              : 'bg-slate-900/90 border-slate-800 text-slate-300 hover:text-white'
          }`}
        >
          <Keyboard size={18} />
          <span>TV Keyboard</span>
        </button>
      </div>

      {/* Virtual Keyboard Drawer */}
      {showKeyboard && (
        <form onSubmit={handleSendText} className="flex gap-2 p-2 bg-slate-950/90 rounded-2xl border border-slate-800 animate-in fade-in duration-150">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type search query or text..."
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 rounded-xl text-xs sm:text-sm font-semibold text-white hover:bg-blue-500 active:scale-95"
          >
            Send
          </button>
        </form>
      )}

      {/* Android TV Circular D-Pad */}
      <div className="flex flex-col items-center my-1 sm:my-2">
        <div className="relative w-48 h-48 sm:w-60 sm:h-60 rounded-full bg-slate-950/90 border border-slate-800 shadow-2xl flex items-center justify-center p-3">
          {/* UP Button */}
          <button
            onClick={() => handleAction('UP')}
            className="absolute top-2 w-20 h-14 flex items-center justify-center text-slate-400 hover:text-white active:scale-95 transition-all"
            title="Up"
          >
            <ChevronUp size={34} />
          </button>

          {/* DOWN Button */}
          <button
            onClick={() => handleAction('DOWN')}
            className="absolute bottom-2 w-20 h-14 flex items-center justify-center text-slate-400 hover:text-white active:scale-95 transition-all"
            title="Down"
          >
            <ChevronDown size={34} />
          </button>

          {/* LEFT Button */}
          <button
            onClick={() => handleAction('LEFT')}
            className="absolute left-2 w-14 h-20 flex items-center justify-center text-slate-400 hover:text-white active:scale-95 transition-all"
            title="Left"
          >
            <ChevronLeft size={34} />
          </button>

          {/* RIGHT Button */}
          <button
            onClick={() => handleAction('RIGHT')}
            className="absolute right-2 w-14 h-20 flex items-center justify-center text-slate-400 hover:text-white active:scale-95 transition-all"
            title="Right"
          >
            <ChevronRight size={34} />
          </button>

          {/* OK / Center Select */}
          <button
            onClick={() => handleAction('OK', {}, 'medium')}
            className="w-22 h-22 sm:w-26 sm:h-26 rounded-full dpad-center border border-slate-700/80 flex flex-col items-center justify-center text-white font-extrabold text-sm sm:text-base tracking-wider shadow-inner active:scale-95"
            title="Select"
          >
            <span>OK</span>
          </button>
        </div>
      </div>

      {/* Android Triad: Back, Home, Mute */}
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
          onClick={() => handleAction('HOME', {}, 'medium')}
          className="flex flex-col items-center justify-center py-3 sm:py-3.5 rounded-2xl remote-btn-primary text-white gap-1 active:scale-95"
          title="Android TV Home"
        >
          <Home size={18} />
          <span className="text-[10px] sm:text-xs font-semibold">Home</span>
        </button>

        <button
          onClick={() => handleAction('MUTE', {}, 'medium')}
          className={`flex flex-col items-center justify-center py-3 sm:py-3.5 rounded-2xl border text-xs gap-1 transition-all active:scale-95 ${
            isMuted
              ? 'bg-rose-950/80 border-rose-500/50 text-rose-400 font-bold'
              : 'bg-slate-900/90 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
          title="Mute / Unmute"
        >
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          <span className="text-[10px] sm:text-xs font-medium">{isMuted ? 'Muted' : 'Mute'}</span>
        </button>
      </div>

      {/* Volume Controls Steppers */}
      <div className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
        <button
          onClick={() => handleAction('VOLUME_DOWN')}
          className="p-3 sm:p-3.5 rounded-xl remote-btn text-slate-200 hover:text-white active:scale-95"
          title="Volume Down"
        >
          <ChevronDown size={22} />
        </button>

        <div className="flex flex-col items-center">
          <span className="text-xl sm:text-2xl font-bold font-mono text-white">{isMuted ? '0' : volume}</span>
          <span className="text-[10px] sm:text-xs uppercase font-semibold text-slate-400 tracking-wider">Volume</span>
        </div>

        <button
          onClick={() => handleAction('VOLUME_UP')}
          className="p-3 sm:p-3.5 rounded-xl remote-btn text-slate-200 hover:text-white active:scale-95"
          title="Volume Up"
        >
          <ChevronUp size={22} />
        </button>
      </div>

      {/* App Shortcuts */}
      <div className="flex flex-col gap-1.5 sm:gap-2">
        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Android TV Apps</label>
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

    </div>
  );
}
