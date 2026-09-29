# Phases 26–39 completion report

Date: 2026-09-28 · Human Biology Lab · executed in numerical order per `ACCURACY_INTERACTION_PLAN.md`

## Verification summary

| Suite | Result |
| --- | --- |
| `npm run verify` (build + offline + 31 QC/report steps) | **passed** (exit 0) |
| `npm run verify:browser` (Playwright, desktop + phone) | **36 passed** (was 34; +2 new Phase 35 context-loss tests) |
| `npm run verify:release --strict` | **exit 1 — correctly blocked** on human visual sign-off |

Release remains BLOCKED for the right reason: human visual sign-off (24/24 cases pending) is a real gate. No automated check was promoted to approval.

## Phase-by-phase outcomes

### Phase 26 — Evidence model and anatomy-review contract ✅
- New `src/data/anatomyEvidence.js`: 8 evidence records (6 BodyParts3D source-facts, 2 OpenStax conceptual models), each with dataset, URL, license, claim, limitation, and review states.
- New `src/data/absentStructures.js`: 7 recorded absences (lung parenchyma, alveolar surface, spinal-cord parenchyma, nephron, female anatomy, pediatric anatomy, intestinal villi).
- Every registry entry now carries an `evidenceId`; every teaching route carries `evidence` + `routeDisclosure`.
- `validateEvidenceConsistency()` enforces claim-type/representation match and forbids automated approval (approval requires a named reviewer).
- Gate: `npm run verify:evidence` → `ANATOMY_EVIDENCE_LEDGER.md`.

### Phase 27 — Structure identity, topology, geometry confidence ✅
- `npm run verify:identity`: identity, chunk mapping, bounds finiteness, zero-volume outlier queue, registry-system cross-check over all 2,234 parts (0 outliers flagged).
- Respiratory, nervous, kidney, and reproductive entries now declare `absentStructures`, validated against the absence ledger.
- Output: `ANATOMY_IDENTITY_REPORT.md`.

### Phase 28 — Anatomical framing contract ✅
- New `src/lib/atlasFraming.js`: shared orientation-label function, camera preset table (anterior/lateral/posterior available; superior/inferior explicitly unavailable with reasons), and 3 restrained lighting presets.
- `BodyMap3DAtlas.jsx` now consumes the shared contract (inline label logic removed).
- `npm run verify:framing`: 720-step label sweep, preset yaw→orientation checks, lighting bounds.

### Phase 29 — Authored route waypoints and disclosure ✅
- `AnatomySceneManager.rebuildTeachingOverlay` inserts authored waypoints before each stage's destination, bending conceptual routes through the valve plane instead of skipping chamber centers.
- Route disclosure now travels with the overlay group (`userData.routeDisclosure`).
- Circulation runtime stages route via tricuspid/mitral leaflets and aortic cusp; digestion discloses accessory-organ separation.
- Spec QC extended: `stageWaypoints` must resolve against `atlas.json`.

### Phase 30 — Unified selection model ✅
- Manager gains `setPickTolerance(wide)` with `pickByBounds()` fallback (visible-layer bounds picking for small valves/vessels on coarse pointers) and `getPartBounds()`.
- Viewer gains **Focus selection** (F key + HUD button, frames part bounds without losing orientation) and a **Wide pick** toggle.
- Existing 8 px drag-vs-click cancellation retained; keyboard hint and aria labels updated.

### Phase 31 — Structure-level accessible parity ✅
- New `src/data/accessibleStructureCatalog.js`: 27 part-level structures across 6 systems, each resolving to an exact certified BodyParts3D part (name + FMA concept verified by QC).
- Accessible mode upgraded: per-system structure list, filter input, arrow-key roving focus, live-region detail panel with function + limitation, full metadata passed to `onAnatomySelect`.
- `npm run verify:accessible-catalog` fails if any entry drifts from the atlas.
- Existing keyboard/persistence and WebGL-failure browser contracts still pass unchanged.

### Phase 32 — Explicit animation state machines ✅
- New `src/lib/CardiacCycleStateMachine.js`: 5 named cardiac states with captions and flow, 4 canonical valve events, deterministic `valveStateAt`, `createValveTracker` with hysteresis (no flicker at boundaries), and labeled right/left pressure split.
- Engine snapshots now carry `cardiacState`, `rightLeft`, and `valveEvents`.
- New `src/lib/DigestiveStageMachine.js`: 5 clamped stages, pH, side inputs, and accessory organs that never carry food.
- Smoke tests: 2000-phase state sweep, exactly-2-transitions-per-valve, flicker guard, determinism at phase+1, right<left pressure invariants, OpenStax event ordering, accessory-organ separation.

### Phase 33 — Timeline scrubbing ✅
- `CardioPhysiologyEngine.setPhase(phase)` gives deterministic scrubbing.
- New `CardioTimeline` in the Circulation SIMULATE view: 0–1000 phase slider, valve-event ticks, previous/next event jump buttons, live caption of state + flow, explicit non-clinical note.

