import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { buildPerformanceRig } from '../lib/kinesiology/performanceRig.js';
import { parseBVH } from '../lib/kinesiology/bvh.js';
import { computeCalibration, finalizeGround, applyBVHFrame, computeStanceData, applyFootPlant } from '../lib/kinesiology/retarget.js';
import { AUTHORED_ACTIONS, applyAuthoredPose, CLINICAL_PATTERNS } from '../lib/kinesiology/authoredTracks.js';
import { ACTIONS, ACTION_BY_ID, ROLE_LABELS, COACH_CUES } from '../lib/kinesiology/actions.js';
import { MUSCLE_FACTS, factFor, sideLabel } from '../data/kinesiology/muscleFacts.js';
import { CAMERA_PRESETS, cameraStateFor, applyCamera } from '../lib/kinesiology/cameraDirector.js';
import { sampleSagittalAngles, calibrateAngles, NORM_BANDS, curvePath, bandPolygon } from '../lib/kinesiology/jointAngles.js';
import { getDeviceProfile } from '../lib/deviceProfile.js';
import { Icon } from './Icons';
import walkClip from '../data/kinesiology/walk_cmu.bvh?raw';
import jumpClip from '../data/kinesiology/jump_cmu.bvh?raw';

const CLIPS = { walk_cmu: walkClip, jump_cmu: jumpClip };
const PLANE_BY_ACTION = { walk: 'Sagittal', run: 'Sagittal', jump: 'Sagittal', wave: 'Frontal', handshake: 'Sagittal', chew: 'Transverse', talk: 'Multiple' };
const SOURCE_BADGE = {
  cmu: 'CMU motion capture (retargeted)',
  authored: 'Authored teaching track — not motion capture'
};

function peakRoles(action) {
  const roles = {};
  for (let i = 0; i <= 48; i++) {
    const levels = action.activations(i / 48);
    for (const [key, level] of Object.entries(levels)) roles[key] = Math.max(roles[key] || 0, level);
  }
  for (const key of Object.keys(roles)) roles[key] = roles[key] >= 0.7 ? 'PM' : roles[key] >= 0.38 ? 'SY' : 'ST';
  return roles;
}

