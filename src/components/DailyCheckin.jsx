import { useState, useEffect, useRef, useId } from 'react';
import PropTypes from 'prop-types';
import { formatDate, getStreak } from '../utils/scoring';

/** @type {Array<{key: string, label: string, emoji: string}>} */
const TRANSPORT_OPTIONS = [
  { key: 'petrol_two_wheeler', label: 'Petrol Scooter / Bike', emoji: '🛵' },
  { key: 'ev_two_wheeler', label: 'Electric Scooter / Bike', emoji: '⚡' },
  { key: 'auto_rickshaw_cng', label: 'Auto Rickshaw (CNG)', emoji: '🛺' },
  { key: 'metro_train', label: 'Metro / Local Train', emoji: '🚇' },
  { key: 'bus', label: 'Public Bus', emoji: '🚌' },
  { key: 'petrol_car', label: 'Petrol Car', emoji: '🚗' },
  { key: 'diesel_car', label: 'Diesel Car / SUV', emoji: '🚙' },
  { key: 'ev_car', label: 'Electric Car', emoji: '🔌' },
  { key: 'flight', label: 'Domestic Flight', emoji: '✈️' },
  { key: 'other_transport', label: 'Other Transport', emoji: '❓' },
];

/** @type {Array<{key: string, label: string, desc: string}>} */
const MEAL_OPTIONS = [
  { key: 'traditional_veg_meal', label: '🥗 Traditional Veg Meal (Roti, Dal, Sabzi)', desc: 'Low footprint, localized staple' },
  { key: 'heavy_dairy', label: '🥛 Dairy Heavy (Paneer, Ghee, Chai, Lassi)', desc: 'Higher cattle farming emissions' },
  { key: 'non_veg_meal', label: '🍗 Non-Vegetarian Meal (Chicken, Mutton, Fish)', desc: 'Elevated greenhouse gas impact' },
  { key: 'fast_food_delivery', label: '🍔 Zomato / Swiggy Delivery or Fast Food', desc: 'Added delivery & packaging emissions' },
  { key: 'other_food', label: '❓ Other Food / Dining Out', desc: 'Custom meal footprint' },
];

/** @type {Array<{key: string, label: string, desc: string}>} */
const ENERGY_OPTIONS = [
  { key: 'ac_hours', label: '❄️ Air Conditioner (AC)', desc: 'High load cooling' },
  { key: 'air_cooler_hours', label: '🌬️ Desert Cooler / Fan combo', desc: 'Low load cooling' },
  { key: 'fan_led_hours', label: '💡 Ceiling Fans & LED Lights', desc: 'Daily essentials' },
  { key: 'geyser_hours', label: '🚿 Geyser / Water Heater', desc: 'Heavy heating element' },
  { key: 'diesel_generator_hours', label: '🔌 Diesel Generator (Backup power)', desc: 'High direct emission backup' },
  { key: 'other_energy_hours', label: '❓ Other Heavy Appliances', desc: 'Washing machine, microwave, oven' },
];

/** @type {Array<{key: string, label: string, desc: string}>} */
const SHOPPING_OPTIONS = [
  { key: 'local_bazaar', label: '🥦 Local Sabzi Mandi / Kirana Store', desc: 'Zero/low single-use packaging' },
  { key: 'quick_commerce_delivery', label: '📦 Quick Commerce (Blinkit, Instamart, Zepto)', desc: 'Quick packaging & courier delivery' },
  { key: 'new_clothes', label: '👕 Apparel & Clothes (New)', desc: 'High textile manufacturing footprint' },
  { key: 'new_electronics', label: '📱 Electronics or Appliances (New)', desc: 'High manufacturing footprint' },
  { key: 'secondhand_repair', label: '♻️ Secondhand / Local Cobbler/Tailor repair', desc: 'Virtually zero emissions' },
  { key: 'other_shopping', label: '❓ Other retail shopping', desc: 'Generic merchandise purchase' },
];

const EMPTY_LOG = {
  transport: {
    petrol_car: false, petrol_car_distance: 0,
    diesel_car: false, diesel_car_distance: 0,
    ev_car: false, ev_car_distance: 0,
    petrol_two_wheeler: false, petrol_two_wheeler_distance: 0,
    ev_two_wheeler: false, ev_two_wheeler_distance: 0,
    auto_rickshaw_cng: false, auto_rickshaw_cng_distance: 0,
    metro_train: false, metro_train_distance: 0,
    bus: false, bus_distance: 0,
    flight: false, flight_distance: 0,
    other_transport: false, other_transport_distance: 0,
  },
  meals: [],
  energy: {
    ac_hours: 0, air_cooler_hours: 0, fan_led_hours: 0,
    geyser_hours: 0, diesel_generator_hours: 0, other_energy_hours: 0,
  },
  shopping: [],
};

const STEP_LABELS = ['Transport', 'Food', 'Energy', 'Shopping'];

/**
 * Daily check-in modal with full ARIA support and focus trapping.
 * @param {{ onClose: () => void }} props
 */
