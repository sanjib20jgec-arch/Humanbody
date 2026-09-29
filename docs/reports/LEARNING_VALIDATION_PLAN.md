# Learning and usability validation plan (Phase 38)

Status: **PLANNED — NO STUDY RUN YET**. This document is pre-registered before any study so metrics cannot be chosen after the fact. Educational evaluation is not clinical validation.

## Purpose

Measure whether the Phase 26–35 improvements actually help learners navigate anatomy and understand physiology, instead of assuming that a polished 3D interface improves learning.

## Participants

- Novice learners (secondary/early undergraduate biology), n ≥ 12 per route comparison.
- Anatomy-informed reviewers (instructors or clinicians) for scientific placement checks, n ≥ 2.
- Record: device type, input modality (mouse/touch/keyboard), prior 3D experience, and accessibility needs.

## Task battery

| Task | Metric | Success criterion |
| --- | --- | --- |
| Find a named structure (e.g., mitral valve) | Time to select, selection error rate | ≤ 60 s median; ≤ 1 wrong selection |
| Orient the atlas to posterior view | Orientation error | Correct label reached without reset spam |
| Order the double-circulation route | Route-order accuracy | 4/4 stages correct |
| Explain a valve event from the timeline | Valve-state explanation accuracy | Correct event + gradient statement |
| Reach the same structure in accessible 2D mode | Task completion, keyboard-only | Completed without pointer |
| Recover from a forced tab switch (context loss) | Recovery without reload | Atlas rebuilds automatically |

## Conditions

- 3D-only route.
- Accessible 2D-only route.
- Hybrid route (default).
Randomize order across participants; within-subject comparisons where fatigue allows.

## Analysis rules

- Report medians and ranges, not only means.
- Report confusion events verbatim (which control, which label).
- A feature that fails its success criterion is flagged for redesign, not re-marketed.
- No claim of educational benefit is made from engagement metrics alone.

## Limitations to disclose

- The atlas is an adult-male BodyParts3D macro-anatomy reference.
- Physiology values are normalized educational models.
- Results describe this prototype and these tasks, not anatomy education in general.
