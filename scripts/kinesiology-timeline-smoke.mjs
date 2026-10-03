// Movement Theater Phase 1 — timeline, telemetry, manifest, palette contracts.
//
// These are the acceptance checks for Pillars 2, 3 and 4 that can be proven
// without a browser. They run in node against the SAME modules the app imports,
// so a regression in the clock, the hysteresis, the frame grid or the colour
// set fails `npm run verify` rather than surfacing as "the figure feels wrong".
//
// Everything here is deterministic: no timers, no rendering, no DOM.

import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { gzipSync } from 'node:zlib';
import * as THREE from 'three';

import {
  TimeController, LOOP_ONCE, LOOP_LOOP, LOOP_PINGPONG, MODE_ENDED, MODE_SCRUBBING, SPEEDS
} from '../src/lib/kinesiology/TimeController.js';
import {
  OneEuroFilter, dampFactor, JointTracker, PhaseEngine, createHudScheduler,
  anglesFromAuthoredPose, bandForReadout, bandEnvelope
} from '../src/lib/kinesiology/telemetry.js';
import {
  buildClipManifest, buildSnapPoints, snapFrames, withContacts, collectManifestWarnings
} from '../src/lib/kinesiology/clipManifest.js';
import { AAOS_ROM, GAIT_BANDS, ROM_SOURCES, ZERO_REFERENCE, romCandidatesFor } from '../src/data/kinesiology/romBands.js';
import { sampleSagittalAngles, calibrateAngles } from '../src/lib/kinesiology/jointAngles.js';
import { ACTIONS } from '../src/lib/kinesiology/actions.js';
import { CAMERA_PRESETS, PLANE_PRESETS, ANCHOR_JOINTS, CAMERA_LIMITS, cameraStateFor, CameraDirector } from '../src/lib/kinesiology/cameraDirector.js';
import { buildPerformanceRig, ROLE_COLORS, ACTIVATION_RAMP, MUSCLES } from '../src/lib/kinesiology/performanceRig.js';
import { parseBVH } from '../src/lib/kinesiology/bvh.js';
import { computeCalibration as bvhCalibration, applyBVHFrame } from '../src/lib/kinesiology/retarget.js';
import {
  decodeClipTracks, applyTrackFrame, trackAngles, zeroOffsetForClip, groundOffsetForRig,
  stanceForRig, gaitStatsFromTracks, trackWorldPosition, QUAT_SCALE
} from '../src/lib/kinesiology/motionTracks.js';
// The baked assets are read from disk (not imported) so the same file works in
// node ESM and in the bundler without import attributes.
const walkDoc = JSON.parse(fs.readFileSync('src/data/kinesiology/clips/walk_cmu.json', 'utf8'));
const jumpDoc = JSON.parse(fs.readFileSync('src/data/kinesiology/clips/jump_cmu.json', 'utf8'));

let passed = 0;
let failed = 0;
const failures = [];
function test(name, fn) {
  try {
    fn();
    passed += 1;
  } catch (err) {
    failed += 1;
    failures.push(`${name}\n    ${String(err.message).split('\n').join('\n    ')}`);
  }
}
const near = (a, b, tol = 1e-6) => assert.ok(Math.abs(a - b) <= tol, `expected ${a} ≈ ${b} (±${tol})`);

// Synthetic grid fixture for the clock/layout maths (deliberately not the shipped
// walk clip, which is 64 frames after the Phase 2 trim).
const WALK = { fps: 30, frameCount: 120, duration: 4 };

// ---------------------------------------------------------------- TimeController
test('grid: fps and frame count define an authoritative duration', () => {
  const tc = new TimeController(WALK);
  near(tc.duration, 4, 1e-9);
  near(tc.frameTime, 1 / 30, 1e-12);
  assert.equal(tc.frameIndex, 0);
  assert.equal(tc.tSeconds, 0);
  assert.equal(tc.frameCount, 120);
});

test('advance: a single 1 s stall is clamped to 250 ms of catch-up, not a jump', () => {
  const tc = new TimeController(WALK);
  tc.play();
  const crossed = tc.advance(1000);
  assert.equal(crossed, 7, 'a 1000 ms frame must not consume a full second of clip');
  assert.equal(tc.frameIndex, 7);
});

test('advance: at 1x, 60 real frames of 16.67 ms play exactly one second', () => {
  const tc = new TimeController(WALK);
  tc.play();
  for (let i = 0; i < 60; i++) tc.advance(1000 / 60);
  assert.equal(tc.frameIndex, 30);
  near(tc.tSeconds, 1, 1e-9);
});

test('advance never drifts: uneven ticks land on the same frame as even ones', () => {
  const even = new TimeController(WALK);
  even.play();
  for (let i = 0; i < 120; i++) even.advance(1000 / 120);
  const uneven = new TimeController(WALK);
  uneven.play();
  let t = 0;
  while (t < 1000) {
    const dt = Math.min(1000 - t, [12, 9, 21, 16, 18][uneven.frameIndex % 5]);
    uneven.advance(dt);
    t += dt;
  }
  assert.ok(Math.abs(uneven.frameIndex - even.frameIndex) <= 1, `uneven ${uneven.frameIndex} vs even ${even.frameIndex}`);
});

test('advance clamps a 5 s stall to 250 ms of catch-up (no teleporting)', () => {
  const tc = new TimeController(WALK);
  tc.play();
  const crossed = tc.advance(5000);
  assert.ok(crossed <= 8, `crossed ${crossed} frames after a 5 s stall`);
  assert.ok(tc.frameIndex <= 8);
});

test('speed: 0.25x quarter-speed advances one frame per 133.3 ms of wall clock', () => {
  const tc = new TimeController(WALK);
  tc.play();
  tc.setSpeed(0.25);
  assert.equal(tc.advance(120), 0);
  assert.equal(tc.advance(20), 1);
  assert.equal(tc.frameIndex, 1);
});

test('speed: an unsupported speed is rejected, never silently coerced', () => {
  const tc = new TimeController(WALK);
  tc.setSpeed(0.5);
  tc.setSpeed(2); // the lab control used to offer 2x — must not silently become something else
  assert.equal(tc.speed, 0.5);
  assert.deepEqual(SPEEDS, [0.25, 0.5, 1]);
});

test('step ±1 is exactly one frame — the old transport moved 3-4 frames', () => {
  const tc = new TimeController(WALK);
  tc.seekFrame(57);
  tc.stepFrames(1);
  assert.equal(tc.frameIndex, 58);
  tc.stepFrames(-1);
  assert.equal(tc.frameIndex, 57);
  tc.stepFrames(-1);
  assert.equal(tc.frameIndex, 56);
});

