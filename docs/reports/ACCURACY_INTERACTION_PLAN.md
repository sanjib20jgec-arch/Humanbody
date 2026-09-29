# Accuracy, 3D interaction, animation, and visual-fidelity improvement plan

## Scope and current baseline

This is a plan for the Human Biology Lab after the completed Phases 16–25 implementation work. It does not alter Motion-Fall and does not approve or import any unreviewed 3D source.

Current baseline:

- Certified atlas: BodyParts3D 4.0 adult-male macro-anatomy reference.
- Runtime atlas: 2,234 selectable parts, 15 lazy chunks, about 33 MB compressed atlas payload.
- Rendering: Three.js WebGL, grouped BufferGeometry, LOD proxies, on-demand rendering, adaptive pixel ratio, reduced-motion behavior, accessible 2D fallback, and offline build.
- Interaction: custom anatomy turntable rotation, OrbitControls-based pan/zoom, raycast selection, search, layer peeling, view presets, keyboard arrows, shareable structure links, and exact part overlays.
- Teaching boundary: source mesh remains static; physiology, food route, gas exchange, enzyme chemistry, and other processes are separately labeled teaching models.
- Current gates: automated checks pass; 24 visual review cases and 5 3D candidates remain deliberately unapproved.

## Deep-dive findings

### Strengths already above a basic 3D web demo

1. **Provenance is explicit.** The app identifies the BodyParts3D source, CC BY 4.0 attribution, adult-male scope, macro-anatomy limitations, and separate conceptual models.
2. **The loading model is responsible.** Skeletal-first startup, lazy system chunks, cache versioning, worker decompression, mobile filtering, and offline packaging are stronger than an all-at-once anatomy viewer.
3. **The interaction model is intentionally educational.** Learners can rotate the anatomy around its own center, change layers, search by anatomy terms, select source parts, view function/clinical notes, and switch to a semantic 2D route.
4. **The current release discipline is honest.** Automated anchor QC is not treated as expert visual review, and candidate 3D sources are not runtime-loaded before approval.
5. **The simulation boundary is clear.** The heart source mesh is not presented as beating anatomy; the cardiac engine and route overlay are adjacent teaching models.

### Gaps to close before calling the system industry-grade

1. **Visual accuracy is not yet quantitatively validated.** Automated bounds and query checks prove that a label resolves, not that the label is on the intended surface, visible in the right view, correctly oriented, or non-occluding. The current human review matrix is the correct gate but is still pending.
2. **The certified atlas has a defined scope, not universal human variation.** BodyParts3D describes an adult human male whole-body model. The app should not imply female, pediatric, population-variant, or patient-specific anatomy from the same mesh.
3. **The source mesh is macro-anatomy rather than clinical segmentation.** A clinical-quality upgrade would require an entry-specific source, segmentation provenance, coordinate system, and validation against expert anatomy or imaging. DICOM has explicit surface-segmentation and referenced-segment concepts, but this educational atlas is not currently a DICOM clinical visualization pipeline.
4. **The route overlay is semantic but still mostly polyline-based.** A straight line through anchor centers can pass through tissue, cross unrelated structures, or suggest literal transport. Routes need an explicit topology and occlusion policy.
5. **The 3D viewer has a good fallback but not full structure-level parity.** The accessible 2D mode chooses major systems, while the 3D mode exposes part-level structures. A learner who cannot use WebGL should get a keyboard-selectable structure index and equivalent semantic selection, not only system summaries.
6. **WebGL context recovery is not a first-class release test.** The renderer and manager dispose resources on unmount, but the current viewer does not yet implement an explicit `webglcontextlost` / `webglcontextrestored` recovery state and reload path.
7. **Animation semantics need a stronger state machine.** Cardiac values are normalized and educational, but valve markers are currently driven by model gradients and a phase selection heuristic. The next version should make phase transitions, valve events, flow direction, pulse timing, and explanatory captions one auditable state machine.
8. **Asset delivery is efficient but custom.** The packed binary atlas is appropriate for the current source; future approved modular assets should be evaluated against the glTF 2.0 runtime standard and KTX2/Basis GPU texture compression rather than accumulating ad-hoc formats.
9. **Educational effectiveness is not yet measured.** The app has browser contracts and source QA, but not learner task metrics or faculty usability evidence. Published 3D anatomy work shows potential benefit but also mixed results and navigation/detail concerns, so user validation should be part of the release process rather than assumed.

## Industry and authoritative reference points

