import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Booking } from './booking';
import { submitEnquiry } from '../lib/enquiry';
import { listPending } from '../lib/queue';

const rooms = [
  { id: 'ordinary-room', type: 'ordinary', name: 'Ordinary Room', description: null, capacity: 2, rate: 20, currency: 'USD', amenities: ['Wi-Fi'], images: [], active: true },
  { id: 'ensuite-room', type: 'ensuite', name: 'Ensuite Room', description: null, capacity: 2, rate: 30, currency: 'USD', amenities: [], images: [], active: true },
];

vi.mock('../lib/content', () => ({
  useAccommodations: () => ({ data: rooms, loading: false, error: null, live: false }),
}));

vi.mock('../lib/enquiry', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../lib/enquiry')>();
  return { ...actual, submitEnquiry: vi.fn() };
});

describe('Booking', () => {
  beforeEach(() => {
    vi.mocked(submitEnquiry).mockReset();
  });

  async function fillRequired(user: ReturnType<typeof userEvent.setup>) {
    await user.type(screen.getByLabelText('Your Name'), 'Tendai');
    await user.type(screen.getByLabelText('Phone (WhatsApp)'), '+263774114599');
    await user.type(screen.getByLabelText('Check-in Date'), '2026-10-01');
    await user.type(screen.getByLabelText('Check-out Date'), '2026-10-03');
  }

  it('shows a confirmation with reference and WhatsApp handoff after a valid submit', async () => {
    const user = userEvent.setup();
    vi.mocked(submitEnquiry).mockResolvedValue({ enquiryId: 'e-12345678', whatsappUrl: 'https://wa.me/263774114599?text=hi' });
    render(<Booking />);

    await fillRequired(user);
    await user.click(screen.getByRole('button', { name: 'Send Enquiry →' }));

    expect(await screen.findByRole('status')).toHaveTextContent('Enquiry received — ref E-123456');
    const link = screen.getByRole('link', { name: 'Continue to WhatsApp →' });
    expect(link).toHaveAttribute('href', 'https://wa.me/263774114599?text=hi');
  });

  it('blocks invalid submissions with a visible error and never calls the API', async () => {
    const user = userEvent.setup();
    render(<Booking />);

    // Passes native `required`, but the phone is not E.164 → React-level validation.
    await user.type(screen.getByLabelText('Your Name'), 'Tendai');
    await user.type(screen.getByLabelText('Phone (WhatsApp)'), '12345');
    await user.type(screen.getByLabelText('Check-in Date'), '2026-10-01');
    await user.type(screen.getByLabelText('Check-out Date'), '2026-10-03');
    await user.click(screen.getByRole('button', { name: 'Send Enquiry →' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Phone must be E.164 (e.g. +263…).');
    expect(submitEnquiry).not.toHaveBeenCalled();
  });

  it('queues locally on a retryable network failure and reports it to the guest', async () => {
    const user = userEvent.setup();
    vi.mocked(submitEnquiry).mockRejectedValue(Object.assign(new Error('Failed to fetch'), { code: 'unavailable' }));
    render(<Booking />);

    await fillRequired(user);
    await user.click(screen.getByRole('button', { name: 'Send Enquiry →' }));

    // Two notes can be present (status + queued count) — match the specific message.
    expect(
      await screen.findByText('Saved on this device. It will send automatically when you are back online.'),
    ).toBeInTheDocument();
    // Real queue + real IndexedDB (fake-indexeddb): prove the dropped enquiry actually persisted.
    const queued = await listPending();
    expect(queued).toHaveLength(1);
    expect(queued[0].payload.guest.name).toBe('Tendai');
  });
});