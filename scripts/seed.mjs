// Seed Firestore from schema/*.json using Admin SDK.
// Requires GOOGLE_APPLICATION_CREDENTIALS + FIRESTORE_PROJECT_ID. Never commit credentials.
// Usage: FIRESTORE_PROJECT_ID=riverside-dev node scripts/seed.mjs
import { readFileSync } from 'node:fs';
import admin from 'firebase-admin';

const projectId = process.env.FIRESTORE_PROJECT_ID;
if (!projectId) throw new Error('FIRESTORE_PROJECT_ID required.');
admin.initializeApp({ projectId });
const db = admin.firestore();

const property = JSON.parse(readFileSync(new URL('../schema/seed.property.json', import.meta.url), 'utf8'));
const ordinary = JSON.parse(readFileSync(new URL('../schema/seed.accommodations.ordinary.json', import.meta.url), 'utf8'));
const ensuite = JSON.parse(readFileSync(new URL('../schema/seed.accommodations.ensuite.json', import.meta.url), 'utf8'));

await db.doc('settings/property').set({ ...property, updatedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
for (const room of [ordinary, ensuite]) {
  await db.doc(`accommodations/${room.id}`).set({ ...room, createdAt: admin.firestore.FieldValue.serverTimestamp(), updatedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
}
console.log('Seeded settings/property + 2 accommodations (USD 20/30).');