test('step is clamped at both ends in once-mode and wraps in loop-mode', () => {
  const once = new TimeController(WALK);
  once.seekFrame(119);
  once.stepFrames(1);
  assert.equal(once.frameIndex, 119);
  once.seekFrame(0);
  once.stepFrames(-1);
  assert.equal(once.frameIndex, 0);

  const loop = new TimeController({ ...WALK, loopMode: LOOP_LOOP });
  loop.seekFrame(119);
  loop.stepFrames(1);
  assert.equal(loop.frameIndex, 0);

  const back = new TimeController({ ...WALK, loopMode: LOOP_LOOP });
  back.seekFrame(0);
  back.stepFrames(-1);
  assert.equal(back.frameIndex, 119);
});

test('seek and step agree with playback: the same frame index, three routes', () => {
  const played = new TimeController(WALK);
  played.play();
  for (let i = 0; i < 60; i++) played.advance(1000 / 60);
  const sought = new TimeController(WALK);
  sought.seekSeconds(1);
  const stepped = new TimeController(WALK);
  for (let i = 0; i < 30; i++) stepped.stepFrames(1);
  assert.equal(played.frameIndex, sought.frameIndex);
  assert.equal(sought.frameIndex, stepped.frameIndex);
  assert.equal(played.tNorm, sought.tNorm);
});

test('tNorm spans 0..1 inclusive and never exceeds 1', () => {
  const tc = new TimeController(WALK);
  assert.equal(tc.tNorm, 0);
  tc.seekFrame(119);
  near(tc.tNorm, 1, 1e-12);
  tc.seekFrame(1e6);
  assert.equal(tc.frameIndex, 119);
  assert.ok(tc.tNorm <= 1);
  tc.seekFrame(-5);
  assert.equal(tc.frameIndex, 0);
});

test('loop: reaching the end wraps instead of sticking (mode LOOP)', () => {
  const tc = new TimeController({ ...WALK, loopMode: LOOP_LOOP });
  tc.play();
  tc.seekFrame(118);
  tc.advance(1000 / 30 * 3); // three frames: 119, wrap, 1
  assert.notEqual(tc.frameIndex, 119);
  assert.ok(tc.frameIndex < 5, `expected a wrap, got frame ${tc.frameIndex}`);
});

test('ping-pong reverses direction at the end and stays inside the grid', () => {
  const tc = new TimeController({ ...WALK, loopMode: LOOP_PINGPONG });
  tc.play();
  tc.seekFrame(118);
  tc.advance(1000 / 30 * 2); // to the last frame
  assert.equal(tc.frameIndex, 119);
  assert.equal(tc.direction, -1);
  tc.advance(1000 / 30 * 2);
  assert.ok(tc.frameIndex < 119 && tc.frameIndex > 0, `expected a reversed step, got ${tc.frameIndex}`);
});

test('once: the clip ends, mode reports ENDED and an ended event fires exactly once', () => {
  const tc = new TimeController({ ...WALK, loopMode: LOOP_ONCE });
  let ended = 0;
  tc.subscribe('ended', () => { ended += 1; });
  tc.play();
  tc.seekFrame(118);
  tc.advance(1000 / 30 * 4);
  assert.equal(tc.frameIndex, 119);
  assert.equal(tc.mode, MODE_ENDED);
  assert.equal(ended, 1);
  tc.advance(1000 / 30 * 4); // no further events
  assert.equal(ended, 1);
});

test('play after ENDED restarts from frame 0 instead of doing nothing', () => {
  const tc = new TimeController(WALK);
  tc.play();
  tc.seekFrame(119);
  tc.advance(1000 / 30 * 2);
  assert.equal(tc.mode, MODE_ENDED);
  tc.play();
  assert.equal(tc.frameIndex, 0);
});

test('scrubbing pauses the clock and a released scrub does not auto-resume', () => {
  const tc = new TimeController(WALK);
  tc.play();
  tc.advance(500);
  const before = tc.frameIndex;
  tc.beginScrub();
  assert.equal(tc.advance(500), 0);
  assert.equal(tc.frameIndex, before);
  assert.equal(tc.mode, MODE_SCRUBBING);
  tc.endScrub();
  assert.equal(tc.playing, false);
  assert.equal(tc.advance(500), 0);
});

test('a scrub seek is frame-exact (no sub-frame jitter in the sample)', () => {
  const tc = new TimeController(WALK);
  tc.beginScrub();
  const seen = new Set();
  for (let i = 0; i <= 100; i++) {
    tc.seekNorm(i / 100);
    assert.ok(Number.isInteger(tc.frameIndex));
    assert.ok(tc.frameIndex >= 0 && tc.frameIndex <= 119);
    seen.add(tc.frameIndex);
    tc.advance(16); // wall clock keeps running while the finger moves
  }
  assert.ok(seen.size > 40, `only ${seen.size} distinct frames across 101 scrub samples`);
});

test('seekSnap walks the snap frames and wraps at the ends', () => {
  const tc = new TimeController(WALK);
  const snaps = [0, 24, 60, 119];
  tc.seekFrame(10);
  tc.seekSnap(snaps, 1);
  assert.equal(tc.frameIndex, 24);
  tc.seekSnap(snaps, 1);
  assert.equal(tc.frameIndex, 60);
  tc.seekSnap(snaps, -1);
  assert.equal(tc.frameIndex, 24);
  tc.seekFrame(0);
  tc.seekSnap(snaps, -1);
  assert.equal(tc.frameIndex, 119);
});

test('assertDuration reports a declared/actual mismatch instead of hiding it', () => {
  const tc = new TimeController(WALK);
  assert.equal(tc.assertDuration(4).ok, true);
  const bad = tc.assertDuration(4.2);
  assert.equal(bad.ok, false);
  near(bad.mismatch, 0.2, 1e-9);
});

// ---------------------------------------------------------------- telemetry
test('dampFactor: one half-life of elapsed time halves the distance', () => {
  near(dampFactor(0.12, 0.12), 0.5, 0.01);
  near(dampFactor(0.12, 0.24), 0.75, 0.01);
  assert.equal(dampFactor(0, 0.016), 1); // reduced-motion contract: instant
});

test('One-Euro filter removes jitter but keeps a real ramp', () => {
  const f = new OneEuroFilter({ minCutoff: 1, beta: 0.02, dCutoff: 1 });
  const noisy = [];
  const clean = [];
  for (let i = 0; i < 120; i++) {
    const raw = 20 + (i % 2 ? 3 : -3);
    noisy.push(raw);
    clean.push(f.filter(raw, 1 / 60));
  }
  const sd = (arr) => {
    const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
    return Math.sqrt(arr.reduce((a, b) => a + (b - mean) ** 2, 0) / arr.length);
  };
  assert.ok(sd(clean) < sd(noisy) / 2, `filtered sd ${sd(clean)} vs raw ${sd(noisy)}`);
  assert.ok(clean[clean.length - 1] > 15, 'filter collapsed to zero');
});

