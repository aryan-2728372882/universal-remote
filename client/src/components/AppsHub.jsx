import React, { useState } from 'react';
import { Search, ExternalLink, Sparkles, Filter } from 'lucide-react';
import { APP_REGISTRY } from './BrandLogos';

export default function AppsHub({ onLaunchApp, isPoweredOn }) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', 'Movies & Series', 'Sports & Shows', 'Music & Podcasts', 'Regional & Series'];

  const filteredApps = APP_REGISTRY.filter((app) => {
    const matchesSearch = app.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'All' || app.category.includes(activeCategory.split(' ')[0]);
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="w-[380px] max-w-full rounded-[44px] p-6 flex flex-col gap-5 border shadow-2xl backdrop-blur-2xl bg-[#161B2A]/90 border-white/10 font-jakarta">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_10px_#00f2fe]" />
          <h2 className="text-base font-black text-white uppercase tracking-wider font-orbitron">
            Smart TV Apps
          </h2>
        </div>
        <span className="text-[10px] font-bold text-cyan-400 bg-cyan-950/80 px-2.5 py-1 rounded-full border border-cyan-700/50">
          1-Tap Launch
        </span>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search apps, sports, shows..."
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-black/40 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 transition-all font-medium"
        />
      </div>

      {/* Category Filter Chips */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all ${
              activeCategory === cat
                ? 'bg-cyan-500 text-slate-950 font-black shadow-md'
                : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* App Cards Grid */}
      <div className="grid grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
        {filteredApps.map((app) => {
          const LogoComponent = app.logo;
          return (
            <button
              key={app.id}
              onClick={() => onLaunchApp(app.name, app.id)}
              className="p-3.5 rounded-2xl bg-slate-800/60 border border-white/10 flex flex-col items-start gap-2.5 hover:border-cyan-400 hover:-translate-y-0.5 active:scale-95 transition-all shadow-md group text-left"
            >
              <div className="w-full flex items-center justify-between">
                <div className="p-1 rounded-xl bg-black/30 border border-white/5">
                  <LogoComponent size={32} />
                </div>
                <ExternalLink
                  size={14}
                  className="text-slate-500 group-hover:text-cyan-400 transition-colors"
                />
              </div>
              <div>
                <div className="text-xs font-black text-white group-hover:text-cyan-300 transition-colors">
                  {app.name}
                </div>
                <div className="text-[10px] text-slate-400 font-semibold truncate max-w-[120px]">
                  {app.category}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="text-center text-[11px] text-slate-400 font-medium pt-1 border-t border-white/5">
        Tap any app to launch directly on your paired Smart TV over LAN.
      </div>
    </div>
  );
}
