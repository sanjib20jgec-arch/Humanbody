# Guided Path improvement plan

Updated: 2026-09-26

## Goal

Turn the current Guided path from a compact progress rail into a clear, adaptive learning itinerary while keeping learner agency. The path should answer four questions immediately:

1. Where am I?
2. What have I actually completed?
3. Why is the next bay recommended?
4. Can I continue, revisit, or skip without losing my place?

The path should recommend a sequence, not lock the learner into a rigid order. Every learning bay remains directly reachable from the atlas, module list, and path.

## Evidence basis

- [IES/WWC practice guide](https://ies.ed.gov/ncee/wwc/PracticeGuide/1): supports combining graphics with verbal explanations, connecting abstract and concrete representations, spacing learning, and using quizzing for retrieval.
- [National Academies formative assessment chapter](https://nap.nationalacademies.org/read/24783/chapter/9): assessment should reveal understanding, provide feedback, expose misconceptions, and guide subsequent instruction.
- [Mayer multimedia-learning summary](https://onlinelibrary.wiley.com/doi/abs/10.1111/jcal.12197): signaling, segmenting, coherence, contiguity, and pre-training support a restrained, staged interface.
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/): supports visible focus, keyboard operation, sufficiently sized pointer targets, and non-drag alternatives.
- [OpenStax Anatomy & Physiology 2e chapter review](https://openstax.org/books/anatomy-and-physiology-2e/pages/1-chapter-review): supports sequencing foundational terminology, systems, and structure-function relationships before increasingly specific system work.

## Current implementation audit

### Data and state

- `guidedPath` is a static nine-item array: Cell Structure → Tissues → Digestion → Circulation → Brain & Nerves → Respiration → Excretion → Reproduction → Heredity.
- `explored[moduleId]` is set as soon as a learner opens a bay.
- `completed[moduleId]` is set when a quiz completes, regardless of score threshold.
- `quiz[moduleId]` stores attempts, latest score, best score, and aggregate totals, but the Guided path does not use these values.
- `visitedViews[moduleId][view]` records Explore, Simulate, and Quiz visits, but the Guided path does not expose that progress.
- `lastModule` and `lastView` support resume behavior.
- Overall progress is weighted 45% explored and 55% completed, which is useful as a broad engagement signal but is not the same as guided-path mastery.

### Current UI

- The path appears on the home screen and again near the top of every module screen.
- All path buttons are always available; there is no lock state or prerequisite explanation.
- The current step is represented by `progress.lastModule`, while completed takes precedence visually only through a class combination.
- The path displays short module labels and a count such as `3/9`, but no description, time estimate, objective, rationale, or explicit next action.
- Desktop uses a four-column grid for nine steps; phone layouts preserve a dense grid rather than presenting one focused next step.
- The home screen's Continue action prioritizes the last incomplete module before the next incomplete guided-path item, which can make the recommended sequence feel inconsistent after exploratory navigation.

## Scope of improvements

### P0 — Semantics and correctness

#### 1. Define progress states explicitly

Use a data-driven state model with separate meanings:

- `not-started`: no visit;
- `explored`: Explore view visited;
- `in-progress`: at least one view visited but no checkpoint result;
- `checkpoint-attempted`: quiz submitted;
- `checkpoint-passed`: score meets the defined threshold;
- `completed`: path milestone satisfied;
- `current`: the learner's active module/view;
- `recommended`: the next suggested step.

Do not use one boolean to mean both “opened” and “mastered.” Keep all learning bays accessible even when a previous checkpoint is incomplete.

#### 2. Define a transparent checkpoint policy

Recommended MVP rule:

- Explore marks exposure, not completion.
- Simulate/Trace marks process practice, not completion.
- A quiz attempt marks formative assessment.
- A best score of at least 2/3 marks the guided checkpoint passed.
- A learner may continue after an unsuccessful attempt, but the path should say “Review suggested” rather than silently marking the step complete.

The threshold must be visible in the feedback, not hidden in code.

#### 3. Make the recommended path deterministic

Create a single data-driven `getNextGuidedStep(progress, path)` function used by:

- the home Continue CTA;
- the Guided path header;
- the module Next step CTA;
- resume behavior after reload.

Recommended priority:

1. resume the current incomplete module if it has a meaningful last view;
2. otherwise return the first non-passed step in sequence;
3. if all steps are passed, recommend review of the weakest recent quiz or the first step.

This prevents `lastModule` from overriding the pedagogical sequence indefinitely.

### P1 — Interaction and visual hierarchy

#### 4. Add a prominent “Up next” state

The path header should expose:

- `Step 05 of 09`;
- current module;
- one-sentence reason for the recommendation;
- estimated time;
- primary `Continue` button;
- secondary `Review previous` action.

Example:

> **Up next: Brain & Nerves**  
> Trace how a sensory signal becomes a protective response.  
> 8–10 min · Explore → Trace → Check

#### 5. Separate path navigation from progress reporting

The path should not require learners to infer state from border colors. Each item should expose a text/icon status:

- `Not started`;
- `Explored`;
- `Checkpoint passed`;
- `Review suggested`;
- `Current`.

Use color as reinforcement, never as the only signal.

#### 6. Surface view-level progress

Use the already-persisted `visitedViews` data to show compact milestones:

```text
Explore  ✓   Trace  •   Check  —
```

For modules without a simulation, use the module-specific equivalent rather than forcing every bay into identical language.

#### 7. Reduce repeated navigation surfaces

Home screen:

- show the full guided sequence and the prominent Up next card.

Module screen:

- show a compact current-step header with Previous / Path / Next;
- avoid repeating the full nine-step rail before the main learning activity unless the learner expands it.

This gives the learning activity more vertical space and reduces dashboard density.

### P1 — Responsive and accessible behavior

#### 8. Replace the dense phone grid

On phones, show:

- current step;
- previous and next controls;
- a horizontally scrollable sequence or expandable step list;
- the completion count and status text.

Do not force nine tiny labels into four narrow columns. Each target should remain at least WCAG-compatible touch size and retain a visible focus state.

#### 9. Add accessible semantics

Each step should include:

- `aria-current="step"` for the current step;
- `aria-label` containing title and state;
- a live announcement when the recommendation changes;
- visible focus styling;
- no hover-only information;
- keyboard-accessible Previous, Continue, Review, and Next controls.

The path should not trap focus or require drag/scroll gestures to discover the next step.

### P2 — Learning quality and motivation

#### 10. Add spacing and review opportunities

After several new bays, recommend a short review of an earlier concept rather than only advancing forward. For example:

- after Circulation, offer a Cell or Tissues review;
- after Brain & Nerves, offer a reflex checkpoint retry;
- after the full path, offer “Review weakest checkpoint.”

This uses the path as a learning sequence rather than a one-time checklist.

#### 11. Explain why the sequence exists

Add a small expandable rationale:

> Cells explain the living unit; tissues show how cells cooperate; systems then show how organs coordinate the whole body.

Keep this concise and pair it with the visual sequence so it does not become a paragraph-heavy curriculum page.

#### 12. Make progress motivating but honest

Avoid language such as “mastered” unless the evidence supports it. Prefer:

- “Explored”;
- “Practised”;
- “Checkpoint passed”;
- “Review recommended.”

The percentage progress indicator should clarify whether it measures exploration, checkpoints, or both.

## Proposed data model

Add optional metadata beside the existing module definitions:

```js
export const guidedPathMeta = {
  cell: {
    sequence: 1,
    stage: 'foundations',
    estimatedMinutes: 8,
    prerequisite: null,
    pathReason: 'Start with the living unit and selective exchange.'
  },
  tissues: {
    sequence: 2,
    stage: 'foundations',
    estimatedMinutes: 7,
    prerequisite: 'cell',
    pathReason: 'See how specialized cells cooperate.'
  }
};
```

Keep the route data-driven so a future module can declare its order, objective, duration, and prerequisite without hardcoding another conditional in `App.jsx`.

## Proposed implementation sequence

### P0-A — Progress semantics

- Add `getGuidedStepState(progress, moduleId)`.
- Add `getNextGuidedStep(progress)`.
- Define and document the checkpoint pass threshold.
- Keep backward compatibility with existing localStorage records.
- Add migration defaults for missing `visitedViews`, quiz fields, or legacy progress.

Acceptance criteria:

- Explore, practice, quiz attempt, and checkpoint pass are distinguishable.
- Existing learners do not lose progress.
- Every CTA uses the same next-step resolver.

### P0-B — Guided path component contract

Refactor `GuidedPath` into a data-driven component with:

- explicit state labels;
- `aria-current`;
- current/recommended distinction;
- view-level progress;
- accessible status announcements.

Acceptance criteria:

- no state is communicated by color alone;
- all nine steps remain keyboard and touch reachable;
- current and recommended states cannot contradict each other.

### P1-A — Up next and module navigation

- Add the Up next card to the home screen.
- Add compact Previous / Path / Next navigation to module screens.
- Replace the current home `lastModule` precedence with the shared resolver.
- Keep the full sequence available through an expand action.

Acceptance criteria:

- a learner can resume after reload;
- a learner can skip ahead deliberately;
- the product always explains the recommended next step.

### P1-B — Mobile layout and accessibility

- Replace the phone four-column grid with a step carousel or expandable list.
- Test portrait, landscape, tablet, keyboard, focus, reduced motion, and high contrast.
- Add touch-target and text-overflow checks.

Acceptance criteria:

- no clipped step titles;
- no hover-only status;
- no required horizontal drag to understand the current step;
- focus is visible and order is logical.

### P2-A — Learning reinforcement

- Add review recommendations based on quiz best/latest scores.
- Add a final path review state.
- Add concise path rationale and time estimates.
- Keep all telemetry local unless a separate privacy review approves collection.

## Priority matrix

| Work | Priority | Impact | Risk | Effort | Educational value |
|---|---:|---:|---:|---:|---:|
| Separate explored / attempted / passed states | P0 | Very high | Medium | 1–2 days | Very high |
| Shared next-step resolver | P0 | High | Medium | 1 day | High |
| Accessible status labels and current step | P0 | High | Low | 1 day | High |
| Up next card and module Previous/Next | P1 | High | Low | 1–2 days | High |
| Mobile path redesign | P1 | High | Medium | 2 days | Medium |
| View-level progress display | P1 | Medium | Low | 1 day | High |
| Review recommendations | P2 | Medium | Medium | 2–3 days | Very high |
| Teacher/analytics dashboard | P3 | Low for MVP | High | 1+ week | Medium |

## Measurement plan

Capture locally during browser and device testing:

- time from landing on the home screen to the first Continue action;
- percentage of learners who can identify the recommended next step;
- resume success after reload;
- path-step activation rate;
- quiz attempt and pass/retry distribution;
- accidental path exits or repeated backtracking;
- mobile horizontal overflow and focus failures;
- completion rate by step.

Do not interpret a click or bay visit as learning mastery. Pair path analytics with checkpoint evidence and qualitative review.

## Execution status

Implemented in the current pass:

- `src/lib/guidedPath.js` provides explicit state semantics, a 67% checkpoint threshold, a shared recommendation resolver, and guided neighbors.
- `guidedPathMeta` adds stages, estimated minutes, and path rationale for every guided bay.
- `GuidedPath` now exposes current, recommended, explored, review, and passed states, view-level milestones, `aria-current`, and text labels.
- The home screen now has an Up next card and uses the shared recommendation resolver for Continue.
- Module screens now expose compact guided-path navigation with Previous / Step / Next controls.
- Progress records checkpoint pass status while preserving existing localStorage compatibility.
- `tests/browser/guided-path.spec.mjs` covers recommendation, accessibility state, module navigation, and phone layout contracts.

Still pending:

- Chromium CI execution and visual review of the new path states;
- real-device confirmation of horizontal step-list behavior;
- score-based review recommendation tuning after observed learner behavior.

## Definition of done

- Guided path semantics are documented and backward-compatible.
- Current, recommended, explored, attempted, and passed states are distinct.
- Up next is visible and uses the same resolver as Continue and resume.
- The learner can skip, revisit, or retry without losing place.
- Phone layout is readable without tiny step labels or hover-only behavior.
- Keyboard focus, `aria-current`, live updates, and touch targets are tested.
- Quiz feedback can recommend review without falsely claiming mastery.
- `npm run verify` remains green.
- Browser visual review includes home path, module compact path, completed state, review state, and phone layout.