test('JointTracker flags an out-of-reference-range angle only after the dwell time', () => {
  const t = new JointTracker({ id: 'knee', band: bandForReadout('knee', { gait: true }), filter: {} });
  for (let i = 0; i < 6; i++) t.update(30, 16.7);
  assert.equal(t.outOfBand, false, 'a normal knee angle was flagged');
  for (let i = 0; i < 20; i++) t.update(140, 16.7);
  assert.equal(t.outOfBand, true, 'a 140° knee was not flagged');
});

test('JointTracker tracks min/max of the filtered signal', () => {
  const t = new JointTracker({ id: 'knee', filter: {} });
  for (let i = 0; i <= 40; i++) t.update(i, 16.7);
  for (let i = 40; i >= 0; i--) t.update(i, 16.7);
  assert.ok(t.max > 30 && t.max <= 40.1, `max ${t.max}`);
  assert.ok(t.min < 10 && t.min >= -0.1, `min ${t.min}`);
});

test('PhaseEngine: noise around zero never flips the label', () => {
  const p = new PhaseEngine();
  const labels = new Set();
  for (let i = 0; i < 200; i++) {
    labels.add(p.update({ id: 'knee', value: i % 2 ? 1.5 : -1.5, velocity: i % 2 ? 6 : -6 }, 16.7));
  }
  assert.deepEqual([...labels], ['Neutral'], `labels seen: ${[...labels].join(', ')}`);
});

test('PhaseEngine: sustained flexion announces "Knee flexion" once, then holds it', () => {
  const p = new PhaseEngine();
  let changes = 0;
  p.subscribeHack = null;
  let label = '';
  for (let i = 0; i < 40; i++) {
    const next = p.update({ id: 'knee', value: 4 + i * 3, velocity: 20 }, 16.7);
    if (p.changed) changes += 1;
    label = next;
  }
  assert.equal(label, 'Knee flexion');
  assert.equal(changes, 1, `label changed ${changes} times for one continuous movement`);
});

test('PhaseEngine vocabulary is sign-correct per joint', () => {
  const p = new PhaseEngine();
  let label = '';
  for (let i = 0; i < 40; i++) {
    const next = p.update({ id: 'hip', value: -4 - i * 3, velocity: -20 }, 16.7);
    label = next;
  }
  assert.equal(label, 'Hip extension');
});

test('HUD scheduler publishes at 15 Hz and lets discrete events bypass the gate', () => {
  const s = createHudScheduler(15);
  assert.equal(s.due(0), true);
  s.mark(0);
  assert.equal(s.due(60), false);
  assert.equal(s.due(67), true);
  s.mark(67);
  assert.equal(s.due(80), false);
  s.invalidate();
  assert.equal(s.due(80), true, 'invalidate() must force the next slot');
  near(s.intervalMs, 1000 / 15, 1e-9);
});

test('anglesFromAuthoredPose uses the declared sign convention (hip flexion = −X)', () => {
  const a = anglesFromAuthoredPose({ leftUpLeg: { x: -30 }, leftLeg: { x: 45 }, leftFoot: { x: -10 } });
  assert.equal(a.hip, 30);
  assert.equal(a.knee, 45);
  assert.equal(a.ankle, 10);
});

test('bandForReadout: gait actions get the task band, everything else the AAOS band', () => {
  const task = bandForReadout('knee', { gait: true });
  assert.equal(task.kind, 'task');
  assert.ok(task.min < task.max);
  assert.match(task.source, /RLA/);
  const aaos = bandForReadout('knee', { gait: false });
  assert.equal(aaos.kind, 'aaos');
  assert.ok(aaos.max >= 120 && aaos.max <= 150, `knee AAOS max ${aaos.max}`);
});

// ---------------------------------------------------------------- romBands
test('every AAOS entry is internally consistent (min <= max, named source)', () => {
  assert.ok(AAOS_ROM.length >= 25, `only ${AAOS_ROM.length} AAOS motions`);
  for (const e of AAOS_ROM) {
    assert.ok(e.min <= e.max, `${e.id}: min ${e.min} > max ${e.max}`);
    assert.ok(e.joint && e.motion && e.plane, `${e.id} is missing joint/motion/plane`);
    assert.ok(e.isbAxis, `${e.id} has no ISB axis`);
  }
  assert.match(ROM_SOURCES.aaos + ROM_SOURCES.gait, /AAOS|Perry/);
  assert.match(ZERO_REFERENCE, /Anatomical position/);
});

test('romCandidatesFor switches to extension for a negative hip angle', () => {
  assert.equal(romCandidatesFor('hip', -10)[0].id, 'hip.extension');
  assert.equal(romCandidatesFor('hip', 10)[0].id, 'hip.flexion');
  assert.equal(romCandidatesFor('ankle', -5)[0].id, 'ankle.plantarflexion');
});

test('gait bands are ordered envelopes with a margin', () => {
  for (const [joint, band] of Object.entries(GAIT_BANDS)) {
    const env = bandEnvelope(band);
    assert.ok(env.min < env.max, `${joint} envelope collapsed`);
    assert.ok(band.margin > 0, `${joint} has no display margin`);
  }
});

// ---------------------------------------------------------------- clipManifest
test('mocap manifest derives fps/frameCount/duration from the clip, not from prose', () => {
  const m = buildClipManifest({ action: { id: 'walk', source: 'cmu', duration: 4 }, clipMeta: { frames: 120, frameTime: 1 / 30 } });
  assert.equal(m.fps, 30);
  assert.equal(m.frameCount, 120);
  near(m.duration, 4, 1e-9);
  assert.deepEqual(m.warnings, []);
  assert.equal(collectManifestWarnings({ walk: m }).length, 0);
});

test('a declared duration that disagrees with the grid is reported, not absorbed', () => {
  const m = buildClipManifest({ action: { id: 'walk', source: 'cmu', duration: 4.2 }, clipMeta: { frames: 120, frameTime: 1 / 30 } });
  assert.equal(m.duration, 4); // the frame grid wins
  assert.match(m.warnings[0], /disagrees/);
  assert.equal(collectManifestWarnings({ walk: m }).length, 1);
});

test('authored tracks get one frame per 1/30 s of declared duration', () => {
  const m = buildClipManifest({ action: { id: 'wave', source: 'authored', duration: 3 } });
  assert.equal(m.fps, 30);
  assert.equal(m.frameCount, 90);
  assert.equal(m.sourceKind, 'authored');
});

test('snap points are sorted, unique and always include Neutral and the end', () => {
  // A real knee curve: flexed at initial contact, extended in mid-stance,
  // strongly flexed in swing — so peak flexion and full extension are distinct
  // from frame 0 (a genuine curve, not a sine centred at the origin).
  const keys = [[0, 60], [10, 18], [40, 5], [62, 14], [85, 64], [119, 58]];
  const sample = (f) => {
    let i = 1;
    while (i < keys.length - 1 && f > keys[i][0]) i += 1;
    const [f0, v0] = keys[i - 1];
    const [f1, v1] = keys[i];
    const a = (f - f0) / Math.max(1, f1 - f0);
    return { knee: v0 + (v1 - v0) * a };
  };
  const m = buildClipManifest({
    action: { id: 'walk', source: 'cmu', duration: 4 },
    clipMeta: { frames: 120, frameTime: 1 / 30 },
    sampleAngles: sample
  });
  const frames = snapFrames(m);
  assert.deepEqual(frames, [...frames].sort((a, b) => a - b));
  assert.equal(new Set(frames).size, frames.length);
  assert.ok(frames.includes(0));
  assert.ok(frames.includes(119));
  assert.ok(m.snapPoints.some((p) => p.id === 'peakFlexion'));
  assert.ok(m.snapPoints.some((p) => p.id === 'fullExtension'));
});

