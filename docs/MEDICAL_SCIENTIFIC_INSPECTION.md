# Medical-Scientific Inspection Report — Human Biology Lab

**Reviewer role:** Medical scientist (deep content audit) · **Date:** 2026-09-28
**Scope:** All physiology engines, state machines, teaching captions, quiz banks, structure catalogs, and disclosures across Circulation, Respiration, Nervous, Digestion, Excretion, Reproduction, Cell, Tissues, Heredity.
**Verdict:** Content quality is high and the honesty/disclosure governance is exemplary. However, **3 high-severity scientific issues** (one self-contradicting core teaching diagram, one wrong reflex magnitude, one animation rate that contradicts its own label) and **5 moderate issues** were found. None are clinical-safety risks (no clinical claims are made), but several teach quantitatively wrong physiology.

---

## HIGH severity

### H1 · Cardiac cycle: captions and pressure traces disagree about valve timing
**Files:** `src/lib/CardiacCycleStateMachine.js`, `src/lib/CardioPhysiologyEngine.js`, `src/simulations/CirculationLab.jsx`

The state machine (used for captions: `describeCardiacPhase`) declares semilunar valves open at phase **0.16** and AV valves closed at **0.10** — fixed constants. But the synthesized Wiggers pressures do not cross until later: ventricular pressure is only ~8 mmHg at 0.16 and reaches aortic diastolic (80 mmHg) at ≈ **0.22**; atrial–ventricular crossing occurs ≈ **0.13**.

CirculationLab renders **both truths simultaneously**: captions/state from the phase-based machine, while the 3D valve leaflet markers and the gradient readout use the pressure-based `snapshot.valves`. Between p≈0.16–0.22 the UI says *"semilunar valves open and blood is ejected"* while the on-screen aortic/pulmonary markers show **closed** and the drawn traces show LV < aorta. A student reading the Wiggers diagram — the flagship teaching artifact — sees a direct contradiction.

**Fix:** derive valve-event phases from actual waveform crossings (or steepen early ejection so LV crosses aortic diastolic by ~0.16–0.18), and drive captions from the same source as the markers. One source of truth.

### H2 · Withdrawal reflex timing: 65 ms is ~3–5× too fast for the reflex depicted
**Files:** `src/lib/NerveConductionModel.js`, `src/simulations/NervousLab.jsx`

The modeled arc (skin receptor 5 + sensory 22 + relay 8 + motor 20 + effector 10 = **65 ms**) is labeled as withdrawal from a **hot surface**. Reality:

- Thermal pain is transduced by **Aδ fibers conducting ~5–30 m/s** (C fibers ~1–2 m/s). Over ~0.6–0.8 m hand→cord, the sensory leg alone is ≥25–120 ms. The model's 22 ms implies ~30+ m/s — Aβ *touch* fiber speed, not nociception.
- Polysynaptic spinal delay + Aα motor (~5–10 ms) + neuromuscular transmission + excitation–contraction coupling (~10–30 ms) + visible muscle shortening put real withdrawal latencies at **~200–500 ms**.
- 65 ms is in the range of a *monosynaptic stretch reflex* (knee jerk ~30–50 ms), not a nociceptive withdrawal.

The qualitative teaching point (reflex precedes conscious perception) survives, and the disclosure says "teaching approximation" — but the displayed number mis-teaches nociceptive conduction. **Fix:** re-time segments to a ~200–300 ms total (receptor 5, sensory ~100, relay ~20, motor ~12, effector ~60), or keep 65 ms and reframe the stimulus as a fast Aβ-mediated spinal response with an explicit note that pain-fiber pathways are much slower.

### H3 · Breathing animation runs 2.25× faster than the labeled rate
**File:** `src/simulations/RespirationLab.jsx`

Phase advances `0.018` per 40 ms tick × (rate/12): at rate = 12/min the visible breathing frequency is **27 breaths/min**. Learners can count breaths against the slider label — a direct, visible contradiction. The completed-breath counter is inflated by the same factor.

**Fix (one line):** increment = `(rate / 60) * 0.04 * speed`.

---

## MODERATE severity

### M1 · "MODEL O₂ READOUT %" oscillates 94→99% with every breath
**File:** `src/simulations/RespirationLab.jsx` — `oxygenLevel = 94 + breathShape * 5`
Arterial O₂ saturation does not swing five points per respiratory cycle; it stays ~95–100% beat-to-beat. Displayed as a bare percentage, it reads like SpO₂. Relabel as an alveolar-filling indicator or hold it near-constant (changing only with ventilation settings).

### M2 · PAO₂/PACO₂ computed from minute ventilation, ignoring dead space
**File:** `src/simulations/RespirationLab.jsx` — linear `100 + (VE−6)×1.6` / `40 − (VE−6)×2.4`
Dead space (~150 mL) is the whole reason rate-vs-depth matters. In the current model, **rapid shallow breathing (24/min × 250 mL → VE 6 L/min but alveolar ventilation only ~2.4 L/min — true hypoventilation) shows perfectly normal PAO₂/PACO₂**, and CO₂ retention at low ventilation is badly underestimated (the real relation is hyperbolic, not linear). The disclosure mentions dead space, but the displayed numbers contradict it. **Fix:** compute VA = RR×(VT−150); PACO₂ ≈ 40 × 4.2/VA; PAO₂ from the alveolar gas equation (PAO₂ = 150 − PACO₂/0.8). This is *simpler to implement and more accurate*, and turns dead space into a visible teaching feature.

