import { readFile, writeFile } from 'node:fs/promises';

const manifest = JSON.parse(await readFile('public/models/atlas.json', 'utf8'));
const moduleForSystem = {
  nervous: 'Brain & Nerves', sensory: 'Brain & Nerves', respiratory: 'Respiration',
  cardiac: 'Circulation', arterial: 'Circulation', venous: 'Circulation',
  digestive: 'Digestion', urinary: 'Excretion', reproductive: 'Reproduction',
  muscular: 'Tissues', connective: 'Tissues'
};
const bySystem = new Map();
const byChunkSystem = new Map();
for (const part of manifest.parts || []) {
  const current = bySystem.get(part.system) || { parts: 0, vertices: 0, indices: 0, chunks: new Set(), modules: new Set() };
  current.parts += 1;
  current.vertices += Number(part.vertexCount || 0);
  current.indices += Number(part.indexCount || 0);
  current.chunks.add(part.chunk);
  if (moduleForSystem[part.system]) current.modules.add(moduleForSystem[part.system]);
  bySystem.set(part.system, current);
  const groupKey = `${part.chunk}:${part.system}`;
  const group = byChunkSystem.get(groupKey) || { chunk: part.chunk, system: part.system, vertices: 0, indices: 0 };
  group.vertices += Number(part.vertexCount || 0);
  group.indices += Number(part.indexCount || 0);
  byChunkSystem.set(groupKey, group);
}
const format = (value) => value.toLocaleString('en-US');
const mb = (value) => `${(value / 1024 / 1024).toFixed(2)} MB`;
const compressedBytes = manifest.chunks.reduce((sum, chunk) => sum + Number(chunk.gzipBytes || 0), 0);
const rawBytes = manifest.chunks.reduce((sum, chunk) => sum + Number(chunk.bytes || 0), 0);
const runtimeIndexGroups = [...byChunkSystem.values()];
const sourceIndexBytes = runtimeIndexGroups.reduce((sum, group) => sum + group.indices * 4, 0);
const optimizedIndexBytes = runtimeIndexGroups.reduce((sum, group) => sum + group.indices * (group.vertices <= 65535 ? 2 : 4), 0);
const compactableGroups = runtimeIndexGroups.filter((group) => group.vertices <= 65535).length;
const wideGroups = runtimeIndexGroups.length - compactableGroups;
const runtimeIndexSavings = sourceIndexBytes - optimizedIndexBytes;
const structures = [
  ['Brain', /brain/i, 'nervous'],
  ['Heart', /heart|cardiac/i, 'cardiac'],
  ['Kidneys', /kidney|renal/i, 'urinary'],
  ['Lungs', /lung/i, 'respiratory'],
  ['Bronchial tree', /bronchial|bronchus/i, 'respiratory'],
  ['Liver', /liver|hepatic/i, 'digestive'],
  ['Spinal cord', /spinal cord|spinal/i, 'nervous'],
  ['Aorta', /aorta/i, 'arterial']
];
const structureRows = structures.map(([label, pattern, expectedSystem]) => {
  const matches = (manifest.parts || []).filter((part) => pattern.test(`${part.name} ${part.system}`));
  const systems = [...new Set(matches.map((part) => part.system))];
  const chunks = [...new Set(matches.map((part) => part.chunk))].sort((a, b) => a - b);
  const systemOkay = systems.includes(expectedSystem);
  return `| ${label} | ${matches.length ? 'Present' : 'Missing'} | ${systemOkay ? 'Expected' : systems.join(', ') || '—'} | ${chunks.join(', ') || '—'} |`;
});
const systemRows = [...bySystem.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([system, value]) => `| ${system} | ${moduleForSystem[system] || 'Atlas reference'} | ${format(value.parts)} | ${format(value.vertices)} | ${format(Math.floor(value.indices / 3))} | ${[...value.chunks].sort((a, b) => a - b).join(', ')} |`);
const chunkRows = manifest.chunks.map((chunk, index) => {
  const systems = manifest.indexes?.chunkToSystems?.[index] || [];
  const modules = manifest.indexes?.chunkToLearningModules?.[index] || [];
  const structuresInChunk = manifest.indexes?.chunkToStructures?.[index]?.length || 0;
  return `| ${index} | ${mb(chunk.bytes || 0)} | ${mb(chunk.gzipBytes || 0)} | ${structuresInChunk} | ${systems.join(', ') || '—'} | ${modules.join(', ') || '—'} |`;
});
const runtimeIndexRows = manifest.chunks.map((_, index) => {
  const groups = runtimeIndexGroups.filter((group) => group.chunk === index);
  const before = groups.reduce((sum, group) => sum + group.indices * 4, 0);
  const after = groups.reduce((sum, group) => sum + group.indices * (group.vertices <= 65535 ? 2 : 4), 0);
  const compactable = groups.filter((group) => group.vertices <= 65535).length;
  return `| ${index} | ${groups.length} | ${compactable} | ${groups.length - compactable} | ${mb(before)} | ${mb(after)} | ${mb(before - after)} |`;
});
const report = `# BodyParts3D Atlas QA and Performance Report

Generated: ${new Date().toISOString().slice(0, 10)}  
Manifest: ${manifest.version}  
Scope: ${manifest.scope}  
License: CC BY 4.0; see \`public/ATTRIBUTION-BodyParts3D.md\`.

## Executive summary

- **Source meshes:** ${format(manifest.parts.length)}
- **Source triangles declared by manifest:** ${format(manifest.sourceTriangles || 0)}
- **Geometry chunks:** ${manifest.chunks.length}
- **Raw geometry transfer:** ${mb(rawBytes)}
- **Compressed geometry transfer:** ${mb(compressedBytes)}
- **Compression ratio:** ${(rawBytes / compressedBytes).toFixed(2)}×
- **Reference scope:** adult-male educational anatomy, not a diagnostic or surgical model

The atlas starts with the indexed skeletal chunk and requests other chunks only after an explicit system/search action. This report is a manifest and transfer QA report; it does not replace browser-level visual, spatial, or clinical-content review.

## Landmark structure presence

| Landmark | Manifest match | Expected system | Startup chunk(s) |
|---|---|---|---|
${structureRows.join('\n')}

## System coverage

| System | Learning module | Parts | Vertices | Approx. triangles | Chunks |
|---|---|---:|---:|---:|---|
${systemRows.join('\n')}

## Chunk index and transfer budget

| Chunk | Raw | Gzip | Indexed structures | Systems | Learning modules |
|---:|---:|---:|---:|---|---|
${chunkRows.join('\n')}

## Runtime index-buffer estimate

The packed source format stores indices as 32-bit values. The renderer now compacts a merged chunk/system mesh to 16-bit indices only when the merged vertex count is at most 65,535; wider merged meshes remain 32-bit. This is an estimated GPU index-buffer comparison, not a substitute for browser GPU profiling.

- **Merged chunk/system groups:** ${format(runtimeIndexGroups.length)}
- **16-bit eligible groups:** ${format(compactableGroups)}
- **32-bit groups retained:** ${format(wideGroups)}
- **32-bit baseline index memory:** ${mb(sourceIndexBytes)}
- **Estimated optimized index memory:** ${mb(optimizedIndexBytes)}
- **Estimated saving:** ${mb(runtimeIndexSavings)}

| Chunk | Merged groups | 16-bit eligible | 32-bit retained | Baseline index | Estimated optimized | Estimated saving |
|---:|---:|---:|---:|---:|---:|---:|
${runtimeIndexRows.join('\n')}

## QA interpretation

1. Landmark rows must remain present and mapped to the expected system before release.
2. A structure being present in the manifest does not prove its spatial orientation, relative size, or teaching label is correct; those require visual review against OpenStax Anatomy & Physiology 2e and the BodyParts3D source description.
3. Compression reduces transfer cost but does not prove acceptable frame time, draw-call count, GPU memory, or decompression latency.
4. Browser tests and real-device measurements remain required release gates.
5. The accessible 2D diagram is a complementary keyboard/touch route, not a replacement for the certified 3D atlas.
`;
await writeFile('docs/reports/ATLAS_QC_REPORT.md', report);
console.log(`Wrote ATLAS_QC_REPORT.md (${manifest.parts.length} parts, ${manifest.chunks.length} chunks).`);
