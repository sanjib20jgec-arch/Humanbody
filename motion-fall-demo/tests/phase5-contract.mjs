import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import fs from 'node:fs';

const app = await readFile(new URL('../app.js', import.meta.url), 'utf8');
const sw = await readFile(new URL('../sw.js', import.meta.url), 'utf8');
const manifest = JSON.parse(await readFile(new URL('../manifest.json', import.meta.url), 'utf8'));
const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const server = await readFile(new URL('../tools/serve.mjs', import.meta.url), 'utf8');

for (const file of ['icon-192.png', 'icon-512.png']) assert.ok(fs.statSync(new URL(`../${file}`, import.meta.url)).size > 0, `Missing raster icon: ${file}`);
assert.equal(manifest.display, 'standalone');
assert.equal(manifest.scope, './');
assert.ok(manifest.icons.some(icon => icon.src.endsWith('icon-192.png') && icon.type === 'image/png'));
assert.ok(manifest.icons.some(icon => icon.src.endsWith('icon-512.png') && icon.type === 'image/png'));
assert.match(sw, /CACHE_VERSION = 'motion-fall-v5'/);
assert.match(sw, /icon-192\.png/);
assert.match(sw, /icon-512\.png/);
assert.match(sw, /SKIP_WAITING/);
assert.match(sw, /cacheVersion/);
assert.match(sw, /cached/);
assert.match(sw, /complete/);
assert.match(sw, /self\.clients\.claim/);
assert.match(app, /update-banner/);
assert.match(app, /registration\.waiting/);
assert.match(app, /SKIP_WAITING/);
assert.match(app, /controllerchange/);
assert.match(html, /id=["']update-banner["']/);
assert.match(html, /id=["']update-reload["']/);
assert.match(server, /Content-Security-Policy/);
assert.match(server, /Referrer-Policy/);
assert.match(server, /X-Content-Type-Options/);

console.log('Phase 5 PWA/deployment contract passed');
