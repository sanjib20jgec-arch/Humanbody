import React, { useEffect, useState } from 'react';
import { Icon } from '../components/Icons';
import ReferenceObject3D from '../components/ReferenceObject3D';
import SimulationControls from '../components/SimulationControls';
import InfoPanel from '../components/InfoPanel';
import Quiz from '../components/Quiz';
import { soundManager } from '../lib/sound';
import { REFLEX_TOTAL_MS, CONDUCTION_DISCLOSURE } from '../lib/NerveConductionModel';

const structureData = {
  cerebrum: { name: 'Cerebrum', eyebrow: 'BRAIN NODE · HIGHER PROCESSING', what: 'The largest brain region, divided into left and right cerebral hemispheres.', how: 'Cortical areas process sensation, language, memory, decision-making, and voluntary movement.', why: 'It turns incoming information into perception, plans, and purposeful actions.', accent: '#c9a4d4' },
  cerebellum: { name: 'Cerebellum', eyebrow: 'BRAIN NODE · MOVEMENT CALIBRATION', what: 'A folded region at the back of the brain beneath the occipital lobes.', how: 'It compares intended movement with sensory feedback and adjusts timing, balance, and precision.', why: 'Smooth movement depends on constant error correction rather than a single command.', accent: '#d6a17e' },
  brainstem: { name: 'Brainstem', eyebrow: 'BRAIN NODE · VITAL CONTROL', what: 'The stalk connecting the cerebrum and cerebellum with the spinal cord.', how: 'It carries pathways and helps regulate automatic functions such as breathing, heart rate, and arousal.', why: 'It keeps essential functions coordinated while information travels between brain and body.', accent: '#c78691' },
  spinal: { name: 'Spinal cord', eyebrow: 'SIGNAL HIGHWAY · CENTRAL NERVOUS SYSTEM', what: 'A protected column of nervous tissue inside the vertebral canal.', how: 'It carries messages between the brain and body and organizes fast spinal reflexes.', why: 'A reflex can begin in the cord before the brain has consciously identified the stimulus.', accent: '#d3b36f' },
  peripheral: { name: 'Peripheral nerves', eyebrow: 'CONNECTIONS · PERIPHERAL NERVOUS SYSTEM', what: 'Nerves and ganglia outside the brain and spinal cord.', how: 'Sensory pathways bring information toward the central nervous system, while motor pathways carry commands toward effectors.', why: 'The peripheral nervous system links the central nervous system to the skin, muscles, and organs.', accent: '#6fb2c3' },
  sensory: { name: 'Sensory neuron', eyebrow: 'REFLEX ARC · INPUT', what: 'A neuron carrying information from a receptor toward the central nervous system.', how: 'A strong enough stimulus changes the membrane potential and sends an action potential along its axon.', why: 'The nervous system needs a coded input before it can select a response.', accent: '#6fb2c3' },
  synapse: { name: 'Synapse', eyebrow: 'REFLEX ARC · CONNECTION', what: 'A junction where one neuron communicates with another cell.', how: 'The arriving signal triggers neurotransmitter release across a tiny synaptic gap.', why: 'Synapses allow signals to be passed, modified, or inhibited rather than simply copied.', accent: '#e3b86d' },
  motor: { name: 'Motor neuron', eyebrow: 'REFLEX ARC · OUTPUT', what: 'A neuron carrying a command from the central nervous system to an effector.', how: 'Its axon releases a signal at the neuromuscular junction, causing a muscle fibre to contract.', why: 'The response only becomes useful when the command reaches an effector.', accent: '#c27683' },
  muscle: { name: 'Effector muscle', eyebrow: 'REFLEX ARC · RESPONSE', what: 'The muscle that receives the motor command in this simplified model.', how: 'It contracts to pull the hand away from the stimulus.', why: 'A reflex converts a potentially harmful stimulus into a protective movement.', accent: '#a9796f' }
};

const reflexSteps = [
  { id: 'rest', label: 'Ready', detail: 'Touch the trigger or step through the pathway.', structure: 'spinal' },
  { id: 'receptor', label: 'Stimulus', detail: 'Pain receptors in the skin detect a hot surface.', structure: 'sensory' },
  { id: 'sensory', label: 'Input travels', detail: 'A sensory neuron carries the action potential toward the spinal cord.', structure: 'sensory' },
  { id: 'relay', label: 'Relay', detail: 'An interneuron relays the signal across a synapse inside the spinal cord.', structure: 'synapse' },
  { id: 'motor', label: 'Output travels', detail: 'A motor neuron carries the command toward the arm muscle.', structure: 'motor' },
  { id: 'response', label: 'Response', detail: 'The effector muscle contracts and the hand withdraws.', structure: 'muscle' }
];

