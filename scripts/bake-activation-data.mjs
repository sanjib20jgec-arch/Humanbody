// Movement Theater Phase 3, Stage A — bake activation data out of JavaScript.
//
// Before: activation for the 20 actions was JavaScript inside `actions.js`
// (`activations: (t) => ({...})` with `bump()` windows), so an SME could not
// review or edit it without a build, roles were re-derived from peak thresholds
// at runtime, and every frame allocated a fresh ~54-key object.
//
// After: `content/kinesiology/clips/<clipId>.json` — plain, versioned,
// SME-editable data described in Masterplan §4.3. This script is the only
// producer, so the data can always be regenerated from the curated source, and
// `--check` (wired into `npm run verify` as `verify:kine-activation`) fails the
// build when the committed JSON and the source disagree.
//
// Usage:
//   node scripts/bake-activation-data.mjs           # write the JSON
//   node scripts/bake-activation-data.mjs --check   # fail if out of date
//
// How each field is derived (all of it measurable, none of it guessed):
//
//   activation    the existing curated curve, sampled at 65 points, then reduced
//                 to <= 12 keyframes with a monotone cubic through them, keeping
//                 the reconstruction inside 0.02 of the sample everywhere.
//   role          the curated role where the source curated one (the "CURATED"
//                 pass in actions.js); otherwise the peak-threshold fallback
//                 (PM >= 0.70, SY >= 0.38, ST >= 0.15, else IN) recorded in the
//                 file so the UI never re-derives it.
//   contraction   derived from the joint the muscle crosses, using the same
//                 angle stream the ROM panel shows: shortening is concentric,
//                 lengthening is eccentric, |angular velocity| below 5 deg/s is
//                 isometric. Two-joint muscles (hamstrings, rectus femoris,
//                 gastrocnemius) are checked at both joints and recorded as
//                 `mixed` when the two disagree. Muscles whose action is outside
//                 the tracked sagittal plane are `mixed` too — we do not record
//                 what we cannot measure.
//
//                 Why not measure muscle LENGTH instead (the obvious approach):
//                 it was tried first and measured a constant. In the shipped rig
//                 every muscle is a rigid capsule whose two anchor points both
//                 ride the SAME bone, and a rigid transform preserves distances,
//                 so the length is variation-free by construction (measured
//                 spread 1e-16 m for the quadriceps through a full squat). Real
//                 length change needs the origin and the insertion on different
//                 bones — a Phase 2 artist-checklist item, and the reason the
//                 contraction label is joint-derived here.
//   evidence      per muscle: the mocap clips' lower-limb and trunk curves are
//                 labelled as simplified gait-EMG timing (Perry & Burnfield 2010,
//                 the standard reference for gait muscle timing); the authored
//                 clips are labelled teaching approximations. Nothing here is
//                 EMG amplitude, and the note in each record says so.

import fs from 'node:fs';
import path from 'node:path';
import { gzipSync } from 'node:zlib';
import * as THREE from 'three';
import { ACTIONS as CURATED_ACTIONS } from '../content/kinesiology/source/curves.mjs';
import { ACTIONS } from '../src/lib/kinesiology/actions.js';
import { AUTHORED_ACTIONS, applyAuthoredPose } from '../src/lib/kinesiology/authoredTracks.js';
import { decodeActivation, validateActivationDoc, ACTIVATION_ORDER, deriveRole } from '../src/lib/kinesiology/activation.js';
import { decodeClipTracks, trackAngles } from '../src/lib/kinesiology/motionTracks.js';
import { anglesFromAuthoredPose } from '../src/lib/kinesiology/telemetry.js';

/** Segment-angle reference: the shipped readout (see KinesiologyTheater ANGLE_REFERENCE). */
const ZERO_ANGLES = { hip: 0, knee: 0, ankle: 0 };

