import sys
at = 'src/lib/kinesiology/authoredTracks.js'
s = open(at).read()
if 'kick: {' in s:
    print('poses already applied')
else:
    s = s.replace("  wave: {", """  kick: {
    duration: 2.4, loop: true, source: 'authored',
    pose: (t) => {
      const ph = t % 2.4;
      const w = smooth(ph, 0.2, 0.6) * (1 - smooth(ph, 0.6, 1.0));
      const k = smooth(ph, 0.5, 0.9) * (1 - smooth(ph, 1.5, 2.0));
      const p = {};
      p.leftUpLeg = { x: -35 * w - 85 * k };
      p.leftLeg = { x: 80 * w + 10 * k };
      p.leftFoot = { x: -15 * k };
      p.rightUpLeg = { x: 8 * k };
      p.spine = { x: -8 * k + 6 };
      p.leftUpperArm = { x: 25 * k }; p.rightUpperArm = { x: -35 * k };
      p.root = { y: -0.04 * k };
      return withIdle(p, t);
    }
  },
  sidestep: {
    duration: 2.4, loop: true, source: 'authored',
    pose: (t) => {
      const ph = (2 * Math.PI * t) / 2.4;
      const step = Math.sin(ph);
      const lift = Math.max(0, Math.sin(ph));
      const rlift = Math.max(0, -Math.sin(ph));
      const p = {};
      p.root = { x: 0.45 * step, y: 0.02 * Math.abs(Math.cos(ph)) };
      p.leftUpLeg = { z: 16 * lift, x: -4 * lift };
      p.rightUpLeg = { z: -16 * rlift, x: -4 * rlift };
      p.leftLeg = { x: 18 * lift }; p.rightLeg = { x: 18 * rlift };
      p.leftFoot = { x: -8 * lift }; p.rightFoot = { x: -8 * rlift };
      p.spine = { y: -4 * step };
      p.leftUpperArm = { x: 12 * rlift }; p.rightUpperArm = { x: 12 * lift };
      return withIdle(p, t);
    }
  },
  'one-leg': {
    duration: 3, loop: true, source: 'authored',
    pose: (t) => {
      const ph = t % 3;
      const u = smooth(ph, 0, 0.8) * (1 - smooth(ph, 2.3, 2.9));
      const p = {};
      p.rightUpLeg = { x: -35 * u }; p.rightLeg = { x: 50 * u }; p.rightFoot = { x: -12 * u };
      p.leftUpLeg = { x: -4 * u };
      p.root = { rz: 5 * u, y: -0.03 * u };
      p.spine = { rz: -3 * u };
      p.leftUpperArm = { z: 25 * u }; p.rightUpperArm = { z: -25 * u };
      return withIdle(p, t);
    }
  },
  wave: {""")
    open(at, 'w').write(s)
    print('poses 114 applied')

ac = 'src/lib/kinesiology/actions.js'
s = open(ac).read()
if "id: 'kick'" in s:
    print('actions already applied')
else:
    entries = """  {
    id: 'kick', source: 'authored', duration: 2.4, loop: true, focus: 'leftLeg',
    phases: [
      { name: 'Wind-up', until: 0.35, caption: 'Hip flexors load the swing leg; hamstrings keep the knee folded; support-leg quadriceps hold you upright.', ext: 'Fold the knee before you swing.' },
      { name: 'Kick', until: 0.65, caption: 'Quadriceps snap the knee extended while iliopsoas drives the hip; the trunk leans back to counter-balance.', ext: 'Snap through - toes pointed.' },
      { name: 'Return', until: 1, caption: 'Hamstrings decelerate the swing; hip extensors bring the leg home over the support leg.', ext: 'Land soft, stay tall.' }
    ],
    activations: (t) => {
      const k = bump(t, 0.35, 0.65, 1); const w = bump(t, 0.1, 0.35, 0.7);
      return { ...spread(both('quadriceps'), () => 0.3 + k), ...spread(both('iliopsoas'), () => 0.3 + k * 0.8), ...spread(both('hamstrings'), () => 0.3 + w * 0.5 + bump(t, 0.65, 1, 0.6)), ...spread(both('rectusFemoris'), () => k * 0.8), rectusAbdominis: 0.4, erectorSpinae: 0.35 };
    }
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
    }
  },
  {
"""
    s = s.replace("  {\n    id: 'squat',", entries + "    id: 'squat',")
    cues = """  kick: [
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
  squat: ["""
    s = s.replace('  squat: [', cues, 1)
    open(ac, 'w').write(s)
    print('actions 114 applied')
