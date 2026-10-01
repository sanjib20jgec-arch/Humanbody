import React from 'react';
import DeepDiveExplorer from '../DeepDiveExplorer.jsx';
import { digestionBuilders } from '../../lib/digestion/digestionBuilders.js';
import { digestionPacks } from '../../data/digestion/digestionPacks.js';

export default function DigestionDeepDive({ reducedMotion }) {
  return <DeepDiveExplorer reducedMotion={reducedMotion} packs={digestionPacks} builders={digestionBuilders} initialId="stomach" tagOf={(p, lang) => p.tag?.[lang] ?? p.tag?.en} eyebrow={{ en: 'DIGESTION DEEP DIVE · 3D', bn: 'পরিপাক গভীর পাঠ · 3D' }} />;
}
