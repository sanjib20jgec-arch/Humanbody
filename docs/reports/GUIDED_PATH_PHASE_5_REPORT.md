# Guided Path Phase 5 report

Date: 2026-09-27
Project: Human Biology Lab

## Scope completed

Phase 5 extends the Phase 4 structure-to-process links into synchronized teaching sequences for Circulation and Digestion. The existing source mesh, simulation engines, quiz flow, and module architecture remain separate and intact.

### Circulation vertical slice

Added a four-stage double-circulation sequence:

1. Body → right side
2. Right side → lungs
3. Lungs → left side
4. Left side → body

The sequence is connected to the same `selectedChamber` state used by:

- BodyParts3D structure search
- Source-mesh selection
- The InfoPanel
- The structure-to-flow explanation

Selecting a sequence stage updates the selected chamber, oxygen-status language, route explanation, and next-concept text together. This keeps the source-reference object and the educational flow state visibly related without implying that the source mesh itself contains the animated physiology model.

### Digestion vertical slice

Added a five-stage pathway sequence:

1. Mouth
2. Esophagus
3. Stomach
4. Small intestine
5. Large intestine

The sequence is connected to the same state used by:

- BodyParts3D structure search
- Digestive structure classification
- The pathway stage InfoPanel
- Food-progress state in the simulation view

Selecting a pathway stage updates the selected structure, stage explanation, pathway progress, and simulation checkpoint position together. Accessory structures remain explicitly classified as accessory organs and do not become part of the food route.

### Accessibility and responsive behavior

- Sequence controls are keyboard and touch buttons rather than drag-only interactions.
- Active stages expose `aria-pressed` state.
- The sequence remains horizontally scrollable on narrow layouts.
- Existing reduced-motion behavior and accessible 2D anatomy fallback remain unchanged.

## Verification passed

```text
npm run verify
Full static and offline verification passed

npm run verify:browser
30 passed
  - Chromium desktop: 15 passed
  - Chromium phone: 15 passed
```

The browser contract verifies orientation selection, source-structure selection, Circulation stage synchronization, Digestion stage synchronization, and mobile tool access.

## Files updated

- `src/simulations/CirculationLab.jsx`
- `src/simulations/DigestiveLab.jsx`
- `src/styles.css`
- `tests/browser/phase4-anatomy.spec.mjs`

## Deliberate boundaries

This phase does not claim that the BodyParts3D mesh contains animated blood or food. The source mesh remains a macro-anatomy reference; route, pressure, bolus, pH, enzyme, and absorption behavior remain clearly labelled teaching models.

Still deferred:

- Mesh-linked chamber/organ highlight overlays during each route stage
- A synchronized animated flow overlay over the source heart mesh
- A synchronized animated bolus overlay over the source digestive mesh
- Detailed per-structure camera focal points beyond shared orientation presets
- Expert visual sign-off for every label and overlay relationship
- Separate reviewed 3D sources for Cell Structure, Tissues, and Heredity

## Build note

Vite continues to emit the existing advisory that the Three.js vendor chunk exceeds 500 kB. Production and offline builds complete successfully. Existing lung-parenchyma and spinal-cord-parenchyma QC notes remain unchanged.
