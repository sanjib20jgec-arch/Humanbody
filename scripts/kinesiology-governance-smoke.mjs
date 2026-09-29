import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (p) => fs.readFileSync(p, 'utf8');

// Phase 64: governance scaffolding must exist and stay honest.
const plan = read('docs/KINESIOLOGY_THEATER_PLAN.md');
for (const marker of ['Phase 64', 'Phase 72', 'G1', 'G4', 'CC0', 'EXCLUDED']) assert(plan.includes(marker), `plan missing ${marker}`);

const audit = read('docs/PROVENANCE_AUDIT_KINESIOLOGY.md');
for (const marker of ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'mocap.cs.cmu.edu', 'acknowledgment']) assert(audit.includes(marker), `audit missing ${marker}`);
assert(/no approvals yet/i.test(audit) || /pending/i.test(audit), 'audit must not contain fabricated approvals');

const inspection = read('docs/KINESIOLOGY_SCIENTIFIC_INSPECTION.md');
assert(inspection.includes('PENDING HUMAN REVIEW'), 'G1 inspection must be pending human review');
assert(inspection.includes('human-only'), 'G1 sign-off rule missing');

// Ledger: kinesiology candidates present, five gates each, none approved.
const ledger = JSON.parse(read('scripts/3d-source-candidates.json'));
const kine = ledger.candidates.filter((c) => c.moduleId === 'kinesiology');
assert(kine.length >= 3, 'expected >=3 kinesiology candidates');
for (const c of kine) {
  for (const gate of ledger.requiredGates) assert(c.reviews?.[gate]?.status === 'pending', `${c.candidateId}: ${gate} must be pending`);
  assert(c.status !== 'approved', `${c.candidateId} cannot be approved by automation`);
}

// Phase 65+: provenance sidecar must exist once assets land.
if (fs.existsSync('vendor/kinesiology/PROVENANCE.json')) {
  const prov = JSON.parse(read('vendor/kinesiology/PROVENANCE.json'));
  for (const entry of prov.files) {
    assert(entry.origin && entry.license && (entry.checksum || entry.sha256), 'provenance entries need origin, license, checksum');
  }
}

console.log('HBL kinesiology governance smoke check passed (' + kine.length + ' kinesiology candidates, all gates pending).');
