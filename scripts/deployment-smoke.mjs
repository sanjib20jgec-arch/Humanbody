import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const required = ['public/sw.js', 'public/_headers', 'public/manifest.webmanifest', 'public/robots.txt', 'public/ATTRIBUTION-BodyParts3D.md'];
const missing = required.filter((file) => !existsSync(resolve(root, file)));
if (missing.length) throw new Error(`Deployment files missing: ${missing.join(', ')}`);

const serviceWorker = readFileSync(resolve(root, 'public/sw.js'), 'utf8');
const headers = readFileSync(resolve(root, 'public/_headers'), 'utf8');
const manifest = JSON.parse(readFileSync(resolve(root, 'public/manifest.webmanifest'), 'utf8'));
const packageJson = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'));
const failures = [];
const check = (name, condition) => { if (!condition) failures.push(name); };

check('service worker has a shell version', /CACHE_VERSION\s*=\s*['"]hbl-shell-v4['"]/.test(serviceWorker));
check('service worker has an independent atlas cache', /MODEL_CACHE\s*=\s*['"]hbl-atlas-bodyparts3d-4-0['"]/.test(serviceWorker));
check('service worker keeps stale manifest fallback', serviceWorker.includes("url.pathname === '/models/atlas.json'") && serviceWorker.includes('cacheNetworkResponse'));
check('service worker cleans old HBL caches', serviceWorker.includes("key.startsWith('hbl-')") && serviceWorker.includes('caches.delete'));
check('HTML is revalidated', headers.includes('/index.html') && headers.includes('must-revalidate'));
check('baseline security headers are declared', headers.includes('Content-Security-Policy') && headers.includes('Permissions-Policy') && headers.includes('frame-ancestors'));
check('hashed assets are immutable', headers.includes('/assets/*') && headers.includes('immutable'));
check('geometry cache policy is explicit', headers.includes('/models/*') && headers.includes('max-age=31536000'));
check('PWA manifest is installable', manifest.display === 'standalone' && manifest.start_url === '/');
check('attribution is shipped', readFileSync(resolve(root, 'public/ATTRIBUTION-BodyParts3D.md'), 'utf8').includes('CC BY 4.0'));
check('verify command includes deployment smoke', packageJson.scripts?.['verify:deployment'] === 'node scripts/deployment-smoke.mjs');
check('offline build preserves lazy-bay source compatibility', packageJson.scripts?.['build:offline']?.includes('--mode offline') && readFileSync(resolve(root, 'scripts/generate-offline.mjs'), 'utf8').includes('dist-offline'));
check('no frontend API key is declared', !Object.keys(packageJson).some((key) => key.toLowerCase().includes('api')));

if (failures.length) throw new Error(`Deployment smoke check failed: ${failures.join(', ')}`);
console.log('HBL deployment and cache smoke check passed.');
