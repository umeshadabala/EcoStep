import emissions from '../data/emissions.json';

export function calculateDailyScore(log) {
  if (!log) return 0;
  let total = 0;

  // Transport
  if (log.transport) {
    const transportTypes = [
      'petrol_car', 'diesel_car', 'ev_car',
      'petrol_two_wheeler', 'ev_two_wheeler',
      'auto_rickshaw_cng', 'metro_train', 'bus', 'flight', 'other_transport'
    ];
    transportTypes.forEach(type => {
      const distanceKey = `${type}_distance`;
      if (log.transport[type] && log.transport[distanceKey]) {
        const rate = emissions.transport[`${type}_per_km`] || emissions.transport[type] || 0;
        total += rate * Number(log.transport[distanceKey]);
      }
    });
  }

  // Food
  if (log.meals && Array.isArray(log.meals)) {
    log.meals.forEach((meal) => {
      if (emissions.food[meal]) {
        total += emissions.food[meal];
      }
    });
  }

  // Energy
  if (log.energy) {
    const energyTypes = [
      { key: 'ac_hours', rateKey: 'ac_per_hour' },
      { key: 'air_cooler_hours', rateKey: 'air_cooler_per_hour' },
      { key: 'fan_led_hours', rateKey: 'fan_led_per_hour' },
      { key: 'geyser_hours', rateKey: 'geyser_per_hour' },
      { key: 'diesel_generator_hours', rateKey: 'diesel_generator_per_hour' },
      { key: 'other_energy_hours', rateKey: 'other_energy' }
    ];
    energyTypes.forEach(e => {
      if (log.energy[e.key]) {
        const rate = emissions.energy[e.rateKey] || 0;
        total += rate * Number(log.energy[e.key]);
      }
    });
  }

  // Shopping
  if (log.shopping && Array.isArray(log.shopping)) {
    log.shopping.forEach((item) => {
      if (emissions.shopping[item]) {
        total += emissions.shopping[item];
      }
    });
  }

  return Math.max(0, Math.round(total * 10) / 10);
}

export function getWeeklyTotal(days = 7) {
  let total = 0;
  const today = new Date();
  for (let i = 0; i < days; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = `ecostep_log_${formatDate(d)}`;
    try {
      const log = JSON.parse(localStorage.getItem(key));
      if (log) {
        total += calculateDailyScore(log);
      }
    } catch {}
  }
  return Math.round(total * 10) / 10;
}

export function getDailyScores(days = 7) {
  const scores = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = formatDate(d);
    const key = `ecostep_log_${dateStr}`;
    try {
      const log = JSON.parse(localStorage.getItem(key));
      const missionKey = `ecostep_missions_${dateStr}`;
      const missions = JSON.parse(localStorage.getItem(missionKey));
      let bonus = 0;
      if (missions && Array.isArray(missions)) {
        missions.forEach((m) => {
          if (m.completed) bonus += m.saving;
        });
      }
      const raw = log ? calculateDailyScore(log) : 0;
      scores.push({
        date: dateStr,
        label: d.toLocaleDateString('en-IN', { weekday: 'short' }),
        score: Math.max(0, Math.round((raw - bonus) * 10) / 10),
        rawScore: raw,
        hasData: !!log,
      });
    } catch {
      scores.push({ date: dateStr, label: d.toLocaleDateString('en-IN', { weekday: 'short' }), score: 0, rawScore: 0, hasData: false });
    }
  }
  return scores;
}

export function getCityState(weeklyTotal) {
  if (weeklyTotal < 35) return 'Thriving';
  if (weeklyTotal < 70) return 'Struggling';
  if (weeklyTotal < 110) return 'Polluted';
  return 'Critical';
}

