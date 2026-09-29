import React, { useRef, useState } from 'react';
import { Icon } from '../components/Icons';
import SimulationControls from '../components/SimulationControls';
import Quiz from '../components/Quiz';
import KinesiologyTheater from '../components/KinesiologyTheater';

export default function KinesiologyLab({ activeView, onViewChange, onComplete, onAsk, reducedMotion }) {
  const [playing, setPlaying] = useState(!reducedMotion);
  const [speed, setSpeed] = useState(1);
  const apiRef = useRef(null);

  return <div className="kinesiology-lab">
    <div className="view-switcher">
      <button className={activeView === 'explore' ? 'active' : ''} onClick={() => onViewChange('explore')}>EXPLORE</button>
      <button className={activeView === 'simulate' ? 'active' : ''} onClick={() => onViewChange('simulate')}>SIMULATE</button>
      <button className={activeView === 'quiz' ? 'active' : ''} onClick={() => onViewChange('quiz')}>QUIZ <span className="tiny-dot" /></button>
    </div>
    {activeView === 'quiz' ? (
      <div className="quiz-view">
        <div className="view-heading"><span className="eyebrow">KNOWLEDGE CHECK</span><h2>Movement checkpoint</h2><p>Use the theater's captions and muscle legend to reason about prime movers, synergists, and stabilizers.</p></div>
        <Quiz moduleId="kinesiology" onComplete={onComplete} onAsk={onAsk} />
      </div>
    ) : (
      <>
        <KinesiologyTheater activeView={activeView} reducedMotion={reducedMotion} playing={playing} setPlaying={setPlaying} speed={speed} setSpeed={setSpeed} apiRef={apiRef} />
        {activeView === 'simulate' && <SimulationControls playing={playing} onToggle={() => setPlaying((v) => !v)} onReset={() => apiRef.current?.reset()} onStep={() => apiRef.current?.step(0.2)} speed={speed} onSpeedChange={setSpeed} label="Movement theater controls" stepLabel="Advance 0.2 s" />}
        <div className="nervous-note"><Icon name="info" size={15} /><span><strong>Key idea:</strong> muscles work in teams — a prime mover produces the action while synergists shape it and stabilizers hold the platform steady. Switch camera angles to see which side of the body is doing the work.</span></div>
      </>
    )}
  </div>;
}
