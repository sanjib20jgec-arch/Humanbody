# Learning Bays — Cross-Cutting Master Plan (DRAFT, discussion only)

> Applies to **every learning bay**: Cell, Tissues, Digestion, Circulation, Brain & Nerves, Respiration, Excretion, Reproduction, Heredity. Movement Theater is excluded from this planning round by owner decision.
> All decisions D6–D27 (Cell plan) and TD1–TD5 (Tissues plan) are inherited. No code until owner approval.

## Index of bay master plans
| Bay | Document |
|---|---|
| Cell Structure | `docs/CELL_STRUCTURE_MASTERPLAN.md` |
| Tissues | `docs/TISSUES_MASTERPLAN.md` |
| Digestion | `docs/bays/DIGESTION_MASTERPLAN.md` |
| Circulation | `docs/bays/CIRCULATION_MASTERPLAN.md` |
| Brain & Nerves | `docs/bays/NERVOUS_MASTERPLAN.md` |
| Respiration | `docs/bays/RESPIRATION_MASTERPLAN.md` |
| Excretion | `docs/bays/EXCRETION_MASTERPLAN.md` |
| Reproduction | `docs/bays/REPRODUCTION_MASTERPLAN.md` |
| Heredity | `docs/bays/HEREDITY_MASTERPLAN.md` |
| **Class 10 layer (all bays)** | `docs/CLASS_10_CURRICULUM_PLAN.md` |

---

## A. Syllabus reality check (verified 2026-10-01) — affects several bays

| Finding | Impact |
|---|---|
| New NCERT Class 9 *Exploration* (2026-27): Ch.2 Cell, Ch.3 Tissues in Action, Ch.11 Reproduction: How Life Continues | Class 9 default level must follow this book |
| NEET-UG (NMC) **deleted**: Digestion & Absorption (whole chapter); Neural Control — reflex action & reflex arc, sensory reception, sense organs, eye & ear; Transport in Plants; secondary growth | Digestion bay & reflex content become **Class 10 / general**, not NEET; NEET layer of Nervous must focus on impulse generation, synapse, CNS/PNS/visceral NS |
| Class 10 still NCERT (Life Processes; Control & Coordination; How do Organisms Reproduce; Heredity) — a new NCF-aligned Class 10 book may follow | Phase 0 must re-check the current Class 10 book before writing content |

Depth levels per bay therefore become: **Class 9 → Class 10 → Class 11–12 → NEET** (a bay hides a level when the syllabus has nothing for it; e.g. Digestion has no NEET layer).

---

## B. Interactivity & Engagement Standard (owner requirement)

### B.1 Principles
1. **Learn by doing** — every screen offers a manipulation (rotate, slice, drag, tune, predict) within one tap; no "read-only wall of text" screens.
2. **Immediate, meaningful feedback** — every action changes something visible and explains *why* in one line.
3. **Curiosity hooks** — each bay opens with a question/mystery ("Why doesn't your stomach digest itself?") answered by exploring.
4. **Story missions** — short narrative quests (e.g. "Travel as a red blood cell", "Follow a glucose molecule", "Escort an oxygen molecule") built on the bay's 3D + animation engine.
5. **Predict → Observe → Explain** before every simulation; prediction stored and compared.
6. **Sandbox mode** — free experimentation after the guided version (all sliders unlocked, "what if" scenarios labelled hypothetical).
7. **Challenge mode** — timed or target-based tasks ("make urine more concentrated", "keep blood pressure in range during exercise").
8. **Progressive disclosure** — Class 9 view is simple; deeper detail appears only when level is raised or user taps "Go deeper".
9. **Juicy micro-interactions** — snap, glow, subtle easing, optional haptic tick on Android (`navigator.vibrate`, off with reduced motion); existing subtle sounds kept.
10. **Ethical gamification** — badges for mastery & exploration (not time spent), streaks optional and forgiving, no ads/dark patterns, no leaderboards by default (privacy, no login).
11. **Every interaction scientifically honest** — game mechanics never override physiology (Accuracy Framework §21).

