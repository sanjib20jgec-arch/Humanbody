# Human Biology Lab — Improvement Plan and Release Gates

Updated: 2026-09-27

## Product direction

Keep the certified, anatomically grounded BodyParts3D 4.0 atlas as the primary reference experience. Do not replace it with a static illustration. The simplified SVG map is an explicitly labeled accessible teaching diagram and fallback: it gives keyboard and touch users a useful system-level route without pretending to provide the geometric fidelity of the 3D atlas.

The experience should optimize for three separate milestones:

1. **First paint:** the shell, navigation, module context, and loading state are visible.
2. **First usable anatomy:** a meaningful skeletal layer has decoded, mounted, and become interactive.
3. **Full requested atlas:** only the chunks the learner has asked for are downloaded; a full-atlas milestone is reached only if every chunk is explicitly requested.

This separation avoids a misleading single “loaded” number and makes the performance work measurable.

## Shipped in this pass

### 1. Demand-driven atlas loading — P0 / highest impact

- The skeletal chunk is loaded first and remains the accepted initial state.
- The former idle cascade that downloaded all non-skeletal chunks has been removed from the active load path.
- Peeling-layer visibility requests the related anatomy systems through `ensureSystems`.
- Search and shared anatomy links request the matching chunk before resolving the structure.
- Repeated chunk requests are deduplicated with `loadedChunks` and `loadingChunks`.
- Chunk progress, first skeletal readiness, and full requested-atlas readiness are observable.
- CacheStorage and IndexedDB remain available for repeat visits; large anatomy data is not precached merely because the shell is installed.

Why it matters: code/data splitting sends less startup work and less idle bandwidth to the device. This is especially important for mobile GPUs, limited data plans, and first-time learners who may never open most systems.

### 2. Accessible 2D anatomy route — P0 / high impact, low risk

- 3D remains the default.
- Learners can choose a persisted accessible 2D mode.
- The diagram is paired with semantic system buttons, selected-system feedback, visited indicators, focusable controls, and touch interaction.
- WebGL initialization failure exposes a direct switch to the 2D route.
- The mode is labeled as a simplified educational diagram and not a diagnostic image.

Why it matters: the interaction does not depend on raycasting, drag precision, hover, or a working WebGL context. This creates a practical path for keyboard, touch, reduced-motion, low-power, and assistive-technology users while preserving the richer reference model for users who can use it.

### 3. Learning objectives and evidence links — P0 / high educational value

- Each module now has three measurable learning objectives in `src/data/learningObjectives.js`.
- Module screens expose a compact “Learning targets” strip.
- Anatomy terminology, heart anatomy, and kidney anatomy references are surfaced in context.
- BodyParts3D attribution remains available and is checked by the anatomy QC script.

Why it matters: objectives make an interactive scene teachable rather than merely explorable. Retrieval, feedback, signaling, and pairing graphics with verbal explanation are more likely to support learning than an unstructured visualization.

### 4. Release contracts and observability — P0 / medium impact, low risk

New checks:

- `npm run verify:anatomy` checks the certified manifest, system coverage, adult-male and simplified-model labels, CC BY attribution, and evidence URLs.
- `npm run verify:runtime` checks readiness marks, fallback wiring, demand-driven loading, and cleanup contracts.
- `npm run verify` now includes both checks.
- Runtime marks include `hbl-shell-mounted`, `hbl-skeletal-ready`, `hbl-first-3d-ready`, per-chunk readiness marks, and `hbl-atlas-full-ready` when every chunk has actually been requested and mounted.

## Priority roadmap

