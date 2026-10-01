import React, { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import ErrorBoundary from '../components/ErrorBoundary.jsx';
const DigestionDeepDive = lazy(() => import('../components/digestion/DigestionDeepDive.jsx'));
import { digestionStages, enzymeData } from '../data/modules';
import { Icon } from '../components/Icons';
import ReferenceObject3D from '../components/ReferenceObject3D';
import SimulationControls from '../components/SimulationControls';
import InfoPanel from '../components/InfoPanel';
import Quiz from '../components/Quiz';
import GuidedTour from '../components/GuidedTour';
import { soundManager } from '../lib/sound';
import { EnzymeKineticsEngine, ENZYME_PROFILES } from '../lib/EnzymeKineticsEngine';
import { TEACHING_OVERLAY_SPEC } from '../data/teachingOverlaySpec';
import { describeDigestiveStage } from '../lib/DigestiveStageMachine';

const digestiveStructureStates = [
  { match: 'mouth', name: 'Mouth', category: 'ALIMENTARY CANAL', stage: 0, role: 'Mechanical breakdown and salivary amylase start the pathway.' },
  { match: 'esophagus', name: 'Esophagus', category: 'ALIMENTARY CANAL', stage: 1, role: 'Peristalsis moves the bolus toward the stomach; no new enzyme is added here.' },
  { match: 'stomach', name: 'Stomach', category: 'ALIMENTARY CANAL', stage: 2, role: 'Acid and pepsin begin protein digestion in a strongly acidic compartment.' },
  { match: 'small intestine', name: 'Small intestine', category: 'ALIMENTARY CANAL', stage: 3, role: 'Most chemical digestion and nutrient absorption occur across the intestinal surface.' },
  { match: 'large intestine', name: 'Large intestine', category: 'ALIMENTARY CANAL', stage: 4, role: 'Water and selected ions are recovered as the remaining material moves onward.' },
  { match: 'liver', name: 'Liver', category: 'ACCESSORY ORGAN', stage: 3, role: 'Produces bile that helps emulsify fats in the small intestine; food does not pass through it.' },
  { match: 'pancreas', name: 'Pancreas', category: 'ACCESSORY ORGAN', stage: 3, role: 'Releases digestive enzymes and bicarbonate into the small intestine.' },
  { match: 'gallbladder', name: 'Gallbladder', category: 'ACCESSORY ORGAN', stage: 3, role: 'Stores and concentrates bile before it is released into the small intestine.' }
];
const defaultDigestiveStructure = digestiveStructureStates[0];
const digestivePathStages = digestiveStructureStates.slice(0, 5);
const digestiveTeachingStages = [
  { id: 'mouth', color: 0xfbbf24, queries: ['tongue', 'esophagus'], focusQueries: ['esophagus'], routeOffset: [0, 0.024, 0] },
  { id: 'esophagus', color: 0xf59e0b, queries: ['esophagus', 'stomach'], focusQueries: ['esophagus'], routeOffset: [0, 0.024, 0] },
  { id: 'stomach', color: 0xf97316, queries: ['stomach', 'duodenum'], focusQueries: ['stomach'], routeOffset: [0, 0.024, 0] },
  { id: 'small-intestine', color: 0x34d399, queries: ['duodenum', 'jejunum', 'ileum'], focusQueries: ['duodenum'], routeOffset: [0, 0.024, 0] },
  { id: 'large-intestine', color: 0x38bdf8, queries: ['colon', 'rectum'], focusQueries: ['colon'], routeOffset: [0, 0.024, 0] }
];

export default function DigestiveLab({ activeView, onViewChange, onComplete, onAsk, reducedMotion }) {
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [foodProgress, setFoodProgress] = useState(0);
  const [enzymeKey, setEnzymeKey] = useState('carbohydrate');
  const [selectedStage, setSelectedStage] = useState(0);
  const [selectedStructure, setSelectedStructure] = useState(defaultDigestiveStructure);
  const lastTick = useRef(0);
  const stageIndex = Math.min(digestionStages.length - 1, Math.floor(foodProgress / 25));
  const activeStage = digestionStages[selectedStage] || digestionStages[0];

  useEffect(() => {
    if (reducedMotion || !playing) return undefined;
    const timer = window.setInterval(() => {
      setFoodProgress((value) => {
        if (value >= 100) { setPlaying(false); soundManager.playComplete(); return 100; }
        return Math.min(100, value + speed * 0.85);
      });
    }, 80);
    return () => window.clearInterval(timer);
  }, [playing, speed, reducedMotion]);
  useEffect(() => { if (reducedMotion) setPlaying(false); }, [reducedMotion]);

  useEffect(() => {
    const nextIndex = Math.min(digestionStages.length - 1, Math.floor(foodProgress / 25));
    if (nextIndex !== selectedStage) { setSelectedStage(nextIndex); soundManager.playClick(); }
    setSelectedStructure(digestivePathStages[nextIndex] || defaultDigestiveStructure);
  }, [foodProgress, selectedStage]);

  const reset = () => { setPlaying(false); setFoodProgress(0); setSelectedStage(0); setSelectedStructure(defaultDigestiveStructure); lastTick.current = 0; };

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

  const step = () => setFoodProgress((value) => Math.min(100, value + 25));
  const handlePathStageChange = (stage) => {
    const next = digestivePathStages[stage] || defaultDigestiveStructure;
    setSelectedStructure(next);
    setSelectedStage(next.stage);
    setFoodProgress(next.stage * 25);
  };
  const handleAnatomySelect = (metadata) => {
    const structureName = String(metadata?.commonName || '').toLowerCase();
    const next = digestiveStructureStates.find((item) => structureName.includes(item.match));
    if (!next) return;
    setSelectedStructure(next);
    setSelectedStage(next.stage);
    setFoodProgress(next.stage * 25);
  };
  const currentPH = useMemo(() => {
    const values = [7, 7, 2.5, 8, 6.2];
    const index = Math.min(values.length - 1, Math.floor(foodProgress / 25));
    return values[index];
  }, [foodProgress]);

  return <div className="module-layout digestion-layout">
    <div className="module-main">
      <div className="view-switcher"><button className={activeView === 'explore' ? 'active' : ''} onClick={() => onViewChange('explore')}>EXPLORE</button><button className={activeView === 'simulate' ? 'active' : ''} onClick={() => onViewChange('simulate')}>SIMULATE</button><button className={activeView === 'quiz' ? 'active' : ''} onClick={() => onViewChange('quiz')}>QUIZ <span className="tiny-dot" /></button></div>
      {activeView === 'quiz' ? <div className="quiz-view"><div className="view-heading"><span className="eyebrow">KNOWLEDGE CHECK</span><h2>Digestion checkpoint</h2><p>Trace the route and connect each organ to its job.</p></div><Quiz moduleId="digestion" onComplete={onComplete} onAsk={onAsk} /></div> : activeView === 'simulate' ? <><FoodSimulation foodProgress={foodProgress} setFoodProgress={setFoodProgress} playing={playing} setPlaying={setPlaying} speed={speed} setSpeed={setSpeed} onReset={reset} onStep={step} selectedStage={selectedStage} setSelectedStage={setSelectedStage} currentPH={currentPH} reducedMotion={reducedMotion} /><DigestiveKineticsSimulation reducedMotion={reducedMotion} /></> : <DigestiveExplore foodProgress={foodProgress} playing={playing} enzymeKey={enzymeKey} setEnzymeKey={setEnzymeKey} selectedStructure={selectedStructure} selectedStage={selectedStage} onAnatomySelect={handleAnatomySelect} onStageChange={handlePathStageChange} reducedMotion={reducedMotion} />}
    </div>
    {activeView !== 'quiz' && <InfoPanel title={activeStage.name} eyebrow={`DIGESTION STAGE 0${selectedStage + 1}`} accent={activeStage.color} what={activeStage.detail} how={`The food bolus travels through the ${activeStage.name.toLowerCase()} while this stage's chemistry and movement prepare the next step.`} why="Breaking food into small, soluble molecules allows nutrients to cross the intestinal wall and be used by cells." />}
  </div>;
}

function DigestiveKineticsSimulation({ reducedMotion }) {
  const engineRef = useRef(null);
  const [profileKey, setProfileKey] = useState('amylase');
  const [snapshot, setSnapshot] = useState(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const engine = new EnzymeKineticsEngine('amylase');
    engineRef.current = engine;
    setSnapshot(engine.getSnapshot());
    const unsubscribe = engine.subscribe(setSnapshot);
    return () => { unsubscribe(); engine.dispose(); engineRef.current = null; };
  }, []);
  useEffect(() => { if (reducedMotion) { engineRef.current?.stop(); setPlaying(false); } }, [reducedMotion]);

  if (!snapshot) return null;
  const engine = engineRef.current;
  const selectProfile = (key) => { engine.selectProfile(key); setProfileKey(key); setPlaying(false); setSnapshot(engine.getSnapshot()); };
  const update = (patch) => setSnapshot(engine.setParameters(patch));
  const toggle = () => { if (reducedMotion) return; if (playing) engine.stop(); else engine.start(); setPlaying((value) => !value); };
  const reset = () => { engine.reset(); setPlaying(false); setSnapshot(engine.getSnapshot()); };
  const profile = snapshot.profile;

  return <section className="kinetics-engine-panel"><div className="visual-heading"><div><span className="eyebrow">ENZYME KINETICS · MICHAELIS–MENTEN</span><h2>Turn pH into reaction rate</h2><p>Adjust the environment and watch substrate consumption respond to enzyme specificity and denaturation.</p></div><span className="model-pill">SIMPLIFIED MODEL</span></div><div className="kinetics-tabs">{Object.entries(ENZYME_PROFILES).map(([key, item]) => <button key={key} className={profileKey === key ? 'active' : ''} onClick={() => selectProfile(key)}><i style={{ background: item.color }} />{item.name}</button>)}</div><div className="kinetics-board" style={{ '--kinetics-accent': profile.color }}><div className="kinetics-reaction"><div className="substrate-stack">{Array.from({ length: 12 }, (_, index) => <i key={index} className={index < Math.ceil(snapshot.substrate / 8) ? 'present' : 'spent'} />)}</div><div className="kinetics-arrow"><strong>{snapshot.halted ? 'activity halted' : 'v = Vmax [S] / (Km + [S])'}</strong><span>{profile.compartment} · optimum pH {profile.optimalPH}</span></div><div className="product-stack"><i /><i /><i /><span>{profile.products}</span></div></div><div className="kinetics-readouts"><div><span>RATE</span><strong>{snapshot.rate.toFixed(2)} units/s</strong></div><div><span>pH FACTOR</span><strong>{Math.round(snapshot.pHActivity * 100)}%</strong></div><div><span>TEMP FACTOR</span><strong>{Math.round(snapshot.temperatureActivity * 100)}%</strong></div><div><span>REMAINING SUBSTRATE</span><strong>{snapshot.substrate.toFixed(1)}</strong></div></div></div><div className="kinetics-controls"><label className="lab-slider"><span>Compartment pH</span><output>{snapshot.pH.toFixed(1)}</output><input aria-label="Compartment pH" type="range" min="0" max="14" step="0.1" value={snapshot.pH} onChange={(event) => update({ pH: Number(event.target.value) })} /></label><label className="lab-slider"><span>Temperature</span><output>{snapshot.temperature.toFixed(0)}°C</output><input aria-label="Temperature" type="range" min="0" max="80" step="1" value={snapshot.temperature} onChange={(event) => update({ temperature: Number(event.target.value) })} /></label><label className="lab-slider"><span>Starting substrate</span><output>{snapshot.substrate.toFixed(0)} units</output><input aria-label="Starting substrate" type="range" min="0" max="100" step="1" value={snapshot.substrate + snapshot.product} onChange={(event) => { engine.reset(); update({ substrate: Number(event.target.value) }); }} /></label></div><div className="kinetics-actions"><button className="primary-cta" onClick={toggle}>{playing ? 'Pause reaction' : 'Run reaction'}</button><button className="outline-button" onClick={reset}>Reset profile</button><span className={`activity-badge ${snapshot.halted ? 'halted' : ''}`}><i /> {snapshot.halted ? 'No measurable activity' : 'Catalysis active'}</span></div><p className="micro-note"><Icon name="info" size={14} /> pH uses a bell-shaped Gaussian teaching curve; temperature falls off gently below the 37 °C optimum, then drops down a steep denaturation cliff above ~42 °C — real digestive enzymes lose activity rapidly past that point. At pH 7.0, pepsin activity is effectively zero in this model and substrate breakdown stops.</p></section>;
}

