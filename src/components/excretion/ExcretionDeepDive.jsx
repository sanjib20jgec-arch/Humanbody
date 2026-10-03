import React from 'react';
import DeepDiveExplorer from '../DeepDiveExplorer.jsx';
import { excretionBuilders } from '../../lib/excretion/excretionBuilders.js';
import { excretionPacks } from '../../data/excretion/excretionPacks.js';

export default function ExcretionDeepDive({ reducedMotion }) {
  return <DeepDiveExplorer reducedMotion={reducedMotion} packs={excretionPacks} builders={excretionBuilders} initialId="nephron" tagOf={(p, lang) => p.tag?.[lang] ?? p.tag?.en} eyebrow={{ en: 'EXCRETION DEEP DIVE · 3D', bn: 'রেচন গভীর পাঠ · 3D', hi: 'उत्सर्जन का विस्तृत अध्ययन · 3D' }} />;
}