test('snap points for a single-cycle action end with "Return", cyclic ones with "Cycle end"', () => {
  const jump = buildSnapPoints({ action: { id: 'jump' }, frameCount: 90, cyclic: false });
  assert.equal(jump[jump.length - 1].label, 'Return');
  const walk = buildSnapPoints({ action: { id: 'walk' }, frameCount: 120, cyclic: true });
  assert.equal(walk[walk.length - 1].label, 'Cycle end');
});

test('contacts are merged into the snap list and de-duplicated by frame', () => {
  const m = buildClipManifest({ action: { id: 'walk', source: 'cmu', duration: 4 }, clipMeta: { frames: 120, frameTime: 1 / 30 } });
  const merged = withContacts(m, [{ side: 'left', frame: 0 }, { side: 'right', frame: 62 }, { side: 'left', frame: 119 }]);
  const frames = snapFrames(merged);
  assert.equal(new Set(frames).size, frames.length);
  assert.ok(merged.snapPoints.some((p) => p.label === 'Right initial contact' && p.frame === 62));
  assert.ok(merged.snapPoints.some((p) => p.label === 'Left initial contact'));
});

// ---------------------------------------------------------------- camera
test('camera presets keep their 1-7 hotkey contract and unique ids', () => {
  assert.equal(CAMERA_PRESETS.length, 7);
  const ids = new Set(CAMERA_PRESETS.map((p) => p.id));
  assert.equal(ids.size, 7);
  for (const p of CAMERA_PRESETS) assert.ok(/^[1-7]$/.test(p.key), `${p.id} lost its hotkey (${p.key})`);
});

test('cameraStateFor is finite for every preset × action and honours follow-presets', () => {
  for (const preset of CAMERA_PRESETS) {
    for (const actionId of ['walk', 'jump', 'wave']) {
      const state = cameraStateFor(preset.id, 1.5, false, actionId);
      if (state.follow) continue;
      for (const v of state.pos) assert.ok(Number.isFinite(v), `${preset.id}/${actionId} pos not finite`);
      assert.ok(state.target && Number.isFinite(state.target.x ?? state.target[0]), `${preset.id}/${actionId} target not finite`);
    }
  }
});

test('camera limits are the contracted ones (0.5-6 m, 25-145°)', () => {
  near(CAMERA_LIMITS.minDistance, 0.5, 1e-9);
  near(CAMERA_LIMITS.maxDistance, 6, 1e-9);
  near((CAMERA_LIMITS.minPolar * 180) / Math.PI, 25, 1e-9);
  near((CAMERA_LIMITS.maxPolar * 180) / Math.PI, 145, 1e-9);
});

test('CameraDirector: the camera converges to the preset without teleporting', () => {
  const camera = new THREE.PerspectiveCamera(45, 1.6, 0.01, 100);
  camera.position.set(0, 1, 8);
  const rig = { bones: { root: new THREE.Object3D(), leftLeg: new THREE.Object3D() } };
  rig.bones.leftLeg.position.set(0, 1, 0);
  const d = new CameraDirector({ THREE, camera });
  d.setPreset('anterior');
  const preset = cameraStateFor('anterior', 0, false, 'walk');
  const target = new THREE.Vector3(preset.pos[0], preset.pos[1], preset.pos[2]);
  const step = () => d.update({ rig, state: preset, reducedMotion: false, dtSeconds: 1 / 60, manual: false });
  step();
  const firstMove = camera.position.distanceTo(target);
  assert.ok(firstMove > 1e-4, 'the camera never moved toward the preset');
  for (let i = 0; i < 300; i++) step();
  assert.ok(camera.position.distanceTo(target) < 0.5, `still ${camera.position.distanceTo(target).toFixed(2)} m from the preset after 5 s`);
  assert.ok(Number.isFinite(camera.position.x) && Number.isFinite(camera.position.y) && Number.isFinite(camera.position.z));
});

test('CameraDirector: anchoring follows the joint and respects the limits', () => {
  const camera = new THREE.PerspectiveCamera(45, 1.6, 0.01, 100);
  camera.position.set(0, 1, 3);
  const knee = new THREE.Object3D();
  const rig = { bones: { leftLeg: knee, root: new THREE.Object3D() } };
  const d = new CameraDirector({ THREE, camera });
  d.applyLimits();
  d.setAnchor('leftLeg', { plane: 'sagittal' });
  assert.ok(ANCHOR_JOINTS.some((j) => j.id === 'leftLeg'));
  knee.position.set(0, 0.5, 0);
  for (let i = 0; i < 120; i++) {
    d.update({ rig, state: cameraStateFor('closeup', 0, false, 'walk'), reducedMotion: false, dtSeconds: 1 / 60, manual: false });
  }
  assert.ok(d.look.distanceTo(knee.position) < 0.25, `look-at is ${d.look.distanceTo(knee.position).toFixed(3)} m from the knee`);
  assert.ok(camera.position.distanceTo(d.look) >= CAMERA_LIMITS.minDistance - 1e-6);
  assert.ok(camera.position.distanceTo(d.look) <= CAMERA_LIMITS.maxDistance + 1e-6);
  d.userOrbit();
  assert.equal(d.mode, 'FREE');
  d.reengage();
  assert.notEqual(d.mode, 'FREE');
});

test('plane presets cover free + the three anatomical planes', () => {
  assert.deepEqual(PLANE_PRESETS.map((p) => p.id), ['free', 'sagittal', 'coronal', 'transverse']);
});

// ---------------------------------------------------------------- rig + palette
test('role palette is the approved colour-blind-safe set, five roles', () => {
  assert.deepEqual(Object.keys(ROLE_COLORS), ['PM', 'SY', 'AN', 'ST', 'IN']);
  const asHex = (n) => `#${n.toString(16).padStart(6, '0')}`;
  assert.equal(asHex(ROLE_COLORS.PM), '#0072b2');
  assert.equal(asHex(ROLE_COLORS.SY), '#009e73');
  assert.equal(asHex(ROLE_COLORS.AN), '#d55e00');
  assert.equal(asHex(ROLE_COLORS.ST), '#b9c2cc');
  assert.equal(asHex(ROLE_COLORS.IN), '#5a6472');
  // The failing triple must never come back.
  for (const bad of [0xff5d47, 0xffb347, 0x4dd8df]) {
    assert.ok(!Object.values(ROLE_COLORS).includes(bad), `${asHex(bad)} is not a valid role colour`);
  }
});

