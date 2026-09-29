# Kinesiology Learning-Science Masterplan — Phases 86–95

Integrates ALL items from `KINESIOLOGY_FURTHER_EXPLORATION_LIST.md`
(C1–C15, D1–D11, E1–E8) per user directive (2026-09-29). Sequencing doctrine kept:
learning interaction → representation → honesty/access → content → coaching →
governance-tech → proof. Scope note: the v1 seven-action freeze is explicitly
lifted *only* for clearly-labelled clinical comparison tracks (C6) by user approval;
Motion-Fall and the certified atlas remain untouched; every quantitative readout
keeps its "teaching estimate" disclosure; automated checks never approve visuals.

| Phase | Items | Deliverable (verifiable) |
|---|---|---|
| 86 Playback study controls | D4, D10 | Study mode auto-pauses at RLA boundaries w/ Continue overlay; ±frame step; snap-to-contact; spec |
| 87 Retrieval quiz suite | C1, C2, C3 | Click-to-identify raycast quiz; predict-then-reveal in study mode; Leitner-lite spaced re-asks (sessionStorage); Anki-TSV export of 54-fact deck |
| 88 Cue language | D3, D8 | External-focus cue toggle (anatomical ↔ external wording); corrective form-cue library panel per action |
| 89 AOMI & perspective | D1, D2 | Rehearsal mode (real-time clip + PETTLEP imagery prompts); learner/coach perspective labels + evidence note |
| 90 Honesty & access | C9, C7/D6, D11, E8 | Segment-weighted CoM trail + vertical-displacement readout; optional speech-synthesis caption voiceover (disclosed machine voice); sonified knee-angle graph (pitch=value, pan=time), default off; "New to 3D?" micro-tour |
| 91 Representation & curriculum | E1, E2, E3, C4 | Laban-inspired glyph strip + classical lineage timeline; triple-representation density toggle (3D / 3D+data / data-only); docs/CURRICULUM_ALIGNMENT.md (BPT Kinesiology I/II + WCPT domains) + educator note; ISB/PiG/CGM2.3 convention footnote |
| 92 Content expansion | C6, C12, D7 | Authored, labelled clinical comparison tracks (Trendelenburg-style drop, antalgic short-stance) in a separate "clinical patterns" group; cadence warp with speed slider for authored gait; common-deviation ghost overlay |
| 93 Coaching tools | D9, C10 | Time-synced drawing/annotation overlay + PNG export; dual-view second slot choice (rear / phase-offset A-B) |
| 94 Tutor, telemetry, privacy, XR | E7, C14, E5, C11, E6/C15 | Coach-style local hint engine ("coach, don't answer"); opt-in local-only learning log; docs/WEBCAM_PRIVACY_SPEC.md; webcam self-compare via locally-bundled MediaPipe (Apache-2.0, provenance-audited, default off, ephemeral); optional WebXR button when available |
| 95 Verification & closure | — | Full verify + Playwright; evidence shots; pending cases queued; closure record |

Held/merged: C15 merged into E6; C8 delivered inside 90 (sonification); C5
(asymmetry) folded into 90's CoM/readout work; C13 folded into 94's provenance
work; B-series complete. Constraints carried: no clinical claims; disclosures on
all estimates; reduced-motion + keyboard parity; phone tier must not regress.

## Visualization rounds (integrated 2026-09-29)

Round 1 executed as Phases 96–101 (see
`docs/KINESIOLOGY_VISUALIZATION_IMPROVEMENT_ROUND.md`): V1 stagecraft lighting,
V2 radial stage + contact shadow + bounded canvas, V3 endpoint trails,
V4 presentation framing + reduced-motion snaps, V5 material/blend pass,
V6 quality selector + FPS guard. ✅ complete, behavior-verified; screenshots queued.

Round 2 candidate pool (tri-persona audit, strategically ordered — readability
and medical clarity before polish; every item reduced-motion + phone-tier safe):

- [x] {n} — W4 PiG-style joint markers toggle + W7 selected-muscle outline (medical readability)
- [x] {n} — W3 activation heat colour mode (skin desaturated so muscles pop)
- [x] {n} — W5 top-down foot-placement inset (orthographic, gait teaching)
- [x] {n} — W6 clickable phase ribbon timeline (seek affordance)
- [x] {n} — W2 spotlight pool + W1 environment sheen (cinema tier only)
- [x] {n} — W8 paused breathing micro-motion (disabled under reduced motion) + closure

Strategic rationale: markers/outline and heat mode deepen the anatomical-reading
story the learning phases built; ribbon improves temporal literacy; top-down
inset adds the planar view clinicians use; 106–107 are pure stagecraft and last.

**Round 2 status — completed 2026-09-29:** all six phases behavior-verified
(desktop + phone); screenshots queued for human visual review (automation
never approves visuals).

## Web-app improvement round (2026-09-29, post-visualization)

- [x] 108 — hash deep links `#/m/{id}` with back/forward + resume view
- [x] 109 — install prompt (beforeinstallprompt), offline chip, SW caches
       `/mediapipe-wasm` + `/pose` (cache v4) for offline self-compare
- [x] 110 — performance hygiene: content-visibility containment, lazy/decoded
       imagery, dev long-task telemetry
- [x] 111 — a11y polish: skip link, global :focus-visible rings, labelled
       phase-ribbon seek buttons, contrast lifts
- [x] 112 — data management: export/import/erase device data (two-step erase)

Specs: `tests/browser/webapp-round.spec.js` (desktop + phone).
