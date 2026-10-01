import React, { Suspense, lazy, useEffect, useRef, useState } from 'react';
import ErrorBoundary from '../components/ErrorBoundary.jsx';
const RespirationDeepDive = lazy(() => import('../components/respiration/RespirationDeepDive.jsx'));
import { Icon } from '../components/Icons';
import ReferenceObject3D from '../components/ReferenceObject3D';
import SimulationControls from '../components/SimulationControls';
import InfoPanel from '../components/InfoPanel';
import Quiz from '../components/Quiz';
import { soundManager } from '../lib/sound';
import { ventilationStateAt, VENTILATION_DISCLOSURE } from '../lib/VentilationModel';
import { gasExchangeAt } from '../lib/GasExchangeModel.js';

const structures = {
  nasal: { name: 'Nasal cavity', eyebrow: 'AIRWAY · CONDITIONING', what: 'The entry passage where inhaled air is filtered, warmed, and humidified.', how: 'Mucus and cilia trap particles while the rich blood supply transfers heat.', why: 'Conditioned air protects delicate lower airways and supports efficient gas exchange.', accent: '#f6c978' },
  trachea: { name: 'Trachea', eyebrow: 'AIRWAY · CONDUCTING ZONE', what: 'The windpipe connecting the larynx to the two main bronchi.', how: 'Cartilage rings keep the airway open while ciliated epithelium moves mucus upward.', why: 'A clear conducting path is needed before air can reach the gas-exchange surface.', accent: '#79c8d6' },
  bronchi: { name: 'Bronchi', eyebrow: 'AIRWAY · BRANCHING TREE', what: 'The right and left branches that carry air into each lung.', how: 'Repeated branching distributes air through smaller bronchioles. The right main bronchus is wider, shorter, and more vertical than the left.', why: 'Branching increases the reach of the airway without requiring a single large tube — and because of its straighter course, inhaled foreign bodies lodge in the right bronchus more often.', accent: '#7bb8db' },
  alveoli: { name: 'Alveoli', eyebrow: 'GAS EXCHANGE · DIFFUSION SURFACE', what: 'Tiny air sacs surrounded by capillaries where oxygen and carbon dioxide exchange.', how: 'A thin moist barrier and a steep concentration gradient allow gases to diffuse.', why: 'This is where ventilation becomes oxygen delivery to the blood.', accent: '#f18b9a' },
  diaphragm: { name: 'Diaphragm', eyebrow: 'VENTILATION · PRESSURE PUMP', what: 'A dome-shaped muscle below the lungs that changes thoracic volume.', how: 'Contraction flattens it and lowers pressure so air moves inward; relaxation reverses the movement.', why: 'Breathing depends on pressure differences, not the lungs pulling air in by themselves.', accent: '#d8ae72' }
};

