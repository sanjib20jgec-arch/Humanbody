# Kinesiology Benchmark Masterplan — Phases 81–85 (draft, awaiting approval)

Derived from `docs/KINESIOLOGY_INDUSTRY_BENCHMARK_V2.md` (§5, items B1–B7).
Sequencing follows the round's doctrine: **truth first** (terminology & honest
metrics), then **quantitative teaching**, then **visual enrichment**, then
**developer docs**, then **proof**. Every phase independently verifiable; no new
external assets; seven-action list frozen; all new readouts carry the disclosure
"teaching estimate — not a clinical measurement". Release stays blocked; every
visual change queues a pending human-review case.

---

## Phase 81 — Clinical terminology & spatiotemporal honesty (B1, B3, B7)

1. **Dual gait terminology (B1).** Walk captions gain RLA names beside traditional
   ones, e.g. "Loading response (foot flat)". Phase map for the existing four walk
   phases: 0–15 % *Initial contact + Loading response*, 15–40 % *Mid-stance*,
   40–60 % *Terminal stance + Pre-swing (push-off)*, 60–100 % *Initial/Mid/Terminal
   swing*. A `Terminology: RLA / Traditional / Both` segmented control persists per
   session; captions, phase-name line and quiz view all honour it.
2. **%gait-cycle scrub ticks (B1).** The scrub bar renders event ticks at the RLA
   boundaries (0/10/30/50/60/73/87/100 %) with `aria-label`s; hovering/focusing a
   tick shows the phase name.
3. **Spatiotemporal honesty panel (B3).** At clip parse (reuse Phase-76 stance
   windows) compute: cadence (steps/min from contact events), step length
   (consecutive foot-plant targets), speed (existing metric). Render beside the
   source badge as "This clip: 0.9 m/s · ~95 steps/min · step ≈ 0.55 m — a
   *leisurely* walk; typical comfortable adult gait ≈ 1.3 m/s, 110 steps/min,
   0.72 m step [RLA refs]." Authored actions show "authored — no normative claim".
4. **Metric honesty (B7).** `kinesiology-asset-smoke` column "bounce" renamed to
   "root-vert range (not CoM)"; masterplan/benchmark docs updated to match.

Exit: spec asserts RLA names visible by default toggle, tick count = 8, honesty
panel shows measured vs normative triple; smoke prints renamed metric; verify green.

## Phase 82 — Sagittal joint-angle readout with normative bands (B2)

1. Compute per-frame sagittal angles from the rig while a CMU clip plays:
   hip flexion (trunk–thigh), knee flexion (thigh–shank), ankle dorsiflexion
   (shank–foot), left side, via bone world quaternions projected to the sagittal
   plane. Conventions documented in-code as *teaching conventions*, not ISB claims.
2. Side-block "Joint angles (left, sagittal)" panel: live value + a 100-%cycle
   SVG sparkline with shaded **normative bands** authored as piecewise ranges
   (hip 0→30° peak late stance, knee 5–20° stance / 60–70° swing double-bump,
   ankle ±10–15° rocker), each band cited to gait-analysis teaching sources
   (benchmark §1.2) and labelled "typical range, teaching estimate".
3. Panel visible for walk and jump CMU clips; hidden for authored actions with an
   honest note ("authored track — angles not compared to norms").
4. Reduced-motion: sparkline renders statically at current t (no autoplay anyway).

Exit: spec switches to walk, asserts panel + three live values finite and within
0–120°; asserts band SVG present; phone viewport asserts panel stacks without
overlap; verify green.

## Phase 83 — 3D attachment pins + EMG-aligned activation sparkline (B4, B5)

1. **Pins.** `muscleFacts.js` gains `anchors: { origin: [bone, x,y,z], insertion: […] }`
   for the curated set (reuse muscle-def endpoints in `performanceRig.js` where they
   exist; author the rest from the same landmark data the meshes use — no new
   sources). On selection, two small emissive spheres + a faint connector appear at
   the anchors; removed on clear; raycast ignores pins.
2. **Sparkline.** Facts card gains a 100-sample SVG of `action.activations(t)` for
   the selected muscle in the current action, captioned "activation timing in this
   teaching track — windows follow published EMG timing (e.g. tibialis anterior in
   loading + swing), simplified". Midline muscles read both-side max.
