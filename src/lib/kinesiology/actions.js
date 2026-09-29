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
    id: 'walk', source: 'cmu', clip: 'walk_cmu.bvh', duration: 4, loop: true, focus: 'leftLeg',
    phases: [
      { name: 'Heel strike / loading', rla: 'Initial contact + loading response', trad: 'Heel strike / foot flat', until: 0.15, caption: 'Tibialis anterior controls foot slap; quadriceps work eccentrically; gluteus medius steadies the pelvis.' },
      { name: 'Mid-stance', rla: 'Mid-stance', trad: 'Mid-stance', until: 0.4, caption: 'Soleus advances the tibia; gluteus medius keeps the pelvis level over the stance leg.' },
      { name: 'Push-off', rla: 'Terminal stance + pre-swing', trad: 'Heel-off / push-off', until: 0.6, caption: 'Gastrocnemius–soleus generate push-off; hip flexors pre-load the swing.' },
      { name: 'Swing', rla: 'Initial, mid & terminal swing', trad: 'Swing', until: 1, caption: 'Iliopsoas and rectus femoris drive the leg forward; tibialis anterior clears the foot; hamstrings decelerate before heel strike.' }
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
  Object.assign(track('jump', [
    { name: 'Countermovement', until: 0.38, caption: 'Quadriceps, gluteals and calf load eccentrically — elastic energy banks.' },
    { name: 'Take-off', until: 0.52, caption: 'Triple extension: gluteus maximus, quadriceps, gastrocnemius–soleus fire concentrically.' },
    { name: 'Flight', until: 0.72, caption: 'Core stiffens the trunk; arms swing overhead to lift the centre of mass.' },
    { name: 'Landing', until: 1, caption: 'The same extensors decelerate the body eccentrically — muscles as brakes.' }
  ], (t) => ({
    ...spread(both('quadriceps'), () => bump(t, 0.05, 0.4, 0.9) + bump(t, 0.42, 0.55, 1) + bump(t, 0.72, 0.95, 0.95)),
    ...spread(both('gluteusMaximus'), () => bump(t, 0.05, 0.4, 0.85) + bump(t, 0.42, 0.55, 1) + bump(t, 0.72, 0.95, 0.9)),
    ...spread(both('hamstrings'), () => 0.7 * (bump(t, 0.05, 0.4, 0.9) + bump(t, 0.42, 0.55, 1) + bump(t, 0.72, 0.95, 0.9))),
    ...spread(both('gastrocnemius'), () => bump(t, 0.35, 0.55, 1) + bump(t, 0.72, 0.95, 0.9)),
    ...spread(both('soleus'), () => bump(t, 0.35, 0.55, 0.9) + bump(t, 0.72, 0.95, 0.85)),
    ...spread(both('tibialisAnterior'), () => bump(t, 0.72, 0.95, 0.6)),
    ...spread(both('deltoid'), () => bump(t, 0.4, 0.72, 0.9)),
    rectusAbdominis: bump(t, 0.3, 0.8, 0.8) + 0.25, erectorSpinae: 0.4
  }), { focus: 'leftUpLeg' }), { source: 'cmu', clip: 'jump_cmu.bvh', duration: 3, roles: {
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