export default function RespirationLab({ activeView, onViewChange, onComplete, onAsk, reducedMotion }) {
  const [selectedId, setSelectedId] = useState('alveoli');
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [phase, setPhase] = useState(0.12);
  const [breathCount, setBreathCount] = useState(0);
  const [rate, setRate] = useState(12);
  const [depth, setDepth] = useState(500);
  const selected = structures[selectedId] || structures.alveoli;
  const inhaling = phase < 0.5;
  const breathShape = Math.sin(Math.PI * phase);
  const minuteVentilation = (rate * depth / 1000).toFixed(1);

  useEffect(() => {
    if (reducedMotion || !playing) return undefined;
    const timer = window.setInterval(() => {
      setPhase((current) => {
        // R3: phase advance derived from the labeled rate (breaths/min) so the
        // visible breathing frequency matches the slider (0.04 s tick).
        const next = current + (rate / 60) * 0.04 * speed;
        if (next >= 1) { setBreathCount((count) => count + 1); return 0; }
        return next;
      });
    }, 40);
    return () => window.clearInterval(timer);
  }, [playing, speed, rate, reducedMotion]);
  useEffect(() => { if (reducedMotion) setPlaying(false); }, [reducedMotion]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (activeView === 'quiz' || event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
      if (event.key === ' ') { event.preventDefault(); setPlaying((value) => !value); }
      if (event.key.toLowerCase() === 'r') reset();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeView]);

  const choose = (id) => { setSelectedId(id); soundManager.playClick(); };
  const reset = () => { setPlaying(false); setPhase(0.12); setBreathCount(0); setRate(12); setDepth(500); setSelectedId('alveoli'); };

  return <div className="module-layout respiration-layout">
    <div className="module-main">
      <div className="view-switcher"><button className={activeView === 'explore' ? 'active' : ''} onClick={() => onViewChange('explore')}>EXPLORE</button><button className={activeView === 'simulate' ? 'active' : ''} onClick={() => onViewChange('simulate')}>SIMULATE</button><button className={activeView === 'quiz' ? 'active' : ''} onClick={() => onViewChange('quiz')}>QUIZ <span className="tiny-dot" /></button></div>
      {activeView === 'quiz' ? <div className="quiz-view"><div className="view-heading"><span className="eyebrow">KNOWLEDGE CHECK</span><h2>Respiration checkpoint</h2><p>Use the airway and pressure model to connect ventilation with gas exchange.</p></div><Quiz moduleId="respiration" onComplete={onComplete} onAsk={onAsk} /></div> : activeView === 'simulate' ? <BreathingSimulation playing={playing} setPlaying={setPlaying} phase={phase} breathCount={breathCount} rate={rate} setRate={setRate} depth={depth} setDepth={setDepth} speed={speed} setSpeed={setSpeed} reset={reset} setPhase={setPhase} minuteVentilation={minuteVentilation} inhaling={inhaling} breathShape={breathShape} /> : <RespirationExplore selectedId={selectedId} onSelect={choose} reducedMotion={reducedMotion} />}
    </div>
    {activeView !== 'quiz' && <InfoPanel title={selected.name} eyebrow={selected.eyebrow} accent={selected.accent} what={selected.what} how={selected.how} why={selected.why} />}
  </div>;
}

function RespirationExplore({ selectedId, onSelect, reducedMotion }) {
  return <div className="respiration-explore"><div className="view-heading"><span className="eyebrow">EXPLORE · RESPIRATORY SYSTEM</span><h2>Inspect the airways, then follow a breath</h2><p>Select a source-derived airway or pulmonary structure. The alveoli exchange and pressure layers remain clearly labelled teaching models.</p></div><ReferenceObject3D registryId="respiratory-macro" label="Airways & pulmonary structures" systems={['respiratory']} source="BodyParts3D 4.0 adult-male reference atlas" sourceUrl="https://dbarchive.biosciencedbc.jp/en/bodyparts3d/desc.html" limitation="The atlas contains airway and pulmonary-vessel structures but no lung-parenchyma mesh; alveoli and gas exchange are represented separately as a focused teaching model." reducedMotion={reducedMotion} /><div className="respiration-board"><div className="respiration-grid" /><div className="air-path air-path-one" /><div className="air-path air-path-two" /><button className={`resp-structure resp-nasal ${selectedId === 'nasal' ? 'active' : ''}`} onClick={() => onSelect('nasal')} aria-label="Select nasal cavity"><span /></button><button className={`resp-structure resp-trachea ${selectedId === 'trachea' ? 'active' : ''}`} onClick={() => onSelect('trachea')} aria-label="Select trachea"><span /></button><button className={`resp-structure resp-bronchi ${selectedId === 'bronchi' ? 'active' : ''}`} onClick={() => onSelect('bronchi')} aria-label="Select bronchi"><span /></button><button className={`resp-structure resp-lung resp-lung-left ${selectedId === 'alveoli' ? 'active' : ''}`} onClick={() => onSelect('alveoli')} aria-label="Select left lung and alveoli"><span className="lung-core" /><i /><i /><i /></button><button className={`resp-structure resp-lung resp-lung-right ${selectedId === 'alveoli' ? 'active' : ''}`} onClick={() => onSelect('alveoli')} aria-label="Select right lung and alveoli"><span className="lung-core" /><i /><i /><i /></button><button className={`resp-structure resp-diaphragm ${selectedId === 'diaphragm' ? 'active' : ''}`} onClick={() => onSelect('diaphragm')} aria-label="Select diaphragm"><span /></button><span className="resp-label label-nasal">NASAL CAVITY</span><span className="resp-label label-trachea">TRACHEA</span><span className="resp-label label-bronchi">BRONCHI</span><span className="resp-label label-alveoli">ALVEOLI + CAPILLARIES</span><span className="resp-label label-diaphragm">DIAPHRAGM</span><div className="resp-legend"><span><i className="oxygen-mark" /> oxygen-rich blood</span><span><i className="air-mark" /> inspired air</span></div></div><div className="resp-principles"><div><span className="eyebrow">VENTILATION</span><strong>Move air in and out</strong><small>pressure changes drive flow</small></div><div><span className="eyebrow">DIFFUSION</span><strong>Exchange gases</strong><small>thin alveolar-capillary barrier</small></div><div><span className="eyebrow">TRANSPORT</span><strong>Carry oxygen</strong><small>blood distributes O₂ to cells</small></div></div><ErrorBoundary label="Respiration 3D"><Suspense fallback={<div className="simulation-loading" role="status">Loading 3D respiration…</div>}><RespirationDeepDive reducedMotion={reducedMotion} /></Suspense></ErrorBoundary></div>;
}