const OUT_DIR = 'content/kinesiology/clips';
const FPS = 30;
// Curve-fitting resolution. The keys are fitted against an OVERSAMPLED source
// (4x the frame grid, endpoints included): the first version fitted only at the
// playback frames, and the shrink-to-fit check then caught a 0.46 error at a t
// between two frames — a window edge landing off-grid, invisible to a reducer that
// only looks where the frames are. Keys may sit anywhere on this finer grid.
const OVERSAMPLE = 4;
const MAX_KEYS = 12;       // Masterplan §4.3 budget
// Extended ladder, see the note below: smooth curves fit in 12 keys, sums of
// three windows need up to 16, and genuinely oscillating curves (the wave's
// alternating flexors/extensors at ~3 Hz) need more.
const KEY_LADDER = [12, 16, 24, 40, 64];
// Tolerance for the keyframe reduction. The spec fixes the KEY BUDGET (12), not
// the error; this number is chosen from the ramp it drives. The activation ramp's
// relative luminance spans 0.019 -> 0.782, so an activation error of e shifts the
// displayed colour by about 0.76*e in luminance: at e = 0.05 that is 3.8 % of the
// ramp — below the threshold at which a colour difference is visible side by side
// and far below the point where a learner would read the wrong intensity. At
// e = 0.10 (7.6 %) it is visible, which is why the ladder exists for curves that
// cannot be held inside 0.05 with 12 keys.
const KEY_TOLERANCE = 0.05;

// On the keyframe budget (measured 2026-10-04): the spec's 12-key ceiling is a
// file-size/interpolation budget, not a runtime one — the runtime decodes a
// document ONCE into per-muscle closures and never looks at the key array again,
// and the GPU path uploads a 54-row texture, not keyframes. Measured shape of the
// curated curves: 195 of the 201 records fit in 12 keys, the sums of three
// raised-cosine windows need 13-16 (`jump` quadriceps: 0.094 error at 12 keys,
// inside tolerance at 16), and genuinely oscillating curves need more still
// (`wave` forearm flexors alternate at ~3 Hz — 0.10 error at 16 keys, inside
// tolerance at 40). Records that exceed 12 keys record their measured
// `quality.maxError` in the file, and the validator refuses any record whose
// recorded error is above tolerance, so the deviation is visible in the data
// rather than hidden in the interpolation.
const ISOMETRIC_RATE = 0.05; // |dL/dt| / L0 below this is "holding"

const LEG_LOWER = /^(gluteus|rectusFemoris|quadriceps|hamstrings|iliopsoas|gastrocnemius|tibialisAnterior|soleus|obliquus|rectusAbdominis|erectorSpinae)/;

/** Human labels for the review sheet and the UI. */
const LABELS = {
  'tiptoe-walk': 'Tip-toe walk', 'heel-walk': 'Heel walk', bow: 'Bow', shrug: 'Shrug',
  'reach-up': 'Reach up', clap: 'Clap', 'head-signals': 'Head signals', kick: 'Kick',
  sidestep: 'Side step', 'one-leg': 'Single-leg stand', squat: 'Squat', 'sit-stand': 'Sit to stand',
  lunge: 'Lunge', walk: 'Walk (mocap)', run: 'Run', jump: 'Jump (mocap)',
  wave: 'Wave', handshake: 'Handshake', chew: 'Chew', talk: 'Talk'
};
const CLIP_FILES = { walk_cmu: 'walk_cmu.json', jump_cmu: 'jump_cmu.json' };

const round = (v, d = 4) => Number(v.toFixed(d));
const clampCount = new Map();
const extendedKeys = [];

/**
 * Reduce a sampled curve to <= MAX_KEYS keyframes through a monotone cubic.
 *
 * Greedy adaptive placement, not uniform subsampling: the authored windows are
 * narrow raised cosines (`bump(t, 0.35, 0.55, 1)` is a 0.2-wide peak), and
 * uniform keys walk straight over the peak — the first uniform version of this
 * reducer missed 0.65 of activation on the calf muscles. Instead: start with the
 * two endpoints, repeatedly insert the sample with the largest reconstruction
 * error, stop when the worst error is inside tolerance or the key budget is full.
 */
