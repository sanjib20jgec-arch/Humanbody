import sys
path = 'src/lib/kinesiology/actions.js'
s = open(path).read()
if "id: 'squat'" in s:
    print('already applied'); sys.exit(0)
entries = '''  {
    id: 'squat', source: 'authored', duration: 3, loop: true, focus: 'leftLeg',
    phases: [
      { name: 'Descent', until: 0.4, caption: 'Quadriceps and gluteus maximus work eccentrically to lower the body; erector spinae keep the trunk upright.', ext: 'Sit back slowly, like reaching for a low chair.' },
      { name: 'Turnaround', until: 0.55, caption: 'Hip and knee moments peak; hamstrings co-contract to steady the knee.', ext: 'Pause - weight in the mid-foot, chest tall.' },
      { name: 'Ascent', until: 1, caption: 'Quadriceps and gluteus maximus drive concentrically; soleus stabilises the ankle.', ext: 'Push the floor away until fully tall.' }
    ],
    activations: (t) => {
      const d = bump(t, 0, 0.4, 0.9) + bump(t, 0.55, 1, 1);
      return { ...spread(both('quadriceps'), () => d), ...spread(both('gluteusMaximus'), () => d * 0.85), ...spread(both('hamstrings'), () => 0.3 + d * 0.4), ...spread(both('soleus'), () => 0.3), erectorSpinae: 0.5, rectusAbdominis: 0.3 };
    }
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
'''
s = s.replace("  {\n    id: 'walk',", entries + "    id: 'walk',")
cues = '''  squat: [
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
  talk: ['''
s = s.replace('  talk: [', cues, 1)
open(path, 'w').write(s)
print('actions 113 applied')
