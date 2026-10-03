// Phase 2 (Masterplan §6): bake the CMU BVH clips into quantised motion tracks.
//
//   node scripts/bake-motion-assets.mjs            # write the assets
//   node scripts/bake-motion-assets.mjs --check    # verify the committed assets
//
// The asset is derived from `src/data/kinesiology/<clip>.bvh` and MUST be
// regenerated whenever that file changes — `--check` is part of `npm run verify`
// and fails if the committed asset no longer matches the source (the same
// staleness gate the light theme uses).
//
// What is baked, and why (measurements in docs/MOVEMENT_THEATER_PHASE2_NOTES.md):
//
//   quats     per mapped rig bone, per frame, int16  — the retargeted pose.
//             Produced by running the shipped `applyBVHFrame`, so the baked pose
//             is exactly what the old loader produced; the runtime only copies.
//   rootPos   per frame, float32, in BVH centimetres — unscaled, so the scale and
//             heading calibration stay in the runtime and survive a rig swap.
//   scale/yaw from `computeCalibration` — both are properties of the BVH, not of
//             the rig.
//
//
// HEADING NORMALISATION (data decision, see docs/MOVEMENT_THEATER_MASTERPLAN.md §6
// Phase 2 status). The CMU walk capture turns ~100 degrees while travelling
// (hips yaw runs -34 to +70 deg). The theater renders locomotion in place —
// root x/z are zeroed — so a captured turn would make the figure pirouette on
// the spot. The bake therefore removes the slow heading component and keeps the
// periodic pelvic rotation that is the actual gait content:
//
//   yaw(f)      unwrapped root yaw
//   h(f)        centred boxcar of yaw, 15 frames (0.5 s)
//   faced(f)    yaw(f) - h(f), then centred so the mean facing is +Z
//   quat'(f)    Qy(faced(f) - yaw(f)) * quat(f)
//
// Measured trade-off on the shipped walk clip (probe in the phase-2 notes):
//
//   window   max facing deviation   loop gap   pelvic rotation retained
//     9 f          5.4 deg           0.27 deg        8.7 deg p-p
//    15 f          9.2 deg           0.93 deg       14.5 deg p-p   <-- chosen
//    21 f         13.1 deg           1.69 deg       19.8 deg p-p
//    30 f         19.3 deg           2.72 deg       28.1 deg p-p
//
// 15 frames keeps the loop seam under 1 degree and the sway under 10 degrees
// while preserving the pelvic rotation; pitch and roll are untouched, and the
// running clip (jump, yaw -7..+11) is normalised the same way for consistency.
//
// Deliberately NOT baked: the ground offset and the stance windows. Both depend
// on the rig's bone lengths, and Phase 2 replaces that rig; the runtime derives
// them with a targeted forward-kinematic walk (`motionTracks.js`) in well under a
// millisecond instead of the ~40 ms of scene sweeps the old loader spent.

import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { gzipSync } from 'node:zlib';
import * as THREE from 'three';
import { parseBVH } from '../src/lib/kinesiology/bvh.js';
import { rigNameFor, computeCalibration, applyBVHFrame, readRootPosition } from '../src/lib/kinesiology/retarget.js';
import { buildPerformanceRig } from '../src/lib/kinesiology/performanceRig.js';
import { MOTION_TRACK_VERSION, QUAT_SCALE, encodeInt16, encodeFloat32 } from '../src/lib/kinesiology/motionTracks.js';

const ROOT = path.resolve(import.meta.dirname, '..');
const SRC_DIR = path.join(ROOT, 'src/data/kinesiology');
const OUT_DIR = path.join(SRC_DIR, 'clips');

/**
 * Clips the theater ships. Keep in sync with `CLIP_DOCS` in the component.
 *
 * `range` trims frames from the source capture. The walk needs it: the source
 * (CMU walk) is a walk *and turn* — the hips yaw runs -34..+70 deg, the pelvis
 * leans 26 deg into the turn and the right foot ends up 62 cm off the floor. The
 * straight, loopable gait cycle is frames 0..63:
 *
 *   end   frames  duration   worst loop seam   foot lift (L/R)
 *    63      64     2.13 s        6.3 deg       7 / 12 cm   <-- used
 *    89      90     3.00 s       16.8 deg      13 / 46 cm
 *   119     120     4.00 s       11.3 deg      14 / 62 cm
 *
 * Trimming is a data decision with a measured basis, recorded here and in the
 * masterplan; the loop seam is disclosed in the UI note. `jump_cmu` is a
 * single in-place excursion and is used whole.
 */
