import { access, readFile } from 'node:fs/promises';
import { constants } from 'node:fs';

const [data, app, progress, quiz, controls] = await Promise.all([
  readFile('src/data/modules.js', 'utf8'),
  readFile('src/App.jsx', 'utf8'),
  readFile('src/lib/progress.js', 'utf8'),
  readFile('src/components/Quiz.jsx', 'utf8'),
  readFile('src/components/SimulationControls.jsx', 'utf8')
]);

const componentById = {
  cell: 'CellLab',
  tissues: 'TissuesLab',
  digestion: 'DigestiveLab',
  circulation: 'CirculationLab',
  nervous: 'NervousLab',
  respiration: 'RespirationLab',
  excretion: 'ExcretionLab',
  reproduction: 'ReproductionLab',
  heredity: 'HeredityLab',
  kinesiology: 'KinesiologyLab'
};
const moduleSource = data.split('export const coreModules')[0];
const modules = [...moduleSource.matchAll(/\{\n    id: '([^']+)',([\s\S]*?)\n  \}(?:,|\n)/g)].map((match) => ({ id: match[1], body: match[2] }));
const ids = modules.map((module) => module.id);
const coreIds = modules.filter((module) => module.body.includes("status: 'core'")).map((module) => module.id);
const guidedMatch = data.match(/export const guidedPath = \[([^\]]+)\]/);
const guidedIds = guidedMatch ? [...guidedMatch[1].matchAll(/'([^']+)'/g)].map((match) => match[1]) : [];
const failures = [];
const check = (name, condition) => { if (!condition) failures.push(name); };

check('module ids are unique', new Set(ids).size === ids.length);
check('guided path ids exist', guidedIds.length > 0 && guidedIds.every((id) => ids.includes(id)));
check('all core modules are guided', coreIds.every((id) => guidedIds.includes(id)));
check('resume logic is wired', app.includes('resumeView') && app.includes('progress.lastView') && app.includes('markView'));
check('quiz completion persists', app.includes('recordQuiz') && progress.includes('markCompleted'));
check('quiz guards final state', quiz.includes('selected !== null') && quiz.includes('onComplete?.'));
check('simulation control semantics', controls.includes('aria-pressed') && controls.includes('onReset') && controls.includes('onStep'));

for (const module of modules) {
  if (module.body.includes("status: 'preview'")) continue;
  const component = componentById[module.id];
  check(`${module.id} has component mapping`, Boolean(component));
  check(`${module.id} is rendered`, Boolean(component && app.includes(`active.id === '${module.id}' && <${component}`)));
  check(`${module.id} has component file`, await access(`src/simulations/${component}.jsx`, constants.F_OK).then(() => true).catch(() => false));
  check(`${module.id} has quiz data`, data.includes(`\n  ${module.id}: [`));
  check(`${module.id} exposes all views`, Boolean(component && (() => {
    // The component file is checked below through the already-known path.
    return true;
  })()));
}

for (const [id, component] of Object.entries(componentById)) {
  const source = await readFile(`src/simulations/${component}.jsx`, 'utf8');
  check(`${id} uses Explore/Simulate/Quiz`, source.includes('activeView === \'quiz\'') && source.includes('activeView === \'simulate\'') && source.includes('activeView === \'explore\''));
  check(`${id} uses shared controls`, source.includes('SimulationControls'));
  check(`${id} uses shared quiz`, source.includes('Quiz moduleId'));
}

if (failures.length) {
  console.error(`Interaction smoke check failed: ${failures.join(', ')}`);
  process.exitCode = 1;
} else {
  console.log(`HBL interaction smoke check passed (${coreIds.length} core bays, ${guidedIds.length} guided checkpoints).`);
}
