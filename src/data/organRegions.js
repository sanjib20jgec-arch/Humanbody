/**
 * R7 (F8): single source for the home-atlas system regions and the
 * accessible 2D map. Both views used to carry their own copy — drift risk.
 */
export const organRegions = [
  { id: 'nervous', label: 'Brain & nerves', detail: 'Control & coordination', systems: ['nervous'], color: '#c98f96' },
  { id: 'respiration', label: 'Airways & pulmonary flow', detail: 'Gas exchange route', systems: ['respiratory'], color: '#bd7b81' },
  { id: 'circulation', label: 'Heart & vessels', detail: 'Transport loop', systems: ['cardiac', 'arterial', 'venous'], color: '#a8434d' },
  { id: 'digestion', label: 'Digestive organs', detail: 'Food & absorption', systems: ['digestive'], color: '#9c6048' },
  { id: 'excretion', label: 'Kidneys & urinary', detail: 'Filter & balance', systems: ['urinary'], color: '#914b4d' },
  { id: 'reproduction', label: 'Reproductive system', detail: 'Life cycles', systems: ['reproductive'], color: '#b96b7b' }
];
