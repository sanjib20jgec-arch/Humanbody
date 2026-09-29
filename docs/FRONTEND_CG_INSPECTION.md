# Frontend Engineering + Computer-Graphics Inspection — Human Biology Lab

**Reviewer role:** Principal frontend engineer + senior CG artist · **Date:** 2026-09-28
**Evidence:** source audit + rendered frames (`screenshots/shot-home.png`, `screenshots/shot-circulation-explore.png`, `screenshots/shot-circulation-sim.png`), build metrics, browser suite.
**Verdict:** The *architecture* is genuinely good — demand-driven render loop, adaptive pixel ratio, honest capability tiers, disciplined code-splitting, strong a11y habits. But there is **one missing stylesheet block shipped to users (GuidedTour renders with raw browser styles)**, **one text-collision bug visible on every atlas panel**, a **25 fps React re-render storm** in the circulation bay, and several CG polish gaps (LOD pop, uncapped section cuts, uncalibrated charts, sub-legible type).

---

## FRONTEND — defects

### F1 · GuidedTour ships with ZERO styling (visible defect)
`src/components/GuidedTour.jsx` was added in Phase 48 but `src/styles.css` contains **no `.guided-tour*` rules** (grep count 0). In `screenshots/shot-circulation-explore.png` the tour renders as unstyled white default `<button>` elements floating over the caption — a raw-controls flash in an otherwise carefully themed dark UI. Add the `.guided-tour` style block (container card, themed prev/next/auto-play buttons, dot indicators) matching the existing design tokens.

### F2 · Text collision on every 3D atlas panel
Screenshots (all three) show **"Find structure" / search panel label printing on top of the reference top-line text** ("…BODY PARTS3D 4.0 · ADULT MALE REFERENCE") at the top-right of the stage. `#atlas-search-panel` (`.anatomy-search`, absolutely positioned) overlaps `.map-topline`'s right-aligned coordinates line. Fix: reserve the top-line row (padding-top on stage or top offset on the search form) so the two never share pixels.

### F3 · Circulation bay re-renders the entire subtree at ~25 fps
`CardioSimulation` subscribes to the engine and `setSnapshot`s on every emit (40 ms). Each snapshot also propagates up via `onSnapshot → setCardioSnapshot`, so **CirculationLab, the InfoPanel, and the `ReferenceObject3D → BodyMap3DAtlas` wrapper re-render 25×/s while the model runs**, on phones too. `WiggersCanvas` additionally tears down/re-creates its `ResizeObserver` and resets `canvas.width` on *every* snapshot (effect deps `[engine, snapshot]`), forcing backing-store reallocation per frame.
Fixes: (a) keep the canvas size effect deps `[engine]` and redraw on emit via a ref; (b) memoize `ReferenceObject3D`/`BodyMap3DAtlas` (`React.memo`) so prop-stable subtrees skip reconciliation; (c) throttle `onSnapshot` to ~10 Hz for the overlay coupling.

### F4 · No React error boundary anywhere
A throw inside any lazy lab or the WebGL mount unmounts the whole app to a blank screen. Suspense fallbacks cover loading, not errors. Add a top-level `ErrorBoundary` (and one around `BodyMap3DAtlas`) with a graceful "open accessible 2D mode" fallback — the app already has the perfect degraded route.

### F5 · Inertial turntable decay is frame-rate dependent
`rotationInertia.velocity *= 0.92` and `rotation.y += velocity` are applied **per frame** — on a 30 fps phone the spin lasts ~2× longer in wall-clock time and travels ~2× farther than at 60 fps. Use `Math.pow(0.92, dt / 16.7)` and scale the delta by `dt / 16.7`.

### F6 · fly-to tween fights OrbitControls damping
The tween writes `controls.object.position/target` directly then calls `controls.update()`, which re-applies damping deltas; with damping enabled the two integrators compete (minor jitter on arrival). Disable damping during the tween or drive the camera outside controls until completion.

### F7 · Monolithic 234 KB stylesheet, no code-split styling
One `src/styles.css` for every bay; ~60 media queries; several near-duplicate breakpoints (both `@media (max-width: 767px)` and `@media(max-width:767px)` variants). Split per-bay CSS or at least dedupe; 234 KB parses on every page including the home shell.

### F8 · Duplicate data sources (drift risk)
`digestiveStages` in `data/modules.js` and `DIGESTIVE_STAGES` in `DigestiveStageMachine.js` describe the same pathway with different pH strings; `organRegions` is duplicated into `atlasTools.jsx`; keyboard-handler boilerplate is copy-pasted across six labs. Single-source these.

