/**
 * Phase 55 · R4 retimed: deterministic nerve-conduction teaching model.
 *
 * Conduction is shown as route segments with educational timing, not
 * electrophysiology. The arc models WITHDRAWAL from a hot surface, which is
 * Aδ-mediated and polysynaptic — measured EMG onset of the withdrawal reflex is
 * ~65–150 ms (PMC9872115; PLOS One 2024), slower than a monosynaptic stretch
 * reflex (~30–50 ms); visible limb movement follows a little later. Segment
 * durations below sum to ~200 ms (to visible shortening) so the teaching point ("reflex beats conscious perception")
 * survives with exam-defensible magnitudes. The reflex arc completes far
 * faster than conscious perception — that ordering is preserved here as
 * explicit event timings.
 */
export const CONDUCTION_DISCLOSURE = 'Teaching timing for an Aδ-mediated withdrawal reflex (measured reflex muscle onset ≈ 65–150 ms; visible movement follows shortly after); values are approximations, not measured electrophysiology.';

export const REFLEX_SEGMENTS = [
  { id: 'receptor', label: 'Skin receptor', detail: 'Heat is transduced by nociceptors into a receptor potential.', durationMs: 8 },
  { id: 'sensory', label: 'Sensory neuron', detail: 'Pain travels up slow Aδ fibers (~15 m/s) toward the spinal cord.', durationMs: 50 },
  { id: 'relay', label: 'Spinal relay', detail: 'Polysynaptic interneuron chain inside the cord — each synapse adds delay.', durationMs: 25 },
  { id: 'motor', label: 'Motor neuron', detail: 'The command races down fast Aα motor axons toward the arm.', durationMs: 12 },
  { id: 'effector', label: 'Effector muscle', detail: 'Neuromuscular transmission, excitation–contraction coupling, then visible shortening.', durationMs: 105 }
];

export const REFLEX_TOTAL_MS = REFLEX_SEGMENTS.reduce((sum, segment) => sum + segment.durationMs, 0);

export function conductionStateAt(elapsedMs = 0) {
  const clamped = Math.max(0, Number(elapsedMs) || 0);
  let cursor = 0;
  for (const segment of REFLEX_SEGMENTS) {
    if (clamped < cursor + segment.durationMs) {
      return {
        segment: segment.id,
        label: segment.label,
        detail: segment.detail,
        progress: (clamped - cursor) / segment.durationMs,
        elapsedMs: clamped,
        complete: false
      };
    }
    cursor += segment.durationMs;
  }
  const last = REFLEX_SEGMENTS[REFLEX_SEGMENTS.length - 1];
  return { segment: last.id, label: last.label, detail: 'Withdrawal complete; the brain learns about the stimulus afterwards.', progress: 1, elapsedMs: clamped, complete: true };
}

export function segmentStarts() {
  let cursor = 0;
  return REFLEX_SEGMENTS.map((segment) => {
    const start = cursor;
    cursor += segment.durationMs;
    return { id: segment.id, label: segment.label, startMs: start };
  });
}
