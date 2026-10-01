# Tissues Module — Master Plan (DRAFT, discussion only)

> Status: **planning only — no code until the product owner approves.**
> Date: 2026-10-01 · Branch: `arena/01a0f3d4-humanbody`
> Inherits all cross-cutting decisions from `docs/CELL_STRUCTURE_MASTERPLAN.md` (D6–D27): non-commercial, app-wide English ⇄ formal Bengali toggle in Settings, English digits, app-wide Auto/Light/Dark theme (modern, OKLCH, WCAG 2.2 AA), 3D first-class, animations ≤ 30 s per chapter with time-scale badge, NEET ceiling / Class 9 default, no audio narration, no AR, single PR at the end, **Scientific Accuracy Framework (§21) applies in full**.

---

## 0. Current state audit

| Area | File | Current state |
|---|---|---|
| Explore | `src/simulations/TissuesLab.jsx` (80 lines) | 4 clickable CSS "tissue nodes": epithelial, connective, muscle, nervous; one-paragraph what/how/why each |
| Simulate | same file, `TissueSimulation` | one generic "signal" bar travelling through 24 cells for **all four** tissue types; stimulus slider |
| Quiz | `quizSets.tissues` | 3 questions |
| Objectives | `learningObjectives.tissues` | 3 objectives |
| Source | `learningSources.tissues` | OpenStax A&P 2e §4.1 (CC BY 4.0); "no reviewed 3D source" |
| Tests touching it | `curriculum-smoke` (asserts `completedSignals`, label text), `interaction-smoke`, `reduced-motion-smoke`, `guided-path.spec`, `phase13-source-provenance.spec` | must be updated with the rebuild |
| Atlas link | `generate-atlas-report.mjs` maps BodyParts3D *muscular* and *connective* systems → "Tissues" | unused opportunity |

### 0.1 Scientific / technical findings

| # | Severity | Finding |
|---|---|---|
| T1 | **High** | The simulation shows the *same* propagating "signal" in epithelial and connective tissue. These tissues do not conduct impulses — scientifically misleading. Only nervous (action potential) and cardiac/smooth muscle (gap-junction spread) propagate electrical signals. |
| T2 | **High** | Invented numbers: `organization` 94/72/87/64 % and response multipliers (1, .82, .58, .4) have no source and no physical meaning, yet are shown as metrics. Violates §21.2. |
| T3 | High | Only the 4 primary categories; **no subtypes** — NCERT XI Ch.7 requires simple squamous/cuboidal/columnar/ciliated, compound, glandular (exocrine/endocrine; unicellular/multicellular), cell junctions (tight, adhering, gap), loose (areolar, adipose), dense regular/irregular, specialised (cartilage, bone, blood), skeletal/smooth/cardiac, neuron + neuroglia. |
| T4 | High | **Plant tissues absent**, but they are core in Class 9 (new NCERT *Exploration* Ch.3 "Tissues in Action") and NEET (XI Ch.6 Anatomy of Flowering Plants: meristematic/permanent, simple/complex, tissue systems, monocot vs dicot TS). |
| T5 | Medium | "Tight junctions" stated as general to epithelia; correct only for many epithelia, needs qualification. |
| T6 | Medium | No microscope/histology view, although NEET asks image/diagram-based identification. |
| T7 | Low | Muscle described as "shorten" without distinguishing the three types' control (voluntary/involuntary), striation, nuclei. |

---

## 1. Syllabus scope (verified this round)

### 1.1 Class 9 — **new NCERT *Exploration* (2026-27, NCF-SE 2023)**
- Ch.3 **"Tissues in Action"** covers plant and animal tissues, structure–function fit, **and joints & the skeleton**.
- ⚠ The Cell plan referenced old IX Ch.5; the new book's Ch.2 is **"Cell: The Building Block of Life"** → Cell plan citations must be re-pointed (added as action item C-UPD-1).
- Action: obtain the official NCERT PDF and build a line-by-line coverage matrix (Phase 0).

### 1.2 Class 11 / NEET
- **XI Ch.7 Structural Organisation in Animals** — animal tissues (+ frog systems, brief). Earthworm reported removed from NEET 2026; cockroach status to verify against current NCERT PDF + NMC syllabus.
- **XI Ch.6 Anatomy of Flowering Plants** — meristematic & permanent tissues, simple (parenchyma, collenchyma, sclerenchyma) & complex (xylem, phloem), tissue systems (epidermal, ground, vascular), vascular bundle types, dicot/monocot root–stem–leaf TS. **Secondary growth deleted** from NEET.
- Weight: ~7–8 NEET questions/yr from this unit; Anatomy of Flowering Plants 2–4 and Structural Organisation in Animals 2–5 per year (2021–2025).

