# Kinesiology Theater — Visualization Improvement Round (Phases 96–101)

Tri-persona audit (senior dev / animator / postgrad medical) of the current stage:

| Lens | Finding today | Fix (phase) |
|---|---|---|
| Animator | Flat 2-light rig; figure reads as matte cardboard; no depth cueing | V1: 3-point light + ACES + fog (96) |
| Animator | No ground-contact grounding; floating feel | V2: radial ring stage + contact shadow blob + vignette (97) |
| Animator / Medical | Fast actions (run/jump) lose limb path clarity | V3: endpoint motion trails with velocity weighting (98) |
| Medical | No standard anatomical viewing planes; camera has no presets | V4: framing presets — frontal / sagittal / follow / hero (99) |
| Medical | Muscles all same tone; ghost overlay sorts weirdly | V5: material pass — active glow, two-tone depth, ghost blend fix (100) |
| Senior dev | Quality is implicit per device only; no user control or FPS guard | V6: quality selector + auto-drop guard (101) |

Execution rules (carried): behavior specs automated; **visuals are never auto-approved** —
each phase writes screenshots into `docs/screenshots/` and queues a pending visual-review
case. Phone tier must not regress (no shadows on low-power; reduced-motion ⇒ no camera
tweens). No clinical claims introduced.

## Status — completed 2026-09-29

- [x] 96 V1 stagecraft lighting — 3-point + ACES + fog; shadows desktop/cinema tier ✅
- [x] 97 V2 radial stage, contact shadow blob, bounded canvas, vignette ✅
- [x] 98 V3 endpoint motion trails (feet/hand, per-action reset) ✅
- [x] 99 V4 presentation-tight framing + reduced-motion instant snaps ✅
- [x] 100 V5 ghost depth-blend, faded floor edge, muscle base sheen ✅
- [x] 101 V6 quality selector (auto/cinema/fast) + FPS auto-guard ✅

Screenshots in `docs/screenshots/` (p96/p97/p101 desktop+phone) — 9 new pending
visual-review cases queued (human sign-off required; automation verified behavior only).