function reduceCurve(values, maxKeys = MAX_KEYS) {
  const n = values.length;
  const tOf = (i) => i / (n - 1);
  const probe = (idx) => {
    const doc = {
      clipId: 'probe', label: 'probe', source: { kind: 'authored', citation: 'x' },
      fps: 30, frameCount: n, durationS: n / 30,
      muscles: [{
        muscleId: 'x', role: 'IN', contraction: 'mixed', interpolation: 'monotoneCubic',
        activation: idx.map((i) => [tOf(i), values[i]]), evidence: { basis: 'x', citation: 'x' }
      }]
    };
    const curve = decodeActivation(doc, { order: ['x'], skipValidation: true });
    const err = new Float64Array(n);
    let worst = 0;
    let at = -1;
    for (let i = 0; i < n; i++) {
      err[i] = Math.abs(curve.valueAt('x', tOf(i)) - values[i]);
      if (err[i] > worst) { worst = err[i]; at = i; }
    }
    return { worst, at, err };
  };

  let idx = [0, n - 1];
  const ceiling = maxKeys;
  let worst = Infinity;
  for (;;) {
    // Re-measure the WHOLE curve every pass: an inserted key changes the Hermite
    // tangents of its neighbours, so the error elsewhere can RISE after an
    // insertion. An earlier version carried the pre-insertion maximum forward and
    // under-reported a measured 0.108 error as 0.042 on the sharpest curve in the
    // data (kick/quadriceps.L) — the shrink-to-fit test caught it.
    const { worst: measured, at } = probe(idx);
    worst = measured;
    if (worst <= KEY_TOLERANCE || idx.length >= ceiling || at < 0) break;
    idx = [...idx, at].sort((a, b) => a - b);
  }
  const keys = idx.map((i) => [round(tOf(i), 5), round(values[i], 4)]);
  // Guard: rounding must not collapse the strictly-increasing t contract.
  for (let i = 1; i < keys.length; i++) {
    if (keys[i][0] <= keys[i - 1][0]) keys[i][0] = round(keys[i - 1][0] + 1e-4, 5);
  }
  if (keys[keys.length - 1][0] > 1) keys[keys.length - 1][0] = 1;
  return { keys, worst, extended: keys.length > MAX_KEYS };
}

/**
 * Which sagittal joint each muscle acts across, and which direction of that
 * joint's motion SHORTENS it (+1 = positive flexion angle shortens it, -1 = the
 * reverse). Standard kinesiology (OpenStax A&P, the same attribution the shipped
 * muscle facts carry); this table moves to `content/kinesiology/rig.json` in
 * Phase 4, which the masterplan already specifies as the registry for
 * muscle -> bone/fibre/belly data.
 *
 * `sign` is in the shipped angle convention: hip flexion +, knee flexion +,
 * ankle dorsiflexion + (so a plantarflexor shortens when the ankle angle falls).
 * Muscles absent from this table are recorded as `mixed`: their primary action
 * (abduction, rotation, mastication, facial) is outside the tracked plane.
 */
const JOINT_ROLES = {
  iliopsoas: [['hip', +1]],
  rectusFemoris: [['hip', +1], ['knee', -1]],
  quadriceps: [['knee', -1]],
  hamstrings: [['hip', -1], ['knee', +1]],
  gluteusMaximus: [['hip', -1]],
  soleus: [['ankle', -1]],
  gastrocnemius: [['ankle', -1], ['knee', +1]],
  tibialisAnterior: [['ankle', +1]]
};
/** |angular velocity| below this counts as holding (deg/s). */
const ISOMETRIC_VELOCITY = 5;

