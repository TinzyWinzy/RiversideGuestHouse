import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import * as admin from 'firebase-admin';
import { assertBookingTransition, assertEnquiryTransition, buildWhatsappUrl, normalizePhone } from './domain';

admin.initializeApp();
const db = admin.firestore();

const MGMT_WA = process.env.MGMT_WA_NUMBER ?? '+263774114599'; // E.164
const MGMT_EMAIL = process.env.MGMT_NOTIFY_EMAIL ?? ''; // TBD — onNewEnquiryNotify logs if unset

interface CreateEnquiryPayload {
  guest: { name: string; phone: string; email?: string };
  details: { accommodationId: string; checkIn: string; checkOut: string; partySize: number; longStay: boolean; message?: string };
  idempotencyKey: string;
}

async function checkRateLimit(key: string, maxPerHour: number): Promise<void> {
  const ref = db.doc(`rateLimits/${key}`);
  const now = admin.firestore.Timestamp.now();
  const snap = await ref.get();
  const windowStart = now.toMillis() - 3_600_000;
  const hits: number[] = (snap.data()?.hits ?? []).filter((t: number) => t > windowStart);
  if (hits.length >= maxPerHour) throw new HttpsError('resource-exhausted', 'Too many requests. Try again later.');
  hits.push(now.toMillis());
  await ref.set({ hits }, { merge: true });
}

export const createEnquiry = onCall<CreateEnquiryPayload>({ enforceAppCheck: true }, async (req) => {
  const p = req.data;
  if (!p?.guest?.name?.trim()) throw new HttpsError('invalid-argument', 'Name required.');
  const phone = normalizePhone(p.guest.phone ?? '');
  const { accommodationId, checkIn, checkOut, partySize, longStay } = p.details ?? ({} as CreateEnquiryPayload['details']);
  const ci = new Date(checkIn);
  const co = new Date(checkOut);
  if (Number.isNaN(ci.getTime()) || Number.isNaN(co.getTime()) || co <= ci) throw new HttpsError('invalid-argument', 'Invalid dates.');
  if (!Number.isInteger(partySize) || partySize < 1 || partySize > 10) throw new HttpsError('invalid-argument', 'Party size 1–10.');
  if (!p.idempotencyKey) throw new HttpsError('invalid-argument', 'idempotencyKey required.');

  await checkRateLimit(`ip:${req.rawRequest?.ip ?? 'unknown'}`, 5);
  await checkRateLimit(`phone:${phone}`, 3);

  const accSnap = await db.doc(`accommodations/${accommodationId}`).get();
  if (!accSnap.exists || accSnap.data()?.active !== true) throw new HttpsError('not-found', 'Accommodation unavailable.');
  const acc = accSnap.data() as { rate: number; currency: string; capacity?: number | null; name: string };
  if (acc.capacity && partySize > acc.capacity) throw new HttpsError('invalid-argument', 'Party size exceeds room capacity.');

  // Idempotency: reuse existing enquiry for same key.
  const existing = await db.collection('enquiries').where('idempotencyKey', '==', p.idempotencyKey).limit(1).get();
  if (!existing.empty) {
    const d = existing.docs[0];
    return { enquiryId: d.id, whatsappUrl: buildWhatsappUrl(MGMT_WA, `ENQ-${d.id.slice(0, 8).toUpperCase()}`, p.guest.name, acc.name, checkIn, checkOut, partySize, longStay) };
  }

  const now = admin.firestore.FieldValue.serverTimestamp();
  const guestRef = db.doc(`guests/${encodeURIComponent(phone)}`);
  await db.runTransaction(async (tx) => {
    const g = await tx.get(guestRef);
    if (!g.exists) tx.set(guestRef, { name: p.guest.name.trim(), phone, email: p.guest.email ?? null, notes: null, createdAt: now, updatedAt: now });
    else tx.update(guestRef, { name: p.guest.name.trim(), ...(p.guest.email ? { email: p.guest.email } : {}), updatedAt: now });
  });

  const enqRef = db.collection('enquiries').doc();
  await enqRef.set({
    guestId: guestRef.id, accommodationId, checkIn, checkOut, partySize, longStay: !!longStay,
    message: p.details.message ?? null, status: 'NEW', source: 'web',
    quotedRate: acc.rate, currency: acc.currency, quotedAt: now,
    idempotencyKey: p.idempotencyKey, createdAt: now, updatedAt: now,
  });
  const ref = `ENQ-${enqRef.id.slice(0, 8).toUpperCase()}`;
  return { enquiryId: enqRef.id, whatsappUrl: buildWhatsappUrl(MGMT_WA, ref, p.guest.name, acc.name, checkIn, checkOut, partySize, longStay) };
});

