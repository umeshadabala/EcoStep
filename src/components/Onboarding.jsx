import { useState, useId } from 'react';
import PropTypes from 'prop-types';
import { sanitizeString } from '../utils/scoring';

const ONBOARDING_STEPS = [
  {
    question: "What's your primary commute method in India?",
    key: 'commute',
    options: [
      { label: '🛵 Petrol Scooter / Bike', value: 'petrol_two_wheeler' },
      { label: '⚡ Electric Scooter / Bike', value: 'ev_two_wheeler' },
      { label: '🚇 Metro / Local Train', value: 'metro_train' },
      { label: '🚗 Petrol/Diesel Car', value: 'petrol_car' },
      { label: '🚌 Public Bus (DTC/BEST/BMTC)', value: 'bus' },
      { label: '🛺 Auto Rickshaw (CNG)', value: 'auto_rickshaw_cng' },
      { label: '🚶 Walking / Cycling', value: 'walking' },
      { label: '❓ Others', value: 'other_transport' },
    ],
  },
  {
    question: 'How does your typical Indian diet look?',
    key: 'diet',
    options: [
      { label: '🍗 Non-Vegetarian Daily (Chicken/Mutton)', value: 'non_veg_daily' },
      { label: '🐟 Non-Vegetarian Occasionally (few times/week)', value: 'non_veg_freq' },
      { label: '🥛 Vegetarian with heavy dairy (Chai, Paneer, Ghee)', value: 'veg_dairy' },
      { label: '🥬 Vegan / Satvik (No dairy, plant-based)', value: 'vegan_satvik' },
    ],
  },
  {
    question: 'What is the climate like in your region?',
    key: 'climate',
    options: [
      { label: '☀️ Hot & Humid (Delhi, Mumbai, Chennai, Kolkata)', value: 'hot' },
      { label: '🌤️ Moderate & Pleasant (Bengaluru, Pune, Hill stations)', value: 'moderate' },
      { label: '❄️ Cold / Temperate (Himalayan regions, Kashmir, Shimla)', value: 'cold' },
    ],
  },
  {
    question: 'Select your Indian city',
    key: 'city',
    options: [
      { label: 'Bengaluru', value: 'Bengaluru' },
      { label: 'Mumbai', value: 'Mumbai' },
      { label: 'Delhi NCR', value: 'Delhi NCR' },
      { label: 'Chennai', value: 'Chennai' },
      { label: 'Kolkata', value: 'Kolkata' },
      { label: 'Pune', value: 'Pune' },
      { label: 'Hyderabad', value: 'Hyderabad' },
      { label: '❓ Other City (Type manually)', value: 'other' },
    ],
  },
];

/**
 * Onboarding flow that collects user profile data across 4 steps.
 * @param {{ onComplete: (profile: object) => void }} props
 */
