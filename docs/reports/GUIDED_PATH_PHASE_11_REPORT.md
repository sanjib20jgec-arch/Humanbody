# Guided Path Phase 11 report

Date: 2026-09-27
Project: Human Biology Lab

## Scope completed

Phase 11 adds relative valve-gradient teaching animation to the live Circulation reference. Valve markers now communicate not only open/closed state but also the current normalized pressure-gradient strength from the CardioPhysiologyEngine.

### Normalized valve gradients

Each cardiac snapshot now includes a `valveGradients` object for:

- Mitral valve
- Tricuspid valve
- Aortic valve
- Pulmonary valve

These values are normalized educational relationships derived from the model waveform. They are explicitly not clinical pressure measurements.

### Animated source-linked valve markers

The live source reference now updates each valve marker in place:

- Marker color follows open/closed teaching state.
- Marker opacity reflects relative normalized gradient strength.
- Marker scale gently responds to gradient energy while the model is running.
- Marker animation pauses under reduced-motion or when the model is paused.
- Model ticks update marker materials and transforms without rebuilding route geometry or atlas meshes.

### UI readout

The CardioPhysiologyEngine valve readout now includes a relative gradient percentage for each valve, keeping the visual marker state inspectable in text as well as in 3D.

## Verification passed

```text
npm run verify
Full static and offline verification passed

npm run verify:browser
32 passed
  - Chromium desktop: 16 passed
  - Chromium phone: 16 passed

npm run verify:anatomy-registry
Anatomy registry smoke passed (8 entries)
```

The Phase 10 browser contract now also verifies that the valve readout exposes a relative gradient percentage.

## Files updated

- `src/lib/CardioPhysiologyEngine.js`
- `src/lib/AnatomySceneManager.js`
- `src/simulations/CirculationLab.jsx`
- `tests/browser/phase10-circulation-coupling.spec.mjs`
- `scripts/anatomy-registry-smoke.mjs`

## Deliberate boundaries

Gradient values and animations are explanatory model outputs. They do not attribute physiology to BodyParts3D, imply clinical measurements, or support diagnosis. The source mesh remains static anatomy with an educational overlay.

Still deferred:

- Expert visual sign-off for marker placement at all orientations and device sizes
- Separate reviewed 3D sources for Cell Structure, Tissues, and Heredity

## Build note

Vite continues to emit the existing advisory that the Three.js vendor chunk exceeds 500 kB. Production and offline builds complete successfully. Existing lung-parenchyma and spinal-cord-parenchyma QC notes remain unchanged.
