import { describe, expect, it } from 'vitest';
import { validateEnquiry, type EnquiryPayload } from './enquiry';

function valid(over?: Partial<EnquiryPayload>): EnquiryPayload {
  return {
    guest: { name: 'Tendai', phone: '+263774114599' },
    details: {
      accommodationId: 'ordinary-room',
      checkIn: '2026-10-01',
      checkOut: '2026-10-03',
      partySize: 2,
      longStay: false,
    },
    idempotencyKey: 'k-1',
    ...over,
  };
}

describe('validateEnquiry', () => {
  it('accepts a complete valid enquiry', () => {
    expect(validateEnquiry(valid())).toBeNull();
  });

  it('requires a non-blank name', () => {
    expect(validateEnquiry(valid({ guest: { name: '   ', phone: '+263774114599' } }))).toBe('Name is required.');
  });

  it('requires E.164 phone with country code', () => {
    const base = valid();
    expect(validateEnquiry({ ...base, guest: { name: 'Tendai', phone: '263774114599' } })).toBe(
      'Phone must be E.164 (e.g. +263…).',
    );
    expect(validateEnquiry({ ...base, guest: { name: 'Tendai', phone: '+12' } })).toBe(
      'Phone must be E.164 (e.g. +263…).',
    );
  });

  it('rejects missing or unordered dates', () => {
    const base = valid();
    expect(validateEnquiry({ ...base, details: { ...base.details, checkIn: '' } })).toBe('Valid dates required.');
    expect(validateEnquiry({ ...base, details: { ...base.details, checkOut: '2026-09-30', checkIn: '2026-10-01' } })).toBe(
      'Check-out must be after check-in.',
    );
    expect(validateEnquiry({ ...base, details: { ...base.details, checkOut: '2026-10-01' } })).toBe(
      'Check-out must be after check-in.',
    );
  });

  it('bounds party size to 1–10', () => {
    const base = valid();
    expect(validateEnquiry({ ...base, details: { ...base.details, partySize: 0 } })).toBe('Party size 1–10.');
    expect(validateEnquiry({ ...base, details: { ...base.details, partySize: 11 } })).toBe('Party size 1–10.');
    expect(validateEnquiry({ ...base, details: { ...base.details, partySize: 1 } })).toBeNull();
    expect(validateEnquiry({ ...base, details: { ...base.details, partySize: 10 } })).toBeNull();
  });
});