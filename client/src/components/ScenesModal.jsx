import React, { useState, useEffect } from 'react';
import { X, Film, PowerOff, Sparkles, Clock, Play, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { fetchScenes, triggerScene, fetchSchedules, saveSchedule, deleteSchedule } from '../utils/api';
import { triggerHaptic } from '../utils/haptics';

export default function ScenesModal({ isOpen, onClose }) {
  const [scenes, setScenes] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [activeTab, setActiveTab] = useState('scenes'); // 'scenes' | 'schedules'
  const [runningId, setRunningId] = useState(null);
  const [feedbackMsg, setFeedbackMsg] = useState(null);

  // New schedule form state
  const [newSchedTime, setNewSchedTime] = useState('22:00');
  const [newSchedScene, setNewSchedScene] = useState('');

  const loadData = async () => {
    try {
      const sceneRes = await fetchScenes();
      setScenes(sceneRes.scenes || []);
      if (sceneRes.scenes?.length > 0 && !newSchedScene) {
        setNewSchedScene(sceneRes.scenes[0].id);
      }
      const schedRes = await fetchSchedules();
      setSchedules(schedRes.schedules || []);
    } catch (err) {
      console.warn('Failed to load scenes:', err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRunScene = async (id, name) => {
    triggerHaptic('medium');
    setRunningId(id);
    setFeedbackMsg(null);
    try {
      await triggerScene(id);
      setFeedbackMsg(`Scene "${name}" executed successfully!`);
      triggerHaptic('heavy');
    } catch (err) {
      setFeedbackMsg(`Scene failed: ${err.message}`);
    } finally {
      setRunningId(null);
      setTimeout(() => setFeedbackMsg(null), 3500);
    }
  };

  const handleAddSchedule = async (e) => {
    e.preventDefault();
    if (!newSchedTime || !newSchedScene) return;
    try {
      const res = await saveSchedule({
        sceneId: newSchedScene,
        time: newSchedTime,
        days: [0, 1, 2, 3, 4, 5, 6],
        enabled: true
      });
      setSchedules(res.schedules || []);
      triggerHaptic('light');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteSchedule = async (id) => {
    try {
      const res = await deleteSchedule(id);
      setSchedules(res.schedules || []);
      triggerHaptic('light');
    } catch (err) {
      alert(err.message);
    }
  };

  const getSceneIcon = (id) => {
    if (id.includes('movie')) return Film;
    if (id.includes('off')) return PowerOff;
    return Sparkles;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 text-slate-100 flex flex-col gap-4 max-h-[90vh] overflow-y-auto no-scrollbar">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <Sparkles size={22} />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">Smart Scenes & Automations</h3>
              <p className="text-xs text-slate-400">Trigger multi-device presets and timers</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex gap-2 p-1 bg-slate-950 rounded-2xl border border-slate-800">
          <button
            onClick={() => setActiveTab('scenes')}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'scenes' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles size={14} />
            <span>Active Scenes</span>
          </button>
          <button
            onClick={() => setActiveTab('schedules')}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'schedules' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock size={14} />
            <span>Daily Schedules</span>
          </button>
        </div>

        {feedbackMsg && (
          <div className="p-3 rounded-2xl bg-indigo-950/80 border border-indigo-800 text-indigo-300 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 size={16} className="shrink-0 text-indigo-400" />
            <span>{feedbackMsg}</span>
          </div>
        )}

        {/* Tab 1: Scenes */}
        {activeTab === 'scenes' && (
          <div className="flex flex-col gap-3">
            {scenes.map((scene) => {
              const Icon = getSceneIcon(scene.id);
              const isRunning = runningId === scene.id;

              return (
                <div
                  key={scene.id}
                  className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 flex items-center justify-between gap-3 hover:border-slate-700 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-indigo-400">
                      <Icon size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">{scene.name}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {scene.actions?.length || 0} device actions
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRunScene(scene.id, scene.name)}
                    disabled={isRunning}
                    className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-indigo-600/30 flex items-center gap-1.5 active:scale-95 transition-all"
                  >
                    <Play size={14} />
                    <span>{isRunning ? 'Running...' : 'Run Now'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 2: Schedules */}
        {activeTab === 'schedules' && (
          <div className="flex flex-col gap-4">
            {/* Create Schedule */}
            <form onSubmit={handleAddSchedule} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col gap-3">
              <span className="text-xs font-bold text-slate-300">Add Automated Schedule</span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 font-semibold uppercase">Daily Time (24h)</label>
                  <input
                    type="time"
                    value={newSchedTime}
                    onChange={(e) => setNewSchedTime(e.target.value)}
                    className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-semibold uppercase">Scene to Run</label>
                  <select
                    value={newSchedScene}
                    onChange={(e) => setNewSchedScene(e.target.value)}
                    className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    {scenes.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                type="submit"
                className="py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
              >
                <Plus size={14} />
                <span>Save Schedule</span>
              </button>
            </form>

            {/* List */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Timers</span>
              {schedules.length === 0 ? (
                <p className="text-xs text-slate-500 italic p-2">No daily schedules set.</p>
              ) : (
                schedules.map((sc) => (
                  <div
                    key={sc.id}
                    className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-indigo-400" />
                      <span className="font-mono font-bold text-white text-sm">{sc.time}</span>
                      <span className="text-slate-400">• Scene: {scenes.find(s => s.id === sc.sceneId)?.name || sc.sceneId}</span>
                    </div>
                    <button
                      onClick={() => handleDeleteSchedule(sc.id)}
                      className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-all"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
