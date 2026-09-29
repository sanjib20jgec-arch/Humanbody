import assert from 'node:assert/strict';
import { SYSTEM_MATERIAL_PROFILES } from '../src/lib/AnatomySceneManager.js';

const errors = [];
Object.entries(SYSTEM_MATERIAL_PROFILES).forEach(([system, profile]) => {
  if (!Number.isFinite(profile.clearcoat) || profile.clearcoat < 0 || profile.clearcoat > 0.5) errors.push(`${system}: clearcoat ${profile.clearcoat} outside restrained budget (0–0.5)`);
  if (!Number.isFinite(profile.clearcoatRoughness) || profile.clearcoatRoughness < 0.3 || profile.clearcoatRoughness > 0.95) errors.push(`${system}: clearcoatRoughness ${profile.clearcoatRoughness} outside budget`);
});
// Bone and skin must stay matte — gloss on them reads as fake anatomy.
if (SYSTEM_MATERIAL_PROFILES.skeletal.clearcoat > 0.05) errors.push('skeletal must stay matte');
if (SYSTEM_MATERIAL_PROFILES.integumentary.clearcoat > 0.1) errors.push('integumentary must stay near-matte');
assert.deepEqual(errors, [], `Material budget errors: ${errors.join('; ')}`);
console.log(`Materials QC passed (${Object.keys(SYSTEM_MATERIAL_PROFILES).length} system profiles within budget)`);
