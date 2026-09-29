# Guided Path Phase 3 report

Date: 2026-09-27
Project: Human Biology Lab

## Scope completed

Phase 3 established a source-backed anatomy and representation registry for Guided Path reference objects and teaching models.

### Anatomy registry

Added:

```text
src/data/anatomyRegistry.js
```

The registry records, for each reference or teaching object:

- Stable object ID
- Label
- Owning learning module
- Representation type
- Source dataset
- Source URL
- License
- Scale statement
- Supported anatomy systems
- Focus structures
- Known limitation
- Separate teaching models

Representation types are explicit:

- `source-reference`
- `simplified-teaching`
- `conceptual-overlay`

The registry currently contains eight entries covering heart, digestive, respiratory, kidney, nervous, reproductive, digestive pathway, and alveolar teaching content.

### Reference object integration

Updated `ReferenceObject3D` to accept a `registryId` and derive source metadata from the registry while retaining backward-compatible prop overrides.

Integrated registry IDs into:

- Circulation
- Digestion
- Respiration
- Excretion
- Brain & Nerves
- Reproduction

Reference panels now communicate:

- Source mesh versus simplified teaching model
- Dataset and license link
- Scale statement
- Representation limitation
- Separate teaching models that should not be mistaken for literal source anatomy

### Guided Path provenance

Guided Path step metadata now includes both educational evidence and relevant anatomy-reference URLs where available.

This makes the learning path source-aware without pretending that every simulation overlay is a literal anatomical mesh.

### Validation

Added:

```text
scripts/anatomy-registry-smoke.mjs
```

Added command:

```bash
npm run verify:anatomy-registry
```

## Verification passed

```text
Anatomy registry smoke passed (8 entries)
Guided Path engine smoke passed
Guided Path UI foundation smoke passed
HBL guided curriculum smoke check passed
HBL interaction smoke check passed
Vite production build passed
Full static verification passed
Guided Path and anatomy browser contracts passed: 28 tests across Chromium desktop and phone profiles
```

## Build note

Vite continues to emit the existing advisory that the Three.js vendor chunk is larger than 500 kB. The production build completes successfully.

## Deferred to later phases

- Per-step camera presets
- Automatic anatomical framing
- Structure-level route highlighting
- Detailed Circulation anatomy sequence
- Detailed Digestion anatomy sequence
- Expert manual anatomy review of every teaching overlay
- Validating optional future models against the registry at upload/build time
