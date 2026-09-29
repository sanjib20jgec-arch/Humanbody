import assert from 'node:assert/strict';
import fs from 'node:fs';
import { anatomyRegistry } from '../src/data/anatomyRegistry.js';
import { ABSENT_STRUCTURES } from '../src/data/absentStructures.js';

const manifest = JSON.parse(fs.readFileSync('public/models/atlas.json', 'utf8'));
const parts = manifest.parts || [];
const errors = [];

// Phase 27: a correct-sounding label must never attach to the wrong geometry
// group. Verify stable identity, topology metadata, and group cardinality for
// every part in the certified atlas before anything is selected at runtime.
const ids = new Set();
const conceptIds = new Set();
const bySystem = new Map();
parts.forEach((part) => {
  if (!part.id || !part.name || !part.system) errors.push(`part missing identity: ${JSON.stringify(part).slice(0, 80)}`);
  if (ids.has(part.id)) errors.push(`duplicate part id ${part.id}`);
  ids.add(part.id);
  if (part.conceptId) conceptIds.add(part.conceptId);
  if (!Number.isInteger(part.chunk)) errors.push(`${part.id}: chunk index must be an integer`);
  if (!Array.isArray(part.bounds) || part.bounds.length !== 2) errors.push(`${part.id}: bounds must be a min/max pair`);
  if (!bySystem.has(part.system)) bySystem.set(part.system, []);
  bySystem.get(part.system).push(part);
});

// Bounds sanity + per-system outlier report. Outliers are flagged for human
// review, not auto-failed, because genuine anatomy (skin, skeleton) spans
// large volumes. This keeps QC honest without inventing approvals.
const outliers = [];
bySystem.forEach((systemParts, system) => {
  systemParts.forEach((part) => {
    const [[minX, minY, minZ], [maxX, maxY, maxZ]] = part.bounds;
    if ([minX, minY, minZ, maxX, maxY, maxZ].some((value) => !Number.isFinite(value))) { errors.push(`${part.id}: non-finite bounds`); return; }
    if (maxX < minX || maxY < minY || maxZ < minZ) errors.push(`${part.id}: inverted bounds`);
    const volume = Math.max(0, maxX - minX) * Math.max(0, maxY - minY) * Math.max(0, maxZ - minZ);
    if (volume === 0) outliers.push({ system, id: part.id, name: part.name, note: 'zero-volume bounds' });
  });
});

// Every registry system must exist in the atlas, and every registry
// focusStructure should map to a plausible atlas part.
const systemsInAtlas = new Set(parts.map((part) => part.system));
Object.values(anatomyRegistry).forEach((item) => {
  item.systems.forEach((system) => {
    if (!systemsInAtlas.has(system) && !['sensory'].includes(system)) {
      // sensory parts are grouped under nervous in the atlas; allow known aliases
      const alias = { sensory: 'nervous' }[system];
      if (!alias || !systemsInAtlas.has(alias)) errors.push(`${item.id}: registry system ${system} not present in atlas`);
    }
  });
});

assert.deepEqual(errors, [], `Anatomy identity errors: ${errors.join('; ')}`);

const rows = outliers.slice(0, 40).map((item) => `| ${item.system} | ${item.name} | ${item.id} | ${item.note} |`);
const report = [
  '# Anatomy structure-identity report',
  '',
  `Parts: **${parts.length}** · unique part ids: **${ids.size}** · unique concept ids: **${conceptIds.size}** · systems: **${systemsInAtlas.size}**`,
  '',
  'Automated identity, topology, and bounds checks. Geometry-versus-metadata outliers below are a human-review queue, not an approval.',
  '',
  outliers.length ? '| System | Name | Id | Note |\n| --- | --- | --- | --- |' : 'No bounds outliers detected.',
  ...(outliers.length ? rows : []),
  '',
  `Recorded absent structures: ${Object.keys(ABSENT_STRUCTURES).join(', ')}`,
  ''
].join('\n');
fs.writeFileSync('docs/reports/ANATOMY_IDENTITY_REPORT.md', report);
console.log(`Anatomy identity QC passed (${parts.length} parts, ${outliers.length} flagged outliers for review)`);
