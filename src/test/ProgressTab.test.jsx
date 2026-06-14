import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProgressTab from '../components/ProgressTab';
import { formatDate } from '../utils/scoring';

function seedLog(daysAgo, logData) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  localStorage.setItem(`ecostep_log_${formatDate(d)}`, JSON.stringify(logData));
}

const SAMPLE_LOG = {
  transport: { petrol_car: true, petrol_car_distance: 10 },
  meals: ['traditional_veg_meal'],
  energy: { ac_hours: 1 },
  shopping: [],
};

describe('ProgressTab — no data', () => {
  beforeEach(() => localStorage.clear());

  it('renders the Progress Analysis heading', () => {
    render(<ProgressTab />);
    expect(screen.getByRole('heading', { name: /Progress Analysis/i })).toBeInTheDocument();
  });

  it('renders the section landmark', () => {
    render(<ProgressTab />);
    expect(screen.getByRole('region', { name: /Progress Analysis/i })).toBeInTheDocument();
  });

  it('chart container has role="img"', () => {
    render(<ProgressTab />);
    expect(screen.getByRole('img', { name: /Bar chart/i })).toBeInTheDocument();
  });

  it('chart aria-label mentions weekly total', () => {
    render(<ProgressTab />);
    const chart = screen.getByRole('img', { name: /Bar chart/i });
    expect(chart.getAttribute('aria-label')).toContain('0.0 kg CO₂');
  });

  it('shows — for best day with no data', () => {
    render(<ProgressTab />);
    // At least one em dash
    const emDashes = screen.getAllByText('—');
    expect(emDashes.length).toBeGreaterThan(0);
  });

  it('shows No data text for best and worst day', () => {
    render(<ProgressTab />);
    const nodataEls = screen.getAllByText('No data');
    expect(nodataEls.length).toBeGreaterThanOrEqual(2);
  });

  it('shows Onboarding week for weekly change', () => {
    render(<ProgressTab />);
    expect(screen.getByText(/Onboarding week/i)).toBeInTheDocument();
  });

  it('weekly stats region exists', () => {
    render(<ProgressTab />);
    expect(screen.getByRole('region', { name: /Weekly statistics/i })).toBeInTheDocument();
  });

  it('stat labels are rendered', () => {
    render(<ProgressTab />);
    expect(screen.getByText('Best Day')).toBeInTheDocument();
    expect(screen.getByText('Worst Day')).toBeInTheDocument();
    expect(screen.getByText('Weekly Change')).toBeInTheDocument();
  });
});

describe('ProgressTab — with data', () => {
  beforeEach(() => {
    localStorage.clear();
    seedLog(0, SAMPLE_LOG);
    seedLog(1, SAMPLE_LOG);
    seedLog(2, SAMPLE_LOG);
  });

  it('chart aria-label shows non-zero total', () => {
    render(<ProgressTab />);
    const chart = screen.getByRole('img', { name: /Bar chart/i });
    expect(chart.getAttribute('aria-label')).not.toContain('0.0 kg CO₂');
  });

  it('stat values have aria-label with descriptive text', () => {
    render(<ProgressTab />);
    // Best day stat should have aria-label with kg in it
    const statEl = screen.getAllByLabelText(/kg CO₂ on/i)[0];
    expect(statEl).toBeInTheDocument();
  });

  it('shows kg for best day', () => {
    render(<ProgressTab />);
    const kgEls = screen.getAllByText('kg');
    expect(kgEls.length).toBeGreaterThan(0);
  });
});
