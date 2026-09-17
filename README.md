# Riverside Guest House — Digital Operations System

Mobile-first guest acquisition + booking operations for Riverside Guest House,
22418 Riverside Park, Ruwa, Zimbabwe. Vite + React + Firebase (Firestore, Auth,
Functions, App Check) on `nexusedge-v633g`, hosted on Vercel.

Workflow: Discover → Enquire → Capture → Respond → Book → Manage.
WhatsApp is the channel; Firestore is the record.

## Layout

- `web/` — public site (pre-rendered) + management SPA. See `web/.env.example`.
- `functions/` — `createEnquiry`, status lifecycle, booking conversion, notifications.
- `schema/` — `firestore.rules`, `firestore.indexes.json`, seed data.
- `scripts/seed.mjs` — seed property + rooms (needs `FIRESTORE_PROJECT_ID` + credentials).
- `ARCHITECTUREDOC-v1.1.txt` — build-ready spec. `SECURITY.md` — posture + accepted risks.

## Local dev

```powershell
cd web; npm install; npm run dev        # needs web/.env.local (see .env.example)
cd ../functions; npm install; npm run build
```

## Deploy

```powershell
firebase deploy --only firestore        # rules + indexes from schema/
firebase deploy --only functions        # needs functions/.env (MGMT_WA_NUMBER)
cd web; vercel --prod                   # needs VITE_FIREBASE_CONFIG, VITE_APPCHECK_KEY, SITE_URL
```

Key docs: `prd.txt` (PRD v1.2 + SAD v1.2), `ARCHITECTUREDOC-v1.1.txt`, `SECURITY.md`.
