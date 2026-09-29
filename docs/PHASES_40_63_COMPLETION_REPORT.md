# Phases 40–63 Completion Report — Human Biology Lab

**Date:** 2026-09-28 · **Scope:** visual, animation, and interaction upgrade tiers merged into one sequential execution plan (Phases 40–63, executed strictly in numerical order).

## Headline result

- All 24 phases executed and verified in order.
- `npm run verify` — every automated gate **green** (builds, offline bundle, anatomy QC, registries, overlays, physics engines, state machines, budgets, runtime/mobile/viewport/deployment contracts, browser suite).
- `npx playwright test` — **36/36 passed** (chromium-desktop + chromium-phone, SwiftShader WebGL).
- **Release status: BLOCKED** — by design. The only blocking gates are human review gates:
  1. Two route sign-off records (circulation, digestion) remain pending.
  2. Fifteen new rendering/animation/interaction modes from Phases 40–63 await human visual review (`pendingModeReviews` in `scripts/visual-review-status.json`).

  No automated check has been presented as expert sign-off. No visual approval has been fabricated.

## Phase-by-phase status

| # | Phase | Status | Evidence |
|---|-------|--------|----------|
| 40 | Rendering capability tiers + environment lighting | ✓ | `atlas-rendering-qc` (3 tiers, 10 modes); runtime contract |
| 41 | Wet-tissue material budgets (clearcoat/roughness) | ✓ | `anatomy-materials-qc` (15 system profiles) |
| 42 | SSAO post-processing (desktop, lazy, fail-safe) | ✓ | registry QC; browser suite |
| 43 | Selection outlines + hover glow | ✓ | registry QC; browser suite |
| 44 | Lighting presets (Studio/Daylight/Clinical) | ✓ | framing QC (3 lighting presets); UI in toolbar |
| 45 | TimelineDirector (deterministic scrub/seek/replay) | ✓ | `timeline-director-smoke` |
| 46 | ECG teaching trace + R/L Wiggers split + valve-event caption | ✓ | `cardio-physics-smoke` (200 phases) |
| 47 | X-ray ghosting of loaded layers | ✓ | manager `setXRay`; disclosure shown in-mode |
| 48 | Guided tours + camera fly-to | ✓ | `GuidedTour` component in Circulation + Digestion explore |
| 49 | Section clipping (transverse/sagittal/coronal) | ✓ | manager `setClippingPlane`; no-implied-anatomy disclosure |
| 50 | Ventilation pressure model + trace | ✓ | `ventilation-nerve-smoke`; RespirationLab readouts |
| 51 | Peristalsis multi-wave overlay + secretion captions | ✓ | manager `waves` pulses; DigestiveLab `waves: 3` |
| 52 | Isolation / solo-system views | ✓ | manager `isolatePart`/`soloSystems`; HUD actions |
| 53 | Semantic structure index (keyboard parity) | ✓ | manager `getStructureIndex`; lazy panel |
| 54 | Layer state persistence | ✓ | viewer localStorage layer state |
| 55 | Nerve conduction/reflex timing model | ✓ | `ventilation-nerve-smoke` (65 ms teaching total) |
| 56 | Bookmarks with full view-state restore | ✓ | lazy `BookmarksPanel` |
| 57 | Gas-exchange teaching readouts (PAO₂/PACO₂) | ✓ | RespirationLab header + disclosure |
| 58 | Educational-scale measurement | ✓ | manager `measureParts`; labeled non-clinical |
| 59 | Silhouette LOD + viewer code-split budget | ✓ | convex-hull proxies; atlas chunk 63.8 kB < 90 kB budget |
| 60 | Muscle contraction pulse (overlay only, mesh static) | ✓ | `stepContractionPulse` driven by viewer animate loop |
| 61 | Pin-label quiz over loaded parts | ✓ | lazy `AtlasLabelQuiz` |
| 62 | Inertial turntable + double-tap focus | ✓ | pointer inertia + fly-to in animate loop |
| 63 | Governance extension (rubric, gates, pending cases) | ✓ | 19-item rubric; release gates; 15 pending mode reviews |

## Performance budget outcome

| Chunk | Minified | Note |
|-------|----------|------|
| `BodyMap3DAtlas-*.js` (viewer) | **63.8 kB** | Budget ≤ 90 kB. Achieved by moving the scene manager, convex-hull LOD deps, structure-index/bookmarks/quiz/accessible-mode panels into on-demand chunks (`AnatomySceneManager-*.js` 46.0 kB, `atlasTools-*.js` 17.3 kB). |
| `three.module-*.js` | 580 kB | Shared vendor chunk, unchanged. |

`performance-baseline.mjs` passes with the new split.

## Test-stability fixes made this round

- React duplicate-key warning fixed in `DigestivePathSequence` (key on unique `match` field).
- SwiftShader/llvmpipe detection in the viewer: software rasterizers skip environment lighting and SSAO (capability-driven downgrade). This removed GPU-memory exhaustion that crashed the desktop browser mid-suite.
- Playwright workers serialized (`workers: 1`) with a documented rationale for software-renderer stability.

## Doctrine preserved (unchanged)

- Certified/static source anatomy stays separate from conceptual teaching models; the source mesh never fakes motion (contraction pulse and peristalsis are overlay markers only).
- "Explain, don't perform": x-ray shows loaded layers only; section views never imply parenchyma; measurements are labeled educational-scale, non-clinical.
- No new 3D sources introduced; candidate ledger untouched; five-gate process still required for any future runtime asset.
- Reduced-motion parity and keyboard operability retained (tours disable auto-play under reduced motion; structure index is keyboard-navigable).
- No clinical claims; adult-male reference scope and educational-model disclosures remain visible.

## What remains for humans (cannot be automated)

1. Visual sign-off for the circulation and digestion teaching routes (reviewer records with build hash).
2. Visual review of the 15 pending mode cases (x-ray, clipping, isolation/solo, SSAO, environment presets, silhouette LOD, contraction pulse, ventilation trace, reflex timing, guided tours, timeline scrub, structure index, bookmarks, quiz, measurement).
3. Learning-study validation — still unperformed; no results may be claimed until run.

Until those are complete with signed reviewer records, the release gate stays **BLOCKED** and `report:release --strict` fails by design.
