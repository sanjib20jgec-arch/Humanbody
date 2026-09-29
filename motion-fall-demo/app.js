import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { OrbitControls } from './vendor/OrbitControls.js';
import { RoomEnvironment } from './vendor/RoomEnvironment.js';
import { HDRLoader } from './vendor/HDRLoader.js';
import { GLTFLoader } from './vendor/GLTFLoader.js';

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const FIXED_STEP = 1 / 60;
const MAX_CATCHUP_TICKS = 8;
const CHECKSUM_INTERVAL = 30;
const REPLAY_VERSION = 1;
const STATES = ['Locomotion', 'ImpactReact', 'Stagger', 'Collapse', 'Grounded', 'Recover'];
const movementSpeed = { Idle: 0, Walk: 0.42, Run: 0.95 };
const frictionConfig = {
  Normal: { friction: 0.42, restitution: 0.08, description: 'Balanced static friction and rebound.' },
  Slippery: { friction: 0.08, restitution: 0.02, description: 'Low grip makes recovery harder.' },
  Grippy: { friction: 0.82, restitution: 0.04, description: 'High grip supports a recovery attempt.' }
};
const physicsTuning = {
  impact: { minimumImpulse: 2.1, intensityImpulse: 3.8, torqueBase: 1.7, torqueIntensity: 3.0 },
  joints: { uprightForce: 1e6, collapseForce: 2800, minimumCollapseForce: 500 },
  settle: { dwell: 0.18, maxComHeight: 1.5, maxSpeed: 0.22, maxAngularSpeed: 0.35 },
  recovery: { maximumIntensity: 0.76, successIntensity: 0.3, minimumChance: 0.2, stepImpulse: 0.35, stepLift: 0.12 }
};
const qualityProfiles = {
  high: { pixelRatio: 1.75, shadowMap: 1536, shadows: true, solverIterations: 12, maxTrail: 180, overlayHz: 60 },
  mobile: { pixelRatio: 1.15, shadowMap: 768, shadows: false, solverIterations: 8, maxTrail: 90, overlayHz: 30 }
};
const MAX_SUPPORT_VERTICES = 16;
const MAX_TRAJECTORY_POINTS = 180;
const CHARACTER_TARGET_HEIGHT = 2.32;
const scenarioPresets = {
  gentle: { seed: 10101, movement: 'Walk', region: 'Torso', direction: 'Front', intensity: 0.28, friction: 'Normal', slow: 1, quality: 'high' },
  slippery: { seed: 20202, movement: 'Run', region: 'Torso', direction: 'Right', intensity: 0.68, friction: 'Slippery', slow: 0.5, quality: 'mobile' },
  recovery: { seed: 30303, movement: 'Walk', region: 'Arm', direction: 'Left', intensity: 0.18, friction: 'Grippy', slow: 0.5, quality: 'high' },
  high: { seed: 40404, movement: 'Run', region: 'Leg', direction: 'Back', intensity: 0.92, friction: 'Normal', slow: 0.25, quality: 'high' }
};
const BONE_ALIASES = {
  pelvis: ['pelvis', 'hips', 'hip', 'root'],
  torso: ['chest', 'upperchest', 'spine2', 'spine1', 'spine'],
  head: ['head', 'skull'],
  upperArmL: ['leftupperarm', 'upperarmleft', 'upperarml', 'lupperarm'],
  forearmL: ['leftforearm', 'leftlowerarm', 'forearmleft', 'forearml', 'lowerarml'],
  upperArmR: ['rightupperarm', 'upperarmright', 'upperarmr', 'rupperarm'],
  forearmR: ['rightforearm', 'rightlowerarm', 'forearmright', 'forearmr', 'lowerarmr'],
  thighL: ['leftupleg', 'leftthigh', 'thighleft', 'thighl', 'lupleg'],
  shinL: ['leftleg', 'leftlowerleg', 'leftshin', 'shinleft', 'shinl', 'lleg'],
  thighR: ['rightupleg', 'rightthigh', 'thighright', 'thighr', 'rupleg'],
  shinR: ['rightleg', 'rightlowerleg', 'rightshin', 'shinright', 'shinr', 'rleg']
};
const regionMultiplier = { Torso: 1, Arm: 0.72, Leg: 0.86 };
const directionVector = {
  Front: new CANNON.Vec3(0, 0, 1),
  Back: new CANNON.Vec3(0, 0, -1),
  Left: new CANNON.Vec3(-1, 0, 0),
  Right: new CANNON.Vec3(1, 0, 0)
};

const sim = {
  mode: 'Setup', movement: 'Idle', region: 'Torso', direction: 'Front', intensity: 0.55,
  friction: 'Normal', slow: 1, quality: 'high', state: 'Locomotion', stateElapsed: 0, elapsed: 0,
  playing: false, paused: false, seed: randomSeed(), rng: null, recoveryStep: false,
  autoRecover: false, impactApplied: false, lastFrame: performance.now(), accumulator: 0,
  tick: 0, renderAlpha: 1, droppedTime: false, replayStatus: 'Ready',
  contactCount: 0, xcomEdgeDistance: 0, settleDwell: 0, recoverySucceeded: false
};

let scene;
let camera;
let renderer;
let controls;
let keyLight;
let environmentTexture = null;
let environmentPMREM = null;
let resizeObserver;
let contextLost = false;
let world;
let floorBody;
let floorMesh;
let mannequinRoot;
let assetRoot;
const characterAdapter = {
  root: null,
  bones: new Map(),
  metrics: null,
  ready: false,
  mappedCount: 0,
  dispose() {
    this.root = null;
    this.bones.clear();
    this.metrics = null;
    this.ready = false;
    this.mappedCount = 0;
  }
};
let comMarker;
let supportFill;
let supportLine;
let trajectoryLine;
let trajectoryPoints = [];
let lastVisualUpdate = 0;
let loadedOptionalAsset = false;
let bodyParts = new Map();
let bodyKeysById = new Map();
let constraints = [];
let visualMaterials = {};
let previousTransforms = new Map();
let lastReplaySnapshot = null;
let activeRun = null;
let frameStats = { sampleTime: 0, frames: 0, fps: 0 };
const renderPosition = new THREE.Vector3();
const renderQuaternion = new THREE.Quaternion();
const characterWorldPosition = new THREE.Vector3();
const characterWorldQuaternion = new THREE.Quaternion();
const characterParentQuaternion = new THREE.Quaternion();
const characterLocalQuaternion = new THREE.Quaternion();
let running = true;

const canvas = $('#scene-canvas');

function randomSeed() {
  if (globalThis.crypto?.getRandomValues) {
    const values = new Uint32Array(1);
    crypto.getRandomValues(values);
    return values[0] || 1;
  }
  return Math.floor(Math.random() * 0xffffffff) || 1;
}

