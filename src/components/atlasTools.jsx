import React, { useState } from 'react';
import { ACCESSIBLE_STRUCTURE_CATALOG } from '../data/accessibleStructureCatalog';

/**
 * Phase 40s–60s UI panels for the atlas, split into their own lazy chunk so
 * the core viewer module stays inside its performance budget. `organRegions`
 * is duplicated (data-only) from BodyMap3DAtlas to avoid a circular import.
 */
import { organRegions } from '../data/organRegions.js';

// Phase 53: semantic structure index with keyboard parity. Structures appear
// as their layers load; selection syncs with the 3D scene both ways.
export function StructureIndexPanel({ manager, query, setQuery, onPick, onClose }) {
  const index = manager?.getStructureIndex?.() || [];
  const filtered = index.map((group) => ({ ...group, parts: group.parts.filter((part) => !query.trim() || part.name.toLowerCase().includes(query.trim().toLowerCase())) })).filter((group) => group.parts.length);
  const total = filtered.reduce((sum, group) => sum + group.parts.length, 0);
  return <aside id="atlas-structure-index" className="atlas-structure-index" aria-label="Semantic structure index"><div className="structure-index-head"><span className="eyebrow">STRUCTURE INDEX · LOADED ANATOMY</span><button type="button" onClick={onClose} aria-label="Close structure index">Close</button></div><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Filter loaded structures…" aria-label="Filter loaded structures" autoComplete="off" /><div className="structure-index-list">{filtered.length ? filtered.map((group) => <details key={group.system} open={total < 60}><summary>{group.system} · {group.parts.length}</summary>{group.parts.slice(0, 80).map((part) => <button key={part.id} type="button" className="structure-index-row" onClick={() => onPick(part)}><strong>{part.name}</strong><small>{part.conceptId || '—'}</small></button>)}</details>) : <p className="structure-index-empty">No loaded structures match. Load a layer or search the atlas first.</p>}</div><small className="structure-index-note">Keyboard operable: Tab into the list, Enter selects. Structures load with their layers.</small></aside>;
}

// Phase 56: local bookmarks with full semantic state.
export function BookmarksPanel({ list, onSave, onApply, onDelete, onClose }) {
  return <aside id="atlas-bookmarks-panel" className="atlas-bookmarks-panel" aria-label="Atlas bookmarks"><div className="structure-index-head"><span className="eyebrow">BOOKMARKS · SAVED LOCALLY</span><button type="button" onClick={onClose} aria-label="Close bookmarks">Close</button></div><button type="button" className="primary-cta" onClick={onSave}>Save current view</button>{list.length ? <ul>{list.map((bookmark) => <li key={bookmark.id}><button type="button" onClick={() => onApply(bookmark)}><strong>{bookmark.name}</strong><small>{new Date(bookmark.savedAt).toLocaleString()}</small></button><button type="button" onClick={() => onDelete(bookmark.id)} aria-label={`Delete bookmark ${bookmark.name}`}>✕</button></li>)}</ul> : <p className="structure-index-empty">No bookmarks yet. Save the current selection and layers.</p>}</aside>;
}

// Phase 61: pin-label quiz over loaded certified parts.
export function AtlasLabelQuiz({ manager, onClose }) {
  const buildRound = () => {
    const index = manager?.getStructureIndex?.() || [];
    const pool = index.flatMap((group) => group.parts);
    if (pool.length < 4) return null;
    const target = pool[Math.floor(Math.random() * pool.length)];
    const distractors = pool.filter((part) => part.id !== target.id).sort(() => Math.random() - 0.5).slice(0, 3);
    return { target, options: [...distractors, target].sort(() => Math.random() - 0.5) };
  };
  const [round, setRound] = useState(buildRound);
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const managerPick = async (part) => { const result = await manager?.searchAndLoad(part.name); if (result) manager.setHovered(result, null); };
  if (!round) return <aside className="atlas-label-quiz" aria-label="Pin label quiz"><div className="structure-index-head"><span className="eyebrow">LABEL QUIZ</span><button type="button" onClick={onClose}>Close</button></div><p className="structure-index-empty">Load at least four structures (enable more layers) to start the quiz.</p></aside>;
  const answer = (option) => {
    const correct = option.id === round.target.id;
    setFeedback(correct ? `Correct — ${round.target.name}.` : `Not quite. The highlighted structure is ${round.target.name}.`);
    setScore((value) => ({ correct: value.correct + (correct ? 1 : 0), total: value.total + 1 }));
    managerPick(round.target);
  };
  return <aside className="atlas-label-quiz" aria-label="Pin label quiz"><div className="structure-index-head"><span className="eyebrow">LABEL QUIZ · {score.correct}/{score.total}</span><button type="button" onClick={onClose}>Close</button></div><p>What is the highlighted structure?</p><div className="quiz-options">{round.options.map((option) => <button key={option.id} type="button" disabled={Boolean(feedback)} onClick={() => answer(option)}>{option.name}</button>)}</div>{feedback && <p role="status" aria-live="polite">{feedback}</p>}<button type="button" className="outline-button" onClick={() => { setFeedback(null); setRound(buildRound()); }}>Next question</button><small>Atlas label practice — correctness reflects source labels, not clinical identification skill.</small></aside>;
}

