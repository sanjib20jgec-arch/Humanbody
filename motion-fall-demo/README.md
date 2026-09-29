# Motion-Fall Lab

A standalone, offline-ready Three.js and cannon-es educational demo for exploring balance, impact response, collapse, grounding, and optional recovery.

## Run locally

Serve this folder from an HTTP origin so ES modules, WebGL, and the service worker can run:

```bash
python3 -m http.server 5174 --bind 0.0.0.0
```

Then open `http://localhost:5174/` or the live preview supplied by the workspace.

## Verification

```bash
npm test
npm run serve
# after installing Playwright and its Chromium runtime:
npm install
npx playwright install chromium
npm run test:release
```

The static phase gates check the DOM contract, required files, local import graph, manifest, runtime CDN absence, service-worker precache coverage, accessibility UX, and release scripts. `npm run test:release` covers WebGL initialization, playback and keyboard controls, scenario sharing, reduced motion, mobile layout, fresh-context offline reload, and runtime errors.

## Architecture

- `index.html` — accessible control shell, state HUD, educational overlays, import map, and PWA manifest link.
- `style.css` — responsive desktop/mobile UI and scene overlays.
- `app.js` — WebGL renderer, OrbitControls, RoomEnvironment/HDR fallback, proxy mannequin, 11 cannon-es bodies with limited ConeTwist constraints, hybrid physical-animation state machine, deterministic seeded replay, overlays, optional GLB/HDR adapter, accessibility controls, and quality profiles.
- `sw.js` — versioned app-shell cache, optional asset runtime cache, `skipWaiting`, `clientsClaim`, and Offline ready messaging.
- `vendor/` — local pinned Three.js/cannon-es modules; no CDN runtime dependency.
- `assets/` — optional `character.glb` and `studio_env.hdr`; the demo remains complete without them.

## Simulation notes

The visible state sequence is `Locomotion → ImpactReact → Stagger → Collapse → Grounded → Recover(optional)`. Upright phases use torque-based physical-animation driving. During Collapse, constraint strength and pose-driving strength ramp down so the rigid-body world takes over smoothly. Replay uses the same seed and current parameters; Reset creates a new bounded seed.

The demo is intentionally neutral and educational. It describes impact region, direction, intensity, balance, support, and recovery only; it is not a clinical, injury-prediction, targeting, or harm-guidance tool.

## Offline behavior

Load the app once online. The service worker precaches the app shell and local vendor modules. Requests under `/assets/` are runtime-cached when they succeed, so optional character/environment files become available offline after they have been loaded once.