function mulberry32(seed) {
  let value = seed >>> 0;
  return () => {
    value |= 0;
    value = (value + 0x6D2B79F5) | 0;
    let t = Math.imul(value ^ (value >>> 15), 1 | value);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp(value, min, max) { return Math.min(max, Math.max(min, value)); }
function v3(x, y, z) { return new THREE.Vector3(x, y, z); }
function cannonV(vector) { return new CANNON.Vec3(vector.x, vector.y, vector.z); }

function captureBodyState() {
  return [...bodyParts.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([key, { body }]) => ({
    key,
    position: [body.position.x, body.position.y, body.position.z],
    quaternion: [body.quaternion.x, body.quaternion.y, body.quaternion.z, body.quaternion.w],
    velocity: [body.velocity.x, body.velocity.y, body.velocity.z],
    angularVelocity: [body.angularVelocity.x, body.angularVelocity.y, body.angularVelocity.z]
  }));
}

function restoreBodyState(states) {
  for (const state of states || []) {
    const part = bodyParts.get(state.key);
    if (!part) continue;
    const { body } = part;
    body.position.set(...state.position);
    body.quaternion.set(...state.quaternion);
    body.velocity.set(...state.velocity);
    body.angularVelocity.set(...state.angularVelocity);
    body.force.set(0, 0, 0);
    body.torque.set(0, 0, 0);
    body.wakeUp();
  }
  syncPreviousTransforms();
}

function syncPreviousTransforms() {
  bodyParts.forEach(({ body }, key) => {
    let previous = previousTransforms.get(key);
    if (!previous) {
      previous = { position: new THREE.Vector3(), quaternion: new THREE.Quaternion() };
      previousTransforms.set(key, previous);
    }
    previous.position.set(body.position.x, body.position.y, body.position.z);
    previous.quaternion.set(body.quaternion.x, body.quaternion.y, body.quaternion.z, body.quaternion.w);
  });
}

function capturePreviousTransforms() {
  syncPreviousTransforms();
}

function currentRunParameters() {
  return {
    movement: sim.movement,
    region: sim.region,
    direction: sim.direction,
    intensity: sim.intensity,
    friction: sim.friction,
    slow: sim.slow,
    quality: sim.quality
  };
}

function applyRunParameters(parameters) {
  sim.movement = parameters.movement;
  sim.region = parameters.region;
  sim.direction = parameters.direction;
  sim.intensity = parameters.intensity;
  sim.friction = parameters.friction;
  sim.slow = parameters.slow;
  sim.quality = parameters.quality;
  $$('[data-movement]').forEach((button) => setPressed(button, button.dataset.movement === sim.movement));
  $$('[data-region]').forEach((button) => setPressed(button, button.dataset.region === sim.region));
  $$('[data-direction]').forEach((button) => setPressed(button, button.dataset.direction === sim.direction));
  $$('[data-slow]').forEach((button) => setPressed(button, Number(button.dataset.slow) === sim.slow));
  $$('[data-quality]').forEach((button) => setPressed(button, button.dataset.quality === sim.quality));
  $('#impact-intensity').value = String(sim.intensity);
  $('#impact-intensity-value').textContent = sim.intensity.toFixed(2);
  setFriction(sim.friction);
  applyQuality();
}

function createReplaySnapshot() {
  return {
    version: REPLAY_VERSION,
    seed: sim.seed >>> 0,
    parameters: currentRunParameters(),
    initialBodies: captureBodyState(),
    result: null
  };
}

function hashMix(hash, value) {
  hash ^= value >>> 0;
  return Math.imul(hash, 16777619) >>> 0;
}

function quantized(value) { return Math.round(value * 100000); }

function computeStateChecksum() {
  let hash = 2166136261;
  for (const state of captureBodyState()) {
    for (const value of [...state.position, ...state.quaternion, ...state.velocity, ...state.angularVelocity]) {
      hash = hashMix(hash, quantized(value));
    }
  }
  hash = hashMix(hash, sim.tick);
  hash = hashMix(hash, STATES.indexOf(sim.state));
  return hash.toString(16).padStart(8, '0');
}

function setReplayStatus(status) {
  sim.replayStatus = status;
  const node = $('#replay-status');
  if (node) node.textContent = status;
}

function recordChecksum(force = false) {
  if (!activeRun || (!force && sim.tick % CHECKSUM_INTERVAL !== 0)) return;
  const entry = { tick: sim.tick, hash: computeStateChecksum() };
  activeRun.checksums.push(entry);
  if (activeRun.isReplay && activeRun.expected?.checksums) {
    const expected = activeRun.expected.checksums.find(item => item.tick === entry.tick);
    if (!expected || expected.hash !== entry.hash) setReplayStatus('Mismatch');
  }
}

function finishActiveRun() {
  if (!activeRun || activeRun.finished) return;
  recordChecksum(true);
  activeRun.finished = true;
  const result = { events: activeRun.events.slice(), checksums: activeRun.checksums.slice() };
  if (!activeRun.isReplay) {
    activeRun.snapshot.result = result;
    lastReplaySnapshot = activeRun.snapshot;
    setReplayStatus('Replay pending');
    return;
  }
  const expected = activeRun.expected;
  const eventsMatch = JSON.stringify(expected?.events || []) === JSON.stringify(result.events);
  const checksumsMatch = JSON.stringify(expected?.checksums || []) === JSON.stringify(result.checksums);
  setReplayStatus(eventsMatch && checksumsMatch && sim.replayStatus !== 'Mismatch' ? 'Verified' : 'Mismatch');
}

function beginRun(snapshot, isReplay = false) {
  sim.seed = snapshot.seed >>> 0;
  sim.rng = mulberry32(sim.seed);
  sim.mode = 'Playback';
  sim.playing = true;
  sim.paused = false;
  sim.state = 'Locomotion';
  sim.stateElapsed = 0;
  sim.elapsed = 0;
  sim.tick = 0;
  sim.accumulator = 0;
  sim.renderAlpha = 1;
  sim.droppedTime = false;
  sim.contactCount = 0;
  sim.xcomEdgeDistance = 0;
  sim.settleDwell = 0;
  sim.recoverySucceeded = false;
  sim.recoveryStep = false;
  sim.autoRecover = false;
  sim.impactApplied = false;
  activeRun = { snapshot, isReplay, expected: isReplay ? snapshot.result : null, events: [], checksums: [], finished: false };
  setReplayStatus(isReplay ? 'Checking…' : 'Recording');
  updateUI();
}

function makeMaterial(name, color, roughness = 0.72, metalness = 0.02) {
  const material = new THREE.MeshStandardMaterial({ color, roughness, metalness });
  visualMaterials[name] = material;
  return material;
}

function setRenderStatus(message, warning = false) {
  const status = $('#render-status');
  if (!status) return;
  status.classList.toggle('warning', warning);
  status.classList.toggle('ready', !warning);
  status.innerHTML = `<i></i> ${message}`;
}

function buildRenderer() {
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, qualityProfiles[sim.quality].pixelRatio));
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    if ('useLegacyLights' in renderer) renderer.useLegacyLights = false;
    if ('physicallyCorrectLights' in renderer) renderer.physicallyCorrectLights = true;
    canvas.addEventListener('webglcontextlost', (event) => {
      event.preventDefault();
      contextLost = true;
      setRenderStatus('WebGL paused — waiting for recovery', true);
    }, false);
    canvas.addEventListener('webglcontextrestored', () => {
      contextLost = false;
      sim.lastFrame = performance.now();
      setRenderStatus('WebGL restored');
      resize();
      applyQuality();
    }, false);
    setRenderStatus('WebGL active');
    return true;
  } catch (error) {
    setRenderStatus('WebGL unavailable', true);
    $('#loading-scene').innerHTML = '<strong>WebGL could not start</strong><span>Enable hardware acceleration or try a current browser.</span>';
    $('#loading-scene').classList.remove('hidden');
    console.error(error);
    return false;
  }
}

function buildScene() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0b1020);
  scene.fog = new THREE.Fog(0x0b1020, 8, 18);
  camera = new THREE.PerspectiveCamera(34, 1, 0.01, 100);
  camera.position.set(3.45, 2.55, 5.8);
  controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.07;
  controls.screenSpacePanning = true;
  controls.minDistance = 2.3;
  controls.maxDistance = 10;
  controls.maxPolarAngle = Math.PI * 0.49;
  controls.target.set(0, 1.05, 0);
  controls.touches.ONE = THREE.TOUCH.ROTATE;
  controls.touches.TWO = THREE.TOUCH.DOLLY_PAN;
  controls.mouseButtons.LEFT = THREE.MOUSE.ROTATE;
  controls.mouseButtons.RIGHT = THREE.MOUSE.PAN;

  scene.add(new THREE.HemisphereLight(0xc7d2fe, 0x101629, 1.7));
  keyLight = new THREE.DirectionalLight(0xfff5df, 3.4);
  keyLight.position.set(-3, 6, 4); keyLight.castShadow = true; keyLight.shadow.mapSize.set(1536, 1536);
  keyLight.shadow.camera.left = -4; keyLight.shadow.camera.right = 4; keyLight.shadow.camera.top = 5; keyLight.shadow.camera.bottom = -1;
  keyLight.shadow.normalBias = 0.025;
  scene.add(keyLight);
  const rim = new THREE.DirectionalLight(0x93c5fd, 1.8); rim.position.set(4, 3, -4); scene.add(rim);
  const fill = new THREE.PointLight(0x67e8f9, 1.2, 8); fill.position.set(-2, 1.8, 2); scene.add(fill);

  const grid = new THREE.GridHelper(13, 26, 0x334155, 0x1e293b);
  grid.position.y = 0.015; scene.add(grid);
  floorMesh = new THREE.Mesh(new THREE.PlaneGeometry(13, 13), new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.92, metalness: 0.04 }));
  floorMesh.rotation.x = -Math.PI / 2; floorMesh.receiveShadow = true; scene.add(floorMesh);
  const marker = new THREE.Mesh(new THREE.RingGeometry(0.65, 0.66, 64), new THREE.MeshBasicMaterial({ color: 0x334155, transparent: true, opacity: 0.7, side: THREE.DoubleSide }));
  marker.rotation.x = -Math.PI / 2; marker.position.y = 0.02; scene.add(marker);

  mannequinRoot = new THREE.Group(); scene.add(mannequinRoot);
  assetRoot = new THREE.Group(); scene.add(assetRoot);
  comMarker = new THREE.Mesh(new THREE.SphereGeometry(0.075, 18, 12), new THREE.MeshStandardMaterial({ color: 0x22d3ee, emissive: 0x0e7490, emissiveIntensity: 0.9 }));
  comMarker.castShadow = true; scene.add(comMarker);
  supportFill = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshBasicMaterial({ color: 0xfbbf24, transparent: true, opacity: 0.14, side: THREE.DoubleSide, depthWrite: false }));
  supportFill.rotation.x = 0; scene.add(supportFill);
  supportLine = new THREE.LineLoop(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: 0xfbbf24, transparent: true, opacity: 0.95 })); scene.add(supportLine);
  trajectoryLine = new THREE.Line(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: 0xa78bfa, transparent: true, opacity: 0.9 })); scene.add(trajectoryLine);
  initializeOverlayBuffers();
}