export default function KinesiologyTheater({ activeView, reducedMotion, playing, setPlaying, speed, setSpeed, apiRef }) {
  const mountRef = useRef(null);
  const meterRefs = useRef({});
  const [actionId, setActionId] = useState('walk');
  const [cameraId, setCameraId] = useState('anterior');
  const [showMuscles, setShowMuscles] = useState(true);
  const [selected, setSelected] = useState(null);
  const [noWebGL, setNoWebGL] = useState(false);
  const [dualView, setDualView] = useState(false);
  const [termMode, setTermMode] = useState(() => { try { return sessionStorage.getItem('kine-term') || 'both'; } catch { return 'both'; } });
  const [gaitStats, setGaitStats] = useState(null);
  const [studyMode, setStudyMode] = useState(false);
  const [cueMode, setCueMode] = useState('anat');
  const [rehearse, setRehearse] = useState(false);
  const [voiceOver, setVoiceOver] = useState(false);
  const [sonify, setSonify] = useState(false);
  const [repMode, setRepMode] = useState('both');
  const [patternId, setPatternId] = useState(null);
  const [annotate, setAnnotate] = useState(false);
  const [selfCompare, setSelfCompare] = useState(false);
  const [trails, setTrails] = useState(true);
  const [quality, setQuality] = useState(() => (typeof localStorage !== 'undefined' && localStorage.getItem('kine-quality')) || 'auto');
  const [markersOn, setMarkersOn] = useState(false);
  const [heatMode, setHeatMode] = useState(false);
  const [camError, setCamError] = useState(null);
  const [logOn, setLogOn] = useState(false);
  const [hintIdx, setHintIdx] = useState(0);
  const videoRef = useRef(null);
  const selfKneeRef = useRef(null);
  const xrRef = useRef(false);
  const [xrAvailable, setXrAvailable] = useState(false);
  const [dualMode, setDualMode] = useState('rear');
  const strokesRef = useRef([]);
  const overlayRef = useRef(null);
  const ribbonHeadRef = useRef(null);
  const [tour, setTour] = useState(() => { try { return !sessionStorage.getItem('kine-tour'); } catch { return true; } });
  const comRef = useRef({ trail: [], ys: [], vert: null });
  const comLineRef = useRef(null);
  const ghostRigRef = useRef(null);
  const blobRef = useRef(null);
  const trailRef = useRef(null);
  const emaRef = useRef(0.016);
  const slowFramesRef = useRef(0);
  const qualityRef = useRef(quality);
  const audioRef = useRef(null);
  const [studyPause, setStudyPause] = useState(null);
  const lastTnRef = useRef(0);
  const [drill, setDrill] = useState(null);
  const drillRef = useRef(null);
  drillRef.current = drill;
  const drillQueueRef = useRef([]);
  const answerDrillRef = useRef((k) => {});
  const drillStatsRef = useRef({ correct: 0, wrong: 0 });

  const HINTS = {
    walk: ['What pushes the world behind you just before the foot leaves?', 'Where does the body brake first after the heel lands?', 'Which side is holding the pelvis level right now?'],
    run: ['Where does the spring load on landing?', 'What drives you forward — reaching or pushing?'],
    jump: ['What banks the energy before take-off?', 'Which muscles act as brakes on landing?'],
    wave: ['Which muscle lifts the arm and keeps it there?', 'What alternates to shake the hand?'],
    handshake: ['Where does the pump really come from — wrist or elbow?', 'What sustains the grip?'],
    chew: ['Which muscles close the jaw against resistance?', 'What keeps the head steady while chewing?'],
    'tiptoe-walk': ['Which muscles never get a rest here?', 'What would happen to the heels without them?', 'Why is balance harder on tiptoe?'],
    'heel-walk': ['Which muscle refuses to let the toes drop?', 'Who pulls you forward without push-off?', 'What does this drill spare?'],
    bow: ['Where should the fold come from?', 'Which muscles lengthen under load?', 'What stacks the spine back up?'],
    shrug: ['Which muscle lifts the shoulder blade?', 'Who controls the melt-down?', 'Where should the neck stay?'],
    'reach-up': ['Which muscles lift the arm overhead?', 'What rotates the shoulder blade?', 'Who controls the descent?'],
    clap: ['Where does the clap rhythm live?', 'Which muscles hold the elbow fold?', 'What stays relaxed?'],
    'head-signals': ['Which joint makes the yes?', 'Which movement makes the no?', 'What should stay quiet?'],
    kick: ['Which muscle snaps the lower leg out?', 'What stops you falling forward as the leg swings?', 'Where does the leg land on the return?'],
    sidestep: ['Which muscles push you sideways?', 'What keeps the hips level while stepping?', 'Who controls the follow-through?'],
    'one-leg': ['Which muscle is the hero of the standing hip?', 'What would a tired hero let drop?', 'Where do the small balance corrections come from?'],
    squat: ['Where should the weight sit as you descend?', 'What keeps the chest from collapsing forward?', 'Which muscles brake the bottom of the movement?'],
    'sit-stand': ['What moves first - the hips or the head?', 'Where does the nose travel as you rise?', 'What brakes the sit-down?'],
    lunge: ['Which leg is doing the work on the way back?', 'What keeps the pelvis level mid-lunge?', 'Where should the back knee travel?'],
    talk: ['What holds the trunk upright through a long sentence?', 'Where does the breath pressure come from?']
  };
  const drillName = (k) => (factFor(k)?.name || k) + sideLabel(k);
  const learnLog = (entry) => { if (!stateRef.current.logOn) return; try { const log = JSON.parse(localStorage.getItem('kine-log') || '[]'); log.push({ ...entry, at: Date.now() }); localStorage.setItem('kine-log', JSON.stringify(log.slice(-200))); } catch {} };
  const persistDrill = () => { try { sessionStorage.setItem('kine-drill-stats', JSON.stringify(drillStatsRef.current)); } catch {} };
  const nextDrill = () => {
    const q = drillQueueRef.current;
    if (!q.length) { setDrill({ done: true, stats: { ...drillStatsRef.current } }); return; }
    const correct = q[0];
    if (Math.random() < 0.5) {
      setDrill({ mode: 'click', prompt: `Click the muscle: ${drillName(correct)}`, correct, feedback: null });
    } else {
      const others = Object.keys(roles).filter((k) => k !== correct).sort(() => Math.random() - 0.5).slice(0, 2);
      const options = [correct, ...others].sort(() => Math.random() - 0.5);
      setDrill({ mode: 'choice', prompt: `Which of these is the prime mover for “${action.id}” right now?`, options, correct, feedback: null });
    }
  };
  const answerDrill = (key) => {
    const d = drillRef.current;
    if (!d || d.feedback || d.done) return;
    const ok = key === d.correct;
    drillStatsRef.current[ok ? 'correct' : 'wrong'] += 1;
    persistDrill();
    learnLog({ kind: 'drill', ok, first: ok });
    if (ok) drillQueueRef.current.shift(); else drillQueueRef.current.push(d.correct);
    setDrill({ ...d, feedback: ok ? 'Correct.' : `Not quite — ${drillName(d.correct)}.` });
    setTimeout(nextDrill, 1100);
  };
  answerDrillRef.current = answerDrill;
  const startDrill = () => {
    drillQueueRef.current = Object.entries(roles).filter(([, r]) => r === 'PM').map(([k]) => k).sort(() => Math.random() - 0.5);
    try { const saved = JSON.parse(sessionStorage.getItem('kine-drill-stats') || 'null'); if (saved) drillStatsRef.current = saved; } catch {}
    nextDrill();
  };
  const exportAnki = () => {
    const rows = muscleList.map((k) => { const f = factFor(k); return `${f.name}${sideLabel(k)} (${f.latin})\tOrigin: ${f.origin} | Insertion: ${f.insertion} | Action: ${f.action} | Plane: ${f.plane}`; });
    const blob = new Blob([rows.join('\n')], { type: 'text/tab-separated-values' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'hbl-kinesiology-muscle-facts.tsv';
    a.click();
    URL.revokeObjectURL(a.href);
  };
  const [angleData, setAngleData] = useState(null);
  const angleOffsetsRef = useRef({});
  const angleMarkerRefs = useRef({});
  const angleValRefs = useRef({});
  const [caption, setCaption] = useState('');
  const [phaseName, setPhaseName] = useState('');
  const action = ACTION_BY_ID[actionId];
  const roles = useMemo(() => ({ ...peakRoles(action), ...(action.roles || {}) }), [action]);
  const rolesRef = useRef(roles);
  rolesRef.current = roles;
  const playRef = useRef(playing && !reducedMotion);
  playRef.current = playing && !reducedMotion;
  const speedRef = useRef(speed);
  speedRef.current = speed;
  const viewRef = useRef(activeView);
  viewRef.current = activeView;

  const stateRef = useRef({ actionId: 'walk', cameraId: 'anterior', showMuscles: true, time: 0 });
  // Late-bound rig access for the blend snapshot (rig lives inside the mount effect).
  const rigRef = useRef(null);
  const rigPoseSource = () => (rigRef.current ? rigRef.current.bones : {});
  stateRef.current.actionId = actionId;
  stateRef.current.cameraId = cameraId;
  stateRef.current.showMuscles = showMuscles;
  stateRef.current.dualView = dualView;
  stateRef.current.termMode = termMode;
  stateRef.current.studyMode = studyMode;
  stateRef.current.cueMode = cueMode;
  stateRef.current.rehearse = rehearse;
  stateRef.current.sonify = sonify;
  stateRef.current.patternId = patternId;
  stateRef.current.annotate = annotate;
  stateRef.current.dualMode = dualMode;
  stateRef.current.logOn = logOn;
  stateRef.current.trails = trails;
  stateRef.current.markersOn = markersOn;
  stateRef.current.heatMode = heatMode;
  qualityRef.current = quality;

  useEffect(() => {
    if (apiRef) apiRef.current = {
      reset: () => { stateRef.current.time = 0; },
      step: (dt) => { stateRef.current.time += dt; },
      setTime: (t) => { stateRef.current.time = t; }
    };
  }, [apiRef]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;
    const profile = getDeviceProfile();
    // Phase 96/101: user quality override ('cinema' forces full-fidelity stage).
    // Phase 101 (V6): explicit quality tier with device-aware auto.
    const low = quality === 'cinema' ? false : (quality === 'fast' ? true : (profile.lowPower || profile.formFactor === 'tv'));
    let renderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: !low, powerPreference: 'default' }); }
    catch { setNoWebGL(true); return undefined; }
    if (!renderer.getContext()) { setNoWebGL(true); return undefined; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, low ? 1 : 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping; // Phase 96 (V1): filmic grade
    renderer.toneMappingExposure = 1.12;
    renderer.shadowMap.enabled = !low; // Phase 96 (V1): contact grounding, desktop tier only
    if (!low) renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a1220);
    scene.fog = new THREE.Fog(0x0a1220, 6, 13); // Phase 96 (V1): depth cueing
    const camera = new THREE.PerspectiveCamera(46, mount.clientWidth / mount.clientHeight, 0.05, 60);
    const dualCam = new THREE.PerspectiveCamera(50, 1, 0.05, 60);
    // Phase 104 (W5): transverse-plane orthographic top camera for foot placement.
    const topCam = new THREE.OrthographicCamera(-1.5, 1.5, 1.5, -1.5, 0.1, 12);
    topCam.position.set(0, 7, 0);
    topCam.lookAt(0, 0, 0);
    let lastDualMode = null;
    camera.position.set(0, 1.45, 3.4);
    // Phase 96 (V1): 3-point stagecraft — warm key, cool fill, cyan rim.
    scene.add(new THREE.HemisphereLight(0xbfd8ff, 0x141b28, 0.7));
    const key = new THREE.DirectionalLight(0xfff1dd, 1.9);
    key.position.set(2.5, 4, 2.5);
    if (!low) {
      key.castShadow = true;
      key.shadow.mapSize.set(1024, 1024);
      key.shadow.camera.left = -1.6; key.shadow.camera.right = 1.6;
      key.shadow.camera.top = 2.6; key.shadow.camera.bottom = -0.4;
      key.shadow.camera.near = 0.5; key.shadow.camera.far = 9;
      key.shadow.bias = -0.0015;
    }
    scene.add(key);
    const fill = new THREE.DirectionalLight(0x7fb2ff, 0.5);
    fill.position.set(-3, 1.6, 1.8);
    scene.add(fill);
    const rim = new THREE.DirectionalLight(0xbfe6ff, 0.85);
    rim.position.set(-1.5, 3.2, -3);
    scene.add(rim);
    const glowTex = new THREE.CanvasTexture((() => { const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d'); const grd = g.createRadialGradient(128, 128, 10, 128, 128, 128); grd.addColorStop(0, 'rgba(120,190,220,0.5)'); grd.addColorStop(1, 'rgba(120,190,220,0)'); g.fillStyle = grd; g.fillRect(0, 0, 256, 256); return c; })());
    // Phase 106 (W2/W1): cinema-tier spotlight pool + subtle environment sheen.
    if (!low) {
      const spot = new THREE.SpotLight(0xfff3e0, 26, 14, Math.PI / 5.2, 0.55, 1.6);
      spot.position.set(0.8, 4.6, 1.6);
      spot.target.position.set(0, 1, 0);
      scene.add(spot, spot.target);
      const pmrem = new THREE.PMREMGenerator(renderer);
      scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      if ('environmentIntensity' in scene) scene.environmentIntensity = 0.22;
      pmrem.dispose();
    }
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, transparent: true, opacity: 0.5, depthWrite: false }));
    glow.scale.set(5.5, 4.5, 1);
    glow.position.set(0, 1.2, -1.4);
    scene.add(glow);
    // Phase 97 (V2): radial stage rings (no square horizon seam) + soft ground plane.
    const polar = new THREE.PolarGridHelper(4.2, 16, 8, 64, 0x27405c, 0x16283c);
    polar.userData.kind = 'polar-stage';
    polar.material.transparent = true;
    polar.material.opacity = 0.55;
    polar.position.y = 0.001;
    scene.add(polar);
    const blobTex = new THREE.CanvasTexture((() => { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'); const grd = g.createRadialGradient(64, 64, 4, 64, 64, 64); grd.addColorStop(0, 'rgba(0,0,0,0.55)'); grd.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = grd; g.fillRect(0, 0, 128, 128); return c; })());
    const blob = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.1).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false }));
    blob.position.y = 0.004;
    blob.renderOrder = 1;
    scene.add(blob);
    blobRef.current = blob;
    // Phase 98 (V3): endpoint motion trails — foot + hand paths for locomotor actions.
    const trailLines = [['leftFoot', 0x4dd8df], ['rightFoot', 0xffb347], ['leftHand', 0x9fb6cc]].map(([bone, color]) => {
      const line = new THREE.Line(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.6 }));
      line.frustumCulled = false;
      line.visible = false;
      scene.add(line);
      return { bone, line, pts: [] };
    });
    trailRef.current = trailLines;
    const comLine = new THREE.Line(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: 0xffe0b3, transparent: true, opacity: 0.7 }));
    comLine.frustumCulled = false;
    scene.add(comLine);
    comLineRef.current = comLine;
    const floorFade = new THREE.CanvasTexture((() => { const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d'); const grd = g.createRadialGradient(128, 128, 30, 128, 128, 128); grd.addColorStop(0, '#ffffff'); grd.addColorStop(1, '#000000'); g.fillStyle = grd; g.fillRect(0, 0, 256, 256); return c; })());
    const floor = new THREE.Mesh(new THREE.CircleGeometry(4, 40).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0x0d1727, roughness: 0.95, transparent: true, alphaMap: floorFade }));
    floor.position.y = -0.002;
    floor.receiveShadow = true;
    scene.add(floor);

    const rig = buildPerformanceRig(THREE, { lowPoly: low });
    if (!low) rig.root.traverse((o) => { if (o.isMesh) o.castShadow = true; });
    rigRef.current = rig;
    scene.add(rig.root);
    const ghost = buildPerformanceRig(THREE, { lowPoly: true });
    // Phase 100 (V5): ghost blends without depth-sort artifacts.
    Object.values(ghost.muscles).forEach(({ mat }) => { mat.transparent = true; mat.opacity = 0.18; mat.depthWrite = false; });
    Object.values(ghost.bones).forEach((b) => b.traverse?.((o) => { if (o.material) { o.material = o.material.clone(); o.material.transparent = true; o.material.opacity = 0.35; o.material.depthWrite = false; o.material.color.set(0x9fb6cc); } }));
    ghost.root.renderOrder = 2;
    ghost.root.traverse((o) => { o.renderOrder = 2; });
    ghost.setMusclesVisible(false);
    ghost.root.visible = false;
    scene.add(ghost.root);
    ghostRigRef.current = ghost;
    const parsed = Object.fromEntries(Object.entries(CLIPS).map(([name, text]) => {
      const bvh = parseBVH(text);
      const cal = finalizeGround(THREE, rig, bvh, computeCalibration(THREE, bvh));
      return [name, { bvh, cal, stance: { left: computeStanceData(THREE, rig, bvh, cal, 'left'), right: computeStanceData(THREE, rig, bvh, cal, 'right') } }];
    }));
    // Phase 81 (B3): spatiotemporal honesty stats measured from the captured walk.
    {
      const wk = parsed.walk_cmu;
      let travel = 0, prev = null;
      for (let f = 0; f < wk.bvh.frames; f += 2) {
        applyBVHFrame(THREE, rig, wk.bvh, f, wk.cal, { treadmill: false });
        const p = rig.bones.root.position;
        if (prev) travel += Math.hypot(p.x - prev.x, p.z - prev.z);
        prev = { x: p.x, z: p.z };
      }
      const seconds = wk.bvh.frames * wk.bvh.frameTime;
      const windows = [...wk.stance.left.windows.map((w) => w), ...wk.stance.right.windows].sort((a, b) => a.start - b.start);
      const cadence = Math.round((windows.length / seconds) * 60);
      stateRef.current.contacts = windows.map((w) => w.start);
      // Step length from raw root travel per detected step (treadmill-neutral).
      const stepLen = windows.length > 0 ? travel / windows.length : 0;
      const lw = wk.stance.left.windows, rw = wk.stance.right.windows;
      const dl = lw.length ? lw.reduce((a, w) => a + (w.end - w.start), 0) / lw.length : 0;
      const dr = rw.length ? rw.reduce((a, w) => a + (w.end - w.start), 0) / rw.length : 0;
      const asym = dl && dr ? Math.round((Math.abs(dl - dr) / ((dl + dr) / 2)) * 100) : null;
      setGaitStats({ speed: +(travel / seconds).toFixed(2), cadence, step: +stepLen.toFixed(2), asym });
      applyBVHFrame(THREE, rig, wk.bvh, 0, wk.cal);
    }

    // Phase 82: precompute sagittal angle curves + standing calibration per clip.
    {
      const data = {};
      for (const key of ['walk_cmu', 'jump_cmu']) {
        const c = parsed[key];
        const apply = (f) => applyBVHFrame(THREE, rig, c.bvh, f, c.cal);
        const offset = calibrateAngles(THREE, rig, apply, [0]);
        angleOffsetsRef.current[key] = offset;
        const N = 60;
        const hip = [], knee = [], ankle = [];
        for (let i = 0; i < N; i++) {
          const a = sampleSagittalAngles(THREE, rig, apply, Math.round((i / (N - 1)) * (c.bvh.frames - 1)), c.cal, offset);
          hip.push(a.hip); knee.push(a.knee); ankle.push(a.ankle);
        }
        data[key] = { hip, knee, ankle };
      }
      setAngleData(data);
      stateRef.current.clipsMeta = Object.fromEntries(Object.entries(parsed).map(([k, v]) => [k, { frames: v.bvh.frames, frameTime: v.bvh.frameTime }]));
    }

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 1.02, 0);
    controls.enableDamping = true;
    controls.enabled = false;

    let raf = 0;
    let last = performance.now();
    let lastCaption = '';
    let lastName = '';
    let actFrame = 0;
    const tick = (now) => {
      raf = requestAnimationFrame(tick);
      if (stateRef.current.contextLost) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      // Phase 101 (V6): FPS auto-guard — sustained slowness on auto drops to fast tier.
      if (qualityRef.current === 'auto') {
        emaRef.current = emaRef.current * 0.95 + ((now - last) / 1000) * 0.05;
        slowFramesRef.current = emaRef.current > 0.03 ? slowFramesRef.current + 1 : 0;
        if (slowFramesRef.current > 90) {
          slowFramesRef.current = -Infinity;
          try { localStorage.setItem('kine-quality', 'fast'); sessionStorage.setItem('kine-quality-note', '1'); } catch {}
          setQuality('fast');
        }
      }
      last = now;
      const st = stateRef.current;
      const act = ACTION_BY_ID[st.actionId];
      if (playRef.current) st.time += dt * (st.rehearse ? 1 : speedRef.current); // Phase 89 (D1): PETTLEP Timing — rehearsal at real speed
      const t = act.loop ? st.time % act.duration : Math.min(st.time, act.duration);
      const tn = t / act.duration;

      // Phase 86 (D4): segmenting — auto-pause at phase boundaries in study mode.
      if (st.studyMode && playRef.current && tn >= lastTnRef.current) {
        for (const ph of act.phases.slice(0, -1)) {
          if (lastTnRef.current < ph.until && tn >= ph.until) {
            setPlaying(false);
            const lv = act.activations(Math.min(1, ph.until + 0.02));
            const top = Object.entries(lv).sort((a, b) => b[1] - a[1])[0]?.[0];
            const fo = Object.keys(roles).filter((k) => k !== top).sort(() => Math.random() - 0.5).slice(0, 2);
            setStudyPause({ pct: Math.round(ph.until * 100), label: ph.rla || ph.name, predict: top ? [top, ...fo].sort(() => Math.random() - 0.5) : null, predictCorrect: top, predictFeedback: null });
            break;
          }
        }
      }
      lastTnRef.current = tn;

      Object.values(rig.bones).forEach((b) => b.rotation.set(0, 0, 0));
      if (act.source === 'cmu') {
        const clip = parsed[act.clip.replace('.bvh', '')];
        const frame = Math.min(clip.bvh.frames - 1, Math.floor(tn * clip.bvh.frames));
        applyBVHFrame(THREE, rig, clip.bvh, frame, clip.cal);
        rig.root.updateMatrixWorld(true);
        applyFootPlant(THREE, rig, frame, clip.stance.left, 'left');
        applyFootPlant(THREE, rig, frame, clip.stance.right, 'right');
      } else {
        applyAuthoredPose(rig, AUTHORED_ACTIONS[st.actionId].pose(t));
      }

      // Phase 92 (C6/D7): translucent clinical-pattern ghost beside the figure.
      const pattern = CLINICAL_PATTERNS.find((c) => c.id === st.patternId);
      const abOffset = !pattern && st.dualView && st.dualMode === 'offset';
      if (ghostRigRef.current) {
        ghostRigRef.current.root.visible = Boolean(pattern) || abOffset;
        ghostRigRef.current.root.position.x = pattern ? 0.85 : 0;
        if (pattern) {
          Object.values(ghostRigRef.current.bones).forEach((b) => b.rotation.set(0, 0, 0));
          applyAuthoredPose(ghostRigRef.current, pattern.pose(t));
        } else if (abOffset) {
          const t2 = (t + act.duration / 2) % act.duration;
          Object.values(ghostRigRef.current.bones).forEach((b) => b.rotation.set(0, 0, 0));
          if (act.source === 'cmu') {
            const clip = parsed[act.clip.replace('.bvh', '')];
            applyBVHFrame(THREE, ghostRigRef.current, clip.bvh, Math.min(clip.bvh.frames - 1, Math.floor((t2 / act.duration) * clip.bvh.frames)), clip.cal);
          } else {
            applyAuthoredPose(ghostRigRef.current, AUTHORED_ACTIONS[st.actionId].pose(t2));
          }
        }
      }

      // Phase 90 (C9): segment-weighted CoM trail + vertical displacement honesty.
      {
        const W = { head: 0.08, root: 0.3, spine: 0.1, chest: 0.1, leftUpLeg: 0.1, rightUpLeg: 0.1, leftLeg: 0.045, rightLeg: 0.045, leftFoot: 0.015, rightFoot: 0.015, leftUpperArm: 0.03, rightUpperArm: 0.03, leftForeArm: 0.02, rightForeArm: 0.02, leftHand: 0.01, rightHand: 0.01 };
        const com = new THREE.Vector3();
        let tw = 0;
        for (const [b, w] of Object.entries(W)) { const bone = rig.bones[b]; if (!bone) continue; const v = new THREE.Vector3(); bone.getWorldPosition(v); com.addScaledVector(v, w); tw += w; }
        com.multiplyScalar(1 / tw);
        const c = comRef.current;
        c.trail.push(com.clone());
        if (c.trail.length > 160) c.trail.shift();
        c.ys.push(com.y);
        if (c.ys.length > 160) c.ys.shift();
        if (c.ys.length > 60) c.vert = Math.round((Math.max(...c.ys) - Math.min(...c.ys)) * 100);
        if (comLineRef.current) {
          comLineRef.current.geometry.setFromPoints(c.trail);
          comLineRef.current.geometry.attributes.position.needsUpdate = true;
        }
        if (audioRef.current) {
          const kneeVal = angleValRefs.current.knee ? parseFloat(angleValRefs.current.knee.textContent) : 20;
          audioRef.current.osc.frequency.setTargetAtTime(180 + ((Math.min(80, Math.max(-30, kneeVal)) + 30) / 110) * 480, audioRef.current.ctx.currentTime, 0.05);
          if (audioRef.current.pan) audioRef.current.pan.pan.setTargetAtTime(tn * 2 - 1, audioRef.current.ctx.currentTime, 0.05);
        }
      }

      // Phase 82: live sagittal angle readout for CMU clips.
      if (act.source === 'cmu') {
        const key = act.clip.replace('.bvh', '');
        const offset = angleOffsetsRef.current[key];
        if (offset) {
          const a = sampleSagittalAngles(THREE, rig, () => {}, 0, null, offset);
          for (const j of ['hip', 'knee', 'ankle']) {
            const el = angleValRefs.current[j];
            if (el) el.textContent = `${Math.round(a[j])}°`;
            const mk = angleMarkerRefs.current[j];
            if (mk) {
              mk.setAttribute('cx', `${(tn * 150).toFixed(1)}`);
              mk.setAttribute('cy', `${(44 - ((Math.min(80, Math.max(-30, a[j])) + 30) / 110) * 44).toFixed(1)}`);
            }
          }
        }
      }

      // Phase 102 (W4): joint markers follow toggle.
      if (rig.setMarkersVisible) rig.setMarkersVisible(Boolean(st.markersOn));
      // Phase 103 (W3): heat colour mode.
      if (rig.setHeatMode) rig.setHeatMode(Boolean(st.heatMode));

      const levels = act.activations(tn);
      // Phase 78: on low-power tiers the emissive glow updates at half rate.
      if (!low || (actFrame++ % 2 === 0)) {
        rig.setMusclesVisible(st.showMuscles);
        rig.resetMuscles();
        if (st.showMuscles) for (const [muscle, level] of Object.entries(levels)) rig.setMuscleActivation(muscle, level, rolesRef.current[muscle] || 'ST');
      }
      for (const [muscle, el] of Object.entries(meterRefs.current)) if (el) el.style.width = `${Math.round((levels[muscle] || 0) * 100)}%`;

      const phase = act.phases.find((p) => tn <= p.until) || act.phases[act.phases.length - 1];
      const dispName = phase.rla ? (st.termMode === 'rla' ? phase.rla : st.termMode === 'trad' ? phase.trad : `${phase.rla} (${phase.trad})`) : phase.name;
      const dispCaption = st.cueMode === 'ext' ? (phase.ext || (COACH_CUES[st.actionId] || [])[0] || phase.caption) : phase.caption;
      if (dispCaption !== lastCaption || dispName !== lastName) { lastCaption = dispCaption; lastName = dispName; setCaption(dispCaption); setPhaseName(dispName); }

      const blend = blendRef.current;
      if (blend) {
        const w = Math.min(1, (now - blend.start) / 400);
        const e = w * w * (3 - 2 * w);
        for (const [name, bone] of Object.entries(rig.bones)) {
          const old = blend.snapshot.get(name);
          if (old) {
            const target = bone.quaternion.clone();
            bone.quaternion.copy(old.q).slerp(target, e);
          }
        }
        const oldRoot = blend.snapshot.get('root');
        if (oldRoot) {
          const newRoot = rig.bones.root.position.clone();
          rig.bones.root.position.copy(oldRoot.p).lerp(newRoot, e);
        }
        if (w >= 1) blendRef.current = null;
      }

      const cam = cameraStateFor(st.cameraId, st.time, reducedMotion, st.actionId);
      // Phase 117 (R8): on square/portrait canvases (phones) the tuned desktop
      // camera distances leave the figure small; scale horizontal distance with
      // canvas aspect so the performer fills the frame on small screens.
      {
        const asp = mount.clientWidth / Math.max(1, mount.clientHeight);
        const f = Math.max(0.7, Math.min(1, asp / 1.5));
        if (f < 1 && cam.pos) cam.pos = [cam.pos[0] * f, cam.pos[1], cam.pos[2] * f];
      }
      controls.enabled = Boolean(cam.controls) && viewRef.current !== 'quiz';
      if (controls.enabled) controls.update();
      else applyCamera(THREE, camera, rig, cam, act.focus);
      // Phase 107 (W8): paused breathing micro-motion (stillness reads alive; reduced-motion ⇒ static).
      const pausedNow = !playRef.current && !reducedMotion;
      const br = pausedNow ? Math.sin(now / 650) : 0;
      if (rig.bones.chest) rig.bones.chest.scale.setScalar(1 + br * 0.012);
      if (rig.bones.spine) rig.bones.spine.rotation.x += br * 0.006;

      // Phase 98 (V3): roll endpoint trails for locomotor actions.
      const fast = st.actionId === 'run' || st.actionId === 'jump' || st.actionId === 'walk';
      if (trailRef.current) {
        for (const tl of trailRef.current) {
          if (tl.lastAction !== st.actionId) { tl.pts = []; tl.lastAction = st.actionId; }
          const show = st.trails && fast && playRef.current;
          tl.line.visible = show;
          if (show) {
            const b = rigRef.current.bones[tl.bone];
            const wp = new THREE.Vector3();
            b.getWorldPosition(wp);
            tl.frame = (tl.frame || 0) + 1;
            const last = tl.pts[tl.pts.length - 1];
            if (tl.frame % 3 === 0 && (!last || last.distanceToSquared(wp) > 1e-6)) tl.pts.push(wp);
            if (tl.pts.length > 110) tl.pts.shift();
            tl.line.geometry.setFromPoints(tl.pts);
          }
        }
      }

      // Phase 97 (V2): soft contact shadow follows the figure's root.
      if (blobRef.current && rigRef.current) {
        const rp = rigRef.current.root.position;
        blobRef.current.position.x = rp.x;
        blobRef.current.position.z = rp.z;
        const lift = Math.max(0, rp.y);
        blobRef.current.material.opacity = Math.max(0.12, 0.5 - lift * 0.5);
        const sc = 1 + lift * 1.6;
        blobRef.current.scale.set(sc, sc, sc);
      }

      renderer.render(scene, camera);

      // Phase 105 (W6): ribbon playhead follows normalized time.
      if (ribbonHeadRef.current) ribbonHeadRef.current.style.left = `${Math.min(100, tn * 100)}%`;

      // Phase 93 (D9): time-synced annotation overlay.
      const ov = overlayRef.current;
      if (ov) {
        const ctx = ov.getContext('2d');
        ctx.clearRect(0, 0, ov.width, ov.height);
        for (const s2 of strokesRef.current) {
          if (Math.abs(st.time - s2.t) > 0.7) continue;
          ctx.strokeStyle = '#ffe0b3';
          ctx.lineWidth = 2.5;
          ctx.lineCap = 'round';
          ctx.beginPath();
          s2.pts.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x * ov.width, y * ov.height) : ctx.lineTo(x * ov.width, y * ov.height)));
          ctx.stroke();
        }
      }

      // Phase 79/104: desktop-only dual-angle inset (posterior or transverse top).
      if (st.dualView && mount.clientWidth >= 900) {
        lastDualMode = st.dualMode;
        const w = mount.clientWidth;
        const h = mount.clientHeight;
        const sw = Math.floor(w * 0.32);
        const sh = Math.floor(h * 0.4);
        const ox = w - sw - 12;
        const oy = 12; // bottom-right corner (WebGL viewport origin = bottom-left)
        renderer.setScissorTest(true);
        renderer.setViewport(ox, oy, sw, sh);
        renderer.setScissor(ox, oy, sw, sh);
        if (st.dualMode === 'top') {
          topCam.left = -sw / sh * 1.2; topCam.right = sw / sh * 1.2;
          topCam.updateProjectionMatrix();
          topCam.position.set(rig.root.position.x, 7, rig.root.position.z);
          topCam.lookAt(rig.root.position.x, 0, rig.root.position.z);
          renderer.autoClear = false;
          renderer.render(scene, topCam);
        } else {
          dualCam.aspect = sw / sh;
          dualCam.updateProjectionMatrix();
          dualCam.position.set(0, 1.45, -4.2);
          dualCam.lookAt(0, cam.target ? cam.target.y : 1, 0);
          renderer.autoClear = false;
          renderer.render(scene, dualCam);
        }
        renderer.autoClear = true;
        renderer.setScissorTest(false);
        renderer.setViewport(0, 0, w, h);
      }
    };
    raf = requestAnimationFrame(tick);
    renderer.xr.enabled = true; // Phase 94 (E6): optional immersive supplement
    xrRef.current = renderer;
    if (navigator.xr?.isSessionSupported) navigator.xr.isSessionSupported('immersive-vr').then((ok) => setXrAvailable(Boolean(ok))).catch(() => {});
    if (import.meta.env.DEV) window.__kineDebug = { scene, camera, renderer, rig, THREE, ghost, strokes: strokesRef.current, trails: trailRef.current, markersVisible: () => rigRef.current?.markerGroup?.visible, outlineCount: () => Object.values(rigRef.current?.outlines || {}).filter((o) => o.visible).length, lastDualMode: () => lastDualMode, timeNow: () => stateRef.current.time };

    const raycaster = new THREE.Raycaster();
    const onPick = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      raycaster.setFromCamera(new THREE.Vector2(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1), camera);
      const hits = raycaster.intersectObjects(Object.values(rig.muscles).map((m) => m.mesh), false);
      const picked = hits.length ? hits[0].object.userData.muscleId : null;
      if (drillRef.current?.mode === 'click' && !drillRef.current.feedback) { answerDrillRef.current(picked); return; }
      setSelected(picked);
    };
    renderer.domElement.addEventListener('pointerdown', onPick);

    const onCtxLost = (event) => { event.preventDefault(); stateRef.current.contextLost = true; };
    const onCtxRestored = () => { stateRef.current.contextLost = false; last = performance.now(); };
    renderer.domElement.addEventListener('webglcontextlost', onCtxLost);
    renderer.domElement.addEventListener('webglcontextrestored', onCtxRestored);

    const onResize = () => {
      renderer.setSize(mount.clientWidth, mount.clientHeight);
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      renderer.domElement.removeEventListener('pointerdown', onPick);
      renderer.domElement.removeEventListener('webglcontextlost', onCtxLost);
      renderer.domElement.removeEventListener('webglcontextrestored', onCtxRestored);
      controls.dispose();
      ghostRigRef.current?.dispose?.();
      rig.dispose();
      renderer.dispose();
      if (renderer.domElement.parentElement === mount) mount.removeChild(renderer.domElement);
    };
  }, [reducedMotion, quality]);

  // Phase 77: selection isolates one muscle (solo teaching mode).
  useEffect(() => {
    const rig = rigRef.current;
    if (!rig) return;
    Object.values(rig.muscles).forEach(({ mesh, mat }) => {
      const dim = Boolean(selected) && mesh.userData.muscleId !== selected;
      if (mat.transparent !== dim) mat.needsUpdate = true;
      mat.transparent = dim;
      mat.opacity = dim ? 0.12 : 1;
    });
  }, [selected]);

  // Phase 83 (B4): origin/insertion pins on the selected muscle.
  useEffect(() => {
    const rig = rigRef.current;
    if (!rig) return;
    (rig.pins || []).forEach((p) => { p.parent?.remove(p); p.geometry.dispose(); p.material.dispose(); });
    rig.pins = [];
    const entry = selected && rig.muscles[selected];
    if (entry) {
      const mirror = selected.endsWith('.R') ? -1 : 1;
      for (const pt of [entry.def.from, entry.def.to]) {
        const pin = new THREE.Mesh(new THREE.SphereGeometry(0.02, 12, 12), new THREE.MeshBasicMaterial({ color: 0x4dd8df }));
        pin.position.set(pt[0] * mirror, pt[1], pt[2]);
        pin.userData.pin = true;
        entry.mesh.parent.add(pin);
        rig.pins.push(pin);
      }
    }
  }, [selected]);

  // Phase 83 (B5): activation sparkline for the facts card.
  const spark = useMemo(() => {
    if (!selected) return null;
    const act = ACTION_BY_ID[actionId];
    const N = 60;
    const vals = [];
    for (let i = 0; i < N; i++) {
      const levels = act.activations(i / (N - 1));
      vals.push(levels[selected] || 0);
    }
    return vals;
  }, [selected, actionId]);

  // Phase 102 (W7): outline the selected muscle for readability.
  useEffect(() => { rigRef.current?.setMuscleOutline?.(selected, Boolean(selected)); }, [selected, actionId]);

  // Phase 75 (A8/D7): 0.4 s pose crossfade on action switches.
  const blendRef = useRef(null);
  useEffect(() => {
    stateRef.current.time = 0;
    const snapshot = new Map();
    Object.entries(rigPoseSource()).forEach(([name, bone]) => snapshot.set(name, { q: bone.quaternion.clone(), p: bone.position.clone() }));
    blendRef.current = { snapshot, start: performance.now() };
  }, [actionId]);

  useEffect(() => {
    if (voiceOver && 'speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance(`${phaseName}. ${caption}`);
      u.rate = 1.02;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
    }
  }, [caption, phaseName, voiceOver]);

  // Phase 94 (C11): on-device webcam knee-angle self-compare (E5-governed).
  useEffect(() => {
    let raf = 0, stream = null, lm = null, dead = false;
    const start = async () => {
      try {
        const vision = await import('@mediapipe/tasks-vision').then((m) => m.FilesetResolver.forVisionTasks('/mediapipe-wasm'));
        lm = await import('@mediapipe/tasks-vision').then((m) => m.PoseLandmarker.createFromOptions(vision, { baseOptions: { modelAssetPath: '/pose/pose_landmarker_lite.task' }, runningMode: 'VIDEO', numPoses: 1 }));
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (dead) { stream.getTracks().forEach((t) => t.stop()); return; }
        if (videoRef.current) videoRef.current.srcObject = stream;
        const loop = (now) => {
          raf = requestAnimationFrame(loop);
          const v = videoRef.current;
          if (!v || v.readyState < 2 || !lm) return;
          const res = lm.detectForVideo(v, performance.now());
          const L = res.landmarks?.[0];
          if (!L) return;
          const hip = L[25], knee = L[27], ank = L[31];
          const v1 = [hip.x - knee.x, hip.y - knee.y], v2 = [ank.x - knee.x, ank.y - knee.y];
          const ang = 180 - (Math.acos((v1[0] * v2[0] + v1[1] * v2[1]) / ((Math.hypot(...v1) * Math.hypot(...v2)) || 1)) * 180) / Math.PI;
          if (selfKneeRef.current) selfKneeRef.current.textContent = `${Math.round(ang)}°`;
        };
        raf = requestAnimationFrame(loop);
        setCamError(null);
      } catch (e) {
        setCamError('Camera unavailable or denied — self-compare needs a local camera and stays on-device.');
      }
    };
    if (selfCompare) start();
    return () => { dead = true; cancelAnimationFrame(raf); stream?.getTracks().forEach((t) => t.stop()); lm?.close?.(); };
  }, [selfCompare]);

  // Phase 90 (D11): sonified knee-angle graph for blind/low-vision learners.
  useEffect(() => {
    if (sonify && !audioRef.current && typeof AudioContext !== 'undefined') {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
      gain.gain.value = 0.04;
      osc.type = 'sine';
      osc.connect(gain);
      if (pan) { gain.connect(pan); pan.connect(ctx.destination); } else gain.connect(ctx.destination);
      osc.start();
      audioRef.current = { ctx, osc, pan };
    }
    if (!sonify && audioRef.current) { audioRef.current.ctx.close(); audioRef.current = null; }
    return () => { if (audioRef.current) { audioRef.current.ctx.close(); audioRef.current = null; } };
  }, [sonify]);

  useEffect(() => {
    const onKey = (event) => {
      if (event.target.matches('input, textarea, select')) return;
      const preset = CAMERA_PRESETS.find((p) => p.key === event.key);
      if (preset) setCameraId(preset.id);
      if (event.key === ' ') { event.preventDefault(); setPlaying((p) => !p); }
      if (event.key === '[') setSpeed((s) => Math.max(0.25, s - 0.25));
      if (event.key === ']') setSpeed((s) => Math.min(1, s + 0.25));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setPlaying, setSpeed]);

  const muscleList = useMemo(() => Object.keys(roles).sort(), [roles]);

  return <div className={`kinesiology-theater rep-${repMode}`} data-kinesiology-theater="true">
    {tour && <div className="kine-tour" role="dialog" aria-label="New to 3D? quick tour">
      <strong>New to 3D?</strong>
      <span>1 · Drag the figure to orbit. 2 · Keys 1–7 switch camera angles; space pauses. 3 · Coloured glow = working muscle: red prime mover, amber synergist, cyan stabilizer.</span>
      <button type="button" className="primary-cta" onClick={() => { setTour(false); try { sessionStorage.setItem('kine-tour', '1'); } catch {} }}>Got it</button>
    </div>}
    <div className="kine-disclosure" role="note">
      <Icon name="info" size={14} />
      <span>Performance teaching model — simplified for education, not the certified BodyParts3D reference. {action.source === 'cmu' ? 'Motion: CMU Graphics Lab mocap (retargeted); data from mocap.cs.cmu.edu, NSF Grant #0196217.' : 'Authored teaching track — not motion capture.'}</span>
    </div>
    <div className="kine-layout">
      {rehearse && !studyPause && <div className="kine-rehearse" role="note" aria-live="polite">
        <strong>Rehearsal (watch + imagine).</strong>
        <span>Imagine YOURSELF performing this now, in real time — feel the effort of “{phaseName}”. Observation paired with imagery strengthens the motor trace (AOMI).</span>
      </div>}
      {studyPause && <div className="kine-study-pause" role="dialog" aria-label={`Segment boundary at ${studyPause.pct} percent`}>
        <strong>{studyPause.label} · {studyPause.pct}%</strong>
        {studyPause.predict && !studyPause.predictFeedback && <span className="kine-predict">Predict first: which muscle ramps up next?
          <span className="kine-drill-options">{studyPause.predict.map((k) => <button key={k} type="button" className="kine-tool" onClick={() => { learnLog({ kind: 'predict', ok: k === studyPause.predictCorrect }); setStudyPause({ ...studyPause, predictFeedback: k === studyPause.predictCorrect ? `Yes — ${drillName(k)}.` : `Watch: it's ${drillName(studyPause.predictCorrect)}.` }); }}>{drillName(k)}</button>)}</span>
        </span>}
        {studyPause.predictFeedback && <em className={studyPause.predictFeedback.startsWith('Yes') ? 'ok' : 'no'}>{studyPause.predictFeedback}</em>}
        <span>Segment boundary — digest, then continue at your own pace.</span>
        <button type="button" className="primary-cta" onClick={() => { setStudyPause(null); setPlaying(true); }}>Continue ▶</button>
      </div>}
      {noWebGL ? <div className="kine-stage kine-svg-fallback" role="img" aria-label="Static teaching diagram: sagittal walking figure with prime movers highlighted">
        <svg viewBox="0 0 300 340" width="100%" height="100%">
          <g stroke="#7d93ab" strokeWidth="5" strokeLinecap="round" fill="none">
            <circle cx="150" cy="52" r="22" />
            <path d="M150 74 L150 170" />
            <path d="M150 95 L120 140 L128 175" />
            <path d="M150 95 L185 125 L205 150" />
            <path d="M150 170 L125 225 L120 290 L105 295" />
            <path d="M150 170 L185 220 L178 285 L200 292" />
          </g>
          <g fill="#ff5d47">
            <ellipse cx="133" cy="245" rx="12" ry="22" opacity="0.9" />
            <ellipse cx="183" cy="242" rx="12" ry="22" opacity="0.9" />
            <ellipse cx="148" cy="120" rx="15" ry="24" opacity="0.75" />
          </g>
          <g fill="#ffb347" opacity="0.8">
            <ellipse cx="118" cy="118" rx="9" ry="14" />
            <ellipse cx="190" cy="130" rx="9" ry="14" />
          </g>
          <g stroke="#27405c" strokeDasharray="4 4"><path d="M20 320 H280" /><path d="M150 10 V330" /></g>
          <text x="24" y="312" fill="#7d93ab" fontSize="10">Sagittal view · red = prime movers · amber = synergists</text>
        </svg>
        <p className="kine-no3d">3D rendering is unavailable on this device, so the theater shows a static sagittal teaching figure instead. The muscle legend and captions below still work.</p>
      </div> : <div className="kine-stage" ref={mountRef} aria-label={`3D movement theater showing ${action.id}`}>
        <canvas ref={(el) => { overlayRef.current = el; if (el) { el.width = 1050; el.height = 650; } }} className="kine-overlay" style={{ pointerEvents: annotate ? 'auto' : 'none' }} aria-label="Annotation overlay"
          onPointerDown={(e) => { const r = e.currentTarget.getBoundingClientRect(); const stroke = { t: stateRef.current.time, pts: [[(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height]] }; strokesRef.current.push(stroke); e.currentTarget.setPointerCapture(e.pointerId); }}
          onPointerMove={(e) => { if (e.buttons !== 1) return; const r = e.currentTarget.getBoundingClientRect(); const s2 = strokesRef.current[strokesRef.current.length - 1]; if (s2) s2.pts.push([(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height]); }} />
      </div>}
      <aside className="kine-side">
        <div className="kine-block">
          <span className="eyebrow">EVERYDAY ACTIONS</span>
          <div className="kine-actions" role="tablist" aria-label="Choose an action">
            {ACTIONS.map((a) => <button key={a.id} role="tab" aria-selected={a.id === actionId} className={a.id === actionId ? 'active' : ''} onClick={() => setActionId(a.id)}>{a.id}<small>{SOURCE_BADGE[a.source].split('—')[0].split('(')[0].trim()}</small></button>)}
          </div>
          <span className="kine-source-badge">{SOURCE_BADGE[action.source]} · plane: {PLANE_BY_ACTION[action.id] || 'multiple'}</span>
          <div className="kine-term" role="group" aria-label="Gait terminology">
            <span>Terminology</span>
            {[['rla', 'RLA'], ['both', 'Both'], ['trad', 'Traditional']].map(([id, label]) => <button key={id} type="button" className={termMode === id ? 'active' : ''} aria-pressed={termMode === id} onClick={() => { setTermMode(id); try { sessionStorage.setItem('kine-term', id); } catch {} }}>{label}</button>)}
          </div>
          <div className="kine-term" role="group" aria-label="Cue wording style">
            <span>Cues</span>
            {[['anat', 'Anatomical'], ['ext', 'External-focus']].map(([id, label]) => <button key={id} type="button" className={cueMode === id ? 'active' : ''} aria-pressed={cueMode === id} onClick={() => setCueMode(id)}>{label}</button>)}
          </div>
          {COACH_CUES[action.id] && <div className="kine-cues" role="note" aria-label="Coaching cues">
            <span className="eyebrow">COACHING CUES</span>
            {COACH_CUES[action.id].map((c) => <span key={c}>• {c}</span>)}
            <small>External-focus wording follows motor-learning evidence; anatomical wording available for study. Educators: action→curriculum mapping (BPT Kinesiology I/II, WCPT domains) in docs/CURRICULUM_ALIGNMENT.md; camera self-compare governed by docs/WEBCAM_PRIVACY_SPEC.md (E5).</small>
          </div>}
          {action.id === 'walk' && gaitStats && <div className="kine-honesty" role="note" aria-label="Measured gait statistics versus typical values">
            <strong>This capture:</strong> {gaitStats.speed} m/s · {gaitStats.cadence} steps/min · step ≈ {gaitStats.step} m{comRef.current.vert != null && <> · CoM vertical ≈ {comRef.current.vert} cm (typical 4–5)</>}{gaitStats.asym != null && <> · L/R step-time asymmetry ≈ {gaitStats.asym}% (healthy ≲ 5–10%)</>}
            <span>Typical comfortable adult gait ≈ 1.3 m/s · ~110 steps/min · 0.72 m step — this clip is a <em>leisurely</em> walk.</span>
            <small>Teaching estimate — not a clinical measurement.</small>
          </div>}
          {action.source === 'cmu' && angleData && <div className="kine-angles" aria-label="Left leg sagittal joint angles">
            <span className="eyebrow">LEFT LEG ANGLES · SAGITTAL</span>
            {['hip', 'knee', 'ankle'].map((j) => <div className="kine-angle-row" key={j}>
              <span className="kine-angle-name">{j}</span>
              <svg viewBox="0 0 150 44" className="kine-angle-svg" aria-hidden="true">
                <polygon points={bandPolygon(NORM_BANDS[j], 150, 44)} className="kine-band" />
                <path d={curvePath(angleData[action.clip.replace('.bvh', '')][j], 150, 44)} className="kine-curve" />
                <circle ref={(el) => { angleMarkerRefs.current[j] = el; }} r="2.5" className="kine-marker" cx="0" cy="22" />
              </svg>
              <span className="kine-angle-val" ref={(el) => { angleValRefs.current[j] = el; }}>–</span>
            </div>)}
            <small>Shaded band = typical walking range; line = this capture. Conventions are teaching conventions — clinical labs report ISB/Plug-in-Gait/CGM2.3, which differ systematically (e.g. knee rotation RMSD ≈ 18° between PiG and CGM2.3). Teaching estimate — not a clinical measurement.</small>
          </div>}
          {action.id === 'walk' && repMode !== '3d' && <div className="kine-notation" aria-label="Laban-inspired gait notation strip">
            <span className="eyebrow">NOTATION STRIP · LABAN-INSPIRED</span>
            <svg viewBox="0 0 300 46" className="kine-notation-svg" role="img" aria-label="Glyph row: glyph width = phase duration, height = level, shape = direction family">
              {[{ u: 15, g: 'rect' }, { u: 40, g: 'tri' }, { u: 60, g: 'rect' }, { u: 100, g: 'circle' }].map((p, i, arr) => {
                const x0 = i === 0 ? 0 : arr[i - 1].u * 3;
                const w = (p.u * 3) - x0;
                return <g key={i}>
                  {p.g === 'rect' && <rect x={x0 + 4} y={14} width={w - 8} height={18} fill="none" stroke="#4dd8df" strokeWidth="1.4" />}
                  {p.g === 'tri' && <path d={`M${x0 + 4},32 L${x0 + w / 2},10 L${x0 + w - 8},32 Z`} fill="rgba(77,216,223,0.25)" stroke="#4dd8df" strokeWidth="1.2" />}
                  {p.g === 'circle' && <circle cx={x0 + w / 2} cy={22} r={Math.min(16, (w - 8) / 2)} fill="none" stroke="#4dd8df" strokeWidth="1.4" />}
                </g>;
              })}
              <line x1="0" y1="23" x2="300" y2="23" stroke="#27405c" strokeWidth="1" />
            </svg>
            <small>Width = duration · shape = direction family · inspired by Labanotation (Schrifttanz, 1928). Lineage: Weber brothers 1836 → Muybridge 1878 → Braune &amp; Fischer 1895 → RLA 1980s → today’s markerless mocap.</small>
          </div>}
        </div>
        <div className="kine-block">
          <span className="eyebrow">CAMERA ANGLES</span>
          <div className="kine-cameras">
            {CAMERA_PRESETS.map((p) => <button key={p.id} className={p.id === cameraId ? 'active' : ''} onClick={() => setCameraId(p.id)} aria-label={`Camera: ${p.label} (${p.id === 'closeup' ? 'learner' : 'coach'} view)`} aria-pressed={p.id === cameraId}>{p.label}<i className={'kine-persp'}>{p.id === 'closeup' ? 'learner' : 'coach'}</i><kbd>{p.key}</kbd></button>)}
            <small className={'kine-persp-note'}>Perspective evidence: novices often learn form best from an outside (coach) view; the learner view helps timing and feel.</small>
          <div className="kine-term" role="group" aria-label="Representation density">
            <span>Representation</span>
            {[['3d', '3D'], ['both', '3D + data'], ['data', 'Data only']].map(([id, label]) => <button key={id} type="button" className={repMode === id ? 'active' : ''} aria-pressed={repMode === id} onClick={() => setRepMode(id)}>{label}</button>)}
          </div>
            <button type="button" className={`kine-dual-toggle ${dualView && dualMode === 'rear' ? 'active' : ''}`} aria-pressed={dualView && dualMode === 'rear'} onClick={() => { setDualMode('rear'); setDualView(true); }}>Dual angle<small>rear inset</small></button>
            <button type="button" className={`kine-dual-toggle ${dualView && dualMode === 'offset' ? 'active' : ''}`} aria-pressed={dualView && dualMode === 'offset'} onClick={() => { setDualMode('offset'); setDualView(true); }}>A/B offset<small>ghost = half-cycle ahead</small></button>
            <button type="button" className={`kine-dual-toggle ${dualView && dualMode === 'top' ? 'active' : ''}`} aria-pressed={dualView && dualMode === 'top'} onClick={() => { setDualMode('top'); setDualView(true); }}>Top-down<small>transverse foot placement</small></button>
          </div>
        </div>
        <div className="kine-block">
          <span className="eyebrow">CLINICAL PATTERNS · GHOST</span>
          <div className="kine-actions" role="group" aria-label="Clinical comparison patterns">
            <button type="button" className={!patternId ? 'active' : ''} onClick={() => setPatternId(null)}>none</button>
            {CLINICAL_PATTERNS.map((c) => <button key={c.id} type="button" className={patternId === c.id ? 'active' : ''} aria-pressed={patternId === c.id} onClick={() => setPatternId(patternId === c.id ? null : c.id)}>{c.label}</button>)}
          </div>
          <small className="kine-persp-note">Exaggerated teaching caricatures for contrast with normal gait — not diagnostic. Ghost stands to the figure’s left.</small>
        </div>
        <div className="kine-block">
          <span className="eyebrow">MUSCLES AT WORK</span>
          <label className="kine-toggle"><input type="checkbox" checked={showMuscles} onChange={(e) => setShowMuscles(e.target.checked)} /> highlight activation</label>
          <ul className="kine-legend">
            {muscleList.map((muscle) => <li key={muscle}>
              <button type="button" className={`kine-legend-row ${selected === muscle ? 'active' : ''}`} aria-pressed={selected === muscle} onClick={() => setSelected(selected === muscle ? null : muscle)}>
                <span className="kine-legend-name" title={`${factFor(muscle)?.latin || ''} · ${factFor(muscle)?.action || ''}`}>{(factFor(muscle)?.name || muscle) + sideLabel(muscle)}<i className={`role-${roles[muscle]}`}>{ROLE_LABELS[roles[muscle]]}</i></span>
                <span className="kine-meter"><i ref={(el) => { meterRefs.current[muscle] = el; }} /></span>
              </button>
            </li>)}
          </ul>
          {selected && factFor(selected) && <div className="kine-facts" role="note" aria-label={`Muscle facts: ${factFor(selected).name}`}>
            <div className="kine-facts-head"><strong>{factFor(selected).name + sideLabel(selected)}</strong><button type="button" onClick={() => setSelected(null)} aria-label="Clear muscle selection">×</button></div>
            <em>{factFor(selected).latin}</em>
            <p><b>Plane:</b> {factFor(selected).plane} · <b>Role now:</b> {ROLE_LABELS[roles[selected]] || '—'}</p>
            <p><b>Origin:</b> {factFor(selected).origin}</p>
            <p><b>Insertion:</b> {factFor(selected).insertion}</p>
            <p><b>Action:</b> {factFor(selected).action}</p>
            {spark && <svg viewBox="0 0 150 30" className="kine-actline" role="img" aria-label="Activation timing of the selected muscle across this action">
              <path d={curvePath(spark, 150, 30, 0, 1.2)} className="kine-curve" />
            </svg>}
            {spark && <small className="kine-actline-note">Activation timing in this teaching track — windows follow published EMG timing, simplified.</small>}
          </div>}
        </div>
      </aside>
    </div>
    <div className="kine-transport">
      <div className="kine-tools">
        <button type="button" className="kine-tool" aria-label="Step one frame back" onClick={() => { const m = stateRef.current.clipsMeta?.[action.clip?.replace('.bvh', '')]; setPlaying(false); stateRef.current.time = Math.max(0, stateRef.current.time - (m ? action.duration * m.frameTime : 1 / 30)); }}>−1f</button>
        <button type="button" className="kine-tool" aria-label="Step one frame forward" onClick={() => { const m = stateRef.current.clipsMeta?.[action.clip?.replace('.bvh', '')]; setPlaying(false); stateRef.current.time = Math.min(action.duration, stateRef.current.time + (m ? action.duration * m.frameTime : 1 / 30)); }}>+1f</button>
        {action.id === 'walk' && <button type="button" className="kine-tool" aria-label="Snap to nearest foot contact" onClick={() => { const w = stateRef.current.clipsMeta?.walk_cmu; const cs = stateRef.current.contacts; if (w && cs) { const tt = stateRef.current.time; const near = cs.map((c) => (c / w.frames) * action.duration).reduce((a, b) => (Math.abs(b - tt) < Math.abs(a - tt) ? b : a)); stateRef.current.time = near; setPlaying(false); } }}>⤓ contact</button>}
        <label className="kine-tool-toggle"><input type="checkbox" checked={studyMode} onChange={(e) => { setStudyMode(e.target.checked); setStudyPause(null); }} /> study mode (pauses at phase boundaries)</label>
        <label className="kine-tool-toggle"><input type="checkbox" checked={rehearse} onChange={(e) => setRehearse(e.target.checked)} /> rehearsal mode (AOMI)</label>
        <label className="kine-tool-toggle"><input type="checkbox" checked={voiceOver} onChange={(e) => setVoiceOver(e.target.checked)} /> voice captions (synthetic)</label>
        <label className="kine-tool-toggle"><input type="checkbox" checked={sonify} onChange={(e) => setSonify(e.target.checked)} /> sonify knee angle (a11y)</label>
        <label className="kine-tool-toggle"><input type="checkbox" checked={annotate} onChange={(e) => setAnnotate(e.target.checked)} /> annotate (draw on figure)</label>
        <label className="kine-tool-toggle"><input type="checkbox" checked={trails} onChange={(e) => setTrails(e.target.checked)} /> motion trails (foot/hand paths)</label>
        <label className="kine-tool-toggle"><input type="checkbox" checked={markersOn} onChange={(e) => setMarkersOn(e.target.checked)} /> joint markers (PiG-style)</label>
        <label className="kine-tool-toggle"><input type="checkbox" checked={heatMode} onChange={(e) => setHeatMode(e.target.checked)} /> activation heat colours</label>
        <span className="kine-quality" role="group" aria-label="Render quality">
          {['auto', 'cinema', 'fast'].map((q) => <button key={q} type="button" className={quality === q ? 'active' : ''} aria-pressed={quality === q} onClick={() => { try { localStorage.setItem('kine-quality', q); } catch {} setQuality(q); }}>{q}</button>)}
        </span>
        {typeof sessionStorage !== 'undefined' && sessionStorage.getItem('kine-quality-note') && quality === 'fast' && <small className="kine-pace">auto-switched to fast for smoothness</small>}
        <button type="button" className="kine-tool" onClick={() => { strokesRef.current = []; }}>clear ink</button>
        <button type="button" className="kine-tool" onClick={() => {
          const src = document.querySelector('.kine-stage canvas');
          const ov = overlayRef.current;
          if (!src) return;
          const c = document.createElement('canvas');
          c.width = src.width; c.height = src.height;
          const ctx = c.getContext('2d');
          ctx.drawImage(src, 0, 0);
          if (ov) ctx.drawImage(ov, 0, 0, c.width, c.height);
          const a = document.createElement('a');
          a.href = c.toDataURL('image/png');
          a.download = 'kinesiology-annotation.png';
          a.click();
        }}> PNG</button>
        <button type="button" className="kine-tool" onClick={startDrill}>drill me (retrieval practice)</button>
        <button type="button" className="kine-tool" onClick={exportAnki} aria-label="Export muscle facts as Anki TSV">⭳ Anki TSV</button>
        <button type="button" className="kine-tool" onClick={() => setHintIdx((i) => i + 1)}>coach hint (Socratic)</button>
        <label className="kine-tool-toggle"><input type="checkbox" checked={logOn} onChange={(e) => setLogOn(e.target.checked)} /> learning log (local-only)</label>
        <label className="kine-tool-toggle"><input type="checkbox" checked={selfCompare} onChange={(e) => setSelfCompare(e.target.checked)} /> self-compare (camera, on-device)</label>
        {xrAvailable && <button type="button" className="kine-tool" onClick={() => { navigator.xr.requestSession('immersive-vr', { optionalFeatures: ['local-floor'] }).then((sess) => xrRef.current?.xr.setSession(sess)).catch(() => {}); }}>enter XR</button>}
      </div>
      {(HINTS[action.id] || [])[hintIdx % (HINTS[action.id] || [1]).length] !== undefined && hintIdx > 0 && <div className="kine-hint" role="note"><strong>Coach hint.</strong><span>{(HINTS[action.id] || ['Watch the phase caption and name the prime mover.'])[(hintIdx - 1) % (HINTS[action.id] || [1]).length]}</span></div>}
      {selfCompare && <div className="kine-selfcam" role="note" aria-label="On-device self comparison">
        <video ref={videoRef} muted playsInline autoPlay className="kine-selfcam-video" />
        <span>Your knee flexion: <b ref={selfKneeRef}>–</b> vs figure’s left knee in the readout above.</span>
        <small>{camError || 'Camera stays on your device. Frames are analysed in your browser and discarded instantly; nothing is stored or sent.'}</small>
      </div>}
      {drill && <div className="kine-drill" role="dialog" aria-label="Retrieval practice drill">
        {drill.done ? <>
          <strong>Drill complete.</strong>
          <span>{drill.stats.correct} correct · {drill.stats.wrong} missed this session. Missed items were re-asked until correct (spaced, Leitner-lite).</span>
          <button type="button" className="kine-tool" onClick={() => setDrill(null)}>Close</button>
        </> : <>
          <strong>{drill.prompt}</strong>
          {drill.mode === 'choice' && <div className="kine-drill-options">{drill.options.map((k) => <button key={k} type="button" className="kine-tool" onClick={() => answerDrill(k)}>{drillName(k)}</button>)}</div>}
          {drill.mode === 'click' && <span>Click it on the 3D figure.</span>}
          {drill.feedback && <em className={drill.feedback.startsWith('Correct') ? 'ok' : 'no'}>{drill.feedback}</em>}
          <button type="button" className="kine-tool" onClick={() => setDrill(null)}>stop</button>
        </>}
      </div>}
      <div className="kine-scrub-wrap">
        <input className="kine-scrub" type="range" min={0} max={1000} defaultValue={0} aria-label="Scrub timeline" onChange={(e) => { stateRef.current.time = (e.target.value / 1000) * action.duration; }} />
        {action.id === 'walk' && <div className="kine-ticks">{Object.entries({ 0: 'Initial contact', 10: 'End loading response', 30: 'End mid-stance', 50: 'End terminal stance', 60: 'End pre-swing (toe-off)', 73: 'End initial swing', 87: 'End mid-swing', 100: 'Cycle end' }).map(([p, label]) => <button key={p} type="button" className="kine-tick" style={{ left: `${p}%` }} title={`${p}% — ${label}`} aria-label={`Jump to ${p}% of gait cycle: ${label}`} onClick={() => { stateRef.current.time = (p / 100) * action.duration; }} />)}</div>}
      </div>
      <div className="kine-ribbon" role="group" aria-label="Gait phase timeline — click to seek">
        {action.phases.map((p, i) => { const start = i ? action.phases[i - 1].until : 0; return (
          <button key={p.name} type="button" aria-label={`Seek to ${p.rla || p.name}`} title={`${p.rla || p.name} — seek`} style={{ width: `${(p.until - start) * 100}%` }} onClick={() => { const base = Math.floor(stateRef.current.time / action.duration) * action.duration; stateRef.current.time = base + start * action.duration + 0.001; }}>
            <span>{i + 1}</span>
          </button>
        ); })}
        <i className="kine-ribbon-playhead" ref={ribbonHeadRef} aria-hidden="true" />
      </div>
      <p className="kine-caption" aria-live="polite"><strong>{phaseName || action.phases[0].name}.</strong> {caption}</p>
    </div>
  </div>;
}