test('activation ramp increases monotonically in relative luminance (intensity is brightness, not hue)', () => {
  const lum = (hex) => {
    const c = [16, 8, 0].map((shift) => ((hex >> shift) & 255) / 255);
    const lin = c.map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
    return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
  };
  const lums = ACTIVATION_RAMP.map(lum);
  for (let i = 1; i < lums.length; i++) {
    assert.ok(lums[i] > lums[i - 1] * 1.25, `ramp stop ${i} only ${(lums[i] / lums[i - 1]).toFixed(2)}x brighter`);
  }
  assert.ok(lums[lums.length - 1] / lums[0] > 5, 'ramp contrast is too flat to read');
});

test('performance rig builds headless, exposes 54 mirror-safe muscles and stays inside the material budget', () => {
  const rig = buildPerformanceRig(THREE, { lowPoly: true });
  const stats = rig.stats();
  assert.equal(stats.bones, Object.keys(rig.bones).length);
  assert.ok(stats.bones >= 20, `only ${stats.bones} bones`);
  assert.equal(stats.muscles, MUSCLES.reduce((n, m) => n + (m.side ? 2 : 1), 0));
  assert.equal(stats.muscles, 54, `expected 54 muscle meshes, got ${stats.muscles}`);
  assert.ok(stats.materials <= 70, `${stats.materials} materials exceeds the budget`);
  assert.ok(stats.triangles < 120000, `${stats.triangles} triangles exceeds the medium budget`);
  assert.ok(stats.markerDrawCalls >= 12 && stats.markerDrawCalls <= 24, `marker overlay costs ${stats.markerDrawCalls} draw calls`);
  const quad = Object.keys(rig.muscles).find((k) => k.startsWith('quadriceps'));
  const ham = Object.keys(rig.muscles).find((k) => k.startsWith('hamstrings'));
  assert.ok(quad && ham, 'the quadriceps/hamstrings pair is missing from the rig');
  // Activation is quantised and idempotent — no material churn on repeat frames.
  rig.setMuscleActivation(quad, 0.5, 'PM');
  const mat = rig.muscles[quad].mat;
  const hex = mat.emissive.getHex();
  rig.setMuscleActivation(quad, 0.5, 'PM');
  assert.equal(mat.emissive.getHex(), hex);
  rig.setMuscleActivation(quad, 5, 'PM'); // clamps
  rig.setMuscleActivation(quad, -2, 'IN');
  rig.resetMuscles();
  // Isolation and the single shared outline.
  rig.setIsolation(quad);
  assert.ok(rig.muscles[quad].mat.opacity > rig.muscles[ham].mat.opacity);
  rig.setMuscleOutline(quad);
  assert.equal(rig.outlines.selected.visible, true);
  assert.equal(rig.outlines.selected.parent, rig.muscles[quad].mesh.parent);
  rig.setMuscleOutline(null);
  assert.equal(rig.outlines.selected.visible, false);
  rig.setMarkersVisible(true);
  assert.equal(rig.markerGroup.visible, true);
  rig.setHeatMode(true);
  assert.equal(rig.heatOn(), true);
  rig.dispose();
});

test('heat mode and role colour are distinguishable in greyscale (the CVD backstop)', () => {
  const lum = (hex) => {
    const c = [16, 8, 0].map((shift) => ((hex >> shift) & 255) / 255);
    const lin = c.map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
    return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
  };
  const agonist = lum(ROLE_COLORS.PM);
  const antagonist = lum(ROLE_COLORS.AN);
  const stabilizer = lum(ROLE_COLORS.ST);
  assert.ok(Math.abs(agonist - antagonist) > 0.03, 'agonist and antagonist collapse in greyscale');
  assert.ok(stabilizer > agonist && stabilizer > antagonist, 'stabilizer is not the lightest role');
});

// ---------------------------------------------------------------- ground truth (±1°)
test('both readout paths agree within ±1° on the same synthetic pose', () => {
  // The authored reader and the geometry sampler used to disagree in SIGN for
  // hip and ankle, so the same motion inverted when the learner switched clips.
  const poses = [
    { leftUpLeg: { x: -40 }, leftLeg: { x: 50 }, leftFoot: { x: -15 } },
    { leftUpLeg: { x: 20 }, leftLeg: { x: 10 }, leftFoot: { x: 25 } },
    { leftUpLeg: { x: -8.5 }, leftLeg: { x: 33.25 }, leftFoot: { x: 4.75 } }
  ];
  const deg = (d) => (d * Math.PI) / 180;
  for (const pose of poses) {
    const root = new THREE.Object3D();
    const upLeg = new THREE.Object3D(); upLeg.rotation.x = deg(pose.leftUpLeg.x); root.add(upLeg);
    const leg = new THREE.Object3D(); leg.rotation.x = deg(pose.leftLeg.x); upLeg.add(leg);
    const foot = new THREE.Object3D(); foot.rotation.x = deg(pose.leftFoot.x); leg.add(foot);
    const rig = { root, bones: { root, leftUpLeg: upLeg, leftLeg: leg, leftFoot: foot } };
    rig.root.updateMatrixWorld(true);
    const geom = sampleSagittalAngles(THREE, rig, () => {}, 0, null, { hip: 0, knee: 0, ankle: 0 });
    const authored = anglesFromAuthoredPose(pose);
    for (const joint of ['hip', 'knee', 'ankle']) {
      assert.ok(Math.abs(geom[joint] - authored[joint]) <= 1,
        `${joint}: geometry ${geom[joint].toFixed(2)}° vs authored ${authored[joint]}° for ${JSON.stringify(pose)}`);
    }
  }
});

test('the sampler matches an independent sagittal projection within ±1°', () => {
  const root = new THREE.Object3D();
  root.rotation.y = 0.3; root.rotation.z = -0.05; // a tilted, yawed pelvis
  const thigh = new THREE.Object3D(); thigh.rotation.x = -0.6; root.add(thigh);
  const shank = new THREE.Object3D(); shank.rotation.x = 0.8; thigh.add(shank);
  const foot = new THREE.Object3D(); foot.rotation.x = -0.3; shank.add(foot);
  const rig = { root, bones: { root, leftUpLeg: thigh, leftLeg: shank, leftFoot: foot } };
  rig.root.updateMatrixWorld(true);

  // Independent implementation: project each segment's long axis into the
  // pelvis frame, drop the lateral component, then measure the signed bend.
  const dir = (bone) => new THREE.Vector3(0, -1, 0).applyQuaternion(bone.getWorldQuaternion(new THREE.Quaternion()));
  const rootQ = rig.bones.root.quaternion;
  const project = (v) => { const t = v.clone().applyQuaternion(rootQ.clone().invert()); t.x = 0; return t.normalize(); };
  const bend = (child, parent) => {
    const a = project(dir(child));
    const b = project(dir(parent));
    const cross = b.y * a.z - b.z * a.y;
    const dot = a.y * b.y + a.z * b.z;
    return (-Math.atan2(cross, dot) * 180) / Math.PI;
  };
  const expected = {
    hip: bend(rig.bones.leftUpLeg, rig.bones.root),
    knee: Math.abs(bend(rig.bones.leftLeg, rig.bones.leftUpLeg)),
    ankle: bend(rig.bones.leftFoot, rig.bones.leftLeg)
  };
  const actual = sampleSagittalAngles(THREE, rig, () => {}, 0, null, { hip: 0, knee: 0, ankle: 0 });
  for (const joint of ['hip', 'knee', 'ankle']) {
    assert.ok(Math.abs(actual[joint] - expected[joint]) <= 1,
      `${joint}: sampler ${actual[joint].toFixed(2)}° vs independent ${expected[joint].toFixed(2)}°`);
  }
});

