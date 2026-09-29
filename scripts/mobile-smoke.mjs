import { readFile, stat } from 'node:fs/promises';

const root = process.cwd();
const [manifestText, manager, atlas, styles, serviceWorker, manifestWeb, infoPanel] = await Promise.all([
  readFile(`${root}/public/models/atlas.json`, 'utf8'),
  readFile(`${root}/src/lib/AnatomySceneManager.js`, 'utf8'),
  readFile(`${root}/src/components/BodyMap3DAtlas.jsx`, 'utf8'),
  readFile(`${root}/src/styles.css`, 'utf8'),
  readFile(`${root}/public/sw.js`, 'utf8'),
  readFile(`${root}/public/manifest.webmanifest`, 'utf8'),
  readFile(`${root}/src/components/InfoPanel.jsx`, 'utf8')
]);
const atlasManifest = JSON.parse(manifestText);
const failures = [];
const check = (name, condition) => { if (!condition) failures.push(name); };
const compressedBytes = atlasManifest.chunks.reduce((sum, chunk) => sum + chunk.gzipBytes, 0);
const maxChunk = Math.max(...atlasManifest.chunks.map((chunk) => chunk.gzipBytes));

check('atlas manifest has version', /^BodyParts3D\s/.test(atlasManifest.version));
check('atlas has demand-loading indexes', atlasManifest.indexes?.chunkToSystems && atlasManifest.indexes?.chunkToStructures && atlasManifest.indexes?.chunkToLearningModules && atlasManifest.indexes?.systemToChunks && atlasManifest.indexes?.moduleToChunks);
check('atlas has organ-first chunk', atlasManifest.chunks[8]?.gzip && atlasManifest.parts.filter((part) => part.chunk === 8).some((part) => part.system === 'cardiac' || part.system === 'respiratory'));
const skeletalChunkCounts = atlasManifest.parts.filter((part) => part.system === 'skeletal').reduce((counts, part) => counts.set(part.chunk, (counts.get(part.chunk) || 0) + 1), new Map());
const firstSkeletalChunk = [...skeletalChunkCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
check('skeletal-first startup chunk is selected', Number.isInteger(firstSkeletalChunk) && manager.includes('skeletalCounts') && manager.includes('await this.ensureChunk(skeletalChunk)'));
check('atlas shows an initial loading state', atlas.includes('atlas-startup-state') && atlas.includes('Preparing skeletal layer'));
check('atlas chunk count is bounded', atlasManifest.chunks.length <= 16);
check('largest compressed chunk stays under mobile budget', maxChunk <= 2_500_000);
check('total compressed atlas stays under mobile budget', compressedBytes <= 36_000_000);
check('demand-driven chunk concurrency is bounded', manager.includes('const concurrency = this.isMobile || this.quality === \'battery\' ? 2 : 3') && manager.includes('chunks.slice(cursor, cursor + concurrency)'));
check('atlas systems load on demand', manager.includes('ensureSystems') && manager.includes('searchAndLoad') && manager.includes('loadedChunks'));
check('first skeletal layer binds interaction immediately', manager.includes('this.bindPointerEvents();') && manager.includes('onReady?.({ index: skeletalChunk'));
check('atlas can report runtime chunk readiness', manager.includes('onChunkReady') && atlas.includes('performance.mark'));
check('mobile geometry filtering is retained', manager.includes('vertexCount < 420') && manager.includes('vertexCount < 220'));
check('versioned cache cleanup is present', manager.includes('pruneLegacyNamespaces') && manager.includes('setVersion'));
check('bounded network loading is present', manager.includes('fetchWithTimeout') && manager.includes('attempt < 2'));
check('adaptive pixel ratio is present', atlas.includes('renderer.setPixelRatio') && atlas.includes('slowFrameStreak') && atlas.includes('interactionPixelRatio'));
check('rotation renders from OrbitControls changes', atlas.includes("controls.addEventListener('change'") && atlas.includes('OrbitControls still owns zoom') && atlas.includes('requestRender();'));
check('rotation avoids drag-time raycast contention', manager.includes('event.buttons || this._interactionActive') && manager.includes('requestAnimationFrame(flushHover)') && manager.includes('setInteractionActive'));
check('atlas rotates layers around their own axis', atlas.includes('controls.enableRotate = false') && atlas.includes('anatomyPivot.rotation.y') && atlas.includes('onModelPointerMove') && atlas.includes('rotateAnatomy'));
check('atlas layer contrast and visibility cues are present', manager.includes('emissive: spec.color') && atlas.includes('layer-swatch') && styles.includes('.anatomy-layer-row.is-visible'));
check('atlas quality profiles and diagnostics are wired', atlas.includes('ATLAS_QUALITY_PROFILES') && atlas.includes('performanceStats') && atlas.includes('diagnosticsEnabled') && manager.includes('setQualityProfile') && styles.includes('.quality-select'));
check('low-power mobile profile is present', atlas.includes('navigator.connection') && atlas.includes('saveData') && atlas.includes('deviceMemory'));
check('visibility pauses rendering', atlas.includes("document.addEventListener('visibilitychange'") && atlas.includes('cancelAnimationFrame'));
check('touch gestures are configured', atlas.includes('THREE.TOUCH.DOLLY_PAN') && atlas.includes('THREE.TOUCH.ROTATE'));
check('reduced motion is honored', atlas.includes("prefers-reduced-motion") && styles.includes('prefers-reduced-motion: reduce'));
check('safe-area support is present', styles.includes('safe-area-inset-bottom') && styles.includes('safe-area-inset-top'));
check('touch targets are present', styles.includes('min-height:38px') && styles.includes('min-height:42px'));
check('phone header keeps Settings and Help reachable', styles.includes('/* Mobile phone polish') && styles.includes('header-actions button:nth-child(3),') && styles.includes('display: inline-flex'));
check('mobile atlas controls collapse safely', atlas.includes('layer-controller-toggle') && styles.includes('anatomy-layer-controller.collapsed'));
check('mobile atlas has a reversible focus mode', atlas.includes('focusMode') && atlas.includes('aria-pressed={focusMode}') && styles.includes('body-3d-stage.focus-mode'));
check('mobile atlas overlays are opt-in', atlas.includes('mobileHudOpen') && atlas.includes('mobileLayersOpen') && atlas.includes('aria-expanded={mobileHudOpen}') && atlas.includes('aria-expanded={mobileLayersOpen}') && styles.includes('.anatomy-hud-card:not(.mobile-open)') && styles.includes('.anatomy-layer-controller:not(.mobile-open)') && styles.includes('display: none !important'));
check('mobile atlas tools are hidden by default', atlas.includes('mobileToolsOpen') && atlas.includes('atlas-search-panel') && atlas.includes('atlas-learning-systems') && styles.includes('.anatomy-search:not(.mobile-open)') && styles.includes('.three-system-nav:not(.mobile-open)'));
check('atlas defaults to the skeletal layer only', atlas.includes("visible: id === 'skeletal'") && manager.includes("visible: id === 'skeletal'"));
check('responsive foundation keeps view navigation available', styles.includes('--mobile-touch-target: 44px') && styles.includes('position: sticky') && styles.includes('top: var(--mobile-header-height)'));
check('mobile learning notes can collapse', infoPanel.includes('info-panel-toggle') && infoPanel.includes('aria-expanded={detailsOpen}') && styles.includes('.info-panel-toggle { display: none;') && styles.includes('.info-panel-toggle { display: inline-flex; }'));
check('mobile content visibility optimization is present', styles.includes('content-visibility:auto'));
check('PWA manifest is standalone', JSON.parse(manifestWeb).display === 'standalone');
check('service worker is versioned', /CACHE_VERSION/.test(serviceWorker));
check('offline bundle exists', (await stat(`${root}/human-biology-lab-offline4.html`)).size > 1_000_000);

const previewUrl = process.env.PREVIEW_URL;
if (previewUrl) {
  const responses = await Promise.all(['/manifest.webmanifest', '/sw.js', '/models/atlas.json'].map((path) => fetch(new URL(path, previewUrl))));
  check('preview PWA endpoints respond', responses.every((response) => response.ok));
}

if (failures.length) {
  console.error(`Mobile QA smoke check failed: ${failures.join(', ')}`);
  process.exitCode = 1;
} else {
  console.log(`HBL mobile QA smoke check passed (${atlasManifest.chunks.length} chunks, ${(compressedBytes / 1e6).toFixed(1)} MB compressed atlas).`);
}
