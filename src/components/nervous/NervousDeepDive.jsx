import React from 'react';
import DeepDiveExplorer from '../DeepDiveExplorer.jsx';
import { nervousBuilders } from '../../lib/nervous/nervousBuilders.js';
import { nervousPacks } from '../../data/nervous/nervousPacks.js';

export default function NervousDeepDive({ reducedMotion }) {
  return <DeepDiveExplorer reducedMotion={reducedMotion} packs={nervousPacks} builders={nervousBuilders} initialId="reflex" tagOf={(p, lang) => p.tag?.[lang] ?? p.tag?.en} eyebrow={{ en: 'BRAIN & NERVES DEEP DIVE · 3D', bn: 'মস্তিষ্ক ও স্নায়ু গভীর পাঠ · 3D' }} />;
}
