// Kinesiology Theater action registry (Phase 74 curation pass).
// Activation windows: [start, end, peak] in normalized cycle time (raised-cosine bump).
// Roles are CURATED per action (M7); peak-derivation remains only as fallback.

import { AUTHORED_ACTIONS } from './authoredTracks.js';

const both = (id) => [`${id}.L`, `${id}.R`];
const spread = (keys, fn) => Object.fromEntries(keys.map((k) => [k, fn(k)]));
const bump = (t, a, b, peak) => {
  if (t < a || t > b) return 0;
  const x = (t - a) / (b - a);
  return peak * 0.5 * (1 - Math.cos(2 * Math.PI * x));
};

function track(id, phases, activations, opts = {}) {
  return { id, source: AUTHORED_ACTIONS[id].source, duration: AUTHORED_ACTIONS[id].duration, loop: AUTHORED_ACTIONS[id].loop, phases, activations, focus: opts.focus, roles: opts.roles || {} };
}

export const ACTIONS = [
  {
    id: 'tiptoe-walk', source: 'authored', duration: 2.2, loop: true, focus: 'leftLeg',
    phases: [
      { name: 'Rise & roll', until: 0.5, caption: 'Gastrocnemius and soleus hold the heels up and drive push-off on every step; tibialis anterior works to keep the toes from slapping.', ext: 'Walk like the floor is hot - tall and light.' },
      { name: 'Step through', until: 1, caption: 'Calf carries body weight through stance; quads and hip extensors stabilise the knee and trunk.', ext: 'Small quick steps, no wobbling.' }
    ],
    activations: (t) => ({ ...spread(both('gastrocnemius'), () => 0.8), ...spread(both('soleus'), () => 0.9), ...spread(both('tibialisAnterior'), () => 0.4), ...spread(both('quadriceps'), () => 0.4), erectorSpinae: 0.3 }),
    roles: { ...spread(both('gastrocnemius'), () => 'PM'), ...spread(both('soleus'), () => 'PM') }
  },
  {
    id: 'heel-walk', source: 'authored', duration: 2.2, loop: true, focus: 'leftLeg',
    phases: [
      { name: 'Heel-first', until: 0.5, caption: 'Tibialis anterior fires hard to hold the toes up; calf is quiet; hamstrings help control the knee.', ext: 'Toes to the sky, roll the foot in.' },
      { name: 'Controlled roll', until: 1, caption: 'Without push-off, hip flexors and quads do extra work to pull the body forward - a classic calf-sparing drill.', ext: 'Slow, deliberate steps.' }
    ],
    activations: (t) => ({ ...spread(both('tibialisAnterior'), () => 0.9), ...spread(both('quadriceps'), () => 0.5), ...spread(both('hamstrings'), () => 0.4), ...spread(both('iliopsoas'), () => 0.5), ...spread(both('soleus'), () => 0.15) }),
    roles: { ...spread(both('tibialisAnterior'), () => 'PM'), ...spread(both('quadriceps'), () => 'SY'), ...spread(both('iliopsoas'), () => 'ST') }
  },
  {
    id: 'bow', source: 'authored', duration: 3, loop: true, focus: 'spine',
    phases: [
      { name: 'Hinge down', until: 0.4, caption: 'Hamstrings lengthen under load (eccentric); erector spinae control the rounding; glutes counter-balance.', ext: 'Fold at the hips, long spine.' },
      { name: 'Rise', until: 1, caption: 'Gluteus maximus and hamstrings concentrically extend the hip; erectors stack the vertebrae back up.', ext: 'Roll up slow, head last.' }
    ],
    activations: (t) => {
      const d = bump(t, 0, 0.4, 0.9); const u = bump(t, 0.4, 0.9, 1);
      return { ...spread(both('hamstrings'), () => 0.4 + d * 0.5 + u * 0.6), ...spread(both('gluteusMaximus'), () => 0.3 + u * 0.8), erectorSpinae: 0.5 + d * 0.3, rectusAbdominis: 0.35 };
    },
    roles: { ...spread(both('hamstrings'), () => 'PM'), ...spread(both('gluteusMaximus'), () => 'PM'), erectorSpinae: 'ST' }
  },
  {
    id: 'shrug', source: 'authored', duration: 2, loop: true, focus: 'chest',
    phases: [
      { name: 'Lift', until: 0.5, caption: 'Upper trapezius elevates the shoulder girdle; levator scapulae assist; neck stays quiet.', ext: 'Ears to shoulders - gently.' },
      { name: 'Release', until: 1, caption: 'Lower trapezius and gravity control the descent - letting the shoulders melt down.', ext: 'Long neck on the way down.' }
    ],
    activations: (t) => ({ ...spread(both('upperTrapezius'), () => 0.2 + bump(t, 0, 0.5, 0.9)), erectorSpinae: 0.2 })
  },
  {
    id: 'reach-up', source: 'authored', duration: 3, loop: true, focus: 'leftUpperArm',
    phases: [
      { name: 'Reach', until: 0.4, caption: 'Deltoid and supraspinatus lift the arm; serratus anterior rotates the shoulder blade upward; trunk lengthens.', ext: 'Reach for the top shelf.' },
      { name: 'Hold & lower', until: 1, caption: 'Latissimus dorsi and lower trapezius control the descent - the shoulder blade glides back down.', ext: 'Shoulders away from the ears.' }
    ],
    activations: (t) => {
      const r = bump(t, 0, 0.4, 0.9); const lo = bump(t, 0.4, 0.9, 0.7);
      return { ...spread(both('deltoid'), () => 0.3 + r), ...spread(both('supraspinatus'), () => 0.3 + r * 0.6), ...spread(both('serratusAnterior'), () => 0.3 + r * 0.6), ...spread(both('latissimusDorsi'), () => 0.2 + lo * 0.7) };
    }
  },
  {
    id: 'clap', source: 'authored', duration: 2, loop: true, focus: 'leftUpperArm',
    phases: [
      { name: 'Open-close', until: 1, caption: 'Pectoralis (simplified via deltoid/trunk coupling here) adducts the arms; biceps hold the elbow fold; rhythm lives in the trunk.', ext: 'Clap to a count of three.' }
    ],
    activations: (t) => ({ ...spread(both('deltoid'), () => 0.5), ...spread(both('bicepsBrachii'), () => 0.5), ...spread(both('tricepsBrachii'), () => 0.2), rectusAbdominis: 0.25 }),
    roles: { ...spread(both('deltoid'), () => 'PM'), ...spread(both('bicepsBrachii'), () => 'PM') }
  },
  {
    id: 'head-signals', source: 'authored', duration: 4, loop: true, focus: 'head',
    phases: [
      { name: 'Nod (yes)', until: 0.5, caption: 'Deep neck flexors and extensors alternate at the atlanto-occipital joint - the "yes" hinge.', ext: 'Small chin nods, not head bows.' },
      { name: 'Shake (no)', until: 1, caption: 'Rotators on both sides alternate - sternocleidomastoid (simplified here via neck coupling) drives the "no" rotation.', ext: 'Rotate, do not tilt.' }
    ],
    activations: (t) => ({ ...spread(both('upperTrapezius'), () => 0.25), erectorSpinae: 0.3, ...spread(both('digastric' in {} ? 'masseter' : 'masseter'), () => 0.05) })
  },
  {
    id: 'kick', source: 'authored', duration: 2.4, loop: true, focus: 'leftLeg',
    phases: [
      { name: 'Wind-up', until: 0.35, caption: 'Hip flexors load the swing leg; hamstrings keep the knee folded; support-leg quadriceps hold you upright.', ext: 'Fold the knee before you swing.' },
      { name: 'Kick', until: 0.65, caption: 'Quadriceps snap the knee extended while iliopsoas drives the hip; the trunk leans back to counter-balance.', ext: 'Snap through - toes pointed.' },
      { name: 'Return', until: 1, caption: 'Hamstrings decelerate the swing; hip extensors bring the leg home over the support leg.', ext: 'Land soft, stay tall.' }
    ],
    activations: (t) => {
      const k = bump(t, 0.35, 0.65, 1); const w = bump(t, 0.1, 0.35, 0.7);
      return { ...spread(both('quadriceps'), () => 0.3 + k), ...spread(both('iliopsoas'), () => 0.3 + k * 0.8), ...spread(both('hamstrings'), () => 0.3 + w * 0.5 + bump(t, 0.65, 1, 0.6)), ...spread(both('rectusFemoris'), () => k * 0.8), rectusAbdominis: 0.4, erectorSpinae: 0.35 };
    },
    roles: { ...spread(both('quadriceps'), () => 'PM'), ...spread(both('iliopsoas'), () => 'PM'), ...spread(both('rectusFemoris'), () => 'PM') }
  },
  {
    id: 'sidestep', source: 'authored', duration: 2.4, loop: true, focus: 'leftUpLeg',
    phases: [
      { name: 'Step left', until: 0.5, caption: 'Left hip abductors lead; right gluteus medius pushes the body sideways; adductors control the follow-through.', ext: 'Lead with the hip, not the shoulder.' },
      { name: 'Step right', until: 1, caption: 'The pattern mirrors: right abductors lead, left gluteus medius drives, trunk stays level.', ext: 'Quiet feet - level hips.' }
    ],
    activations: (t) => {
      const l = bump(t, 0, 0.5, 0.9); const r = bump(t, 0.5, 1, 0.9);
      return { 'gluteusMedius.L': 0.3 + r * 0.8, 'gluteusMedius.R': 0.3 + l * 0.8, ...spread(both('quadriceps'), () => 0.35), ...spread(both('tibialisAnterior'), () => 0.3 * (l + r)), rectusAbdominis: 0.3 };
    }
  },
  {
    id: 'one-leg', source: 'authored', duration: 3, loop: true, focus: 'leftUpLeg',
    phases: [
      { name: 'Lift', until: 0.3, caption: 'Support-leg gluteus medius fires hard to hold the pelvis level - the classic Trendelenburg test position.', ext: 'Grow tall on one leg.' },
      { name: 'Hold', until: 0.75, caption: 'Medius and deep hip rotators make small corrections; ankle invertors/evertors fine-tune balance.', ext: 'Still hips, quiet breathing.' },
      { name: 'Lower', until: 1, caption: 'Hip flexors ease the leg down; quadriceps absorb the return to two legs.', ext: 'Set the foot down like a feather.' }
    ],
    activations: (t) => {
      const u = bump(t, 0, 0.3, 0.8) + bump(t, 0.3, 0.75, 0.6) + bump(t, 0.75, 1, 0.5);
      return { 'gluteusMedius.L': 0.4 + u * 0.6, ...spread(both('quadriceps'), () => 0.3 + u * 0.2), ...spread(both('soleus'), () => 0.3 + u * 0.2), ...spread(both('iliopsoas'), () => u * 0.6), rectusAbdominis: 0.35, erectorSpinae: 0.3 };
    },
    roles: { 'gluteusMedius.L': 'PM' }
  },
  {
    id: 'squat', source: 'authored', duration: 3, loop: true, focus: 'leftLeg',
    phases: [
      { name: 'Descent', until: 0.4, caption: 'Quadriceps and gluteus maximus work eccentrically to lower the body; erector spinae keep the trunk upright.', ext: 'Sit back slowly, like reaching for a low chair.' },
      { name: 'Turnaround', until: 0.55, caption: 'Hip and knee moments peak; hamstrings co-contract to steady the knee.', ext: 'Pause - weight in the mid-foot, chest tall.' },
      { name: 'Ascent', until: 1, caption: 'Quadriceps and gluteus maximus drive concentrically; soleus stabilises the ankle.', ext: 'Push the floor away until fully tall.' }
    ],
    activations: (t) => {
      const d = bump(t, 0, 0.4, 0.9) + bump(t, 0.55, 1, 1);
      return { ...spread(both('quadriceps'), () => d), ...spread(both('gluteusMaximus'), () => d * 0.85), ...spread(both('hamstrings'), () => 0.3 + d * 0.4), ...spread(both('soleus'), () => 0.3), erectorSpinae: 0.5, rectusAbdominis: 0.3 };
    },
    roles: { erectorSpinae: 'ST' }
  },
  {
    id: 'sit-stand', source: 'authored', duration: 4, loop: true, focus: 'leftLeg',
    phases: [
      { name: 'Seated', until: 0.2, caption: 'Hip flexed about 90 degrees; hip flexors hold the posture while quadriceps stay quiet. Caricature: no seat rendered.', ext: 'Tall spine before you move.' },
      { name: 'Rising', until: 0.45, caption: 'Quadriceps and gluteus maximus generate the stand; the trunk leans forward to bring the centre of mass over the feet.', ext: 'Nose over toes, then push up.' },
      { name: 'Standing', until: 0.7, caption: 'Hip and knee extensors settle into quiet stance; soleus controls sway.', ext: 'Finish tall - squeeze gently.' },
      { name: 'Lowering', until: 1, caption: 'Quadriceps brake the descent eccentrically; tibialis anterior keeps the shins balanced.', ext: 'Slow sit - four counts down.' }
    ],
    activations: (t) => {
      const up = bump(t, 0.2, 0.45, 1) + bump(t, 0.7, 1, 0.8);
      return { ...spread(both('quadriceps'), () => up), ...spread(both('gluteusMaximus'), () => up * 0.9), ...spread(both('iliopsoas'), () => 0.4 * (t < 0.2 || t > 0.85 ? 1 : 0.2)), ...spread(both('tibialisAnterior'), () => 0.3 * up), erectorSpinae: 0.45 };
    }
  },
  {
    id: 'lunge', source: 'authored', duration: 3, loop: true, focus: 'leftUpLeg',
    phases: [
      { name: 'Sink', until: 0.4, caption: 'Front-leg quadriceps and gluteus maximus load eccentrically; rear-leg iliopsoas lengthens; gluteus medius blocks pelvic drop.', ext: 'Drop the back knee straight down.' },
      { name: 'Push back', until: 1, caption: 'Front-leg hip extensors drive the return; the rear calf assists push-off.', ext: 'Push through the front heel.' }
    ],
    activations: (t) => {
      const l = bump(t, 0, 0.4, 0.9) + bump(t, 0.4, 0.9, 1);
      return { ...spread(both('quadriceps'), () => l), ...spread(both('gluteusMaximus'), () => l * 0.8), ...spread(both('hamstrings'), () => 0.3 + l * 0.3), ...spread(both('gluteusMedius'), () => 0.3 + l * 0.3), ...spread(both('gastrocnemius'), () => 0.4 * l), rectusAbdominis: 0.3 };
    }
  },
  {
    // Duration follows the baked clip grid (64 frames @ 30 fps). The source
    // capture is a walk *and* turn; the straight, loopable cycle is frames 0-63
    // (see scripts/bake-motion-assets.mjs for the measured basis).
    id: 'walk', source: 'cmu', clip: 'walk_cmu.bvh', duration: 64 / 30, loop: true, focus: 'leftLeg',
    phases: [
      { name: 'Heel strike / loading', rla: 'Initial contact + loading response', trad: 'Heel strike / foot flat', until: 0.15, caption: 'Tibialis anterior controls foot slap; quadriceps work eccentrically; gluteus medius steadies the pelvis.', ext: 'Land softly — let the heel kiss the ground, then roll forward like a wheel.' },
      { name: 'Mid-stance', rla: 'Mid-stance', trad: 'Mid-stance', until: 0.4, caption: 'Soleus advances the tibia; gluteus medius keeps the pelvis level over the stance leg.', ext: 'Roll over a steady, level hip — imagine the pelvis is a glass of water.' },
      { name: 'Push-off', rla: 'Terminal stance + pre-swing', trad: 'Heel-off / push-off', until: 0.6, caption: 'Gastrocnemius–soleus generate push-off; hip flexors pre-load the swing.', ext: 'Push the ground behind you; leave it moving backwards, not you pulling forwards.' },
      { name: 'Swing', rla: 'Initial, mid & terminal swing', trad: 'Swing', until: 1, caption: 'Iliopsoas and rectus femoris drive the leg forward; tibialis anterior clears the foot; hamstrings decelerate before heel strike.', ext: 'Swing the leg through like a pendulum; keep the toes clear and quiet.' }
    ],
    activations: (t) => ({
      ...spread(both('tibialisAnterior'), () => bump(t, 0, 0.15, 0.9) + bump(t, 0.62, 0.95, 0.8)),
      ...spread(both('quadriceps'), () => bump(t, 0, 0.2, 0.85)),
      ...spread(both('rectusFemoris'), () => bump(t, 0.55, 0.85, 0.7)),
      ...spread(both('gluteusMaximus'), () => bump(t, 0.1, 0.45, 0.7)),
      ...spread(both('gluteusMedius'), () => 0.25 + bump(t, 0.1, 0.4, 0.5)),
      ...spread(both('soleus'), () => bump(t, 0.15, 0.5, 0.85)),
      ...spread(both('gastrocnemius'), () => bump(t, 0.4, 0.62, 1)),
      ...spread(both('iliopsoas'), () => bump(t, 0.55, 0.85, 0.9)),
      ...spread(both('hamstrings'), () => bump(t, 0.85, 1, 0.8) + bump(t, 0.3, 0.5, 0.4) + bump(t, 0, 0.12, 0.35)),
      ...spread(both('deltoid'), () => 0.2),
      ...spread(both('latissimusDorsi'), () => 0.2),
      rectusAbdominis: 0.3, erectorSpinae: 0.35
    }),
    roles: {
      ...spread(both('gastrocnemius'), () => 'PM'), ...spread(both('soleus'), () => 'PM'),
      ...spread(both('tibialisAnterior'), () => 'PM'), ...spread(both('iliopsoas'), () => 'PM'),
      ...spread(both('rectusFemoris'), () => 'PM'), ...spread(both('quadriceps'), () => 'PM'),
      ...spread(both('hamstrings'), () => 'SY'), ...spread(both('gluteusMaximus'), () => 'SY'),
      ...spread(both('gluteusMedius'), () => 'ST'), ...spread(both('deltoid'), () => 'SY'),
      ...spread(both('latissimusDorsi'), () => 'SY'), rectusAbdominis: 'ST', erectorSpinae: 'ST'
    }
  },
  track('run', [
    { name: 'Contact', until: 0.2, caption: 'Quadriceps and gluteals absorb impact eccentrically; calf controls the ankle.' },
    { name: 'Propulsion', until: 0.5, caption: 'Triple extension — gluteus maximus, quadriceps, gastrocnemius–soleus.' },
    { name: 'Swing & arm drive', until: 1, caption: 'Hamstrings decelerate the shank; iliopsoas re-swings; deltoid and latissimus dorsi drive the arms.' }
  ], (t) => ({
    ...spread(both('quadriceps'), () => bump(t, 0, 0.25, 1)),
    ...spread(both('rectusFemoris'), () => bump(t, 0.5, 0.8, 0.8)),
    ...spread(both('gluteusMaximus'), () => bump(t, 0.05, 0.4, 1)),
    ...spread(both('gluteusMedius'), () => 0.35 + bump(t, 0.05, 0.35, 0.5)),
    ...spread(both('gastrocnemius'), () => bump(t, 0.25, 0.5, 1)),
    ...spread(both('soleus'), () => bump(t, 0.2, 0.5, 0.9)),
    ...spread(both('tibialisAnterior'), () => bump(t, 0.6, 0.95, 0.8) + bump(t, 0, 0.1, 0.6)),
    ...spread(both('hamstrings'), () => bump(t, 0.7, 0.98, 1)),
    ...spread(both('iliopsoas'), () => bump(t, 0.5, 0.8, 0.9)),
    ...spread(both('deltoid'), () => bump(t, 0, 1, 0.6)),
    ...spread(both('latissimusDorsi'), () => bump(t, 0, 1, 0.5)),
    rectusAbdominis: 0.5, erectorSpinae: 0.5
  }), { focus: 'leftUpLeg', roles: {
    ...spread(both('quadriceps'), () => 'PM'), ...spread(both('gluteusMaximus'), () => 'PM'),
    ...spread(both('gastrocnemius'), () => 'PM'), ...spread(both('hamstrings'), () => 'PM'),
    ...spread(both('iliopsoas'), () => 'PM'), ...spread(both('tibialisAnterior'), () => 'PM'),
    ...spread(both('soleus'), () => 'SY'), ...spread(both('deltoid'), () => 'SY'),
    ...spread(both('latissimusDorsi'), () => 'SY'), ...spread(both('gluteusMedius'), () => 'ST'),
    rectusAbdominis: 'ST', erectorSpinae: 'ST'
  } }),
  // Phase terms re-timed for the shipped range (frames 0-65 of the hop capture;
  // see scripts/bake-motion-assets.mjs). Measured events on that range: apex at
  // frame 0, ground contact at ~frame 9, rebound apex ~frame 21, second contact
  // ~frame 39, standing from ~frame 45. The captions follow those events.
  Object.assign(track('jump', [
    { name: 'Descent', until: 0.14, caption: 'The extensors lengthen under load as the body falls — the legs get ready to bank energy.' },
    { name: 'Landing (absorb)', until: 0.33, caption: 'Quadriceps, gluteals and calf work eccentrically — muscles as brakes; tendon energy banks.' },
    { name: 'Take-off', until: 0.62, caption: 'Triple extension: gluteus maximus, quadriceps, gastrocnemius–soleus fire concentrically.' },
    { name: 'Recover', until: 1, caption: 'The extensors hold the body upright and the core stabilises the trunk.' }
  ], (t) => ({
    ...spread(both('quadriceps'), () => bump(t, 0.05, 0.4, 0.9) + bump(t, 0.42, 0.55, 1) + bump(t, 0.72, 0.95, 0.95)),
    ...spread(both('gluteusMaximus'), () => bump(t, 0.05, 0.4, 0.85) + bump(t, 0.42, 0.55, 1) + bump(t, 0.72, 0.95, 0.9)),
    ...spread(both('hamstrings'), () => 0.7 * (bump(t, 0.05, 0.4, 0.9) + bump(t, 0.42, 0.55, 1) + bump(t, 0.72, 0.95, 0.9))),
    ...spread(both('gastrocnemius'), () => bump(t, 0.35, 0.55, 1) + bump(t, 0.72, 0.95, 0.9)),
    ...spread(both('soleus'), () => bump(t, 0.35, 0.55, 0.9) + bump(t, 0.72, 0.95, 0.85)),
    ...spread(both('tibialisAnterior'), () => bump(t, 0.72, 0.95, 0.6)),
    ...spread(both('deltoid'), () => bump(t, 0.4, 0.72, 0.9)),
    rectusAbdominis: bump(t, 0.3, 0.8, 0.8) + 0.25, erectorSpinae: 0.4
  }), { focus: 'leftUpLeg' }), { source: 'cmu', clip: 'jump_cmu.bvh', duration: 66 / 30, roles: {
    ...spread(both('quadriceps'), () => 'PM'), ...spread(both('gluteusMaximus'), () => 'PM'),
    ...spread(both('gastrocnemius'), () => 'PM'), ...spread(both('soleus'), () => 'SY'),
    ...spread(both('hamstrings'), () => 'SY'), ...spread(both('deltoid'), () => 'SY'),
    ...spread(both('tibialisAnterior'), () => 'SY'), rectusAbdominis: 'ST', erectorSpinae: 'ST'
  } }),
  track('wave', [
    { name: 'Abduct arm', until: 0.2, caption: 'Middle deltoid lifts the arm; supraspinatus assists; trapezius and serratus anterior rotate the scapula.' },
    { name: 'Wave', until: 0.85, caption: 'Wrist flexors and extensors alternate to oscillate the hand.' },
    { name: 'Lower', until: 1, caption: 'Deltoid works eccentrically on the way down.' }
  ], (t) => ({
    'deltoid.L': bump(t, 0, 0.25, 1) + (t > 0.2 && t < 0.85 ? 0.7 : 0) + bump(t, 0.85, 1, 0.4),
    'deltoid.R': 0.2 * (bump(t, 0, 0.25, 1) + bump(t, 0.85, 1, 0.4)),
    'supraspinatus.L': bump(t, 0.02, 0.3, 0.8),
    'upperTrapezius.L': t > 0.1 && t < 0.9 ? 0.6 : 0.1,
    'serratusAnterior.L': t > 0.1 && t < 0.9 ? 0.55 : 0.1,
    'forearmExtensors.L': bump(t % 0.25, 0, 0.12, 0.8),
    'forearmFlexors.L': bump(t % 0.25, 0.12, 0.25, 0.8)
  }), { focus: 'leftHand', roles: { 'deltoid.L': 'PM', 'forearmExtensors.L': 'PM', 'forearmFlexors.L': 'PM', 'supraspinatus.L': 'SY', 'upperTrapezius.L': 'ST', 'serratusAnterior.L': 'ST' } }),
  track('handshake', [
    { name: 'Reach', until: 0.25, caption: 'Deltoid and biceps position the arm; pronator teres orients the grip.' },
    { name: 'Grip & pump', until: 0.85, caption: 'Finger flexors and adductor pollicis sustain the grip; the pump comes from elbow oscillation with wrist lag.' },
    { name: 'Release', until: 1, caption: 'Extensors open the hand and lower the arm eccentrically.' }
  ], (t) => ({
    'forearmFlexors.R': t > 0.2 && t < 0.9 ? 0.85 : 0.1,
    'adductorPollicis.R': t > 0.2 && t < 0.9 ? 0.8 : 0.1,
    'pronatorTeres.R': t > 0.15 && t < 0.9 ? 0.45 : 0.1,
    'forearmExtensors.R': 0.3 + bump(t % 0.31, 0, 0.15, 0.6),
    'bicepsBrachii.R': t > 0.1 && t < 0.9 ? 0.6 : 0.15,
    'deltoid.R': t > 0.1 && t < 0.9 ? 0.5 : 0.15,
    erectorSpinae: 0.3
  }), { focus: 'rightHand', roles: { 'forearmFlexors.R': 'PM', 'adductorPollicis.R': 'PM', 'pronatorTeres.R': 'SY', 'forearmExtensors.R': 'SY', 'bicepsBrachii.R': 'ST', 'deltoid.R': 'SY', erectorSpinae: 'ST' } }),
  track('chew', [
    { name: 'Open', until: 0.35, caption: 'Digastric depresses the jaw.' },
    { name: 'Close & grind', until: 1, caption: 'Masseter, temporalis elevate; lateral pterygoids alternate for side-to-side grinding.' }
  ], (t) => ({
    digastric: bump(t, 0, 0.35, 0.9),
    ...spread(both('masseter'), () => bump(t, 0.35, 0.95, 1)),
    ...spread(both('temporalis'), () => bump(t, 0.4, 0.95, 0.9)),
    'lateralPterygoid.L': bump((t * 2) % 1, 0, 0.45, 0.7),
    'lateralPterygoid.R': bump((t * 2) % 1, 0.5, 0.95, 0.7),
    ...spread(both('buccinator'), () => 0.4 + bump(t, 0.3, 1, 0.4))
  }), { focus: 'head', roles: { ...spread(both('masseter'), () => 'PM'), ...spread(both('temporalis'), () => 'PM'), 'lateralPterygoid.L': 'PM', 'lateralPterygoid.R': 'PM', digastric: 'PM', ...spread(both('buccinator'), () => 'SY') } }),
  track('talk', [
    { name: 'Phrase', until: 0.5, caption: 'Jaw muscles tune amplitude; orbicularis oris shapes the lips.' },
    { name: 'Articulate', until: 1, caption: 'Fine jaw oscillation with lip and cheek shaping — masticatory muscles at speech amplitudes.' }
  ], (t) => ({
    ...spread(both('masseter'), () => 0.25 + bump(t % 0.4, 0.1, 0.35, 0.4)),
    ...spread(both('temporalis'), () => 0.2 + bump(t % 0.4, 0.1, 0.35, 0.35)),
    ...spread(both('lateralPterygoid'), () => 0.2),
    digastric: bump(t % 0.4, 0, 0.15, 0.5),
    orbicularisOris: 0.4 + bump(t % 0.3, 0, 0.2, 0.5),
    ...spread(both('buccinator'), () => 0.35 + bump(t % 0.5, 0.1, 0.4, 0.4))
  }), { focus: 'head', roles: { orbicularisOris: 'PM', ...spread(both('buccinator'), () => 'SY'), ...spread(both('masseter'), () => 'SY'), ...spread(both('temporalis'), () => 'SY'), ...spread(both('lateralPterygoid'), () => 'SY'), digastric: 'SY' } })
];

