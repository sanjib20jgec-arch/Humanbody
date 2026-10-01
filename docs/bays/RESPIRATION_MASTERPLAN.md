# Respiration Bay — Master Plan (DRAFT, discussion only)
> Inherits Cell D6–D27, Tissues TD1–TD5, and the cross-cutting plan. No code until approval.

## 0. Current state audit
| Area | Current |
|---|---|
| Lab | `RespirationLab.jsx` (134 lines): airway exploration, alveoli teaching model, rate/tidal-volume sliders, minute ventilation |
| Engines | `VentilationModel.js` (pressure-driven breathing, alveolar ±1 cmH₂O, intrapleural ≈ −5 cmH₂O ✔), `GasExchangeModel.js` (dead space 150 mL, alveolar gas equation with RQ 0.8, Hill O₂ saturation n≈2.7, P50≈27 mmHg ✔) |
| Disclosure | atlas has airways but **no lung parenchyma** (honestly disclosed ✔) |

### 0.1 Findings
| # | Sev. | Finding |
|---|---|---|
| R1 | Medium | Saturation computed from **alveolar** PO₂ (no A–a gradient) — must be labelled "≈ arterial, idealised". |
| R2 | Medium | NCERT partial-pressure table (alveoli pO₂ 104, deoxygenated blood 40, oxygenated 95, tissues 40; pCO₂ 40/45/40/45 mmHg) differs slightly from model (PAO₂ ≈ 100) → conflict-register entry, show NCERT values in NEET mode. |
| R3 | Medium | **NEET gaps**: respiratory volumes & capacities (TV, IRV, ERV, RV, VC, IC, EC, FRC, TLC) with spirogram; O₂ transport (~97 % as oxyhaemoglobin, ~3 % dissolved) & CO₂ transport (~20–25 % carbamino, ~70 % bicarbonate, ~7 % dissolved); oxygen dissociation curve shifts (pCO₂, H⁺, temperature — Bohr); regulation (medulla rhythm centre, pneumotaxic centre in pons, chemosensitive area); disorders (asthma, emphysema, occupational). |
| R4 | Low | Class 10 gaps: aerobic vs anaerobic respiration (yeast, muscle), breathing in other organisms (gills, tracheae — brief). Cellular respiration links Cell bay (AN16). |

## 1. Syllabus scope
Class 10 Life Processes (respiration); NEET Breathing & Exchange of Gases (full).

## 2. Sources
OpenStax A&P 2e Ch.22; NCERT XI Breathing & Exchange of Gases; West's *Respiratory Physiology*; BioNumbers (alveoli count ~300–500 million, surface ~50–100 m² — verify ranges).

## 3. Features
**3D**: airway tree from atlas (trachea → bronchi → bronchioles) + procedural lung lobes clearly labelled "teaching model" (atlas lacks parenchyma); rib cage + diaphragm + intercostals moving; alveolus–capillary close-up with respiratory membrane layers (slicer); haemoglobin molecule (PDB, CC0) binding O₂.
**Animations**: inspiration/expiration with pressure gauges; gas diffusion across respiratory membrane; O₂ loading/unloading at lungs vs tissues; chloride shift & bicarbonate formation (NEET); cilia clearing mucus (shared with Tissues TA1); anaerobic vs aerobic pathways (Class 10).
**Simulations**: (1) Ventilation lab (existing) + **spirometer** producing a spirogram with labelled volumes; (2) Gas exchange lab with NCERT partial-pressure mode; (3) **O₂ dissociation curve lab** — shift with pH, pCO₂, temperature; (4) Altitude/exercise challenge — keep saturation up by adjusting rate/depth (labelled teaching model); (5) Bell-jar lung model (classic school demo) virtual.
**Missions**: "Escort an oxygen molecule from nose to muscle".
**Assessment**: spirogram reading, partial-pressure table questions, transport % matching, regulation-centre identification.

## 4. Accuracy specifics
Breathing is pressure-driven (lungs don't "suck"); CO₂ (not O₂) is the main driver of breathing rate in healthy people; percentages as NCERT values with ranges; lungs drawn procedurally never presented as source anatomy.

## 5. Open questions
1. Include high-altitude & disorder content at NEET level?
2. Bell-jar demo — include as Class 9/10 activity?


## Class 10 layer
See `docs/CLASS_10_CURRICULUM_PLAN.md` (NCERT/CBSE + WBBSE Madhyamik coverage matrix and per-bay Class 10 features).
