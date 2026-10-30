import React, { useState } from 'react';
import {
  X,
  Activity,
  Flame,
  Tv,
  Wind,
  CheckCircle,
  Copy,
  ExternalLink,
  Shield,
  Radio,
  Server
} from 'lucide-react';
import { configureRenderUrl, setupThinQ } from '../utils/api';
import { triggerHaptic } from '../utils/haptics';

export default function SettingsModal({ isOpen, onClose, keepAliveStatus, onReload }) {
  const [activeTab, setActiveTab] = useState('keepAlive'); // 'keepAlive', 'thinq', 'nokia'
  const [renderUrl, setRenderUrl] = useState(keepAliveStatus?.targetUrl || '');
  const [copied, setCopied] = useState(false);

  // ThinQ Credentials Form
  const [thinqEmail, setThinqEmail] = useState('');
  const [thinqPass, setThinqPass] = useState('');
  const [thinqCountry, setThinqCountry] = useState('IN');
  const [thinqStatusMsg, setThinqStatusMsg] = useState(null);
  const [isSubmittingThinq, setIsSubmittingThinq] = useState(false);

  if (!isOpen) return null;

  const handleSaveRenderUrl = async (e) => {
    e.preventDefault();
    triggerHaptic('medium');
    try {
      await configureRenderUrl(renderUrl);
      alert('Render URL saved! Self-ping keep-alive is active.');
      onReload();
    } catch (err) {
      alert('Failed to save Render URL: ' + err.message);
    }
  };

  const handleConnectThinq = async (e) => {
    e.preventDefault();
    triggerHaptic('medium');
    setIsSubmittingThinq(true);
    setThinqStatusMsg(null);
    try {
      const res = await setupThinQ({
        username: thinqEmail,
        password: thinqPass,
        country: thinqCountry
      });
      setThinqStatusMsg(res.message);
      onReload();
    } catch (err) {
      setThinqStatusMsg('Error: ' + err.message);
    } finally {
      setIsSubmittingThinq(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    triggerHaptic('light');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 text-slate-100 max-h-[90vh] overflow-y-auto no-scrollbar">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <Server size={20} />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Universal Remote Hub</h3>
              <p className="text-xs text-slate-400">24/7 Render Keep-Alive & Cloud Integrations</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex gap-2 p-1 bg-slate-950 rounded-2xl border border-slate-800 my-4">
          <button
            onClick={() => setActiveTab('keepAlive')}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'keepAlive'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity size={14} />
            <span>Render 24/7 Ping</span>
          </button>

          <button
            onClick={() => setActiveTab('thinq')}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'thinq'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Wind size={14} />
            <span>LG ThinQ (AC & TV)</span>
          </button>

          <button
            onClick={() => setActiveTab('nokia')}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'nokia'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Tv size={14} />
            <span>Nokia Android TV</span>
          </button>
        </div>

        {/* TAB 1: Render 24/7 Keep-Alive */}
        {activeTab === 'keepAlive' && (
          <div className="flex flex-col gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-200 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  Self-Ping Keep-Alive Engine
                </span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-400 font-mono text-[10px] border border-emerald-800">
                  Interval: 11 mins
                </span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Render's free tier spins down web services after 15 minutes of inactivity. Our built-in keep-alive engine automatically pings your app every 11 minutes to keep it running 24/7 at <strong>$0 cost</strong>.
              </p>

              <form onSubmit={handleSaveRenderUrl} className="flex flex-col gap-2 pt-2">
                <label className="text-[11px] font-semibold text-slate-300">Your Render Public URL:</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={renderUrl}
                    onChange={(e) => setRenderUrl(e.target.value)}
                    placeholder="https://your-universal-remote.onrender.com"
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 rounded-xl font-semibold text-white hover:bg-blue-500 transition-all"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>

            {/* External Backup Pingers */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col gap-2.5">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Shield size={14} className="text-blue-400" />
                Optional 100% Redundant Backup Ping (Zero Cost)
              </span>
              <p className="text-slate-400">
                You can also paste this ping webhook into free cron tools like <a href="https://cron-job.org" target="_blank" rel="noreferrer" className="text-blue-400 underline">cron-job.org</a> or <a href="https://uptimerobot.com" target="_blank" rel="noreferrer" className="text-blue-400 underline">UptimeRobot</a>:
              </p>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800 font-mono text-[11px] text-blue-300">
                <span>{renderUrl ? `${renderUrl.replace(/\/+$/, '')}/api/ping` : 'https://<your-render-url>/api/ping'}</span>
                <button
                  onClick={() => copyToClipboard(renderUrl ? `${renderUrl.replace(/\/+$/, '')}/api/ping` : '')}
                  className="p-1.5 hover:text-white"
                  title="Copy URL"
                >
                  <Copy size={14} />
                </button>
              </div>
              {copied && <span className="text-[10px] text-emerald-400">Copied to clipboard!</span>}
            </div>
          </div>
        )}

        {/* TAB 2: LG ThinQ Setup */}
        {activeTab === 'thinq' && (
          <div className="flex flex-col gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col gap-3">
              <span className="font-semibold text-slate-200">LG ThinQ Cloud Connection</span>
              <p className="text-slate-400 leading-relaxed">
                Connect using the same LG account credentials that you will use in the LG ThinQ mobile app. Once connected, Render controls your LG AC and LG TV from anywhere in the world!
              </p>

              <form onSubmit={handleConnectThinq} className="flex flex-col gap-3 pt-1">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300">LG Account Email:</label>
                  <input
                    type="email"
                    value={thinqEmail}
                    onChange={(e) => setThinqEmail(e.target.value)}
                    placeholder="user@example.com"
                    required
                    className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300">LG Account Password:</label>
                  <input
                    type="password"
                    value={thinqPass}
                    onChange={(e) => setThinqPass(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300">Country Code:</label>
                  <select
                    value={thinqCountry}
                    onChange={(e) => setThinqCountry(e.target.value)}
                    className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="IN">India (IN)</option>
                    <option value="US">United States (US)</option>
                    <option value="GB">United Kingdom (GB)</option>
                    <option value="AE">UAE (AE)</option>
                    <option value="DE">Germany (DE)</option>
                    <option value="AU">Australia (AU)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingThinq}
                  className="w-full py-2.5 rounded-xl bg-blue-600 font-semibold text-white hover:bg-blue-500 transition-all shadow-md mt-2"
                >
                  {isSubmittingThinq ? 'Connecting to LG ThinQ...' : 'Link LG ThinQ Account'}
                </button>

                {thinqStatusMsg && (
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-blue-400 font-medium">
                    {thinqStatusMsg}
                  </div>
                )}
              </form>
            </div>
          </div>
        )}

        {/* TAB 3: Nokia Android TV */}
        {activeTab === 'nokia' && (
          <div className="flex flex-col gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col gap-3">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Radio size={14} className="text-emerald-400" />
                Nokia Android TV Cloud Bridge
              </span>
              <p className="text-slate-400 leading-relaxed">
                Because your Nokia TV is connected to your home Wi-Fi and Render is hosted in the cloud, Render provides an <strong>Outbound WebSocket Bridge</strong>.
              </p>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-col gap-2">
                <span className="font-semibold text-slate-300">How to connect Nokia TV:</span>
                <ol className="list-decimal list-inside text-slate-400 flex flex-col gap-1.5 leading-relaxed">
                  <li>Open the browser on your Nokia TV (or install any lightweight web companion).</li>
                  <li>Visit: <code className="text-blue-300 font-mono">{renderUrl ? `${renderUrl}/tv-receiver.html` : 'http://<your-render-url>/tv-receiver.html'}</code></li>
                  <li>Leave it in background or pinned. The TV will automatically listen to remote clicks in real-time!</li>
                </ol>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
