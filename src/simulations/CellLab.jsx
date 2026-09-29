import React, { useEffect, useRef, useState } from 'react';
import { cellOrganelles } from '../data/modules';
import { Icon } from '../components/Icons';
import SimulationControls from '../components/SimulationControls';
import InfoPanel from '../components/InfoPanel';
import Quiz from '../components/Quiz';
import { soundManager } from '../lib/sound';
import { CellularDiffusionEngine } from '../lib/CellularDiffusionEngine';
import ConceptualSourceNote from '../components/ConceptualSourceNote';

export default function CellLab({ activeView, onViewChange, onComplete, onAsk, reducedMotion }) {
  const [selectedId, setSelectedId] = useState('nucleus');
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [experiment, setExperiment] = useState(false);
  const [leftConcentration, setLeftConcentration] = useState(72);
  const [rightConcentration, setRightConcentration] = useState(28);
  const [poreSize, setPoreSize] = useState(0.22);
  const [temperature, setTemperature] = useState(24);
  const [energyPulse, setEnergyPulse] = useState(0);
  const raf = useRef(null);
  const selected = cellOrganelles.find((item) => item.id === selectedId) || cellOrganelles[0];

  useEffect(() => {
    if (reducedMotion || !playing) return undefined;
    let last = 0;
    const tick = (time) => {
      if (time - last > 40) { setEnergyPulse((value) => (value + speed) % 100); last = time; }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [playing, speed, reducedMotion]);
  useEffect(() => () => cancelAnimationFrame(raf.current), []);
  useEffect(() => { if (reducedMotion) setPlaying(false); }, [reducedMotion]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (activeView === 'quiz' || event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
      if (event.key === ' ') { event.preventDefault(); setPlaying((value) => !value); }
      if (event.key.toLowerCase() === 'r') { setPlaying(false); setZoom(1); setSelectedId('nucleus'); }
      if (event.key === '+' || event.key === '=') setSpeed((value) => value === 0.5 ? 1 : 2);
      if (event.key === '-') setSpeed((value) => value === 2 ? 1 : 0.5);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeView]);

  const reset = () => { setPlaying(false); setZoom(1); setSelectedId('nucleus'); setExperiment(false); setLeftConcentration(72); setRightConcentration(28); setPoreSize(0.22); setTemperature(24); };
  const selectOrganelle = (id) => { setSelectedId(id); soundManager.playClick(); };

  return <div className="module-layout cell-layout">
    <div className="module-main">
      <div className="view-switcher"><button className={activeView === 'explore' ? 'active' : ''} onClick={() => onViewChange('explore')}>EXPLORE</button><button className={activeView === 'simulate' ? 'active' : ''} onClick={() => onViewChange('simulate')}>SIMULATE</button><button className={activeView === 'quiz' ? 'active' : ''} onClick={() => onViewChange('quiz')}>QUIZ <span className="tiny-dot" /></button></div>
      {activeView === 'quiz' ? <div className="quiz-view"><div className="view-heading"><span className="eyebrow">KNOWLEDGE CHECK</span><h2>Cell systems checkpoint</h2><p>Use the visual model to reason about what happens inside a living cell.</p></div><Quiz moduleId="cell" onComplete={onComplete} onAsk={onAsk} /></div> : activeView === 'simulate' ? <CellExperiment leftConcentration={leftConcentration} setLeftConcentration={setLeftConcentration} rightConcentration={rightConcentration} setRightConcentration={setRightConcentration} poreSize={poreSize} setPoreSize={setPoreSize} temperature={temperature} setTemperature={setTemperature} playing={playing} reducedMotion={reducedMotion} /> : <>
        <div className="visual-heading"><div><span className="eyebrow">CELL EXPLORER · {Math.round(zoom * 100)}% SCALE</span><h2>Inside an animal cell</h2></div><div className="zoom-tools"><button onClick={() => setZoom((value) => Math.min(1.34, value + 0.08))} aria-label="Zoom in"><Icon name="zoomIn" size={17} /></button><button onClick={() => setZoom((value) => Math.max(0.84, value - 0.08))} aria-label="Zoom out"><Icon name="zoomOut" size={17} /></button><button onClick={() => setZoom(1)} aria-label="Reset zoom"><Icon name="fullscreen" size={16} /></button></div></div>
        <div className="cell-stage"><div className="stage-grid" /><div className="stage-crosshair crosshair-one" /><div className="stage-crosshair crosshair-two" /><div className="cell-scale" style={{ transform: `scale(${zoom})` }}><div className="cell-membrane" /><div className="cell-cytoplasm" /><button className="organelle organelle-nucleus" onClick={() => selectOrganelle('nucleus')} aria-label="Nucleus"><span className="nucleus-core" /><span className="organelle-label">NUCLEUS</span></button><button className="organelle organelle-nucleolus" onClick={() => selectOrganelle('nucleolus')} aria-label="Nucleolus"><span className="nucleolus-core" /></button><button className="organelle organelle-mito" onClick={() => selectOrganelle('mitochondria')} aria-label="Mitochondrion"><span className="mito-wave" /><span className="organelle-label">MITO</span></button><button className="organelle organelle-mito mito-two" onClick={() => selectOrganelle('mitochondria')} aria-label="Mitochondrion"><span className="mito-wave" /></button><button className="organelle organelle-ribosome" onClick={() => selectOrganelle('ribosomes')} aria-label="Ribosomes"><span /><span /><span /><span /><b>RIBOSOMES</b></button><button className="organelle organelle-er" onClick={() => selectOrganelle('rough-er')} aria-label="Rough endoplasmic reticulum"><i /><i /><i /><i /><b>ROUGH ER</b></button><button className="organelle organelle-golgi" onClick={() => selectOrganelle('golgi')} aria-label="Golgi apparatus"><i /><i /><i /><i /><b>GOLGI</b>{playing && <span className="vesicle v-one" />}{playing && <span className="vesicle v-two" />}</button><button className="organelle organelle-lyso" onClick={() => selectOrganelle('lysosome')} aria-label="Lysosome"><span /> <b>LYSOSOME</b></button><button className="organelle organelle-vacuole" onClick={() => selectOrganelle('vacuole')} aria-label="Vacuole"><span /><b>VACUOLE</b></button><button className="organelle organelle-membrane" onClick={() => selectOrganelle('membrane')} aria-label="Cell membrane"><span className="membrane-particles" /> <b>MEMBRANE</b></button><button className="organelle organelle-cytoplasm" onClick={() => selectOrganelle('cytoplasm')} aria-label="Cytoplasm"><span>CYTOPLASM</span></button></div><div className="cell-readout"><span className="readout-kicker">SELECTED STRUCTURE</span><strong>{selected.name}</strong><small>{selected.type} system</small></div><div className="stage-legend"><span><i className="legend-dot purple" /> control</span><span><i className="legend-dot amber" /> energy</span><span><i className="legend-dot cyan" /> transport</span></div></div>
        <ConceptualSourceNote moduleId="cell" />
        <SimulationControls playing={playing} onToggle={() => setPlaying((value) => !value)} onReset={reset} onStep={() => setEnergyPulse((value) => value + 12)} speed={speed} onSpeedChange={setSpeed} label="Cell animation controls" />
        <div className="experiment-callout"><div><span className="eyebrow">MINI EXPERIMENT</span><h3>Osmosis & diffusion</h3><p>Place a semi-permeable membrane under the microscope. Tune the conditions and watch the gradient relax.</p></div><button className="outline-button" onClick={() => { setExperiment(true); onViewChange('simulate'); soundManager.playClick(); }}>Open experiment <Icon name="arrow" size={15} /></button></div>
      </>}
    </div>
    {activeView !== 'quiz' && <InfoPanel title={selected.name} eyebrow={`ORG 0${Math.max(1, cellOrganelles.findIndex((item) => item.id === selected.id) + 1)} · ${selected.type.toUpperCase()}`} accent="#a78bfa" what={selected.function} how={selected.structure} why={selected.why} />}
    {activeView === 'simulate' && experiment && <div className="experiment-badge"><span className="live-dot" /> Experiment active</div>}
  </div>;
}

function CellExperiment({ leftConcentration, setLeftConcentration, rightConcentration, setRightConcentration, poreSize, setPoreSize, temperature, setTemperature, playing, reducedMotion }) {
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const [solute, setSolute] = useState('water');
  const [snapshot, setSnapshot] = useState(null);

  useEffect(() => {
    const engine = new CellularDiffusionEngine({ leftConcentration: leftConcentration / 100, rightConcentration: rightConcentration / 100, poreSize, temperature, solute, particleCount: 72 });
    engineRef.current = engine;
    setSnapshot(engine.getSnapshot());
    const unsubscribe = engine.subscribe(setSnapshot);
    return () => { unsubscribe(); engine.dispose(); engineRef.current = null; };
  }, []);

  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.setParameters({ leftConcentration: leftConcentration / 100, rightConcentration: rightConcentration / 100, poreSize, temperature, solute });
    setSnapshot(engine.getSnapshot());
  }, [leftConcentration, rightConcentration, poreSize, temperature, solute]);

  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;
    if (playing && !reducedMotion) engine.start(); else engine.stop();
    return () => engine.stop();
  }, [playing, reducedMotion]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const engine = engineRef.current;
    if (!canvas || !engine) return undefined;
    const draw = () => { const rect = canvas.getBoundingClientRect(); const dpr = Math.min(window.devicePixelRatio || 1, 2); canvas.width = Math.max(1, rect.width * dpr); canvas.height = Math.max(1, rect.height * dpr); const ctx = canvas.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); engine.draw(ctx, rect.width, rect.height); };
    draw();
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(draw) : null;
    observer?.observe(canvas);
    return () => observer?.disconnect();
  }, [snapshot]);

  if (!snapshot) return null;
  return <div className="experiment-view diffusion-engine-view"><div className="view-heading"><div><span className="eyebrow">MINI EXPERIMENT · STOCHASTIC FLUX ENGINE</span><h2>Brownian motion across a membrane</h2><p>Particles wander randomly while the net flux follows Fick's first law.</p></div><span className="model-pill">2D CANVAS MODEL</span></div><div className="solute-tabs"><button className={solute === 'water' ? 'active' : ''} onClick={() => setSolute('water')}>H₂O · small molecule</button><button className={solute === 'glucose' ? 'active' : ''} onClick={() => setSolute('glucose')}>Glucose · larger solute</button></div><div className="diffusion-canvas-wrap"><canvas ref={canvasRef} aria-label="Brownian particles diffusing across a semi-permeable membrane" /><div className="canvas-axis"><span>higher concentration</span><span>selective membrane</span><span>lower concentration</span></div></div><div className="experiment-readout"><div><span>FICK FLUX J</span><strong>{snapshot.flux.toFixed(3)} units</strong></div><div><span>NET MOVEMENT</span><strong>{snapshot.direction}</strong></div><div><span>PORE CHECK</span><strong className={snapshot.permeable ? 'good' : 'blocked'}>{snapshot.permeable ? 'crossing allowed' : 'blocked by pore'}</strong></div><div><span>PARTICLE RADIUS</span><strong>{snapshot.soluteRadius.toFixed(2)} nm</strong></div></div><div className="experiment-sliders"><Slider label="Region A concentration" value={leftConcentration} setValue={setLeftConcentration} min={0} max={100} accent="#a78bfa" /><Slider label="Region B concentration" value={rightConcentration} setValue={setRightConcentration} min={0} max={100} accent="#22d3ee" /><Slider label="Pore size" value={poreSize} setValue={setPoreSize} min={0.05} max={0.7} step={0.01} suffix=" nm" accent="#fbbf24" /><Slider label="Temperature" value={temperature} setValue={setTemperature} min={5} max={40} suffix="°C" accent="#fb7185" /></div><div className="experiment-explanation"><Icon name="bulb" size={17} /><p><strong>Observe:</strong> water can pass through a pore smaller than glucose when the pore is between {WATER_RADIUS_NM_LABEL} and {GLUCOSE_RADIUS_NM_LABEL} nm. Temperature changes Brownian speed; the concentration gradient sets net flux.</p></div></div>;
}

const WATER_RADIUS_NM_LABEL = '0.14';
const GLUCOSE_RADIUS_NM_LABEL = '0.36';

function Slider({ label, value, setValue, min, max, step = 1, suffix = '%', accent }) {
  return <label className="lab-slider" style={{ '--slider-color': accent }}><span>{label}</span><output>{Number(value).toFixed(step < 1 ? 2 : 0)}{suffix}</output><input aria-label={label} type="range" min={min} max={max} step={step} value={value} onChange={(event) => setValue(Number(event.target.value))} /></label>;
}
