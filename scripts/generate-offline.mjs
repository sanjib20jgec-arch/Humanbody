import { existsSync } from 'node:fs';
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { basename, join, resolve } from 'node:path';

const root = process.cwd();
const offlineDist = resolve(root, 'dist-offline');
const productionDist = resolve(root, 'dist');
const distRoot = existsSync(offlineDist) ? offlineDist : productionDist;
const dist = await readFile(resolve(distRoot, 'index.html'), 'utf8');
const assetDir = resolve(distRoot, 'assets');
const assets = await readdir(assetDir);
const jsName = assets.find((name) => /^index-.*\.js$/.test(name));
const cssName = assets.find((name) => /^index-.*\.css$/.test(name));
if (!jsName || !cssName) throw new Error('Built Vite assets were not found. Run npm run build first.');

const js = (await readFile(join(assetDir, jsName), 'utf8')).replaceAll('/models/atlas.json', '').replaceAll('</script>', '<\\/script>');
const css = await readFile(join(assetDir, cssName), 'utf8');
const atlas = JSON.parse(await readFile(resolve(root, 'public/models/atlas.json'), 'utf8'));
const embeddedChunks = [];
for (const chunk of atlas.chunks) {
  const payload = await readFile(resolve(root, 'public/models', basename(chunk.gzip)));
  embeddedChunks.push(payload.toString('base64'));
  chunk.gzip = '';
  chunk.url = '';
}

const manifest = JSON.stringify(atlas);
const lazyLoader = `<script>window.__HBL_ATLAS_LAZY__={manifest:${manifest},getChunk:function(index){var node=document.getElementById("hbl-atlas-chunk-"+index);if(node)return node.textContent.trim();return new Promise(function(resolve){var ready=function(){var item=document.getElementById("hbl-atlas-chunk-"+index);resolve(item?item.textContent.trim():"");};if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",ready,{once:true});else ready();});}};</script>\n`;
const chunkTags = embeddedChunks.map((payload, index) => `<script id="hbl-atlas-chunk-${index}" type="application/octet-stream">${payload}</script>`).join('\n') + '\n';

let html = dist
  .replace(new RegExp(`\\s*<script type="module" crossorigin src="/assets/${jsName.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')}"></script>`), '')
  .replace(new RegExp(`\\s*<link rel="stylesheet" crossorigin href="/assets/${cssName.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')}">`), '')
  .replace(/\s*<link rel="manifest" href="\/manifest\.webmanifest"\s*\/>/, '')
  .replace('</head>', () => `<style>\n${css}\n</style>\n  </head>`)
  .replace('  </body>', () => `${lazyLoader}    <script type="module">\n${js}\n    </script>\n    ${chunkTags}  </body>`);

await writeFile(resolve(root, 'human-biology-lab-offline4.html'), html);
console.log(`Generated human-biology-lab-offline4.html (${html.length.toLocaleString()} bytes).`);
