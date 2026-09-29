import { readFile, writeFile } from 'node:fs/promises';
import { gunzip as gunzipCallback } from 'node:zlib';
import { promisify } from 'node:util';

const gunzip = promisify(gunzipCallback);
const manifest = JSON.parse(await readFile('public/models/atlas.json', 'utf8'));
const failures = [];
const chunks = [];
const check = (condition, message) => { if (!condition) failures.push(message); };
const format = (value) => value.toLocaleString('en-US');

for (let chunkIndex = 0; chunkIndex < manifest.chunks.length; chunkIndex += 1) {
  const chunk = manifest.chunks[chunkIndex];
  const gzipPath = `public${chunk.gzip}`;
  const compressed = await readFile(gzipPath);
  const inflatedBuffer = await gunzip(compressed);
  const raw = inflatedBuffer.buffer.slice(inflatedBuffer.byteOffset, inflatedBuffer.byteOffset + inflatedBuffer.byteLength);
  const parts = manifest.parts.filter((part) => part.chunk === chunkIndex);
  let maxIndex = 0;
  let invalidIndices = 0;
  let invalidRanges = 0;

  check(compressed.byteLength === Number(chunk.gzipBytes), `chunk ${chunkIndex} gzip byte count differs from manifest`);
  check(raw.byteLength === Number(chunk.bytes), `chunk ${chunkIndex} raw byte count differs from manifest`);

  for (const part of parts) {
    const positionEnd = Number(part.positions) + Number(part.vertexCount) * 12;
    const normalEnd = Number(part.normals) + Number(part.vertexCount) * 6;
    const indexEnd = Number(part.indices) + Number(part.indexCount) * 4;
    const rangesOkay = Number(part.positions) >= 0 && Number(part.normals) >= 0 && Number(part.indices) >= 0
      && positionEnd <= raw.byteLength && normalEnd <= raw.byteLength && indexEnd <= raw.byteLength;
    const aligned = Number(part.positions) % 4 === 0 && Number(part.normals) % 2 === 0 && Number(part.indices) % 4 === 0;
    if (!rangesOkay || !aligned) invalidRanges += 1;
    if (!rangesOkay || !aligned) continue;

    const indices = new Uint32Array(raw, Number(part.indices), Number(part.indexCount));
    for (const index of indices) {
      maxIndex = Math.max(maxIndex, index);
      if (index >= Number(part.vertexCount)) invalidIndices += 1;
    }
  }

  check(invalidRanges === 0, `chunk ${chunkIndex} contains out-of-range or misaligned attribute spans`);
  check(invalidIndices === 0, `chunk ${chunkIndex} contains an index outside its source part vertex range`);
  chunks.push({
    index: chunkIndex,
    parts: parts.length,
    compressedBytes: compressed.byteLength,
    rawBytes: raw.byteLength,
    maxIndex,
    invalidRanges,
    invalidIndices
  });
}

const report = `# Atlas binary QC report

Generated: ${new Date().toISOString().slice(0, 10)}  
Manifest: ${manifest.version}  
Scope: all ${manifest.chunks.length} compressed geometry chunks and ${manifest.parts.length} source parts

## Validation performed

- Compressed byte size matches the manifest for every chunk.
- Gzip inflation succeeds for every chunk.
- Position, normal, and index spans remain within the inflated chunk buffer.
- Attribute offsets satisfy their typed-array alignment requirements.
- Every packed uint32 index is smaller than its source part vertex count.

## Results

| Chunk | Parts | Compressed | Raw | Maximum source index | Invalid spans | Invalid indices |
|---:|---:|---:|---:|---:|---:|---:|
${chunks.map((chunk) => `| ${chunk.index} | ${format(chunk.parts)} | ${format(chunk.compressedBytes)} | ${format(chunk.rawBytes)} | ${format(chunk.maxIndex)} | ${chunk.invalidRanges} | ${chunk.invalidIndices} |`).join('\n')}

All values in this report are binary-layout checks. They do not establish anatomical orientation, visual correctness, clinical validity, or acceptable GPU frame time.
`;
await writeFile('docs/reports/ATLAS_BINARY_QC_REPORT.md', report);

if (failures.length) {
  console.error(`Atlas binary QC failed: ${failures.join('; ')}`);
  process.exitCode = 1;
} else {
  console.log(`Atlas binary QC passed (${manifest.chunks.length} chunks, ${manifest.parts.length} parts).`);
}
