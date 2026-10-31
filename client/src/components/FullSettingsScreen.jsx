import React, { useState } from 'react';
import {
  User,
  CreditCard,
  Vibrate,
  Volume2,
  Palette,
  Bug,
  Activity,
  ShieldCheck,
  Check,
  ChevronRight,
  LogOut,
  Mail,
  Lock,
  Send,
  Sparkles,
  Smartphone
} from 'lucide-react';
import AppLogo from './AppLogo';

export default function FullSettingsScreen({
  isPro = false,
  onOpenPaywall,
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
  // Modal States
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [bugModalOpen, setBugModalOpen] = useState(false);

  // User Auth State
  const [user, setUser] = useState({
    isLoggedIn: false,
    name: 'Guest User',
    email: '',
    plan: 'Free Core',
  });
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Payment State
  const [selectedPlan, setSelectedPlan] = useState('monthly'); // 'monthly' | 'lifetime'
  const [paymentMethod, setPaymentMethod] = useState('upi'); // 'upi' | 'card' | 'netbanking'

  // Bug Report State
  const [bugCategory, setBugCategory] = useState('Connection Failure');
  const [bugDescription, setBugDescription] = useState('');
  const [includeLogs, setIncludeLogs] = useState(true);
  const [submittedTicket, setSubmittedTicket] = useState(null);

  // Haptic Intensity
  const [hapticLevel, setHapticLevel] = useState('medium');

  const themes = [
    { id: 'cyan', label: 'Cyan', color: '#00F2FE' },
    { id: 'crimson', label: 'Crimson', color: '#FF3366' },
    { id: 'emerald', label: 'Emerald', color: '#00E676' },
    { id: 'midnight', label: 'Midnight', color: '#7928CA' },
  ];

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (!loginEmail) return;
    setUser({
      isLoggedIn: true,
      name: loginEmail.split('@')[0],
      email: loginEmail,
      plan: user.plan,
    });
    setLoginModalOpen(false);
    showToast(`Welcome back, ${loginEmail.split('@')[0]}!`);
  };

  const handleLogout = () => {
    setUser({
      isLoggedIn: false,
      name: 'Guest User',
      email: '',
      plan: 'Free Core',
    });
    showToast('Signed out of account');
  };

  const handlePaymentSubmit = () => {
    setUser((prev) => ({
      ...prev,
      plan: selectedPlan === 'monthly' ? 'Monthly Pro (₹49)' : 'Lifetime Pro (₹299)',
    }));
    setPaymentModalOpen(false);
    showToast(`Payment Successful! Activated ${selectedPlan === 'monthly' ? 'Monthly Pro' : 'Lifetime Pro'}`);
  };

  const handleBugSubmit = (e) => {
    e.preventDefault();
    if (!bugDescription) return;
    const ticketId = `BUG-${Math.floor(1000 + Math.random() * 9000)}`;
    setSubmittedTicket(ticketId);
    setTimeout(() => {
      setSubmittedTicket(null);
      setBugDescription('');
      setBugModalOpen(false);
      showToast(`Bug Report Submitted! Reference: ${ticketId}`);
    }, 2000);
  };

  const triggerTestHaptic = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      const ms = hapticLevel === 'light' ? 12 : hapticLevel === 'medium' ? 25 : 45;
      navigator.vibrate(ms);
      showToast(`Tested ${hapticLevel.toUpperCase()} haptic pulse (${ms}ms)`);
    } else {
      showToast('Haptic feedback simulated');
    }
  };

  return (
    <div className="w-[380px] max-w-full rounded-[44px] p-6 flex flex-col gap-6 border shadow-2xl backdrop-blur-2xl bg-[#161B2A]/90 border-white/10 font-jakarta max-h-[620px] overflow-y-auto pr-2">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-2 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <AppLogo size={28} />
          <div>
            <h2 className="text-sm font-black text-white uppercase tracking-wider font-orbitron">
              App Settings
            </h2>
            <div className="text-[10px] text-slate-400 font-semibold">India Smart TV Edition</div>
          </div>
        </div>
        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-700/50">
          v2.4.0
        </span>
      </div>

      {/* ================= SECTION 1: USER ACCOUNT & LOGIN ================= */}
      <div className="flex flex-col gap-2.5">
        <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase flex items-center gap-1.5">
          <User size={13} className="text-cyan-400" /> User Account & Cloud Sync
        </span>
        <div className="p-3.5 rounded-2xl bg-black/30 border border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-black text-white text-sm shadow-md">
              {user.isLoggedIn ? user.name[0].toUpperCase() : 'G'}
            </div>
            <div>
              <div className="text-xs font-black text-white">{user.name}</div>
              <div className="text-[10px] text-slate-400">
                {user.isLoggedIn ? user.email : 'Local Guest (Devices stored on LAN)'}
              </div>
            </div>
          </div>
          {user.isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-xl bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-bold hover:bg-red-500/30 transition-all flex items-center gap-1"
            >
              <LogOut size={12} /> Logout
            </button>
          ) : (
            <button
              onClick={() => setLoginModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs shadow-md transition-all active:scale-95"
            >
              Sign In
            </button>
          )}
        </div>
      </div>

      {/* ================= SECTION 2: SUBSCRIPTION & PAYMENT ================= */}
      <div className="flex flex-col gap-2.5">
        <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase flex items-center gap-1.5">
          <CreditCard size={13} className="text-emerald-400" /> Subscription & Transparent Billing
        </span>
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/40 to-slate-900/60 border border-emerald-500/30 flex items-center justify-between">
          <div>
            <div className="text-xs font-black text-white flex items-center gap-2">
              <span>{user.plan}</span>
              <span className="text-[9px] px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-extrabold uppercase border border-emerald-500/30">
                Active
              </span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Zero weekly traps • Cancel anytime • ₹49/month or ₹299 lifetime
            </div>
          </div>
          <button
            onClick={() => setPaymentModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-md transition-all active:scale-95 whitespace-nowrap ml-2"
          >
            Upgrade Plan
          </button>
        </div>
      </div>

      {/* ================= SECTION 3: HAPTICS & TOUCH FEEDBACK ================= */}
      <div className="flex flex-col gap-2.5">
        <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase flex items-center gap-1.5">
          <Vibrate size={13} className="text-purple-400" /> Haptic Vibration Feedback
        </span>
        <div className="p-3.5 rounded-2xl bg-black/30 border border-white/10 flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-slate-200">Enable Button Vibration</span>
            <button
              onClick={() => onToggleHaptic(!hapticEnabled)}
              className={`w-11 h-6 rounded-full p-1 transition-colors ${
                hapticEnabled ? 'bg-cyan-400' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  hapticEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {hapticEnabled && (
            <div className="flex items-center justify-between pt-2 border-t border-white/5">
              <span className="text-[11px] font-medium text-slate-400">Pulse Intensity:</span>
              <div className="flex gap-1.5">
                {['light', 'medium', 'heavy'].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => {
                      setHapticLevel(lvl);
                      triggerTestHaptic();
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${
                      hapticLevel === lvl
                        ? 'bg-cyan-500 text-slate-950 font-black'
                        : 'bg-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ================= SECTION 4: SOUND FX (SYNTHESIZED MECHANICAL CLICKS) ================= */}
      <div className="flex flex-col gap-2.5">
        <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase flex items-center gap-1.5">
          <Volume2 size={13} className="text-cyan-400" /> Synthesized Web Audio FX
        </span>
        <div className="p-3.5 rounded-2xl bg-black/30 border border-white/10 flex justify-between items-center">
          <div>
            <div className="text-xs font-semibold text-slate-200">Mechanical Switch Audio</div>
            <div className="text-[10px] text-slate-400">Micro-frequency clicks synthesized on device</div>
          </div>
          <button
            onClick={() => onToggleSound(!soundEnabled)}
            className={`w-11 h-6 rounded-full p-1 transition-colors ${
              soundEnabled ? 'bg-cyan-400' : 'bg-slate-700'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform ${
                soundEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* ================= SECTION 5: THEMES & VISUAL AESTHETICS ================= */}
      <div className="flex flex-col gap-2.5">
        <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase flex items-center gap-1.5">
          <Palette size={13} className="text-pink-400" /> Remote Theme & Particles
        </span>
        <div className="p-3.5 rounded-2xl bg-black/30 border border-white/10 flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-slate-200">Select Remote Colorway</span>
            <div className="flex gap-2">
              {themes.map((t) => {
                const isLocked = !isPro && t.id !== 'cyan';
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      if (isLocked) {
                        if (onOpenPaywall) onOpenPaywall();
                        else setPaymentModalOpen(true);
                      } else {
                        onThemeChange(t.id);
                      }
                    }}
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform relative ${
                      activeTheme === t.id ? 'ring-2 ring-white scale-110 shadow-lg' : 'opacity-70 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: t.color }}
                    title={isLocked ? `${t.label} (PRO Feature)` : t.label}
                  >
                    {activeTheme === t.id && <Check size={14} className="text-slate-950 font-bold" />}
                    {isLocked && (
                      <span className="absolute -top-1 -right-1 text-[9px] bg-black/90 text-amber-400 rounded-full p-0.5 border border-amber-400/50">
                        🔒
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-white/5">
            <span className="text-xs font-semibold text-slate-200">Ambient Background Particles</span>
            <button
              onClick={() => onToggleBgAnim(!bgAnimActive)}
              className={`w-11 h-6 rounded-full p-1 transition-colors ${
                bgAnimActive ? 'bg-cyan-400' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  bgAnimActive ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* ================= SECTION 6: BUG REPORT & DIAGNOSTICS ================= */}
      <div className="flex flex-col gap-2.5">
        <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase flex items-center gap-1.5">
          <Bug size={13} className="text-amber-400" /> Support, Diagnostics & Bug Report
        </span>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setBugModalOpen(true)}
            className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold text-xs flex items-center justify-center gap-2 hover:bg-amber-500/20 active:scale-95 transition-all"
          >
            <Bug size={14} /> Report a Bug
          </button>
          <button
            onClick={onOpenDoctor}
            className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-bold text-xs flex items-center justify-center gap-2 hover:bg-cyan-500/20 active:scale-95 transition-all"
          >
            <Activity size={14} /> Connection Doctor
          </button>
        </div>
      </div>

      {/* ================= USER LOGIN MODAL ================= */}
      {loginModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl p-6 bg-[#161B2A] border border-white/10 shadow-2xl flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-black text-white uppercase font-orbitron">User Sign In</h3>
              <button onClick={() => setLoginModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleLoginSubmit} className="flex flex-col gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-300 mb-1 block">Email Address</label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-400"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-300 mb-1 block">Password</label>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-400"
                />
              </div>
              <button
                type="submit"
                className="w-full mt-2 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs shadow-md transition-all active:scale-95"
              >
                Sign In & Sync Devices
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================= PAYMENT MODAL ================= */}
      {paymentModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl p-6 bg-[#161B2A] border border-white/10 shadow-2xl flex flex-col gap-4 font-jakarta">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-black text-white uppercase font-orbitron">Transparent Pricing</h3>
                <span className="text-[10px] text-emerald-400 font-semibold">Zero weekly traps • Honest billing</span>
              </div>
              <button onClick={() => setPaymentModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            {/* Plan selection */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setSelectedPlan('monthly')}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  selectedPlan === 'monthly'
                    ? 'bg-emerald-950/60 border-emerald-500 shadow-md'
                    : 'bg-black/30 border-white/5 opacity-70'
                }`}
              >
                <div className="text-[10px] font-bold uppercase text-slate-400">Monthly Pro</div>
                <div className="text-base font-black text-white mt-1">₹49 <span className="text-xs text-slate-400">/mo</span></div>
                <div className="text-[9px] text-emerald-300 mt-1">Cancel anytime</div>
              </button>

              <button
                onClick={() => setSelectedPlan('lifetime')}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  selectedPlan === 'lifetime'
                    ? 'bg-purple-950/60 border-purple-500 shadow-md'
                    : 'bg-black/30 border-white/5 opacity-70'
                }`}
              >
                <div className="text-[10px] font-bold uppercase text-purple-300">Lifetime Pro</div>
                <div className="text-base font-black text-white mt-1">₹299 <span className="text-xs text-slate-400">once</span></div>
                <div className="text-[9px] text-purple-300 mt-1">Forever freedom</div>
              </button>
            </div>

            {/* Payment method */}
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-bold text-slate-300">Select Payment Method</span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'upi', label: 'UPI (GPay/PhonePe)' },
                  { id: 'card', label: 'Debit/Credit Card' },
                  { id: 'netbanking', label: 'NetBanking' },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setPaymentMethod(m.id)}
                    className={`py-2 px-1 text-center rounded-xl text-[10px] font-bold border transition-all ${
                      paymentMethod === m.id
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-black'
                        : 'bg-black/30 text-slate-400 border-white/5'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handlePaymentSubmit}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/25 transition-all active:scale-95 flex items-center justify-center gap-1.5"
            >
              <ShieldCheck size={16} /> Complete ₹{selectedPlan === 'monthly' ? '49' : '299'} Payment
            </button>
          </div>
        </div>
      )}

      {/* ================= BUG REPORT MODAL ================= */}
      {bugModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 font-jakarta">
          <div className="w-full max-w-sm rounded-3xl p-6 bg-[#161B2A] border border-white/10 shadow-2xl flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Bug size={18} className="text-amber-400" />
                <h3 className="text-sm font-black text-white uppercase font-orbitron">Report a Bug</h3>
              </div>
              <button onClick={() => setBugModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            {submittedTicket ? (
              <div className="py-8 flex flex-col items-center justify-center text-center gap-2">
                <Check size={36} className="text-emerald-400 animate-bounce" />
                <div className="text-sm font-black text-white">Report Successfully Filed!</div>
                <div className="text-xs text-cyan-300 font-mono">Reference Ticket: {submittedTicket}</div>
                <div className="text-[11px] text-slate-400">Our engineering team has received your redacted diagnostics.</div>
              </div>
            ) : (
              <form onSubmit={handleBugSubmit} className="flex flex-col gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 mb-1 block">Issue Category</label>
                  <select
                    value={bugCategory}
                    onChange={(e) => setBugCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                  >
                    <option>Connection Failure (Wi-Fi/LAN)</option>
                    <option>Remote Button Latency / Unresponsive</option>
                    <option>OTT App Failed to Launch</option>
                    <option>Touchpad Drift or Pointer Issue</option>
                    <option>UI Alignment or Theme Glitch</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 mb-1 block">Describe What Happened</label>
                  <textarea
                    rows={3}
                    required
                    value={bugDescription}
                    onChange={(e) => setBugDescription(e.target.value)}
                    placeholder="E.g. Tapping Hotstar launched YouTube instead, or TV refused connection..."
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400 resize-none font-medium"
                  />
                </div>

                <label className="flex items-center gap-2 text-[11px] text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeLogs}
                    onChange={(e) => setIncludeLogs(e.target.checked)}
                    className="rounded bg-black/40 border-white/20 text-amber-500 focus:ring-0"
                  />
                  <span>Attach redacted local network diagnostics</span>
                </label>

                <button
                  type="submit"
                  className="w-full mt-2 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <Send size={14} /> Submit Bug Report
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