function initializeOverlayBuffers() {
  const fillGeometry = supportFill.geometry;
  fillGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array((MAX_SUPPORT_VERTICES - 2) * 3 * 3), 3));
  fillGeometry.setDrawRange(0, 0);
  const lineGeometry = supportLine.geometry;
  lineGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(MAX_SUPPORT_VERTICES * 3), 3));
  lineGeometry.setDrawRange(0, 0);
  const trajectoryGeometry = trajectoryLine.geometry;
  trajectoryGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(MAX_TRAJECTORY_POINTS * 3), 3));
  trajectoryGeometry.setDrawRange(0, 0);
}

function disposeEnvironment() {
  if (environmentTexture) {
    environmentTexture.dispose();
    environmentTexture = null;
  }
  if (environmentPMREM) {
    environmentPMREM.dispose();
    environmentPMREM = null;
  }
  if (scene) scene.environment = null;
}

function setupEnvironment() {
  environmentPMREM = new THREE.PMREMGenerator(renderer);
  const useFallback = () => {
    if (!environmentPMREM || !running) return;
    const room = new RoomEnvironment(renderer);
    const generated = environmentPMREM.fromScene(room, 0.04).texture;
    environmentTexture = generated;
    scene.environment = generated;
    room.traverse((object) => {
      if (object.isMesh) {
        object.geometry?.dispose();
        if (Array.isArray(object.material)) object.material.forEach((material) => material.dispose());
        else object.material?.dispose();
      }
    });
    environmentPMREM.dispose();
    environmentPMREM = null;
  };
  new HDRLoader().load('./assets/studio_env.hdr', (texture) => {
    if (!running || !environmentPMREM) { texture.dispose(); return; }
    texture.mapping = THREE.EquirectangularReflectionMapping;
    const generated = environmentPMREM.fromEquirectangular(texture).texture;
    texture.dispose();
    environmentTexture = generated;
    scene.environment = generated;
    environmentPMREM.dispose();
    environmentPMREM = null;
  }, undefined, useFallback);
}

function addBodyPart(key, type, dimensions, position, color, mass) {
  const geometry = type === 'sphere' ? new THREE.SphereGeometry(dimensions[0], 24, 16) : new THREE.BoxGeometry(...dimensions);
  const mesh = new THREE.Mesh(geometry, makeMaterial(key, color, 0.6));
  mesh.castShadow = true; mesh.receiveShadow = true; mannequinRoot.add(mesh);
  const shape = type === 'sphere' ? new CANNON.Sphere(dimensions[0]) : new CANNON.Box(new CANNON.Vec3(dimensions[0] / 2, dimensions[1] / 2, dimensions[2] / 2));
  const body = new CANNON.Body({ mass, shape, position: cannonV(position), linearDamping: 0.22, angularDamping: 0.28, allowSleep: true });
  body.material = new CANNON.Material(`${key}-material`);
  world.addBody(body);
  bodyKeysById.set(body.id, key);
  bodyParts.set(key, { key, mesh, body, mass, initial: { position: position.clone(), quaternion: new CANNON.Quaternion(0, 0, 0, 1) } });
  return body;
}

function setConstraintForce(constraint, maxForce) {
  constraint.maxForce = maxForce;
  constraint.equations?.forEach((equation) => { equation.minForce = -maxForce; equation.maxForce = maxForce; });
}

function connect(a, pivotA, b, pivotB, angle = Math.PI * 0.55, twistAngle = Math.PI * 0.35) {
  const constraint = new CANNON.ConeTwistConstraint(a, b, {
    pivotA: cannonV(pivotA),
    pivotB: cannonV(pivotB),
    axisA: new CANNON.Vec3(0, 1, 0),
    axisB: new CANNON.Vec3(0, 1, 0),
    angle,
    twistAngle,
    maxForce: 1e6,
    collideConnected: false
  });
  world.addConstraint(constraint); constraints.push(constraint); return constraint;
}

function buildPhysics() {
  world = new CANNON.World({ gravity: new CANNON.Vec3(0, -9.81, 0) });
  world.broadphase = new CANNON.SAPBroadphase(world);
  world.allowSleep = true; world.solver.iterations = 12; world.defaultContactMaterial.friction = 0.42; world.defaultContactMaterial.restitution = 0.08;
  floorBody = new CANNON.Body({ mass: 0, shape: new CANNON.Plane(), material: new CANNON.Material('floor') });
  floorBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0); world.addBody(floorBody);

  const skin = 0x8ed1c6;
  const pelvis = addBodyPart('pelvis', 'box', [0.48, 0.26, 0.3], v3(0, 1.03, 0), 0x70b5a7, 5.4);
  const torso = addBodyPart('torso', 'box', [0.56, 0.72, 0.36], v3(0, 1.56, 0), skin, 6.4);
  const head = addBodyPart('head', 'sphere', [0.2], v3(0, 2.16, 0), 0xd9a78b, 2.0);
  const upperArmL = addBodyPart('upperArmL', 'box', [0.18, 0.48, 0.18], v3(-0.42, 1.61, 0), 0x71b8ba, 1.0);
  const forearmL = addBodyPart('forearmL', 'box', [0.16, 0.43, 0.16], v3(-0.62, 1.26, 0), 0x71b8ba, 0.8);
  const upperArmR = addBodyPart('upperArmR', 'box', [0.18, 0.48, 0.18], v3(0.42, 1.61, 0), 0x71b8ba, 1.0);
  const forearmR = addBodyPart('forearmR', 'box', [0.16, 0.43, 0.16], v3(0.62, 1.26, 0), 0x71b8ba, 0.8);
  const thighL = addBodyPart('thighL', 'box', [0.2, 0.55, 0.2], v3(-0.14, 0.67, 0), 0x78b7bd, 1.5);
  const shinL = addBodyPart('shinL', 'box', [0.17, 0.4, 0.17], v3(-0.14, 0.22, 0), 0x78b7bd, 1.1);
  const thighR = addBodyPart('thighR', 'box', [0.2, 0.55, 0.2], v3(0.14, 0.67, 0), 0x78b7bd, 1.5);
  const shinR = addBodyPart('shinR', 'box', [0.17, 0.4, 0.17], v3(0.14, 0.22, 0), 0x78b7bd, 1.1);
  connect(pelvis, v3(0, 0.12, 0), torso, v3(0, -0.36, 0), Math.PI * 0.55, Math.PI * 0.35);
  connect(torso, v3(0, 0.37, 0), head, v3(0, -0.18, 0), Math.PI * 0.4, Math.PI * 0.3);
  connect(torso, v3(-0.28, 0.25, 0), upperArmL, v3(0, 0.22, 0), Math.PI * 0.85, Math.PI * 0.45);
  connect(upperArmL, v3(0, -0.22, 0), forearmL, v3(0, 0.2, 0), Math.PI * 0.55, Math.PI * 0.25);
  connect(torso, v3(0.28, 0.25, 0), upperArmR, v3(0, 0.22, 0), Math.PI * 0.85, Math.PI * 0.45);
  connect(upperArmR, v3(0, -0.22, 0), forearmR, v3(0, 0.2, 0), Math.PI * 0.55, Math.PI * 0.25);
  connect(pelvis, v3(-0.14, -0.12, 0), thighL, v3(0, 0.25, 0), Math.PI * 0.5, Math.PI * 0.3);
  connect(thighL, v3(0, -0.25, 0), shinL, v3(0, 0.2, 0), Math.PI * 0.4, Math.PI * 0.2);
  connect(pelvis, v3(0.14, -0.12, 0), thighR, v3(0, 0.25, 0), Math.PI * 0.5, Math.PI * 0.3);
  connect(thighR, v3(0, -0.25, 0), shinR, v3(0, 0.2, 0), Math.PI * 0.4, Math.PI * 0.2);
  resetBodies();
}