// Phase 31 (relocated in Phase 59): the accessible 2D atlas route with
// part-level structure parity. Lives in the lazy tools chunk so the core
// viewer module stays slim.
export function AccessibleAtlasMode({ onSelect, onAnatomySelect, initialSystemId, visited = {} }) {
  const initialRegion = organRegions.find((item) => item.systems.includes(initialSystemId)) || organRegions[0];
  const [selectedId, setSelectedId] = useState(initialRegion.id);
  const [structureQuery, setStructureQuery] = useState('');
  const [selectedStructure, setSelectedStructure] = useState(null);
  const selected = organRegions.find((item) => item.id === selectedId) || organRegions[0];
  const structures = (ACCESSIBLE_STRUCTURE_CATALOG[selectedId]?.structures || []).filter((structure) => !structureQuery.trim() || structure.name.toLowerCase().includes(structureQuery.trim().toLowerCase()));
  const choose = (id) => {
    const next = organRegions.find((item) => item.id === id) || organRegions[0];
    setSelectedId(next.id);
    setSelectedStructure(null);
    setStructureQuery('');
    onSelect?.(next.id);
    onAnatomySelect?.({ commonName: next.label, latinName: 'Accessible system summary', conceptId: '—', id: '—', system: next.systems[0], primaryFunction: next.detail, clinicalSignificance: 'This is a simplified system-level educational route, not a clinical image.', educationalModel: 'Simplified 2D educational diagram' });
  };
  const chooseStructure = (structure) => {
    setSelectedStructure(structure);
    onAnatomySelect?.({ commonName: structure.name, latinName: 'BodyParts3D certified part', conceptId: structure.conceptId, id: structure.id, system: selected.systems[0], primaryFunction: structure.function, clinicalSignificance: structure.limitation, educationalModel: 'Accessible keyboard route over the certified adult-male atlas' });
  };
  const onStructureListKeyDown = (event) => {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    const buttons = Array.from(event.currentTarget.querySelectorAll('button.accessible-structure-row'));
    if (!buttons.length) return;
    event.preventDefault();
    const currentIndex = buttons.indexOf(document.activeElement);
    const nextIndex = event.key === 'ArrowDown' ? Math.min(buttons.length - 1, currentIndex + 1) : Math.max(0, currentIndex - 1);
    buttons[Math.max(0, nextIndex)]?.focus();
  };
  return <section className="accessible-atlas-mode" aria-label="Accessible two-dimensional anatomy map"><div className="accessible-atlas-copy"><span className="eyebrow">SIMPLIFIED 2D REFERENCE</span><h2>Select a body system</h2><p>This keyboard-ready map keeps the major anatomical relationships visible without requiring WebGL. It is an educational diagram, not a diagnostic image.</p><div className="accessible-atlas-selection" role="status" aria-live="polite"><strong>{selected.label}</strong><span>{selected.detail}</span></div></div><div className="accessible-atlas-figure"><svg viewBox="0 0 220 430" role="img" aria-label="Simplified anterior human body diagram with major organ regions"><path className="accessible-body-silhouette" d="M110 25c-22 0-34 16-34 38 0 17 8 28 20 34l-7 21-34 20c-10 6-16 17-16 29v66h20v-53l12-7-8 61 16 17 2 134h20l9-101 9 101h20l2-134 16-17-8-61 12 7v53h20v-66c0-12-6-23-16-29l-34-20-7-21c12-6 20-17 20-34 0-22-12-38-34-38Z" /><ellipse className="accessible-organ organ-lungs" cx="91" cy="143" rx="18" ry="30" /><ellipse className="accessible-organ organ-lungs" cx="129" cy="143" rx="18" ry="30" /><path className="accessible-organ organ-heart" d="M110 151c-13-14-29 4 0 25 29-21 13-39 0-25Z" /><path className="accessible-organ organ-liver" d="M83 190c18-12 45-10 57 2l-6 24H87Z" /><ellipse className="accessible-organ organ-kidney" cx="82" cy="229" rx="8" ry="15" /><ellipse className="accessible-organ organ-kidney" cx="138" cy="229" rx="8" ry="15" /><path className="accessible-organ organ-nerves" d="M110 61v261M98 73l-22 28M122 73l22 28M110 280l-20 28M110 280l20 28" /></svg><span className="accessible-anatomy-caption">Anterior orientation · simplified relative locations</span></div><div className="accessible-atlas-list" role="list" aria-label="Body system choices">{organRegions.map((system) => <button key={system.id} type="button" className={selectedId === system.id ? 'selected' : ''} onClick={() => choose(system.id)} aria-pressed={selectedId === system.id}><i style={{ background: system.color }} /><span><strong>{system.label}</strong><small>{system.detail}</small></span>{visited[system.id] && <b aria-label="visited">✓</b>}</button>)}</div><div className="accessible-structure-panel"><div className="accessible-structure-head"><span className="eyebrow">PART-LEVEL STRUCTURES · {selected.label.toUpperCase()}</span><label htmlFor={`accessible-structure-filter-${selectedId}`}>Filter structures</label><input id={`accessible-structure-filter-${selectedId}`} value={structureQuery} onChange={(event) => setStructureQuery(event.target.value)} placeholder="Type a structure name…" autoComplete="off" /></div><div className="accessible-structure-list" role="listbox" aria-label={`Certified structures in ${selected.label}`} onKeyDown={onStructureListKeyDown}>{structures.length ? structures.map((structure) => <button key={structure.id} type="button" role="option" aria-selected={selectedStructure?.id === structure.id} className={`accessible-structure-row ${selectedStructure?.id === structure.id ? 'selected' : ''}`} onClick={() => chooseStructure(structure)}><strong>{structure.name}</strong><small>{structure.conceptId} · {structure.function}</small></button>) : <p className="accessible-structure-empty">No certified part-level structures match this filter for {selected.label}. The full atlas still exposes them in 3D mode.</p>}</div>{selectedStructure && <div className="accessible-structure-detail" role="status" aria-live="polite"><strong>{selectedStructure.name}</strong><span>{selectedStructure.conceptId}</span><p>{selectedStructure.function}</p><small>{selectedStructure.limitation}</small></div>}</div></section>;
}
