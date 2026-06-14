import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import InsightsPanel from '../components/InsightsPanel';
import { formatDate } from '../utils/scoring';

function seedLogs(n = 5) {
  for (let i = 0; i < n; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = `ecostep_log_${formatDate(d)}`;
    localStorage.setItem(
      key,
      JSON.stringify({
        transport: { petrol_car: true, petrol_car_distance: 10 },
        meals: ['non_veg_meal'],
        energy: { ac_hours: 2 },
        shopping: [],
      }),
    );
  }
}

describe('InsightsPanel — insufficient data', () => {
  beforeEach(() => localStorage.clear());

  it('shows insufficient data message when < 3 days logged', () => {
    render(<InsightsPanel onClose={vi.fn()} />);
    expect(screen.getByText(/Insufficient Data/i)).toBeInTheDocument();
  });

  it('shows how many days are needed', () => {
    render(<InsightsPanel onClose={vi.fn()} />);
    expect(screen.getByText(/at least 3 days/i)).toBeInTheDocument();
  });

  it('insufficient data dialog has correct ARIA', () => {
    render(<InsightsPanel onClose={vi.fn()} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
  });

  it('okay button calls onClose', () => {
    const onClose = vi.fn();
    render(<InsightsPanel onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: /Okay/i }));
    expect(onClose).toHaveBeenCalledOnce();
  });
});

describe('InsightsPanel — with data', () => {
  beforeEach(() => {
    localStorage.clear();
    seedLogs(5);
  });

  it('renders dialog with role="dialog"', () => {
    render(<InsightsPanel onClose={vi.fn()} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('has aria-modal="true"', () => {
    render(<InsightsPanel onClose={vi.fn()} />);
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
  });

  it('has aria-labelledby matching heading id', () => {
    render(<InsightsPanel onClose={vi.fn()} />);
    const dialog = screen.getByRole('dialog');
    const labelledBy = dialog.getAttribute('aria-labelledby');
    const heading = screen.getByText(/Personalized Insights/i);
    expect(heading.id).toBe(labelledBy);
  });

  it('shows Personalized Insights heading', () => {
    render(<InsightsPanel onClose={vi.fn()} />);
    expect(screen.getByText(/Personalized Insights/i)).toBeInTheDocument();
  });

  it('shows Highest Emission Source section', () => {
    render(<InsightsPanel onClose={vi.fn()} />);
    expect(screen.getByText(/Highest Emission Source/i)).toBeInTheDocument();
  });

  it('shows a CO₂ value', () => {
    render(<InsightsPanel onClose={vi.fn()} />);
    expect(screen.getByText(/kg CO₂ logged this week/i)).toBeInTheDocument();
  });

  it('renders progressbars for each category', () => {
    render(<InsightsPanel onClose={vi.fn()} />);
    const bars = screen.getAllByRole('progressbar');
    expect(bars.length).toBeGreaterThanOrEqual(4);
  });

  it('each progressbar has aria-valuenow', () => {
    render(<InsightsPanel onClose={vi.fn()} />);
    const bars = screen.getAllByRole('progressbar');
    bars.forEach((bar) => {
      expect(bar).toHaveAttribute('aria-valuenow');
    });
  });

  it('shows "What this equals" comparison section', () => {
    render(<InsightsPanel onClose={vi.fn()} />);
    expect(screen.getByText(/What this equals/i)).toBeInTheDocument();
  });

  it('shows category breakdown labels', () => {
    render(<InsightsPanel onClose={vi.fn()} />);
    expect(screen.getByText(/Category Breakdown/i)).toBeInTheDocument();
  });

  it('close button has aria-label', () => {
    render(<InsightsPanel onClose={vi.fn()} />);
    expect(screen.getByLabelText(/Close insights panel/i)).toBeInTheDocument();
  });

  it('close button calls onClose', () => {
    const onClose = vi.fn();
    render(<InsightsPanel onClose={onClose} />);
    fireEvent.click(screen.getByLabelText(/Close insights panel/i));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('Escape key calls onClose', () => {
    const onClose = vi.fn();
    render(<InsightsPanel onClose={onClose} />);
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('Got it button closes the panel', () => {
    const onClose = vi.fn();
    render(<InsightsPanel onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: /Got it/i }));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
