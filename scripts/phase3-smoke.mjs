import { readFile } from 'node:fs/promises';

const read = (file) => readFile(file, 'utf8');
const [app, quiz, atlas, styles, progress] = await Promise.all([
  read('src/App.jsx'),
  read('src/components/Quiz.jsx'),
  read('src/components/BodyMap3DAtlas.jsx'),
  read('src/styles.css'),
  read('src/lib/progress.js')
]);
const checks = [
  ['modal focus semantics', app.includes('aria-modal="true"') && app.includes('querySelectorAll')],
  ['quiz live feedback', quiz.includes('aria-live="polite"') && quiz.includes('aria-pressed')],
  ['anatomy search', atlas.includes('anatomy-search') && atlas.includes('Share structure')],
  ['touch target styles', styles.includes('min-height:38px') && styles.includes('safe-area-inset-bottom')],
  ['quiz attempt accounting', progress.includes('previous.attempts + 1') && progress.includes('best:')],
];
const failed = checks.filter(([, pass]) => !pass).map(([name]) => name);
if (failed.length) throw new Error(`Phase 3 checks failed: ${failed.join(', ')}`);
console.log('HBL phase 3 accessibility and learning smoke check passed.');