/** Contraction mode per frame for one muscle, from the tracked joint angles. */
function contractionModes(muscleId, angleSeries, frames) {
  const base = muscleId.replace(/\.(L|R)$/, '');
  const joints = JOINT_ROLES[base];
  const dt = 1 / FPS;
  const modes = new Array(frames);
  if (!joints) { modes.fill('mixed'); return modes; }
  // Precompute each joint's angular velocity once per joint.
  const velocities = joints.map(([joint]) => {
    const series = angleSeries[joint];
    const v = new Float64Array(frames);
    for (let f = 0; f < frames; f++) {
      const prev = series[Math.max(0, f - 1)];
      const next = series[Math.min(frames - 1, f + 1)];
      const span = (f === 0 || f === frames - 1) ? dt : 2 * dt;
      v[f] = (next - prev) / span;
    }
    return v;
  });
  for (let f = 0; f < frames; f++) {
    const perJoint = joints.map(([joint, sign], i) => {
      const v = velocities[i][f];
      if (Math.abs(v) < ISOMETRIC_VELOCITY) return 'isometric';
      return (v > 0) === (sign > 0) ? 'concentric' : 'eccentric';
    });
    modes[f] = perJoint.every((m) => m === perJoint[0]) ? perJoint[0] : 'mixed';
  }
  return modes;
}

function evidenceFor(action, muscleId) {
  const lowerBody = LEG_LOWER.test(muscleId);
  if (action.source === 'cmu' && lowerBody) {
    return {
      basis: 'EMG',
      citation: 'Perry & Burnfield (2010), Gait Analysis: Normal and Pathological Function — gait muscle timing figures',
      note: 'Timing windows simplified to a teaching envelope; magnitudes are relative, not EMG amplitudes.'
    };
  }
  if (action.source === 'cmu') {
    return {
      basis: 'authored-teaching',
      citation: 'HBL teaching curation (the shipped motion capture carries no EMG channel)',
      note: 'Hand-timed teaching envelope for an upper-body/trunk muscle during a lower-body capture.'
    };
  }
  return {
    basis: 'kinesiology-text',
    citation: 'OpenStax Anatomy & Physiology (in-repo attribution) + HBL teaching curation',
    note: 'Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative.'
  };
}

