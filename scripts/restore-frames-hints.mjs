// Idempotent restorer: camera FRAMES (cameraDirector.js) and theater HINTS
// (KinesiologyTheater.jsx) for the Directive-19 actions (phases 113-116).
// Safe to run repeatedly; only inserts what is missing.
import { readFileSync, writeFileSync } from 'node:fs';

const camPath = 'src/lib/kinesiology/cameraDirector.js';
const jsxPath = 'src/components/KinesiologyTheater.jsx';

const NEW_FRAMES = {
  squat: { y: 0.8, d: 4.2 }, 'sit-stand': { y: 0.85, d: 4.2 }, lunge: { y: 0.95, d: 4.4 },
  kick: { y: 1.0, d: 4.2 }, sidestep: { y: 0.95, d: 4.6 }, 'one-leg': { y: 1.05, d: 4.0 },
  'tiptoe-walk': { y: 0.98, d: 4.2 }, 'heel-walk': { y: 0.98, d: 4.2 }, bow: { y: 1.0, d: 4.0 },
  shrug: { y: 1.45, d: 2.8 }, 'reach-up': { y: 1.2, d: 3.4 }, clap: { y: 1.3, d: 3.0 },
  'head-signals': { y: 1.6, d: 2.4 }
};

let cam = readFileSync(camPath, 'utf8');
if (!cam.includes("'tiptoe-walk':")) {
  const missing = Object.entries(NEW_FRAMES)
    .map(([k, v]) => `${/^[a-z]+$/.test(k) ? k : `'${k}'`}: { y: ${v.y}, d: ${v.d} }`)
    .join(', ');
  cam = cam.replace(/(talk: \{ y: [^}]+\})\n\};/, `$1,\n  ${missing}\n};`);
  writeFileSync(camPath, cam);
  console.log('frames restored');
} else {
  console.log('frames already present');
}

const NEW_HINTS = {
  squat: ['How deep can you go without the heels lifting?', 'Which muscles brake the descent?', 'What drives the stand-up?'],
  'sit-stand': ['Where should the nose go before rising?', 'Which muscles do the lifting?', 'How does momentum help?'],
  lunge: ['Which leg absorbs the drop?', 'What keeps the trunk tall?', 'Where is the stretch felt?'],
  kick: ['Which muscle snaps the lower leg out?', 'What stops you falling forward as the leg swings?', 'Where does the leg land on the return?'],
  sidestep: ['Which muscles keep the pelvis level?', 'Who leads the lateral shift?', 'Why do quiet feet matter?'],
  'one-leg': ['Which hip muscles stop the drop?', 'Where does the ankle steer?', 'What switches off when the hip sags?'],
  'tiptoe-walk': ['Which muscles never get a rest here?', 'What would happen to the heels without them?', 'Why is balance harder on tiptoe?'],
  'heel-walk': ['Which muscle refuses to let the toes drop?', 'Who pulls you forward without push-off?', 'What does this drill spare?'],
  bow: ['Where should the fold come from?', 'Which muscles lengthen under load?', 'What stacks the spine back up?'],
  shrug: ['Which muscle lifts the shoulder blade?', 'Who controls the melt-down?', 'Where should the neck stay?'],
  'reach-up': ['Which muscles lift the arm overhead?', 'What rotates the shoulder blade?', 'Who controls the descent?'],
  clap: ['Where does the clap rhythm live?', 'Which muscles hold the elbow fold?', 'What stays relaxed?'],
  'head-signals': ['Which joint makes the yes?', 'Which movement makes the no?', 'What should stay quiet?']
};

let jsx = readFileSync(jsxPath, 'utf8');
if (!jsx.includes("'head-signals':")) {
  const block = Object.entries(NEW_HINTS)
    .map(([k, arr]) => `    ${/^[a-z-]+$/.test(k) && !k.includes('-') ? k : `'${k}'`}: [${arr.map((q) => `'${q}'`).join(', ')}],`)
    .join('\n');
  jsx = jsx.replace(/(\n)(    kick: \[)/, `\n${block}\n$2`);
  writeFileSync(jsxPath, jsx);
  console.log('hints restored');
} else {
  console.log('hints already present');
}
