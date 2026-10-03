// Kinesiology Theater — runtime action registry (GENERATED, do not hand-edit).
//
// Generated from `content/kinesiology/source/curves.mjs` by the Phase 3
// migration: everything the viewer needs at run time and nothing more. The
// activation curves and roles that used to live here are now data in
// `content/kinesiology/clips/<clipId>.json` (Masterplan §4.3, pillar 3) — see
// `src/lib/kinesiology/activation.js` for the runtime that reads them, and this
// script for the generator that produced them.
//
// Regenerate with: node scripts/bake-activation-data.mjs --emit-runtime
// The timeline smoke asserts this file and the JSON documents agree on duration,
// frame count and clip identity (audit A19).

import { AUTHORED_ACTIONS } from './authoredTracks.js';

const track = (id, phases, opts = {}) => ({
  id,
  // An explicit option wins: the mocap clips reuse an authored action's id but
  // have their own duration (walk is 64 frames = 2.133 s, not the authored 2.2 s;
  // jump is 66 frames = 2.2 s, not the authored 2.6 s). Getting this wrong is
  // exactly the drift audit A19 is about, and the timeline smoke catches it.
  source: opts.source || (AUTHORED_ACTIONS[id] ? AUTHORED_ACTIONS[id].source : 'cmu'),
  duration: opts.duration !== undefined ? opts.duration : (AUTHORED_ACTIONS[id] ? AUTHORED_ACTIONS[id].duration : undefined),
  loop: opts.loop !== undefined ? opts.loop : (AUTHORED_ACTIONS[id] ? AUTHORED_ACTIONS[id].loop : undefined),
  phases,
  focus: opts.focus || null,
  clip: opts.clip || null
});

