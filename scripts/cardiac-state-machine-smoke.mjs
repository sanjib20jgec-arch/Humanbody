import assert from 'node:assert/strict';
import { CARDIAC_STATES, CARDIAC_VALVE_EVENTS, cardiacStateAt, valveStateAt, createValveTracker, splitRightLeft, describeCardiacPhase, normalizePhase } from '../src/lib/CardiacCycleStateMachine.js';

const errors = [];

// States must tile the cycle without gaps or overlaps.
for (let boundary = 0; boundary < 1; boundary += 0.0005) {
  const state = cardiacStateAt(boundary);
  if (!state) errors.push(`no state at phase ${boundary}`);
}
CARDIAC_STATES.forEach((state, index) => {
  const next = CARDIAC_STATES[index + 1];
  if (next && Math.abs(state.to - next.from) > 1e-9) errors.push(`gap between ${state.id} and ${next.id}`);
});

// Canonical sequence: one full sweep must visit states in order.
const order = [];
for (let i = 0; i < 2000; i += 1) {
  const state = cardiacStateAt(i / 2000).id;
  if (order[order.length - 1] !== state) order.push(state);
}
assert.deepEqual(order, CARDIAC_STATES.map((state) => state.id), `unexpected state order: ${order.join(',')}`);

// Valve events must fire in canonical order during a forward sweep.
const tracker = createValveTracker();
const transitions = [];
let previous = tracker.update(0);
for (let i = 1; i <= 2000; i += 1) {
  const phase = i / 2000;
  const next = tracker.update(phase);
  Object.keys(next).forEach((valve) => {
    if (next[valve] !== previous[valve]) transitions.push({ phase, valve, open: next[valve] });
  });
  previous = next;
}
// Across one cycle each valve should change state exactly twice.
['mitral', 'tricuspid', 'aortic', 'pulmonary'].forEach((valve) => {
  const count = transitions.filter((transition) => transition.valve === valve).length;
  if (count !== 2) errors.push(`${valve} changed state ${count} times, expected 2`);
});

// Flicker guard: sitting exactly on a boundary must not oscillate state.
const boundaryTracker = createValveTracker();
const onBoundary = [0.1, 0.16, 0.5, 0.57];
onBoundary.forEach((phase) => {
  const first = JSON.stringify(boundaryTracker.update(phase));
  for (let repeat = 0; repeat < 12; repeat += 1) {
    if (JSON.stringify(boundaryTracker.update(phase)) !== first) errors.push(`valve flicker at boundary ${phase}`);
  }
});

// Determinism: the same phase always yields the same state.
for (let i = 0; i < 200; i += 1) {
  const phase = i / 200;
  const a = describeCardiacPhase(phase);
  const b = describeCardiacPhase(phase + 1);
  if (a.state !== b.state || a.caption !== b.caption) errors.push(`non-deterministic state at phase ${phase}`);
}

// Right/left split: right-side pressures stay below systemic at teaching scale.
const sample = splitRightLeft({ atrial: 6, ventricular: 110, aortic: 95, pulmonary: 22 });
if (!(sample.rightVentricle < sample.leftVentricle)) errors.push('right ventricle pressure must stay below left ventricle');
if (!(sample.pulmonaryTrunk < sample.aorta)) errors.push('pulmonary pressure must stay below aortic pressure');

// OpenStax ordering: AV close (0.1) < semilunar open (0.16) < semilunar close (0.5) < AV open (0.57).
const phases = CARDIAC_VALVE_EVENTS.map((event) => event.phase);
for (let i = 1; i < phases.length; i += 1) if (!(phases[i] > phases[i - 1])) errors.push('valve event order broken');

// Every state must carry a caption and a flow description.
CARDIAC_STATES.forEach((state) => {
  if (!state.caption || !state.flow) errors.push(`${state.id} needs caption and flow`);
});

// normalizePhase wraps negative and >1 input.
if (normalizePhase(-0.25) !== 0.75 || normalizePhase(1.25) !== 0.25) errors.push('normalizePhase wrap broken');

assert.deepEqual(errors, [], `Cardiac state machine errors: ${errors.join('; ')}`);
console.log(`Cardiac state machine smoke passed (${CARDIAC_STATES.length} states, ${CARDIAC_VALVE_EVENTS.length} valve events, 2000-phase sweep)`);
