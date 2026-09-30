# Idempotent restorer: phase-113 pose generators (squat, sit-stand, lunge)
# for authoredTracks.js. These were originally applied by a one-off inline
# edit and were lost to sandbox resets; this script makes them permanent.
import sys
path = 'src/lib/kinesiology/authoredTracks.js'
s = open(path).read()
if 'squat: {' in s:
    print('poses 113 already present'); sys.exit(0)
poses = """  squat: {
    duration: 3, loop: true, source: 'authored',
    pose: (t) => {
      const ph = t % 3;
      const d = smooth(ph, 0.2, 1.2) * (1 - smooth(ph, 1.8, 2.8));
      const p = {};
      p.root = { y: -0.34 * d };
      p.leftUpLeg = { x: -95 * d }; p.rightUpLeg = { x: -95 * d };
      p.leftLeg = { x: 100 * d }; p.rightLeg = { x: 100 * d };
      p.leftFoot = { x: -30 * d }; p.rightFoot = { x: -30 * d };
      p.spine = { x: 25 * d };
      p.leftUpperArm = { x: -70 * d }; p.rightUpperArm = { x: -70 * d };
      return withIdle(p, t);
    }
  },
  'sit-stand': {
    duration: 4, loop: true, source: 'authored',
    pose: (t) => {
      const ph = t % 4;
      const d = smooth(ph, 0.3, 1.6) * (1 - smooth(ph, 2.4, 3.6));
      const p = {};
      p.root = { y: -0.42 * d, z: 0.12 * d };
      p.leftUpLeg = { x: -100 * d }; p.rightUpLeg = { x: -100 * d };
      p.leftLeg = { x: 95 * d }; p.rightLeg = { x: 95 * d };
      p.leftFoot = { x: -25 * d }; p.rightFoot = { x: -25 * d };
      p.spine = { x: 30 * d };
      p.leftUpperArm = { x: -45 * d }; p.rightUpperArm = { x: -45 * d };
      return withIdle(p, t);
    }
  },
  lunge: {
    duration: 3, loop: true, source: 'authored',
    pose: (t) => {
      const ph = t % 3;
      const w = smooth(ph, 0.3, 1.1) * (1 - smooth(ph, 1.9, 2.7));
      const p = {};
      p.root = { y: -0.28 * w };
      p.leftUpLeg = { x: -55 * w }; p.leftLeg = { x: 35 * w }; p.leftFoot = { x: -10 * w };
      p.rightUpLeg = { x: 45 * w }; p.rightLeg = { x: 50 * w }; p.rightFoot = { x: 40 * w };
      p.spine = { x: 8 * w };
      p.leftUpperArm = { x: -20 * w }; p.rightUpperArm = { x: -20 * w };
      return withIdle(p, t);
    }
  },
"""
marker = '  wave: {'
assert marker in s, 'wave marker missing'
s = s.replace(marker, poses + marker, 1)
open(path, 'w').write(s)
print('poses 113 applied')
