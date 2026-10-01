# Digestion Bay — Master Plan (DRAFT, discussion only)
> Inherits Cell D6–D27, Tissues TD1–TD5, and `docs/LEARNING_BAYS_CROSS_CUTTING_PLAN.md`. No code until approval.

## 0. Current state audit
| Area | Current |
|---|---|
| Explore | `DigestiveLab.jsx` (183 lines): pathway with play/pause/step, food tracking, pH meter; uses OpenStax digestive plate (CC BY) and BodyParts3D atlas reference |
| Engines | `DigestiveStageMachine.js` (5 stages, accessory organs as side inputs — food never passes through them ✔), `EnzymeKineticsEngine.js` (Michaelis–Menten + Gaussian pH, asymmetric temperature denaturation ✔) |
| Quiz | 3 items |

### 0.1 Findings
| # | Sev. | Finding |
|---|---|---|
| G1 | High | **Syllabus**: Digestion & Absorption is **deleted from NEET**; bay must target Class 10 (Life Processes – nutrition) + general understanding; no NEET layer. |
| G2 | Medium | Enzyme `vmax`, `km`, `substrate` are arbitrary units but displayed like measurements → must be labelled "relative units" (Accuracy §21.6). |
| G3 | Medium | pH optima are reasonable (amylase ≈6.8, pepsin ≈1.5–2, trypsin/lipase ≈7.8–8) but need 2 sources each in evidence ledger. |
| G4 | Medium | Missing Class 10 content: types of nutrition (autotrophic/heterotrophic), nutrition in amoeba, villi structure, bile emulsification visual, peristalsis visual, sphincters, role of HCl & mucus. |
| G5 | Low | Absorption shown only as text; no villus/microvillus 3D or capillary vs lacteal routes. |

## 1. Syllabus scope
Class 7–10 NCERT nutrition chapters (Class 10 "Life Processes"); Class 9 Exploration links via Tissues; NEET: none (link to Cell biomolecules/enzymes instead).

## 2. Sources
OpenStax A&P 2e Ch.23 (CC BY, already in repo), OpenStax Biology 2e Ch.34, NCERT X Life Processes, Guyton & Hall / Ganong (verification), BioNumbers (gut surface area, transit times — note the corrected modern estimate of intestinal surface ≈ 30–40 m², not "tennis court").

## 3. Features
**3D**: full GI tract from atlas with organ isolation; cut-away stomach (rugae, gastric pits), small-intestine wall explode (mucosa → submucosa → muscularis → serosa; links Tissues), **villus → microvillus zoom ladder** with capillary and lacteal; liver–gallbladder–pancreas ducts joining the duodenum (sphincter of Oddi as Advanced note).
**Animations (≤ 30 s)**: peristalsis wave; chewing & bolus formation; stomach churning; bile emulsifying fat droplets; enzyme–substrate lock-and-key/induced fit; absorption of glucose/amino acids into capillary vs fatty acids into lacteal; water recovery in large intestine; amoeba phagocytosis (Class 10).
**Simulations**: (1) Enzyme lab (existing engine, relabelled units, add substrate-concentration curve & inhibitor toggle as Advanced); (2) **"Journey of a meal" mission** — choose a meal (rice, dal, oil) and follow carbs/proteins/fats through each organ with live pH and enzyme events; (3) Surface-area lab — fold a tube into folds → villi → microvilli and see absorption rate scale; (4) Emulsification lab — bile on/off vs lipase action rate.
**Engagement**: curiosity hook "Why doesn't the stomach digest itself?"; challenge "digest this meal fastest by placing enzymes in the right organ"; build-the-gut puzzle.
**Assessment**: order-the-pathway drag, label-the-tract 3D, enzyme–site–product matching, misconceptions (digestion starts in the stomach; the stomach absorbs most nutrients; bile is an enzyme).

## 4. Accuracy specifics
Bile is not an enzyme; pepsinogen → pepsin activation by HCl; pancreatic juice neutral-izes chyme; most absorption in small intestine; transit times as ranges; enzyme curves labelled as teaching curves.

## 5. Open questions
1. Keep a short "Advanced (beyond syllabus)" layer since NEET dropped digestion, or stop at Class 10?
2. Include common disorders (Class 10 level: e.g. dental caries) or skip?


## Class 10 layer
See `docs/CLASS_10_CURRICULUM_PLAN.md` (NCERT/CBSE + WBBSE Madhyamik coverage matrix and per-bay Class 10 features).
