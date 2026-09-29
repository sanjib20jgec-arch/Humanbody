import assert from 'node:assert/strict';
import { ventilationStateAt, sampleVentilationTrace } from '../src/lib/VentilationModel.js';
import { conductionStateAt, REFLEX_SEGMENTS, REFLEX_TOTAL_MS, segmentStarts } from '../src/lib/NerveConductionModel.js';

const errors = [];

// Ventilation: phase invariants.
for (let i = 0; i < 200; i += 1) {
  const phase = i / 200;
  const state = ventilationStateAt(phase, 12, 500);
  if (!Number.isFinite(state.alveolarPressure) || !Number.isFinite(state.intrapleuralPressure)) errors.push(`non-finite pressure at ${phase}`);
  if (state.intrapleuralPressure >= 0) errors.push(`intrapleural pressure must stay sub-atmospheric in this teaching model (phase ${phase})`);
  // Inspiration: alveolar pressure below atmospheric; expiration above.
  if (state.inhaling && state.alveolarPressure > 0.001 && state.label.includes('Inspiration')) errors.push(`inspiration must lower alveolar pressure (phase ${phase})`);
  if (!state.inhaling && phase > 0.52 && state.alveolarPressure < -0.001) errors.push(`expiration must raise alveolar pressure (phase ${phase})`);
}
// Determinism + wrap.
if (JSON.stringify(ventilationStateAt(0.25)) !== JSON.stringify(ventilationStateAt(1.25))) errors.push('ventilation model is not phase-periodic');
// Deeper breaths swing pressure further.
if (Math.abs(ventilationStateAt(0.25, 12, 800).alveolarPressure) <= Math.abs(ventilationStateAt(0.25, 12, 300).alveolarPressure)) errors.push('depth must scale pressure swing');
// Trace sampling is total.
if (sampleVentilationTrace(10).length !== 10) errors.push('trace sampling broken');

// Conduction: ordering and monotonic completion.
if (REFLEX_TOTAL_MS !== REFLEX_SEGMENTS.reduce((sum, segment) => sum + segment.durationMs, 0)) errors.push('reflex total mismatch');
const starts = segmentStarts();
for (let i = 1; i < starts.length; i += 1) if (!(starts[i].startMs > starts[i - 1].startMs)) errors.push('segment starts must be ordered');
const before = conductionStateAt(REFLEX_TOTAL_MS - 1).complete;
const after = conductionStateAt(REFLEX_TOTAL_MS + 1).complete;
if (before || !after) errors.push('completion boundary broken');
if (!conductionStateAt(-5).elapsedMs === 0 ? false : conductionStateAt(-5).elapsedMs !== 0) errors.push('negative time must clamp');
if (conductionStateAt(3).segment !== 'receptor' || conductionStateAt(10).segment !== 'sensory') errors.push('segment lookup broken');

// R4 (H2/P1): withdrawal reflex timing must sit in the real Aδ-mediated range,
// not the old monosynaptic-reflex ballpark of 65 ms.
if (REFLEX_TOTAL_MS < 150 || REFLEX_TOTAL_MS > 500) errors.push(`reflex total ${REFLEX_TOTAL_MS} ms outside the real withdrawal range (150–500 ms)`);

// R4 (M4/P7): enzyme temperature response must be asymmetric — gentle falloff
// below optimum, steep denaturation cliff above it.
const { EnzymeKineticsEngine, ENZYME_PROFILES } = await import('../src/lib/EnzymeKineticsEngine.js');
const enzyme = new EnzymeKineticsEngine('amylase');
if (Math.abs(enzyme.temperatureFactor(37) - 1) > 1e-9) errors.push('temperature factor must be 1 at optimum');
if (enzyme.temperatureFactor(50) > 0.01) errors.push(`activity at 50 °C must collapse (got ${enzyme.temperatureFactor(50)})`);
if (enzyme.temperatureFactor(42) < 0.5) errors.push('mild falloff expected at 42 °C');
const coldLoss = enzyme.temperatureFactor(37 - 13);
const hotLoss = enzyme.temperatureFactor(37 + 13);
if (!(hotLoss < coldLoss)) errors.push('heat denaturation must exceed cold falloff (asymmetry)');

// R4 (M5/P8): pancreatic lipase yields 2-monoacylglycerol + fatty acids.
if (!/2-monoacylglycerol/.test(ENZYME_PROFILES.lipase.products)) errors.push('lipase products must list 2-monoacylglycerol');

// R4 (L2/L6): digestion stages carry the neutralization + pepsinogen corrections.
const { DIGESTIVE_STAGES } = await import('../src/lib/DigestiveStageMachine.js');
const smallIntestine = DIGESTIVE_STAGES.find((stage) => stage.id === 'small-intestine');
const stomach = DIGESTIVE_STAGES.find((stage) => stage.id === 'stomach');
if (!/neutraliz/i.test(smallIntestine.caption)) errors.push('small-intestine caption must explain bicarbonate neutralization');
if (!stomach.sideInputs.some((input) => /pepsinogen/i.test(input))) errors.push('stomach side inputs must show pepsinogen activation');

assert.deepEqual(errors, [], `Ventilation/nerve model errors: ${errors.join('; ')}`);
console.log(`Ventilation and nerve conduction smoke passed (${REFLEX_TOTAL_MS} ms reflex teaching total; enzyme cliff ${enzyme.temperatureFactor(50).toExponential(1)} @50 °C)`);