export const CLIP_SPEC = [
  { key: 'walk_cmu', range: [0, 63] },
  // The jump source is a repeated-hop capture: frame 0 is the apex of a hop
  // (ankle 36 cm off the floor, knee 102 deg), it lands, hops again, stands from
  // frame 39, and from frame 66 sinks into a deep kneel that reaches 155-170 deg
  // of knee flexion. Frames 0-65 are the hop content; the kneel tail is cut so
  // the ROM panel cannot show an impossible reading.
  { key: 'jump_cmu', range: [0, 65] }
];
export const CLIP_KEYS = CLIP_SPEC.map((c) => c.key);

const check = process.argv.includes('--check');

export const HEADING_WINDOW_FRAMES = 15;

/** Unwrapped root yaw per frame, in degrees. */
function rootYawSeries(THREE, rig, bvh, cal) {
  const q = new THREE.Quaternion();
  const yaw = [];
  let prev = null;
  for (let f = 0; f < bvh.frames; f++) {
    applyBVHFrame(THREE, rig, bvh, f, cal);
    rig.bones.root.getWorldQuaternion(q);
    const fwd = new THREE.Vector3(0, 0, 1).applyQuaternion(q);
    let y = THREE.MathUtils.radToDeg(Math.atan2(fwd.x, fwd.z));
    if (prev !== null) {
      while (y - prev > 180) y -= 360;
      while (y - prev < -180) y += 360;
    }
    prev = y;
    yaw.push(y);
  }
  return yaw;
}

/** Centred boxcar, clamped at the edges (no padding artefacts at the loop seam). */
function smoothSeries(values, window) {
  const half = Math.floor(window / 2);
  const out = new Array(values.length);
  for (let i = 0; i < values.length; i++) {
    let sum = 0;
    let n = 0;
    for (let k = i - half; k <= i + half; k++) {
      const j = Math.max(0, Math.min(values.length - 1, k));
      sum += values[j];
      n += 1;
    }
    out[i] = sum / n;
  }
  return out;
}

/**
 * Per-frame world-Y correction (radians) that removes the captured heading while
 * keeping the periodic pelvic rotation. Returns null when the clip does not turn
 * enough for the correction to matter (keeps the asset honest about doing nothing).
 */
function headingCorrection(THREE, rig, bvh, cal, windowFrames = HEADING_WINDOW_FRAMES, range = null) {
  const all = rootYawSeries(THREE, rig, bvh, cal);
  const yaw = range ? all.slice(range[0], range[1] + 1) : all;
  const spread = Math.max(...yaw) - Math.min(...yaw);
  const smoothed = smoothSeries(yaw, windowFrames);
  const faced = yaw.map((y, i) => y - smoothed[i]);
  const mean = faced.reduce((a, b) => a + b, 0) / faced.length;
  const centred = faced.map((v) => v - mean);
  const maxDev = Math.max(...centred.map(Math.abs));
  const loopGap = Math.abs(centred[0] - centred[centred.length - 1]);
  const correction = centred.map((v, i) => THREE.MathUtils.degToRad(v - yaw[i]));
  return { correction, stats: { windowFrames, yawSpread: +spread.toFixed(2), maxFacingDeviation: +maxDev.toFixed(2), loopGap: +loopGap.toFixed(2) } };
}

