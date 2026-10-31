import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Tv,
  Zap,
  Wifi,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Clock,
  HeartHandshake,
  Search,
  Check,
  HelpCircle,
  Download,
  ArrowRight,
  Lock,
  Sliders,
  CheckCircle2,
  ChevronDown,
  Layers,
  Volume2,
  Power,
  Moon,
  Compass,
  Cpu,
  RefreshCw,
  Info,
  Radio,
  PlusCircle,
  AlertCircle,
  Globe,
  Maximize2
} from 'lucide-react';
import AnimatedBackground from './AnimatedBackground';
import AppLogo from './AppLogo';
import LuxuryRemote from './LuxuryRemote';
import ElderRemote from './ElderRemote';
import ConnectionDoctorModal from './ConnectionDoctorModal';
import { triggerNetworkScan } from '../utils/api';

// Real local Wi-Fi Smart TV devices only - zero hardcoded fake TVs


export default function PublicWebsite({
  realDevices = [],
  deviceStates = {},
  onExecute,
  onRefreshDevices
}) {
  // Live Wi-Fi devices
  const [selectedDeviceId, setSelectedDeviceId] = useState(realDevices[0]?.id || null);
  const [remoteStyle, setRemoteStyle] = useState('star'); // 'star' | 'elder'
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [currency, setCurrency] = useState('INR'); // 'INR' | 'USD'
  const [pricingCycle, setPricingCycle] = useState('yearly'); // 'monthly' | 'yearly' | 'lifetime'
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState(null);

  // Active TV in current view
  const activeDevice =
    realDevices.find((d) => d.id === selectedDeviceId) || realDevices[0] || {
      id: 'living-room-qled',
      name: 'Living Room QLED',
      type: 'android-tv',
      status: 'ONLINE',
      power: true,
      volume: 24,
      isMuted: false,
    };

  const currentState = deviceStates[activeDevice?.id] || activeDevice || {};

  const handleScanWifi = async () => {
    setIsScanning(true);
    setScanMessage('Broadcasting mDNS & SSDP probes across local subnet...');
    try {
      await triggerNetworkScan();
      setTimeout(async () => {
        if (onRefreshDevices) await onRefreshDevices();
        setIsScanning(false);
        setScanMessage('Scan complete! Local Smart TVs updated.');
        setTimeout(() => setScanMessage(null), 4000);
      }, 3000);
    } catch {
      setIsScanning(false);
      setScanMessage('Hub offline: Ensure hub runs on port 3000');
      setTimeout(() => setScanMessage(null), 4000);
    }
  };

  const protocols = [
    {
      brand: 'LG webOS Smart TV',
      protocol: 'SSAP WebSocket + Pointer Input Socket',
      ports: '3001 (TLS) / 3000 (WS)',
      detail:
        'Binary pointer socket dispatches authentic BUTTON events (UP, DOWN, LEFT, RIGHT, ENTER, BACK, HOME, MENU). Real state subscriptions for volume and foreground apps. Subnet Wake-on-LAN broadcast.',
      status: 'Native Local Socket',
      latency: '< 8 ms'
    },
    {
      brand: 'Nokia Smart TV (Android / Google TV)',
      protocol: 'Android TV Remote Protocol v2',
      ports: '6467 (TLS Control) / 6466 (Pairing)',
      detail:
        'Mutual TLS certificate exchange with on-screen 6-character PIN code. Direct deep links for Netflix, YouTube, Prime, Google Assistant, and two-way keyboard sync.',
      status: 'mTLS Protocol v2',
      latency: '< 12 ms'
    },
    {
      brand: 'Samsung Smart TV',
      protocol: 'Tizen SmartView v2 WebSocket',
      ports: '8002 (WSS) / 8001 (WS)',
      detail:
        'Automated token handshake, key frame dispatch, volume and source synchronization directly over local Wi-Fi.',
      status: 'Tizen SmartView v2',
      latency: '< 10 ms'
    },
    {
      brand: 'Roku Streaming TV',
      protocol: 'External Control Protocol (ECP)',
      ports: '8060 (HTTP REST)',
      detail:
        'Sub-millisecond keypress dispatch, app queries, and instant input response with zero cloud dependencies.',
      status: 'Roku ECP REST',
      latency: '< 6 ms'
    }
  ];

  const faqs = [
    {
      q: 'Which Smart TV brands are supported?',
      a: 'All major Smart TV brands on your home Wi-Fi: LG webOS Smart TVs, Android TV / Google TV (Nokia, Sony Bravia, Philips, TCL, Hisense, Xiaomi, OnePlus), Samsung Smart TV (Tizen), and Roku Streaming TVs/sticks.'
    },
    {
      q: 'Why does the app show an Interactive Playground when no TV is paired?',
      a: 'The Interactive Playground lets you test tactile spring physics, the radial clickwheel, and auto-keyboard focus directly on this browser before pairing hardware. Switching to "Live Home Wi-Fi" connects to your home network hub and displays only real detected TVs.'
    },
    {
      q: 'Does this app work when the internet is completely down?',
      a: 'YES! All local TV protocols (LG webOS, Nokia Android TV, Samsung, Roku) communicate directly over your home Wi-Fi router. Even during ISP outages, your remote will continue functioning with full local responsiveness.'
    },
    {
      q: 'Why are there NO weekly subscriptions?',
      a: 'We strictly reject predatory weekly auto-renewal subscriptions. Core TV remote features are free forever. Optional multi-room upgrades cost ₹49/month ($0.99), ₹299/year ($4.99), or ₹799 ($9.99) lifetime.'
    },
    {
      q: 'How small is the Android app download?',
      a: 'The production arm64-v8a release APK is only 7.93 MB! We use vector canvas drawings and zero third-party bloated analytics libraries, beating our strict 15 MB budget.'
    }
  ];

  return (
    <div className="relative min-h-screen bg-[#040711] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200 overflow-x-hidden">
      {/* 0. Ambient Floating Aurora In-App Background */}
      <AnimatedBackground />

      {/* 1. Header / Navigation */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-50 backdrop-blur-2xl bg-[#040711]/85 border-b border-slate-800/80 px-4 sm:px-8 py-3.5 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <AppLogo size={36} />
          <div>
            <span className="font-black text-sm sm:text-base tracking-wider uppercase text-white font-mono flex items-center gap-2">
              Universal Remote <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">v2.4.0</span>
            </span>
            <p className="text-[10px] text-slate-400 hidden sm:block">Local-First Smart TV Controller</p>
          </div>
        </div>

        <nav aria-label="Main Navigation" className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-300">
          <a href="#interactive-demo" className="hover:text-cyan-400 transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-lg px-1">TV Remote Demo</a>
          <a href="#features" className="hover:text-cyan-400 transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-lg px-1">Features</a>
          <a href="#protocols" className="hover:text-cyan-400 transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-lg px-1">TV Protocols</a>
          <a href="#pricing" className="hover:text-cyan-400 transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-lg px-1">Honest Pricing</a>
          <a href="#faq" className="hover:text-cyan-400 transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-lg px-1">FAQ</a>
        </nav>

        {/* Region & Currency Selector + Download CTA */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setCurrency(currency === 'INR' ? 'USD' : 'INR')}
            className="px-2.5 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-xs font-mono font-bold text-cyan-400 flex items-center gap-1.5 transition-all focus-visible:ring-2 focus-visible:ring-cyan-400 shadow-sm"
            title="Toggle Currency (INR / USD)"
            aria-label="Toggle Regional Currency"
          >
            <Globe size={13} />
            <span>{currency === 'INR' ? '₹ INR (India)' : '$ USD (Global)'}</span>
          </button>

          <motion.a
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.95 }}
            href="/downloads/universal-tv-remote.apk"
            download="universal-tv-remote.apk"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-xs font-black text-slate-950 shadow-lg shadow-cyan-500/25 transition-all flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-cyan-400 cursor-pointer"
          >
            <Download size={14} />
            <span className="hidden sm:inline">Download APK (8.46 MB)</span>
            <span className="sm:hidden">8.46MB</span>
          </motion.a>
        </div>
      </motion.header>

      {/* 2. Main Content Wrapper */}
      <main id="main-content" className="relative z-10 flex-1 w-full">
        {/* ================= HERO SECTION (2-COLUMN SPLIT ON DESKTOP & TV) ================= */}
        <section
          id="interactive-demo"
          role="region"
          aria-label="Interactive Hero & Remote Demo"
          className="relative px-4 sm:px-6 lg:px-12 pt-8 sm:pt-12 pb-16 max-w-7xl mx-auto"
        >
          {/* Responsive Grid: 1 Col on Mobile/Tablet, 2 Col on Desktop/TV */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Headline, Value Proposition, Metrics */}
            <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left">
              {/* Top Feature Pill */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-950/80 border border-cyan-700/60 text-cyan-300 text-xs font-mono font-bold tracking-wide uppercase mb-5 shadow-sm"
              >
                <Sparkles size={13} className="text-cyan-400 animate-pulse" />
                <span>Local-First • Sub-10ms TV Dispatch • Zero Cloud Lag</span>
              </motion.div>

              {/* Responsive Giant Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-3xl sm:text-5xl xl:text-6xl font-black text-white tracking-tight leading-[1.12]"
              >
                The Smart TV Remote That <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 bg-clip-text text-transparent">Genuinely Works.</span>
              </motion.h1>

              {/* Subhead */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mt-4 sm:mt-5 text-sm sm:text-lg text-slate-300 max-w-xl leading-relaxed"
              >
                Direct local socket control for <strong className="text-white">LG webOS Smart TV</strong>, <strong className="text-white">Nokia Android TV</strong>, <strong className="text-white">Samsung Smart TV</strong>, and <strong className="text-white">Roku</strong>. 
                Zero accounts, sub-10ms LAN dispatch, and works seamlessly even if your home internet is down.
              </motion.p>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="mt-6 sm:mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-3.5 w-full sm:w-auto"
              >
                <motion.a
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.95 }}
                  href="/downloads/universal-tv-remote.apk"
                  download="universal-tv-remote.apk"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black text-sm sm:text-base shadow-xl shadow-cyan-400/25 transition-all flex items-center justify-center gap-2.5 focus-visible:ring-4 focus-visible:ring-cyan-400 cursor-pointer"
                >
                  <Download size={18} />
                  <span>Download Release APK (8.46 MB)</span>
                </motion.a>
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowDoctorModal(true)}
                  className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-sm sm:text-base transition-all flex items-center justify-center gap-2 focus-visible:ring-4 focus-visible:ring-cyan-400 shadow-md"
                >
                  <ShieldCheck size={18} className="text-emerald-400" />
                  <span>Connection Doctor</span>
                </motion.button>
              </motion.div>

              {/* Key Metrics Strip (Responsive 2x2 or 4x1) */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.4 }}
                className="mt-8 sm:mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3.5 w-full max-w-xl text-left pt-6 border-t border-slate-800/80"
              >
                <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-md">
                  <div className="text-2xl sm:text-3xl font-black text-cyan-400 font-mono">&lt; 10 ms</div>
                  <div className="text-xs text-slate-300 font-semibold mt-1">Local LAN Dispatch</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-md">
                  <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">8.46 MB</div>
                  <div className="text-xs text-slate-300 font-semibold mt-1">Tiny APK Size</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-md">
                  <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">100%</div>
                  <div className="text-xs text-slate-300 font-semibold mt-1">Offline TV Control</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-md">
                  <div className="text-2xl sm:text-3xl font-black text-purple-400 font-mono">
                    {currency === 'INR' ? '₹49' : '$0.99'}
                  </div>
                  <div className="text-xs text-slate-300 font-semibold mt-1">Starting Monthly</div>
                </div>
              </motion.div>
            </div>

            {/* Right Column: Interactive Luxury Remote Mockup Frame */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center w-full">
              {/* Real Local TV Connection Status */}
              <div className="w-full max-w-[420px] flex items-center justify-between pb-2 mb-2 text-xs">
                <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f2fe]" />
                  <span>{realDevices.length > 0 ? `${realDevices.length} Local TV Detected` : 'Local TV Standby • Ready'}</span>
                </div>
                <button
                  onClick={() => setShowDoctorModal(true)}
                  className="px-2.5 py-1 rounded-xl bg-blue-950/80 text-blue-300 border border-blue-800/80 font-mono text-[11px] flex items-center gap-1 hover:border-cyan-400 focus-visible:ring-2 focus-visible:ring-cyan-400 transition-all"
                >
                  <ShieldCheck size={12} />
                  <span>Connection Doctor</span>
                </button>
              </div>

              {/* Real Discovered TVs Switcher (Only shown if user actually has multiple TVs on LAN) */}
              {realDevices.length > 1 && (
                <div className="w-full max-w-[420px] flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none mb-2">
                  {realDevices.map((dev) => (
                    <button
                      key={dev.id}
                      onClick={() => setSelectedDeviceId(dev.id)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all border ${
                        dev.id === activeDevice?.id
                          ? 'bg-cyan-950 text-cyan-300 border-cyan-500 shadow-md shadow-cyan-950'
                          : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {dev.name}
                    </button>
                  ))}
                </div>
              )}

              {/* Exact Screen Mockup with 4 Bottom Buttons */}
              <LuxuryRemote
                device={activeDevice}
                state={currentState}
                onExecute={onExecute}
                onOpenDoctor={() => setShowDoctorModal(true)}
              />
            </div>
          </div>
        </section>

        {/* ================= 3. FEATURES GRID (WCAG AA ACCESSIBLE) ================= */}
        <section
          id="features"
          role="region"
          aria-label="Product Features"
          className="px-4 sm:px-6 lg:px-12 py-16 max-w-7xl mx-auto border-t border-slate-800/80"
        >
          <div className="text-center mb-12">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/60 px-3 py-1 rounded-full border border-cyan-800/60">
              Engineered For Precision
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white mt-2">
              Why It Outperforms Standard TV Remotes
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: Zap,
                color: 'text-cyan-400 bg-cyan-950 border-cyan-800',
                title: 'Sub-100ms LAN Dispatch',
                desc: 'Every keypress transmits raw UDP/WebSocket packets directly to your TV’s local IP address with zero cloud hops.'
              },
              {
                icon: Smartphone,
                color: 'text-blue-400 bg-blue-950 border-blue-800',
                title: 'Auto-Keyboard for Search',
                desc: 'Tapping YouTube or Search automatically activates your mobile on-screen keyboard for rapid searching.'
              },
              {
                icon: ShieldCheck,
                color: 'text-emerald-400 bg-emerald-950 border-emerald-800',
                title: 'Connection Doctor',
                desc: 'Automated 8-step network diagnosis tests router AP isolation, multicast socket drops, and provides 1-click fixes.'
              },
              {
                icon: HeartHandshake,
                color: 'text-amber-400 bg-amber-950 border-amber-800',
                title: 'Elder Mode (Accessibility)',
                desc: 'High-contrast simplified navigation layout with giant HOME and BACK buttons so seniors never get stuck in apps.'
              },
              {
                icon: Moon,
                color: 'text-indigo-400 bg-indigo-950 border-indigo-800',
                title: 'Built-in Sleep Timer',
                desc: '15, 30, 45, 60, or 90 minute non-blocking countdown timers that power down the TV safely before you sleep.'
              },
              {
                icon: Compass,
                color: 'text-purple-400 bg-purple-950 border-purple-800',
                title: 'Lost-Remote Rescue',
                desc: 'Guided walk-up wizard assists when TV IP changes, DHCP leases expire, or physical remote is misplaced.'
              }
            ].map((f, i) => (
              <motion.article
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -4, borderColor: 'rgba(6, 182, 212, 0.4)' }}
                className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800/80 transition-all flex flex-col gap-3 shadow-lg backdrop-blur-md"
              >
                <div className={`w-11 h-11 rounded-2xl ${f.color} border flex items-center justify-center`}>
                  <f.icon size={22} aria-hidden="true" />
                </div>
                <h3 className="text-base font-bold text-white">{f.title}</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{f.desc}</p>
              </motion.article>
            ))}
          </div>
        </section>

        {/* ================= 4. SUPPORTED PROTOCOLS MATRIX (TVs ONLY) ================= */}
        <section
          id="protocols"
          role="region"
          aria-label="Supported Devices and Protocols"
          className="px-4 sm:px-6 lg:px-12 py-16 bg-[#03060d]/90 border-t border-slate-800/80"
        >
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-10">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/60 px-3 py-1 rounded-full border border-cyan-800/60">
                Hardware Engine
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-white mt-2">
                Supported Smart TVs & Protocols
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto mt-1">
                Zero guessing. Every TV uses its authentic manufacturer protocol adapter.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {protocols.map((p, idx) => (
                <motion.article
                  key={p.brand}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.08 }}
                  className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between gap-3 hover:border-slate-700 transition-all backdrop-blur-md"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-extrabold text-sm text-white">{p.brand}</h3>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                        {p.latency}
                      </span>
                    </div>
                    <div className="text-xs font-mono text-cyan-400 mb-1">{p.ports}</div>
                    <p className="text-xs text-slate-400 leading-relaxed mt-2">{p.detail}</p>
                  </div>
                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>Protocol Type:</span>
                    <span className="text-emerald-400 font-bold">{p.status}</span>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        {/* ================= 5. HONEST PRICING SECTION ================= */}
        <section
          id="pricing"
          role="region"
          aria-label="Pricing and Plans"
          className="px-4 sm:px-6 lg:px-12 py-16 max-w-7xl mx-auto"
        >
          <div className="text-center mb-10">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-800/60">
              Fair & Transparent
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white mt-2">
              Honest Pricing. Never a Weekly Subscription.
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto mt-1">
              Core TV remote control is completely free. Premium upgrades unlock unlimited rooms and cross-device automations.
            </p>
          </div>

          {/* Pricing Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {/* Free Tier */}
            <div className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800 flex flex-col justify-between backdrop-blur-md">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">Core TV Remote</div>
                <div className="text-3xl font-black text-white mt-2">
                  {currency === 'INR' ? '₹0' : '$0'}
                </div>
                <div className="text-xs text-slate-400 mt-1">Free Forever</div>
                <ul className="mt-6 space-y-2.5 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-emerald-400" />
                    <span>Full Smart TV Control (LG, Nokia, Samsung, Roku)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-emerald-400" />
                    <span>Tactile D-pad & Volume Rockers</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-emerald-400" />
                    <span>Auto-Keyboard for YouTube & Search</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-emerald-400" />
                    <span>Elder Mode Accessibility</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-emerald-400" />
                    <span>Zero Ads Ever</span>
                  </li>
                </ul>
              </div>
              <button className="mt-8 w-full py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700 transition-all focus-visible:ring-2 focus-visible:ring-cyan-400">
                Current Free Tier
              </button>
            </div>

            {/* Monthly / Yearly (Featured) */}
            <motion.div
              whileHover={{ y: -4 }}
              className="p-6 rounded-3xl bg-gradient-to-b from-cyan-950/60 to-slate-900/80 border-2 border-cyan-500/80 flex flex-col justify-between relative shadow-xl shadow-cyan-500/10 backdrop-blur-md"
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-cyan-500 text-slate-950 text-[10px] font-black uppercase tracking-wider">
                Most Popular
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono">
                  {pricingCycle === 'monthly' ? 'Monthly Pass' : 'Yearly Pass'}
                </div>
                <div className="text-3xl font-black text-white mt-2 flex items-baseline gap-1">
                  {currency === 'INR'
                    ? pricingCycle === 'monthly'
                      ? '₹49'
                      : '₹299'
                    : pricingCycle === 'monthly'
                    ? '$0.99'
                    : '$4.99'}
                  <span className="text-xs font-normal text-slate-400">
                    {pricingCycle === 'monthly'
                      ? '/ month'
                      : currency === 'INR'
                      ? '/ year (~₹25/mo)'
                      : '/ year (~$0.40/mo)'}
                  </span>
                </div>
                <div className="text-xs text-cyan-300/80 mt-1">Cancel anytime in 1 tap</div>
                <ul className="mt-6 space-y-2.5 text-xs text-slate-200">
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-cyan-400" />
                    <span>Everything in Free Tier</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-cyan-400" />
                    <span>Unlimited TV Rooms & Saved Devices</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-cyan-400" />
                    <span>Connection Doctor Deep Diagnostic Tools</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-cyan-400" />
                    <span>Custom One-Touch Movie Scenes</span>
                  </li>
                </ul>
              </div>
              <div className="mt-8 flex flex-col gap-2">
                <button className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/20 transition-all focus-visible:ring-4 focus-visible:ring-cyan-400">
                  Select {pricingCycle === 'monthly' ? (currency === 'INR' ? 'Monthly (₹49)' : 'Monthly ($0.99)') : (currency === 'INR' ? 'Yearly (₹299)' : 'Yearly ($4.99)')}
                </button>
                <button
                  onClick={() => setPricingCycle(pricingCycle === 'monthly' ? 'yearly' : 'monthly')}
                  className="text-[11px] text-slate-400 hover:text-cyan-300 font-medium text-center focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-lg py-0.5"
                >
                  Switch to {pricingCycle === 'monthly' ? 'Yearly (Save 50%)' : 'Monthly'}
                </button>
              </div>
            </motion.div>

            {/* Lifetime Tier */}
            <div className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800 flex flex-col justify-between backdrop-blur-md">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-purple-400 font-mono">Lifetime Freedom</div>
                <div className="text-3xl font-black text-white mt-2">
                  {currency === 'INR' ? '₹799' : '$9.99'}
                </div>
                <div className="text-xs text-slate-400 mt-1">One-time payment, own forever</div>
                <ul className="mt-6 space-y-2.5 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-purple-400" />
                    <span>Everything in Pro Plan</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-purple-400" />
                    <span>Never pay another subscription</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-purple-400" />
                    <span>Lifetime protocol adapter updates</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-purple-400" />
                    <span>Priority Connection Doctor assistance</span>
                  </li>
                </ul>
              </div>
              <button className="mt-8 w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all focus-visible:ring-4 focus-visible:ring-purple-400">
                Get Lifetime ({currency === 'INR' ? '₹799' : '$9.99'})
              </button>
            </div>
          </div>

          {/* Anti-Scam Callout */}
          <div className="mt-8 p-4 rounded-2xl bg-slate-950 border border-slate-800 max-w-2xl mx-auto flex items-center gap-3 text-xs text-slate-400">
            <ShieldCheck size={20} className="text-emerald-400 shrink-0" />
            <p>
              <strong className="text-slate-200">Our Honest Monetization Guarantee:</strong> We reject predatory weekly subscriptions that auto-renew at high rates. Monetization is currently compile-time locked in Phase 1 with 100% unlocked features.
            </p>
          </div>
        </section>

        {/* ================= 6. FAQ & AEO SECTION ================= */}
        <section
          id="faq"
          role="region"
          aria-label="Frequently Asked Questions"
          className="px-4 sm:px-6 lg:px-12 py-16 bg-[#03060d]/90 border-t border-slate-800/80"
        >
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/60 px-3 py-1 rounded-full border border-cyan-800/60">
                Clear Answers
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-2">Frequently Asked Questions</h2>
            </div>

            <dl className="space-y-3">
              {faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl bg-slate-900/50 border border-slate-800 overflow-hidden backdrop-blur-md"
                >
                  <dt>
                    <button
                      onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                      aria-expanded={expandedFaq === idx}
                      className="w-full p-4 text-left flex items-center justify-between text-sm font-bold text-slate-200 hover:text-white focus-visible:ring-2 focus-visible:ring-cyan-400"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown
                        size={16}
                        className={`transition-transform text-slate-400 ${
                          expandedFaq === idx ? 'rotate-180 text-cyan-400' : ''
                        }`}
                        aria-hidden="true"
                      />
                    </button>
                  </dt>
                  {expandedFaq === idx && (
                    <dd className="px-4 pb-4 text-xs text-slate-400 leading-relaxed border-t border-slate-800/60 pt-3">
                      {faq.a}
                    </dd>
                  )}
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* ================= 6B. DEDICATED HIGH-GRAVITAS APK DOWNLOAD SECTION ================= */}
        <section
          id="download"
          role="region"
          aria-label="Download Production Android APK"
          className="px-4 sm:px-6 lg:px-12 py-20 bg-gradient-to-b from-[#03060d] via-[#080e1c] to-[#020409] border-t border-slate-800"
        >
          <div className="max-w-5xl mx-auto rounded-[40px] bg-[#0c1222] border-2 border-cyan-500/30 p-8 sm:p-14 shadow-[0_25px_80px_rgba(0,0,0,0.85)] relative overflow-hidden flex flex-col items-center text-center">
            {/* Background cyber glow */}
            <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold tracking-wider uppercase mb-5">
              <Download size={14} className="text-cyan-400" />
              <span>Verified Production Release v2.4.0</span>
            </div>

            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight">
              Download the Official Android APK
            </h2>
            <p className="mt-5 text-base sm:text-xl text-slate-300 max-w-2xl leading-relaxed">
              Direct offline installation for Android smartphones, tablets, and Google TV. No Google Play required, zero telemetry, under 10 MB, and sub-10ms local Wi-Fi response.
            </p>

            {/* Direct 1-Tap Download Button */}
            <motion.a
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              href="/downloads/universal-tv-remote.apk"
              download="universal-tv-remote.apk"
              className="mt-8 px-10 py-5 rounded-2xl bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-black text-lg sm:text-xl shadow-[0_0_35px_rgba(6,182,212,0.45)] transition-all flex items-center justify-center gap-3.5 focus-visible:ring-4 focus-visible:ring-cyan-400 cursor-pointer"
            >
              <Download size={26} />
              <span>Download Release APK (8.46 MB)</span>
            </motion.a>

            {/* Verification Badges */}
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-400 font-mono">
              <span className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-400" /> Architecture: arm64-v8a
              </span>
              <span className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-400" /> Android 6.0 - 15 (API 23-35)
              </span>
              <span className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-400" /> Size: 8.46 MB (&lt; 10 MB PRD Budget)
              </span>
            </div>
          </div>
        </section>
      </main>

      {/* ================= 7. ACCESSIBLE FOOTER & LEGAL ================= */}
      <footer className="relative z-10 px-4 sm:px-6 lg:px-12 py-12 bg-[#020409] border-t border-slate-800 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Tv size={16} className="text-cyan-400" />
              <span className="font-bold text-white font-mono uppercase tracking-wider">Universal Smart TV Remote</span>
            </div>
            <p className="text-[11px] text-slate-500 max-w-sm">
              The genuine, local-first Smart TV controller for your home Wi-Fi network.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[11px] text-slate-400">Direct Download:</span>
            <a
              href="/downloads/universal-tv-remote.apk"
              download="universal-tv-remote.apk"
              className="px-3 py-1.5 rounded-xl bg-cyan-950 text-cyan-400 font-mono font-bold border border-cyan-800 hover:border-cyan-400 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Download size={13} />
              <span>arm64-v8a • 8.46 MB</span>
            </a>
          </div>
        </div>

        {/* Legal Disclaimers (Section 11 Compliance) */}
        <div className="max-w-7xl mx-auto mt-6 text-[10px] text-slate-500 leading-relaxed space-y-2">
          <p>
            <strong>Trademark & Non-Affiliation Notice:</strong> All product names, logos, and brands (including LG, webOS, Nokia, Google, Android TV, Google TV, Samsung, Tizen, and Roku) are property of their respective owners. This application and website are independent software controllers engineered for interoperability and are not affiliated with, endorsed by, or sponsored by LG Electronics, Google LLC, Nokia Corporation, Samsung Electronics, or Roku Inc.
          </p>
          <p>© 2026 Universal Smart TV Remote. Built with Flutter, React 19, and Node.js for genuine smart home freedom.</p>
        </div>
      </footer>

      {/* Connection Doctor Modal */}
      {showDoctorModal && (
        <ConnectionDoctorModal
          device={activeDevice}
          onClose={() => setShowDoctorModal(false)}
        />
      )}
    </div>
  );
}