function resetBodies() {
  bodyParts.forEach(({ body, initial }) => {
    body.position.copy(initial.position); body.quaternion.copy(initial.quaternion); body.velocity.set(0, 0, 0); body.angularVelocity.set(0, 0, 0); body.force.set(0, 0, 0); body.torque.set(0, 0, 0); body.wakeUp();
  });
  sim.state = 'Locomotion'; sim.stateElapsed = 0; sim.elapsed = 0; sim.playing = false; sim.paused = false; sim.recoveryStep = false; sim.autoRecover = false; sim.impactApplied = false; sim.accumulator = 0; sim.tick = 0; sim.renderAlpha = 1; sim.droppedTime = false; sim.contactCount = 0; sim.xcomEdgeDistance = 0; sim.settleDwell = 0; sim.recoverySucceeded = false; trajectoryPoints = [];
  activeRun = null;
constraints.forEach((constraint) => setConstraintForce(constraint, physicsTuning.joints.uprightForce));
  setFriction(sim.friction);
  syncPreviousTransforms();
  updateVisuals(true); updateUI();
}

function setFriction(name) {
  sim.friction = name;
  const config = frictionConfig[name];
  world.defaultContactMaterial.friction = config.friction;
  world.defaultContactMaterial.restitution = config.restitution;
  if (floorBody) floorBody.material.friction = config.friction;
  const materialPairs = world.contactmaterials || [];
  materialPairs.forEach((pair) => { pair.friction = config.friction; pair.restitution = config.restitution; });
  $('#friction-description').textContent = config.description;
  $$('[data-friction]').forEach((button) => setPressed(button, button.dataset.friction === name));
}

function setPressed(button, pressed) { button.classList.toggle('selected', pressed); button.setAttribute('aria-pressed', String(pressed)); }

function transitionTo(nextState) {
  if (!STATES.includes(nextState) || nextState === sim.state) return;
  const previousState = sim.state;
  sim.state = nextState; sim.stateElapsed = 0;
  if (activeRun) {
    const event = { tick: sim.tick, from: previousState, to: nextState };
    activeRun.events.push(event);
    if (activeRun.isReplay && activeRun.expected?.events?.[activeRun.events.length - 1]) {
      const expected = activeRun.expected.events[activeRun.events.length - 1];
      if (JSON.stringify(expected) !== JSON.stringify(event)) setReplayStatus('Mismatch');
    }
  }
  if (nextState === 'ImpactReact') applyImpact();
  if (nextState === 'Collapse') { sim.impactApplied = true; constraints.forEach((constraint) => setConstraintForce(constraint, physicsTuning.joints.collapseForce)); }
  if (nextState === 'Grounded') { constraints.forEach((constraint) => setConstraintForce(constraint, physicsTuning.joints.uprightForce)); sim.playing = true; }
  updateUI();
}

function applyImpact() {
  sim.impactApplied = true;
  const intensity = sim.intensity * regionMultiplier[sim.region];
  const direction = directionVector[sim.direction].clone();
  const jitter = (sim.rng?.() ?? 0.5) * 0.14 - 0.07;
  direction.x += jitter; direction.z -= jitter * 0.6; direction.normalize();
  const movementScale = sim.movement === 'Run' ? 1.14 : sim.movement === 'Walk' ? 1.03 : 0.92;
  const impulseMagnitude = physicsTuning.impact.minimumImpulse + intensity * physicsTuning.impact.intensityImpulse;
  const impulse = direction.scale(impulseMagnitude * movementScale);
  const side = sim.direction === 'Left' ? 'L' : sim.direction === 'Right' ? 'R' : (sim.rng?.() ?? 0.5) > 0.5 ? 'L' : 'R';
  const targetKey = sim.region === 'Arm' ? `upperArm${side}` : sim.region === 'Leg' ? `thigh${side}` : 'torso';
  const target = bodyParts.get(targetKey)?.body || bodyParts.get('torso').body;
  target.applyImpulse(impulse, target.position);
  const torqueScale = physicsTuning.impact.torqueBase + intensity * physicsTuning.impact.torqueIntensity;
  const torque = new CANNON.Vec3(direction.z * torqueScale, 0, -direction.x * torqueScale);
  bodyParts.get('torso').body.applyTorque(torque);
  const readout = `${sim.region} · ${sim.direction} · intensity ${sim.intensity.toFixed(2)}`;
  $('#impact-readout').textContent = readout;
}

function applyQuaternionSpring(body, targetEuler, strength, damping = 0.18) {
  if (!body || strength <= 0) return;
  const target = new CANNON.Quaternion().setFromEuler(targetEuler.x, targetEuler.y, targetEuler.z);
  const inverse = body.quaternion.inverse(new CANNON.Quaternion());
  const error = inverse.mult(target, new CANNON.Quaternion());
  if (error.w < 0) { error.x *= -1; error.y *= -1; error.z *= -1; }
  body.applyTorque(new CANNON.Vec3(
    error.x * strength * 2 - body.angularVelocity.x * strength * damping,
    error.y * strength * 2 - body.angularVelocity.y * strength * damping,
    error.z * strength * 2 - body.angularVelocity.z * strength * damping
  ));
}

function drivePhysicalPose(strength, lean = 0) {
  const torso = bodyParts.get('torso')?.body;
  const pelvis = bodyParts.get('pelvis')?.body;
  if (!torso || !pelvis || strength <= 0) return;
  const flinch = sim.state === 'ImpactReact' ? Math.sin((sim.stateElapsed / 0.25) * Math.PI) : 0;
  const recovery = sim.state === 'Recover' ? clamp(sim.stateElapsed / 1.4, 0, 1) : 0;
  applyQuaternionSpring(torso, { x: lean + flinch * 0.08, y: 0, z: -lean * 0.62 }, strength);
  applyQuaternionSpring(pelvis, { x: lean * 0.45, y: 0, z: -lean * 0.24 }, strength * 0.8);
  applyQuaternionSpring(bodyParts.get('upperArmL')?.body, { x: flinch * -0.18, y: 0, z: -0.12 }, strength * 0.45);
  applyQuaternionSpring(bodyParts.get('upperArmR')?.body, { x: flinch * 0.18, y: 0, z: 0.12 }, strength * 0.45);
  applyQuaternionSpring(bodyParts.get('forearmL')?.body, { x: flinch * -0.12, y: 0, z: -0.08 }, strength * 0.35);
  applyQuaternionSpring(bodyParts.get('forearmR')?.body, { x: flinch * 0.12, y: 0, z: 0.08 }, strength * 0.35);
  applyQuaternionSpring(bodyParts.get('thighL')?.body, { x: 0, y: 0, z: recovery * 0.08 }, strength * 0.25);
  applyQuaternionSpring(bodyParts.get('thighR')?.body, { x: 0, y: 0, z: -recovery * 0.08 }, strength * 0.25);
  if (recovery > 0) {
    const lift = new CANNON.Vec3(
      -pelvis.velocity.x * 2.2,
      (1.03 - pelvis.position.y) * 12 - pelvis.velocity.y * 2.4,
      -pelvis.velocity.z * 2.2
    );
    lift.scale(recovery * 0.45, lift);
    pelvis.applyForce(lift, pelvis.position);
  }
}