function bakeClip(key, rig, range = null) {
  const bvhPath = path.join(SRC_DIR, `${key}.bvh`);
  const text = fs.readFileSync(bvhPath, 'utf8');
  const bvh = parseBVH(text);
  const [from, to] = range ? [range[0], Math.min(range[1], bvh.frames - 1)] : [0, bvh.frames - 1];
  const frames = to - from + 1;
  const cal = computeCalibration(THREE, bvh);

  // Which rig bones does this clip actually drive? Same mapping the runtime uses,
  // in BONE_TREE order so the asset is stable across regeneration.
  const mapped = new Set();
  for (const node of bvh.order) {
    const name = rigNameFor(node.name);
    if (name) mapped.add(name);
  }
  const bones = Object.keys(rig.bones).filter((name) => mapped.has(name));

  const heading = headingCorrection(THREE, rig, bvh, cal, HEADING_WINDOW_FRAMES, [from, to]);
  const yAxis = new THREE.Vector3(0, 1, 0);
  const qCorr = new THREE.Quaternion();
  const qOut = new THREE.Quaternion();

  const quats = new Int16Array(frames * bones.length * 4);
  const rootPos = new Float32Array(frames * 3);
  for (let i = 0; i < frames; i++) {
    const f = from + i;
    // Run the shipped retargeter: whatever it writes to the rig is what we bake,
    // including its last-writer-wins behaviour when two BVH joints map to one rig
    // bone.
    applyBVHFrame(THREE, rig, bvh, f, cal);
    qCorr.setFromAxisAngle(yAxis, heading.correction[f]);
    for (let b = 0; b < bones.length; b++) {
      const bone = bones[b];
      const q = bone === 'root' ? qOut.copy(rig.bones[bone].quaternion).premultiply(qCorr) : rig.bones[bone].quaternion;
      const o = (i * bones.length + b) * 4;
      quats[o] = Math.round(q.x * QUAT_SCALE);
      quats[o + 1] = Math.round(q.y * QUAT_SCALE);
      quats[o + 2] = Math.round(q.z * QUAT_SCALE);
      quats[o + 3] = Math.round(q.w * QUAT_SCALE);
    }
    const rp = readRootPosition(bvh, f);
    rootPos[i * 3] = rp.x;
    rootPos[i * 3 + 1] = rp.y;
    rootPos[i * 3 + 2] = rp.z;
  }

  const doc = {
    version: MOTION_TRACK_VERSION,
    clip: key,
    source: `${key}.bvh`,
    sourceSha256: createHash('sha256').update(text).digest('hex'),
    fps: Math.round(1 / bvh.frameTime),
    frameTime: bvh.frameTime,
    frames,
    sourceRange: range ? { from, to, sourceFrames: bvh.frames } : { from: 0, to: bvh.frames - 1, sourceFrames: bvh.frames },
    bones,
    quatEncoding: `int16 / ${QUAT_SCALE}`,
    rootPosEncoding: 'float32 bvh-cm',
    scale: cal.scale,
    yaw: cal.yaw,
    quats: encodeInt16(quats),
    rootPos: encodeFloat32(rootPos),
    provenance: {
      retarget: 'applyBVHFrame (src/lib/kinesiology/retarget.js) — not reimplemented',
      quantisation: 'int16 quaternion components; measured angular error < 0.01 deg (verify:kine-timeline)',
      excluded: 'ground offset + stance windows are rig-derived and computed at runtime',
      headingNormalisation: {
        method: 'centred boxcar on the unwrapped root yaw, then mean-centred; applied as a world-Y premultiplication',
        windowFrames: heading.stats.windowFrames,
        captureYawSpread: heading.stats.yawSpread,
        maxFacingDeviation: heading.stats.maxFacingDeviation,
        loopGap: heading.stats.loopGap
      }
    }
  };
  return { doc, json: `${JSON.stringify(doc)}\n` };
}

const rig = buildPerformanceRig(THREE, { lowPoly: true });
fs.mkdirSync(OUT_DIR, { recursive: true });

let failed = false;
const summary = [];
for (const spec of CLIP_SPEC) {
  const key = spec.key;
  const { doc, json } = bakeClip(key, rig, spec.range);
  const outPath = path.join(OUT_DIR, `${key}.json`);
  const existing = fs.existsSync(outPath) ? fs.readFileSync(outPath, 'utf8') : null;
  const same = existing === json;
  if (check) {
    if (!same) {
      failed = true;
      console.error(`motion asset stale: ${path.relative(ROOT, outPath)} does not match ${key}.bvh — run "node scripts/bake-motion-assets.mjs"`);
    }
  } else if (!same) {
    fs.writeFileSync(outPath, json);
  }
  const srcBytes = fs.statSync(path.join(SRC_DIR, `${key}.bvh`)).size;
  summary.push({
    heading: doc.provenance.headingNormalisation,
    clip: key,
    range: doc.sourceRange,
    frames: doc.frames,
    bones: doc.bones.length,
    sourceKB: +(srcBytes / 1024).toFixed(1),
    assetKB: +(json.length / 1024).toFixed(1),
    gzipKB: +(gzipSync(Buffer.from(json)).length / 1024).toFixed(1),
    written: !same && !check
  });
}

for (const row of summary) {
  const h = row.heading;
  const rg = row.range;
  console.log(`${row.clip}: frames ${rg.from}..${rg.to} of ${rg.sourceFrames} -> ${row.frames} baked x ${row.bones} bones · ${row.sourceKB} kB BVH -> ${row.assetKB} kB asset (${row.gzipKB} kB gz)${row.written ? ' [written]' : ''}`);
  console.log(`  heading: capture spread ${h.captureYawSpread} deg -> max facing deviation ${h.maxFacingDeviation} deg, loop gap ${h.loopGap} deg (window ${h.windowFrames} frames)`);
}
console.log(check ? 'motion assets: up to date' : 'motion assets: baked');
process.exit(failed ? 1 : 0);
