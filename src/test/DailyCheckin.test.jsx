import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DailyCheckin from '../components/DailyCheckin';

// Mock formatDate and getStreak to control state
vi.mock('../utils/scoring', async (importOriginal) => {
  const real = await importOriginal();
  return {
    ...real,
    getStreak: () => 3,
    formatDate: () => '2024-06-14',
  };
});

describe('DailyCheckin', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders the modal with dialog role', () => {
    render(<DailyCheckin onClose={vi.fn()} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('modal has aria-modal="true"', () => {
    render(<DailyCheckin onClose={vi.fn()} />);
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
  });

  it('modal has aria-labelledby referencing the heading', () => {
    render(<DailyCheckin onClose={vi.fn()} />);
    const dialog = screen.getByRole('dialog');
    const labelledBy = dialog.getAttribute('aria-labelledby');
    const heading = screen.getByText('Daily Check-in');
    expect(heading.id).toBe(labelledBy);
  });

  it('shows step 0 transport heading initially', () => {
    render(<DailyCheckin onClose={vi.fn()} />);
    expect(screen.getByText(/How did you commute today/i)).toBeInTheDocument();
  });

  it('shows progress bar', () => {
    render(<DailyCheckin onClose={vi.fn()} />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('progress bar has correct aria attributes', () => {
    render(<DailyCheckin onClose={vi.fn()} />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '1');
    expect(bar).toHaveAttribute('aria-valuemin', '1');
    expect(bar).toHaveAttribute('aria-valuemax', '4');
  });

  it('renders transport checkboxes with labels', () => {
    render(<DailyCheckin onClose={vi.fn()} />);
    const checkbox = screen.getByLabelText(/Petrol Scooter/i);
    expect(checkbox).toBeInTheDocument();
    expect(checkbox.type).toBe('checkbox');
  });

  it('shows distance input when transport checkbox is checked', async () => {
    render(<DailyCheckin onClose={vi.fn()} />);
    const checkbox = screen.getByLabelText(/Petrol Scooter/i);
    fireEvent.click(checkbox);
    expect(await screen.findByLabelText(/Petrol Scooter \/ Bike distance/i)).toBeInTheDocument();
  });

  it('Next button advances to food step', () => {
    render(<DailyCheckin onClose={vi.fn()} />);
    fireEvent.click(screen.getByText(/Next:/i));
    expect(screen.getByText(/What did you eat today/i)).toBeInTheDocument();
  });

  it('Back button returns to previous step', () => {
    render(<DailyCheckin onClose={vi.fn()} />);
    fireEvent.click(screen.getByText(/Next:/i));
    expect(screen.getByText(/What did you eat today/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText('Back'));
    expect(screen.getByText(/How did you commute today/i)).toBeInTheDocument();
  });

  it('meal buttons have aria-pressed attribute', () => {
    render(<DailyCheckin onClose={vi.fn()} />);
    fireEvent.click(screen.getByText(/Next:/i));
    const mealBtn = screen.getByText(/Traditional Veg Meal/i).closest('button');
    expect(mealBtn).toHaveAttribute('aria-pressed');
  });

  it('meal toggle changes aria-pressed state', async () => {
    render(<DailyCheckin onClose={vi.fn()} />);
    fireEvent.click(screen.getByText(/Next:/i));
    const mealBtn = screen.getByText(/Traditional Veg Meal/i).closest('button');
    expect(mealBtn).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(mealBtn);
    expect(mealBtn).toHaveAttribute('aria-pressed', 'true');
  });

  it('can reach energy step', () => {
    render(<DailyCheckin onClose={vi.fn()} />);
    fireEvent.click(screen.getByText(/Next:/i));
    fireEvent.click(screen.getByText(/Next:/i));
    expect(screen.getByText(/Home & Appliance Usage/i)).toBeInTheDocument();
  });

  it('energy inputs have proper labels', () => {
    render(<DailyCheckin onClose={vi.fn()} />);
    fireEvent.click(screen.getByText(/Next:/i));
    fireEvent.click(screen.getByText(/Next:/i));
    expect(screen.getByLabelText(/Air Conditioner/i)).toBeInTheDocument();
  });

  it('can reach shopping step', () => {
    render(<DailyCheckin onClose={vi.fn()} />);
    fireEvent.click(screen.getByText(/Next:/i));
    fireEvent.click(screen.getByText(/Next:/i));
    fireEvent.click(screen.getByText(/Next:/i));
    expect(screen.getByText(/Purchases & Deliveries/i)).toBeInTheDocument();
  });

  it('shopping buttons have aria-pressed', () => {
    render(<DailyCheckin onClose={vi.fn()} />);
    fireEvent.click(screen.getByText(/Next:/i));
    fireEvent.click(screen.getByText(/Next:/i));
    fireEvent.click(screen.getByText(/Next:/i));
    const shopBtn = screen.getByText(/Local Sabzi Mandi/i).closest('button');
    expect(shopBtn).toHaveAttribute('aria-pressed');
  });

  it('shows save button on last step', () => {
    render(<DailyCheckin onClose={vi.fn()} />);
    fireEvent.click(screen.getByText(/Next:/i));
    fireEvent.click(screen.getByText(/Next:/i));
    fireEvent.click(screen.getByText(/Next:/i));
    expect(screen.getByText(/Log Today's Carbon footprint/i)).toBeInTheDocument();
  });

  it('saves log to localStorage on submit', async () => {
    vi.useFakeTimers();
    render(<DailyCheckin onClose={vi.fn()} />);
    fireEvent.click(screen.getByText(/Next:/i));
    fireEvent.click(screen.getByText(/Next:/i));
    fireEvent.click(screen.getByText(/Next:/i));
    fireEvent.click(screen.getByText(/Log Today's Carbon footprint/i));
    expect(localStorage.getItem('ecostep_log_2024-06-14')).not.toBeNull();
    vi.useRealTimers();
  });

  it('close button has aria-label', () => {
    render(<DailyCheckin onClose={vi.fn()} />);
    expect(screen.getByLabelText(/Close daily check-in/i)).toBeInTheDocument();
  });

  it('calls onClose when close button clicked', () => {
    const onClose = vi.fn();
    render(<DailyCheckin onClose={onClose} />);
    fireEvent.click(screen.getByLabelText(/Close daily check-in/i));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('escape key calls onClose', () => {
    const onClose = vi.fn();
    render(<DailyCheckin onClose={onClose} />);
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(onClose).toHaveBeenCalledOnce();
  });
});