export default function NervousLab({ activeView, onViewChange, onComplete, onAsk, reducedMotion }) {
  const [selectedId, setSelectedId] = useState('cerebrum');
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [step, setStep] = useState(0);

  const selected = structureData[selectedId] || structureData.cerebrum;
  const choose = (id) => { setSelectedId(id); soundManager.playClick(); };
  const reset = () => { setPlaying(false); setSpeed(1); setStep(0); setSelectedId('cerebrum'); };
  const trigger = () => { setStep(1); setSelectedId('sensory'); setPlaying(!reducedMotion); soundManager.playClick(); };

  useEffect(() => {
    if (reducedMotion || !playing) return undefined;
    const timer = window.setInterval(() => {
      setStep((current) => {
        if (current >= reflexSteps.length - 1) { setPlaying(false); return current; }
        const next = current + 1;
        setSelectedId(reflexSteps[next].structure);
        return next;
      });
    }, 1250 / speed);
    return () => window.clearInterval(timer);
  }, [playing, speed, reducedMotion]);
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

  const advance = () => {
    setStep((current) => {
      const next = Math.min(reflexSteps.length - 1, current + 1);
      setSelectedId(reflexSteps[next].structure);
      return next;
    });
  };

  return <div className="module-layout nervous-layout">
    <div className="module-main">
      <div className="view-switcher"><button className={activeView === 'explore' ? 'active' : ''} onClick={() => onViewChange('explore')}>EXPLORE</button><button className={activeView === 'simulate' ? 'active' : ''} onClick={() => onViewChange('simulate')}>SIMULATE</button><button className={activeView === 'quiz' ? 'active' : ''} onClick={() => onViewChange('quiz')}>QUIZ <span className="tiny-dot" /></button></div>
      {activeView === 'quiz' ? <div className="quiz-view"><div className="view-heading"><span className="eyebrow">KNOWLEDGE CHECK</span><h2>Brain & nerves checkpoint</h2><p>Use the pathway model to reason about signals, synapses, and reflexes.</p></div><Quiz moduleId="nervous" onComplete={onComplete} onAsk={onAsk} /></div> : activeView === 'simulate' ? <ReflexSimulation step={step} playing={playing} speed={speed} setPlaying={setPlaying} setSpeed={setSpeed} onReset={reset} onStep={advance} onTrigger={trigger} /> : <NervousExplore selectedId={selectedId} onSelect={choose} reducedMotion={reducedMotion} />}
    </div>
    {activeView !== 'quiz' && <InfoPanel title={selected.name} eyebrow={selected.eyebrow} accent={selected.accent} what={selected.what} how={selected.how} why={selected.why} />}
  </div>;
}

function NervousExplore({ selectedId, onSelect, reducedMotion }) {
  return <div className="nervous-explore"><div className="view-heading"><span className="eyebrow">EXPLORE · CENTRAL AND PERIPHERAL NERVOUS SYSTEMS</span><h2>Map the signal network</h2><p>Select a source-derived region to connect structure with function. CNS means brain and spinal cord; PNS means the nerves outside them.</p></div><ReferenceObject3D registryId="nervous-macro" label="Brain & nervous-system structures" systems={['nervous', 'sensory']} source="BodyParts3D 4.0 adult-male reference atlas" sourceUrl="https://dbarchive.biosciencedbc.jp/en/bodyparts3d/desc.html" limitation="The current atlas includes nervous-system structures but does not provide complete spinal-cord parenchyma; the reflex pathway below is a separate simplified teaching schematic." reducedMotion={reducedMotion} onSelect={(metadata) => { const name = String(metadata?.commonName || '').toLowerCase(); if (name.includes('cerebell')) onSelect('cerebellum'); else if (name.includes('brainstem')) onSelect('brainstem'); else if (name.includes('spinal')) onSelect('spinal'); else if (name.includes('nerve')) onSelect('peripheral'); else onSelect('cerebrum'); }} /><div className="nervous-anatomy-board"><div className="nervous-board-grid" /><div className="brain-figure" aria-label="Interactive brain, spinal cord, and peripheral nerve diagram"><button className={`brain-region cerebrum ${selectedId === 'cerebrum' ? 'active' : ''}`} onClick={() => onSelect('cerebrum')} aria-label="Select cerebrum"><span /></button><button className={`brain-region cerebellum ${selectedId === 'cerebellum' ? 'active' : ''}`} onClick={() => onSelect('cerebellum')} aria-label="Select cerebellum"><span /></button><button className={`brain-region brainstem ${selectedId === 'brainstem' ? 'active' : ''}`} onClick={() => onSelect('brainstem')} aria-label="Select brainstem"><span /></button><button className={`brain-region spinal ${selectedId === 'spinal' ? 'active' : ''}`} onClick={() => onSelect('spinal')} aria-label="Select spinal cord"><span /></button><button className={`brain-region peripheral ${selectedId === 'peripheral' ? 'active' : ''}`} onClick={() => onSelect('peripheral')} aria-label="Select peripheral nerves"><span /></button><div className="nerve-branch branch-left" /><div className="nerve-branch branch-right" /><span className="neural-signal signal-left" aria-hidden="true" /><span className="neural-signal signal-right" aria-hidden="true" /><span className="neural-label label-cerebrum">CEREBRUM</span><span className="neural-label label-cerebellum">CEREBELLUM</span><span className="neural-label label-brainstem">BRAINSTEM</span><span className="neural-label label-spinal">SPINAL CORD</span><span className="neural-label label-peripheral">PERIPHERAL NERVES</span></div><div className="diagram-source-note"><Icon name="info" size={13} /><span>Macro-region reference: BodyParts3D 4.0 adult-male atlas. Signal lines are a simplified teaching schematic.</span></div><div className="nervous-board-legend"><span><i className="legend-swatch brain-swatch" /> brain regions</span><span><i className="legend-swatch cord-swatch" /> signal highway</span><span><i className="legend-swatch nerve-swatch" /> peripheral nerves</span></div></div><div className="neural-principles"><div><span className="eyebrow">CENTRAL</span><strong>Brain + spinal cord</strong><small>integrates and coordinates</small></div><div><span className="eyebrow">PERIPHERAL</span><strong>Sensory + motor nerves</strong><small>connects the body</small></div><div><span className="eyebrow">SIGNAL</span><strong>Electrical + chemical</strong><small>action potentials and synapses</small></div></div></div>;
}

