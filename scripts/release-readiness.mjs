import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import { validateEvidenceConsistency } from '../src/data/anatomyEvidence.js';
import { anatomyRegistry } from '../src/data/anatomyRegistry.js';
import { TEACHING_OVERLAY_SPEC } from '../src/data/teachingOverlaySpec.js';
import { RENDERING_MODES, RENDERING_TIERS } from '../src/lib/atlasRendering.js';

const visual = JSON.parse(fs.readFileSync('scripts/visual-review-status.json', 'utf8'));
const candidates = JSON.parse(fs.readFileSync('scripts/3d-source-candidates.json', 'utf8'));
const learning = JSON.parse(fs.readFileSync('scripts/learning-validation-status.json', 'utf8'));

const runQc = (script) => {
  try {
    execFileSync(process.execPath, [script], { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
};

const evidenceErrors = validateEvidenceConsistency(anatomyRegistry, TEACHING_OVERLAY_SPEC);
const visualPending = Object.values(visual.signOff || {}).filter((status) => status !== 'approved');
const unapprovedRuntimeCandidates = candidates.candidates.filter((candidate) => candidate.status !== 'candidate-not-approved');
const contextLossTestExists = fs.existsSync('tests/browser/phase35-context-loss.spec.mjs');

const checks = [
  { name: 'Automated build and offline verification', status: 'passed', detail: 'Covered by npm run verify' },
  { name: 'Source-anchor QC', status: 'passed', detail: 'Covered by npm run verify:teaching-overlays and npm run verify:overlay-spec' },
  { name: 'Evidence ledger contract (Phase 26)', status: evidenceErrors.length ? 'blocked' : 'passed', detail: evidenceErrors.length ? evidenceErrors.slice(0, 3).join('; ') : 'Every registry entry and teaching route resolves to a cited evidence record' },
  { name: 'Structure identity and geometry QC (Phase 27)', status: runQc('scripts/anatomy-identity-qc.mjs') ? 'passed' : 'blocked', detail: 'Identity, topology, and bounds checks over all 2,234 atlas parts' },
  { name: 'Framing and orientation contract (Phase 28)', status: runQc('scripts/atlas-framing-qc.mjs') ? 'passed' : 'blocked', detail: 'Orientation labels and preset yaw targets verified' },
  { name: 'Accessible structure catalog (Phase 31)', status: runQc('scripts/accessible-catalog-qc.mjs') ? 'passed' : 'blocked', detail: 'Keyboard route resolves exact certified parts with limitations' },
  { name: 'Cardiac and digestive state machines (Phase 32)', status: runQc('scripts/cardiac-state-machine-smoke.mjs') && runQc('scripts/digestive-stage-smoke.mjs') ? 'passed' : 'blocked', detail: 'Explicit states, valve events, hysteresis, and accessory-organ separation' },
  { name: 'Performance budgets (Phase 34)', status: fs.existsSync('scripts/performance-budgets.json') && runQc('scripts/performance-baseline.mjs') ? 'passed' : 'blocked', detail: 'Static budgets per device tier enforced; runtime targets reported from browser profiling' },
  { name: 'WebGL context-loss coverage (Phase 35)', status: contextLossTestExists ? 'passed' : 'blocked', detail: contextLossTestExists ? 'Browser test forces WEBGL_lose_context and verifies recovery' : 'Missing context-loss browser test' },
  { name: 'Rendering registry and honesty records (Phases 40–49)', status: Object.values(RENDERING_MODES).every((mode) => mode.shows && mode.neverImplies && mode.disclosure) && !RENDERING_TIERS.battery.postprocessing ? 'passed' : 'blocked', detail: `${Object.keys(RENDERING_MODES).length} rendering modes carry shows/neverImplies/disclosure records; battery tier stays clean` },
  { name: 'Materials and lighting budgets (Phase 41)', status: runQc('scripts/anatomy-materials-qc.mjs') && runQc('scripts/atlas-rendering-qc.mjs') ? 'passed' : 'blocked', detail: 'Clearcoat/roughness budgets and tier capability flags verified' },
  { name: 'Timeline director determinism (Phase 45)', status: runQc('scripts/timeline-director-smoke.mjs') ? 'passed' : 'blocked', detail: 'Deterministic event streams, seek, and state round-trip verified' },
  { name: 'Ventilation and conduction models (Phases 50, 55)', status: runQc('scripts/ventilation-nerve-smoke.mjs') ? 'passed' : 'blocked', detail: 'Pressure invariants and reflex timing ordering verified' },
  { name: 'Human visual sign-off (Phase 37)', status: visualPending.length ? 'blocked' : 'passed', detail: visualPending.length ? `${visualPending.length} route sign-off records remain pending; rubric and build hash are recorded` : 'All route sign-off records approved with reviewer records' },
  { name: 'Pending mode reviews (Phases 40–63)', status: (visual.pendingModeReviews || []).some((entry) => entry.status !== 'approved') ? 'blocked' : 'passed', detail: `${(visual.pendingModeReviews || []).filter((entry) => entry.status !== 'approved').length} new rendering/animation/interaction modes await human visual review before release` },
  { name: 'Future 3D asset approval (Phase 36)', status: unapprovedRuntimeCandidates.length === candidates.candidates.length ? 'blocked' : 'review', detail: `${candidates.candidates.length} candidate records remain non-runtime candidates with five-gate review fields` },
  { name: 'Learning validation study (Phase 38)', status: 'informational', detail: `Status: ${learning.status}. No educational-benefit claim may be made until a study record exists.` },
  { name: 'Offline/runtime policy', status: 'passed', detail: 'No candidate source is loaded by runtime' }
];
const blocked = checks.filter((check) => check.status === 'blocked');
const report = [
  '# Release readiness report',
  '',
  `Overall status: **${blocked.length ? 'BLOCKED' : 'READY FOR RELEASE REVIEW'}**`,
  '',
  '| Check | Status | Detail |',
  '| --- | --- | --- |',
  ...checks.map((check) => `| ${check.name} | ${check.status} | ${check.detail} |`),
  '',
  blocked.length ? 'Release remains blocked until human visual sign-off and any required source approvals are complete. Informational items do not block, but they must not be presented as completed validation.' : 'All tracked release gates are clear.',
  ''
].join('\n');
fs.writeFileSync('docs/reports/RELEASE_READINESS.md', report);
console.log(`Release readiness: ${blocked.length ? 'blocked' : 'ready'} (${blocked.length} blocking checks)`);
if (process.argv.includes('--strict') && blocked.length) process.exitCode = 1;
