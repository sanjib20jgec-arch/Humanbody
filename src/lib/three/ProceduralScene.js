// Shared Scene3D shell (cross-cutting §B toolkit): renderer, lights, orbit,
// tap-to-select, cut-away clip plane, highlight, render-on-demand, pause when
// hidden/offscreen, context-loss handling, full disposal. A "builder" adds
// the procedural geometry and maps (chapter, t) → scene state.
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

function isLightTheme() { return typeof document !== 'undefined' && document.documentElement.dataset.theme === 'light'; }

export const clamp01 = (v) => Math.min(1, Math.max(0, v));
export const ease = (v) => { const x = clamp01(v); return x * x * (3 - 2 * x); };
export const seeded = (seed) => () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };

export class ProceduralScene {
  constructor(container, builder, { graphics = 'full', onSelect } = {}) {
    this.container = container;
    this.onSelect = onSelect;
    this.chapter = null; this.t = 0; this.highlight = null;
    this.disposables = []; this.partMeshes = {};
    this.THREE = THREE;

    const renderer = new THREE.WebGLRenderer({ antialias: graphics !== 'low', alpha: true, powerPreference: 'low-power' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, graphics === 'low' ? 1 : 2));
    renderer.localClippingEnabled = true;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.setAttribute('aria-hidden', 'true');
    container.appendChild(renderer.domElement);
    this.renderer = renderer;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(38, 1, 0.05, 80);
    this.baseDistance = builder.cameraDistance || 5.6;
    this.camera.position.set(0.6, 1.6, 5.4).setLength(this.baseDistance);
    this.scene.add(new THREE.HemisphereLight(0xdfe9ff, 0x2a1d3a, 1.1));
    const key = new THREE.DirectionalLight(0xffffff, 1.6); key.position.set(3, 4, 5); this.scene.add(key);
    const rim = new THREE.DirectionalLight(0x88ccff, 0.6); rim.position.set(-4, -2, -3); this.scene.add(rim);
    this.clip = new THREE.Plane(new THREE.Vector3(0, 0, -1), 50);

    this.root = new THREE.Group(); this.scene.add(this.root);
    this.builder = builder;
    this.state = builder.build(this) || {};

    const controls = new OrbitControls(this.camera, renderer.domElement);
    controls.enableDamping = true; controls.enablePan = false;
    controls.minDistance = this.baseDistance * 0.4; controls.maxDistance = this.baseDistance * 2.6;
    controls.addEventListener('change', () => this.requestRender());
    this.controls = controls;

    this.raycaster = new THREE.Raycaster(); this.pointer = new THREE.Vector2();
    let down = null;
    this.onPointerDown = (e) => { down = { x: e.clientX, y: e.clientY }; };
    this.onPointerUp = (e) => { if (down && Math.hypot(e.clientX - down.x, e.clientY - down.y) < 6) this.pick(e); down = null; };
    renderer.domElement.addEventListener('pointerdown', this.onPointerDown);
    renderer.domElement.addEventListener('pointerup', this.onPointerUp);
    renderer.domElement.addEventListener('webglcontextlost', (e) => { e.preventDefault(); this.lost = true; });
    renderer.domElement.addEventListener('webglcontextrestored', () => { this.lost = false; this.requestRender(); });

    this.visible = true;
    this.resizeObserver = new ResizeObserver(() => this.resize()); this.resizeObserver.observe(container);
    this.intersection = new IntersectionObserver(([en]) => { this.visible = en.isIntersecting; if (this.visible) this.requestRender(); });
    this.intersection.observe(container);
    this.onVisibility = () => { if (!document.hidden) this.requestRender(); };
    document.addEventListener('visibilitychange', this.onVisibility);
    this.themeObserver = typeof MutationObserver !== 'undefined' ? new MutationObserver(() => this.applyTheme()) : null;
    this.themeObserver?.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    this.resize();
  }

