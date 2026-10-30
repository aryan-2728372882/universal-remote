import React, { useState, useEffect } from 'react';
import {
  X,
  Server,
  Wind,
  PlusCircle,
  Shield,
  Key,
  ExternalLink,
  RefreshCw,
  CheckCircle2,
  Trash2,
  Info
} from 'lucide-react';
import { fetchHubInfo, updateThinqPat, addOrUpdateDevice, deleteDevice, triggerNetworkScan } from '../utils/api';
import { triggerHaptic } from '../utils/haptics';

export default function SettingsModal({ isOpen, onClose, onReload, devices = [] }) {
  const [activeTab, setActiveTab] = useState('thinq'); // 'thinq' | 'manual' | 'hub' | 'devices'
  const [hubInfo, setHubInfo] = useState(null);

  // ThinQ PAT Form
  const [patToken, setPatToken] = useState('');
  const [country, setCountry] = useState('IN');
  const [isSavingThinq, setIsSavingThinq] = useState(false);
  const [thinqMsg, setThinqMsg] = useState(null);

  // Manual Device Form
  const [newDevName, setNewDevName] = useState('');
  const [newDevType, setNewDevType] = useState('lg-webos');
  const [newDevIp, setNewDevIp] = useState('');
  const [newDevMac, setNewDevMac] = useState('');
  const [isAddingDev, setIsAddingDev] = useState(false);
  const [manualMsg, setManualMsg] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadInfo();
    }
  }, [isOpen]);

  const loadInfo = async () => {
    try {
      const data = await fetchHubInfo();
      setHubInfo(data);
    } catch (err) {
      console.warn('Failed to fetch hub info:', err);
    }
  };

  if (!isOpen) return null;

  const handleSaveThinq = async (e) => {
    e.preventDefault();
    triggerHaptic('medium');
    setIsSavingThinq(true);
    setThinqMsg(null);
    try {
      await updateThinqPat(patToken, country);
      setThinqMsg({ type: 'success', text: 'LG ThinQ PAT Token saved securely!' });
      loadInfo();
      onReload();
    } catch (err) {
      setThinqMsg({ type: 'error', text: err.message });
    } finally {
      setIsSavingThinq(false);
    }
  };

  const handleAddDevice = async (e) => {
    e.preventDefault();
    if (!newDevName || !newDevIp) return;
    triggerHaptic('medium');
    setIsAddingDev(true);
    setManualMsg(null);

    const devId = newDevName.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Date.now().toString(36);
    try {
      await addOrUpdateDevice({
        id: devId,
        type: newDevType,
        name: newDevName,
        config: {
          ip: newDevIp.trim(),
          mac: newDevMac.trim() || undefined
        }
      });
      setManualMsg({ type: 'success', text: `Device "${newDevName}" added!` });
      setNewDevName('');
      setNewDevIp('');
      setNewDevMac('');
      onReload();
    } catch (err) {
      setManualMsg({ type: 'error', text: err.message });
    } finally {
      setIsAddingDev(false);
    }
  };

  const handleDeleteDevice = async (id) => {
    if (!confirm('Remove this device from hub?')) return;
    try {
      await deleteDevice(id);
      onReload();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 text-slate-100 flex flex-col gap-4 max-h-[90vh] overflow-y-auto no-scrollbar">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <Server size={22} />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">Hub Configuration</h3>
              <p className="text-xs text-slate-400">Settings, Integrations & Device Registry</p>
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
        <div className="flex gap-1.5 p-1 bg-slate-950 rounded-2xl border border-slate-800">
          <button
            onClick={() => setActiveTab('thinq')}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'thinq' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Wind size={14} />
            <span>LG ThinQ AC</span>
          </button>

          <button
            onClick={() => setActiveTab('manual')}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'manual' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <PlusCircle size={14} />
            <span>Add by IP</span>
          </button>

          <button
            onClick={() => setActiveTab('devices')}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'devices' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Devices</span>
          </button>

          <button
            onClick={() => setActiveTab('hub')}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'hub' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield size={14} />
            <span>Hub Info</span>
          </button>
        </div>

        {/* TAB 1: LG ThinQ PAT Token */}
        {activeTab === 'thinq' && (
          <div className="flex flex-col gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-white">LG ThinQ Connect (Personal Access Token)</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono border ${
                  hubInfo?.hasThinqPat ? 'bg-emerald-950 text-emerald-400 border-emerald-800' : 'bg-amber-950 text-amber-400 border-amber-800'
                }`}>
                  {hubInfo?.hasThinqPat ? 'TOKEN CONFIGURED' : 'NO TOKEN SET'}
                </span>
              </div>

              <p className="text-slate-400 leading-relaxed">
                LG Air Conditioners communicate via LG ThinQ Cloud (ThinQ Connect REST API).
                Tokens are encrypted with AES-256-GCM using your per-install machine secret.
              </p>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-2 text-slate-300">
                <Info size={16} className="text-blue-400 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  Generate your Personal Access Token (PAT) at the official LG Developer Portal:{' '}
                  <a
                    href="https://smartsolution.developer.lge.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-400 underline font-semibold inline-flex items-center gap-0.5"
                  >
                    smartsolution.developer.lge.com <ExternalLink size={12} />
                  </a>
                </div>
              </div>

              {thinqMsg && (
                <div className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 ${
                  thinqMsg.type === 'success' ? 'bg-emerald-950 border-emerald-800 text-emerald-300' : 'bg-rose-950 border-rose-800 text-rose-300'
                }`}>
                  <CheckCircle2 size={15} />
                  <span>{thinqMsg.text}</span>
                </div>
              )}

              <form onSubmit={handleSaveThinq} className="flex flex-col gap-3 pt-1">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400">PAT Token / API Key:</label>
                  <input
                    type="password"
                    value={patToken}
                    onChange={(e) => setPatToken(e.target.value)}
                    placeholder="eyJhbGciOi..."
                    className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono placeholder-slate-600 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400">Country / Region:</label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="IN">India (IN)</option>
                    <option value="US">United States (US)</option>
                    <option value="KR">Korea (KR)</option>
                    <option value="GB">United Kingdom (GB)</option>
                    <option value="AE">UAE (AE)</option>
                    <option value="DE">Germany (DE)</option>
                    <option value="AU">Australia (AU)</option>
                  </select>
                </div>

                <div className="flex gap-2 mt-2">
                  <button
                    type="submit"
                    disabled={isSavingThinq}
                    className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all active:scale-95"
                  >
                    {isSavingThinq ? 'Saving...' : 'Save Encrypted Token'}
                  </button>
                  {hubInfo?.hasThinqPat && (
                    <button
                      type="button"
                      onClick={() => {
                        setPatToken('');
                        handleSaveThinq({ preventDefault: () => {} });
                      }}
                      className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-rose-300 font-semibold text-xs transition-all"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TAB 2: Manual Device Addition */}
        {activeTab === 'manual' && (
          <form onSubmit={handleAddDevice} className="flex flex-col gap-3 text-xs">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col gap-3">
              <span className="font-bold text-sm text-white">Add Device by Local IP</span>
              <p className="text-slate-400">
                If mDNS or SSDP discovery cannot discover your device due to router AP isolation or VLAN separation, add its static or DHCP IP directly:
              </p>

              {manualMsg && (
                <div className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 ${
                  manualMsg.type === 'success' ? 'bg-emerald-950 border-emerald-800 text-emerald-300' : 'bg-rose-950 border-rose-800 text-rose-300'
                }`}>
                  <CheckCircle2 size={15} />
                  <span>{manualMsg.text}</span>
                </div>
              )}

              <div>
                <label className="text-[11px] font-semibold text-slate-400">Device Name:</label>
                <input
                  type="text"
                  required
                  value={newDevName}
                  onChange={(e) => setNewDevName(e.target.value)}
                  placeholder="e.g. Bedroom LG TV"
                  className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400">Device Protocol / Driver:</label>
                <select
                  value={newDevType}
                  onChange={(e) => setNewDevType(e.target.value)}
                  className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="lg-webos">LG webOS Smart TV (WebSocket SSAP)</option>
                  <option value="android-tv">Nokia / Android TV / Google TV (Remote v2 TLS)</option>
                  <option value="samsung-tizen">Samsung Smart TV (Tizen)</option>
                  <option value="roku">Roku TV / Player (ECP REST)</option>
                  <option value="broadlink-ir">Broadlink IR Blaster</option>
                  <option value="tuya-smart">Tuya Smart Device</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400">IP Address:</label>
                <input
                  type="text"
                  required
                  value={newDevIp}
                  onChange={(e) => setNewDevIp(e.target.value)}
                  placeholder="192.168.1.150"
                  className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono placeholder-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400">MAC Address (Optional, for Wake-on-LAN):</label>
                <input
                  type="text"
                  value={newDevMac}
                  onChange={(e) => setNewDevMac(e.target.value)}
                  placeholder="AA:BB:CC:DD:EE:FF"
                  className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono placeholder-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={isAddingDev}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all active:scale-95 mt-1"
              >
                {isAddingDev ? 'Adding...' : 'Register Device'}
              </button>
            </div>
          </form>
        )}

        {/* TAB 3: Device Registry Management */}
        {activeTab === 'devices' && (
          <div className="flex flex-col gap-2.5 text-xs">
            <span className="font-bold text-slate-400 uppercase tracking-wider text-[11px]">Configured Devices</span>
            {devices.length === 0 ? (
              <p className="text-slate-500 italic p-3 text-center">No devices configured yet.</p>
            ) : (
              devices.map((d) => (
                <div
                  key={d.id}
                  className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-sm text-white">{d.name}</div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      Type: {d.type} {d.config?.ip ? `• ${d.config.ip}` : ''}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteDevice(d.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-all"
                    title="Remove Device"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 4: Hub Information */}
        {activeTab === 'hub' && (
          <div className="flex flex-col gap-3 text-xs">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col gap-2">
              <span className="font-bold text-slate-300 text-sm">Local Hub Diagnostic Info</span>
              <div className="grid grid-cols-2 gap-2 mt-1 font-mono text-[11px]">
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Hub Host IP</span>
                  <span className="text-slate-200">{hubInfo?.hostIp || '127.0.0.1'}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Port</span>
                  <span className="text-slate-200">{hubInfo?.port || 3000}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">OS Platform</span>
                  <span className="text-slate-200">{hubInfo?.platform || process.platform}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Node Engine</span>
                  <span className="text-slate-200">{hubInfo?.nodeVersion || 'v20+'}</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col gap-2">
              <span className="font-bold text-slate-300 text-sm">Security & Storage</span>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                All pairing keys, device configurations, and tokens are stored in the persistent local database with <strong>AES-256-GCM authenticated encryption</strong>. No data leaves your home network.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