### B.2 Shared interaction toolkit (built once, used by all bays)
| Component | Purpose |
|---|---|
| `Scene3D` shell | orbit/zoom/pan, tap-select, cut-away, exploded view, labels, quality tiers, theme-aware lighting |
| `SectionSlicer` | drag a plane through any 3D model → live 2D section |
| `CellTimeline` / `BayTimeline` | chapters ≤ 30 s, scrub, step, speed, time-scale badge |
| `PredictPrompt` | predict → observe → explain cards |
| `MissionRunner` | story missions with checkpoints |
| `CompareTable` | data-generated comparison tables |
| `LabelQuiz3D` | hide labels, tap the right structure |
| `BuildPuzzle` | drag-and-snap assembly puzzles |
| `GlossaryPopover` | bilingual definitions with thumbnail |
| `MasteryTracker` | per-objective mastery, spaced repetition |

---

## C. Display Optimization Standard (owner requirement)

### C.1 Current state (audit)
- `src/lib/deviceProfile.js` already classifies phone / tablet / desktop / TV and capability tier; `viewport-smoke.mjs` checks landscape-handset, coarse-tablet, ultrawide (1800/2400 px) passes; ~84 `@media` blocks with mixed breakpoints (560/767/820/900 px) written in two styles.
- Device-matrix screenshots exist (iPhone 15 Pro, Galaxy S24 Ultra, iPad Pro 13, MacBook 16, ultrawide 2560, Android TV 1080p, phone landscape).

### C.2 Target device matrix
| Class | Examples | Key rules |
|---|---|---|
| Small phone | 320–375 px wide | single column, bottom sheet info panel, 44 px targets, 3D canvas ≥ 55 % of height |
| Large phone | 390–430 px | same + side-swipe between Explore/Simulate/Quiz |
| Phone landscape | ≤ 900 px tall-limited | 3D left, controls right; hide hero/objective strip |
| Foldable | Galaxy Fold/Flip, `screen-spanning`/Viewport Segments API | two-pane: 3D on one segment, info on the other |
| Tablet portrait/landscape | 768–1180 px | split view, info panel docked |
| Laptop/desktop | 1280–1920 px | three-zone layout (nav · stage · panel) |
| Ultrawide/4K | ≥ 2400 px | max content width, larger 3D, no stretched text lines (≤ 75 ch) |
| TV / projector | 1080p/4K, D-pad | Teacher mode, 10-foot UI, focus rings, D-pad navigation, large type |

### C.3 Rules
1. **One breakpoint system** (tokens: `--bp-sm 480`, `--bp-md 768`, `--bp-lg 1180`, `--bp-xl 1800`, `--bp-xxl 2400`), migrate existing ad-hoc queries; **container queries** for components (info panel, compare tables) so they adapt to their slot, not the window.
2. **Dynamic viewport units** (`dvh/svh`), safe-area insets (notches, gesture bars), no layout jump when mobile browser bars hide.
3. **Fluid typography** with `clamp()`; Bengali line-height tuned; user text-size slider (Settings) respected everywhere; layouts tested at 200 % text zoom.
4. **3D canvas**: resize observer, DPR cap per tier (e.g. phone ≤ 2, low-power ≤ 1.25), render-on-demand when idle, pause when hidden/offscreen, context-loss recovery (existing Phase 35 pattern).
5. **Orientation & input**: touch (pinch, two-finger pan), mouse/trackpad, keyboard, stylus, D-pad; hover-only affordances forbidden.
6. **Theme × display**: both themes verified on OLED (true-black avoidance for smearing → near-black surfaces), sunlight readability (light theme contrast), projector washed-out mode (Teacher mode high-contrast).
7. **Performance budgets per class** (existing `performance-budgets.json` extended per bay chunk); LCP < 2.5 s on mid-range Android, INP < 200 ms, CLS < 0.1.
8. **Print / export**: revision sheets and PNG exports have dedicated print CSS (A4, both languages).
9. **Verification**: device-matrix screenshot suite × 2 themes × 2 languages for each bay; viewport smoke extended; Playwright emulation for foldables and TV; manual check on a real low-end Android.

