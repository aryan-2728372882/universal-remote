import React, { useState } from 'react';
import { SlidersHorizontal, Sun, Palette, Sparkles, Tv, ShieldCheck, Power, Settings as SettingsIcon } from 'lucide-react';
import FullSettingsScreen from './FullSettingsScreen';

export default function AmbilightScreen({
  activeTheme = 'cyan',
  onThemeChange,
  bgAnimActive,
  onToggleBgAnim,
  soundEnabled,
  onToggleSound,
  hapticEnabled,
  onToggleHaptic,
  onOpenDoctor,
  showToast
}) {
  const [ambilightEnabled, setAmbilightEnabled] = useState(true);
  const [selectedEffect, setSelectedEffect] = useState('reactive'); // 'reactive' | 'cyber' | 'aurora' | 'sunset'
  const [brightness, setBrightness] = useState(85);
  const [colorTemp, setColorTemp] = useState(6500);
  const [subTab, setSubTab] = useState('lighting'); // 'lighting' | 'settings'

  const ambilightPresets = [
    {
      id: 'reactive',
      name: 'Dynamic TV Sync',
      desc: 'Matches live TV display frame colors',
      gradient: 'from-cyan-500 via-blue-600 to-indigo-700',
      glow: 'rgba(6, 182, 212, 0.45)',
    },
    {
      id: 'cyber',
      name: 'Cyberpunk Neon',
      desc: 'Electric magenta & cyan gaming glow',
      gradient: 'from-fuchsia-500 via-purple-600 to-cyan-400',
      glow: 'rgba(217, 70, 239, 0.45)',
    },
    {
      id: 'aurora',
      name: 'Nordic Aurora',
      desc: 'Boreal emerald ribbons and calm waves',
      gradient: 'from-emerald-400 via-teal-500 to-blue-600',
      glow: 'rgba(16, 185, 129, 0.45)',
    },
    {
      id: 'sunset',
      name: 'Sunset Ember',
      desc: 'Warm golden cinema ambient aura',
      gradient: 'from-amber-500 via-orange-600 to-rose-600',
      glow: 'rgba(245, 158, 11, 0.45)',
    },
  ];

  return (
    <div className="w-full max-w-[420px] mx-auto px-4 py-3 flex flex-col gap-4 text-slate-100 font-jakarta pb-28">
      {/* Subtab Switcher: Lighting vs Full Settings */}
      <div className="flex bg-[#0c101c] p-1 rounded-2xl border border-white/10 shadow-lg">
        <button
          onClick={() => setSubTab('lighting')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            subTab === 'lighting'
              ? 'bg-[#0a2e33] border border-cyan-500/50 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <SlidersHorizontal size={14} />
          <span>Ambilight Lighting</span>
        </button>
        <button
          onClick={() => setSubTab('settings')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            subTab === 'settings'
              ? 'bg-[#0a2e33] border border-cyan-500/50 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <SettingsIcon size={14} />
          <span>Preferences & Account</span>
        </button>
      </div>

      {subTab === 'settings' ? (
        <FullSettingsScreen
          activeTheme={activeTheme}
          onThemeChange={onThemeChange}
          bgAnimActive={bgAnimActive}
          onToggleBgAnim={onToggleBgAnim}
          soundEnabled={soundEnabled}
          onToggleSound={onToggleSound}
          hapticEnabled={hapticEnabled}
          onToggleHaptic={onToggleHaptic}
          onOpenDoctor={onOpenDoctor}
          showToast={showToast}
        />
      ) : (
        <div className="flex flex-col gap-4">
          {/* TV Ambient Glow Simulation Preview */}
          <div className="relative rounded-[28px] p-5 border border-white/10 bg-[#080b12] overflow-hidden shadow-2xl flex flex-col items-center">
            {/* Halo behind the simulated TV */}
            {ambilightEnabled && (
              <div
                className="absolute inset-x-8 -top-4 h-32 rounded-full blur-2xl opacity-75 transition-all duration-700 pointer-events-none"
                style={{
                  background:
                    selectedEffect === 'reactive'
                      ? 'radial-gradient(circle, #00f2fe 0%, #0066ff 60%, transparent 100%)'
                      : selectedEffect === 'cyber'
                      ? 'radial-gradient(circle, #ff007a 0%, #7928ca 60%, transparent 100%)'
                      : selectedEffect === 'aurora'
                      ? 'radial-gradient(circle, #00e676 0%, #00b4d8 60%, transparent 100%)'
                      : 'radial-gradient(circle, #ff9900 0%, #ff3366 60%, transparent 100%)',
                  opacity: brightness / 100,
                }}
              />
            )}

            {/* Simulated TV Screen */}
            <div className="relative z-10 w-[240px] h-[135px] rounded-xl bg-black border-2 border-slate-700 shadow-2xl flex flex-col items-center justify-center p-3 text-center">
              <Tv size={28} className="text-cyan-400 mb-1" />
              <div className="text-[11px] font-bold text-white tracking-wide">Ambilight Halo Active</div>
              <div className="text-[9px] text-slate-400">HDMI Sync • 4-Side RGB Immersion</div>
            </div>

            {/* On/Off Switch */}
            <div className="w-full flex justify-between items-center mt-4 pt-3 border-t border-white/10">
              <span className="text-xs font-bold text-slate-300">Ambilight Backlight</span>
              <button
                onClick={() => {
                  setAmbilightEnabled(!ambilightEnabled);
                  showToast(ambilightEnabled ? 'Ambilight Disabled' : 'Ambilight Enabled');
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                  ambilightEnabled
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                    : 'bg-white/5 border-white/10 text-slate-400'
                }`}
              >
                {ambilightEnabled ? 'Active' : 'Off'}
              </button>
            </div>
          </div>

          {/* Presets Grid */}
          <div className="flex flex-col gap-2">
            <span className="text-xs uppercase font-extrabold tracking-wider text-slate-400">
              Lighting Profiles
            </span>
            <div className="grid grid-cols-2 gap-2.5">
              {ambilightPresets.map((preset) => {
                const isSelected = selectedEffect === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => {
                      setSelectedEffect(preset.id);
                      showToast(`Ambilight: ${preset.name}`);
                    }}
                    className={`p-3 rounded-2xl border text-left flex flex-col gap-1.5 transition-all relative overflow-hidden ${
                      isSelected
                        ? 'bg-[#0e1626] border-cyan-400/80 shadow-[0_0_16px_rgba(6,182,212,0.25)]'
                        : 'bg-[#0c101c] border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className={`h-2.5 w-full rounded-full bg-gradient-to-r ${preset.gradient}`} />
                    <div className="text-xs font-bold text-white mt-1">{preset.name}</div>
                    <div className="text-[10px] text-slate-400 line-clamp-1">{preset.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Controls: Brightness Slider */}
          <div className="bg-[#0c101c] border border-white/5 rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <Sun size={14} className="text-amber-400" />
                Glow Intensity
              </span>
              <span className="font-mono text-cyan-400 font-bold">{brightness}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={brightness}
              onChange={(e) => setBrightness(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          {/* Controls: Color Temperature */}
          <div className="bg-[#0c101c] border border-white/5 rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <Palette size={14} className="text-cyan-400" />
                White Balance Temp
              </span>
              <span className="font-mono text-cyan-400 font-bold">{colorTemp}K</span>
            </div>
            <input
              type="range"
              min="2700"
              max="9000"
              step="100"
              value={colorTemp}
              onChange={(e) => setColorTemp(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Warm (2700K)</span>
              <span>Neutral (6500K)</span>
              <span>Cool (9000K)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
