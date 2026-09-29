# Guided Path 3D reference-object replacement plan

**Status:** Approved full rollout. Six macro-anatomy bays now use the reusable source-derived reference-object layer; static and browser verification are green. Visual expert review and the separate Cell Structure, Tissues, and Heredity source decisions remain.

## Goal

Replace the current childlike, hand-built visual objects in the Guided Learning Path with anatomically grounded, source-attributed 3D reference objects wherever a credible 3D source exists.

The replacement must improve scientific accuracy without turning the Guided Path into a static atlas. Every object remains interactive, labelled, keyboard-accessible, touch-safe, responsive, and compatible with reduced-motion preferences.

## Approved rollout progress

- Added reusable `ReferenceObject3D` around the existing BodyParts3D atlas renderer.
- Added focused-system loading, source-mesh bounds framing, 360° object rotation, touch gestures, labels/hotspot selection, reset, and accessible fallback support.
- Integrated focused source-derived objects into Circulation, Digestion, Brain & Nerves, Respiration, Excretion, and Reproduction Explore views.
- Preserved separate process models and explicit limitations for circulation pressure, food chemistry, reflex pathways, alveoli, nephron function, gametes, and cycle timing.
- Cell Structure, Tissues, and Heredity still require separate reviewed cellular, histology, or molecular 3D sources; their current conceptual models must not be presented as clinical anatomy.

## Non-negotiable product rules

1. A real anatomical 3D asset is preferred over additional primitive CSS/SVG geometry.
2. The interface must identify the source, license, orientation, and known limitations of every asset.
3. A source mesh must not be presented as universal anatomy if it is an adult-male reference.
4. A process model must not be disguised as anatomy. Structure, process, and outcome remain visually distinct.
5. No module may become blank while a 3D asset loads. The existing meaningful loading state and accessible fallback remain required.
6. 3D interaction must never depend on hover. Selection, labels, and feedback must work with pointer, touch, keyboard, and screen-reader text.
7. Reduced motion disables idle rotation and automatic motion but preserves manual rotation, step controls, labels, reset, and learning content.

## Source strategy

### Primary anatomical source

Use the existing **BodyParts3D 4.0** atlas wherever its certified mesh coverage is sufficient. The current atlas already provides demand-loaded chunks, system metadata, source attribution, and adult-male limitation copy.

- Existing source: `public/models/atlas.json` and `public/models/body-*.bin.gz`
- Existing renderer/data layer: `src/lib/AnatomySceneManager.js` and `src/components/BodyMap3DAtlas.jsx`
- Existing attribution: `public/ATTRIBUTION-BodyParts3D.md`
- Reuse the atlas source and license metadata; do not duplicate or silently recolor a mesh into a new unlicensed asset.

### Educational reference authority

Use OpenStax Anatomy & Physiology 2e for terminology, structure/function explanations, orientation, pathway order, and labels. OpenStax figures can remain as reference plates where a 3D asset cannot represent a process accurately, but they should not be mistaken for 3D anatomy.

### Coverage gaps

If BodyParts3D does not contain an appropriate structure, use a separate reputable/open source only after a source and license review. If no suitable source exists, retain a clearly labelled simplified teaching model rather than inventing a fake realistic object.

Known current limitation: the atlas has no lung-parenchyma mesh and has limited spinal-cord parenchyma coverage. Those areas must remain explicitly labelled as focused teaching models or atlas limitations.

## Proposed module rollout

### Phase 1 — MVP priority

#### Circulation

- Replace the current CSS heart object with a BodyParts3D-derived heart/chamber/vessel object where the atlas coverage supports it.
- Provide anterior, lateral, and posterior reset views where the geometry and labels support them.
- Label right atrium, right ventricle, left atrium, left ventricle, valves, aorta, venae cavae, pulmonary trunk/arteries, and pulmonary veins using mesh-linked metadata.
- Keep the pulmonary/systemic circuit explanation and pressure-driven simulation separate from the reference mesh.
- Preserve chamber and valve selection, oxygen-status explanation, and cardiac simulation controls.

#### Human Digestion

- Replace the current primitive tract with BodyParts3D-derived digestive organs and accessory organs where available.
- Establish a stable orientation and layer set for mouth/pharynx, esophagus, stomach, liver, gallbladder, pancreas, small intestine, large intestine, rectum, and anus.
- Keep the food-bolus animation as a process overlay following a validated mouth → esophagus → stomach → small intestine → large intestine route.
- Distinguish alimentary-canal structures from accessory organs in both the 3D layer controls and the accessible text equivalent.
- Preserve stage controls, pH visualization, enzyme model, and reset behavior.

#### Brain & Nerves

- Replace primitive brain/CNS silhouettes with source-derived brain and nervous-system meshes where the atlas supports them.
- Keep the reflex arc as a separate labelled process overlay, not as a claim that the atlas contains a complete spinal-cord parenchyma mesh.
- Retain the current technically accurate wording for sensory neuron, spinal interneuron/synapse, motor neuron, and effector muscle.

