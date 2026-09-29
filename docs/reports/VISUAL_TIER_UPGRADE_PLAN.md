> **SUPERSEDED** — this visual-only plan has been folded into `INTEGRATED_UPGRADE_ROADMAP.md` (Phases 40–63), which interleaves visual, animation, and interaction work in a single execution sequence. Kept for reference only.

# Visual tier upgrade plan — Phases 40–49

Goal: raise rendering quality toward top-tier anatomy products (Complete Anatomy / BioDigital grade) **without altering certified source geometry, without faking anatomy, and without weakening any existing review gate**.

## Governing rules (apply to every phase below)

1. **Accuracy over realism.** Every upgrade renders the same BodyParts3D anatomy better; nothing may imply histology, tissue texture, population variation, or structures absent from the source.
2. **Source anatomy stays static.** No rendering feature may suggest the source mesh moves; physiology remains the separate teaching model.
3. **Every visual change re-opens the review rubric.** New rendering modes add cases to `VISUAL_REVIEW_MATRIX.md`; no automated check may approve them.
4. **Performance is budgeted per device tier** (`scripts/performance-budgets.json`): heavy techniques are desktop/high-tier only; battery tier keeps the current clean pipeline.
5. **Reduced motion and accessibility are preserved.** No new animation is mandatory; every mode has a static equivalent.
6. **Motion-Fall stays untouched; no new 3D source enters runtime.**

## Dependency graph

```
40 Lighting → 41 Materials ─┐
42 SSAO/composer ───────────┼→ 43 Outlines → 44 Selection & polish
                            │
45 X-ray ─ 46 Clipping ─ 47 Peeling ─ 48 Decimated LOD (independent, after 44)
                            └→ 49 Honesty governance (continuous, finalized last)
```

---

## TIER 1 — The five upgrades that create 80% of the premium feel

### Phase 40 — Environment lighting foundation (S–M)