| Priority | Work | Impact | Risk | Effort | Educational value | Release gate |
|---|---|---:|---:|---:|---:|---|
| P0 | Keep skeletal-first, demand-driven loading stable | Very high | Medium | Done | High | No non-skeletal idle cascade; first usable layer is meaningful |
| P0 | 2D accessible/WebGL fallback | High | Low | Done | High | Keyboard, touch, focus, and no-WebGL routes work |
| P0 | Objectives, evidence, attribution, simplified-model labels | High | Low | Done | Very high | Every module has measurable targets and source context |
| P1 | Real browser test matrix | High | Medium | 2–3 days | Medium | Chromium/WebKit mobile emulation, keyboard, reduced motion, WebGL failure |
| P1 | Asset optimization pass | High | Medium | 2–4 days | Medium | Measure transfer, decode, triangles, draw calls, and memory before/after |
| P1 | PerformanceObserver adapter | Medium | Low | 1 day | Low | Capture LCP/INP/CLS and atlas milestones with consent/privacy review |
| P1 | Explicit offline atlas downloads | High | Medium | 2–3 days | High | User sees size, progress, cancel/retry, and cache state |
| P1 | Brain & Nerves content QA | High | Medium | 3–5 days | Very high | Terminology, pathways, diagrams, objectives, and quiz misconceptions reviewed |
| P2 | Module-by-module anatomy QA | High | Medium | 1–2 weeks | Very high | Position, orientation, relative size, and structure/function checks documented |
| P2 | Asset pipeline hardening | Medium | Medium | 3–5 days | Medium | Draco/Meshopt/quantization tested against decode time and frame rate |
| P2 | Error and recovery telemetry | Medium | Medium | 2–3 days | Low | Chunk failure, WebGL context loss, cache miss, and fallback conversion rates visible |
| P2 | Content authoring schema and review workflow | Medium | Low | 3–5 days | Very high | New module requires objectives, evidence, simulation, quiz, and accessibility copy |
| P3 | Deployment and governance | Medium | Low | 2–3 days | Medium | License inventory, immutable asset policy, rollback, CSP, and privacy review |

## Guided Path follow-up

The Guided Path scope audit and prioritized implementation plan live in `GUIDED_PATH_IMPROVEMENT_PLAN.md`. It covers progress semantics, recommendation logic, view-level milestones, home/module navigation hierarchy, mobile layout, accessibility, assessment thresholds, review recommendations, and measurement. The P0/P1 Guided Path implementation is now shipped and verified.

The diagram improvement scope and source/animation contract live in `GUIDED_PATH_DIAGRAM_PLAN.md`. The approved 3D replacement rollout is tracked in `GUIDED_PATH_3D_REFERENCE_PLAN.md`. A reusable focused BodyParts3D reference-object layer now supports 360° rotation, touch gestures, source-linked labels, reset, accessibility fallback, and reduced-motion behavior across Circulation, Digestion, Brain & Nerves, Respiration, Excretion, and Reproduction. Cell Structure, Tissues, and Heredity remain separate conceptual/molecular-source decisions. Automated verification passes; browser visual review remains the next sign-off step.

## Next implementation sequence

### P1-A — Browser-level verification

Add Playwright or an equivalent browser runner as a dev-only test dependency. Cover:

- shell first paint and atlas loading state;
- skeletal readiness before any manually enabled organ layer;
- clicking a peeling layer requests only the relevant chunks;
- repeated layer clicks do not duplicate network requests;
- search for an unloaded structure requests its chunk and then selects it;
- accessible 2D mode is keyboard-operable and persists after reload;
- WebGL constructor failure reveals the accessible action;
- reduced-motion mode stops animation loops while keeping reset, quiz, and manual step controls usable;
- mobile portrait, landscape, tablet, and desktop layouts;
- focus visibility and no hover-only learning action;
- page hide/show cleanup and renderer disposal.

Use mocked chunk responses for deterministic tests, plus one production-like test against the real manifest. Keep a small visual regression set for the atlas startup state, accessible mode, and the Circulation module.

### P1-B — Measure before tuning the asset

The first static runtime-memory experiment is now implemented: merged chunk/system meshes use 16-bit index buffers when their combined vertex count is at most 65,535, while wider meshes remain 32-bit. The generated atlas report estimates 62 compactable groups and approximately 7.87 MB of index-buffer memory saved. This is not yet a measured GPU result; browser/device profiling must confirm it without introducing decode or merge regressions.

Record a baseline on a representative desktop, mid-range Android, and low-memory phone:

- LCP, INP, CLS;
- shell-to-skeletal and shell-to-first-usable times;
- transfer bytes, decompression time, geometry upload time;
- triangle count, draw calls, texture memory, and worst frame time while dragging;
- cache hit/miss and chunk failure rates.

Use the baseline to decide whether geometry should be simplified, quantized, deduplicated, Draco-compressed, Meshopt-compressed, or split more finely. Compression alone reduces transfer cost but does not directly reduce runtime triangles or draw calls.

Suggested product budgets, subject to measurement:

- LCP ≤ 2.5 s;
- INP ≤ 200 ms;
- CLS ≤ 0.1;
- a visible first-usable skeletal layer on the mid-range mobile test device without a blank atlas;
- no sustained animation loop while the atlas is idle;
- no unbounded renderer, texture, geometry, or event-listener growth after bay navigation.

### P1-C — Explicit offline atlas mode

Keep the service worker focused on the shell and small critical assets. Add an explicit “Download anatomy for offline use” action only after the UX shows:

- total compressed size and estimated storage;
- per-chunk progress and remaining time/bytes;
- pause/cancel/retry;
- cache version and delete-download action;
- a clear distinction between shell offline access and anatomy-data offline access.

This prevents a large 33 MB compressed atlas from silently consuming storage during installation.

### P1-D — Brain & Nerves first content review

Before expanding another internal section, review the Brain & Nerves bay against the objective data and reputable anatomy references. Include anatomical position, CNS/PNS distinction, sensory-relay-motor pathway, reflex timing, and a misconception-focused checkpoint. Label any model that omits microscopic or functional detail as simplified.

## Anatomy quality-control protocol

For each teaching label or interactive structure:

1. Confirm the source mesh and concept ID in the manifest.
2. Verify anterior/posterior, superior/inferior, left/right, cavity, and system relationships against a reputable reference.
3. Check relative location, orientation, and educationally important relative size.
4. Verify that the module explanation matches the selected structure's metadata.
5. Record a screenshot or browser test for the label, focus state, touch route, and reset route.
6. Record the source, license, attribution text, and any simplification or adult-male-reference limitation.

The atlas is an adult-male reference model; it should not be described as universal human anatomy or as a clinical visualization.

## Source rationale