### Phase 2 — remaining macro-anatomy bays

- **Respiration:** source-derived airway and pulmonary-vessel geometry; retain a clearly labelled alveoli/lung-parenchyma teaching model until a suitable licensed mesh exists.
- **Excretion:** source-derived kidneys and urinary structures with a separate nephron process model if the atlas does not provide microscopic nephron geometry.
- **Reproduction:** source-derived reproductive macro-anatomy only where coverage is sufficient; keep gamete and cycle models as labelled process/microscopic models.
- **Tissues:** do not force macro-anatomy assets; use source-attributed conceptual or histology-appropriate 3D assets only after review.
- **Cell Structure:** do not use human macro-anatomy assets; source or commission a separately licensed cellular 3D model and label scale as conceptual/not-to-scale.
- **Heredity:** keep chromosome/allele/Punnett content as a molecular teaching model unless a reviewed 3D molecular source is available.

## 3D interaction contract

Each 3D reference object must provide:

- 360° horizontal rotation by pointer drag and one-finger touch drag;
- vertical orbit with a safe pitch limit so the object cannot disappear;
- pinch zoom and two-finger pan on touch devices;
- keyboard rotation with arrow keys, zoom with `+`/`-`, and `R` or a visible Reset view control;
- labelled preset views such as anterior, lateral, and posterior when appropriate;
- visible `Labels`, `Layers`, `Reset view`, and `Accessible 2D` controls;
- touch-safe hit targets and selection feedback without hover;
- stable focus rings and an accessible current-selection status;
- no idle rotation under reduced motion;
- cleanup on module change, page hide/show, and unmount.

## Labeling and accessibility contract

- Labels attach to structure metadata, not arbitrary screen coordinates.
- Labels use leader lines or callouts that avoid covering the mesh where possible.
- Labels remain readable at phone, tablet, and desktop sizes.
- Occluded structures have a text/list alternative; learners can select a structure from the list even when it is hidden behind another mesh.
- Every 3D object has an accessible text equivalent describing orientation, selected structure, source, and limitation.
- Source, license, adult-male limitation, and simplified/process-model disclosures remain reachable in context.
- Visual emphasis must not depend on color alone.

## Loading and performance contract

- Reuse demand-loaded atlas chunks; do not load the complete atlas for a single Guided Path bay.
- Show an explicit progress state while the first meaningful source chunk is fetched.
- The first usable state remains the skeletal layer or a meaningful source-derived object, never a blank viewport.
- Define per-bay geometry, transfer, decode, and frame-time budgets before adding new meshes.
- Dispose geometries, materials, renderers, animation frames, and event listeners when leaving a bay.
- Keep a static source plate or accessible 2D view as a graceful fallback when WebGL or mesh coverage fails.

## Validation plan

For each converted bay, complete all of the following before sign-off:

1. Confirm every visible structure against the source manifest and a reputable reference.
2. Verify anterior/posterior, superior/inferior, left/right, vessel/organ, and accessory-organ relationships.
3. Check that labels select the intended mesh and remain usable when layers overlap.
4. Test 360° mouse rotation, touch rotation, pinch zoom, two-finger pan, keyboard rotation, preset views, and Reset.
5. Test touch selection without hover and keyboard focus order.
6. Test automatic playback, paused state, manual Step, Reset, and reduced-motion behavior.
7. Test phone portrait, phone landscape, tablet, desktop, narrow labels, and WebGL failure fallback.
8. Capture visual-review screenshots at desktop and phone sizes.
9. Record source, license, limitations, and expert-review notes in the module audit.
10. Run `npm run verify` plus the browser suite where Chromium is available.

## Acceptance criteria

This proposal is complete only when:

- the Guided Path no longer presents primitive cartoon objects as if they were anatomy;
- the Circulation and Digestion MVP bays use source-derived 3D reference objects or an explicitly approved, source-attributed fallback;
- each source-derived object supports 360° rotation, touch gestures, labels, reset, and accessible selection;
- every process animation is visibly separate from the anatomical reference object;
- source/license/limitation disclosures are visible or one action away;
- reduced-motion and WebGL fallback paths remain functional;
- browser screenshots show accurate, non-overlapping labels at desktop and phone sizes;
- automated and browser verification pass;
- the user approves the visual review before the next module batch begins.

## Remaining implementation sequence

1. Perform browser visual review of the six converted macro-anatomy bays at desktop and phone sizes.
2. Verify mesh-specific label placement and structure selection against source IDs for each bay.
3. Add reviewed cellular, histology, and molecular 3D assets for Cell Structure, Tissues, and Heredity only if reputable licensed sources are identified.
4. Otherwise, revise those three conceptual models to be visibly scientific teaching models rather than pseudo-realistic objects.
5. Keep `npm run verify` and the 28-test desktop/phone browser matrix green after every asset batch, then present desktop/phone screenshots for final approval.
