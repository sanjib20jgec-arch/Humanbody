# Guided Path Phase 8 report

Date: 2026-09-27
Project: Human Biology Lab

## Scope completed

Phase 8 adds pressure-state teaching detail to the source-linked Circulation experience and extends fine-grained semantic markers to valve structures.

### Pressure and valve teaching state

The Circulation reference bay now exposes a pressure-state panel showing:

- Current educational cardiac-cycle phase
- Plain-language pressure-gradient explanation
- Current open-valve summary
- Explicit note that the state comes from the educational pressure model

The state is sourced from `CardioPhysiologyEngine` snapshots and remains separate from clinical measurement or diagnosis.

### Valve source markers

The active Circulation reference overlay now marks source-attributed valve structures:

- Mitral valve
- Tricuspid valve
- Aortic valve
- Pulmonary valve

Marker color and opacity distinguish the model's current open/closed state. Markers use loaded source bounds and follow the same anatomy-root transform as the mesh and route overlay.

### Overlay infrastructure refinement

Teaching overlays now support marker specifications with:

- Query target
- State label
- Color
- Opacity
- Scale

This preserves per-structure semantics without replacing the merged atlas geometry or module architecture.

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
- `src/components/ReferenceObject3D.jsx`
- `src/simulations/CirculationLab.jsx`
- `src/styles.css`
- `scripts/anatomy-registry-smoke.mjs`
- `tests/browser/phase4-anatomy.spec.mjs`

## Deliberate boundaries

The pressure panel and valve markers are educational model outputs. They do not imply clinical measurements, patient-specific inference, or diagnosis. Source anatomy remains distinct from the explanatory pressure model.

Still deferred:

- Per-triangle semantic selection for every merged atlas part
- Simultaneous live coupling while the source reference and full CardioPhysiologyEngine view are mounted together
- Pressure-gradient animation on every individual valve
- Expert visual sign-off for marker placement at all orientations and device sizes
- Separate reviewed 3D sources for Cell Structure, Tissues, and Heredity

## Build note

Vite continues to emit the existing advisory that the Three.js vendor chunk exceeds 500 kB. Production and offline builds complete successfully. Existing lung-parenchyma and spinal-cord-parenchyma QC notes remain unchanged.
