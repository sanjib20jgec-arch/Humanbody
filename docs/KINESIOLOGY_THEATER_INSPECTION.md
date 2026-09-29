# KINESIOLOGY THEATER — TRI-PERSONA INSPECTION
**Date:** 2026-09-29 · **Scope:** `src/components/KinesiologyTheater.jsx`, `src/lib/kinesiology/*`, `src/simulations/KinesiologyLab.jsx`
**Rule:** findings recorded here; approvals remain human-only (G1/G4). Automation verifies, never approves.

## Role 1 — Senior application developer (D-findings)
| ID | Finding | Severity | Recommendation (phase) |
|---|---|---|---|
| D1 | No WebGL **context-loss** recovery (atlas has Phase 35; theater shows a dead canvas if context drops) | high | 78 |
| D2 | No **no-WebGL fallback**; promised schematic fallback (plan §8) never implemented | high | 78 |
| D3 | BVH clips re-parsed on every mount (StrictMode double-mount doubles the cost) | low | 78 |
| D4 | Activation/phase content lives in code (`actions.js`); medical curation needs **data** | med | 74 |
| D5 | Legend rows are not interactive; no muscle selection; raw camelCase ids shown (`tibialisAnterior`) | med | 77 |
| D6 | No raycast picking on muscle meshes | med | 77 |
| D7 | Hard cut on action switch — no pose blending | med | 75 |
| D8 | Follow-cam is a naive lerp; no framing per action bounds; turntable linear | low | 79 |
| D9 | No foot-slide QA metric; retarget slide unmeasured | med | 76 |
| D10 | Low-power tier reduces segments only; muscle count untouched; no pause-on-hidden (rAF handles) | low | 78 |

## Role 2 — Senior animator (A-findings)
| ID | Finding | Severity | Recommendation (phase) |
|---|---|---|---|
| A1 | Authored gait lacks **pelvic rotation/list, spine counter-rotation, head stabilization** — reads robotic | high | 75 |
| A2 | Knee/foot curves single-bump; real gait has double-bump knee + heel-rock/foot-roll | high | 75 |
| A3 | Arms: no elbow flexion bias, no shoulder-elbow phase offset; wave lacks wrist snap & elbow lead | med | 75 |
| A4 | Handshake pump should originate at elbow with wrist lag; hand shows no **grip shape** (no thumb!) | med | 75 (+74 thumb) |
| A5 | Jump: arm anticipation exists but landing lacks absorb sequencing; no settle | med | 75 |
| A6 | No **idle life**: paused figure is a statue; add breathing/sway | med | 75 |
| A7 | CMU retarget: rotations-only → **foot slide**; needs stance-phase foot-plant IK | high | 76 |
| A8 | Action switches hard-cut (see D7) — needs 0.3–0.5 s crossfade | med | 75 |
| A9 | Camera follow lags/wobbles; needs damped tracking + action-aware framing | low | 79 |

## Role 3 — Postgraduate medical student (M-findings)
| ID | Finding | Severity | Recommendation (phase) |
|---|---|---|---|
| M1 | **Missing muscles** vs captions/curriculum: gluteus medius (captioned but absent), rectus femoris as swing actor, lateral pterygoid (chewing), pronator teres (handshake), thumb thenar (adductor pollicis) | high | 74 |
| M2 | Walk activations omit gluteus medius (pelvic stabilizer — the classic Trendelenburg teaching point), RF swing bump, upper-limb gait activity | high | 74 |
| M3 | Run lacks tibialis anterior clearance bumps and gluteus medius | med | 74 |
| M4 | Jump lacks hamstring co-contraction and landing TA | low | 74 |
| M5 | Legend must show **proper anatomical names** (+ Latin), and per-muscle **origin/insertion/action** facts; plane-of-motion tags per action missing | med | 74/77 |
| M6 | Chewing lateral pterygoid should alternate sides (grinding asymmetry) | low | 74 |
| M7 | Roles derived from peaks; final PM/SY/ST table needs explicit curated data (G1 input) | med | 74 |

## Synthesis — strategic themes
1. **Anatomical correctness first** (74): muscles + curated activation data + nomenclature. Everything else builds on truthful content.
2. **Motion believability** (75→76): procedural polish, then IK foot-planting; measure slide reduction.
3. **Teaching interaction** (77): select-isolate-learn loop on muscles.
4. **Production robustness** (78): context-loss, fallback, caching.
5. **Presentation** (79): camera craft, optional split-screen.
6. **Verification & governance** (80): metrics, specs, evidence, human gates.
