import React from 'react';
import { ShieldCheck, Zap, Wifi, Cpu, Smartphone, Sparkles, Layers, Sliders, Info, Terminal, CheckCircle2 } from 'lucide-react';

export default function ProductShowcase({ onSelectDevice, currentDeviceId, onSwitchMode, activeMode }) {
  const protocols = [
    {
      brand: 'LG webOS Smart TV',
      protocol: 'SSAP WebSocket + Pointer Input Socket',
      ports: '3001 (TLS) / 3000 (WS)',
      detail: 'Direct binary pointer input socket for real BUTTON events (UP, DOWN, LEFT, RIGHT, ENTER, HOME, BACK, MENU). Real subscription state for volume and running app.',
      chip: 'LG webOS'
    },
    {
      brand: 'Nokia Smart Android TV / Google TV',
      protocol: 'Android TV Remote Protocol v2',
      ports: '6467 (Control) / 6466 (Pairing)',
      detail: 'Mutual TLS pairing handshake with guided 6-character PIN code. Direct deep links for Netflix, YouTube, Prime, and text input sync.',
      chip: 'Android TV v2'
    },
    {
      brand: 'LG Dual Inverter AC',
      protocol: 'LG ThinQ Connect REST API',
      ports: 'Direct HTTPS Cloud (India Region)',
      detail: 'Personal Access Token integration for temperature, mode, fan speed, and swing. Honest disclosure: AC uses LG cloud, requiring internet.',
      chip: 'ThinQ Cloud'
    },
    {
      brand: 'Samsung Smart TV',
      protocol: 'Tizen SmartView v2 WebSocket',
      ports: '8002 (WSS) / 8001 (WS)',
      detail: 'Automated token handshake, key frame dispatch, and volume/source synchronization.',
      chip: 'Tizen v2'
    },
    {
      brand: 'Roku Streaming TV',
      protocol: 'External Control Protocol (ECP)',
      ports: '8060 (HTTP REST)',
      detail: 'Sub-millisecond keypress dispatch, app launcher queries, and instant input response.',
      chip: 'Roku ECP'
    }
  ];

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6 p-4 sm:p-6 bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl text-slate-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 text-[11px] font-mono font-bold tracking-wider uppercase">
              Architecture & UI Showcase
            </span>
            <span className="text-xs text-emerald-400 font-mono font-semibold flex items-center gap-1">
              <CheckCircle2 size={12} /> 100% Original App UI
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
            Universal Smart Remote: Product & Protocol Guide
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            A local-first smart controller for your home network. Runs directly on your Wi-Fi with sub-100ms dispatch.
          </p>
        </div>

        {/* Quick View Switches */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-2xl border border-slate-800">
          <button
            onClick={() => onSwitchMode('star')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeMode === 'star' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Star Remote
          </button>
          <button
            onClick={() => onSwitchMode('elder')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeMode === 'elder' ? 'bg-amber-500 text-black shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Elder Mode
          </button>
          <button
            onClick={() => onSwitchMode('doctor')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeMode === 'doctor' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Doctor
          </button>
        </div>
      </div>

      {/* 4 Core Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex flex-col gap-2">
          <div className="p-2.5 w-fit rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800/60">
            <Zap size={20} />
          </div>
          <h3 className="font-bold text-sm text-white">Under 100ms Dispatch</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Keypress to TV packet dispatch is sub-10ms on local Wi-Fi. No round-trip through distant cloud servers.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex flex-col gap-2">
          <div className="p-2.5 w-fit rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800/60">
            <Wifi size={20} />
          </div>
          <h3 className="font-bold text-sm text-white">Works With Internet Down</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            All TV protocols (webOS, Android TV, Samsung, Roku) communicate directly over your home Wi-Fi router.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex flex-col gap-2">
          <div className="p-2.5 w-fit rounded-xl bg-blue-950 text-blue-400 border border-blue-800/60">
            <Smartphone size={20} />
          </div>
          <h3 className="font-bold text-sm text-white">Auto-Keyboard for Search</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Tapping YouTube or typing search query automatically pops up the phone or browser soft keyboard.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex flex-col gap-2">
          <div className="p-2.5 w-fit rounded-xl bg-purple-950 text-purple-400 border border-purple-800/60">
            <ShieldCheck size={20} />
          </div>
          <h3 className="font-bold text-sm text-white">Connection Doctor</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Diagnoses router AP isolation, multicast UDP drops, and port reachability with 1-click plain language fixes.
          </p>
        </div>
      </div>

      {/* Protocol Matrix */}
      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-extrabold text-slate-300 uppercase tracking-wider font-mono">
          Supported Devices & Native Protocols
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {protocols.map((p) => (
            <div key={p.brand} className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between gap-3">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-extrabold text-sm text-white">{p.brand}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-cyan-300 font-mono font-bold">
                    {p.chip}
                  </span>
                </div>
                <div className="text-[11px] font-mono text-cyan-400 mb-1">{p.ports}</div>
                <p className="text-xs text-slate-400 leading-relaxed">{p.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
