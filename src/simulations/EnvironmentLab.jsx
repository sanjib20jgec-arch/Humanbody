import React, { Suspense, lazy, useEffect, useState } from 'react';
import ErrorBoundary from '../components/ErrorBoundary.jsx';
const EnvironmentDeepDive = lazy(() => import('../components/environment/EnvironmentDeepDive.jsx'));
import SimulationControls from '../components/SimulationControls';
import InfoPanel from '../components/InfoPanel';
import Quiz from '../components/Quiz';
import { soundManager } from '../lib/sound';
import ConceptualSourceNote from '../components/ConceptualSourceNote';
import './bay-extra.css';

const structures = {
  producers: { name: 'Producers', eyebrow: 'LEVEL 1 · GREEN PLANTS', what: 'Green plants make food by photosynthesis and form the base of every food chain.', how: 'They capture only about 1% of the sunlight energy that falls on their leaves.', why: 'All other organisms depend on the energy fixed by producers.', accent: '#22c55e' },
  consumers: { name: 'Consumers', eyebrow: 'LEVELS 2–4 · ANIMALS', what: 'Herbivores eat plants; carnivores eat other animals.', how: 'About 10% of the energy at one level reaches the next; the rest is used or lost as heat.', why: 'This is why food chains rarely have more than four or five levels.', accent: '#f97316' },
  decomposers: { name: 'Decomposers', eyebrow: 'RECYCLERS · BACTERIA AND FUNGI', what: 'Decomposers break down dead organisms and wastes.', how: 'They return nutrients to the soil and water for producers to reuse.', why: 'Nutrients cycle, but energy flows only one way.', accent: '#a16207' }
};

const LEVELS = ['Producers', 'Primary consumers', 'Secondary consumers', 'Tertiary consumers'];

export function energyAtLevels(sunlight, transfer = 0.1, capture = 0.01) {
  const out = [sunlight * capture];
  for (let i = 1; i < LEVELS.length; i++) out.push(out[i - 1] * transfer);
  return out;
}

export default function EnvironmentLab({ activeView, onViewChange, onComplete, onAsk, reducedMotion }) {
  const [selectedId, setSelectedId] = useState('consumers');
  const [sunlight, setSunlight] = useState(1000000);
  const [transfer, setTransfer] = useState(10);
  const [revealIndex, setRevealIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const selected = structures[selectedId] || structures.consumers;
  const energy = energyAtLevels(sunlight, transfer / 100);

  useEffect(() => {
    if (reducedMotion || !playing) return undefined;
    const timer = window.setInterval(() => setRevealIndex((i) => { if (i >= LEVELS.length - 1) { setPlaying(false); return i; } return i + 1; }), Math.max(200, 900 / speed));
    return () => window.clearInterval(timer);
  }, [playing, speed, reducedMotion]);
  useEffect(() => { if (reducedMotion) setPlaying(false); }, [reducedMotion]);

  const reset = () => { setPlaying(false); setRevealIndex(0); setSunlight(1000000); setTransfer(10); setSpeed(1); };
  const choose = (id) => { setSelectedId(id); soundManager.playClick(); };
  const fmt = (v) => (v >= 1 ? Math.round(v).toLocaleString('en-IN') : v.toFixed(2));

  return <div className="module-layout environment-layout">
    <div className="module-main">
      <div className="view-switcher"><button className={activeView === 'explore' ? 'active' : ''} onClick={() => onViewChange('explore')}>EXPLORE</button><button className={activeView === 'simulate' ? 'active' : ''} onClick={() => onViewChange('simulate')}>SIMULATE</button><button className={activeView === 'quiz' ? 'active' : ''} onClick={() => onViewChange('quiz')}>QUIZ</button></div>
      {activeView === 'quiz' ? <div className="quiz-view"><div className="view-heading"><span className="eyebrow">KNOWLEDGE CHECK</span><h2>Environment checkpoint</h2><p>Use food chains, energy flow and conservation ideas.</p></div><Quiz moduleId="environment" onComplete={onComplete} onAsk={onAsk} /></div>
        : activeView === 'simulate' ? <div className="bay-sim"><div className="visual-heading"><div><span className="eyebrow">ENERGY FLOW ENGINE · 10 PER CENT LAW</span><h2>Follow energy up a food chain</h2><p>Set the sunlight and transfer efficiency, then reveal each trophic level.</p></div><span className="status-chip"><i className="live-dot" /> level {revealIndex + 1} / {LEVELS.length}</span></div>
          <div className="parent-selectors"><label><span>Sunlight on leaves (kJ)</span><select value={sunlight} onChange={(e) => { setSunlight(Number(e.target.value)); setRevealIndex(0); }}><option value={100000}>100,000</option><option value={1000000}>1,000,000</option><option value={10000000}>10,000,000</option></select></label><label><span>Transfer efficiency: {transfer}%</span><input type="range" min="5" max="20" value={transfer} onChange={(e) => setTransfer(Number(e.target.value))} /></label></div>
          <div className="energy-pyramid">{LEVELS.map((name, i) => <div key={name} className={`energy-step ${i <= revealIndex ? 'revealed' : ''}`} style={{ '--w': `${100 - i * 22}%` }}><strong>{name}</strong><span>{i <= revealIndex ? `${fmt(energy[i])} kJ` : '?'}</span></div>).reverse()}</div>
          <SimulationControls playing={playing} onToggle={() => setPlaying((v) => !v)} onReset={reset} onStep={() => { setPlaying(false); setRevealIndex((i) => Math.min(LEVELS.length - 1, i + 1)); }} speed={speed} onSpeedChange={setSpeed} label="Energy flow simulation controls" stepLabel="Reveal next trophic level" />
          <p className="heredity-note"><span><strong>Model:</strong> producers fix about 1% of sunlight (NCERT Class 10); about 10% passes to each next level (Lindeman, 1942). Real efficiencies range roughly 5–20%.</span></p></div>
        : <EnvironmentExplore selectedId={selectedId} onSelect={choose} reducedMotion={reducedMotion} />}
    </div>
    {activeView !== 'quiz' && <InfoPanel title={selected.name} eyebrow={selected.eyebrow} accent={selected.accent} what={selected.what} how={selected.how} why={selected.why} />}
  </div>;
}

function EnvironmentExplore({ selectedId, onSelect, reducedMotion }) {
  return <div className="environment-explore"><div className="view-heading"><span className="eyebrow">EXPLORE · ECOSYSTEMS</span><h2>Who eats whom, and where the energy goes</h2><p>Select a role, then open the 3D deep dive below.</p></div><div className="bay-concepts">{Object.entries(structures).map(([id, s]) => <button key={id} className={selectedId === id ? 'active' : ''} aria-pressed={selectedId === id} onClick={() => onSelect(id)} style={{ '--accent': s.accent }}><strong>{s.name}</strong><small>{s.what}</small></button>)}</div><ConceptualSourceNote moduleId="environment" /><ErrorBoundary label="Environment 3D"><Suspense fallback={<div className="simulation-loading" role="status">Loading 3D environment…</div>}><EnvironmentDeepDive reducedMotion={reducedMotion} /></Suspense></ErrorBoundary></div>;
}
