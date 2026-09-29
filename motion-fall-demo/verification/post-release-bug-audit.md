# Post-release bug audit

Date: 2026-09-27
Project: Motion-Fall Lab

## Audit result

The implementation and browser/PWA gates were reviewed again after Phase 7. Five functional issues and three polish/documentation issues were found and fixed.

### Fixed functional issues

1. **Setup/Playback selection could become stale.** Starting Play changed the internal mode to Playback, and Reset changed it back to Setup, but the selected button and `aria-pressed` state were not synchronized. `updateUI()` now synchronizes the mode controls on every state update.
2. **WebGL context restoration could start a duplicate animation loop.** The existing animation loop already continues scheduling frames while the context is lost. The restore handler no longer schedules a second loop.
3. **Copy scenario feedback had an asynchronous race.** A delayed or unavailable Clipboard API could leave the UI showing the previous preset status. Copy now shows progress, times out to a guarded fallback, and reports failure accurately.
4. **Malformed scenario URLs could partially mutate simulation state.** Scenario values are now validated before `applyRunParameters()` is called.
5. **Browser smoke timing depended too strongly on a fixed delay.** The release test waits for an actual state transition instead of assuming that 1.1 seconds is enough in every WebGL environment.

### Fixed polish/documentation issues

- Replaced deprecated `RGBELoader` usage with the local `HDRLoader` to remove a runtime deprecation warning.
- Mobile Optimized now disables shadows rather than retaining the high-cost shadow path.
- Added an accessible label to the movement preset group.
- Removed a misleading slow-motion `aria-keyshortcuts` declaration that had no matching keyboard handler.
- Updated the embedded README from point constraints to limited ConeTwist constraints.

## Current validation

```text
npm test                         passed
npm run test:release             passed
Browser smoke                    passed
PWA offline browser test         passed
Release browser matrix           passed
```

The release browser matrix covers six representative desktop parameter combinations, frame stepping, keyboard Play/Reset, scenario sharing, reduced motion, mobile layout, WebGL, and unexpected runtime errors.

## Remaining issues and limitations

- The matrix is representative rather than the full Cartesian product of every movement, region, direction, friction, and intensity value.
- Physical-device profiling on a flagship phone and manual Safari testing are still required for a production performance claim.
- Valid optional `character.glb` and `studio_env.hdr` fixtures are not present in the repository, so their successful rendering paths remain fixture-unverified.
- Missing optional assets intentionally produce expected 404 requests and fallback status messages; a production deployment could add explicit loader timeouts and suppress expected missing-asset noise.
- Screen-reader behavior and forced WebGL context loss still need manual hardware/browser review; automated WebGL initialization and recovery handlers are present.
