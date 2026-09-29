# Human Biology Lab — Improvement Scorecard and Execution Plan

**Date:** 2026-09-27  
**Current release:** 1.0 candidate  
**Audit source:** `AUDIT_REPORT_2026-09-27.md`

## 1. Improvement score

### Current score: **83 / 100**

This is a transparent maturity score against the approved product requirements. It is not a medical-certification score and it is not a substitute for expert anatomy review.

| Dimension | Weight | Score | Assessment |
|---|---:|---:|---|
| Scientific accuracy, source use, and disclosures | 20 | **16** | Six macro-anatomy bays use BodyParts3D-derived objects with attribution and limitations. Cell Structure, Tissues, and Heredity remain conceptual/molecular-source decisions. Adult-male and missing-mesh limitations remain. |
| Interaction and functional completeness | 20 | **18** | 360-degree rotation, pointer/touch input, pinch zoom, two-finger pan, reset, layers, search, labels, simulations, quizzes, progress, sound, and fallbacks are implemented. Some interactions still need physical-device validation. |
| Accessibility and responsive behavior | 15 | **14** | Keyboard controls, focus states, 2D fallback, reduced motion, semantic quiz feedback, labelled sliders, mobile controls, and phone overflow audits pass. Formal axe, screen-reader, VoiceOver/TalkBack, and switch-control testing remain. |
| Performance, resilience, and resource management | 15 | **11** | Demand-driven atlas loading, skeletal-first startup, chunk profiling, renderer disposal, quality profiles, and error boundary are present. The atlas is still approximately 31.4 MB compressed and real-device GPU/memory data is missing. |
| Curriculum and learning design | 10 | **9** | Nine live bays have Explore/Simulate/Quiz routes, objectives, evidence links, guided progression, feedback, and persistent progress. Expert content review of every model remains valuable. |
| Automated QA and observability | 10 | **8** | Static verification, anatomy QC, binary QC, runtime contracts, reduced-motion contracts, deployment checks, 28 browser tests, and additional all-bay audits pass. WebKit/Firefox, permanent all-bay runtime tests, axe, and offline browser tests are still missing. |
| Security, privacy, deployment, and licensing | 10 | **7** | No frontend API key, zero production audit vulnerabilities, CSP/header contract, attribution, PWA, cache policy, and AI timeout/size bounds are present. Production headers, AI backend controls, and offline cache behavior still require deployment validation. |
| **Total** | **100** | **83** | **Strong release candidate; not final sign-off.** |

### How to interpret the score

- The score is high because the project now has a real source-derived atlas, working interactions, strong automated contracts, responsive/fallback routes, and documented scientific limitations.
- The score is below 90 because visual expert review, real-device measurements, formal accessibility testing, offline end-to-end testing, and remaining source decisions are not complete.
- An exact historical delta was not recorded before implementation, so a numeric “before versus after” improvement percentage would be false precision. The qualitative improvement from primitive childlike objects to source-derived reusable reference objects is substantial, but future audits should preserve this rubric and record the score before and after each release.

## 2. Target score

### Release target: **92 / 100**

The project should not chase 100 before launch; the remaining points include ongoing expert review and device diversity that cannot be proved by static checks alone.

Target gates for 92:

- Six converted macro-anatomy bays receive visual expert sign-off.
- Real-device performance data is collected and any blocking GPU/memory issue is addressed.
- axe-based CI and at least one desktop and mobile screen-reader pass are complete.
- Offline download, cancellation, removal, service-worker update, and offline reload are tested.
- A permanent all-bay browser smoke test catches runtime crashes such as the Excretion regression.
- Cell Structure, Tissues, and Heredity receive explicit source decisions: credible licensed 3D assets or clearly labelled conceptual teaching models.
- Staging deployment confirms actual response headers, cache behavior, PWA installability, and rollback.

## 3. Execution plan

### Phase 0 — Lock the current baseline

**Priority:** P0  
**Duration:** 0.5–1 day  
**Goal:** Make the current 83/100 score reproducible.

Tasks:

1. Commit this scorecard and the audit report with the release candidate.
2. Add a permanent browser smoke test for all nine bays covering Explore → Simulate → Quiz, no page errors, and phone overflow.
3. Add a machine-readable score or release checklist entry so future audits use the same dimensions.
4. Preserve the current 28/28 browser result and the custom 9/9 bay audit as release evidence.

**Exit criteria:** A clean checkout can reproduce static verification, browser contracts, all-bay runtime smoke, and the scorecard evidence.

### Phase 1 — Scientific and visual sign-off

**Priority:** P0  
**Duration:** 2–3 days  
**Goal:** Convert “manifest/QC pass” into expert-reviewed visual accuracy.

Tasks:

1. Review Circulation, Digestion, Brain & Nerves, Respiration, Excretion, and Reproduction at desktop, phone portrait, phone landscape, and tablet widths.
2. Check orientation, relative placement, scale, labels, selection state, occlusion, preset/reset framing, and source IDs.
3. Review Brain & Nerves frames using `BRAIN_NERVES_VISUAL_REVIEW.md`.
4. Verify that missing lung parenchyma and spinal-cord parenchyma are visibly disclosed where relevant.
5. Record screenshots and findings in a module audit table.

