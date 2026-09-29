# HUMAN BIOLOGY LAB

See [`docs/reports/IMPROVEMENT_PLAN.md`](./docs/reports/IMPROVEMENT_PLAN.md) for the prioritized performance, accessibility, anatomy-QC, offline, testing, observability, licensing, and deployment roadmap.

An interactive Biology learning lab for Class 9–12 students. The MVP includes polished learning bays for Cell Structure, Tissues, Human Digestion, Circulation, Brain & Nerves, Respiration, Excretion, Reproduction, and Heredity.

## What is included

- Interactive WebGL / Three.js 3D body atlas using the open BodyParts3D 4.0 adult-male reference (2,234 selectable source meshes)
- AnatomySceneManager with meaningful skeletal-first startup, demand-driven system chunks, worker gzip decode fallback, IndexedDB/CacheStorage caching, versioned service-worker caching, mobile geometry budgets, LOD proxies, frustum culling, six-layer peeling controls, touch-safe precision raycasting, structure search, metadata HUD, and deterministic disposal
- Real module navigation with responsive layouts
- Cell Explorer with selectable organelles and zoom controls
- CellularDiffusionEngine: Brownian motion, Fick's first-law flux, pore-size gating, solute selection, concentration gradients, and temperature controls
- Digestive pathway with play, pause, reset, step, speed controls, food tracking, and pH meter
- EnzymeKineticsEngine: Michaelis–Menten reaction rate with Gaussian pH/temperature activity curves for amylase, pepsin, trypsin, and lipase
- Heart explorer with chamber/valve selection
- CardioPhysiologyEngine: CO, MAP, Wiggers pressure curves, pressure-driven valve states, HR/SV controls, drug effects, TPR, scenario presets, and synchronized demand-rendered 3D heart deformation
- Heart-rate slider and blood component viewer
- Respiration bay with airway exploration, alveoli teaching model, ventilation controls, tidal-volume/rate sliders, minute-ventilation readout, and checkpoint quiz
- Excretion bay with nephron exploration, filtrate flow animation, GFR and ADH controls, water-recovery metrics, and checkpoint quiz
- Reproduction bay with gamete exploration, ovarian-cycle animation, hormone signals, ovulation timeline, and checkpoint quiz
- Heredity bay with chromosome and allele exploration, animated Punnett squares, genotype/phenotype probability metrics, and checkpoint quiz
- Reusable EXPLORE / SIMULATE / QUIZ module structure with lazy-loaded learning-bay chunks
- Reusable simulation controls, info panels, quiz engine, progress manager, audio manager, and AI Tutor boundary
- LocalStorage progress tracking without login
- Subtle Web Audio interaction sounds and optional ambient lab hum
- Reduced-motion mode, keyboard controls, focus states, safe-area support, touch-friendly controls, adaptive mobile WebGL resolution, visibility pausing, responsive Android/iPhone layouts, a mobile geometry budget that preserves desktop detail, and a persisted accessible 2D anatomy mode for keyboard, touch, and WebGL-failure paths
- Mock AI Tutor responses that can be swapped for a server-side `/api/ai` proxy

## Anatomy image attribution

The Circulation and Digestion Guided Path diagrams use locally stored OpenStax reference plates with in-context links and license notes. See [`public/ATTRIBUTION-OPENSTAX.md`](./public/ATTRIBUTION-OPENSTAX.md) for figure-level attribution.

## Run locally

```bash
npm install
npm run dev
```

Open the local Vite URL shown in the terminal. The dev server is bound to `0.0.0.0` and allows preview hosts used by sandboxed environments.

For a file-viewer / offline preview, open `human-biology-lab-offline4.html`. It is the single generated bundle with the CSS, JavaScript, anatomy manifest, and compressed geometry embedded, so it does not depend on network requests for `/src/main.jsx`, `/assets/`, or `/models/`. For the installable web app, Settings contains an explicit “Download for offline” anatomy action with compressed-size estimate, progress, cancellation, and removal; the shell is not forced to download the large atlas during installation.