### M3 · Wiggers "right ventricle (×0.21 teaching scale)" is plotted at ×0.67
**File:** `src/lib/CardioPhysiologyEngine.js` — drawn value is `ventricular × 0.21 × 3.2`
The undisclosed ×3.2 display amplification makes the RV peak appear at ~81 mmHg on the systemic axis instead of the true ~25 mmHg that the label promises. Either state the amplification in the label or give the RV trace its own calibrated axis.

### M4 · Enzyme heat inactivation is modeled as a gentle symmetric bell
**File:** `src/lib/EnzymeKineticsEngine.js` — Gaussian σ ≈ 9–10 °C
At 50 °C the model still shows ~43% activity. Real digestive enzymes undergo steep, largely irreversible denaturation above ~42–45 °C. A student exploring "fever temperatures" learns the wrong lesson. **Fix:** asymmetric temperature factor (mild falloff below optimum, cliff above ~42 °C).

### M5 · Lipase products listed as "Fatty acids + glycerol"
**File:** `src/lib/EnzymeKineticsEngine.js`
Pancreatic lipase primarily yields **2-monoacylglycerol + free fatty acids**; complete hydrolysis to glycerol is minor. Correct the product string.

---

## LOW severity / notes

| # | Finding | File | Note |
|---|---------|------|------|
| L1 | `volumeMl` peaks at VT/2 (250 mL for VT 500) | VentilationModel.js | Latent — never displayed yet; fix formula to `VT×0.5×(1−cos 2πp)` before any volume trace is added |
| L2 | Small-intestine pH shown as 8 | DigestiveStageMachine.js | Duodenum is ~6–6.5 before bicarbonate neutralization; say "7–8 after neutralization" |
| L3 | Intrapleural trace plotted with implicit +5 offset | RespirationLab.jsx | Legend should say "plotted offset" or show the true −5 baseline |
| L4 | Pulmonary trunk diastolic floor fixed at 15 mmHg | CardioPhysiologyEngine.js | Real PAD ≈ 8–10 (15 is mean PAP); mild overstatement |
| L5 | ECG PR ≈ 70 ms, QT ≈ 210 ms vs real 120–200 / 350–440 ms | CardioPhysiologyEngine.js | Disclosed "shape only"; caption should note intervals are compressed, not just amplitudes |
| L6 | Stomach "side input: pepsin" | DigestiveStageMachine.js | Secreted as pepsinogen, activated by HCl — one clause in the caption |
| L7 | Max-exercise SBP plateaus at ~142 mmHg | CardioPhysiologyEngine.js | Real maximal SBP ~180–200; acceptable in disclosed range, noted |
| L8 | Platelet-clotting quiz item | modules.js | Optional: add "together with plasma clotting factors" to the explanation |

---

## What is correct (verified against standard physiology)

- **Cardiac phase proportions** (atrial systole 10%, IVC ~6%, ejection ~34%, IVR ~7%, filling ~43%) match textbook Wiggers timing; MAP = DBP + PP/3 algebra consistent; base values (HR 72, SV 70 mL, 120/80, MAP ~93) correct.
- **Ventilation pressures**: alveolar ±1 cmH₂O, intrapleural baseline −5 cmH₂O — correct quiet-breathing values; "pressure differences drive flow, lungs don't pull air" framing is right.
- **Digestion**: food never passes through accessory organs (correct); bile/pancreatic juice enter at duodenum as side inputs (correct); pH optima amylase 6.8 / pepsin 1.8 / trypsin 7.8 (accurate); Michaelis–Menten form correct.
- **Renal**: filtration barrier selectivity, PCT reabsorption profile, loop of Henle countercurrent (descending water-permeable / ascending salt-pumping), DCT hormone sensitivity, ADH→aquaporin mechanism — all accurate.
- **Reproduction**: secondary oocyte completes meiosis *only if fertilized*; LH surge → ovulation; fertilization in uterine tube; diploid zygote — accurate and precisely worded.
- **Hematology, chamber anatomy, airway and brain structure captions** — accurate; all 27 quiz questions factually correct.
- **Honesty layer**: no-parenchyma disclosure, "teaching values, not blood gases," adult-male scope, source mesh never animated — exemplary and consistent with the app's doctrine.

---

## Recommended fix order

1. **H1** — unify cardiac valve-event truth (most visible contradiction).
2. **H3** — breathing rate constant (one-line fix).
3. **H2** — reflex timing re-scale or reframe.
4. **M2 + M1** — dead-space-based gas exchange; relabel O₂ readout.
5. **M3, M4, M5** — RV scale label, asymmetric heat denaturation, lipase products.
6. Low items as polish; each change re-verified by the existing QC/smoke suites and, where captions change, queued as pending human visual-review cases per Phase 63 governance.

**No clinical-safety exposure found** (no diagnostic or therapeutic claims anywhere in the inspected content). All findings above are teaching-accuracy issues.
