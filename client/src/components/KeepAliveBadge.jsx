import React from 'react';
import { Activity, ShieldCheck, Zap } from 'lucide-react';

export default function KeepAliveBadge({ status, onClick }) {
  const isHealthy = status?.active;
  const lastTime = status?.lastPingTime 
    ? new Date(status.lastPingTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : 'Pending';

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-700/60 hover:border-slate-500 transition-all text-xs text-slate-300 shadow-sm"
      title="Render 24/7 Keep-Alive Monitor"
    >
      <span className="relative flex h-2 w-2">
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isHealthy ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
        <span className={`relative inline-flex rounded-full h-2 w-2 ${isHealthy ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
      </span>
      <span className="font-medium text-slate-200">24/7 Render Keep-Alive</span>
      <span className="text-[10px] text-slate-400 border-l border-slate-700 pl-2">
        {status?.totalPings ? `Pinged (${status.totalPings})` : 'Active'}
      </span>
    </button>
  );
}
