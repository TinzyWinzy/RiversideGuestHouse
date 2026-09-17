import { initializeApp } from 'firebase/app';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = JSON.parse(import.meta.env.VITE_FIREBASE_CONFIG ?? '{}');

export const app = initializeApp(firebaseConfig);

// App Check (reCAPTCHA v3): active once VITE_APPCHECK_KEY is set at deploy time.
// Until then the public endpoint rejects calls — by design (see SECURITY.md Phase 1).
if (import.meta.env.VITE_APPCHECK_KEY && import.meta.env.VITE_APPCHECK_KEY !== 'TBD') {
  initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(import.meta.env.VITE_APPCHECK_KEY),
    isTokenAutoRefreshEnabled: true,
  });
}
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);