function buildDoc(action, runtime) {
  const authored = AUTHORED_ACTIONS[action.id];
  // The shipped duration comes from the RUNTIME registry (src/.../actions.js):
  // the document must describe the clip the viewer actually plays (audit A19).
  const duration = runtime.duration;
  const frames = Math.max(2, Math.round(duration * FPS));
  const tOf = (f) => f / (frames - 1);

  let tracks = null;
  if (action.clip) {
    const clipKey = action.clip.replace('.bvh', '');
    const doc = JSON.parse(fs.readFileSync(path.join('src/data/kinesiology/clips', CLIP_FILES[clipKey]), 'utf8'));
    tracks = decodeClipTracks(doc);
  }

  // Pass 1: the joint-angle stream this action plays (the same source the ROM
  // panel reads: baked tracks for the mocap clips, the authored pose reader for
  // the rest), from which contraction is derived.
  const angleSeries = { hip: new Float64Array(frames), knee: new Float64Array(frames), ankle: new Float64Array(frames) };
  for (let f = 0; f < frames; f++) {
    const t = tOf(f);
    if (tracks) {
      const frame = Math.min(tracks.frames - 1, Math.round(t * (tracks.frames - 1)));
      const a = trackAngles(THREE, tracks, frame, ZERO_ANGLES);
      angleSeries.hip[f] = a.hip;
      angleSeries.knee[f] = a.knee;
      angleSeries.ankle[f] = a.ankle;
    } else {
      const a = anglesFromAuthoredPose(authored.pose(t));
      angleSeries.hip[f] = a.hip;
      angleSeries.knee[f] = a.knee;
      angleSeries.ankle[f] = a.ankle;
    }
  }

  // Pass 2: activation samples from the curated curves, oversampled so the
  // keyframe fit is measured against the continuous source, not just the frames.
  const RN = (frames - 1) * OVERSAMPLE + 1;
  const rtOf = (i) => i / (RN - 1);
  const sampleKeys = new Set();
  const samples = new Map();
  for (let i = 0; i < RN; i++) {
    const levels = action.activations(rtOf(i)) || {};
    for (const [k, v] of Object.entries(levels)) {
      if (!sampleKeys.has(k)) { sampleKeys.add(k); samples.set(k, new Float64Array(RN)); }
      const clampedValue = Math.max(0, Math.min(1, Number(v) || 0));
      // Audit A11 found activation above 1.0 in the curated data. The clamp is
      // correctness; counting it keeps a source regression visible.
      if (Math.abs(clampedValue - Number(v)) > 1e-9) clampCount.set(action.id, (clampCount.get(action.id) || 0) + 1);
      samples.get(k)[i] = clampedValue;
    }
  }
  for (const k of action.roles ? Object.keys(action.roles) : []) {
    if (!sampleKeys.has(k)) {
      sampleKeys.add(k);
      samples.set(k, new Float64Array(RN));
      // A curated role with no curve: the muscle is stated to be a stabiliser,
      // so hold it at the stabiliser floor rather than inventing a window.
      samples.get(k).fill(0.2);
    }
  }

  const muscles = [];
  let worstError = 0;
  for (const key of [...sampleKeys].sort()) {
    const raw = samples.get(key);
    // Unclamped source guard: audit A11 found activation above 1.0 in the curated
    // data. Clamping here is correctness, but it is counted and reported so a
    // source regression cannot hide behind it.
    const values = [...raw];
    let reduced = null;
    for (const ceiling of KEY_LADDER) {
      reduced = reduceCurve(values, ceiling);
      if (reduced.worst <= KEY_TOLERANCE) break;
    }
    worstError = Math.max(worstError, reduced.worst);
    if (reduced.keys.length > MAX_KEYS) extendedKeys.push(`${action.id}/${key} (${reduced.keys.length} keys, error ${reduced.worst.toFixed(4)})`);
    const modes = contractionModes(key, angleSeries, frames);
    const counts = { concentric: 0, eccentric: 0, isometric: 0, mixed: 0 };
    for (const m of modes) counts[m] += 1;
    const dominant = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
    // Collapse to keys, requiring a new mode to persist 4 frames (0.13 s) so
    // single-frame measurement noise cannot flicker the label.
    const contractionKeys = [];
    let current = modes[0];
    let run = 1;
    for (let f = 1; f < frames; f++) {
      if (modes[f] === current) { run += 1; continue; }
      if (run >= 4) contractionKeys.push([round(tOf(f - 1), 5), current]);
      current = modes[f];
      run = 1;
    }
    if (run >= 4) contractionKeys.push([round(tOf(frames - 1), 5), current]);
    const dedup = contractionKeys.filter((k, i) => i === 0 || k[1] !== contractionKeys[i - 1][1]);
    const distinct = new Set(dedup.map((k) => k[1]));
    let contraction = dominant;
    let keysOut = dedup;
    if (distinct.size > 3 || dedup.length > 6) { contraction = 'mixed'; keysOut = null; }

    const peak = Math.max(...values);
    const curated = action.roles ? action.roles[key] : null;
    muscles.push({
      muscleId: key,
      role: curated || deriveRole(peak),
      contraction,
      contractionKeys: keysOut && keysOut.length > 1 ? keysOut : undefined,
      activation: reduced.keys,
      interpolation: 'monotoneCubic',
      quality: { keys: reduced.keys.length, maxError: round(reduced.worst, 4) },
      peak: round(peak, 4),
      meanActivation: round(values.reduce((s, v) => s + v, 0) / values.length, 4),
      evidence: evidenceFor(action, key)
    });
  }

  const doc = {
    version: 1,
    clipId: action.id,
    label: LABELS[action.id] || action.id,
    source: {
      kind: action.source === 'cmu' ? 'mocap' : 'authored',
      clip: action.clip || null,
      citation: action.source === 'cmu'
        ? 'CMU Graphics Lab Motion Capture Database (see vendor/kinesiology/PROVENANCE.json)'
        : 'HBL authored teaching track'
    },
    fps: FPS,
    frameCount: frames,
    durationS: round(duration, 5),
    // Phase 4 owns joints[]/romBand/snapPoints; the validator does not require
    // them yet, and `clipManifest.js` still owns snap-point derivation.
    muscles
  };
  return { doc, worst: worstError };
}