- **BodyParts3D:** the official description defines a 3D whole-body model for an adult human male and an anatomy-concept database; the official license page requires CC BY 4.0 attribution.
- **NIH 3D:** the repository states that licenses vary by entry and that users must independently verify scientific conclusions; an NIH-hosted model must not be treated as automatically accurate or automatically reusable.
- **OpenStax A&P:** cardiac-cycle teaching should follow pressure gradients: ventricular pressure first closes AV valves, then exceeds arterial pressure to open semilunar valves; falling ventricular pressure closes semilunar valves and later opens AV valves.
- **DICOM:** Surface Segmentation and referenced-segment concepts are the right provenance vocabulary if a future patient-specific or imaging-derived asset is ever considered, but they should not be implied for the current BodyParts3D atlas.
- **WCAG 2.2:** all functionality should be keyboard operable; multipoint/path gestures need a single-pointer alternative; dragging interactions need a simple alternative; target-size and status-message behavior must be tested.
- **Three.js/WebGL:** Three.js documents renderer disposal, context-loss simulation, and `setAnimationLoop`; the Web platform exposes `webglcontextlost` and `webglcontextrestored` events that should be tested deliberately.
- **Khronos glTF:** glTF 2.0 is an API-neutral runtime delivery format with a common PBR material model; KTX2/Basis can reduce transfer and GPU texture memory for future textured assets.
- **Education evidence:** published anatomy-visualization research supports validating realism, pedagogy, navigation, and spatial learning with structured learner and expert measures rather than relying on visual polish alone.

## Execution plan: Phases 26–39

Each phase is sequential. A phase is not “complete” until its acceptance gate passes. Phases 36–38 retain human/source approval gates and cannot be replaced by automated checks.

### Phase 26 — Evidence model and anatomy-review contract

**Goal:** Turn visual accuracy into auditable data instead of prose and screenshots only.

**Work:**

- Add an `anatomyEvidence` schema for every reviewed claim: source URL/DOI, dataset version, license, anatomical concept ID, view/plane, expected relationship, confidence, reviewer, date, and status.
- Separate `source-fact`, `source-limitation`, `conceptual-model`, and `animation-interpretation` claims.
- Add a review rubric for identity, orientation, scale disclosure, occlusion, color semantics, label placement, and interaction discoverability.
- Add evidence IDs to registry entries, teaching-overlay stages, and visual-review cases.

**Acceptance:** every visual teaching claim resolves to either an approved source fact or an explicit conceptual-model claim; missing evidence fails CI.

### Phase 27 — Structure identity, topology, and geometry confidence

**Goal:** Prevent a correct-sounding label from attaching to the wrong merged geometry group.

**Work:**

- Give every part a stable semantic record: BodyParts3D ID, concept ID, display name, synonyms, system, source chunk, geometry group, and geometry-confidence status.
- Validate group-to-metadata cardinality, index ranges, normals, winding, bounds, and duplicate concepts.
- Add a geometry-vs-metadata bounds report with outlier thresholds and a manual-review queue.
- Add explicit “not present in source” records for absent structures such as lung parenchyma.

**Acceptance:** no selected part can silently fall back to a neighboring group; outliers are reported and reviewed before release.

### Phase 28 — Anatomical framing and visual fidelity pass

**Goal:** Make the source reference consistent with professional atlas viewing conventions without pretending it is a clinical scan.

**Work:**

- Standardize anterior, posterior, lateral, superior, and inferior framing where the source supports it.
- Add orientation labels and a small orientation widget with a stable coordinate convention.
- Add calibrated lighting/material presets: neutral atlas, layer contrast, selected structure, and conceptual-overlay mode.
- Audit transparent-layer depth sorting, order-independent transparency risks, z-fighting, silhouette readability, and dark-background contrast.
- Add optional clipping plane or section view only after it is verified not to imply absent internal anatomy.

**Acceptance:** the 24-case review rubric passes for desktop and phone at all required orientations; human reviewers confirm that hidden/occluded structures are not misleadingly presented.

### Phase 29 — Occlusion-aware callouts and teaching-route geometry

**Goal:** Improve visual communication without turning conceptual arrows into literal anatomy.

**Work:**

- Replace bare endpoint boxes with screen-space leader lines, labels, and collision-aware placement.
- Add depth-aware anchor offsets and a route graph with authored waypoints, not only center-to-center polylines.
- Keep route lines in a clearly distinct conceptual layer with a legend and a “not literal transport” disclosure.
- Define policies for hidden targets, transparent layers, off-screen anchors, and overlapping labels.
- Add a route QA screenshot harness for each stage and viewport.

**Acceptance:** route paths do not cross critical source surfaces in approved review views; every route has at least one human-reviewed screenshot per stage.

### Phase 30 — Unified 3D gesture and selection model

**Goal:** Make rotation, pan, zoom, multi-touch, selection, and camera focus predictable across mouse, touch, pen, and keyboard.

**Work:**

