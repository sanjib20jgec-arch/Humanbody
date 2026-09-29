import React, { useState } from 'react';
import { Icon } from './Icons';

export default function InfoPanel({ title, eyebrow, what, how, why, accent = '#38bdf8', compact = false }) {
  const titleId = `info-${String(title).toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  const [detailsOpen, setDetailsOpen] = useState(true);
  return <aside className={`info-panel ${compact ? 'compact' : ''} ${detailsOpen ? 'is-open' : 'is-collapsed'}`} style={{ '--panel-accent': accent }} aria-labelledby={titleId}>
    <div className="info-panel-heading">
      <div>
        <div className="panel-rule" />
        <span className="eyebrow">{eyebrow || 'CONCEPT SNAPSHOT'}</span>
        <h2 id={titleId}>{title}</h2>
      </div>
      <button type="button" className="info-panel-toggle" onClick={() => setDetailsOpen((value) => !value)} aria-label={detailsOpen ? 'Hide notes' : 'Show notes'} aria-expanded={detailsOpen} aria-controls={`${titleId}-details`}>{detailsOpen ? 'Hide notes' : 'Show notes'} <Icon name="chevron" size={14} /></button>
    </div>
    <div id={`${titleId}-details`} className="info-panel-body" hidden={!detailsOpen}>
      <div className="info-stack">
        <section><span className="info-kicker">WHAT</span><p>{what}</p></section>
        <section><span className="info-kicker">HOW</span><p>{how}</p></section>
        <section><span className="info-kicker">WHY IT MATTERS</span><p>{why}</p></section>
      </div>
      <div className="model-note"><Icon name="info" size={15} /><span>Simplified educational model · not to scale</span></div>
    </div>
  </aside>;
}