---

## D. Shared delivery order (single PR, milestone commits)
1. **Foundation milestone** (shared by all bays): accuracy framework tooling, i18n, theme tokens, breakpoint system, Settings, shared interaction toolkit, timeline engine.
2. **Vertical slices**: Cell (mitochondrion), Tissues (skeletal muscle) → owner review on live preview.
3. Bays in guided-path order: Cell → Tissues → Digestion → Circulation → Brain & Nerves → Respiration → Excretion → Reproduction → Heredity, each finishing with its own QC gate.
4. Final cross-bay polish, translation review, device matrix, single PR.

---

## E. Exploration round 10 (2026-10-01)

### E.1 Baseline health (measured, no code changed)
- `npm ci` + full `npm run verify` → **passes (exit 0)** on the current branch. Good starting point: every future milestone must keep it green.
- Production bundle sizes (minified, uncompressed): `three.module` **737 kB** (budget `threeVendorKB` 800 → only ~60 kB headroom for all new 3D work → new 3D must reuse three core, avoid extra loaders/addons, tree-shake); main `index` **305 kB**; single CSS file **227 kB** (theme-token refactor is also a chance to split CSS per bay); `KinesiologyLab` 297 kB; bay chunks 15–36 kB.
- Offline single-file bundle: **46 MB** (atlas embedded). Bengali font + new bay assets must be measured against it; propose an offline-size budget line in `performance-budgets.json`.
- Running `verify` regenerates several `docs/reports/*` files and the offline HTML → future commits must decide deliberately whether to include regenerated reports (reverted this round to keep the tree clean).

### E.2 Syllabus confirmation
- **Class 10 for 2026-27 is still the rationalised NCF-2005 NCERT book (reprint 2026-27)**: Ch.5 Life Processes, Ch.6 Control & Coordination, Ch.7 How do Organisms Reproduce?, Ch.8 **Heredity** (evolution part rationalised out). Class 9 is the new *Exploration* book. Content mapping: Class 9 → Exploration; Class 10 → current NCERT; XI/XII → rationalised NCERT; NEET → NMC list.

### E.3 Benchmark & reuse: PhET (University of Colorado)
- PhET HTML5 simulations are **CC BY 4.0** (e.g. Neuron, Membrane Channels, Gene Expression Essentials, Natural Selection). Use as **interaction-design benchmarks** (pause/rewind of ion movement, "charges" toggle) and optionally as attributed external links ("Try also"). Not embedded by default (size, offline, visual consistency).

### E.4 Scientific corrections confirmed this round (applied to bay plans)
| Bay | Claim in current code | Sourced value |
|---|---|---|
| Nervous | withdrawal reflex "real latency ≈ 200–500 ms", model total ≈ 200 ms | human nociceptive withdrawal reflex EMG latencies ≈ **65–150 ms** (mean ≈ 90–100 ms) |
| Reproduction | estrogen peak on day 14 together with LH | estradiol peaks **≈ 1 day (24–48 h) before** the LH surge; ovulation **≈ 24–36 h after LH-surge onset**, ≈ 16–24 h after the peak |
| Excretion | urine ≈ 2.7 L/day without ADH; unitless "concentration ×" | urine osmolality **≈ 50–1200 mOsm/kg**; urine volume from ≈ **0.8 L/day (max concentration) to ≈ 20 L/day (max dilution)** for ~1000 mOsm daily solute load |

---

## F. Decisions round 11 (approved by owner: "keep all")
| # | Decision |
|---|---|
| X1 | **Digestion keeps an "Advanced (beyond current NEET syllabus)" layer** in addition to Class 9/10 content; clearly labelled as not examined in NEET. |
| X2 | **Hormones sub-tab inside Brain & Nerves** (Class 10 hormones + NEET Chemical Coordination & Integration). |
| X3 | **Reproduction**: age-appropriate rules (schematic diagrams, neutral language, level-gating, teacher hide option, educational-only health note) approved; **Reproductive Health** included at NEET level (brief card at Class 10). |
| X4 | **Plant content stays inside the related bays**: plant reproduction tab in Reproduction; plant coordination (tropisms, plant hormones) in Brain & Nerves; plant tissues in Tissues; plant cell in Cell. |
| X5 | **Molecular Basis of Inheritance inside Heredity**, re-using Cell bay protein-synthesis / nucleus 3D assets. |

