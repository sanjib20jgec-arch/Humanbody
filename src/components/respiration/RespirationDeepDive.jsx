import React from 'react';
import DeepDiveExplorer from '../DeepDiveExplorer.jsx';
import { respirationBuilders } from '../../lib/respiration/respirationBuilders.js';
import { respirationPacks } from '../../data/respiration/respirationPacks.js';

export default function RespirationDeepDive({ reducedMotion }) {
  return <DeepDiveExplorer reducedMotion={reducedMotion} packs={respirationPacks} builders={respirationBuilders} initialId="alveoli" tagOf={(p, lang) => p.tag?.[lang] ?? p.tag?.en} eyebrow={{ en: 'RESPIRATION DEEP DIVE · 3D', bn: 'শ্বসন গভীর পাঠ · 3D' }} />;
}
