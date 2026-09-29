# Remediation Masterplan — Tri-Role Inspection Synthesis

**Inputs:** `MEDICAL_SCIENTIFIC_INSPECTION.md`, `MBBS_STUDENT_INSPECTION.md`, `FRONTEND_CG_INSPECTION.md` (2026-09-28).
**Strategy:** fix *data truth* before *model truth*, *model truth* before *visible UI*, *visible UI* before *performance/render*, *polish + governance* last. Every phase ends with the automated QC chain; visual changes queue new pending human-review cases (Phase 63 governance). Release remains human-gated.

| Phase | Theme | Findings addressed | Exit evidence |
|---|---|---|---|
| **R1** | Anatomical classification & nomenclature truth | C1 (5 brain ventricles→nervous), C2 (choroid plexus→nervous), N1 (aortic cusp standardName aliases), N2 (pulmonary nomenclature note), duplicate-name dedupe in structure index, classifier regression guard in anatomy QC | anatomy QC + new semantic guard pass; browser suite |
| **R2** | Cardiac single-truth waveform | H1/P3 (caption↔trace valve disagreement), M3/P4 (honest RV scale), L4 (PA diastolic floor), L5 (ECG interval disclosure), MBBS-gap (SA/AV-node conduction caption) | cardiac smokes pass with crossing assertions |
| **R3** | Respiration & gas-exchange truth | H3/P5 (breath-rate constant), M1/P6 (steady O₂ readout via dissociation curve), M2/P2 (dead-space alveolar ventilation + alveolar gas equation), L1 (volume formula), L3 (offset legend) | ventilation smoke + browser |
| **R4** | Nerve, enzyme, digestion content | H2/P1 (reflex re-time ≈200 ms), M4/P7 (asymmetric denaturation), M5/P8 (lipase products), L2 (SI pH after neutralization), L6 (pepsinogen note), P9 (ATP wording), P10 (microbiota label), MBBS-gap (right bronchus clinical note) | ventilation-nerve smoke; browser |
| **R5** | Visible UI defects & resilience | F1 (guided-tour CSS), F2 (search/topline collision), F4 (error boundary), F6 (fly-to damping), G5 (rim desaturation), G6 (HUD type floor) | browser screenshots + suite |
| **R6** | Performance & render engineering | F3 (memo atlas wrapper, canvas redraw via ref, 10 Hz overlay throttle), F5 (dt-scaled inertia), G1 (LOD crossfade with per-record proxy material), G2 (double-sided clipped materials) | perf baseline + suite |
| **R7** | Charts, composition, hygiene, governance | G3 (calibrated Wiggers/ventilation axes + external legends), G4 (x-ray depth cue), G7 (hero/atlas fold), G8 (framing headroom), F8 (single digestive-stage source, shared organRegions), new pending review cases, completion addendum | full `npm run verify` + Playwright 36/36 |

**Execution order rationale:** R1 first because misclassified anatomy poisons search/HUD/labels everywhere else; R2 before charts (G3) so calibrated axes measure a truthful curve; R5 before R6 so CSS work isn't redone under memoized components; governance last so the ledger records final visuals.

**Out of scope (documented as curriculum notes, not fixes):** auscultation areas, lung capacities, GFR numbers, coronary bay, lymphatic/endocrine coverage — scope decisions for a future curriculum phase, listed in the completion addendum.

---

## COMPLETION ADDENDUM (2026-09-28)

All seven remediation phases executed and evidenced. No visual approvals were fabricated; every visual change below is queued as a **pending** case in `scripts/visual-review-status.json` (27 pending cases), and `verify:release` remains blocked by design until humans sign off.

| Phase | Delivered | Exit evidence |
|---|---|---|
| R1 | Cardiac system purged of brain-ventricle FMAs (→nervous), choroid plexus →nervous; aortic cusps carry `standardName` (right/left/non-coronary) surfaced via `commonName` in search + HUD; 3 semantic QC guards | anatomy-qc + identity-qc PASS; build clean |
| R2 | `waveformAt` reshaped so pressure crossings land on state-machine constants; Wiggers per-trace honest mmHg axes; ECG "intervals compressed" label; SA→AV→His/Purkinje caption | cardio-physics-smoke crossings 0.100/0.156/0.490/0.567 (±0.012/0.015); cardiac-state-machine-smoke PASS |
| R3 | Breath-rate tick derived from labeled rate; `GasExchangeModel` (dead-space VA, alveolar gas equation, Hill saturation); tidal-volume formula fixed; steady O₂ sat; intrapleural offset disclosed then replaced by honest ruler (R7) | respiration-smoke: rest PACO₂ 40/PAO₂ 100; shallow 24×250 → PACO₂ 70 (hypoventilation reads correctly) |
| R4 | Reflex retimed to 200 ms with Aδ/Aα/EC-coupling rationale; asymmetric enzyme denaturation cliff; lipase → 2-monoacylglycerol + fatty acids; SI neutralization + pepsinogen captions; ATP-synthesis wording; microbiota honesty; right-bronchus clinical note | ventilation-nerve-smoke (reflex range + cliff + products guards) PASS |
| R5 | GuidedTour themed (F1); certification line reserved band vs search (F2 — verified zero shared pixels in DOM rects + screenshots); atlas-level ErrorBoundary (F4); fly-to owns camera vs damping (F6); rim desaturated/dimmed (G5); 10 px HUD type floor (G6) | f2-topline-check CLEAR; screenshots |
| R6 | Wiggers backing-store once per engine + repaint via ref; upstream overlay throttle 10 Hz (F3); dt-scaled inertia (F5); LOD hysteresis + 250 ms proxy crossfade with cloned proxy materials (G1); solid section-cut read while clipped (G2) | build + 36/36 browser suite |
| R7 | Calibrated Wiggers rulers/gridlines/cycle ticks + DOM legend; ventilation dual cmH₂O rulers (offset removed) + DOM legend (G3); x-ray depth attenuation (G4); hero fold pulled atlas into first viewport (G7); +8 % initial headroom (G8); single-source digestive stages (`DigestiveStageMachine.displayPH`) and shared `data/organRegions.js` (F8) | screenshots shot-r7-*; `npm run verify` full chain PASS; Playwright 36/36 |

