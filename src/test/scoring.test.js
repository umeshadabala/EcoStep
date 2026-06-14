/**
 * Tests for src/utils/scoring.js
 * Covers all exported functions with a range of inputs.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
  calculateDailyScore,
  getWeeklyTotal,
  getDailyScores,
  getCityState,
  getCategoryBreakdown,
  getStreak,
  getLoggedDaysCount,
  getConsecutiveGreenDays,
  getConsecutiveNoDriveDays,
  formatDate,
  getWorstCategory,
  getComparison,
  sanitizeString,
  safeLocalGet,
  WEEKLY_THRESHOLDS,
  GREEN_DAY_LIMIT,
} from '../utils/scoring';

// ── Helpers ──────────────────────────────────────────────────────────────────

const today = new Date();

function dateStr(daysAgo = 0) {
  const d = new Date(today);
  d.setDate(d.getDate() - daysAgo);
  return formatDate(d);
}

function storeLog(daysAgo, logData) {
  localStorage.setItem(`ecostep_log_${dateStr(daysAgo)}`, JSON.stringify(logData));
}

const LOG_PETROL_CAR_10KM = {
  transport: { petrol_car: true, petrol_car_distance: 10 },
  meals: [],
  energy: {},
  shopping: [],
};

const LOG_VEG_MEAL = {
  transport: {},
  meals: ['traditional_veg_meal'],
  energy: {},
  shopping: [],
};

const LOG_AC_2H = {
  transport: {},
  meals: [],
  energy: { ac_hours: 2 },
  shopping: [],
};

const LOG_FULL = {
  transport: { petrol_car: true, petrol_car_distance: 10 },
  meals: ['non_veg_meal', 'traditional_veg_meal'],
  energy: { ac_hours: 1, geyser_hours: 1 },
  shopping: ['quick_commerce_delivery'],
};

// ── sanitizeString ────────────────────────────────────────────────────────────

describe('sanitizeString', () => {
  it('trims whitespace', () => {
    expect(sanitizeString('  Mumbai  ')).toBe('Mumbai');
  });

  it('strips HTML tags', () => {
    expect(sanitizeString('<b>Delhi</b>')).toBe('Delhi');
    expect(sanitizeString('<script>alert(1)</script>')).toBe('alert(1)');
  });

  it('enforces maxLength', () => {
    const long = 'A'.repeat(200);
    expect(sanitizeString(long, 50)).toHaveLength(50);
  });

  it('returns empty string for non-string input', () => {
    expect(sanitizeString(null)).toBe('');
    expect(sanitizeString(123)).toBe('');
    expect(sanitizeString(undefined)).toBe('');
  });
});

// ── safeLocalGet ──────────────────────────────────────────────────────────────

describe('safeLocalGet', () => {
  beforeEach(() => localStorage.clear());

  it('returns null for missing key', () => {
    expect(safeLocalGet('nonexistent')).toBeNull();
  });

  it('returns parsed value for valid JSON', () => {
    localStorage.setItem('test', JSON.stringify({ x: 1 }));
    expect(safeLocalGet('test')).toEqual({ x: 1 });
  });

  it('returns null for malformed JSON', () => {
    localStorage.setItem('bad', 'not-json{{{');
    expect(safeLocalGet('bad')).toBeNull();
  });
});

// ── formatDate ────────────────────────────────────────────────────────────────

describe('formatDate', () => {
  it('returns YYYY-MM-DD format', () => {
    const d = new Date('2024-03-15T12:00:00Z');
    expect(formatDate(d)).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('contains correct date parts', () => {
    const result = formatDate(new Date('2024-06-01T00:00:00Z'));
    expect(result).toContain('2024');
    expect(result).toContain('06');
  });
});

// ── calculateDailyScore ───────────────────────────────────────────────────────

describe('calculateDailyScore', () => {
  it('returns 0 for null input', () => {
    expect(calculateDailyScore(null)).toBe(0);
  });

  it('returns 0 for empty log', () => {
    expect(calculateDailyScore({ transport: {}, meals: [], energy: {}, shopping: [] })).toBe(0);
  });

  it('calculates petrol car transport correctly', () => {
    // petrol_car_per_km = 0.18, 10km → 1.8 kg
    expect(calculateDailyScore(LOG_PETROL_CAR_10KM)).toBe(1.8);
  });

  it('calculates veg meal emissions', () => {
    // traditional_veg_meal = 0.6
    expect(calculateDailyScore(LOG_VEG_MEAL)).toBe(0.6);
  });

  it('calculates AC energy emissions', () => {
    // ac_per_hour = 1.2, 2h → 2.4 kg
    expect(calculateDailyScore(LOG_AC_2H)).toBe(2.4);
  });

  it('sums all categories in a full log', () => {
    // petrol_car 10km = 1.8
    // non_veg_meal = 2.2, traditional_veg_meal = 0.6 → food = 2.8
    // ac_hours 1 = 1.2, geyser_hours 1 = 1.8 → energy = 3.0
    // quick_commerce_delivery = 2.0
    // total = 1.8 + 2.8 + 3.0 + 2.0 = 9.6
    expect(calculateDailyScore(LOG_FULL)).toBe(9.6);
  });

  it('ignores transport type when checkbox is false', () => {
    const log = {
      transport: { petrol_car: false, petrol_car_distance: 100 },
      meals: [],
      energy: {},
      shopping: [],
    };
    expect(calculateDailyScore(log)).toBe(0);
  });

  it('handles EV car with lower emission rate', () => {
    const log = {
      transport: { ev_car: true, ev_car_distance: 10 },
      meals: [],
      energy: {},
      shopping: [],
    };
    // ev_car_per_km = 0.05, 10km → 0.5
    expect(calculateDailyScore(log)).toBe(0.5);
  });

  it('handles shopping emissions', () => {
    const log = {
      transport: {},
      meals: [],
      energy: {},
      shopping: ['new_electronics'],
    };
    // new_electronics = 45.0
    expect(calculateDailyScore(log)).toBe(45.0);
  });

  it('returns non-negative value', () => {
    expect(calculateDailyScore({})).toBeGreaterThanOrEqual(0);
  });
});

// ── getCityState ──────────────────────────────────────────────────────────────

describe('getCityState', () => {
  it('returns Thriving below threshold', () => {
    expect(getCityState(WEEKLY_THRESHOLDS.THRIVING - 1)).toBe('Thriving');
  });

  it('returns Struggling in middle range', () => {
    expect(getCityState(WEEKLY_THRESHOLDS.THRIVING)).toBe('Struggling');
    expect(getCityState(WEEKLY_THRESHOLDS.STRUGGLING - 1)).toBe('Struggling');
  });

  it('returns Polluted in upper range', () => {
    expect(getCityState(WEEKLY_THRESHOLDS.STRUGGLING)).toBe('Polluted');
    expect(getCityState(WEEKLY_THRESHOLDS.POLLUTED - 1)).toBe('Polluted');
  });

  it('returns Critical above polluted threshold', () => {
    expect(getCityState(WEEKLY_THRESHOLDS.POLLUTED)).toBe('Critical');
    expect(getCityState(200)).toBe('Critical');
  });
});

// ── getStreak ─────────────────────────────────────────────────────────────────

describe('getStreak', () => {
  beforeEach(() => localStorage.clear());

  it('returns 0 with no logs', () => {
    expect(getStreak()).toBe(0);
  });

  it('returns 1 with only today logged', () => {
    storeLog(0, LOG_VEG_MEAL);
    expect(getStreak()).toBe(1);
  });

  it('returns 3 for 3 consecutive days', () => {
    storeLog(0, LOG_VEG_MEAL);
    storeLog(1, LOG_VEG_MEAL);
    storeLog(2, LOG_VEG_MEAL);
    expect(getStreak()).toBe(3);
  });

  it('breaks on gap day', () => {
    storeLog(0, LOG_VEG_MEAL);
    storeLog(1, LOG_VEG_MEAL);
    // gap at day 2
    storeLog(3, LOG_VEG_MEAL);
    expect(getStreak()).toBe(2);
  });
});

// ── getLoggedDaysCount ────────────────────────────────────────────────────────

describe('getLoggedDaysCount', () => {
  beforeEach(() => localStorage.clear());

  it('returns 0 when nothing logged', () => {
    expect(getLoggedDaysCount()).toBe(0);
  });

  it('counts correctly within window', () => {
    storeLog(0, LOG_VEG_MEAL);
    storeLog(2, LOG_VEG_MEAL);
    storeLog(4, LOG_VEG_MEAL);
    expect(getLoggedDaysCount(7)).toBe(3);
  });

  it('does not count logs outside the window', () => {
    storeLog(8, LOG_VEG_MEAL);
    expect(getLoggedDaysCount(7)).toBe(0);
  });
});

// ── getWeeklyTotal ────────────────────────────────────────────────────────────

describe('getWeeklyTotal', () => {
  beforeEach(() => localStorage.clear());

  it('returns 0 with no data', () => {
    expect(getWeeklyTotal()).toBe(0);
  });

  it('sums daily scores correctly', () => {
    storeLog(0, LOG_VEG_MEAL); // 0.6
    storeLog(1, LOG_VEG_MEAL); // 0.6
    expect(getWeeklyTotal(7)).toBeCloseTo(1.2, 1);
  });
});

// ── getDailyScores ────────────────────────────────────────────────────────────

describe('getDailyScores', () => {
  beforeEach(() => localStorage.clear());

  it('returns exactly 7 entries by default', () => {
    expect(getDailyScores()).toHaveLength(7);
  });

  it('returns N entries when N specified', () => {
    expect(getDailyScores(3)).toHaveLength(3);
  });

  it('marks hasData correctly', () => {
    storeLog(0, LOG_VEG_MEAL);
    const scores = getDailyScores(7);
    const todayEntry = scores[scores.length - 1];
    expect(todayEntry.hasData).toBe(true);
  });

  it('sets hasData false for days without logs', () => {
    const scores = getDailyScores(7);
    scores.forEach((s) => expect(s.hasData).toBe(false));
  });

  it('includes label field', () => {
    const scores = getDailyScores(3);
    scores.forEach((s) => expect(s.label).toBeTruthy());
  });
});

// ── getCategoryBreakdown ──────────────────────────────────────────────────────

describe('getCategoryBreakdown', () => {
  beforeEach(() => localStorage.clear());

  it('returns zeroed breakdown with no data', () => {
    const b = getCategoryBreakdown();
    expect(b).toEqual({ transport: 0, food: 0, energy: 0, shopping: 0 });
  });

  it('correctly splits transport vs food', () => {
    storeLog(0, {
      transport: { petrol_car: true, petrol_car_distance: 10 },
      meals: ['traditional_veg_meal'],
      energy: {},
      shopping: [],
    });
    const b = getCategoryBreakdown(7);
    expect(b.transport).toBeCloseTo(1.8, 1);
    expect(b.food).toBeCloseTo(0.6, 1);
    expect(b.energy).toBe(0);
    expect(b.shopping).toBe(0);
  });
});

// ── getWorstCategory ──────────────────────────────────────────────────────────

describe('getWorstCategory', () => {
  it('identifies the category with the highest value', () => {
    const breakdown = { transport: 2, food: 5, energy: 1, shopping: 3 };
    expect(getWorstCategory(breakdown)).toBe('food');
  });

  it('returns transport when all zero (default)', () => {
    const breakdown = { transport: 0, food: 0, energy: 0, shopping: 0 };
    expect(getWorstCategory(breakdown)).toBe('transport');
  });
});

// ── getConsecutiveGreenDays ───────────────────────────────────────────────────

describe('getConsecutiveGreenDays', () => {
  beforeEach(() => localStorage.clear());

  it('returns 0 with no data', () => {
    expect(getConsecutiveGreenDays()).toBe(0);
  });

  it('counts days below green limit', () => {
    const greenLog = { transport: {}, meals: ['traditional_veg_meal'], energy: {}, shopping: [] };
    storeLog(0, greenLog); // 0.6 kg < GREEN_DAY_LIMIT
    storeLog(1, greenLog);
    expect(getConsecutiveGreenDays()).toBeGreaterThanOrEqual(2);
  });

  it('breaks on high-emission day', () => {
    const greenLog = { transport: {}, meals: ['traditional_veg_meal'], energy: {}, shopping: [] };
    const bigLog = { transport: { petrol_car: true, petrol_car_distance: 200 }, meals: [], energy: { ac_hours: 8 }, shopping: [] };
    storeLog(0, greenLog);
    storeLog(1, bigLog); // high emission breaks streak
    storeLog(2, greenLog);
    expect(getConsecutiveGreenDays()).toBe(1);
  });
});

// ── getConsecutiveNoDriveDays ─────────────────────────────────────────────────

describe('getConsecutiveNoDriveDays', () => {
  beforeEach(() => localStorage.clear());

  it('returns 0 with no data', () => {
    expect(getConsecutiveNoDriveDays()).toBe(0);
  });

  it('counts days without fossil fuel driving', () => {
    const noDriveLog = { transport: { metro_train: true, metro_train_distance: 10 }, meals: [], energy: {}, shopping: [] };
    storeLog(0, noDriveLog);
    storeLog(1, noDriveLog);
    expect(getConsecutiveNoDriveDays()).toBe(2);
  });

  it('breaks on a petrol car day', () => {
    const noDriveLog = { transport: { metro_train: true, metro_train_distance: 5 }, meals: [], energy: {}, shopping: [] };
    const driveLog = { transport: { petrol_car: true, petrol_car_distance: 20 }, meals: [], energy: {}, shopping: [] };
    storeLog(0, noDriveLog);
    storeLog(1, driveLog);
    expect(getConsecutiveNoDriveDays()).toBe(1);
  });
});

// ── getComparison ─────────────────────────────────────────────────────────────

describe('getComparison', () => {
  it('returns a non-empty string for transport', () => {
    expect(getComparison('transport', 20)).toBeTruthy();
  });

  it('returns a non-empty string for food', () => {
    expect(getComparison('food', 10)).toBeTruthy();
  });

  it('returns fallback for very low value', () => {
    const result = getComparison('transport', 0.1);
    expect(result).toContain('kg CO₂');
  });

  it('returns string for unknown category', () => {
    expect(getComparison('unknown', 10)).toBeTruthy();
  });
});

// ── WEEKLY_THRESHOLDS & GREEN_DAY_LIMIT ────────────────────────────────────────

describe('constants', () => {
  it('GREEN_DAY_LIMIT equals THRIVING / 7', () => {
    expect(GREEN_DAY_LIMIT).toBeCloseTo(WEEKLY_THRESHOLDS.THRIVING / 7, 5);
  });

  it('thresholds are ordered correctly', () => {
    expect(WEEKLY_THRESHOLDS.THRIVING).toBeLessThan(WEEKLY_THRESHOLDS.STRUGGLING);
    expect(WEEKLY_THRESHOLDS.STRUGGLING).toBeLessThan(WEEKLY_THRESHOLDS.POLLUTED);
  });
});
