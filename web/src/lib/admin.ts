import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';

const call = <T, R>(name: string) => httpsCallable<T, R>(functions, name);

export const apiUpdateEnquiryStatus = (enquiryId: string, nextStatus: string, notes?: string) =>
  call<{ enquiryId: string; nextStatus: string; notes?: string }, { ok: boolean }>('updateEnquiryStatus')({
    enquiryId,
    nextStatus,
    notes,
  }).then((r) => r.data);

export const apiConvertToBooking = (enquiryId: string, notes?: string) =>
  call<{ enquiryId: string; notes?: string }, { bookingId: string }>('convertEnquiryToBooking')({
    enquiryId,
    notes,
  }).then((r) => r.data);

export const apiUpdateBookingStatus = (bookingId: string, nextStatus: string, notes?: string) =>
  call<{ bookingId: string; nextStatus: string; notes?: string }, { ok: boolean }>('updateBookingStatus')({
    bookingId,
    nextStatus,
    notes,
  }).then((r) => r.data);

export const ENQUIRY_NEXT: Record<string, string[]> = {
  NEW: ['CONTACTED', 'CANCELLED'],
  CONTACTED: ['PENDING', 'CANCELLED'],
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
};

export const BOOKING_NEXT: Record<string, string[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['COMPLETED', 'CANCELLED', 'NO_SHOW'],
  COMPLETED: [],
  CANCELLED: [],
  NO_SHOW: [],
};
