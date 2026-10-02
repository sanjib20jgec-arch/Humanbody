# Human Biology Lab — Master Plan and Release Gates

Updated: 2026-10-02

This is the single top-level product and engineering roadmap. It consolidates the release-gate roadmap, learning-bay UI optimization, and staged expansion from English and Bengali to Indian-language support. Bay-specific plans remain implementation references; they do not replace this master roadmap.

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
| P1 | Learning-bay UI audit and shared-shell pilot | High | Medium | Audit complete; implement incrementally | Very high | Current-build phone/desktop validation; clear mode, model, controls, feedback, keyboard/touch, and text-resize paths |
| P1 | Locale foundation; certify English + Bengali without regressions | High | Medium | Engineering estimate after audit; reviewer-dependent | Very high | Locale registry, catalog parity, script/RTL foundation, offline and visual gates |
| P2 | Module-by-module anatomy QA | High | Medium | 1–2 weeks | Very high | Position, orientation, relative size, and structure/function checks documented |
| P2 | Asset pipeline hardening | Medium | Medium | 3–5 days | Medium | Draco/Meshopt/quantization tested against decode time and frame rate |
| P2 | Error and recovery telemetry | Medium | Medium | 2–3 days | Low | Chunk failure, WebGL context loss, cache miss, and fallback conversion rates visible |
| P2 | Content authoring schema and review workflow | Medium | Low | 3–5 days | Very high | New module requires objectives, evidence, simulation, quiz, and accessibility copy |
| P2 | Roll the validated bay UI pattern across all learning bays | High | Medium | Sized after pilot | Very high | Shared navigation/interaction rules without flattening bay-specific teaching; no responsive/a11y regression |
| P2 | Add the remaining 21 scheduled Indian languages in reviewed waves | Very high | High | Reviewer-dependent; parallelizable | Very high | Per-locale subject/language sign-off, font/script/RTL, offline and device QA |
| P3 | Add non-scheduled Indian languages and Indian Sign Language workstream | High | High | Demand/reviewer-dependent | Very high | Community-led language/script plan; ISL treated as a separate visual-language project |
| P3 | Deployment and governance | Medium | Low | 2–3 days | Medium | License inventory, immutable asset policy, rollback, CSP, and privacy review |

## Cross-cutting workstream: Learning-bay UI optimization

**Audit/implementation state (2026-10-02): the source/code audit is complete and a focused shared-shell density pilot is implemented in code.** Browser visual validation of the changed build is still pending, so archived screenshots remain risk signals—not proof of the current rendering. The first slice moves the main bay content ahead of supporting context, consolidates Previous/Next into the Guided Step card, removes duplicate mode dots, and folds objectives plus the full course map into closed disclosures after the lesson. Home keeps its full Guided Path. Both the shared-shell slice and the current Movement Theater pass are provisional; U0 remains open before final layout commitment or broad rollout.

**Active Movement Theater follow-up:** first-visit guidance now sits inline beside action selection instead of covering the stage; optional study tools start collapsed; and play, reset, step, and speed controls are available in Explore as well as Simulate. Contextual hints, webcam comparison, and retrieval practice now flow inside the study-tools disclosure instead of floating over the figure. Shared simulation speed controls now have 44 × 44 px minimums on coarse-pointer devices, including touch tablets. Build and source-level checks pass, but the changed rendering and learner task flow still need browser/device validation.

### Audit method and confidence

Reviewed the current `App.jsx` module/home composition, `GuidedStepCard`, bay view switchers, quiz/info/control components, responsive CSS, locale hooks, and viewport/visual checks. Also inspected the repository’s saved Movement Theater captures (`evidence/responsive-desktop.png`, `evidence/responsive-phone.png`, and stage captures). These archived captures show a 10-step guided path, while current `src/data/guidedPaths.js` defines 12 steps; recapture them before using them as design sign-off.

**Checks run on the implementation:** `npm run verify:static` passes the source, build/offline, anatomy, runtime, curriculum, mobile, viewport, reduced-motion, Kinesiology, and deployment contracts; `npm run generate:offline` and `scripts/smoke.mjs` also pass. Production still warns that the separate Three.js chunk exceeds Vite’s 500 kB threshold (737 kB minified, 187 kB gzip); preserve its lazy boundary. Full `npm run verify` now requires the strict 78-context visual gate and 122 Playwright cases. This sandbox could not install Chromium (CDN TLS `ECONNRESET`), so those browser gates are blocked here; code/static checks are not visual validation.

