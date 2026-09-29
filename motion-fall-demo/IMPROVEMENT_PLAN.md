# Motion-Fall Lab — production improvement plan

## Audit scope

This audit covers the current standalone project in `/home/user/motion-fall-demo` after the first implementation pass. The baseline already includes a true Three.js scene, an 11-body cannon-es proxy mannequin, OrbitControls, the requested controls and overlays, local vendor modules, optional GLB/HDR hooks, a PWA manifest, and a service worker.

Static checks currently pass: JavaScript syntax, manifest parsing, local relative-import resolution, and HTTP serving of the app shell/vendor files. A real browser render/interaction test is still required before release; the available sandbox Chromium could not launch because the system image lacks `libnspr4`.

## Findings and priorities

### P0 — correctness and release risk

1. **Replay is seeded but not fully frame-deterministic.** The simulation uses render-frame `dt` and cannon-es `world.step` with a variable elapsed-time argument. Different refresh rates, throttling, and background-tab behavior can produce different physics trajectories for the same seed.
2. **Grounded/settled state is timer-driven.** `Grounded` is entered after a fixed collapse duration rather than after measured body-floor contact, low velocity, and low angular velocity. A fast or unstable run can be labelled grounded before it has actually settled.
3. **No browser-level smoke suite is committed.** The implementation has not yet been validated for WebGL initialization, module loading in a browser, state transitions, service-worker activation, touch controls, or offline reload.
4. **State controls are underspecified in behavior.** Switching Setup/Playback stops playback but does not clearly reset or freeze the editable setup. Pressing Play after changing parameters can reuse the previous run seed, which is surprising for a non-coder.

### P1 — physical and visual fidelity

5. **The ragdoll uses point constraints without joint limits.** It satisfies the MVP constraint requirement but can rotate into implausible poses or jitter during a high impulse. Cone-twist/hinge-style limits, collision filtering, and tuned damping are needed for a stable educational proxy.
6. **Physical animation is only applied strongly to torso and pelvis.** Arms are damped but not driven toward explicit target poses; legs have no pose targets. A small named target-pose layer would make the flinch, stagger, and recovery visibly intentional.
7. **Support area is approximated from shin centers.** The code now performs an explicit XCoM projection, but support points are not derived from actual foot-floor contacts. This can label a body stable after the feet have lifted or fallen.
8. **Rendering allocations occur during the animation loop.** COM trajectory and support geometry are disposed/recreated repeatedly. This creates garbage-collection pressure, especially on phones.
9. **HDR handling is not fully production-safe.** The HDR path assigns the loaded texture directly to the environment and only disposes the PMREM generator on success. The fallback path does not release all temporary resources. The final path should PMREM-filter HDR and clean up both branches.
10. **Mobile quality does not yet change shadow quality.** It currently caps pixel ratio and physics iterations, but the high shadow-map allocation remains. Mobile Optimized should lower/disable shadows and reduce overlay update cost.
11. **No graceful WebGL failure path exists.** A renderer/context creation failure can abort boot without an actionable explanation.

### P2 — product polish and maintainability

12. **Asset loading has no progress or timeout UI.** Missing optional files are valid, but users should see “Using proxy” rather than browser-level 404 noise and should not wait indefinitely on a large GLB/HDR.
13. **Optional GLB display is not mapped to physics.** The GLB can replace the proxy visually, but the simulation remains invisible behind it. The documented later bone-map hook should become an explicit adapter interface, with the proxy retained as the simulation authority.
14. **Accessibility feedback is incomplete.** State, stability, offline readiness, and asset status should use `aria-live`; the canvas should have a focusable description and keyboard-safe controls. Reduced-motion preferences should be respected for UI animation.
15. **Documentation has one stale body-count phrase.** The README panel says “ten” bodies while the current proxy contains eleven.
16. **There are unused variables and lifecycle gaps.** `TAU`, `floorMesh` in some paths, `loadedOptionalAsset`, `visualMaterials`, and the simulation accumulator are not consistently used. Renderer, controls, geometries, materials, textures, and event listeners should have a clear dispose path.
17. **PWA release hygiene needs strengthening.** The cache version must be bumped for every release, raster install icons should be supplied alongside SVG icons for broad installability, and an update-available path should be defined.

## Execution plan

### Phase 0 — freeze the baseline and add test scaffolding

- Record the current UI and a known seed/parameter set.
- Add `tests/smoke.mjs` using Playwright or an equivalent browser runner.
- Add a simple test server command that binds to `0.0.0.0`.
- Add a DOM contract check for every required control, state label, overlay toggle, and status indicator.
- Add a static check that every local JS import resolves and every `/vendor/` file is precached.

**Exit criteria:** the project can be launched by one command, and the smoke suite reports browser/runtime failures instead of relying on manual inspection.

### Phase 1 — make simulation timing and replay deterministic

- Replace render-frame physics stepping with a bounded fixed-step accumulator.
- Advance the physics world in fixed `1/60` ticks; apply slow motion as a controlled simulation-time scale, not as variable substeps.
- Cap catch-up ticks after a stalled tab and record a deterministic “simulation dropped time” flag in telemetry.
- Replace `rng?.() || 0.5` with nullish fallback so a valid random value of zero is not overwritten.
- Store a replay snapshot containing seed, all setup parameters, quality-independent physics settings, and initial body transforms.
- Make Play from Setup start a fresh run; make Replay explicitly restore the previous snapshot. Explain this difference in the README panel.

**Exit criteria:** two runs with the same snapshot produce equal state-transition timestamps and matching sampled body transforms within a documented numerical tolerance.

### Phase 2 — improve ragdoll mechanics and state transitions