function updateSimulationTick(dt = FIXED_STEP) {
  if (!sim.playing || sim.paused) return;
  capturePreviousTransforms();
  sim.tick += 1;
  sim.elapsed += dt;
  sim.stateElapsed += dt;
  const locomotionVelocity = movementSpeed[sim.movement];
  bodyParts.forEach(({ body }) => body.wakeUp());
  if (sim.state === 'Locomotion') {
    ['pelvis', 'torso'].forEach((key) => { const body = bodyParts.get(key)?.body; if (body) body.velocity.x = locomotionVelocity; });
    drivePhysicalPose(40, 0);
    if (sim.stateElapsed >= 0.72) transitionTo('ImpactReact');
  } else if (sim.state === 'ImpactReact') {
    drivePhysicalPose(25, sim.intensity * 0.3);
    if (sim.stateElapsed >= 0.25) transitionTo('Stagger');
  } else if (sim.state === 'Stagger') {
    const stability = calculateStability();
    drivePhysicalPose(22 * (1 - sim.stateElapsed / 1.4), 0.12 * (stability === 'Unstable' ? 1 : 0));
    if (!sim.recoveryStep && sim.stateElapsed > 0.35) {
      sim.recoveryStep = true;
      const chance = sim.rng?.() ?? 0.5;
      const canAttempt = sim.friction !== 'Slippery' && sim.intensity < physicsTuning.recovery.maximumIntensity && stability !== 'Falling' && chance > physicsTuning.recovery.minimumChance;
      if (canAttempt) {
        const side = chance > 0.6 ? -1 : 1;
        const key = side < 0 ? 'shinL' : 'shinR';
        const leg = bodyParts.get(key)?.body;
        if (leg) leg.applyImpulse(new CANNON.Vec3(side * physicsTuning.recovery.stepImpulse, physicsTuning.recovery.stepLift, 0), leg.position);
        $('#impact-readout').textContent = 'Recovery step attempted · balance check';
      } else {
        $('#impact-readout').textContent = 'Recovery step missed · physics takeover';
      }
    }
    if (sim.stateElapsed >= 1.2 || (stability === 'Falling' && sim.stateElapsed > 0.55)) transitionTo('Collapse');
  } else if (sim.state === 'Collapse') {
    const strength = clamp(1 - sim.stateElapsed / 0.72, 0, 1);
    drivePhysicalPose(18 * strength, sim.intensity * 0.46 * strength);
    constraints.forEach((constraint) => setConstraintForce(constraint, physicsTuning.joints.minimumCollapseForce + (physicsTuning.joints.collapseForce - physicsTuning.joints.minimumCollapseForce) * strength));
  } else if (sim.state === 'Grounded') {
    bodyParts.forEach(({ body }) => { body.velocity.scale(0.88, body.velocity); body.angularVelocity.scale(0.88, body.angularVelocity); });
    if (sim.stateElapsed > 0.45) sim.playing = false;
  } else if (sim.state === 'Recover') {
    drivePhysicalPose(16, 0);
    if (sim.stateElapsed > 1.4) {
      const support = footSupportPoints();
      const recoveredEdge = signedDistanceToPolygon(calculateXCOM(), support);
      sim.recoverySucceeded = floorContactSamples().length > 0 && recoveredEdge > 0;
      $('#impact-readout').textContent = sim.recoverySucceeded ? 'Recovery stabilized · grounded' : 'Recovery incomplete · grounded';
      transitionTo('Grounded');
      sim.playing = false;
    }
  }
  world.defaultContactMaterial.friction = frictionConfig[sim.friction].friction;
  world.step(FIXED_STEP);
  if (sim.state === 'Collapse' && sim.stateElapsed >= 0.76 && updateSettleDwell(dt)) {
    transitionTo('Grounded');
    const recoveryChance = sim.rng?.() ?? 0.5;
    sim.autoRecover = sim.intensity < physicsTuning.recovery.successIntensity && sim.friction === 'Grippy' && recoveryChance > 0.35;
    if (sim.autoRecover) transitionTo('Recover');
  }
  recordChecksum();
  if (!sim.playing) finishActiveRun();
}

function calculateCOM() {
  const total = [...bodyParts.values()].reduce((sum, part) => sum + part.mass, 0);
  const result = new CANNON.Vec3(0, 0, 0);
  bodyParts.forEach(({ body, mass }) => { result.x += body.position.x * mass; result.y += body.position.y * mass; result.z += body.position.z * mass; });
  result.scale(1 / total, result); return result;
}

function allFloorContactCount() {
  if (!world || !floorBody) return 0;
  const bodies = new Set();
  world.contacts.forEach((contact) => {
    const body = contact.bi === floorBody ? contact.bj : contact.bj === floorBody ? contact.bi : null;
    if (body && bodyKeysById.has(body.id)) bodies.add(body.id);
  });
  return bodies.size;
}

function floorContactSamples() {
  const samples = [];
  if (!world || !floorBody) return samples;
  for (const contact of world.contacts) {
    let body;
    let offset;
    if (contact.bi === floorBody) {
      body = contact.bj;
      offset = contact.rj;
    } else if (contact.bj === floorBody) {
      body = contact.bi;
      offset = contact.ri;
    } else {
      continue;
    }
    const key = bodyKeysById.get(body.id);
    if (key !== 'shinL' && key !== 'shinR') continue;
    samples.push({ key, x: body.position.x + offset.x, z: body.position.z + offset.z });
  }
  return samples;
}

function footSupportPoints() {
  const contacts = floorContactSamples();
  sim.contactCount = contacts.length;
  const points = [];
  if (contacts.length > 0) {
    contacts.forEach(({ x, z }) => {
      points.push({ x: x - 0.12, z: z - 0.14 });
      points.push({ x: x - 0.12, z: z + 0.14 });
      points.push({ x: x + 0.12, z: z + 0.14 });
      points.push({ x: x + 0.12, z: z - 0.14 });
    });
  } else {
    // Before the first Cannon contact manifold exists, show the authored foot footprint.
    for (const key of ['shinL', 'shinR']) {
      const body = bodyParts.get(key)?.body; if (!body) continue;
      points.push({ x: body.position.x - 0.12, z: body.position.z - 0.14 });
      points.push({ x: body.position.x - 0.12, z: body.position.z + 0.14 });
      points.push({ x: body.position.x + 0.12, z: body.position.z + 0.14 });
      points.push({ x: body.position.x + 0.12, z: body.position.z - 0.14 });
    }
  }
  return convexHull(points);
}

function convexHull(points) {
  const sorted = points.slice().sort((a, b) => a.x - b.x || a.z - b.z);
  if (sorted.length <= 3) return sorted;
  const cross = (o, a, b) => (a.x - o.x) * (b.z - o.z) - (a.z - o.z) * (b.x - o.x);
  const lower = []; for (const point of sorted) { while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], point) <= 0) lower.pop(); lower.push(point); }
  const upper = []; for (const point of sorted.slice().reverse()) { while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], point) <= 0) upper.pop(); upper.push(point); }
  return lower.slice(0, -1).concat(upper.slice(0, -1));
}

function pointInPolygon(point, polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const a = polygon[i]; const b = polygon[j];
    const intersects = ((a.z > point.z) !== (b.z > point.z)) && (point.x < (b.x - a.x) * (point.z - a.z) / (b.z - a.z + 1e-9) + a.x);
    if (intersects) inside = !inside;
  }
  return inside;
}

function distanceToSegment(point, a, b) {
  const dx = b.x - a.x;
  const dz = b.z - a.z;
  const lengthSquared = dx * dx + dz * dz || 1;
  const t = clamp(((point.x - a.x) * dx + (point.z - a.z) * dz) / lengthSquared, 0, 1);
  const x = a.x + t * dx;
  const z = a.z + t * dz;
  return Math.hypot(point.x - x, point.z - z);
}

function signedDistanceToPolygon(point, polygon) {
  if (polygon.length < 3) return -Infinity;
  let minimum = Infinity;
  for (let index = 0; index < polygon.length; index += 1) {
    minimum = Math.min(minimum, distanceToSegment(point, polygon[index], polygon[(index + 1) % polygon.length]));
  }
  return pointInPolygon(point, polygon) ? minimum : -minimum;
}

function calculateXCOM() {
  const com = calculateCOM();
  const total = [...bodyParts.values()].reduce((sum, part) => sum + part.mass, 0);
  const velocity = new CANNON.Vec3(0, 0, 0);
  bodyParts.forEach(({ body, mass }) => {
    velocity.x += body.velocity.x * mass;
    velocity.y += body.velocity.y * mass;
    velocity.z += body.velocity.z * mass;
  });
  velocity.scale(1 / total, velocity);
  const height = clamp(com.y, 0.35, 2.4);
  const naturalFrequency = Math.sqrt(9.81 / height);
  return { x: com.x + velocity.x / naturalFrequency, z: com.z + velocity.z / naturalFrequency };
}

function calculateStability() {
  const support = footSupportPoints();
  const xcom = calculateXCOM();
  const edgeDistance = signedDistanceToPolygon(xcom, support);
  sim.xcomEdgeDistance = Number.isFinite(edgeDistance) ? edgeDistance : -1;
  const torso = bodyParts.get('torso')?.body;
  const tilt = torso ? Math.abs(torso.quaternion.y) + Math.abs(torso.quaternion.z) : 0;
  if (sim.state === 'Collapse' || sim.state === 'Grounded' || sim.state === 'Recover') return 'Falling';
  if (edgeDistance < 0 || tilt > 0.72) return 'Unstable';
  return 'Stable';
}

function updateSettleDwell(dt) {
  const contacts = allFloorContactCount();
  let maximumSpeed = 0;
  let maximumAngularSpeed = 0;
  bodyParts.forEach(({ body }) => {
    maximumSpeed = Math.max(maximumSpeed, body.velocity.length());
    maximumAngularSpeed = Math.max(maximumAngularSpeed, body.angularVelocity.length());
  });
  const com = calculateCOM();
  const settled = contacts > 0 && com.y < physicsTuning.settle.maxComHeight && maximumSpeed < physicsTuning.settle.maxSpeed && maximumAngularSpeed < physicsTuning.settle.maxAngularSpeed;
  sim.settleDwell = settled ? sim.settleDwell + dt : Math.max(0, sim.settleDwell - dt * 2);
  return sim.settleDwell >= physicsTuning.settle.dwell;
}

