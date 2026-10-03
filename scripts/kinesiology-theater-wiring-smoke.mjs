// Movement Theater Phase 1 — static wiring contracts.
//
// The browser specs prove behaviour, but they cannot run everywhere. This check
// reads the sources and fails when a Phase 1 decision is silently undone:
//
//   * a second time owner reappears (two places advancing the clock)
//   * the camera stops going through CameraDirector (the audit A13 defect)
//   * the scrubber loses its controlled/aria wiring (audit A2)
//   * the per-frame loops start allocating again (audit A5)
//   * muscle materials are mutated every frame for isolation (audit A14)
//   * the lab transport drifts back to a speed range the theater rejects
//   * the failing red/amber/cyan role triple returns (audit A7)
//
// It is deliberately simple, dependency-free and fast.

import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (rel) => readFileSync(path.join(root, rel), 'utf8');

const failures = [];
const notes = [];
const must = (cond, message) => { if (!cond) failures.push(message); };

const theater = read('src/components/KinesiologyTheater.jsx');
const lab = read('src/simulations/KinesiologyLab.jsx');
const rig = read('src/lib/kinesiology/performanceRig.js');
const timeline = read('src/lib/kinesiology/TimeController.js');
const styles = read('src/styles.css');

// ---- one owner for time -----------------------------------------------------
must(/import \{[^}]*TimeController/.test(theater), 'Theater no longer imports TimeController');
must(/timeRef\.current\?\.stepFrames\(-1\)/.test(theater) && /timeRef\.current\?\.stepFrames\(1\)/.test(theater), 'The ±1f controls no longer step exactly one frame');
must(!/st\.time \+= /.test(theater), 'A second writer advances stateRef.time again (the clock must own time)');
must(!/applyCamera\(/.test(theater), 'applyCamera() is still called — the camera must go through CameraDirector (audit A13)');
must(/directorRef\.current\.update\(\{/.test(theater), 'The camera director is not being driven');
must(/\.advance\(dtMs\)/.test(theater), 'The rAF tick no longer advances the clock by wall time');

// ---- scrubber ---------------------------------------------------------------
must(/ref=\{scrubRef\}/.test(theater), 'The scrubber lost its ref (the thumb must follow the clock)');
must(/aria-valuenow/.test(theater), 'The scrubber lost its aria-valuenow binding');
must(/onPointerDown=\{beginScrub\}/.test(theater) && /onPointerUp=\{endScrub\}/.test(theater), 'Scrub start/end handlers are missing (drag must pause and resume)');
must(!/className="kine-scrub"[^>]*defaultValue=\{0\}[^>]*\/>/.test(theater), 'The scrubber is uncontrolled again');

// ---- per-frame allocation ---------------------------------------------------
const tickStart = theater.indexOf('const tick = (now) => {');
const tickBody = tickStart >= 0 ? theater.slice(tickStart, theater.indexOf('raf = requestAnimationFrame(tick);', tickStart + 40)) : '';
must(tickBody.length > 0, 'Could not locate the rAF tick body');
must(!/new THREE\.Vector3\(\)/.test(tickBody), 'The tick allocates a Vector3 per frame again (audit A5)');
must(!/quaternion\.clone\(\)/.test(tickBody), 'The tick clones quaternions per frame again (audit A5)');
must(!/setFromPoints\(/.test(tickBody), 'Trails rebuild their geometry per frame again (audit A5)');
must(!/resetMuscles\(\)/.test(tickBody), 'The tick resets every muscle material per frame (audit A14)');
must((theater.match(/resetMuscles/g) || []).length === 1, 'resetMuscles() must be called exactly once, on action switch');
must(/rigRef\.current\?\.setIsolation/.test(theater), 'Isolation is no longer applied once per selection change');
must(/setMarkersVisible\?\.\(markersOn\)/.test(theater) && /setHeatMode\?\.\(heatMode\)/.test(theater), 'Toggles are being applied from the render loop again');

// ---- HUD publication rate ---------------------------------------------------
must(/createHudScheduler\(15\)/.test(theater), 'The HUD scheduler is no longer pinned to 15 Hz');
must(/hudSchedRef\.current\.due\(now\)/.test(theater), 'The HUD output is not gated by the scheduler');
must(/hudDirty && hudSchedRef\.current\.due\(now\)/.test(theater), 'The HUD publishes without an actual change (an idle scene must write 0 nodes per frame)');
must(/meterValueRef\.current\[muscle\]/.test(theater), 'The 54 legend meters are still rewritten every publication, even when the bar does not move');
must(/reportRef\.current = debugHook\.report/.test(theater), 'The M1 report builder no longer survives into the production build (a device run needs it)');
must(/className="kine-m1"/.test(theater), 'The M1 device harness UI is gone');
must(/hudSchedRef\.current\.invalidate\(\)/.test(theater), 'Discrete telemetry events no longer bypass the HUD gate');
must(/\.style\.transform = `scaleX\(/.test(theater), 'Legend meters no longer use a compositor-only transform');

// ---- transport handed in from the lab ---------------------------------------
must(/speeds=\{THEATER_SPEEDS\}/.test(lab), 'KinesiologyLab no longer passes the theater speed range to SimulationControls');
must(/from '\.\.\/lib\/kinesiology\/TimeController\.js'/.test(lab), 'KinesiologyLab does not import the sanctioned speed list');
must(/onReset=\{\(\) => apiRef\.current\?\.reset\(\)\}/.test(lab), 'The external reset is no longer wired to the theater API');
must(/onStep=\{\(\) => apiRef\.current\?\.step\(0\.2\)\}/.test(lab), 'The external step is no longer wired to the theater API');

// ---- timeline internals -----------------------------------------------------
must(/timeSeconds|tSeconds/.test(timeline), 'TimeController lost its derived time getters');
must(/assertDuration/.test(timeline), 'TimeController no longer exposes the declared-duration check (audit A19)');

// ---- the shipped angle reference -------------------------------------------
// Segment angles (0 deg = the two segments are aligned), not clip-frame-0.
// Measured 2026-10-04: the clip-relative reference showed a -69 deg knee on the
// jump clip and disagreed with the authored tracks, which have always reported
// segment angles. The zero-offset helper stays exported for the Phase 3 SME
// side-by-side (Q11); it must not creep back into the shipped readout.
must(/const ANGLE_REFERENCE = 'segment'/.test(theater), 'the shipped angle reference is no longer declared');
must(/const ANGLE_OFFSET = \{ hip: 0, knee: 0, ankle: 0 \}/.test(theater), 'the shipped angle offset is no longer a zero (segment) offset');
must(!/const offset = zeroOffsetForClip\(THREE, c\.tracks\)/.test(theater), 'the clip-frame-0 calibration reference is back in the shipped readout (Q11)');
must(!/Math\.floor\(tn \* clip\.bvh\.frames\)/.test(theater), 'Frame sampling is derived from duration again instead of the frame index');

// ---- palette ----------------------------------------------------------------
must(/ROLE_COLORS = \{[\s\S]*PM: 0x0072b2[\s\S]*SY: 0x009e73[\s\S]*AN: 0xd55e00[\s\S]*ST: 0xb9c2cc[\s\S]*IN: 0x5a6472/.test(rig), 'ROLE_COLORS is not the approved five-role colour-blind-safe set (audit A7)');
for (const hex of ['0xff5d47', '0xffb347', '0x4dd8df']) {
  must(!new RegExp(`ROLE_COLORS[\\s\\S]{0,400}${hex}`).test(rig), `The failing role colour ${hex} is back in ROLE_COLORS`);
}
must(/\.kine-role-key/.test(styles), 'The role key (text labels for each role) was removed from the stylesheet');
must(/\.kine-rom-row\[data-out-of-band='true'\]/.test(styles), 'Out-of-range rows lost their non-colour cue');

// ---- touch targets ----------------------------------------------------------
must(/\.kine-speed-group button, \.kine-loop-group button, \.kine-snap-group button \{ min-height: 44px; \}/.test(styles), 'New transport groups are below the 44 px touch target on coarse pointers');
must(/\.kine-term button \{[^}]*min-height: 44px/.test(styles), 'The 28 px terminology chips are still below the touch-target floor');
must(/\.kine-tick \{[^}]*width: 40px; height: 44px/.test(styles), 'The gait ticks lost their 40x44 px target');
must(/\.kine-scrub-wrap \{ position: relative; padding-bottom: 44px/.test(styles), 'The tick ruler no longer has its own 44 px strip (widening the marks in place would cover the scrub track)');

// ---- telemetry citations ----------------------------------------------------
must(/ZERO_REFERENCE/.test(theater) && /ROM_SOURCES/.test(theater), 'The telemetry panel no longer cites the zero reference and band sources');

if (failures.length) {
  console.error(`\nHBL Movement Theater Phase 1 wiring check FAILED (${failures.length} contract${failures.length === 1 ? '' : 's'})\n`);
  for (const f of failures) console.error(`  ✗ ${f}`);
  console.error('');
  process.exit(1);
}
notes.push('single clock owner', 'frame-exact transport', 'director-driven camera', '15 Hz HUD gate', 'allocation-free tick', 'CVD-safe role palette', '44 px transport targets');
console.log(`HBL Movement Theater Phase 1 wiring check passed (${notes.join(' · ')}).`);
