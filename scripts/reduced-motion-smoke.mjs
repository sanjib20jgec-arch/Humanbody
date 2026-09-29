import { readFile } from 'node:fs/promises';

const moduleFiles = {
  cell: 'CellLab.jsx',
  tissues: 'TissuesLab.jsx',
  digestion: 'DigestiveLab.jsx',
  circulation: 'CirculationLab.jsx',
  nervous: 'NervousLab.jsx',
  respiration: 'RespirationLab.jsx',
  excretion: 'ExcretionLab.jsx',
  reproduction: 'ReproductionLab.jsx',
  heredity: 'HeredityLab.jsx'
};

const app = await readFile('src/App.jsx', 'utf8');
const atlas = await readFile('src/components/BodyMap3DAtlas.jsx', 'utf8');
const sources = Object.fromEntries(await Promise.all(Object.entries(moduleFiles).map(async ([id, file]) => [id, await readFile(`src/simulations/${file}`, 'utf8')])));
const failures = [];
const check = (name, condition) => { if (!condition) failures.push(name); };

check('saved preference takes precedence over system preference', /localStorage\.getItem\('hbl-reduced-motion'\)[\s\S]*saved !== null[\s\S]*return saved === 'true'/.test(app));
check('system prefers-reduced-motion is the fallback', app.includes("matchMedia?.('(prefers-reduced-motion: reduce)')?.matches"));
check('reduced-motion reaches the active module', app.includes('reducedMotion={reducedMotion}') && app.includes('const props = {') && app.includes('reducedMotion };'));
check('reduced-motion body class remains wired', app.includes("classList.toggle('reduce-motion', reducedMotion)"));
check('reduced-motion reaches the 3D atlas', app.includes('<BodyMap3DAtlas') && app.includes('reducedMotion={reducedMotion}') && atlas.includes('reducedMotion = false') && atlas.includes('controls.enableDamping = !reducedMotion'));

for (const [id, source] of Object.entries(sources)) {
  check(`${id} accepts reduced-motion state`, /export default function \w+\(\{[^}]*reducedMotion/.test(source));
  check(`${id} pauses its primary runtime loop`, source.includes('reducedMotion || !playing'));
  check(`${id} stops playing when reduced motion changes`, source.includes('if (reducedMotion) setPlaying(false)'));
  check(`${id} keeps reset and step controls`, id === 'circulation' ? source.includes('onClick={step}') && source.includes('onClick={reset}') : source.includes('onReset=') && source.includes('onStep='));
}

check('cell diffusion RAF cannot start in reduced motion', sources.cell.includes('playing && !reducedMotion') && sources.cell.includes('reducedMotion={reducedMotion}'));
check('cardiac physiology engine cannot start in reduced motion', sources.circulation.includes('if (reducedMotion) return;') && sources.circulation.includes('engineRef.current?.stop()'));
check('cardiac mesh render loop pauses in reduced motion', sources.circulation.includes('active && !reducedMotion') && sources.circulation.includes('reducedMotion={reducedMotion}'));
check('enzyme kinetics engine cannot start in reduced motion', sources.digestion.includes('if (reducedMotion) return;') && sources.digestion.includes('engineRef.current?.stop()'));

if (failures.length) {
  console.error(`Reduced-motion smoke check failed: ${failures.join(', ')}`);
  process.exitCode = 1;
} else {
  console.log(`HBL reduced-motion smoke check passed (${Object.keys(sources).length} simulation bays, system fallback, and runtime pause guards).`);
}
