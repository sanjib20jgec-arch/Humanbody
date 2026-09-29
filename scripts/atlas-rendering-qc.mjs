import assert from 'node:assert/strict';
import { RENDERING_TIERS, RENDERING_MODES, resolveRenderingCapabilities } from '../src/lib/atlasRendering.js';

const errors = [];

// Battery tier must never enable heavy techniques.
if (RENDERING_TIERS.battery.environment || RENDERING_TIERS.battery.postprocessing) errors.push('battery tier must stay on the clean pipeline');
['sharp', 'balanced'].forEach((tier) => {
  if (!RENDERING_TIERS[tier].environment || !RENDERING_TIERS[tier].postprocessing) errors.push(`${tier} tier should enable the visual foundation`);
});

// lowPower always resolves to battery.
if (resolveRenderingCapabilities('sharp', true).tier !== 'battery') errors.push('lowPower must force battery tier');
if (resolveRenderingCapabilities('unknown', false).tier !== 'balanced') errors.push('unknown quality must fall back to balanced');

// Every rendering mode needs the honesty fields (Phase 63 contract).
Object.values(RENDERING_MODES).forEach((mode) => {
  if (!mode.shows || !mode.neverImplies || !mode.disclosure) errors.push(`${mode.id}: rendering mode needs shows/neverImplies/disclosure`);
});

assert.deepEqual(errors, [], `Rendering registry errors: ${errors.join('; ')}`);
console.log(`Rendering registry QC passed (${Object.keys(RENDERING_TIERS).length} tiers, ${Object.keys(RENDERING_MODES).length} registered modes)`);