**Visual validation gap:** Playwright Chromium is unavailable: its browser installation failed with a TLS `ECONNRESET` from the browser CDN. The current-build phone/tablet/desktop screenshot matrix, focus/overlap inspection, and rendered contrast measurement therefore remain open U0 work. Do not treat code/build checks or a skipped visual gate as a pass.

### First implementation slice — shared learning-bay density

- `GuidedStepCard` now owns the previous/next step controls, using the shared guided-path neighbor resolver; first/last-step controls are omitted when unavailable.
- Removed the card’s duplicate Explore/Simulate/Quiz dots. The bay’s existing mode switcher remains the mode control.
- The main bay content now follows the header, hero, and one guided-step context. Learning objectives (including their evidence link) and the full course map remain available as closed `<details>` disclosures after the lesson.
- Home’s full, always-visible Guided Path is unchanged. The current 12-step sequence is reflected in browser test contracts.
- Browser-level interaction and responsive rendering still need validation when Chromium is available; this is a code/build-checked pilot, not visual sign-off.

### Deep-audit findings — ranked

| ID / priority | Finding | Current evidence | Strategic response |
|---|---|---|---|
| UI-01 · P1 | **Lesson content started too far below the bay header.** At audit time, learners reached the main bay component after the module header, hero, objectives/references, whole-course path, Previous/Next navigation, and Guided Step card. This created a tall preamble, especially on phones. | Baseline `ModuleScreen` composition in `src/App.jsx`; archived Movement Theater screenshots are stale and are not current-render proof. | First slice now puts the Guided Step card directly before the bay, then moves objectives and the full course map into closed disclosures after the lesson. Confirm fold position, focus/scroll behavior, and responsive fit on the changed build before sign-off. |
| UI-02 · P1 | **Course navigation and progress were repeated.** The baseline shell exposed the 12-step path, a separate Previous/Next bar, mode dots in the Guided Step card, and bay-local mode tabs. | Baseline `GuidedPath`, `ModulePathNav`, and `GuidedStepCard` composition plus each bay’s `view-switcher`; the current pilot is a code change, not yet a browser-validated result. | Previous/Next now lives in the Guided Step card, duplicate dots are removed, and the module-level course map is collapsed; Home retains the full path. Keep the bay’s Explore/Simulate/Quiz control and validate the new hierarchy before extending the pattern. |
| UI-03 · P1 | **Information hierarchy depends heavily on tiny, low-emphasis labels.** Several metadata/eyebrow styles are 7–10 px mono uppercase. A token-level contrast spot-check gives about 3.42:1 for `#526b83` on `#08111c` and 3.99:1 for `#60758c` on `#08111c`, below 4.5:1 for normal text. Gradient/alpha surfaces need rendered measurement. | `src/styles.css` uses the cited colors/font sizes for metadata, labels, status, and footers. Existing foundation checks do not cover every small label/surface pair. | Reserve microtype for nonessential metadata; raise instructional copy and control labels to readable sizes; add a rendered WCAG contrast audit for both themes and states before sign-off. |
| UI-04 · P1 | **Some touch and selected-state contracts are not covered by current checks.** The compact mobile header uses roughly 32 × 34 px icon buttons; at least the Cell bay’s view switcher communicates selection with a visual `active` class without `aria-pressed`/tab semantics. Existing viewport smoke mainly checks source contracts, not every rendered target/state. | Mobile `.header-icon-button` rules in `src/styles.css`; `CellLab.jsx` view-switcher buttons; `scripts/viewport-smoke.mjs` and `scripts/visual-gate.mjs`. | Audit every shared action for target size, accessible name, focus, and announced selected state. Add DOM/browser checks for the header, mode switcher, guided navigation, and floating actions. |
| UI-05 · P1 for first-use Kinesiology | **The first-use “New to 3D?” coach could obscure page context.** In the audited baseline it was absolutely positioned over the theater and used a dialog role without modal/focus behavior. | Baseline `KinesiologyTheater.jsx` tour and archived captures; current implementation moves it into the action panel as a dismissible note, not a dialog. | First-use guidance is now inline and non-modal; the stage remains visible. Validate its placement and readability on phone/desktop, then test whether learners can discover camera, action, and muscle-selection tasks without blocking the model. |
| UI-06 · P2 | **The persistent AI Tutor FAB can cover dense learning content.** Saved Movement Theater stage captures place it over coaching/source copy. Other bays may have different collisions. | `.ask-ai-fab` is rendered globally for every active module in `App.jsx`; saved phone/desktop stage captures show overlap. | Keep Tutor discoverable but move it into a predictable utility location or make its placement collision-aware; test against controls, notes, keyboard, and safe-area insets. |
| UI-07 · P2 | **The Home screen asks learners to choose among several destinations.** It combines a large introductory CTA/progress area, an up-next card, a large atlas, a 12-bay list, and a Guided Path. This may be useful breadth, but the first recommended action versus free system selection is not yet validated. | `HomeScreen` composition in `App.jsx`; mobile CSS stacks these regions vertically. | Test first-time and returning-learner tasks separately. Keep one dominant next action, but do not hide direct atlas or bay access. |
| UI-08 · P1 for localization readiness | **Fixed truncation and horizontal chip rails may reject longer translations.** Header context and module-list copy use ellipsis/nowrap; topic pills and some guided/action rails scroll horizontally. Urdu direction and multiple Indic font metrics add further risk. | `.header-context strong`, `.module-list-copy`, `.module-topic-pills`, and rail rules in `src/styles.css`; locale support is currently only English/Bengali. | Replace truncation of meaningful lesson labels with wrapping/adaptive layouts; test pseudo-long text, Bengali, a Devanagari script, and RTL before translation waves. |
| UI-09 · P2 maintainability | **The UI stylesheet has a high cascade-maintenance cost.** `src/styles.css` is about 2,000 lines with many appended phase blocks and repeated breakpoint rules. This makes responsive regressions and conflicting overrides harder to reason about. | Current stylesheet structure and repeated `max-width` blocks. | During the pilot, map active rules, establish tokens/component layers, and remove only demonstrably obsolete overrides. Avoid a risky whole-file rewrite. |