export const ACTION_BY_ID = Object.fromEntries(ACTIONS.map((a) => [a.id, a]));

export const QUIZ = [
  { q: 'During walking push-off, which muscles are the prime movers?', options: ['Gastrocnemius and soleus', 'Tibialis anterior', 'Hamstrings', 'Rectus abdominis'], answer: 0 },
  { q: 'Which muscle controls "foot slap" just after heel strike?', options: ['Tibialis anterior', 'Gluteus maximus', 'Masseter', 'Deltoid'], answer: 0 },
  { q: 'Chewing closes the jaw mainly via which muscles?', options: ['Masseter and temporalis', 'Lateral pterygoid only', 'Digastric', 'Serratus anterior'], answer: 0 }
];

export const ROLE_LABELS = { PM: 'Prime mover', SY: 'Synergist', ST: 'Stabilizer' };


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
  'tiptoe-walk': [
    'Tall and light - like the floor is hot.',
    'Let the calves do the talking.',
    'Small quick steps.'
  ],
  'heel-walk': [
    'Toes to the sky.',
    'Roll each foot in, heel to toe.',
    'Slow is smooth.'
  ],
  bow: [
    'Fold at the hips, keep the spine long.',
    'Roll down soft, roll up slower.',
    'Head comes up last.'
  ],
  shrug: [
    'Ears toward shoulders, gently.',
    'Long neck on the release.',
    'Breathe out as you melt down.'
  ],
  'reach-up': [
    'Reach long - ribs down.',
    'Shoulder blades glide, not hunch.',
    'Control the way down.'
  ],
  clap: [
    'Elbows soft, clap in front of the chest.',
    'Keep a steady count.',
    'Relax the shoulders between claps.'
  ],
  'head-signals': [
    'Nod from the top of the spine.',
    'Shake = rotate, not tilt.',
    'Keep the jaw quiet.'
  ],
  kick: [
    'Fold, then snap - the knee leads the kick.',
    'Lean back a little to stay balanced.',
    'Land soft over the support leg.'
  ],
  sidestep: [
    'Lead with the hip, not the shoulder.',
    'Push off the trailing leg to glide.',
    'Keep the hips a level glass of water.'
  ],
  'one-leg': [
    'Grow tall on the standing leg.',
    'Hips level - imagine a spirit bubble.',
    'Grip the floor with the whole foot.'
  ],
  squat: [
    'Sit back to an imaginary chair, knees tracking over toes.',
    'Chest tall - the spine stays long.',
    'Push the floor away to stand.'
  ],
  'sit-stand': [
    'Nose over toes before you push.',
    'Stand all the way tall, then control the sit.',
    'Four counts down - no dropping.'
  ],
  lunge: [
    'Drop the back knee straight down.',
    'Front heel does the pushing.',
    'Hips level like a glass of water.'
  ],
  talk: [
    'Let the breath fall out; don’t push the words.',
    'Keep the jaw loose — the words ride the airflow.',
    'Stand tall but soft; the voice travels through an open chest.'
  ]
};
