import { readFile } from 'node:fs/promises';

const [main, app, atlas, manager, download, performance, html] = await Promise.all([
  readFile('src/main.jsx', 'utf8'),
  readFile('src/App.jsx', 'utf8'),
  readFile('src/components/BodyMap3DAtlas.jsx', 'utf8'),
  readFile('src/lib/AnatomySceneManager.js', 'utf8'),
  readFile('src/lib/anatomyDownload.js', 'utf8'),
  readFile('src/lib/performance.js', 'utf8'),
  readFile('index.html', 'utf8')
]);
const failures = [];
const check = (name, condition) => { if (!condition) failures.push(name); };

check('shell performance mark exists', main.includes("performance.mark('hbl-shell-mounted')"));
check('skeletal readiness mark exists', atlas.includes("performance.mark('hbl-skeletal-ready')"));
check('full requested-atlas readiness mark exists', atlas.includes("performance.mark('hbl-atlas-full-ready')") && manager.includes('onFullReady'));
check('module fallback exists', app.includes('atlas-shell-loading'));
check('accessible 2D mode exists', atlas.includes('AccessibleAtlasMode') && atlas.includes('hbl-atlas-accessible'));
check('search can load unloaded structures', atlas.includes('searchAndLoad'));
check('demand-driven systems exist', atlas.includes('ensureSystems'));
check('manager consumes manifest demand indexes', manager.includes('atlasIndexes.systemToChunks') && manager.includes('chunkToStructures'));
check('explicit offline anatomy download exists', app.includes('Download for offline') && download.includes('downloadAnatomyForOffline') && download.includes('ATLAS_CACHE_NAME'));
check('privacy-neutral performance observer exists', app.includes('startPerformanceTelemetry') && performance.includes('largest-contentful-paint') && performance.includes('first-contentful-paint') && performance.includes('hbl-first-3d-ready'));
check('atlas decode and build profiling is local', atlas.includes('recordAtlasChunkProfile') && performance.includes('recordAtlasChunkProfile') && manager.includes('decodeMs') && manager.includes('buildMs'));
check('atlas chunk failures are locally observable', atlas.includes('recordAtlasChunkError') && performance.includes('recordAtlasChunkError'));
check('bootstrap fallback reports module failures', html.includes('showBootError') && html.includes('did not load within 8 seconds'));
check('manager binds pointer events before later chunks', manager.includes('// Bind once before later chunks arrive') && manager.includes('this.bindPointerEvents();'));
check('manager disposes loaded GPU resources', manager.includes('object.geometry.dispose()') && manager.includes('material.dispose()'));
check('manager compacts merged index buffers only within the 16-bit vertex limit', manager.includes('mergedVertexCount <= 65535') && manager.includes('new Uint16Array(source.length)') && manager.includes('merged.setIndex'));

if (failures.length) {
  console.error(`Runtime contract failed: ${failures.join(', ')}`);
  process.exitCode = 1;
} else {
  console.log('HBL runtime contract passed.');
}