### 1.3 Out of scope (proposed)
Secondary growth (deleted), earthworm, frog organ systems in 3D (brief card only), histopathology beyond NEET-relevant notes.

---

## 2. Certified source base

| Tier | Source | Use | Licence → how we use it |
|---|---|---|---|
| A | NCERT IX *Exploration* Ch.3; XI Ch.6, Ch.7 | syllabus & exam wording | reference only |
| A | WBBSE/WBCHSE Bengali-medium Life Science books | Bengali terminology | reference only |
| A | OpenStax *A&P 2e* Ch.4 (Tissue level), Ch.10 (muscle), Ch.12 (nervous tissue); *Biology 2e* Ch.30 (plant form) & Ch.33 (animal tissues) | facts + figures | CC BY 4.0 → figures may be embedded with attribution |
| A | Ross & Pawlina *Histology*; Junqueira's *Basic Histology*; Esau/Evert *Plant Anatomy*; Alberts | verification | reference only |
| B | University of Michigan Histology & Virtual Microscopy | real slides | **CC BY-NC-SA** → allowed (non-commercial); derivative crops must carry same licence + attribution |
| B | Histology Guide (Sorensen & Brelje), Homburg virtual microscopy | real slides | copyrighted → **link only** |
| B | Human Protein Atlas tissue section | IHC images | CC BY-NC-ND → **link only** |
| B | BioNumbers | quantitative values | cite BNID |
| C | Wikimedia Commons histology | per-file | only CC BY / CC0 / PD files, logged per file |

---

## 3. Vision

**"From cells to tissues to organs — see it in 3D, cut it like a histologist, recognise it under the microscope."**
A multi-scale, bilingual, 3D + animated, evidence-backed tissue lab covering **human (animal) and plant** tissues, Class 9 → NEET.

---

## 4. Feature plan

### 4.1 Tissue catalogue (data-driven, 3 depth levels)
**Animal (~22 entries):** simple squamous, cuboidal, columnar, ciliated columnar, pseudostratified (Advanced), compound/stratified squamous (keratinised vs non-keratinised), transitional (Advanced), glandular (exocrine/endocrine, uni/multicellular); junctions (tight, adhering/desmosome, gap); areolar, adipose, dense regular (tendon, ligament), dense irregular (dermis), cartilage (hyaline, elastic, fibro), bone (compact, spongy), blood; skeletal, smooth, cardiac muscle; neuron, neuroglia, myelinated vs unmyelinated fibre.
**Plant (~16 entries):** apical, intercalary, lateral meristem; parenchyma (+ chlorenchyma, aerenchyma), collenchyma, sclerenchyma (fibres, sclereids); xylem (tracheids, vessels, xylem parenchyma, xylem fibres; proto/metaxylem), phloem (sieve tube elements, companion cells, phloem parenchyma, phloem fibres); epidermis, stomata & guard cells, trichomes/root hairs, cork (Class 9).
Each entry: location in body/plant, structure, function, *why structure fits function*, key numbers with ranges, NEET tag, misconception, clinical/applied note (NEET-relevant only), sources.

### 4.2 3D features (owner priority)
| ID | Feature |
|---|---|
| T3D-1 | **3D tissue blocks** — procedural voxel-like blocks for each tissue (cells + matrix + fibres), rotate, cut-away |
| T3D-2 | **"Make a slide" slicer** — drag a section plane through the 3D block → live 2D section appears beside it (teaches how 3D structure becomes the 2D microscope image; key NEET skill) |
| T3D-3 | **Plant organ TS/LS builder** — 3D cylinder of dicot/monocot root, stem, leaf; slice to get the textbook TS (vascular bundle types: radial, conjoint collateral open/closed, bicollateral as note) |
| T3D-4 | **Organ context link** — "where is this tissue?" opens the existing BodyParts3D atlas focused on the organ (e.g. skeletal muscle → biceps; cardiac → heart; bone → femur) |
| T3D-5 | **Layered organ explode** — e.g. small intestine wall or skin: epithelium → connective → muscle → nerve layers peel apart (shows "tissues build organs") |
| T3D-6 | **Muscle 3D zoom ladder** — muscle → fascicle → fibre → myofibril → sarcomere (link to Movement Theater / Kinesiology) |
| T3D-7 | **Neuron & neuroglia 3D** — myelin sheath, nodes of Ranvier, Schwann cell wrapping |
| T3D-8 | **Bone 3D** — compact bone osteon (Haversian canal, lamellae, lacunae, canaliculi) vs spongy bone trabeculae |
| T3D-9 | **Joints & skeleton** (new Class 9 Ch.3) — fibrous, cartilaginous, synovial joints (ball-and-socket, hinge, pivot, gliding) in 3D, reusing the atlas skeleton where possible |

