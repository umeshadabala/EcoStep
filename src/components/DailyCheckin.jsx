import { useState } from 'react';
import { formatDate, getStreak } from '../utils/scoring';

export default function DailyCheckin({ onClose }) {
  const today = formatDate(new Date());
  const existingLog = (() => {
    try {
      return JSON.parse(localStorage.getItem(`ecostep_log_${today}`));
    } catch {
      return null;
    }
  })();

  const [step, setStep] = useState(0);
  const [log, setLog] = useState(existingLog || {
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
      other_transport: false, other_transport_distance: 0
    },
    meals: [],
    energy: {
      ac_hours: 0,
      air_cooler_hours: 0,
      fan_led_hours: 0,
      geyser_hours: 0,
      diesel_generator_hours: 0,
      other_energy_hours: 0
    },
    shopping: []
  });
  const [saved, setSaved] = useState(false);

  const streak = getStreak();

  const saveLog = () => {
    localStorage.setItem(`ecostep_log_${today}`, JSON.stringify(log));
    setSaved(true);
    setTimeout(() => onClose(), 1500);
  };

  const toggleMeal = (meal) => {
    setLog(prev => ({
      ...prev,
      meals: prev.meals.includes(meal) ? prev.meals.filter(m => m !== meal) : [...prev.meals, meal]
    }));
  };

  const toggleShopping = (item) => {
    setLog(prev => ({
      ...prev,
      shopping: prev.shopping.includes(item) ? prev.shopping.filter(s => s !== item) : [...prev.shopping, item]
    }));
  };

  const steps = [
    // Step 0: Transport details
    <div key="transport" className="space-y-4 animate-[fadeIn_0.2s_ease]">
      <div>
        <h3 className="text-lg font-bold text-white flex items-center gap-2">🚗 How did you commute today?</h3>
        <p className="text-white/40 text-xs mt-0.5">Select all transport modes you used and enter approximate distance</p>
      </div>

      <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
        {[
          { key: 'petrol_two_wheeler', label: '🛵 Petrol Scooter / Bike', emoji: '🛵' },
          { key: 'ev_two_wheeler', label: '⚡ Electric Scooter / Bike', emoji: '⚡' },
          { key: 'auto_rickshaw_cng', label: '🛺 Auto Rickshaw (CNG)', emoji: '🛺' },
          { key: 'metro_train', label: '🚇 Metro / Local Train', emoji: '🚇' },
          { key: 'bus', label: '🚌 Public Bus', emoji: '🚌' },
          { key: 'petrol_car', label: '🚗 Petrol Car', emoji: '🚗' },
          { key: 'diesel_car', label: '🚙 Diesel Car/SUV', emoji: '🚙' },
          { key: 'ev_car', label: '🔌 Electric Car', emoji: '🔌' },
          { key: 'flight', label: '✈️ Domestic Flight', emoji: '✈️' },
          { key: 'other_transport', label: '❓ Other Transport', emoji: '❓' }
        ].map((t) => (
          <div key={t.key} className="bg-white/5 border border-white/5 rounded-2xl p-4 transition-all hover:bg-white/8">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-white/90 font-medium text-sm flex items-center gap-2">
                <span>{t.emoji}</span>
                {t.label}
              </span>
              <input
                type="checkbox"
                checked={log.transport[t.key] || false}
                onChange={(e) => setLog(prev => ({
                  ...prev,
                  transport: { ...prev.transport, [t.key]: e.target.checked }
                }))}
                className="w-5 h-5 rounded-lg accent-emerald-500 cursor-pointer"
              />
            </label>
            {log.transport[t.key] && (
              <div className="mt-3 flex items-center gap-3 animate-[fadeIn_0.15s_ease]">
                <label className="text-white/50 text-xs">Distance (km):</label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 15"
                  value={log.transport[`${t.key}_distance`] || ''}
                  onChange={(e) => setLog(prev => ({
                    ...prev,
                    transport: { ...prev.transport, [`${t.key}_distance`]: Number(e.target.value) }
                  }))}
                  className="flex-1 px-3 py-1.5 bg-white/10 border border-white/10 rounded-xl text-white outline-none focus:border-emerald-500 text-sm font-medium"
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>,

    // Step 1: Diet details
    <div key="food" className="space-y-4 animate-[fadeIn_0.2s_ease]">
      <div>
        <h3 className="text-lg font-bold text-white flex items-center gap-2">🍽️ What did you eat today?</h3>
        <p className="text-white/40 text-xs mt-0.5">Choose all meals that represent your consumption today</p>
      </div>

      <div className="space-y-3">
        {[
          { key: 'traditional_veg_meal', label: '🥗 Traditional Veg Meal (Roti, Dal, Sabzi)', desc: 'Low footprint, localized staple' },
          { key: 'heavy_dairy', label: '🥛 Dairy Heavy (Paneer, Ghee, Chai, Lassi)', desc: 'Higher cattle farming emissions' },
          { key: 'non_veg_meal', label: '🍗 Non-Vegetarian Meal (Chicken, Mutton, Fish)', desc: 'Elevated greenhouse gas impact' },
          { key: 'fast_food_delivery', label: '🍔 Zomato / Swiggy Delivery or Fast Food', desc: 'Added delivery & packaging emissions' },
          { key: 'other_food', label: '❓ Other Food / Dining Out', desc: 'Custom meal footprint' }
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => toggleMeal(f.key)}
            className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 flex flex-col gap-0.5
              ${log.meals.includes(f.key)
                ? 'bg-emerald-500/10 border-emerald-500/30 shadow-md shadow-emerald-500/5'
                : 'bg-white/5 border-white/5 hover:bg-white/8 hover:border-white/10'
              }`}
          >
            <span className="text-white font-semibold text-sm">{f.label}</span>
            <span className="text-white/45 text-xs">{f.desc}</span>
          </button>
        ))}
      </div>
    </div>,

    // Step 2: Energy consumption details
    <div key="energy" className="space-y-4 animate-[fadeIn_0.2s_ease]">
      <div>
        <h3 className="text-lg font-bold text-white flex items-center gap-2">⚡ Home & Appliance Usage</h3>
        <p className="text-white/40 text-xs mt-0.5">Enter approximate hours of usage for today</p>
      </div>

      <div className="space-y-3">
        {[
          { key: 'ac_hours', label: '❄️ Air Conditioner (AC)', desc: 'High load cooling' },
          { key: 'air_cooler_hours', label: '🌬️ Desert Cooler / Fan combo', desc: 'Low load cooling' },
          { key: 'fan_led_hours', label: '💡 Ceiling Fans & LED Lights', desc: 'Daily essentials' },
          { key: 'geyser_hours', label: '🚿 Geyser / Water Heater', desc: 'Heavy heating element' },
          { key: 'diesel_generator_hours', label: '🔌 Diesel Generator (Backup power)', desc: 'High direct emission backup' },
          { key: 'other_energy_hours', label: '❓ Other Heavy Appliances', desc: 'Washing machine, microwave, oven' }
        ].map((e) => (
          <div key={e.key} className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center justify-between gap-4">
            <div>
              <span className="text-white/90 font-medium text-sm block">{e.label}</span>
              <span className="text-white/40 text-xs">{e.desc}</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="24"
                value={log.energy[e.key] || ''}
                onChange={(ev) => setLog(prev => ({
                  ...prev,
                  energy: { ...prev.energy, [e.key]: Number(ev.target.value) }
                }))}
                className="w-16 px-2.5 py-1.5 bg-white/10 border border-white/10 rounded-xl text-white outline-none focus:border-emerald-500 text-center text-sm font-semibold"
                placeholder="0"
              />
              <span className="text-white/40 text-xs">hrs</span>
            </div>
          </div>
        ))}
      </div>
    </div>,

    // Step 3: Shopping details
    <div key="shopping" className="space-y-4 animate-[fadeIn_0.2s_ease]">
      <div>
        <h3 className="text-lg font-bold text-white flex items-center gap-2">🛍️ Purchases & Deliveries</h3>
        <p className="text-white/40 text-xs mt-0.5">Select any purchases or deliveries made today</p>
      </div>

      <div className="space-y-3">
        {[
          { key: 'local_bazaar', label: '🥦 Local Sabzi Mandi / Kirana Store', desc: 'Zero/low single-use packaging' },
          { key: 'quick_commerce_delivery', label: '📦 Quick Commerce (Blinkit, Instamart, Zepto)', desc: 'Quick packaging & courier delivery' },
          { key: 'new_clothes', label: '👕 Apparel & Clothes (New)', desc: 'High textile manufacturing footprint' },
          { key: 'new_electronics', label: '📱 Electronics or Appliances (New)', desc: 'High manufacturing footprint' },
          { key: 'secondhand_repair', label: '♻️ Secondhand / Local Cobbler/Tailor repair', desc: 'Virtually zero emissions' },
          { key: 'other_shopping', label: '❓ Other retail shopping', desc: 'Generic merchandise purchase' }
        ].map((s) => (
          <button
            key={s.key}
            onClick={() => toggleShopping(s.key)}
            className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 flex flex-col gap-0.5
              ${log.shopping.includes(s.key)
                ? 'bg-emerald-500/10 border-emerald-500/30 shadow-md shadow-emerald-500/5'
                : 'bg-white/5 border-white/5 hover:bg-white/8 hover:border-white/10'
              }`}
          >
            <span className="text-white font-semibold text-sm">{s.label}</span>
            <span className="text-white/45 text-xs">{s.desc}</span>
          </button>
        ))}
      </div>
    </div>
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 max-w-md w-full max-h-[85vh] overflow-y-auto flex flex-col justify-between shadow-2xl">
        <div>
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-extrabold text-white">Daily Check-in</h2>
              <p className="text-emerald-400 text-xs font-semibold mt-0.5">🔥 {streak} day streak</p>
            </div>
            <button onClick={onClose} className="text-white/40 hover:text-white text-2xl transition-colors">×</button>
          </div>

          {/* Progress Indicators */}
          <div className="flex gap-2 mb-6">
            {steps.map((_, i) => (
              <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i <= step ? 'bg-emerald-400' : 'bg-white/10'}`} />
            ))}
          </div>

          {/* Content */}
          <div className="mb-6">{steps[step]}</div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-white/5">
          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              className="px-5 py-3 rounded-2xl bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition-all font-semibold text-sm"
            >
              Back
            </button>
          )}
          {step < steps.length - 1 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold hover:from-emerald-400 hover:to-teal-400 shadow-lg shadow-emerald-500/10 transition-all text-sm"
            >
              Next Step
            </button>
          ) : (
            <button
              onClick={saveLog}
              className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold hover:from-emerald-400 hover:to-teal-400 shadow-lg shadow-emerald-500/10 transition-all text-sm"
            >
              Log Today's Carbon footprint ✓
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
