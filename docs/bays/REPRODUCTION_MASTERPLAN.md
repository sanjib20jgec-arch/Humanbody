# Reproduction Bay — Master Plan (DRAFT, discussion only)
> Inherits Cell D6–D27, Tissues TD1–TD5, and the cross-cutting plan. No code until approval.

## 0. Current state audit
| Area | Current |
|---|---|
| Lab | `ReproductionLab.jsx` (88 lines): ovary/follicle, oocyte, sperm, uterine tube, uterus; 28-day cycle animation; hormone bars |
| Model | piecewise hand-written FSH/LH/estrogen/progesterone curves |

### 0.1 Findings
| # | Sev. | Finding |
|---|---|---|
| P1 | **High** | Hormone timing: model peaks **estrogen on day 14** together with LH. Physiologically estradiol peaks ~1–2 days *before* the LH surge, which triggers ovulation ~24–36 h later. Curves must be rebuilt from sourced reference data (normalised, labelled "typical 28-day cycle; real cycles vary 21–35 days"). |
| P2 | High | Values displayed as % of arbitrary max with no axis meaning → label "relative level". |
| P3 | Medium | **NEET gaps**: male & female reproductive systems; spermatogenesis & oogenesis (with ploidy at each stage); sperm structure; menstrual cycle phases (menstrual, follicular, ovulatory, luteal); fertilisation, cleavage, blastocyst, implantation; placenta & its hormones (hCG, hPL, relaxin); embryonic development overview; parturition (foetal ejection reflex, oxytocin); lactation (colostrum). **Reproductive Health** chapter: contraception methods, STIs, MTP, infertility & ART (IVF, ZIFT, GIFT, ICSI, AI), amniocentesis ban context. |
| P4 | Medium | Class 9 *Exploration* Ch.11 "Reproduction: How Life Continues" + Class 10 "How do organisms reproduce" include **asexual reproduction** (fission, budding, fragmentation, regeneration, vegetative propagation, spores) and **sexual reproduction in flowering plants** — absent today. |

## 1. Sensitivity & age-appropriateness (new requirement proposal)
- Schematic, textbook-style anatomical diagrams only; no photographic nudity; neutral clinical language in both languages.
- Level-gated: Class 9–10 content by default; NEET reproductive-health topics appear only at NEET level.
- Teacher mode can hide sections for classroom projection.
- Health content is educational only, with "consult a doctor" note; no personal cycle tracking.

## 2. Syllabus scope
Class 9 Exploration Ch.11; Class 10; NEET Human Reproduction + Reproductive Health (+ Sexual Reproduction in Flowering Plants as plant tab, owner to confirm).

## 3. Sources
OpenStax A&P 2e Ch.27–28; OpenStax Biology 2e Ch.32 & 43; NCERT IX/X/XII; WHO fact sheets (contraception/STIs, reference only); reference hormone curves from peer-reviewed endocrinology literature (two sources).

## 4. Features
**3D**: schematic male/female systems (procedural, textbook style); ovary with follicle stages (primary → Graafian → corpus luteum); seminiferous tubule cross-section (slicer) showing spermatogenesis layers; sperm 3D (head/acrosome, midpiece mitochondria, tail); early embryo stages (zygote → morula → blastocyst → implantation); flower 3D (stamen, carpel) for plant tab.
**Animations**: gametogenesis with chromosome counts (2n → n); menstrual cycle synced to rebuilt hormone curves & endometrium; ovulation; fertilisation (acrosome reaction, block to polyspermy — NEET level); cleavage & implantation; placenta exchange; asexual reproduction set (binary fission in Amoeba, budding in Hydra/yeast, regeneration in Planaria, vegetative propagation); pollination → double fertilisation (plant tab).
**Simulations**: (1) **Rebuilt cycle lab** — scrub days, see hormone curves, follicle & endometrium state, feedback arrows (positive/negative); (2) Gametogenesis counter — track ploidy & number of gametes from one cell (4 sperm vs 1 ovum + polar bodies); (3) Embryo timeline scrubber; (4) Asexual vs sexual variation lab (links Heredity).
**Assessment**: phase ordering, hormone–source–effect tables, ploidy questions, ART method matching (NEET).

## 5. Accuracy specifics
Ovulation releases a secondary oocyte arrested in metaphase II; meiosis II completes only after sperm entry; cycle length variability stated; contraception efficacy as sourced ranges, no recommendations.

## 6. Open questions
1. Approve the sensitivity/age-gating rules above?
2. Include Reproductive Health (contraception, STIs, ART) at NEET level?
3. Plant reproduction (flowering plants) as a tab here?

## 7. Round 10 findings
- **P1 confirmed with sources**: estradiol peaks ≈ 1 day (24–48 h) before the LH surge; LH surge lasts ≈ 1.5–2 days; ovulation ≈ 24–36 h after surge onset and ≈ 16–24 h after the LH peak; progesterone begins rising within ≈ 12 h of surge onset; luteal progesterone/estrogen maximum ≈ 7–8 days after the LH peak (GLOWM "Documentation of Ovulation" citing WHO probit study; Elsevier physiology texts). Rebuilt curves must encode these offsets.
- Class 10 Ch.7 (current book) includes reproductive health → Class 10 layer keeps a brief, age-appropriate reproductive-health card.


## Class 10 layer
See `docs/CLASS_10_CURRICULUM_PLAN.md` (NCERT/CBSE + WBBSE Madhyamik coverage matrix and per-bay Class 10 features).