/** Write the lean runtime registry (src/lib/kinesiology/actions.js) from the curated source. */
function emitRuntime() {
  const j = (o) => JSON.stringify(o);
  const round = (v) => (Number.isInteger(v) ? String(v) : String(Number(v.toFixed(6))));
  let out = `// Kinesiology Theater — runtime action registry (GENERATED, do not hand-edit).
//
// Generated from \`content/kinesiology/source/curves.mjs\` by the Phase 3
// migration: everything the viewer needs at run time and nothing more. The
// activation curves and roles that used to live here are now data in
// \`content/kinesiology/clips/<clipId>.json\` (Masterplan §4.3, pillar 3) — see
// \`src/lib/kinesiology/activation.js\` for the runtime that reads them, and this
// script for the generator that produced them.
//
// Regenerate with: node scripts/bake-activation-data.mjs --emit-runtime
// The timeline smoke asserts this file and the JSON documents agree on duration,
// frame count and clip identity (audit A19).

import { AUTHORED_ACTIONS } from './authoredTracks.js';

const track = (id, phases, opts = {}) => ({
  id,
  // An explicit option wins: the mocap clips reuse an authored action's id but
  // have their own duration (walk is 64 frames = 2.133 s, not the authored 2.2 s;
  // jump is 66 frames = 2.2 s, not the authored 2.6 s). Getting this wrong is
  // exactly the drift audit A19 is about, and the timeline smoke catches it.
  source: opts.source || (AUTHORED_ACTIONS[id] ? AUTHORED_ACTIONS[id].source : 'cmu'),
  duration: opts.duration !== undefined ? opts.duration : (AUTHORED_ACTIONS[id] ? AUTHORED_ACTIONS[id].duration : undefined),
  loop: opts.loop !== undefined ? opts.loop : (AUTHORED_ACTIONS[id] ? AUTHORED_ACTIONS[id].loop : undefined),
  phases,
  focus: opts.focus || null,
  clip: opts.clip || null
});

export const ACTIONS = [
`;
  for (const a of CURATED_ACTIONS) {
    const phases = a.phases.map((p) => {
      const bits = [`name: ${j(p.name)}`, `until: ${round(p.until)}`, `caption: ${j(p.caption)}`];
      if (p.ext) bits.push(`ext: ${j(p.ext)}`);
      return `    { ${bits.join(', ')} }`;
    }).join(',\n');
    const opts = [];
    if (a.focus) opts.push(`focus: ${j(a.focus)}`);
    if (a.clip) opts.push(`clip: ${j(a.clip)}`);
    if (a.source === 'cmu') opts.push(`duration: ${a.duration}`, `loop: ${a.loop}`);
    out += `  track(${j(a.id)}, [\n${phases}\n  ]${opts.length ? `, { ${opts.join(', ')} }` : ''}),\n`;
  }
  const src = fs.readFileSync('content/kinesiology/source/curves.mjs', 'utf8');
  out += `];\n\n${src.slice(src.indexOf('export const ACTION_BY_ID'))}`;
  const target = 'src/lib/kinesiology/actions.js';
  const next = out;
  const prev = fs.existsSync(target) ? fs.readFileSync(target, 'utf8') : null;
  if (prev === next) { console.log('runtime registry: up to date'); return; }
  fs.writeFileSync(target, next);
  console.log(`runtime registry: wrote ${target} (${next.length} bytes)`);
}

/**
 * The Phase 3 SME review sheet: every shipped curve, its role, its measured
 * contraction, its peak and its evidence basis, with a column for the reviewer to
 * mark. Generated from the data so it can never describe something the app does
 * not ship.
 */
