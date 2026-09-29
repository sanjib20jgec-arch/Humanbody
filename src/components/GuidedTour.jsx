import React, { useEffect, useState } from 'react';

/**
 * Phase 48: deterministic guided tour through teaching stages. The tour
 * walks the same stage state the 3D overlay renders, so camera, markers,
 * and captions stay synchronized. Auto-advance is disabled under reduced
 * motion — learners step manually instead.
 */
export default function GuidedTour({ steps = [], activeIndex = 0, onStep, intervalMs = 3200, reducedMotion = false, label = 'Guided tour' }) {
  const [touring, setTouring] = useState(false);
  useEffect(() => {
    if (!touring || reducedMotion) return undefined;
    const timer = window.setInterval(() => {
      const next = (activeIndex + 1) % steps.length;
      onStep?.(next);
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [touring, activeIndex, steps.length, intervalMs, reducedMotion, onStep]);
  useEffect(() => { if (reducedMotion) setTouring(false); }, [reducedMotion]);
  if (!steps.length) return null;
  const active = steps[activeIndex] || steps[0];
  const goto = (index) => onStep?.(Math.max(0, Math.min(steps.length - 1, index)));
  return <section className="guided-tour" aria-label={label}>
    <div className="guided-tour-head"><span className="eyebrow">GUIDED TOUR · {label.toUpperCase()}</span>
      <span className="guided-tour-controls">
        <button type="button" onClick={() => goto(activeIndex - 1)} disabled={activeIndex === 0} aria-label="Previous tour step">←</button>
        {!reducedMotion && <button type="button" onClick={() => setTouring((value) => !value)} aria-pressed={touring}>{touring ? 'Pause tour' : 'Auto-play tour'}</button>}
        <button type="button" onClick={() => goto(activeIndex + 1)} disabled={activeIndex === steps.length - 1} aria-label="Next tour step">→</button>
      </span>
    </div>
    <div className="guided-tour-caption" role="status" aria-live="polite"><strong>{String(activeIndex + 1).padStart(2, '0')} · {active.label}</strong><p>{active.caption || active.detail}</p></div>
    <div className="guided-tour-dots" aria-hidden="true">{steps.map((step, index) => <i key={step.id || index} className={index === activeIndex ? 'active' : index < activeIndex ? 'done' : ''} />)}</div>
    <small>Deterministic teaching walkthrough — the source mesh stays static; stages are the teaching model.</small>
  </section>;
}