export function getCategoryBreakdown(days = 7) {
  const breakdown = { transport: 0, food: 0, energy: 0, shopping: 0 };
  const today = new Date();
  for (let i = 0; i < days; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = `ecostep_log_${formatDate(d)}`;
    try {
      const log = JSON.parse(localStorage.getItem(key));
      if (!log) continue;

      // Transport
      if (log.transport) {
        const transportTypes = [
          'petrol_car', 'diesel_car', 'ev_car',
          'petrol_two_wheeler', 'ev_two_wheeler',
          'auto_rickshaw_cng', 'metro_train', 'bus', 'flight', 'other_transport'
        ];
        transportTypes.forEach(type => {
          const distanceKey = `${type}_distance`;
          if (log.transport[type] && log.transport[distanceKey]) {
            const rate = emissions.transport[`${type}_per_km`] || emissions.transport[type] || 0;
            breakdown.transport += rate * Number(log.transport[distanceKey]);
          }
        });
      }

      // Food
      if (log.meals) {
        log.meals.forEach((m) => {
          if (emissions.food[m]) breakdown.food += emissions.food[m];
        });
      }

      // Energy
      if (log.energy) {
        const energyTypes = [
          { key: 'ac_hours', rateKey: 'ac_per_hour' },
          { key: 'air_cooler_hours', rateKey: 'air_cooler_per_hour' },
          { key: 'fan_led_hours', rateKey: 'fan_led_per_hour' },
          { key: 'geyser_hours', rateKey: 'geyser_per_hour' },
          { key: 'diesel_generator_hours', rateKey: 'diesel_generator_per_hour' },
          { key: 'other_energy_hours', rateKey: 'other_energy' }
        ];
        energyTypes.forEach(e => {
          if (log.energy[e.key]) {
            const rate = emissions.energy[e.rateKey] || 0;
            breakdown.energy += rate * Number(log.energy[e.key]);
          }
        });
      }

      // Shopping
      if (log.shopping) {
        log.shopping.forEach((item) => {
          if (emissions.shopping[item]) breakdown.shopping += emissions.shopping[item];
        });
      }
    } catch {}
  }
  Object.keys(breakdown).forEach((k) => {
    breakdown[k] = Math.round(breakdown[k] * 10) / 10;
  });
  return breakdown;
}

export function getStreak() {
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = `ecostep_log_${formatDate(d)}`;
    if (localStorage.getItem(key)) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

export function getLoggedDaysCount(days = 7) {
  let count = 0;
  const today = new Date();
  for (let i = 0; i < days; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = `ecostep_log_${formatDate(d)}`;
    if (localStorage.getItem(key)) count++;
  }
  return count;
}

export function getConsecutiveGreenDays() {
  let count = 0;
  const today = new Date();
  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = `ecostep_log_${formatDate(d)}`;
    try {
      const log = JSON.parse(localStorage.getItem(key));
      // In India context, thriving day limit is around 5kg CO2
      if (log && calculateDailyScore(log) < (35 / 7)) {
        count++;
      } else {
        break;
      }
    } catch {
      break;
    }
  }
  return count;
}

export function getConsecutiveNoDriveDays() {
  let count = 0;
  const today = new Date();
  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = `ecostep_log_${formatDate(d)}`;
    try {
      const log = JSON.parse(localStorage.getItem(key));
      if (log && log.transport) {
        const drove = log.transport.petrol_car || log.transport.diesel_car || log.transport.petrol_two_wheeler;
        if (!drove) {
          count++;
        } else {
          break;
        }
      } else {
        break;
      }
    } catch {
      break;
    }
  }
  return count;
}

export function formatDate(date) {
  return date.toISOString().split('T')[0];
}

export function getWorstCategory(breakdown) {
  let worst = 'transport';
  let max = 0;
  Object.entries(breakdown).forEach(([key, val]) => {
    if (val > max) {
      max = val;
      worst = key;
    }
  });
  return worst;
}

export function getComparison(category, value) {
  const comparisons = {
    transport: [
      { threshold: 5, text: `riding an auto-rickshaw for ${Math.round(value / 0.08)} km — like a long cross-city ride` },
      { threshold: 15, text: `driving a petrol car for ${Math.round(value / 0.18)} km — nearly Delhi to Aligarh` },
      { threshold: 30, text: `driving a diesel SUV for ${Math.round(value / 0.22)} km — equivalent to Mumbai to Pune` },
    ],
    food: [
      { threshold: 5, text: `cooking ${Math.round(value / 0.6)} traditional vegetarian meals — or eating heavy butter chicken` },
      { threshold: 15, text: `your food footprint is equal to ordering quick commerce delivery ${Math.round(value / 2.0)} times` },
      { threshold: 30, text: `your food footprint could power a household refrigerator for a whole month` },
    ],
    energy: [
      { threshold: 5, text: `running a high-load geyser for ${Math.round(value / 1.8)} hours` },
      { threshold: 15, text: `running a 5kVA diesel generator for ${Math.round(value / 2.5)} hours during power cuts` },
      { threshold: 30, text: `your home energy footprint matches driving ${Math.round(value / 0.06)} km on a petrol scooter` },
    ],
    shopping: [
      { threshold: 5, text: `buying ${Math.round(value / 0.5)} times from local vegetable vendor/bazaar` },
      { threshold: 20, text: `ordering quick-commerce instant deliveries ${Math.round(value / 2.0)} times` },
      { threshold: 50, text: `your shopping emissions equal buying a new smartphone/electronics item` },
    ],
  };

  const list = comparisons[category] || comparisons.transport;
  for (let i = list.length - 1; i >= 0; i--) {
    if (value >= list[i].threshold) return list[i].text;
  }
  return `${value.toFixed(1)} kg CO₂ — keep it low!`;
}
