// E2E smoke test against nexusedge-v633g (production project).
// Run from web/ so `firebase` resolves from web/node_modules: node scripts/e2e-smoke.mjs
// NOTE (Phase 1): createEnquiry now enforces App Check. This script carries no
// token, so CALL1 is EXPECTED to fail with functions/unauthenticated until run
// from an App-Check-enabled client. Negative rules probes still valid.
import { initializeApp } from 'firebase/app';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// Read config from web/.env.local (avoids shell-quoting issues).
const envLocal = readFileSync(join(dirname(fileURLToPath(import.meta.url)), '..', '.env.local'), 'utf8');
const cfgLine = envLocal.split('\n').find((l) => l.startsWith('VITE_FIREBASE_CONFIG='));
const app = initializeApp(JSON.parse(cfgLine.replace('VITE_FIREBASE_CONFIG=', '')));
const functions = getFunctions(app, 'us-central1');
const db = getFirestore(app);

const idem = randomUUID();
const payload = {
  guest: { name: 'E2E Smoke Test DELETE ME', phone: '+263700000001' },
  details: {
    accommodationId: 'ordinary-room', checkIn: '2026-10-01', checkOut: '2026-10-03',
    partySize: 2, longStay: false, message: 'E2E smoke test — safe to delete.',
  },
  idempotencyKey: idem,
};

const create = httpsCallable(functions, 'createEnquiry');
const r1 = await create(payload);
console.log('CALL1:', JSON.stringify(r1.data));
const r2 = await create(payload);
console.log('CALL2 (same idempotencyKey):', JSON.stringify(r2.data));
console.log('IDEMPOTENT:', r1.data.enquiryId === r2.data.enquiryId ? 'PASS' : 'FAIL');
const url = r1.data.whatsappUrl;
console.log('WA-HAS-NUMBER:', url.includes('263774114599') ? 'PASS' : 'FAIL');
console.log('WA-HAS-REF:', /ENQ-/i.test(decodeURIComponent(url)) ? 'PASS' : 'FAIL');

// Negative probes: unauthenticated direct writes/reads on operational collections must fail.
try {
  await setDoc(doc(db, 'enquiries', 'e2e-probe'), { probe: true });
  console.log('RULES-WRITE-DENY: FAIL (write allowed!)');
} catch (e) {
  console.log('RULES-WRITE-DENY: PASS (' + (e.code ?? e.message) + ')');
}
try {
  await getDoc(doc(db, 'enquiries', r1.data.enquiryId));
  console.log('RULES-READ-DENY: FAIL (read allowed!)');
} catch (e) {
  console.log('RULES-READ-DENY: PASS (' + (e.code ?? e.message) + ')');
}
console.log('ENQUIRY_ID=' + r1.data.enquiryId);
