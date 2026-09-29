# Integrated upgrade roadmap — Phases 40–63

**Tracks:** V = Visual fidelity · A = Animation · I = User interaction
**Supersedes:** `VISUAL_TIER_UPGRADE_PLAN.md` (its Tier 1–3 content is folded in below, renumbered into one interleaved execution sequence).

## Strategic stance

Premium products (Complete Anatomy, BioDigital) win on three fronts: render quality, animated anatomy, and deep interaction tooling. This roadmap attacks all three in one interleaved sequence — but with one doctrine:

> **Explain, don't perform.** Premium apps animate anatomy (beating hearts, flexing muscles, inflating lungs). Our source is a static adult-male macro-anatomy mesh, so we animate *mechanism* — pressure, gradients, events, routes — through deterministic state machines, and we never make the source mesh perform motion it does not have. That honesty is the product's moat, not a limitation to hide.

## Governing rules (unchanged, binding on every phase)

1. Accuracy over realism; nothing implies histology, variation, or absent structures.
2. Source anatomy stays static; all motion is labeled teaching-model output.
3. Every new visual/animation/interaction mode adds pending cases to the review matrix; no automated approval.
4. Performance budgeted per device tier; heavy techniques desktop-flagged.
5. Reduced motion and keyboard parity preserved; every animation has a stepped/static equivalent.
6. Motion-Fall untouched; no unreviewed 3D source enters runtime (Phase 36 gates intact).

## Honest-equivalents table

| Premium feature | Complete Anatomy / BioDigital | Our honest equivalent | Phase | Deferred (why) |
| --- | --- | --- | --- | --- |
| Environment-lit, occluded rendering | Yes | Phases 40–44 | 40–44 | — |
| Isolate / hide / show | Yes | Isolate, solo, hide-selected | 47 | Dissection pen (needs editable geometry) → clipping plane substitute at 52 |
| Cinematic fly-to | Yes | Deterministic fly-to + guided tours | 48 | — |
| Beating heart cinematic | Yes | Pressure-coupled valve/flow state animation, R/L split, ECG | 46 | Source-mesh beating (not in source) |
| Muscle motion | Yes | Contraction pulse + origin/insertion markers, labeled conceptual | 60 | Rigged muscle animation → gated source intake only |
| Lung inflation | Yes | Conceptual ventilation loop + airway flow pulses (no parenchyma in source) | 50 | Atlas lung deformation (absent structure) |
| Peristalsis | Yes | Wave-propagation cues + secretion events on the director timeline | 51 | — |
| Nerve conduction | Partial | Route-propagation animation + reflex timing | 55 | — |
| Cross-sections | Yes | Clipping planes with disclosure | 52 | Stencil caps (follow-up if review demands) |
| X-ray see-through | Yes | Fresnel ghost mode, labeled visualization | 49 | — |
| Bookmarks / Screens | Yes | Named bookmarks + full-state share URLs | 56 | — |
| Regional navigation | Yes | Semantic structure panel with regional presets | 53 | — |
| Label quiz | Yes | Pin-label quiz on the 3D atlas | 61 | — |
| Measurement | Clinical-grade | Educational relative measurement, non-clinical label | 58 | Clinical measurement (out of scope) |
| Disease animations | 600+ models | Out of scope — no source; future candidate category under five-gate review | — | Candidate intake only |
| AR / VR | Yes | Not pursued | — | WebXR cost vs. classroom value; revisit after 63 |

---

## Phase sequence (interleaved, single numeric order)