  track(obj) { this.disposables.push(obj); return obj; }
  mat(color, opts = {}) {
    const m = new THREE.MeshStandardMaterial({ color, roughness: opts.roughness ?? 0.55, metalness: 0.02, clippingPlanes: opts.clip === false ? [] : [this.clip], side: opts.side ?? THREE.FrontSide, transparent: opts.opacity !== undefined, opacity: opts.opacity ?? 1, depthWrite: opts.opacity === undefined || opts.opacity > 0.6 });
    m.userData.base = m.color.clone(); m.userData.baseOpacity = m.opacity;
    this.adaptMaterial(m, isLightTheme());
    return this.track(m);
  }
  // Light theme: pale materials would vanish on a near-white page (R3), so cap lightness and lift faint opacity.
  adaptMaterial(m, light) {
    if (!m.userData?.base) return;
    m.color.copy(m.userData.base);
    m.opacity = m.userData.baseOpacity;
    if (!light) return;
    const hsl = {}; m.color.getHSL(hsl);
    if (hsl.l > 0.6) m.color.setHSL(hsl.h, Math.min(1, hsl.s + 0.1), 0.6 - (hsl.l - 0.6) * 0.5);
    if (m.transparent) m.opacity = Math.max(m.opacity, 0.4);
  }
  applyTheme() {
    const light = isLightTheme();
    for (const d of this.disposables) if (d.isMaterial) this.adaptMaterial(d, light);
    this.requestRender();
  }
  geo(g) { return this.track(g); }
  part(id, mesh, parent = this.root) { mesh.userData.part = id; (this.partMeshes[id] ||= []).push(mesh); parent.add(mesh); return mesh; }

  resize() {
    const w = this.container.clientWidth || 1; const h = this.container.clientHeight || 1;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h; this.camera.updateProjectionMatrix();
    this.camera.position.setLength(this.baseDistance / Math.min(1, (w / h) * 0.85));
    this.controls?.update();
    this.requestRender();
  }

  setChapter(id) { this.chapter = id; this.t = 0; this.apply(); }
  setTime(t) { this.t = t; this.apply(); }
  setHighlight(id) { this.highlight = id; this.apply(); }

  apply() {
    this.builder.apply?.(this, this.chapter, this.t, this.state);
    for (const [id, meshes] of Object.entries(this.partMeshes)) {
      for (const m of meshes) m.material?.emissive?.setHex(this.highlight === id ? 0x553311 : 0x000000);
    }
    this.requestRender();
  }

  pick(e) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hits = this.raycaster.intersectObject(this.root, true).filter((h) => h.object.visible && h.object.userData.part && (!h.object.material.clippingPlanes?.length || this.clip.distanceToPoint(h.point) >= 0));
    const hit = hits.find((h) => !h.object.material.transparent || h.object.material.opacity > 0.5) || hits[0];
    if (hit) this.onSelect?.(hit.object.userData.part);
  }

  requestRender() {
    if (this.pending || this.disposed) return;
    this.pending = true;
    requestAnimationFrame(() => {
      this.pending = false;
      if (this.disposed || this.lost || !this.visible || document.hidden) return;
      const moving = this.controls?.update();
      this.renderer.render(this.scene, this.camera);
      if (moving) this.requestRender();
    });
  }

  dispose() {
    this.disposed = true;
    this.resizeObserver.disconnect(); this.intersection.disconnect();
    document.removeEventListener('visibilitychange', this.onVisibility); this.themeObserver?.disconnect();
    this.renderer.domElement.removeEventListener('pointerdown', this.onPointerDown);
    this.renderer.domElement.removeEventListener('pointerup', this.onPointerUp);
    this.controls.dispose();
    this.root.traverse((o) => { if (o.isInstancedMesh) o.dispose(); });
    this.disposables.forEach((d) => d.dispose?.());
    this.renderer.dispose(); this.renderer.domElement.remove();
  }
}