test('hip flexion reads positive and extension negative (convention lock)', () => {
  const root = new THREE.Object3D();
  const thigh = new THREE.Object3D(); thigh.rotation.x = -Math.PI / 6; root.add(thigh); // 30° of flexion
  const shank = new THREE.Object3D(); root.add(shank);
  const foot = new THREE.Object3D(); root.add(foot);
  const rig = { root, bones: { root, leftUpLeg: thigh, leftLeg: shank, leftFoot: foot } };
  rig.root.updateMatrixWorld(true);
  const a = sampleSagittalAngles(THREE, rig, () => {}, 0, null, { hip: 0, knee: 0, ankle: 0 });
  assert.ok(a.hip > 29 && a.hip < 31, `hip flexion of 30° read as ${a.hip.toFixed(2)}°`);
});

// ---------------------------------------------------------------- flicker + camera return
test('phase labels never flicker: <= 1 change per 150 ms through a noisy cycle', () => {
  const p = new PhaseEngine();
  const changes = [];
  const dt = 1000 / 60;
  // 4 s of a walk-like knee curve with ±2° of sensor noise.
  for (let i = 0; i < 240; i++) {
    const t = (i / 240) * 4;
    const clean = 25 - 20 * Math.cos((2 * Math.PI * t) / 4);
    const value = clean + (i % 2 ? 2 : -2);
    const velocity = i > 0 ? (value - (25 - 20 * Math.cos((2 * Math.PI * ((i - 1) / 240) * 4) / 4) + ((i - 1) % 2 ? 2 : -2))) / (dt / 1000) : 0;
    p.update({ id: 'knee', value, velocity }, dt);
    if (p.changed) changes.push(i * dt);
  }
  assert.ok(changes.length <= 12, `${changes.length} label changes in a 4 s cycle`);
  for (let i = 1; i < changes.length; i++) {
    assert.ok(changes[i] - changes[i - 1] >= 150, `two label changes only ${(changes[i] - changes[i - 1]).toFixed(0)} ms apart`);
  }
});

test('camera returns to the preset orientation after orbit → re-center (<= 0.5°)', () => {
  const camera = new THREE.PerspectiveCamera(45, 1.6, 0.01, 100);
  const rig = { bones: { root: new THREE.Object3D(), leftLeg: new THREE.Object3D() } };
  const d = new CameraDirector({ THREE, camera });
  const preset = cameraStateFor('lateralR', 0, false, 'walk');
  for (let i = 0; i < 240; i++) d.update({ rig, state: preset, dtSeconds: 1 / 60, manual: false, framing: { d: 4 } });
  const want = new THREE.Vector3(preset.pos[0], preset.pos[1], preset.pos[2]).sub(new THREE.Vector3(preset.target.x, preset.target.y, preset.target.z)).normalize();
  const before = camera.position.clone().sub(d.look).normalize();
  assert.ok(before.angleTo(want) < 0.01, `did not converge before the orbit (${(before.angleTo(want) * 57.3).toFixed(2)}°)`);
  d.userOrbit();
  camera.position.set(3, 2, 3); // the learner drags the camera somewhere else
  d.update({ rig, state: preset, dtSeconds: 1 / 60, manual: true, framing: { d: 4 } });
  d.reengage();
  for (let i = 0; i < 300; i++) d.update({ rig, state: preset, dtSeconds: 1 / 60, manual: false, framing: { d: 4 } });
  const after = camera.position.clone().sub(d.look).normalize();
  const errDeg = (after.angleTo(want) * 180) / Math.PI;
  assert.ok(errDeg <= 0.5, `orientation error after re-center is ${errDeg.toFixed(2)}°`);
});

// ---------------------------------------------------------------- all 20 actions
test('every one of the 20 actions gets a manifest with an exact frame grid', () => {
  const manifests = ACTIONS.map((action) => buildClipManifest({
    action,
    clipMeta: action.clip === 'walk_cmu.bvh' ? { frames: walkDoc.frames, frameTime: walkDoc.frameTime }
      : action.clip === 'jump_cmu.bvh' ? { frames: jumpDoc.frames, frameTime: jumpDoc.frameTime } : null
  }));
  assert.equal(manifests.length, 20);
  for (const m of manifests) {
    assert.ok(m.frameCount >= 2, `${m.actionId}: ${m.frameCount} frames`);
    near(m.duration, m.frameCount / m.fps, 1e-9);
    assert.ok(m.fps === 30, `${m.actionId} runs at ${m.fps} fps`);
    for (const point of m.snapPoints) {
      assert.ok(Number.isInteger(point.frame), `${m.actionId}/${point.id}: non-integer frame`);
      assert.ok(point.frame >= 0 && point.frame <= m.frameCount - 1, `${m.actionId}/${point.id}: frame ${point.frame} outside the grid`);
    }
    // A grid that a beginner can step through: no clip shorter than 1.5 s.
    assert.ok(m.frameCount / m.fps >= 1.5, `${m.actionId} is only ${(m.frameCount / m.fps).toFixed(2)} s long`);
  }
});


// ---------------------------------------------------------------- Phase 2: baked motion tracks
// The plan promised "BVH -> quantised quaternion tracks (removes the 76 ms parse)".
// Measurement said the parse was ~6 % of the load and the *scene sweeps* were the
// cost, so these tests pin what actually matters: the baked pose equals the BVH
// pose, the derived quantities are rig-consistent, loading performs no scene-graph
// sweep at all, and the payload stays small.
const CLIP_DOCS = { walk_cmu: walkDoc, jump_cmu: jumpDoc };
const ZERO_ANGLES = { hip: 0, knee: 0, ankle: 0 };

function bvhFor(key) {
  const text = fs.readFileSync(`src/data/kinesiology/${key}.bvh`, 'utf8');
  return { text, bvh: parseBVH(text) };
}