**Out-of-scope curriculum notes (not fixes; future curriculum phase):** auscultation areas; lung volumes/capacities (IRV/ERV/RV, VC, FRC); renal quantitative numbers (GFR ≈125 mL/min, nephron count, countercurrent figures); coronary-circulation bay; lymphatic/endocrine coverage breadth; Frank–Starling slider.

**Standing governance:** automation never approves visuals; release and strict visual-review commands stay blocked while cases pending; conceptual routes remain visibly separate from certified/static source anatomy; Motion-Fall untouched.

## DEVICE MATRIX PASS (2026-09-29)

User directive: optimize the UI for all modern devices — flagship Android handsets, latest iPhones, tablets, laptops/MacBooks, desktops, ultrawide monitors, and Android TVs.

- **New layer** `src/lib/deviceProfile.js`: form factor (phone/tablet/desktop/tv) from viewport + pointer modality + TV UA signals; capability tier from cores/memory/save-data; body classes (`ff-*`, `input-coarse/fine`, `hover-capable`, `device-capable/constrained`) stamped pre-paint and refreshed on resize/orientation/fold.
- **Touch**: `@media (pointer: coarse)` gives ≥44 px targets, taller sliders, no hover-only surfaces — width-independent, so iPads behave as touch devices.
- **Landscape handsets**: compressed hero/module rhythm, usable stage at ≤900×landscape.
- **Tablets**: two-column simulation grids restored on coarse wide viewports.
- **Laptops/desktops/ultrawide**: 1800/2400 px breakpoints widen the atlas column and stage without stretching line lengths; dvh units + safe-area insets across the shell.
- **Android TV**: UA-detected 10-foot mode — overscan padding, 48 px D-pad targets, 3 px focus rings with halo, distance-scaled headings/HUD type, hover surfaces removed, pixel ratio capped at 1 and the conservative render tier forced.
- **Render tiering**: TVs always conservative; flagship handsets (≥8 cores, ≥8 GB, no save-data) keep the rich tier; touch devices use touch interaction budgets.
- **Contract**: `scripts/viewport-smoke.mjs` now asserts a 16-profile matrix (320→2560 px, landscape handset, foldable-class, iPad Pro, MacBook, TV) plus presence of every adaptation above.
- **Governance**: five new pending visual-review cases queued (device-matrix-*); release remains blocked until human sign-off.

## KINESIOLOGY THEATER EXECUTION (2026-09-29)
User-directed Lane 2 execution started under `docs/KINESIOLOGY_THEATER_PLAN.md` (Phases 64–72).
- Phase 64: governance scaffolding — provenance audit, scientific inspection template, 3 kinesiology candidates in the 3D-source ledger (all gates pending), `verify:kinesiology` gate added.
- Doctrine preserved: certified atlas static; five gates human-approved; release blocked while pending; Motion-Fall untouched.

### KINESIOLOGY EXECUTION STATUS (2026-09-29, Phases 64–72)
- 64 ✔ governance scaffolding (audit + inspection docs, ledger candidates, verify gates).
- 65 ✔ asset discovery: CMU classic unreachable from sandbox; lawrennd/mocap mirror reached; checksums + manifest recorded; SMPL-X & I-MOVE-23 excluded.
- 66 ✔ pipeline: BVH parser, rotation-exact retargeter, authored rig, authored tracks, derived 30fps embeds (walk 11_01, jump 14_06 window), asset smoke.
- 67 ✔ findings recorded (F1–F8); **G1 sign-off pending human**.
- 68 ✔ player runtime + camera director (7 presets, keyboard 1–7/space/[/]); 10th bay + guided step 10 wired.
- 69 ✔ activation system (role-coded glow PM/SY/ST, live meters, legend).
- 70 ✔ action library v1: walk+jump (CMU retargeted), run/wave/handshake/chew/talk (authored, disclosed).
- 71 ✔ jaw/speech authored tracks with disclosures.
- 72 ✔ a11y/device tiers (coarse/TV targets, low-poly + pixelRatio caps), reduced-motion (no autoplay, static turntable), budget revision documented (threeVendorKB 650→800, flagged), 6 visual-review cases queued (38 pending total), release blocked.
- Verification: `npm run verify` exit 0; Playwright 38/38 (incl. phase68 kinesiology spec, desktop+phone).
- QA fixes during execution: orphaned root bone (rig invisible), treadmill drift (figure left frame), arm-chain offsets, camera framing.
- REMAINING HUMAN GATES: G1 sign-off, G4 per-case visual approvals, budget-revision review. Automation has approved nothing.
