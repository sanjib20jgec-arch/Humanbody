# KINESIOLOGY THEATER — IMPROVEMENT MASTERPLAN (Phases 73–80)
**Compiled:** 2026-09-29 from `docs/KINESIOLOGY_THEATER_INSPECTION.md` (tri-persona: senior dev / senior animator / postgrad medical).
**Execution rule:** numerical order; every visual change queues pending review cases; release stays blocked; human G1/G4 sign-off never automated; Motion-Fall & certified atlas untouched.

## Phase 73 — Inspection & plan scaffolding
Deliverables: inspection doc (done), this masterplan (done), governance smoke still green.
Exit: docs exist; `verify:kinesiology` passes.

## Phase 74 — Anatomical correctness pass (M1–M7)
- Extend `performanceRig.js` MUSCLES: gluteusMedius, rectusFemoris, lateralPterygoid, pronatorTeres, adductorPollicis (+thumb stub on hand mesh), obliquusExternus.
- New data file `src/data/kinesiology/muscleFacts.js`: per base id → { name (proper + Latin), plane, origin, insertion, action }.
- Move curated role table into data (per action, per muscle: role), replacing peak-derived roles (peak remains fallback).
- Activation fixes per M2–M6 (walk gluteusMedius/RF/upper-limb; run TA/gluteusMedius; jump hamstrings/TA; chew alternating lateral pterygoid; handshake pronator/thenar).
- Legend renders proper names + side; roles read from curated table.
Exit: `kinesiology-asset-smoke` extended to assert new muscles exist, facts file covers every muscle id, curated roles cover every activation key; browser spec asserts legend shows "Tibialis anterior".

## Phase 75 — Motion quality pass (A1–A6, A8, D7)
- gait(): pelvic yaw/list, spine counter-rotation, head stabilization, double-bump knee, heel-rock foot roll, elbow flexion bias + shoulder/elbow phase offset.
- wave: elbow lead + wrist snap; handshake: elbow-origin pump with wrist lag + grip hand pose; jump: landing absorb + settle; idle breathing/sway additive.
- Crossfade: on action switch, slerp bones from captured snapshot over 0.4 s (authored and cmu).
Exit: deterministic — new smoke samples blended transition and asserts finite + monotonic blend weight; visual evidence shots.

## Phase 76 — Retarget IK & slide metric (A7, D9)
- Stance detection per side (foot low + slow), foot-plant target capture, sagittal two-bone IK override for UpLeg/Leg during stance.
- `kinesiology-asset-smoke` gains **foot-slide metric**: horizontal foot travel during detected stance, before/after IK; assert reduction ≥50%.
Exit: metric printed + asserted; jump/walk clips re-verified finite.

## Phase 77 — Teaching interaction pass (D5, D6, M5)
- Raycast picking on muscle meshes + clickable legend rows (buttons, keyboard-focusable).
- Selection → facts card (name, Latin, plane, origin, insertion, action, current role in current action) + solo mode (others dimmed).
- Plane-of-motion tag per action in UI header.
Exit: browser spec selects a muscle via legend and via canvas click; facts card text asserted; a11y roles asserted.

## Phase 78 — Robustness pass (D1, D2, D3, D10)
- Context-loss: `webglcontextlost` → overlay `.kine-context-lost` ("rebuilding automatically"), `webglcontextrestored` → clean re-init (remount key).
- No-WebGL: renderer creation try/catch → 2D SVG schematic fallback panel with disclosure (plan §8 promise).
- Module-level parsed-clip cache; low-power tier drops obliquus/SCm-scale muscle count (lowPoly hides SY-only decorative bands).
Exit: new browser spec simulates context loss (skip-if-unavailable pattern like Phase 35) and asserts recovery overlay; verify green.

