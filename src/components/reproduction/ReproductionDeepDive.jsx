import React from 'react';
import DeepDiveExplorer from '../DeepDiveExplorer.jsx';
import { reproductionBuilders } from '../../lib/reproduction/reproductionBuilders.js';
import { reproductionPacks } from '../../data/reproduction/reproductionPacks.js';

export default function ReproductionDeepDive({ reducedMotion }) {
  return <DeepDiveExplorer reducedMotion={reducedMotion} packs={reproductionPacks} builders={reproductionBuilders} initialId="flower" tagOf={(p, lang) => p.tag?.[lang] ?? p.tag?.en} eyebrow={{ en: 'REPRODUCTION DEEP DIVE · 3D', bn: 'জনন গভীর পাঠ · 3D' }} />;
}
