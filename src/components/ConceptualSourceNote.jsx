import React from 'react';
import { getConceptualSourceReview } from '../data/learningSources.js';

export default function ConceptualSourceNote({ moduleId }) {
  const review = getConceptualSourceReview(moduleId);
  if (!review) return null;
  return <aside className="conceptual-source-note" aria-label={`${review.label} reviewed conceptual source`}>
    <div><span className="eyebrow">REVIEWED CONCEPTUAL SOURCE</span><strong>{review.label}</strong><p>{review.scope}</p></div>
    <div className="conceptual-source-meta"><a href={review.source.url} target="_blank" rel="noreferrer">{review.source.title} ↗</a><small>{review.source.license} · {review.threeDStatus}</small></div>
  </aside>;
}
