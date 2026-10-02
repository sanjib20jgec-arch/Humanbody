import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from 'three';
import { parseBVH } from '../src/lib/kinesiology/bvh.js';
import { rigNameFor, computeCalibration, finalizeGround, applyBVHFrame, computeStanceData, measureFootSlide } from '../src/lib/kinesiology/retarget.js';
import { buildPerformanceRig, MUSCLES } from '../src/lib/kinesiology/performanceRig.js';
import { MUSCLE_FACTS } from '../src/data/kinesiology/muscleFacts.js';
import { ACTIONS } from '../src/lib/kinesiology/actions.js';
import { AUTHORED_ACTIONS, applyAuthoredPose } from '../src/lib/kinesiology/authoredTracks.js';

const rig = buildPerformanceRig(THREE);

function finite(o) {
  const q = o.quaternion, p = o.position;
  return [q.x, q.y, q.z, q.w, p.x, p.y, p.z].every(Number.isFinite);
}

// Shipped derivatives are the source of truth; raw mirror clips are optional
// re-downloadable inputs (vendor/kinesiology/raw may be pruned between envs).
const sources = [
  { file: 'walk_cmu.bvh (derived embed)', text: fs.readFileSync('src/data/kinesiology/walk_cmu.bvh', 'utf8') },
  { file: 'jump_cmu.bvh (derived embed)', text: fs.readFileSync('src/data/kinesiology/jump_cmu.bvh', 'utf8') }
];
const provPath = 'vendor/kinesiology/PROVENANCE.json';
if (fs.existsSync(provPath)) {
  const prov = JSON.parse(fs.readFileSync(provPath, 'utf8'));
  for (const entry of prov.files) {
    const rawPath = `vendor/kinesiology/raw/${entry.file}`;
    if (fs.existsSync(rawPath) && (entry.frames ?? 0) > 1) sources.push({ file: entry.file, text: fs.readFileSync(rawPath, 'utf8') });
  }
}

const analysis = [];
for (const entry of sources) {
  const bvh = parseBVH(entry.text);
  if (bvh.frames <= 1) continue;
  const mapped = new Set(bvh.order.map((n) => rigNameFor(n.name)).filter(Boolean));
  assert(mapped.size >= 12, `${entry.file}: expected >=12 mapped bones, got ${mapped.size}`);
  const cal = computeCalibration(THREE, bvh);
  const step = Math.max(1, Math.floor(bvh.frames / 60));
  let travel = 0, prev = null, minY = Infinity, maxY = -Infinity;
  for (let f = 0; f < bvh.frames; f += step) {
    applyBVHFrame(THREE, rig, bvh, f, cal, { treadmill: false });
    for (const b of Object.values(rig.bones)) assert(finite(b), `${entry.file} frame ${f}: non-finite transform`);
    const p = rig.bones.root.position;
    if (prev) travel += Math.hypot(p.x - prev.x, p.z - prev.z);
    prev = { x: p.x, z: p.z };
    minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y);
  }
  const seconds = bvh.frames * bvh.frameTime;
  analysis.push({ file: entry.file, seconds: +seconds.toFixed(1), speed: +(travel / seconds).toFixed(2), rootVertRangeCm: +((maxY - minY) * 100).toFixed(1), mapped: mapped.size });
}
assert(analysis.length >= 2, 'expected the two derived CMU embeds to analyze');

for (const [id, action] of Object.entries(AUTHORED_ACTIONS)) {
  const dt = 1 / 30;
  for (let t = 0; t < action.duration; t += dt) {
    applyAuthoredPose(rig, action.pose(t));
    for (const b of Object.values(rig.bones)) assert(finite(b), `${id} t=${t.toFixed(2)}: non-finite transform`);
  }
}

// Phase 76: foot-plant IK must cut stance foot-slide by >=50%.
{
  const wb = parseBVH(fs.readFileSync('src/data/kinesiology/walk_cmu.bvh', 'utf8'));
  const wcal = finalizeGround(THREE, rig, wb, computeCalibration(THREE, wb));
  const dL = computeStanceData(THREE, rig, wb, wcal, 'left');
  assert(dL.windows.length >= 2, 'walk clip should contain >=2 stance windows');
  const naive = measureFootSlide(THREE, rig, wb, wcal, dL, 'left', false);
  const ik = measureFootSlide(THREE, rig, wb, wcal, dL, 'left', true);
  console.log(`foot slide (left, m): naive ${naive.toFixed(3)} -> IK ${ik.toFixed(3)}`);
  assert(ik <= Math.max(0.04, 0.5 * naive), `IK must halve foot slide (naive ${naive.toFixed(3)}, ik ${ik.toFixed(3)})`);
}