- [IES/WWC practice guide](https://ies.ed.gov/ncee/wwc/PracticeGuide/1): spacing, graphics plus verbal descriptions, abstract/concrete representations, and quizzing inform the learning-objective and checkpoint strategy.
- [National Academies formative assessment chapter](https://nap.nationalacademies.org/read/24783/chapter/9): feedback should expose misconceptions and guide subsequent instruction.
- [Mayer multimedia-learning summary](https://onlinelibrary.wiley.com/doi/abs/10.1111/jcal.12197): coherence, signaling, contiguity, segmenting, and pre-training support the restrained overlay and progressive module structure.
- [Web.dev code splitting](https://web.dev/learn/performance/code-split-javascript) and [Core Web Vitals](https://web.dev/articles/vitals): support sending only startup-critical code and tracking LCP, INP, and CLS.
- [React lazy](https://react.dev/reference/react/lazy): supports loading module code only when a learner reaches that route.
- [Three.js on-demand rendering](https://threejs.org/manual/en/rendering-on-demand.html), [responsive rendering](https://threejs.org/manual/en/responsive.html), [object disposal](https://threejs.org/manual/en/how-to-dispose-of-objects.html), and [picking](https://threejs.org/manual/en/picking.html): support idle rendering, DPR caps, deterministic cleanup, and cautious raycasting.
- [MDN requestIdleCallback](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestIdleCallback) and [WebGL best practices](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices): justify making low-priority work optional, using timeouts only when appropriate, deleting resources, and handling context failure.
- [MDN PWA caching](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Caching) and [offline/background operation](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Offline_and_background_operation): support shell precaching plus explicit large-resource downloads.
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/): supports visible focus, pointer-target sizing, keyboard access, and non-drag alternatives.
- [BodyParts3D attribution](https://dbarchive.biosciencedbc.jp/en/bodyparts3d/desc.html): defines the adult-male CC BY reference and attribution/limitation requirements.
- [OpenStax anatomical terminology](https://openstax.org/books/anatomy-and-physiology-2e/pages/1-key-terms), [heart anatomy](https://openstax.org/books/anatomy-and-physiology-2e/pages/19-1-heart-anatomy), and [kidney anatomy](https://openstax.org/books/anatomy-and-physiology-2e/pages/25-3-gross-anatomy-of-the-kidney): provide accessible educational validation references for labels, locations, and structure-function explanations.
- [glTF Transform](https://gltf-transform.dev/) and [KHR Draco](https://gltf-transform.dev/modules/extensions/classes/KHRDracoMeshCompression): guide the asset optimization experiment while keeping transfer compression separate from runtime geometry budgets.

## Definition of done for the next release

- `npm run verify` is green.
- Browser-level tests cover the loading, fallback, demand-loading, mobile, keyboard, reduced-motion, and cleanup paths.
- No non-skeletal atlas chunk is fetched without a learner action or explicit offline-download action.
- First usable anatomy is a visible, interactive skeletal layer with status feedback.
- Module screens expose objectives and evidence links.
- Anatomy attribution and simplified-model labels remain visible.
- Performance telemetry distinguishes first paint, first usable anatomy, and full requested-atlas readiness.
- The atlas remains a real 3D reference experience; the 2D route is clearly labeled as a complementary accessible diagram.

## Follow-up execution status

Since the initial plan was written, the following P1 items have been implemented:

- `src/lib/anatomyDownload.js` and the Settings panel now provide an explicit, cancellable, two-at-a-time offline atlas download with compressed-size estimate, progress, cache removal, and no install-time atlas precache.
- `src/lib/performance.js` now records local first paint, first contentful paint, LCP, INP where supported, CLS, anatomy resource transfer, shell-to-first-usable-anatomy timing, per-chunk source/cache/network timing, gzip decode time, geometry-build time, and chunk errors under `window.__HBL_PERF__`. It does not send telemetry anywhere.
- `scripts/performance-baseline.mjs` enforces the current 31.4 MB compressed atlas budget, ≤3 MB per chunk, and lazy vendor/module budgets.
- The `?debug` atlas HUD remains available for FPS, worst frame, draw calls, DPR, and quality. Detailed chunk timing is available in the local performance object for device profiling.
- `tests/browser/atlas.spec.mjs` plus `playwright.config.mjs` provide the planned browser contract coverage, including first paint/chunk profiling and a Brain & Nerves keyboard, hotspot, reflex-simulation, and quiz-feedback route. `tests/browser/brain-review.spec.mjs` additionally captures Explore, peripheral selection, reflex, quiz feedback, and reduced-motion frames for expert visual review; `BRAIN_NERVES_VISUAL_REVIEW.md` records the sign-off criteria. A repository workflow at `.github/workflows/verify.yml` now runs the static contracts and a separate Chromium job with `npx playwright install --with-deps chromium`, uploading traces, screenshots, videos, visual review frames, and JSON performance profiles on success or failure. Chromium and its runtime libraries are now installed in the local verification environment; the complete browser matrix passes 28/28 tests across desktop and phone profiles.
- Brain & Nerves now has a contextual OpenStax nervous-system evidence link in its learning-target strip. Its existing model continues to disclose that the diagram and reflex arc are simplified educational models.
- Brain & Nerves content QA now makes the CNS/PNS distinction explicit in the first learning objective, Explore copy, and an accessible peripheral-nerves hotspot. The spinal-cord quiz wording now states the body connection and reflex role more precisely; the curriculum smoke check protects this distinction.
- `scripts/brain-qc.mjs` now generates `BRAIN_NERVES_QC_REPORT.md` with landmark coverage, bilateral representation, chunk mapping, basic vertical-envelope checks, and the explicit finding that the manifest has a spinal-cord central canal but no spinal-cord parenchyma mesh. It is part of `npm run verify` and does not pretend to replace visual expert review.
- Deployment hardening now includes a CSP, Permissions-Policy, explicit immutable/revalidated cache rules, and `DEPLOYMENT_RELEASE_CHECKLIST.md` covering host configuration, privacy, offline cache versioning, attribution, and rollback. `verify:deployment` checks the security-header contract without claiming that a local file preview applies response headers.
- `scripts/atlas-binary-qc.mjs` now regenerates `ATLAS_BINARY_QC_REPORT.md` and validates all 15 compressed chunks, 2,234 parts, attribute spans, alignment, and packed index bounds before visual or GPU profiling begins. It is part of `npm run verify`.

## Atlas QA finding from the next phase

The generated `ATLAS_QC_REPORT.md` confirms that the current BodyParts3D manifest contains airway and pulmonary-vessel structures but no lung-parenchyma mesh. The interface now labels that route **Airways & pulmonary flow**, and the Respiration bay must continue to label its alveoli/lung visualization as a focused simplified teaching model. This is preferable to implying that a structure absent from the certified mesh is present. A future asset revision can add a licensed lung-parenchyma mesh only after source, license, spatial validation, and transfer/runtime budgets are reviewed.
