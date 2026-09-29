# Guided Path Phase 7 report

Date: 2026-09-27
Project: Human Biology Lab

## Scope completed

Phase 7 refines the source-linked overlays with fine-grained structure markers and model-phase synchronization while preserving the existing separation between reference anatomy and explanatory physiology.

### Fine-grained source structure markers

Active Circulation and Digestion route stages now add a Three.js outline marker around the selected source structure or organ when that structure exists in the loaded atlas.

Examples:

- Right ventricle during the pulmonary-send stage
- Left ventricle during the systemic-send stage
- Stomach during the stomach stage
- Duodenum during the small-intestine stage
- Colon during the large-intestine stage

Markers are derived from source manifest bounds, share the anatomy root transform, and remain aligned during rotation, pan, zoom, and orientation changes. Marker geometry and materials are disposed with the overlay.

### Circulation phase synchronization

`CardioPhysiologyEngine` snapshots now retain the current normalized cycle phase and running state. The latest phase is carried into the Circulation reference bay so its route pulse can resume at the saved cardiac-cycle position after moving between Simulate and Explore.

The overlay continues to disclose that this is an educational oxygen-status route, not an animated clinical visualization.

### Digestion phase synchronization

The Digestion reference bay carries the saved food-progress fraction into its source-linked bolus overlay. When learners switch between the pathway and simulation views, the active pulse resumes at the corresponding teaching phase.

The overlay remains paused when the teaching simulation is paused and remains disabled under reduced motion.

### Preset stability

Automatic focused framing no longer overwrites a learner-selected Anterior, Lateral, Posterior, or custom orientation when delayed anatomy chunks finish loading.

## Verification passed

```text
npm run verify
Full static and offline verification passed

npm run verify:browser
30 passed
  - Chromium desktop: 15 passed
  - Chromium phone: 15 passed

npm run verify:anatomy-registry
Anatomy registry smoke passed (8 entries)
```

## Files updated

- `src/lib/AnatomySceneManager.js`
- `src/lib/CardioPhysiologyEngine.js`
- `src/components/BodyMap3DAtlas.jsx`
- `src/simulations/CirculationLab.jsx`
- `src/simulations/DigestiveLab.jsx`
- `scripts/anatomy-registry-smoke.mjs`
- `tests/browser/phase4-anatomy.spec.mjs`

## Deliberate boundaries

The synchronized pulse is still an explanatory model. It does not claim that BodyParts3D contains animated blood or food, and it does not expose clinical measurements or predictions.

Still deferred:

- Full per-triangle semantic mesh selection for every chamber and organ
- Direct frame-by-frame coupling while both source reference and simulation canvases are mounted simultaneously
- Pressure-gradient overlay states for every valve
- Expert visual sign-off for marker placement at all orientations and device sizes
- Separate reviewed 3D sources for Cell Structure, Tissues, and Heredity

## Build note

Vite continues to emit the existing advisory that the Three.js vendor chunk exceeds 500 kB. Production and offline builds complete successfully. Existing lung-parenchyma and spinal-cord-parenchyma QC notes remain unchanged.
