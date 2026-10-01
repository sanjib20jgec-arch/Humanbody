import React, { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import ErrorBoundary from '../components/ErrorBoundary.jsx';
import { Icon } from '../components/Icons';
import SimulationControls from '../components/SimulationControls';
import InfoPanel from '../components/InfoPanel';
import Quiz from '../components/Quiz';
import { soundManager } from '../lib/sound';
import ConceptualSourceNote from '../components/ConceptualSourceNote';
const TissueDeepDive = lazy(() => import('../components/tissues/TissueDeepDive.jsx'));

const tissueTypes = {
  epithelial: { name: 'Epithelial tissue', eyebrow: 'BARRIER · COVERING AND LINING', what: 'Sheets of closely packed cells that cover surfaces, line cavities, and form many glands.', how: 'Tight junctions and organized layers create a selective boundary for protection, absorption, secretion, or filtration.', why: 'A controlled boundary separates body compartments and manages exchange with the environment.', accent: '#fb7185', metric: 'barrier integrity' },
  connective: { name: 'Connective tissue', eyebrow: 'MATRIX · SUPPORT AND INTEGRATION', what: 'Cells distributed through an extracellular matrix that supports, binds, cushions, or transports.', how: 'Fibers and ground substance give the tissue properties such as strength, elasticity, storage, or fluid transport.', why: 'A flexible matrix lets the body connect organs and resist or distribute forces.', accent: '#f6c978', metric: 'matrix support' },
  muscle: { name: 'Muscle tissue', eyebrow: 'FORCE · CONTRACTILE CELLS', what: 'Excitable cells that develop tension and shorten to create movement or move substances.', how: 'Signals trigger sliding of contractile proteins inside long fibers or organized muscle cells.', why: 'Controlled force moves the skeleton, blood, and contents of hollow organs.', accent: '#f472b6', metric: 'contractile force' },
  nervous: { name: 'Nervous tissue', eyebrow: 'SIGNAL · RAPID COMMUNICATION', what: 'Neurons and supporting glial cells that receive, process, and transmit information.', how: 'Electrical changes travel along neuronal processes while synapses pass signals to the next cell.', why: 'Fast communication coordinates sensation, movement, and internal regulation.', accent: '#9d9be8', metric: 'signal propagation' }
};

const tissueOrder = Object.keys(tissueTypes);

export default function TissuesLab({ activeView, onViewChange, onComplete, onAsk, reducedMotion }) {
  const [selectedId, setSelectedId] = useState('epithelial');
  const [simulationType, setSimulationType] = useState('epithelial');
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [stimulus, setStimulus] = useState(62);
  const [signalProgress, setSignalProgress] = useState(0);
  const [completedSignals, setCompletedSignals] = useState(0);
  const selected = tissueTypes[selectedId] || tissueTypes.epithelial;

  useEffect(() => {
    if (reducedMotion || !playing) return undefined;
    const timer = window.setInterval(() => {
      setSignalProgress((current) => {
        const next = current + 4 * speed * (0.55 + stimulus / 160);
        if (next >= 100) { setPlaying(false); setCompletedSignals((value) => value + 1); return 100; }
        return next;
      });
    }, 48);
    return () => window.clearInterval(timer);
  }, [playing, speed, stimulus, reducedMotion]);
  useEffect(() => { if (reducedMotion) setPlaying(false); }, [reducedMotion]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (activeView === 'quiz' || event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement || event.target instanceof HTMLSelectElement) return;
      if (event.key === ' ') { event.preventDefault(); setPlaying((value) => !value); }
      if (event.key.toLowerCase() === 'r') reset();
      if (event.key === '+' || event.key === '=') setSpeed((value) => value === 0.5 ? 1 : 2);
      if (event.key === '-') setSpeed((value) => value === 2 ? 1 : 0.5);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeView]);

  const reset = () => { setPlaying(false); setSignalProgress(0); setStimulus(62); setSpeed(1); setSimulationType('epithelial'); setSelectedId('epithelial'); };
  const choose = (id) => { setSelectedId(id); setSimulationType(id); soundManager.playClick(); };
  const chooseSimulation = (id) => { setSimulationType(id); setSelectedId(id); setSignalProgress(0); setPlaying(false); soundManager.playClick(); };

  return <div className="module-layout tissues-layout">
    <div className="module-main">
      <div className="view-switcher"><button className={activeView === 'explore' ? 'active' : ''} onClick={() => onViewChange('explore')}>EXPLORE</button><button className={activeView === 'simulate' ? 'active' : ''} onClick={() => onViewChange('simulate')}>SIMULATE</button><button className={activeView === 'quiz' ? 'active' : ''} onClick={() => onViewChange('quiz')}>QUIZ <span className="tiny-dot" /></button></div>
      {activeView === 'quiz' ? <div className="quiz-view"><div className="view-heading"><span className="eyebrow">KNOWLEDGE CHECK</span><h2>Tissues checkpoint</h2><p>Connect the arrangement of cells and matrix with the work each primary tissue type performs.</p></div><Quiz moduleId="tissues" onComplete={onComplete} onAsk={onAsk} /></div> : activeView === 'simulate' ? <TissueSimulation type={simulationType} chooseType={chooseSimulation} playing={playing} setPlaying={setPlaying} speed={speed} setSpeed={setSpeed} stimulus={stimulus} setStimulus={setStimulus} signalProgress={signalProgress} setSignalProgress={setSignalProgress} completedSignals={completedSignals} reset={reset} /> : <TissueExplore selectedId={selectedId} onSelect={choose} reducedMotion={reducedMotion} />}
    </div>
    {activeView !== 'quiz' && <InfoPanel title={selected.name} eyebrow={selected.eyebrow} accent={selected.accent} what={selected.what} how={selected.how} why={selected.why} />}
  </div>;
}