function writeSmeSheet() {
  const lines = [];
  lines.push('# Movement Theater — Phase 3 activation review sheet');
  lines.push('');
  lines.push('**Status: NOT REVIEWED.** This sheet exists so a human subject-matter expert can');
  lines.push('review every shipped activation curve. No clinical or academic sign-off has happened,');
  lines.push('and no claim of one may be made until this sheet carries named reviewer records');
  lines.push('(see `docs/MOVEMENT_THEATER_MASTERPLAN.md` §8.3 and the Gate G1 governance rules).');
  lines.push('');
  lines.push('Generated from `content/kinesiology/clips/*.json` by');
  lines.push('`node scripts/bake-activation-data.mjs --sme-sheet` — re-run it after any edit.');
  lines.push('');
  lines.push('How to review:');
  lines.push('');
  lines.push('1. **Role** — is the muscle\'s role in this movement right? The taxonomy is');
  lines.push('   Agonist (prime mover) / Synergist / Antagonist / Stabilizer / Inactive. Some records');
  lines.push('   are curated by hand and some fall back to peak thresholds; a wrong role is a one-word');
  lines.push('   fix in the JSON.');
  lines.push('2. **Contraction** — derived from the tracked joint angle (shortening = concentric,');
  lines.push('   lengthening = eccentric, holding = isometric) and marked `mixed` where the two joints');
  lines.push('   a two-joint muscle crosses disagree, or where the muscle\'s action is outside the');
  lines.push('   tracked sagittal plane. Flag anything anatomically wrong.');
  lines.push('3. **Peak / mean** — the relative intensity. These are teaching values, not EMG');
  lines.push('   amplitudes; check the *ordering* between muscles rather than the absolute number.');
  lines.push('4. **Evidence** — does the cited basis actually support the curve? Records labelled');
  lines.push('   `authored-teaching` are hand-timed and are the first candidates for replacement.');
  lines.push('');
  const counts = {};
  let rows = 0;
  for (const file of fs.readdirSync(OUT_DIR).filter((f) => f.endsWith('.json')).sort()) {
    const doc = JSON.parse(fs.readFileSync(path.join(OUT_DIR, file), 'utf8'));
    lines.push(`## ${doc.clipId} — ${doc.label}`);
    lines.push('');
    lines.push(`${doc.source.kind === 'mocap' ? 'Motion capture' : 'Authored'} · ${doc.frameCount} frames @ ${doc.fps} fps · ${doc.durationS} s · source: ${doc.source.citation}`);
    lines.push('');
    lines.push('| Muscle | Role | Contraction | Peak | Mean | Evidence | Role ok? | Notes |');
    lines.push('|---|---|---|---|---|---|---|---|');
    for (const m of doc.muscles) {
      counts[m.role] = (counts[m.role] || 0) + 1;
      const keys = m.contractionKeys && m.contractionKeys.length > 1
        ? `${m.contraction} (${m.contractionKeys.length} phases)`
        : m.contraction;
      lines.push(`| \`${m.muscleId}\` | ${m.role} | ${keys} | ${m.peak.toFixed(2)} | ${m.meanActivation.toFixed(2)} | ${m.evidence.basis} | ☐ | ${m.evidence.note} |`);
      rows += 1;
    }
    lines.push('');
  }
  lines.push('## Coverage');
  lines.push('');
  lines.push(`- ${rows} muscle records across 20 clips.`);
  lines.push(`- Roles in the shipped data: ${Object.entries(counts).map(([r, n]) => `${r} ${n}`).join(' · ')}.`);
  lines.push('- **Antagonist is currently unused (0 records).** Nothing in the shipped data asserts an');
  lines.push('  antagonist, because the Phase 1 curation pass never assigned one. Muscle groups that');
  lines.push('  brake a movement show up as `eccentric` contractions (see the Contraction column), which');
  lines.push('  is the measured half of the story; whether any of them should be *labelled* Antagonist');
  lines.push('  is a judgement call this sheet is asking for.');
  const target = 'docs/MOVEMENT_THEATER_PHASE3_SME_REVIEW.md';
  const text = `${lines.join('\n')}\n`;
  const prev = fs.existsSync(target) ? fs.readFileSync(target, 'utf8') : null;
  if (prev === text) { console.log('SME review sheet: up to date'); return; }
  fs.writeFileSync(target, text);
  console.log(`SME review sheet: wrote ${target} (${rows} records)`);
}

