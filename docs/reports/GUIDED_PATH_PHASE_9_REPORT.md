# Guided Path Phase 9 report

Date: 2026-09-27
Project: Human Biology Lab

## Scope completed

Phase 9 upgrades atlas selection from a system-level material flash to a part-level semantic selection state. The existing merged atlas remains intact, but the selected source structure is now isolated from its merged geometry group for a temporary exact-surface highlight.

### Exact semantic selection

When a learner searches for or selects a source structure:

1. Raycast face data resolves to the owning merged-geometry group.
2. The group metadata identifies the exact source part rather than only its body system.
3. The selected group's indexed position and normal attributes are copied into a temporary exact selection geometry.
4. The temporary surface overlay is rendered with a restrained cyan teaching highlight.
5. The existing bounds-derived outline remains as a stable orientation cue.
6. Both overlays are disposed before the next selection and on manager teardown.

This prevents an unrelated chamber, valve, vessel, or connective structure in the same merged system from being recolored as though it were selected.

### Learner-facing state

The anatomy hotspot now explicitly labels a resolved atlas result as `PART-LEVEL SELECTION`, alongside the source structure name, FMA identifier, function, and educational-model disclosure.

### Preservation of existing behavior

- Search still loads an unloaded atlas chunk before resolving the result.
- Low-detail LOD proxies remain system-level and do not claim per-triangle precision.
- Teaching route markers and pressure-state valve markers are unchanged.
- Reduced-motion, accessible 2D mode, orientation presets, source disclosures, and the separate Motion-Fall project remain unchanged.

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

The Phase 4 anatomy browser contract now also verifies that a searched left-ventricle result reports `PART-LEVEL SELECTION` and the resolved source structure in the anatomy hotspot.

## Files updated

- `src/lib/AnatomySceneManager.js`
- `src/components/BodyMap3DAtlas.jsx`
- `tests/browser/phase4-anatomy.spec.mjs`
- `scripts/anatomy-registry-smoke.mjs`

## Deliberate boundaries

Exact selection is available for loaded high-detail atlas meshes. It does not claim per-triangle semantic meaning for low-detail LOD proxy boxes or for the simplified accessible 2D diagram. The highlight is an educational selection aid, not a clinical segmentation or diagnostic boundary.

Still deferred:

- Simultaneous live coupling while the source reference and full CardioPhysiologyEngine view are mounted together
- Pressure-gradient animation on every individual valve
- Expert visual sign-off for marker placement at all orientations and device sizes
- Separate reviewed 3D sources for Cell Structure, Tissues, and Heredity

## Build note

Vite continues to emit the existing advisory that the Three.js vendor chunk exceeds 500 kB. Production and offline builds complete successfully. Existing lung-parenchyma and spinal-cord-parenchyma QC notes remain unchanged.
