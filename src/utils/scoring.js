import emissions from '../data/emissions.json';

// ─── Constants ────────────────────────────────────────────────────────────────

/** Weekly CO₂ thresholds (kg) for city state classification */
export const WEEKLY_THRESHOLDS = {
  THRIVING: 35,
  STRUGGLING: 70,
  POLLUTED: 110,
};

/** Daily CO₂ threshold for a "green" day (thriving weekly / 7 days) */
export const GREEN_DAY_LIMIT = WEEKLY_THRESHOLDS.THRIVING / 7;

/**
 * All supported transport types with their distance key suffix.
 * Shared between calculateDailyScore and getCategoryBreakdown.
 */
export const TRANSPORT_TYPES = [
  'petrol_car',
  'diesel_car',
  'ev_car',
  'petrol_two_wheeler',
  'ev_two_wheeler',
  'auto_rickshaw_cng',
  'metro_train',
  'bus',
  'flight',
  'other_transport',
];

/**
 * All supported energy types mapping log key → emission rate key.
 * Shared between calculateDailyScore and getCategoryBreakdown.
 */
export const ENERGY_TYPES = [
  { key: 'ac_hours', rateKey: 'ac_per_hour' },
  { key: 'air_cooler_hours', rateKey: 'air_cooler_per_hour' },
  { key: 'fan_led_hours', rateKey: 'fan_led_per_hour' },
  { key: 'geyser_hours', rateKey: 'geyser_per_hour' },
  { key: 'diesel_generator_hours', rateKey: 'diesel_generator_per_hour' },
  { key: 'other_energy_hours', rateKey: 'other_energy' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Sanitize a user-supplied string: trims whitespace, strips HTML tags,
 * and enforces a maximum length.
 * @param {string} value - Raw user input
 * @param {number} [maxLength=100] - Maximum allowed character length
 * @returns {string} Sanitized string
 */
export function sanitizeString(value, maxLength = 100) {
  if (typeof value !== 'string') return '';
  return value
    .trim()
    .replace(/<[^>]*>/g, '') // strip HTML tags
    .slice(0, maxLength);
}

/**
 * Safely parse JSON from localStorage. Returns null on any failure.
 * @param {string} key - localStorage key
 * @returns {*} Parsed value or null
 */
export function safeLocalGet(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Calculate transport emissions for a single log's transport object.
 * @param {object} transport - transport section of a daily log
 * @returns {number} CO₂ kg from transport
 */
function calcTransportEmissions(transport) {
  if (!transport) return 0;
  let total = 0;
  TRANSPORT_TYPES.forEach((type) => {
    const distanceKey = `${type}_distance`;
    if (transport[type] && transport[distanceKey]) {
      const rate =
        emissions.transport[`${type}_per_km`] ||
        emissions.transport[type] ||
        0;
      total += rate * Number(transport[distanceKey]);
    }
  });
  return total;
}

/**
 * Calculate food emissions for a single log's meals array.
 * @param {string[]} meals - array of meal keys
 * @returns {number} CO₂ kg from food
 */
function calcFoodEmissions(meals) {
  if (!Array.isArray(meals)) return 0;
  return meals.reduce((sum, meal) => sum + (emissions.food[meal] || 0), 0);
}

/**
 * Calculate energy emissions for a single log's energy object.
 * @param {object} energy - energy section of a daily log
 * @returns {number} CO₂ kg from energy
 */
function calcEnergyEmissions(energy) {
  if (!energy) return 0;
  let total = 0;
  ENERGY_TYPES.forEach((e) => {
    if (energy[e.key]) {
      const rate = emissions.energy[e.rateKey] || 0;
      total += rate * Number(energy[e.key]);
    }
  });
  return total;
}

/**
 * Calculate shopping emissions for a single log's shopping array.
 * @param {string[]} shopping - array of shopping item keys
 * @returns {number} CO₂ kg from shopping
 */
function calcShoppingEmissions(shopping) {
  if (!Array.isArray(shopping)) return 0;
  return shopping.reduce(
    (sum, item) => sum + (emissions.shopping[item] || 0),
    0,
  );
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Calculate total daily CO₂ emissions (kg) from a single log entry.
 * @param {object|null} log - Daily log object from localStorage
 * @returns {number} Rounded CO₂ in kg
 */
export function calculateDailyScore(log) {
  if (!log) return 0;
  const total =
    calcTransportEmissions(log.transport) +
    calcFoodEmissions(log.meals) +
    calcEnergyEmissions(log.energy) +
    calcShoppingEmissions(log.shopping);
  return Math.max(0, Math.round(total * 10) / 10);
}

/**
 * Sum total weekly CO₂ emissions over the past N days.
 * @param {number} [days=7] - Number of days to include
 * @returns {number} Rounded weekly total in kg CO₂
 */
export function getWeeklyTotal(days = 7) {
  let total = 0;
  const today = new Date();
  for (let i = 0; i < days; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const log = safeLocalGet(`ecostep_log_${formatDate(d)}`);
    if (log) total += calculateDailyScore(log);
  }
  return Math.round(total * 10) / 10;
}

/**
 * Get daily score objects for the past N days, including mission savings.
 * @param {number} [days=7] - Number of days
 * @returns {Array<{date: string, label: string, score: number, rawScore: number, hasData: boolean}>}
 */
export function getDailyScores(days = 7) {
  const scores = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = formatDate(d);
    const log = safeLocalGet(`ecostep_log_${dateStr}`);
    const missions = safeLocalGet(`ecostep_missions_${dateStr}`);
    let bonus = 0;
    if (Array.isArray(missions)) {
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
  }
  return scores;
}

/**
 * Classify a city's health state based on weekly CO₂ total.
 * @param {number} weeklyTotal - Total kg CO₂ for the week
 * @returns {'Thriving'|'Struggling'|'Polluted'|'Critical'}
 */
export function getCityState(weeklyTotal) {
  if (weeklyTotal < WEEKLY_THRESHOLDS.THRIVING) return 'Thriving';
  if (weeklyTotal < WEEKLY_THRESHOLDS.STRUGGLING) return 'Struggling';
  if (weeklyTotal < WEEKLY_THRESHOLDS.POLLUTED) return 'Polluted';
  return 'Critical';
}

/**
 * Get the CO₂ breakdown by category over the past N days.
 * @param {number} [days=7] - Number of days to include
 * @returns {{transport: number, food: number, energy: number, shopping: number}}
 */
export function getCategoryBreakdown(days = 7) {
  const breakdown = { transport: 0, food: 0, energy: 0, shopping: 0 };
  const today = new Date();
  for (let i = 0; i < days; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const log = safeLocalGet(`ecostep_log_${formatDate(d)}`);
    if (!log) continue;
    breakdown.transport += calcTransportEmissions(log.transport);
    breakdown.food += calcFoodEmissions(log.meals);
    breakdown.energy += calcEnergyEmissions(log.energy);
    breakdown.shopping += calcShoppingEmissions(log.shopping);
  }
  Object.keys(breakdown).forEach((k) => {
    breakdown[k] = Math.round(breakdown[k] * 10) / 10;
  });
  return breakdown;
}

/**
 * Count the current consecutive daily log streak.
 * @returns {number} Number of consecutive days with a log entry
 */
export function getStreak() {
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    if (localStorage.getItem(`ecostep_log_${formatDate(d)}`)) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

/**
 * Count how many days in the past N days have a log entry.
 * @param {number} [days=7] - Window size
 * @returns {number} Number of logged days
 */
export function getLoggedDaysCount(days = 7) {
  let count = 0;
  const today = new Date();
  for (let i = 0; i < days; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    if (localStorage.getItem(`ecostep_log_${formatDate(d)}`)) count++;
  }
  return count;
}

/**
 * Count consecutive recent days where daily CO₂ was below the green threshold.
 * @returns {number} Number of consecutive green days
 */
export function getConsecutiveGreenDays() {
  let count = 0;
  const today = new Date();
  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const log = safeLocalGet(`ecostep_log_${formatDate(d)}`);
    if (log && calculateDailyScore(log) < GREEN_DAY_LIMIT) {
      count++;
    } else {
      break;
    }
  }
  return count;
}

/**
 * Count consecutive recent days with no fossil-fuel driving.
 * @returns {number} Number of consecutive no-drive days
 */
export function getConsecutiveNoDriveDays() {
  let count = 0;
  const today = new Date();
  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const log = safeLocalGet(`ecostep_log_${formatDate(d)}`);
    if (log && log.transport) {
      const drove =
        log.transport.petrol_car ||
        log.transport.diesel_car ||
        log.transport.petrol_two_wheeler;
      if (!drove) {
        count++;
      } else {
        break;
      }
    } else {
      break;
    }
  }
  return count;
}

/**
 * Format a Date object as YYYY-MM-DD string.
 * @param {Date} date
 * @returns {string} ISO date string
 */
export function formatDate(date) {
  return date.toISOString().split('T')[0];
}

/**
 * Find the category with the highest emission value.
 * @param {{transport: number, food: number, energy: number, shopping: number}} breakdown
 * @returns {string} Category key with highest emissions
 */
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

/**
 * Get a relatable comparison string for an emission value in a category.
 * @param {string} category - One of transport|food|energy|shopping
 * @param {number} value - CO₂ value in kg
 * @returns {string} Human-readable comparison text
 */
export function getComparison(category, value) {
  const comparisons = {
    transport: [
      {
        threshold: 5,
        text: `riding an auto-rickshaw for ${Math.round(value / 0.08)} km — like a long cross-city ride`,
      },
      {
        threshold: 15,
        text: `driving a petrol car for ${Math.round(value / 0.18)} km — nearly Delhi to Aligarh`,
      },
      {
        threshold: 30,
        text: `driving a diesel SUV for ${Math.round(value / 0.22)} km — equivalent to Mumbai to Pune`,
      },
    ],
    food: [
      {
        threshold: 5,
        text: `cooking ${Math.round(value / 0.6)} traditional vegetarian meals — or eating heavy butter chicken`,
      },
      {
        threshold: 15,
        text: `your food footprint is equal to ordering quick commerce delivery ${Math.round(value / 2.0)} times`,
      },
      {
        threshold: 30,
        text: `your food footprint could power a household refrigerator for a whole month`,
      },
    ],
    energy: [
      {
        threshold: 5,
        text: `running a high-load geyser for ${Math.round(value / 1.8)} hours`,
      },
      {
        threshold: 15,
        text: `running a 5kVA diesel generator for ${Math.round(value / 2.5)} hours during power cuts`,
      },
      {
        threshold: 30,
        text: `your home energy footprint matches driving ${Math.round(value / 0.06)} km on a petrol scooter`,
      },
    ],
    shopping: [
      {
        threshold: 5,
        text: `buying ${Math.round(value / 0.5)} times from local vegetable vendor/bazaar`,
      },
      {
        threshold: 20,
        text: `ordering quick-commerce instant deliveries ${Math.round(value / 2.0)} times`,
      },
      {
        threshold: 50,
        text: `your shopping emissions equal buying a new smartphone/electronics item`,
      },
    ],
  };

  const list = comparisons[category] || comparisons.transport;
  for (let i = list.length - 1; i >= 0; i--) {
    if (value >= list[i].threshold) return list[i].text;
  }
  return `${value.toFixed(1)} kg CO₂ — keep it low!`;
}
