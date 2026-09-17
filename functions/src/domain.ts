export type EnquiryStatus = 'NEW' | 'CONTACTED' | 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

const ENQUIRY_NEXT: Record<EnquiryStatus, EnquiryStatus[]> = {
  NEW: ['CONTACTED', 'CANCELLED'],
  CONTACTED: ['PENDING', 'CANCELLED'],
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
};

const BOOKING_NEXT: Record<BookingStatus, BookingStatus[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['COMPLETED', 'CANCELLED', 'NO_SHOW'],
  COMPLETED: [],
  CANCELLED: [],
  NO_SHOW: [],
};

export function assertEnquiryTransition(from: EnquiryStatus, to: EnquiryStatus): void {
  if (!ENQUIRY_NEXT[from].includes(to)) throw new Error(`Unsupported enquiry transition ${from} -> ${to}`);
}

export function assertBookingTransition(from: BookingStatus, to: BookingStatus): void {
  if (!BOOKING_NEXT[from].includes(to)) throw new Error(`Unsupported booking transition ${from} -> ${to}`);
}

export function normalizePhone(raw: string): string {
  const p = raw.trim().replace(/[\s-]/g, '');
  if (!/^\+[1-9]\d{7,14}$/.test(p)) throw new Error('Phone must be E.164 (e.g. +263774114599)');
  return p;
}

export function buildWhatsappUrl(mgmtE164: string, ref: string, name: string, room: string, checkIn: string, checkOut: string, partySize: number, longStay: boolean, nightlyRate?: number, source?: string): string {
  const num = mgmtE164.replace('+', '');
  const nights = Math.max(0, Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86_400_000));
  const total = nightlyRate !== undefined && nights > 0 ? `\nEstimated total: USD ${nights * nightlyRate} for ${nights} night${nights === 1 ? '' : 's'}` : '';
  const attr = source ? `\n\n(Sent from: ${source})` : '';
  const text = `Hello Riverside Guest House,\n\nI would like to enquire about accommodation.\n\nRef: ${ref}\nName: ${name}\nCheck-in: ${checkIn}\nCheck-out: ${checkOut}\nGuests: ${partySize}\nRoom: ${room}\nLong stay: ${longStay ? 'Yes (please share discount)' : 'No'}${total}\n\nPlease confirm availability and pricing.${attr}`;
  return `https://wa.me/${num}?text=${encodeURIComponent(text)}`;
}
