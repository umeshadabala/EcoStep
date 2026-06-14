import { useState, useEffect, useMemo } from 'react';
import missionsBank from '../data/missions.json';
import { getCategoryBreakdown, getWorstCategory, formatDate } from '../utils/scoring';

function getTodayMissions() {
  const today = formatDate(new Date());
  const key = `ecostep_missions_${today}`;
  try {
    const cached = JSON.parse(localStorage.getItem(key));
    if (cached && Array.isArray(cached) && cached.length === 3) return cached;
  } catch {}

  const breakdown = getCategoryBreakdown();
  const worst = getWorstCategory(breakdown);
  const pool = missionsBank[worst] || missionsBank.transport;

  // Pick 3 random missions from the worst category pool
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, 3).map(m => ({ ...m, completed: false, category: worst }));
  localStorage.setItem(key, JSON.stringify(selected));
  return selected;
}

export default function MissionsTab() {
  const [missions, setMissions] = useState(getTodayMissions);
  const [animating, setAnimating] = useState(null);

  const today = formatDate(new Date());
  const categoryLabels = { transport: '🚗 Transport', food: '🍽️ Food', energy: '⚡ Energy', shopping: '🛍️ Shopping' };

  const completeMission = (index) => {
    if (missions[index].completed) return;
    setAnimating(index);
    setTimeout(() => {
      const updated = missions.map((m, i) => i === index ? { ...m, completed: true } : m);
      setMissions(updated);
      localStorage.setItem(`ecostep_missions_${today}`, JSON.stringify(updated));
      setAnimating(null);
    }, 600);
  };

  const completedCount = missions.filter(m => m.completed).length;
  const totalSaved = missions.filter(m => m.completed).reduce((sum, m) => sum + m.saving, 0);

  return (
    <div className="p-5 md:p-6 pb-24 md:pb-6 animate-[fadeIn_0.2s_ease]">
      <h2 className="text-xl font-bold text-white mb-1">🎯 Daily Missions</h2>
      <p className="text-white/50 text-sm mb-2">Complete missions to earn CO₂ bonuses</p>

      <div className="flex items-center gap-3 mb-6">
        <div className="flex gap-1">
          {[0, 1, 2].map(i => (
            <div key={i} className={`w-3 h-3 rounded-full transition-all ${i < completedCount ? 'bg-emerald-400 scale-110' : 'bg-white/15'}`} />
          ))}
        </div>
        <span className="text-white/40 text-sm">{completedCount}/3 completed</span>
        {totalSaved > 0 && (
          <span className="text-emerald-400 text-sm ml-auto">-{totalSaved.toFixed(1)} kg saved</span>
        )}
      </div>

      <div className="space-y-3">
        {missions.map((mission, i) => (
          <button
            key={i}
            onClick={() => completeMission(i)}
            disabled={mission.completed}
            className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 
              ${mission.completed
                ? 'bg-emerald-500/10 border-emerald-500/30'
                : 'bg-white/5 border-white/10 hover:bg-white/8 hover:border-white/20 active:scale-[0.98]'
              }
              ${animating === i ? 'scale-95 opacity-50' : ''}
            `}
          >
            <div className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300
                ${mission.completed ? 'bg-emerald-500 text-white' : 'bg-white/10 text-white/40'}
                ${animating === i ? 'animate-spin' : ''}
              `}>
                {mission.completed ? '✓' : (i + 1)}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className={`font-semibold ${mission.completed ? 'text-emerald-300' : 'text-white'}`}>
                  {mission.title}
                </h4>
                <p className="text-white/50 text-sm">{mission.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/40">
                    {categoryLabels[mission.category]}
                  </span>
                  <span className="text-xs text-emerald-400/70">-{mission.saving.toFixed(1)} kg CO₂</span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {completedCount === 3 && (
        <div className="mt-6 text-center bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-2xl p-4 border border-emerald-500/20">
          <span className="text-2xl">🎉</span>
          <p className="text-emerald-300 font-semibold mt-1">All missions complete!</p>
          <p className="text-white/50 text-sm">You saved {totalSaved.toFixed(1)} kg CO₂ today</p>
        </div>
      )}
    </div>
  );
}
