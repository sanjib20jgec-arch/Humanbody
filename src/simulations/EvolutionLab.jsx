import React, { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import ErrorBoundary from '../components/ErrorBoundary.jsx';
const EvolutionDeepDive = lazy(() => import('../components/evolution/EvolutionDeepDive.jsx'));
import SimulationControls from '../components/SimulationControls';
import InfoPanel from '../components/InfoPanel';
import Quiz from '../components/Quiz';
import { soundManager } from '../lib/sound';
import ConceptualSourceNote from '../components/ConceptualSourceNote';
import './bay-extra.css';

const structures = {
  variation: { name: 'Variation', eyebrow: 'RAW MATERIAL · INHERITED DIFFERENCES', what: 'Individuals in a population differ, and some of those differences are inherited.', how: 'New variation arises from mutation and from the reshuffling of genes in sexual reproduction.', why: 'Without inherited variation, selection has nothing to act on.', accent: '#e2e8f0' },
  selection: { name: 'Natural selection', eyebrow: 'MECHANISM · DIFFERENTIAL SURVIVAL', what: 'Individuals whose traits suit the environment survive and reproduce more.', how: 'A predator, climate or disease removes some variants more often than others.', why: 'Over generations the better-suited variant becomes more common in the population.', accent: '#f97316' },
  evidence: { name: 'Evidence', eyebrow: 'SUPPORT · FOSSILS AND HOMOLOGY', what: 'Fossils, homologous organs and DNA comparisons all point to common ancestry.', how: 'Homologous limbs share a bone plan; fossils such as Archaeopteryx show intermediate features.', why: 'Independent lines of evidence agreeing make the theory robust.', accent: '#22c55e' }
};

// Survival per generation of each moth morph on clean or sooty bark (teaching values, not field data).
const SURVIVAL = { clean: { dark: 0.55, pale: 0.85 }, soot: { dark: 0.85, pale: 0.55 } };
const START = 0.1;

export function nextFrequency(p, bark) {
  const s = SURVIVAL[bark];
  const dark = p * s.dark; const pale = (1 - p) * s.pale;
  return dark / (dark + pale);
}

export default function EvolutionLab({ activeView, onViewChange, onComplete, onAsk, reducedMotion }) {
  const [selectedId, setSelectedId] = useState('selection');
  const [bark, setBark] = useState('soot');
  const [history, setHistory] = useState([START]);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const selected = structures[selectedId] || structures.selection;
  const p = history[history.length - 1];

  const step = () => setHistory((h) => (h.length >= 40 ? h : [...h, nextFrequency(h[h.length - 1], bark)]));
  useEffect(() => {
    if (reducedMotion || !playing) return undefined;
    const timer = window.setInterval(() => setHistory((h) => { if (h.length >= 40) { setPlaying(false); return h; } return [...h, nextFrequency(h[h.length - 1], bark)]; }), Math.max(120, 500 / speed));
    return () => window.clearInterval(timer);
  }, [playing, speed, bark, reducedMotion]);
  useEffect(() => { if (reducedMotion) setPlaying(false); }, [reducedMotion]);

  const reset = () => { setPlaying(false); setHistory([START]); setBark('soot'); setSpeed(1); };
  const choose = (id) => { setSelectedId(id); soundManager.playClick(); };
  const moths = useMemo(() => Array.from({ length: 100 }, (_, i) => i < Math.round(p * 100)), [p]);
  const points = history.map((v, i) => `${(i / 39) * 300},${100 - v * 100}`).join(' ');

  return <div className="module-layout evolution-layout">
    <div className="module-main">
      <div className="view-switcher"><button className={activeView === 'explore' ? 'active' : ''} onClick={() => onViewChange('explore')}>EXPLORE</button><button className={activeView === 'simulate' ? 'active' : ''} onClick={() => onViewChange('simulate')}>SIMULATE</button><button className={activeView === 'quiz' ? 'active' : ''} onClick={() => onViewChange('quiz')}>QUIZ</button></div>
      {activeView === 'quiz' ? <div className="quiz-view"><div className="view-heading"><span className="eyebrow">KNOWLEDGE CHECK</span><h2>Evolution checkpoint</h2><p>Use variation, selection and evidence to explain how populations change.</p></div><Quiz moduleId="evolution" onComplete={onComplete} onAsk={onAsk} /></div>
        : activeView === 'simulate' ? <div className="bay-sim"><div className="visual-heading"><div><span className="eyebrow">NATURAL SELECTION ENGINE · PEPPERED MOTH MODEL</span><h2>Change the bark, watch the population</h2><p>Each step is one generation. Birds eat more of the moths that stand out against the bark.</p></div><span className="status-chip"><i className="live-dot" /> generation {history.length - 1}</span></div>
          <div className="cross-presets" role="group" aria-label="Bark colour"><span className="eyebrow">BARK</span><button className={bark === 'clean' ? 'active' : ''} aria-pressed={bark === 'clean'} onClick={() => setBark('clean')}>Clean, pale bark</button><button className={bark === 'soot' ? 'active' : ''} aria-pressed={bark === 'soot'} onClick={() => setBark('soot')}>Sooty, dark bark</button></div>
          <div className="bay-sim-grid"><div className={`moth-field ${bark}`} aria-label={`${Math.round(p * 100)} dark moths out of 100`}>{moths.map((dark, i) => <i key={i} className={dark ? 'dark' : 'pale'} />)}</div>
            <svg className="bay-chart" viewBox="-30 -10 340 130" role="img" aria-label="Dark moth percentage over generations"><line x1="0" y1="100" x2="300" y2="100" /><line x1="0" y1="0" x2="0" y2="100" /><text x="-26" y="4">100%</text><text x="-20" y="104">0%</text><text x="240" y="118">generations</text><polyline points={points} /></svg></div>
          <div className="genotype-metrics"><div><span>DARK MOTHS</span><strong>{Math.round(p * 100)}<small>%</small></strong><i style={{ '--metric': `${p * 100}%` }} /></div><div><span>PALE MOTHS</span><strong>{Math.round((1 - p) * 100)}<small>%</small></strong><i style={{ '--metric': `${(1 - p) * 100}%` }} /></div></div>
          <SimulationControls playing={playing} onToggle={() => setPlaying((v) => !v)} onReset={reset} onStep={() => { setPlaying(false); step(); }} speed={speed} onSpeedChange={setSpeed} label="Natural selection simulation controls" stepLabel="Advance one generation" />
          <p className="heredity-note"><span><strong>Simplified model:</strong> survival values are illustrative. Field studies (Cook et al., 2012) confirm bird predation favours the better-camouflaged morph, but real rates vary by place and year.</span></p></div>
        : <EvolutionExplore selectedId={selectedId} onSelect={choose} reducedMotion={reducedMotion} />}
    </div>
    {activeView !== 'quiz' && <InfoPanel title={selected.name} eyebrow={selected.eyebrow} accent={selected.accent} what={selected.what} how={selected.how} why={selected.why} />}
  </div>;
}

function EvolutionExplore({ selectedId, onSelect, reducedMotion }) {
  return <div className="evolution-explore"><div className="view-heading"><span className="eyebrow">EXPLORE · CHANGE OVER GENERATIONS</span><h2>How populations evolve</h2><p>Select a concept, then open the 3D deep dive below.</p></div><div className="bay-concepts">{Object.entries(structures).map(([id, s]) => <button key={id} className={selectedId === id ? 'active' : ''} aria-pressed={selectedId === id} onClick={() => onSelect(id)} style={{ '--accent': s.accent }}><strong>{s.name}</strong><small>{s.what}</small></button>)}</div><ConceptualSourceNote moduleId="evolution" /><ErrorBoundary label="Evolution 3D"><Suspense fallback={<div className="simulation-loading" role="status">Loading 3D evolution…</div>}><EvolutionDeepDive reducedMotion={reducedMotion} /></Suspense></ErrorBoundary></div>;
}
