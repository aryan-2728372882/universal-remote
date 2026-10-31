import React, { useState, useRef } from 'react';
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
  Thermometer,
  Wind,
  Tv,
  Keyboard,
  Send,
  AlertTriangle
} from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

export default function CapabilityRemote({ device, onExecute, onPair }) {
  const [textInputVal, setTextInputVal] = useState('');
  const [isKeyboardActive, setIsKeyboardActive] = useState(false);
  const textInputRef = useRef(null);
  const capabilities = device?.capabilities || [];
  const state = device || {};
  const isOnline = state.status === 'ONLINE';
  const isPairingRequired = state.status === 'PAIRING_REQUIRED';

  const handleAction = (capabilityId, value = null, hapticType = 'light') => {
    triggerHaptic(hapticType);
    onExecute(device.id, capabilityId, value);
  };

  const handleSendText = (e, capId) => {
    e.preventDefault();
    if (!textInputVal) return;
    handleAction(capId, textInputVal, 'medium');
    setTextInputVal('');
  };

  // Group capabilities
  const capMap = new Map(capabilities.map(c => [c.id, c]));
  const hasDpad = capMap.has('dpad');
  const hasClimate = capMap.has('target_temp') || capMap.has('mode');
  const hasAudio = capMap.has('volume') || capMap.has('volume_up');
  const hasApps = capMap.has('app_launch');
  const hasMedia = capMap.has('media_play') || capMap.has('media_play_pause');

  return (
    <div className="w-full max-w-md lg:max-w-xl mx-auto rounded-3xl remote-surface p-4 sm:p-6 text-slate-100 flex flex-col gap-4 sm:gap-5 border border-slate-700/60 shadow-2xl relative transition-all duration-300">
      
      {/* Device Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold tracking-wider text-base sm:text-lg text-white">
              {state.name || 'Smart Device'}
            </span>
            <span
              className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                isOnline
                  ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                  : isPairingRequired
                  ? 'bg-amber-950 text-amber-400 border-amber-800 animate-pulse'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-400' : isPairingRequired ? 'bg-amber-400' : 'bg-rose-400'}`} />
              {state.status}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5 font-mono">
            {state.config?.ip ? `IP: ${state.config.ip}` : state.type}
          </p>
        </div>

        {/* Pairing Required Button or Power Button */}
        <div className="flex items-center gap-2">
          {isPairingRequired && (
            <button
              onClick={() => onPair(device)}
              className="px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
            >
              Pair Device
            </button>
          )}

          {capMap.has('power') && (
            <button
              onClick={() => handleAction('power', null, 'heavy')}
              className={`p-3.5 sm:p-4 rounded-2xl transition-all shadow-xl flex items-center justify-center active:scale-95 ${
                state.power
                  ? 'bg-rose-600 text-white shadow-rose-600/40 ring-4 ring-rose-500/20'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700'
              }`}
              title="Power Toggle"
            >
              <Power size={22} />
            </button>
          )}
        </div>
      </div>

      {/* CLIMATE SECTION (If device has climate capabilities) */}
      {hasClimate && (
        <div className="flex flex-col items-center justify-center p-4 sm:p-6 rounded-3xl bg-slate-950/80 border border-slate-800">
          <div className="flex items-center gap-6 text-xs text-slate-400 mb-2">
            <div className="flex items-center gap-1.5">
              <Thermometer size={16} />
              <span>Room: <strong className="text-slate-200">{state.currentTemp || 24}°C</strong></span>
            </div>
            {state.humidity && (
              <span>Humidity: <strong className="text-slate-200">{state.humidity}%</strong></span>
            )}
          </div>

          <div className="flex items-center justify-center gap-6 my-2">
            {capMap.has('temp_down') && (
              <button
                onClick={() => handleAction('temp_down')}
                className="w-12 h-12 rounded-2xl remote-btn flex items-center justify-center text-slate-200 hover:text-white active:scale-95"
              >
                <ChevronDown size={28} />
              </button>
            )}

            <div className="flex flex-col items-center">
              <div className="flex items-baseline">
                <span className="text-5xl sm:text-7xl font-black tracking-tight text-white">
                  {state.targetTemp || 22}
                </span>
                <span className="text-2xl font-bold text-slate-400 ml-1">°C</span>
              </div>
              <span className="text-[11px] font-semibold uppercase text-slate-400 mt-1">Target Temp</span>
            </div>

            {capMap.has('temp_up') && (
              <button
                onClick={() => handleAction('temp_up')}
                className="w-12 h-12 rounded-2xl remote-btn flex items-center justify-center text-slate-200 hover:text-white active:scale-95"
              >
                <ChevronUp size={28} />
              </button>
            )}
          </div>

          {capMap.has('target_temp') && (
            <div className="w-full mt-2 px-2">
              <input
                type="range"
                min="16"
                max="30"
                step="1"
                value={state.targetTemp || 22}
                onChange={(e) => handleAction('target_temp', Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
          )}

          {/* Mode Selector */}
          {capMap.has('mode') && capMap.get('mode').options && (
            <div className="grid grid-cols-5 gap-1.5 w-full mt-4">
              {capMap.get('mode').options.map((m) => (
                <button
                  key={m}
                  onClick={() => handleAction('mode', m)}
                  className={`py-2 rounded-xl text-[10px] sm:text-xs font-semibold transition-all border ${
                    state.mode === m
                      ? 'bg-blue-600 text-white border-blue-400 shadow-md'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* AUDIO / VOLUME CONTROLS */}
      {hasAudio && (
        <div className="grid grid-cols-2 gap-3 p-3.5 sm:p-4 rounded-3xl bg-slate-950/70 border border-slate-800">
          <div className="flex flex-col items-center gap-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Volume Up / Down</span>
            <div className="flex items-center gap-2 w-full">
              <button
                onClick={() => handleAction('volume_down')}
                className="flex-1 py-3 rounded-2xl remote-btn flex items-center justify-center text-slate-200 active:scale-95"
              >
                <ChevronDown size={22} />
              </button>
              <button
                onClick={() => handleAction('volume_up')}
                className="flex-1 py-3 rounded-2xl remote-btn flex items-center justify-center text-slate-200 active:scale-95"
              >
                <ChevronUp size={22} />
              </button>
            </div>
          </div>

          <div className="flex flex-col items-center gap-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mute Toggle</span>
            <button
              onClick={() => handleAction('mute', null, 'medium')}
              className={`w-full py-3 rounded-2xl border flex items-center justify-center gap-2 text-xs font-semibold transition-all active:scale-95 ${
                state.isMuted
                  ? 'bg-rose-950/80 border-rose-500 text-rose-400'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              {state.isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              <span>{state.isMuted ? 'Muted' : `${state.volume ?? 15}%`}</span>
            </button>
          </div>
        </div>
      )}

      {/* DPAD NAVIGATION (If present) */}
      {hasDpad && (
        <div className="flex flex-col items-center my-1 sm:my-2">
          <div className="relative w-48 h-48 sm:w-60 sm:h-60 rounded-full bg-slate-950/90 border border-slate-800 shadow-2xl flex items-center justify-center p-3">
            <button
              onClick={() => handleAction('dpad_up')}
              className="absolute top-2 w-20 h-14 flex items-center justify-center text-slate-400 hover:text-white active:scale-95"
              title="Up"
            >
              <ChevronUp size={34} />
            </button>
            <button
              onClick={() => handleAction('dpad_down')}
              className="absolute bottom-2 w-20 h-14 flex items-center justify-center text-slate-400 hover:text-white active:scale-95"
              title="Down"
            >
              <ChevronDown size={34} />
            </button>
            <button
              onClick={() => handleAction('dpad_left')}
              className="absolute left-2 w-14 h-20 flex items-center justify-center text-slate-400 hover:text-white active:scale-95"
              title="Left"
            >
              <ChevronLeft size={34} />
            </button>
            <button
              onClick={() => handleAction('dpad_right')}
              className="absolute right-2 w-14 h-20 flex items-center justify-center text-slate-400 hover:text-white active:scale-95"
              title="Right"
            >
              <ChevronRight size={34} />
            </button>
            <button
              onClick={() => handleAction('dpad_enter', null, 'medium')}
              className="w-22 h-22 sm:w-26 sm:h-26 rounded-full dpad-center border border-slate-700/80 flex flex-col items-center justify-center text-white font-extrabold text-sm sm:text-base tracking-wider active:scale-95"
              title="OK / Enter"
            >
              <span>OK</span>
            </button>
          </div>
        </div>
      )}

      {/* NAVIGATION TRIAD: Back, Home, Menu */}
      {(capMap.has('back') || capMap.has('home') || capMap.has('menu')) && (
        <div className="grid grid-cols-3 gap-2.5">
          {capMap.has('back') && (
            <button
              onClick={() => handleAction('back')}
              className="flex flex-col items-center justify-center py-3 rounded-2xl remote-btn text-slate-300 hover:text-white gap-1 active:scale-95"
            >
              <ArrowLeft size={18} />
              <span className="text-[10px] font-medium">Back</span>
            </button>
          )}
          {capMap.has('home') && (
            <button
              onClick={() => handleAction('home', null, 'medium')}
              className="flex flex-col items-center justify-center py-3 rounded-2xl remote-btn-primary text-white gap-1 active:scale-95"
            >
              <Home size={18} />
              <span className="text-[10px] font-semibold">Home</span>
            </button>
          )}
          {capMap.has('menu') && (
            <button
              onClick={() => handleAction('menu')}
              className="flex flex-col items-center justify-center py-3 rounded-2xl remote-btn text-slate-300 hover:text-white gap-1 active:scale-95"
            >
              <Menu size={18} />
              <span className="text-[10px] font-medium">Menu</span>
            </button>
          )}
        </div>
      )}

      {/* APP LAUNCHERS */}
      {hasApps && capMap.get('app_launch').options && (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Quick App Launch</label>
            <span className="text-[10px] text-cyan-400 font-mono">Tapping auto-opens keyboard</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {capMap.get('app_launch').options.map((app) => (
              <button
                key={app}
                onClick={() => {
                  handleAction('app_launch', app);
                  setIsKeyboardActive(true);
                  setTimeout(() => {
                    textInputRef.current?.focus();
                  }, 180);
                }}
                className="py-2.5 px-1 rounded-2xl bg-slate-900 border border-slate-800 hover:border-cyan-500 text-xs font-semibold text-slate-200 hover:text-white transition-all shadow-sm active:scale-95 flex items-center justify-center gap-1"
              >
                <span>{app}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* TEXT KEYBOARD INPUT (Auto-focused on search) */}
      {capMap.has('text_input') && (
        <div className="flex flex-col gap-1.5">
          {isKeyboardActive && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-cyan-950/80 border border-cyan-800 rounded-xl text-[11px] text-cyan-300 animate-pulse font-mono">
              <Keyboard size={13} className="text-cyan-400 shrink-0" />
              <span>Keyboard Auto-Enabled • Keystrokes sync directly to TV search</span>
            </div>
          )}
          <form
            onSubmit={(e) => handleSendText(e, 'text_input')}
            className={`flex gap-2 p-2 bg-slate-950/90 rounded-2xl border transition-all ${
              isKeyboardActive ? 'border-cyan-500 ring-2 ring-cyan-500/20' : 'border-slate-800'
            }`}
          >
            <input
              ref={textInputRef}
              type="text"
              value={textInputVal}
              onFocus={() => setIsKeyboardActive(true)}
              onBlur={() => !textInputVal && setIsKeyboardActive(false)}
              onChange={(e) => setTextInputVal(e.target.value)}
              placeholder="Type to search on TV (YouTube, Netflix...)"
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-sans"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-cyan-600 rounded-xl text-xs font-semibold text-white hover:bg-cyan-500 active:scale-95 flex items-center gap-1"
            >
              <Send size={14} />
              <span>Send</span>
            </button>
          </form>
        </div>
      )}

      {/* MEDIA CONTROLS */}
      {hasMedia && (
        <div className="grid grid-cols-4 gap-2 p-2 bg-slate-950/80 rounded-2xl border border-slate-800">
          {capMap.has('media_rewind') && (
            <button onClick={() => handleAction('media_rewind')} className="py-2.5 rounded-xl text-slate-400 hover:text-white flex items-center justify-center active:scale-95">
              <Rewind size={20} />
            </button>
          )}
          {capMap.has('media_play_pause') ? (
            <button onClick={() => handleAction('media_play_pause')} className="col-span-2 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-semibold text-xs flex items-center justify-center gap-1.5 active:scale-95">
              <Play size={16} /> / <Pause size={16} />
            </button>
          ) : (
            <>
              {capMap.has('media_play') && (
                <button onClick={() => handleAction('media_play')} className="py-2.5 rounded-xl text-slate-200 hover:text-white flex items-center justify-center active:scale-95">
                  <Play size={20} />
                </button>
              )}
              {capMap.has('media_pause') && (
                <button onClick={() => handleAction('media_pause')} className="py-2.5 rounded-xl text-slate-200 hover:text-white flex items-center justify-center active:scale-95">
                  <Pause size={20} />
                </button>
              )}
            </>
          )}
          {capMap.has('media_fastforward') && (
            <button onClick={() => handleAction('media_fastforward')} className="py-2.5 rounded-xl text-slate-400 hover:text-white flex items-center justify-center active:scale-95">
              <FastForward size={20} />
            </button>
          )}
        </div>
      )}

      {/* TV Cloud or Network notice */}
      {state.requiresInternet && (
        <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-1.5">
          <AlertTriangle size={14} className="text-amber-400 shrink-0" />
          <span>LG ThinQ AC requires internet access to connect with LG Cloud.</span>
        </div>
      )}

    </div>
  );
}
