# Cell Structure Module — Master Plan (DRAFT, discussion only)

> Status: **planning only — no code changes until the product owner approves.**
> Date: 2026-09-30 · Branch: `arena/01a0f3d4-humanbody`

---

## 0. Current state audit (what exists today)

| Area | File | Current state |
|---|---|---|
| Explore view | `src/simulations/CellLab.jsx` | 2D CSS "animal cell", 10 clickable structures, zoom 84–134 %, play toggles a Golgi vesicle animation |
| Organelle data | `src/data/modules.js → cellOrganelles` | 10 entries, one-line what/how/why each |
| Simulation | `src/lib/CellularDiffusionEngine.js` | 72 particles, Brownian step + drift, pore-size gate, water/glucose, temperature |
| Quiz | `quizSets.cell` | 3 questions |
| Objectives | `learningObjectives.cell` | 3 objectives |
| Source | `learningSources.cell` | OpenStax A&P 2e §3.2 (CC BY 4.0); "no reviewed 3D source" |

### 0.1 Scientific / technical findings (to be fixed first)

| # | Severity | Finding | Evidence |
|---|---|---|---|
| F1 | High | Temperature scaling formula is wrong: `sqrt(T/298.15 + 273.15/298.15)` where T is °C. Correct form is `(T+273.15)/298.15`, and Stokes–Einstein gives D ∝ T/η (linear, plus viscosity change), not √T. `step()` uses a different (√) form — two formulas disagree. | `CellularDiffusionEngine.js` getter vs `step()` |
| F2 | High | Gradient sign is inconsistent: getter `gradient = right − left`, snapshot `gradient = left − right`. | same file |
| F3 | High | Concentrations never change over time, so the UI promise "watch the gradient relax" is never true; flux is constant forever. Equilibrium never reached. | engine + CellLab copy |
| F4 | High | "Osmosis" is mislabelled: model moves *solute* particles; osmosis is net *water* movement toward higher solute concentration. Water particle = "concentration %" is ambiguous. | UI copy + engine |
| F5 | Medium | Glucose shown crossing via generic "pores". Physiologically glucose crosses via GLUT carriers (facilitated diffusion) or SGLT (secondary active); it does not cross the bare bilayer meaningfully. | engine |
| F6 | Medium | Missing core structures required by NCERT IX/XI & OpenStax: smooth ER, centrosome/centrioles, peroxisome, cytoskeleton, nuclear envelope + pores, chromatin, microvilli/cilia, vesicles/endosomes. | `cellOrganelles` |
| F7 | Medium | No scale honesty: ribosome (~25 nm) drawn near same size as lysosome (~0.5 µm). No scale bar. | CellLab CSS |
| F8 | Medium | No plant cell / prokaryote comparison (NCERT IX Ch.5, XI Ch.8 core requirement): cell wall, chloroplast, large central vacuole, plasmodesmata, nucleoid, 70S ribosome. | — |
| F9 | Low | "Vacuole" in animal cell visually as prominent as organelles; should be de-emphasised with a note. | — |
| F10 | Low | Quiz only 3 recall items; no misconception-targeted or application items. | `quizSets.cell` |

---

## 1. Certified scientific source base (all claims must map to one)

| Tier | Source | Use | License |
|---|---|---|---|
| A (primary text) | OpenStax *Biology 2e* Ch.4–5 (Cell Structure; Membranes) | organelle facts, membrane transport | CC BY 4.0 |
| A | OpenStax *Anatomy & Physiology 2e* Ch.3 (The Cellular Level) | human-cell context, transport, cycle | CC BY 4.0 |
| A (curriculum) | NCERT Class IX Ch.5 "The Fundamental Unit of Life"; Class XI Ch.8 "Cell: The Unit of Life", Ch.10 "Cell Cycle and Cell Division" | syllabus alignment | reference only (no copying) |
| A (reference) | Alberts et al., *Molecular Biology of the Cell* (7e); Lodish, *Molecular Cell Biology* | fact verification | reference only |
| B (quantitative) | BioNumbers (Harvard, Milo & Phillips *Cell Biology by the Numbers*) | sizes, counts, concentrations, rates | cite by BNID |
| B (images/3D) | Human Protein Atlas — Subcellular section | real microscopy per organelle | **CC BY-NC-ND 4.0** → link/cite only, no derivatives embedded |
| B | Allen Institute for Cell Science — Allen Cell Explorer (hiPSC 3D cells) | 3D organelle layout *reference* (proportions) | **non-commercial only** → use as visual reference, do not ship their data |
| B | RCSB PDB-101 (molecule of the month) | ribosome, ATP synthase, Na⁺/K⁺-ATPase, aquaporin, GLUT | PDB data CC0; illustrations CC BY 4.0 |
| B | Cell Image Library (ASCB) | EM images | per-image license |

Rule: every numeric value and caption gets an entry in a new `cellEvidence` ledger (mirroring `anatomyEvidence.js`) with source + page/BNID, and a QC script fails the build if any is missing.

### 1.1 Reference values to be used (to be re-verified against sources in Phase 0)

| Quantity | Typical value |
|---|---|
| Human cell diameter | ~10–30 µm (RBC ~7.5 µm) |
| Nucleus | ~5–10 µm; nuclear pore ~120 nm complex |
| Mitochondrion | ~0.5–1 µm wide, 1–several µm long |
| Ribosome (80S eukaryote / 70S prokaryote) | ~25–30 nm / ~20 nm |
| Plasma membrane thickness | ~7–10 nm |
| Lysosome lumen pH / cytosol pH | ~4.5–5.0 / ~7.2 |
| Na⁺ in/out | ~5–15 mM / ~145 mM |
| K⁺ in/out | ~140 mM / ~4–5 mM |
| Na⁺/K⁺-ATPase stoichiometry | 3 Na⁺ out, 2 K⁺ in per ATP |
| Resting membrane potential (neuron) | ~ −70 mV |

