import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';

const status = JSON.parse(fs.readFileSync('scripts/visual-review-status.json', 'utf8'));
const expectedOrientations = ['anterior', 'lateral', 'posterior'];
const expectedViewports = ['desktop', 'phone'];
const expectedMotionModes = ['normal', 'reduced'];
const errors = [];
const cases = [];

assert.equal(status.version, 2);
assert.equal(status.routes.length, 2);

// Phase 37: the rubric is part of the contract. Every criterion must exist
// before a human can sign off, and reviewer records must carry the required
// fields when they are added.
if (!Array.isArray(status.rubric) || status.rubric.length < 8) errors.push('visual review rubric needs at least 8 criteria');
(status.rubric || []).forEach((item) => { if (!item.id || !item.criterion) errors.push('rubric items need id and criterion'); });
(status.reviewerRecords || []).forEach((record) => {
  (status.reviewerRecordSchema?.required || []).forEach((field) => {
    if (!record[field]) errors.push(`reviewer record missing ${field}`);
  });
  if (record.disposition && !status.reviewerRecordSchema?.dispositions?.includes(record.disposition)) errors.push(`unknown disposition ${record.disposition}`);
});

for (const route of status.routes) {
  if (!status.signOff?.[route.id]) errors.push(`${route.id}: missing sign-off status`);
  if (JSON.stringify(route.orientations) !== JSON.stringify(expectedOrientations)) errors.push(`${route.id}: orientation matrix is incomplete`);
  if (JSON.stringify(route.viewports) !== JSON.stringify(expectedViewports)) errors.push(`${route.id}: viewport matrix is incomplete`);
  if (JSON.stringify(route.motionModes) !== JSON.stringify(expectedMotionModes)) errors.push(`${route.id}: motion matrix is incomplete`);
  for (const orientation of route.orientations) for (const viewport of route.viewports) for (const motionMode of route.motionModes) {
    cases.push({ route: route.label, orientation, viewport, motionMode, status: status.signOff?.[route.id] || 'pending' });
  }
}
assert.deepEqual(errors, [], `Visual review matrix errors: ${errors.join('; ')}`);

// Phase 37: capture a build hash so a reviewer's sign-off is bound to the
// exact code and atlas they inspected.
const buildInputs = ['package.json', 'src/components/BodyMap3DAtlas.jsx', 'src/lib/AnatomySceneManager.js', 'src/data/teachingOverlaySpec.js', 'public/models/atlas.json'];
const buildHash = crypto.createHash('sha256');
buildInputs.forEach((file) => buildHash.update(fs.readFileSync(file)));
const hash = buildHash.digest('hex').slice(0, 12);

const pending = cases.filter((item) => item.status !== 'approved');
const lines = [
  '# Guided Path teaching-overlay visual review matrix',
  '',
  `Status: **${status.status.toUpperCase()}**`,
  `Reviewer: ${status.reviewer || 'not assigned'}`,
  `Last updated: ${status.updated}`,
  `Build hash at report time: \`${hash}\``,
  '',
  'This is a release-gating checklist, not an automated claim of expert approval. Update `scripts/visual-review-status.json` only after a human reviewer has inspected the rendered reference at the listed orientation, viewport, and motion mode. Each sign-off must add a reviewer record naming the reviewer, role, date, build hash, route, and disposition.',
  '',
  '## Review rubric',
  '',
  ...status.rubric.map((item) => `- [ ] **${item.id}** — ${item.criterion}`),
  '',
  '## Scope checklist',
  '',
  ...status.scope.map((item) => `- [ ] ${item}`),
  '',
  '## Matrix',
  '',
  '| Route | Orientation | Viewport | Motion | Status |',
  '| --- | --- | --- | --- | --- |',
  ...cases.map((item) => `| ${item.route} | ${item.orientation} | ${item.viewport} | ${item.motionMode} | ${item.status} |`),
  '',
  `Pending cases: **${pending.length}/${cases.length}**`,
  '',
  '## Approval rule',
  '',
  'A route may be changed from `pending` to `approved` only when all orientations, both viewport classes, both motion modes, marker occlusion, route alignment, contrast, and educational disclosures have been reviewed against the rubric above, and a reviewer record has been added. Automated checks can never set the approval field.',
  ''
];
fs.writeFileSync('docs/reports/VISUAL_REVIEW_MATRIX.md', lines.join('\n'));
console.log(`Visual review matrix generated (${cases.length} cases; ${pending.length} pending; build ${hash})`);
if (process.argv.includes('--strict') && pending.length) process.exitCode = 1;
