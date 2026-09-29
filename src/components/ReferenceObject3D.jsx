import React, { lazy, Suspense, useMemo } from 'react';
import { Icon } from './Icons';
import { getAnatomyReference } from '../data/anatomyRegistry.js';
import ErrorBoundary from './ErrorBoundary.jsx';

const BodyMap3DAtlas = lazy(() => import('./BodyMap3DAtlas'));

/**
 * Focused, source-derived 3D reference object for a Guided Path bay.
 * The atlas renderer owns rotation, touch gestures, labels, layer loading,
 * keyboard controls, reduced-motion behavior, and the accessible fallback.
 */
export default function ReferenceObject3D({ registryId, label, systems, source, sourceUrl, limitation, reducedMotion = false, quality = 'auto', onSelect, teachingOverlay = null }) {
  const registry = getAnatomyReference(registryId);
  const stableSystems = useMemo(() => systems || registry?.systems || [], [systems?.join('|'), registry?.id]);
  const resolvedLabel = label || registry?.label || 'Anatomy reference object';
  const resolvedSource = source || registry?.source?.dataset || 'Reference anatomy source';
  const resolvedSourceUrl = sourceUrl || registry?.source?.url || '#';
  const resolvedLimitation = limitation || registry?.limitation || 'Simplified educational reference; not to scale.';
  const representationLabel = registry?.representation === 'simplified-teaching' ? 'SIMPLIFIED TEACHING MODEL' : 'SOURCE MESH';
  return <section className="reference-object-panel" aria-label={`${resolvedLabel} certified 3D reference object`}>
    <div className="reference-object-heading">
      <div><span className="eyebrow">CERTIFIED 3D REFERENCE · BODYPARTS3D 4.0</span><h3>{resolvedLabel}</h3><p>Rotate 360° with drag or touch. Use pinch to zoom, two-finger pan, keyboard arrows, and Reset view. Select a visible structure for labels and function.</p></div>
      <span className="reference-object-badge">{representationLabel}</span>
    </div>
    <Suspense fallback={<div className="reference-object-loading" role="status">Loading certified 3D reference…</div>}><ErrorBoundary label={label || 'certified 3D reference'}><BodyMap3DAtlas focusSystems={stableSystems} focusLabel={resolvedLabel} viewPresets={registry?.viewPresets || []} teachingOverlay={teachingOverlay} reducedMotion={reducedMotion} quality={quality} onAnatomySelect={onSelect} /></ErrorBoundary></Suspense>
    <div className="reference-object-note"><span><strong>Reference:</strong> {resolvedSource} · <a href={resolvedSourceUrl} target="_blank" rel="noreferrer">source and license ↗</a></span><span><strong>Representation:</strong> {registry?.source?.scale || 'Educational reference; not to scale.'}</span><span><strong>Limitation:</strong> {resolvedLimitation}</span></div>
    {teachingOverlay?.label && <div className="reference-object-overlay-note" aria-live="polite"><span className="reference-object-overlay-dot" aria-hidden="true" /><span><strong>Teaching overlay:</strong> {teachingOverlay.label}{teachingOverlay.status ? ` ${teachingOverlay.status}` : ''}</span></div>}
    {registry?.teachingModels?.length > 0 && <div className="reference-object-models"><Icon name="info" size={13} /><span>Separate teaching models: {registry.teachingModels.join(' · ')}.</span></div>}
  </section>;
}
