import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { ConvexGeometry } from 'three/examples/jsm/geometries/ConvexGeometry.js';
import { ANATOMY_LAYERS, SYSTEM_FUNCTIONS, getAnatomyMetadataFallback } from './anatomyLayers.js';

/**
 * Layer definitions intentionally stay data-driven so a future atlas can add
 * systems without changing the renderer. Opacity is applied to materials,
 * while visibility is kept on the LOD root for cheap draw-call rejection.
 * Canonical definitions live in anatomyLayers.js and are re-exported here for
 * compatibility with existing imports.
 */
export { ANATOMY_LAYERS, getAnatomyMetadataFallback };

const SYSTEM_STYLE = {
  skeletal: { color: 0xe5dec4, opacity: 0.78, roughness: 0.72 },
  connective: { color: 0xb8ccc4, opacity: 0.76, roughness: 0.62 },
  muscular: { color: 0xb86d68, opacity: 0.42, roughness: 0.62 },
  cardiac: { color: 0xb83c4c, opacity: 0.96, roughness: 0.48 },
  respiratory: { color: 0xd68b92, opacity: 0.94, roughness: 0.55 },
  digestive: { color: 0xc27a59, opacity: 0.96, roughness: 0.57 },
  urinary: { color: 0xa9575d, opacity: 0.96, roughness: 0.54 },
  nervous: { color: 0xe0a0ae, opacity: 0.96, roughness: 0.52 },
  sensory: { color: 0xc7e0df, opacity: 0.92, roughness: 0.5 },
  reproductive: { color: 0xd58496, opacity: 0.94, roughness: 0.56 },
  arterial: { color: 0xe0525e, opacity: 0.82, roughness: 0.46 },
  venous: { color: 0x5eaecb, opacity: 0.8, roughness: 0.46 },
  lymphatic: { color: 0xa2c298, opacity: 0.86, roughness: 0.58 },
  endocrine: { color: 0xd1a084, opacity: 0.92, roughness: 0.54 },
  integumentary: { color: 0xcba987, opacity: 0.18, roughness: 0.75 }
};

const defaultLayerState = Object.fromEntries(Object.entries(ANATOMY_LAYERS).map(([id, layer]) => [id, { visible: id === 'skeletal', opacity: layer.opacity }]));
const SEARCH_ALIASES = { heart: 'cardiac', hearts: 'cardiac', vessel: 'cardiac', vessels: 'cardiac', lung: 'respiratory', lungs: 'respiratory', brain: 'nervous', nerve: 'nervous', nerves: 'nervous', kidney: 'urinary', kidneys: 'urinary' };
const SEARCH_SYSTEM_LABELS = { cardiac: 'Heart', respiratory: 'Lungs and airways', nervous: 'Brain and nerves', urinary: 'Kidneys and urinary system' };
const normalizedSearchTerm = (query = '') => {
  const normalized = String(query).trim().toLowerCase();
  return { normalized, term: SEARCH_ALIASES[normalized] || normalized, aliased: SEARCH_ALIASES[normalized] || null };
};
const clockNow = () => typeof performance !== 'undefined' && typeof performance.now === 'function' ? performance.now() : Date.now();

/**
 * Phase 41: wet-tissue material profiles. Clearcoat gives viscera and
 * vessels a restrained moist sheen while bone stays matte — the classic
 * specimen look. These are appearance parameters only; budgets are enforced
 * by scripts/anatomy-materials-qc.mjs so the look cannot drift into gloss
 * that hides color identity.
 */
export const SYSTEM_MATERIAL_PROFILES = {
  skeletal: { clearcoat: 0, clearcoatRoughness: 0.9 },
  connective: { clearcoat: 0.08, clearcoatRoughness: 0.75 },
  muscular: { clearcoat: 0.22, clearcoatRoughness: 0.55 },
  cardiac: { clearcoat: 0.35, clearcoatRoughness: 0.42 },
  respiratory: { clearcoat: 0.3, clearcoatRoughness: 0.5 },
  digestive: { clearcoat: 0.35, clearcoatRoughness: 0.45 },
  urinary: { clearcoat: 0.32, clearcoatRoughness: 0.48 },
  nervous: { clearcoat: 0.26, clearcoatRoughness: 0.52 },
  sensory: { clearcoat: 0.24, clearcoatRoughness: 0.55 },
  reproductive: { clearcoat: 0.3, clearcoatRoughness: 0.5 },
  arterial: { clearcoat: 0.28, clearcoatRoughness: 0.4 },
  venous: { clearcoat: 0.28, clearcoatRoughness: 0.42 },
  lymphatic: { clearcoat: 0.16, clearcoatRoughness: 0.62 },
  endocrine: { clearcoat: 0.3, clearcoatRoughness: 0.5 },
  integumentary: { clearcoat: 0.05, clearcoatRoughness: 0.85 }
};

function createMaterial(system, quality = 'balanced') {
  const spec = SYSTEM_STYLE[system] || SYSTEM_STYLE.connective;
  const profile = SYSTEM_MATERIAL_PROFILES[system] || SYSTEM_MATERIAL_PROFILES.connective;
  const transparent = spec.opacity < 0.98;
  const base = {
    color: spec.color,
    roughness: spec.roughness,
    metalness: 0.03,
    transparent,
    opacity: spec.opacity,
    depthWrite: !transparent,
    depthTest: true,
    side: THREE.DoubleSide,
    // A restrained base emission keeps the color separation readable in the
    // dark atlas without turning the model into a neon illustration.
    emissive: spec.color,
    emissiveIntensity: transparent ? 0.055 : 0.035
  };
  let material;
  if (quality === 'battery') {
    material = new THREE.MeshStandardMaterial(base);
  } else {
    material = new THREE.MeshPhysicalMaterial({
      ...base,
      clearcoat: profile.clearcoat,
      clearcoatRoughness: profile.clearcoatRoughness
    });
  }
  // Phase 49 X-ray toggling restores from these saved base values.
  material.userData.baseTransparent = transparent;
  material.userData.baseDepthWrite = !transparent;
  material.userData.baseOpacity = spec.opacity;
  material.userData.uXRay = { value: 0 };
  // Phase 49: Fresnel ghost mode. When uXRay is raised, surface opacity
  // collapses toward a rim-lit translucency so deeper LOADED layers stay
  // visible. This is a visualization mode, not imaging: nothing hidden is
  // fabricated, and the disclosure travels with the UI toggle.
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uXRay = material.userData.uXRay;
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nuniform float uXRay;')
      .replace('#include <opaque_fragment>', `#include <opaque_fragment>\n{
        vec3 hblViewDir = normalize(vViewPosition);
        float hblFresnel = pow(1.0 - abs(dot(normalize(normal), hblViewDir)), 2.0);
        // R7 (G4): distance-based attenuation gives the ghost stack depth —
        // nearer systems read in front while x-ray mode is active.
        float hblDepthFade = clamp(1.18 - length(vViewPosition) * 0.05, 0.5, 1.0);
        gl_FragColor.a = mix(gl_FragColor.a, (0.06 + 0.55 * hblFresnel) * hblDepthFade, uXRay);
      }`);
  };
  return material;
}

function isGzip(buffer) {
  const bytes = new Uint8Array(buffer, 0, Math.min(2, buffer.byteLength));
  return bytes[0] === 0x1f && bytes[1] === 0x8b;
}

function decodeOnWorker(buffer) {
  if (typeof Worker === 'undefined' || typeof Blob === 'undefined' || typeof URL === 'undefined') return null;
  const source = `self.onmessage = async ({ data }) => {
    try {
      const input = data.buffer;
      if (input.byteLength < 2 || new Uint8Array(input, 0, 2)[0] !== 31 || new Uint8Array(input, 0, 2)[1] !== 139) {
        self.postMessage({ buffer: input }, [input]);
        return;
      }
      if (typeof DecompressionStream === 'undefined') throw new Error('gzip decoding is unavailable in this worker');
      const output = await new Response(new Blob([input]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
      self.postMessage({ buffer: output }, [output]);
    } catch (error) { self.postMessage({ error: error.message || 'worker decode failed' }); }
  };`;
  const url = URL.createObjectURL(new Blob([source], { type: 'text/javascript' }));
  const worker = new Worker(url);
  return new Promise((resolve, reject) => {
    worker.onmessage = ({ data }) => {
      worker.terminate();
      URL.revokeObjectURL(url);
      if (data.error) reject(new Error(data.error));
      else resolve(data.buffer);
    };
    worker.onerror = (error) => {
      worker.terminate();
      URL.revokeObjectURL(url);
      reject(error.error || new Error('worker decode failed'));
    };
    worker.postMessage({ buffer }, [buffer]);
  });
}