export default function Onboarding({ onComplete }) {
  const progressId = useId();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [customCity, setCustomCity] = useState('');
  const [showCustomCityInput, setShowCustomCityInput] = useState(false);
  const [customCityError, setCustomCityError] = useState('');

  const current = ONBOARDING_STEPS[step];
  const progress = ((step + 1) / ONBOARDING_STEPS.length) * 100;

  const handleSelect = (value) => {
    if (current.key === 'city' && value === 'other') {
      setShowCustomCityInput(true);
      return;
    }
    const updated = { ...answers, [current.key]: value };
    setAnswers(updated);
    advance(updated);
  };

  const handleCustomCitySubmit = () => {
    const sanitized = sanitizeString(customCity, 60);
    if (!sanitized) {
      setCustomCityError('Please enter a valid city name.');
      return;
    }
    setCustomCityError('');
    const updated = { ...answers, city: sanitized };
    setAnswers(updated);
    advance(updated);
  };

  const advance = (updated) => {
    if (step < ONBOARDING_STEPS.length - 1) {
      setStep(step + 1);
    } else {
      localStorage.setItem('ecostep_profile', JSON.stringify(updated));
      onComplete(updated);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl relative overflow-hidden">
        {/* Decorative glows */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl" aria-hidden="true" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-teal-500/20 rounded-full blur-3xl" aria-hidden="true" />

        {/* Header */}
        <div className="text-center mb-8 relative z-10">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/20 backdrop-blur-sm mb-4 border border-emerald-500/30"
            aria-hidden="true"
          >
            <span className="text-3xl">🛺</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">EcoStep: Carbon City</h1>
          <p className="text-emerald-400/80 text-sm mt-1">India Edition</p>
        </div>

        {/* Progress bar */}
        <div className="mb-8 relative z-10">
          <div className="flex justify-between text-xs text-emerald-400/70 mb-2 font-medium" aria-hidden="true">
            <span>Step {step + 1} of {ONBOARDING_STEPS.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div
            role="progressbar"
            aria-valuenow={step + 1}
            aria-valuemin={1}
            aria-valuemax={ONBOARDING_STEPS.length}
            aria-labelledby={progressId}
            aria-label={`Onboarding progress: step ${step + 1} of ${ONBOARDING_STEPS.length}`}
            className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5"
          >
            <div
              className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div key={step} className="relative z-10 animate-[fadeIn_0.3s_ease]">
          {!showCustomCityInput ? (
            <>
              <h2 id={progressId} className="text-xl font-bold text-white mb-6 leading-snug">
                {current.question}
              </h2>
              <div className="space-y-3" role="group" aria-labelledby={progressId}>
                {current.options.map((opt) => {
                  const isSelected = answers[current.key] === opt.value;
                  return (
                    <button
                      key={opt.value}
                      id={`option-${opt.value}`}
                      onClick={() => handleSelect(opt.value)}
                      aria-selected={isSelected}
                      className="w-full text-left px-5 py-4 rounded-2xl border bg-white/5 border-white/10 text-white/90 hover:bg-white/10 hover:border-emerald-500/30 active:scale-[0.99] transition-all duration-200 flex items-center justify-between group focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <span className="font-medium">{opt.label}</span>
                      <span className="text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true">
                        →
                      </span>
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-white mb-4">Enter your City name</h2>
              <div>
                <label htmlFor="custom-city-input" className="sr-only">
                  City name
                </label>
                <input
                  id="custom-city-input"
                  type="text"
                  value={customCity}
                  onChange={(e) => {
                    setCustomCity(e.target.value);
                    if (customCityError) setCustomCityError('');
                  }}
                  placeholder="e.g. Lucknow, Jaipur, Kochi"
                  onKeyDown={(e) => e.key === 'Enter' && handleCustomCitySubmit()}
                  maxLength={60}
                  aria-required="true"
                  aria-describedby={customCityError ? 'city-error' : 'city-hint'}
                  aria-invalid={!!customCityError}
                  className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/30 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 transition-all text-lg"
                  autoFocus
                />
                {customCityError ? (
                  <p id="city-error" role="alert" className="text-red-400 text-xs mt-2">
                    {customCityError}
                  </p>
                ) : (
                  <p id="city-hint" className="text-white/30 text-xs mt-2">
                    Max 60 characters. Press Enter or click below to continue.
                  </p>
                )}
              </div>
              <button
                onClick={handleCustomCitySubmit}
                disabled={!customCity.trim()}
                className="w-full py-4 rounded-2xl font-bold text-white tracking-wide bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-emerald-400"
              >
                Complete Onboarding 🚀
              </button>
              <button
                onClick={() => { setShowCustomCityInput(false); setCustomCityError(''); }}
                className="w-full py-2 text-sm text-white/50 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white/30 rounded-lg"
              >
                ← Back to list
              </button>
            </div>
          )}
        </div>

        {/* Back button */}
        {step > 0 && !showCustomCityInput && (
          <button
            onClick={() => setStep(step - 1)}
            className="mt-6 text-sm font-medium text-emerald-400/60 hover:text-emerald-400 transition-colors mx-auto block focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-lg px-2 py-1"
          >
            ← Previous Question
          </button>
        )}
      </div>
    </div>
  );
}

Onboarding.propTypes = {
  onComplete: PropTypes.func.isRequired,
};
