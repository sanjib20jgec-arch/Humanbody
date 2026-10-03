import React from 'react';
import { Icon } from './Icons';
import { soundManager } from '../lib/sound';

// Phase 1 (Movement Theater): the shared transport used to fix 0.5/1/2, which
// fights the theater's sanctioned 0.25/0.5/1 range (and its 2x made stepping
// ambiguous). The set is now a prop; the default keeps every other bay exactly
// as it shipped.
const DEFAULT_SPEEDS = [0.5, 1, 2];

export default function SimulationControls({ playing, onToggle, onReset, onStep, speed, onSpeedChange, label = 'Simulation timeline', stepLabel = 'Next step', speeds = DEFAULT_SPEEDS }) {
  const handleToggle = () => {
    soundManager[playing ? 'playSimulationPause' : 'playSimulationStart']();
    onToggle();
  };
  return (
    <div className="sim-controls" aria-label={label}>
      <button type="button" className="control-button primary-control" onClick={handleToggle} aria-label={playing ? 'Pause simulation' : 'Play simulation'} aria-pressed={playing}><Icon name={playing ? 'pause' : 'play'} size={18} /> <span>{playing ? 'Pause' : 'Play'}</span></button>
      <button type="button" className="control-button" onClick={() => { soundManager.playReset(); onReset(); }} aria-label="Reset simulation"><Icon name="reset" size={17} /> <span>Reset</span></button>
      {onStep && <button type="button" className="control-button icon-only" onClick={onStep} aria-label={stepLabel} title={stepLabel}><Icon name="step" size={17} /></button>}
      <div className="control-divider" />
      <div className="speed-selector" aria-label="Animation speed">
        <span className="control-label">SPEED</span>
        {speeds.map((value) => <button type="button" key={value} onClick={() => onSpeedChange(value)} className={speed === value ? 'active' : ''} aria-pressed={speed === value}>{value}×</button>)}
      </div>
    </div>
  );
}
