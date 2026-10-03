# Movement Theater — M1 measurement protocol (Phase 1 gate)

**Status: not yet measured.** Everything below is run on a physical device by a
human, because this sandbox has no GPU browser (Playwright's Chromium cannot be
installed here — see `verify:visual`, which prints `SKIPPED`). Until the tables
below are filled in, **no 60 FPS claim for this build is verified**; the budget
numbers in the Masterplan (`docs/MOVEMENT_THEATER_MASTERPLAN.md` §5) remain the
target, not a result.

The harness is built into the app in development builds only (`import.meta.env.DEV`),
so production users pay nothing for it.

---

## 1. What to run

```bash
npm run dev -- --host 0.0.0.0      # then open the printed URL on the device
```

Open the app → **Movement Theater** → wait for the figure to move → open the
device console (desktop: DevTools; Android: `chrome://inspect`; iOS Safari:
Web Inspector on a tethered Mac) and paste:

```js
// 1. thirty seconds of the walk, then read the numbers
__kineDebug.time().setLoopMode('loop'); __kineDebug.time().play();
await new Promise(r => setTimeout(r, 30000));
copy(JSON.stringify(__kineDebug.report(), null, 2));
```

`copy()` puts the JSON on the clipboard (use `console.log` + manual copy where
`copy()` is unavailable). Paste each run into the tables below.

### Reference device set (Masterplan §8)

| # | Device | Class | Tier expected |
|---|---|---|---|
| D1 | Desktop Chrome, discrete GPU | desktop reference | cinema |
| D2 | MacBook Air M-series (or equivalent) | laptop | cinema |
| D3 | Pixel 6a / Galaxy A54 | **mid-tier reference — the gate** | auto → fast |
| D4 | iPhone 12 / 13 | flagship phone | cinema/auto |
| D5 | Redmi 9A / entry Android | low tier | fast, 30 FPS mode allowed |
| D6 | iPad (9th gen) | tablet | auto |

`[ASSUMPTION]` The exact shopping list above is the Masterplan's QA matrix; the
"mid-tier reference" that gates Phase 1 is **D3**.

---

## 2. Acceptance criteria and how each is judged

| Criterion (Masterplan §6 Phase 1) | Where the number comes from | Automated today? |
|---|---|---|
| Scrub latency < 16 ms p95 | `report().scrubLatencyMs` after 20 drag samples (script below) | no — device run |
| `−1f / +1f` = exactly 1 frame, all clips | `verify:kine-timeline` + `tests/browser/kinesiology-phase1.spec.js` | **yes** |
| HUD DOM writes ≤ 20 per frame at 60 FPS, 0 while paused | `report().hud.domWritesPerSecond`, `report().frames.medianMs` | partly (write counting is in-app, the 60 FPS half needs a device) |
| Zero frames > 33 ms over a 60 s play run | `report().frames.over33ms` after a 60 s run | no — device run |
| Angle readout within ±1° of ground truth | `verify:kine-timeline` (both readout paths vs a synthetic pose) | **yes** |
| Phase label changes ≤ 1 per 150 ms in a walk cycle | `verify:kine-timeline` (240-frame noisy cycle) | **yes** |
| Camera returns to preset after orbit → re-center (≤ 0.5°) | `verify:kine-timeline` | **yes** |

### Scrub-latency script

```js
// Run while the clip is PAUSED, then play through once. Measures input→presented frame.
const scrub = document.querySelector('.kine-scrub');
const latency = [];
for (let i = 0; i < 20; i++) {
  const v = Math.round(Math.random() * 1000);
  scrub.value = v;
  scrub.dispatchEvent(new Event('input', { bubbles: true }));
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
  latency.push(__kineDebug.perf().scrubLatencyMs);
}
console.log('latency samples', latency, 'p95', latency.sort((a,b)=>a-b)[18]);
```

### What to do for each run

1. Set the quality tier under test (Auto / Cinema / Fast) — the theaters own
   quality buttons, and `localStorage.kine-quality` records it.
2. Walk: 60 s continuous play at 1× with the Stage visible.
3. Then, for each of: `jump`, `squat`, `reach-up`, `chew` — 10 s each, switching
   action between runs (this exercises the quality governor's load path).
4. Scale the page/rotate the device (portrait → landscape) once, to catch a
   resize that rebuilds the stage.
5. In devtools Performance, record 10 s during the walk and screenshot the frame
   chart (the `report()` numbers and the chart should agree).

---

## 3. Results

### Baseline captured in Phase 1 (CPU, no GPU — for reference only)

Measured in the sandbox with the pre-Phase-1 code: stage construction
**104.2 ms** (build rig 21.5 ms, parse + calibrate + stance both clips 76.1 ms,
60-sample angle precompute 6.7 ms), steady-state pose + foot plant + angles
**0.057 ms/frame** (≈ 292 frames per 16.6 ms budget). Rig inventory:
54 muscle meshes, 20 bones, 80 geometries, ~6.2 k triangles at the fast tier,
+1 shared outline object, +21 marker meshes (hidden by default).
**These are CPU numbers; they say nothing about GPU frame time.**

### D3 — mid-tier reference (the gate)

| Run | median ms | p95 ms | worst ms | frames > 33 ms | draw calls | triangles | tier |
|---|---|---|---|---|---|---|---|
| walk 60 s, auto | | | | | | | |
| walk 60 s, fast | | | | | | | |
| jump 10 s | | | | | | | |
| squat 10 s | | | | | | | |
| reach-up 10 s | | | | | | | |
| chew 10 s | | | | | | | |
| portrait ↔ landscape | | | | | | | |

Scrub latency (20 samples): p95 = ____ ms · max = ____ ms
HUD writes: ____ per second (nominal 15 Hz × ~20 fields = ~300/s) · paused: ____

### Other devices

| Device | Run | median ms | p95 ms | frames > 33 ms | draw calls | triangles | tier |
|---|---|---|---|---|---|---|---|
| D1 | walk 60 s | | | | | | |
| D2 | walk 60 s | | | | | | |
| D4 | walk 60 s | | | | | | |
| D5 | walk 60 s | | | | | | |
| D6 | walk 60 s | | | | | | |

---

## 4. What the numbers mean for Phase 2

* If `p95 ≤ 20 ms` and `over33ms === 0` on D3 at the **fast** tier, Phase 2 can
  spend the budget on the skinned figure (≤ 40 k tris L0) as planned.
* If D3 already misses at the fast tier, Phase 2 must start with the LOD chain
  and the material merge (55 → 4 materials) *before* the extra geometry, and the
  Masterplan's Medium budget table needs revising downward with the evidence.
* If `report().hud.domWritesPerSecond` is well above ~400, the 15 Hz gate is not
  filtering (check `hudSchedRef` invalidation paths); if `over33ms` spikes but
  `drawCalls` is low, the cost is CPU/DOM, not GPU.
* If `report().rig.materials` is still ≥ 50, the Phase 2 material merge is the
  single biggest draw-call win (each unique material is at least one call per
  mesh, and the rig has 80 meshes).

Record the raw JSON of at least the gate run in the Phase 1 pull request, so the
Phase 2 budget conversation starts from data rather than the sandbox estimate.
