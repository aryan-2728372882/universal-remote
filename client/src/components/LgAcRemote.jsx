import React from 'react';
import {
  Power,
  Snowflake,
  Droplets,
  Wind,
  Sun,
  RefreshCw,
  Zap,
  Leaf,
  ChevronUp,
  ChevronDown,
  Gauge,
  Thermometer,
  Sparkles
} from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

export default function LgAcRemote({ state, onCommand }) {
  const isPowerOn = state?.power ?? true;
  const targetTemp = state?.targetTemp || 22;
  const currentTemp = state?.currentTemp || 24;
  const mode = state?.mode || 'COOL';
  const fanSpeed = state?.fanSpeed || 'AUTO';
  const vSwing = state?.vSwing || false;
  const hSwing = state?.hSwing || false;
  const jetCool = state?.jetCool || false;
  const energySaver = state?.energySaver || false;

  const handleAction = (action, val = null, hapticType = 'light') => {
    triggerHaptic(hapticType);
    onCommand('lg-ac', action, val);
  };

  const modes = [
    { id: 'COOL', label: 'Cool', icon: Snowflake, color: 'text-cyan-400 border-cyan-500/40 bg-cyan-950/40' },
    { id: 'DRY', label: 'Dry', icon: Droplets, color: 'text-blue-400 border-blue-500/40 bg-blue-950/40' },
    { id: 'FAN', label: 'Fan', icon: Wind, color: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/40' },
    { id: 'HEAT', label: 'Heat', icon: Sun, color: 'text-amber-400 border-amber-500/40 bg-amber-950/40' },
    { id: 'AUTO', label: 'Auto', icon: RefreshCw, color: 'text-purple-400 border-purple-500/40 bg-purple-950/40' }
  ];

  const fanSpeeds = ['LOW', 'MID', 'HIGH', 'AUTO', 'TURBO'];

  return (
    <div className="w-full max-w-md lg:max-w-xl mx-auto rounded-3xl remote-surface p-4 sm:p-6 text-slate-100 flex flex-col gap-4 sm:gap-5 border border-slate-700/60 shadow-2xl relative overflow-hidden transition-all duration-300">
      
      {/* Dynamic Ambient Glow */}
      <div className={`absolute -top-24 -right-24 w-56 h-56 rounded-full blur-3xl opacity-20 pointer-events-none transition-all duration-500 ${
        !isPowerOn ? 'bg-slate-700' : mode === 'COOL' ? 'bg-cyan-500' : mode === 'HEAT' ? 'bg-amber-500' : 'bg-emerald-500'
      }`} />

      {/* Top Header: Brand, Connection, & Instant Power */}
      <div className="flex items-center justify-between z-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold tracking-wider text-base sm:text-lg text-white">LG DUALCOOL</span>
            <span className="text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Connected
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5 font-medium">Wi-Fi Inverter Air Conditioner</p>
        </div>

        <button
          onClick={() => handleAction('power', null, 'heavy')}
          className={`p-3.5 sm:p-4 rounded-2xl transition-all shadow-xl flex items-center justify-center ${
            isPowerOn
              ? 'bg-rose-600 text-white shadow-rose-600/40 ring-4 ring-rose-500/20 active:scale-95'
              : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700 border border-slate-700'
          }`}
          title={isPowerOn ? 'Turn AC Off' : 'Turn AC On'}
        >
          <Power size={22} className={isPowerOn ? 'drop-shadow-sm' : ''} />
        </button>
      </div>

      {/* Responsive Thermostat Display */}
      <div className={`flex flex-col items-center justify-center p-4 sm:p-6 rounded-3xl transition-all duration-300 border ${
        isPowerOn
          ? 'bg-gradient-to-b from-slate-900/95 to-slate-950/95 border-slate-700/80 shadow-inner'
          : 'bg-slate-950/60 border-slate-800/60 opacity-60'
      }`}>
        {/* Sensor Readouts */}
        <div className="flex items-center gap-6 sm:gap-8 text-xs sm:text-sm text-slate-400 mb-2">
          <div className="flex items-center gap-1.5">
            <Thermometer size={16} className="text-slate-400" />
            <span>Room: <strong className="text-slate-200">{currentTemp}°C</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <Droplets size={16} className="text-cyan-400" />
            <span>Humidity: <strong className="text-slate-200">{state?.humidity || 52}%</strong></span>
          </div>
        </div>

        {/* Big Temperature Display with Steppers */}
        <div className="flex items-center justify-center gap-5 sm:gap-8 my-2 sm:my-3">
          <button
            disabled={!isPowerOn || targetTemp <= 16}
            onClick={() => handleAction('tempDown')}
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl remote-btn flex items-center justify-center text-slate-200 hover:text-white disabled:opacity-30 disabled:pointer-events-none active:scale-95 shadow-md"
            title="Decrease Temperature"
          >
            <ChevronDown size={30} />
          </button>

          <div className="flex flex-col items-center">
            <div className="flex items-baseline">
              <span className={`text-5xl sm:text-7xl font-black tracking-tight ${
                isPowerOn ? 'text-white drop-shadow-md' : 'text-slate-500'
              }`}>
                {targetTemp}
              </span>
              <span className="text-2xl sm:text-3xl font-bold text-slate-400 ml-1">°C</span>
            </div>
            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400 mt-1">
              Target Temperature
            </span>
          </div>

          <button
            disabled={!isPowerOn || targetTemp >= 30}
            onClick={() => handleAction('tempUp')}
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl remote-btn flex items-center justify-center text-slate-200 hover:text-white disabled:opacity-30 disabled:pointer-events-none active:scale-95 shadow-md"
            title="Increase Temperature"
          >
            <ChevronUp size={30} />
          </button>
        </div>

        {/* Responsive Temperature Slider */}
        <div className="w-full mt-2 sm:mt-3 px-2 sm:px-4">
          <input
            type="range"
            min="16"
            max="30"
            step="1"
            disabled={!isPowerOn}
            value={targetTemp}
            onChange={(e) => handleAction('setTemp', e.target.value)}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500 disabled:opacity-30"
          />
          <div className="flex justify-between text-[11px] text-slate-500 mt-1 font-mono">
            <span>16°C</span>
            <span>20°C</span>
            <span>24°C</span>
            <span>28°C</span>
            <span>30°C</span>
          </div>
        </div>
      </div>

      {/* Operation Mode Grid */}
      <div className="flex flex-col gap-1.5 sm:gap-2">
        <label className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">Operating Mode</label>
        <div className="grid grid-cols-5 gap-2">
          {modes.map((m) => {
            const Icon = m.icon;
            const isSelected = mode === m.id && isPowerOn;
            return (
              <button
                key={m.id}
                disabled={!isPowerOn}
                onClick={() => handleAction('mode', m.id)}
                className={`flex flex-col items-center justify-center py-2.5 sm:py-3 px-1 rounded-2xl transition-all border ${
                  isSelected
                    ? `bg-slate-800 ${m.color} ring-2 ring-blue-500/40 font-bold shadow-md scale-[1.02]`
                    : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                } disabled:opacity-40 active:scale-95`}
              >
                <Icon size={20} className={isSelected ? 'mb-1 animate-pulse' : 'mb-1'} />
                <span className="text-[10px] sm:text-xs">{m.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Fan Speed Row */}
      <div className="flex flex-col gap-1.5 sm:gap-2">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 tracking-wider uppercase">
          <span>Fan Speed</span>
          <span className="text-blue-400 font-mono">{fanSpeed}</span>
        </div>
        <div className="grid grid-cols-5 gap-1.5 p-1 bg-slate-950/80 rounded-2xl border border-slate-800">
          {fanSpeeds.map((speed) => {
            const isSelected = fanSpeed === speed && isPowerOn;
            return (
              <button
                key={speed}
                disabled={!isPowerOn}
                onClick={() => handleAction('fanSpeed', speed)}
                className={`py-2 rounded-xl text-[10px] sm:text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                } disabled:opacity-40 active:scale-95`}
              >
                {speed}
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Toggles: Swings, Jet Cool, Energy Saver */}
      <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
        <button
          disabled={!isPowerOn}
          onClick={() => handleAction('toggleVSwing')}
          className={`flex items-center justify-between p-3 sm:p-3.5 rounded-2xl border transition-all text-xs sm:text-sm ${
            vSwing && isPowerOn
              ? 'bg-blue-950/60 border-blue-500/50 text-blue-200 font-semibold'
              : 'bg-slate-900/90 border-slate-800 text-slate-400 hover:text-slate-200'
          } disabled:opacity-40 active:scale-95`}
        >
          <div className="flex items-center gap-2">
            <Wind size={18} className={vSwing ? 'text-blue-400' : ''} />
            <span>Vertical Swing</span>
          </div>
          <span className={`w-2.5 h-2.5 rounded-full ${vSwing && isPowerOn ? 'bg-blue-400 ring-2 ring-blue-400/40' : 'bg-slate-700'}`} />
        </button>

        <button
          disabled={!isPowerOn}
          onClick={() => handleAction('toggleHSwing')}
          className={`flex items-center justify-between p-3 sm:p-3.5 rounded-2xl border transition-all text-xs sm:text-sm ${
            hSwing && isPowerOn
              ? 'bg-blue-950/60 border-blue-500/50 text-blue-200 font-semibold'
              : 'bg-slate-900/90 border-slate-800 text-slate-400 hover:text-slate-200'
          } disabled:opacity-40 active:scale-95`}
        >
          <div className="flex items-center gap-2">
            <RefreshCw size={18} className={hSwing ? 'text-blue-400' : ''} />
            <span>Horizontal Swing</span>
          </div>
          <span className={`w-2.5 h-2.5 rounded-full ${hSwing && isPowerOn ? 'bg-blue-400 ring-2 ring-blue-400/40' : 'bg-slate-700'}`} />
        </button>

        <button
          disabled={!isPowerOn}
          onClick={() => handleAction('toggleJetCool')}
          className={`flex items-center justify-between p-3 sm:p-3.5 rounded-2xl border transition-all text-xs sm:text-sm ${
            jetCool && isPowerOn
              ? 'bg-cyan-950/70 border-cyan-500/60 text-cyan-200 font-semibold shadow-lg shadow-cyan-900/30'
              : 'bg-slate-900/90 border-slate-800 text-slate-400 hover:text-slate-200'
          } disabled:opacity-40 active:scale-95`}
        >
          <div className="flex items-center gap-2">
            <Zap size={18} className={jetCool ? 'text-cyan-400 animate-bounce' : ''} />
            <span>Jet Cool (18°C)</span>
          </div>
          <span className={`w-2.5 h-2.5 rounded-full ${jetCool && isPowerOn ? 'bg-cyan-400 ring-2 ring-cyan-400/40' : 'bg-slate-700'}`} />
        </button>

        <button
          disabled={!isPowerOn}
          onClick={() => handleAction('toggleEnergySaver')}
          className={`flex items-center justify-between p-3 sm:p-3.5 rounded-2xl border transition-all text-xs sm:text-sm ${
            energySaver && isPowerOn
              ? 'bg-emerald-950/70 border-emerald-500/60 text-emerald-200 font-semibold'
              : 'bg-slate-900/90 border-slate-800 text-slate-400 hover:text-slate-200'
          } disabled:opacity-40 active:scale-95`}
        >
          <div className="flex items-center gap-2">
            <Leaf size={18} className={energySaver ? 'text-emerald-400' : ''} />
            <span>Energy Saver</span>
          </div>
          <span className={`w-2.5 h-2.5 rounded-full ${energySaver && isPowerOn ? 'bg-emerald-400 ring-2 ring-emerald-400/40' : 'bg-slate-700'}`} />
        </button>
      </div>

    </div>
  );
}
