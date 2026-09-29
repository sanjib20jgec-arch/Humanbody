/**
 * Phase 50: deterministic ventilation teaching model.
 *
 * Breathing is driven by pressure differences, not by the lungs pulling air
 * in. This model produces educational-scale alveolar and intrapleural
 * pressures plus airflow from a breath phase, rate, and tidal volume. It is
 * a conceptual model: the certified atlas contains airways but NO lung
 * parenchyma, and nothing here animates the source mesh.
 */
export const VENTILATION_DISCLOSURE = 'Conceptual ventilation model. The atlas has airway geometry but no lung parenchyma; pressures are teaching values.';

export function normalizeBreathPhase(phase = 0) {
  return ((phase % 1) + 1) % 1;
}

export function ventilationStateAt(phase = 0, rate = 12, depthMl = 500) {
  const p = normalizeBreathPhase(phase);
  const inhaling = p < 0.5;
  const breathShape = Math.sin(Math.PI * p);
  // Educational scaling: quiet breathing swings alveolar pressure about ±1 cmH2O.
  const depthFactor = Math.max(0.4, Math.min(2, depthMl / 500));
  const alveolarPressure = (inhaling ? -1 : 1) * breathShape * depthFactor;
  const intrapleuralPressure = -5 + (inhaling ? -1 : 0.6) * breathShape * depthFactor;
  // R3 fix: full tidal excursion — 0 at end-expiration, VT at end-inspiration.
  const volumeMl = depthMl * (0.5 - 0.5 * Math.cos(Math.PI * 2 * p));
  const flow = inhaling ? breathShape * depthFactor : -breathShape * depthFactor * 0.9;
  return {
    phase: p,
    inhaling,
    label: inhaling ? 'Inspiration — diaphragm contracts, pressure falls, air moves in' : 'Expiration — elastic recoil raises pressure, air moves out',
    alveolarPressure: Math.round(alveolarPressure * 100) / 100,
    intrapleuralPressure: Math.round(intrapleuralPressure * 100) / 100,
    volumeMl: Math.round(Math.max(0, volumeMl)),
    flow: Math.round(flow * 100) / 100,
    minuteVentilation: Math.round(rate * depthMl / 100) / 10
  };
}

export function sampleVentilationTrace(count = 120, rate = 12, depthMl = 500) {
  return Array.from({ length: count }, (_, index) => ventilationStateAt(index / count, rate, depthMl));
}