export const updateEnquiryStatus = onCall(async (req) => {
  if (req.auth?.token.role !== 'ADMIN' && req.auth?.token.role !== 'MANAGEMENT') throw new HttpsError('permission-denied', 'Staff only.');
  const { enquiryId, nextStatus, notes } = req.data as { enquiryId: string; nextStatus: 'CONTACTED' | 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'; notes?: string };
  const ref = db.doc(`enquiries/${enquiryId}`);
  await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) throw new HttpsError('not-found', 'Enquiry not found.');
    assertEnquiryTransition(snap.data()?.status, nextStatus);
    tx.update(ref, { status: nextStatus, ...(notes ? { message: notes } : {}), updatedAt: admin.firestore.FieldValue.serverTimestamp() });
  });
  await db.collection('auditEvents').add({ actorId: req.auth?.uid, entityType: 'enquiry', entityId: enquiryId, action: `status:${nextStatus}`, timestamp: admin.firestore.FieldValue.serverTimestamp(), metadata: { notes: notes ?? null } });
  return { ok: true };
});

export const convertEnquiryToBooking = onCall(async (req) => {
  if (req.auth?.token.role !== 'ADMIN' && req.auth?.token.role !== 'MANAGEMENT') throw new HttpsError('permission-denied', 'Staff only.');
  const { enquiryId, quotedRate, notes } = req.data as { enquiryId: string; quotedRate?: number; notes?: string };
  const enqSnap = await db.doc(`enquiries/${enquiryId}`).get();
  if (!enqSnap.exists) throw new HttpsError('not-found', 'Enquiry not found.');
  const enq = enqSnap.data() as Record<string, unknown>;
  if (enq.status !== 'PENDING' && enq.status !== 'CONFIRMED') throw new HttpsError('failed-precondition', 'Enquiry must be PENDING or CONFIRMED.');
  const dup = await db.collection('bookings').where('enquiryId', '==', enquiryId).limit(1).get();
  if (!dup.empty) throw new HttpsError('already-exists', 'One booking per enquiry.');
  const now = admin.firestore.FieldValue.serverTimestamp();
  const bRef = db.collection('bookings').doc();
  await bRef.set({
    enquiryId, guestId: enq.guestId, accommodationId: enq.accommodationId, checkIn: enq.checkIn, checkOut: enq.checkOut,
    partySize: enq.partySize, status: 'PENDING', notes: notes ?? null,
    quotedRate: quotedRate ?? enq.quotedRate, currency: enq.currency, createdAt: now, updatedAt: now,
  });
  await db.collection('auditEvents').add({ actorId: req.auth?.uid, entityType: 'booking', entityId: bRef.id, action: 'created', timestamp: now, metadata: { enquiryId } });
  return { bookingId: bRef.id };
});

export const updateBookingStatus = onCall(async (req) => {
  if (req.auth?.token.role !== 'ADMIN' && req.auth?.token.role !== 'MANAGEMENT') throw new HttpsError('permission-denied', 'Staff only.');
  const { bookingId, nextStatus, notes } = req.data as { bookingId: string; nextStatus: 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'; notes?: string };
  const ref = db.doc(`bookings/${bookingId}`);
  await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) throw new HttpsError('not-found', 'Booking not found.');
    assertBookingTransition(snap.data()?.status, nextStatus);
    tx.update(ref, { status: nextStatus, ...(notes ? { notes } : {}), updatedAt: admin.firestore.FieldValue.serverTimestamp() });
  });
  await db.collection('auditEvents').add({ actorId: req.auth?.uid, entityType: 'booking', entityId: bookingId, action: `status:${nextStatus}`, timestamp: admin.firestore.FieldValue.serverTimestamp(), metadata: { notes: notes ?? null } });
  return { ok: true };
});

// Notification must never break enquiry persistence: failures are logged, not thrown to the writer.
export const onNewEnquiryNotify = onDocumentCreated('enquiries/{id}', async (event) => {
  const data = event.data?.data();
  if (!data) return;
  if (!MGMT_EMAIL) {
    console.log(`onNewEnquiryNotify: MGMT_NOTIFY_EMAIL unset; enquiry ${event.params.id} logged only.`);
    return;
  }
  console.log(`onNewEnquiryNotify: notify ${MGMT_EMAIL} about enquiry ${event.params.id} (wire SMTP/SendGrid here).`);
});

// Stale NEW > 2h nudge hook (WhatsApp). MVP logs; wire wa provider in next iteration.
export const checkStaleEnquiries = onSchedule('every 30 minutes', async () => {
  const cutoff = admin.firestore.Timestamp.fromMillis(Date.now() - 2 * 3_600_000);
  const snap = await db.collection('enquiries').where('status', '==', 'NEW').where('createdAt', '<', cutoff).limit(25).get();
  for (const d of snap.docs) console.log(`checkStaleEnquiries: nudge for ${d.id} -> ${MGMT_WA}`);
});
