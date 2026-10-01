import React, { useEffect, useMemo, useRef, useState } from 'react';
import { usePreferences } from '../lib/PreferencesContext.jsx';
import { levelIncludes } from '../lib/preferences.js';
import { useTimeline } from '../lib/useTimeline.js';
import { ProceduralScene } from '../lib/three/ProceduralScene.js';
import { STRINGS_CELL } from '../data/cell/strings.js';

function webglAvailable() {
  try { const c = document.createElement('canvas'); return Boolean(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; }
}

// Bay-agnostic deep-dive explorer: one engine, one pack per topic (Cell, Tissues, …).
export default function DeepDiveExplorer({ reducedMotion, packs, builders, initialId, tagOf, eyebrow }) {
  const { prefs } = usePreferences();
  const lang = prefs.language;
  const s = (key) => STRINGS_CELL[lang]?.[key] ?? STRINGS_CELL.en[key];
  // Hide topics that have no chapter at the learner's level (e.g. Class 10-only dialysis at Class 9).
  const visible = packs.filter((p) => p.chapters.some((c) => levelIncludes(prefs.level, c.level)));
  const list = visible.length ? visible : packs;
  const [packId, setPackId] = useState(initialId || packs[0].id);
  const pack = list.find((p) => p.id === packId) || list[0];
  return <section className="mito-slice" aria-labelledby="deep-title" lang={lang}>
    <div className="mito-picker" role="tablist" aria-label={s('topic')}>
      {list.map((p) => <button key={p.id} role="tab" aria-selected={p.id === pack.id} onClick={() => setPackId(p.id)}>{(p.title[lang] || p.title.en).replace(/\s*\(.*\)$/, '')}<small>{tagOf ? tagOf(p, lang, s) : ''}</small></button>)}
    </div>
    <DeepDive key={pack.id} pack={pack} builder={builders[pack.id]} reducedMotion={reducedMotion} s={s} eyebrow={eyebrow?.[lang] ?? eyebrow?.en ?? s('deepDive')} />
  </section>;
}

function DeepDive({ pack, builder, reducedMotion, s, eyebrow }) {
  const { prefs } = usePreferences();
  const lang = prefs.language;
  const L = (obj) => obj?.[lang] ?? obj?.en ?? '';
  const allowed = (lvl) => levelIncludes(prefs.level, lvl);
  const chapters = useMemo(() => pack.chapters.filter((c) => allowed(c.level)), [prefs.level, pack]);
  const parts = useMemo(() => pack.parts.filter((p) => allowed(p.level)), [prefs.level, pack]);
  const [chapterId, setChapterId] = useState(chapters[0]?.id);
  const chapter = chapters.find((c) => c.id === chapterId) || chapters[0];
  const [partId, setPartId] = useState(parts[0]?.id);
  const part = parts.find((p) => p.id === partId) || parts[0];
  const use3D = Boolean(builder) && prefs.graphics !== 'low' && typeof window !== 'undefined' && webglAvailable();
  const stageRef = useRef(null);
  const sceneRef = useRef(null);
  const [sceneError, setSceneError] = useState(null);
  const timeline = useTimeline(chapter.duration, { reducedMotion, onTick: (v) => sceneRef.current?.setTime(v) });

  useEffect(() => {
    if (!use3D || !stageRef.current) return undefined;
    let scene;
    try { scene = new ProceduralScene(stageRef.current, builder, { graphics: prefs.graphics, onSelect: (id) => setPartId(id) }); }
    catch (err) { setSceneError(err?.message || 'WebGL error'); return undefined; }
    sceneRef.current = scene;
    scene.setChapter(chapter.id); scene.setHighlight(part?.id);
    return () => { scene.dispose(); sceneRef.current = null; };
  }, [use3D, prefs.graphics, pack.id]);

  useEffect(() => {
    sceneRef.current?.setChapter(chapter.id);
    timeline.seek(reducedMotion ? chapter.duration * 0.7 : 0);
  }, [chapter.id, reducedMotion]);
  useEffect(() => { sceneRef.current?.setHighlight(part?.id); }, [part?.id]);
  useEffect(() => { if (!parts.some((p) => p.id === partId)) setPartId(parts[0]?.id); }, [parts]);

  const claims = pack.claims.filter((c) => allowed(c.level));
  const myths = pack.myths.filter((m) => allowed(m.level));
  const show3D = use3D && !sceneError;

  return <>
    <header className="mito-head">
      <div><span className="eyebrow">{eyebrow} · {s(`level.${prefs.level}`)}</span><h3 id="deep-title">{L(pack.title)}</h3><p>{L(pack.lead)}</p></div>
      <span className="mito-badge">{show3D ? s('badge3d') : s('badge2d')}</span>
    </header>
    <div className="mito-chapters" role="tablist" aria-label={s('chapters')}>
      {chapters.map((c) => <button key={c.id} role="tab" aria-selected={c.id === chapter.id} onClick={() => setChapterId(c.id)}>{L(c.title)}<small>{c.duration} s</small></button>)}
    </div>
    <div className="mito-stage-wrap">
      {show3D
        ? <div ref={stageRef} className="mito-stage" role="img" aria-label={`${L(pack.title)} — ${L(chapter.title)}. ${L(chapter.caption)}`} />
        : <Fallback2D parts={parts} part={part?.id} onSelect={setPartId} L={L} />}
      <p className="mito-caption" aria-live="polite">{L(chapter.caption)}</p>
    </div>
    <div className="mito-controls">
      <button type="button" className="control-button primary-control" onClick={timeline.toggle} disabled={reducedMotion || !show3D} aria-pressed={timeline.playing}>{timeline.playing ? s('pause') : s('play')}</button>
      <button type="button" className="control-button" onClick={() => timeline.seek(timeline.t - 3)} disabled={!show3D}>−3 s</button>
      <input type="range" aria-label={s('scrub')} min="0" max={chapter.duration} step="0.1" value={timeline.t} onChange={(e) => timeline.seek(Number(e.target.value))} disabled={!show3D} />
      <button type="button" className="control-button" onClick={() => timeline.seek(timeline.t + 3)} disabled={!show3D}>+3 s</button>
      <output>{timeline.t.toFixed(1)} / {chapter.duration} s</output>
    </div>
    {reducedMotion && <p className="mito-note">{s('reducedNote')}</p>}
    <div className="mito-grid">
      <div className="mito-parts" role="group" aria-label={s('parts')}>
        <span className="eyebrow">{s('parts')}</span>
        {parts.map((p) => <button key={p.id} type="button" aria-pressed={p.id === part?.id} onClick={() => setPartId(p.id)}><i style={{ background: p.color }} aria-hidden="true" />{L(p.name)}</button>)}
        <small>{s('tapHint')}</small>
      </div>
      {part && <article className="mito-info">
        <span className="eyebrow">{s('selected')}</span>
        <h4>{L(part.name)}</h4>
        <p>{L(part.what)}</p>
        {allowed(part.deepLevel) && <p className="mito-deep"><b>{s(`level.${part.deepLevel}`)}:</b> {L(part.deep)}</p>}
      </article>}
    </div>
    {myths.length > 0 && <div className="mito-myths"><span className="eyebrow">{s('myths')}</span>{myths.map((m, i) => <div key={i}><del>{L(m.wrong)}</del><p>{L(m.right)}</p></div>)}</div>}
    <Quiz items={pack.quiz.filter((q) => allowed(q.level))} lang={lang} s={s} />
    <details className="mito-facts"><summary>{s('facts')} ({claims.length})</summary>
      <ul>{claims.map((c) => <li key={c.id}><p>{L(c.text)}</p><small>{c.sources.map((src, i) => <span key={i}>{src.url ? <a href={src.url} target="_blank" rel="noreferrer">{src.title}</a> : `${src.title} — ${src.citation}`}</span>)}</small></li>)}</ul>
    </details>
    <p className="mito-note">{L(pack.limitation)}</p>
  </>;
}

function Quiz({ items, lang, s }) {
  const [answers, setAnswers] = useState({});
  const score = items.filter((q) => answers[q.id] === q.answer).length;
  return <div className="mito-quiz"><span className="eyebrow">{s('quiz')} · {score}/{items.length}</span>
    {items.map((q, qi) => <fieldset key={q.id}><legend>{qi + 1}. {q.q[lang]}</legend>
      {q.options.map((o, i) => {
        const done = answers[q.id] !== undefined;
        const state = done && i === q.answer ? 'right' : answers[q.id] === i ? 'wrong' : '';
        return <button key={i} type="button" className={state} disabled={done} onClick={() => setAnswers((a) => ({ ...a, [q.id]: i }))}>{o[lang]}</button>;
      })}
      {answers[q.id] !== undefined && <p role="status">{answers[q.id] === q.answer ? s('correct') : s('incorrect')}</p>}
    </fieldset>)}
    {Object.keys(answers).length > 0 && <button type="button" className="control-button" onClick={() => setAnswers({})}>{s('retry')}</button>}
  </div>;
}

// Low graphics / no WebGL: labelled colour key acting as an accessible 2D diagram.
function Fallback2D({ parts, part, onSelect, L }) {
  const n = parts.length;
  return <svg className="mito-stage mito-2d" viewBox="0 0 400 220" role="group">
    {parts.map((p, i) => {
      const r = 95 - (i * 80) / Math.max(1, n);
      return <g key={p.id} role="button" tabIndex={0} aria-label={L(p.name)} className={`m2d-part ${part === p.id ? 'on' : ''}`} onClick={() => onSelect(p.id)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelect(p.id); }}>
        <ellipse cx="130" cy="110" rx={r * 1.25} ry={r} fill={p.color} opacity={i === 0 ? 0.9 : 0.75} />
        <rect x="262" y={14 + i * 24} width="12" height="12" rx="3" fill={p.color} />
        <text x="280" y={24 + i * 24} fontSize="11" fill="#e8eef6">{L(p.name).replace(/\s*\(.*\)$/, '')}</text>
      </g>;
    })}
  </svg>;
}