| # | Phase | Track | Size | Depends on |
| --- | --- | --- | --- | --- |
| 40 | Environment lighting foundation | V | S–M | — |
| 41 | Wet-tissue materials (clearcoat) | V | M | 40 |
| 42 | SSAO + EffectComposer | V | M | 40 |
| 43 | Silhouette outlines + outline selection | V | M | 40, 42 |
| 44 | Selection glow & presentation presets | V | S–M | 41–43 |
| 45 | **Unified Timeline Director (animation foundation)** | A | M | 44 |
| 46 | Circulation animation depth (R/L traces, ECG, O₂-status flow) | A | M | 45 |
| 47 | **Isolate / solo / hide-selected interaction** | I | M | 43 |
| 48 | **Fly-to + guided camera tours** | I | M | 45, 47 |
| 49 | X-ray / ghost mode | V | M | 44 |
| 50 | Breathing mechanics teaching model | A | M | 45 |
| 51 | Digestion animation depth (peristaltic waves, secretion events) | A | M | 45 |
| 52 | Clipping planes / section view | V | M–L | 44 |
| 53 | **Semantic structure panel (3D parity of Phase 31 catalog)** | I | M | 47 |
| 54 | Smooth layer peeling + depth-sort policy | V | S–M | 44 |
| 55 | Nerve signal propagation + reflex timing animation | A | M | 45 |
| 56 | **Bookmarks + full-state share URLs** | I | S–M | 48, 53 |
| 57 | Gas-exchange animation depth | A | S–M | 45 |
| 58 | Educational measurement & annotation pins | I | M | 47 |
| 59 | Decimated LOD meshes (replaces box proxies) | V | L | 44 |
| 60 | Muscle-action educational visualization | A | M | 45, 47 |
| 61 | Pin-label quiz interaction | I | M | 53 |
| 62 | Touch/gesture polish + WCAG 2.2 drag/target audit | I | M | 47 |
| 63 | Honesty governance extension & release gates | V+A+I | S | all |

---

## Phase details

### Visual foundation (40–44) — unchanged from the visual tier plan

- **40** PMREM RoomEnvironment lighting + rebalanced presets in `atlasRendering.js` registry; battery tier keeps analytic lights.
- **41** Per-system `MeshPhysicalMaterial` profiles (clearcoat viscera ~0.35, vessels ~0.25, bone 0); materials QC script caps budgets.
- **42** EffectComposer + SSAOPass behind a desktop capability flag; integrates with on-demand rendering and Phase 35 context-loss rebuild.
- **43** Inverted-hull body contour + OutlinePass selection; bounds box demoted to debug.
- **44** Selection rim glow, hover→select transitions (instant under reduced motion), presentation preset selector, vignette/backdrop polish.

### 45 — Unified Timeline Director (A, foundation)

New `src/lib/TimelineDirector.js`: one deterministic clock driving every teaching animation as a registered participant (cardiac, digestion, breathing, nerves, exchange).
- API: play / pause / step / scrub / speed / reset; per-participant state-machine coupling; event bus emitting caption + audio-cue events; reduced-motion mode = stepped, caption-first.
- CardioPhysiologyEngine and DigestiveStageMachine become participants; CirculationLab timeline becomes a director surface.
- Shareable state: director phase + participant states serialize into the URL (feeds Phase 56).
- **Acceptance:** determinism smoke (same input → same event sequence, 2000 steps); reduced-motion contract test; existing cardiac/digestive smokes unregressed.

### 46 — Circulation animation depth (A)

- Right/left split Wiggers traces rendered separately (state-machine factors from Phase 32) + teaching-labeled ECG strip aligned to phases.
- Oxygen-status color wave along the conceptual route (disclosure preserved: teaching convention, not flow imaging).
- Valve event flashes and caption callouts fire from director events; all elements scrub-locked.
- **Acceptance:** cardio smoke extended to R/L trace invariants; review cases for the synchronized multi-view state.

### 47 — Isolate / solo / hide-selected (I)

- Per-part isolate (hide everything else), system solo, hide-selected, invert; HUD + layer-panel actions; keyboard-operable; state restored from share URLs.
- Isolated part receives the outline treatment from 43; wide-pick from Phase 30 still applies.
- **Acceptance:** interaction smoke extended; accessibility keyboard parity for isolate/hide; rubric cases for isolated-view contrast and orientation.

### 48 — Fly-to + guided camera tours (I)

- Smooth deterministic fly-to replaces the hard-cut frameSelection; reduced motion = instant framing.
- Guided tours: circulation 4-stage tour, digestion route tour, respiratory airway tour — camera keyframes + director captions (uses 45), tour state shareable.
- **Acceptance:** tours deterministic frame-to-frame; keyboard start/stop/skip; reduced-motion equivalents; rubric cases for tour framing at phone width.

### 49–52 — Visual Tier 2 (as previously planned)

- **49** Fresnel X-ray/ghost mode with "visualization, not imaging" disclosure.
- **50** *Breathing:* conceptual ventilation model — pressure–volume loop, schematic diaphragm motion (labeled teaching model, **not** atlas deformation), airflow pulses along the trachea route; OpenStax evidence record; lung-parenchyma absence disclosure surfaces in-mode.
- **51** *Digestion:* segmented peristaltic wave cues replacing single-bolus motion; bile/pancreatic secretion bursts as side-input director events at the duodenum; pH wave synchronized.
- **52** Clipping planes (transverse/sagittal/coronal) with double-sided MVP and explicit "no implied internal anatomy" review criterion.

