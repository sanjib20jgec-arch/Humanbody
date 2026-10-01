# Circulation Bay — Master Plan (DRAFT, discussion only)
> Inherits Cell D6–D27, Tissues TD1–TD5, and the cross-cutting plan. No code until approval.

## 0. Current state audit
| Area | Current |
|---|---|
| Lab | `CirculationLab.jsx` (330 lines) — most mature bay: heart explorer (chambers/valves), blood component viewer, HR slider |
| Engines | `CardioPhysiologyEngine.js` (376 lines: CO, MAP, Wiggers curves, valve states, exercise/epinephrine/β-blocker/TPR presets, 3D heart deformation), `CardiacCycleStateMachine.js` (5 phases, 4 valve events — correct order ✔) |
| Quiz | 3 items |

### 0.1 Findings
| # | Sev. | Finding |
|---|---|---|
| C1 | Medium | Drug-effect coefficients (e.g. epinephrine +35 bpm, β-blocker −32 bpm, exercise +100 bpm) are teaching heuristics → must be labelled and given plausible-range sources or presented qualitatively. |
| C2 | Medium | MAP = DBP + PP/3 is a resting approximation; at high HR the diastolic fraction shrinks → add note. |
| C3 | Medium | **NEET gaps**: ECG (P, QRS, T and their meaning), cardiac cycle timing per NCERT (0.8 s at 72 bpm: atrial systole 0.1 s, ventricular systole 0.3 s, joint diastole 0.4 s), heart sounds (lub-dub), SA/AV node, bundle of His, Purkinje fibres, blood composition & formed elements counts, **ABO & Rh groups** (co-dominance link to Heredity), coagulation cascade overview, lymph, double circulation, regulation (medulla, ANS), disorders (hypertension, CAD, angina, heart failure). |
| C4 | Low | Blood vessels (artery/vein/capillary wall structure) not modelled — links Tissues. |

## 1. Syllabus scope
Class 10 Life Processes (transport); NEET Ch.15 Body Fluids and Circulation (rationalised XI numbering) — full.

## 2. Sources
OpenStax A&P 2e Ch.18–20; NCERT XI Body Fluids & Circulation; Guyton & Hall; AHA/ESC definitions for disorder notes (BP categories as reference only, no medical advice disclaimer).

## 3. Features
**3D**: existing deformable heart + cut-away (chambers, valves with chordae tendineae & papillary muscles, septum thickness difference L vs R); conduction system highlight (SA → AV → His → Purkinje); vessel wall cross-section slicer (artery vs vein vs capillary); whole-body double circulation loop with oxygenated/deoxygenated colouring (colour convention disclosed).
**Animations**: cardiac cycle synced to Wiggers diagram + **ECG trace** + heart sounds shown as text markers (no audio narration; optional existing click sounds); impulse spreading through conduction system; RBC squeezing through capillary; clotting cascade (platelet plug → fibrin mesh); lymph flow & valves.
**Simulations**: (1) Existing cardio engine + ECG panel; (2) **Exercise challenge** — keep MAP in range while HR/SV change; (3) Blood-group transfusion lab — mix donor/recipient, see agglutination (ABO + Rh), universal donor/recipient; (4) Pacemaker lab — SA node rate, AV delay, heart-block demonstration (Advanced, labelled).
**Missions**: "Be a red blood cell" — full systemic + pulmonary loop with checkpoints at each valve.
**Assessment**: trace-the-blood drag; ECG wave labelling; cardiac cycle timing questions per NCERT; blood-group compatibility puzzles.

## 4. Accuracy specifics
NCERT timing vs real variable timing (conflict register); "blue blood" misconception (deoxygenated blood is dark red; blue is a convention); pulmonary artery carries deoxygenated blood; valve sounds caused by closure, not opening.

## 5. Open questions
1. Include disorder notes (hypertension, CAD) at NEET level only?
2. Heart sounds: text/visual markers only (no audio, per D15) — OK?


## Class 10 layer
See `docs/CLASS_10_CURRICULUM_PLAN.md` (NCERT/CBSE + WBBSE Madhyamik coverage matrix and per-bay Class 10 features).