function TissueExplore({ selectedId, onSelect, reducedMotion }) {
  return <div className="tissue-explore"><div className="view-heading"><span className="eyebrow">EXPLORE · THE TISSUE LEVEL</span><h2>See cells working as a team</h2><p>Select a tissue pattern to connect cell arrangement, extracellular material, and the function the group performs. Simplified educational model, not a microscope image.</p></div><div className="tissue-board"><div className="tissue-grid" /><button className={`tissue-node epithelial-node ${selectedId === 'epithelial' ? 'active' : ''}`} onClick={() => onSelect('epithelial')} aria-label="Select epithelial tissue"><span>{Array.from({ length: 12 }, (_, index) => <i key={index} />)}</span></button><button className={`tissue-node connective-node ${selectedId === 'connective' ? 'active' : ''}`} onClick={() => onSelect('connective')} aria-label="Select connective tissue"><span><i /><i /><i /><i /><i /></span></button><button className={`tissue-node muscle-node ${selectedId === 'muscle' ? 'active' : ''}`} onClick={() => onSelect('muscle')} aria-label="Select muscle tissue"><span>{Array.from({ length: 5 }, (_, index) => <i key={index} />)}</span></button><button className={`tissue-node nervous-node ${selectedId === 'nervous' ? 'active' : ''}`} onClick={() => onSelect('nervous')} aria-label="Select nervous tissue"><span><i /><i /><i /><i /></span></button><span className="tissue-label epithelial-label">EPITHELIAL · PACKED SHEET</span><span className="tissue-label connective-label">CONNECTIVE · MATRIX</span><span className="tissue-label muscle-label">MUSCLE · FIBERS</span><span className="tissue-label nervous-label">NERVOUS · NETWORK</span><div className="tissue-legend"><span><i className="cell-mark" /> specialized cells</span><span><i className="matrix-mark" /> extracellular matrix</span></div></div><ConceptualSourceNote moduleId="tissues" /><ErrorBoundary label="Tissue 3D"><Suspense fallback={<div className="simulation-loading" role="status">Loading 3D tissues…</div>}><TissueDeepDive reducedMotion={reducedMotion} /></Suspense></ErrorBoundary><div className="tissue-principles"><div><span className="eyebrow">ORGANIZE</span><strong>Shape supports function</strong><small>packing, fibers, and branching matter</small></div><div><span className="eyebrow">SPECIALIZE</span><strong>Cells share a job</strong><small>groups coordinate across a tissue</small></div><div><span className="eyebrow">INTEGRATE</span><strong>Tissues build organs</strong><small>organs combine multiple tissue types</small></div></div></div>;
}