export const ACTIONS = [
  track("tiptoe-walk", [
    { name: "Rise & roll", until: 0.5, caption: "Gastrocnemius and soleus hold the heels up and drive push-off on every step; tibialis anterior works to keep the toes from slapping.", ext: "Walk like the floor is hot - tall and light." },
    { name: "Step through", until: 1, caption: "Calf carries body weight through stance; quads and hip extensors stabilise the knee and trunk.", ext: "Small quick steps, no wobbling." }
  ], { focus: "leftLeg" }),
  track("heel-walk", [
    { name: "Heel-first", until: 0.5, caption: "Tibialis anterior fires hard to hold the toes up; calf is quiet; hamstrings help control the knee.", ext: "Toes to the sky, roll the foot in." },
    { name: "Controlled roll", until: 1, caption: "Without push-off, hip flexors and quads do extra work to pull the body forward - a classic calf-sparing drill.", ext: "Slow, deliberate steps." }
  ], { focus: "leftLeg" }),
  track("bow", [
    { name: "Hinge down", until: 0.4, caption: "Hamstrings lengthen under load (eccentric); erector spinae control the rounding; glutes counter-balance.", ext: "Fold at the hips, long spine." },
    { name: "Rise", until: 1, caption: "Gluteus maximus and hamstrings concentrically extend the hip; erectors stack the vertebrae back up.", ext: "Roll up slow, head last." }
  ], { focus: "spine" }),
  track("shrug", [
    { name: "Lift", until: 0.5, caption: "Upper trapezius elevates the shoulder girdle; levator scapulae assist; neck stays quiet.", ext: "Ears to shoulders - gently." },
    { name: "Release", until: 1, caption: "Lower trapezius and gravity control the descent - letting the shoulders melt down.", ext: "Long neck on the way down." }
  ], { focus: "chest" }),
  track("reach-up", [
    { name: "Reach", until: 0.4, caption: "Deltoid and supraspinatus lift the arm; serratus anterior rotates the shoulder blade upward; trunk lengthens.", ext: "Reach for the top shelf." },
    { name: "Hold & lower", until: 1, caption: "Latissimus dorsi and lower trapezius control the descent - the shoulder blade glides back down.", ext: "Shoulders away from the ears." }
  ], { focus: "leftUpperArm" }),
  track("clap", [
    { name: "Open-close", until: 1, caption: "Pectoralis (simplified via deltoid/trunk coupling here) adducts the arms; biceps hold the elbow fold; rhythm lives in the trunk.", ext: "Clap to a count of three." }
  ], { focus: "leftUpperArm" }),
  track("head-signals", [
    { name: "Nod (yes)", until: 0.5, caption: "Deep neck flexors and extensors alternate at the atlanto-occipital joint - the \"yes\" hinge.", ext: "Small chin nods, not head bows." },
    { name: "Shake (no)", until: 1, caption: "Rotators on both sides alternate - sternocleidomastoid (simplified here via neck coupling) drives the \"no\" rotation.", ext: "Rotate, do not tilt." }
  ], { focus: "head" }),
  track("kick", [
    { name: "Wind-up", until: 0.35, caption: "Hip flexors load the swing leg; hamstrings keep the knee folded; support-leg quadriceps hold you upright.", ext: "Fold the knee before you swing." },
    { name: "Kick", until: 0.65, caption: "Quadriceps snap the knee extended while iliopsoas drives the hip; the trunk leans back to counter-balance.", ext: "Snap through - toes pointed." },
    { name: "Return", until: 1, caption: "Hamstrings decelerate the swing; hip extensors bring the leg home over the support leg.", ext: "Land soft, stay tall." }
  ], { focus: "leftLeg" }),
  track("sidestep", [
    { name: "Step left", until: 0.5, caption: "Left hip abductors lead; right gluteus medius pushes the body sideways; adductors control the follow-through.", ext: "Lead with the hip, not the shoulder." },
    { name: "Step right", until: 1, caption: "The pattern mirrors: right abductors lead, left gluteus medius drives, trunk stays level.", ext: "Quiet feet - level hips." }
  ], { focus: "leftUpLeg" }),
  track("one-leg", [
    { name: "Lift", until: 0.3, caption: "Support-leg gluteus medius fires hard to hold the pelvis level - the classic Trendelenburg test position.", ext: "Grow tall on one leg." },
    { name: "Hold", until: 0.75, caption: "Medius and deep hip rotators make small corrections; ankle invertors/evertors fine-tune balance.", ext: "Still hips, quiet breathing." },
    { name: "Lower", until: 1, caption: "Hip flexors ease the leg down; quadriceps absorb the return to two legs.", ext: "Set the foot down like a feather." }
  ], { focus: "leftUpLeg" }),
  track("squat", [
    { name: "Descent", until: 0.4, caption: "Quadriceps and gluteus maximus work eccentrically to lower the body; erector spinae keep the trunk upright.", ext: "Sit back slowly, like reaching for a low chair." },
    { name: "Turnaround", until: 0.55, caption: "Hip and knee moments peak; hamstrings co-contract to steady the knee.", ext: "Pause - weight in the mid-foot, chest tall." },
    { name: "Ascent", until: 1, caption: "Quadriceps and gluteus maximus drive concentrically; soleus stabilises the ankle.", ext: "Push the floor away until fully tall." }
  ], { focus: "leftLeg" }),
  track("sit-stand", [
    { name: "Seated", until: 0.2, caption: "Hip flexed about 90 degrees; hip flexors hold the posture while quadriceps stay quiet. Caricature: no seat rendered.", ext: "Tall spine before you move." },
    { name: "Rising", until: 0.45, caption: "Quadriceps and gluteus maximus generate the stand; the trunk leans forward to bring the centre of mass over the feet.", ext: "Nose over toes, then push up." },
    { name: "Standing", until: 0.7, caption: "Hip and knee extensors settle into quiet stance; soleus controls sway.", ext: "Finish tall - squeeze gently." },
    { name: "Lowering", until: 1, caption: "Quadriceps brake the descent eccentrically; tibialis anterior keeps the shins balanced.", ext: "Slow sit - four counts down." }
  ], { focus: "leftLeg" }),
  track("lunge", [
    { name: "Sink", until: 0.4, caption: "Front-leg quadriceps and gluteus maximus load eccentrically; rear-leg iliopsoas lengthens; gluteus medius blocks pelvic drop.", ext: "Drop the back knee straight down." },
    { name: "Push back", until: 1, caption: "Front-leg hip extensors drive the return; the rear calf assists push-off.", ext: "Push through the front heel." }
  ], { focus: "leftUpLeg" }),
  track("walk", [
    { name: "Heel strike / loading", until: 0.15, caption: "Tibialis anterior controls foot slap; quadriceps work eccentrically; gluteus medius steadies the pelvis.", ext: "Land softly — let the heel kiss the ground, then roll forward like a wheel." },
    { name: "Mid-stance", until: 0.4, caption: "Soleus advances the tibia; gluteus medius keeps the pelvis level over the stance leg.", ext: "Roll over a steady, level hip — imagine the pelvis is a glass of water." },
    { name: "Push-off", until: 0.6, caption: "Gastrocnemius–soleus generate push-off; hip flexors pre-load the swing.", ext: "Push the ground behind you; leave it moving backwards, not you pulling forwards." },
    { name: "Swing", until: 1, caption: "Iliopsoas and rectus femoris drive the leg forward; tibialis anterior clears the foot; hamstrings decelerate before heel strike.", ext: "Swing the leg through like a pendulum; keep the toes clear and quiet." }
  ], { focus: "leftLeg", clip: "walk_cmu.bvh", duration: 2.1333333333333333, loop: true }),
  track("run", [
    { name: "Contact", until: 0.2, caption: "Quadriceps and gluteals absorb impact eccentrically; calf controls the ankle." },
    { name: "Propulsion", until: 0.5, caption: "Triple extension — gluteus maximus, quadriceps, gastrocnemius–soleus." },
    { name: "Swing & arm drive", until: 1, caption: "Hamstrings decelerate the shank; iliopsoas re-swings; deltoid and latissimus dorsi drive the arms." }
  ], { focus: "leftUpLeg" }),
  track("jump", [
    { name: "Descent", until: 0.14, caption: "The extensors lengthen under load as the body falls — the legs get ready to bank energy." },
    { name: "Landing (absorb)", until: 0.33, caption: "Quadriceps, gluteals and calf work eccentrically — muscles as brakes; tendon energy banks." },
    { name: "Take-off", until: 0.62, caption: "Triple extension: gluteus maximus, quadriceps, gastrocnemius–soleus fire concentrically." },
    { name: "Recover", until: 1, caption: "The extensors hold the body upright and the core stabilises the trunk." }
  ], { focus: "leftUpLeg", clip: "jump_cmu.bvh", duration: 2.2, loop: false }),
  track("wave", [
    { name: "Abduct arm", until: 0.2, caption: "Middle deltoid lifts the arm; supraspinatus assists; trapezius and serratus anterior rotate the scapula." },
    { name: "Wave", until: 0.85, caption: "Wrist flexors and extensors alternate to oscillate the hand." },
    { name: "Lower", until: 1, caption: "Deltoid works eccentrically on the way down." }
  ], { focus: "leftHand" }),
  track("handshake", [
    { name: "Reach", until: 0.25, caption: "Deltoid and biceps position the arm; pronator teres orients the grip." },
    { name: "Grip & pump", until: 0.85, caption: "Finger flexors and adductor pollicis sustain the grip; the pump comes from elbow oscillation with wrist lag." },
    { name: "Release", until: 1, caption: "Extensors open the hand and lower the arm eccentrically." }
  ], { focus: "rightHand" }),
  track("chew", [
    { name: "Open", until: 0.35, caption: "Digastric depresses the jaw." },
    { name: "Close & grind", until: 1, caption: "Masseter, temporalis elevate; lateral pterygoids alternate for side-to-side grinding." }
  ], { focus: "head" }),
  track("talk", [
    { name: "Phrase", until: 0.5, caption: "Jaw muscles tune amplitude; orbicularis oris shapes the lips." },
    { name: "Articulate", until: 1, caption: "Fine jaw oscillation with lip and cheek shaping — masticatory muscles at speech amplitudes." }
  ], { focus: "head" }),
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