### 4.3 Animations (≤ 30 s chapters, time-scale badge)
| ID | Animation |
|---|---|
| TA1 | Ciliated epithelium moving mucus (trachea) — metachronal wave |
| TA2 | Glandular secretion: exocrine via duct vs endocrine into blood |
| TA3 | Junctions: tight junction seal, desmosome anchoring under stretch, gap-junction ion passage |
| TA4 | Blood components flowing; RBC deformation in capillary (links Circulation) |
| TA5 | Sliding-filament contraction in skeletal muscle (actin/myosin, Ca²⁺, ATP) |
| TA6 | Cardiac muscle: impulse spreading through intercalated discs (functional syncytium) |
| TA7 | Smooth muscle peristalsis wave (links Digestion) |
| TA8 | Action potential: unmyelinated continuous vs myelinated saltatory conduction |
| TA9 | Bone remodelling / fracture repair overview (Advanced) |
| TA10 | Root apical meristem: cell division → elongation → differentiation zones |
| TA11 | Xylem water column rising; phloem sap flow (overview only; transport-mechanism details deleted from NEET) |
| TA12 | Stomata opening/closing via guard-cell turgor |
| TA13 | Tissue → organ → organ system zoom-out |

### 4.4 Simulations (replace the current generic one — fixes T1, T2)
| ID | Simulation | Science basis |
|---|---|---|
| TS1 | **Epithelial barrier**: compare simple vs stratified squamous under abrasion; tight-junction "leakiness" toggle — qualitative, labelled teaching model | OpenStax A&P Ch.4 |
| TS2 | **Connective tissue mechanics**: pull/compress tendon, ligament, cartilage, adipose → qualitative stress–strain curves (stiff vs elastic vs cushioning); values shown as sourced ranges only | Ross & Pawlina; primary literature |
| TS3 | **Muscle response**: stimulus strength (threshold) & frequency → twitch, summation, tetanus; skeletal vs cardiac (no tetanus, long refractory period) vs smooth (slow) | OpenStax A&P Ch.10 |
| TS4 | **Nerve conduction**: myelinated vs unmyelinated, axon diameter → conduction velocity (myelinated up to ~120 m/s, unmyelinated ~0.5–2 m/s; to be double-sourced) ; all-or-none threshold | OpenStax A&P Ch.12; BioNumbers |
| TS5 | **Plant support**: wilting vs turgid parenchyma; bending test collenchyma vs sclerenchyma | NCERT IX/XI Ch.6 |
| TS6 | **Virtual microscope**: objective 4×/10×/40×, focus, H&E-style procedural stain, field-of-view scale bar, "identify this tissue" mode | — |

