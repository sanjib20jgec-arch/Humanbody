import assert from 'node:assert/strict';
import fs from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runDOMContract } from './dom-contract.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = relative => readFile(path.join(root, relative), 'utf8');
const requiredFiles = [
  'index.html', 'style.css', 'app.js', 'manifest.json', 'sw.js', 'icon-192.png', 'icon-512.png', 'vendor/README.txt', 'assets/README.txt',
  'vendor/three.module.js', 'vendor/three.core.js', 'vendor/cannon-es.js', 'vendor/OrbitControls.js',
  'vendor/RoomEnvironment.js', 'vendor/RGBELoader.js', 'vendor/HDRLoader.js', 'vendor/GLTFLoader.js',
  'vendor/utils/BufferGeometryUtils.js', 'vendor/utils/SkeletonUtils.js'
];

function assertFile(relative) {
  const absolute = path.join(root, relative);
  assert.ok(fs.existsSync(absolute), `Missing required file: ${relative}`);
  assert.ok(fs.statSync(absolute).size > 0, `Empty required file: ${relative}`);
}

function relativeImports(source, file) {
  const imports = [];
  const pattern = /(?:from|import\s*\()\s*["']([^"']+)["']/g;
  for (const match of source.matchAll(pattern)) {
    if (match[1].startsWith('.')) imports.push({ source: match[1], file });
  }
  return imports;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const html = await read('index.html');
const app = await read('app.js');
const sw = await read('sw.js');
const manifest = JSON.parse(await read('manifest.json'));

for (const file of requiredFiles) assertFile(file);
const dom = runDOMContract(html);
assert.equal(manifest.display, 'standalone');
assert.equal(manifest.start_url, './');
assert.ok(Array.isArray(manifest.icons) && manifest.icons.length >= 2, 'PWA icons are incomplete');
assert.match(app, /THREE\.WebGLRenderer/);
assert.match(app, /THREE\.Scene/);
assert.match(app, /THREE\.PerspectiveCamera/);
assert.match(app, /ConeTwistConstraint/);
assert.match(app, /calculateXCOM/);
assert.match(app, /serviceWorker/);
assert.match(sw, /skipWaiting/);
assert.match(sw, /clients\.claim/);
assert.match(sw, /CACHE_VERSION/);
for (const file of requiredFiles.filter(file => file.startsWith('vendor/'))) {
  assert.match(sw, new RegExp(`\\./${escapeRegExp(file)}`), `Vendor file is not precached: ${file}`);
}
for (const file of ['index.html', 'style.css', 'app.js', 'manifest.json', 'icon-192.png', 'icon-512.png', 'icon-192.svg', 'icon-512.svg', 'assets/README.txt']) {
  assert.match(sw, new RegExp(`\\./${escapeRegExp(file)}`), `App-shell file is not precached: ${file}`);
}
const jsFiles = ['app.js', ...requiredFiles.filter(file => file.endsWith('.js'))];
for (const file of jsFiles) {
  const source = await read(file);
  for (const { source: specifier } of relativeImports(source, file)) {
    assert.ok(fs.existsSync(path.resolve(root, path.dirname(file), specifier)), `Missing import ${specifier} from ${file}`);
  }
}
for (const file of ['index.html', 'style.css', 'app.js', 'sw.js']) {
  assert.doesNotMatch(await read(file), /https?:\/\//, `Runtime CDN reference found in ${file}`);
}

console.log('Phase 0 static smoke passed');
console.log(JSON.stringify({ requiredFiles: requiredFiles.length, ...dom }, null, 2));