// Phase 50: deterministic pressure trace drawn from the ventilation model.
function VentilationPressureTrace({ phase, rate, depth }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, rect.width * dpr);
    canvas.height = Math.max(1, rect.height * dpr);
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const width = rect.width; const height = rect.height;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#0d1722'; ctx.fillRect(0, 0, width, height);
    // R7 (G3): each trace on its own honest cmH2O ruler — alveolar −2..+2 on
    // the left, intrapleural −8..−2 on the right; no shared-offset fudging.
    const left = 34; const right = width - 34; const top = 8; const bottom = height - 8;
    ctx.font = '9px system-ui, sans-serif';
    for (let row = 0; row <= 4; row += 1) {
      const t = row / 4;
      const y = top + (bottom - top) * t;
      ctx.strokeStyle = 'rgba(174,205,220,.12)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(left, y); ctx.lineTo(right, y); ctx.stroke();
      ctx.fillStyle = '#7fb6d9'; ctx.textAlign = 'right';
      ctx.fillText((2 - 4 * t).toFixed(0), left - 5, y + 3);
      ctx.fillStyle = '#c4a6e8'; ctx.textAlign = 'left';
      ctx.fillText((-2 - 6 * t).toFixed(0), right + 5, y + 3);
    }
    ctx.textAlign = 'center';
    const plot = (key, min, max) => {
      ctx.strokeStyle = key === 'alveolarPressure' ? '#38bdf8' : '#a78bfa';
      ctx.lineWidth = 1.6; ctx.beginPath();
      for (let i = 0; i <= 100; i += 1) {
        const sample = ventilationStateAt(i / 100, rate, depth);
        const x = left + (i / 100) * (right - left);
        const norm = (sample[key] - min) / (max - min);
        const y = bottom - norm * (bottom - top);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    };
    plot('alveolarPressure', -2, 2);
    plot('intrapleuralPressure', -8, -2);
    const cursor = left + (((phase % 1) + 1) % 1) * (right - left);
    ctx.strokeStyle = 'rgba(141,245,237,.85)'; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(cursor, top); ctx.lineTo(cursor, bottom); ctx.stroke(); ctx.setLineDash([]);
  }, [phase, rate, depth]);
  return <div className="wiggers-block"><canvas ref={canvasRef} className="wiggers-canvas ventilation-trace" aria-label="Ventilation pressure trace with calibrated cmH2O rulers" /><ul className="chart-legend" aria-label="Ventilation trace legend"><li><i style={{ background: '#38bdf8' }} />alveolar pressure (left ruler, cmH₂O)</li><li><i style={{ background: '#a78bfa' }} />intrapleural pressure (right ruler, cmH₂O)</li></ul></div>;
}

