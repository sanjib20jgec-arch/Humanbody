# Guided Path Phase 1 report

Date: 2026-09-27
Project: Human Biology Lab

## Scope completed

Phase 1 established the reusable Guided Path learning engine without changing or replacing the existing Human Biology Lab simulations.

### Data and schema

- Added `src/data/guidedPaths.js`.
- Added versioned `GUIDED_PATH_SCHEMA_VERSION` and `WHOLE_BODY_PATH_ID` constants.
- Added a structured step definition for the nine-step whole-body path.
- Each step now carries:
  - Stable step and module IDs
  - Order
  - Title and short title
  - Learning stage
  - Estimated duration
  - Path reason
  - Primary learning objective
  - Full objective list
  - Supported modes
  - Evidence source links
  - Prerequisites
- Added schema validation and path summary helpers.

### Guided Path compatibility layer

- Updated `src/lib/guidedPath.js` to derive its existing `guidedPath` and `guidedPathMeta` exports from the new step registry.
- Preserved existing module ordering and current UI behavior.
- Added objective, mode, source, and prerequisite metadata to recommendation cards.
- Added `getGuidedPathProgress()` for future step-aware screens.

### Progress model

- Versioned progress storage to schema version 2.
- Added migration-safe normalization for existing local progress.
- Added path progress under `guidedPaths.whole-body-foundations`.
- Added current step and current view tracking.
- Added per-step exploration, completion, quiz, score, and last-visit state.
- Preserved existing `lastModule`, `lastView`, `explored`, `completed`, `quiz`, and `visitedViews` compatibility fields.
- Added `getGuidedProgress()`.

### UI improvement

- Up Next now displays the primary learning target for the recommended step.
- Added styling for the learning-target line.

### Verification

```text
Guided Path engine smoke passed
HBL guided curriculum smoke check passed
Vite production build passed
```

Commands:

- `npm run verify:guided-path`
- `npm run verify:curriculum`
- `npm run build`

## Deferred to later phases

- Detailed per-step 3D camera and anatomy focus data
- New Circulation and Digestion vertical-slice content
- Explore, Trace, Practice, and Review mode implementation
- Expanded quiz and misconception data
- Integrated Circulation–Digestion lesson
- Manual screen-reader and real-device review
