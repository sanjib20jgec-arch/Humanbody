// Repair tool: re-applies the Phase 88/92 additions to the two kinesiology lib
// files if a sandbox snapshot rollback ever strips them again. Idempotent.
// Usage: node scripts/restore-lib-additions.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(process.cwd());
let changed = 0;

const tracks = resolve(root, 'src/lib/kinesiology/authoredTracks.js');
let s = readFileSync(tracks, 'utf8');
if (!s.includes('CLINICAL_PATTERNS')) {
  s += `

// Phase 92 (C6/D7): clinical comparison patterns — exaggerated teaching
// caricatures rendered as a translucent ghost beside the captured normal gait.
// Explicitly NOT diagnostic; mapped to Kinesiology II pathology introductions.
export const CLINICAL_PATTERNS = [
  {
    id: 'trendelenburg',
    label: 'Trendelenburg-style drop (caricature)',
    pose: (t) => {
      const p = gait(t, { period: 1.1, hip: 26, knee: 46, arm: 16, bounce: 0.016, trunk: 4 });
      const ph = (2 * Math.PI * t) / 1.1;
      const stanceL = Math.max(0, Math.sin(ph));
      p.root.rz = (p.root.rz || 0) + 7 * stanceL;
      p.spine.y = (p.spine.y || 0) - 5 * stanceL;
      return p;
    }
  },
  {
    id: 'antalgic',
    label: 'Antalgic-style short stance (caricature)',
    pose: (t) => {
      const p = gait(t, { period: 1.1, hip: 22, knee: 40, arm: 14, bounce: 0.012, trunk: 6 });
      const ph = (2 * Math.PI * t) / 1.1;
      const L = Math.max(0, Math.sin(ph));
      p.leftUpLeg.x *= 1 - 0.35 * L;
      p.leftLeg.x *= 1 - 0.3 * L;
      p.root.y *= 0.7;
      return p;
    }
  }
];
`;
  writeFileSync(tracks, s);
  changed++;
}

const actions = resolve(root, 'src/lib/kinesiology/actions.js');
s = readFileSync(actions, 'utf8');
if (!s.includes('COACH_CUES')) {
  s += `

// Phase 88 (D1): external-focus coaching cues (motor-learning evidence), keyed by action.
export const COACH_CUES = {
  walk: [
    'Walk tall — a string lifts the crown of the head.',
    'Push the ground behind you instead of pulling yourself forward.',
    'Aim for quiet, soft footfalls.'
  ],
  run: [
    'Spring off the ground — spend as little time touching it as you can.',
    'Drive the elbows back; the legs follow.',
    'Land softly under your hips, not out in front.'
  ],
  jump: [
    'Sink into the floor like a spring loading, then release.',
    'Swing the arms up first; the body follows the arms.',
    'Land like a cat — bend, absorb, no noise.'
  ],
  wave: [
    'Lift from the shoulder, keep the elbow soft.',
    'Let the wrist do the talking, not the whole arm.',
    'Keep the shoulder blade down while the arm rises.'
  ],
  handshake: [
    'Pump from the elbow, keep the wrist relaxed.',
    'Match the other hand’s speed — two to three smooth pumps.',
    'Keep the shoulder heavy; only the forearm travels.'
  ],
  chew: [
    'Let the jaw hinge smoothly — no grinding sideways.',
    'Keep the lips softly closed; the tongue does the steering.',
    'Chew evenly on both sides.'
  ],
  talk: [
    'Let the breath fall out; don’t push the words.',
    'Keep the jaw loose — the words ride the airflow.',
    'Stand tall but soft; the voice travels through an open chest.'
  ]
};
`;
}
for (const [src, repl] of [
  ["caption: 'Tibialis anterior controls foot slap; quadriceps work eccentrically; gluteus medius steadies the pelvis.' }", "caption: 'Tibialis anterior controls foot slap; quadriceps work eccentrically; gluteus medius steadies the pelvis.', ext: 'Land softly — let the heel kiss the ground, then roll forward like a wheel.' }"],
  ["caption: 'Soleus advances the tibia; gluteus medius keeps the pelvis level over the stance leg.' }", "caption: 'Soleus advances the tibia; gluteus medius keeps the pelvis level over the stance leg.', ext: 'Roll over a steady, level hip — imagine the pelvis is a glass of water.' }"],
  ["caption: 'Gastrocnemius–soleus generate push-off; hip flexors pre-load the swing.' }", "caption: 'Gastrocnemius–soleus generate push-off; hip flexors pre-load the swing.', ext: 'Push the ground behind you; leave it moving backwards, not you pulling forwards.' }"],
  ["caption: 'Iliopsoas and rectus femoris drive the leg forward; tibialis anterior clears the foot; hamstrings decelerate before heel strike.' }", "caption: 'Iliopsoas and rectus femoris drive the leg forward; tibialis anterior clears the foot; hamstrings decelerate before heel strike.', ext: 'Swing the leg through like a pendulum; keep the toes clear and quiet.' }"],
]) {
  if (s.includes(src)) {
    s = s.replace(src, repl);
    changed++;
  }
}
writeFileSync(actions, s);
console.log(`restore-lib-additions: ${changed ? 'applied' : 'already complete'}`);