function updateVisuals(force = false) {
  const now = performance.now();
  const overlayInterval = 1000 / (qualityProfiles[sim.quality]?.overlayHz || 60);
  if (!force && now - lastVisualUpdate < overlayInterval) return;
  lastVisualUpdate = now;
  bodyParts.forEach(({ body, mesh }, key) => {
    const previous = previousTransforms.get(key);
    renderPosition.set(body.position.x, body.position.y, body.position.z);
    renderQuaternion.set(body.quaternion.x, body.quaternion.y, body.quaternion.z, body.quaternion.w);
    if (previous) {
      mesh.position.lerpVectors(previous.position, renderPosition, sim.renderAlpha);
      mesh.quaternion.slerpQuaternions(previous.quaternion, renderQuaternion, sim.renderAlpha).normalize();
    } else {
      mesh.position.copy(currentPosition);
      mesh.quaternion.copy(currentQuaternion);
    }
  });
  applyCharacterPose();
  const com = calculateCOM(); comMarker.position.set(com.x, com.y, com.z); comMarker.visible = $('#show-com')?.checked ?? true;
  const support = footSupportPoints();
  updateSupportOverlay(support);
  const stability = calculateStability();
  $('#stability-label').textContent = stability;
  $('#stability-label').className = stability.toLowerCase();
  if ($('#show-trajectory')?.checked && (sim.playing || force) && (!trajectoryPoints.length || trajectoryPoints[trajectoryPoints.length - 1].distanceTo(comMarker.position) > 0.025)) {
    trajectoryPoints.push(comMarker.position.clone()); if (trajectoryPoints.length > 180) trajectoryPoints.shift();
  }
  updateTrajectoryOverlay();
}

function updateTrajectoryOverlay() {
  const geometry = trajectoryLine.geometry;
  const attribute = geometry.getAttribute('position');
  const count = Math.min(trajectoryPoints.length, qualityProfiles[sim.quality].maxTrail, MAX_TRAJECTORY_POINTS);
  for (let index = 0; index < count; index += 1) {
    attribute.setXYZ(index, trajectoryPoints[index].x, trajectoryPoints[index].y, trajectoryPoints[index].z);
  }
  attribute.needsUpdate = true;
  geometry.boundingSphere = null;
  geometry.setDrawRange(0, count);
  trajectoryLine.visible = $('#show-trajectory')?.checked ?? true;
}

function updateSupportOverlay(points) {
  const visible = $('#show-support')?.checked ?? true;
  supportFill.visible = visible; supportLine.visible = visible;
  const usablePoints = points.slice(0, MAX_SUPPORT_VERTICES);
  if (usablePoints.length < 3) {
    supportFill.geometry.setDrawRange(0, 0);
    supportLine.geometry.setDrawRange(0, 0);
    return;
  }
  const center = usablePoints.reduce((sum, point) => ({ x: sum.x + point.x, z: sum.z + point.z }), { x: 0, z: 0 });
  center.x /= usablePoints.length;
  center.z /= usablePoints.length;
  const fillAttribute = supportFill.geometry.getAttribute('position');
  let fillIndex = 0;
  for (let index = 0; index < usablePoints.length - 1; index += 1) {
    const a = usablePoints[index];
    const b = usablePoints[index + 1];
    fillAttribute.setXYZ(fillIndex++, center.x, 0, center.z);
    fillAttribute.setXYZ(fillIndex++, a.x, 0, a.z);
    fillAttribute.setXYZ(fillIndex++, b.x, 0, b.z);
  }
  fillAttribute.needsUpdate = true;
  supportFill.geometry.boundingSphere = null;
  supportFill.geometry.setDrawRange(0, fillIndex);
  supportFill.rotation.x = 0;
  supportFill.position.y = 0.024;
  const lineAttribute = supportLine.geometry.getAttribute('position');
  usablePoints.forEach((point, index) => lineAttribute.setXYZ(index, point.x, 0.031, point.z));
  lineAttribute.needsUpdate = true;
  supportLine.geometry.boundingSphere = null;
  supportLine.geometry.setDrawRange(0, usablePoints.length);
}