## Production build and verification

```bash
npm run build
npm run build:offline
npm run verify
npm run preview
```

`npm run verify` builds the code-split production shell, builds an inline-chunk offline variant, generates the self-contained offline bundle, and checks the PWA manifest, service worker files, accessibility states, learning-progress accounting, anatomy attribution and source links, runtime readiness contracts, the atlas transfer/performance baseline, mobile atlas budgets, viewport layout contracts, guided curriculum persistence, interaction wiring, reduced-motion runtime guards, and deployment cache policy. `npm run verify:mobile` runs the mobile/device invariants independently; `npm run verify:brain` regenerates `docs/reports/BRAIN_NERVES_QC_REPORT.md` and checks Brain & Nerves landmark coverage, chunk mapping, bilateral representation, and basic bounding-envelope relationships; `npm run verify:atlas-binary` regenerates `docs/reports/ATLAS_BINARY_QC_REPORT.md` and validates every compressed chunk's byte size, typed-array ranges, alignment, and packed index bounds; `npm run report:atlas` regenerates `docs/reports/ATLAS_QC_REPORT.md` with landmark coverage, system/chunk indexes, transfer size, geometry counts, and the estimated safe 16-bit index-buffer saving; `npm run verify:performance` prints and enforces the current atlas transfer and production lazy-chunk budgets; `npm run verify:browser` runs the Chromium browser contract suite after `npx playwright install chromium`; `npm run verify:anatomy` checks the certified manifest, system coverage, adult-male/simplified-model labeling, attribution, and evidence links; `npm run verify:runtime` checks performance marks, accessible fallback wiring, demand-driven search/chunk loading, and cleanup contracts; `npm run verify:viewport` checks the target phone, landscape, tablet, and desktop viewport contract; `npm run verify:curriculum` checks the guided path, Brain & Nerves, Respiration, Excretion, Reproduction, Heredity, and Tissues checkpoints; `npm run verify:interaction` checks that every core bay has Explore / Simulate / Quiz wiring, shared controls, quiz data, and progress integration; `npm run verify:reduced-motion` checks saved-preference precedence, the system `prefers-reduced-motion` fallback, and pause guards across all nine simulation bays; `npm run verify:deployment` checks production headers, cache namespaces, attribution, and installability. The production files are emitted to `dist/`. The web app can be installed on supported Android and iPhone browsers; the service worker keeps the shell, manifest, and explicitly downloaded anatomy chunks available for repeat visits and offline use.

## Static deployment checklist

See [`docs/reports/DEPLOYMENT_RELEASE_CHECKLIST.md`](./docs/reports/DEPLOYMENT_RELEASE_CHECKLIST.md) for the full release, security, offline-cache, privacy, rollback, and device-measurement checklist.

1. Run `npm ci` (or `npm install`) and `npm run verify`.
2. Publish the contents of `dist/` with SPA fallback to `index.html`.
3. Preserve `sw.js`, `manifest.webmanifest`, `models/`, `assets/`, `_headers`, and `robots.txt` at the site root.
4. Keep `index.html` and `sw.js` revalidated; hashed assets and anatomy geometry can be immutable.
5. Confirm the host applies `public/_headers`, including CSP and Permissions-Policy.
6. If the atlas source or manifest version changes, update `MODEL_CACHE` in `public/sw.js` before release so old geometry is not reused.

## Keyboard controls

When a live simulation is open:

- `Space` — play / pause
- `R` — reset
- `+` or `=` — increase speed
- `-` — decrease speed
- `Esc` — close panels
- `A` — open AI Tutor
- `H` — open help

In the 3D body atlas:

- Mouse drag / one-finger touch drag — rotate the anatomy around its own axis
- Wheel / pinch — zoom
- Right-drag / two-finger drag — pan
- Arrow keys — rotate the anatomy when the viewer is focused
- `+` / `-` — zoom, `R` or `Esc` — reset to the front view
- Use the on-screen system index or tab to organ controls on touch and keyboard devices

## Reduced motion

The lab uses an explicit local **Reduce animations** setting when one has been saved. On first load, when no saved setting exists, it honors the device or browser `prefers-reduced-motion: reduce` preference. Reduced-motion mode pauses JavaScript timers, requestAnimationFrame loops, canvas engines, physiology models, atlas damping, and the animated heart mesh; static readouts, sliders, navigation, quiz interactions, reset, and manual step controls remain available. The setting is stored locally and takes precedence over later system changes.

## Mobile optimization

The phone layout uses touch-safe controls, compact 3D atlas overlays, collapsed anatomy-layer controls, safe-area insets, reduced visual effects, content-visibility for below-fold bays, adaptive WebGL pixel ratio, visibility-based render pausing, and a low-power profile for devices that report Save-Data or limited memory. The compact phone header keeps sound, progress, Settings, and Help reachable; simulation controls use touch-sized targets, horizontal tab strips avoid wrapping, and long module rails scroll without widening the page. The atlas keeps the certified BodyParts3D interaction model while filtering fine geometry on touch GPUs. Use `npm run verify:mobile` to validate the mobile budget and responsive invariants.

## Sound

The app uses the Web Audio API for tiny UI tones, so no copyrighted audio files are needed. Browsers require a user interaction before audio can start. Sound can be muted from the header. Ambient Lab Sound is opt-in and intentionally very quiet.

## AI Tutor architecture

`src/lib/ai.js` is the provider-agnostic boundary. Without configuration it returns mock responses locally. To connect a backend, set the runtime URL before loading the app:

```html
<script>window.__HBL_AI_API_URL__ = '/api/ai';</script>
```

The frontend sends a JSON payload containing `question` and `context` (`module`, `simulation`, and `step`). Keep provider credentials on the server side only; never ship API keys in this frontend.

## Project structure

```text
src/
  App.jsx
  main.jsx
  styles.css
  data/modules.js
  data/learningObjectives.js
  components/
    BodyMap3DAtlas.jsx
    Icons.jsx
    InfoPanel.jsx
    Quiz.jsx
    SimulationControls.jsx
  simulations/
    CellLab.jsx
    DigestiveLab.jsx
    CirculationLab.jsx
    NervousLab.jsx
    RespirationLab.jsx
    ExcretionLab.jsx
    ReproductionLab.jsx
    HeredityLab.jsx
    TissuesLab.jsx
  lib/
    ai.js
    progress.js
    sound.js
    AnatomySceneManager.js
    CardioPhysiologyEngine.js
    EnzymeKineticsEngine.js
    CellularDiffusionEngine.js
```