### What is already working and should be preserved

- A shared Explore / Simulate / Quiz concept and lazy-loaded bay components provide a useful common shell.
- Learning objectives, evidence links, guided-path progress, saved state, focus styling, reduced-motion handling, touch/viewport contracts, and a 2D/no-WebGL anatomy path already exist.
- `verify:viewport` and `verify:mobile` pass their current contracts. The redesign should extend these gates, not replace them.
- The 3D anatomy and simulation surfaces are the product’s differentiator. Optimize the surrounding orientation, controls, and explanations without flattening specialist visualizations or pulling heavy 3D code into first paint.

### U0 audit completion criteria (still open)

- Re-capture the **current build** at phone (360 × 780), tablet (820 × 1180), and desktop (1440 × 900), on Home and representative bays, in light/dark, Explore/Simulate/Quiz, reduced-motion, keyboard-focus, first-use, and accessible-fallback states.
- Run the same five tasks across first-time and returning learners: identify the target; find/select a structure; change and reset a control; answer a question and interpret feedback; find the next step or return to the atlas.
- Measure real rendered bounding boxes, focus order, text clipping/overlap, contrast, and touch targets. Record baseline captures and issue severity.
- Use the saved evidence only as a pointer to risks until recaptured; its 10-step path does not match the current 12-step data.

**U0 exit gate (still open):** check the ranked issue list against current-build screenshots and at least one learner/teacher walkthrough; confirm the pilot bay and top two pain points. This remains the sign-off and broader-rollout gate, not a blocker to the user-requested, reversible shared-shell density slice. Do not treat code/build checks as visual validation.

### Current baseline and design objective

The app has a shared `Explore` / `Simulate` / `Quiz` view model, lazy-loaded bay components, learning objectives, a `GuidedStepCard`, accessibility fallbacks, and saved progress. The first shared-shell slice changes orientation and disclosure order only; it preserves each bay’s specialized teaching surface and controls. Use rendered review and learner tasks—not code consistency alone—to decide what should generalize next.

Optimize for one learner loop: **know what to learn → inspect a model → operate or test an idea → understand the feedback → choose what to do next.** Preserve the bay-specific model and pedagogy inside a consistent shell.

### Proposed learning-bay structure

