# Guided Path Phase 12 report

Date: 2026-09-27
Project: Human Biology Lab

## Scope completed

Phase 12 adds a source-anchor quality gate for the Guided Path overlays. The gate verifies that every Circulation and Digestion route query used for bounds-derived markers resolves to a certified atlas part with finite, non-zero bounds.

### Source-anchor QC

The automated check covers 16 anchors:

- 12 Circulation anchors, including four chambers, major vessels, and four valve queries
- 4 Digestion anchors, including esophagus, stomach, duodenum, and colon

The report records both the teaching query and the resolved atlas part. For example, the generic `mitral valve` teaching query resolves to the certified `Anterior leaflet of mitral valve` part, while `colon` resolves to `Ascending colon`.

### Review boundary

This phase deliberately does not claim expert visual sign-off. Automated bounds validation cannot establish that a marker is visually ideal at every orientation, that it remains unobscured at every device size, or that its color contrast is sufficient in every lighting condition.

The generated QC report is intended to make expert review faster and auditable by ensuring that review starts from valid source anchors rather than missing or fallback geometry.

### Existing visual contracts preserved

- Orientation presets remain Anterior, Lateral, and Posterior for source references.
- Exact part-level selection remains limited to loaded high-detail atlas meshes.
- Live valve-gradient markers remain separate educational overlays.
- Reduced-motion behavior and the accessible 2D route remain unchanged.
- Motion-Fall Lab remains untouched.

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

npm run verify:teaching-overlays
Teaching overlay QC passed (16 source anchors)
```

## Files updated

- `scripts/teaching-overlay-qc.mjs`
- `TEACHING_OVERLAY_QC_REPORT.md`
- `package.json`
- `scripts/anatomy-registry-smoke.mjs`

## Deliberate boundaries

No new 3D source is claimed for Cell Structure, Tissues, or Heredity. Those modules continue to use their reviewed conceptual/educational models until suitable reviewed source assets and licenses are approved.

Still deferred:

- Human expert visual sign-off for marker placement, occlusion, color contrast, and mobile framing
- Separate reviewed 3D sources for Cell Structure, Tissues, and Heredity

## Build note

Vite continues to emit the existing advisory that the Three.js vendor chunk exceeds 500 kB. Production and offline builds complete successfully. Existing lung-parenchyma and spinal-cord-parenchyma QC notes remain unchanged.