function FoodSimulation({ foodProgress, setFoodProgress, playing, setPlaying, speed, setSpeed, onReset, onStep, selectedStage, setSelectedStage, currentPH, reducedMotion }) {
  const pathDots = Array.from({ length: 20 }, (_, index) => index);
  const foodRoute = [[48, 17], [52, 31], [54, 47], [53, 67], [53, 82]];
  const foodSegment = Math.min(foodRoute.length - 2, Math.floor(foodProgress / 25));
  const foodSegmentProgress = foodProgress >= 100 ? 1 : (foodProgress % 25) / 25;
  const foodX = foodRoute[foodSegment][0] + (foodRoute[foodSegment + 1][0] - foodRoute[foodSegment][0]) * foodSegmentProgress;
  const foodY = foodRoute[foodSegment][1] + (foodRoute[foodSegment + 1][1] - foodRoute[foodSegment][1]) * foodSegmentProgress;
  return <div className="digestion-sim">
    <div className="visual-heading"><div><span className="eyebrow">FOLLOW THE FOOD · LIVE PATHWAY</span><h2>A bite becomes building blocks</h2></div><span className="status-chip"><i className="live-dot" /> {playing ? 'simulation running' : foodProgress >= 100 ? 'pathway complete' : 'ready to explore'}</span></div>
    <div className="diagram-source-note"><Icon name="info" size={15} /><span><strong>Simplified teaching schematic.</strong> The route shows the alimentary canal from mouth to large intestine; the liver and pancreas are accessory organs that support digestion rather than part of the food path. Reference plate, relationships, and function: <a href="https://openstax.org/books/anatomy-and-physiology-2e/pages/23-1-overview-of-the-digestive-system" target="_blank" rel="noreferrer">OpenStax A&amp;P 2e, Figure 23.2 ↗</a> and <a href="https://openstax.org/books/anatomy-and-physiology-2e/pages/23-2-digestive-system-processes-and-regulation" target="_blank" rel="noreferrer">23.2 ↗</a>.</span></div>
    <div className="digestive-stage">
      <div className="digestive-anatomy reference-digestive" role="img" aria-label="Simplified digestive tract pathway from mouth to esophagus, stomach, small intestine, and large intestine">
        <div className="digestive-path-key"><span>FOOD PATH</span><b>MOUTH</b><i>→</i><b>STOMACH</b><i>→</i><b>SMALL INTESTINE</b><i>→</i><b>LARGE INTESTINE</b><i>·</i><small>OpenStax reference plate</small></div>
        <img className="digestive-reference-image" src="/reference/openstax-digestive-23-2.webp" alt="Labeled human digestive system showing the alimentary canal and accessory organs" loading="lazy" decoding="async" />
        <div className="organ-shape organ-mouth" /><div className="organ-shape organ-esophagus" /><div className="organ-shape organ-stomach" /><div className="organ-shape organ-intestine" /><div className="organ-shape organ-large" />
        <div className="digestive-connectors"><span /><span /><span /><span /></div>
        <div className="food-path">{pathDots.map((dot) => <i key={dot} style={{ left: `${5 + dot * 4.65}%`, opacity: foodProgress >= dot * 5 ? 1 : 0.16 }} />)}</div>
        <div className="food-particle" style={{ left: `${foodX}%`, top: `${foodY}%` }}><span>FOOD BOLUS</span></div>
        <span className="organ-label mouth-label">MOUTH</span><span className="organ-label esophagus-label">ESOPHAGUS</span><span className="organ-label stomach-label">STOMACH</span><span className="organ-label small-label">SMALL INTESTINE</span><span className="organ-label large-label">LARGE INTESTINE</span>
        <div className="accessory-label liver-label">LIVER · BILE</div><div className="accessory-label pancreas-label">PANCREAS · ENZYMES</div>
      </div>
      <div className="digestive-step-list">{['Mouth', 'Esophagus', 'Stomach', 'Small intestine', 'Large intestine'].map((label, index) => <button className={selectedStage === index ? 'active' : foodProgress >= (index + 1) * 25 ? 'done' : ''} key={label} onClick={() => { setSelectedStage(index); setFoodProgress(index * 25); }}><span>{String(index + 1).padStart(2, '0')}</span><b>{label}</b><i>{foodProgress >= (index + 1) * 25 ? '✓' : '·'}</i></button>)}</div>
    </div>
    <div className="ph-strip"><div><span className="eyebrow">CURRENT ENVIRONMENT</span><strong>pH {currentPH}</strong></div><div className="ph-meter"><span className="ph-spectrum" /><i style={{ left: `${Math.max(2, Math.min(98, (currentPH / 14) * 100))}%` }} /></div><div className="ph-labels"><span>acidic</span><span>neutral</span><span>alkaline</span></div></div>
    <SimulationControls playing={playing} onToggle={() => { if (foodProgress >= 100) setFoodProgress(0); setPlaying((value) => !value); }} onReset={onReset} onStep={onStep} speed={speed} onSpeedChange={setSpeed} stepLabel="Move to next organ" label="Digestion animation controls" />
    <p className="micro-note"><Icon name="info" size={14} /> The food particle is a teaching marker. Actual digestion happens through coordinated mechanical and chemical processes.</p>
  </div>;
}