### 53 — Semantic structure panel (I)

- Full searchable system→part hierarchy panel in 3D mode, extending the Phase 31 accessible catalog; bidirectional selection sync with the 3D scene; regional presets (head/neck, thorax, abdomen, pelvis, limbs) derived from atlas bounds.
- Becomes the primary keyboard path in 3D mode; live-region announcements.
- **Acceptance:** catalog QC extended to full-panel coverage; keyboard end-to-end test (select→isolate→frame→share); rubric cases.

### 54 — Smooth layer peeling (V)

- Opacity falloff curves, short lerped transitions (direct jumps under reduced motion), and a depth-sort/render-order policy table for 3+ simultaneous transparent layers.

### 55 — Nerve signal propagation (A)

- Conduction pulses along mapped peripheral nerve routes with labeled educational velocity; reflex-arc timing diagram synced to director events; signal-route disclosure (conceptual, not electrophysiology).

### 56 — Bookmarks + full-state sharing (I)

- Named local bookmarks (camera, layers, isolate state, director phase, tour position) and share URLs encoding the same state; import/export as JSON.
- **Acceptance:** round-trip test (share → reload → identical state hash); accessibility of the bookmark panel.

### 57 — Gas-exchange animation depth (A)

- Alveolar teaching model: O₂/CO₂ particle states driven by a partial-pressure slider and capillary transit timing; enlarged-model disclosure retained.

### 58 — Measurement & annotation (I)

- Two-point relative distance and angle measurement between selected parts, labeled "educational scale — not clinical"; local annotation pins with notes; both serialized into share state.

### 59 — Decimated LOD (V)

- Build-time decimation baked per part in the atlas packer; binary + cache version bumps; LOD swaps box proxies; identity QC proves identical part resolution across LOD levels. Largest visual phase — deliberately placed after the visual baseline settles.

### 60 — Muscle-action educational visualization (A, constrained)

- Selected-muscle contraction pulse + origin/insertion bounds markers, labeled **conceptual**; joint-action captions from metadata where the atlas supports it.
- Explicit deferral: rigged anatomical muscle motion requires sourced, segmented, reviewed muscle animation assets — Phase 36 five-gate territory only.

### 61 — Pin-label quiz (I)

- "Identify the highlighted structure" quiz mode on the atlas using the existing Quiz component; keyboard operable; results feed the existing guided-path checkpoints.

### 62 — Touch/gesture polish + WCAG 2.2 audit (I)

- Inertial rotation, double-tap focus, gesture discoverability hints, target-size ≥ 24 px audit, drag-alternative audit for every drag interaction, pointer-cancellation review; outcomes recorded against the accessibility rubric.

### 63 — Honesty governance extension (V+A+I)

- Evidence-ledger `representationMode` records for every new mode (x-ray, clipping, tours, measurement, muscle pulses…), each stating what it shows and what it must never imply.
- Review rubric grows with per-mode cases (matrix grows well beyond 24; all pending).
- `performance-budgets.json` gains per-tier allowances for post-processing and director participant counts; `release-readiness.mjs` gains gates for materials QC, director determinism, and bookmark/state round-trip.
- A/B review packet generator (playwright screenshots + animation frame strips) ships as reviewer reference — never approval.

---

## What this roadmap will NOT do

- No source-mesh deformation presented as anatomy (heart squeeze, lung inflation, muscle flex remain labeled teaching models or are deferred).
- No procedural fake detail (textures, fibers, pores).
- No disease models, AR/VR, or new 3D sources without the Phase 36 five-gate process.
- No clinical claims (measurement is educational-scale only).
- No automated sign-off: every new mode waits for named human reviewers.

## Gate impact to expect

- Review matrix case count grows from 24 to roughly 70–90 across modes/orientations/viewports/motion — all pending until human review.
- Release stays BLOCKED on human sign-off throughout; this roadmap adds capability, not permission to ship.

## Expected outcome

After 40–44: premium rendering. After 45–48: premium-feeling motion and navigation with honest semantics. After 49–62: feature parity with the interaction/animation surface learners actually use in paid products — while remaining free, offline, and more transparent than any of them.
