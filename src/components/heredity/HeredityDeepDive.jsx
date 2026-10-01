import React from 'react';
import DeepDiveExplorer from '../DeepDiveExplorer.jsx';
import { heredityBuilders } from '../../lib/heredity/heredityBuilders.js';
import { heredityPacks } from '../../data/heredity/heredityPacks.js';

export default function HeredityDeepDive({ reducedMotion }) {
  return <DeepDiveExplorer reducedMotion={reducedMotion} packs={heredityPacks} builders={heredityBuilders} initialId="mendel" tagOf={(p, lang) => p.tag?.[lang] ?? p.tag?.en} eyebrow={{ en: 'HEREDITY DEEP DIVE · 3D', bn: 'বংশগতি গভীর পাঠ · 3D' }} />;
}
