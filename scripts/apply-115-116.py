at = 'src/lib/kinesiology/authoredTracks.js'
s = open(at).read()
if "'tiptoe-walk': {" not in s:
    s = s.replace("  wave: {", """  'tiptoe-walk': {
    duration: 2.2, loop: true, source: 'authored',
    pose: (t) => {
      const p = gait(t, { period: 1.1, hip: 20, knee: 38, arm: 14, bounce: 0.02, trunk: 5 });
      p.leftFoot.x += 24; p.rightFoot.x += 24;
      p.root.y += 0.05;
      return p;
    }
  },
  'heel-walk': {
    duration: 2.2, loop: true, source: 'authored',
    pose: (t) => {
      const p = gait(t, { period: 1.1, hip: 22, knee: 30, arm: 14, bounce: 0.015, trunk: 3 });
      p.leftFoot.x -= 20; p.rightFoot.x -= 20;
      p.leftLeg.x *= 0.6; p.rightLeg.x *= 0.6;
      return p;
    }
  },
  bow: {
    duration: 3, loop: true, source: 'authored',
    pose: (t) => {
      const ph = t % 3;
      const b = smooth(ph, 0, 0.9) * (1 - smooth(ph, 1.8, 2.7));
      const p = {};
      p.spine = { x: 50 * b };
      p.head = { x: -18 * b };
      p.leftUpLeg = { x: -12 * b }; p.rightUpLeg = { x: -12 * b };
      p.leftLeg = { x: 10 * b }; p.rightLeg = { x: 10 * b };
      p.leftUpperArm = { x: -8 * b }; p.rightUpperArm = { x: -8 * b };
      return withIdle(p, t);
    }
  },
  shrug: {
    duration: 2, loop: true, source: 'authored',
    pose: (t) => {
      const s2 = 0.5 - 0.5 * Math.cos(2 * Math.PI * t / 2);
      const p = {};
      p.leftClavicle = { x: -14 * s2 }; p.rightClavicle = { x: -14 * s2 };
      p.leftUpperArm = { z: 6 * s2 }; p.rightUpperArm = { z: -6 * s2 };
      p.head = { y: 3 * s2 };
      return withIdle(p, t);
    }
  },
  'reach-up': {
    duration: 3, loop: true, source: 'authored',
    pose: (t) => {
      const ph = t % 3;
      const r = smooth(ph, 0, 0.9) * (1 - smooth(ph, 2.1, 2.8));
      const p = {};
      p.leftUpperArm = { x: -170 * r, z: 8 * r };
      p.rightUpperArm = { x: -170 * r, z: -8 * r };
      p.leftForeArm = { x: -12 * r }; p.rightForeArm = { x: -12 * r };
      p.spine = { x: -6 * r };
      p.head = { x: -12 * r };
      return withIdle(p, t);
    }
  },
  clap: {
    duration: 2, loop: true, source: 'authored',
    pose: (t) => {
      const a = Math.abs(Math.sin(2 * Math.PI * 1.5 * t));
      const p = {};
      p.leftUpperArm = { x: -35, z: -50 * a + -8 };
      p.rightUpperArm = { x: -35, z: 50 * a + 8 };
      p.leftForeArm = { x: -65 }; p.rightForeArm = { x: -65 };
      return withIdle(p, t);
    }
  },
  'head-signals': {
    duration: 4, loop: true, source: 'authored',
    pose: (t) => {
      const ph = t % 4;
      const nod = ph < 2 ? Math.sin(2 * Math.PI * 1.2 * ph) : 0;
      const shake = ph >= 2 ? Math.sin(2 * Math.PI * 1.1 * (ph - 2)) : 0;
      const p = {};
      p.head = { x: 18 * nod, y: 24 * shake };
      p.spine = { x: 3 * nod };
      return withIdle(p, t);
    }
  },
  wave: {""")
    open(at, 'w').write(s)
    print('poses 115/116 applied')

ac = 'src/lib/kinesiology/actions.js'
s = open(ac).read()
if "id: 'tiptoe-walk'" not in s:
    entries = """  {
    id: 'tiptoe-walk', source: 'authored', duration: 2.2, loop: true, focus: 'leftLeg',
    phases: [
      { name: 'Rise & roll', until: 0.5, caption: 'Gastrocnemius and soleus hold the heels up and drive push-off on every step; tibialis anterior works to keep the toes from slapping.', ext: 'Walk like the floor is hot - tall and light.' },
      { name: 'Step through', until: 1, caption: 'Calf carries body weight through stance; quads and hip extensors stabilise the knee and trunk.', ext: 'Small quick steps, no wobbling.' }
    ],
    activations: (t) => ({ ...spread(both('gastrocnemius'), () => 0.8), ...spread(both('soleus'), () => 0.9), ...spread(both('tibialisAnterior'), () => 0.4), ...spread(both('quadriceps'), () => 0.4), erectorSpinae: 0.3 })
  },
  {
    id: 'heel-walk', source: 'authored', duration: 2.2, loop: true, focus: 'leftLeg',
    phases: [
      { name: 'Heel-first', until: 0.5, caption: 'Tibialis anterior fires hard to hold the toes up; calf is quiet; hamstrings help control the knee.', ext: 'Toes to the sky, roll the foot in.' },
      { name: 'Controlled roll', until: 1, caption: 'Without push-off, hip flexors and quads do extra work to pull the body forward - a classic calf-sparing drill.', ext: 'Slow, deliberate steps.' }
    ],
    activations: (t) => ({ ...spread(both('tibialisAnterior'), () => 0.9), ...spread(both('quadriceps'), () => 0.5), ...spread(both('hamstrings'), () => 0.4), ...spread(both('iliopsoas'), () => 0.5), ...spread(both('soleus'), () => 0.15) })
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
    }
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
    activations: (t) => ({ ...spread(both('deltoid'), () => 0.5), ...spread(both('bicepsBrachii'), () => 0.5), ...spread(both('tricepsBrachii'), () => 0.2), rectusAbdominis: 0.25 })
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
"""
    s = s.replace("  {\n    id: 'kick',", entries + "    id: 'kick',")
    cues = """  'tiptoe-walk': [
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
  kick: ["""
    s = s.replace('  kick: [', cues, 1)
    open(ac, 'w').write(s)
    print('actions 115/116 applied')
else:
    print('actions already applied')