| Area | Learner question it answers | UI direction |
|---|---|---|
| Bay header | Where am I, and why does this matter? | Clear title, short purpose, level/curriculum context, and a visible route back |
| Learning target / guided step | What should I be able to explain or do? | One primary target in view; expose the full guided-step context when useful, avoid duplicate objective cards |
| Mode navigation | What can I do here? | Consistent, accessible Explore / Simulate / Quiz switch with an unmistakable active state |
| Main learning surface | What am I looking at? | Give the model/diagram and its explanation enough space; keep labels and controls tied to the relevant structure |
| Contextual controls | What can I change or reset? | Group model actions together; keep primary controls near the model and secondary controls out of the way |
| Feedback and next step | Did I understand it, and where next? | Explain quiz answers and simulation outcomes; provide retry, review, or a relevant next step |
| Evidence and limitations | How trustworthy is this representation? | Keep sources, attribution, and model limitations available without competing with the main task |

**Proposed default to test, not assume:** open a bay in free Explore mode and offer the Guided Path as a clear optional start. Do not force a linear tour on learners who already know what they want to inspect. Validate this against learner/teacher feedback in the pilot.

### Responsive and interaction direction

- **Phone first:** at the existing 360 px target, stack the model, explanation, and controls without shrinking the model into a thumbnail. Put optional detail in collapsible panels or a bottom sheet; keep the current mode and primary action easy to reach.
- **Tablet/desktop:** use the extra width for model + contextual explanation/control space, but keep the same order and interaction vocabulary as phone.
- **Progressive disclosure:** prioritize one main task per screen. Move deep-dive facts, references, and less-used settings behind clearly named disclosure controls rather than removing them.
- **Stable controls:** make play/pause, step, reset, selection, and quiz feedback behave consistently where their function is shared; retain bay-specific controls where science requires them.
- **Accessible operation:** keyboard-only paths, visible focus, screen-reader labels/status, useful 2D fallback, reduced-motion support, and touch targets designed around a 44 × 44 px target where layout permits.
- **Translation resilience:** avoid fixed-height text containers and text embedded in images. Test multiline labels, the current 100/115/130% text-scale options, 200% browser zoom, Bengali conjuncts, other Indic shaping, and RTL/bidi fixtures before opening translation waves.
- **Keep performance:** preserve lazy bay loading, demand-driven 3D, low-graphics mode, and reduced-motion behavior. A prettier shell must not add heavy startup work or hide loading/error states.

### Strategic execution phases

#### U0 — Baseline audit and task map (in progress)

- The source/code audit and first evidence review are complete; ranked findings UI-01–UI-09 are recorded above.
- A focused shared-shell density slice is implemented in code: lesson-first composition, in-card Previous/Next controls, no duplicate mode dots, and collapsed objectives/course map after the lesson. The Home Guided Path remains full.
- Re-capture the current Home and representative bays at phone (360 × 780), tablet (820 × 1180), and desktop (1440 × 900), with both themes and key interaction/accessibility states. Existing screenshots are stale evidence, not release sign-off.
- Walk through the five representative tasks listed in the U0 completion criteria with first-time and returning learners/teachers; record wrong turns, assistance needed, clipping, focus, target dimensions, and text contrast.
- The rendered browser audit is blocked until a browser is available; the automated visual gate must run rather than skip.

**Exit gate:** current-build screenshots plus at least one learner/teacher walkthrough confirm or revise the issue ranking, validate the shared-shell slice, and select the next bay-level pain points. This gate blocks sign-off and broad rollout, not the already-started focused implementation.

#### U1 — Shared bay design contract

- Define the shared shell: header/back route, one primary target/guided-step slot, mode switch, primary content region, contextual control area, feedback, and next-step affordance. The current pilot places Previous/Next in the step card and keeps objectives/references plus the whole-course map in named disclosures after the lesson.
- Set responsive rules and typography/spacing/component tokens that work in dark and light themes and across text scale settings.
- Specify loading, empty, error, no-WebGL, reduced-motion, and offline states alongside the happy path.
- Keep a documented exception path for a bay whose teaching task needs a different arrangement; consistency is about predictable controls, not forcing the same canvas everywhere.

**Exit gate:** a short design spec/prototype and acceptance checklist reviewed before broader implementation; the current shared-shell slice remains a prototype pending visual and task validation.

#### U2 — Bay-specific vertical slice (next)

- The shared-shell density pilot is already applied through `ModuleScreen`; choose one high-interaction bay for deeper screen-level work (candidate: Circulation for anatomy + simulation controls; Cell Structure as a content-dense comparison case).
- Improve that bay’s Explore, Simulate, Quiz, and one end-to-end guided step without rewriting its simulation engine or removing the model, source notes, or accessible path.
- Validate both the shared shell and the chosen bay at phone, tablet, and desktop with learners/teachers; revise confusing or crowded states before scaling.

