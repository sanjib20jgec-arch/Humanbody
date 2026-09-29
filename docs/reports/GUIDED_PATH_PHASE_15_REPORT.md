# Guided Path Phase 15 report

Date: 2026-09-27
Project: Human Biology Lab

## Scope completed

Phase 15 creates a disciplined candidate-intake ledger for future 3D sources for Cell Structure, Tissues, and Heredity. It does not load a remote asset, add an unreviewed mesh, or weaken the existing conceptual-model boundary.

### Candidate intake

Five candidates are recorded for future review:

- NIH 3D Print Exchange candidates for cell, tissue, and DNA/molecule-scale concepts
- RCSB Protein Data Bank / Mol* candidates for molecular-scale cell and heredity supplements

Every record includes:

- Module and provider
- Candidate URL
- Educational fit
- License-review requirement
- Scientific-review requirement
- `candidate-not-approved` status

The ledger deliberately distinguishes a repository from a specific approved model entry. The next review must identify an exact versioned file, verify its entry-level license and attribution, check scientific provenance and scale, and package any approved asset locally for offline use.

### Approval guard

`npm run report:3d-sources` generates `3D_SOURCE_CANDIDATE_LEDGER.md` and fails on incomplete candidate records or any accidental `approved` status in the intake ledger.

No candidate is imported into the runtime. The Cell Structure, Tissues, and Heredity bays continue to display their reviewed conceptual sources and explicitly state that no reviewed 3D source is approved.

## Verification passed

```text
npm run verify
Full static, offline, and automated QC verification passed

npm run verify:browser
34 passed
  - Chromium desktop: 17 passed
  - Chromium phone: 17 passed

npm run verify:anatomy-registry
Anatomy registry smoke passed (8 entries)

npm run verify:teaching-overlays
Teaching overlay QC passed (16 source anchors)

npm run report:visual-review
Visual review matrix generated (24 cases; 24 pending)

npm run report:3d-sources
3D source candidate ledger generated (5 candidates; none approved)
```

## Files updated

- `scripts/3d-source-candidates.json`
- `scripts/3d-source-candidate-report.mjs`
- `3D_SOURCE_CANDIDATE_LEDGER.md`
- `package.json`
- `scripts/anatomy-registry-smoke.mjs`
- `README.md`

## Deliberate boundaries

Candidate repositories are not approved scientific sources, and molecular structures are not whole-cell, tissue, chromosome, or trait visualizations. No remote CDN, external viewer, or unreviewed 3D asset was added to the application.

Still deferred:

- Human expert visual sign-off for Circulation and Digestion overlays
- Selection of a specific approved local 3D asset for any of Cell Structure, Tissues, or Heredity
- License, provenance, scientific, and offline packaging review for any selected candidate

## Build note

Vite continues to emit the existing advisory that the Three.js vendor chunk exceeds 500 kB. Production and offline builds complete successfully. Existing lung-parenchyma and spinal-cord-parenchyma QC notes remain unchanged.