## Phase 79 — Camera & presentation pass (A9, D8)
- Critically-damped follow cam; per-action framing radius from focus bone bounds; turntable ease-in/out.
- Optional dual-angle split view (scissor second viewport: anterior + lateral) gated to capable desktop tier, toggle button, off on reduced motion/TV/low tier.
Exit: spec toggles split view on desktop and asserts two scissor renders via debug handle; phones assert toggle hidden.

## Phase 80 — Verification & governance closure
- Extend/add browser specs (77/78/79 items), full `npm run verify`, full Playwright.
- Queue pending visual-review cases for every visual change in 74–79 (+8 est.); update inspection doc resolutions; update provenance audit (no new external assets — record if any).
- Evidence shots (desktop/phone/TV) incl. split view, facts card, fallback panel.
- Release remains blocked; human G1/G4 awaited.

## Sequencing rationale
Truth (74) → believability (75, 76) → interaction (77) → robustness (78) → presentation (79) → proof (80). Each phase independently shippable and verifiable; no phase requires an unapproved external asset.

## Closure record — executed 2026-09-29 (Phases 73–80 complete)

| Phase | Result | Evidence |
|---|---|---|
| 73 | Inspection + scaffold (done earlier this round) | docs/KINESIOLOGY_THEATER_INSPECTION.md |
| 74 | 54 muscle meshes (added forearm flexor/extensor groups, supraspinatus, upper trapezius, serratus anterior, pronator teres, adductor pollicis, obliques), curated PM/SY/ST roles per action, MUSCLE_FACTS (Latin, plane, origin, insertion, action) coverage asserted | `scripts/kinesiology-asset-smoke.mjs` |
| 75 | Animator pass on authored tracks (pelvic yaw/list, spine counter-rotation, head stabilization, heel-rock foot roll, double-bump knee, jump anticipation/settle, wrist lag) + 0.4 s quaternion crossfade | smoke blend determinism check |
| 76 | Foot-plant IK solved in root frame with hip abduction lateral correction; stance windows from finalized ground height | foot slide 0.374 m → **0.078 m (79 % reduction)**, asserted ≥50 % |
| 77 | Clickable legend buttons + raycast canvas picking + facts card + solo dim (materials get `needsUpdate` on transparency change) | spec cases 5–6; screenshots/shot-kine-phase77-muscle-select.png |
| 78 | Context-loss guard + listeners (tick pauses on lost context, resumes on restore), low-power emissive throttle (half-rate on low tier), no-WebGL → static sagittal SVG fallback with disclosure, clips parsed once per mount (cache) | spec "survives WebGL context loss"; 12/12 |
| 79 | Action-aware framing table (face/hand actions frame tighter/higher), turntable ease-in (continuous angle), damped look-at on all cameras, desktop-only dual-angle rear inset via scissor viewport | spec framing + dual-toggle cases; screenshots/shot-kine-phase79-dual-view.png |
| 80 | `npm run verify` exit 0; full Playwright **54/54** (desktop + phone) | this record + evidence shots |

Evidence shots: `screenshots/shot-kine-phase76-walk-ik.png`, `screenshots/shot-kine-phase76-jump-ik.png`, `screenshots/shot-kine-phase77-muscle-select.png`, `screenshots/shot-kine-phase79-dual-view.png`.

**New pending visual-review cases queued (+9; total pending now 47):** walk stance with IK planted feet; jump landing contact; action-switch crossfade mid-blend; solo-dim isolation clarity; facts-card legibility desktop + phone; dual-angle inset composition; no-WebGL SVG fallback panel (forced emulation); low-power tier glow cadence; turntable ease-in first orbit. Each must be human-reviewed per rubric; automated checks cannot approve.

**No new external assets were added this round** (provenance audit unchanged). Release remains blocked; human G1 sign-off and the queued visual cases are still required.

- Developer reference: [docs/RIG_MAPPING.md](RIG_MAPPING.md) — bone mapping (CMU/Unity/UE5/Mixamo) + foot-IK rationale (Phase 84).
