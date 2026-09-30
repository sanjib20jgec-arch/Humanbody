import { readFile } from 'node:fs/promises';
import { decideGestureAxis } from '../src/lib/gestureArbitration.js';

const [styles, app, atlas, infoPanel, controls, deviceProfile] = await Promise.all([
  readFile('src/styles.css', 'utf8'),
  readFile('src/App.jsx', 'utf8'),
  readFile('src/components/BodyMap3DAtlas.jsx', 'utf8'),
  readFile('src/components/InfoPanel.jsx', 'utf8'),
  readFile('src/components/SimulationControls.jsx', 'utf8'),
  readFile('src/lib/deviceProfile.js', 'utf8')
]);

// Device matrix: legacy handsets → flagship handsets → foldable → tablets →
// laptops (MacBook class) → desktops → ultrawide → 10-foot TV.
const targetViewports = [
  [320, 568], [360, 800], [390, 844], [412, 915], [430, 932], [568, 320], [852, 393],
  [768, 1024], [834, 1194], [1024, 1366], [1366, 1024], [1512, 982], [1280, 800],
  [1920, 1080], [2560, 1080], [1920, 1080, 'tv']
];
const failures = [];
const check = (name, condition) => { if (!condition) failures.push(name); };

check('target viewport matrix is defined', targetViewports.length === 16 && targetViewports.some(([width]) => width === 320) && targetViewports.some(([width]) => width === 2560) && targetViewports.some((entry) => entry[2] === 'tv'));
// Device matrix pass: input-modality, orientation, ultrawide, and 10-foot TV
// adaptation must all exist and be wired.
check('input-modality sizing exists', styles.includes('@media (pointer: coarse)'));
check('hover-only affordances gated for touch', styles.includes('body.ff-tv .hover-card { display: none; }') || styles.includes('.hover-card { display: none; }'));
check('dynamic viewport units used', styles.includes('min-height: 100dvh'));
check('landscape handset pass exists', styles.includes('(max-width: 900px) and (orientation: landscape)'));
check('tablet coarse pass exists', styles.includes('(min-width: 768px) and (max-width: 1180px) and (pointer: coarse)'));
check('ultrawide pass exists', styles.includes('@media (min-width: 1800px)') && styles.includes('@media (min-width: 2400px)'));
check('tv 10-foot mode exists', styles.includes('body.ff-tv') && deviceProfile.includes('ff-tv'));
check('device profile layer stamps classes pre-paint', deviceProfile.includes('applyDeviceProfileClasses') && deviceProfile.includes('watchDeviceProfileChanges'));
check('tv forces conservative render tier', atlas.includes('deviceProfile.isTV'));
check('global splash cannot block the initial shell', !app.includes('function LoadingScreen') && !app.includes('INITIALIZING BIOLOGY LAB') && !app.includes('setTimeout(() => setLoading(false), 1250)'));
check('global horizontal overflow is guarded', styles.includes('html,body,#root') && styles.includes('overflow-x:hidden'));
check('app shell leaves vertical scrolling to the document', styles.includes('overflow-x: clip') && !styles.includes('.app-shell { min-height: 100vh; min-height: 100dvh; background: linear-gradient(180deg, rgba(8,17,28,.82), rgba(5,11,19,.98)); overflow: hidden; }'));
check('atlas preserves vertical page scrolling over the 3D canvas', styles.includes('body-3d-mount {') && styles.includes('body-3d-canvas {') && styles.includes('touch-action: pan-y') && atlas.includes("renderer.domElement.style.touchAction = 'pan-y'") && atlas.includes('onWheelPageScroll') && !atlas.includes('event.preventDefault();\n      const nextYaw'));
// Touch gestures must be arbitrated by axis before any model control engages.
// Capturing the pointer on pointerdown would claim the gesture before the
// browser can decide it is a page scroll, which defeats touch-action: pan-y.
const pointerDownHandler = atlas.slice(atlas.indexOf('const onModelPointerDown'), atlas.indexOf('const onModelPointerMove'));
check('atlas arbitrates touch axis before engaging model controls', atlas.includes('decideGestureAxis(') && atlas.includes("rotationPointer.axis = 'horizontal'") && atlas.includes('if (isMouse) engageModelInteraction(event.pointerId)'));
check('atlas never captures the pointer before the gesture axis is known', pointerDownHandler.length > 0 && !pointerDownHandler.includes('setPointerCapture'));
check('atlas hands vertical touch gestures back to the page', atlas.includes("axis === 'vertical'") && atlas.includes('scrollGesturePointers.add(event.pointerId)'));
check('atlas does not let a page scroll register as a tap', atlas.includes("wasScrollGesture || event.type === 'pointercancel'"));
// Behavioural checks on the arbitration rule itself, runnable without a browser.
check('gesture arbitration needs real travel before claiming an axis', decideGestureAxis({ dx: 0, dy: 0 }) === null && decideGestureAxis({ dx: 3, dy: 2 }) === null && decideGestureAxis({ dx: -7, dy: 7 }) === null);
check('gesture arbitration claims sideways travel for the model', decideGestureAxis({ dx: 24, dy: 4 }) === 'horizontal' && decideGestureAxis({ dx: -24, dy: 4 }) === 'horizontal');
check('gesture arbitration yields vertical travel to the page', decideGestureAxis({ dx: 4, dy: 24 }) === 'vertical' && decideGestureAxis({ dx: 0, dy: 12 }) === 'vertical');
check('gesture arbitration sends an ambiguous diagonal to page scrolling', decideGestureAxis({ dx: 12, dy: 12 }) === 'vertical');
check('safe-area insets are wired', styles.includes('safe-area-inset-top') && styles.includes('safe-area-inset-bottom'));
check('phone layout tokens exist', styles.includes('--mobile-gutter') && styles.includes('--mobile-touch-target'));
check('modern smartphone layout pass is present', styles.includes('--mobile-card-radius') && styles.includes('height: clamp(360px, 64svh, 520px)') && styles.includes('thumb dock'));
check('compact app bar preserves utility actions', styles.includes('header-actions button:nth-child(3)') && styles.includes('header-actions button:nth-child(4) { display: inline-flex; }'));
check('view navigation stays available while scrolling', styles.includes('position: sticky') && styles.includes('top: var(--mobile-header-height)'));
check('phone atlas overlays default closed', atlas.includes("useState(false)") && atlas.includes('mobileHudOpen') && atlas.includes('mobileLayersOpen') && atlas.includes('mobileToolsOpen'));
check('phone tools have explicit reveal controls', atlas.includes('atlas-tools-toggle') && atlas.includes('atlas-layers-toggle') && atlas.includes('atlas-hotspot-toggle'));
check('atlas can fill the viewport', atlas.includes('toggleAtlasFullscreen') && atlas.includes('requestFullscreen') && styles.includes('.body-map-wrap.atlas-fullscreen') && styles.includes(':fullscreen'));
check('small-tablet atlas controls remain reachable', styles.includes('Small-tablet overlay recovery') && styles.includes('@media (min-width: 768px) and (max-width: 900px)') && styles.includes('.body-3d-stage .three-hud-bottom'));
check('phone learning notes are collapsible', infoPanel.includes('info-panel-toggle') && infoPanel.includes('aria-expanded={detailsOpen}') && infoPanel.includes('hidden={!detailsOpen}'));
check('shared simulation controls have touch sizing', styles.includes('.control-button {') && styles.includes('min-height: var(--mobile-touch-target)') && controls.includes('aria-pressed'));
check('active module receives reduced-motion state', app.includes('reducedMotion={reducedMotion}') && atlas.includes('reducedMotion'));

if (failures.length) {
  console.error(`Viewport contract smoke check failed: ${failures.join(', ')}`);
  process.exitCode = 1;
} else {
  console.log(`HBL viewport contract smoke check passed (${targetViewports.length} target viewport profiles).`);
}
