import { readFile, writeFile } from 'node:fs/promises';

const manifest = JSON.parse(await readFile('public/models/atlas.json', 'utf8'));
const parts = manifest.parts || [];
const nervous = parts.filter((part) => part.system === 'nervous');
const failures = [];
const warnings = [];
const check = (name, condition) => { if (!condition) failures.push(name); };
const matchParts = (pattern) => nervous.filter((part) => pattern.test(part.name || ''));
const boundsFor = (items) => {
  if (!items.length) return null;
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];
  for (const part of items) {
    for (let axis = 0; axis < 3; axis += 1) {
      min[axis] = Math.min(min[axis], Number(part.bounds?.[0]?.[axis]));
      max[axis] = Math.max(max[axis], Number(part.bounds?.[1]?.[axis]));
    }
  }
  return { min, max };
};
const format = (value) => Number(value).toFixed(4);

const landmarks = [
  { label: 'Cerebral hemispheres', pattern: /white matter of (left|right) cerebral hemisphere/i, minimum: 2, chunks: [6] },
  { label: 'Cerebellum', pattern: /^Cerebellum$/i, minimum: 2, chunks: [6] },
  { label: 'Brainstem components', pattern: /^(Medulla oblongata|Pons|Midbrain)$/i, minimum: 6, chunks: [6] },
  { label: 'Corpus callosum', pattern: /^Corpus callosum$/i, minimum: 1, chunks: [5] },
  { label: 'Optic nerves / pathways', pattern: /^(Left|Right) optic (nerve|tract)$/i, minimum: 4, chunks: [6] },
  { label: 'Thalamus', pattern: /^(Left|Right) thalamus$/i, minimum: 2, chunks: [6] },
  { label: 'Hypothalamus', pattern: /^Hypothalamus$/i, minimum: 2, chunks: [6] },
  { label: 'Spinal-cord central canal', pattern: /^Central canal of spinal cord$/i, minimum: 1, chunks: [5] }
];

const rows = landmarks.map((landmark) => {
  const matches = matchParts(landmark.pattern);
  const chunks = [...new Set(matches.map((part) => part.chunk))].sort((a, b) => a - b);
  const systems = [...new Set(matches.map((part) => part.system))];
  const expectedChunkSet = landmark.chunks.every((chunk) => chunks.includes(chunk));
  const okay = matches.length >= landmark.minimum && systems.length === 1 && systems[0] === 'nervous' && expectedChunkSet;
  check(`${landmark.label} manifest coverage`, okay);
  return {
    ...landmark,
    matches,
    chunks,
    systems,
    okay
  };
});

const leftHemisphere = matchParts(/white matter of left cerebral hemisphere/i);
const rightHemisphere = matchParts(/white matter of right cerebral hemisphere/i);
const cerebellum = matchParts(/^Cerebellum$/i);
const brainstem = matchParts(/^(Medulla oblongata|Pons|Midbrain)$/i);
const cerebralBounds = boundsFor([...leftHemisphere, ...rightHemisphere]);
const cerebellarBounds = boundsFor(cerebellum);
const brainstemBounds = boundsFor(brainstem);
check('left and right cerebral hemispheres are both represented', leftHemisphere.length > 0 && rightHemisphere.length > 0);
check('cerebral hemisphere bounds are valid', Boolean(cerebralBounds) && cerebralBounds.min.every(Number.isFinite) && cerebralBounds.max.every(Number.isFinite));
check('cerebellum is inferior to the cerebral hemisphere envelope', Boolean(cerebralBounds && cerebellarBounds) && cerebellarBounds.min[1] < cerebralBounds.max[1]);
check('brainstem is present in the lower brain envelope', Boolean(brainstemBounds && cerebellarBounds) && brainstemBounds.min[1] < cerebralBounds.max[1]);

const actualSpinalCord = nervous.filter((part) => /spinal cord/i.test(part.name || '') && !/^Central canal of spinal cord$/i.test(part.name || ''));
if (!actualSpinalCord.length) warnings.push('No spinal-cord parenchyma mesh is present; only the central canal is mapped in the certified nervous-system chunk. Keep the spinal-cord pathway visual explicitly labeled as a simplified teaching model.');

const reportRows = rows.map((row) => `| ${row.label} | ${row.matches.length ? 'Present' : 'Missing'} | ${row.matches.length} | ${row.chunks.join(', ') || '—'} | ${row.okay ? 'Pass' : 'Review'} |`);
const report = `# Brain & Nerves Atlas QC Report

Generated: ${new Date().toISOString().slice(0, 10)}  
Manifest: ${manifest.version}  
Scope: nervous-system structures in the BodyParts3D adult-male educational reference  
Evidence reference: https://openstax.org/books/anatomy-and-physiology-2e/pages/12-1-basic-structure-and-function-of-the-nervous-system

## Scope and limitation

This is a manifest, naming, chunk, and bounding-envelope review. It does not replace structure-by-structure browser screenshots or expert spatial review. The Brain & Nerves bay remains a simplified teaching model; the certified atlas is not a clinical scan.

## Landmark coverage

| Landmark | Manifest status | Matching parts | Chunk(s) | QC |
|---|---|---:|---|---|
${reportRows.join('\n')}

## Envelope checks

- **Cerebral hemisphere envelope:** ${cerebralBounds ? `${format(cerebralBounds.min[1])}–${format(cerebralBounds.max[1])} on the vertical axis` : 'not available'}
- **Cerebellum envelope:** ${cerebellarBounds ? `${format(cerebellarBounds.min[1])}–${format(cerebellarBounds.max[1])} on the vertical axis` : 'not available'}
- **Brainstem envelope:** ${brainstemBounds ? `${format(brainstemBounds.min[1])}–${format(brainstemBounds.max[1])} on the vertical axis` : 'not available'}
- Left/right hemisphere presence: ${leftHemisphere.length > 0 && rightHemisphere.length > 0 ? 'confirmed' : 'review required'}
- Relative envelope ordering: ${cerebralBounds && cerebellarBounds && cerebellarBounds.min[1] < cerebralBounds.max[1] ? 'passes basic inferior relationship check' : 'review required'}

## Findings

${warnings.length ? warnings.map((warning) => `- **Warning:** ${warning}`).join('\n') : '- No manifest limitations detected for the checked landmarks.'}

## Release interpretation

1. The manifest contains the major Brain & Nerves landmarks used by the learning route, but visual orientation, relative size, and label placement still require browser review.
2. The atlas route must not imply that a complete spinal-cord mesh exists when the manifest only provides the central canal.
3. The simplified reflex-arc diagram is complementary teaching content and should remain labeled as simplified rather than presented as a direct atlas render.
`;
await writeFile('docs/reports/BRAIN_NERVES_QC_REPORT.md', report);

if (failures.length) {
  console.error(`Brain & Nerves QC failed: ${failures.join(', ')}`);
  process.exitCode = 1;
} else {
  console.log(`Brain & Nerves QC passed (${nervous.length} nervous-system parts checked).`);
  for (const warning of warnings) console.warn(`Brain & Nerves QC note: ${warning}`);
}
