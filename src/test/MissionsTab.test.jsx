import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import MissionsTab from '../components/MissionsTab';
import { formatDate } from '../utils/scoring';

// Seed missions so tests are deterministic
const TODAY = formatDate(new Date());
const MOCK_MISSIONS = [
  { title: 'Take the metro today', description: 'Use public transport', saving: 1.5, category: 'transport', completed: false },
  { title: 'Skip meat for one meal', description: 'Eat vegetarian', saving: 2.2, category: 'food', completed: false },
  { title: 'Turn off AC for 2 hours', description: 'Reduce AC usage', saving: 2.4, category: 'energy', completed: false },
];

describe('MissionsTab', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem(`ecostep_missions_${TODAY}`, JSON.stringify(MOCK_MISSIONS));
  });

  it('renders exactly 3 missions', () => {
    render(<MissionsTab />);
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(3);
  });

  it('renders mission titles', () => {
    render(<MissionsTab />);
    expect(screen.getByText('Take the metro today')).toBeInTheDocument();
    expect(screen.getByText('Skip meat for one meal')).toBeInTheDocument();
    expect(screen.getByText('Turn off AC for 2 hours')).toBeInTheDocument();
  });

  it('mission buttons have aria-pressed="false" initially', () => {
    render(<MissionsTab />);
    const buttons = screen.getAllByRole('button');
    buttons.forEach((btn) => {
      expect(btn).toHaveAttribute('aria-pressed', 'false');
    });
  });

  it('shows 0/3 completed initially', () => {
    render(<MissionsTab />);
    expect(screen.getByText(/0\/3 completed/)).toBeInTheDocument();
  });

  it('shows a status live region for announcements', () => {
    render(<MissionsTab />);
    expect(screen.getAllByRole('status').length).toBeGreaterThan(0);
  });

  it('shows savings per mission', () => {
    render(<MissionsTab />);
    expect(screen.getByText('-1.5 kg CO₂')).toBeInTheDocument();
    expect(screen.getByText('-2.2 kg CO₂')).toBeInTheDocument();
    expect(screen.getByText('-2.4 kg CO₂')).toBeInTheDocument();
  });

  it('clicking a mission marks it completed (aria-pressed changes)', async () => {
    vi.useFakeTimers();
    render(<MissionsTab />);
    const firstBtn = screen.getAllByRole('button')[0];
    fireEvent.click(firstBtn);
    act(() => {
      vi.advanceTimersByTime(700);
    });
    expect(screen.getAllByRole('button')[0]).toHaveAttribute('aria-pressed', 'true');
    vi.useRealTimers();
  });

  it('persists completion to localStorage', () => {
    vi.useFakeTimers();
    render(<MissionsTab />);
    fireEvent.click(screen.getAllByRole('button')[0]);
    act(() => {
      vi.advanceTimersByTime(700);
    });
    const stored = JSON.parse(localStorage.getItem(`ecostep_missions_${TODAY}`));
    expect(stored[0].completed).toBe(true);
    vi.useRealTimers();
  });

  it('shows celebration when all 3 completed', () => {
    const allDone = MOCK_MISSIONS.map((m) => ({ ...m, completed: true }));
    localStorage.setItem(`ecostep_missions_${TODAY}`, JSON.stringify(allDone));
    render(<MissionsTab />);
    expect(screen.getByText(/All missions complete!/i)).toBeInTheDocument();
  });

  it('shows total saved when all completed', () => {
    const allDone = MOCK_MISSIONS.map((m) => ({ ...m, completed: true }));
    localStorage.setItem(`ecostep_missions_${TODAY}`, JSON.stringify(allDone));
    render(<MissionsTab />);
    // 1.5 + 2.2 + 2.4 = 6.1
    expect(screen.getByText(/6.1 kg CO₂ today/)).toBeInTheDocument();
  });

  it('completed mission button is disabled', () => {
    const oneCompleted = [{ ...MOCK_MISSIONS[0], completed: true }, ...MOCK_MISSIONS.slice(1)];
    localStorage.setItem(`ecostep_missions_${TODAY}`, JSON.stringify(oneCompleted));
    render(<MissionsTab />);
    const buttons = screen.getAllByRole('button');
    expect(buttons[0]).toBeDisabled();
  });

  it('has section landmark with correct label', () => {
    render(<MissionsTab />);
    expect(screen.getByRole('region', { name: /Daily Missions/i })).toBeInTheDocument();
  });
});
