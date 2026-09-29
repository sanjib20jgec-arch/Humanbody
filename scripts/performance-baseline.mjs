import { readFile, readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';

const manifest = JSON.parse(await readFile('public/models/atlas.json', 'utf8'));
const budgets = JSON.parse(await readFile('scripts/performance-budgets.json', 'utf8'));
// Static budgets are identical across tiers today; the strictest tier applies.
const budget = budgets.tiers.desktop;
const totalCompressed = manifest.chunks.reduce((sum, chunk) => sum + Number(chunk.gzipBytes || 0), 0);
const largestChunk = Math.max(...manifest.chunks.map((chunk) => Number(chunk.gzipBytes || 0)));
const failures = [];
const check = (name, condition) => { if (!condition) failures.push(name); };
check(`atlas compressed budget is below ${budget.atlasCompressedMB} MB`, totalCompressed <= budget.atlasCompressedMB * 1024 * 1024);
check(`no individual atlas chunk exceeds ${budget.largestChunkMB} MB compressed`, largestChunk <= budget.largestChunkMB * 1024 * 1024);

let productionAssets = [];
try {
  productionAssets = await Promise.all((await readdir('dist/assets')).map(async (name) => ({ name, bytes: (await stat(join('dist/assets', name))).size })));
} catch { /* build:performance can be run before a build */ }
const three = productionAssets.find((asset) => /^three\.module-.*\.js$/.test(asset.name));
const atlas = productionAssets.find((asset) => /^BodyMap3DAtlas-.*\.js$/.test(asset.name));
if (three) check(`lazy Three.js vendor chunk is below ${budget.threeVendorKB} kB minified`, three.bytes <= budget.threeVendorKB * 1024);
if (atlas) check(`lazy atlas module is below ${budget.atlasModuleKB} kB minified`, atlas.bytes <= budget.atlasModuleKB * 1024);

console.log(JSON.stringify({
  atlas: { chunks: manifest.chunks.length, compressedBytes: totalCompressed, compressedMB: Math.round(totalCompressed / 1024 / 1024 * 10) / 10, largestChunkBytes: largestChunk },
  production: { threeVendorBytes: three?.bytes || null, atlasModuleBytes: atlas?.bytes || null },
  tiers: Object.fromEntries(Object.entries(budgets.tiers).map(([tier, spec]) => [tier, { maxDrawCalls: spec.maxDrawCalls, frameMsP95: spec.frameMsP95, decodedMemoryMB: spec.decodedMemoryMB }]))
}, null, 2));
if (failures.length) {
  console.error(`Performance baseline failed: ${failures.join(', ')}`);
  process.exitCode = 1;
}
