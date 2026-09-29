import assert from 'node:assert/strict';
import fs from 'node:fs';

const manifest = JSON.parse(fs.readFileSync('public/models/atlas.json', 'utf8'));
const required = {
  Circulation: [
    'superior vena cava', 'cavity of right atrium', 'cavity of right ventricle', 'pulmonary trunk',
    'pulmonary vein', 'cavity of left atrium', 'cavity of left ventricle', 'ascending aorta',
    'mitral valve', 'tricuspid valve', 'aortic valve', 'pulmonary valve'
  ],
  Digestion: ['esophagus', 'stomach', 'duodenum', 'colon']
};

const parts = manifest.parts || [];
const normalize = (value) => String(value || '').toLowerCase();
const findPart = (query) => parts.find((part) => [part.name, part.id, part.conceptId, part.system].some((value) => normalize(value).includes(normalize(query))));
const rows = [];
const missing = [];
const invalidBounds = [];

Object.entries(required).forEach(([route, queries]) => queries.forEach((query) => {
  const part = findPart(query);
  const bounds = part?.bounds;
  const valid = Array.isArray(bounds) && bounds.length === 2 && bounds.every((corner) => Array.isArray(corner) && corner.length === 3 && corner.every(Number.isFinite));
  const extent = valid ? bounds[1].map((value, index) => Math.abs(value - bounds[0][index])) : [];
  const nonZero = extent.some((value) => value > 0);
  if (!part) missing.push(`${route}: ${query}`);
  if (part && (!valid || !nonZero)) invalidBounds.push(`${route}: ${query}`);
  rows.push({ route, query, resolved: part?.name || 'MISSING', bounds: valid && nonZero ? 'valid' : 'invalid' });
}));

assert.deepEqual(missing, [], `Teaching overlay queries missing from atlas: ${missing.join('; ')}`);
assert.deepEqual(invalidBounds, [], `Teaching overlay bounds invalid: ${invalidBounds.join('; ')}`);

const report = [
  '# Teaching overlay QC report',
  '',
  'Generated from `public/models/atlas.json` by `scripts/teaching-overlay-qc.mjs`.',
  '',
  '| Route | Query | Resolved atlas part | Bounds |',
  '| --- | --- | --- | --- |',
  ...rows.map((row) => `| ${row.route} | ${row.query} | ${row.resolved} | ${row.bounds} |`),
  '',
  'This check verifies source-bound availability only. It does not replace expert visual review of orientation, occlusion, color contrast, or marker placement.',
  ''
].join('\n');
fs.writeFileSync('docs/reports/TEACHING_OVERLAY_QC_REPORT.md', report);
console.log(`Teaching overlay QC passed (${rows.length} source anchors)`);
