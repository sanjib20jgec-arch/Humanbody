# MBBS Student Inspection Report — Human Biology Lab

**Reviewer role:** MBBS student (anatomy viva + physiology theory perspective) · **Date:** 2026-09-28
**Scope:** Atlas part classifications & nomenclature (2,234 parts), lab captions, physiology readouts, quizzes — checked against standard teaching references (FMA/TA nomenclature, Guyton-level physiology, Kenhub/Gray's-style anatomy).
**Verdict:** Two **critical anatomy classification errors** (brain structures classified as heart structures), non-standard heart-valve cusp naming that contradicts every textbook, and several physiology readouts that would make a student write a **wrong viva/MCQ answer**. Detailed below.

---

## CRITICAL — anatomy classification errors

### C1 · Brain ventricles are classified as CARDIAC (heart) structures
**Source:** `public/models/atlas.json` — verified against FMA

These five **brain** structures carry `system: "cardiac"`:

| Atlas part | FMA ID | Actual identity |
|---|---|---|
| Third ventricle | FMA78454 | Brain ventricle (diencephalon, CSF) |
| Fourth ventricle | FMA78469 | Brain ventricle (pons/medulla, CSF) |
| Left lateral ventricle | FMA78450 | Brain ventricle |
| Right lateral ventricle | FMA78449 | Brain ventricle |
| Interventricular foramen | FMA75351 | **Foramen of Monro** (connects lateral → third ventricle) |

The classifier apparently matched the word "ventricle" and assigned heart. Real consequences in the app:

1. Searching **"ventricle"** returns the third/fourth/lateral ventricles as *cardiac* search hits alongside the heart's ventricles.
2. Selecting one shows the cardiac system function text — the app literally tells a learner the third ventricle's job is that it *"pumps blood through the pulmonary and systemic circuits"*. In viva terms: calling a CSF space a blood pump.
3. Loading the heart layer / circulation bay renders brain ventricle meshes inside the "heart".

**Fix:** reassign these 5 parts to the nervous system (or exclude them from cardiac queries/layer loads); add a classifier guard so "ventricle" matches are resolved by FMA region, not keyword.

### C2 · Choroid plexus classified as "sensory"
`Choroid plexus of cerebral hemisphere (FMA61934)` sits under the *sensory* system. It belongs to the nervous system (ventricular CSF apparatus). Same keyword-classifier smell ("plexus" → vascular/sensory guess).

---

## HIGH — nomenclature that contradicts standard teaching

### N1 · Aortic valve cusps use names no textbook uses
Atlas display names: **"Anterior cusp of aortic valve" (FMA7253), "Left posterior cusp" (FMA7254), "Right posterior cusp" (FMA7252)**.

Standard nomenclature (TA/FMA; Kenhub; Gray's): **right coronary (right semilunar), left coronary (left semilunar), non-coronary (posterior semilunar)** cusps — named for coronary ostia. Crucially, **the aortic valve has no "anterior" cusp** — the anterior cusp belongs to the *pulmonary* valve. A student who learns "anterior cusp of aortic valve" will fail that spotter. These are BodyParts3D positional labels surfaced verbatim; the app should map/alias them to standard exam names (right coronary / left coronary / non-coronary).

### N2 · Pulmonary valve cusps equally non-standard
Atlas: "Left anterior cusp (FMA7247), Right anterior cusp (FMA7249), Posterior cusp (FMA7250)". Standard: **anterior, right, and left semilunar cusps**. Same fix needed.

*(Tricuspid anterior/posterior/septal and mitral anterior/posterior leaflets are correctly named — no issue.)*

---

## HIGH — physiology that would produce wrong exam answers

*(Full quantitative analysis in `MEDICAL_SCIENTIFIC_INSPECTION.md`; reframed here for exam impact.)*

| # | Issue | Exam consequence |
|---|---|---|
| P1 | **Reflex arc total 65 ms for a hot-surface withdrawal** (`NerveConductionModel.js`) | Withdrawal from pain is Aδ-mediated: real latency ~200–500 ms; 65 ms is monosynaptic stretch-reflex territory. Viva answer "65 ms" = wrong. |
| P2 | **PAO₂/PACO₂ ignore dead space** (`RespirationLab.jsx`) | The classic MCQ — rapid shallow breathing (24 × 250 mL) is alveolar *hypoventilation* — displays normal gases here. A student trusting this model answers it backwards. Fix: VA = RR×(VT−150), PACO₂ ∝ 1/VA, PAO₂ via alveolar gas equation. |
| P3 | **Wiggers caption/trace disagreement** on semilunar opening (0.16 caption vs ~0.22 pressure crossing) | A student reproducing this diagram marks ejection starting with LV still below aortic pressure. |
| P4 | **RV trace labeled "×0.21 teaching scale" but plotted at ×0.67** | Student estimates RV systolic ≈ 80 mmHg; true ≈ 25 mmHg (exactly the ⅕ ratio the app itself teaches elsewhere). |
| P5 | **Breathing animation runs 27/min when slider says 12/min** | Countable contradiction against the "breaths/min" label. |
| P6 | **"MODEL O₂ %" swings 94→99 per breath** | SpO₂ doesn't oscillate with respiration; reads like arterial desaturation cycling. |
| P7 | **Enzyme heat curve symmetric** (43% activity at 50 °C) | Denaturation graphs in exams are asymmetric cliffs; model teaches the wrong shape. |
| P8 | **Lipase products "fatty acids + glycerol"** | Pancreatic lipase yields **2-monoacylglycerol + fatty acids** — the expected MBBS answer. |
| P9 | Quiz wording "**ATP release** in aerobic respiration" | Should read "ATP synthesis/production". |
| P10 | Large-intestine "enzyme: Gut microbiota" | Microbiota are not an enzyme; fermentation by bacteria is the honest phrasing. |

---

## MODERATE — gaps vs MBBS curriculum (not errors, but students should know)

1. **ECG without a conduction system.** The Wiggers diagram draws an ECG lane, but SA node, AV node, bundle of His/Purkinje fibers appear nowhere in the teaching content. Any ECG teaching without "where does the impulse start?" is incomplete — the P-wave caption says *atrial depolarization* but never says *initiated at the SA node*.
2. **No coronary circulation** in the circulation route (coronary arteries exist in the atlas but no bay teaches them; no mention that the heart feeds itself first).
3. **No cardiac auscultation areas** (aortic/pulmonary/tricuspid/mitral listening points) — expected anatomy practical content.
4. **No lung volumes/capacities** (IRV/ERV/RV, VC, FRC) — only tidal volume is modeled; spirometry basics are missing.
5. **No GFR (~125 mL/min), nephron count (~1 million), or countercurrent multiplier numbers** — renal module is purely qualitative.
6. **Right main bronchus** — no mention that it is wider/shorter/more vertical (the classic foreign-body/aspiration fact).
7. **Lymphatic layer = spleen + thymus only**; no nodes or ducts — the layer label oversells its content.
8. **Endocrine layer = pineal, pituitary, adrenals only**; thyroid/parathyroids absent (pancreas sits in digestive — acceptable dual role, but worth a note).
9. **Frank–Starling mechanism absent** from the circulation simulator (only HR/contractility/resistance sliders).
10. **Duplicate atlas entries** (same FMA ID repeated: e.g., FMA3860 diagonal branch ×13, FMA66403 anterior interventricular vein ×9) pollute search results and the structure index.

---

## What's solid (would pass viva)

- Chamber flow order, valve functions, great-vessel oxygen status (incl. the trap that pulmonary *artery* carries deoxygenated blood) — all correct.
- Blood components (biconcave RBCs + hemoglobin, platelet plug, plasma roles) — correct.
- Nephron physiology: filtration barrier, PCT reabsorption, loop countercurrent (descending water / ascending salt), DCT hormonal tuning, ADH→aquaporins — accurate and well-phrased.
- Reproduction: **secondary oocyte** terminology used correctly; LH surge → ovulation; fertilization in uterine tube; diploid zygote; idealized 28-day cycle phases correct (menses 1–5, follicular ~6–13, ovulation day 14).
- Digestion route: accessory organs correctly kept off the food path; enzyme pH optima (amylase 6.8 / pepsin 1.8 / trypsin 7.8) accurate; module pH ranges internally consistent across the two data sources.
- Quiet-breathing pressures (±1 cmH₂O alveolar, −5 intrapleural), MAP = DBP + PP/3, CO = HR × SV — correct.
- Tissue definitions, Mendelian quiz items, organelle functions — correct.
- Adult-male reference scope and no-parenchyma limitations disclosed — honest.

---

## Recommended fix order (student priority)

1. **C1/C2** — reclassify the 5 brain ventricles + foramen of Monro (nervous), choroid plexus (nervous); fix the keyword classifier; re-run anatomy QC with a semantic system-label check.
2. **N1/N2** — add standard aliases for aortic (right/left coronary, non-coronary) and pulmonary (anterior/right/left) cusps, shown alongside source labels.
3. **P1, P2, P5** — reflex timing re-scale, dead-space gas exchange, breathing rate constant (each would otherwise teach a wrong exam answer).
4. **P3, P4, P6, P7, P8** — Wiggers consistency, honest RV scaling, O₂ readout relabel, asymmetric denaturation, lipase products.
5. Curriculum gaps — add a conduction-system caption to the ECG lane first (one line, high value); the rest as backlog notes.
6. Every content/caption change → new pending human visual-review cases per Phase 63 governance.
