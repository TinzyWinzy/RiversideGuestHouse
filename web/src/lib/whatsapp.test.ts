import { describe, expect, it } from 'vitest';
import { buildDraftMessage, waLink } from './whatsapp';

describe('buildDraftMessage', () => {
  it('builds a base enquiry with source attribution when no dates given', () => {
    const msg = buildDraftMessage({ roomName: 'Ordinary Room', source: 'Floating button' });
    expect(msg).toContain('Hello Riverside Guest House, I would like to enquire about the *Ordinary Room*.');
    expect(msg).toContain('(Sent from: Floating button)');
  });

  it('adds a draft with correct night count and estimated total', () => {
    const msg = buildDraftMessage({
      roomName: 'Ordinary Room',
      checkIn: '2026-10-01',
      checkOut: '2026-10-04',
      partySize: 2,
      nightlyRate: 20,
      source: 'Room: Ordinary Room',
    });
    expect(msg).toContain('My booking draft:');
    expect(msg).toContain('- Check-in: 2026-10-01');
    expect(msg).toContain('- Guests: 2');
    expect(msg).toContain('Estimated total: US$60 for 3 nights');
  });

  it('flags long stays inside the booking draft', () => {
    const msg = buildDraftMessage({
      roomName: 'Ensuite Room',
      checkIn: '2026-10-01',
      checkOut: '2026-10-29',
      source: 'x',
      longStay: true,
    });
    expect(msg).toContain('Long stay: Yes (please share discount)');
  });
});

describe('waLink', () => {
  it('targets the business number and encodes the message', () => {
    const url = waLink('Hello? & thanks');
    expect(url.startsWith('https://wa.me/263774114599?text=')).toBe(true);
    expect(decodeURIComponent(url)).toContain('Hello? & thanks');
  });
});