import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Onboarding from '../components/Onboarding';

describe('Onboarding', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders the first question on mount', () => {
    render(<Onboarding onComplete={vi.fn()} />);
    expect(screen.getByText(/primary commute method/i)).toBeInTheDocument();
  });

  it('renders the app title', () => {
    render(<Onboarding onComplete={vi.fn()} />);
    expect(screen.getByRole('heading', { name: /EcoStep/i })).toBeInTheDocument();
  });

  it('shows progress bar', () => {
    render(<Onboarding onComplete={vi.fn()} />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('progress bar has correct min/max/now values', () => {
    render(<Onboarding onComplete={vi.fn()} />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '1');
    expect(bar).toHaveAttribute('aria-valuemin', '1');
    expect(bar).toHaveAttribute('aria-valuemax', '4');
  });

  it('renders commute options in a group', () => {
    render(<Onboarding onComplete={vi.fn()} />);
    expect(screen.getByRole('group')).toBeInTheDocument();
    expect(screen.getByText(/Petrol Scooter/i)).toBeInTheDocument();
  });

  it('advances to next step on option click', async () => {
    render(<Onboarding onComplete={vi.fn()} />);
    const bikeBtn = screen.getByText(/Petrol Scooter/i).closest('button');
    fireEvent.click(bikeBtn);
    expect(await screen.findByText(/diet/i)).toBeInTheDocument();
  });

  it('shows back button after step 1', async () => {
    render(<Onboarding onComplete={vi.fn()} />);
    fireEvent.click(screen.getByText(/Petrol Scooter/i).closest('button'));
    expect(await screen.findByText(/Previous Question/i)).toBeInTheDocument();
  });

  it('back button returns to previous step', async () => {
    render(<Onboarding onComplete={vi.fn()} />);
    fireEvent.click(screen.getByText(/Petrol Scooter/i).closest('button'));
    await screen.findByText(/diet/i);
    fireEvent.click(screen.getByText(/Previous Question/i));
    expect(screen.getByText(/primary commute method/i)).toBeInTheDocument();
  });

  it('shows city list on step 4', async () => {
    render(<Onboarding onComplete={vi.fn()} />);
    // Step 1: commute
    fireEvent.click(screen.getByText(/Metro \/ Local Train/i).closest('button'));
    // Step 2: diet
    await screen.findByText(/diet/i);
    fireEvent.click(screen.getByText(/Vegetarian with heavy dairy/i).closest('button'));
    // Step 3: climate
    await screen.findByText(/climate/i);
    fireEvent.click(screen.getByText(/Hot & Humid/i).closest('button'));
    // Step 4: city
    expect(await screen.findByText('Bengaluru')).toBeInTheDocument();
    expect(screen.getByText('Mumbai')).toBeInTheDocument();
  });

  it('shows custom city input when "Other City" selected', async () => {
    render(<Onboarding onComplete={vi.fn()} />);
    fireEvent.click(screen.getByText(/Metro/i).closest('button'));
    await screen.findByText(/diet/i);
    fireEvent.click(screen.getByText(/Vegetarian with heavy/i).closest('button'));
    await screen.findByText(/climate/i);
    fireEvent.click(screen.getByText(/Hot & Humid/i).closest('button'));
    await screen.findByText('Bengaluru');
    fireEvent.click(screen.getByText(/Other City/i).closest('button'));
    expect(screen.getByRole('textbox', { name: /city name/i })).toBeInTheDocument();
  });

  it('custom city input has aria-required', async () => {
    render(<Onboarding onComplete={vi.fn()} />);
    fireEvent.click(screen.getByText(/Metro/i).closest('button'));
    await screen.findByText(/diet/i);
    fireEvent.click(screen.getByText(/Vegetarian with heavy/i).closest('button'));
    await screen.findByText(/climate/i);
    fireEvent.click(screen.getByText(/Hot & Humid/i).closest('button'));
    await screen.findByText('Bengaluru');
    fireEvent.click(screen.getByText(/Other City/i).closest('button'));
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-required', 'true');
  });

  it('shows error when submitting empty custom city', async () => {
    render(<Onboarding onComplete={vi.fn()} />);
    fireEvent.click(screen.getByText(/Metro/i).closest('button'));
    await screen.findByText(/diet/i);
    fireEvent.click(screen.getByText(/Vegetarian with heavy/i).closest('button'));
    await screen.findByText(/climate/i);
    fireEvent.click(screen.getByText(/Hot & Humid/i).closest('button'));
    await screen.findByText('Bengaluru');
    fireEvent.click(screen.getByText(/Other City/i).closest('button'));
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '<script>' } });
    fireEvent.click(screen.getByText(/Complete Onboarding/i));
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('saves profile to localStorage on completion', async () => {
    const onComplete = vi.fn();
    render(<Onboarding onComplete={onComplete} />);
    fireEvent.click(screen.getByText(/Metro/i).closest('button'));
    await screen.findByText(/diet/i);
    fireEvent.click(screen.getByText(/Vegetarian with heavy dairy/i).closest('button'));
    await screen.findByText(/climate/i);
    fireEvent.click(screen.getByText(/Hot & Humid/i).closest('button'));
    await screen.findByText('Bengaluru');
    fireEvent.click(screen.getByText('Bengaluru'));
    expect(localStorage.getItem('ecostep_profile')).not.toBeNull();
    expect(onComplete).toHaveBeenCalledOnce();
  });

  it('onComplete receives profile object', async () => {
    const onComplete = vi.fn();
    render(<Onboarding onComplete={onComplete} />);
    fireEvent.click(screen.getByText(/Metro/i).closest('button'));
    await screen.findByText(/diet/i);
    fireEvent.click(screen.getByText(/Non-Vegetarian Daily/i).closest('button'));
    await screen.findByText(/climate/i);
    fireEvent.click(screen.getByText(/Moderate/i).closest('button'));
    await screen.findByText('Bengaluru');
    fireEvent.click(screen.getByText('Mumbai'));
    const profile = onComplete.mock.calls[0][0];
    expect(profile).toHaveProperty('commute');
    expect(profile).toHaveProperty('diet');
    expect(profile).toHaveProperty('city');
  });
});
