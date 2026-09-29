# Motion-Fall Lab — second-pass scope and execution plan

## 1. What this second audit found

The first plan covered the obvious release risks. This second pass adds the less visible risks that matter for a production educational WebGL product:

- The app is still a single 28 KB `app.js` with rendering, physics, state transitions, controls, PWA status, asset loading, and telemetry coupled together. This makes regressions hard to isolate.
- Physics state is not separated from render state. There is no render interpolation, no authoritative fixed-tick counter, and no replay checksum.
- The current `XCoM` calculation is explicit, but support geometry remains an approximation around shin centers rather than contact manifolds or foot contact samples.
- The optional GLB path changes visibility but does not yet expose a formal skeleton adapter or normalized asset coordinate system.
- The UI exposes seed and stability but not the quantities that make the lesson measurable: COM height, XCoM distance to support boundary, contact count, state elapsed time, or simulation tick.
- PWA operation is functional in structure, but there is no install/update UX, cache integrity check, or automated offline test.
- Security, accessibility, observability, and performance budgets are not yet release gates.

## 2. Improvement scope

### A. Engineering architecture

Refactor the monolithic app into small browser modules without adding a framework:

```text
src/
  config.js                 validated constants and default presets
  core/clock.js             fixed-step simulation clock and interpolation alpha
  core/replay.js            seed, snapshot, event log, checksum
  core/state-machine.js     Locomotion through Recover transitions
  physics/ragdoll.js        cannon-es bodies, constraints, contacts, pose drive
  physics/stability.js      COM, XCoM, contact support hull, classifications
  render/scene.js           renderer, camera, lights, environment, quality
  render/mannequin.js       proxy meshes and optional character adapter
  render/overlays.js        COM, support, trajectory, labels
  ui/controls.js            validated control bindings and ARIA status
  pwa/offline.js            service-worker registration and update status
  app.js                    boot orchestration only
```

Keep the current root files as the deployment entry points. The refactor should not introduce a bundler requirement unless it materially improves testability; local ES modules remain acceptable.

### B. Deterministic simulation and replay

1. Create an authoritative simulation tick at 60 Hz.
2. Accumulate wall-clock time, cap catch-up work, and step only fixed quanta.
3. Keep physics time, educational state time, and render time distinct.
4. Interpolate previous/current body transforms for smooth rendering.
5. Snapshot all setup parameters, seed, initial transforms, friction, quality-independent physics values, and version number.
6. Store state-transition events and a per-N-tick checksum of body positions/quaternions.
7. Add a “Replay verified” result when the checksum matches the original run.
8. Make slow motion alter simulation-time consumption without changing the fixed solver tick.
9. Pause should stop simulation ticks but leave camera orbit and UI available.

### C. Physics quality and contact semantics

1. Replace unlimited point-joint behavior with tuned joint constraints and angular limits where possible.
2. Add a collision-filter policy so adjacent constrained limbs do not create solver chatter.
3. Set explicit body sleep policy: awake during active pose control, sleep only after measured settling.
4. Add a contact collector for floor/body contacts.
5. Generate support points from actual lower-body contact candidates, projected onto the ground plane.
6. Use the convex hull of valid contacts, with a clear fallback label when support is insufficient.
7. Report XCoM distance to the nearest support edge, not only Stable/Unstable.
8. Use contact dwell time, COM height, linear speed, and angular speed to enter Grounded.
9. Implement Recovery as an actual target-pose blend: pelvis rise, support-foot placement, torso recovery, then return to Grounded if successful.
10. Clamp impulses and torques with named presets so intensity remains bounded and reproducible.

### D. Physical-animation pose layer

Create named target poses:

- `uprightIdle`
- `uprightWalk`
- `impactFlinch`
- `staggerLeft`
- `staggerRight`
- `collapseStart`
- `grounded`
- `recover`

Use shortest-arc quaternion error and angular-velocity damping. Blend pose strength with state time:

```text
Locomotion: 1.00
ImpactReact: 0.90 → 0.70
Stagger: 0.70 → 0.25
Collapse: 0.25 → 0.00
Grounded: 0.00
Recover: 0.00 → 0.45
```

This gives the educational viewer a readable causal transition rather than a sudden body failure.

### E. Rendering and mobile performance

1. Filter HDR maps through PMREM and dispose source textures after conversion.
2. Use a quality profile object instead of scattered conditional values.
3. PC High: antialiasing, 1.75 pixel-ratio cap, 1536 shadow map, 12 solver iterations, 180-point trajectory.
4. Mobile Optimized: 1.15 pixel-ratio cap, 768 or 1024 shadow map, 8 solver iterations, 90-point trajectory, lower overlay update rate.
5. Reuse support and trajectory buffer attributes; do not dispose/recreate geometry each frame.
6. Use a `ResizeObserver` and handle viewport/device-pixel-ratio changes.
7. Add performance telemetry: FPS, frame time, physics step time, draw-call count, body count, and renderer pixel ratio.
8. Add a WebGL context-lost handler and a user-facing recovery action.
9. Dispose renderer, controls, geometries, materials, textures, and environment maps on teardown.
10. Validate against budgets: steady-state frame time under 16.7 ms on a representative desktop and under 33 ms on a representative phone.

### F. Character and environment asset system