**Work**
- Add `src/lib/atlasRendering.js`: rendering-mode registry with per-tier capability flags (environment, ssao, outlines, xray, clipping).
- Generate a PMREM environment from `three/examples/jsm/environments/RoomEnvironment.js`; set `scene.environment` in `BodyMap3DAtlas.jsx`.
- Rebalance existing hemisphere/key/fill/rim intensities against the environment; tune `toneMappingExposure` via the Phase 28 lighting presets (extend, don't fork them).
- Mobile/battery tier: keep current analytic lights (no PMREM cost).

**Acceptance**
- Automated: framing QC extended to validate new preset fields; browser test asserts the atlas still reaches skeletal-ready on both tiers; draw-call/frame-time read from the debug HUD attached to the test report.
- Human: rubric re-review of contrast and occlusion items in 4 orientations (new review cases added, status pending).

**Risks** — Environment reflections can wash out dark-background contrast; mitigate with exposure presets and the existing contrast rubric item.

### Phase 41 — Wet-tissue materials (M)

**Work**
- Upgrade `SYSTEM_STYLE` in `AnatomySceneManager.js` to a material profile table: `MeshPhysicalMaterial` with per-system `clearcoat` (viscera ~0.35, vessels ~0.25, bone/cartilage 0), restrained `roughness`, unchanged color identities.
- Keep transparent layers on cheaper settings; preserve the restrained emissive range so teaching markers stay readable.
- Battery tier may fall back to `MeshStandardMaterial` via the rendering-mode registry.

**Acceptance**
- Automated: new `scripts/anatomy-materials-qc.mjs` validating per-system material budgets (clearcoat ≤ cap, emissive intensity ≤ cap, color identity preserved).
- Human: rubric items for contrast, marker tightness, and orientation clarity.

**Risks** — Clearcoat on transparent geometry can produce sorting artifacts; covered by the existing depth-ordering rubric item.

### Phase 42 — Screen-space ambient occlusion (M)

**Work**
- Introduce `EffectComposer` + `RenderPass` + `SSAOPass` + `OutputPass` (all `three/examples/jsm`, no new dependencies) behind a `postprocessing` capability flag: desktop `sharp`/`balanced` only.
- Integrate with the existing on-demand render loop: composer renders only when `needsRender || changed || overlayChanged`.
- Handle resize, pixel-ratio changes, and context-loss rebuild (Phase 35 generation rebuild must recreate composer targets).
- Verify fog/alpha interaction; if `alpha: true` breaks depth passes, switch the atlas stage to an opaque scene background matching the CSS backdrop.

**Acceptance**
- Automated: browser test on the desktop project asserts composer initialization flag, no context-loss regressions, and frame-time below the desktop p95 budget in the debug HUD sample.
- Human: rubric re-review; SSAO must not create false "cavities" on smooth surfaces.

**Risks** — SSAO cost on integrated GPUs; mitigated by the capability flag and existing adaptive pixel-ratio logic.

### Phase 43 — Silhouette outlines (M)

**Work**
- Body contour: inverted-hull outlines (back-face-scaled dark shells) generated per system LOD — cheap, works with merged geometry, needs no composer.
- Selection outline: when Phase 42's composer is active, use `OutlinePass` on the exact selection geometry; otherwise fall back to the inverted-hull copy of the selected part. The coarse bounds box is retired to a debug-only role.
- Contour color/intensity lives in `atlasRendering.js` presets so contrast stays reviewable.

**Acceptance**
- Automated: outline geometry adds bounded triangle overhead (QC cap); existing selection browser contracts still pass.
- Human: rubric items for marker tightness, contrast, and occlusion — outlines must never hide a structure or imply a boundary the source doesn't have.

**Risks** — Inverted hull on thin leaflets (valves) can self-overlap; per-system exclusions allowed and recorded.

### Phase 44 — Selection glow and presentation polish (S–M)

**Work**
- Replace bounds-box highlight semantics with outline + soft emissive rim on the exact part copy; smooth hover→select transition (instant under reduced motion).
- Subtle vignette and backdrop gradient refinement (CSS, not GPU) to focus the stage.
- Consolidate all Tier 1 modes into one "Presentation preset" selector (Atlas / Contrast / Selection focus) reusing the Phase 28 presets.

**Acceptance**
- Full rubric pass over the 24 existing cases **plus** new presentation-mode cases (count grows; all start pending).
- A/B screenshot pack (playwright harness) attached to the review matrix as reviewer reference — evidence for humans, not approval.

---

## TIER 2 — Premium interaction visuals

### Phase 45 — X-ray / ghost mode (M)

**Work**
- Fresnel-based translucency mode (`onBeforeCompile` shader tweak) for integumentary/muscular layers so loaded inner layers stay visible; explicit UI toggle with the disclosure: "Visualization mode — not imaging."
- Only affects loaded layers; never fabricates unseen content.

**Acceptance** — Rubric cases for X-ray × orientation × viewport; disclosure text visible in-mode; reduced-motion unaffected.

### Phase 46 — Clipping planes with section view (M–L)

**Work**
- Transverse/sagittal/coronal clipping slider using `renderer.localClippingEnabled` + shared `THREE.Plane` applied to atlas materials.
- MVP: open cross-section with double-sided rendering; stencil-capped solid caps are a follow-up refinement only if the open view reads cleanly in review.
- Clipping state is part of the shareable view state.

**Acceptance** — Rubric cases must confirm the cut view never implies internal anatomy the source lacks (e.g., no parenchyma "fill" appears); clipping × teaching overlays verified (routes must not render into clipped-away regions misleadingly).

### Phase 47 — Smooth layer peeling (S–M)

**Work**
- Opacity falloff curves and short lerped transitions in the layer controller (direct state jumps under reduced motion).
- Depth-sorting pass for multi-transparent layers (existing known gap): render-order rules per layer plus `depthWrite` policy table in `atlasRendering.js`.

**Acceptance** — Rubric depth-ordering item re-reviewed for 3+ simultaneous transparent layers; reduced-motion contract intact.

### Phase 48 — Decimated LOD meshes (L)

**Work**
- Build-time decimation in the atlas packer (meshoptimizer-style simplification), baking a low-detail variant per part alongside full geometry; binary format version bump + cache namespace bump.
- LOD swaps from box proxy → decimated part geometry; selection metadata stays identical across LOD levels.
- Triangle budgets per chunk recorded in the manifest and checked by `atlas-binary-qc` and `anatomy-identity-qc`.

**Acceptance** — Identity QC proves low/high LOD resolve to the same part; visual review of distant views; performance baseline re-measured (decode time and memory must stay within tier budgets); offline rebuild verified.

**Risks** — Largest phase; decimation can distort small parts. Per-part minimum-triangle floor and a manual reject list are part of the plan, not an afterthought.

---

## TIER 3 — Honesty governance (continuous)

### Phase 49 — Rendering-mode provenance and release governance

**Work**
- Extend the evidence ledger with a `representationMode` record per rendering mode (environment/SSAO/outline/X-ray/clipping): what it shows, what it must never imply, UI disclosure text.
- Extend `visual-review-status.json` rubric with rendering-mode criteria; regenerate the matrix (case count grows beyond 24; all pending).
- Extend `scripts/performance-budgets.json` with per-tier post-processing allowances; `release-readiness.mjs` gains gates: materials QC, rendering-mode registry consistency, budget re-measurement.
- A/B review packet generator (playwright screenshots per mode/orientation/viewport) becomes part of the review tooling.

**Acceptance** — Release remains blocked exactly on human review; no rendering feature can ship without a named reviewer record; strict release audit fails on any missing disclosure.

---

## Sequencing and effort

| Order | Phase | Size | Depends on |
| --- | --- | --- | --- |
| 1 | 40 Environment lighting | S–M | — |
| 2 | 41 Wet-tissue materials | M | 40 |
| 3 | 42 SSAO/composer | M | 40 |
| 4 | 43 Silhouette outlines | M | 42 (selection path), 40 |
| 5 | 44 Selection & polish | S–M | 41–43 |
| 6 | 45 X-ray mode | M | 44 |
| 7 | 46 Clipping planes | M–L | 44 |
| 8 | 47 Smooth peeling | S–M | 44 |
| 9 | 48 Decimated LOD | L | 44 (after visual baseline settles) |
| — | 49 Governance | continuous | all |

## What this plan will NOT do

- No procedural textures faking histology, skin pores, or muscle fibers.
- No geometry mutation of certified parts (decimation produces a derived LOD explicitly labeled as such).
- No new runtime 3D sources (Phase 36 five-gate process unchanged).
- No claim of visual sign-off from automated screenshot harnesses — they produce reviewer reference material only.

## Expected outcome

After Phases 40–44: the atlas reads as a premium web viewer (environment-lit, occlusion-shaded, outlined, glowing selection) while remaining more transparent than the paid products. After 45–48: interaction visuals reach parity with the premium features learners screenshot. Throughout, the release gate stays blocked until humans approve — including the new rendering-mode cases.