function TissueSimulation({ type, chooseType, playing, setPlaying, speed, setSpeed, stimulus, setStimulus, signalProgress, setSignalProgress, completedSignals, reset }) {
  const info = tissueTypes[type];
  const activeCells = Math.min(24, Math.floor((signalProgress / 100) * 25));
  const organization = type === 'epithelial' ? 94 : type === 'connective' ? 72 : type === 'muscle' ? 87 : 64;
  const response = Math.round(stimulus * (type === 'nervous' ? 1 : type === 'muscle' ? .82 : type === 'epithelial' ? .58 : .4));
  return <div className="tissue-simulation"><div className="visual-heading"><div><span className="eyebrow">TISSUE PATTERN ENGINE · CELLULAR ORGANIZATION</span><h2>{info.name} responds</h2><p>Switch the tissue type, apply a stimulus, and watch a teaching signal travel through the cell pattern.</p></div><span className="status-chip"><i className="live-dot" /> {playing ? 'pattern live' : signalProgress >= 100 ? 'signal complete' : 'paused'}</span></div><div className="tissue-type-tabs" aria-label="Choose tissue simulation"><span className="eyebrow">PATTERN</span>{tissueOrder.map((id) => <button key={id} className={type === id ? 'active' : ''} onClick={() => chooseType(id)}>{tissueTypes[id].name.replace(' tissue', '')}</button>)}</div><div className={`tissue-sim-board ${type}`}><div className="sim-tissue-grid" /><TissuePattern type={type} activeCells={activeCells} stimulus={stimulus} /><div className="tissue-sim-readout"><span className="eyebrow">CURRENT RESPONSE</span><strong>{info.metric}</strong><small>{Math.round(signalProgress)}% pattern activated · {completedSignals} completed signals</small></div><div className="stimulus-badge"><span>STIMULUS</span><strong>{stimulus}%</strong></div></div><div className="tissue-metrics"><div><span>ORGANIZATION</span><strong>{organization}<small>%</small></strong></div><div><span>RESPONSE</span><strong>{response}<small>%</small></strong></div><div className="accent"><span>ACTIVE CELLS</span><strong>{activeCells}<small> / 24</small></strong></div><div><span>MODEL SIGNAL</span><strong>{Math.round(signalProgress)}<small>%</small></strong></div></div><label className="tissue-stimulus"><span>Applied stimulus</span><output>{stimulus}%</output><input aria-label="Applied stimulus" type="range" min="0" max="100" value={stimulus} onChange={(event) => { setStimulus(Number(event.target.value)); setSignalProgress(0); setPlaying(false); }} /></label><SimulationControls playing={playing} onToggle={() => setPlaying((value) => !value)} onReset={reset} onStep={() => { setPlaying(false); setSignalProgress((value) => Math.min(100, value + 12.5)); }} speed={speed} onSpeedChange={setSpeed} label="Tissue pattern simulation controls" stepLabel="Advance tissue signal" /><div className="tissue-note"><Icon name="info" size={15} /><span><strong>Simplified educational model:</strong> real tissues contain many cell subtypes, matrix components, mechanical forces, blood vessels, and chemical signals. This pattern highlights organization and function, not a clinical measurement.</span></div></div>;
}

function TissuePattern({ type, activeCells, stimulus }) {
  return <div className={`tissue-pattern ${type}`} aria-label={`${tissueTypes[type].name} live cell pattern`} role="img">{Array.from({ length: 24 }, (_, index) => <i key={index} className={index < activeCells ? 'active' : ''} style={{ '--cell-index': index, '--stimulus': `${stimulus}%` }} />)}{type === 'nervous' && <div className="neural-branches"><i /><i /><i /></div>}{type === 'connective' && <div className="matrix-fibers"><i /><i /><i /><i /></div>}</div>;
}