The learning content is data-driven in `src/data/modules.js`, while measurable objectives and evidence links live in `src/data/learningObjectives.js`. The Guided Path schema and step registry live in `src/data/guidedPaths.js`; `src/data/anatomyRegistry.js` records source-derived reference objects, simplified teaching models, provenance, scale statements, and known limitations; `src/lib/guidedPath.js` exposes the compatibility helpers used by the shell, and `src/lib/progress.js` stores versioned path state with current step, view, exploration, quiz, and completion data. `src/components/GuidedStepCard.jsx` provides the shared step context, learning target, current-mode explanation, and Explore/Quiz transition used by live bays. New bays can be added by defining module metadata, Guided Path step content, objectives, anatomy-registry entries, evidence links, and a simulation component, then registering the component in `ModuleScreen`. Each bay now exposes a short learning-target strip and reference links so the visualization is paired with explicit outcomes and source context. Run `npm run verify:guided-path`, `npm run verify:guided-path-ui`, and `npm run verify:anatomy-registry` to validate the schema, progress migration, shared UI foundation, and anatomy provenance. Phase 4 adds registry-backed anterior/lateral/posterior framing presets plus structure-to-process teaching states for Circulation and Digestion; Phase 5 extends those links into synchronized Circulation and Digestion route sequences; Phase 6 adds source-metadata-anchored Three.js route overlays with reduced-motion support and explicit disclosure; Phase 7 adds fine-grained source markers, saved model phase, and stable learner-selected framing; Phase 8 adds pressure-state teaching detail and valve-state source markers; Phase 9 adds exact part-level semantic selection overlays for loaded high-detail atlas meshes; Phase 10 mounts a live CardioPhysiologyEngine view beside the coupled certified heart reference without rebuilding overlay geometry on every model tick; Phase 11 adds normalized per-valve gradient readouts and animated source-linked valve markers; Phase 12 adds automated source-anchor QC for all Circulation and Digestion overlay queries; Phase 13 adds reviewed conceptual-source provenance for Cell Structure, Tissues, and Heredity while explicitly preserving their no-approved-3D-source boundary; Phase 14 adds a strict human visual-review matrix and release gate for Circulation and Digestion overlays; Phase 15 adds a candidate-intake ledger for future 3D sources without importing or approving unreviewed assets; Phases 16–21 add canonical visual claims, geometry-derived anchors, offset conceptual route lanes, pressure invariants, multi-part valve markers, and refined Digestion teaching lanes; Phase 22 preserves the human sign-off gate; Phase 23 preserves the reviewed 3D candidate boundary; Phase 24 hardens live-reference quality on mobile; Phase 25 adds a strict release-readiness audit. Browser contracts are in `tests/browser/phase4-anatomy.spec.mjs`, `tests/browser/phase10-circulation-coupling.spec.mjs`, and `tests/browser/phase13-source-provenance.spec.mjs`. Implementation notes are in `docs/reports/GUIDED_PATH_PHASE_4_REPORT.md` through `docs/reports/GUIDED_PATH_PHASE_25_REPORT.md`. Automated anchor results are in `docs/reports/TEACHING_OVERLAY_QC_REPORT.md`; the pending visual sign-off matrix is `docs/reports/VISUAL_REVIEW_MATRIX.md`; the 3D candidate ledger is `docs/reports/3D_SOURCE_CANDIDATE_LEDGER.md`; and release status is `docs/reports/RELEASE_READINESS.md`.

## Anatomy reference and QC

The primary home atlas now uses BodyParts3D 4.0, an open adult-male reference anatomy dataset with 2,234 source meshes. The current atlas manifest contains airway and pulmonary-vessel structures for the respiratory route but no lung-parenchyma mesh; the Respiration bay therefore owns the clearly labeled simplified alveoli/lung teaching model rather than implying that absent mesh detail is present in the atlas. The viewer loads one meaningful skeletal chunk first; organ-system chunks are requested only when a peeling layer is enabled or a search/shared view targets a structure. This avoids the previous idle cascade in which all non-skeletal chunks downloaded automatically after first paint. The six educational peeling layers are skeletal, muscular, arterial, venous, nervous, and digestive/visceral; the skeletal layer is the only layer shown by default so the model starts uncluttered. On mobile, Learning Systems, Search, hotspot details, and layer controls are hidden until requested, retaining direct system selection and FJ/FMA hotspot metadata. Learners can choose a persisted accessible 2D anatomy mode that uses semantic system buttons and avoids WebGL/raycasting; it supplements rather than replaces the anatomically grounded 3D atlas. It is an educational model, not a diagnostic or surgical visualization. The dataset is redistributed under CC BY 4.0; see `public/ATTRIBUTION-BodyParts3D.md`. Placement and teaching labels were checked against OpenStax Anatomy & Physiology 2e, a peer-reviewed educational resource:

- Standard anatomical position and anterior / ventral terminology: https://openstax.org/books/anatomy-and-physiology-2e/pages/1-key-terms
- Heart between the lungs in the mediastinum: https://openstax.org/books/anatomy-and-physiology-2e/pages/19-1-heart-anatomy
- Liver in the right upper quadrant, with a larger right lobe: https://openstax.org/books/anatomy-and-physiology-2e/pages/23-6-accessory-organs-in-digestion-the-liver-pancreas-and-gallbladder
- Kidneys on either side of the spine, with the right kidney slightly lower: https://openstax.org/books/anatomy-and-physiology-2e/pages/25-3-gross-anatomy-of-the-kidney
- Nervous-system structure, CNS/PNS organization, and signal pathways: https://openstax.org/books/anatomy-and-physiology-2e/pages/12-1-basic-structure-and-function-of-the-nervous-system

The atlas is an adult-male educational reference, not a diagnostic or surgical illustration. Detailed system modules contain their own focused diagrams where anatomy needs additional detail.

## Atlas readiness and performance marks

The atlas deliberately reports three different milestones rather than treating “loaded” as one event:

- **First paint:** the application shell and route UI render; `hbl-shell-mounted` is the navigation/startup mark.
- **First usable anatomy:** the certified skeletal chunk has decoded, mounted, and bound pointer interaction; `hbl-skeletal-ready` and `hbl-first-3d-ready` mark this point. A visible status card remains on screen until it is reached.
- **Full requested atlas:** only reached if the learner explicitly enables or searches for enough systems to fetch every manifest chunk; `hbl-atlas-full-ready` marks it. The app no longer downloads every non-skeletal chunk after an idle timeout.

For production telemetry, collect these marks alongside first paint, first contentful paint, LCP, INP, CLS, selected quality profile, device class, chunk failures, and whether the learner used the accessible 2D mode. The application keeps this instrumentation local by default; deployment can add a privacy-reviewed `PerformanceObserver` or analytics adapter without changing the anatomy manager.

When the atlas is running, `window.__HBL_PERF__` also contains local per-chunk profiles with source (`network`, `cache`, or `embedded`), compressed/decoded bytes, source time, gzip decode time, geometry-build time, total time, loaded-part count, and chunk errors. This makes a device profiling session actionable without transmitting anatomy or learner data. Use the `?debug` route flag for the compact on-screen FPS/draw-call HUD; use the local performance object for detailed timings.

## Browser-level verification

The browser suite lives in `tests/browser/atlas.spec.mjs`, `tests/browser/brain-review.spec.mjs`, and `tests/browser/guided-path.spec.mjs`. It covers first paint versus skeletal readiness, demand-driven chunk requests, unloaded-structure search, accessible 2D persistence and keyboard selection, WebGL failure fallback, learning objectives, reduced motion, Brain & Nerves Explore / reflex / quiz review frames, guided-path recommendations, current-step semantics, module Previous / Next navigation, and phone layout. `docs/reports/BRAIN_NERVES_VISUAL_REVIEW.md` lists the expert visual sign-off criteria and the exact screenshot states retained by CI. The workflow uploads review screenshots and JSON performance profiles on successful and failed browser runs.

```bash
npx playwright install --with-deps chromium
npm run verify:browser
```

The suite uses Chromium with SwiftShader for deterministic WebGL-capable CI runs. The repository's static `npm run verify` intentionally does not invoke the browser suite because browser binaries and OS libraries are deployment-environment dependencies. In a container image, install the Playwright browser plus its system dependencies before running `verify:browser`.

GitHub Actions is configured in `.github/workflows/verify.yml`: the static contract job runs first, followed by a Linux Chromium job using `npx playwright install --with-deps chromium`. Failed browser runs retain Playwright traces, screenshots, videos, and HTML reports for seven days. The atlas geometry path also uses 16-bit index buffers for structures with 65,535 or fewer vertices; only larger structures use 32-bit indices, reducing GPU index-buffer memory on mobile without changing the certified source geometry.
