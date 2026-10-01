import React from 'react';
import DeepDiveExplorer from '../DeepDiveExplorer.jsx';
import { tissueBuilders } from '../../lib/tissues/tissueBuilders.js';
import { tissuePacks } from '../../data/tissues/tissuePacks.js';

// Tissues bay deep dive (shared explorer + tissue packs).
export default function TissueDeepDive({ reducedMotion }) {
  return <DeepDiveExplorer reducedMotion={reducedMotion} packs={tissuePacks} builders={tissueBuilders} initialId="skeletal-muscle" tagOf={(p, lang) => p.tag?.[lang] ?? p.tag?.en} eyebrow={{ en: 'TISSUE DEEP DIVE · 3D', bn: 'কলা গভীর পাঠ · 3D' }} />;
}