function BreathingSimulation({ playing, setPlaying, phase, breathCount, rate, setRate, depth, setDepth, speed, setSpeed, reset, setPhase, minuteVentilation, inhaling, breathShape }) {
  // R3: gas exchange driven by ALVEOLAR ventilation (minute ventilation minus
  // anatomical dead space) so rapid shallow breathing reads as hypoventilation.
  // See GasExchangeModel.js; values are teaching steady-state, not ABG.
  const gas = gasExchangeAt(rate, depth);
  const alveolarVentilation = gas.alveolarVentilation;
  const pACO2 = Math.round(gas.paco2);
  const pAO2 = Math.round(gas.pao2);
  const oxygenLevel = Math.round(gas.saturation);
  const ventState = ventilationStateAt(phase, rate, depth);
  return <div className="breathing-simulation"><div className="visual-heading"><div><span className="eyebrow">VENTILATION ENGINE · PRESSURE MODEL</span><h2>{inhaling ? 'Inspiration' : 'Expiration'} in motion</h2></div><span className="status-chip"><i className="live-dot" /> {playing ? 'breathing live' : 'paused'}</span></div><div className="breathing-board"><div className="breathing-grid" /><div className="breath-air-flow"><i /><i /><i /><i /><i /></div><div className="sim-lungs" style={{ '--breath-scale': 0.86 + breathShape * 0.14 }}><div className="sim-lung left" /><div className="sim-lung right" /><div className="sim-trachea" /></div><div className={`sim-diaphragm ${inhaling ? 'contracted' : ''}`} style={{ '--diaphragm-shift': `${breathShape * 18}px` }} /><div className="breath-phase-readout"><span className="eyebrow">CURRENT PHASE</span><strong>{inhaling ? 'Air moving inward' : 'Air moving outward'}</strong><small>{Math.round(phase * 100)}% of cycle · {breathCount} completed breaths · {ventState.label}</small></div></div><div className="breath-metrics"><div><span>RESPIRATORY RATE</span><strong>{rate}<small> breaths/min</small></strong></div><div><span>TIDAL VOLUME</span><strong>{depth}<small> mL</small></strong></div><div className="accent"><span>MINUTE VENTILATION</span><strong>{minuteVentilation}<small> L/min</small></strong></div><div><span>ALVEOLAR VENTILATION</span><strong>{alveolarVentilation.toFixed(1)}<small> L/min</small></strong></div><div><span>MODEL O₂ SATURATION</span><strong>{oxygenLevel}<small>%</small></strong></div><div><span>ALVEOLAR PRESSURE</span><strong>{ventState.alveolarPressure}<small> cmH₂O</small></strong></div><div><span>INTRAPLEURAL PRESSURE</span><strong>{ventState.intrapleuralPressure}<small> cmH₂O</small></strong></div><div><span>MODEL PAO₂</span><strong>{pAO2}<small> mmHg</small></strong></div><div><span>MODEL PACO₂</span><strong>{pACO2}<small> mmHg</small></strong></div></div><div className="cardio-graph-card"><div className="graph-card-heading"><span className="eyebrow">VENTILATION PRESSURES · TEACHING TRACE</span><strong>{inhaling ? 'inspiration' : 'expiration'}</strong></div><VentilationPressureTrace phase={phase} rate={rate} depth={depth} /></div><div className="breath-controls"><label><span>Breathing rate</span><output>{rate} breaths/min</output><input aria-label="Breathing rate" type="range" min="6" max="24" value={rate} onChange={(event) => setRate(Number(event.target.value))} /></label><label><span>Tidal volume</span><output>{depth} mL</output><input aria-label="Tidal volume" type="range" min="250" max="800" step="10" value={depth} onChange={(event) => setDepth(Number(event.target.value))} /></label></div><SimulationControls playing={playing} onToggle={() => setPlaying((value) => !value)} onReset={reset} onStep={() => { setPlaying(false); setPhase((current) => current + 0.05 >= 1 ? 0 : current + 0.05); }} speed={speed} onSpeedChange={setSpeed} label="Breathing simulation controls" stepLabel="Pause breathing cycle" /><div className="respiration-note"><Icon name="info" size={15} /><span><strong>Simplified educational model:</strong> minute ventilation is respiratory rate multiplied by tidal volume. Real gas exchange also depends on dead space, perfusion, membrane properties, and metabolic demand. {VENTILATION_DISCLOSURE} PAO₂/PACO₂ derive from alveolar ventilation (minute ventilation minus ~150 mL dead space) via the alveolar gas equation — teaching values, not blood-gas measurements.</span></div></div>;
}
