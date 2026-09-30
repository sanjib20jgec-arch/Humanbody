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

// Phase 119 (R11): ES5-only shim so the artifact also boots on old Android
// Chrome / WebViews (runtime APIs the transpile target cannot rewrite).
const legacyShim = `<script>(function(){
if(!window.globalThis){window.globalThis=window;}
if(!Array.prototype.at){Array.prototype.at=function(n){n=Math.trunc(n)||0;if(n<0){n+=this.length;}return(n>=0&&n<this.length)?this[n]:undefined;};}
if(!Array.prototype.findLast){Array.prototype.findLast=function(f,t){for(var i=this.length-1;i>=0;i--){if(f.call(t,this[i],i,this)){return this[i];}}};}
if(!Object.fromEntries){Object.fromEntries=function(p){var o={};for(var i=0;i<p.length;i++){o[p[i][0]]=p[i][1];}return o;};}
if(!Object.hasOwn){Object.hasOwn=function(o,p){return Object.prototype.hasOwnProperty.call(o,p);};}
if(!String.prototype.replaceAll){String.prototype.replaceAll=function(s,r){return this.split(s).join(r);};}
if(typeof window.structuredClone!=='function'){window.structuredClone=function(v){return JSON.parse(JSON.stringify(v));};}
})();</script>\n`;

// Phase 119 (R11): boot watchdog — if the module bundle dies (browser too
// old), say so instead of leaving a dead page that ignores touch.
const bootWatchdog = `<div id="hbl-boot-note" style="display:none;position:fixed;left:12px;right:12px;bottom:12px;z-index:999;padding:12px 14px;border:1px solid #f0b429;border-radius:10px;background:#1a1206;color:#ffe0b3;font:13px/1.5 sans-serif">This browser could not start the app — it is probably too old for this file. Open it in the latest Google Chrome (long-press the file → Open with → Chrome).</div>
<script>setTimeout(function(){if(!window.__HBL_BOOTED__){var d=document.getElementById('hbl-boot-note');if(d){d.style.display='block';}}},7000);</script>\n`;

let html = dist
  .replace(new RegExp(`\\s*<script type="module" crossorigin src="/assets/${jsName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"></script>`), '')
  .replace(new RegExp(`\\s*<link rel="stylesheet" crossorigin href="/assets/${cssName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}">`), '')
  .replace(/\s*<link rel="manifest" href="\/manifest\.webmanifest"\s*\/>/, '')
  .replace('</head>', () => `<style>\n${css}\n</style>\n  </head>`)
  .replace('  </body>', () => `${lazyLoader}${legacyShim}${bootWatchdog}    <script type="module">\n${js}\n    </script>\n  </body>`);

await writeFile(resolve(root, 'movement-theater.html'), html);
console.log(`Generated movement-theater.html (${html.length.toLocaleString()} bytes)`);
