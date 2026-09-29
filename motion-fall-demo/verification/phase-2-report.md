# Phase 2 report

Date: 2026-09-27
Project: Motion-Fall Lab
Pass: Phase 2 physics tuning follow-up

## Delivered

- Replaced unconstrained point-joint wiring with `CANNON.ConeTwistConstraint` joints and named angle/twist limits.
- Added constraint-force management that updates Cannon equation force bounds during Collapse and Grounded transitions.
- Added connected-body collision filtering to reduce solver chatter.
- Added floor-contact sampling from Cannon contact equations.
- Support polygon now uses foot/lower-leg contact samples when available, with an authored-footprint fallback before the first contact manifold exists.
- Added signed XCoM-to-support-edge distance and displayed it in the telemetry HUD.
- Added actual floor-contact count telemetry.
- Added measured settling dwell based on contact presence, COM height, linear speed, and angular speed.
- Grounded transition now waits for measured settling rather than using only a fixed collapse timer.
- Replaced simple Euler damping pose drive with shortest-arc quaternion spring/torque driving.
- Added explicit torso, pelvis, arm, forearm, and thigh target pose contributions, including flinch and recovery lift behavior.
- Added Phase 2 contract test and updated the default `npm test` command.
- Added named `physicsTuning` presets so impulse, torque, joint-force, settling, and recovery thresholds are reviewable in one place.
- Raised lower-leg bodies to remove initial floor penetration.
- Made Arm/Leg impact target selection respond to Left/Right direction, with seeded side selection for Front/Back.
- Added recovery outcome messaging based on post-recovery contact and XCoM support-edge state.

## Passing checks

- `npm test`
- `node --check app.js`
- Phase 0 static smoke
- Phase 1 deterministic-core contract
- Phase 2 physics-credibility contract
- HTTP smoke on port 5174
- `verification/phase-2-file-hashes.sha256`

## Still pending

- Browser runtime verification with a working WebGL/Chromium environment.
- Numerical physics tuning after visual inspection of all friction/intensity presets.
- Contact manifold and settling thresholds may need adjustment on mobile and with a future GLB adapter.
- Phase 3 scope remains overlay allocation removal, quality profile completion, PMREM cleanup, resize handling, WebGL recovery, and resource disposal.
