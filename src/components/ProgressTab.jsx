import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { getDailyScores, calculateDailyScore, formatDate } from '../utils/scoring';

function getBarColor(score) {
  if (score === 0) return '#4B5563'; // Gray/no activity
  if (score < 4) return '#10B981';  // Emerald
  if (score < 8) return '#10B981';  // Green
  if (score < 12) return '#F59E0B'; // Amber
  if (score < 16) return '#F97316'; // Orange
  return '#EF4444';                // Red
}

export default function ProgressTab() {
  const scores = getDailyScores(7);
  const daysWithData = scores.filter(s => s.hasData);

  const bestDay = daysWithData.length > 0 ? daysWithData.reduce((a, b) => a.score < b.score ? a : b) : null;
  const worstDay = daysWithData.length > 0 ? daysWithData.reduce((a, b) => a.score > b.score ? a : b) : null;

  const thisWeekTotal = scores.reduce((sum, s) => sum + s.score, 0);

  // Get last week's scores for comparison without using CommonJS require
  const lastWeekScores = (() => {
    const s = [];
    const today = new Date();
    for (let i = 13; i >= 7; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = formatDate(d);
      const key = `ecostep_log_${dateStr}`;
      try {
        const log = JSON.parse(localStorage.getItem(key));
        if (log) {
          s.push(calculateDailyScore(log));
        }
      } catch {}
    }
    return s;
  })();
  const lastWeekTotal = lastWeekScores.reduce((a, b) => a + b, 0);
  const reduction = lastWeekTotal > 0 ? Math.round(((lastWeekTotal - thisWeekTotal) / lastWeekTotal) * 100) : 0;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 px-4 py-3 rounded-2xl border border-white/10 shadow-xl">
          <p className="text-white/60 text-xs font-semibold uppercase tracking-wider">{label}</p>
          <p className="text-white text-base font-extrabold mt-1">{payload[0].value.toFixed(1)} <span className="text-xs font-normal text-white/50">kg CO₂</span></p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-5 md:p-6 pb-24 md:pb-6 animate-[fadeIn_0.2s_ease]">
      <div className="mb-5">
        <h2 className="text-xl font-extrabold text-white">📈 Progress Analysis</h2>
        <p className="text-white/50 text-xs mt-0.5">Your daily carbon emissions for the past 7 days</p>
      </div>

      <div className="bg-white/5 rounded-3xl p-5 border border-white/5 shadow-xl mb-6">
        <div className="h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={scores} margin={{ top: 10, right: 5, left: -25, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 'medium' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} unit="kg" />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)', radius: 8 }} />
              <Bar dataKey="score" radius={[8, 8, 0, 0]} maxBarSize={32}>
                {scores.map((entry, idx) => (
                  <Cell key={idx} fill={getBarColor(entry.score)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white/5 rounded-2xl p-4 border border-white/5 text-center flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block">Best Day</span>
            <span className="text-white font-extrabold text-lg mt-1 block">
              {bestDay ? `${bestDay.score.toFixed(1)}` : '—'} <span className="text-xs font-normal text-white/40">{bestDay ? 'kg' : ''}</span>
            </span>
          </div>
          <span className="text-white/40 text-[10px] mt-2 block">{bestDay ? bestDay.label : 'No data'}</span>
        </div>

        <div className="bg-white/5 rounded-2xl p-4 border border-white/5 text-center flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest block">Worst Day</span>
            <span className="text-white font-extrabold text-lg mt-1 block">
              {worstDay ? `${worstDay.score.toFixed(1)}` : '—'} <span className="text-xs font-normal text-white/40">{worstDay ? 'kg' : ''}</span>
            </span>
          </div>
          <span className="text-white/40 text-[10px] mt-2 block">{worstDay ? worstDay.label : 'No data'}</span>
        </div>

        <div className="bg-white/5 rounded-2xl p-4 border border-white/5 text-center flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest block">Weekly Change</span>
            <span className={`font-extrabold text-lg mt-1 block ${reduction >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {lastWeekTotal > 0 ? `${reduction >= 0 ? '↓' : '↑'}${Math.abs(reduction)}%` : '—'}
            </span>
          </div>
          <span className="text-white/40 text-[10px] mt-2 block">{lastWeekTotal > 0 ? 'reduction' : 'Onboarding week'}</span>
        </div>
      </div>
    </div>
  );
}
