# Phase 7 report — release verification

Date: 2026-09-27
Project: Motion-Fall Lab

## Release gate work

- Installed the declared Playwright test dependency and Chromium test runtime in the validation environment.
- Hardened browser smoke timing so WebGL startup and fixed-step state transitions are awaited instead of assumed after a fixed wall-clock delay.
- Hardened the fresh-context offline test to wait for the canvas after both online and offline navigations.
- Added `tests/release-matrix.mjs` for desktop combinations, frame-step, keyboard controls, scenario sharing, reduced motion, mobile viewport, WebGL, and runtime error checks.
- Added `tests/phase7-contract.mjs` to keep the release gate and package scripts explicit.
- Added `npm run test:release` for the complete release command.
- Added a phase-7 source/vendor hash snapshot.

## Validation matrix

Release browser matrix passed (6 desktop combinations, reduced-motion, mobile).

- Desktop Chromium WebGL smoke: passed.
- PWA online activation then offline fresh reload: passed.
- Desktop combinations covering Idle/Walk/Run, Torso/Arm/Leg, Front/Back/Left/Right, Normal/Slippery/Grippy, and intensity 0/0.25/0.55/0.85/1: covered by release matrix.
- Frame-step after pause: covered.
- Space and R keyboard controls: covered.
- Scenario preset and clipboard URL payload: covered.
- Reduced-motion media preference: covered.
- Mobile touch-capable viewport and responsive canvas: covered.
- Browser console/page-error and unexpected HTTP response collection: covered.

## Remaining limitations

- Automated matrix uses Chromium in a software/WebGL test environment rather than a physical flagship phone.
- Optional character.glb and studio_env.hdr remain absent, so valid optional-asset rendering still requires a supplied asset fixture.
- The browser test observes the current WebGL context and responsive bounds; it does not replace long-run profiling on representative desktop and mobile hardware.
