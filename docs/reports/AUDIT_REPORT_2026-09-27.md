# Human Biology Lab — Thorough Review and Audit

**Audit date:** 2026-09-27  
**Scope:** application architecture, runtime behavior, browser navigation, accessibility surfaces, scientific-model consistency, performance contracts, security/deployment contracts, attribution, and release evidence.

## Executive verdict

**Conditional release-candidate pass.** The application is materially stronger than the prior review and the blocking runtime defects found during this audit have been fixed. Static verification and the existing browser contract suite are green.

This is **not yet a final scientific/production sign-off** because expert visual anatomy review, real-device GPU/memory measurements, service-worker/offline end-to-end testing, and assistive-technology testing remain separate release activities.

## Evidence collected

- `npm run verify`: passed.
- `npm run verify:browser`: **28/28 passed** across desktop and phone Chromium profiles.
- Additional all-bay navigation audit: **9/9 bays passed** Explore → Simulate → Quiz navigation on desktop, with no page errors and no horizontal overflow.
- Additional phone accessibility/layout audit: home plus all nine bays and all three views passed with no visible unlabeled buttons, unlabeled range controls, missing image alternatives, or horizontal overflow.
- `npm audit --omit=dev --audit-level=high`: **0 vulnerabilities**.
- Anatomy QC: 2,234 source parts across 15 mapped systems.
- Brain QC: 139 nervous-system parts checked.
- Atlas binary QC: 15 compressed chunks and 2,234 parts validated.
- Performance contract: 31.4 MB compressed atlas, largest chunk below 3 MB, atlas module approximately 69.1 kB, Three.js vendor approximately 567 kB.

## Defects found and fixed

| Severity | Finding | Impact | Resolution |
|---|---|---|---|
| High | **Excretion simulation crashed with `ReferenceError: recovery is not defined`.** `ExcretionSimulation` rendered `recovery` without receiving it as a prop. | Entering the Excretion simulation could destroy the app view and trigger the startup error screen. | Passed `recovery` from `ExcretionLab` into `ExcretionSimulation`. Covered by the all-bay runtime audit. |
| High | **Focused 3D Reset view lost focused framing.** The reset handler restored whole-body camera coordinates even after a focused Guided Path object had been fitted to a heart, kidney, nervous, digestive, respiratory, urinary, or reproductive view. | Reset could make a focused object appear tiny or off-center. | Stored the focused camera/target/frustum state after fitting and restore that state for focused objects. |
| Medium | **Focused atlas callback identity caused unnecessary renderer teardown/reload.** Inline module callbacks were included in the Three.js effect dependency list. Selecting a structure could recreate the renderer and reload the focused atlas. | Extra geometry work, possible loss of rotation/selection state, and unnecessary GPU churn. | Moved anatomy-selection callbacks behind refs and removed the unstable callback from the renderer effect dependencies. |
| Medium | **Accessible 2D focused-object selection was not wired to module selection callbacks.** The accessible route could select a system visually but did not consistently update the focused module's text-equivalent selection state. | Keyboard/touch fallback was weaker than the 3D route. | Added system-level accessible selection metadata, focused initial-system selection, and `onAnatomySelect` forwarding. |
| Medium | **Mobile Ask AI Tutor control lost its accessible name.** Its text span is hidden on phone layouts and the button had no `aria-label`. | Icon-only mobile control was not reliably announced. | Added `aria-label="Ask AI Tutor"`. |
| Medium | **Several visible simulation sliders depended only on wrapping-label inference.** | Some browsers/assistive technologies may expose generic slider names. | Added explicit `aria-label` values to volume, diffusion, tissue, breathing, cardiac, digestive kinetics, renal, and related controls. |
| Low | **Quiz results always said “CHECKPOINT CLEARED,” even for a failing score.** | Progress semantics and feedback disagreed. | Added a 67% pass check with “REVIEW RECOMMENDED” and retry guidance below the threshold. |
| Medium | **Cardiac waveform/valve model had internal pressure-phase inconsistencies.** AV valves were not open during ordinary filling, and the aortic trace could exceed ventricular pressure while the aortic valve was expected to open. | The model could teach an incorrect pressure-gradient story. | Corrected ventricular baseline/filling pressure, contraction/ejection phase boundaries, and the aortic trace so valve states follow the displayed pressure relationships more consistently. |
| Medium | **AI proxy path had no request timeout or payload/output bound.** | A backend request could hang indefinitely; excessive user text could be sent. | Added a 15-second abort timeout, a 1,200-character question bound, and a 4,000-character response bound. The backend must still validate, authenticate/rate-limit if needed, and protect provider credentials. |
| Medium | **No React error boundary for runtime render failures.** The global boot handler could mislabel a post-startup runtime error as an application-startup failure. | A module defect could replace the whole UI with a misleading boot error. | Added an application error boundary and an app-mounted flag so the startup watchdog is only active during bootstrap. |

## Architecture review

### Strengths

- The atlas is genuinely demand-driven: skeletal startup is meaningful, and non-skeletal chunks are loaded after explicit layer/search/focused-object actions.
- `ReferenceObject3D` and `BodyMap3DAtlas` provide reusable 3D behavior instead of duplicating module-specific viewers.
- Atlas geometry, selection metadata, layers, source disclosures, and quality profiles are data-driven.
- Three.js resources, animation frames, pointer listeners, observers, and renderers are explicitly disposed.
- The app has an accessible 2D route and a WebGL failure route rather than treating WebGL as the only learning path.
- The three milestones—shell paint, first usable skeletal anatomy, and full requested atlas—are separately instrumented.
- Guided Path progress is local, transparent, and does not require an account.
- The AI boundary is mock-first and does not contain a frontend API key.

