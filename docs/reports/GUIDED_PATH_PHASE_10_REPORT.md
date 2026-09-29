# Guided Path Phase 10 report

Date: 2026-09-27
Project: Human Biology Lab

## Scope completed

Phase 10 mounts the certified heart reference and the full CardioPhysiologyEngine view together during Circulation simulation. The source mesh remains the structural reference while the adjacent engine supplies the educational phase, pulse, and valve state.

### Simultaneous live coupling

The Simulate view now contains:

- The full CardioPhysiologyEngine panel with pressure curves, metrics, controls, and 3D heart preview
- A separate Live Coupled Reference panel containing the BodyParts3D heart and major-vessel atlas
- A clear disclosure that the source mesh is not animated anatomy
- A clear disclosure that pulse and valve state come from the separate educational coupling

The same engine snapshot drives both the model readouts and the reference overlay. Running, pausing, stepping, resetting, changing a scenario preset, or changing a model parameter updates the live reference state.

### Phase-aware reference state

The live reference maps the engine snapshot to:

- Current cardiac-cycle route stage
- Normalized pulse phase
- Open/closed mitral, tricuspid, aortic, and pulmonary valve markers
- Live phase text in the reference overlay note

### Geometry rebuild protection

Model ticks do not rebuild route geometry, source markers, or atlas meshes. `AnatomySceneManager` now computes a structural overlay key. When only phase or running state changes, it updates the existing pulse in place through `setTeachingOverlayPhase()`.

Geometry is rebuilt only when the overlay's structural inputs change, such as active stage, marker state/color, route definitions, or atlas content.

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

A dedicated contract is in `tests/browser/phase10-circulation-coupling.spec.mjs` and verifies the live reference is mounted with the CardioPhysiologyEngine, exposes coupling disclosure text, and responds to Run model.

## Files updated

- `src/lib/AnatomySceneManager.js`
- `src/simulations/CirculationLab.jsx`
- `src/styles.css`
- `scripts/anatomy-registry-smoke.mjs`
- `tests/browser/phase10-circulation-coupling.spec.mjs`

## Deliberate boundaries

The live coupling is a teaching synchronization, not animated source anatomy, a clinical monitor, or patient-specific inference. BodyParts3D remains a static adult-male macro-anatomy reference. Valve markers communicate the educational model's state and do not imply source-mesh physiology.

Still deferred:

- Per-valve pressure-gradient animation beyond current state markers
- Expert visual sign-off for marker placement at all orientations and device sizes
- Separate reviewed 3D sources for Cell Structure, Tissues, and Heredity

## Build note

Vite continues to emit the existing advisory that the Three.js vendor chunk exceeds 500 kB. Production and offline builds complete successfully. Existing lung-parenchyma and spinal-cord-parenchyma QC notes remain unchanged.
