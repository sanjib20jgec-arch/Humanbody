import assert from 'node:assert/strict';
import { DIGESTIVE_STAGES, DIGESTIVE_ACCESSORY_ORGANS, digestiveStageAt, nextDigestiveStage, previousDigestiveStage, accessorySupportAt, describeDigestiveStage } from '../src/lib/DigestiveStageMachine.js';

const errors = [];

// Canonical alimentary order.
assert.deepEqual(DIGESTIVE_STAGES.map((stage) => stage.id), ['mouth', 'esophagus', 'stomach', 'small-intestine', 'large-intestine']);

// Index clamping keeps the machine total for any learner input.
if (digestiveStageAt(-3).id !== 'mouth') errors.push('negative index must clamp to mouth');
if (digestiveStageAt(99).id !== 'large-intestine') errors.push('overflow index must clamp to large intestine');
if (nextDigestiveStage(4).id !== 'large-intestine') errors.push('next stage must clamp at the end');
if (previousDigestiveStage(0).id !== 'mouth') errors.push('previous stage must clamp at the start');

// Food must never pass through accessory organs.
DIGESTIVE_ACCESSORY_ORGANS.forEach((organ) => {
  if (organ.foodPassesThrough) errors.push(`${organ.id}: food must not pass through accessory organs`);
  const host = DIGESTIVE_STAGES.find((stage) => stage.id === organ.supportsStage);
  if (!host) errors.push(`${organ.id}: supports unknown stage ${organ.supportsStage}`);
});

// Bile and pancreatic support enter at the small intestine only.
const duodenalSupport = accessorySupportAt('small-intestine').map((organ) => organ.id);
assert.deepEqual(duodenalSupport.sort(), ['gallbladder', 'liver', 'pancreas']);
DIGESTIVE_STAGES.filter((stage) => stage.id !== 'small-intestine').forEach((stage) => {
  if (accessorySupportAt(stage.id).length) errors.push(`${stage.id}: unexpected accessory support`);
});

// Descriptions must carry captions, pH, and side inputs.
DIGESTIVE_STAGES.forEach((stage, index) => {
  const description = describeDigestiveStage(index);
  if (!description.caption || !Number.isFinite(description.pH)) errors.push(`${stage.id}: description incomplete`);
});

assert.deepEqual(errors, [], `Digestive stage machine errors: ${errors.join('; ')}`);
console.log(`Digestive stage machine smoke passed (${DIGESTIVE_STAGES.length} stages, ${DIGESTIVE_ACCESSORY_ORGANS.length} accessory organs)`);
