import { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { getWeeklyTotal, getCityState, getStreak } from '../utils/scoring';

export default function ShareCard({ onClose }) {
  const cardRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  const weeklyTotal = getWeeklyTotal();
  const cityState = getCityState(weeklyTotal);
  const streak = getStreak();
  const profile = (() => {
    try {
      return JSON.parse(localStorage.getItem('ecostep_profile')) || { city: 'India' };
    } catch {
      return { city: 'India' };
    }
  })();

  const stateEmoji = { Thriving: '🌿', Struggling: '🌥️', Polluted: '🏭', Critical: '🔥' };
  const stateColors = { Thriving: '#10B981', Struggling: '#FBBF24', Polluted: '#F97316', Critical: '#EF4444' };
  const stateGradients = {
    Thriving: 'from-emerald-950 via-teal-900 to-slate-900',
    Struggling: 'from-slate-800 via-zinc-900 to-slate-950',
    Polluted: 'from-orange-950 via-amber-900 to-slate-900',
    Critical: 'from-red-950 via-stone-900 to-neutral-950'
  };

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#0f172a',
        scale: 2.5,
        useCORS: true,
        logging: false
      });
      const link = document.createElement('a');
      link.download = `ecostep-${profile.city.toLowerCase()}-city.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Postcard export failed:', err);
    }
    setDownloading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease]" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="max-w-sm w-full">
        {/* The Card to screenshot */}
        <div
          ref={cardRef}
          className={`bg-gradient-to-b ${stateGradients[cityState]} rounded-3xl p-6 border border-white/10 shadow-2xl relative overflow-hidden`}
        >
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

          {/* Stamp header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <span className="text-white/40 text-xs font-semibold tracking-wider uppercase">POSTCARD FROM</span>
              <h3 className="text-2xl font-extrabold text-white tracking-tight">{profile.city}</h3>
            </div>
            <div className="border border-white/20 p-2 rounded-xl bg-white/5 flex flex-col items-center">
              <span className="text-xl">{stateEmoji[cityState]}</span>
              <span className="text-[10px] font-bold text-white/50 mt-1 uppercase tracking-wider">{cityState}</span>
            </div>
          </div>

          {/* Visual card badge */}
          <div className="bg-black/30 backdrop-blur-md rounded-2xl p-5 border border-white/10 mb-6 flex flex-col items-center text-center">
            <span className="text-sm font-semibold text-emerald-400">Weekly CO₂ Footprint</span>
            <div className="text-5xl font-extrabold text-white mt-1.5 tracking-tighter">
              {weeklyTotal.toFixed(1)} <span className="text-lg font-medium text-white/50">kg</span>
            </div>
            <p className="text-white/70 text-xs mt-2 font-medium px-4">
              My Carbon City is currently in a <span style={{ color: stateColors[cityState] }} className="font-bold">{cityState}</span> state.
            </p>
          </div>

          {/* Badge milestones */}
          <div className="space-y-2.5 mb-6">
            <div className="flex justify-between items-center text-xs bg-white/5 px-3.5 py-2.5 rounded-xl">
              <span className="text-white/60">🔥 Streak Count</span>
              <span className="text-white font-bold">{streak} Days</span>
            </div>
            <div className="flex justify-between items-center text-xs bg-white/5 px-3.5 py-2.5 rounded-xl">
              <span className="text-white/60">🌱 Eco Status</span>
              <span className="text-emerald-300 font-bold">Active Citizen</span>
            </div>
          </div>

          {/* Footer tagline */}
          <div className="text-center pt-2 border-t border-white/5 flex items-center justify-center gap-2">
            <span className="text-emerald-400 text-base">🌿</span>
            <span className="text-[11px] font-bold text-white/45 tracking-widest uppercase">My Carbon City — EcoStep</span>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex gap-3 mt-5">
          <button
            onClick={onClose}
            className="flex-1 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-white/70 font-semibold hover:bg-white/10 hover:text-white transition-all text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold hover:from-emerald-400 hover:to-teal-400 shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50 text-sm flex items-center justify-center gap-2"
          >
            {downloading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Exporting...
              </>
            ) : '📥 Save Postcard'}
          </button>
        </div>
      </div>
    </div>
  );
}
