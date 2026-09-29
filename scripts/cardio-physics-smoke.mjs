import assert from 'node:assert/strict';
import { CardioPhysiologyEngine } from '../src/lib/CardioPhysiologyEngine.js';

const engine = new CardioPhysiologyEngine();
for (let index = 0; index < 200; index += 1) {
  const phase = index / 200;
  const wave = engine.waveformAt(phase);
  const valves = engine.valveStates(wave);
  assert.equal(valves.mitral, wave.atrial > wave.ventricular);
  assert.equal(valves.tricuspid, wave.atrial > wave.ventricular);
  assert.equal(valves.aortic, wave.ventricular > wave.aortic);
  assert.equal(valves.pulmonary, wave.ventricular > wave.pulmonary);
}
// R2: the drawn pressure gradients must cross on the state machine's valve
// event phases, otherwise captions and traces would disagree again.
const N = 4000;
const waves = Array.from({ length: N }, (_, index) => engine.waveformAt(index / N));
const cross = (predicate, from) => {
  for (let index = Math.floor(from * N); index < N; index += 1) if (predicate(waves[index], waves[index - 1] || waves[index])) return index / N;
  return null;
};
const avClose = cross((w) => w.ventricular > w.atrial, 0.05);
const slOpen = cross((w) => w.ventricular > w.aortic, 0.12);
const slClose = cross((w) => w.ventricular < w.aortic, 0.4);
const avOpen = cross((w) => w.ventricular < w.atrial, 0.52);
assert.ok(avClose !== null && Math.abs(avClose - 0.1) <= 0.012, `AV close ${avClose}`);
assert.ok(slOpen !== null && Math.abs(slOpen - 0.16) <= 0.012, `semilunar open ${slOpen}`);
assert.ok(slClose !== null && Math.abs(slClose - 0.5) <= 0.015, `semilunar close ${slClose}`);
assert.ok(avOpen !== null && Math.abs(avOpen - 0.57) <= 0.015, `AV open ${avOpen}`);
const snapshot = engine.getSnapshot();
assert.ok(snapshot.normalizedPressures?.leftVentricle !== undefined);
assert.ok(snapshot.valveGradients?.pulmonary !== undefined);
engine.dispose();
console.log(`Cardio pressure/valve invariants passed (200 sampled phases; crossings ${avClose?.toFixed(3)}/${slOpen?.toFixed(3)}/${slClose?.toFixed(3)}/${avOpen?.toFixed(3)})`);