async function fetchWithTimeout(resource, options = {}, timeoutMs = 12000) {
  if (typeof AbortController === 'undefined') return fetch(resource, options);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(resource, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function decodeGzip(buffer) {
  if (!isGzip(buffer)) return buffer;
  try {
    const workerResult = decodeOnWorker(buffer.slice(0));
    if (workerResult) return await workerResult;
  } catch {
    // Main-thread fallback keeps older mobile browsers functional.
  }
  if (typeof DecompressionStream === 'undefined') throw new Error('This browser cannot decode the anatomy atlas.');
  return new Response(new Blob([buffer]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
}

class AtlasBinaryCache {
  constructor(name = 'hbl-anatomy-v1') {
    this.name = name;
    this.dbPromise = null;
  }

  setVersion(version = 'v1') {
    const safeVersion = String(version).replace(/[^a-z0-9._-]/gi, '-').slice(0, 48) || 'v1';
    const nextName = `hbl-anatomy-${safeVersion}`;
    if (nextName === this.name) return;
    this.name = nextName;
    this.dbPromise = null;
  }

  async pruneLegacyNamespaces() {
    try {
      if (typeof indexedDB !== 'undefined' && typeof indexedDB.databases === 'function') {
        const databases = await indexedDB.databases();
        await Promise.all((databases || []).map((database) => {
          if (!database.name || !database.name.startsWith('hbl-anatomy-') || database.name === this.name) return null;
          return new Promise((resolve) => {
            const request = indexedDB.deleteDatabase(database.name);
            request.onsuccess = request.onerror = request.onblocked = () => resolve();
          });
        }));
      }
      if (typeof caches !== 'undefined') {
        const names = await caches.keys();
        await Promise.all(names.filter((name) => name.startsWith('hbl-anatomy-') && name !== this.name).map((name) => caches.delete(name)));
      }
    } catch {
      // Cache cleanup is best effort; quota and private browsing can restrict it.
    }
  }

  open() {
    if (this.dbPromise || typeof indexedDB === 'undefined') return this.dbPromise;
    this.dbPromise = new Promise((resolve) => {
      const request = indexedDB.open(this.name, 1);
      request.onupgradeneeded = () => request.result.createObjectStore('chunks');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    });
    return this.dbPromise;
  }

  async get(key) {
    try {
      const db = await this.open();
      if (db) {
        const value = await new Promise((resolve) => {
          const request = db.transaction('chunks', 'readonly').objectStore('chunks').get(key);
          request.onsuccess = () => resolve(request.result || null);
          request.onerror = () => resolve(null);
        });
        if (value) return value;
      }
      if (typeof caches !== 'undefined') {
        const response = await caches.open(this.name).then((cache) => cache.match(key));
        if (response) return await response.arrayBuffer();
      }
    } catch {
      // Storage is an optimization. The network/embedded source remains authoritative.
    }
    return null;
  }

  async put(key, buffer) {
    try {
      const copy = buffer.slice(0);
      const db = await this.open();
      if (db) {
        await new Promise((resolve) => {
          const request = db.transaction('chunks', 'readwrite').objectStore('chunks').put(copy, key);
          request.onsuccess = request.onerror = () => resolve();
        });
      }
      if (typeof caches !== 'undefined' && typeof location !== 'undefined' && /^https?:/i.test(location.protocol)) {
        const cache = await caches.open(this.name);
        await cache.put(key, new Response(buffer.slice(0)));
      }
    } catch {
      // Quota limits and private browsing must not stop the atlas.
    }
  }
}

/**
 * Three.js atlas manager.
 *
 * Responsibilities:
 * - streams and decodes compressed chunks asynchronously;
 * - creates grouped BufferGeometry with per-part group metadata;
 * - exposes a low-detail LOD proxy for heavy systems;
 * - keeps frustum culling enabled on every LOD root;
 * - handles pointer/touch raycasting and an emissive/edge selection state;
 * - owns and disposes every geometry, material, and event listener it creates.
 */
export class AnatomySceneManager {
  constructor({ scene, camera, renderer, root, embeddedAtlas = null, onHover, onSelect, onProgress, onRenderRequest, onChunkError, onChunkReady, onReady, onFullReady, moduleForSystem = {}, quality = 'balanced' } = {}) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this.root = root || new THREE.Group();
    this.embeddedAtlas = embeddedAtlas;
    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';
    const isHandset = /Android.*Mobile|iPhone|iPod|Windows Phone/i.test(userAgent);
    this.isMobile = typeof window !== 'undefined' && (window.matchMedia?.('(max-width: 767px)')?.matches || isHandset);
    this.onHover = onHover;
    this.onSelect = onSelect;
    this.onProgress = onProgress;
    this.onRenderRequest = onRenderRequest;
    this.onChunkError = onChunkError;
    this.onChunkReady = onChunkReady;
    this.onReady = onReady;
    this.onFullReady = onFullReady;
    this.moduleForSystem = moduleForSystem;
    this.quality = ['sharp', 'balanced', 'battery'].includes(quality) ? quality : 'balanced';
    this.cache = new AtlasBinaryCache();
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    this.interactiveObjects = [];
    this.records = [];
    this.materials = new Map();
    this.proxyMaterials = [];
    this._lastUpdateTime = 0;
    this.layerState = typeof structuredClone === 'function' ? structuredClone(defaultLayerState) : JSON.parse(JSON.stringify(defaultLayerState));
    this.highlight = null;
    this.selectionOverlay = null;
    this.hoveredPart = null;
    this._listeners = [];
    this._hoverFrame = 0;
    this._pendingHoverPoint = null;
    this._interactionActive = false;
    this._disposed = false;
    this.manifest = null;
    this.partsByChunk = new Map();
    this.partByConcept = new Map();
    this.loadedChunks = new Set();
    this.loadingChunks = new Map();
    this.totalBytes = 0;
    this.loadedBytes = 0;
    this.teachingOverlayConfig = null;
    this.teachingOverlayKey = null;
    this.teachingOverlay = null;
  }

  setQualityProfile(quality = 'balanced') {
    if (['sharp', 'balanced', 'battery'].includes(quality)) this.quality = quality;
  }

  async loadChunk(manifest, index, attempt = 0) {
    const startedAt = clockNow();
    try {
      const chunk = manifest.chunks[index];
      const embedded = this.embeddedAtlas || globalThis.__HBL_ATLAS__ || globalThis.__HBL_ATLAS_LAZY__;
      let compressed;
      let source = 'network';
      if (typeof embedded?.getChunk === 'function') {
        source = 'embedded';
        compressed = this.base64ToArrayBuffer(await embedded.getChunk(index));
      } else if (embedded?.chunks?.[index]) {
        source = 'embedded';
        compressed = this.base64ToArrayBuffer(embedded.chunks[index]);
      } else {
        const url = chunk.gzip || chunk.url;
        const cached = await this.cache.get(url);
        if (cached) {
          source = 'cache';
          compressed = cached;
        } else {
          const response = await fetchWithTimeout(url);
          if (!response.ok) throw new Error(`Anatomy geometry failed to load (${response.status}).`);
          compressed = await response.arrayBuffer();
          await this.cache.put(url, compressed);
        }
      }
      const compressedAt = clockNow();
      const buffer = await decodeGzip(compressed);
      const decodedAt = clockNow();
      return {
        index,
        buffer,
        profile: {
          index,
          source,
          compressedBytes: compressed.byteLength,
          decodedBytes: buffer.byteLength,
          sourceMs: Math.round((compressedAt - startedAt) * 100) / 100,
          decodeMs: Math.round((decodedAt - compressedAt) * 100) / 100,
          loadMs: Math.round((decodedAt - startedAt) * 100) / 100,
          retries: attempt
        }
      };
    } catch (error) {
      if (attempt < 2) {
        await new Promise((resolve) => setTimeout(resolve, 180 * (attempt + 1)));
        return this.loadChunk(manifest, index, attempt + 1);
      }
      throw error;
    }
  }

  base64ToArrayBuffer(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
    return bytes.buffer;
  }

  shouldLoadPart(part) {
    const budgetedDevice = this.isMobile || this.quality === 'battery';
    if (!budgetedDevice || this.quality === 'sharp') return true;
    // Retain large structures that carry the educational signal while
    // dropping tiny branches and connective fragments. Battery Saver uses a
    // stricter budget; the full atlas remains available on Sharp/Balanced
    // desktop profiles and the filter never removes organ systems entirely.
    const fineSystems = new Set(['arterial', 'venous', 'nervous', 'sensory', 'muscular', 'connective']);
    if (!fineSystems.has(part.system)) return true;
    const multiplier = this.quality === 'battery' ? 1.45 : 1;
    if (part.system === 'muscular' && part.vertexCount < 420 * multiplier) return false;
    if (part.system === 'connective' && part.vertexCount < 340 * multiplier) return false;
    if ((part.system === 'arterial' || part.system === 'venous') && part.vertexCount < 260 * multiplier) return false;
    if ((part.system === 'nervous' || part.system === 'sensory') && part.vertexCount < 220 * multiplier) return false;
    return true;
  }

  async loadManifest(manifestSource) {
    if (typeof manifestSource === 'object') return manifestSource;
    const cacheName = 'hbl-manifest-v1';
    const requestKey = typeof location !== 'undefined' ? new URL(manifestSource, location.href).href : manifestSource;
    let cached = null;
    try {
      if (typeof caches !== 'undefined') cached = await caches.open(cacheName).then((cache) => cache.match(requestKey));
    } catch { /* fall through to the network */ }
    let lastError;
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        const response = await fetchWithTimeout(manifestSource);
        if (!response.ok) throw new Error(`The certified anatomy atlas manifest could not be loaded (${response.status}).`);
        const copy = response.clone();
        try { if (typeof caches !== 'undefined') await caches.open(cacheName).then((cache) => cache.put(requestKey, copy)); } catch { /* cache is optional */ }
        return response.json();
      } catch (error) {
        lastError = error;
        if (attempt === 0) await new Promise((resolve) => setTimeout(resolve, 220));
      }
    }
    if (cached) return cached.json();
    throw lastError || new Error('The certified anatomy atlas manifest could not be loaded.');
  }

  async load(manifestSource = '/models/atlas.json') {
    const embedded = this.embeddedAtlas || globalThis.__HBL_ATLAS__;
    const manifest = embedded?.manifest || await this.loadManifest(manifestSource);
    this.manifest = manifest;
    this.atlasIndexes = manifest.indexes || {};
    this.cache.setVersion(manifest.version || 'v1');
    await this.cache.pruneLegacyNamespaces();
    this.partsByChunk = new Map();
    for (const part of manifest.parts || []) {
      const list = this.partsByChunk.get(part.chunk) || [];
      list.push(part);
      this.partsByChunk.set(part.chunk, list);
    }
    this.partByConcept = new Map((manifest.concepts || []).map((concept) => [concept.id, concept]));
    this.totalBytes = (manifest.chunks || []).reduce((sum, chunk) => sum + Number(chunk.gzipBytes || 0), 0);
    const skeletalCounts = new Map();
    for (const part of manifest.parts || []) {
      if (part.system === 'skeletal') skeletalCounts.set(part.chunk, (skeletalCounts.get(part.chunk) || 0) + 1);
    }
    const skeletalChunk = [...skeletalCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
    if (!Number.isInteger(skeletalChunk)) throw new Error('The anatomy manifest has no skeletal startup chunk.');
    await this.ensureChunk(skeletalChunk);
    if (this._disposed) return manifest;
    // Bind once before later chunks arrive so the first visible skeletal layer
    // is interactive immediately. New meshes are appended to the same list.
    this.bindPointerEvents();
    this.onReady?.({ index: skeletalChunk, systems: ['skeletal'] });
    return manifest;
  }

  getBoundsForSystems(systems = []) {
    const wanted = new Set(Array.isArray(systems) ? systems : [systems]);
    const bounds = new THREE.Box3();
    this.scene?.updateMatrixWorld?.(true);
    this.records.filter((record) => wanted.has(record.system)).forEach((record) => bounds.expandByObject(record.high));
    return bounds.isEmpty() ? null : bounds;
  }

  async ensureSystems(systems = []) {
    if (!this.manifest || this._disposed) return;
    const wanted = new Set(Array.isArray(systems) ? systems : [systems]);
    const indexedChunks = new Set();
    for (const system of wanted) {
      for (const index of this.atlasIndexes.systemToChunks?.[system] || []) indexedChunks.add(index);
    }
    const chunks = indexedChunks.size
      ? [...indexedChunks]
      : [...this.partsByChunk.entries()]
        .filter(([, parts]) => parts.some((part) => wanted.has(part.system)))
        .map(([index]) => index);
    const concurrency = this.isMobile || this.quality === 'battery' ? 2 : 3;
    for (let cursor = 0; cursor < chunks.length; cursor += concurrency) {
      await Promise.all(chunks.slice(cursor, cursor + concurrency).map((index) => this.ensureChunk(index)));
    }
  }

  findManifestMatch(query = '') {
    const { normalized: text, term } = normalizedSearchTerm(query);
    if (!text || !this.manifest) return null;
    const exactId = String(query).trim().toUpperCase();
    for (const [chunk, structureIds] of Object.entries(this.atlasIndexes.chunkToStructures || {})) {
      if (!structureIds.includes(exactId)) continue;
      const part = (this.partsByChunk.get(Number(chunk)) || []).find((candidate) => candidate.id === exactId);
      if (part) return part;
    }
    for (const part of this.manifest.parts || []) {
      const concept = this.partByConcept.get(part.conceptId);
      if ([part.name, part.standardName, part.id, part.conceptId, part.system, concept?.name].some((value) => String(value || '').toLowerCase().includes(term))) return part;
    }
    return null;
  }

  async searchAndLoad(query = '') {
    const match = this.findManifestMatch(query);
    if (match) await this.ensureChunk(match.chunk);
    return this.search(query);
  }

  async ensureChunk(index) {
    if (this._disposed || !this.manifest || !Number.isInteger(index)) return null;
    if (this.loadedChunks.has(index)) return { index, cached: true };
    if (this.loadingChunks.has(index)) return this.loadingChunks.get(index);
    const promise = this.loadChunk(this.manifest, index).then(({ index: loadedIndex, buffer, profile = {} }) => {
      if (this._disposed) return { index: loadedIndex, disposed: true };
      const geometryStartedAt = clockNow();
      const geometryBySystem = new Map();
      for (const part of this.partsByChunk.get(loadedIndex) || []) {
        if (!this.shouldLoadPart(part)) continue;
        const geometry = this.createPartGeometry(buffer, part);
        const list = geometryBySystem.get(part.system) || [];
        list.push({ geometry, part, concept: this.partByConcept.get(part.conceptId) });
        geometryBySystem.set(part.system, list);
      }
      this.buildSystemRecords(geometryBySystem);
      const geometryFinishedAt = clockNow();
      const chunkProfile = {
        ...profile,
        buildMs: Math.round((geometryFinishedAt - geometryStartedAt) * 100) / 100,
        totalMs: Math.round((geometryFinishedAt - (geometryStartedAt - Number(profile.loadMs || 0))) * 100) / 100,
        systems: [...geometryBySystem.keys()],
        loadedParts: [...geometryBySystem.values()].reduce((sum, entries) => sum + entries.length, 0)
      };
      this.loadedChunks.add(loadedIndex);
      this.loadedBytes += Number(this.manifest.chunks[loadedIndex]?.gzipBytes || 0);
      const progress = this.totalBytes ? Math.round((this.loadedBytes / this.totalBytes) * 100) : 0;
      this.onProgress?.(progress, loadedIndex);
      this.onChunkReady?.({ index: loadedIndex, systems: [...geometryBySystem.keys()], progress, profile: chunkProfile });
      if (this.loadedChunks.size === (this.manifest.chunks || []).length) this.onFullReady?.();
      this.onRenderRequest?.();
      return { index: loadedIndex, progress };
    }).catch((error) => {
      this.onChunkError?.(error, index);
      throw error;
    }).finally(() => this.loadingChunks.delete(index));
    this.loadingChunks.set(index, promise);
    return promise;
  }

  createPartGeometry(buffer, part) {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(buffer, part.positions, part.vertexCount * 3), 3));
    geometry.setAttribute('normal', new THREE.BufferAttribute(new Int16Array(buffer, part.normals, part.vertexCount * 3), 3, true));
    // The packed atlas stores source indices as uint32. Keep that view here;
    // compaction happens after system geometries are merged so offsets remain
    // correct when a merged mesh contains more than 65,535 vertices.
    geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(buffer, part.indices, part.indexCount), 1));
    geometry.computeBoundingSphere();
    return geometry;
  }

  createPartMetadata(part, concept) {
    const system = part.system || 'connective';
    const [primaryFunction, clinicalSignificance] = SYSTEM_FUNCTIONS[system] || ['Part of the human body model.', 'This simplified atlas is for education, not clinical diagnosis.'];
    return {
      id: part.id,
      conceptId: part.conceptId,
      // R1: prefer the curated standard teaching name (e.g. coronary-cusp
      // nomenclature) while keeping the source label searchable.
      commonName: part.standardName || part.name,
      sourceName: part.name,
      latinName: concept?.name || part.name,
      system,
      primaryFunction,
      clinicalSignificance,
      bounds: part.bounds,
      educationalModel: 'BodyParts3D 4.0 · simplified educational visualization'
    };
  }

  buildSystemRecords(geometryBySystem) {
    geometryBySystem.forEach((entries, system) => {
      const material = this.materials.get(system) || createMaterial(system, this.quality);
      this.materials.set(system, material);
      const geometries = entries.map((entry) => entry.geometry);
      const merged = mergeGeometries(geometries, true);
      if (!merged) {
        geometries.forEach((geometry) => geometry.dispose());
        return;
      }
      geometries.forEach((geometry) => geometry.dispose());
      // Only compact after merging. Compacting each source part before merge
      // can overflow when the merged system crosses the 16-bit vertex limit.
      const mergedVertexCount = entries.reduce((sum, entry) => sum + Number(entry.part.vertexCount || 0), 0);
      if (merged.index && mergedVertexCount <= 65535 && merged.index.array instanceof Uint32Array) {
        const source = merged.index.array;
        const compact = new Uint16Array(source.length);
        for (let index = 0; index < source.length; index += 1) compact[index] = source[index];
        merged.setIndex(new THREE.BufferAttribute(compact, 1));
      }
      merged.computeBoundingSphere();
      const metadata = entries.map((entry) => this.createPartMetadata(entry.part, entry.concept));
      const high = new THREE.Mesh(merged, material);
      high.frustumCulled = true;
      high.renderOrder = ANATOMY_LAYERS[this.layerForSystem(system)]?.order || 1;
      high.userData = { system, metadata, lod: 'high' };
      const lod = new THREE.LOD();
      lod.addLevel(high, 0);
      // R6 (G1): manual LOD control with distance hysteresis + a 250 ms
      // opacity crossfade on the proxy (its own cloned material) so dollying
      // never shows a hard silhouette pop. The "never a box" rule stands.
      let low = null;
      if (entries.length > 5 || ['nervous', 'arterial', 'venous', 'muscular'].includes(system)) {
        low = this.createLowDetailProxy(merged, material, system, metadata);
        low.material = material.clone();
        low.material.userData.baseOpacity = material.userData.baseOpacity;
        low.material.transparent = true;
        low.material.depthWrite = false;
        low.material.opacity = 0;
        low.visible = false;
        this.proxyMaterials.push(low.material);
        lod.addLevel(low, this.isMobile ? 5.2 : 4.5);
        lod.autoUpdate = false;
      }
      lod.frustumCulled = true;
      lod.userData.system = system;
      lod.userData.metadata = metadata;
      this.root.add(lod);
      this.records.push({
        system, lod, high, low, metadata,
        lodMode: 'high', lodFade: 0,
        levelVisible: { high: true, low: false },
        lodFar: (this.isMobile ? 5.2 : 4.5) + 0.4,
        lodNear: (this.isMobile ? 5.2 : 4.5) - 0.4
      });
      this.interactiveObjects.push(high, ...lod.children.slice(1));
    });
    this.applyAllLayers();
    if (this.teachingOverlayConfig) this.rebuildTeachingOverlay();
    this.onRenderRequest?.();
  }

  /**
   * Phase 59: the distant LOD is a convex silhouette sampled from the real
   * part geometry instead of a misleading bounding box. It is a derived
   * display proxy only — selection metadata and exact geometry are unchanged.
   * Falls back to the box proxy when a hull cannot be built.
   */
  createLowDetailProxy(geometry, material, system, metadata) {
    geometry.computeBoundingBox();
    const bounds = geometry.boundingBox;
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    bounds.getSize(size);
    bounds.getCenter(center);
    let proxyGeometry = null;
    try {
      const position = geometry.getAttribute('position');
      if (position && position.count >= 4) {
        const targetPoints = 160;
        const stride = Math.max(1, Math.floor(position.count / targetPoints));
        const points = [];
        for (let index = 0; index < position.count; index += stride) {
          points.push(new THREE.Vector3(position.getX(index), position.getY(index), position.getZ(index)));
          if (points.length >= targetPoints) break;
        }
        if (points.length >= 4) proxyGeometry = new ConvexGeometry(points);
      }
    } catch {
      proxyGeometry = null;
    }
    if (!proxyGeometry) {
      proxyGeometry = new THREE.BoxGeometry(Math.max(size.x, 0.01), Math.max(size.y, 0.01), Math.max(size.z, 0.01), 1, 1, 1);
      const proxy = new THREE.Mesh(proxyGeometry, material);
      proxy.position.copy(center);
      proxy.frustumCulled = true;
      proxy.userData = { system, metadata, lod: 'low' };
      return proxy;
    }
    const proxy = new THREE.Mesh(proxyGeometry, material);
    proxy.frustumCulled = true;
    proxy.userData = { system, metadata, lod: 'low' };
    return proxy;
  }

  layerForSystem(system) {
    return Object.entries(ANATOMY_LAYERS).find(([, layer]) => layer.systems.includes(system))?.[0] || 'visceral';
  }

  /**
   * R6 (G1): hysteresis + crossfade for silhouette LOD proxies. Switching out
   * keeps the exact mesh visible while the hull fades in over it; switching
   * back shows the exact mesh immediately while the hull fades out — no pop.
   */
  stepLODFades(dt = 0.016) {
    if (!this.camera) return false;
    let changed = false;
    const world = this._lodWorldPos || (this._lodWorldPos = new THREE.Vector3());
    for (const record of this.records) {
      if (!record.low) continue;
      record.lod.getWorldPosition(world);
      const distance = this.camera.position.distanceTo(world);
      if (record.lodMode === 'high' && distance > record.lodFar) { record.lodMode = 'low'; changed = true; }
      else if (record.lodMode === 'low' && distance < record.lodNear) { record.lodMode = 'high'; changed = true; }
      const target = record.lodMode === 'low' ? 1 : 0;
      if (Math.abs(record.lodFade - target) < 0.001) {
        record.lodFade = target;
        continue;
      }
      const step = Math.min(1, dt / 0.25);
      record.lodFade = target === 1 ? Math.min(1, record.lodFade + step) : Math.max(0, record.lodFade - step);
      const proxyMaterial = record.low.material;
      const baseOpacity = proxyMaterial.userData.baseOpacity ?? 0.8;
      proxyMaterial.opacity = baseOpacity * record.lodFade;
      const highVisible = record.lodMode === 'high' || record.lodFade < 1;
      const lowVisible = record.lodFade > 0.001;
      record.levelVisible.high = highVisible;
      record.levelVisible.low = lowVisible;
      record.high.visible = highVisible && record.lod.visible;
      record.low.visible = lowVisible && record.lod.visible;
      changed = true;
    }
    return changed;
  }

  applyAllLayers() {
    this.records.forEach((record) => {
      const layerId = this.layerForSystem(record.system);
      const state = this.layerState[layerId];
      const spec = ANATOMY_LAYERS[layerId];
      const material = this.materials.get(record.system);
      // Phase 47: isolation hides every record except the isolated part's
      // system record (the part itself renders via its exact display mesh);
      // solo restricts visibility to the chosen systems.
      let visible = state?.visible !== false;
      if (this._isolation) visible = visible && record.system === this._isolation.recordId;
      if (this._soloSystems) visible = visible && this._soloSystems.has(record.system);
      if (this._isolation && record.system === this._isolation.recordId) visible = false;
      const opacity = state ? state.opacity : spec.opacity;
      record.lod.visible = visible;
      record.lod.traverse((object) => {
        if (!object.isMesh) return;
        const level = object.userData.lod === 'low' ? 'low' : 'high';
        object.visible = visible && (record.levelVisible?.[level] !== false);
        object.renderOrder = spec.order;
      });
      if (material) {
        material.opacity = opacity;
        material.transparent = opacity < 0.98;
        material.depthWrite = opacity >= 0.84;
        material.needsUpdate = true;
      }
      if (record.low) {
        record.low.material.userData.baseOpacity = opacity;
        record.low.material.opacity = opacity * record.lodFade;
      }
    });
  }

  setLayerState(layerId, patch) {
    if (!ANATOMY_LAYERS[layerId]) return;
    const previousOpacity = this.layerState[layerId]?.opacity ?? ANATOMY_LAYERS[layerId].opacity;
    this.layerState[layerId] = { ...this.layerState[layerId], ...patch, opacity: Math.max(0, Math.min(1, patch.opacity ?? this.layerState[layerId].opacity)) };
    if (patch.opacity !== undefined) this.queueOpacityTween(layerId, previousOpacity, this.layerState[layerId].opacity);
    this.applyAllLayers();
    this.onRenderRequest?.();
  }

  getLayerState() {
    return JSON.parse(JSON.stringify(this.layerState));
  }

  search(query = '') {
    const { normalized, term, aliased } = normalizedSearchTerm(query);
    if (!normalized) return null;
    for (const record of this.records) {
      const match = record.metadata.find((metadata) => [metadata.commonName, metadata.sourceName, metadata.latinName, metadata.conceptId, metadata.system].some((value) => String(value || '').toLowerCase().includes(term)));
      if (match) {
        if (aliased && match.system === term) {
          const systemMatch = { ...match, commonName: SEARCH_SYSTEM_LABELS[term] || match.commonName };
          this.setHovered(systemMatch, record.high);
          return systemMatch;
        }
        this.setHovered(match, record.high);
        return match;
      }
    }
    return null;
  }

  bindPointerEvents() {
    if (!this.renderer?.domElement || this._listeners.length) return;
    const element = this.renderer.domElement;
    const updatePointer = (event) => {
      const rect = element.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };
    const intersect = (event) => {
      updatePointer(event);
      this.raycaster.setFromCamera(this.pointer, this.camera);
      const hit = this.raycaster.intersectObjects(this.interactiveObjects, false)[0];
      if (hit) return { hit, metadata: this.resolveIntersection(hit) };
      // Phase 30 wide-pick mode: tiny valves, vessels, and nerves are hard to
      // hit exactly on a phone. Fall back to the visible part bounds along the
      // pick ray instead of silently dropping the selection.
      if (this._widePick) {
        const fallback = this.pickByBounds();
        if (fallback) return { hit: null, metadata: fallback };
      }
      return null;
    };
    const cancelHoverFrame = () => {
      if (this._hoverFrame) {
        window.cancelAnimationFrame(this._hoverFrame);
        this._hoverFrame = 0;
      }
      this._pendingHoverPoint = null;
    };
    const flushHover = () => {
      this._hoverFrame = 0;
      const point = this._pendingHoverPoint;
      this._pendingHoverPoint = null;
      if (!point || this._interactionActive || this._disposed) return;
      const result = intersect(point);
      this.setHovered(result?.metadata || null, result?.hit?.object || null);
      element.style.cursor = result ? 'pointer' : 'grab';
    };
    let downPoint = null;
    const onMove = (event) => {
      // OrbitControls and this atlas used to raycast on every mousemove while
      // dragging. With hundreds of merged layer meshes that competes directly
      // with the rotation render loop. Hover is only needed while idle, and is
      // coalesced to one raycast per animation frame.
      if (event.pointerType === 'touch' || event.buttons || this._interactionActive) return;
      this._pendingHoverPoint = { clientX: event.clientX, clientY: event.clientY };
      if (!this._hoverFrame) this._hoverFrame = window.requestAnimationFrame(flushHover);
    };
    const onDown = (event) => {
      downPoint = { x: event.clientX, y: event.clientY };
      cancelHoverFrame();
      element.style.cursor = 'grabbing';
    };
    const onUp = (event) => {
      const wasClick = downPoint && Math.hypot(event.clientX - downPoint.x, event.clientY - downPoint.y) <= 8;
      downPoint = null;
      element.style.cursor = 'grab';
      if (!wasClick) return;
      const result = intersect(event);
      if (!result?.metadata) return;
      this.setHovered(result.metadata, result.hit.object);
      const moduleId = this.moduleForSystem[result.metadata.system];
      this.onSelect?.(moduleId, result.metadata);
    };
    const onLeave = () => {
      cancelHoverFrame();
      if (!this._interactionActive) this.setHovered(null, null);
      element.style.cursor = 'grab';
    };
    [['pointermove', onMove], ['pointerdown', onDown], ['pointerup', onUp], ['pointerleave', onLeave]].forEach(([type, listener]) => {
      element.addEventListener(type, listener, { passive: true });
      this._listeners.push([element, type, listener]);
    });
  }

  setInteractionActive(active) {
    this._interactionActive = Boolean(active);
    if (this._interactionActive) {
      if (this._hoverFrame) window.cancelAnimationFrame(this._hoverFrame);
      this._hoverFrame = 0;
      this._pendingHoverPoint = null;
    }
  }

  setPickTolerance(wide = false) {
    this._widePick = Boolean(wide);
  }

  setReducedMotion(reduced = false) {
    this._reducedMotion = Boolean(reduced);
    if (reduced) this._opacityTweens?.clear();
  }

  /** Phase 49: toggle Fresnel ghost mode across all atlas materials. */
  setXRay(active = false) {
    this._xray = Boolean(active);
    const allMaterials = [...this.materials.values(), ...this.proxyMaterials];
    allMaterials.forEach((material) => {
      material.userData.uXRay.value = this._xray ? 1 : 0;
      if (this._xray) {
        material.transparent = true;
        material.depthWrite = false;
      } else {
        material.transparent = material.userData.baseTransparent;
        material.depthWrite = material.userData.baseDepthWrite;
      }
      material.needsUpdate = true;
    });
    this.applyAllLayers();
    this.onRenderRequest?.();
    return this._xray;
  }

  /**
   * Phase 52: geometric section plane. The cut reveals only existing mesh
   * surfaces; it must never imply internal parenchyma. Conceptual overlays
   * stay unclipped and keep their own disclosure.
   */
  setClippingPlane(spec = null) {
    this._clippingPlane = null;
    if (this.renderer) this.renderer.localClippingEnabled = Boolean(spec);
    if (spec) {
      const normals = { transverse: [0, -1, 0], sagittal: [-1, 0, 0], coronal: [0, 0, -1] };
      const normal = normals[spec.axis] || normals.transverse;
      this._clippingPlane = new THREE.Plane(new THREE.Vector3(...normal), Number(spec.position) || 0);
    }
    // R6 (G2): while a section plane is active the cut must read solid, not a
    // see-through shell — clipped materials get depth writes and near-opaque
    // opacity so inner surfaces present as an honest cut. Restored on release.
    const allMaterials = [...this.materials.values(), ...this.proxyMaterials];
    allMaterials.forEach((material) => {
      material.clippingPlanes = this._clippingPlane ? [this._clippingPlane] : null;
      if (this._clippingPlane) {
        if (!material.userData.preClip) {
          material.userData.preClip = { transparent: material.transparent, depthWrite: material.depthWrite, opacity: material.opacity };
        }
        material.opacity = Math.max(material.opacity, 0.9);
        material.transparent = material.opacity < 0.98;
        material.depthWrite = true;
      } else if (material.userData.preClip) {
        material.transparent = material.userData.preClip.transparent;
        material.depthWrite = material.userData.preClip.depthWrite;
        material.opacity = material.userData.preClip.opacity;
        delete material.userData.preClip;
      }
      material.needsUpdate = true;
    });
    this.onRenderRequest?.();
    return Boolean(spec);
  }

  /** Phase 47: isolate one certified part; everything else is hidden. */
  isolatePart(metadata) {
    if (!metadata?.id) return false;
    const record = this.records.find((item) => item.metadata.some((part) => part.id === metadata.id));
    if (!record) return false;
    this.clearIsolation(false);
    const exactGeometry = this.createExactSelectionGeometry(record, metadata);
    if (!exactGeometry) return false;
    const material = (this.materials.get(record.system) || createMaterial(record.system, this.quality)).clone();
    material.clippingPlanes = this._clippingPlane ? [this._clippingPlane] : null;
    const mesh = new THREE.Mesh(exactGeometry, material);
    mesh.renderOrder = ANATOMY_LAYERS[this.layerForSystem(record.system)]?.order || 60;
    mesh.userData.ephemeral = true;
    this.root.add(mesh);
    this._isolation = { recordId: record.system, partId: metadata.id, mesh, material, geometry: exactGeometry };
    this.applyAllLayers();
    this.onRenderRequest?.();
    return true;
  }

  clearIsolation(shouldRender = true) {
    if (this._isolation) {
      this._isolation.mesh.parent?.remove(this._isolation.mesh);
      this._isolation.geometry.dispose();
      this._isolation.material.dispose();
      this._isolation = null;
    }
    this.applyAllLayers();
    if (shouldRender) this.onRenderRequest?.();
  }

  get isolationActive() {
    return Boolean(this._isolation);
  }

  /** Phase 47: show only the layers of the given systems. */
  soloSystems(systems = []) {
    this._soloSystems = Array.isArray(systems) && systems.length ? new Set(systems) : null;
    this.applyAllLayers();
    this.onRenderRequest?.();
  }

  get soloActive() {
    return Boolean(this._soloSystems);
  }

  /** Phase 53: semantic index of everything currently loaded. */
  getStructureIndex() {
    const bySystem = new Map();
    this.records.forEach((record) => {
      const layerId = this.layerForSystem(record.system);
      if (this.layerState[layerId]?.visible === false) return;
      if (!bySystem.has(record.system)) bySystem.set(record.system, []);
      const bucket = bySystem.get(record.system);
      record.metadata.forEach((part) => bucket.push({ id: part.id, name: part.commonName, conceptId: part.conceptId, system: record.system }));
    });
    // R1: mesh fragments can repeat the same concept; show one row each.
    return [...bySystem.entries()].map(([system, parts]) => {
      const seen = new Set();
      return { system, parts: parts.filter((part) => { const key = `${part.name}|${part.conceptId}`; if (seen.has(key)) return false; seen.add(key); return true; }) };
    }).sort((a, b) => b.parts.length - a.parts.length);
  }

  /** Phase 58: educational-scale distance between two part bounds centers. */
  measureParts(a, b) {
    const boundsA = this.getPartBounds(a);
    const boundsB = this.getPartBounds(b);
    if (!boundsA || !boundsB) return null;
    const centerA = boundsA.getCenter(new THREE.Vector3());
    const centerB = boundsB.getCenter(new THREE.Vector3());
    const atlasUnits = centerA.distanceTo(centerB);
    return { atlasUnits, approxCm: atlasUnits * 100 };
  }

  /**
   * Phase 60: labeled conceptual contraction pulse on the selected part's
   * outline overlay. The source mesh never moves; this is a teaching cue.
   */
  triggerContractionPulse() {
    if (!this.selectionOverlay) return false;
    this._contraction = { start: clockNow(), duration: 1200 };
    this.onRenderRequest?.();
    return true;
  }

  stepContractionPulse(now = clockNow()) {
    if (!this._contraction || !this.selectionOverlay) return false;
    const progress = (now - this._contraction.start) / this._contraction.duration;
    if (progress >= 1) {
      this.selectionOverlay.scale.setScalar(1);
      this._contraction = null;
      this.onRenderRequest?.();
      return true;
    }
    const squeeze = 1 - 0.07 * Math.sin(Math.PI * Math.max(0, progress));
    this.selectionOverlay.scale.set(squeeze, 1 + (1 - squeeze) * 0.4, squeeze);
    return true;
  }

  /**
   * Phase 54: short eased opacity transitions when the learner peels layers.
   * Reduced motion applies the target immediately.
   */
  queueOpacityTween(layerId, fromOpacity, toOpacity) {
    if (this._reducedMotion || Math.abs(toOpacity - fromOpacity) < 0.004) return;
    const systems = ANATOMY_LAYERS[layerId]?.systems || [];
    const materials = systems.map((system) => this.materials.get(system)).filter(Boolean);
    if (!materials.length) return;
    if (!this._opacityTweens) this._opacityTweens = new Map();
    this._opacityTweens.set(layerId, { materials, from: fromOpacity, to: toOpacity, start: clockNow(), duration: 240 });
  }

  stepOpacityTweens(now = clockNow()) {
    if (!this._opacityTweens || !this._opacityTweens.size) return false;
    let changed = false;
    this._opacityTweens.forEach((tween, layerId) => {
      const progress = Math.min(1, (now - tween.start) / tween.duration);
      const eased = 1 - (1 - progress) * (1 - progress);
      const value = tween.from + (tween.to - tween.from) * eased;
      tween.materials.forEach((material) => { material.opacity = value; });
      changed = true;
      if (progress >= 1) this._opacityTweens.delete(layerId);
    });
    return changed;
  }

  /**
   * Phase 30: bounds-based fallback picking for small or occluded parts.
   * Only visible layers participate; the nearest bounds center along the
   * current pick ray wins. Returns metadata or null.
   */
  pickByBounds() {
    if (!this.records.length) return null;
    const center = new THREE.Vector3();
    let best = null;
    this.records.forEach((record) => {
      const layerId = this.layerForSystem(record.system);
      if (this.layerState[layerId]?.visible === false) return;
      record.metadata.forEach((metadata) => {
        if (!Array.isArray(metadata.bounds) || metadata.bounds.length !== 2) return;
        const box = new THREE.Box3(new THREE.Vector3(...metadata.bounds[0]), new THREE.Vector3(...metadata.bounds[1]));
        if (!this.raycaster.ray.intersectsBox(box)) return;
        box.getCenter(center);
        const distance = this.raycaster.ray.origin.distanceTo(center);
        if (!best || distance < best.distance) best = { metadata, distance };
      });
    });
    return best?.metadata || null;
  }

  getPartBounds(metadata) {
    if (!metadata?.bounds || metadata.bounds.length !== 2) return null;
    return new THREE.Box3(new THREE.Vector3(...metadata.bounds[0]), new THREE.Vector3(...metadata.bounds[1]));
  }

  resolveIntersection(intersection) {
    const object = intersection.object;
    const metadata = object.userData?.metadata || [];
    if (object.userData?.lod === 'low') return metadata[0] || null;
    const faceStart = Math.max(0, (intersection.faceIndex || 0) * 3);
    const group = object.geometry.groups.find((item) => faceStart >= item.start && faceStart < item.start + item.count);
    const index = group?.materialIndex ?? 0;
    return metadata[index] || metadata[0] || null;
  }

  setHovered(metadata, object) {
    if (metadata?.id === this.hoveredPart?.id) return;
    this.hoveredPart = metadata;
    this.updateHighlight(metadata, object);
    this.onHover?.(metadata);
    this.onRenderRequest?.();
  }

  disposeSelectionOverlay() {
    if (!this.selectionOverlay) return;
    this.selectionOverlay.parent?.remove(this.selectionOverlay);
    this.selectionOverlay.traverse((object) => {
      if (object.geometry) object.geometry.dispose();
      if (object.material) object.material.dispose();
    });
    this.selectionOverlay = null;
  }

  createExactSelectionGeometry(record, metadata) {
    const partIndex = record.metadata.findIndex((item) => item.id === metadata?.id);
    if (partIndex < 0) return null;
    const geometry = record.high.geometry;
    const group = geometry.groups.find((item) => item.materialIndex === partIndex);
    const indexAttribute = geometry.index;
    const position = geometry.getAttribute('position');
    if (!group || !indexAttribute || !position) return null;
    const sourceIndices = indexAttribute.array;
    const indexStart = group.start;
    const indexEnd = Math.min(sourceIndices.length, indexStart + group.count);
    const positions = new Float32Array((indexEnd - indexStart) * 3);
    const normals = geometry.getAttribute('normal') ? new Float32Array((indexEnd - indexStart) * 3) : null;
    const sourceNormals = geometry.getAttribute('normal');
    for (let index = indexStart; index < indexEnd; index += 1) {
      const sourceIndex = sourceIndices[index];
      const targetIndex = index - indexStart;
      positions[targetIndex * 3] = position.getX(sourceIndex);
      positions[targetIndex * 3 + 1] = position.getY(sourceIndex);
      positions[targetIndex * 3 + 2] = position.getZ(sourceIndex);
      if (normals && sourceNormals) {
        normals[targetIndex * 3] = sourceNormals.getX(sourceIndex);
        normals[targetIndex * 3 + 1] = sourceNormals.getY(sourceIndex);
        normals[targetIndex * 3 + 2] = sourceNormals.getZ(sourceIndex);
      }
    }
    const exact = new THREE.BufferGeometry();
    exact.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    if (normals) exact.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
    else exact.computeVertexNormals();
    exact.computeBoundingSphere();
    return exact;
  }

  updateHighlight(metadata, object) {
    if (this.highlight) {
      this.highlight.parent?.remove(this.highlight);
      this.highlight.geometry.dispose();
      this.highlight.material.dispose();
      this.highlight = null;
    }
    this.disposeSelectionOverlay();
    // The atlas mesh uses merged, shared materials. Never brighten the whole
    // system for a part-level selection: the exact group geometry is copied
    // into a temporary overlay instead, so a selected valve or chamber stays
    // visually precise without recoloring unrelated structures.
    this.records.forEach((record) => {
      const material = this.materials.get(record.system);
      if (!material) return;
      const spec = SYSTEM_STYLE[record.system] || SYSTEM_STYLE.connective;
      material.emissive.setHex(spec.color);
      material.emissiveIntensity = spec.opacity < 0.98 ? 0.055 : 0.035;
    });
    if (!metadata || !this.root) return;
    const selectedRecord = this.records.find((record) => record.metadata.some((item) => item.id === metadata.id));
    const exactGeometry = selectedRecord ? this.createExactSelectionGeometry(selectedRecord, metadata) : null;
    if (exactGeometry) {
      // Phase 43–44: the selection is an outline + soft additive glow on the
      // exact part geometry. The old coarse bounds box is debug-only now.
      const group = new THREE.Group();
      group.userData.ephemeral = true;
      const outlineGeometry = exactGeometry.clone();
      const outlineMaterial = new THREE.MeshBasicMaterial({ color: 0x06121b, transparent: true, opacity: 0.92, depthTest: false, depthWrite: false, side: THREE.BackSide });
      const outlineMesh = new THREE.Mesh(outlineGeometry, outlineMaterial);
      const glowMaterial = new THREE.MeshBasicMaterial({ color: 0x8df5ed, transparent: true, opacity: 0.3, depthTest: false, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending });
      const glowMesh = new THREE.Mesh(exactGeometry, glowMaterial);
      // Scale the outline around the part's own center, not the world origin.
      const center = new THREE.Vector3();
      outlineGeometry.computeBoundingBox();
      outlineGeometry.boundingBox.getCenter(center);
      const OUTLINE_SCALE = 1.05;
      outlineMesh.scale.setScalar(OUTLINE_SCALE);
      outlineMesh.position.copy(center.multiplyScalar(1 - OUTLINE_SCALE));
      outlineMesh.renderOrder = 203;
      glowMesh.renderOrder = 204;
      outlineMesh.userData.ephemeral = true;
      glowMesh.userData.ephemeral = true;
      group.add(outlineMesh);
      group.add(glowMesh);
      this.root.add(group);
      this.selectionOverlay = group;
    }
    // Phase 43: the coarse bounds box is retained only as an opt-in debug
    // aid; the outline + glow above carries the selection visual.
    if (!this.debugBounds) return;
    const selectedRecordForBounds = this.records.find((record) => record.metadata.some((item) => item.id === metadata.id));
    const bounds = this.getTeachingBoundsForMetadata(selectedRecordForBounds, metadata) || new THREE.Box3(new THREE.Vector3(...metadata.bounds[0]), new THREE.Vector3(...metadata.bounds[1]));
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    bounds.getSize(size);
    bounds.getCenter(center);
    const line = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(Math.max(size.x, 0.008), Math.max(size.y, 0.008), Math.max(size.z, 0.008))), new THREE.LineBasicMaterial({ color: 0x8df5ed, transparent: true, opacity: 0.82, depthTest: false, depthWrite: false }));
    line.position.copy(center);
    line.renderOrder = 205;
    line.userData.ephemeral = true;
    this.root.add(line);
    this.highlight = line;
  }

  getTeachingMetadata(query) {
    const term = String(query || '').trim().toLowerCase();
    if (!term) return null;
    for (const record of this.records) {
      const match = record.metadata.find((metadata) => [metadata.commonName, metadata.latinName, metadata.conceptId, metadata.system].some((value) => String(value || '').toLowerCase().includes(term)) && metadata.bounds?.length === 2);
      if (match) return match;
    }
    return null;
  }

  getTeachingBoundsForMetadata(record, metadata) {
    const fallback = metadata?.bounds?.length === 2 ? new THREE.Box3(new THREE.Vector3(...metadata.bounds[0]), new THREE.Vector3(...metadata.bounds[1])) : null;
    if (!record || !metadata) return fallback;
    const partIndex = record.metadata.findIndex((item) => item.id === metadata.id);
    const group = record.high.geometry.groups.find((item) => item.materialIndex === partIndex);
    const indexAttribute = record.high.geometry.index;
    const position = record.high.geometry.getAttribute('position');
    if (!group || !indexAttribute || !position) return fallback;
    const bounds = new THREE.Box3();
    const indices = indexAttribute.array;
    const end = Math.min(indices.length, group.start + group.count);
    for (let index = group.start; index < end; index += 1) bounds.expandByPoint(new THREE.Vector3().fromBufferAttribute(position, indices[index]));
    return bounds.isEmpty() ? fallback : bounds;
  }

  getTeachingBounds(query) {
    const term = String(query || '').trim().toLowerCase();
    if (!term) return null;
    for (const record of this.records) {
      const metadata = record.metadata.find((item) => [item.commonName, item.latinName, item.conceptId, item.system].some((value) => String(value || '').toLowerCase().includes(term)));
      if (metadata) return this.getTeachingBoundsForMetadata(record, metadata);
    }
    return null;
  }

  getTeachingAnchor(query, offset = null) {
    const term = String(query || '').trim().toLowerCase();
    if (!term) return null;
    const matches = [];
    this.records.forEach((record) => record.metadata.forEach((metadata) => {
      if ([metadata.commonName, metadata.latinName, metadata.conceptId, metadata.system].some((value) => String(value || '').toLowerCase().includes(term)) && metadata.bounds?.length === 2) matches.push(this.getTeachingBoundsForMetadata(record, metadata));
    }));
    if (!matches.length) return null;
    const center = new THREE.Vector3();
    matches.forEach((bounds) => center.add(bounds.getCenter(new THREE.Vector3())));
    center.multiplyScalar(1 / matches.length);
    if (Array.isArray(offset)) center.add(new THREE.Vector3(...offset));
    return center;
  }

  clearTeachingOverlay() {
    if (!this.teachingOverlay) return;
    const { group, lines = [], markers = [], pulse } = this.teachingOverlay;
    lines.forEach(({ geometry, material }) => { geometry.dispose(); material.dispose(); });
    markers.forEach(({ geometry, material }) => { geometry.dispose(); material.dispose(); });
    if (pulse) { pulse.geometry.dispose(); pulse.material.dispose(); }
    group.parent?.remove(group);
    this.teachingOverlay = null;
  }

  flattenMarkerSpecs(specs = []) {
    return (specs || []).flatMap((spec) => {
      if (!spec || typeof spec === 'string') return [spec];
      if (Array.isArray(spec.queries)) return spec.queries.map((query) => ({ ...spec, query, queries: undefined }));
      return [spec];
    });
  }

  teachingOverlayStructureKey(config) {
    if (!config) return null;
    return JSON.stringify({
      id: config.id,
      activeStage: config.activeStage,
      stages: (config.stages || []).map((stage) => ({ id: stage.id, color: stage.color, queries: stage.queries, focusQueries: stage.focusQueries })),
      // Pressure-marker state and intensity are dynamic model values. Keep
      // them out of the structural key so valve ticks update materials in
      // place instead of rebuilding source geometry.
      pressureMarkers: this.flattenMarkerSpecs(config.pressureMarkers).map((marker) => typeof marker === 'string' ? marker : ({ query: marker.query, scale: marker.scale })),
      pulseColor: config.pulseColor,
      pulseRadius: config.pulseRadius,
      reducedMotion: Boolean(config.reducedMotion)
    });
  }

  rebuildTeachingOverlay() {
    this.clearTeachingOverlay();
    const config = this.teachingOverlayConfig;
    if (!config?.stages?.length || !this.root) return;
    const group = new THREE.Group();
    group.name = `${config.id || 'teaching'}-overlay`;
    group.renderOrder = 200;
    // Route lines are conceptual teaching overlays, never literal transport.
    // The disclosure travels with the overlay for inspection and QA.
    group.userData.routeDisclosure = config.routeDisclosure || 'Conceptual teaching route; not literal transport.';
    const lines = [];
    const markers = [];
    // Phase 29: authored waypoints bend each conceptual route through the
    // valve plane or lumen it actually follows, instead of drawing a bare
    // center-to-center polyline that could skip through unrelated anatomy.
    const anchorsByStage = config.stages.map((stage) => {
      const main = (stage.queries || []).map((query) => this.getTeachingAnchor(query, stage.routeOffset)).filter(Boolean);
      const waypoints = (stage.waypoints || []).map((query) => this.getTeachingAnchor(query, stage.routeOffset)).filter(Boolean);
      if (main.length >= 2 && waypoints.length) main.splice(main.length - 1, 0, ...waypoints);
      return main;
    });
    config.stages.forEach((stage, index) => {
      const points = anchorsByStage[index];
      if (!points || points.length < 2) return;
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({ color: stage.color || 0x8df5ed, transparent: true, opacity: index === config.activeStage ? 0.95 : 0.2, depthTest: false, depthWrite: false });
      const line = new THREE.Line(geometry, material);
      line.renderOrder = 201;
      group.add(line);
      lines.push({ geometry, material, line, index, points });
    });
    const activeStage = config.stages[config.activeStage] || config.stages[0];
    const markerSpecs = [
      ...(activeStage?.focusQueries || []).map((query) => ({ query, color: activeStage?.color || 0x8df5ed, opacity: 0.9 })),
      ...this.flattenMarkerSpecs(config.pressureMarkers)
    ];
    markerSpecs.forEach((spec) => {
      const query = typeof spec === 'string' ? spec : spec.query;
      const metadata = this.getTeachingMetadata(query);
      const markerBounds = this.getTeachingBounds(query);
      if (!metadata || !markerBounds) return;
      const size = markerBounds.getSize(new THREE.Vector3());
      const center = markerBounds.getCenter(new THREE.Vector3());
      const markerGeometry = new THREE.EdgesGeometry(new THREE.BoxGeometry(Math.max(size.x, 0.01), Math.max(size.y, 0.01), Math.max(size.z, 0.01)));
      const markerMaterial = new THREE.LineBasicMaterial({ color: typeof spec === 'string' ? (activeStage?.color || 0x8df5ed) : (spec.color || 0x8df5ed), transparent: true, opacity: typeof spec === 'string' ? 0.9 : (spec.opacity ?? 0.82), depthTest: false, depthWrite: false });
      const marker = new THREE.LineSegments(markerGeometry, markerMaterial);
      marker.position.copy(center);
      marker.scale.setScalar(typeof spec === 'string' ? 1.12 : (spec.scale || 1.08));
      marker.renderOrder = 203;
      marker.userData.teachingStructure = metadata.commonName;
      marker.userData.teachingState = typeof spec === 'string' ? 'active structure' : spec.state;
      group.add(marker);
      markers.push({
        geometry: markerGeometry,
        material: markerMaterial,
        marker,
        query,
        baseOpacity: markerMaterial.opacity,
        baseScale: marker.scale.x,
        dynamic: typeof spec !== 'string' && spec.state !== undefined,
        intensity: typeof spec === 'string' ? 0 : Math.max(0, Math.min(1, Number(spec.intensity ?? spec.gradient ?? (spec.state === 'open' ? 1 : 0.16))))
      });
    });
    const activeLine = lines.find((item) => item.index === config.activeStage) || lines[0];
    let pulse = null;
    const pulses = [];
    // Phase 51: multiple wave pulses give a peristaltic propagation feel to
    // conceptual routes instead of a single traveling dot.
    const waveCount = Math.max(1, Math.min(5, Number(config.waves) || 1));
    if (activeLine?.points?.length > 1) {
      for (let wave = 0; wave < waveCount; wave += 1) {
        const wavePulse = new THREE.Mesh(new THREE.SphereGeometry(config.pulseRadius || 0.014, 12, 8), new THREE.MeshBasicMaterial({ color: config.pulseColor || 0x8df5ed, transparent: true, opacity: wave === 0 ? 0.98 : 0.72, depthTest: false, depthWrite: false }));
        wavePulse.renderOrder = 202;
        group.add(wavePulse);
        wavePulse.position.copy(activeLine.points[0]);
        pulses.push(wavePulse);
        if (!pulse) pulse = wavePulse;
      }
    }
    this.root.add(group);
    this.teachingOverlay = { group, lines, markers, pulse, pulses, activeLine, animate: config.animate !== false && !config.reducedMotion, phase: Number(config.pulsePhase) || 0, speed: Number(config.pulseSpeed) || 0.00035, markerSpeed: Number(config.markerPulseSpeed) || 0.0035, startedAt: clockNow() };
    this.updateTeachingOverlayMarkers(config.pressureMarkers || []);
  }

  updateTeachingOverlayMarkers(markerSpecs = []) {
    if (!this.teachingOverlay?.markers?.length) return;
    const dynamicSpecs = new Map(this.flattenMarkerSpecs(markerSpecs).filter((spec) => spec && typeof spec !== 'string' && spec.query).map((spec) => [spec.query, spec]));
    this.teachingOverlay.markers.forEach((entry) => {
      if (!entry.dynamic) return;
      const spec = dynamicSpecs.get(entry.query);
      if (!spec) return;
      entry.intensity = Math.max(0, Math.min(1, Number(spec.intensity ?? spec.gradient ?? (spec.state === 'open' ? 1 : 0.16))));
      entry.state = spec.state;
      entry.gradient = Number(spec.gradient ?? spec.intensity ?? entry.intensity) || 0;
      entry.baseOpacity = Math.max(0.18, Math.min(0.96, Number(spec.opacity ?? (entry.intensity > 0.5 ? 0.9 : 0.62))));
      if (spec.color) entry.material.color.setHex(spec.color);
      entry.marker.userData.teachingState = spec.state;
      entry.marker.userData.teachingGradient = entry.gradient;
    });
  }

  setTeachingOverlay(config = null, shouldRender = true) {
    const nextKey = this.teachingOverlayStructureKey(config);
    if (config && this.teachingOverlay && nextKey === this.teachingOverlayKey) {
      this.teachingOverlayConfig = config;
      this.updateTeachingOverlayMarkers(config.pressureMarkers || []);
      this.setTeachingOverlayPhase(config.pulsePhase, config.animate !== false);
      if (shouldRender) this.onRenderRequest?.();
      return;
    }
    this.teachingOverlayConfig = config;
    this.teachingOverlayKey = nextKey;
    this.rebuildTeachingOverlay();
    if (shouldRender) this.onRenderRequest?.();
  }

  setTeachingOverlayPhase(phase = 0, animate = true) {
    if (!this.teachingOverlay) return;
    this.teachingOverlay.phase = ((Number(phase) || 0) % 1 + 1) % 1;
    this.teachingOverlay.animate = Boolean(animate) && !this.teachingOverlayConfig?.reducedMotion;
    this.teachingOverlay.startedAt = clockNow();
    this.onRenderRequest?.();
  }

  update(time = clockNow()) {
    if (!this.camera) return false;
    const dt = this._lastUpdateTime ? Math.min(0.1, Math.max(0, (time - this._lastUpdateTime) / 1000)) : 0.016;
    this._lastUpdateTime = time;
    const lodChanged = this.stepLODFades(dt);
    const tweensChanged = this.stepOpacityTweens(time);
    const contractionChanged = this.stepContractionPulse(time);
    const overlay = this.teachingOverlay;
    if (!overlay) return tweensChanged || contractionChanged || lodChanged;
    const elapsed = time - overlay.startedAt;
    let changed = tweensChanged || contractionChanged || lodChanged;
    const dynamicMarkers = overlay.markers?.filter((entry) => entry.dynamic) || [];
    if (dynamicMarkers.length && overlay.animate) {
      const markerPhase = (overlay.phase + elapsed * overlay.markerSpeed) % 1;
      dynamicMarkers.forEach((entry, index) => {
        const wave = 0.5 + 0.5 * Math.sin(markerPhase * Math.PI * 2 + index * 0.85);
        const energy = Math.max(0, Math.min(1, entry.intensity || 0));
        entry.material.opacity = entry.baseOpacity * (0.78 + energy * 0.22) * (0.84 + wave * 0.16);
        entry.marker.scale.setScalar(entry.baseScale * (1 + energy * 0.035 * wave));
      });
      changed = true;
    }
    if (!overlay.pulse || !overlay.animate || !overlay.activeLine?.points?.length) return changed;
    const points = overlay.activeLine.points;
    const waveTotal = overlay.pulses?.length || 1;
    (overlay.pulses || [overlay.pulse]).forEach((wavePulse, waveIndex) => {
      const progress = (overlay.phase + elapsed * overlay.speed + waveIndex / waveTotal) % 1;
      const scaled = progress * (points.length - 1);
      const index = Math.min(points.length - 2, Math.floor(scaled));
      const local = scaled - index;
      wavePulse.position.lerpVectors(points[index], points[index + 1], local);
      wavePulse.scale.setScalar(0.78 + Math.sin(progress * Math.PI * 2) * 0.18);
    });
    return true;
  }

  dispose() {
    this._disposed = true;
    if (this._hoverFrame) window.cancelAnimationFrame(this._hoverFrame);
    this._hoverFrame = 0;
    this._pendingHoverPoint = null;
    this._listeners.forEach(([element, type, listener]) => element.removeEventListener(type, listener));
    this._listeners = [];
    if (this.highlight) {
      this.highlight.geometry.dispose();
      this.highlight.material.dispose();
      this.highlight.parent?.remove(this.highlight);
      this.highlight = null;
    }
    this.clearTeachingOverlay();
    this.disposeSelectionOverlay();
    this.teachingOverlayConfig = null;
    this.root.traverse((object) => {
      if (object.geometry) object.geometry.dispose();
    });
    this.materials.forEach((material) => material.dispose());
    this.proxyMaterials.forEach((material) => material.dispose());
    this.proxyMaterials = [];
    this.materials.clear();
    this.records.length = 0;
    this.interactiveObjects.length = 0;
    this.root.clear();
  }
}