function DigestiveStructureState({ selectedStructure = defaultDigestiveStructure }) {
  // Phase 51: surface accessory-organ support from the stage machine so the
  // side-input story stays explicit (food never passes through accessories).
  const stageDescription = describeDigestiveStage(selectedStructure.stage);
  return <section className="digestion-structure-state" aria-label="Selected digestive structure teaching state">
    <div className="digestion-structure-heading"><span className="eyebrow">STRUCTURE → PROCESS LINK</span><strong>{selectedStructure.name}</strong><p>{selectedStructure.role}</p>{stageDescription.accessorySupport.length > 0 && <small>Side inputs here: {stageDescription.sideInputs.join(', ')} — delivered by {stageDescription.accessorySupport.join(', ')}. Food does not pass through accessory organs.</small>}</div>
    <div className="digestion-structure-meta"><span>{selectedStructure.category}</span><span>PATHWAY STAGE {String(selectedStructure.stage + 1).padStart(2, '0')} / 05</span><span>{selectedStructure.stage < 3 ? 'Food route' : 'Absorption and accessory support'}</span></div>
  </section>;
}

function DigestivePathSequence({ selectedStage, onStageChange }) {
  return <section className="digestion-path-sequence" aria-label="Digestive pathway teaching sequence"><div className="digestion-path-sequence-heading"><span className="eyebrow">PROCESS SEQUENCE</span><strong>Follow the bolus</strong><small>Choose a stage to synchronize the structure state and simulation checkpoint.</small></div><div className="digestion-path-buttons">{digestivePathStages.map((stage, index) => <button key={stage.match} type="button" className={selectedStage === index ? 'active' : ''} onClick={() => onStageChange?.(index)} aria-pressed={selectedStage === index}><i>{String(index + 1).padStart(2, '0')}</i><span>{stage.name}</span>{index < digestivePathStages.length - 1 && <b>→</b>}</button>)}</div></section>;
}

