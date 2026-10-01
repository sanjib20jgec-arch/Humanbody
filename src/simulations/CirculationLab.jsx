import React, { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import ErrorBoundary from '../components/ErrorBoundary.jsx';
const CirculationDeepDive = lazy(() => import('../components/circulation/CirculationDeepDive.jsx'));
import * as THREE from 'three';
import { CardioPhysiologyEngine } from '../lib/CardioPhysiologyEngine';
import { Icon } from '../components/Icons';
import ReferenceObject3D from '../components/ReferenceObject3D';
import SimulationControls from '../components/SimulationControls';
import InfoPanel from '../components/InfoPanel';
import Quiz from '../components/Quiz';
import GuidedTour from '../components/GuidedTour';
import { soundManager } from '../lib/sound';
import { TEACHING_OVERLAY_SPEC } from '../data/teachingOverlaySpec';
import { previousValveEvent } from '../lib/CardiacCycleStateMachine';

const CIRCULATION_ROUTE_DISCLOSURE = TEACHING_OVERLAY_SPEC.circulation.routeDisclosure;

const chamberData = {
  'right-atrium': { name: 'Right atrium', what: 'Receives oxygen-poor blood returning from the body through the vena cava.', how: 'Its thin wall contracts and passes blood through the tricuspid valve to the right ventricle.', why: 'It starts the pulmonary circuit, sending blood to the lungs for gas exchange.', accent: '#38bdf8' },
  'right-ventricle': { name: 'Right ventricle', what: 'Pumps oxygen-poor blood toward the lungs.', how: 'When it contracts, the pulmonary valve opens and blood enters the pulmonary artery.', why: 'The lungs add oxygen and remove carbon dioxide before blood returns to the heart.', accent: '#38bdf8' },
  'left-atrium': { name: 'Left atrium', what: 'Receives oxygen-rich blood from the lungs through the pulmonary veins.', how: 'It contracts gently and moves blood through the mitral valve into the left ventricle.', why: 'It hands oxygenated blood to the chamber that serves the whole body.', accent: '#ef4444' },
  'left-ventricle': { name: 'Left ventricle', what: 'The main pumping chamber for oxygen-rich blood.', how: 'Its thick muscular wall contracts and pushes blood through the aortic valve into the aorta.', why: 'This pressure drives the systemic circuit that delivers oxygen to body tissues.', accent: '#ef4444' },
  'valves': { name: 'Heart valves', what: 'Flaps that keep blood moving in one direction.', how: 'Pressure differences open and close the valves between chambers and vessels.', why: 'One-way flow makes the two circuits efficient and prevents backflow.', accent: '#fbbf24' }
};

const circulationRoute = {
  'right-atrium': { label: 'Return from body', status: 'oxygen-poor blood', next: 'right ventricle', explanation: 'The source-derived chamber is the entry point for blood returning from systemic tissues.', steps: ['Venae cavae', 'Right atrium', 'Right ventricle', 'Pulmonary trunk'] },
  'right-ventricle': { label: 'Send to lungs', status: 'oxygen-poor blood', next: 'pulmonary exchange', explanation: 'The right ventricle drives the pulmonary circuit toward the lungs.', steps: ['Right atrium', 'Right ventricle', 'Pulmonary arteries', 'Lung capillaries'] },
  'left-atrium': { label: 'Return from lungs', status: 'oxygen-rich blood', next: 'left ventricle', explanation: 'The left atrium receives oxygen-rich blood before it enters the systemic pump.', steps: ['Pulmonary veins', 'Left atrium', 'Left ventricle', 'Aorta'] },
  'left-ventricle': { label: 'Send to body', status: 'oxygen-rich blood', next: 'systemic tissues', explanation: 'The left ventricle provides the pressure that sends oxygen-rich blood through the aorta.', steps: ['Left atrium', 'Left ventricle', 'Aorta', 'Systemic tissues'] },
  valves: { label: 'One-way gate', status: 'pressure-controlled flow', next: 'next chamber', explanation: 'Valve motion follows pressure differences so each beat advances blood without backflow.', steps: ['Upstream chamber', 'Valve opens', 'Downstream vessel', 'Valve closes'] }
};

const circulationFlowStages = [
  { id: 'systemic-return', label: 'Body → right side', chamber: 'right-atrium', status: 'oxygen-poor', detail: 'Systemic tissues return oxygen-poor blood through the venae cavae.' },
  { id: 'pulmonary-send', label: 'Right side → lungs', chamber: 'right-ventricle', status: 'oxygen-poor', detail: 'The right ventricle sends blood through the pulmonary arteries.' },
  { id: 'pulmonary-return', label: 'Lungs → left side', chamber: 'left-atrium', status: 'oxygen-rich', detail: 'Gas exchange adds oxygen before blood returns through the pulmonary veins.' },
  { id: 'systemic-send', label: 'Left side → body', chamber: 'left-ventricle', status: 'oxygen-rich', detail: 'The left ventricle sends oxygen-rich blood through the aorta.' }
];

const flowStageForChamber = Object.fromEntries(circulationFlowStages.map((stage, index) => [stage.chamber, index]));
// Phase 29: waypoints route each conceptual line through the valve plane it
// actually crosses instead of skipping straight between chamber centers.
const circulationTeachingStages = [
  { id: 'systemic-return', color: 0x4eaed0, queries: ['superior vena cava', 'cavity of right atrium'], focusQueries: ['cavity of right atrium'], routeOffset: [0, 0.028, 0] },
  { id: 'pulmonary-send', color: 0x4eaed0, queries: ['cavity of right atrium', 'cavity of right ventricle', 'pulmonary trunk'], focusQueries: ['cavity of right ventricle'], waypoints: ['anterior leaflet of tricuspid valve'], routeOffset: [0, 0.028, 0] },
  { id: 'pulmonary-return', color: 0xe95d72, queries: ['pulmonary vein', 'cavity of left atrium', 'cavity of left ventricle'], focusQueries: ['cavity of left atrium'], waypoints: ['anterior leaflet of mitral valve'], routeOffset: [0, 0.028, 0] },
  { id: 'systemic-send', color: 0xe95d72, queries: ['cavity of left ventricle', 'ascending aorta'], focusQueries: ['cavity of left ventricle'], waypoints: ['anterior cusp of aortic valve'], routeOffset: [0, 0.028, 0] }
];

function getPressureTeachingState(snapshot = {}) {
  const valves = snapshot.valves || { mitral: false, tricuspid: false, aortic: false, pulmonary: false };
  const open = Object.entries(valves).filter(([, isOpen]) => isOpen).map(([name]) => name);
  const phase = snapshot.phaseLabel || 'ventricular filling';
  const gradient = phase === 'ventricular ejection' ? 'ventricular pressure exceeds arterial pressure' : phase === 'isovolumetric contraction' ? 'pressure is building before ejection' : phase === 'isovolumetric relaxation' ? 'pressure is falling after ejection' : 'venous return fills the chambers';
  return { phase, gradient, valves, open: open.length ? open.join(' · ') : 'no major outlet valve open' };
}

function getValveMarkerSpecs(snapshot = {}) {
  const state = getPressureTeachingState(snapshot);
  const gradients = snapshot.valveGradients || {};
  return [
    { queries: ['anterior leaflet of mitral valve', 'posterior leaflet of mitral valve'], color: state.valves.mitral ? 0x8df5ed : 0x617687, state: state.valves.mitral ? 'open' : 'closed', gradient: gradients.mitral || 0 },
    { queries: ['anterior leaflet of tricuspid valve', 'posterior leaflet of tricuspid valve', 'septal leaflet of tricuspid valve'], color: state.valves.tricuspid ? 0x8df5ed : 0x617687, state: state.valves.tricuspid ? 'open' : 'closed', gradient: gradients.tricuspid || 0 },
    { queries: ['anterior cusp of aortic valve', 'left posterior cusp of aortic valve', 'right posterior cusp of aortic valve'], color: state.valves.aortic ? 0xfca5a5 : 0x617687, state: state.valves.aortic ? 'open' : 'closed', gradient: gradients.aortic || 0 },
    { queries: ['left anterior cusp of pulmonary valve', 'right anterior cusp of pulmonary valve', 'posterior cusp of pulmonary valve'], color: state.valves.pulmonary ? 0xfca5a5 : 0x617687, state: state.valves.pulmonary ? 'open' : 'closed', gradient: gradients.pulmonary || 0 }
  ];
}

const cardioPresets = {
  rest: { label: 'Resting', values: { exercise: 0, epinephrine: 0, betaBlocker: 0, peripheralResistance: 1 } },
  exercise: { label: 'Exercise', values: { exercise: 0.72, epinephrine: 0.18, betaBlocker: 0, peripheralResistance: 1.12 } },
  beta: { label: 'Beta blocker', values: { exercise: 0, epinephrine: 0, betaBlocker: 0.68, peripheralResistance: 1 } },
  resistance: { label: 'High TPR', values: { exercise: 0, epinephrine: 0, betaBlocker: 0, peripheralResistance: 1.42 } }
};

const bloodData = {
  red: { label: 'Red blood cell', color: '#ef4444', symbol: 'O₂', what: 'Biconcave cells packed with haemoglobin.', how: 'Haemoglobin binds oxygen in the lungs and releases it where it is needed.', why: 'They transport most of the body\'s oxygen.' },
  white: { label: 'White blood cell', color: '#e2e8f0', symbol: 'W', what: 'A group of immune cells with different shapes and roles.', how: 'They recognize, engulf, or coordinate defenses against pathogens.', why: 'They protect the body from infection.' },
  platelets: { label: 'Platelet', color: '#fbbf24', symbol: '＋', what: 'Tiny cell fragments involved in clotting.', how: 'They gather at damaged vessels and help form a temporary plug.', why: 'They reduce blood loss after an injury.' },
  plasma: { label: 'Plasma', color: '#f59e0b', symbol: '≈', what: 'The pale liquid part of blood.', how: 'It carries dissolved nutrients, hormones, carbon dioxide, and waste.', why: 'It provides the transport medium for blood cells and solutes.' }
};

export default function CirculationLab({ activeView, onViewChange, onComplete, onAsk, reducedMotion }) {
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [heartRate, setHeartRate] = useState(72);
  const [selectedChamber, setSelectedChamber] = useState('left-ventricle');
  const [selectedBlood, setSelectedBlood] = useState('red');
  const [cycle, setCycle] = useState(0);
  const [cardioSnapshot, setCardioSnapshot] = useState({ phase: 0, running: false });

  useEffect(() => {
    if (reducedMotion || !playing) return undefined;
    const period = Math.max(220, (60000 / heartRate) / speed);
    const timer = window.setInterval(() => setCycle((value) => (value + 1) % 100), period / 5);
    return () => window.clearInterval(timer);
  }, [playing, heartRate, speed, reducedMotion]);
  useEffect(() => { if (reducedMotion) setPlaying(false); }, [reducedMotion]);

  const reset = () => { setPlaying(false); setCycle(0); setHeartRate(72); setSelectedChamber('left-ventricle'); };

  useEffect(() => {
    const onKeyDown = (event) => {
      if (activeView === 'quiz' || event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
      if (event.key === ' ') { event.preventDefault(); setPlaying((value) => !value); }
      if (event.key.toLowerCase() === 'r') reset();
      if (event.key === '+' || event.key === '=') setSpeed((value) => value === 0.5 ? 1 : 2);
      if (event.key === '-') setSpeed((value) => value === 2 ? 1 : 0.5);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeView]);

  const selected = chamberData[selectedChamber];
  const waveform = useMemo(() => Array.from({ length: 44 }, (_, index) => Math.sin(index * 0.42) * (index % 11 === 5 ? 7 : index % 13 === 3 ? 22 : 4) + 34), []);

  return <div className="module-layout circulation-layout">
    <div className="module-main">
      <div className="view-switcher"><button className={activeView === 'explore' ? 'active' : ''} onClick={() => onViewChange('explore')}>EXPLORE</button><button className={activeView === 'simulate' ? 'active' : ''} onClick={() => onViewChange('simulate')}>SIMULATE</button><button className={activeView === 'quiz' ? 'active' : ''} onClick={() => onViewChange('quiz')}>QUIZ <span className="tiny-dot" /></button></div>
      {activeView === 'quiz' ? <div className="quiz-view"><div className="view-heading"><span className="eyebrow">KNOWLEDGE CHECK</span><h2>Circulation checkpoint</h2><p>Use direction, chamber structure, and oxygen status to solve the route.</p></div><Quiz moduleId="circulation" onComplete={onComplete} onAsk={onAsk} /></div> : activeView === 'simulate' ? <CardioSimulation reducedMotion={reducedMotion} onSnapshot={setCardioSnapshot} /> : <CirculationExplore cardioSnapshot={cardioSnapshot} selectedChamber={selectedChamber} setSelectedChamber={setSelectedChamber} selectedBlood={selectedBlood} setSelectedBlood={setSelectedBlood} reducedMotion={reducedMotion} />}
    </div>
    {activeView !== 'quiz' && <InfoPanel title={selected.name} eyebrow="HEART NODE · DOUBLE CIRCULATION" accent={selected.accent} what={selected.what} how={selected.how} why={selected.why} />}
  </div>;
}

function createLiveCardioOverlay(snapshot, reducedMotion) {
  if (!snapshot) return null;
  const activeStage = snapshot.valves.pulmonary ? 1 : snapshot.valves.aortic ? 3 : snapshot.valves.mitral ? 2 : snapshot.valves.tricuspid ? 0 : snapshot.phase < 0.16 ? 0 : snapshot.phase < 0.57 ? 1 : 2;
  return { id: 'circulation-live-reference', label: 'Source reference is coupled to the live CardioPhysiologyEngine snapshot.', status: `Live phase: ${snapshot.phaseLabel}.`, activeStage, stages: circulationTeachingStages, pressureMarkers: getValveMarkerSpecs(snapshot), pulseColor: 0x8df5ed, pulseRadius: 0.016, pulsePhase: snapshot.phase, animate: Boolean(snapshot.running), reducedMotion, routeDisclosure: CIRCULATION_ROUTE_DISCLOSURE };
}

function CirculationLiveReference({ snapshot, reducedMotion, teachingOverlay }) {
  return <section className="circulation-live-reference" aria-label="Live coupled circulation reference">
    <div className="circulation-live-heading"><span className="eyebrow">LIVE COUPLED REFERENCE</span><strong>Source mesh + pressure model</strong><p>The atlas remains the structural reference; pulse, phase, and valve markers come from the adjacent educational model.</p></div>
    <ReferenceObject3D registryId="heart-macro" label="Live heart reference" systems={['cardiac', 'arterial', 'venous']} source="BodyParts3D 4.0 adult-male reference atlas" sourceUrl="https://dbarchive.biosciencedbc.jp/en/bodyparts3d/desc.html" limitation="The source mesh is not animated anatomy. This pulse and valve state are a separate educational coupling." reducedMotion={reducedMotion} quality="battery" teachingOverlay={teachingOverlay} />
  </section>;
}

function CardioSimulation({ reducedMotion, onSnapshot }) {
  const engineRef = useRef(null);
  const onSnapshotRef = useRef(onSnapshot);
  const [snapshot, setSnapshot] = useState(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => { onSnapshotRef.current = onSnapshot; }, [onSnapshot]);
  useEffect(() => {
    const engine = new CardioPhysiologyEngine();
    engineRef.current = engine;
    const firstSnapshot = engine.getSnapshot();
    setSnapshot(firstSnapshot);
    onSnapshotRef.current?.(firstSnapshot);
    // R6 (F3): the in-panel UI tracks every emit; the upstream overlay
    // coupling is throttled to ~10 Hz so the surrounding lab subtree is not
    // reconciled 25×/s.
    let lastUpstreamEmit = 0;
    const unsubscribe = engine.subscribe((nextSnapshot) => {
      setSnapshot(nextSnapshot);
      const now = performance.now();
      if (now - lastUpstreamEmit >= 100) {
        lastUpstreamEmit = now;
        onSnapshotRef.current?.(nextSnapshot);
      }
    });
    return () => { unsubscribe(); onSnapshotRef.current?.({ ...engine.getSnapshot(), running: false }); engine.dispose(); engineRef.current = null; };
  }, []);
  useEffect(() => { if (reducedMotion) { engineRef.current?.stop(); setPlaying(false); } }, [reducedMotion]);
  const liveReferenceOverlay = useMemo(() => createLiveCardioOverlay(snapshot, reducedMotion), [snapshot, reducedMotion]);

  if (!snapshot) return <div className="cardio-loading">Preparing coupled cardiac model…</div>;
  const patch = (key, value) => setSnapshot(engineRef.current.setParameters({ [key]: value }));
  const toggle = () => {
    const engine = engineRef.current;
    if (!engine) return;
    if (reducedMotion) return;
    if (playing) engine.stop(); else engine.start();
    setPlaying((value) => !value);
  };
  const reset = () => { engineRef.current.reset(); setPlaying(false); setSnapshot(engineRef.current.getSnapshot()); };
  const step = () => { engineRef.current.step(0.08); setSnapshot(engineRef.current.emit(true)); };
  const applyPreset = (preset) => { setSnapshot(engineRef.current.setParameters(preset.values)); };
  return <div className="cardio-simulation-shell"><div className="cardio-engine-panel">
    <div className="visual-heading"><div><span className="eyebrow">CARDIOPHYSIOLOGY ENGINE · COUPLED MODEL</span><h2>Pressure drives the pump</h2><p>Change the conditions and compare heart rate, stroke volume, pressure, valve state, and cardiac output.</p></div><span className="status-chip"><i className="live-dot" /> {playing ? 'model running' : 'model paused'}</span></div>
    <div className="cardio-presets" aria-label="Cardiac scenario presets"><span className="eyebrow">SCENARIO PRESETS</span>{Object.entries(cardioPresets).map(([id, preset]) => <button key={id} onClick={() => applyPreset(preset)}>{preset.label}</button>)}</div>
    <div className="cardio-top-grid"><HeartMeshPreview engine={engineRef.current} active={playing} deformation={snapshot.deformation} reducedMotion={reducedMotion} /><div className="cardio-metrics"><div className="cardio-metric"><span>HEART RATE</span><strong>{snapshot.heartRate.toFixed(0)} <small>BPM</small></strong></div><div className="cardio-metric"><span>STROKE VOLUME</span><strong>{snapshot.strokeVolume.toFixed(1)} <small>mL</small></strong></div><div className="cardio-metric accent"><span>CARDIAC OUTPUT</span><strong>{snapshot.cardiacOutput.toFixed(2)} <small>L/min</small></strong></div><div className="cardio-metric"><span>MAP</span><strong>{snapshot.map.toFixed(1)} <small>mmHg</small></strong></div></div></div>
    <div className="cardio-graph-card"><div className="graph-card-heading"><span className="eyebrow">WIGGERS DIAGRAM · LIVE PRESSURE</span><strong>{snapshot.phaseLabel}</strong></div><WiggersCanvas engine={engineRef.current} snapshot={snapshot} /><CardioTimeline engine={engineRef.current} snapshot={snapshot} onScrub={(phase) => { engineRef.current.stop(); setPlaying(false); setSnapshot(engineRef.current.setPhase(phase)); }} /></div>
    <div className="cardio-control-grid"><ParameterSlider label="Exercise intensity" value={engineRef.current.state.exercise} min={0} max={1} step={0.01} display={`${Math.round(engineRef.current.state.exercise * 100)}%`} onChange={(value) => patch('exercise', value)} /><ParameterSlider label="Epinephrine" value={engineRef.current.state.epinephrine} min={0} max={1} step={0.01} display={`${Math.round(engineRef.current.state.epinephrine * 100)}%`} onChange={(value) => patch('epinephrine', value)} /><ParameterSlider label="Beta-blocker" value={engineRef.current.state.betaBlocker} min={0} max={1} step={0.01} display={`${Math.round(engineRef.current.state.betaBlocker * 100)}%`} onChange={(value) => patch('betaBlocker', value)} /><ParameterSlider label="Peripheral resistance" value={engineRef.current.state.peripheralResistance} min={0.55} max={1.55} step={0.01} display={`${engineRef.current.state.peripheralResistance.toFixed(2)}×`} onChange={(value) => patch('peripheralResistance', value)} /></div>
    <div className="valve-readout"><span className="eyebrow">PRESSURE GRADIENTS · VALVES</span><div>{Object.entries(snapshot.valves).map(([name, open]) => <span key={name} className={open ? 'open' : 'closed'}><i /> {name} · {open ? 'open' : 'closed'} · gradient {Math.round((snapshot.valveGradients?.[name] || 0) * 100)}%</span>)}</div></div>
    <div className="cardio-controls"><button className="primary-cta" onClick={toggle}>{playing ? 'Pause model' : 'Run model'}</button><button className="outline-button" onClick={step}>Step 80 ms</button><button className="outline-button" onClick={reset}>Reset</button></div>
    <p className="micro-note"><Icon name="info" size={14} /> Educational model: CO = HR × SV. MAP ≈ DBP + ⅓(SBP − DBP). The pressure curves and 3D heart deformation are explanatory, not clinical measurements. Valve cusp teaching names: aortic = right coronary · left coronary · non-coronary; pulmonary = anterior · right · left. The impulse starts at the SA node (P wave = atrial depolarization), pauses at the AV node, then spreads through the bundle of His and Purkinje fibers (QRS = ventricular depolarization).</p>
  </div><CirculationLiveReference snapshot={snapshot} reducedMotion={reducedMotion} teachingOverlay={liveReferenceOverlay} /></div>;
}

// Phase 33: a deterministic timeline. Scrubbing maps one-to-one onto the
// cycle phase, so any teaching state can be paused, stepped, and replayed.
// Valve event ticks come from the same state machine that drives the markers.
function CardioTimeline({ engine, snapshot, onScrub }) {
  const events = snapshot.valveEvents || [];
  const state = snapshot.cardiacState;
  const jumpToEvent = (direction) => {
    const ordered = [...events].sort((a, b) => a.phase - b.phase);
    if (!ordered.length) return;
    const phase = snapshot.phase || 0;
    const target = direction > 0
      ? ordered.find((event) => event.phase > phase + 0.001) || ordered[0]
      : [...ordered].reverse().find((event) => event.phase <= phase - 0.001) || ordered[ordered.length - 1];
    onScrub?.(target.phase);
  };
  return <div className="cardio-timeline" aria-label="Cardiac cycle timeline">
    <div className="cardio-timeline-head"><span className="eyebrow">CYCLE TIMELINE · SCRUB &amp; STEP</span><strong>{state?.stateLabel || snapshot.phaseLabel}</strong></div>
    <div className="cardio-timeline-track">
      <input aria-label="Scrub the cardiac cycle phase" type="range" min="0" max="1000" step="1" value={Math.round((snapshot.phase || 0) * 1000)} onChange={(event) => onScrub?.(Number(event.target.value) / 1000)} />
      <div className="cardio-timeline-events" aria-hidden="true">{events.map((event) => <i key={event.id} style={{ left: `${event.phase * 100}%` }} title={event.label} />)}</div>
    </div>
    <div className="cardio-timeline-controls">
      <button type="button" className="outline-button" onClick={() => jumpToEvent(-1)}>← Previous valve event</button>
      <button type="button" className="outline-button" onClick={() => jumpToEvent(1)}>Next valve event →</button>
      <span className="cardio-timeline-caption" role="status" aria-live="polite">{state?.caption} Flow: {state?.flow}. Last event: {previousValveEvent(snapshot.phase || 0).label}.</span>
    </div>
    <small className="cardio-timeline-note">Deterministic teaching timeline: the same phase always shows the same state. Pressures are normalized educational values, not clinical traces.</small>
  </div>;
}

function ParameterSlider({ label, value, min, max, step, display, onChange }) {
  return <label className="lab-slider cardio-slider"><span>{label}</span><output>{display}</output><input aria-label={label} type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} /></label>;
}

function WiggersCanvas({ engine, snapshot }) {
  const canvasRef = useRef(null);
  const drawRef = useRef(() => {});
  // R6 (F3): the backing store and ResizeObserver live once per engine; each
  // snapshot only repaints via the ref — no per-frame resize/reallocation.
  useEffect(() => {
    const canvas = canvasRef.current;
    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(1, Math.round(rect.width * dpr));
      const height = Math.max(1, Math.round(rect.height * dpr));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      const ctx = canvas.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      engine.drawWiggers(ctx, rect.width, rect.height);
    };
    drawRef.current = draw;
    draw();
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(draw) : null;
    observer?.observe(canvas);
    return () => { observer?.disconnect(); drawRef.current = () => {}; };
  }, [engine]);
  useEffect(() => { drawRef.current(); }, [snapshot]);
  return <div className="wiggers-block">
    <canvas ref={canvasRef} className="wiggers-canvas" aria-label="Live Wiggers pressure diagram with calibrated mmHg rulers" />
    <ul className="chart-legend" aria-label="Wiggers trace legend">
      {engine.wiggersLegend().map((entry) => <li key={entry.label}><i style={{ background: entry.color }} />{entry.label}</li>)}
    </ul>
  </div>;
}

function HeartMeshPreview({ engine, active, deformation, reducedMotion }) {
  const mountRef = useRef(null);
  const renderRef = useRef(null);
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;
    let renderer;
    const isMobile = window.matchMedia?.('(max-width: 767px)')?.matches || /Android.*Mobile|iPhone|iPod/i.test(navigator.userAgent || '');
    try { renderer = new THREE.WebGLRenderer({ antialias: !isMobile, alpha: true, powerPreference: 'high-performance' }); } catch { return undefined; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.25 : 2));
    renderer.setSize(260, 220, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(28, 260 / 220, 0.1, 20);
    camera.position.set(0, 0.05, 4.2);
    const shape = new THREE.Shape();
    shape.moveTo(0, -0.65); shape.bezierCurveTo(-0.85, -0.08, -0.84, 0.78, -0.26, 0.88); shape.bezierCurveTo(-0.02, 0.92, 0.1, 0.7, 0.16, 0.45); shape.bezierCurveTo(0.25, 0.75, 0.63, 0.88, 0.83, 0.48); shape.bezierCurveTo(1.05, 0.04, 0.65, -0.36, 0, -0.65);
    const geometry = new THREE.ExtrudeGeometry(shape, { depth: 0.42, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.08, bevelThickness: 0.08 });
    geometry.center();
    const material = new THREE.MeshStandardMaterial({ color: 0xa8434d, roughness: 0.48, metalness: 0.02 });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = 0.18; mesh.rotation.y = -0.18;
    scene.add(mesh);
    scene.add(new THREE.HemisphereLight(0xffe9e8, 0x14202b, 1.8));
    const light = new THREE.DirectionalLight(0xffffff, 2.1); light.position.set(-2, 3, 4); scene.add(light);
    const detach = engine.attachHeartMesh(mesh);
    let frame = 0;
    const draw = () => { mesh.rotation.z = reducedMotion ? 0 : Math.sin(performance.now() / 1600) * 0.025; renderer.render(scene, camera); };
    renderRef.current = draw;
    const render = () => { draw(); if (active && !reducedMotion) frame = window.requestAnimationFrame(render); };
    render();
    return () => { window.cancelAnimationFrame(frame); renderRef.current = null; detach?.(); geometry.dispose(); material.dispose(); renderer.dispose(); renderer.domElement.remove(); };
  }, [engine, active, reducedMotion]);
  useEffect(() => { renderRef.current?.(); }, [deformation]);
  return <div className="heart-mesh-preview"><div ref={mountRef} /><span>3D heart mesh · deformation synced to ventricular phase</span></div>;
}

