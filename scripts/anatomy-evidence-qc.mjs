import assert from 'node:assert/strict';
import fs from 'node:fs';
import { anatomyRegistry } from '../src/data/anatomyRegistry.js';
import { ANATOMY_EVIDENCE, validateEvidenceConsistency } from '../src/data/anatomyEvidence.js';
import { ABSENT_STRUCTURES } from '../src/data/absentStructures.js';
import { TEACHING_OVERLAY_SPEC } from '../src/data/teachingOverlaySpec.js';

const errors = validateEvidenceConsistency(anatomyRegistry, TEACHING_OVERLAY_SPEC);

// Every absent-structure record must disclose why it is absent; registry
// entries that reference absent structures must resolve to that ledger.
Object.values(ABSENT_STRUCTURES).forEach((record) => {
  if (!record.reason || !record.disclosure) errors.push(`${record.id}: absent structure needs reason and disclosure`);
});
Object.values(anatomyRegistry).forEach((item) => {
  (item.absentStructures || []).forEach((id) => {
    if (!ABSENT_STRUCTURES[id]) errors.push(`${item.id}: references unknown absent structure ${id}`);
  });
});

assert.deepEqual(errors, [], `Anatomy evidence contract errors: ${errors.join('; ')}`);

const rows = Object.values(ANATOMY_EVIDENCE).map((record) => `| ${record.id} | ${record.claimType} | ${record.source.dataset} | ${record.source.license} | ${record.scientificReview} | ${record.visualReview} |`);
const report = [
  '# Anatomy evidence ledger',
  '',
  'Status: **SOURCE-CITED · HUMAN VISUAL REVIEW STILL PENDING**',
  '',
  'Every visual teaching claim in the registry and teaching routes resolves to one of these evidence records. An automated check can confirm a citation exists; only a named human reviewer can move a record to `approved`.',
  '',
  '| Evidence id | Claim type | Dataset | License | Scientific review | Visual review |',
  '| --- | --- | --- | --- | --- | --- |',
  ...rows,
  '',
  `Absent structures recorded: ${Object.keys(ABSENT_STRUCTURES).length}`,
  ''
].join('\n');
fs.writeFileSync('docs/reports/ANATOMY_EVIDENCE_LEDGER.md', report);
console.log(`Anatomy evidence contract passed (${Object.keys(ANATOMY_EVIDENCE).length} records; ${Object.keys(ABSENT_STRUCTURES).length} absent structures)`);