**Exit criteria:** No unresolved P0/P1 visual anatomy issue; expert accepts labels, orientation, disclosures, and focused reset behavior.

### Phase 2 — Real-device performance and interaction profiling

**Priority:** P0  
**Duration:** 2–3 days  
**Goal:** Validate the atlas on real hardware rather than only SwiftShader Chromium.

Devices/profiles:

- Low-memory Android phone.
- Mid-range Android phone.
- Current iPhone/Safari.
- Tablet.
- Desktop GPU.

Measure:

- LCP, INP, CLS.
- Shell-to-first-usable anatomy.
- Compressed transfer and decode/build time per chunk.
- FPS, worst frame, draw calls, DPR, geometry memory, and renderer memory growth.
- Rotation, pinch zoom, two-finger pan, selection, reset, and module-change cleanup.

**Exit criteria:** No sustained unusable interaction; no memory growth after repeated bay navigation; measured budgets are recorded and accepted.

### Phase 3 — Formal accessibility verification

**Priority:** P0  
**Duration:** 1–2 days  
**Goal:** Move from source-level accessibility confidence to repeatable conformance evidence.

Tasks:

1. Add axe or equivalent automated checks to the browser job.
2. Test keyboard-only navigation through home, atlas, layers, search, focused objects, simulations, quizzes, settings, help, progress, and AI Tutor.
3. Test one desktop screen reader, VoiceOver or TalkBack, and at least one switch/control alternative where available.
4. Check contrast for muted mono labels, model disclosures, selected states, and focus outlines.
5. Confirm reduced-motion mode on browser preference and saved preference paths.

**Exit criteria:** No critical accessibility violations; no keyboard trap; visible and announced status updates; documented screen-reader findings.

### Phase 4 — Offline and deployment validation

**Priority:** P1  
**Duration:** 1–2 days  
**Goal:** Prove that the PWA and explicit large-resource download behave safely in production conditions.

Tasks:

1. Test shell-first offline reload.
2. Test explicit atlas download progress, cancellation, retry, completion, removal, and repeat visit.
3. Test interrupted downloads and quota/private-browsing failures.
4. Verify service-worker update and cache namespace changes after shell and atlas revisions.
5. Deploy to staging and confirm actual CSP, Permissions-Policy, cache, MIME, and service-worker headers.
6. Validate SPA fallback and rollback using the previous build artifact.

**Exit criteria:** Offline behavior matches the product copy; no silent 33 MB precache; stale shell/model caches are not reused after a version change.

### Phase 5 — Remaining learning-bay source decisions

**Priority:** P1  
**Duration:** 3–5 days  
**Goal:** Apply the same scientific standard to Cell Structure, Tissues, and Heredity.

For each bay, choose one path:

- Use a reputable, licensed, reviewed 3D source with scale and license disclosure; or
- Keep the conceptual model and strengthen the “simplified educational model” disclosure, scale language, source rationale, and expert review notes.

Do not introduce pseudo-realistic assets simply to make the score appear higher.

**Exit criteria:** Each remaining bay has a documented source decision, licensing record, model limitation, and review status.

### Phase 6 — Release hardening and sign-off

**Priority:** P0  
**Duration:** 1 day after prior phases  
**Goal:** Produce the release candidate and final evidence packet.

Tasks:

1. Run `npm ci`.
2. Run `npm run verify`.
3. Install Chromium and run `npm run verify:browser`.
4. Run permanent all-bay smoke, axe, offline, and deployment checks.
5. Review visual screenshots and update QC/audit reports.
6. Recalculate this scorecard.
7. Release only if the target gates are met or exceptions are explicitly accepted.

**Exit criteria:** Target score at least 92/100, no unresolved P0 issue, documented accepted limitations, rollback artifact retained, and visual/scientific sign-off recorded.

## 4. Prioritized backlog

| Priority | Item | Expected score gain | Effort | Dependency |
|---|---|---:|---:|---|
| P0 | Permanent all-bay runtime smoke test | +2 | Small | None |
| P0 | Expert six-bay visual anatomy review | +3 | Medium | Browser frames |
| P0 | Real-device performance/GPU profiling | +3 | Medium | Device access |
| P0 | axe + screen-reader pass | +2 | Medium | Browser CI |
| P1 | Offline/service-worker end-to-end tests | +2 | Medium | Staging host |
| P1 | Cell/Tissues/Heredity source decisions | +2 | Medium | Source/license review |
| P1 | WebKit/Safari browser matrix | +1 | Small–medium | WebKit runner/device |
| P2 | Analytics adapter, if desired | 0 | Medium | Privacy review |

## 5. Release decision rule

- **90–100:** Release-ready if expert and deployment sign-offs are complete.
- **80–89:** Release candidate; continue the P0 gates before public release.
- **65–79:** Internal preview only; do not claim production readiness.
- **Below 65:** Return to architectural/content remediation.

**Current decision:** **Internal release candidate / live preview approved. Public production release remains gated by Phases 1–4.**
