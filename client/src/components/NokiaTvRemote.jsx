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
  Tv,
  Play,
  Pause,
  FastForward,
  Rewind,
  Keyboard,
  Info,
  Radio
} from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

export default function NokiaTvRemote({ state, onCommand }) {
  const [inputText, setInputText] = useState('');
  const [showKeyboard, setShowKeyboard] = useState(false);

  const isPowerOn = state?.power;
  const volume = state?.volume ?? 24;
  const isMuted = state?.isMuted ?? false;
  const currentApp = state?.currentApp || 'YouTube';
  const hasCompanion = state?.hasActiveCompanion;

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
    <div className="w-full max-w-sm mx-auto rounded-3xl remote-surface p-5 text-slate-100 flex flex-col gap-5 border border-slate-700/60 shadow-2xl relative">
      {/* Header with Nokia Brand & Google TV indicator */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold tracking-wider text-base text-white">NOKIA SMART TV</span>
            <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              Android TV
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">Active App: {currentApp}</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Cloud Companion Bridge Status Pill */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] border ${
              hasCompanion
                ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
            title={hasCompanion ? 'TV Companion Connected to Cloud' : 'Cloud Relay Ready'}
          >
            <Radio size={12} className={hasCompanion ? 'animate-pulse text-emerald-400' : ''} />
            <span>{hasCompanion ? 'Live' : 'Relay'}</span>
          </div>

          {/* Power Button */}
          <button
            onClick={() => handleAction('POWER', {}, 'heavy')}
            className={`p-3.5 rounded-2xl transition-all shadow-lg flex items-center justify-center ${
              isPowerOn
                ? 'bg-rose-600 text-white shadow-rose-600/40 ring-4 ring-rose-500/20'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700'
            }`}
            title="Power Toggle"
          >
            <Power size={20} />
          </button>
        </div>
      </div>

      {/* Google Assistant Voice and Keyboard Bar */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          onClick={() => handleAction('GOOGLE_ASSISTANT', {}, 'medium')}
          className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-xs shadow-md shadow-blue-500/20"
        >
          <Mic size={16} />
          <span>Google Assistant</span>
        </button>

        <button
          onClick={() => {
            triggerHaptic('light');
            setShowKeyboard(!showKeyboard);
          }}
          className={`flex items-center justify-center gap-2 py-3 rounded-2xl border text-xs font-semibold transition-all ${
            showKeyboard
              ? 'bg-blue-950/80 border-blue-500/60 text-blue-300'
              : 'bg-slate-900/90 border-slate-800 text-slate-300 hover:text-white'
          }`}
        >
          <Keyboard size={16} />
          <span>TV Keyboard</span>
        </button>
      </div>

      {/* Virtual Keyboard Drawer */}
      {showKeyboard && (
        <form onSubmit={handleSendText} className="flex gap-2 p-2 bg-slate-950/90 rounded-2xl border border-slate-800">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type on Nokia TV..."
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 rounded-xl text-xs font-semibold text-white hover:bg-blue-500"
          >
            Send
          </button>
        </form>
      )}

      {/* Android TV Circular D-Pad */}
      <div className="flex flex-col items-center my-1">
        <div className="relative w-56 h-56 rounded-full bg-slate-950/90 border border-slate-800 shadow-2xl flex items-center justify-center p-3">
          {/* UP Button */}
          <button
            onClick={() => handleAction('UP')}
            className="absolute top-2 w-16 h-12 flex items-center justify-center text-slate-400 hover:text-white active:scale-95 transition-all"
            title="Up"
          >
            <ChevronUp size={30} />
          </button>

          {/* DOWN Button */}
          <button
            onClick={() => handleAction('DOWN')}
            className="absolute bottom-2 w-16 h-12 flex items-center justify-center text-slate-400 hover:text-white active:scale-95 transition-all"
            title="Down"
          >
            <ChevronDown size={30} />
          </button>

          {/* LEFT Button */}
          <button
            onClick={() => handleAction('LEFT')}
            className="absolute left-2 w-12 h-16 flex items-center justify-center text-slate-400 hover:text-white active:scale-95 transition-all"
            title="Left"
          >
            <ChevronLeft size={30} />
          </button>

          {/* RIGHT Button */}
          <button
            onClick={() => handleAction('RIGHT')}
            className="absolute right-2 w-12 h-16 flex items-center justify-center text-slate-400 hover:text-white active:scale-95 transition-all"
            title="Right"
          >
            <ChevronRight size={30} />
          </button>

          {/* OK / Center Select */}
          <button
            onClick={() => handleAction('OK', {}, 'medium')}
            className="w-24 h-24 rounded-full dpad-center border border-slate-700/80 flex flex-col items-center justify-center text-white font-extrabold text-sm tracking-wider shadow-inner"
            title="Select"
          >
            <span>OK</span>
          </button>
        </div>
      </div>

      {/* Android Triad: Back, Home, Volume Mute */}
      <div className="grid grid-cols-3 gap-2.5">
        <button
          onClick={() => handleAction('BACK')}
          className="flex flex-col items-center justify-center py-3 rounded-2xl remote-btn text-slate-300 hover:text-white gap-1"
          title="Back"
        >
          <ArrowLeft size={18} />
          <span className="text-[10px] font-medium">Back</span>
        </button>

        <button
          onClick={() => handleAction('HOME', {}, 'medium')}
          className="flex flex-col items-center justify-center py-3 rounded-2xl remote-btn-primary text-white gap-1"
          title="Android TV Home"
        >
          <Home size={18} />
          <span className="text-[10px] font-semibold">Home</span>
        </button>

        <button
          onClick={() => handleAction('MUTE', {}, 'medium')}
          className={`flex flex-col items-center justify-center py-3 rounded-2xl border text-xs gap-1 transition-all ${
            isMuted
              ? 'bg-rose-950/80 border-rose-500/50 text-rose-400 font-bold'
              : 'bg-slate-900/90 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
          title="Mute / Unmute"
        >
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          <span className="text-[10px] font-medium">{isMuted ? 'Muted' : 'Mute'}</span>
        </button>
      </div>

      {/* Volume Controls Steppers */}
      <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
        <button
          onClick={() => handleAction('VOLUME_DOWN')}
          className="p-3 rounded-xl remote-btn text-slate-200 hover:text-white"
          title="Volume Down"
        >
          <ChevronDown size={20} />
        </button>

        <div className="flex flex-col items-center">
          <span className="text-xl font-bold font-mono text-white">{isMuted ? '0' : volume}</span>
          <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">Volume</span>
        </div>

        <button
          onClick={() => handleAction('VOLUME_UP')}
          className="p-3 rounded-xl remote-btn text-slate-200 hover:text-white"
          title="Volume Up"
        >
          <ChevronUp size={20} />
        </button>
      </div>

      {/* App Shortcuts */}
      <div className="flex flex-col gap-2">
        <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Android TV Apps</label>
        <div className="grid grid-cols-4 gap-2">
          {apps.map((app) => (
            <button
              key={app.id}
              onClick={() => handleAction('LAUNCH_APP', { app: app.label })}
              className={`py-2.5 px-1 rounded-2xl border text-xs font-semibold transition-all shadow-sm ${app.color} hover:brightness-125 active:scale-95`}
            >
              {app.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
