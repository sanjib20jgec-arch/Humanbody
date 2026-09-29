import assert from 'node:assert/strict';
import fs from 'node:fs';

const status = JSON.parse(fs.readFileSync('scripts/learning-validation-status.json', 'utf8'));
assert.ok(['planned', 'in-progress', 'reported'].includes(status.status), 'learning validation status must be planned, in-progress, or reported');
assert.ok(fs.existsSync(status.plan), 'learning validation plan file must exist');

const report = [
  '# Learning validation report',
  '',
  `Status: **${status.status.toUpperCase()}**`,
  `Last updated: ${status.updated}`,
  '',
  status.note,
  '',
  `Pre-registered plan: \`${status.plan}\``,
  '',
  status.studies.length ? '## Studies' : '## Studies',
  '',
  status.studies.length
    ? status.studies.map((study) => `- ${study.id}: ${study.summary}`).join('\n')
    : 'No studies recorded yet. No educational-benefit claim may be made for this build.',
  ''
].join('\n');
fs.writeFileSync('docs/reports/LEARNING_VALIDATION_REPORT.md', report);
console.log(`Learning validation report generated (status: ${status.status}; ${status.studies.length} studies)`);
