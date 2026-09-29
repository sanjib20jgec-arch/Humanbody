# Guided Path Phase 13 report

Date: 2026-09-27
Project: Human Biology Lab

## Scope completed

Phase 13 adds reviewed conceptual-source provenance for the three modules that intentionally do not claim a certified 3D anatomy asset: Cell Structure, Tissues, and Heredity.

### Reviewed conceptual source records

Added a data-driven source review ledger with:

- Source title and URL
- CC BY 4.0 attribution
- Module-specific scope of use
- Explicit 3D approval status

The reviewed references are:

- Cell Structure: OpenStax Anatomy & Physiology 2e, The Cytoplasm and Cellular Organelles
- Tissues: OpenStax Anatomy & Physiology 2e, Types of Tissues
- Heredity: OpenStax Biology 2e, Characteristics and Traits

### Learner-facing provenance notes

Each of the three Explore bays now displays a `REVIEWED CONCEPTUAL SOURCE` note. It explains what the source supports and explicitly states that no reviewed 3D source has been approved for that module.

This keeps conceptual models useful without allowing a learner to infer that the cell, tissue, or heredity visuals are certified 3D anatomy assets.

### Validation

The anatomy registry smoke test now validates the conceptual source ledger in addition to the existing source-reference registry. A new browser contract checks all three bays on desktop and phone layouts.

## Verification passed

```text
npm run verify
Full static and offline verification passed

npm run verify:browser
34 passed
  - Chromium desktop: 17 passed
  - Chromium phone: 17 passed

npm run verify:anatomy-registry
Anatomy registry smoke passed (8 entries)

npm run verify:teaching-overlays
Teaching overlay QC passed (16 source anchors)
```

## Files updated

- `src/data/learningSources.js`
- `src/components/ConceptualSourceNote.jsx`
- `src/simulations/CellLab.jsx`
- `src/simulations/TissuesLab.jsx`
- `src/simulations/HeredityLab.jsx`
- `src/styles.css`
- `scripts/anatomy-registry-smoke.mjs`
- `tests/browser/phase13-source-provenance.spec.mjs`

## Deliberate boundaries

This phase adds conceptual-source provenance only. It does not add or imply a reviewed 3D asset for Cell Structure, Tissues, or Heredity. Human visual review of the Circulation and Digestion markers is still required before those overlays can be described as expert-approved.

Still deferred:

- Human expert visual sign-off for marker placement, occlusion, contrast, and mobile framing
- Separate reviewed 3D sources for Cell Structure, Tissues, and Heredity

## Build note

Vite continues to emit the existing advisory that the Three.js vendor chunk exceeds 500 kB. Production and offline builds complete successfully. Existing lung-parenchyma and spinal-cord-parenchyma QC notes remain unchanged.