// Phase 75: crossfade math is deterministic and finite.
{
  const qa = new Map(), qb = new Map();
  applyAuthoredPose(rig, AUTHORED_ACTIONS.walk.pose(0.5));
  for (const [n, b] of Object.entries(rig.bones)) qa.set(n, b.quaternion.clone());
  applyAuthoredPose(rig, AUTHORED_ACTIONS.run.pose(0.5));
  for (const [n, b] of Object.entries(rig.bones)) qb.set(n, b.quaternion.clone());
  for (const e of [0, 0.25, 0.5, 0.75, 1]) for (const [n, b] of Object.entries(rig.bones)) {
    const q = qa.get(n).clone().slerp(qb.get(n), e);
    assert([q.x, q.y, q.z, q.w].every(Number.isFinite), `blend ${n} @${e} non-finite`);
  }
}

// Phase 74: anatomy curation contracts.
for (const id of ['gluteusMedius', 'rectusFemoris', 'lateralPterygoid', 'pronatorTeres', 'adductorPollicis', 'obliquusExternus']) {
  assert(MUSCLES.some((m) => m.id === id), `rig missing muscle ${id}`);
}
const baseIds = new Set(MUSCLES.map((m) => m.id));
for (const id of baseIds) assert(MUSCLE_FACTS[id], `muscleFacts missing ${id}`);
for (const action of ACTIONS) {
  const levels = action.activations(0.5);
  for (const key of Object.keys(levels)) {
    if ((levels[key] || 0) > 0.45) assert(action.roles?.[key], `${action.id}: curated role missing for active muscle ${key}`);
  }
}
assert(rig.muscles['gluteusMedius.L'] && rig.muscles['lateralPterygoid.R'] && rig.muscles['adductorPollicis.L'], 'sided midline muscle keys built');

// Phases 102–103: the rig owns functional, pose-following joint markers,
// selected-muscle outlines, and a reversible activation heat palette.
assert.equal(rig.markerGroup.visible, false, 'joint markers start hidden');
assert.equal(rig.markerGroup.children.length, 17, 'expected the major-joint marker set');
rig.setMarkersVisible(true);
assert.equal(rig.markerGroup.visible, true, 'joint marker toggle enables its group');
{
  const headMarker = rig.markerGroup.children.find((marker) => marker.userData.joint === 'head');
  const headPosition = rig.bones.head.getWorldPosition(new THREE.Vector3());
  rig.root.worldToLocal(headPosition);
  assert(headMarker.position.distanceTo(headPosition) < 1e-6, 'head marker tracks its articulated bone');
}
rig.setMarkersVisible(false);
assert.equal(rig.markerGroup.visible, false, 'joint marker toggle disables its group');
{
  const key = 'quadriceps.L';
  const material = rig.muscles[key].mat;
  rig.setHeatMode(true);
  assert.equal(rig.heatOn(), true, 'heat mode reports enabled');
  rig.setMuscleActivation(key, 0.8, 'PM');
  const heatColor = material.color.getHexString();
  rig.setHeatMode(false);
  rig.resetMuscles();
  rig.setMuscleActivation(key, 0.8, 'PM');
  assert.equal(rig.heatOn(), false, 'heat mode reports disabled');
  assert.notEqual(material.color.getHexString(), heatColor, 'heat palette differs from curated role color');
  rig.setMuscleOutline(key, true);
  assert.equal(rig.outlines[key].visible, true, 'selected muscle outline is visible');
  assert.equal(Object.values(rig.outlines).filter((outline) => outline.visible).length, 1, 'only one selected muscle is outlined');
  rig.setMuscleOutline(key, false);
  assert.equal(Object.values(rig.outlines).filter((outline) => outline.visible).length, 0, 'clearing selection hides the outline');
}
rig.dispose();

console.log('HBL kinesiology asset smoke passed (' + Object.keys(rig.muscles).length + ' muscle meshes, curated roles, markers, outlines, and heat mode verified).');
console.log('clip analysis: speed (m/s horizontal) + root-vert range in cm (root bone vertical travel, NOT centre-of-mass displacement)');
console.table ? console.table(analysis) : console.log(analysis);