**Exit gate:** task walkthroughs succeed without facilitator hints; no critical keyboard, touch, contrast, responsive, or content-hierarchy issue remains; owner signs off the pattern.

#### U3 — Roll out across learning bays

- Apply the approved shell incrementally, one bay at a time; do not rewrite simulation engines just to align their visuals.
- Retain each module’s domain-specific model/control groups while standardizing navigation, actions, status, help, feedback, and spacing.
- Add route/component smoke coverage as each bay is migrated; compare before/after screenshots to catch regressions.

**Exit gate:** every live bay meets the same interaction and responsive contract; deferred exceptions are documented with a reason and test.

#### U4 — Multilingual, accessibility, and release hardening

- Test English and Bengali first; add pseudo-long-string and RTL test fixtures before translations are complete so clipping/direction problems are caught early.
- When locale catalogs arrive, test representative scripts and script variants, fonts, line height, autonyms, bidi scientific notation, and offline content.
- Run the complete viewport/theme/mode matrix, keyboard/screen-reader checks, reduced-motion path, and offline PWA/single-file artifact checks.

**Exit gate:** no horizontal overflow at supported widths; no clipped learner-facing text at text-scale/zoom targets; core flows are keyboard and touch operable; no critical visual, localization, accessibility, or performance regression.

### Success measures and guardrails

- Learners can answer “what is this bay about?”, “what should I do next?”, and “how do I reset/continue?” from the screen without searching through unrelated panels.
- Every core task is possible by keyboard and touch; interactive targets aim for 44 × 44 px; the 2D route remains usable without WebGL.
- Automated viewport checks report no horizontal overflow at the agreed phone/tablet/desktop sizes; text remains readable at the app’s scale options and 200% browser zoom.
- Formative learner/teacher walkthroughs show fewer wrong turns and clearer quiz/simulation feedback than the baseline; record the specific task failures and re-test them rather than relying only on preference ratings.
- Performance and accessibility contracts remain green: no extra atlas cascade, no idle animation regression, reduced motion still works, and loading/error states remain visible.
- Use local screenshots and consent-based usability notes for design decisions; do not add learner analytics or collect personal data just to evaluate the redesign.

### Dependencies and decisions

- Complete U0 before committing to a final layout or broad pattern rollout; the current density slice is provisional. Use the validated shared shell and selected bay pilot before broad translation of every bay; locale architecture and catalog work can proceed in parallel, but bulk translation should wait until the shell handles longer text, script fonts, and RTL.
- Validate at the pilot: which bay to lead with, whether free Explore is the default or the guided path is the default, and which reported pain point matters most (crowding, navigation, model size, or visual style).
- Preserve the existing visual identity unless audit/testing shows it obstructs learning. Optimize clarity and task success before decorative changes.

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
- `tests/browser/atlas.spec.mjs` plus `playwright.config.mjs` provide browser contract coverage, including first paint/chunk profiling and a Brain & Nerves keyboard, hotspot, reflex-simulation, and quiz-feedback route. `tests/browser/brain-review.spec.mjs` captures frames for expert visual review; `BRAIN_NERVES_VISUAL_REVIEW.md` records sign-off criteria. The repository workflow at `.github/workflows/verify.yml` runs static contracts, a dedicated 78-context responsive visual job (including Movement Theater), and separate serial Chromium jobs for desktop and phone Playwright projects; this avoids combining the long SwiftShader matrix under one timeout. Test results and screenshots are uploaded on success or failure. The current suite lists 122 cases across desktop and phone projects. Chromium is not installed in this sandbox: `npx playwright install chromium` failed with CDN TLS `ECONNRESET`, so no current browser matrix or visual sign-off is claimed.
- Brain & Nerves now has a contextual OpenStax nervous-system evidence link in its learning-target strip. Its existing model continues to disclose that the diagram and reflex arc are simplified educational models.
- Brain & Nerves content QA now makes the CNS/PNS distinction explicit in the first learning objective, Explore copy, and an accessible peripheral-nerves hotspot. The spinal-cord quiz wording now states the body connection and reflex role more precisely; the curriculum smoke check protects this distinction.
- `scripts/brain-qc.mjs` now generates `BRAIN_NERVES_QC_REPORT.md` with landmark coverage, bilateral representation, chunk mapping, basic vertical-envelope checks, and the explicit finding that the manifest has a spinal-cord central canal but no spinal-cord parenchyma mesh. It is part of `npm run verify` and does not pretend to replace visual expert review.
- Deployment hardening now includes a CSP, Permissions-Policy, explicit immutable/revalidated cache rules, and `DEPLOYMENT_RELEASE_CHECKLIST.md` covering host configuration, privacy, offline cache versioning, attribution, and rollback. `verify:deployment` checks the security-header contract without claiming that a local file preview applies response headers.
- `scripts/atlas-binary-qc.mjs` now regenerates `ATLAS_BINARY_QC_REPORT.md` and validates all 15 compressed chunks, 2,234 parts, attribute spans, alignment, and packed index bounds before visual or GPU profiling begins. It is part of `npm run verify`.

