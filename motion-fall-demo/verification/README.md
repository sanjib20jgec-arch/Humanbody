# Verification artifacts

Phase 0 establishes the regression-test home for Motion-Fall Lab.

- `phase-0-baseline.md` — known scenario, expected state order, and browser capture checklist.
- `phase-1-report.md` — deterministic-core implementation report and remaining browser gate.
- `phase-2-report.md` — physics-credibility implementation report and remaining tuning gate.
- `phase-3-report.md` — rendering/performance implementation report and remaining hardware gate.
- `phase-4-report.md` — character asset adapter implementation report and remaining GLB visual gate.
- `phase-5-report.md` — PWA/deployment hardening report and remaining browser offline gate.
- `phase-6-report.md` — accessibility, educational UX, keyboard, reduced-motion, and release-polish report.
- `phase-7-report.md` — final browser/PWA/release matrix report and remaining hardware limitations.
- `post-release-bug-audit.md` — follow-up audit findings, fixes, and remaining limitations.
- `phase-0-file-hashes.sha256` through `phase-7-file-hashes.sha256` — frozen source/vendor hashes.
- `../tests/pwa-offline.mjs` — fresh-context online-then-offline browser test.
- `phase-0-file-hashes.sha256`, `phase-1-file-hashes.sha256`, `phase-2-file-hashes.sha256`, `phase-3-file-hashes.sha256`, `phase-4-file-hashes.sha256`, and `phase-5-file-hashes.sha256` — frozen source/vendor hashes.
- `../tests/phase3-contract.mjs` — quality-profile, overlay-buffer, environment, resize, context-recovery, and disposal contract.
- `../tests/dom-contract.mjs` — required control/state/overlay DOM contract.
- `../tests/static-smoke.mjs` — required files, import resolution, PWA manifest, and service-worker precache checks.
- `../tests/phase1-contract.mjs` — deterministic-clock, snapshot, checksum, and interpolation contract.
- `../tests/phase2-contract.mjs` — joint-limit, contact, XCoM-edge, settling, and pose-spring contract.
- `../tests/smoke.mjs` — Playwright browser smoke test for WebGL, basic controls, mobile layout, and runtime errors.

Run:

```bash
npm install
npm run test:phase0
npm run serve
npm run test:browser
```

`npm run test:phase0` has no external test dependency. `npm run test:browser` requires Playwright and a browser executable; if the host image cannot launch Chromium, keep the failure visible rather than treating the browser gate as passed.