function main() {
  const check = process.argv.includes('--check');
  // `--emit-runtime` regenerates src/lib/kinesiology/actions.js (the lean runtime
  // registry) from the curated source: phases, durations, focus and nothing else.
  if (process.argv.includes('--emit-runtime')) {
    emitRuntime();
    return;
  }
  if (process.argv.includes('--sme-sheet')) {
    writeSmeSheet();
    return;
  }
  const knownIds = new Set(ACTIVATION_ORDER);
  const files = new Map();
  const problems = [];
  let worstReconstruction = 0;

  const runtimeById = new Map(ACTIONS.map((a) => [a.id, a]));
  for (const action of CURATED_ACTIONS) {
    const runtime = runtimeById.get(action.id);
    if (!runtime) { problems.push(`${action.id}: missing from the runtime action registry`); continue; }
    const { doc, worst } = buildDoc(action, runtime);
    worstReconstruction = Math.max(worstReconstruction, worst);
    const validation = validateActivationDoc(doc, { knownIds, expected: { fps: FPS, frameCount: Math.round(runtime.duration * FPS), durationS: runtime.duration } });
    if (validation.length) problems.push(...validation.map((v) => `${action.id}: ${v}`));
    files.set(`${action.id}.json`, `${JSON.stringify(doc, null, 1)}\n`);
  }

  if (problems.length) {
    console.error('activation data failed validation:');
    for (const p of problems) console.error(`  - ${p}`);
    process.exit(1);
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  let written = 0;
  let changed = [];
  let totalRaw = 0;
  let totalGz = 0;
  for (const [name, text] of files) {
    const target = path.join(OUT_DIR, name);
    const existing = fs.existsSync(target) ? fs.readFileSync(target, 'utf8') : null;
    totalRaw += Buffer.byteLength(text);
    totalGz += gzipSync(Buffer.from(text)).length;
    if (existing !== text) {
      changed.push(name);
      if (!check) fs.writeFileSync(target, text);
    }
  }

  const counts = { PM: 0, SY: 0, AN: 0, ST: 0, IN: 0 };
  for (const action of ACTIONS) {
    for (const m of JSON.parse(files.get(`${action.id}.json`)).muscles) counts[m.role] += 1;
  }
  console.log(`activation data: ${files.size} clips, ${Object.values(counts).reduce((a, b) => a + b, 0)} muscle records`);
  console.log(`  roles: PM ${counts.PM} · SY ${counts.SY} · AN ${counts.AN} · ST ${counts.ST} · IN ${counts.IN}`);
  console.log(`  size: ${(totalRaw / 1024).toFixed(1)} kB raw / ${(totalGz / 1024).toFixed(1)} kB gzipped for all 20 clips`);
  const keyHist = new Map();
  for (const action of ACTIONS) {
    for (const m of JSON.parse(files.get(`${action.id}.json`)).muscles) {
      const bucket = m.activation.length <= 12 ? '<=12' : m.activation.length <= 16 ? '13-16' : '>16';
      keyHist.set(bucket, (keyHist.get(bucket) || 0) + 1);
    }
  }
  console.log(`  keyframe counts: ${[...keyHist].map(([k, v]) => `${k}: ${v}`).join(' · ')}`);
  console.log(`  worst keyframe-reduction error: ${worstReconstruction.toFixed(4)} (tolerance ${KEY_TOLERANCE})`);
  console.log(`  records needing more than ${MAX_KEYS} keys: ${extendedKeys.length ? extendedKeys.join(', ') : 'none'}`);
  console.log(`  source samples clamped into 0..1: ${clampCount.size ? [...clampCount].map(([k, v]) => `${k} (${v})`).join(', ') : 'none'}`);
  if (worstReconstruction > KEY_TOLERANCE) {
    console.error('curve reduction exceeded the tolerance — raise the key budget before shipping this');
    process.exit(1);
  }

  if (check && changed.length) {
    console.error(`activation data is stale: ${changed.length} file(s) differ — run node scripts/bake-activation-data.mjs`);
    for (const c of changed.slice(0, 5)) console.error(`  - ${c}`);
    process.exit(1);
  }
  console.log(changed.length ? `wrote ${changed.length} file(s)` : 'activation data: up to date');
}

main();