### F.1 Secondary bay questions — engineering defaults (owner may override)
| Bay | Question | Default |
|---|---|---|
| Digestion | Class 10 disorders (e.g. dental caries) | include, brief |
| Circulation | Disorder notes (hypertension, CAD) | include at NEET level, educational-only note |
| Circulation | Heart sounds | visual/text markers only (no audio, per D15) |
| Respiration | Altitude & disorders | include at NEET level |
| Respiration | Bell-jar model | include (Class 9/10 activity) |
| Excretion | Disorders & dialysis | include at NEET level; dialysis principle at Class 10 |
| Excretion | Plant excretion | brief card (Class 10) |
| Heredity | DNA fingerprinting / HGP | include at NEET level |
| Heredity | Evolution | out of scope for now (backlog) |

### F.2 Planning status
All learning-bay master plans (Cell, Tissues, Digestion, Circulation, Brain & Nerves, Respiration, Excretion, Reproduction, Heredity) are **complete for owner sign-off**. Next step only on owner instruction: begin Foundation milestone (§D.1) followed by the Cell (mitochondrion) and Tissues (skeletal muscle) vertical slices for live-preview review.

---

## G. Full bay roster & one-by-one delivery order (round 12)
| # | Bay | Plan | Status |
|---|---|---|---|
| 0 | Foundation (accuracy tooling, i18n, theme, display, Settings incl. curriculum track, shared toolkit) | this file §B–D | planned |
| 1 | Cell Structure | `CELL_STRUCTURE_MASTERPLAN.md` | planned |
| 2 | Tissues (+ joints) | `TISSUES_MASTERPLAN.md` | planned |
| 3 | Digestion & Nutrition | `bays/DIGESTION_MASTERPLAN.md` | planned |
| 4 | Circulation | `bays/CIRCULATION_MASTERPLAN.md` | planned |
| 5 | Brain & Nerves (+ Eye, Hormones, plant coordination) | `bays/NERVOUS_MASTERPLAN.md` | planned |
| 6 | Respiration | `bays/RESPIRATION_MASTERPLAN.md` | planned |
| 7 | Excretion | `bays/EXCRETION_MASTERPLAN.md` | planned |
| 8 | Reproduction (+ plant, Growth) | `bays/REPRODUCTION_MASTERPLAN.md` | planned |
| 9 | Heredity (+ molecular basis, genetic disorders) | `bays/HEREDITY_MASTERPLAN.md` | planned |
| 10 | **Evolution & Adaptation (new)** | `bays/EVOLUTION_MASTERPLAN.md` | planned |
| 11 | **Environment (new)** | `bays/ENVIRONMENT_MASTERPLAN.md` | planned |
| — | Movement Theater (incl. WBBSE locomotion) | separate future round | excluded now |

Rule: one bay at a time → build → `npm run verify` green → owner reviews on live preview → next bay. Single PR at the very end (D19).

### G.1 Update (round 13): live-preview review gate removed
- Owner instruction: skip the per-section live-preview review for now.
- New loop per section: build → `npm run verify` + tests pass → move straight to the next section (no waiting for owner review).
- Final owner review happens once, on the single PR, at the end.

