import assert from 'node:assert/strict';
import fs from 'node:fs';

const ledger = JSON.parse(fs.readFileSync('scripts/3d-source-candidates.json', 'utf8'));
const modules = ['cell', 'tissues', 'heredity', 'kinesiology'];
const errors = [];
for (const moduleId of modules) {
  const entries = ledger.candidates.filter((candidate) => candidate.moduleId === moduleId);
  if (!entries.length) errors.push(`${moduleId}: no candidate source recorded`);
  entries.forEach((candidate) => {
    if (!candidate.provider || !candidate.url || !candidate.fit) errors.push(`${moduleId}: incomplete ${candidate.provider} record`);
    if (candidate.status === 'approved' || candidate.decision === 'approved') errors.push(`${moduleId}: candidates cannot be approved by the intake report`);
    // Phase 36: every candidate carries the full five-gate review record.
    (ledger.requiredGates || []).forEach((gate) => {
      const review = candidate.reviews?.[gate];
      if (!review || !review.status || !review.note) errors.push(`${candidate.candidateId}: missing ${gate} review record`);
      else if (review.status === 'approved' && !review.reviewer) errors.push(`${candidate.candidateId}: ${gate} approval requires a named reviewer`);
    });
    if (!('entrySpecificId' in candidate)) errors.push(`${candidate.candidateId}: entrySpecificId field is required (null until a versioned entry is chosen)`);
  });
}
assert.deepEqual(errors, [], `3D source candidate ledger errors: ${errors.join('; ')}`);

const rows = ledger.candidates.map((candidate) => `| ${candidate.moduleId} | ${candidate.provider} | ${candidate.entrySpecificId || 'not selected'} | ${candidate.status} | ${Object.values(candidate.reviews).map((review) => review.status).join(' · ')} |`);
const report = [
  '# 3D source candidate ledger',
  '',
  'Status: **CANDIDATE INTAKE — NO RUNTIME ASSET APPROVED**',
  '',
  ledger.runtimePolicy,
  '',
  'Candidates are intentionally triaged by educational fit, licensing, and scientific review status. A candidate is not a source attribution, a validated mesh, or permission to ship an asset.',
  '',
  `Required gates per candidate: ${(ledger.requiredGates || []).join(', ')}`,
  '',
  '| Module | Provider | Entry-specific id | Status | Reviews (scientific · provenance · license · visual · offline) |',
  '| --- | --- | --- | --- | --- |',
  ...rows,
  '',
  '## Required approval steps',
  '',
  '- Identify a specific versioned model entry (`entrySpecificId`), not only a repository.',
  '- Confirm the entry license, attribution, download rights, and offline redistribution terms.',
  '- Check scientific provenance, scale, labels, topology, and educational scope with a named reviewer.',
  '- Convert or package locally only after approval; do not load a remote viewer or CDN asset at runtime.',
  '- Add source metadata, limitations, and a visual review matrix before exposing the model.',
  ''
].join('\n');
fs.writeFileSync('docs/reports/3D_SOURCE_CANDIDATE_LEDGER.md', report);
console.log(`3D source candidate ledger generated (${ledger.candidates.length} candidates; none approved)`);
