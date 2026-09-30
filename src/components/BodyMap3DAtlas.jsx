import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { Icon } from './Icons';
import { ANATOMY_LAYERS, getAnatomyMetadataFallback } from '../lib/anatomyLayers';
import { recordAtlasChunkError, recordAtlasChunkProfile } from '../lib/performance';
import { ATLAS_CAMERA_PRESETS, ATLAS_LIGHTING_PRESETS, getAtlasLightingPreset, orientationLabelForYaw } from '../lib/atlasFraming';
import { decideGestureAxis } from '../lib/gestureArbitration';
const LazyStructureIndexPanel = React.lazy(() => import('./atlasTools').then((m) => ({ default: m.StructureIndexPanel })));
const LazyBookmarksPanel = React.lazy(() => import('./atlasTools').then((m) => ({ default: m.BookmarksPanel })));
const LazyAtlasLabelQuiz = React.lazy(() => import('./atlasTools').then((m) => ({ default: m.AtlasLabelQuiz })));
const LazyAccessibleAtlasMode = React.lazy(() => import('./atlasTools').then((m) => ({ default: m.AccessibleAtlasMode })));
import { resolveRenderingCapabilities, RENDERING_MODES } from '../lib/atlasRendering';

import { organRegions } from '../data/organRegions.js';
import { getDeviceProfile } from '../lib/deviceProfile.js';

const moduleForSystem = {
  nervous: 'nervous', sensory: 'nervous', respiratory: 'respiration', cardiac: 'circulation', arterial: 'circulation', venous: 'circulation',
  digestive: 'digestion', urinary: 'excretion', reproductive: 'reproduction'
};

// R7 (G8): ~8% more distance than the old fit so the skull gets headroom in
// the default 3/4 view instead of sitting at the top edge.
const defaultCamera = new THREE.Vector3(1.35, 0.99, 4.05);

// Phase 28: preset yaw/pitch targets live in the shared framing contract so
// the viewer and the framing QC can never drift apart.
const VIEW_PRESET_CONFIG = Object.fromEntries(Object.values(ATLAS_CAMERA_PRESETS).filter((preset) => preset.available).map((preset) => [preset.id, { label: preset.label, yaw: preset.yaw, pitch: preset.pitch }]));
const EMPTY_VIEW_PRESETS = [];

export const ATLAS_QUALITY_PROFILES = {
  sharp: { label: 'Sharp', desktopPixelRatio: 1.75, mobilePixelRatio: 1.35, desktopInteractionRatio: 1.4, mobileInteractionRatio: 1.1 },
  balanced: { label: 'Balanced', desktopPixelRatio: 1.5, mobilePixelRatio: 1.15, desktopInteractionRatio: 1.25, mobileInteractionRatio: 1 },
  battery: { label: 'Battery Saver', desktopPixelRatio: 1.15, mobilePixelRatio: 1, desktopInteractionRatio: 1, mobileInteractionRatio: 1 },
};

function resolveQualityProfile(requested, lowPower) {
  const selected = requested === 'auto' ? (lowPower ? 'battery' : 'balanced') : requested;
  return { id: selected, profile: ATLAS_QUALITY_PROFILES[selected] || ATLAS_QUALITY_PROFILES.balanced };
}

function readAccessibleAtlasPreference() {
  try { return typeof window !== 'undefined' && window.localStorage.getItem('hbl-atlas-accessible') === 'true'; }
  catch { return false; }
}