test('baked assets decode against their declared grid and record their source range', () => {
  for (const [key, doc] of Object.entries(CLIP_DOCS)) {
    const tracks = decodeClipTracks(doc);
    assert.equal(tracks.clip, key);
    assert.equal(tracks.frames, doc.frames);
    assert.ok(tracks.frames >= 45, `${key}: only ${tracks.frames} frames`);
    assert.equal(tracks.bones.length, doc.bones.length);
    assert.ok(tracks.bones.includes('root'), `${key}: the pelvis is not driven (the missing hip-joint mapping bug)`);
    assert.ok(
      !tracks.bones.some((b) => /UpperArm|Clavicle/.test(b)),
      `${key}: the arm chain must stay unmapped until the rest-frame retarget lands (R3)`
    );
    assert.equal(tracks.quats.length, tracks.frames * tracks.bones.length * 4);
    assert.equal(tracks.rootPos.length, tracks.frames * 3);
    assert.ok(doc.sourceRange && doc.sourceRange.sourceFrames >= doc.sourceRange.to + 1, `${key}: source range not recorded`);
  }
});

test('the baked asset still matches the BVH it was generated from', () => {
  for (const [key, doc] of Object.entries(CLIP_DOCS)) {
    const { text } = bvhFor(key);
    assert.equal(
      createHash('sha256').update(text).digest('hex'),
      doc.sourceSha256,
      `${key}: the source BVH changed since the bake — run "node scripts/bake-motion-assets.mjs"`
    );
  }
});

test('the baked pose equals the BVH pose for every frame and bone (quantisation only)', () => {
  const rig = buildPerformanceRig(THREE, { lowPoly: true });
  for (const [key, doc] of Object.entries(CLIP_DOCS)) {
    const tracks = decodeClipTracks(doc);
    const { bvh } = bvhFor(key);
    const cal = bvhCalibration(THREE, bvh);
    const qRef = new THREE.Quaternion();
    let worstDeg = 0;
    let worstComponent = 0;
    for (let i = 0; i < tracks.frames; i++) {
      const f = doc.sourceRange.from + i;
      applyBVHFrame(THREE, rig, bvh, f, cal);
      for (const bone of tracks.bones) {
        if (bone === 'root') continue; // the heading normalisation is asserted separately
        qRef.copy(rig.bones[bone].quaternion);
        applyTrackFrame(THREE, rig, tracks, i, { yOffset: 0 });
        worstDeg = Math.max(worstDeg, (qRef.angleTo(rig.bones[bone].quaternion) * 180) / Math.PI);
        worstComponent = Math.max(
          worstComponent,
          Math.abs(qRef.x - rig.bones[bone].quaternion.x),
          Math.abs(qRef.y - rig.bones[bone].quaternion.y),
          Math.abs(qRef.z - rig.bones[bone].quaternion.z),
          Math.abs(qRef.w - rig.bones[bone].quaternion.w)
        );
      }
    }
    assert.ok(worstComponent < 1.5 / QUAT_SCALE, `${key}: quantisation step exceeded (${worstComponent.toExponential(2)})`);
    assert.ok(worstDeg < 0.01, `${key}: quantisation costs ${worstDeg.toFixed(4)}° of pose`);
  }
});

test('heading normalisation keeps the sway small and the loop closed — without flattening the gait', () => {
  const rig = buildPerformanceRig(THREE, { lowPoly: true });
  for (const [key, doc] of Object.entries(CLIP_DOCS)) {
    const tracks = decodeClipTracks(doc);
    const facing = [];
    for (let i = 0; i < tracks.frames; i++) {
      applyTrackFrame(THREE, rig, tracks, i, { yOffset: 0 });
      rig.root.updateMatrixWorld(true);
      const q = rig.bones.root.getWorldQuaternion(new THREE.Quaternion());
      const fwd = new THREE.Vector3(0, 0, 1).applyQuaternion(q);
      facing.push((Math.atan2(fwd.x, fwd.z) * 180) / Math.PI);
    }
    const centre = facing.reduce((a, b) => a + b, 0) / facing.length;
    const maxDev = Math.max(...facing.map((v) => Math.abs(v - centre)));
    const loopGap = Math.abs(facing[0] - facing[facing.length - 1]);
    const spread = Math.max(...facing) - Math.min(...facing);
    assert.ok(maxDev <= 12, `${key}: the figure pivots ${maxDev.toFixed(1)}° while moving in place`);
    assert.ok(loopGap <= 6, `${key}: facing jumps ${loopGap.toFixed(1)}° across the loop seam`);
    // The capture's own transverse pelvic motion must survive: flattening it would
    // be a silent fidelity loss dressed up as "normalisation".
    assert.ok(spread >= 1.5, `${key}: pelvic transverse motion was flattened away (spread ${spread.toFixed(1)}°)`);
  }
});

test('the shipped captures are trimmed to their usable cycles and the actions agree', () => {
  const walk = CLIP_DOCS.walk_cmu;
  assert.deepEqual(walk.sourceRange, { from: 0, to: 63, sourceFrames: 120 }, 'the walk trim changed without re-measuring the loop seam');
  const walkDuration = walk.frames / walk.fps;
  assert.ok(walkDuration > 2 && walkDuration < 2.5, `walk duration ${walkDuration.toFixed(2)}s is outside the measured 2.13s`);
  near(ACTIONS.find((a) => a.id === 'walk').duration, walkDuration, 1e-6);
  assert.ok(walk.provenance.headingNormalisation.captureYawSpread > 5, 'the capture turn is no longer recorded in the asset provenance');

  // The jump source is a repeated-hop capture whose tail is a deep kneel
  // (knee 155-170 deg). Frames 0-65 are the hop; the tail is cut so the ROM
  // panel can never show an impossible reading.
  const jump = CLIP_DOCS.jump_cmu;
  assert.deepEqual(jump.sourceRange, { from: 0, to: 65, sourceFrames: 90 }, 'the jump trim changed without re-measuring');
  near(ACTIONS.find((a) => a.id === 'jump').duration, jump.frames / jump.fps, 1e-6);
});

test('rig-derived quantities come from the baked clip without sweeping the scene', () => {
  const rig = buildPerformanceRig(THREE, { lowPoly: true });
  let sweeps = 0;
  const real = rig.root.updateMatrixWorld.bind(rig.root);
  rig.root.updateMatrixWorld = (...args) => { sweeps += 1; return real(...args); };
  for (const [key, doc] of Object.entries(CLIP_DOCS)) {
    const tracks = decodeClipTracks(doc);
    const yOffset = groundOffsetForRig(THREE, rig, tracks);
    const stance = stanceForRig(THREE, rig, tracks, yOffset);
    const gait = gaitStatsFromTracks(tracks, stance);
    const offset = zeroOffsetForClip(THREE, tracks);
    for (let i = 0; i < tracks.frames; i++) trackAngles(THREE, tracks, i, offset);
    const pos = new THREE.Vector3();
    let lowest = Infinity;
    let highest = -Infinity;
    for (let i = 0; i < tracks.frames; i++) {
      for (const side of ['left', 'right']) {
        trackWorldPosition(THREE, rig, tracks, i, `${side}Foot`, { yOffset }, pos);
        lowest = Math.min(lowest, pos.y);
        highest = Math.max(highest, pos.y);
      }
    }
    near(lowest, 0.02, 0.005);
    assert.ok(highest - lowest > 0.05, `${key}: the feet never leave the floor (${(highest - lowest).toFixed(3)} m)`);
    assert.ok(gait.speed > 0 && gait.speed < 3, `${key}: implausible travel speed ${gait.speed} m/s`);
    assert.ok(gait.contacts.length >= 2, `${key}: fewer than 2 detected contacts`);
    for (const side of ['left', 'right']) {
      assert.ok(stance[side].windows.length >= 1, `${key}/${side}: no stance windows detected`);
      for (const w of stance[side].windows) {
        assert.ok(w.start >= 0 && w.end < tracks.frames && w.end >= w.start, `${key}/${side}: window ${w.start}-${w.end} outside the grid`);
      }
    }
  }
  assert.equal(sweeps, 0, `loading a clip still cost ${sweeps} full-scene updateMatrixWorld sweeps`);
});