1. Formalize a `CharacterAdapter` API: `load`, `normalize`, `findBones`, `applyPose`, `setVisibility`, `dispose`.
2. Normalize GLB scale, up axis, forward axis, origin, and rest pose.
3. Use an explicit bone alias table for pelvis/hips, chest/spine, head, upper/lower arms, and upper/lower legs.
4. Keep cannon-es as simulation authority; the adapter only receives target transforms.
5. Add asset validation: file size, parse time, mesh count, material count, texture dimensions, skeleton presence, and missing aliases.
6. Show asset progress and fallback reason in the UI.
7. Keep the proxy active until the GLB is fully validated and normalized.
8. Recommend for flagship phones: 2–5 MB target GLB, 8 MB maximum, modest draw calls, 1K–2K textures, LODs, compressed geometry/textures, and hair cards instead of dense strand geometry.
9. Add a studio environment validation path with HDR resolution and memory limits.

### G. Educational UX improvements

Add an optional “Explain this run” panel that updates with the simulation:

- `COM`: weighted center of the proxy mass.
- `XCoM`: COM projected in the direction of current motion.
- `Support area`: current ground contact hull.
- `Stable`: XCoM inside the support area.
- `Unstable`: XCoM near or outside the support boundary.
- `Falling`: collapse/grounded state or insufficient support.

Add compact telemetry fields:

- State elapsed time
- COM height
- XCoM edge distance
- Contact count
- Simulation tick
- Replay checksum status

Add “Scenario presets” for first-time users:

- Gentle normal-surface walk
- Fast slippery-surface run
- Low-intensity grippy recovery
- High-intensity demonstration

Add “Copy scenario” and “Load scenario” using a URL-safe JSON payload containing the seed and parameters. This makes classroom or review sessions reproducible without exposing source code.

### H. Accessibility and safety

1. Add `aria-live="polite"` for state, stability, offline, asset, and replay messages.
2. Give every option group an accessible group label and preserve visible keyboard focus.
3. Add keyboard equivalents for Play, Pause, Frame-step, Reset, and camera reset.
4. Provide a focusable canvas description with interaction instructions.
5. Respect `prefers-reduced-motion` for loading and UI animations.
6. Keep language limited to impact region, direction, intensity, balance, support, collapse, grounding, and recovery.
7. Never infer injuries, outcomes, targets, tactics, or clinical meaning.

### I. PWA and deployment hardening

1. Treat the cache version as a release constant and bump it on every asset/code release.
2. Verify the precache list against the filesystem in CI.
3. Add a waiting-worker update banner with a controlled reload action.
4. Keep Cache First for app shell and successful runtime caching for `/assets/`.
5. Add raster 192px and 512px icons alongside SVG icons for broad install compatibility.
6. Add a strict same-origin CSP in the deployment host configuration while retaining the required inline import map.
7. Test offline in a fresh browser context, not just by disabling the network after a page has already loaded.
8. Provide a cache-debug view in development mode: cache version, shell count, optional asset count, and last update time.

## 3. Execution milestones

### Milestone 1 — deterministic core

Deliver fixed-step timing, interpolation, replay snapshots, checksums, explicit state events, and automated state-transition tests.

**Exit:** identical seed/config produces matching sampled transforms and event timeline across two runs.

### Milestone 2 — physics credibility

Deliver joint limits, contact sampling, XCoM edge distance, measured settling, recovery pose, and bounded physical-animation targets.

**Exit:** every friction/intensity preset remains stable enough to inspect; no explosive joint drift; Grounded corresponds to actual settling.

### Milestone 3 — render/performance hardening

Deliver reusable overlay buffers, quality profiles, PMREM cleanup, resize handling, WebGL failure recovery, and performance telemetry.

**Exit:** desktop and phone budgets are met without visible overlay or memory degradation after repeated runs.

### Milestone 4 — asset adapter

Deliver validated GLB loading, normalization, bone aliases, proxy fallback, and documented asset diagnostics.

**Exit:** missing, invalid, and valid assets all leave a usable scene; a valid skeleton receives core body pose updates.

### Milestone 5 — PWA and product UX

Deliver update handling, raster icons, offline fresh-context tests, scenario presets, copy/load scenario, educational explanations, and accessibility announcements.

**Exit:** a non-coder can run, pause, step, replay, understand the overlays, and return to the same scenario later.

### Milestone 6 — release gate

Run the full test matrix:

- Chromium desktop and mobile viewport
- Touch orbit, pan, and pinch zoom
- All movements, regions, directions, intensities, and friction presets
- All state transitions including optional Recover
- Same-seed replay checksum
- WebGL context failure path
- Missing/invalid/valid GLB and HDR
- Online-first then offline reload
- Keyboard/accessibility/reduced-motion checks
- Performance and memory budgets

## 4. Definition of done

The project is release-ready when:

- The state machine is driven by measured simulation conditions, not only timers.
- Same-seed replay is verifiably deterministic.
- The proxy remains stable and legible across all required presets.
- Support and XCoM overlays are based on actual contact semantics.
- The renderer maintains the target frame budgets on desktop and mobile.
- Optional assets cannot prevent the proxy from running.
- A fresh offline context can load and run after one online visit.
- Browser smoke, physics, PWA, accessibility, and performance tests all pass.
- The app remains neutral and educational in all user-visible language.
