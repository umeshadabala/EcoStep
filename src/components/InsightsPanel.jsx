import { useEffect, useRef, useId } from 'react';
import PropTypes from 'prop-types';
import {
  getCategoryBreakdown,
  getWorstCategory,
  getComparison,
  getLoggedDaysCount,
} from '../utils/scoring';

const CATEGORY_LABELS = {
  transport: '🚗 Transport & Commute',
  food: '🍽️ Food & Meals',
  energy: '⚡ Home Appliances',
  shopping: '🛍️ Shopping & Delivery',
};

const CATEGORY_DESCRIPTIONS = {
  transport: 'Auto-rickshaw, two-wheeler, metro, train, or car travel.',
  food: 'Heavy dairy consumption, non-veg meals, or Zomato/Swiggy packaging.',
  energy: 'Air conditioning, desert coolers, geysers, and backup generators.',
  shopping: 'Local mandi purchases vs quick commerce deliveries and fashion retail.',
};

/**
 * Personalized insights panel showing weekly category breakdown.
 * @param {{ onClose: () => void }} props
 */
export default function InsightsPanel({ onClose }) {
  const titleId = useId();
  const dialogRef = useRef(null);
  const daysLogged = getLoggedDaysCount();
  const breakdown = getCategoryBreakdown();
  const worst = getWorstCategory(breakdown);
  const worstValue = breakdown[worst];
  const comparison = getComparison(worst, worstValue);
  const total = Object.values(breakdown).reduce((a, b) => a + b, 0) || 1;

  // Focus the dialog on open
  useEffect(() => {
    dialogRef.current?.focus();
  }, []);

  // Focus trap + Escape close
  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key !== 'Tab') return;
      const focusable = el.querySelectorAll(
        'button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    };
    el.addEventListener('keydown', handleKeyDown);
    return () => el.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (daysLogged < 3) {
    return (
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        role="presentation"
        onClick={onClose}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="insights-insufficient-title"
          onClick={(e) => e.stopPropagation()}
          className="bg-slate-900 border border-white/10 rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl"
        >
          <div className="text-4xl mb-3" aria-hidden="true">📊</div>
          <h3 id="insights-insufficient-title" className="text-lg font-bold text-white mb-2">
            Insufficient Data
          </h3>
          <p className="text-white/60 text-sm mb-4">
            You need to log at least 3 days of activity to unlock personalized insights and comparisons.
          </p>
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-2xl bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 transition-all text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-white/30"
          >
            Okay
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 bg-black/65 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4 animate-[fadeIn_0.2s_ease]"
      role="presentation"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 border border-white/10 rounded-t-3xl sm:rounded-3xl p-6 max-w-md w-full shadow-2xl overflow-y-auto max-h-[85vh] animate-[slideUp_0.25s_ease] focus:outline-none"
      >
        <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-4 sm:hidden" aria-hidden="true" />
        <div className="flex justify-between items-center mb-5">
          <h3 id={titleId} className="text-xl font-bold text-white flex items-center gap-2">
            📊 Personalized Insights
          </h3>
          <button
            onClick={onClose}
            aria-label="Close insights panel"
            className="text-white/40 hover:text-white text-2xl transition-colors focus:outline-none focus:ring-2 focus:ring-white/30 rounded-lg p-1"
          >
            ×
          </button>
        </div>

        {/* Highest emission source */}
        <section aria-label="Highest emission source" className="bg-gradient-to-br from-red-500/10 to-orange-500/5 rounded-2xl p-4 border border-red-500/20 mb-4">
          <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest block mb-1">
            Highest Emission Source
          </span>
          <span className="text-white font-extrabold text-lg block">{CATEGORY_LABELS[worst]}</span>
          <span className="text-white/70 text-xs mt-1 block">{CATEGORY_DESCRIPTIONS[worst]}</span>
          <div className="text-red-300 text-sm font-bold mt-2 flex items-center gap-1.5">
            <span aria-hidden="true">⚠️</span>
            <span>{worstValue.toFixed(1)} kg CO₂ logged this week</span>
          </div>
        </section>

        {/* Comparison */}
        <section aria-label="Emissions comparison" className="bg-white/5 rounded-2xl p-4 border border-white/5 mb-5">
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block mb-1">
            What this equals
          </span>
          <p className="text-white/85 text-sm font-medium leading-relaxed mt-1">
            &ldquo;Your weekly emissions from this category is equivalent to {comparison}.&rdquo;
          </p>
        </section>

        {/* Category breakdown */}
        <section aria-label="Category breakdown" className="space-y-3.5 mb-6">
          <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest block">
            Category Breakdown
          </span>
          {Object.entries(breakdown).map(([key, val]) => {
            const pct = Math.round((val / total) * 100);
            return (
              <div key={key} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-white/80">{CATEGORY_LABELS[key]}</span>
                  <span className="text-white/40">{val.toFixed(1)} kg ({pct}%)</span>
                </div>
                <div
                  role="progressbar"
                  aria-valuenow={pct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${CATEGORY_LABELS[key]}: ${pct}% of total emissions`}
                  className="h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/5"
                >
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      key === worst
                        ? 'bg-gradient-to-r from-red-500 to-orange-500'
                        : 'bg-gradient-to-r from-emerald-500 to-teal-500'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </section>

        <button
          onClick={onClose}
          className="w-full py-3.5 rounded-2xl bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 hover:text-white font-bold transition-all text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
        >
          Got it
        </button>
      </div>
    </div>
  );
}

InsightsPanel.propTypes = {
  onClose: PropTypes.func.isRequired,
};