### G.2 Round 13: UI optimization re-check (added to §C)
§C already covered: device matrix, breakpoints, container queries, dvh/safe area, fluid type, 3D DPR caps/render-on-demand, input types, theme × display, Web Vitals budgets, print, device-matrix screenshots. Gaps found and now added:
1. **Automated visual gate replaces owner preview review (G.1):** per-bay Playwright screenshots × device matrix × 2 themes × 2 languages, checked for: no horizontal overflow, no clipped/overlapping text (Bengali text is longer — measured), tap targets ≥ 44 px, contrast AA via axe-core. Build fails on violation.
2. **Load speed:** CSS split per bay (current 227 kB single file); Bengali font subset + `font-display: swap` + preload, size budget ≤ 150 kB woff2; each bay lazy-loaded with a skeleton of fixed size (CLS 0); 3D scene loaded after the text panel is interactive; prefetch next bay on idle.
3. **Smooth animation:** animate only `transform`/`opacity`; timeline engine on one `requestAnimationFrame`; 60 fps target on mid-range, auto-drop quality tier if frame time > 20 ms for 2 s; `prefers-reduced-motion` gives still frames + step buttons.
4. **Memory:** dispose Three.js geometry/material/textures on bay exit; instancing for repeated objects (cells, RBCs, molecules); heap check in smoke test (no growth after 5 bay switches).
5. **Low-end / slow network mode:** Settings → "Data saver / Low graphics": 2D fallback diagrams, no auto-play, DPR 1.
6. **Interaction latency:** INP < 200 ms — heavy simulation maths in a Web Worker; long lists (quiz banks, glossary) virtualised.
7. **Three.js budget:** only ~60 kB headroom left → shared procedural geometry library, no new loaders/addons; budget check per milestone.
Note: §D step 2 "owner review on live preview" is superseded by G.1 + this automated gate.

### G.3 Round 13: open questions resolved by agent (owner delegated: "technically accurate anuman kore nao")
| # | Question | Decision | Technical reason |
|---|---|---|---|
| R1 | Default curriculum | **WBBSE** default, NCERT/CBSE one tap in Settings | target users in West Bengal, Bengali-first app; both syllabi share most content |
| R2 | Fact reviewer | **Two-layer check**: every claim object needs ≥ 2 sources (1 syllabus textbook + 1 standard reference/peer-reviewed); automated QC script blocks claims without source/range/date; owner does final review on the single PR; claims marked `needs-expert` are listed in a report for any future teacher | no named expert available; source-pairing is the standard practice in textbook fact-checking |
| R3 | Light theme tint | **Neutral, very slightly warm** surface (OKLCH L≈0.98, C≈0.005, h≈85); text OKLCH L≈0.20; no pure white (#fff) or pure black | lower glare outdoors/projector, keeps biology colour coding (blood red, chlorophyll green, stain pink/purple) true; neutral avoids shifting histology stain hues; AA contrast verified |
| R4 | Human evolution depth | Class 10: Darwin/Lamarck, homologous/analogous/vestigial, fossils, speciation; human evolution as a **branching tree** (Australopithecus → Homo habilis → H. erectus → H. neanderthalensis / H. sapiens) with dates as ranges; NEET level: Hardy–Weinberg, 5 factors, Miller–Urey, adaptive radiation | matches NCERT XII Ch "Evolution" + WBBSE X Ch 4; avoids "march of progress" misconception |
| R5 | Origin-of-life animation | **Yes**, Miller–Urey (1953) ≤ 30 s, labelled as "experiment showing amino acids can form abiotically", not "proof of how life began" | scientifically honest framing |
| R6 | Sundarbans flagship | **Yes**, mangrove ecosystem (Sundari, pneumatophores, tiger, salinity, tidal food web); data only from official sources (Forest Survey of India, WWF/UNESCO), dated | local relevance, in WBBSE environment chapter context |
| R7 | Logistic equation | Class 9–10: J-curve vs S-curve **graphs only**; NEET level: dN/dt = rN and dN/dt = rN(K−N)/K with sliders | NCERT XII Organisms & Populations includes both equations; Class 10 does not |
| R8 | Cockroach (NEET) | Not built as a separate model; verify status before Tissues/Structural Organisation phase; if present, add as a link card only | status unverified; avoid unneeded scope |
| R9 | New NCERT Class 10 book | Build on current Reprint 2026-27; curriculum mapping kept data-driven (`curriculumMap`) so a new book only needs a data update | future-proof |
All rounds' open questions are now closed. Only remaining gate: owner's explicit "shuru koro" before code.
