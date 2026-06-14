import { getCategoryBreakdown, getWorstCategory, getComparison, getLoggedDaysCount } from '../utils/scoring';

export default function InsightsPanel({ onClose }) {
  const daysLogged = getLoggedDaysCount();
  const breakdown = getCategoryBreakdown();
  const worst = getWorstCategory(breakdown);
  const worstValue = breakdown[worst];

  if (daysLogged < 3) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div onClick={(e) => e.stopPropagation()} className="bg-slate-900 border border-white/10 rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl">
          <div className="text-4xl mb-3">📊</div>
          <h3 className="text-lg font-bold text-white mb-2">Insufficient Data</h3>
          <p className="text-white/60 text-sm mb-4">You need to log at least 3 days of activity to unlock personalized insights and comparisons.</p>
          <button onClick={onClose} className="w-full py-2.5 rounded-2xl bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 transition-all text-sm font-semibold">Okay</button>
        </div>
      </div>
    );
  }

  const categoryLabels = {
    transport: '🚗 Transport & Commute',
    food: '🍽️ Food & Meals',
    energy: '⚡ Home Appliances',
    shopping: '🛍️ Shopping & Delivery'
  };

  const categoryDescriptions = {
    transport: 'Auto-rickshaw, two-wheeler, metro, train, or car travel.',
    food: 'Heavy dairy consumption, non-veg meals, or Zomato/Swiggy packaging.',
    energy: 'Air conditioning, desert coolers, geysers, and backup generators.',
    shopping: 'Local mandi purchases vs quick commerce deliveries and fashion retail.'
  };

  const comparison = getComparison(worst, worstValue);

  return (
    <div className="fixed inset-0 bg-black/65 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4 animate-[fadeIn_0.2s_ease]" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="bg-slate-900 border border-white/10 rounded-t-3xl sm:rounded-3xl p-6 max-w-md w-full shadow-2xl overflow-y-auto max-h-[85vh] animate-[slideUp_0.25s_ease]">
        <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-4 sm:hidden" />
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">📊 Personalized Insights</h3>
          <button onClick={onClose} className="text-white/40 hover:text-white text-2xl transition-colors">×</button>
        </div>

        {/* Highest Source Card */}
        <div className="bg-gradient-to-br from-red-500/10 to-orange-500/5 rounded-2xl p-4 border border-red-500/20 mb-4">
          <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest block mb-1">Highest Emission Source</span>
          <span className="text-white font-extrabold text-lg block">{categoryLabels[worst]}</span>
          <span className="text-white/70 text-xs mt-1 block">{categoryDescriptions[worst]}</span>
          <div className="text-red-300 text-sm font-bold mt-2 flex items-center gap-1.5">
            <span>⚠️</span>
            <span>{worstValue.toFixed(1)} kg CO₂ logged this week</span>
          </div>
        </div>

        {/* Comparison Post */}
        <div className="bg-white/5 rounded-2xl p-4 border border-white/5 mb-5">
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block mb-1">What this equals</span>
          <p className="text-white/85 text-sm font-medium leading-relaxed mt-1">
            "Your weekly emissions from this category is equivalent to {comparison}."
          </p>
        </div>

        {/* Breakdown bar chart/list */}
        <div className="space-y-3.5 mb-6">
          <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest block">Category Breakdown</span>
          {Object.entries(breakdown).map(([key, val]) => {
            const total = Object.values(breakdown).reduce((a, b) => a + b, 0) || 1;
            const pct = Math.round((val / total) * 100);
            return (
              <div key={key} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-white/80">{categoryLabels[key]}</span>
                  <span className="text-white/40">{val.toFixed(1)} kg ({pct}%)</span>
                </div>
                <div className="h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${key === worst ? 'bg-gradient-to-r from-red-500 to-orange-500' : 'bg-gradient-to-r from-emerald-500 to-teal-500'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={onClose}
          className="w-full py-3.5 rounded-2xl bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 hover:text-white font-bold transition-all text-sm"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