## Atlas QA finding from the next phase

The generated `ATLAS_QC_REPORT.md` confirms that the current BodyParts3D manifest contains airway and pulmonary-vessel structures but no lung-parenchyma mesh. The interface now labels that route **Airways & pulmonary flow**, and the Respiration bay must continue to label its alveoli/lung visualization as a focused simplified teaching model. This is preferable to implying that a structure absent from the certified mesh is present. A future asset revision can add a licensed lung-parenchyma mesh only after source, license, spatial validation, and transfer/runtime budgets are reviewed.

---

## Master workstream: Indian-language expansion

**Status: planned; not yet implemented.** The current app supports English and Bengali. This workstream is now part of this master plan; there is no separate language roadmap to keep in sync. Bulk translation waves depend on Learning-bay UI phases U0–U2; locale-catalog engineering may run in parallel.

### Outcome and scope

“Every Indian language” is open-ended: many living Indian languages are outside the constitutional schedule, and several languages use multiple scripts. Use a staged promise:

- **Release 1: the 22 languages in the Constitution’s Eighth Schedule plus English** — 23 language choices. English is not one of the 22 scheduled languages.
- **Longer term: an extensible, community-supported catalog** for languages beyond the Schedule, prioritized by learner demand and qualified reviewer availability. Do not claim the first release covers every language spoken in India.
- Treat materially different writing systems as explicit locale variants, not as separate languages. Indian Sign Language requires a separate visual-language/accessibility workstream; text localization alone is not ISL support.
- Keep language independent of curriculum selection (WBBSE, NCERT/CBSE, grade and exam level). Selecting a language must never silently change a learner’s syllabus.

Initial locale and script candidates are below. Native-language educators must confirm autonyms, orthography, primary script, and alternate-script requirements before catalogs are frozen.

| Language | Locale ID candidate | Initial script / review note |
|---|---|---|
| English | `en` | Latin; existing default |
| Assamese | `as` | Assamese / Eastern Nagari |
| Bengali | `bn` | Bengali; existing locale |
| Bodo | `brx` | Devanagari |
| Dogri | `doi` | Devanagari |
| Gujarati | `gu` | Gujarati |
| Hindi | `hi` | Devanagari |
| Kannada | `kn` | Kannada |
| Kashmiri | `ks-Arab` or `ks-Deva` | Confirm preferred Indian learner default; support other reviewed script as a separate variant |
| Konkani | `kok-Deva` | Devanagari first; assess Roman script with reviewers |
| Maithili | `mai` | Devanagari |
| Malayalam | `ml` | Malayalam |
| Manipuri (Meitei) | `mni-Mtei` | Meitei Mayek first; assess Bengali-script variant with reviewers |
| Marathi | `mr` | Devanagari |
| Nepali | `ne` | Devanagari |
| Odia | `or` | Odia |
| Punjabi | `pa-Guru` | Gurmukhi for the India release |
| Sanskrit | `sa` | Devanagari |
| Santali | `sat-Olck` | Ol Chiki first; assess other scripts with reviewers |
| Sindhi | `sd-Deva` or `sd-Arab` | Confirm default with reviewers; keep variants distinct |
| Tamil | `ta` | Tamil |
| Telugu | `te` | Telugu |
| Urdu | `ur` | Perso-Arabic / Nastaliq; right-to-left |

Retain the existing `en` and `bn` identifiers and the `hbl-language` storage key. New locales use canonical BCP 47 tags; script-sensitive variants must not be collapsed into a single preference value. Migrate old saved values safely rather than resetting learner preferences.

### Current localization baseline

