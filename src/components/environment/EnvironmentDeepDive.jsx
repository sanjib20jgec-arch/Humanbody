import React from 'react';
import DeepDiveExplorer from '../DeepDiveExplorer.jsx';
import { environmentBuilders } from '../../lib/environment/environmentBuilders.js';
import { environmentPacks } from '../../data/environment/environmentPacks.js';

export default function EnvironmentDeepDive({ reducedMotion }) {
  return <DeepDiveExplorer reducedMotion={reducedMotion} packs={environmentPacks} builders={environmentBuilders} initialId="food-chain" tagOf={(p, lang) => p.tag?.[lang] ?? p.tag?.en} eyebrow={{ en: 'ENVIRONMENT DEEP DIVE · 3D', bn: 'পরিবেশ গভীর পাঠ · 3D' }} />;
}
