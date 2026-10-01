import React from 'react';
import DeepDiveExplorer from '../DeepDiveExplorer.jsx';
import { organelleBuilders } from '../../lib/cell/organelleBuilders.js';
import { organellePacks } from '../../data/cell/organellePacks.js';

// Cell bay organelle deep dive (thin wrapper over the shared explorer).
export default function CellDeepDive({ reducedMotion }) {
  return <DeepDiveExplorer reducedMotion={reducedMotion} packs={organellePacks} builders={organelleBuilders} initialId="mitochondrion" tagOf={(p, lang, s) => s(`cell.${p.cell}`)} />;
}