- `src/lib/i18n.js` has English and Bengali UI dictionaries with English fallback.
- `src/lib/preferences.js` permits only `en` and `bn`; it sets `html[lang]` but has no direction handling.
- `src/components/FoundationSettings.jsx` displays a two-choice language control.
- `src/data/moduleText.bn.js` holds Bengali module metadata, and deep-dive data embeds `{ en, bn }` pairs through `src/data/packHelpers.js` and bay packs.
- `src/theme.css` includes Noto Sans Bengali and Bengali-specific typography rules. Other script fonts and RTL layout support are not present.
- Foundation, cell, bay, and visual smoke checks include English/Bengali assumptions.

Extend this foundation in small migrations. Protect current Bengali terminology, English content, preferences, offline artifacts, and existing verification checks while the architecture is expanded.

### Content and terminology policy

1. Keep stable claim/content IDs, evidence, and scientific source records separate from translated wording. Subject review protects the scientific claim; a qualified native-language educator reviews the wording and curriculum terminology.
2. Maintain a shared, versioned biology glossary. For each locale term record its English source, approved translation, script, reference textbook/source, reviewer, status, and review date.
3. No unreviewed machine translation ships. Machine translation may assist private drafting only. Each released locale needs named language and science reviewers (or a qualified combined reviewer).
4. Use standard, age-appropriate classroom language, not transliteration-only Hinglish or equivalent. Where helpful, show an approved local term and the English scientific term in parentheses on first use. Preserve Latin scientific names, formulas, gene symbols, and SI units where appropriate.
5. English fallback is allowed only when it is clearly identified. A locale is marked beta/incomplete until its release-gated namespaces pass review; do not silently present a mixed translation as complete.
6. Preserve the existing Bengali ASCII-digit policy (`0–9`) for scientific measurements initially. Use locale-aware grouping with `Intl.NumberFormat(locale, { numberingSystem: 'latn' })`; native-script digits require a separate product decision.
7. Set the document language and direction correctly. Arabic-script locales such as Urdu, and selected Kashmiri/Sindhi variants, require `dir="rtl"`; isolate Latin scientific text and numeric values with `bdi` or `dir="ltr"` as appropriate.

### Technical direction

Keep the current lightweight custom i18n approach unless measurement shows it is insufficient; a large framework dependency is not a prerequisite.

- Add a locale registry with canonical tag, reviewed English name and autonym, script, direction, rollout/completeness state, and fallback chain.
- Organize translations into locale and feature namespaces (for example common, home, modules, and bay catalogs). Load only the selected locale and relevant bay data where practical.
- Migrate inline `{ en, bn }` content to stable content IDs plus locale catalogs while retaining shared claims, evidence, and source IDs.
- Give React components one translation/formatting API for strings, plural rules, numbers, dates, and sorting. Remove product-level `language === 'bn'` branches.
- Replace the two-button control with an accessible, searchable language picker that shows reviewed autonyms, English labels, availability, and offline-pack status. Do not use flags as language labels.
- Add licensed, subsetted WOFF2 fonts by script and load only what is needed. Test conjuncts, shaping, line height, punctuation, fallback, and glyph coverage. Urdu needs a reviewed Nastaliq-capable font and RTL layout review.
- Cache the selected locale catalogs and required font for offline use. Keep offline selection explicit, preserve the single-file offline artifact, and establish an artifact-size budget before bundling every script font.
- When connected to the AI Tutor provider, request responses in the chosen locale. Keep provider credentials server-side and distinguish generated explanations from reviewed lesson content.

### Delivery milestones

Translation completion depends on reviewer capacity; do not promise calendar dates based only on engineering effort.

#### L0 — Scope, inventory, and governance

- Inventory every learner-visible string/content surface: shell, settings, help, loading/errors, home, atlas, guided paths, simulations, quizzes, references, accessibility labels, print/export, offline states, and AI Tutor.
- Approve locale IDs, scripts, autonyms, orthography, glossary authorities, curriculum-specific terminology, and alternate-script scope with reviewers.
- Assign science and language reviewers; define approval states (`draft`, `language-reviewed`, `science-reviewed`, `approved`) and release ownership.

**Exit gate:** signed locale/script matrix, reviewer coverage for Wave A, and a string/content inventory.

#### L1 — Locale architecture and script foundation

- Add locale registry, safe preference migration, locale picker model, explicit fallback/completeness reporting, and catalog parity checks.
- Stamp `html.lang`, `html.dir`, and script metadata before first paint, including from saved offline preferences.
- Add bidi primitives before Urdu translation; replace Bengali-only CSS assumptions with script-aware typography.
- Add automated placeholder/plural, locale-tag, glyph-coverage, and direction checks.