- Add a target-pose table for pelvis, torso, arms, and legs.
- Drive orientation error using shortest-arc quaternion error rather than raw Euler components.
- Add tuned angular/linear damping and joint limits where supported by cannon-es constraints.
- Add collision filtering so adjacent connected limbs do not create excessive self-collision jitter.
- Derive foot contact points from the lower-body shapes and floor contact state; build the convex support polygon only from contacts that are actually near the ground.
- Keep the explicit XCoM calculation and use it with the support polygon for Stable/Unstable decisions.
- Add a measured settle test: both feet or a body support contact present, COM height below threshold, and linear/angular speeds below thresholds for a short dwell window.
- Use this settle test to enter `Grounded`; use a clearly bounded recovery transition only when the recovery pose and support conditions are valid.
- Select an arm/leg impact target using region plus direction rather than always using the left side.

**Exit criteria:** high-intensity and slippery presets produce a visibly stable collapse without explosive joint motion; low-intensity grippy runs can visibly attempt one recovery step; the state label follows measured behavior.

### Phase 3 — remove frame-loop allocations and finish quality modes

- Reuse trajectory line buffers and support-polygon geometry instead of disposing/recreating them every visual update.
- Update overlay geometry at a lower controlled rate on Mobile Optimized while keeping the renderer responsive.
- Implement quality profiles for pixel ratio, shadow-map resolution, shadow enabled state, physics iterations, trail length, and environment resolution.
- Add a `ResizeObserver` for the canvas wrapper and handle device-pixel-ratio changes.
- PMREM-filter optional HDR textures, dispose source textures and PMREM resources on both success and fallback branches.
- Add a renderer initialization error view with a retry/action explanation for unsupported WebGL contexts.
- Add explicit disposal on pagehide and when replacing an optional asset/environment.

**Exit criteria:** no recurring geometry/material allocation occurs in the steady-state animation loop; Mobile Optimized maintains an acceptable frame rate on a representative phone; PC High retains shadows and long overlays.

### Phase 4 — asset adapter and loading experience

- Add a `CharacterAdapter` interface with `load`, `normalize`, `setPose`, `setVisible`, and `dispose` methods.
- Normalize GLB scale, up-axis, forward direction, origin, and rest pose.
- Add a small alias table for hips, pelvis, spine/chest, head, upper/lower arms, and upper/lower legs.
- Keep cannon-es bodies as the authority and copy physical target transforms into the mapped skeleton when aliases are available.
- Show a progress/status message for optional files; on missing files, immediately show “Proxy mannequin active.”
- Add timeouts and clean error handling so an invalid GLB/HDR never blocks the proxy scene.
- Keep the documented flagship-phone constraints: target 2–5 MB GLB, under 8 MB maximum, modest material count, 1K–2K textures, LODs, compressed geometry/textures where available, and hair cards rather than dense strand geometry.

**Exit criteria:** absent, valid, and invalid optional assets all result in a usable app; a valid GLB is visible and receives at least the core body pose.

### Phase 5 — PWA and offline release hardening

- Bump the cache version to the next release version after the implementation changes.
- Keep the explicit app-shell list and verify it covers every local `/vendor/` file, including loader utilities and `three.core.js`.
- Keep Cache First for the app shell and runtime-cache successful `/assets/` responses with size/error handling.
- Add an update-available indicator and a safe reload action when a new worker is waiting.
- Provide 192px and 512px PNG install icons in addition to SVG icons for broader browser compatibility.
- Test: first online load, service-worker activation, hard reload, offline navigation, offline module loading, and optional asset cache reuse.

**Exit criteria:** after one successful online load, a fresh offline context can open the app shell and run the proxy simulation without network access.

### Phase 6 — non-coder UX, accessibility, and safety polish

- Make Setup/Playback semantics explicit with short helper text.
- Add `aria-live="polite"` to Offline ready, asset status, state label, stability label, and impact readout.
- Add a keyboard-focusable canvas description and preserve visible focus states.
- Add reduced-motion handling for loading animation and UI transitions.
- Add an on-screen “What you are seeing” explainer for COM, XCoM, support area, friction, and state transitions.
- Keep neutral safety language: impact region, direction, intensity, balance, support, collapse, grounded, and recovery only.
- Correct the README body-count text from ten to eleven.

**Exit criteria:** a first-time user can understand what Play, Reset, Replay, and Frame-step do without reading source code; keyboard and mobile controls remain usable.

### Phase 7 — release verification

Run the following matrix before release:

- Desktop Chromium: PC High, all movement/region/direction/friction combinations, state sequence, camera controls, replay.
- Mobile viewport: touch orbit, pan, pinch zoom, Mobile Optimized, portrait and landscape layouts.
- Physics: intensity 0, 0.55, 1; Normal/Slippery/Grippy; Idle/Walk/Run; repeated same-seed replay.
- PWA: online first load, worker activation, offline reload, cache contents, update path.
- Assets: missing optional files, valid low-poly GLB, invalid GLB, valid HDR, invalid HDR.
- Accessibility: keyboard focus order, screen-reader status announcements, reduced motion, contrast, control labels.
- Performance: no uncapped pixel ratio, no recurring overlay allocations, stable frame time, bounded memory after repeated Reset/Replay.

## Recommended implementation order

1. Phase 0 test scaffolding
2. Phase 1 deterministic timing/replay
3. Phase 2 contacts, joint stability, and settle detection
4. Phase 3 allocation/performance and quality profiles
5. Phase 5 PWA hardening
6. Phase 4 optional asset adapter
7. Phase 6 UX/accessibility polish
8. Phase 7 release matrix

This order protects the hard acceptance tests first, then improves physics fidelity and mobile performance, and only then expands the optional asset path.