3. Keyboard parity: pins follow legend selection exactly as canvas selection.

Exit: spec selects gastrocnemius, asserts two pin meshes exist in scene via debug
handle and disappear on clear; sparkline path present; verify green.

## Phase 84 — Developer-facing rig & IK documentation (B6)

`docs/RIG_MAPPING.md`: table **CMU BVH bone ↔ HBL 14-bone rig ↔ Unity Humanoid ↔
UE5 mannequin ↔ Mixamo** for every mapped bone; explicit list of deliberately
omitted bones (spine1/2, toes, shoulder blades) with pedagogic/perf rationale;
foot-IK rationale paragraph citing the industry FK+runtime-IK pattern and our
slide metric (0.374→0.078 m); treadmill & ground-calibration notes; link to
provenance audit. No code changes.

Exit: doc exists, links from masterplan + KINESIOLOGY_THEATER_PLAN; link-check in
smoke (string presence).

## Phase 85 — Verification, evidence & governance closure

1. Full `npm run verify`; full Playwright (existing 54 + new cases from 81–83).
2. Evidence shots: RLA ticks + honesty panel (desktop/phone), joint-angle panel
   mid-stance, pins on selection, sparkline in facts card.
3. Queue pending visual cases (+8 est.: ticks, panel ×2 viewports, pins, sparkline,
   honesty panel, RLA caption, jump angles) — total ≈ 55 pending; release blocked.
4. Update benchmark doc §5 statuses; completion note appended to this masterplan.

---

## Constraints carried forward
- No new external assets; CMU attribution unchanged; Motion-Fall & certified atlas untouched.
- Actions frozen at seven; no clinical claims — every quantitative readout labelled teaching estimate.
- Automated checks never approve visual cases; human G1 sign-off still required.
- Performance budget: angle compute ≤ 0.2 ms/frame (3 dot-products); sparklines are static SVG paths regenerated only on action/selection change.

## Effort estimate
81 ≈ S–M, 82 ≈ M, 83 ≈ S–M, 84 ≈ XS, 85 ≈ S. Total ≈ one focused round, same
shape as Phases 73–80.

## Closure record — executed 2026-09-29 (Phases 81–85 complete)

| Phase | Result | Evidence |
|---|---|---|
| 81 | RLA/Traditional/Both terminology control (persisted), 8 RLA event ticks on the walk scrub (clickable, labelled), spatiotemporal honesty panel (measured 0.9 m/s · 60 steps/min · step from raw travel-per-step vs normative 1.3 m/s · 110 · 0.72, labelled *leisurely*), smoke metric renamed "root-vert range (not CoM)" | spec "phase 81" (2 projects); screenshots/shot-kine-phase81-honesty-ticks.png |
| 82 | Left-leg sagittal hip/knee/ankle live readout + 60-sample curve vs shaded typical bands (piecewise keypoints, ±margin), standing-calibrated, CMU clips only, authored tracks show nothing with honest note; disclosure line present | spec "phase 82"; screenshots/shot-kine-phase82-angles.png |
| 83 | Origin/insertion pins (2 emissive spheres from muscle-def anchors, mirrored for .R, disposed on clear, excluded from raycast) + facts-card activation sparkline with EMG-lineage note | spec "phase 83"; screenshots/shot-kine-phase83-pins-spark.png |
| 84 | `docs/RIG_MAPPING.md`: HBL ↔ CMU ↔ Unity Humanoid ↔ UE5 mannequin ↔ Mixamo table, omitted-bones rationale, foot-IK rationale, treadmill/provenance notes; linked from both kinesiology plans | doc + link check |
| 85 | `npm run verify` exit 0; full Playwright **58/58** (desktop + phone) | this record |

**New pending visual-review cases queued (+8; running total ≈ 55):** terminology
control states, tick legibility, honesty panel (desktop + phone), angle band panel
(desktop + phone), pin overlay clarity, facts-card sparkline. Human review required
per rubric; automated checks never approve.

**Honesty correction made during closure:** step length first derived from
treadmill-zeroed plant targets (≈0.21 m, wrong); replaced with raw root travel per
detected step so speed/cadence/step are mutually consistent.

Release remains blocked; G1 sign-off and all queued visual cases still required.
No new external assets were added.
