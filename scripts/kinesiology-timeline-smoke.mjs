// Movement Theater Phase 1 — timeline, telemetry, manifest, palette contracts.
//
// These are the acceptance checks for Pillars 2, 3 and 4 that can be proven
// without a browser. They run in node against the SAME modules the app imports,
// so a regression in the clock, the hysteresis, the frame grid or the colour
// set fails `npm run verify` rather than surfacing as "the figure feels wrong".
//
// Everything here is deterministic: no timers, no rendering, no DOM.

import assert from 'node:assert/strict';
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
import { sampleSagittalAngles } from '../src/lib/kinesiology/jointAngles.js';
import { ACTIONS } from '../src/lib/kinesiology/actions.js';
import { CAMERA_PRESETS, PLANE_PRESETS, ANCHOR_JOINTS, CAMERA_LIMITS, cameraStateFor, CameraDirector } from '../src/lib/kinesiology/cameraDirector.js';
import { buildPerformanceRig, ROLE_COLORS, ACTIVATION_RAMP, MUSCLES } from '../src/lib/kinesiology/performanceRig.js';

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

// A 120-frame 30 fps clip is the walk; a 90-frame jump is the second grid. ---------------------------------
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
    clipMeta: action.clip === 'walk_cmu.bvh' ? { frames: 120, frameTime: 1 / 30 }
      : action.clip === 'jump_cmu.bvh' ? { frames: 90, frameTime: 1 / 30 } : null
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

// ---------------------------------------------------------------- summary
const total = passed + failed;
if (failed) {
  console.error(`\nHBL Movement Theater Phase 1 checks FAILED — ${passed}/${total} passed\n`);
  for (const f of failures) console.error(`  ✗ ${f}\n`);
  process.exit(1);
}
console.log(`HBL Movement Theater Phase 1 checks passed (${passed} checks: timeline, telemetry, ROM bands, clip manifest, ground-truth angles, phase flicker, camera, palette, rig).`);