---

## 2. Vision

"From the whole cell down to a single molecule" — a **multi-scale, evidence-backed, interactive cell lab** for Class 9–12 (and an optional NEET/MBBS-foundation depth layer), working on phones and offline.

Pillars: **Scientific accuracy · Scale honesty · Process (not just labels) · Active learning · Accessibility/performance.**

---

## 3. Feature roadmap

### Phase 0 — Scientific correction & evidence ledger (foundation)
- Fix F1–F4 (temperature law, gradient sign, time-evolving concentrations with Fick's law so gradient truly relaxes to equilibrium; rename/split osmosis vs diffusion).
- Create `src/data/cellEvidence.js` + `scripts/cell-evidence-qc.mjs`.
- Unit smoke tests for the engine (equilibrium, conservation of particles, sign conventions).

### Phase 1 — Complete organelle catalog + depth levels
- ~20 structures: add smooth ER, centrosome/centrioles, peroxisome, cytoskeleton (microfilament / intermediate / microtubule), nuclear envelope & pores, chromatin, vesicles/endosomes, microvilli, cilia/flagella.
- Each entry: `what / how / why`, size, numbers, "found in" (animal/plant/prokaryote), clinical link (e.g., lysosomal storage disease, mitochondrial disease, cystic fibrosis CFTR), common misconception, source ID.
- Three depth levels toggle: **Class 9 · Class 11–12 · Advanced (NEET/MBBS foundation)**.

### Phase 2 — Cell-type comparator
- Animal ↔ Plant ↔ Prokaryote tabs with shared layout; differences highlighted (cell wall, chloroplast, central vacuole, plasmodesmata, nucleoid, plasmid, 70S ribosome, capsule).
- Human specialised cells gallery (RBC – no nucleus; neuron; muscle fibre – multinucleate; sperm – flagellum; intestinal epithelium – microvilli) linking to the Tissues module.

### Phase 3 — Interactive 3D cell
- Three.js (already in repo) procedural 3D cell: cut-away cross-section slider, orbit, tap-to-select, layer toggles.
- Layout informed by Allen Cell Explorer / HPA reference (not copied); labelled "conceptual model".
- Accessible 2D fallback (existing pattern), mobile geometry budget, reduced-motion respect.

### Phase 4 — Scale ladder ("Powers of ten")
- Continuous zoom: cell 20 µm → mitochondrion 1 µm → membrane 10 nm → protein channel ~5 nm → molecules; live scale bar and "what microscope can see this" (light vs electron).

### Phase 5 — Process simulations (the core upgrade)
1. **Membrane transport lab:** simple diffusion, facilitated (channel & carrier, saturation curve – Michaelis–Menten-like), osmosis with tonicity (RBC in hypo/iso/hypertonic → haemolysis/crenation; plant cell → plasmolysis/turgor), active transport (Na⁺/K⁺ pump with ATP counter), endo/exocytosis.
2. **Protein secretion pathway (endomembrane):** DNA → mRNA (nucleus) → ribosome on RER → Golgi → vesicle → exocytosis, step-through animation (example: insulin in β-cell).
3. **Cellular respiration overview:** glucose → glycolysis (cytoplasm) → Krebs (matrix) → ETC (inner membrane) with ATP ledger (textbook ~30–32 ATP, stated as approximate).
4. **Lysosome/autophagy** and **cell cycle & mitosis/meiosis** (links to Reproduction/Heredity).

### Phase 6 — Learning science
- Quiz bank 3 → 30+ items: recall, label-the-diagram, drag-and-drop, predict-then-observe, misconception targeting (e.g., "plant cells don't have mitochondria"), NCERT/NEET-style.
- Spaced review via existing `progress.js`; guided path steps for the cell bay.
- AI Tutor prompts grounded in the evidence ledger only.

### Phase 7 — Localisation, accessibility, performance, QC
- Bengali + English labels (optional Hindi).
- Screen-reader descriptions for every structure, keyboard navigation, contrast.
- Performance budgets for the new chunks; Playwright specs; screenshot visual review.

---

## 4. Proposed architecture (for approval — not implemented)

```
src/simulations/cell/
  CellLab.jsx               (shell: Explore / Compare / Transport / Pathways / Quiz)
  CellExplorer3D.jsx        (Three.js, lazy)
  CellExplorer2D.jsx        (accessible fallback, current view upgraded)
  CellComparator.jsx
  TransportLab.jsx
  SecretionPathway.jsx
  RespirationOverview.jsx
src/lib/cell/
  MembraneTransportEngine.js  (replaces CellularDiffusionEngine; diffusion, osmosis, carrier, pump)
  TonicityModel.js
  SecretionStateMachine.js
src/data/cell/
  organelles.js  cellTypes.js  cellEvidence.js  cellQuiz.js
scripts/cell-evidence-qc.mjs  scripts/membrane-transport-smoke.mjs
tests/browser/cell-lab.spec.mjs
```

## 5. Success metrics
- 100 % captions/numbers traced to Tier A/B sources (QC gate).
- Full NCERT IX Ch.5 + XI Ch.8 coverage matrix green.
- Engine tests: particle conservation, equilibrium reached, correct sign, tonicity outcomes.
- Mobile: first interaction < 2 s on mid-range Android; 3D chunk within performance budget.

## 6. Decisions (approved by product owner, round 2)
| # | Decision |
|---|---|
| D1 | Depth: **NEET level** is the ceiling (Class 9 → 11–12 → NEET layers). MBBS-only depth out of scope. |
| D2 | **3D is mandatory** for Explore (Three.js), with 2D accessible fallback only for WebGL failure / a11y. |
| D3 | **Language toggle** (English ⇄ বাংলা) in the Cell module; all strings via an i18n dictionary, scientific terms kept bilingual (e.g. "মাইটোকন্ড্রিয়া (Mitochondrion)"). |
| D4 | **All Phase 5 simulations** are in scope. |
| D5 | Cell types: **Human (animal) cell + Plant cell** only. Prokaryote reduced to a short NEET comparison table (no 3D). |

### 6.1 NEET syllabus coverage matrix (NCERT XI Unit 3)
- Ch.8 Cell: cell theory, prokaryotic vs eukaryotic (table only), plasma membrane (fluid mosaic, Singer–Nicolson 1972), cell wall, endomembrane system (ER, Golgi, lysosome, vacuole), mitochondria, plastids (chloroplast/chromoplast/leucoplast), ribosomes (80S/70S, sedimentation), cytoskeleton, cilia/flagella (9+2), centrosome/centrioles (9+0 cartwheel), nucleus (nuclear pore, chromatin, chromosome types by centromere position), microbodies.
- Ch.9 Biomolecules link: enzymes for pump/respiration.
- Ch.10 Cell cycle: interphase G1/S/G2, M phase, mitosis stages, meiosis I/II, significance.
- ~~Ch.11 Transport in plants~~ **DELETED from NEET since 2024 (NMC)**. Water potential / imbibition become *enrichment only*. Diffusion, osmosis, active transport are still taught via Ch.8 plasma membrane section and Class IX Ch.5 (plasmolysis).
- Ch.12 (rationalised numbering) Respiration in plants: glycolysis, Krebs, ETS, ATP accounting (NCERT count 38 ATP noted vs modern ~30–32).
- XII/Physiology link: Na⁺/K⁺ pump, RBC tonicity.

### 6.2 Final phase order
0 Scientific fixes + evidence ledger + i18n foundation → 1 organelle catalog (bilingual, 3 depth levels) → 3 3D cell (human + plant) → 2 comparator (human vs plant, prokaryote table) → 4 scale ladder → 5 all simulations (transport/osmosis & water potential, Na⁺/K⁺ pump, endo/exocytosis, secretion pathway, respiration, mitosis & meiosis) → 6 NEET quiz bank (50+ items, assertion–reason & match-the-column styles) → 7 a11y/perf/QC.

## 7. Remaining open questions
1. Language toggle scope: Cell module only, or app-wide shell too?
2. Start with Phase 0 (fixes) as first PR?
3. Commit/push + PR after each phase, or batch?

---

## 8. Deep exploration round 3 (research findings)

### 8.1 Syllabus facts (verified)
- NEET-UG (NMC) Unit 3 "Cell Structure and Function" explicitly lists: cell theory; prokaryotic & eukaryotic cell; plant & animal cell; cell envelope, membrane, wall; endomembrane system (ER, Golgi, lysosomes, vacuoles); mitochondria, ribosomes, plastids, microbodies; **cytoskeleton, cilia, flagella, centrioles (ultra-structure & function)**; nucleus (nuclear membrane, chromatin, nucleolus); biomolecules; enzymes; cell cycle, mitosis, meiosis.
- Rationalised NCERT XI numbering: Ch.8 Cell, Ch.9 Biomolecules, Ch.10 Cell Cycle, Ch.11 Photosynthesis, Ch.12 Respiration in Plants.
- Transport in Plants, Mineral Nutrition, Digestion & Absorption removed from NEET.
- Weightage: Cell (~5 %) + Cell Cycle (~4.5–9 %) + Biomolecules (~4 %) → one of the highest-yield Class XI clusters.

### 8.2 NCERT-level fact list to encode (each to be re-checked against the NCERT PDF page during Phase 0)
- Cell theory: Schleiden 1838, Schwann 1839, Virchow 1855 (*Omnis cellula-e cellula*). Robert Brown discovered nucleus (1831).
- Sizes: Mycoplasma ~0.3 µm (smallest), bacteria 3–5 µm, human RBC ~7 µm, ostrich egg largest single cell, nerve cell among longest.
- Membrane: fluid mosaic (Singer & Nicolson 1972); human RBC membrane ~52 % protein, ~40 % lipid; quasi-fluid nature.
- Ribosomes: 70S (50S+30S) prokaryote/organelles, 80S (60S+40S) eukaryote cytoplasm.
- Golgi: cis (forming) face and trans (maturing) face; glycoprotein/glycolipid formation.
- Mitochondria: double membrane, cristae, matrix with circular DNA, 70S ribosomes; divide by fission.
- Plastids: chloroplast, chromoplast, leucoplast (amyloplast, elaioplast, aleuroplast); thylakoid, grana, stroma lamellae.
- Cilia/flagella: 9+2 axoneme; basal body & centriole: 9 triplets, cartwheel, no central tubule (9+0).
- Chromosomes by centromere: metacentric, sub-metacentric, acrocentric, telocentric; satellite, NOR.
- Microbodies (peroxisome, glyoxysome); vacuole in plants: tonoplast, up to ~90 % of cell volume.
- Prokaryote: nucleoid, plasmid, mesosome, glycocalyx (slime layer/capsule), pili, fimbriae.
- Cell cycle: G1/S/G2/M, G0; human cell ~24 h cycle (NCERT); mitosis stages; meiosis I prophase substages (leptotene, zygotene, pachytene, diplotene, diakinesis), crossing over, chiasmata.

### 8.3 3D asset strategy (decision proposal)
| Option | Verdict |
|---|---|
| Allen Cell data | ✗ non-commercial terms; only a visual reference |
| Human Protein Atlas images | ✗ ND licence; external link only |
| SCoPE Cell Explorer (Gurdon) | ✗ CC BY-NC-SA; use as pedagogical benchmark only |
| NIH 3D Print Exchange cell models | ◐ per-model licence; already listed "candidate-not-approved" in `scripts/3d-source-candidates.json` |
| RCSB PDB (CC0 data) | ✓ molecule-scale inserts only (ribosome, ATP synthase, Na⁺/K⁺-ATPase, aquaporin, GLUT1) — low-poly surfaces pre-baked |
| **Procedural geometry authored in-repo (Three.js)** | ✓ **Recommended**: zero licence risk, small bundle, fully controllable, labelled "conceptual teaching model" consistent with `learningSources.cell.threeDStatus` |

Procedural techniques: InstancedMesh for ribosomes/vesicles (thousands at 1 draw call), `ExtrudeGeometry`/`TubeGeometry` for ER sheets & Golgi cisternae, capsule + inner folded shell for mitochondria cristae, clipping planes for the cut-away slider, instanced line segments for cytoskeleton. Target: ≤ 60 draw calls mobile, lazy chunk ≤ 90 kB gz, reuse existing three vendor chunk (no new 3D dependency).

### 8.4 Repo infrastructure findings
- `three` and `react` pinned as `latest` → risk; pin versions before 3D work.
- No i18n layer exists; `index.html` is `lang="en"`; progress in localStorage (`progress.js` schema v2). Language pref can live in the same settings store; set `document.documentElement.lang` on toggle.
- Bengali glyphs need an offline font (Noto Sans Bengali, OFL) — must be bundled/subset for the offline HTML build; watch the size budget.
- Existing patterns to reuse: `ReferenceObject3D` / `ErrorBoundary` / accessible fallback, `ConceptualSourceNote`, `anatomyEvidence.js` + QC script style, `reduced-motion` smoke, Playwright specs, performance budgets JSON.
- Tests touching `cell` today: `interaction-smoke`, `curriculum-smoke`, `reduced-motion-smoke`, `guided-path` spec, `phase13-source-provenance` spec — all must keep passing / be updated.

### 8.5 Misconceptions bank (drives quiz + UI callouts)
1. Plant cells have chloroplasts *instead of* mitochondria. 2. Cell wall = cell membrane. 3. Animal cells have no vacuoles at all. 4. Ribosomes are membrane-bound. 5. Mitochondria "make" energy (they convert it). 6. Cells are flat 2D shapes. 7. All cells have a nucleus (RBC, sieve tubes). 8. Diffusion stops at equilibrium (net flux stops; movement continues). 9. Osmosis = movement of solute. 10. Centrioles present in all plant cells (absent in higher plants).

---

## 9. Decisions round 4 (approved)
| # | Decision |
|---|---|
| D6 | App is **non-commercial** → non-commercial sources (Allen Cell, HPA, SCoPE) allowed as *cited visual references / external links*; still no embedding of ND content. Pure in-repo procedural 3D remains the asset strategy. |
| D7 | Bengali font bundle (+100–200 kB, Noto Sans Bengali, OFL, subset) **approved**. |
| D8 | Water potential / imbibition **removed** entirely. |
| D9 | Language toggle is **app-wide** (shell, home, atlas, all bays). Rollout: Cell module fully translated first; other bays fall back to English per-string until translated (no mixed broken UI). |
| D10 | **No PR per phase** — work accumulates on the session branch; PR only when the owner asks. |
| D11 | Owner priority: **3D first-class everywhere** in the Cell module. |

## 10. Additional feature candidates (round 4 exploration) — owner to accept/reject each

### 10.A 3D-centric (owner's suggestion)
| ID | Feature | Notes |
|---|---|---|
| A1 | **Cut-away 3D cell** (human + plant) with slice slider, X-ray mode, layer toggles | core |
| A2 | **Exploded view** — organelles float apart with leader-line labels, then reassemble | strong for labelling questions |
| A3 | **Fly-through camera tour** ("journey of a protein": nucleus → nuclear pore → RER → Golgi → vesicle → membrane) | doubles as the secretion simulation |
| A4 | **Organelle close-up 3D** — tap → zoom into organelle with internal 3D (cristae, thylakoid/grana stacks, nuclear pores, Golgi cis/trans, 9+2 axoneme, 9-triplet centriole) | NEET ultra-structure is explicitly examined |
| A5 | **Molecule scale inserts** from RCSB PDB (CC0): ribosome 70S/80S, ATP synthase rotating, Na⁺/K⁺-ATPase, aquaporin, GLUT1 | pre-baked low-poly glTF |
| A6 | **3D mitosis & meiosis** — chromosomes condensing, spindle, crossing-over at pachytene, chiasmata; scrub timeline | Cell cycle ~4.5–9 % NEET |
| A7 | **3D specialised human cells** — RBC (biconcave, no nucleus), neuron, skeletal muscle fibre, sperm, intestinal epithelial cell with microvilli; plant: guard cell, palisade cell, root hair | links Tissues module |
| A8 | **3D tonicity lab** — RBC swells/lyses, crenates; plant cell plasmolysis with retracting membrane from wall | |
| A9 | **AR mode** ("place the cell on your table") via WebXR immersive-ar | works in Chrome Android browser; **not** in Capacitor WebView or iOS Safari → optional progressive enhancement, hidden when unsupported |
| A10 | **Microscope mode** — same 3D cell rendered as light-microscope (blurry, stained) vs TEM (grayscale section) vs SEM (surface) looks | teaches resolution limits; shader post-process |
| A11 | **Build-a-cell puzzle** — drag organelles into an empty 3D cell; validates plant vs animal | gamified assessment |

### 10.B Learning & assessment
| ID | Feature |
|---|---|
| B1 | NEET mode: timed 10-question drills, assertion–reason, match-the-column, "which is NOT correct", previous-year-style items (written originally, not copied) |
| B2 | Diagram labelling test on the 3D model (hide labels, tap the right organelle) |
| B3 | Flashcards with spaced repetition (localStorage) |
| B4 | One-page bilingual revision sheet per topic (printable / PDF export) |
| B5 | Mistake log → recommends which 3D view to revisit |
| B6 | Mnemonics card set (e.g. meiosis prophase I substages) |

### 10.C Content depth
| ID | Feature |
|---|---|
| C1 | Biomolecules mini-bay (proteins, carbs, lipids, nucleic acids; enzyme classes EC 1–6) — NEET Unit 3 includes it |
| C2 | History timeline (Hooke 1665 → Leeuwenhoek → Brown → Schleiden/Schwann → Virchow → Singer–Nicolson) |
| C3 | "Clinical corner" (NEET-relevant only): sickle RBC shape, lysosomal storage, mitochondrial inheritance (maternal), cancer = loss of cell-cycle control |
| C4 | Size comparator ruler: atom → protein → ribosome → virus → bacterium → RBC → human hair |

### 10.D Platform
| ID | Feature |
|---|---|
| D-1 | Audio narration (Bangla + English) for each organelle and tours, offline-cached |
| D-2 | Teacher/projector mode: large labels, step controls, no quiz scoring |
| D-3 | Quality tiers for 3D (high/medium/low) auto-picked by `deviceProfile.js`, manual override |
| D-4 | Pin `three`/`react` versions; Bengali font subset in offline build |

### 10.E Explicitly out of scope (proposed)
Real patient/microscopy data hosting, multiplayer, account login, VR headsets, prokaryote 3D, water potential.

---

## 11. Decisions round 5 (approved)
| # | Decision |
|---|---|
| D12 | Features **A1–A8, A10, A11, all of B, C, D** are IN scope. |
| D13 | **A9 AR mode removed.** |
| D14 | **Biomolecules (C1) lives inside the Cell module** (as a tab), not a separate bay. |
| D15 | **No audio narration** (D-1 removed). Existing UI click sounds unchanged. |
| D16 | **Animation is a first-class pillar** (owner suggestion) — see §12. |

## 12. Animation master plan

### 12.1 Principles (scientific honesty in motion)
1. **Time-scale badge always visible** — e.g. "≈ 1 000× slowed" / "mitosis compressed: 1 h → 40 s". Never imply real speed silently.
2. **Mechanism over decoration** — every moving thing must represent a real process (no random "floating sparkles").
3. **Crowding disclaimer** — real cytoplasm is extremely crowded; the model is deliberately sparse for clarity (stated once in info panel).
4. **Reduced-motion** — every animation has a stepper (prev/next keyframe) equivalent; `prefers-reduced-motion` and app setting respected (existing smoke test extended).
5. **Pausable / scrubbable** — one shared timeline UI (play, pause, step, speed 0.25–2×, scrub bar, chapter markers).
6. **Battery & perf** — render on demand when paused, pause on tab hidden (existing visibility pattern), quality tier aware.

### 12.2 Reference rates for the animation timing (BioNumbers)
| Process | Real value | Source |
|---|---|---|
| Eukaryotic translation | ~1–8 aa/s per ribosome (≈6 aa/s typical) | BNID 107783, 107952 |
| Prokaryotic translation | ~20 aa/s | BioNumbers book |
| Kinesin-1 walking | ~800 nm/s in vitro, 8 nm steps, 1 ATP/step | BNID 105241, 101506 |
| ATP synthase | rotary; 3 ATP per 360 deg turn (120 deg steps); ~100-150 rev/s typical, higher in isolated F1 assays (E. coli F1 avg ~164 rev/s) | Ishmukhametov et al. 2010 (PMC3009931); review arXiv 2506.23439 |
| Human cell cycle | ~24 h; M phase ~1 h (NCERT) | NCERT XI Ch.10 |

### 12.3 Animation catalogue
| ID | Animation | Type | Linked feature |
|---|---|---|---|
| AN1 | Ambient "living cell": cytoplasmic streaming (plant), vesicle traffic on microtubules, mitochondria gently shifting, membrane undulation | idle loop, low-cost | A1 |
| AN2 | Exploded ⇄ assembled transition with label leader lines | tween | A2 |
| AN3 | Protein journey: transcription in nucleus → mRNA exits nuclear pore → ribosome docks on RER → polypeptide into lumen → transport vesicle → Golgi cis→trans → secretory vesicle → exocytosis | scripted camera + chapters | A3 |
| AN4 | Kinesin "walking" a vesicle along a microtubule (hand-over-hand) | molecular close-up | A4/A5 |
| AN5 | ATP synthase rotor spinning with H⁺ flow; ATP counter | molecular close-up | A5 |
| AN6 | Ribosome translation: tRNA entry A→P→E sites, chain growing | molecular close-up | A5 |
| AN7 | Na⁺/K⁺ pump cycle: 3 Na⁺ out, 2 K⁺ in, ATP → ADP + Pi, conformational change | molecular close-up | Transport lab |
| AN8 | Diffusion & osmosis particles (fixed engine), equilibrium with continued random motion | 2D/3D particles | Transport lab |
| AN9 | Facilitated diffusion: channel opening, GLUT carrier rocking, saturation | molecular | Transport lab |
| AN10 | Endocytosis / phagocytosis / exocytosis membrane budding | soft-body tween | Transport lab |
| AN11 | Lysosome fusing with phagosome; autophagy of a worn-out mitochondrion | tween | Lysosome card |
| AN12 | Cilia beat (power + recovery stroke) and flagellum (sperm) undulation | procedural | A4/A7 |
| AN13 | Cell cycle: G1 growth → S DNA replication (chromatids double) → G2 → mitosis stages → cytokinesis (animal furrow vs plant cell plate) | timeline + chapters | A6 |
| AN14 | Meiosis I & II incl. prophase I substages, synapsis, crossing-over, chiasma terminalisation | timeline + chapters | A6 |
| AN15 | Tonicity: RBC swell/lyse, crenate; plant cell plasmolysis / deplasmolysis | morph targets | A8 |
| AN16 | Respiration overview: glycolysis in cytosol → pyruvate into mitochondrion → Krebs → ETS proton pumping → ATP synthase | chapters + ATP ledger | Respiration |
| AN17 | Photosynthesis teaser in chloroplast (light → thylakoid, Calvin in stroma) — overview only, links NEET Ch.11 | chapters | Plant cell |
| AN18 | Microscope mode transition (LM → TEM → SEM look) | shader cross-fade | A10 |
| AN19 | Build-a-cell: snap + glow feedback, wrong-placement shake | micro-interaction | A11 |
| AN20 | Scale ladder zoom (powers of ten) with smooth LOD swap | camera | Scale ladder |
| AN21 | UI micro-animations: card reveal, quiz feedback, language switch cross-fade | CSS | all |

### 12.4 Technical approach
- One `CellTimeline` engine (extend pattern of existing `TimelineDirector.js`) with keyframes, chapters, easing, and a pure-function `stateAt(t)` → deterministic, testable in Node, scrubbable.
- Three.js: `AnimationMixer` only where morph targets help (tonicity, budding); otherwise procedural transforms per frame; InstancedMesh for particles/ribosomes; GPU-cheap vertex-shader wobble for membranes.
- No new animation library (no GSAP licence/bundle) — tweens are a ~2 kB in-house utility.
- Chapter captions bilingual; each chapter carries a source ID from `cellEvidence`.
- Tests: Node smoke for `stateAt` monotonicity & chapter coverage; Playwright check that pause really stops rAF and reduced-motion shows stepper.

## 13. Final phase order (revised)
0. Foundations: scientific fixes, evidence ledger, pin versions, **app-wide i18n + Bengali font**, quality tiers, `CellTimeline` engine.
1. Bilingual organelle catalogue (3 depth levels) + misconceptions.
2. 3D core: cut-away human & plant cell (A1), exploded view (A2), ambient animation (AN1–AN2).
3. Organelle close-ups & molecule inserts (A4, A5, AN4–AN7).
4. Protein journey tour (A3, AN3) + Transport lab (AN8–AN11, tonicity A8/AN15).
5. Cell cycle 3D (A6, AN13–AN14).
6. Specialised cells (A7, AN12), microscope mode (A10), scale ladder (AN20).
7. Respiration & photosynthesis overviews (AN16–AN17); Biomolecules tab (C1) + history, clinical corner, size ruler (C2–C4).
8. Assessment: NEET mode, 3D labelling test, build-a-cell (A11), flashcards SRS, mistake log, mnemonics, revision sheet (B1–B6).
9. Teacher/projector mode, full a11y/perf/QC pass, translate remaining bays.

---

## 14. Decisions round 6 (approved)
| # | Decision |
|---|---|
| D17 | Each animation chapter **≤ 30 s** at 1× (longer processes split into chapters). |
| D18 | **App-wide theme toggle** in Settings: `Auto (follows device) · Light · Dark`. Default = Auto (`prefers-color-scheme`). 3D scenes, canvases and diagrams adapt too. |
| D19 | Delivery strategy chosen by engineering; **one single PR** at the end (no multiple PRs). |
| D20 | Language toggle lives in **Settings** (alongside theme and reduce-animations). |

## 15. Theme system plan (round 6 exploration)

### 15.1 Repo findings
- `:root` defines ~14 tokens (`--bg`, `--panel`, `--text`, `--cyan`…), but `styles.css` contains **~983 hard-coded hex colours and ~588 rgba() values vs only ~212 `var(--…)` uses** → a light theme is impossible without a token refactor.
- Colours are also hard-coded in JS: canvas engines (e.g. `CellularDiffusionEngine.draw`), 8 simulation bays, `InfoPanel`, `KinesiologyTheater`, Three.js materials in the atlas.
- Settings modal already exists in `App.jsx` (Reduce animations row) → theme + language rows slot in there.
- Fonts `Manrope` / `DM Mono` have no Bengali glyphs → `--sans` stack must append `'Noto Sans Bengali'`.

### 15.2 Design
1. **Semantic design tokens** (`--surface-0..3`, `--text-primary/secondary/faint`, `--border`, `--accent-*` per module, `--organelle-*` per structure, `--state-success/warn/error`, `--canvas-bg`, `--scene-bg`, `--scene-fog`). Two token sets: `[data-theme="dark"]`, `[data-theme="light"]`.
2. **Resolution:** setting `auto` → listen to `matchMedia('(prefers-color-scheme: dark)')` change events → set `document.documentElement.dataset.theme`; also update `<meta name="theme-color">` and `color-scheme` CSS property (native form controls/scrollbars follow).
3. **No flash on load:** tiny inline script in `index.html` reads the stored preference before React mounts.
4. **JS/Canvas/3D bridge:** `themeTokens.js` reads computed CSS variables once per theme change and emits an event; engines' `draw()` and Three.js materials/background/lights subscribe (no hard-coded colours in engines).
5. **Organelle colour palette** chosen per theme with **WCAG AA contrast** for labels and **colour-blind-safe** distinctions (shape/pattern + label, never colour alone).
6. **3D lighting presets:** dark = "lab" rim-lit; light = "textbook" soft studio light. Same geometry.
7. **Microscope mode** colours (LM stain, TEM grey) stay fixed regardless of theme (scientific convention), noted in UI.
8. **Migration strategy:** codemod/script to list every literal colour → map to tokens; Cell module + shell first; remaining bays migrated in Phase 9. A QC script (`theme-token-qc.mjs`) fails on new raw hex colours in migrated files.
9. **Tests:** Playwright screenshots of key screens in both themes; contrast check via axe-core rules; `prefers-color-scheme` emulation.

## 16. Settings panel (target)
`Language: English | বাংলা` · `Theme: Auto | Light | Dark` · `Reduce animations` · `3D quality: Auto | High | Medium | Low` · `Depth level: Class 9 | Class 11–12 | NEET` · existing offline-download and sound rows. All persisted in localStorage (settings key versioned, migration from current progress schema v2).

## 17. Delivery strategy (engineering choice, single PR)
- Work on branch `arena/01a0f3d4-humanbody` in **milestone commits** (one per phase), each passing `npm run verify` so the branch is always shippable; **one PR** opened only when the owner approves the result.
- **Milestone M1 (first usable cut, reviewed by owner before continuing):** Phase 0 (fixes, i18n, theme tokens, settings, timeline engine) + Phase 1 (catalogue) + Phase 2 (3D cut-away + exploded + ambient animation). Owner demo on live preview.
- **M2:** Phases 3–5 (close-ups, protein journey, transport, cell cycle). **M3:** Phases 6–8. **M4:** Phase 9 polish + PR.
- Rationale: foundations (i18n + theme tokens) must come first; retrofitting them after building 3D/animation would double the work.

## 18. Risks & mitigations
| Risk | Mitigation |
|---|---|
| Theme refactor touches the whole CSS (regressions) | token codemod + screenshot diffs per bay; dark theme must stay pixel-identical first |
| Bundle growth (3D + font + i18n) | lazy chunks per tab, font subset, perf-budget gate |
| Translation accuracy of scientific Bengali | glossary file (English term ↔ Bengali term as used in WBCHSE/WBBSE textbooks) reviewed by owner/teacher |
| Low-end phones | quality tiers, instancing, render-on-demand |
| Scope creep | this document is the contract; new ideas go to a backlog section |

---

## 19. Decisions round 7 (approved)
| # | Decision |
|---|---|
| D21 | Light theme follows **modern design standards**: neutral cool-grey surfaces (not pure #FFF everywhere), layered elevation, palette defined in **OKLCH** for perceptually even light/dark pairs, WCAG 2.2 AA (APCA checked for small text), Material 3 / Apple HIG-style spacing & motion tokens. |
| D22 | **Formal standard Bengali only** — no Banglish/transliteration-only terms. Use the terminology of WBBSE/WBCHSE Bengali-medium textbooks; English technical term shown in parentheses on first use per screen, e.g. "মাইটোকনড্রিয়া (Mitochondrion)". A reviewed glossary file is the single source of truth. |
| D23 | Default depth level = **Class 9**; user can raise to Class 11–12 / NEET in Settings. |

## 20. Further improvement proposals (round 7) — owner to accept/reject

### 20.1 Delivery: "vertical slice" before scaling (recommended change to §17)
Before building all of M1, build **one organelle end-to-end** (Mitochondrion): 3D close-up + cristae animation + ATP synthase insert + bilingual text + both themes + 3 depth levels + quiz items + evidence entries + tests. Owner reviews the slice on live preview → agree the look, tone, Bengali quality, and performance → then replicate the pattern across all organelles. Prevents rework across ~20 structures.

### 20.2 Learning science
- **Diagnostic pre-test (5 questions)** → suggests starting depth and highlights weak areas.
- **Predict → Observe → Explain** prompts before each simulation ("What will happen to the RBC in salt water?").
- **Concept map view**: organelles linked by processes (nucleus → ribosome → RER → Golgi …); tap a link to play its animation.
- **Compare tables** generated from data (animal vs plant, mitosis vs meiosis, RER vs SER) — NEET favourite format.
- **Glossary pop-overs**: tap any technical term → bilingual definition + 3D thumbnail.
- **Mastery tracking per objective** (not just per quiz) in local progress; no login, no server.
- **NEET topic tags** on every card/question so students can filter "high-yield".

### 20.3 Content quality governance
- **Expert review gate**: each content batch marked `draft → reviewed (teacher) → approved`; UI shows nothing in `draft` in production.
- **Bengali glossary review** by a Bengali-medium biology teacher.
- **Errata button** ("report an error") storing a local report the user can copy/share — no backend.

### 20.4 Bengali typography & numbers
- Noto Sans Bengali (OFL) subset, line-height tuned for conjuncts (যুক্তাক্ষর), no letter-spacing on Bengali text.
- **Numerals**: show Bengali digits (০–৯) in prose; keep SI units & scientific notation (µm, nm, ATP, H⁺) in Latin per textbook convention. (owner to confirm)

### 20.5 Accessibility (modern)
- WCAG 2.2 AA, focus-visible everywhere, target size ≥ 24 px, keyboard path through 3D (Tab cycles organelles, Enter zooms).
- Screen-reader "scene description" for each 3D view; captions for each animation chapter (text, not audio).
- Optional **dyslexia-friendly spacing** and **text size** slider in Settings.

### 20.6 Engineering quality
- Data-driven content (JSON/JS schema validated) so adding an organelle requires no new UI code.
- Visual regression screenshots (both themes × both languages × phone/desktop).
- Performance gate per tab; Lighthouse PWA/a11y scores tracked in docs.
- Pin dependencies; remove scratch files (`scripts/tmp-*.mjs`) noted during audit.

### 20.7 Classroom & sharing (offline-friendly)
- Teacher mode (already planned) + **deep links** (`#cell/mitochondrion/close-up`) so teachers can share an exact view.
- **Export PNG** of current 3D view with labels for notes/worksheets.

---

## 21. Scientific Accuracy Framework (owner requirement D24 — applies to EVERYTHING)

> Every word, number, shape, colour convention, proportion, motion and quiz answer in the Cell module must be traceable, checked, and honestly labelled.

### 21.1 Source hierarchy (highest wins)
1. **Syllabus authority** for *what* is taught and exam-expected wording: NCERT (IX Ch.5; XI Ch.8, 9, 10, 12), NMC NEET-UG syllabus, WBBSE/WBCHSE Bengali textbooks for terminology.
2. **Standard references** for *correctness*: Alberts *MBoC*, Lodish *MCB*, OpenStax Biology 2e & A&P 2e, peer-reviewed primary papers (PubMed/PMC).
3. **Curated quantitative databases**: BioNumbers (BNID), RCSB PDB (structure IDs), UniProt.
4. **Not allowed as a source**: blogs, coaching notes, AI-generated text. Wikipedia may only be used to *find* a primary source.

### 21.2 Claim-level evidence
- Every displayed fact = a **claim object** in `cellEvidence` with: `id`, text (en/bn), value + unit + **range**, organism/cell type, source(s), page/BNID/DOI, depth level, reviewer, review date, status.
- **Two-source rule** for every numeric value and every fact used as a quiz answer.
- Numbers shown as **ranges or "≈"** where biology varies; organism stated when value is organism-specific (E. coli vs human).

### 21.3 "Textbook vs modern science" conflict policy
When NCERT simplifies or differs from current research, show **both, clearly labelled**; the NCERT form stays the exam answer.

| Topic | NCERT / exam form | Modern understanding |
|---|---|---|
| ATP per glucose | 38 ATP (balance sheet) | ≈30–32 ATP |
| Membrane model | Fluid mosaic (1972) | + lipid rafts, cytoskeletal corrals (Advanced note) |
| Ribosome S values | 50S + 30S → 70S | S values are not additive — explained |
| Plant lysosomes | vacuole has digestive role | lytic vacuoles (note) |

Stored in a `conflicts` register; QC fails if a conflicting claim lacks its label.

### 21.4 Visual & 3D accuracy rules
- **Proportions** within stated ranges relative to the cell; anything enlarged for visibility gets an "enlarged ×N" tag.
- **Real-scale toggle**: one view where everything is true to scale (ribosomes become dots) vs "teaching scale".
- **Membrane topology**: double membrane — nucleus, mitochondrion, chloroplast; single — ER, Golgi, lysosome, vacuole (tonoplast), peroxisome; none — ribosome, centriole, nucleolus. RER continuous with outer nuclear membrane; Golgi cis face toward ER; nuclear pores shown; centrioles as perpendicular pair, absent in higher-plant cells; cilia 9+2, basal body/centriole 9 triplets.
- **Plant cell**: central vacuole up to ~90 % volume, cell wall + middle lamella, plasmodesmata, chloroplast grana/thylakoids, no centrioles.
- **Human cell**: no wall, small/temporary vacuoles, centrosome present.
- **Colour is a teaching convention** (stated in UI); microscope mode shows realistic LM/TEM appearance.

### 21.5 Animation accuracy rules
- Every step is a documented mechanism step with a source; event order reviewed (tRNA A→P→E; Na⁺/K⁺ 3 out : 2 in : 1 ATP; prophase I substage order).
- **Time-scale badge** mandatory; molecular speeds from §12.2.
- No teleporting: molecules move by diffusion or motor proteins; vesicles ride microtubules.
- Direction correct: H⁺ flows into the matrix through ATP synthase; glucose enters via GLUT down its gradient.
- Simplifications listed per animation ("crowding reduced", "one of many ribosomes shown").

### 21.6 Simulation / model accuracy
- Equations displayed with assumptions (Fick's first law; Stokes–Einstein D ∝ T/η). Osmosis explained as "water moves toward the side with more dissolved particles" (water potential removed per D8).
- Unit tests assert invariants: particle conservation, equilibrium reached, correct direction/sign, carrier saturation, pump stoichiometry.
- Parameters clamped to physiological ranges; outside values labelled "hypothetical".

### 21.7 Language accuracy
- Glossary: English term, Bengali textbook term, bilingual definition, source textbook & page.
- Bengali is translated from the *reviewed* English claim and back-checked; no unreviewed machine translation ships.

### 21.8 Quiz accuracy
- Each item: sourced answer, explanation, why each distractor is wrong, level, NEET tag.
- No ambiguous "always/never"; where NCERT and modern differ, say "according to NCERT" or avoid.

### 21.9 Review workflow & gates
1. Draft with sources → 2. automated QC → 3. subject-expert review → 4. language review → 5. approved.
- Production shows only `approved` claims. `npm run verify` gains `cell-evidence-qc`, `cell-conflict-qc`, `cell-glossary-qc`, `cell-animation-spec-qc`, engine invariant tests.
- User-visible **"About this model"** panel listing known simplifications.
- **Errata log** (version, date, change, reason).

### 21.10 Accuracy corrections already made in this plan
- HPA licence corrected to CC BY-NC-ND.
- Transport in Plants removed as NEET content (deleted since 2024).
- ATP synthase rate now sourced: ~100–150 rev/s typical, 3 ATP per turn.
- Engine bugs F1–F4 are Phase 0 blockers.

---

## 22. Decisions round 8 (approved)
| # | Decision |
|---|---|
| D25 | **All proposals in §20 accepted** (vertical slice first, learning-science features, governance, typography, accessibility, engineering, classroom). |
| D26 | **Numerals always in English digits (0–9)** in both languages, including inside Bengali text; units/symbols in Latin (µm, nm, ATP, H⁺). Overrides §20.4 Bengali-digit proposal. |
| D27 | Cell master plan is considered **complete for review**; Tissues master plan continues in `docs/TISSUES_MASTERPLAN.md`, inheriting all cross-cutting decisions (D6–D26). |
| C-UPD-1 | **Action item (found during Tissues research):** Class 9 now uses the new NCERT *Exploration* textbook (2026-27, NCF-SE 2023). Cell content = **Ch.2 "Cell: The Building Block of Life"** (old IX Ch.5 references must be re-pointed; coverage matrix rebuilt from the official PDF in Phase 0). |


## Class 10 layer
See `docs/CLASS_10_CURRICULUM_PLAN.md` (NCERT/CBSE + WBBSE Madhyamik coverage matrix and per-bay Class 10 features).