### Architecture risks

- The atlas is still a large resource: approximately **31.4 MB compressed**, with a separate Three.js vendor chunk around **567 kB**. The performance contract passes, but real low-memory devices need profiling.
- The current browser matrix is Chromium desktop/phone. It does not establish WebKit/Safari, Firefox, VoiceOver, TalkBack, NVDA, or switch-control behavior.
- Static deployment checks validate files and header policy text, not the response headers actually applied by a production host.
- The explicit offline downloader and service worker are not covered by a browser end-to-end cache/offline test in the current suite.
- The application stores progress, settings, and selected preferences in local storage. This is appropriate for the no-login MVP, but shared-device privacy/clear-data UX should be reviewed.

## Scientific and content audit

### Passing or well-disclosed areas

- BodyParts3D 4.0 is attributed under CC BY 4.0 with source, adaptation, adult-male limitation, orientation/unit conversion, and educational-use disclosures.
- OpenStax references are linked for terminology, heart, kidney, nervous-system, and digestive content.
- The Respiration route explicitly states that the certified atlas lacks lung-parenchyma mesh and keeps alveoli/gas exchange as a separate focused teaching model.
- Brain & Nerves explicitly states that the certified atlas lacks complete spinal-cord parenchyma and keeps the reflex arc separate.
- Process models are generally labeled as simplified and not diagnostic, including cardiac output, enzyme kinetics, diffusion, ventilation, nephron balance, reproduction, and heredity.
- The cardiac model now has a more internally coherent pressure/valve relationship, but it remains a teaching model rather than a clinical Wiggers trace.

### Remaining scientific review items

- BodyParts3D is an adult-male reference and must not be presented as universal human anatomy.
- Manifest presence and bounding-envelope checks do not prove visual orientation, scale, label placement, or clinical plausibility; expert screenshot review remains required.
- The simplified tissue, cell, heredity, reproductive, nephron, respiratory, and reflex diagrams should continue to carry their scale and limitation disclosures.
- Real physiology models should not be interpreted as patient-specific or predictive. The current copy mostly communicates this; future content additions must preserve it.

## Accessibility audit

### Confirmed

- Keyboard focus styling exists globally.
- Atlas has keyboard rotation, zoom, reset, system navigation, search, and accessible 2D mode.
- Mobile atlas controls are explicitly expandable rather than blocking the viewport.
- Reduced-motion state flows into all nine bays and the 3D atlas; automatic loops stop while manual controls remain.
- Quiz choices, feedback, progress, modal focus behavior, and selected anatomy metadata expose semantic states.
- The supplementary phone audit found no visible unlabeled buttons, range controls, missing image alternatives, or horizontal overflow across all bays/views.

### Still required for formal conformance

- Run axe or equivalent automated WCAG tooling in CI.
- Test with a screen reader and keyboard-only navigation on at least one desktop platform.
- Test VoiceOver/TalkBack rotor/order behavior for the 3D viewer and dynamic learning panels.
- Confirm contrast ratios for all muted mono text, colored system states, and focus rings against actual rendered backgrounds.
- Verify touch target dimensions on physical devices, not only CSS/viewport contracts.

## Security and deployment audit

### Passing

- No frontend API key is declared.
- `npm audit` reports zero production vulnerabilities.
- CSP, `Permissions-Policy`, `Referrer-Policy`, `nosniff`, cache rules, and service-worker versioning are declared.
- External links use `target="_blank"` with `rel="noreferrer"`.
- User-entered AI questions render as React text, not HTML.
- The AI proxy now has client-side timeout and size bounds.

### Production actions before release

1. Verify that the deployed host actually emits `public/_headers` policy values.
2. Confirm `/api/ai` performs authentication/rate limiting as appropriate, input validation, provider timeout, cost controls, and privacy-reviewed logging.
3. Test service-worker update, cache invalidation, explicit atlas download, cancellation, retry, removal, and offline reload on Android and iOS.
4. Confirm atlas and shell cache versions are bumped together whenever binary layout or shell behavior changes.
5. Review CSP compatibility with the final hosting/CDN arrangement, especially worker blobs, WebGL, and any future analytics endpoint.

## Release gate status

| Gate | Status |
|---|---|
| Production/static build | Pass |
| Offline bundle generation | Pass |
| Atlas/anatomy binary QC | Pass |
| Brain & Nerves manifest QC | Pass with documented spinal-cord limitation |
| Browser contracts | Pass: 28/28 |
| All nine bay navigation audit | Pass: 9/9 desktop |
| Phone control/name/overflow audit | Pass |
| Reduced motion contracts | Pass |
| Dependency audit | Pass: 0 production vulnerabilities |
| Expert visual anatomy sign-off | Pending |
| Real-device performance/GPU/memory profile | Pending |
| Screen-reader/assistive-technology audit | Pending |
| Offline service-worker end-to-end audit | Pending |

## Recommended next actions, in order

1. Review the generated Brain & Nerves and Guided Path screenshots at desktop, phone portrait, and phone landscape sizes.
2. Run a real-device matrix: low-memory Android, current iPhone/Safari, tablet, desktop GPU; record LCP, first usable anatomy, decode/build time, FPS, worst frame, draw calls, and GPU memory.
3. Add an axe-based CI check and a small permanent all-bay simulation smoke test so regressions such as the Excretion prop bug are caught by browser verification.
4. Add service-worker/offline browser tests with a controlled network and cache state.
5. Revisit atlas transfer/runtime optimization only after measurements; do not trade away the certified source geometry without documented educational and accuracy review.