function CirculationPressureState({ state }) {
  return <section className="circulation-pressure-state" aria-label="Pressure and valve teaching state">
    <div><span className="eyebrow">PRESSURE TEACHING STATE</span><strong>{state.phase}</strong><p>{state.gradient}</p></div>
    <div className="circulation-valve-status"><span>VALVES</span><strong>{state.open}</strong><small>Open/closed status is generated by the educational pressure model.</small></div>
  </section>;
}

function CirculationRouteState({ selectedChamber, onStageChange }) {
  const route = circulationRoute[selectedChamber] || circulationRoute['left-ventricle'];
  const activeStage = flowStageForChamber[selectedChamber] ?? 3;
  const stage = circulationFlowStages[activeStage];
  return <section className="circulation-route-state" aria-label="Selected heart structure teaching state">
    <div className="circulation-route-heading"><span className="eyebrow">STRUCTURE → FLOW LINK</span><strong>{route.label}</strong><p>{route.explanation}</p></div>
    <div className="circulation-route-sequence" aria-label="Double circulation teaching sequence">{circulationFlowStages.map((item, index) => <button key={item.id} type="button" className={index === activeStage ? 'active' : ''} onClick={() => onStageChange?.(item.chamber)} aria-pressed={index === activeStage}><i>{String(index + 1).padStart(2, '0')}</i><span>{item.label}</span>{index < circulationFlowStages.length - 1 && <b>→</b>}</button>)}</div>
    <div className="circulation-route-status"><span>TEACHING STATE · {stage.status}</span><strong>{route.status}</strong><small>{stage.detail}</small></div>
  </section>;
}