export default function BodyMap3DAtlas({ onSelect, visited = {}, onAnatomySelect, reducedMotion = false, quality = 'auto', focusSystems = null, focusLabel = '', viewPresets = EMPTY_VIEW_PRESETS, teachingOverlay = null }) {
  const mountRef = useRef(null);
  const mapWrapRef = useRef(null);
  const controlsRef = useRef(null);
  const anatomyRootRef = useRef(null);
  const requestRenderRef = useRef(null);
  const qualityControllerRef = useRef(null);
  const managerRef = useRef(null);
  const focusedViewRef = useRef(null);
  const userAdjustedViewRef = useRef(false);
  const onSelectRef = useRef(onSelect);
  const onAnatomySelectRef = useRef(onAnatomySelect);
  const [hovered, setHovered] = useState(null);
  const [selectedPart, setSelectedPart] = useState(null);
  const [rotationLabel, setRotationLabel] = useState('3/4 VIEW');
  const [activeViewPreset, setActiveViewPreset] = useState('default');
  const [layers, setLayers] = useState(() => {
    // The unfocused atlas contract remains: visible: id === 'skeletal'.
    const focused = new Set(focusSystems || []);
    return Object.fromEntries(Object.entries(ANATOMY_LAYERS).map(([id, layer]) => { const visible = focused.size ? layer.systems.some((system) => focused.has(system)) : id === 'skeletal'; return [id, { visible, opacity: layer.opacity }]; }));
  });
  const [loadProgress, setLoadProgress] = useState(0);
  const [atlasReady, setAtlasReady] = useState(false);
  const [atlasFullReady, setAtlasFullReady] = useState(false);
  const [atlasQuery, setAtlasQuery] = useState('');
  const [searchMessage, setSearchMessage] = useState('');
  const [error, setError] = useState('');
  const [focusMode, setFocusMode] = useState(false);
  const [mobileHudOpen, setMobileHudOpen] = useState(false);
  const [mobileLayersOpen, setMobileLayersOpen] = useState(false);
  const [mobileToolsOpen, setMobileToolsOpen] = useState(false);
  const [atlasFullscreen, setAtlasFullscreen] = useState(false);
  const [performanceStats, setPerformanceStats] = useState(null);
  // Phase 30: wide-pick mode uses visible part bounds as a fallback target so
  // small valves and vessels remain selectable on coarse pointers.
  const [widePick, setWidePick] = useState(false);
  // Phase 44+: presentation and view-mode state for the visual upgrade tiers.
  const [presentationPreset, setPresentationPreset] = useState('neutralAtlas');
  const [xrayActive, setXrayActive] = useState(false);
  const [clipState, setClipState] = useState(null);
  const [isolationActive, setIsolationActive] = useState(false);
  const [structurePanelOpen, setStructurePanelOpen] = useState(false);
  const [structureQuery, setStructureQuery] = useState('');
  const [bookmarksOpen, setBookmarksOpen] = useState(false);
  const [quizOpen, setQuizOpen] = useState(false);
  const [measureAnchor, setMeasureAnchor] = useState(null);
  const [measureResult, setMeasureResult] = useState(null);
  const [atlasNotes, setAtlasNotes] = useState(() => { try { return JSON.parse(window.localStorage.getItem('hbl-atlas-notes') || '{}'); } catch { return {}; } });
  const lightsRef = useRef(null);
  const flyToRef = useRef(null);
  const [contextLost, setContextLost] = useState(false);
  const [rendererGeneration, setRendererGeneration] = useState(0);
  const [accessibleMode, setAccessibleMode] = useState(readAccessibleAtlasPreference);
  const diagnosticsEnabled = typeof window !== 'undefined' && window.__HBL_DEV__ === true && new URLSearchParams(window.location.search).has('debug');

  const selectedPartRef = useRef(null);
  const frameSelectionRef = useRef(null);
  useEffect(() => { onSelectRef.current = onSelect; }, [onSelect]);
  useEffect(() => { onAnatomySelectRef.current = onAnatomySelect; }, [onAnatomySelect]);
  useEffect(() => { selectedPartRef.current = selectedPart; }, [selectedPart]);
  useEffect(() => { try { window.localStorage.setItem('hbl-atlas-accessible', String(accessibleMode)); } catch { /* storage can be unavailable */ } }, [accessibleMode]);

  useEffect(() => {
    const syncFullscreenState = () => setAtlasFullscreen(document.fullscreenElement === mapWrapRef.current);
    document.addEventListener('fullscreenchange', syncFullscreenState);
    return () => document.removeEventListener('fullscreenchange', syncFullscreenState);
  }, []);

  useEffect(() => {
    qualityControllerRef.current?.(quality);
  }, [quality]);

  useEffect(() => {
    managerRef.current?.setTeachingOverlay(teachingOverlay);
  }, [teachingOverlay]);

  useEffect(() => {
    managerRef.current?.setPickTolerance(widePick);
  }, [widePick]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount || accessibleMode) return undefined;
    let disposed = false;
    focusedViewRef.current = null;
    let frameId = 0;
    let rendering = false;
    let renderer;
    const isHandset = /Android.*Mobile|iPhone|iPod|Windows Phone/i.test(navigator.userAgent || '');
    const deviceProfile = getDeviceProfile();
    const isMobile = window.matchMedia?.('(max-width: 767px)')?.matches || isHandset || deviceProfile.formFactor === 'phone';
    // Device matrix pass: tablets share the touch interaction budget, TVs are
    // always the conservative tier, and flagship handsets keep the rich one.
    const touchDevice = isMobile || deviceProfile.coarse;
    // App resolves prefers-reduced-motion plus the saved user override and passes it here.
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const saveData = Boolean(connection?.saveData) || deviceProfile.saveData;
    const lowMemory = Number.isFinite(navigator.deviceMemory) && navigator.deviceMemory <= 4;
    const lowPower = deviceProfile.isTV || (touchDevice && (saveData || lowMemory) && !deviceProfile.capable);
    let needsRender = true;
    // A 2x device pixel ratio makes the anatomy atlas render four times as
    // many pixels while the user is dragging. Quality profiles cap both the
    // steady-state and interaction ratios without changing model geometry.
    const initialQuality = resolveQualityProfile(quality, lowPower);
    let activeQualityId = initialQuality.id;
    let activeQuality = initialQuality.profile;
    // Phase 40: per-tier rendering capabilities decide which visual
    // foundation features this session may use.
    const capabilities = resolveRenderingCapabilities(activeQualityId, lowPower);
    let pixelRatio = Math.min(window.devicePixelRatio || 1, deviceProfile.isTV ? 1 : touchDevice ? activeQuality.mobilePixelRatio : activeQuality.desktopPixelRatio);
    let previousPixelRatio = pixelRatio;
    let interactionPixelRatio = isMobile ? activeQuality.mobileInteractionRatio : activeQuality.desktopInteractionRatio;
    let previousFrameTime = 0;
    let slowFrameStreak = 0;
    let interactionActive = false;
    const performanceSample = { frames: 0, elapsed: 0, worstFrame: 0, lastTime: 0, lastSample: 0 };
    try {
      renderer = new THREE.WebGLRenderer({ antialias: !isMobile, alpha: true, powerPreference: 'high-performance' });
    } catch {
      setError('This browser could not start the 3D anatomy renderer.');
      return undefined;
    }
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(10, 10, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;
    renderer.domElement.className = 'body-3d-canvas';
    // Software rasterizers (SwiftShader, llvmpipe) exhaust GPU memory under
    // image-based lighting and post-processing. Detect them and drop to the
    // analytic-lighting path — capability-driven, never a user-visible claim.
    try {
      const gl = renderer.getContext();
      const info = gl.getExtension('WEBGL_debug_renderer_info');
      const rendererName = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL) || '') : '';
      if (/swiftshader|llvmpipe|software rasterizer|microsoft basic/i.test(rendererName)) {
        capabilities.environment = false;
        capabilities.postprocessing = false;
      }
    } catch { /* renderer identification is best-effort only */ }
    const onContextLost = (event) => {
      // preventDefault tells the browser we will handle restoration.
      event.preventDefault();
      if (!disposed) setContextLost(true);
    };
    const onContextRestored = () => {
      if (disposed) return;
      setContextLost(false);
      setRendererGeneration((generation) => generation + 1);
    };
    renderer.domElement.addEventListener('webglcontextlost', onContextLost, false);
    renderer.domElement.addEventListener('webglcontextrestored', onContextRestored, false);
    renderer.domElement.setAttribute('aria-label', 'Interactive BodyParts3D human anatomy atlas. Drag to rotate the anatomy around its own axis, use pinch or scroll to zoom, two fingers to pan, and tap a structure to inspect it.');
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x08131e, 3.8, 8.2);
    const camera = new THREE.PerspectiveCamera(34, 1, 0.005, 100);
    camera.position.copy(defaultCamera);
    // OrbitControls disables native touch scrolling when it is constructed.
    // Keep vertical gestures available to the page; the atlas still handles
    // horizontal drags and pinch gestures below.
    const onWheelPageScroll = (event) => { event.stopImmediatePropagation(); };
    renderer.domElement.addEventListener('wheel', onWheelPageScroll);
    const controls = new OrbitControls(camera, renderer.domElement);
    renderer.domElement.style.touchAction = 'pan-y';
    controlsRef.current = controls;
    controls.target.set(0, 0.86, 0);
    // Camera orbiting makes the body feel like it is sliding around an
    // external pivot. Rotation is handled by the atlas root below so every
    // loaded layer turns around the anatomy's own center axis instead.
    controls.enableRotate = false;
    controls.enableDamping = !reducedMotion;
    controls.dampingFactor = reducedMotion ? 0 : isMobile ? 0.11 : 0.085;
    controls.rotateSpeed = 0.58;
    controls.zoomSpeed = 0.78;
    controls.panSpeed = 0.65;
    controls.minDistance = 1.55;
    controls.maxDistance = 7;
    controls.maxPolarAngle = Math.PI * 0.96;
    controls.touches.ONE = THREE.TOUCH.ROTATE;
    controls.touches.TWO = THREE.TOUCH.DOLLY_PAN;
    controls.mouseButtons.LEFT = THREE.MOUSE.ROTATE;
    controls.mouseButtons.RIGHT = THREE.MOUSE.PAN;
    const requestRender = () => {
      needsRender = true;
      if (!document.hidden && !frameId && !rendering) frameId = window.requestAnimationFrame(animate);
    };
    requestRenderRef.current = requestRender;
    const setInteractionQuality = (active) => {
      if (interactionActive === active) return;
      interactionActive = active;
      if (active) {
        previousPixelRatio = pixelRatio;
        pixelRatio = Math.min(pixelRatio, interactionPixelRatio);
      } else {
        pixelRatio = previousPixelRatio;
      }
      renderer.setPixelRatio(pixelRatio);
      requestRender();
    };
    const applyQualityProfile = (requested) => {
      const next = resolveQualityProfile(requested, lowPower);
      activeQualityId = next.id;
      activeQuality = next.profile;
      managerRef.current?.setQualityProfile?.(activeQualityId);
      const steadyRatio = Math.min(window.devicePixelRatio || 1, isMobile ? activeQuality.mobilePixelRatio : activeQuality.desktopPixelRatio);
      interactionPixelRatio = isMobile ? activeQuality.mobileInteractionRatio : activeQuality.desktopInteractionRatio;
      previousPixelRatio = steadyRatio;
      pixelRatio = interactionActive ? Math.min(steadyRatio, interactionPixelRatio) : steadyRatio;
      renderer.setPixelRatio(pixelRatio);
      requestRender();
    };
    qualityControllerRef.current = applyQualityProfile;
    controls.addEventListener('start', () => {
      setInteractionQuality(true);
      managerRef.current?.setInteractionActive(true);
    });
    controls.addEventListener('end', () => {
      setInteractionQuality(false);
      managerRef.current?.setInteractionActive(false);
    });
    controls.addEventListener('change', () => {
      // OrbitControls still owns zoom and two-finger pan. Scheduling here
      // keeps those camera changes visible while the frame loop stays idle.
      requestRender();
    });

    scene.add(new THREE.HemisphereLight(0xf6eee6, 0x111922, isMobile ? 1.2 : 1.55));
    const key = new THREE.DirectionalLight(0xfff6ed, isMobile ? 2.05 : 2.65);
    key.position.set(-2.5, 4.5, 4.5);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xbfd8e8, isMobile ? 0.95 : 1.35);
    fill.position.set(3, 2.3, -2.5);
    scene.add(fill);
    // R5 (G5): rim desaturated toward cool white and dimmed ~30% — the old
    // teal rim read as UI glow on bone and muscle.
    const rim = new THREE.PointLight(0xbfd9dd, isMobile ? 1.0 : 1.5, 7);
    rim.position.set(2, 1.8, 2.8);
    scene.add(rim);
    lightsRef.current = { renderer, hemisphere: scene.children.find((child) => child.isHemisphereLight), key, fill, rim };

    // Phase 40: image-based lighting from a neutral studio environment gives
    // physically believable shading on every surface. Appearance only — the
    // geometry is untouched. Battery/low-power sessions keep analytic lights.
    let pmrem = null;
    if (capabilities.environment) {
      try {
        pmrem = new THREE.PMREMGenerator(renderer);
        scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
        scene.environmentIntensity = 0.42;
        // Rebalance analytic lights so the combined result stays restrained.
        key.intensity *= 0.62;
        fill.intensity *= 0.7;
        rim.intensity *= 0.8;
        scene.children.forEach((child) => { if (child.isHemisphereLight) child.intensity *= 0.55; });
      } catch {
        scene.environment = null;
        pmrem?.dispose();
        pmrem = null;
      }
    }

    // Keep the model geometry in its original world position, but place the
    // rotation pivot at the anatomical center rather than at the floor of the
    // source mesh. This makes both yaw and pitch true self-axis rotation.
    const anatomyPivot = new THREE.Group();
    anatomyPivot.position.set(0, 0.86, 0);
    const anatomyRoot = new THREE.Group();
    anatomyRoot.scale.setScalar(1.08);
    anatomyRoot.position.y = -0.86 / 1.08;
    anatomyPivot.rotation.y = 0.08;
    anatomyRootRef.current = anatomyPivot;
    anatomyPivot.add(anatomyRoot);
    scene.add(anatomyPivot);
    const updateRotationLabel = (angle) => {
      setRotationLabel(orientationLabelForYaw(angle));
    };
    // Phase 59 budget: the scene manager (three/examples hulls, geometry
    // merging) loads on demand so the viewer chunk stays inside budget.
    let manager = null;
    const managerModule = import('../lib/AnatomySceneManager');
    managerModule.then(({ AnatomySceneManager }) => {
      if (disposed) return;
      manager = new AnatomySceneManager({
      scene,
      camera,
      renderer,
      root: anatomyRoot,
      embeddedAtlas: typeof window !== 'undefined' ? (window.__HBL_ATLAS__ || window.__HBL_ATLAS_LAZY__) : null,
      moduleForSystem,
      quality: initialQuality.id,
      onRenderRequest: requestRender,
      onChunkError: (chunkError, index) => { recordAtlasChunkError(index, chunkError?.message || chunkError); if (!disposed) { setSearchMessage(`Some anatomy detail is unavailable (chunk ${index + 1}).`); requestRender(); } },
      onChunkReady: ({ index, systems, progress, profile }) => { recordAtlasChunkProfile({ ...(profile || {}), index, systems, progress }); if (!disposed) { setLoadProgress(progress); if (typeof performance !== 'undefined') performance.mark(`hbl-atlas-chunk-${index}-ready`); requestRender(); } },
      onReady: ({ index }) => { if (!disposed) { setAtlasReady(true); if (typeof performance !== 'undefined') { performance.mark('hbl-skeletal-ready'); performance.mark('hbl-first-3d-ready'); } requestRender(); } },
      onFullReady: () => { if (!disposed) { setAtlasFullReady(true); if (typeof performance !== 'undefined') performance.mark('hbl-atlas-full-ready'); requestRender(); } },
      onProgress: (progress) => { if (!disposed) { setLoadProgress(progress); requestRender(); } }, 
      onHover: (metadata) => { if (!disposed) { setHovered(metadata); requestRender(); } },
      onSelect: (moduleId, metadata) => {
        if (disposed) return;
        setSelectedPart(metadata);
        setHovered(metadata);
        onAnatomySelectRef.current?.(metadata);
        if (moduleId) onSelectRef.current(moduleId);
      }
    });
      managerRef.current = manager;
      manager.debugBounds = diagnosticsEnabled;
      manager.setReducedMotion(reducedMotion);
      manager.setTeachingOverlay(teachingOverlay, false);
    }).catch((managerError) => { if (!disposed) setError(managerError?.message || 'The certified anatomy atlas could not be loaded.'); });

    const fitFocusedObject = () => {
      if (!focusSystems?.length) return;
      const bounds = manager?.getBoundsForSystems?.(focusSystems);
      if (!bounds) return;
      const center = new THREE.Vector3();
      const size = new THREE.Vector3();
      bounds.getCenter(center);
      bounds.getSize(size);
      const radius = Math.max(size.length() * 0.58, 0.08);
      controls.target.copy(center);
      camera.position.copy(center).add(new THREE.Vector3(radius * 0.9, radius * 0.55, radius * 2.25));
      camera.near = Math.max(radius / 100, 0.001);
      camera.far = Math.max(radius * 12, 5);
      camera.updateProjectionMatrix();
      controls.update();
      if (!userAdjustedViewRef.current) {
        anatomyPivot.rotation.set(0, 0.08, 0);
        setActiveViewPreset(viewPresets.includes('anterior') ? 'anterior' : 'default');
        updateRotationLabel(anatomyPivot.rotation.y);
      }
      focusedViewRef.current = {
        position: camera.position.clone(),
        target: controls.target.clone(),
        near: camera.near,
        far: camera.far
      };
      requestRender();
    };

    // Rotate the rendered anatomy group itself instead of orbiting the camera.
    // This keeps skeletal, organ, vessel, and nervous layers locked together
    // around the same local vertical axis, like a turntable model.
    const activePointers = new Set();
    let rotationPointer = null;
    const rotationInertia = { velocity: 0, lastX: 0, lastMoveAt: 0 };
    let lastTap = { time: 0, x: 0, y: 0 };
    // Gesture arbitration. A touch gesture stays undecided until it has
    // travelled far enough to reveal its dominant axis: horizontal travel
    // becomes atlas rotation, vertical travel is left entirely to the browser
    // for native page scrolling. Deciding this before any model control
    // engages is what stops the canvas from swallowing vertical swipes.
    // Pointer ids whose gesture was handed to the page instead of the model.
    // Their release must not register as a tap or a double-tap zoom.
    const scrollGesturePointers = new Set();
    const releasePointerCapture = (pointerId) => {
      if (pointerId == null) return;
      try {
        if (renderer.domElement.hasPointerCapture?.(pointerId)) renderer.domElement.releasePointerCapture(pointerId);
      } catch { /* capture already released */ }
    };
    const engageModelInteraction = (capturedPointerId) => {
      if (capturedPointerId != null) renderer.domElement.setPointerCapture?.(capturedPointerId);
      setInteractionQuality(true);
      manager?.setInteractionActive(true);
    };
    const stopModelInteraction = () => {
      if (activePointers.size) return;
      rotationPointer = null;
      setInteractionQuality(false);
      manager?.setInteractionActive(false);
    };
    const onModelPointerDown = (event) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      activePointers.add(event.pointerId);
      if (activePointers.size !== 1) {
        // A second finger turns the gesture into pinch/pan, which OrbitControls
        // owns. Hand back the first pointer so two-finger gestures work.
        releasePointerCapture(rotationPointer?.id);
        rotationPointer = null;
        return;
      }
      userAdjustedViewRef.current = true;
      const isMouse = event.pointerType === 'mouse';
      rotationPointer = {
        id: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        startX: event.clientX,
        startY: event.clientY,
        yaw: anatomyPivot.rotation.y,
        pitch: anatomyPivot.rotation.x,
        // A mouse drag is never ambiguous - the page scrolls by wheel - so it
        // engages immediately. Touch waits for the arbitration step below.
        axis: isMouse ? 'horizontal' : null
      };
      if (isMouse) engageModelInteraction(event.pointerId);
    };
    const onModelPointerMove = (event) => {
      if (!rotationPointer || rotationPointer.id !== event.pointerId || activePointers.size !== 1) return;
      if (!rotationPointer.axis) {
        // Not yet decided: wait until travel reveals which axis the user meant.
        const axis = decideGestureAxis({
          dx: event.clientX - rotationPointer.startX,
          dy: event.clientY - rotationPointer.startY
        });
        if (!axis) return;
        if (axis === 'vertical') {
          // Vertical intent. The browser owns this gesture: never capture the
          // pointer and never rotate, so touch-action: pan-y scrolls the page.
          // Nothing was engaged yet, so there is no model control to unwind.
          scrollGesturePointers.add(event.pointerId);
          rotationPointer = null;
          return;
        }
        rotationPointer.axis = 'horizontal';
        engageModelInteraction(event.pointerId);
      }
      if (rotationPointer.axis !== 'horizontal') return;
      // Do not cancel pointer movement here. With touch-action: pan-y, the
      // browser owns vertical swipes for page scrolling while this handler
      // remains responsible for horizontal atlas rotation.
      const nextYaw = rotationPointer.yaw + (event.clientX - rotationPointer.x) * 0.008;
      // Phase 62: track angular velocity for inertial glide after release.
      const now = performance.now();
      if (now - rotationInertia.lastMoveAt < 60) rotationInertia.velocity = (nextYaw - anatomyPivot.rotation.y) * 0.6;
      rotationInertia.lastMoveAt = now;
      anatomyPivot.rotation.y = nextYaw;
      anatomyPivot.rotation.x = THREE.MathUtils.clamp(rotationPointer.pitch + (event.clientY - rotationPointer.y) * 0.004, -0.34, 0.34);
      setActiveViewPreset('custom');
      updateRotationLabel(anatomyPivot.rotation.y);
      requestRender();
    };
    const onModelPointerUp = (event) => {
      activePointers.delete(event.pointerId);
      releasePointerCapture(event.pointerId);
      const wasScrollGesture = scrollGesturePointers.delete(event.pointerId);
      const wasRotationPointer = rotationPointer?.id === event.pointerId;
      if (wasRotationPointer) {
        rotationPointer = null;
        // Kill inertia if the pointer was idle before release (no fling).
        if (performance.now() - rotationInertia.lastMoveAt > 90) rotationInertia.velocity = 0;
      }
      if (wasScrollGesture || event.type === 'pointercancel') {
        // The gesture belonged to the page (or the browser reclaimed it for
        // scrolling). Do not let its release seed a tap, otherwise a scroll
        // ending near an earlier tap would zoom the model.
        lastTap = { time: 0, x: 0, y: 0 };
        stopModelInteraction();
        return;
      }
      // Phase 62: double-tap focuses the current selection, or zooms in.
      const moved = wasRotationPointer ? Math.hypot(event.clientX - rotationInertia.lastX, 0) : 0;
      const now = performance.now();
      if (now - lastTap.time < 320 && Math.abs(event.clientX - lastTap.x) < 24 && Math.abs(event.clientY - lastTap.y) < 24) {
        if (selectedPartRef.current) frameSelectionRef.current?.();
        else { controls.dollyIn(1.35); controls.update(); requestRender(); }
        lastTap = { time: 0, x: 0, y: 0 };
      } else {
        lastTap = { time: now, x: event.clientX, y: event.clientY };
      }
      rotationInertia.lastX = event.clientX;
      stopModelInteraction();
    };
    renderer.domElement.addEventListener('pointerdown', onModelPointerDown, { passive: true });
    renderer.domElement.addEventListener('pointermove', onModelPointerMove, { passive: false });
    renderer.domElement.addEventListener('pointerup', onModelPointerUp, { passive: true });
    renderer.domElement.addEventListener('pointercancel', onModelPointerUp, { passive: true });

    // Wait for the on-demand manager import before starting the atlas load.
    managerModule.then(() => manager.load()).then(async () => {
      if (disposed) return;
      if (focusSystems?.length) {
        setSearchMessage(`Loading certified ${focusLabel || 'reference'} structures…`);
        await manager.ensureSystems(focusSystems);
        if (!disposed) { fitFocusedObject(); setSearchMessage(`${focusLabel || 'Reference object'} ready · rotate to inspect`); }
      }
      const requested = new URLSearchParams(window.location.hash.replace(/^#/, '')).get('anatomy');
      if (requested) {
        const result = await manager.searchAndLoad(requested);
        if (result) { setSelectedPart(result); setHovered(result); setSearchMessage(`Opened ${result.commonName} from the shared view.`); }
      }
    }).catch((loadError) => { if (!disposed && manager) setError(loadError?.message || 'The certified anatomy atlas could not be loaded.'); });

    // Phase 42: SSAO composer, loaded lazily on capable tiers only. If the
    // import or initialization fails (older GPUs, unusual contexts) the atlas
    // silently keeps direct rendering — visual enhancement, never a blocker.
    let postFX = null;
    let postFXFailed = false;
    if (capabilities.postprocessing) {
      import('../lib/atlasPostFX.js').then(({ createAtlasPostFX }) => {
        if (disposed || postFXFailed) return;
        try {
          const { width, height } = mount.getBoundingClientRect();
          postFX = createAtlasPostFX({ renderer, scene, camera, width: width || 1, height: height || 1 });
          postFX.setSize(width || 1, height || 1, pixelRatio);
          if (typeof performance !== 'undefined') performance.mark('hbl-postfx-ready');
          requestRender();
        } catch {
          postFXFailed = true;
          postFX = null;
        }
      }).catch(() => { postFXFailed = true; });
    }
    const resize = () => {
      const { width, height } = mount.getBoundingClientRect();
      if (!width || !height) return;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
      postFX?.setSize(width, height, pixelRatio);
      needsRender = true;
    };
    const animate = (time = 0) => {
      frameId = 0;
      if (disposed || document.hidden) return;
      const frameTime = previousFrameTime ? time - previousFrameTime : 0;
      if (isMobile && frameTime) {
        if (frameTime > 42) slowFrameStreak += 1;
        else slowFrameStreak = Math.max(0, slowFrameStreak - 1);
        if (slowFrameStreak >= 8 && pixelRatio > 1) {
          pixelRatio = Math.max(1, pixelRatio - 0.25);
          renderer.setPixelRatio(pixelRatio);
          resize();
          slowFrameStreak = 0;
        }
      }
      // Phase 48: deterministic camera fly-to tween (skipped entirely under
      // reduced motion — frameSelection jumps instantly instead).
      const tween = flyToRef.current;
      if (tween) {
        // R5 (F6): the tween owns the camera — pause OrbitControls damping so
        // the two integrators don't fight (arrival jitter).
        controls.enableDamping = false;
        const progress = Math.min(1, (performance.now() - tween.start) / tween.duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        controls.object.position.lerpVectors(tween.fromPos, tween.toPos, eased);
        controls.target.lerpVectors(tween.fromTarget, tween.toTarget, eased);
        controls.update();
        if (progress >= 1) {
          flyToRef.current = null;
          controls.enableDamping = !reducedMotion;
        }
      }
      // Phase 62 · R6 (F5): inertial turntable decay after pointer release,
      // scaled by frame delta so 30 fps phones decay at the same wall-clock
      // rate as 60/120 fps desktops.
      if (rotationInertia.velocity && !rotationPointer && !reducedMotion) {
        const dtScale = frameTime ? Math.min(3, frameTime / 16.7) : 1;
        anatomyPivot.rotation.y += rotationInertia.velocity * dtScale;
        rotationInertia.velocity *= Math.pow(0.92, dtScale);
        if (Math.abs(rotationInertia.velocity) < 0.0004) rotationInertia.velocity = 0;
        setActiveViewPreset('custom');
        updateRotationLabel(anatomyPivot.rotation.y);
      }
      if (diagnosticsEnabled && frameTime > 0) {
        performanceSample.frames += 1;
        performanceSample.elapsed += frameTime;
        performanceSample.worstFrame = Math.max(performanceSample.worstFrame, frameTime);
        if (!performanceSample.lastSample) performanceSample.lastSample = time;
      }
      previousFrameTime = time;
      rendering = true;
      const changed = controls.update() === true;
      const overlayChanged = manager ? manager.update(time) : false;
      if (needsRender || changed || overlayChanged) {
        if (postFX) postFX.render();
        else renderer.render(scene, camera);
        needsRender = false;
      }
      if (diagnosticsEnabled && performanceSample.lastSample && time - performanceSample.lastSample >= 750) {
        setPerformanceStats({
          fps: Math.round((performanceSample.frames / (performanceSample.elapsed / 1000)) * 10) / 10,
          worstFrame: Math.round(performanceSample.worstFrame),
          pixelRatio: Math.round(pixelRatio * 100) / 100,
          drawCalls: renderer.info.render.calls,
          quality: activeQualityId,
        });
        performanceSample.frames = 0;
        performanceSample.elapsed = 0;
        performanceSample.worstFrame = 0;
        performanceSample.lastSample = time;
      }
      rendering = false;
      if ((changed || needsRender || overlayChanged) && !frameId) frameId = window.requestAnimationFrame(animate);
    };
    const onVisibilityChange = () => {
      if (document.hidden) {
        if (frameId) window.cancelAnimationFrame(frameId);
        frameId = 0;
      } else {
        needsRender = true;
        requestRender();
      }
    };
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => { resize(); requestRender(); }) : null;
    observer?.observe(mount);
    document.addEventListener('visibilitychange', onVisibilityChange);
    resize();
    requestRender();

    return () => {
      disposed = true;
      if (frameId) window.cancelAnimationFrame(frameId);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      observer?.disconnect();
      renderer.domElement.removeEventListener('pointerdown', onModelPointerDown);
      renderer.domElement.removeEventListener('pointermove', onModelPointerMove);
      renderer.domElement.removeEventListener('pointerup', onModelPointerUp);
      renderer.domElement.removeEventListener('pointercancel', onModelPointerUp);
      renderer.domElement.removeEventListener('wheel', onWheelPageScroll);
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', onContextRestored);
      controls.dispose();
      if (managerRef.current) { managerRef.current.dispose(); managerRef.current = null; }
      anatomyRootRef.current = null;
      requestRenderRef.current = null;
      qualityControllerRef.current = null;
      if (postFX) { postFX.dispose(); postFX = null; }
      renderer.dispose();
      renderer.domElement.remove();
      controlsRef.current = null;
      if (pmrem) { pmrem.dispose(); pmrem = null; }
      scene.environment = null;
    };
  }, [reducedMotion, accessibleMode, focusSystems, focusLabel, viewPresets, rendererGeneration]);

  useEffect(() => {
    Object.entries(layers).forEach(([id, patch]) => managerRef.current?.setLayerState(id, patch));
  }, [layers]);

  const changeLayer = (id, patch) => {
    setLayers((previous) => ({ ...previous, [id]: { ...previous[id], ...patch } }));
    if (patch.visible) managerRef.current?.ensureSystems(ANATOMY_LAYERS[id]?.systems || []).catch(() => setSearchMessage(`Could not load the ${ANATOMY_LAYERS[id]?.label || 'selected'} layer.`));
  };

  const rotateAnatomy = (yawDelta, pitchDelta = 0) => {
    const root = anatomyRootRef.current;
    if (!root) return;
    root.rotation.y += yawDelta;
    root.rotation.x = THREE.MathUtils.clamp(root.rotation.x + pitchDelta, -0.34, 0.34);
    userAdjustedViewRef.current = true;
    setActiveViewPreset('custom');
    requestRenderRef.current?.();
  };

  const applyViewPreset = (presetId) => {
    const root = anatomyRootRef.current;
    const preset = VIEW_PRESET_CONFIG[presetId];
    if (!root || !preset || !viewPresets.includes(presetId)) return;
    userAdjustedViewRef.current = true;
    root.rotation.set(preset.pitch, preset.yaw, 0);
    setActiveViewPreset(presetId);
    setRotationLabel(`${preset.label.toUpperCase()} VIEW`);
    requestRenderRef.current?.();
  };

  const resetView = () => {
    const controls = controlsRef.current;
    const root = anatomyRootRef.current;
    if (!controls || !root) return;
    const focusedView = focusSystems?.length ? focusedViewRef.current : null;
    if (focusedView) {
      controls.object.position.copy(focusedView.position);
      controls.target.copy(focusedView.target);
      controls.object.near = focusedView.near;
      controls.object.far = focusedView.far;
      controls.object.updateProjectionMatrix();
    } else {
      controls.object.position.copy(defaultCamera);
      controls.target.set(0, 0.86, 0);
    }
    userAdjustedViewRef.current = false;
    root.rotation.set(0, 0.08, 0);
    controls.update();
    requestRenderRef.current?.();
    setActiveViewPreset('default');
    setRotationLabel('3/4 VIEW');
  };

  // Phase 30: frame the selected structure without moving the turntable. The
  // camera dollies along the current view direction to the part bounds so the
  // learner keeps their chosen orientation.
  const frameSelection = () => {
    const controls = controlsRef.current;
    const root = anatomyRootRef.current;
    const manager = managerRef.current;
    if (!controls || !root || !manager || !selectedPart) return;
    const bounds = manager.getPartBounds(selectedPart);
    if (!bounds) { setSearchMessage('This structure has no frameable bounds yet.'); return; }
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    bounds.getSize(size);
    bounds.getCenter(center);
    root.updateMatrixWorld(true);
    const worldScale = new THREE.Vector3();
    root.getWorldScale(worldScale);
    center.applyMatrix4(root.matrixWorld);
    const radius = Math.max(size.length() * 0.5 * worldScale.x, 0.05);
    const direction = new THREE.Vector3().subVectors(controls.object.position, controls.target).normalize();
    const toPos = center.clone().add(direction.multiplyScalar(Math.max(radius * 3.4, controls.minDistance + 0.05)));
    // Phase 48: smooth fly-to; reduced motion jumps instantly.
    if (reducedMotion) {
      controls.target.copy(center);
      controls.object.position.copy(toPos);
      controls.update();
    } else {
      flyToRef.current = { start: performance.now(), duration: 650, fromPos: controls.object.position.clone(), toPos, fromTarget: controls.target.clone(), toTarget: center.clone() };
    }
    userAdjustedViewRef.current = true;
    requestRenderRef.current?.();
    setSearchMessage(`Framed ${selectedPart.commonName}. Press R to reset the full view.`);
  };
  frameSelectionRef.current = frameSelection;

  // Phase 44: named presentation presets rebalance the shared lighting rig.
  const applyPresentationPreset = (presetId) => {
    const preset = getAtlasLightingPreset(presetId);
    const lights = lightsRef.current;
    if (!lights) return;
    const mobileScale = window.matchMedia?.('(max-width: 767px)')?.matches ? 0.72 : getDeviceProfile().isTV ? 0.8 : 1;
    lights.renderer.toneMappingExposure = preset.exposure;
    if (lights.hemisphere) lights.hemisphere.intensity = preset.hemisphereIntensity * mobileScale;
    lights.key.intensity = preset.keyIntensity * mobileScale;
    lights.fill.intensity = preset.fillIntensity * mobileScale;
    lights.rim.intensity = preset.rimIntensity * mobileScale;
    setPresentationPreset(presetId);
    requestRenderRef.current?.();
  };

  // Phase 47: isolate the selected part / solo its system / restore.
  const toggleIsolation = () => {
    const manager = managerRef.current;
    if (!manager) return;
    if (manager.isolationActive) { manager.clearIsolation(); setIsolationActive(false); setSearchMessage('Showing all loaded layers again.'); return; }
    if (!selectedPart) { setSearchMessage('Select a structure first, then isolate it.'); return; }
    const ok = manager.isolatePart(selectedPart);
    setIsolationActive(ok);
    setSearchMessage(ok ? `Isolated ${selectedPart.commonName}. Hidden layers remain loaded.` : 'This structure cannot be isolated yet.');
  };
  const soloSelectedSystem = () => {
    const manager = managerRef.current;
    if (!manager || !selectedPart?.system) return;
    manager.soloSystems([selectedPart.system]);
    setSearchMessage(`Solo view: ${selectedPart.system} system only.`);
  };
  const showAll = () => {
    managerRef.current?.soloSystems(null);
    managerRef.current?.clearIsolation();
    setIsolationActive(false);
    setSearchMessage('All layers restored.');
  };

  // Phase 49: X-ray ghost mode (visualization, not imaging).
  const toggleXRay = () => {
    const manager = managerRef.current;
    if (!manager) return;
    const active = manager.setXRay(!xrayActive);
    setXrayActive(active);
    setSearchMessage(active ? 'X-ray ghost mode on — visualization mode, not imaging.' : 'X-ray ghost mode off.');
  };

  // Phase 52: section plane.
  const applyClip = (next) => {
    managerRef.current?.setClippingPlane(next);
    setClipState(next);
  };

  // Phase 58: educational measurement between two part bounds.
  const handleMeasure = () => {
    const manager = managerRef.current;
    if (!manager || !selectedPart) return;
    if (!measureAnchor) { setMeasureAnchor(selectedPart); setMeasureResult(null); setSearchMessage(`Measure anchor: ${selectedPart.commonName}. Select a second structure.`); return; }
    if (measureAnchor.id === selectedPart.id) { setSearchMessage('Pick a different second structure.'); return; }
    const result = manager.measureParts(measureAnchor, selectedPart);
    setMeasureResult(result ? { ...result, from: measureAnchor.commonName, to: selectedPart.commonName } : null);
    setMeasureAnchor(null);
  };

  // Phase 60: labeled conceptual contraction pulse for muscle parts.
  const pulseMuscle = () => {
    const manager = managerRef.current;
    if (!manager || !selectedPart) return;
    if (selectedPart.system !== 'muscular') { setSearchMessage('Select a muscle structure first.'); return; }
    if (reducedMotion) { setSearchMessage('Contraction is a conceptual teaching cue; motion is paused under reduced motion.'); return; }
    manager.triggerContractionPulse();
    setSearchMessage('Conceptual contraction pulse — the source mesh itself does not move.');
  };

  // Phase 56: bookmarks keep camera-free semantic state shareable locally.
  const saveBookmark = () => {
    try {
      const list = JSON.parse(window.localStorage.getItem('hbl-atlas-bookmarks') || '[]');
      list.unshift({ id: `bk-${Date.now()}`, name: selectedPart?.commonName || rotationLabel, part: selectedPart?.conceptId || null, layers: managerRef.current?.getLayerState() || null, savedAt: new Date().toISOString() });
      window.localStorage.setItem('hbl-atlas-bookmarks', JSON.stringify(list.slice(0, 12)));
      setSearchMessage('Bookmark saved locally.');
      setBookmarksOpen(true);
    } catch { setSearchMessage('Bookmarks are unavailable in this browser.'); }
  };
  const listBookmarks = () => {
    try { return JSON.parse(window.localStorage.getItem('hbl-atlas-bookmarks') || '[]'); } catch { return []; }
  };
  const applyBookmark = (bookmark) => {
    if (bookmark.layers) Object.entries(bookmark.layers).forEach(([id, patch]) => changeLayer(id, patch));
    if (bookmark.part) managerRef.current?.searchAndLoad(bookmark.part).then((result) => { if (result) { setSelectedPart(result); setHovered(result); } });
    setBookmarksOpen(false);
    setSearchMessage(`Restored bookmark: ${bookmark.name}`);
  };
  const deleteBookmark = (id) => {
    try { window.localStorage.setItem('hbl-atlas-bookmarks', JSON.stringify(listBookmarks().filter((item) => item.id !== id))); setBookmarksOpen(false); setTimeout(() => setBookmarksOpen(true), 0); } catch { /* storage can be unavailable */ }
  };
  const savePartNote = (note) => {
    if (!selectedPart?.id) return;
    const next = { ...atlasNotes };
    if (note.trim()) next[selectedPart.id] = note; else delete next[selectedPart.id];
    setAtlasNotes(next);
    try { window.localStorage.setItem('hbl-atlas-notes', JSON.stringify(next)); } catch { /* storage can be unavailable */ }
  };

  const handleKeyDown = (event) => {
    const controls = controlsRef.current;
    if (!controls) return;
    if (event.key === 'Escape' || event.key.toLowerCase() === 'r') { event.preventDefault(); resetView(); return; }
    if (event.key.toLowerCase() === 'f') { event.preventDefault(); frameSelection(); return; }
    if (event.key.toLowerCase() === 'i') { event.preventDefault(); toggleIsolation(); return; }
    if (event.key.toLowerCase() === 'x') { event.preventDefault(); toggleXRay(); return; }
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); rotateAnatomy(event.key === 'ArrowLeft' ? 0.16 : -0.16); }
    else if (event.key === 'ArrowUp' || event.key === 'ArrowDown') { event.preventDefault(); rotateAnatomy(0, event.key === 'ArrowUp' ? 0.1 : -0.1); }
    else if (event.key === '+' || event.key === '=') { event.preventDefault(); controls.dollyIn(1.12); controls.update(); }
    else if (event.key === '-' || event.key === '_') { event.preventDefault(); controls.dollyOut(1.12); controls.update(); }
  };

  const toggleAtlasFullscreen = async () => {
    const target = mapWrapRef.current;
    if (!target) return;
    try {
      if (document.fullscreenElement) await document.exitFullscreen?.();
      else if (target.requestFullscreen) await target.requestFullscreen({ navigationUI: 'hide' });
      else setAtlasFullscreen((value) => !value);
    } catch {
      // iOS Safari and embedded previews may not expose Fullscreen API. The
      // CSS fallback still provides a usable viewport-filling atlas.
      setAtlasFullscreen((value) => !value);
    }
  };

  const searchAtlas = async (event) => {
    event.preventDefault();
    const query = atlasQuery.trim();
    if (!query) { setSearchMessage('Type a structure, system, or FMA concept.'); return; }
    setSearchMessage('Loading the matching anatomy slice…');
    const result = await managerRef.current?.searchAndLoad(query);
    if (!result) { setSearchMessage('No matching structure was found in the reference atlas.'); return; }
    setSelectedPart(result);
    setHovered(result);
    setSearchMessage(`Found ${result.commonName}`);
    setMobileToolsOpen(false);
    onAnatomySelectRef.current?.(result);
  };

  const shareSelection = async () => {
    if (!hudPart?.id || hudPart.id === '—') return;
    const url = `${window.location.href.split('#')[0]}#anatomy=${encodeURIComponent(hudPart.conceptId || hudPart.id)}`;
    try {
      if (navigator.share) await navigator.share({ title: `${hudPart.commonName} · Human Biology Lab`, text: `Explore ${hudPart.commonName} in the anatomy atlas.`, url });
      else { await navigator.clipboard?.writeText(url); setSearchMessage('Share link copied.'); }
      window.history.replaceState(null, '', url);
    } catch { /* sharing can be cancelled by the user */ }
  };

  const region = hovered ? organRegions.find((item) => item.systems.includes(hovered.system)) : null;
  const hudPart = selectedPart || hovered || getAnatomyMetadataFallback(region?.systems?.[0] || 'cardiac');

  return <div ref={mapWrapRef} className={`body-map-wrap body-map-3d-wrap ${focusSystems?.length ? 'reference-object-mode' : ''} ${atlasFullscreen ? 'atlas-fullscreen' : ''} ${accessibleMode ? 'accessible-atlas-active' : ''}`}>
    <div className="map-topline"><span className="eyebrow">{focusSystems?.length ? `CERTIFIED 3D REFERENCE · ${focusLabel || 'ANATOMY'}` : `CERTIFIED ANATOMY ATLAS · ${accessibleMode ? '2D' : '3D'}`}</span><span className="map-coordinates">{accessibleMode ? 'KEYBOARD-READY VIEW' : `${rotationLabel} · ADULT MALE REFERENCE · SIMPLIFIED EDUCATIONAL VISUALIZATION`}</span><button type="button" className="atlas-accessible-toggle" onClick={() => setAccessibleMode((value) => !value)} aria-pressed={accessibleMode}>{accessibleMode ? 'Use 3D atlas' : 'Accessible 2D mode'}</button>{!accessibleMode && <button type="button" className="atlas-fullscreen-trigger" onClick={toggleAtlasFullscreen} aria-pressed={atlasFullscreen} title={atlasFullscreen ? 'Exit full screen atlas' : 'Open full screen atlas'}><Icon name="fullscreen" size={13} /><span>{atlasFullscreen ? 'Exit screen' : 'Full screen'}</span></button>}</div>
    {!accessibleMode && <div className={`body-map-stage body-3d-stage body-3d-certified ${focusMode ? 'focus-mode' : ''}`} tabIndex="0" role="application" aria-label="Certified three-dimensional human anatomy viewer. Drag to rotate the anatomy around its own axis, use two fingers to pan and pinch to zoom, plus and minus to zoom, F to frame the selected structure, and R to reset." onKeyDown={handleKeyDown}>
      <div className="map-grid" /><div className="scan-line" /><div className="body-glow body-glow-one" /><div className="body-glow body-glow-two" />
      <form id="atlas-search-panel" className={`anatomy-search ${mobileToolsOpen ? 'mobile-open' : ''}`} onSubmit={searchAtlas} role="search">
        <label htmlFor="atlas-structure-search">Find structure</label>
        <div><input id="atlas-structure-search" value={atlasQuery} onChange={(event) => { setAtlasQuery(event.target.value); setSearchMessage(''); }} placeholder="Organ, system, FMA…" autoComplete="off" /><button type="submit" aria-label="Search anatomy">Find</button></div>
        <span aria-live="polite">{searchMessage || 'Search loaded atlas structures'}</span>
      </form>
      <nav id="atlas-learning-systems" className={`three-system-nav ${mobileToolsOpen ? 'mobile-open' : ''}`} aria-label="Select a body system">
        <span className="three-system-nav-title">LEARNING SYSTEMS</span>
        {organRegions.map((system) => <button key={system.id} className={visited[system.id] ? 'visited' : ''} style={{ '--system-accent': system.color }} onMouseEnter={() => setHovered({ commonName: system.label, system: system.systems[0], primaryFunction: system.detail })} onFocus={() => setHovered({ commonName: system.label, system: system.systems[0], primaryFunction: system.detail })} onMouseLeave={() => setHovered(null)} onBlur={() => setHovered(null)} onClick={() => { onSelectRef.current(system.id); setMobileToolsOpen(false); }} aria-label={`Explore ${system.label}`}><i /><span>{system.label}</span>{visited[system.id] && <b aria-label="visited">✓</b>}</button>)}
      </nav>
      <div ref={mountRef} className="body-3d-mount" />
      {!error && !atlasReady && <div className="atlas-startup-state" role="status" aria-live="polite"><span className="atlas-startup-spinner" aria-hidden="true" /><strong>Preparing skeletal layer</strong><div className="atlas-startup-progress" aria-hidden="true"><span style={{ width: `${Math.max(4, loadProgress)}%` }} /></div><small>{loadProgress ? `Decoded ${loadProgress}% of the atlas download` : 'Fetching the first anatomy slice…'}</small></div>}
      {contextLost && !error && <div className="atlas-context-lost" role="status" aria-live="assertive"><strong>3D graphics interrupted</strong><span>The graphics context was suspended (tab switch, GPU reset, or low memory). The atlas will rebuild automatically; your selected layers stay in place.</span></div>}
      {error && <div className="body-3d-fallback"><Icon name="lab" size={27} /><strong>{error}</strong><span>Use the system index to continue exploring. The model uses BodyParts3D 4.0 anatomy data.</span><button type="button" onClick={() => setAccessibleMode(true)}>Switch to accessible 2D anatomy</button></div>}
      <div className="three-hud three-hud-top"><span><i className="live-dot" /> {error ? 'Accessible atlas mode' : atlasFullReady ? 'Full requested atlas ready' : atlasReady ? 'Skeletal layer ready · on-demand systems' : 'Preparing skeletal layer'}</span><span>2,234 structures · CC BY 4.0</span></div>
      {diagnosticsEnabled && performanceStats && <div className="atlas-debug-hud" aria-live="polite">{performanceStats.fps} FPS · {performanceStats.worstFrame} ms max · {performanceStats.drawCalls} calls · DPR {performanceStats.pixelRatio} · {performanceStats.quality}</div>}
      <AnatomyLayerController layers={layers} onChange={changeLayer} mobileOpen={mobileLayersOpen} onMobileToggle={() => setMobileLayersOpen((value) => !value)} />
      <div id="atlas-anatomy-hotspot" className={`anatomy-hud-card ${mobileHudOpen ? 'mobile-open' : ''}`} aria-live="polite"><span className="hover-card-kicker">ANATOMY HOTSPOT · {hudPart.system || 'visceral'}{selectedPart ? ' · PART-LEVEL SELECTION' : ''}</span><strong>{hudPart.commonName}</strong><dl><div><dt>Latin / FMA</dt><dd>{hudPart.latinName} · {hudPart.conceptId || '—'}</dd></div><div><dt>Function</dt><dd>{hudPart.primaryFunction}</dd></div><div><dt>Clinical note</dt><dd>{hudPart.clinicalSignificance}</dd></div></dl><small>{hudPart.educationalModel}</small><div className="anatomy-hud-actions"><button type="button" onClick={frameSelection} disabled={!selectedPart} title="Frame the selected structure (F)">Focus selection</button><button type="button" onClick={toggleIsolation} disabled={!selectedPart && !isolationActive} aria-pressed={isolationActive} title="Isolate the selected structure (I)">{isolationActive ? 'Show all' : 'Isolate'}</button><button type="button" onClick={soloSelectedSystem} disabled={!selectedPart} title="Show only this structure's system">Solo system</button><button type="button" onClick={handleMeasure} disabled={!selectedPart} title="Educational-scale distance between two structures">{measureAnchor ? 'Measure to this part' : 'Measure from here'}</button>{selectedPart?.system === 'muscular' && <button type="button" onClick={pulseMuscle} title="Conceptual contraction pulse — the source mesh does not move">Contraction pulse</button>}<button type="button" onClick={shareSelection}>Share structure</button></div>
      {measureResult && <div className="atlas-measure-row" role="status" aria-live="polite"><span className="eyebrow">EDUCATIONAL MEASUREMENT · NOT CLINICAL</span><strong>{measureResult.from} ↔ {measureResult.to}: ≈ {measureResult.approxCm.toFixed(1)} cm</strong><small>Atlas-scale approximation between part bounds centers.</small></div>}
      {measureAnchor && !measureResult && <div className="atlas-measure-row" role="status" aria-live="polite"><span className="eyebrow">MEASURING</span><strong>Anchor: {measureAnchor.commonName}</strong><small>Select a second structure to complete the measurement.</small></div>}
      {selectedPart && <label className="atlas-part-note"><span>PIN NOTE (saved locally)</span><textarea value={atlasNotes[selectedPart.id] || ''} onChange={(event) => savePartNote(event.target.value)} placeholder="Add a study note for this structure…" rows={2} aria-label={`Study note for ${selectedPart.commonName}`} /></label>}</div>
      <div className="three-hud three-hud-bottom"><span className="touch-hint"><Icon name="fullscreen" size={13} /> Drag rotate · pinch zoom · two-finger pan</span><span className="three-view-buttons">{focusSystems?.length > 0 && viewPresets.length > 0 && <span className="atlas-view-presets" aria-label="Reference orientation presets">{viewPresets.map((presetId) => { const preset = VIEW_PRESET_CONFIG[presetId]; if (!preset) return null; return <button key={presetId} type="button" className={activeViewPreset === presetId ? 'active' : ''} onClick={() => applyViewPreset(presetId)} aria-pressed={activeViewPreset === presetId} title={`${preset.label} reference orientation`}>{preset.label}</button>; })}</span>}<button className="atlas-tools-toggle" type="button" onClick={() => { setMobileToolsOpen((value) => !value); setMobileLayersOpen(false); setMobileHudOpen(false); }} aria-expanded={mobileToolsOpen} aria-controls="atlas-search-panel atlas-learning-systems" title={mobileToolsOpen ? 'Hide atlas tools' : 'Show atlas tools'}>{mobileToolsOpen ? 'Hide tools' : 'Tools'}</button><button className="atlas-layers-toggle" type="button" onClick={() => { setMobileLayersOpen((value) => !value); setMobileToolsOpen(false); setMobileHudOpen(false); }} aria-expanded={mobileLayersOpen} aria-controls="atlas-layer-controller" title={mobileLayersOpen ? 'Hide peeling controller' : 'Show peeling controller'}>{mobileLayersOpen ? 'Hide layers' : 'Layers'}</button><button className="atlas-hotspot-toggle" type="button" onClick={() => { setMobileHudOpen((value) => !value); setMobileToolsOpen(false); setMobileLayersOpen(false); }} aria-expanded={mobileHudOpen} aria-controls="atlas-anatomy-hotspot" title={mobileHudOpen ? 'Hide anatomy hotspot details' : 'Show anatomy hotspot details'}>{mobileHudOpen ? 'Hide details' : 'Hotspot details'}</button><button className="atlas-focus-toggle" type="button" onClick={() => { setFocusMode((value) => !value); setMobileToolsOpen(false); setMobileLayersOpen(false); setMobileHudOpen(false); }} aria-pressed={focusMode} title={focusMode ? 'Show atlas controls' : 'Focus on the 3D model'}>{focusMode ? 'Show controls' : 'Focus model'}</button><button type="button" onClick={toggleXRay} aria-pressed={xrayActive} title="X-ray ghost mode — visualization mode, not imaging (X)">X-ray</button><button type="button" onClick={() => applyClip(clipState ? null : { axis: 'transverse', position: 1.1 })} aria-pressed={Boolean(clipState)} title="Section plane — no implied internal anatomy">Section</button><button type="button" onClick={() => { setStructurePanelOpen((value) => !value); setBookmarksOpen(false); }} aria-pressed={structurePanelOpen} aria-controls="atlas-structure-index" title="Semantic structure index">Structures</button><button type="button" onClick={() => { setBookmarksOpen((value) => !value); setStructurePanelOpen(false); }} aria-pressed={bookmarksOpen} aria-controls="atlas-bookmarks-panel" title="Local bookmarks">Bookmarks</button><button type="button" onClick={() => { setQuizOpen((value) => !value); setStructurePanelOpen(false); setBookmarksOpen(false); }} aria-pressed={quizOpen} title="Identify highlighted structures">{quizOpen ? 'Close quiz' : 'Label quiz'}</button><label className="atlas-preset-select" title="Presentation lighting preset"><span className="visually-hidden">Presentation preset</span><select value={presentationPreset} onChange={(event) => applyPresentationPreset(event.target.value)} aria-label="Presentation lighting preset">{Object.values(ATLAS_LIGHTING_PRESETS).map((preset) => <option key={preset.id} value={preset.id}>{preset.label}</option>)}</select></label><button type="button" onClick={() => setWidePick((value) => !value)} aria-pressed={widePick} title="Wide pick makes small valves and vessels easier to select">Wide pick</button><button type="button" onClick={resetView} title="Return to three-quarter view">Reset view</button></span></div>
      {clipState && <div className="atlas-clip-controls" aria-label="Section plane controls"><span className="eyebrow">SECTION PLANE · NO IMPLIED INTERNAL ANATOMY</span><div><select value={clipState.axis} onChange={(event) => applyClip({ ...clipState, axis: event.target.value })} aria-label="Section orientation"><option value="transverse">Transverse</option><option value="sagittal">Sagittal</option><option value="coronal">Coronal</option></select><input type="range" min="-0.2" max="1.9" step="0.01" value={clipState.position} onChange={(event) => applyClip({ ...clipState, position: Number(event.target.value) })} aria-label="Section plane position" /><button type="button" onClick={() => applyClip(null)}>Clear</button></div></div>}
      {(xrayActive || clipState) && <div className="atlas-mode-disclosure" role="note">{xrayActive && <span>{RENDERING_MODES.xray.disclosure} Shows loaded layers only.</span>}{clipState && <span>{RENDERING_MODES.clipping.disclosure}</span>}</div>}
      {structurePanelOpen && <React.Suspense fallback={null}><LazyStructureIndexPanel manager={managerRef.current} query={structureQuery} setQuery={setStructureQuery} onPick={async (part) => { const result = await managerRef.current?.searchAndLoad(part.name); if (result) { setSelectedPart(result); setHovered(result); setSearchMessage(`Focused ${result.commonName} from the structure index.`); onAnatomySelectRef.current?.(result); } }} onClose={() => setStructurePanelOpen(false)} /></React.Suspense>}
      {bookmarksOpen && <React.Suspense fallback={null}><LazyBookmarksPanel list={listBookmarks()} onSave={saveBookmark} onApply={applyBookmark} onDelete={deleteBookmark} onClose={() => setBookmarksOpen(false)} /></React.Suspense>}
      {quizOpen && <React.Suspense fallback={null}><LazyAtlasLabelQuiz manager={managerRef.current} onClose={() => setQuizOpen(false)} /></React.Suspense>}
      <div className={`hover-card ${region ? 'visible' : ''}`} style={region ? { '--hover-accent': region.color } : undefined}><span className="hover-card-kicker">ANATOMICAL SYSTEM</span><strong>{region?.label || 'Certified human anatomy'}</strong><span>{region?.detail || 'Tap a structure or use the system index'}</span><Icon name="arrow" size={15} /></div>
      <div className="map-scale"><span>3D</span><b /><span>BodyParts3D 4.0</span></div>
    </div>}
    {accessibleMode && <React.Suspense fallback={null}><LazyAccessibleAtlasMode onSelect={onSelectRef.current} onAnatomySelect={onAnatomySelectRef.current} initialSystemId={focusSystems?.[0]} visited={visited} /></React.Suspense>}
    <div className="map-footer"><span><i className="live-dot" /> {accessibleMode ? 'Accessible anatomy map ready' : atlasFullReady ? 'Full requested atlas ready' : atlasReady ? 'Skeletal layer ready · systems load on demand' : 'Preparing reference model'}</span><span>{accessibleMode ? 'Select a system with keyboard or touch' : 'Drag · Pinch · Two-finger pan · Tap a structure'}</span></div>
  </div>;
}

