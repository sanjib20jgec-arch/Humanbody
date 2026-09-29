import assert from 'node:assert/strict';
import fs from 'node:fs';
import { TEACHING_CLAIMS, TEACHING_OVERLAY_SPEC } from '../src/data/teachingOverlaySpec.js';

const manifest = JSON.parse(fs.readFileSync('public/models/atlas.json', 'utf8'));
const searchable = manifest.parts || [];
const resolve = (query) => searchable.find((part) => [part.name, part.id, part.conceptId, part.system].some((value) => String(value || '').toLowerCase().includes(query.toLowerCase())));
const errors = [];
const flatten = (value) => Array.isArray(value) ? value.flatMap(flatten) : value && typeof value === 'object' ? Object.values(value).flatMap(flatten) : [value];

Object.entries(TEACHING_OVERLAY_SPEC).forEach(([id, spec]) => {
  [...spec.sourceClaims, ...spec.modelClaims].forEach((claim) => { if (!Object.values(TEACHING_CLAIMS).includes(claim)) errors.push(`${id}: unknown claim ${claim}`); });
  if (!spec.registryId || !spec.stages.length) errors.push(`${id}: missing registry or stages`);
  flatten(spec.anchors).forEach((query) => {
    if (typeof query !== 'string') return;
    if (!resolve(query)) errors.push(`${id}: unresolved canonical anchor ${query}`);
  });
  // Phase 29: authored route waypoints must resolve like anchors.
  Object.entries(spec.stageWaypoints || {}).forEach(([stageId, waypoints]) => {
    if (!spec.stages.includes(stageId)) errors.push(`${id}: waypoint stage ${stageId} is not a declared stage`);
    waypoints.forEach((query) => {
      if (!resolve(query)) errors.push(`${id}: unresolved waypoint ${query} in stage ${stageId}`);
    });
  });
});
assert.deepEqual(errors, [], `Teaching overlay specification errors: ${errors.join('; ')}`);
console.log(`Teaching overlay specification passed (${Object.keys(TEACHING_OVERLAY_SPEC).length} routes)`);
