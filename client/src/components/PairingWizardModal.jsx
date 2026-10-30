import React, { useState } from 'react';
import { X, Tv, ShieldCheck, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';
import { pairDevice } from '../utils/api';
import { triggerHaptic } from '../utils/haptics';

export default function PairingWizardModal({ isOpen, onClose, device, onPaired }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen || !device) return null;

  const isAndroidTv = device.type === 'android-tv' || device.id === 'nokia-tv';
  const isWebos = device.type === 'lg-webos' || device.id === 'lg-tv';

  const handlePair = async (e) => {
    if (e) e.preventDefault();
    setError(null);
    setLoading(true);
    triggerHaptic('medium');

    try {
      const res = await pairDevice(device.id, code);
      if (res.ok) {
        setSuccess(true);
        triggerHaptic('heavy');
        setTimeout(() => {
          setSuccess(false);
          onPaired();
          onClose();
        }, 1500);
      } else {
        setError(res.error || 'Pairing failed. Please verify the code and try again.');
      }
    } catch (err) {
      setError(err.message || 'Pairing error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 text-slate-100 flex flex-col gap-4">
        
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-amber-600/20 text-amber-400 border border-amber-500/30">
              <Tv size={22} />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">Pair {device.name}</h3>
              <p className="text-xs text-slate-400">One-time security authorization</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-2xl bg-rose-950/80 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="p-6 rounded-2xl bg-emerald-950/80 border border-emerald-800 text-center flex flex-col items-center gap-2 animate-in zoom-in-95">
            <CheckCircle2 size={40} className="text-emerald-400 animate-bounce" />
            <h4 className="font-bold text-white text-base">Pairing Successful!</h4>
            <p className="text-xs text-emerald-300">Device is now authorized and ready for direct local control.</p>
          </div>
        ) : isAndroidTv ? (
          /* Android TV Pairing Flow */
          <form onSubmit={handlePair} className="flex flex-col gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-amber-400 font-semibold">
                <ShieldCheck size={16} />
                <span>Pairing Code on TV Screen</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Your TV screen should display a <strong>6-character pairing code</strong> (e.g. <code>W3K9P1</code>).
                Type it below to finish pairing.
              </p>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Enter TV Pairing Code:
              </label>
              <input
                type="text"
                autoFocus
                maxLength={8}
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. AB12CD"
                className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-center text-xl font-mono tracking-widest text-white uppercase focus:outline-none focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading || code.trim().length === 0}
              className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 font-bold text-sm text-white shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 active:scale-95 transition-all mt-1"
            >
              {loading && <RefreshCw size={16} className="animate-spin" />}
              <span>{loading ? 'Authorizing with TV...' : 'Confirm Pairing Code'}</span>
            </button>
          </form>
        ) : isWebos ? (
          /* LG webOS Pairing Flow */
          <div className="flex flex-col gap-4">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 flex flex-col gap-2.5">
              <div className="flex items-center gap-2 text-blue-400 font-semibold">
                <Tv size={16} />
                <span>Accept Prompt on LG TV</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                A prompt has been sent to your LG webOS TV screen asking to allow <strong>Universal Remote</strong>.
              </p>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
                👉 Use your physical LG TV remote to select <strong className="text-white">"YES" / "ACCEPT"</strong> on the TV.
              </div>
            </div>

            <button
              onClick={() => handlePair()}
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 font-bold text-sm text-white shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              {loading && <RefreshCw size={16} className="animate-spin" />}
              <span>{loading ? 'Checking with TV...' : "I Accepted on TV - Connect Now"}</span>
            </button>
          </div>
        ) : (
          /* Generic Device */
          <form onSubmit={handlePair} className="flex flex-col gap-3">
            <div>
              <label className="text-xs text-slate-400">PIN / Access Token:</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter access code"
                className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500 text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 font-bold text-white text-sm"
            >
              {loading ? 'Connecting...' : 'Authorize'}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