function ReflexSimulation({ step, playing, speed, setPlaying, setSpeed, onReset, onStep, onTrigger }) {
  const active = reflexSteps[step];
  return <div className="nervous-simulation"><div className="visual-heading"><div><span className="eyebrow">REFLEX ARC · PROTECTIVE RESPONSE</span><h2>From hot surface to muscle</h2></div><span className="status-chip"><i className="live-dot" /> {playing ? 'signal traveling' : step === reflexSteps.length - 1 ? 'response complete' : 'ready to trace'}</span></div><div className="reflex-stage"><div className="reflex-spinal-art"><span className="cord-column" /><span className="cord-ring ring-one" /><span className="cord-ring ring-two" /><span className="cord-ring ring-three" /></div><div className="reflex-path"><div className="reflex-node node-receptor"><b>01</b><strong>Skin receptor</strong><small>heat / pain</small></div><div className="reflex-connector connector-sensory"><i className={step >= 2 ? 'lit' : ''} /></div><div className="reflex-node node-sensory"><b>02</b><strong>Sensory neuron</strong><small>input to CNS</small></div><div className="reflex-connector connector-relay"><i className={step >= 3 ? 'lit' : ''} /></div><div className="reflex-node node-relay"><b>03</b><strong>Relay neuron</strong><small>spinal synapse</small></div><div className="reflex-connector connector-motor"><i className={step >= 4 ? 'lit' : ''} /></div><div className="reflex-node node-motor"><b>04</b><strong>Motor neuron</strong><small>output to muscle</small></div><div className="reflex-connector connector-response"><i className={step >= 5 ? 'lit' : ''} /></div><div className="reflex-node node-muscle"><b>05</b><strong>Arm muscle</strong><small>withdraws hand</small></div><span className="signal-bead" style={{ left: `${8 + (step / 5) * 84}%` }} /></div><div className="reflex-callout"><span className="eyebrow">CURRENT STEP · {String(step).padStart(2, '0')}</span><strong>{active.label}</strong><p>{active.detail}</p><small>Teaching-scale reflex: ≈ {REFLEX_TOTAL_MS} ms from stimulus to withdrawal — faster than conscious perception. {CONDUCTION_DISCLOSURE}</small></div><button className="trigger-button" onClick={onTrigger}><Icon name="sparkle" size={15} /> Touch hot surface</button></div><SimulationControls playing={playing} onToggle={() => setPlaying((value) => !value)} onReset={onReset} onStep={onStep} speed={speed} onSpeedChange={setSpeed} label="Reflex arc simulation controls" stepLabel="Advance reflex step" /><div className="nervous-note"><Icon name="info" size={15} /><span><strong>Key idea:</strong> the spinal reflex begins before the brain consciously identifies the stimulus. The brain receives the information too, so you feel the heat and can learn from it.</span></div></div>;
}