function AnatomyLayerController({ layers, onChange, mobileOpen = false, onMobileToggle }) {
  const [expanded, setExpanded] = useState(() => typeof window === 'undefined' || !window.matchMedia?.('(max-width: 767px)')?.matches);
  const isCompact = typeof window !== 'undefined' && window.matchMedia?.('(max-width: 900px)')?.matches;
  const isOpen = isCompact ? mobileOpen : expanded;
  const toggle = () => { if (isCompact) onMobileToggle?.(); else setExpanded((value) => !value); };
  return <aside id="atlas-layer-controller" className={`anatomy-layer-controller ${isOpen ? 'expanded' : 'collapsed'} ${isCompact && isOpen ? 'mobile-open' : ''}`} aria-label="Anatomy layer controller"><button type="button" className="layer-controller-toggle" onClick={toggle} aria-expanded={isOpen}><span><span className="eyebrow">PEELING CONTROLLER</span><strong>Reveal anatomical layers</strong></span><Icon name="chevron" size={14} /></button>{isOpen && <div className="layer-controller-body">{Object.entries(ANATOMY_LAYERS).map(([id, layer]) => <div className={`anatomy-layer-row ${layers[id].visible ? 'is-visible' : ''}`} style={{ '--layer-accent': layer.accent }} key={id}><label><input type="checkbox" checked={layers[id].visible} onChange={(event) => onChange(id, { visible: event.target.checked })} /><i className="layer-swatch" aria-hidden="true" /><span>{layer.label}</span></label><output>{Math.round(layers[id].opacity * 100)}%</output><input aria-label={`${layer.label} opacity`} type="range" min="0" max="100" value={Math.round(layers[id].opacity * 100)} onChange={(event) => onChange(id, { opacity: Number(event.target.value) / 100, visible: Number(event.target.value) > 0 })} /></div>)}</div>}</aside>;
}