**Exit gate:** `en` ↔ `bn` behavior is unchanged; a test locale works end-to-end; missing required keys, invalid placeholders, incorrect direction, or missing font coverage fail CI.

#### L2 — Certify and migrate English + Bengali

Move existing UI, module metadata, objectives, and deep-dive data into the locale/catalog model without changing approved wording. Audit uncatalogued UI and accessibility strings, recheck Bengali science terms, numerals, fonts, mobile layout, and offline behavior.

**Exit gate:** English and Bengali pass catalog, content, visual, accessibility, offline, and current repository verification gates.

#### L3 — Translate and release in reviewed waves

Start bulk locale waves after Learning-bay UI phases U0–U2 have approved the shared shell and the layout has been stress-tested with long-string and RTL fixtures. For each locale, first complete a vertical slice from home through a learning bay, simulation, quiz, and saved progress. Then localize all bays and references in the declared release scope. Keep beta/incomplete status visible where any English fallback remains.

| Wave | New locales | Purpose |
|---|---|---|
| A | Hindi, Marathi, Gujarati, Punjabi (Gurmukhi), Tamil, Telugu, Urdu | High-reach start; covers Devanagari, Gujarati, Gurmukhi, Tamil, Telugu, and RTL early |
| B | Assamese, Kannada, Malayalam, Odia, Nepali | Expands Eastern Nagari and additional major Indic script families |
| C | Bodo, Dogri, Kashmiri, Konkani, Maithili, Manipuri (Meitei), Sanskrit, Santali, Sindhi | Completes the scheduled-language set and validates specialist/alternate-script review |

Bengali is migrated/certified in L2. The three waves add 21 languages; with Bengali and English, Release 1 reaches 23 language choices. Add alternate-script variants only after their catalog, direction, font, and QA are independently reviewed. Reorder waves only for learner demand or reviewer readiness, without skipping release gates.

**Per-locale release gate:** shell/navigation/settings strings approved; all learner-visible content in the released scope reviewed; fallback labeled; glossary and scientific claims signed off; no critical font, RTL, accessibility, offline, performance, or layout defect.

#### L4 — Expand beyond the Schedule

Provide community intake for languages beyond the 22, such as Bhojpuri, Tulu, Gondi, Mizo, Khasi, or Kokborok. Add a locale when there is learner demand, a native reviewer, a validated writing/script choice, font and assistive-technology support, and a sustainable update path. Treat Indian Sign Language as its own visual-language project.

### Verification and release gates

- **Catalog CI:** required keys are present; intentional fallbacks are listed; placeholders, plurals, and rich-text tokens match; no empty values or key-as-label regressions.
- **Language/script CI:** locale tags are valid; `html.lang`/`dir` are correct; fonts cover each script; no tofu glyphs; bidi behavior is tested; scientific Latin tokens remain intact.
- **Content QA:** native educator proofread, biology accuracy review, approved glossary, correct curriculum references, age-appropriate and non-stigmatizing language.
- **UI QA:** text expansion, 200% zoom, keyboard/screen-reader labels, phone/tablet/desktop, light/dark, LTR/RTL, long labels, quizzes and data visualizations.
- **Offline QA:** for every released locale, select/cache/download it, go offline, reload, and open a lesson plus quiz with all text and fonts available. Test PWA, generated single-file artifact, and Android WebView.
- **Regression QA:** make existing smoke/visual checks data-driven over locales; retain English/Bengali-specific terminology checks where needed. Browser-smoke every locale and run the fuller route/device matrix at each wave release.
- **Performance QA:** budget selected-locale text/font bytes, startup impact, cache behavior, and offline artifact growth. Lazy-load fonts/catalogs; do not download every script at first paint.

### Immediate execution order

1. Approve the scope: **22 scheduled languages + English first**, followed by an open long-tail catalog.
2. Confirm default scripts and release-one variants, especially Kashmiri, Sindhi, Manipuri, Santali, and Konkani.
3. Assign reviewers and prepare the string inventory plus shared biology glossary.
4. Run Learning-bay UI phases U0–U2; implement locale foundation L1 in parallel where possible, then migrate/certify English and Bengali through L2.
5. Start Wave A after the shared shell passes its long-text/RTL checks, with Urdu included as the first RTL locale pilot; release each locale only after both UI and per-locale gates pass.
