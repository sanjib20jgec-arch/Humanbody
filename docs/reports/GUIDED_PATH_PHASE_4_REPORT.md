# Guided Path Phase 4 report

Date: 2026-09-27
Project: Human Biology Lab

## Scope completed

Phase 4 adds explicit anatomical orientation presets and connects selected source structures to the existing Circulation and Digestion teaching models without replacing the module architecture or simulation engines.

### Per-reference anatomical framing

The anatomy registry is now version 2 and source-reference entries declare:

- Anterior orientation
- Lateral orientation
- Posterior orientation

`ReferenceObject3D` passes the registry orientation contract into `BodyMap3DAtlas`.

The focused 3D reference viewer now provides:

- Anterior, Lateral, and Posterior orientation buttons
- Pressed-state feedback for the active preset
- Automatic focused-object framing after the source system loads
- Manual drag and keyboard rotation after preset selection
- Reset behavior that restores the focused reference framing
- Custom-state tracking when the learner manually rotates away from a preset

Presets remain available on desktop and phone layouts and do not remove the accessible 2D route.

### Circulation structure-to-flow state

Added a compact state panel below the heart reference object. The panel updates when the learner selects a chamber or valve from the source atlas or searches for a structure.

It communicates:

- Current teaching state, such as `Send to body` or `Return from lungs`
- Oxygen status
- A four-step route sequence
- The next concept in the route
- The distinction between the source mesh and the pressure/flow teaching model

Existing chamber selection, blood-component exploration, simulation controls, and quiz behavior remain intact.

### Digestion structure-to-process state

Added a compact state panel below the digestive reference object. Source-structure selection now maps to the appropriate digestive pathway stage for the existing learning model.

The panel communicates:

- Selected structure
- Alimentary-canal versus accessory-organ classification
- Pathway stage
- Structure-specific function
- Whether the current state represents food route or accessory support

The source atlas remains distinct from the bolus, pH, enzyme, absorption, and kinetics teaching models.

## Verification passed

```text
Anatomy registry smoke passed (8 entries)
Full static verification passed
Guided Path and anatomy browser contracts passed: 30/30
  - Chromium desktop: 15 passed
  - Chromium phone: 15 passed
```

The added Phase 4 browser contract verifies both orientation presets and structure-to-process updates for Circulation and Digestion.

## Files added or updated

- `src/data/anatomyRegistry.js`
- `src/components/BodyMap3DAtlas.jsx`
- `src/components/ReferenceObject3D.jsx`
- `src/simulations/CirculationLab.jsx`
- `src/simulations/DigestiveLab.jsx`
- `src/styles.css`
- `scripts/anatomy-registry-smoke.mjs`
- `tests/browser/phase4-anatomy.spec.mjs`

## Deferred to later phases

- Structure-specific camera distance or focal-point presets beyond the shared three orientation views
- Route-specific mesh highlighting and multi-structure synchronized selection
- Full Circulation chamber/valve vertical slice with animated flow overlays tied to the source mesh
- Full Digestion bolus-route vertical slice synchronized with source-organ selection
- Expert visual sign-off on every orientation and label placement
- Separate reviewed 3D source decisions for Cell Structure, Tissues, and Heredity

## Build note

Vite continues to emit the existing advisory that the Three.js vendor chunk exceeds 500 kB. The production and offline builds complete successfully. The established lung-parenchyma and spinal-cord-parenchyma QC notes remain unchanged.