function animate(time) {
  if (!running) return;
  if (contextLost) { requestAnimationFrame(animate); return; }
  frameStats.frames += 1;
  if (time - frameStats.sampleTime >= 500) {
    frameStats.fps = Math.round((frameStats.frames * 1000) / Math.max(1, time - frameStats.sampleTime));
    frameStats.sampleTime = time;
    frameStats.frames = 0;
  }
  const realDt = Math.min(0.1, (time - sim.lastFrame) / 1000 || 0);
  sim.lastFrame = time;
  if (sim.playing && !sim.paused) {
    sim.accumulator += realDt * sim.slow;
    let ticks = 0;
    while (sim.accumulator >= FIXED_STEP && ticks < MAX_CATCHUP_TICKS) {
      updateSimulationTick(FIXED_STEP);
      sim.accumulator -= FIXED_STEP;
      ticks += 1;
    }
    if (ticks === MAX_CATCHUP_TICKS && sim.accumulator >= FIXED_STEP) {
      sim.accumulator = 0;
      sim.droppedTime = true;
    }
  }
  sim.renderAlpha = clamp(sim.accumulator / FIXED_STEP, 0, 1);
  controls.update();
  updateVisuals(); updateUI();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

function lessonCopy() {
  if (sim.state === 'ImpactReact') return 'ImpactReact is a short flinch phase: pose-driving torque is still active while the event impulse is introduced.';
  if (sim.state === 'Stagger') return sim.xcomEdgeDistance < 0 ? 'Stagger: XCoM is outside the current support area, so the proxy is checking for one recovery step.' : 'Stagger: compare the cyan XCoM projection with the amber support boundary.';
  if (sim.state === 'Collapse') return 'Collapse: constraint strength and pose-driving strength are being reduced so the rigid-body simulation takes over.';
  if (sim.state === 'Grounded') return 'Grounded: floor contact and low motion have held for the settling dwell window.';
  if (sim.state === 'Recover') return 'Recover: a low-intensity, grippy run is blending toward an upright target pose.';
  return 'Watch the cyan COM marker stay over the amber support area during Stable motion.';
}

function updateUI() {
  $('#state-label').textContent = sim.state;
  $$('[data-mode]').forEach((button) => setPressed(button, button.dataset.mode === sim.mode));
  $('#sim-clock').textContent = `${sim.elapsed.toFixed(2)} s`;
  $('#seed-value').textContent = String(sim.seed >>> 0);
  if ($('#contact-count')) $('#contact-count').textContent = String(sim.contactCount);
  if ($('#xcom-edge')) $('#xcom-edge').textContent = Number.isFinite(sim.xcomEdgeDistance) ? `${sim.xcomEdgeDistance.toFixed(2)} m` : '—';
  $$('[data-state-track]').forEach((node) => node.classList.toggle('active', node.dataset.stateTrack === sim.state));
  $('#play-button').textContent = sim.playing && !sim.paused ? 'Playing' : 'Play';
  $('#pause-button').textContent = sim.paused ? 'Resume' : 'Pause';
  if ($('#replay-status')) $('#replay-status').textContent = sim.replayStatus;
  if ($('#mode-hint')) $('#mode-hint').textContent = sim.mode === 'Setup' ? 'Setup mode edits the next run. Play starts a fresh seeded recording.' : 'Playback mode is running a snapshot. Pause or frame-step without changing its setup.';
  const lesson = lessonCopy();
  if ($('#lesson-explanation') && $('#lesson-explanation').textContent !== lesson) $('#lesson-explanation').textContent = lesson;
  $('#loading-scene').classList.add('hidden');
  const fpsText = frameStats.fps ? ` · ${frameStats.fps} FPS` : '';
  $('#physics-readout').textContent = `Physics quality: ${sim.quality === 'high' ? 'High' : 'Mobile optimized'}${fpsText}${sim.droppedTime ? ' · time capped' : ''}`;
}

function setScenarioStatus(message, warning = false) {
  const node = $('#scenario-status');
  if (!node) return;
  node.textContent = message;
  node.classList.toggle('warning', warning);
}

function encodeScenario(payload) {
  return btoa(JSON.stringify(payload)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function decodeScenario(value) {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((value.length + 3) % 4);
  return JSON.parse(atob(padded));
}

function scenarioPayload() {
  return { version: 1, seed: sim.seed >>> 0, parameters: currentRunParameters() };
}

function applyScenario(name) {
  const preset = scenarioPresets[name];
  if (!preset) return;
  sim.seed = preset.seed;
  applyRunParameters(preset);
  resetSession(false);
  setScenarioStatus(`Loaded preset: ${name}`);
}

function validateScenarioParameters(parameters) {
  const valid = {
    movement: ['Idle', 'Walk', 'Run'],
    region: ['Torso', 'Arm', 'Leg'],
    direction: ['Front', 'Back', 'Left', 'Right'],
    friction: ['Normal', 'Slippery', 'Grippy'],
    slow: [1, 0.5, 0.25],
    quality: ['high', 'mobile']
  };
  for (const [key, values] of Object.entries(valid)) {
    if (!values.includes(parameters?.[key])) throw new Error(`Invalid scenario parameter: ${key}`);
  }
  if (!Number.isFinite(parameters.intensity) || parameters.intensity < 0 || parameters.intensity > 1) throw new Error('Invalid scenario intensity');
}

function loadScenarioFromURL() {
  const match = window.location.hash.match(/^#scenario=([^&]+)$/);
  if (!match) return false;
  try {
    const payload = decodeScenario(match[1]);
    if (payload?.version !== 1 || !payload.parameters || typeof payload.seed !== 'number') throw new Error('Unsupported scenario format');
    validateScenarioParameters(payload.parameters);
    sim.seed = payload.seed >>> 0;
    applyRunParameters(payload.parameters);
    resetSession(false);
    setScenarioStatus('Loaded scenario from URL');
    return true;
  } catch (error) {
    setScenarioStatus('Scenario URL could not be loaded', true);
    console.warn(error);
    return false;
  }
}

async function copyScenarioToClipboard() {
  const url = `${window.location.href.split('#')[0]}#scenario=${encodeScenario(scenarioPayload())}`;
  setScenarioStatus('Copying scenario…');
  try {
    let copied = false;
    if (navigator.clipboard?.writeText) {
      try {
        await Promise.race([
          navigator.clipboard.writeText(url),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Clipboard timeout')), 800))
        ]);
        copied = true;
      } catch (error) {
        console.warn(error);
      }
    }
    if (!copied) {
      const helper = document.createElement('textarea');
      helper.value = url;
      helper.setAttribute('readonly', '');
      helper.style.position = 'fixed'; helper.style.opacity = '0';
      document.body.appendChild(helper); helper.select();
      copied = document.execCommand?.('copy') === true;
      helper.remove();
    }
    if (!copied) throw new Error('Clipboard unavailable');
    setScenarioStatus('Scenario link copied');
  } catch (error) {
    setScenarioStatus('Copy unavailable — use the URL hash manually', true);
    console.warn(error);
  }
}

function bindKeyboardControls() {
  window.addEventListener('keydown', (event) => {
    const target = event.target;
    if (target instanceof HTMLElement && target.closest('input,button,textarea,select,summary') && target !== canvas) return;
    const key = event.key.toLowerCase();
    if (event.key === ' ') { event.preventDefault(); $('#play-button').click(); }
    else if (key === 'n' || event.key === '.') { event.preventDefault(); $('#step-button').click(); }
    else if (key === 'r') { event.preventDefault(); $('#reset-button').click(); }
    else if (key === 's') { event.preventDefault(); $('#mode-setup').click(); }
    else if (key === 'c') { event.preventDefault(); $('#camera-reset').click(); }
    else if (event.key === '?') { event.preventDefault(); $('#readme-open').click(); }
  });
}

function bindReducedMotion() {
  const query = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)');
  if (!query) return;
  const apply = () => {
    document.documentElement.classList.toggle('reduced-motion', query.matches);
    if (controls) controls.enableDamping = !query.matches;
  };
  apply();
  query.addEventListener?.('change', apply);
}

function startNewRun() {
  resetBodies();
  const snapshot = createReplaySnapshot();
  lastReplaySnapshot = snapshot;
  beginRun(snapshot, false);
}

function startReplay() {
  if (!lastReplaySnapshot?.result) {
    startNewRun();
    return;
  }
  applyRunParameters(lastReplaySnapshot.parameters);
  resetBodies();
  restoreBodyState(lastReplaySnapshot.initialBodies);
  beginRun(lastReplaySnapshot, true);
}

function resetSession(newSeed = true) {
  if (newSeed) sim.seed = randomSeed();
  lastReplaySnapshot = null;
  activeRun = null;
  sim.rng = mulberry32(sim.seed);
  sim.mode = 'Setup';
  setReplayStatus('Ready');
  resetBodies();
  $('#impact-readout').textContent = 'Impact ready';
}

function frameStep() {
  if (sim.state === 'Grounded' && !sim.playing) return;
  if (!activeRun) startNewRun();
  const wasPlaying = sim.playing;
  sim.playing = true;
  sim.paused = false;
  updateSimulationTick(FIXED_STEP);
  sim.playing = wasPlaying;
  sim.paused = true;
  sim.accumulator = 0;
  sim.renderAlpha = 1;
  updateVisuals(true);
  updateUI();
}

function selectOption(selector, key, value) {
  sim[key] = value; $$(selector).forEach((button) => setPressed(button, button.dataset[key] === value));
  if (key === 'quality') applyQuality();
}

function applyQuality() {
  if (!renderer || !world) return;
  const profile = qualityProfiles[sim.quality] || qualityProfiles.high;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, profile.pixelRatio));
  renderer.shadowMap.enabled = profile.shadows;
  world.solver.iterations = profile.solverIterations;
  world.broadphase = new CANNON.SAPBroadphase(world);
  if (keyLight) {
    keyLight.castShadow = profile.shadows;
    keyLight.shadow.mapSize.set(profile.shadowMap, profile.shadowMap);
    if (keyLight.shadow.map) {
      keyLight.shadow.map.dispose();
      keyLight.shadow.map = null;
    }
  }
  if (trajectoryPoints.length > profile.maxTrail) trajectoryPoints = trajectoryPoints.slice(-profile.maxTrail);
}

function bindUI() {
  $$('[data-mode]').forEach((button) => button.addEventListener('click', () => { sim.mode = button.dataset.mode; sim.playing = false; sim.paused = false; $$('[data-mode]').forEach((item) => setPressed(item, item === button)); updateUI(); }));
  $$('[data-scenario]').forEach((button) => button.addEventListener('click', () => applyScenario(button.dataset.scenario)));
  $('#copy-scenario').addEventListener('click', copyScenarioToClipboard);
  $('#load-scenario').addEventListener('click', () => { if (!loadScenarioFromURL()) setScenarioStatus('No scenario found in the URL', true); });
  bindKeyboardControls();
  $$('[data-movement]').forEach((button) => button.addEventListener('click', () => selectOption('[data-movement]', 'movement', button.dataset.movement)));
  $$('[data-region]').forEach((button) => button.addEventListener('click', () => selectOption('[data-region]', 'region', button.dataset.region)));
  $$('[data-direction]').forEach((button) => button.addEventListener('click', () => selectOption('[data-direction]', 'direction', button.dataset.direction)));
  $$('[data-friction]').forEach((button) => button.addEventListener('click', () => setFriction(button.dataset.friction)));
  $$('[data-slow]').forEach((button) => button.addEventListener('click', () => { sim.slow = Number(button.dataset.slow); $$('[data-slow]').forEach((item) => setPressed(item, item === button)); }));
  $$('[data-quality]').forEach((button) => button.addEventListener('click', () => { sim.quality = button.dataset.quality; $$('[data-quality]').forEach((item) => setPressed(item, item === button)); applyQuality(); }));
  $('#impact-intensity').addEventListener('input', (event) => { sim.intensity = Number(event.target.value); $('#impact-intensity-value').textContent = sim.intensity.toFixed(2); });
  $('#play-button').addEventListener('click', () => { if (!sim.playing || sim.state === 'Grounded') startNewRun(); else sim.paused = false; });
  $('#pause-button').addEventListener('click', () => { if (sim.playing) sim.paused = !sim.paused; updateUI(); });
  $('#step-button').addEventListener('click', frameStep);
  $('#reset-button').addEventListener('click', () => resetSession(true));
  $('#replay-button').addEventListener('click', startReplay);
  $('#camera-reset').addEventListener('click', () => { camera.position.set(3.45, 2.55, 5.8); controls.target.set(0, 1.05, 0); controls.update(); });
  ['show-com', 'show-support', 'show-trajectory'].forEach((id) => $(`#${id}`).addEventListener('change', () => updateVisuals(true)));
  $('#readme-open').addEventListener('click', () => { $('#readme-panel').open = true; $('#readme-panel').scrollIntoView({ behavior: 'smooth', block: 'nearest' }); });
}

function normalizeAssetName(name = '') {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function setAssetStatus(message, warning = false) {
  const status = $('#asset-status');
  if (!status) return;
  status.classList.toggle('warning', warning);
  status.classList.toggle('ready', !warning);
  status.innerHTML = `<i></i> ${message}`;
}

function disposeRenderableTree(root) {
  const disposedGeometries = new Set();
  const disposedMaterials = new Set();
  root?.traverse((object) => {
    if (object.geometry && !disposedGeometries.has(object.geometry)) {
      disposedGeometries.add(object.geometry);
      object.geometry.dispose();
    }
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    materials.forEach((material) => {
      if (material && !disposedMaterials.has(material)) {
        disposedMaterials.add(material);
        disposeMaterial(material);
      }
    });
  });
}

function disposeLoadedCharacter() {
  if (characterAdapter.root) {
    assetRoot.remove(characterAdapter.root);
    disposeRenderableTree(characterAdapter.root);
  }
  characterAdapter.dispose();
  loadedOptionalAsset = false;
  mannequinRoot.visible = true;
}

function validateCharacterScene(root) {
  let meshCount = 0;
  let skinnedMeshCount = 0;
  let boneCount = 0;
  const materials = new Set();
  root.traverse((object) => {
    if (object.isMesh) {
      meshCount += 1;
      if (object.isSkinnedMesh) skinnedMeshCount += 1;
      const list = Array.isArray(object.material) ? object.material : [object.material];
      list.forEach((material) => material && materials.add(material));
      object.castShadow = true;
      object.receiveShadow = true;
    }
    if (object.isBone) boneCount += 1;
  });
  const bounds = new THREE.Box3().setFromObject(root);
  const size = bounds.getSize(new THREE.Vector3());
  if (meshCount === 0 || !Number.isFinite(size.y) || size.y <= 0.01) throw new Error('The character asset contains no usable mesh bounds.');
  return { meshCount, skinnedMeshCount, boneCount, materialCount: materials.size, height: size.y };
}

function normalizeCharacterScene(root) {
  root.updateMatrixWorld(true);
  const initialBounds = new THREE.Box3().setFromObject(root);
  const initialHeight = Math.max(initialBounds.max.y - initialBounds.min.y, 0.01);
  const scale = clamp(CHARACTER_TARGET_HEIGHT / initialHeight, 0.2, 10);
  root.scale.multiplyScalar(scale);
  root.updateMatrixWorld(true);
  const normalizedBounds = new THREE.Box3().setFromObject(root);
  const center = normalizedBounds.getCenter(new THREE.Vector3());
  root.position.x -= center.x;
  root.position.z -= center.z;
  root.position.y += 0.02 - normalizedBounds.min.y;
  root.updateMatrixWorld(true);
}

function mapCharacterBones(root) {
  const available = new Map();
  root.traverse((object) => {
    if (object.isBone) available.set(normalizeAssetName(object.name), object);
  });
  const mapped = new Map();
  for (const [key, aliases] of Object.entries(BONE_ALIASES)) {
    const bone = aliases.map(normalizeAssetName).map((alias) => available.get(alias)).find(Boolean);
    if (bone) mapped.set(key, bone);
  }
  return mapped;
}

function applyCharacterPose() {
  if (!characterAdapter.ready || !characterAdapter.root || characterAdapter.mappedCount === 0) return;
  mannequinRoot.updateMatrixWorld(true);
  assetRoot.updateMatrixWorld(true);
  characterAdapter.bones.forEach((bone, key) => {
    const mesh = bodyParts.get(key)?.mesh;
    if (!mesh || !bone.parent) return;
    mesh.getWorldPosition(characterWorldPosition);
    bone.parent.worldToLocal(characterWorldPosition);
    bone.position.lerp(characterWorldPosition, 0.72);
    mesh.getWorldQuaternion(characterWorldQuaternion);
    bone.parent.getWorldQuaternion(characterParentQuaternion);
    characterLocalQuaternion.copy(characterParentQuaternion).invert().multiply(characterWorldQuaternion);
    bone.quaternion.slerp(characterLocalQuaternion, 0.72).normalize();
    assetRoot.updateMatrixWorld(true);
  });
}

function loadOptionalCharacter() {
  const loader = new GLTFLoader();
  setAssetStatus('Loading optional character · 0%');
  loader.load('./assets/character.glb', (gltf) => {
    if (!running) { disposeRenderableTree(gltf.scene); return; }
    try {
      disposeLoadedCharacter();
      assetRoot.add(gltf.scene);
      const metrics = validateCharacterScene(gltf.scene);
      normalizeCharacterScene(gltf.scene);
      characterAdapter.root = gltf.scene;
      characterAdapter.bones = mapCharacterBones(gltf.scene);
      characterAdapter.metrics = metrics;
      characterAdapter.mappedCount = characterAdapter.bones.size;
      characterAdapter.ready = true;
      mannequinRoot.visible = false;
      assetRoot.visible = true;
      loadedOptionalAsset = true;
      setAssetStatus(`character.glb loaded · ${metrics.meshCount} mesh · ${characterAdapter.mappedCount}/${Object.keys(BONE_ALIASES).length} bones`);
    } catch (error) {
      disposeRenderableTree(gltf.scene);
      assetRoot.remove(gltf.scene);
      characterAdapter.dispose();
      setAssetStatus('Proxy mannequin · character asset rejected', true);
      console.warn(error);
    }
  }, (event) => {
    if (event.lengthComputable && event.total > 0) {
      setAssetStatus(`Loading optional character · ${Math.round((event.loaded / event.total) * 100)}%`);
    } else {
      setAssetStatus('Loading optional character');
    }
  }, () => {
    setAssetStatus('Proxy mannequin · optional character not present');
  });
}

function registerOfflineStatus() {
  const status = $('#offline-status');
  const updateBanner = $('#update-banner');
  const updateButton = $('#update-reload');
  const ready = (message = {}) => {
    status.classList.remove('pending', 'warning');
    status.classList.add(message.complete === false ? 'warning' : 'ready');
    status.innerHTML = `<i></i> ${message.complete === false ? 'Offline shell partial' : 'Offline ready'}`;
  };
  const showUpdate = (registration) => {
    updateBanner.hidden = false;
    updateButton.onclick = () => {
      registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
    };
  };
  if (!('serviceWorker' in navigator)) { status.textContent = 'Service worker unavailable'; return; }
  let refreshing = false;
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data?.type === 'OFFLINE_READY') ready(event.data);
  });
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing) return;
    refreshing = true;
    window.location.reload();
  });
  navigator.serviceWorker.register('./sw.js', { scope: './' }).then((registration) => {
    if (registration.waiting) showUpdate(registration);
    registration.addEventListener('updatefound', () => {
      const worker = registration.installing;
      worker?.addEventListener('statechange', () => {
        if (worker.state === 'installed' && navigator.serviceWorker.controller) showUpdate(registration);
      });
    });
    const active = registration.active || navigator.serviceWorker.controller;
    active?.postMessage({ type: 'CHECK_CACHE' });
  }).catch(() => { status.classList.remove('pending'); status.classList.add('warning'); status.innerHTML = '<i></i> Online mode'; });
}