- Add an explicit gesture arbiter: one-pointer turntable rotate, two-pointer pan/zoom, right-click or modifier pan, wheel zoom, and click/tap selection.
- Prevent a drag from firing selection; add movement threshold and pointer-cancel recovery.
- Add “focus selected structure,” “fit current layer,” “frame route,” and “reset orientation” actions.
- Add a pick-tolerance mode for small valves, vessels, nerves, and overlapping transparent parts.
- Add optional measurement mode only for educational relative distances/angles, clearly labeled as non-clinical.
- Preserve share links and make them restore camera, layer, selected part, and teaching stage deterministically.

**Acceptance:** a pointer/keyboard interaction matrix passes on Chromium desktop, touch emulation, a real phone, and a screen reader; selection accuracy is measured for small and occluded parts.

### Phase 31 — Structure-level accessible 3D parity

**Goal:** Bring the non-WebGL route closer to the semantics of the 3D viewer.

**Work:**

- Add a searchable, keyboard-selectable structure list for the currently loaded system/chunk.
- Expose part-level name, system, function, limitation, source ID, and selected-state announcements in a status/live region.
- Provide keyboard commands for rotate, pan, zoom, frame selection, next/previous structure, and layer visibility without requiring a `role="application"` interaction model.
- Verify WCAG 2.2 keyboard, pointer, dragging, target-size, focus-visible, status-message, and reduced-motion requirements.
- Ensure every motion-based teaching action has pause/step/reset and non-motion explanation.

**Acceptance:** accessibility review finds equivalent educational outcomes for common tasks in 3D and fallback routes; automated axe/keyboard checks are supplemented by manual keyboard and screen-reader review.

### Phase 32 — Physiology-backed animation state machines

**Goal:** Make animation events scientifically explainable and testable.

**Circulation:**

- Model atrial systole, isovolumetric contraction, ejection, isovolumetric relaxation, and filling as explicit states.
- Derive AV and semilunar valve transitions from pressure crossings with hysteresis or event thresholds to avoid flicker.
- Add separate normalized right- and left-sided pressure curves, pulmonary-trunk and aortic curves, and explicit flow direction.
- Keep chordae/papillary structures static unless an approved source supports their animation; use captions rather than decorative motion.
- Make the pulse marker represent route progression, not fluid volume or clinical velocity.

**Digestion:**

- Replace a continuously moving “food particle” implication with stage transitions, peristaltic-wave teaching cues, and explicit uncertainty/disclosure.
- Keep accessory organs off the alimentary route and show bile/enzyme support as side inputs.

**Acceptance:** unit tests cover state-transition ordering; source review confirms every caption and animation event; reduced motion produces an equivalent step-by-step state view.

### Phase 33 — Timeline, scrubbing, and animation explainability

**Goal:** Make animations learnable rather than merely decorative.

**Work:**

- Add a timeline scrubber with labeled events and a pause/step mode.
- Add “what changed?” narration in the adjacent panel when a valve opens/closes or a route advances.
- Synchronize chart cursor, 3D marker, color legend, and text state from one deterministic clock.
- Add replay/exportable state URLs for a specific phase and scenario.
- Add animation speed presets that do not change model semantics.

**Acceptance:** any animation state can be reached by reset + deterministic controls; screenshot and URL replay reproduce the same teaching state.

### Phase 34 — Rendering and asset-pipeline hardening

**Goal:** Improve visual quality and runtime cost without destabilizing the certified atlas.

**Work:**

- Keep the current packed atlas for BodyParts3D unless measurements prove migration beneficial.
- Establish an approved future-asset pipeline based on glTF 2.0, PBR metadata, mesh compression, and KTX2/Basis textures where licensing and offline packaging permit.
- Add per-device budgets for transfer, decoded CPU memory, GPU memory, draw calls, and frame-time p95.
- Add progressive LOD by visual importance, not only system name; keep selectable proxy metadata for unloaded parts.
- Measure first skeletal readiness, first focused-structure readiness, full requested-system readiness, and interaction FPS on representative desktop/phone profiles.

**Acceptance:** performance budgets are measured and versioned; no asset-format change is accepted without offline, license, visual, and mobile comparisons.

### Phase 35 — WebGL lifecycle and context-loss recovery

**Goal:** Survive mobile tab suspension, GPU resets, route changes, and repeated mount/unmount cycles.

**Work:**

- Listen for `webglcontextlost` and call `preventDefault()` where appropriate; move the UI to a recoverable status rather than silently freezing.
- Handle `webglcontextrestored` by rebuilding renderer-dependent materials, overlays, selection state, and loaded chunk meshes or by deterministic reloading from cache.
- Add idempotent renderer/session disposal and generation tokens so late chunk promises cannot attach to a destroyed scene.
- Evaluate `renderer.setAnimationLoop()` for the render-loop abstraction while retaining the current on-demand/visibility pause behavior where it is measurably better for battery.
- Add automated context-loss simulation using `WEBGL_lose_context` where the browser exposes it.

