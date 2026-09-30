// Theater-only single-file build: like generate-offline.mjs, but WITHOUT the
// embedded anatomy-atlas chunks (~44 MB of base64). The Movement Theater uses
// the procedural performance rig and never touches atlas chunks, so this
// artifact stays small (~3 MB) — small enough to persist across sandbox
// resets and download instantly. Anatomy explorer views show empty in it.
import { existsSync } from 'node:fs';
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';

const root = process.cwd();
const offlineDist = resolve(root, 'dist-offline');
const productionDist = resolve(root, 'dist');
const distRoot = existsSync(offlineDist) ? offlineDist : productionDist;
const dist = await readFile(resolve(distRoot, 'index.html'), 'utf8');
const assetDir = resolve(distRoot, 'assets');
const assets = await readdir(assetDir);
const jsName = assets.find((name) => /^index-.*\.js$/.test(name));
const cssName = assets.find((name) => /^index-.*\.css$/.test(name));
if (!jsName || !cssName) throw new Error('Built Vite assets were not found. Run npm run build:offline first.');

const js = (await readFile(join(assetDir, jsName), 'utf8')).replaceAll('/models/atlas.json', '').replaceAll('</script>', '<\\/script>');
const css = await readFile(join(assetDir, cssName), 'utf8');
const atlas = JSON.parse(await readFile(resolve(root, 'public/models/atlas.json'), 'utf8'));
atlas.chunks = []; // theater-only: no anatomy mesh data

const manifest = JSON.stringify(atlas);
const lazyLoader = `<script>window.__HBL_ATLAS_LAZY__={manifest:${manifest},getChunk:function(index){return Promise.resolve("");}};</script>\n`;

let html = dist
  .replace(new RegExp(`\\s*<script type="module" crossorigin src="/assets/${jsName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"></script>`), '')
  .replace(new RegExp(`\\s*<link rel="stylesheet" crossorigin href="/assets/${cssName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}">`), '')
  .replace(/\s*<link rel="manifest" href="\/manifest\.webmanifest"\s*\/>/, '')
  .replace('</head>', () => `<style>\n${css}\n</style>\n  </head>`)
  .replace('  </body>', () => `${lazyLoader}    <script type="module">\n${js}\n    </script>\n  </body>`);

await writeFile(resolve(root, 'movement-theater.html'), html);
console.log(`Generated movement-theater.html (${html.length.toLocaleString()} bytes)`);
