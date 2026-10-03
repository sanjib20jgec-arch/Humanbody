# Guided Path teaching-overlay visual review matrix

Status: **PENDING**
Reviewer: not assigned
Last updated: 2026-09-29
Build hash at report time: `109af92c168a`

This is a release-gating checklist, not an automated claim of expert approval. Update `scripts/visual-review-status.json` only after a human reviewer has inspected the rendered reference at the listed orientation, viewport, and motion mode. Each sign-off must add a reviewer record naming the reviewer, role, date, build hash, route, and disposition.

## Review rubric

- [ ] **identity** — Each marker resolves to the intended anatomical structure, not a neighboring group.
- [ ] **framing** — Camera framing and orientation presets show the structure without misleading cropping.
- [ ] **orientation** — Anterior/lateral/posterior views match the anatomy's true orientation.
- [ ] **occlusion** — Markers remain readable under layer transparency; hidden targets are not misleadingly implied.
- [ ] **contrast** — Route lines, markers, and labels are separable from source geometry on the dark background.
- [ ] **marker-tightness** — Bounds boxes hug the structure without visually exaggerating its size.
- [ ] **route-separation** — Conceptual routes stay visibly distinct from certified source anatomy.
- [ ] **motion** — Pulse and marker animation follow the teaching state and never imply source-mesh motion.
- [ ] **reduced-motion** — Reduced-motion mode provides an equivalent static or stepped explanation.
- [ ] **disclosure** — Educational and adult-male scope disclosures are visible near the overlay.
- [ ] **environment-lighting** — Environment lighting changes appearance only; color identity and contrast stay readable.
- [ ] **ssao-reading** — Ambient occlusion reads as depth, never as cavities, lesions, or internal anatomy.
- [ ] **outline-fidelity** — Selection outlines hug exact part geometry without implying borders the source lacks.
- [ ] **xray-honesty** — X-ray mode shows loaded layers only; the visualization-not-imaging disclosure is visible in mode.
- [ ] **clipping-honesty** — Section views never imply internal parenchyma; the no-implied-anatomy note is visible.
- [ ] **isolation-context** — Isolated views keep orientation readable and restore cleanly to the full layer state.
- [ ] **animation-state-sync** — Timeline scrubbing keeps chart, markers, captions, and 3D overlay on one deterministic state.
- [ ] **tour-framing** — Guided tour steps frame and caption the intended stage at phone and desktop widths.
- [ ] **measurement-labeling** — Measurement results carry the educational-scale, non-clinical label.

## Scope checklist

- [ ] source-bound structure markers
- [ ] route-line alignment
- [ ] valve-gradient marker behavior
- [ ] occlusion and depth ordering
- [ ] contrast and readability
- [ ] mobile framing
- [ ] reduced-motion behavior
- [ ] environment lighting presets (Phase 44)
- [ ] ambient occlusion depth shading (Phase 42)
- [ ] x-ray ghosting of loaded layers (Phase 47)
- [ ] section clipping without implied interior anatomy (Phase 49)
- [ ] isolation and solo system views (Phase 52)
- [ ] semantic structure index and part selection (Phase 53)
- [ ] bookmarks restoring full view state (Phase 56)
- [ ] pin-label quiz over loaded parts (Phase 61)
- [ ] educational-scale measurement labels (Phase 58)
- [ ] muscle contraction pulse overlay (Phase 60)
- [ ] ventilation pressure teaching trace (Phase 50)
- [ ] reflex conduction timing readout (Phase 55)
- [ ] guided tour framing and captions (Phase 48)
- [ ] timeline director scrub determinism (Phase 45)
- [ ] silhouette LOD distant proxies (Phase 59)

## Matrix

| Route | Orientation | Viewport | Motion | Status |
| --- | --- | --- | --- | --- |
| Circulation | anterior | desktop | normal | pending |
| Circulation | anterior | desktop | reduced | pending |
| Circulation | anterior | phone | normal | pending |
| Circulation | anterior | phone | reduced | pending |
| Circulation | lateral | desktop | normal | pending |
| Circulation | lateral | desktop | reduced | pending |
| Circulation | lateral | phone | normal | pending |
| Circulation | lateral | phone | reduced | pending |
| Circulation | posterior | desktop | normal | pending |
| Circulation | posterior | desktop | reduced | pending |
| Circulation | posterior | phone | normal | pending |
| Circulation | posterior | phone | reduced | pending |
| Digestion | anterior | desktop | normal | pending |
| Digestion | anterior | desktop | reduced | pending |
| Digestion | anterior | phone | normal | pending |
| Digestion | anterior | phone | reduced | pending |
| Digestion | lateral | desktop | normal | pending |
| Digestion | lateral | desktop | reduced | pending |
| Digestion | lateral | phone | normal | pending |
| Digestion | lateral | phone | reduced | pending |
| Digestion | posterior | desktop | normal | pending |
| Digestion | posterior | desktop | reduced | pending |
| Digestion | posterior | phone | normal | pending |
| Digestion | posterior | phone | reduced | pending |

Pending cases: **24/24**

## Approval rule

A route may be changed from `pending` to `approved` only when all orientations, both viewport classes, both motion modes, marker occlusion, route alignment, contrast, and educational disclosures have been reviewed against the rubric above, and a reviewer record has been added. Automated checks can never set the approval field.