### Phase 34 — Performance budgets ✅
- New `scripts/performance-budgets.json`: desktop/mobile/lowPower tiers with draw-call, frame-time p95, and decoded-memory targets; LOD policy forbids box proxies as final representations.
- `performance-baseline.mjs` now checks budgets from that file and reports the tier table. Static budgets pass.

### Phase 35 — WebGL context-loss recovery ✅
- Viewer handles `webglcontextlost` (preventDefault + recoverable status banner) and `webglcontextrestored` (generation-token rebuild; old session disposed, `disposed` guards block stale chunk promises).
- New Playwright spec forces `WEBGL_lose_context` on both desktop and phone projects: banner appears, restore rebuilds, skeletal readiness re-marks. **Both pass.**

### Phase 36 — Structured candidate ledger ✅
- `scripts/3d-source-candidates.json` v2: each of the 5 candidates carries `candidateId`, `entrySpecificId: null`, and a five-gate review record (scientific · provenance · license · visual · offline), all pending; decisions locked to `not-reviewed`.
- Report generator asserts the five-gate record exists and that no approval can be recorded without a named reviewer. Ledger regenerated: **5 candidates; none approved.**

### Phase 37 — Human visual review tooling (gate remains blocked) ✅
- `visual-review-status.json` v2 adds a 10-criterion rubric, reviewer-record schema (reviewer, role, date, buildHash, route, disposition), and reviewer records array (currently empty).
- Gate script computes a SHA-256 build hash over the viewer, scene manager, overlay spec, and atlas manifest so sign-offs bind to exact code.
- Matrix regenerated: **24 cases; 24 pending.** No approval was fabricated.

### Phase 38 — Learning-validation plan ✅ (status: planned)
- Pre-registered `LEARNING_VALIDATION_PLAN.md`: participants, 6-task battery with success criteria, three route conditions, analysis rules, and limitations.
- `scripts/learning-validation-status.json` + report generator; surfaced in release readiness as **informational**, with an explicit ban on educational-benefit claims until a study record exists.

### Phase 39 — Release governance ✅
- `release-readiness.mjs` now aggregates 13 checks including evidence contract, identity QC, framing, accessible catalog, state machines, budgets, and context-loss coverage.
- `RELEASE_READINESS.md`: overall **BLOCKED** — exactly 1 blocking check (human visual sign-off); 3D-source gate held at review/candidate status; learning study informational.
- `package.json` verify chain extended with all new gates in numerical order.

## What is still required before release

1. **Human visual review (Phase 37):** 24 cases across 2 routes × 3 orientations × 2 viewports × 2 motion modes, against the rubric, with reviewer records and the recorded build hash.
2. **3D source approvals (Phase 36):** only if/when those modules are pursued — entry-specific ids and five-gate reviews first.
3. **Learning study (Phase 38):** run per the pre-registered plan before any effectiveness claim.
4. Motion-Fall remains untouched; no candidate asset has entered runtime; the educational/non-diagnostic and adult-male BodyParts3D scope disclosures are unchanged.

## New files

- `src/data/anatomyEvidence.js`, `src/data/absentStructures.js`, `src/data/accessibleStructureCatalog.js`
- `src/lib/atlasFraming.js`, `src/lib/CardiacCycleStateMachine.js`, `src/lib/DigestiveStageMachine.js`
- `scripts/anatomy-evidence-qc.mjs`, `scripts/anatomy-identity-qc.mjs`, `scripts/atlas-framing-qc.mjs`, `scripts/accessible-catalog-qc.mjs`, `scripts/cardiac-state-machine-smoke.mjs`, `scripts/digestive-stage-smoke.mjs`, `scripts/learning-validation-report.mjs`, `scripts/learning-validation-status.json`, `scripts/performance-budgets.json`
- `tests/browser/phase35-context-loss.spec.mjs`
- `LEARNING_VALIDATION_PLAN.md`, `ANATOMY_EVIDENCE_LEDGER.md`, `ANATOMY_IDENTITY_REPORT.md`, `LEARNING_VALIDATION_REPORT.md`

## Modified files

- `src/data/anatomyRegistry.js` (evidenceId, absentStructures, validation)
- `src/data/teachingOverlaySpec.js` (evidence, disclosures, stageWaypoints)
- `src/lib/AnatomySceneManager.js` (waypoints, disclosure propagation, wide-pick, part bounds)
- `src/lib/CardioPhysiologyEngine.js` (state-machine coupling, setPhase)
- `src/components/BodyMap3DAtlas.jsx` (framing contract, focus/wide-pick controls, context-loss recovery, accessible structure panel)
- `src/simulations/CirculationLab.jsx` (waypoints, disclosure, timeline)
- `src/simulations/DigestiveLab.jsx` (disclosure)
- `src/styles.css` (timeline, accessible panel, recovery banner)
- `scripts/teaching-overlay-spec-qc.mjs`, `scripts/visual-review-status.json`, `scripts/visual-review-gate.mjs`, `scripts/3d-source-candidates.json`, `scripts/3d-source-candidate-report.mjs`, `scripts/release-readiness.mjs`, `scripts/performance-baseline.mjs`, `package.json`
