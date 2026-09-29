import { existsSync, readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const required = [
  'dist/index.html',
  'dist/assets',
  'public/manifest.webmanifest',
  'public/sw.js',
  'human-biology-lab-offline4.html',
  'public/models/atlas.json'
];
const missing = required.filter((file) => !existsSync(resolve(root, file)));
if (missing.length) throw new Error(`Missing release files: ${missing.join(', ')}`);

const distHtml = readFileSync(resolve(root, 'dist/index.html'), 'utf8');
const offline = readFileSync(resolve(root, 'human-biology-lab-offline4.html'), 'utf8');
const manifest = JSON.parse(readFileSync(resolve(root, 'public/manifest.webmanifest'), 'utf8'));
if (!manifest.name || manifest.display !== 'standalone') throw new Error('PWA manifest is incomplete.');
if (!distHtml.includes('manifest.webmanifest')) throw new Error('Production HTML is missing the PWA manifest link.');
if (!offline.includes('__HBL_ATLAS_LAZY__') || offline.includes('/assets/') || offline.includes('/src/')) throw new Error('Offline bundle is not self-contained.');
if (statSync(resolve(root, 'human-biology-lab-offline4.html')).size < 1_000_000) throw new Error('Offline bundle looks unexpectedly small.');
console.log('HBL release smoke check passed.');