function CirculationExplore({ selectedChamber, setSelectedChamber, selectedBlood, setSelectedBlood, reducedMotion, cardioSnapshot }) {
  const pressureState = getPressureTeachingState(cardioSnapshot);
  const teachingOverlay = useMemo(() => ({ id: 'circulation-flow', label: 'Animated oxygen-status route follows the selected chamber and last cardiac-cycle phase.', status: `Pressure state: ${pressureState.phase}.`, activeStage: flowStageForChamber[selectedChamber] ?? 3, stages: circulationTeachingStages, pressureMarkers: getValveMarkerSpecs(cardioSnapshot), pulseColor: 0x8df5ed, pulseRadius: 0.016, pulsePhase: cardioSnapshot?.phase || 0, animate: Boolean(cardioSnapshot?.running), reducedMotion, routeDisclosure: CIRCULATION_ROUTE_DISCLOSURE }), [selectedChamber, reducedMotion, cardioSnapshot?.phase, cardioSnapshot?.running, cardioSnapshot?.valveGradients?.mitral, cardioSnapshot?.valveGradients?.tricuspid, cardioSnapshot?.valveGradients?.aortic, cardioSnapshot?.valveGradients?.pulmonary, pressureState.phase, pressureState.valves.mitral, pressureState.valves.tricuspid, pressureState.valves.aortic, pressureState.valves.pulmonary]);
  const handleAnatomySelect = (metadata) => {
    const name = String(metadata?.commonName || '').toLowerCase();
    if (name.includes('right atrium')) setSelectedChamber('right-atrium');
    else if (name.includes('right ventricle')) setSelectedChamber('right-ventricle');
    else if (name.includes('left atrium')) setSelectedChamber('left-atrium');
    else if (name.includes('left ventricle')) setSelectedChamber('left-ventricle');
    else if (name.includes('valve')) setSelectedChamber('valves');
  };
  const tourSteps = circulationFlowStages.map((stage) => ({ id: stage.id, label: stage.label, caption: stage.detail }));
  return <div className="circulation-explore"><div className="view-heading"><span className="eyebrow">EXPLORE · HEART ANATOMY</span><h2>Navigate the pump</h2><p>Select a source-derived chamber or valve, rotate the heart through 360°, and then follow oxygen status through the two circuits.</p></div><GuidedTour label="Double circulation" steps={tourSteps} activeIndex={flowStageForChamber[selectedChamber] ?? 3} onStep={(index) => setSelectedChamber(circulationFlowStages[index]?.chamber)} reducedMotion={reducedMotion} /><ReferenceObject3D registryId="heart-macro" label="Heart & major vessels" systems={['cardiac', 'arterial', 'venous']} source="BodyParts3D 4.0 adult-male reference atlas" sourceUrl="https://dbarchive.biosciencedbc.jp/en/bodyparts3d/desc.html" limitation="The mesh is an adult-male macro-anatomy reference; pulmonary/systemic flow and pressure are explained by the separate simulation model." reducedMotion={reducedMotion} onSelect={handleAnatomySelect} teachingOverlay={teachingOverlay} /><CirculationRouteState selectedChamber={selectedChamber} onStageChange={setSelectedChamber} /><CirculationPressureState state={pressureState} /><div className="heart-key reference-circuit-key"><div className="key-row"><i className="oxygen-dot" /><div><strong>Oxygen-rich blood</strong><span>From lungs → left side → body · systemic circuit</span></div></div><div className="key-row"><i className="co2-dot" /><div><strong>Oxygen-poor blood</strong><span>From body → right side → lungs · pulmonary circuit</span></div></div><div className="anatomy-note"><Icon name="info" size={16} /><span>Interactive labels connect the source mesh to the learning model. Select a chamber or valve to update the learning panel.</span></div></div><div className="blood-preview"><div><span className="eyebrow">BLOOD COMPONENTS</span><h3>Four partners in transport</h3></div><div className="blood-mini-grid">{Object.entries(bloodData).map(([key, item]) => <button key={key} className={selectedBlood === key ? 'active' : ''} onClick={() => setSelectedBlood(key)}><span style={{ color: item.color }}>{item.symbol}</span><strong>{item.label}</strong><small>{item.what}</small></button>)}</div></div><ErrorBoundary label="Circulation 3D"><Suspense fallback={<div className="simulation-loading" role="status">Loading 3D circulation…</div>}><CirculationDeepDive reducedMotion={reducedMotion} /></Suspense></ErrorBoundary></div>;
}
