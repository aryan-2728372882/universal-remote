import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  FastForward,
  Rewind,
  ArrowLeft,
  Home,
  Menu,
  Power,
  Wifi,
  Lock,
  Sparkles,
  ShieldCheck,
  CreditCard,
  CheckCircle2,
  Mic
} from 'lucide-react';
import { playTactileClick } from '../utils/audioFeedback';
import NavigationDock from './NavigationDock';
import AppsHub from './AppsHub';
import AiVoiceAssistant from './AiVoiceAssistant';
import FullSettingsScreen from './FullSettingsScreen';

export default function LuxuryRemote({
  device,
  state = {},
  onExecute,
  onOpenDoctor,
  activeTheme = 'cyan',
  onThemeChange
}) {
  // Navigation Dock Tab: strictly 'remote' | 'settings' | 'voice' | 'apps'
  const [mainTab, setMainTab] = useState('remote');

  // Pro Subscription State (Monetization & Entitlement compliant with Section 16)
  const [isPro, setIsPro] = useState(false);
  const [paywallModalOpen, setPaywallModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('monthly'); // 'monthly' | 'lifetime'
  const [paymentMethod, setPaymentMethod] = useState('upi'); // 'upi' | 'card' | 'netbanking'

  // Theme & Preferences State
  const [theme, setTheme] = useState(activeTheme);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hapticEnabled, setHapticEnabled] = useState(true);
  const [bgAnimActive, setBgAnimActive] = useState(true);

  // Playback & Device Interaction State
  const [isPoweredOn, setIsPoweredOn] = useState(state?.power ?? true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(state?.isMuted ?? false);
  const [currentVolume, setCurrentVolume] = useState(state?.volume ?? 24);
  const [toastMessage, setToastMessage] = useState(null);

  // Audio Context Web Audio Synthesizer
  const audioCtxRef = useRef(null);

  const initAudio = () => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) audioCtxRef.current = new AudioCtx();
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  const playBeep = (freq = 600, type = 'sine', duration = 0.05, gainVal = 0.08) => {
    if (!soundEnabled || !isPoweredOn) return;
    initAudio();
    try {
      const ctx = audioCtxRef.current;
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(gainVal, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {}
  };

  const triggerHaptic = () => {
    if (hapticEnabled && typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(15);
      } catch {}
    }
  };

  const showToast = (text) => {
    setToastMessage(text);
    setTimeout(() => {
      setToastMessage((prev) => (prev === text ? null : prev));
    }, 2200);
  };

  const handleAction = (actionKey, label = actionKey) => {
    if (!isPoweredOn && actionKey !== 'power') return;

    initAudio();
    playTactileClick(actionKey === 'enter' || actionKey === 'power' ? 'heavy' : 'click');
    playBeep(520, 'triangle', 0.05, 0.06);
    triggerHaptic();

    showToast(`TV: ${label}`);

    if (actionKey === 'volumeUp') {
      setCurrentVolume((prev) => Math.min(40, prev + 1));
    } else if (actionKey === 'volumeDown') {
      setCurrentVolume((prev) => Math.max(0, prev - 1));
    } else if (actionKey === 'mute') {
      setIsMuted((prev) => !prev);
    } else if (actionKey === 'play') {
      setIsPlaying((prev) => !prev);
    }

    if (onExecute && device?.id) {
      onExecute(device.id, actionKey);
    }
  };

  const togglePower = () => {
    const next = !isPoweredOn;
    setIsPoweredOn(next);
    initAudio();
    playTactileClick('heavy');
    playBeep(next ? 880 : 330, 'sine', 0.1, 0.1);
    triggerHaptic();
    showToast(next ? 'TV Powered On' : 'TV Standby Mode');
    if (onExecute && device?.id) {
      onExecute(device.id, 'power');
    }
  };

  const handleAppLaunch = (appName, appId) => {
    if (!isPoweredOn) return;
    initAudio();
    playTactileClick('click');
    playBeep(700, 'sine', 0.06, 0.08);
    triggerHaptic();
    showToast(`Launching ${appName}...`);
    if (onExecute && device?.id) {
      onExecute(device.id, 'launch_app', { appId: appId || appName.toLowerCase() });
    }
  };

  const handleUpgradeToPro = () => {
    setIsPro(true);
    setPaywallModalOpen(false);
    showToast(`⭐ Upgraded to PRO (${selectedPlan === 'monthly' ? '₹49/month' : '₹299 Lifetime'})! All features unlocked.`);
  };

  const deviceTitle = device?.name || 'Smart TV';

  return (
    <div className="relative flex flex-col items-center w-full max-w-[420px] mx-auto select-none font-jakarta">
      {/* Toast Notification Pill */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.95 }}
            className="fixed top-5 z-50 px-4 py-2 rounded-full bg-[#0d1424]/95 border border-cyan-500/40 text-cyan-300 text-xs font-bold shadow-[0_0_24px_rgba(6,182,212,0.35)] backdrop-blur-xl"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pro Upgrade & Honest Paywall Modal */}
      <AnimatePresence>
        {paywallModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="w-full max-w-sm rounded-[32px] bg-[#0c101c] border border-cyan-500/40 p-5 shadow-[0_25px_60px_rgba(0,0,0,0.9)] flex flex-col gap-4 text-slate-100"
            >
              <div className="flex justify-between items-center pb-2 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-xl bg-cyan-500/20 text-cyan-400">
                    <Sparkles size={18} />
                  </span>
                  <div>
                    <h3 className="font-extrabold text-sm text-white">Unlock Universal Remote PRO</h3>
                    <p className="text-[10px] text-cyan-300 font-medium">Transparent Pricing • No Weekly Traps</p>
                  </div>
                </div>
                <button
                  onClick={() => setPaywallModalOpen(false)}
                  className="w-7 h-7 rounded-full bg-white/5 text-slate-400 hover:text-white flex items-center justify-center"
                >
                  ✕
                </button>
              </div>

              {/* Pro Features Unlocked */}
              <div className="flex flex-col gap-2 py-1 text-xs">
                <div className="flex items-center gap-2 text-slate-200">
                  <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                  <span><strong>AI Voice Assistant</strong> with hands-free TV dispatch</span>
                </div>
                <div className="flex items-center gap-2 text-slate-200">
                  <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                  <span><strong>Custom Luxury Themes</strong> (Crimson, Emerald, Midnight)</span>
                </div>
                <div className="flex items-center gap-2 text-slate-200">
                  <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                  <span><strong>Unlimited Smart TVs</strong> & Multi-Room Sync</span>
                </div>
                <div className="flex items-center gap-2 text-slate-200">
                  <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                  <span><strong>Sub-10ms Direct Wi-Fi LAN</strong> (Zero Ads Forever)</span>
                </div>
              </div>

              {/* Honest Pricing Tiers (PRD Section 16 compliant: ₹49/month or ₹299 lifetime, strictly NO weekly) */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedPlan('monthly')}
                  className={`p-3 rounded-2xl border text-left flex flex-col transition-all ${
                    selectedPlan === 'monthly'
                      ? 'bg-cyan-950/60 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                      : 'bg-black/30 border-white/5 opacity-70'
                  }`}
                >
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Monthly Pro</span>
                  <span className="text-lg font-black text-white mt-0.5">₹49</span>
                  <span className="text-[9px] text-slate-400">Cancel anytime</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedPlan('lifetime')}
                  className={`p-3 rounded-2xl border text-left flex flex-col transition-all relative overflow-hidden ${
                    selectedPlan === 'lifetime'
                      ? 'bg-gradient-to-br from-cyan-950 to-blue-950 border-cyan-400 shadow-[0_0_18px_rgba(6,182,212,0.4)]'
                      : 'bg-black/30 border-white/5 opacity-70'
                  }`}
                >
                  <span className="absolute top-1 right-2 text-[8px] bg-cyan-500 text-slate-950 font-black px-1.5 py-0.5 rounded-full">
                    BEST VALUE
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Lifetime Access</span>
                  <span className="text-lg font-black text-cyan-300 mt-0.5">₹299</span>
                  <span className="text-[9px] text-slate-400">One-time payment</span>
                </button>
              </div>

              {/* Payment Methods */}
              <div className="flex bg-black/40 p-1 rounded-xl border border-white/5 text-[11px] font-semibold">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`flex-1 py-1 rounded-lg transition-all ${
                    paymentMethod === 'upi' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400'
                  }`}
                >
                  UPI (GPay/PhonePe)
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`flex-1 py-1 rounded-lg transition-all ${
                    paymentMethod === 'card' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400'
                  }`}
                >
                  Card / NetBanking
                </button>
              </div>

              {/* Confirm Pay Button */}
              <button
                type="button"
                onClick={handleUpgradeToPro}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/30 active:scale-95 transition-all"
              >
                <Sparkles size={14} />
                <span>Activate {selectedPlan === 'monthly' ? 'Monthly Pro (₹49)' : 'Lifetime Pro (₹299)'}</span>
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Remote Phone Frame Container */}
      <div className="w-full bg-[#07090e] border border-white/10 rounded-[44px] shadow-[0_30px_90px_rgba(0,0,0,0.9)] p-4 sm:p-5 flex flex-col relative overflow-hidden backdrop-blur-2xl">
        {/* ================= 1. CLEAN NATIVE TV HEADER BAR ================= */}
        <div className="w-full flex items-center justify-between px-2 pt-1 pb-3 mb-1 border-b border-white/5">
          <div className="flex items-center gap-3">
            {/* Connection Status Dot */}
            <div className="relative">
              <div
                className={`w-3.5 h-3.5 rounded-full ${
                  device ? 'bg-cyan-400 shadow-[0_0_14px_#00f2fe]' : 'bg-slate-600'
                }`}
              />
              {device && (
                <div className="absolute inset-0 rounded-full bg-cyan-400 animate-ping opacity-30" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-[17px] text-white tracking-tight">
                  {device ? device.name : 'Smart TV'}
                </span>
                <span
                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                    device
                      ? isPoweredOn
                        ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300'
                        : 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                      : 'bg-slate-800/80 border-white/10 text-slate-400'
                  }`}
                >
                  {device ? (isPoweredOn ? 'Connected' : 'Standby') : 'Ready'}
                </span>
                {isPro && (
                  <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-300 flex items-center gap-0.5">
                    ★ PRO
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-400 font-medium tracking-wide mt-0.5">
                {device
                  ? `${device.type?.toUpperCase() || 'WI-FI LAN'} • ${device.ip || 'Local Subnet'}`
                  : 'Sub-10ms Direct Wi-Fi LAN Dispatch'}
              </div>
            </div>
          </div>

          {/* Circular Red Power Button */}
          <button
            onClick={togglePower}
            className="w-12 h-12 rounded-full bg-gradient-to-b from-[#1c202a] to-[#0f1118] border border-white/10 flex items-center justify-center shadow-[0_6px_16px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.1)] active:scale-92 transition-all hover:border-red-500/40"
            title="Power Toggle"
          >
            <Power
              size={20}
              className={`transition-all duration-300 ${
                isPoweredOn
                  ? 'text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]'
                  : 'text-slate-500'
              }`}
            />
          </button>
        </div>

        {/* ================= 2. ACTIVE VIEW CONTAINER ================= */}
        <div className="flex-1 w-full flex flex-col justify-between py-2 min-h-[520px]">
          {mainTab === 'apps' ? (
            /* Apps Hub view: Indian OTT apps are strictly shown here in the Apps section */
            <div className="flex-1 py-1">
              <AppsHub onLaunchApp={handleAppLaunch} isPoweredOn={isPoweredOn} />
            </div>
          ) : mainTab === 'settings' ? (
            /* Settings view: Dedicated settings section replacing ambilight */
            <div className="flex-1 py-1">
              <FullSettingsScreen
                isPro={isPro}
                onOpenPaywall={() => setPaywallModalOpen(true)}
                activeTheme={theme}
                onThemeChange={(newTheme) => {
                  if (!isPro && newTheme !== 'cyan') {
                    setPaywallModalOpen(true);
                    return;
                  }
                  setTheme(newTheme);
                  if (onThemeChange) onThemeChange(newTheme);
                }}
                bgAnimActive={bgAnimActive}
                onToggleBgAnim={setBgAnimActive}
                soundEnabled={soundEnabled}
                onToggleSound={setSoundEnabled}
                hapticEnabled={hapticEnabled}
                onToggleHaptic={setHapticEnabled}
                onOpenDoctor={onOpenDoctor}
                showToast={showToast}
              />
            </div>
          ) : mainTab === 'voice' ? (
            /* AI Voice view (LOCKED for Free Users, UNLOCKED for Pro) */
            <div className="flex-1 py-1">
              {!isPro ? (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center rounded-[32px] bg-[#090d18] border border-cyan-500/20 my-4 shadow-2xl">
                  <div className="w-16 h-16 rounded-full bg-cyan-950/80 border border-cyan-500/50 flex items-center justify-center mb-4 text-cyan-300 shadow-[0_0_25px_rgba(6,182,212,0.3)]">
                    <Lock size={28} />
                  </div>
                  <div className="inline-block px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-extrabold text-[10px] tracking-wider uppercase mb-2">
                    PRO Feature
                  </div>
                  <h3 className="font-black text-lg text-white mb-2">AI Voice Assistant</h3>
                  <p className="text-xs text-slate-400 max-w-[280px] leading-relaxed mb-6">
                    Speak natural commands like <em>"Play Hotstar cricket"</em> or <em>"Set volume to 20"</em> with instant local LAN execution.
                  </p>
                  <button
                    onClick={() => setPaywallModalOpen(true)}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/30 active:scale-95 transition-all"
                  >
                    <Sparkles size={16} />
                    <span>Unlock AI Voice (from ₹49/month)</span>
                  </button>
                  <p className="text-[10px] text-slate-500 mt-3">
                    Transparent pricing • ₹49/mo or ₹299 lifetime • Zero weekly traps
                  </p>
                </div>
              ) : (
                <AiVoiceAssistant onExecute={onExecute} device={device} />
              )}
            </div>
          ) : (
            /* ================= 4. MAIN REMOTE SECTION (NO APPS) ================= */
            <div className="flex-1 flex flex-col items-center justify-between gap-4 py-1">
              {/* --- A. Circular Volume Wheel Dial --- */}
              <div className="relative w-[240px] h-[240px] flex items-center justify-center">
                {/* Outer Track Disc with Cyan Accents */}
                <div className="absolute inset-0 rounded-full border border-white/10 bg-gradient-to-b from-[#131724] to-[#0a0c12] shadow-[0_12px_36px_rgba(0,0,0,0.8),inset_0_2px_4px_rgba(255,255,255,0.06)]" />

                {/* Subtle Cyan Angle Ticks (10, 2, 4, 8 o'clock) */}
                <span className="absolute top-5 left-10 w-3 h-0.5 bg-cyan-400/80 -rotate-45 rounded-full shadow-[0_0_6px_#00f2fe]" />
                <span className="absolute top-5 right-10 w-3 h-0.5 bg-cyan-400/80 rotate-45 rounded-full shadow-[0_0_6px_#00f2fe]" />
                <span className="absolute bottom-5 left-10 w-3 h-0.5 bg-cyan-400/80 rotate-45 rounded-full shadow-[0_0_6px_#00f2fe]" />
                <span className="absolute bottom-5 right-10 w-3 h-0.5 bg-cyan-400/80 -rotate-45 rounded-full shadow-[0_0_6px_#00f2fe]" />

                {/* Left: Volume Down (-) Button */}
                <button
                  onClick={() => handleAction('volumeDown', 'Vol -')}
                  className="absolute left-4 w-11 h-11 rounded-full bg-[#1b202c] border border-white/10 text-slate-200 font-bold text-lg flex items-center justify-center hover:border-cyan-400 active:scale-90 transition-all shadow-md z-10"
                  title="Volume Down"
                >
                  -
                </button>

                {/* Center Readout: VOLUME, 24 (Cyan), dB Max 40 */}
                <div className="flex flex-col items-center justify-center pointer-events-none select-none z-0">
                  <span className="text-[11px] font-bold tracking-widest text-slate-400 uppercase">
                    VOLUME
                  </span>
                  <span className="text-4xl font-extrabold text-cyan-300 my-0.5 drop-shadow-[0_0_12px_rgba(0,242,254,0.6)]">
                    {currentVolume}
                  </span>
                  <span className="text-[10px] font-medium text-slate-400">
                    dB Max 40
                  </span>
                </div>

                {/* Right: Volume Up (+) Button */}
                <button
                  onClick={() => handleAction('volumeUp', 'Vol +')}
                  className="absolute right-4 w-11 h-11 rounded-full bg-[#1b202c] border border-white/10 text-slate-200 font-bold text-lg flex items-center justify-center hover:border-cyan-400 active:scale-90 transition-all shadow-md z-10"
                  title="Volume Up"
                >
                  +
                </button>
              </div>

              {/* --- B. Circular D-Pad Controller --- */}
              <div className="relative w-[230px] h-[230px] flex items-center justify-center">
                {/* Outer D-Pad Base Ring */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-b from-[#11141e] to-[#080a0f] border border-white/10 shadow-[0_12px_30px_rgba(0,0,0,0.8),inset_0_1px_2px_rgba(255,255,255,0.08)]" />

                {/* UP CHEVRON BUTTON */}
                <button
                  onClick={() => handleAction('up', 'Up')}
                  className="absolute top-2.5 left-1/2 -translate-x-1/2 w-16 h-12 rounded-2xl bg-[#181d29] border border-white/10 flex items-center justify-center text-slate-300 hover:text-cyan-300 hover:border-cyan-400/40 active:scale-90 transition-all z-10 shadow-sm"
                  title="Up"
                >
                  <span className="text-sm font-bold">▲</span>
                </button>

                {/* LEFT CHEVRON BUTTON */}
                <button
                  onClick={() => handleAction('left', 'Left')}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 w-12 h-16 rounded-2xl bg-[#181d29] border border-white/10 flex items-center justify-center text-slate-300 hover:text-cyan-300 hover:border-cyan-400/40 active:scale-90 transition-all z-10 shadow-sm"
                  title="Left"
                >
                  <span className="text-sm font-bold">◀</span>
                </button>

                {/* CENTER CIRCULAR OK BUTTON WITH CYAN-PURPLE NEON RING GLOW */}
                <button
                  onClick={() => handleAction('enter', 'OK')}
                  className="w-20 h-20 rounded-full bg-gradient-to-br from-[#1d2333] to-[#0c0f17] border-2 border-cyan-400 flex items-center justify-center shadow-[0_0_24px_rgba(0,242,254,0.45),inset_0_0_14px_rgba(139,92,246,0.35)] active:scale-90 transition-all z-20 group"
                  title="Select / OK"
                >
                  <span className="font-extrabold text-base tracking-wider text-white group-hover:text-cyan-300 transition-colors">
                    OK
                  </span>
                </button>

                {/* RIGHT CHEVRON BUTTON */}
                <button
                  onClick={() => handleAction('right', 'Right')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-12 h-16 rounded-2xl bg-[#181d29] border border-white/10 flex items-center justify-center text-slate-300 hover:text-cyan-300 hover:border-cyan-400/40 active:scale-90 transition-all z-10 shadow-sm"
                  title="Right"
                >
                  <span className="text-sm font-bold">▶</span>
                </button>

                {/* DOWN CHEVRON BUTTON */}
                <button
                  onClick={() => handleAction('down', 'Down')}
                  className="absolute bottom-2.5 left-1/2 -translate-x-1/2 w-16 h-12 rounded-2xl bg-[#181d29] border border-white/10 flex items-center justify-center text-slate-300 hover:text-cyan-300 hover:border-cyan-400/40 active:scale-90 transition-all z-10 shadow-sm"
                  title="Down"
                >
                  <span className="text-sm font-bold">▼</span>
                </button>
              </div>

              {/* --- C. Playback Controls Row (4 Buttons) --- */}
              <div className="w-full grid grid-cols-4 gap-2 px-1">
                {/* 1. Rewind */}
                <button
                  onClick={() => handleAction('rewind', 'Rewind')}
                  className="h-16 rounded-2xl bg-[#141824] border border-white/10 flex flex-col items-center justify-center gap-1 text-slate-300 hover:border-white/25 active:scale-92 transition-all shadow-md"
                  title="Rewind"
                >
                  <Rewind size={18} className="text-slate-300" />
                  <span className="text-[11px] font-semibold tracking-tight text-slate-400">
                    Rewind
                  </span>
                </button>

                {/* 2. Play (Active Cyan Glowing State) */}
                <button
                  onClick={() => handleAction('play', isPlaying ? 'Pause' : 'Play')}
                  className={`h-16 rounded-2xl flex flex-col items-center justify-center gap-1 active:scale-92 transition-all shadow-lg ${
                    isPlaying
                      ? 'bg-[#0b2430] border-1.5 border-cyan-400 text-cyan-300 shadow-[0_0_18px_rgba(0,242,254,0.35)]'
                      : 'bg-[#141824] border border-white/10 text-slate-300'
                  }`}
                  title="Play / Pause"
                >
                  <Play size={18} className={isPlaying ? 'text-cyan-400 fill-cyan-400' : 'text-slate-300'} />
                  <span className={`text-[11px] font-bold tracking-tight ${isPlaying ? 'text-cyan-300' : 'text-slate-400'}`}>
                    Play
                  </span>
                </button>

                {/* 3. Fast Fwd */}
                <button
                  onClick={() => handleAction('fastForward', 'Fast Fwd')}
                  className="h-16 rounded-2xl bg-[#141824] border border-white/10 flex flex-col items-center justify-center gap-1 text-slate-300 hover:border-white/25 active:scale-92 transition-all shadow-md"
                  title="Fast Forward"
                >
                  <FastForward size={18} className="text-slate-300" />
                  <span className="text-[11px] font-semibold tracking-tight text-slate-400">
                    Fast Fwd
                  </span>
                </button>

                {/* 4. Mute */}
                <button
                  onClick={() => handleAction('mute', isMuted ? 'Unmute' : 'Mute')}
                  className={`h-16 rounded-2xl border flex flex-col items-center justify-center gap-1 active:scale-92 transition-all shadow-md ${
                    isMuted
                      ? 'bg-red-500/20 border-red-500 text-red-400'
                      : 'bg-[#141824] border-white/10 text-slate-300 hover:border-white/25'
                  }`}
                  title="Mute Audio"
                >
                  <VolumeX size={18} className={isMuted ? 'text-red-400' : 'text-slate-300'} />
                  <span className={`text-[11px] font-semibold tracking-tight ${isMuted ? 'text-red-400' : 'text-slate-400'}`}>
                    Mute
                  </span>
                </button>
              </div>

              {/* --- D. Secondary Navigation Row (3 Buttons: Back, Home, Menu) --- */}
              <div className="w-full grid grid-cols-3 gap-2 px-1">
                {/* Back */}
                <button
                  onClick={() => handleAction('back', 'Back')}
                  className="h-12 rounded-2xl bg-[#141824] border border-white/10 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 hover:border-white/25 active:scale-92 transition-all shadow-md"
                >
                  <ArrowLeft size={16} />
                  <span>Back</span>
                </button>

                {/* Home */}
                <button
                  onClick={() => handleAction('home', 'Home')}
                  className="h-12 rounded-2xl bg-[#141824] border border-white/10 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 hover:border-white/25 active:scale-92 transition-all shadow-md"
                >
                  <Home size={16} />
                  <span>Home</span>
                </button>

                {/* Menu */}
                <button
                  onClick={() => handleAction('menu', 'Menu')}
                  className="h-12 rounded-2xl bg-[#141824] border border-white/10 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 hover:border-white/25 active:scale-92 transition-all shadow-md"
                >
                  <Menu size={16} />
                  <span>Menu</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ================= 5. BOTTOM NAVIGATION DOCK (4 BUTTONS) ================= */}
        {/* Strictly the 4 buttons: Remote, Settings (replaces ambilight), AI Voice, Apps */}
        <NavigationDock activeTab={mainTab} onSelectTab={setMainTab} />
      </div>
    </div>
  );
}
