import React from 'react';
import DeepDiveExplorer from '../DeepDiveExplorer.jsx';
import { circulationBuilders } from '../../lib/circulation/circulationBuilders.js';
import { circulationPacks } from '../../data/circulation/circulationPacks.js';

export default function CirculationDeepDive({ reducedMotion }) {
  return <DeepDiveExplorer reducedMotion={reducedMotion} packs={circulationPacks} builders={circulationBuilders} initialId="heart" tagOf={(p, lang) => p.tag?.[lang] ?? p.tag?.en} eyebrow={{ en: 'CIRCULATION DEEP DIVE · 3D', bn: 'সংবহন গভীর পাঠ · 3D' }} />;
}
