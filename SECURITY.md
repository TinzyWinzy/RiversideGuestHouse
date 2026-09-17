# Riverside Guest House — Security Register

Audits run: 17 Sep 2026 (`npm audit`, non-breaking `npm audit fix` applied).

## Baseline
- web: 3 moderate + 1 high remaining. functions: 8 moderate remaining.

## Accepted risks (with rationale)
1. `vite` high (GHSA-4w7w-66w2-5vf9, GHSA-v6wh-96g9-6wx3, GHSA-fx2h-pf6j-xcff) — all dev-server-only
   (dep `.map` traversal, Windows NTLMv2 launch-editor, `server.fs.deny` bypass). Production serves
   static `dist/` on Vercel; dev server never exposed. Revisit on Vite major bump.
2. `esbuild` moderate (GHSA-67mh-4wv8-2f99) — dev-server CORS. Same rationale as (1).
3. `react-router` moderate x2 (GHSA-337j-9hxr-rhxg SSR hydration, GHSA-wrjc-x8rr-h8h6 backslash
   redirect) — fix is breaking major (v7). No SSR hydration in this app (static HTML + client
   render); `<Link>` targets are internal constants. Revisit with router v7 migration.
4. functions moderates (`uuid`, `gaxios`/`google-gax`/`retry-request`/`teeny-request`,
   `@google-cloud/*`, `firebase-admin`) — transitive, no non-breaking fix. Revisit quarterly
   via `npm audit`.

## Enforced (live-verified 17 Sep 2026)
- Firestore rules: public reads property + active rooms only; unauth read/write on
  users/auditEvents/guests/enquiries denied (probed 403/permission-denied).
- Management callables require ADMIN/MANAGEMENT custom claims (code; live test pending admin user).
- No secrets in repo; temp endpoints removed (404 verified).
- PWA (17 Sep 2026): hand-rolled `/sw.js`, same-origin only, API/Firestore/Functions
  explicitly network-only (never cached/stored); SVG-only icons (no PNG — iOS touch
  icon falls back); device offline-toggle test still pending.

## Open (phased plan)
- Phase 1 (DONE 17 Sep 2026): App Check enforced on createEnquiry
  (`enforceAppCheck: true`, verified live: tokenless call → functions/unauthenticated,
  no write possible — rejection precedes handler). Web client initializes App Check
  when VITE_APPCHECK_KEY is set (pending: reCAPTCHA v3 key at deploy).
  IP keying verified empirically via temp hash-only endpoint (since removed, 404
  confirmed): req.ip resolves via X-Forwarded-For, stable per caller across calls.
  Residual: mobile CGNAT may share IPs — phone-level limit (3/hr) is the backstop.
- Phase 2: admin user + claim process; IAM review.
- Phase 3: backups, retention story, wa.me PII decision.
