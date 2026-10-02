import React from 'react';
import { Icon } from './Icons';

const viewLabels = {
  explore: { label: 'Explore', description: 'Inspect structures and relationships.' },
  simulate: { label: 'Simulate', description: 'Change conditions and observe a model.' },
  quiz: { label: 'Quiz', description: 'Check recall and understanding.' }
};

export default function GuidedStepCard({ step, index, total, activeView, onViewChange, previous, next, onStepSelect }) {
  if (!step) return null;
  const currentMode = viewLabels[activeView] || viewLabels.explore;
  const nextMode = activeView === 'quiz' ? 'explore' : 'quiz';
  return <section className="guided-step-card" aria-labelledby="guided-step-title">
    <div className="guided-step-card-topline"><span className="eyebrow">GUIDED PATH · STEP {String(Math.max(index + 1, 1)).padStart(2, '0')} / {String(total).padStart(2, '0')}</span><span className="guided-step-stage">{step.stage} · {step.estimatedMinutes} min</span></div>
    <div className="guided-step-card-main"><div><h2 id="guided-step-title">{step.title}</h2><p className="guided-step-objective"><strong>Learning target:</strong> {step.objective}</p><p className="guided-step-mode"><span>{currentMode.label} mode</span> · {currentMode.description}</p></div></div>
    <div className="guided-step-card-actions">
      <div className="guided-step-neighbors">
        {previous && <button type="button" className="guided-step-neighbor" onClick={() => onStepSelect?.(previous.id)} aria-label={`Previous step: ${previous.title}`}><Icon name="back" size={14} /><span>Previous</span></button>}
        {next && <button type="button" className="guided-step-neighbor next" onClick={() => onStepSelect?.(next.id)} aria-label={`Next step: ${next.title}`}><span>Next: {next.short}</span><Icon name="arrow" size={14} /></button>}
      </div>
      <button type="button" className="guided-step-action" onClick={() => onViewChange(nextMode)} aria-label={`${nextMode === 'quiz' ? 'Open' : 'Return to'} ${viewLabels[nextMode].label} mode`}><Icon name={nextMode === 'quiz' ? 'check' : 'back'} size={14} /><span>{nextMode === 'quiz' ? 'Check understanding' : 'Return to explore'}</span></button>
    </div>
  </section>;
}