### F9 · Minor but real
- `App`'s simulations counter increments on every *visit* to the simulate tab, not per run; effect deps missing `active?.status`.
- `useMemo(() => systems || registry?.systems || [], [systems?.join('|'), registry?.id])` — key built from optional-chained join; fine, but eslint would flag it.
- Playwright `workers: 1` (my earlier SwiftShader mitigation) trades suite runtime for stability; consider per-file sharding in CI instead.
- `AITutor` textarea `autoFocus` + no focus restore on close.

---

## CG ARTIST — defects & polish

### G1 · LOD switch pops (silhouette proxies)
The convex-hull distant proxy swaps with the exact mesh at 4.5–5.2 units with **no cross-fade**; hulls also erase concavities (lungs, brain, hands read as blobs at distance — acceptable as silhouette, but the *hard pop* is visible while dollying). Add a short opacity crossfade (200–300 ms) or hysteresis + fade; keep the current "never a box" rule.

### G2 · Section cuts show hollow shells
`setClippingPlane` clips geometry with `FrontSide` materials → the cut plane is see-through (viewer sees the far inner wall). The "no implied parenchyma" doctrine is right, but the *read* is a broken shell, not an honest cut. Render a flat, clearly-labeled "section cap" in a neutral hatched material (visibly artificial, never tissue-like) or enable `DoubleSide` on clipped materials so inner surfaces read solid.

### G3 · Wiggers/ventilation charts are uncalibrated
Canvas charts have **no y-axis scale, no unit gridlines, and legend text printed on top of traces** (10 px labels collide with curves at the top-left in `screenshots/shot-circulation-sim.png`). For a teaching chart: left margin with mmHg/cmH₂O ticks, faint gridlines, legend outside the plot, and the RV trace honestly labeled (see medical report M3). The ECG lane has no amplitude/time calibration either.

### G4 · X-ray ghosting lacks depth cues
Fresnel-only alpha (0.06–0.61) makes all layers read at the same visual depth; combined with `depthWrite=false` everywhere, stacked ghosts flatten the composition. Add a slight depth-based attenuation (distance fade) or per-layer alpha steps so the *selected* system reads in front.

### G5 · Lighting presets are subtle but the rim is teal-on-flesh
The teal rim (`0x5dc9c8`, intensity 2.1) rims bone and muscle with a cyan fringe that reads as UI glow rather than light; drop saturation toward cool white or lower intensity ~30%. Environment intensity 0.42 + analytic rebalance is well judged; exposure 1.12–1.22 presets are tasteful. Keep.

### G6 · Sub-legible typography in the 3D HUD
Several HUD/meta strings render at **7–9 px** (`.three-hud-top { font-size: 7px }` at narrow widths, `.map-scale` 8 px). Below practical legibility and below WCAG-friendly sizes; raise the floor to ~10–11 px and rely on letter-spacing for the instrument look.

### G7 · Home hero composition at ≥1440 px
The right research-log column floats in a large empty band (`screenshots/shot-home.png`), and the atlas starts below the fold, so the *body* — the product's hero — is not visible on first paint at 1080p-class heights. Pull the atlas card into the first viewport (reduce hero vertical rhythm) or float a compact silhouette preview beside the hero.

### G8 · Skeleton-only default is correct, but first-load framing crops the head
Default 3/4 view frames upper torso with the skull near the top edge; add ~8% headroom in the initial camera fit so the full silhouette breathes.

---

## What's genuinely well done

- **Demand-driven render loop** (render-on-change + adaptive DPR with slow-frame streaks) is console-grade engineering; diagnostics panel exposes fps/draw calls.
- **Capability tiers + honest downgrades** (battery tier, software-rasterizer detection) and lazy SSAO/env with silent fallback.
- **Chunk discipline**: viewer 63.8 kB, manager 46 kB, tools 17.3 kB, postFX lazy — the 90 kB budget is respected with real splits.
- **Deterministic scrubbing everywhere** (setPhase, TimelineDirector) — rare and valuable.
- **Materials**: clearcoat/roughness budgets per tissue type; palette is medically plausible; tone mapping + OutputPass ordering is correct.
- **A11y habits**: focus trap in modals, aria-live captions, reduced-motion parity, keyboard map controls.

---

## Recommended order

1. F1 + F2 (visible shipped defects — one CSS block + one offset).
2. F3 (perf: memo + canvas-effect fix) — biggest UX win on phones.
3. G1 + G3 (LOD crossfade; chart calibration) — biggest CG credibility wins.
4. F4 error boundary; F5 inertia dt; G2 section caps.
5. F7/F8/G6/G7 polish backlog.
All UI-visual changes → queued as pending visual-review cases per Phase 63 governance.
