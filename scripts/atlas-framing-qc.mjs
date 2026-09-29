import assert from 'node:assert/strict';
import { ATLAS_ORIENTATIONS, ATLAS_CAMERA_PRESETS, ATLAS_LIGHTING_PRESETS, orientationLabelForYaw } from '../src/lib/atlasFraming.js';

const TAU = Math.PI * 2;
const errors = [];

// Orientation labels must tile the full turntable without gaps or overlaps.
const sweep = 720;
const seen = new Set();
for (let i = 0; i < sweep; i += 1) {
  const label = orientationLabelForYaw((i / sweep) * TAU);
  if (!label) errors.push(`yaw ${(i / sweep) * TAU} produced no orientation label`);
  seen.add(label);
}
ATLAS_ORIENTATIONS.forEach((orientation) => {
  if (!seen.has(orientation.label)) errors.push(`orientation ${orientation.id} is never produced by the label function`);
});

// Preset yaw targets must land in the expected orientation.
// The lateral preset yaw (-PI/2) rotates the anatomy's left side to the
// front, matching the existing turntable label contract in the viewer.
const expectLabel = { anterior: 'FRONT VIEW', lateral: 'LEFT VIEW', posterior: 'BACK VIEW' };
Object.entries(ATLAS_CAMERA_PRESETS).forEach(([id, preset]) => {
  if (!preset.available) return;
  const label = orientationLabelForYaw(preset.yaw);
  if (label !== expectLabel[id]) errors.push(`preset ${id} yaw ${preset.yaw.toFixed(3)} resolves to ${label}, expected ${expectLabel[id]}`);
});

// Unavailable presets must carry a reason so nobody silently exposes them.
['superior', 'inferior'].forEach((id) => {
  const preset = ATLAS_CAMERA_PRESETS[id];
  if (preset.available) errors.push(`${id} preset must stay unavailable until a dedicated camera path exists`);
  if (!preset.note) errors.push(`${id} preset needs a note explaining why it is unavailable`);
});

// Lighting presets must keep positive, bounded intensities.
Object.values(ATLAS_LIGHTING_PRESETS).forEach((preset) => {
  ['hemisphereIntensity', 'keyIntensity', 'fillIntensity', 'rimIntensity', 'exposure'].forEach((key) => {
    if (!Number.isFinite(preset[key]) || preset[key] <= 0 || preset[key] > 4) errors.push(`${preset.id}: ${key} out of bounds`);
  });
});

assert.deepEqual(errors, [], `Atlas framing errors: ${errors.join('; ')}`);
console.log(`Atlas framing QC passed (${ATLAS_ORIENTATIONS.length} orientations, ${Object.keys(ATLAS_CAMERA_PRESETS).length} presets, ${Object.keys(ATLAS_LIGHTING_PRESETS).length} lighting presets)`);
