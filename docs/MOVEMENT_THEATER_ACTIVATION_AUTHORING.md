# Movement Theater — activation authoring guide (Phase 3)

Who this is for: whoever edits the muscle-activation data — an SME, a curriculum
author, or an engineer fixing a review comment. You do **not** need to touch
application code. If you can edit a table, you can change what the figure shows.

## Where the data lives

```
content/kinesiology/clips/<clipId>.json     <- the shipped source of truth (edit this)
content/kinesiology/source/curves.mjs       <- the original curated curves (regeneration input)
scripts/bake-activation-data.mjs            <- the baker / validator
src/lib/kinesiology/activation.js           <- the runtime that reads the JSON
```

The app has **no activation values in its own code** — a test fails the build if
one appears. Everything a student sees comes from the JSON above.

**Prefer editing the JSON.** It is validated on every `npm run verify`, and the
validator's messages name the muscle and the field. Editing
`content/kinesiology/source/curves.mjs` is only needed when you want to change the
curated *source* and re-derive the whole set; be aware that re-running the baker
**overwrites** the JSON, including your review edits. `npm run verify:kine-activation`
(`--check`) fails when the JSON and the source disagree, which is how that risk is
caught rather than discovered.

## The record

```jsonc
{
  "version": 1,
  "clipId": "squat",              // must match a runtime action id
  "label": "Squat",
  "source": {
    "kind": "authored",           // "mocap" | "authored"
    "clip": null,                 // mocap clips name their asset
    "citation": "…"               // MANDATORY — every number needs a basis
  },
  "fps": 30,
  "frameCount": 90,               // must equal round(durationS × fps)
  "durationS": 3,                 // must match the action's declared duration
  "muscles": [
    {
      "muscleId": "quadriceps.L", // must exist on the rig (54 ids, side suffix)
      "role": "PM",               // PM | SY | AN | ST | IN
      "contraction": "eccentric",  // concentric | eccentric | isometric | mixed
      "contractionKeys": [[0, "isometric"], [0.35, "eccentric"]],  // optional
      "activation": [[0, 0.05], [0.5, 0.9], [1, 0.05]],  // [tNorm, value], t rising
      "interpolation": "monotoneCubic",
      "peak": 0.9,
      "meanActivation": 0.42,
      "evidence": {
        "basis": "EMG",           // EMG | kinesiology-text | authored-teaching
        "citation": "…",
        "note": "…"               // shown to the student in the facts card
      }
    }
  ]
}
```

### Rules the validator enforces

| Rule | Why |
|---|---|
| `activation` values inside `[0, 1]` | Audit A11 found 1.3 in the shipped data once; the colour ramp cannot render above 1 |
| `t` strictly increasing, first = 0, last = 1 | else the curve silently drops a segment |
| ≥ 2 keyframes, ≤ 12 without a `quality` block | the key budget is a file-size/legibility budget |
| 13–64 keys allowed **only** with `"quality": { "keys": n, "maxError": ≤ 0.05 }` | you may exceed the budget, but you must record the measured cost |
| `muscleId` exists on the rig | a typo would silently render nothing |
| `role` / `contraction` in the enum | keeps the legend and the texture codes finite |
| `source.citation` and `evidence.citation` non-empty | the on-screen provenance line reads from here |
| `fps`/`frameCount`/`durationS` agree with the action | audit A19: the UI used to display a different duration than the clip played |

### Choosing keyframes

`monotoneCubic` interpolation is used because it never overshoots: a cubic spline
through a 0 → 0.9 → 0 set of keys can poke above 1.0 between keys, which is an
invalid activation. Monotone cubic cannot.

Practically:

- 2 keys = a constant.
- 4–6 keys is enough for a single on/off window with a fast attack.
- Model an on/off envelope as: off → rise → peak → fall → off, i.e. never encode a
  step as two keys at the same `t`.
- For an oscillation (e.g. the wave's alternating forearm flexors/extensors), use
  the extended budget and record `quality.maxError`; a 3 Hz oscillation cannot be
  held inside 0.05 with 12 keys.

### Roles

| Role | Meaning | Typical use |
|---|---|---|
| Agonist (PM) | primary producer of the observed joint torque | quadriceps in a squat ascent |
| Synergist (SY) | assists the movement, or cancels an unwanted secondary action | soleus during a jump take-off |
| Antagonist (AN) | opposes the movement; often active to control it | biceps during a fast elbow extension |
| Stabilizer (ST) | holds a remote segment still so the motion can happen | erector spinae during a bow |
| Inactive (IN) | below the 0.05 activation floor, or not involved | — |

Roles are per *movement*, not per muscle: the same muscle can be a prime mover in
one clip and a stabilizer in another.

### Contraction

Contraction is **measured, not asserted**: the baker derives it from the tracked
joint angle of the joint that muscle acts across — shortening (concentric),
lengthening (eccentric), or holding (isometric, |angular velocity| < 5 °/s). It is
`mixed` when a two-joint muscle's two joints disagree, or when the muscle's action
is outside the tracked sagittal plane. If you set `contractionKeys` by hand, keep
the same wording and note it as authored in `evidence.note`.

## Commands

```bash
npm run bake:activation-data            # regenerate the JSON from the curated source
npm run verify:kine-activation          # fail if the JSON is stale or invalid (runs in CI)
node scripts/bake-activation-data.mjs --emit-runtime    # regenerate the lean action registry
node scripts/bake-activation-data.mjs --sme-sheet       # regenerate the review sheet
npm run verify:kine-timeline            # all data-model + palette + budget checks
```

`--check` is the same as `bake:activation-data` but writes nothing and exits
non-zero when a file would change. It runs inside `npm run verify`, so a data edit
that forgets to re-bake cannot reach `main`.

## What the numbers do NOT claim

- `activation` is a **relative teaching scale (0–1)**, not EMG amplitude, not a
  percentage of MVC.
- Roles are **qualitative**. A muscle "being a stabilizer" is a description of its
  job in that movement, not a measured quantity.
- Timing windows are **approximations** of published gait/EMG timing, simplified
  for teaching. Every record names its own basis, and the UI says so (three levels:
  a permanent legend badge, a per-muscle provenance line, and a "How to read
  this" panel).
- The three-level disclaimer is contractual: if you remove the badge, the
  `verify:kine-wiring` check fails.