### 4.5 Learning & assessment (inherits Cell §20 / B-features)
- **Histology identification trainer** (NEET image-style): procedural + licensed real slides (U-Mich CC BY-NC-SA), spaced repetition.
- **Comparison tables**: skeletal vs smooth vs cardiac; parenchyma vs collenchyma vs sclerenchyma; xylem vs phloem; dicot vs monocot root/stem/leaf; plant vs animal tissue; exocrine vs endocrine.
- **Predict → Observe → Explain** before each simulation.
- **Build-a-tissue puzzle** (place cells/fibres/matrix to make areolar tissue or a vascular bundle).
- **Diagnostic pre-test**, NEET drills (assertion–reason, match-the-column, "odd one out" — NCERT's own exercise style), mistake log, mnemonics, flashcards.
- **Bilingual glossary pop-overs**, concept map Cell → Tissue → Organ.

### 4.6 Cross-module integration
- Cell module: specialised cells (RBC, neuron, muscle fibre, guard cell) link both ways.
- Atlas: organ context (T3D-4). Movement Theater: muscle (T3D-6). Circulation: blood (TA4). Digestion: smooth muscle & intestinal epithelium. Nervous: neuron (TA8).
- Shared engines: `CellTimeline`, theme tokens, i18n, evidence ledger, quality tiers.

---

## 5. Scientific accuracy specifics for Tissues (extends Cell §21)
- **Never** show signal propagation in non-excitable tissue (T1).
- **No invented metrics** (T2); every displayed number from `tissueEvidence` with range + 2 sources.
- **Histology convention notes**: H&E colours (haematoxylin → nuclei blue/purple; eosin → cytoplasm/collagen pink) are stain artefacts; procedural views must match these conventions and say so.
- **2D section ≠ 3D shape** disclaimer; slicer demonstrates why the same tissue looks different by plane.
- Morphology checks per tissue (e.g. skeletal: multinucleate, peripheral nuclei, striated; cardiac: branched, 1–2 central nuclei, intercalated discs, striated; smooth: spindle, single central nucleus, non-striated; sieve tubes: no nucleus at maturity, companion cells; vessels: dead at maturity, lignified).
- **NCERT vs modern** register entries, e.g. classification of blood as connective tissue (kept, with note), "neuroglia make up more than half the volume of neural tissue" (NCERT statement — verify wording & source), striated/voluntary labelling exceptions (cardiac is striated but involuntary).
- Values to source in Phase 0: sarcomere length range, conduction velocities, epidermal turnover, RBC lifespan (~120 days), cartilage avascularity, bone composition fractions.

---

## 6. Proposed architecture (not implemented)
```
src/simulations/tissues/
  TissuesLab.jsx  TissueBlock3D.jsx  SectionSlicer.jsx  PlantOrganSection3D.jsx
  VirtualMicroscope.jsx  TissueSims/{Barrier,Mechanics,MuscleResponse,NerveConduction,PlantSupport}.jsx
src/lib/tissues/
  histologyShader.js  sectionGeometry.js  MuscleResponseModel.js  NerveConductionModel (reuse existing src/lib/NerveConductionModel.js)
src/data/tissues/
  animalTissues.js  plantTissues.js  tissueEvidence.js  tissueQuiz.js  tissueGlossary.js
scripts/tissue-evidence-qc.mjs  scripts/tissue-models-smoke.mjs
tests/browser/tissues-lab.spec.mjs
```
Note: `src/lib/NerveConductionModel.js` already exists (Nervous bay) → reuse, audit for accuracy, do not duplicate.

## 7. Phase plan (within the single-PR delivery)
0. Foundations (shared with Cell Phase 0) + Tissues fixes T1/T2 + new-NCERT coverage matrix + evidence ledger.
1. **Vertical slice: Skeletal muscle** — 3D block, slicer, zoom ladder to sarcomere, contraction animation, muscle-response sim, bilingual, both themes, quiz, evidence.
2. Animal catalogue + 3D blocks + slicer for all animal tissues.
3. Plant catalogue + plant organ TS builder (T3D-3) + plant animations.
4. Simulations TS1–TS6 + virtual microscope.
5. Organ context/explode (T3D-4/5), bone, neuron, joints (T3D-7/8/9).
6. Assessment & learning features; cross-module links.
7. QC, performance, accessibility, translation review.

## 8. Risks
| Risk | Mitigation |
|---|---|
| Procedural histology looks "fake" | calibrate against licensed U-Mich slides; owner/teacher visual review |
| New Class 9 book content not yet mapped | Phase 0 coverage matrix from official PDF before any content writing |
| Scope (38 tissues + plants + joints) | vertical slice, data-driven entries, reuse of 3D primitives |
| Overlap with Movement/Nervous/Circulation bays | link, don't duplicate; shared engines |

## 9. Open questions for the owner
1. Joints & skeleton (new Class 9 Ch.3): build here in Tissues, or keep in Atlas/Movement Theater and link?
2. Frog (XI Ch.7) — brief text card only, or omit?
3. Real histology slides (U-Mich, CC BY-NC-SA) inside the app alongside procedural views — yes/no?
4. Vertical slice = skeletal muscle — agree, or prefer another tissue (e.g. epithelium or xylem)?

---

## 10. Decisions round 9 (approved)
| # | Decision |
|---|---|
| TD1 | **Joints & skeleton built inside Tissues** (T3D-9), reusing the atlas skeleton meshes where possible; link out to Movement Theater. |
| TD2 | **Frog removed** entirely. |
| TD3 | **Real histology slides (U-Mich, CC BY-NC-SA) included** next to procedural views, with per-image attribution + licence. |
| TD4 | **Vertical slice = skeletal muscle** (approved). |
| TD5 | Cross-cutting **Interactivity & Engagement** and **Display Optimization** standards apply → `docs/LEARNING_BAYS_CROSS_CUTTING_PLAN.md`. |


## Class 10 layer
See `docs/CLASS_10_CURRICULUM_PLAN.md` (NCERT/CBSE + WBBSE Madhyamik coverage matrix and per-bay Class 10 features).
