# Excretion Bay — Master Plan (DRAFT, discussion only)
> Inherits Cell D6–D27, Tissues TD1–TD5, and the cross-cutting plan. No code until approval.

## 0. Current state audit
| Area | Current |
|---|---|
| Lab | `ExcretionLab.jsx` (90 lines): nephron segments (corpuscle, PCT, loop, DCT, collecting duct), filtrate flow animation, GFR & ADH sliders |
| Model | inline: filtered/day = GFR × 1.44 (125 mL/min → 180 L/day ✔), recovery = 98.5 % + ADH × 0.9 %, concentration = 1 + ADH/55 |

### 0.1 Findings
| # | Sev. | Finding |
|---|---|---|
| E1 | **High** | Urine range is unrealistic: ADH 0 → ~2.7 L/day. Without ADH (e.g. diabetes insipidus) urine can reach ~15–20 L/day; with maximal ADH ~0.5 L/day. Recovery model must be re-derived and sourced. |
| E2 | High | "Concentration ×" is a unitless invention → replace with **urine osmolality (~50–1200 mOsm/kg H₂O)** from a sourced model. |
| E3 | Medium | **NEET gaps**: ammonotelism/ureotelism/uricotelism; kidney structure (cortex, medulla, pyramids, pelvis, hilum); juxtamedullary vs cortical nephrons; **counter-current mechanism** (loop of Henle + vasa recta, urea role); regulation — JGA, **RAAS**, ANF, ADH; micturition reflex; role of lungs, liver, skin; disorders (uraemia, renal failure, renal calculi, glomerulonephritis), haemodialysis, transplantation. |
| E4 | Low | Class 10: excretion in plants (brief); artificial kidney principle. |

## 1. Syllabus scope
Class 10 Life Processes (excretion); NEET Excretory Products and their Elimination (full).

## 2. Sources
OpenStax A&P 2e Ch.25; NCERT XI Excretory Products; Guyton & Hall; BioNumbers (nephrons ≈ 1 million per kidney; GFR 125 mL/min; 180 L/day; ~99 % reabsorbed — NCERT values).

## 3. Features
**3D**: kidney from atlas with cut-away (cortex/medulla/pyramids/pelvis); nephron 3D with vasa recta and its position across cortex–medulla; glomerulus filtration barrier close-up (fenestrated endothelium, basement membrane, podocytes — slicer); JGA close-up.
**Animations**: filtration (cells & proteins stay, small solutes pass); selective reabsorption in PCT (glucose, amino acids, Na⁺, water); counter-current multiplication step-by-step with osmolarity colour map; ADH inserting aquaporins; RAAS cascade; dialysis machine principle (Class 10).
**Simulations**: (1) **Rebuilt nephron lab** — GFR, ADH, salt intake, water intake → urine volume & osmolality from a sourced model; (2) Counter-current lab — loop length vs maximum concentration (teaching model); (3) Hormone challenge — "dehydrated after football: restore balance" (ADH, RAAS); (4) Glucose threshold lab — renal threshold & glycosuria (NEET-relevant diabetes note); (5) Dialysis lab — concentration gradients across membrane.
**Missions**: "Follow a urea molecule from liver to toilet".
**Assessment**: nephron segment–function matching, counter-current reasoning, hormone flowcharts, NCERT numeric questions.

## 4. Accuracy specifics
Filtration is non-selective by size/charge, reabsorption selective; ~99 % of filtrate reabsorbed (NCERT); ADH acts on DCT/collecting duct; urine volume & osmolality ranges sourced; dialysis described without medical advice.

## 5. Open questions
1. Include disorders & dialysis at NEET level?
2. Plant excretion (Class 10) — brief card or skip?

## 6. Round 10 findings
- **E1/E2 sourced**: kidney can produce urine from ≈ 50 to ≈ 1200 mOsm/kg; with ≈ 1000 mOsm/day solute load urine volume ranges ≈ 0.8 L/day (max concentration) to ≈ 20 L/day (max dilution); DI defined as > 3 L/day of urine < 300 mOsm/kg (Medscape; Elsevier clinical biochemistry). Rebuilt model: volume = solute load ÷ urine osmolality, with osmolality driven by ADH and medullary gradient.


## Class 10 layer
See `docs/CLASS_10_CURRICULUM_PLAN.md` (NCERT/CBSE + WBBSE Madhyamik coverage matrix and per-bay Class 10 features).
