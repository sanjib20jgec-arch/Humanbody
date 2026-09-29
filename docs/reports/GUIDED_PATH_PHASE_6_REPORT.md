# Guided Path Phase 6 report

Date: 2026-09-27
Project: Human Biology Lab

## Scope completed

Phase 6 adds real Three.js teaching overlays that are anchored to loaded BodyParts3D reference metadata rather than floating as an unrelated 2D diagram.

### Mesh-linked overlay infrastructure

`AnatomySceneManager` now supports a teaching-overlay contract that:

- Finds source structure anchors from loaded manifest metadata and source bounds
- Builds overlay lines in the same anatomy root coordinate space as the source meshes
- Keeps overlays aligned while the learner rotates, zooms, pans, or selects orientation presets
- Highlights the active segment and dims inactive route segments
- Animates a Three.js pulse marker along the active route
- Disables pulse animation when reduced motion is enabled
- Disposes overlay geometry and materials with the atlas manager
- Rebuilds the overlay when additional on-demand anatomy chunks become available

The overlay is intentionally conservative: it only uses source-linked anchors that exist in the loaded atlas. It does not invent missing lung parenchyma, microscopic anatomy, or clinical measurements.

### Circulation source-linked flow overlay

The heart reference bay now supplies four source-anchor routes:

- Superior vena cava → right atrium
- Right atrium → right ventricle → pulmonary trunk
- Pulmonary veins → left atrium → left ventricle
- Left ventricle → ascending aorta

The active overlay follows the same chamber state as the Circulation teaching sequence and is disclosed as an animated oxygen-status teaching route.

### Digestion source-linked bolus overlay

The digestive reference bay now supplies five source-anchor routes:

- Tongue/esophagus entry
- Esophagus → stomach
- Stomach → duodenum
- Duodenum → jejunum → ileum
- Colon → rectum

The active overlay follows the same pathway stage as the Digestion teaching sequence and is disclosed as a simplified bolus teaching model.

### Disclosure and accessibility

The reference panel now exposes a visible teaching-overlay note so learners can distinguish:

- Source mesh
- Source-linked route overlay
- Simplified physiology or bolus model

The existing accessible 2D mode, keyboard controls, touch interaction, reduced-motion behavior, and provenance disclosures remain available.

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
- `src/components/BodyMap3DAtlas.jsx`
- `src/components/ReferenceObject3D.jsx`
- `src/simulations/CirculationLab.jsx`
- `src/simulations/DigestiveLab.jsx`
- `src/styles.css`
- `scripts/anatomy-registry-smoke.mjs`
- `tests/browser/phase4-anatomy.spec.mjs`

## Deliberate boundaries

The overlay is an explanatory source-linked route, not a medical visualization. It does not claim that the BodyParts3D mesh contains animated blood, food, pressure, pH, enzyme chemistry, or absorption. Those remain separate learning models.

Still deferred:

- Fine-grained per-chamber and per-organ mesh highlighting instead of bounds-derived anchor routes
- Pressure-driven flow pulses synchronized to the CardioPhysiologyEngine waveform
- Bolus pulse timing synchronized to the Digestive food-progress animation while both views are mounted
- Source-linked alveolar, spinal-cord-parenchyma, and other absent-mesh overlays
- Expert visual sign-off for route placement at all orientations and phone sizes
- Separate reviewed 3D sources for Cell Structure, Tissues, and Heredity

## Build note

Vite continues to emit the existing advisory that the Three.js vendor chunk exceeds 500 kB. Production and offline builds complete successfully. Existing lung-parenchyma and spinal-cord-parenchyma QC notes remain unchanged.
