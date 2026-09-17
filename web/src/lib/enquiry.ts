import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';

export interface EnquiryPayload {
  guest: { name: string; phone: string; email?: string };
  details: {
    accommodationId: string;
    checkIn: string;
    checkOut: string;
    partySize: number;
    longStay: boolean;
    message?: string;
    source?: string;
  };
  idempotencyKey: string;
}

export function validateEnquiry(p: EnquiryPayload): string | null {
  if (!p.guest.name.trim()) return 'Name is required.';
  if (!/^\+[1-9]\d{7,14}$/.test(p.guest.phone.trim())) return 'Phone must be E.164 (e.g. +263…).';
  const ci = new Date(p.details.checkIn);
  const co = new Date(p.details.checkOut);
  if (Number.isNaN(ci.getTime()) || Number.isNaN(co.getTime())) return 'Valid dates required.';
  if (co <= ci) return 'Check-out must be after check-in.';
  if (p.details.partySize < 1 || p.details.partySize > 10) return 'Party size 1–10.';
  return null;
}

export async function submitEnquiry(payload: EnquiryPayload): Promise<{ enquiryId: string; whatsappUrl: string }> {
  const fn = httpsCallable<EnquiryPayload, { enquiryId: string; whatsappUrl: string }>(functions, 'createEnquiry');
  const res = await fn(payload);
  return res.data;
}
