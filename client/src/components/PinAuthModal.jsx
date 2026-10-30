import React, { useState } from 'react';
import { Lock, KeyRound, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { setupPin, loginPin } from '../utils/api';
import { triggerHaptic } from '../utils/haptics';

export default function PinAuthModal({ isConfigured, onAuthenticated }) {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const isSetup = !isConfigured;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (pin.length < 4) {
      setError('PIN must be at least 4 digits');
      return;
    }

    if (isSetup && pin !== confirmPin) {
      setError('PINs do not match');
      return;
    }

    setLoading(true);
    triggerHaptic('medium');

    try {
      if (isSetup) {
        await setupPin(pin);
      } else {
        await loginPin(pin);
      }
      onAuthenticated();
    } catch (err) {
      setError(err.message || 'Authentication failed');
      setPin('');
      setConfirmPin('');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyClick = (val) => {
    triggerHaptic('light');
    if (val === 'DEL') {
      setPin((prev) => prev.slice(0, -1));
    } else if (val === 'CLEAR') {
      setPin('');
    } else if (pin.length < 8) {
      setPin((prev) => prev + val);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 text-slate-100 flex flex-col items-center text-center">
        
        <div className="p-3 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 mb-3">
          {isSetup ? <KeyRound size={26} /> : <Lock size={26} />}
        </div>

        <h3 className="font-extrabold text-lg text-white">
          {isSetup ? 'Setup Hub Security PIN' : 'Enter Hub PIN'}
        </h3>
        <p className="text-xs text-slate-400 mt-1 mb-4 leading-relaxed">
          {isSetup
            ? 'Set a 4-8 digit master PIN to secure your local home hub against unauthorized network access.'
            : 'Enter your master PIN to access and control home devices.'}
        </p>

        {error && (
          <div className="w-full mb-4 p-2.5 rounded-xl bg-rose-950/80 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2">
            <ShieldAlert size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* PIN Display */}
        <div className="w-full flex items-center justify-center gap-2 mb-4 h-10">
          {Array.from({ length: Math.max(pin.length, 4) }).map((_, idx) => (
            <span
              key={idx}
              className={`w-3.5 h-3.5 rounded-full transition-all ${
                idx < pin.length ? 'bg-blue-500 shadow-md shadow-blue-500/50 scale-110' : 'bg-slate-800 border border-slate-700'
              }`}
            />
          ))}
        </div>

        {isSetup && (
          <div className="w-full mb-3 text-left">
            <label className="text-[11px] font-semibold text-slate-400">Confirm PIN:</label>
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value)}
              placeholder="Confirm your PIN"
              className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-center text-white text-base tracking-widest focus:outline-none focus:border-blue-500"
            />
          </div>
        )}

        {/* Numeric Keypad for fast touch screen usage */}
        <div className="grid grid-cols-3 gap-2 w-full my-2">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'CLEAR', '0', 'DEL'].map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => handleKeyClick(val)}
              className="py-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-base font-semibold text-slate-200 hover:text-white hover:bg-slate-800 active:scale-95 transition-all"
            >
              {val === 'DEL' ? '⌫' : val === 'CLEAR' ? 'C' : val}
            </button>
          ))}
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading || pin.length < 4}
          className="w-full mt-3 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 font-bold text-sm text-white shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          {loading ? 'Verifying...' : isSetup ? 'Save & Unlock' : 'Unlock Remote'}
        </button>

      </div>
    </div>
  );
}
