import React from 'react';
import DeepDiveExplorer from '../DeepDiveExplorer.jsx';
import { evolutionBuilders } from '../../lib/evolution/evolutionBuilders.js';
import { evolutionPacks } from '../../data/evolution/evolutionPacks.js';

export default function EvolutionDeepDive({ reducedMotion }) {
  return <DeepDiveExplorer reducedMotion={reducedMotion} packs={evolutionPacks} builders={evolutionBuilders} initialId="selection" tagOf={(p, lang) => p.tag?.[lang] ?? p.tag?.en} eyebrow={{ en: 'EVOLUTION DEEP DIVE · 3D', bn: 'বিবর্তন গভীর পাঠ · 3D', hi: 'जैव-विकास का विस्तृत अध्ययन · 3D' }} />;
}
