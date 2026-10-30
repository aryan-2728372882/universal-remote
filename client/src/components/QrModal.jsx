import React from 'react';
import { X, Smartphone, ExternalLink, Wifi } from 'lucide-react';

export default function QrModal({ isOpen, onClose, hubInfo }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 text-slate-100 flex flex-col items-center text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-all"
        >
          <X size={18} />
        </button>

        <div className="p-3 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 mb-3">
          <Smartphone size={24} />
        </div>

        <h3 className="font-extrabold text-lg text-white">Scan with Phone Camera</h3>
        <p className="text-xs text-slate-400 mt-1 mb-4 leading-relaxed">
          Open this Universal Remote on any mobile phone connected to the same Wi-Fi. Add it to your home screen for full-screen PWA control!
        </p>

        {hubInfo?.qrCode ? (
          <div className="p-3 bg-white rounded-2xl shadow-lg border border-slate-700">
            <img src={hubInfo.qrCode} alt="Remote URL QR Code" className="w-52 h-52 object-contain" />
          </div>
        ) : (
          <div className="w-52 h-52 flex items-center justify-center bg-slate-950 rounded-2xl text-slate-500 text-xs">
            Generating QR Code...
          </div>
        )}

        <div className="mt-4 p-2.5 rounded-xl bg-slate-950 border border-slate-800 w-full text-xs font-mono text-blue-400 break-all select-all flex items-center justify-center gap-2">
          <Wifi size={14} className="text-emerald-400 shrink-0" />
          <span>{hubInfo?.hubUrl || 'http://192.168.1.x:3000'}</span>
        </div>
      </div>
    </div>
  );
}
