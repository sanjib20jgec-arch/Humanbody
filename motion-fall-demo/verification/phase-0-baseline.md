# Phase 0 baseline

Date: 2026-09-27
Project: Motion-Fall Lab

## Baseline scenario

Use this scenario for later replay and regression comparisons:

```json
{
  "seed": 123456789,
  "movement": "Walk",
  "region": "Torso",
  "direction": "Front",
  "intensity": 0.55,
  "friction": "Normal",
  "slow": 1,
  "quality": "high"
}
```

Expected state vocabulary and nominal order:

```text
Locomotion → ImpactReact → Stagger → Collapse → Grounded → Recover(optional)
```

## Phase 0 checks

- DOM contract check: `npm run test:phase0`
- Static import and PWA precache check: `npm run test:phase0`
- Browser runtime check: `npm run test:browser` while the local server is running
- Server command: `npm run serve`

## Frozen source baseline

SHA-256 hashes for the core source/vendor files are recorded in `phase-0-file-hashes.sha256`. Update that file only when intentionally beginning a new phase or release candidate.

## Browser baseline capture to complete

The baseline needs a real browser capture once Playwright/Chromium is available:

- WebGL context created
- Proxy mannequin visible
- Desktop camera canvas has non-zero size
- Mobile canvas has non-zero size
- State label leaves Locomotion after Play
- Pause freezes the simulation clock
- Frame-step advances one simulation increment
- Reset returns to Locomotion
- Service worker reaches Offline ready
- No page errors or console errors

The current environment previously lacked the system library required by its headless Chromium (`libnspr4`), so the browser capture remains an explicit follow-up rather than being marked as passed.