**Acceptance:** forced context loss, restore, tab hide/show, route switch, and 20 mount/unmount cycles leave no frozen canvas, duplicate listeners, stale overlays, or unreleased GPU resources.

### Phase 36 — Source candidate evaluation and approved-asset intake

**Goal:** Close the 3D-source process only through genuine entry-specific review.

**Work:**

- Review each candidate against scientific source/provenance, anatomical scope, license, attribution, visual quality, offline redistribution, file integrity, and performance.
- For imaging-derived entries, record segmentation method, source modality, resolution, orientation, and validation reviewer.
- Record rejected candidates and reasons; do not treat NIH 3D repository presence as automatic approval.
- Import only assets with a signed approval record and a generated attribution/notice file.

**Acceptance:** no candidate is loaded into runtime until all required review fields are approved; otherwise the strict gate remains blocked.

### Phase 37 — Human visual review and expert sign-off

**Goal:** Complete the 24-case review with real reviewers.

**Work:**

- Review each case on desktop and phone with the exact build hash.
- Check identity, camera framing, orientation, occlusion, contrast, marker tightness, route separation, motion, reduced motion, fallback, and source disclosure.
- Use at least one anatomy-knowledgeable reviewer for scientific placement and one interaction/accessibility reviewer for usability.
- Capture reviewer name/role, date, build, screenshots, disposition, and remediation notes.

**Acceptance:** every case is approved, conditionally approved with a tracked fix, or rejected with a remediation issue. Automated checks never set the approval field.

### Phase 38 — Learner and usability validation

**Goal:** Measure whether the improvements help learning and navigation.

**Work:**

- Define task measures: time to find a structure, selection error rate, orientation error, route-order accuracy, valve-state explanation accuracy, and fallback-task completion.
- Include novice learners and anatomy-informed reviewers; do not infer educational benefit from engagement alone.
- Compare 3D-only, 2D-only, and hybrid routes where appropriate.
- Record device type, input modality, prior 3D experience, and accessibility needs.
- Use a pre-registered rubric and report limitations; this is educational evaluation, not clinical validation.

**Acceptance:** a written usability/learning report identifies which interactions improve outcomes, which confuse learners, and which should remain optional.

### Phase 39 — Final release and maintenance governance

**Goal:** Make accuracy a continuing release property.

**Work:**

- Add the evidence ledger, visual approvals, source approvals, performance profile, accessibility report, and browser results to the release artifact.
- Make `verify:release` fail on missing expert sign-off, unapproved assets, missing attribution, unresolved visual issues, context-loss failures, or budget regressions.
- Version the atlas, semantic mappings, teaching specs, and source notices together.
- Add a change-impact matrix so a source update triggers the correct geometry, visual, animation, accessibility, and offline reviews.
- Maintain a visible “educational model / not clinical visualization” boundary.

**Acceptance:** the release report is green only when all gates are explicit and independently reviewable.

## Recommended execution order and priority

1. **P0 scientific trust:** Phases 26–29 and 32.
2. **P0 interaction/accessibility correctness:** Phases 30–31.
3. **P1 lifecycle/performance:** Phases 34–35.
4. **P0 approval gates:** Phases 36–37.
5. **P1 learning evidence:** Phase 38.
6. **Release governance:** Phase 39.

Do not begin importing new 3D candidates while Phases 36–37 are pending. Do not use a higher-fidelity material or animation pass to mask unresolved anatomy identity or source-provenance problems.

## Reference sources

- BodyParts3D description: https://dbarchive.biosciencedbc.jp/en/bodyparts3d/desc.html
- BodyParts3D license: https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html
- NIH 3D FAQ: https://3d.nih.gov/faqs
- NIH 3D terms: https://3d.nih.gov/terms
- OpenStax cardiac cycle: https://openstax.org/books/anatomy-and-physiology-2e/pages/19-chapter-review
- DICOM Surface Segmentation: https://dicom.nema.org/medical/Dicom/2024d/output/html/part03.html
- WCAG 2.2: https://www.w3.org/TR/WCAG22/
- WCAG 2.2 quick reference: https://www.w3.org/WAI/WCAG22/quickref/
- Three.js WebGLRenderer: https://threejs.org/docs/pages/WebGLRenderer.html
- Three.js OrbitControls: https://threejs.org/docs/pages/OrbitControls.html
- MDN WebGL context loss: https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/webglcontextlost_event
- Khronos glTF 2.0: https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html
- PubMed anatomy visualization review: https://pubmed.ncbi.nlm.nih.gov/32488639/
- PubMed interactive 3D model validation study: https://pubmed.ncbi.nlm.nih.gov/39653143/