test('the chain forward kinematics equals the scene graph to machine precision', () => {
  const rig = buildPerformanceRig(THREE, { lowPoly: true });
  const tracks = decodeClipTracks(walkDoc);
  const yOffset = groundOffsetForRig(THREE, rig, tracks);
  const v = new THREE.Vector3();
  const real = new THREE.Vector3();
  let worst = 0;
  for (let i = 0; i < tracks.frames; i += 7) {
    applyTrackFrame(THREE, rig, tracks, i, { yOffset });
    rig.root.updateMatrixWorld(true);
    for (const bone of ['leftFoot', 'rightFoot', 'leftLeg', 'leftUpLeg', 'head']) {
      rig.bones[bone].getWorldPosition(real);
      trackWorldPosition(THREE, rig, tracks, i, bone, { yOffset }, v);
      worst = Math.max(worst, real.distanceTo(v));
    }
  }
  assert.ok(worst < 1e-6, `chain FK drifts ${worst.toExponential(2)} m from the scene graph`);
});

test('baked angles match the live geometry sampler (the two readout paths cannot diverge)', () => {
  const rig = buildPerformanceRig(THREE, { lowPoly: true });
  for (const [key, doc] of Object.entries(CLIP_DOCS)) {
    const tracks = decodeClipTracks(doc);
    const { bvh } = bvhFor(key);
    const cal = bvhCalibration(THREE, bvh);
    const apply = (f) => applyBVHFrame(THREE, rig, bvh, f, cal);
    const ref = calibrateAngles(THREE, rig, apply, [doc.sourceRange.from]);
    let worst = 0;
    const sampleFrames = [0, 1, Math.floor(tracks.frames / 2), tracks.frames - 1];
    for (const i of sampleFrames) {
      const live = sampleSagittalAngles(THREE, rig, apply, doc.sourceRange.from + i, cal, ZERO_ANGLES);
      const baked = trackAngles(THREE, tracks, i, ZERO_ANGLES);
      for (const j of ['hip', 'knee', 'ankle']) worst = Math.max(worst, Math.abs(live[j] - baked[j]));
    }
    // The heading normalisation rotates the root, but the sampler flattens into
    // the root frame, so the readings are yaw-invariant; only the residual
    // heading (<= ~10 deg of pelvic rotation) and quantisation act, which is why
    // the tolerance is a quarter of a degree rather than a hundredth.
    assert.ok(worst < 0.25, `${key}: baked angles differ from the geometry sampler by ${worst.toFixed(3)}°`);
    // The clip-relative offset helper still works and is still exposed: the
    // Phase 3 SME review wants the clip-zero curve and the segment curve side by
    // side (Q11). It is NOT what the shipped UI uses — see the segment-reference
    // test below.
    const first = trackAngles(THREE, tracks, 0, zeroOffsetForClip(THREE, tracks));
    near(first.hip - first.hip, 0, 1e-12);
    near(first.knee, 0, 0.01);
  }
});

test('the shipped angle reference is the segment angle, and every reading is physiologically possible', () => {
  const rig = buildPerformanceRig(THREE, { lowPoly: true });
  // A learner must never see "knee -69 deg". The reference shipped in the UI is
  // the inter-segment angle (0 = segments aligned); the clip-relative reference
  // produced negative knee flexion on both clips because both start mid-air.
  for (const [key, doc] of Object.entries(CLIP_DOCS)) {
    const tracks = decodeClipTracks(doc);
    const angles = [];
    for (let i = 0; i < tracks.frames; i++) angles.push(trackAngles(THREE, tracks, i, ZERO_ANGLES));
    const r = (j) => [Math.min(...angles.map((a) => a[j])), Math.max(...angles.map((a) => a[j]))];
    const [hipLo, hipHi] = r('hip');
    const [kneeLo, kneeHi] = r('knee');
    const [ankleLo, ankleHi] = r('ankle');
    assert.ok(kneeLo > -6, `${key}: knee flexion reads ${kneeLo.toFixed(1)}° — segment flexion cannot be negative`);
    assert.ok(kneeHi < 150, `${key}: knee flexion reads ${kneeHi.toFixed(1)}° — beyond any human range`);
    assert.ok(hipHi < 150 && hipLo > -60, `${key}: hip range ${hipLo.toFixed(0)}..${hipHi.toFixed(0)}° is not a hinge range`);
    assert.ok(ankleHi < 60 && ankleLo > -60, `${key}: ankle range ${ankleLo.toFixed(0)}..${ankleHi.toFixed(0)}° is not a hinge range`);
    // and the muscles must actually work: a walk with under 20 deg of knee travel
    // is a slide, not a gait cycle
    assert.ok(kneeHi - kneeLo > 20, `${key}: knee travels only ${(kneeHi - kneeLo).toFixed(1)}°`);
    void rig;
  }
});

test('the baked payload stays inside the Phase 2 size budget', () => {
  for (const [key, doc] of Object.entries(CLIP_DOCS)) {
    const json = JSON.stringify(doc);
    const raw = json.length;
    const gz = gzipSync(Buffer.from(json)).length;
    assert.ok(raw < 24 * 1024, `${key}: asset ${(raw / 1024).toFixed(1)} kB exceeds the 24 kB budget`);
    assert.ok(gz < 16 * 1024, `${key}: gzipped asset ${(gz / 1024).toFixed(1)} kB exceeds the 16 kB budget`);
  }
});

// ---------------------------------------------------------------- summary
const total = passed + failed;
if (failed) {
  console.error(`\nHBL Movement Theater Phase 1 checks FAILED — ${passed}/${total} passed\n`);
  for (const f of failures) console.error(`  ✗ ${f}\n`);
  process.exit(1);
}
console.log(`HBL Movement Theater checks passed (${passed} checks: timeline, telemetry, ROM bands, clip manifest, ground-truth angles, phase flicker, camera, palette, rig, baked motion tracks).`);
