import { readFile } from 'node:fs/promises';

const [manifestText, attribution, map, references, modules] = await Promise.all([
  readFile('public/models/atlas.json', 'utf8'),
  readFile('public/ATTRIBUTION-BodyParts3D.md', 'utf8'),
  readFile('src/components/BodyMap3DAtlas.jsx', 'utf8'),
  readFile('src/data/learningObjectives.js', 'utf8'),
  readFile('src/data/modules.js', 'utf8')
]);
const manifest = JSON.parse(manifestText);
const failures = [];
const check = (name, condition) => { if (!condition) failures.push(name); };
const systems = new Set(manifest.parts.map((part) => part.system));

check('BodyParts3D version is declared', /^BodyParts3D\s4\.0/.test(manifest.version));
check('anatomy manifest has a meaningful skeletal system', systems.has('skeletal') && manifest.parts.some((part) => part.system === 'skeletal'));
check('manifest includes circulation structures', systems.has('cardiac') && systems.has('arterial') && systems.has('venous'));
check('manifest includes respiratory and digestive structures', systems.has('respiratory') && systems.has('digestive'));
check('manifest includes urinary and nervous structures', systems.has('urinary') && systems.has('nervous'));
check('manifest contains demand-loading indexes', manifest.indexes?.chunkToSystems && manifest.indexes?.chunkToStructures && manifest.indexes?.chunkToLearningModules && manifest.indexes?.systemToChunks && manifest.indexes?.moduleToChunks);
check('demand-loading indexes cover every chunk', manifest.chunks.every((_, index) => Array.isArray(manifest.indexes?.chunkToSystems?.[index]) && Array.isArray(manifest.indexes?.chunkToStructures?.[index])));
check('demand-loading indexes agree with manifest parts', manifest.parts.every((part) => manifest.indexes?.chunkToStructures?.[part.chunk]?.includes(part.id) && manifest.indexes?.chunkToSystems?.[part.chunk]?.includes(part.system)));
check('attribution preserves CC BY terms', /CC BY/i.test(attribution) && /BodyParts3D/i.test(attribution));
check('atlas discloses adult male reference', /ADULT MALE REFERENCE/.test(map));
check('atlas labels simplified educational model', /educational visualization|educational model|educational diagram/i.test(map));
// R1 regression guard: brain structures must never be classified cardiac, and
// CSF-producing tissue never sensory. A keyword classifier must not re-break this.
const brainTerms = /third ventricle|fourth ventricle|lateral ventricle|interventricular foramen|choroid plexus/i;
check('no brain structures classified cardiac', !manifest.parts.some((part) => part.system === 'cardiac' && brainTerms.test(part.name || '')));
check('no choroid plexus classified sensory', !manifest.parts.some((part) => part.system === 'sensory' && /choroid plexus/i.test(part.name || '')));
check('aortic cusps carry standard teaching names', manifest.parts.filter((part) => /cusp of aortic valve/i.test(part.name || '')).every((part) => /coronary|non-coronary/i.test(part.standardName || '')));
check('anatomy terminology source is linked', references.includes('openstax.org/books/anatomy-and-physiology-2e/pages/1-6-anatomical-terminology'));
check('heart anatomy source is linked', references.includes('openstax.org/books/anatomy-and-physiology-2e/pages/19-1-heart-anatomy'));
check('kidney anatomy source is linked', references.includes('openstax.org/books/anatomy-and-physiology-2e/pages/25-3-gross-anatomy-of-the-kidney'));
check('nervous system source is linked', references.includes('openstax.org/books/anatomy-and-physiology-2e/pages/12-1-basic-structure-and-function-of-the-nervous-system'));
check('all core modules have learning metadata', ['cell', 'tissues', 'digestion', 'respiration', 'circulation', 'excretion', 'nervous', 'reproduction', 'heredity'].every((id) => modules.includes(`id: '${id}'`)));

if (failures.length) {
  console.error(`Anatomy QC failed: ${failures.join(', ')}`);
  process.exitCode = 1;
} else {
  console.log(`HBL anatomy QC passed (${manifest.parts.length} parts, ${systems.size} mapped systems).`);
  if (!manifest.parts.some((part) => /lung/i.test(part.name || ''))) console.warn('Anatomy QC note: no lung-parenchyma mesh is present; keep lung/alveoli content explicitly labeled as a focused teaching model.');
}