function resize() {
  const width = canvas.clientWidth || 800;
  const height = canvas.clientHeight || 600;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height, false);
  applyQuality();
}

function setupResizeHandling() {
  window.addEventListener('resize', resize);
  if ('ResizeObserver' in globalThis) {
    resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas.parentElement || canvas);
  }
}

function disposeMaterial(material) {
  if (!material) return;
  ['map', 'alphaMap', 'aoMap', 'bumpMap', 'clearcoatNormalMap', 'displacementMap', 'emissiveMap', 'envMap', 'lightMap', 'metalnessMap', 'normalMap', 'roughnessMap'].forEach((key) => material[key]?.dispose?.());
  material.dispose?.();
}

function disposeSceneResources() {
  if (resizeObserver) resizeObserver.disconnect();
  window.removeEventListener('resize', resize);
  controls?.dispose();
  disposeEnvironment();
  const disposedGeometries = new Set();
  const disposedMaterials = new Set();
  scene?.traverse((object) => {
    if (object.geometry && !disposedGeometries.has(object.geometry)) {
      disposedGeometries.add(object.geometry);
      object.geometry.dispose();
    }
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    materials.forEach((material) => {
      if (material && !disposedMaterials.has(material)) {
        disposedMaterials.add(material);
        disposeMaterial(material);
      }
    });
  });
  renderer?.dispose();
}

function boot() {
  if (!buildRenderer()) return;
  buildScene(); setupEnvironment(); buildPhysics(); bindUI(); bindReducedMotion(); loadScenarioFromURL(); loadOptionalCharacter(); registerOfflineStatus();
  setFriction(sim.friction); applyQuality(); resize(); setupResizeHandling();
  window.addEventListener('pagehide', () => { running = false; disposeSceneResources(); }, { once: true });
  $('#loading-scene').classList.add('hidden'); sim.rng = mulberry32(sim.seed); updateVisuals(true); updateUI(); requestAnimationFrame(animate);
}

boot();