function DigestiveExplore({ foodProgress, playing, enzymeKey, setEnzymeKey, selectedStructure, selectedStage, onAnatomySelect, onStageChange, reducedMotion }) {
  const enzyme = enzymeData[enzymeKey];
  // Phase 51: three wave pulses give the conceptual route a peristaltic
  // propagation feel instead of a single traveling dot.
  const teachingOverlay = useMemo(() => ({ id: 'digestion-route', label: 'Animated bolus route is a simplified teaching model linked to the selected stage and saved food-progress phase.', activeStage: selectedStage, stages: digestiveTeachingStages, waves: 3, pulseColor: 0xffd28c, pulseRadius: 0.012, pulsePhase: foodProgress / 100, animate: playing, reducedMotion, routeDisclosure: TEACHING_OVERLAY_SPEC.digestion.routeDisclosure }), [selectedStage, foodProgress, playing, reducedMotion]);
  const tourSteps = digestivePathStages.map((stage, index) => ({ id: stage.match, label: stage.name, caption: describeDigestiveStage(index).caption }));
  return <div className="digestive-explore"><div className="view-heading"><span className="eyebrow">EXPLORE · DIGESTIVE ANATOMY + CHEMISTRY</span><h2>Trace the tract, then zoom into chemistry</h2><p>Start with source-derived organs and accessories. Then choose a food type to inspect a deliberately simplified enzyme interaction.</p></div><GuidedTour label="Alimentary route" steps={tourSteps} activeIndex={selectedStage} onStep={(index) => onStageChange?.(index)} reducedMotion={reducedMotion} /><ReferenceObject3D registryId="digestive-macro" label="Digestive tract & accessory organs" systems={['digestive']} source="BodyParts3D 4.0 adult-male reference atlas" sourceUrl="https://dbarchive.biosciencedbc.jp/en/bodyparts3d/desc.html" limitation="The atlas is macro-anatomy; food movement, pH, enzymes, absorption, and microscopic surface area are separate teaching models." reducedMotion={reducedMotion} onSelect={onAnatomySelect} teachingOverlay={teachingOverlay} /><DigestiveStructureState selectedStructure={selectedStructure} /><DigestivePathSequence selectedStage={selectedStage} onStageChange={onStageChange} /><div className="enzyme-tabs">{Object.entries(enzymeData).map(([key, item]) => <button key={key} className={enzymeKey === key ? 'active' : ''} onClick={() => { setEnzymeKey(key); soundManager.playClick(); }}><span className="enzyme-dot" style={{ background: item.color }} />{item.label}</button>)}</div><div className="enzyme-board" style={{ '--enzyme-accent': enzyme.color }}><div className="molecule molecule-large"><span className="molecule-label">{enzyme.substrate}</span><i /><i /><i /><i /></div><div className="enzyme-bridge"><div className="enzyme-orbit"><span>ENZYME</span><b>{enzyme.enzyme}</b></div><div className="reaction-arrow"><span>breaks into</span><Icon name="arrow" size={22} /></div></div><div className="product-molecules"><div className="product"><i /><span>{enzyme.product.split(' + ')[0]}</span></div><div className="product"><i /><span>{enzyme.product.split(' + ')[1] || 'smaller molecules'}</span></div></div><div className="enzyme-location"><span>LOCATION</span><strong>{enzyme.location}</strong></div></div><div className="enzyme-facts"><div><span>SUBSTRATE</span><strong>{enzyme.substrate}</strong></div><div><span>ENZYME</span><strong>{enzyme.enzyme}</strong></div><div><span>PRODUCT</span><strong>{enzyme.product}</strong></div></div><div className="experiment-explanation"><Icon name="bulb" size={17} /><p><strong>Key idea:</strong> digestive enzymes are specific. Their active sites fit certain substrates, so different food molecules need different enzymes.</p></div><ErrorBoundary label="Digestion 3D"><Suspense fallback={<div className="simulation-loading" role="status">Loading 3D digestion…</div>}><DigestionDeepDive reducedMotion={reducedMotion} /></Suspense></ErrorBoundary></div>;
}
