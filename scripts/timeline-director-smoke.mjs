import assert from 'node:assert/strict';
import { TimelineDirector } from '../src/lib/TimelineDirector.js';

const errors = [];

// Determinism: two identically scripted directors produce identical streams.
function scriptRun() {
  const director = new TimelineDirector({ duration: 1 });
  const seen = [];
  director.register('cardio', {
    events: [{ id: 'e1', phase: 0.25, label: 'first' }, { id: 'e2', phase: 0.6, label: 'second' }],
    sample: (phase) => ({ phase })
  });
  director.onEvent((event) => seen.push(`${event.participant}:${event.id}`));
  for (let i = 0; i < 100; i += 1) director.step(0.01);
  director.seek(0);
  for (let i = 0; i < 100; i += 1) director.step(0.01);
  return seen.join(',');
}
if (scriptRun() !== scriptRun()) errors.push('director event stream is not deterministic');

// Seek determinism: same phase → same sampled state.
const director = new TimelineDirector({ duration: 2 });
director.register('model', { sample: (phase) => ({ value: Math.round(phase * 1000) / 1000 }) });
for (let i = 0; i < 200; i += 1) {
  const phase = i / 200;
  const a = director.seek(phase).states.model.value;
  const b = director.seek(phase + 1).states.model.value;
  if (a !== b) errors.push(`seek non-deterministic at ${phase}`);
}

// Scrub back and forth: event indices reset on seek, no duplicate storms.
const events = [];
const eventDirector = new TimelineDirector({ duration: 1 });
eventDirector.register('p', { events: [{ id: 'a', phase: 0.3 }, { id: 'b', phase: 0.7 }], sample: () => null });
eventDirector.onEvent((event) => events.push(event.id));
eventDirector.seek(0.5);
if (JSON.stringify(events) !== JSON.stringify(['a'])) errors.push(`seek should replay crossed events once, got ${events.join(',')}`);
eventDirector.step(0.3);
if (JSON.stringify(events) !== JSON.stringify(['a', 'b'])) errors.push(`step should emit newly crossed events, got ${events.join(',')}`);

// Serialize round-trip restores identical state.
const source = new TimelineDirector({ duration: 1 });
source.register('p', { sample: (phase) => phase });
source.seek(0.42);
const restored = new TimelineDirector({ duration: 1 });
restored.register('p', { sample: (phase) => phase });
restored.restore(source.serialize());
if (Math.abs(restored.phase - 0.42) > 1e-9) errors.push('restore round-trip lost phase');

// Speed clamping keeps playback bounded.
const clamped = new TimelineDirector({ duration: 1 });
if (clamped.setSpeed(99).speed !== 4 || clamped.setSpeed(-3).speed !== 0.1) errors.push('speed clamping broken');

assert.deepEqual(errors, [], `Timeline director errors: ${errors.join('; ')}`);
console.log('Timeline director smoke passed (determinism, events, seek, round-trip, speed clamp)');
