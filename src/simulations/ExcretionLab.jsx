import React, { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import ErrorBoundary from '../components/ErrorBoundary.jsx';
const ExcretionDeepDive = lazy(() => import('../components/excretion/ExcretionDeepDive.jsx'));
import { Icon } from '../components/Icons';
import ReferenceObject3D from '../components/ReferenceObject3D';
import SimulationControls from '../components/SimulationControls';
import InfoPanel from '../components/InfoPanel';
import Quiz from '../components/Quiz';
import { soundManager } from '../lib/sound';

const structures = {
  corpuscle: { name: 'Renal corpuscle', eyebrow: 'FILTRATION · BLOOD TO FILTRATE', what: 'The glomerulus and Bowman’s capsule form the nephron’s filtering start point.', how: 'Blood pressure moves water and small solutes through a selective filtration barrier while cells and most proteins remain in the blood.', why: 'Filtration creates the starting fluid that the tubule can then edit into urine.', accent: '#f58b9a' },
  proximal: { name: 'Proximal tubule', eyebrow: 'REABSORPTION · RECOVER THE USEFUL', what: 'The first coiled tubule segment after Bowman’s capsule.', how: 'Transport proteins reclaim much of the filtered water, sodium, glucose, amino acids, and bicarbonate into nearby capillaries.', why: 'Recovering useful molecules prevents the body from losing valuable resources in urine.', accent: '#f5bd68' },
  loop: { name: 'Loop of Henle', eyebrow: 'CONCENTRATION · MEDULLARY GRADIENT', what: 'A hairpin turn with descending and ascending limbs that dips into the kidney medulla.', how: 'The descending limb allows water out, while the ascending limb moves salts out but is largely impermeable to water.', why: 'Its countercurrent arrangement helps the kidney make concentrated urine when water must be conserved.', accent: '#78cbd5' },
  distal: { name: 'Distal tubule', eyebrow: 'FINE TUNING · ION BALANCE', what: 'A later tubule segment where the filtrate is adjusted before the collecting duct.', how: 'Hormone-sensitive transport changes sodium, potassium, calcium, and acid-base handling.', why: 'Small adjustments help maintain stable blood chemistry rather than simply removing waste.', accent: '#aa9bea' },
  collecting: { name: 'Collecting duct', eyebrow: 'FINAL CONTROL · WATER BALANCE', what: 'The final shared channel that carries forming urine toward the renal pelvis.', how: 'ADH increases water permeability by promoting aquaporin channels, allowing more water to return to the blood.', why: 'It determines how dilute or concentrated the final urine becomes.', accent: '#8de8b4' }
};

function getFlowState(phase) {
  if (phase < 0.2) return { label: 'Filtration', detail: 'Blood pressure is producing filtrate', structure: 'corpuscle' };
  if (phase < 0.46) return { label: 'Reabsorption', detail: 'Useful solutes and water return to blood', structure: 'proximal' };
  if (phase < 0.72) return { label: 'Concentration', detail: 'The loop builds a medullary gradient', structure: 'loop' };
  if (phase < 0.88) return { label: 'Fine tuning', detail: 'Ions and pH are adjusted', structure: 'distal' };
  return { label: 'Water balance', detail: 'ADH sets final water recovery', structure: 'collecting' };
}

function getParticlePosition(phase) {
  if (phase < 0.2) return { left: `${22 + phase * 22}%`, top: `${43 - phase * 12}%` };
  if (phase < 0.46) return { left: `${27 + (phase - 0.2) * 87}%`, top: `${42 + Math.sin(phase * 19) * 9}%` };
  if (phase < 0.72) return { left: `${49 + Math.sin((phase - 0.46) * 13) * 9}%`, top: `${54 + (phase - 0.46) * 115}%` };
  if (phase < 0.88) return { left: `${61 + (phase - 0.72) * 110}%`, top: `${72 - (phase - 0.72) * 85}%` };
  return { left: `${79 + (phase - 0.88) * 85}%`, top: `${32 + (phase - 0.88) * 170}%` };
}

export default function ExcretionLab({ activeView, onViewChange, onComplete, onAsk, reducedMotion }) {
  const [selectedId, setSelectedId] = useState('corpuscle');
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [phase, setPhase] = useState(0.08);
  const [filtrateCount, setFiltrateCount] = useState(0);
  const [gfr, setGfr] = useState(125);
  const [adh, setAdh] = useState(55);
  const selected = structures[selectedId] || structures.corpuscle;
  const flow = getFlowState(phase);
  const filteredPerDay = (gfr * 1.44).toFixed(0);
  const recovery = 98.5 + (adh / 100) * 0.9;
  const urinePerDay = (Number(filteredPerDay) * (1 - recovery / 100)).toFixed(1);
  const concentration = (1 + adh / 55).toFixed(1);

  useEffect(() => {
    if (reducedMotion || !playing) return undefined;
    const timer = window.setInterval(() => {
      setPhase((current) => {
        const next = current + 0.012 * speed * (gfr / 125);
        if (next >= 1) { setFiltrateCount((count) => count + 1); return 0; }
        return next;
      });
    }, 40);
    return () => window.clearInterval(timer);
  }, [playing, speed, gfr, reducedMotion]);
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

  const reset = () => { setPlaying(false); setPhase(0.08); setFiltrateCount(0); setGfr(125); setAdh(55); setSelectedId('corpuscle'); };
  const choose = (id) => { setSelectedId(id); soundManager.playClick(); };

  return <div className="module-layout excretion-layout">
    <div className="module-main">
      <div className="view-switcher"><button className={activeView === 'explore' ? 'active' : ''} onClick={() => onViewChange('explore')}>EXPLORE</button><button className={activeView === 'simulate' ? 'active' : ''} onClick={() => onViewChange('simulate')}>SIMULATE</button><button className={activeView === 'quiz' ? 'active' : ''} onClick={() => onViewChange('quiz')}>QUIZ <span className="tiny-dot" /></button></div>
      {activeView === 'quiz' ? <div className="quiz-view"><div className="view-heading"><span className="eyebrow">KNOWLEDGE CHECK</span><h2>Excretion checkpoint</h2><p>Use filtration, recovery, and water balance to explain how a nephron protects homeostasis.</p></div><Quiz moduleId="excretion" onComplete={onComplete} onAsk={onAsk} /></div> : activeView === 'simulate' ? <ExcretionSimulation playing={playing} setPlaying={setPlaying} phase={phase} setPhase={setPhase} filtrateCount={filtrateCount} gfr={gfr} setGfr={setGfr} adh={adh} setAdh={setAdh} speed={speed} setSpeed={setSpeed} reset={reset} filteredPerDay={filteredPerDay} recovery={recovery} urinePerDay={urinePerDay} concentration={concentration} flow={flow} /> : <ExcretionExplore selectedId={selectedId} onSelect={choose} reducedMotion={reducedMotion} />}
    </div>
    {activeView !== 'quiz' && <InfoPanel title={selected.name} eyebrow={selected.eyebrow} accent={selected.accent} what={selected.what} how={selected.how} why={selected.why} />}
  </div>;
}

function ExcretionExplore({ selectedId, onSelect, reducedMotion }) {
  return <div className="excretion-explore"><div className="view-heading"><span className="eyebrow">EXPLORE · KIDNEY ANATOMY</span><h2>Inspect the kidney, then trace the nephron</h2><p>Select a source-derived renal structure for macro-anatomy context. The nephron board below remains a separate simplified process model.</p></div><ReferenceObject3D registryId="kidney-macro" label="Kidneys & urinary structures" systems={['urinary']} source="BodyParts3D 4.0 adult-male reference atlas" sourceUrl="https://dbarchive.biosciencedbc.jp/en/bodyparts3d/desc.html" limitation="The source mesh is macro-anatomy; nephron filtration, reabsorption, secretion, and ADH effects are represented by the separate teaching model." reducedMotion={reducedMotion} /><div className="excretion-board"><div className="renal-grid" /><div className="blood-vessel vessel-one" /><div className="blood-vessel vessel-two" /><button className={`excretion-node node-corpuscle ${selectedId === 'corpuscle' ? 'active' : ''}`} onClick={() => onSelect('corpuscle')} aria-label="Select renal corpuscle"><span className="glomerulus-coil" /><b>01</b></button><button className={`excretion-node node-proximal ${selectedId === 'proximal' ? 'active' : ''}`} onClick={() => onSelect('proximal')} aria-label="Select proximal tubule"><span /><b>02</b></button><button className={`excretion-node node-loop ${selectedId === 'loop' ? 'active' : ''}`} onClick={() => onSelect('loop')} aria-label="Select loop of Henle"><span /><b>03</b></button><button className={`excretion-node node-distal ${selectedId === 'distal' ? 'active' : ''}`} onClick={() => onSelect('distal')} aria-label="Select distal tubule"><span /><b>04</b></button><button className={`excretion-node node-collecting ${selectedId === 'collecting' ? 'active' : ''}`} onClick={() => onSelect('collecting')} aria-label="Select collecting duct"><span /><b>05</b></button><span className="excretion-label label-corpuscle">RENAL CORPUSCLE</span><span className="excretion-label label-proximal">PROXIMAL TUBULE</span><span className="excretion-label label-loop">LOOP OF HENLE</span><span className="excretion-label label-distal">DISTAL TUBULE</span><span className="excretion-label label-collecting">COLLECTING DUCT</span><div className="nephron-legend"><span><i className="filtrate-mark" /> filtrate path</span><span><i className="blood-mark" /> peritubular capillaries</span></div></div><div className="excretion-principles"><div><span className="eyebrow">FILTER</span><strong>Start with small solutes</strong><small>cells and large proteins stay in blood</small></div><div><span className="eyebrow">RECOVER</span><strong>Return what the body needs</strong><small>water, ions, glucose, amino acids</small></div><div><span className="eyebrow">REGULATE</span><strong>Set the final balance</strong><small>water, salts, and acid-base status</small></div></div><ErrorBoundary label="Excretion 3D"><Suspense fallback={<div className="simulation-loading" role="status">Loading 3D excretion…</div>}><ExcretionDeepDive reducedMotion={reducedMotion} /></Suspense></ErrorBoundary></div>;
}

function ExcretionSimulation({ playing, setPlaying, phase, setPhase, filtrateCount, gfr, setGfr, adh, setAdh, speed, setSpeed, reset, filteredPerDay, recovery, urinePerDay, concentration, flow }) {
  const particleStyle = useMemo(() => getParticlePosition(phase), [phase]);
  return <div className="excretion-simulation"><div className="visual-heading"><div><span className="eyebrow">NEPHRON ENGINE · HOMEOSTASIS MODEL</span><h2>{flow.label} in motion</h2><p>Change filtration pressure and ADH to see how the nephron changes final urine output.</p></div><span className="status-chip"><i className="live-dot" /> {playing ? 'nephron live' : 'paused'}</span></div><div className="urine-sim-board"><div className="urine-grid" /><div className="sim-blood-in"><span className="eyebrow">BLOOD IN</span><strong>filtered</strong><i /><i /><i /></div><div className="sim-nephron-path"><span className="sim-corpuscle" /><span className="sim-proximal" /><span className="sim-loop" /><span className="sim-distal" /><span className="sim-collecting" /></div><div className="filtrate-particle" style={particleStyle} aria-hidden="true" /><div className="sim-blood-out"><span className="eyebrow">BLOOD OUT</span><strong>recovered</strong><i /><i /><i /></div><div className="urine-output"><span className="eyebrow">FINAL URINE</span><strong>{urinePerDay}<small> L/day</small></strong><span>{concentration}× concentrated</span></div><div className="flow-readout"><span className="eyebrow">CURRENT PROCESS</span><strong>{flow.label}</strong><small>{flow.detail} · {filtrateCount} complete passes</small></div></div><div className="excretion-metrics"><div><span>GFR</span><strong>{gfr}<small> mL/min</small></strong></div><div><span>FILTRATE / DAY</span><strong>{filteredPerDay}<small> L</small></strong></div><div className="accent"><span>WATER RECOVERY</span><strong>{recovery.toFixed(1)}<small>%</small></strong></div><div><span>FINAL OUTPUT</span><strong>{urinePerDay}<small> L/day</small></strong></div></div><div className="excretion-controls"><label><span>Filtration rate</span><output>{gfr} mL/min</output><input aria-label="Filtration rate" type="range" min="70" max="160" value={gfr} onChange={(event) => setGfr(Number(event.target.value))} /></label><label><span>ADH signal</span><output>{adh}%</output><input aria-label="ADH signal" type="range" min="0" max="100" value={adh} onChange={(event) => setAdh(Number(event.target.value))} /></label></div><SimulationControls playing={playing} onToggle={() => setPlaying((value) => !value)} onReset={reset} onStep={() => { setPlaying(false); setPhase((current) => current + 0.05 >= 1 ? 0 : current + 0.05); }} speed={speed} onSpeedChange={setSpeed} label="Nephron simulation controls" stepLabel="Advance filtrate one step" /><div className="excretion-note"><Icon name="info" size={15} /><span><strong>Simplified educational model:</strong> GFR, reabsorption, ADH, and urine output are shown as relationships, not patient measurements. Real kidney function also depends on blood pressure, solute transport, hormones, and many interacting processes.</span></div></div>;
}