export default function DailyCheckin({ onClose }) {
  const titleId = useId();
  const today = formatDate(new Date());
  const existingLog = (() => {
    try {
      return JSON.parse(localStorage.getItem(`ecostep_log_${today}`));
    } catch {
      return null;
    }
  })();

  const [step, setStep] = useState(0);
  const [log, setLog] = useState(existingLog || EMPTY_LOG);
  const [saved, setSaved] = useState(false);
  const dialogRef = useRef(null);
  const streak = getStreak();

  // Focus the dialog container on open
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
        'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
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

  const saveLog = () => {
    localStorage.setItem(`ecostep_log_${today}`, JSON.stringify(log));
    setSaved(true);
    setTimeout(() => onClose(), 1500);
  };

  const toggleMeal = (meal) => {
    setLog((prev) => ({
      ...prev,
      meals: prev.meals.includes(meal)
        ? prev.meals.filter((m) => m !== meal)
        : [...prev.meals, meal],
    }));
  };

  const toggleShopping = (item) => {
    setLog((prev) => ({
      ...prev,
      shopping: prev.shopping.includes(item)
        ? prev.shopping.filter((s) => s !== item)
        : [...prev.shopping, item],
    }));
  };

  const stepContent = [
    // Step 0: Transport
    <div key="transport" className="space-y-4 animate-[fadeIn_0.2s_ease]">
      <div>
        <h3 id="step-heading" className="text-lg font-bold text-white flex items-center gap-2">
          🚗 How did you commute today?
        </h3>
        <p className="text-white/40 text-xs mt-0.5">Select all transport modes you used and enter approximate distance</p>
      </div>
      <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1" role="group" aria-label="Transport modes">
        {TRANSPORT_OPTIONS.map((t) => {
          const checkboxId = `transport-${t.key}`;
          const inputId = `transport-${t.key}-distance`;
          return (
            <div key={t.key} className="bg-white/5 border border-white/5 rounded-2xl p-4 transition-all hover:bg-white/[0.08]">
              <div className="flex items-center justify-between">
                <label htmlFor={checkboxId} className="text-white/90 font-medium text-sm flex items-center gap-2 cursor-pointer flex-1">
                  <span aria-hidden="true">{t.emoji}</span>
                  {t.label}
                </label>
                <input
                  id={checkboxId}
                  type="checkbox"
                  checked={log.transport[t.key] || false}
                  onChange={(e) => setLog((prev) => ({
                    ...prev,
                    transport: { ...prev.transport, [t.key]: e.target.checked },
                  }))}
                  className="w-5 h-5 rounded-lg accent-emerald-500 cursor-pointer"
                  aria-describedby={log.transport[t.key] ? inputId : undefined}
                />
              </div>
              {log.transport[t.key] && (
                <div className="mt-3 flex items-center gap-3 animate-[fadeIn_0.15s_ease]">
                  <label htmlFor={inputId} className="text-white/50 text-xs">
                    Distance (km):
                  </label>
                  <input
                    id={inputId}
                    type="number"
                    min="0"
                    placeholder="e.g. 15"
                    value={log.transport[`${t.key}_distance`] || ''}
                    onChange={(e) => setLog((prev) => ({
                      ...prev,
                      transport: { ...prev.transport, [`${t.key}_distance`]: Number(e.target.value) },
                    }))}
                    aria-label={`${t.label} distance in kilometres`}
                    className="flex-1 px-3 py-1.5 bg-white/10 border border-white/10 rounded-xl text-white outline-none focus:border-emerald-500 text-sm font-medium"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>,

    // Step 1: Food
    <div key="food" className="space-y-4 animate-[fadeIn_0.2s_ease]">
      <div>
        <h3 id="step-heading" className="text-lg font-bold text-white flex items-center gap-2">🍽️ What did you eat today?</h3>
        <p className="text-white/40 text-xs mt-0.5">Choose all meals that represent your consumption today</p>
      </div>
      <div className="space-y-3" role="group" aria-label="Meal selections">
        {MEAL_OPTIONS.map((f) => {
          const selected = log.meals.includes(f.key);
          return (
            <button
              key={f.key}
              onClick={() => toggleMeal(f.key)}
              aria-pressed={selected}
              className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 flex flex-col gap-0.5 focus:outline-none focus:ring-2 focus:ring-emerald-500
                ${selected
                  ? 'bg-emerald-500/10 border-emerald-500/30 shadow-md shadow-emerald-500/5'
                  : 'bg-white/5 border-white/5 hover:bg-white/[0.08] hover:border-white/10'
                }`}
            >
              <span className="text-white font-semibold text-sm">{f.label}</span>
              <span className="text-white/45 text-xs">{f.desc}</span>
            </button>
          );
        })}
      </div>
    </div>,

    // Step 2: Energy
    <div key="energy" className="space-y-4 animate-[fadeIn_0.2s_ease]">
      <div>
        <h3 id="step-heading" className="text-lg font-bold text-white flex items-center gap-2">⚡ Home & Appliance Usage</h3>
        <p className="text-white/40 text-xs mt-0.5">Enter approximate hours of usage for today</p>
      </div>
      <div className="space-y-3" role="group" aria-label="Energy appliance usage">
        {ENERGY_OPTIONS.map((e) => {
          const inputId = `energy-${e.key}`;
          return (
            <div key={e.key} className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center justify-between gap-4">
              <div>
                <label htmlFor={inputId} className="text-white/90 font-medium text-sm block cursor-pointer">
                  {e.label}
                </label>
                <span className="text-white/40 text-xs">{e.desc}</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  id={inputId}
                  type="number"
                  min="0"
                  max="24"
                  value={log.energy[e.key] || ''}
                  onChange={(ev) => setLog((prev) => ({
                    ...prev,
                    energy: { ...prev.energy, [e.key]: Number(ev.target.value) },
                  }))}
                  aria-label={`${e.label} hours used today`}
                  className="w-16 px-2.5 py-1.5 bg-white/10 border border-white/10 rounded-xl text-white outline-none focus:border-emerald-500 text-center text-sm font-semibold"
                  placeholder="0"
                />
                <span className="text-white/40 text-xs" aria-hidden="true">hrs</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>,

    // Step 3: Shopping
    <div key="shopping" className="space-y-4 animate-[fadeIn_0.2s_ease]">
      <div>
        <h3 id="step-heading" className="text-lg font-bold text-white flex items-center gap-2">🛍️ Purchases & Deliveries</h3>
        <p className="text-white/40 text-xs mt-0.5">Select any purchases or deliveries made today</p>
      </div>
      <div className="space-y-3" role="group" aria-label="Shopping selections">
        {SHOPPING_OPTIONS.map((s) => {
          const selected = log.shopping.includes(s.key);
          return (
            <button
              key={s.key}
              onClick={() => toggleShopping(s.key)}
              aria-pressed={selected}
              className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 flex flex-col gap-0.5 focus:outline-none focus:ring-2 focus:ring-emerald-500
                ${selected
                  ? 'bg-emerald-500/10 border-emerald-500/30 shadow-md shadow-emerald-500/5'
                  : 'bg-white/5 border-white/5 hover:bg-white/[0.08] hover:border-white/10'
                }`}
            >
              <span className="text-white font-semibold text-sm">{s.label}</span>
              <span className="text-white/45 text-xs">{s.desc}</span>
            </button>
          );
        })}
      </div>
    </div>,
  ];

  if (saved) {
    return (
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-label="Log saved"
      >
        <div className="bg-slate-900 border border-white/10 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl animate-[bounceIn_0.4s_ease]">
          <div className="text-5xl mb-3" aria-hidden="true">✅</div>
          <h2 className="text-xl font-extrabold text-white">Log Saved!</h2>
          <p className="text-emerald-400 text-sm mt-1">Your carbon footprint is recorded.</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
      role="presentation"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="bg-slate-900 border border-white/10 rounded-3xl p-6 max-w-md w-full max-h-[85vh] overflow-y-auto flex flex-col justify-between shadow-2xl focus:outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 id={titleId} className="text-xl font-extrabold text-white">Daily Check-in</h2>
              <p className="text-emerald-400 text-xs font-semibold mt-0.5" aria-live="polite">
                🔥 {streak} day streak
              </p>
            </div>
            <button
              onClick={onClose}
              aria-label="Close daily check-in"
              className="text-white/40 hover:text-white text-2xl transition-colors focus:outline-none focus:ring-2 focus:ring-white/30 rounded-lg p-1"
            >
              ×
            </button>
          </div>

          {/* Step Progress */}
          <div
            role="progressbar"
            aria-valuenow={step + 1}
            aria-valuemin={1}
            aria-valuemax={stepContent.length}
            aria-label={`Step ${step + 1} of ${stepContent.length}: ${STEP_LABELS[step]}`}
            className="flex gap-2 mb-2"
          >
            {stepContent.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-all ${i <= step ? 'bg-emerald-400' : 'bg-white/10'}`}
              />
            ))}
          </div>
          <p className="text-[10px] text-white/40 uppercase tracking-widest mb-6">
            {STEP_LABELS[step]} — Step {step + 1} of {stepContent.length}
          </p>

          {/* Content */}
          <div className="mb-6">{stepContent[step]}</div>
        </div>

        {/* Navigation */}
        <div className="flex gap-3 pt-4 border-t border-white/5">
          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              className="px-5 py-3 rounded-2xl bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition-all font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
            >
              Back
            </button>
          )}
          {step < stepContent.length - 1 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold hover:from-emerald-400 hover:to-teal-400 shadow-lg shadow-emerald-500/10 transition-all text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
              Next: {STEP_LABELS[step + 1]} →
            </button>
          ) : (
            <button
              onClick={saveLog}
              className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold hover:from-emerald-400 hover:to-teal-400 shadow-lg shadow-emerald-500/10 transition-all text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
              Log Today's Carbon footprint ✓
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

DailyCheckin.propTypes = {
  onClose: PropTypes.func.isRequired,
};
