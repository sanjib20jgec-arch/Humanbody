import assert from 'node:assert/strict';
import fs from 'node:fs';
import { ACCESSIBLE_STRUCTURE_CATALOG } from '../src/data/accessibleStructureCatalog.js';
import { ANATOMY_EVIDENCE } from '../src/data/anatomyEvidence.js';

const manifest = JSON.parse(fs.readFileSync('public/models/atlas.json', 'utf8'));
const searchable = manifest.parts || [];
const resolve = (query) => searchable.find((part) => [part.name, part.id, part.conceptId, part.system].some((value) => String(value || '').toLowerCase().includes(query.toLowerCase())));
const errors = [];

Object.entries(ACCESSIBLE_STRUCTURE_CATALOG).forEach(([systemId, group]) => {
  if (!group.structures.length) errors.push(`${systemId}: accessible catalog needs at least one structure`);
  if (!ANATOMY_EVIDENCE[group.evidenceId]) errors.push(`${systemId}: catalog group references unknown evidence ${group.evidenceId}`);
  group.structures.forEach((structure) => {
    if (!structure.function || !structure.limitation) errors.push(`${structure.id}: function and limitation are required`);
    const part = resolve(structure.sourceQuery);
    if (!part) { errors.push(`${structure.id}: sourceQuery "${structure.sourceQuery}" does not resolve in the certified atlas`); return; }
    // The keyboard route must name the exact certified part it resolves to.
    if (part.name !== structure.name) errors.push(`${structure.id}: catalog name "${structure.name}" does not match resolved atlas part "${part.name}"`);
    if (part.conceptId !== structure.conceptId) errors.push(`${structure.id}: concept ${structure.conceptId} does not match resolved ${part.conceptId}`);
  });
});

assert.deepEqual(errors, [], `Accessible catalog errors: ${errors.join('; ')}`);
const total = Object.values(ACCESSIBLE_STRUCTURE_CATALOG).reduce((sum, group) => sum + group.structures.length, 0);
console.log(`Accessible structure catalog passed (${Object.keys(ACCESSIBLE_STRUCTURE_CATALOG).length} systems, ${total} part-level structures)`);
