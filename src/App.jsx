import React, { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from './components/Icons';
import GuidedStepCard from './components/GuidedStepCard';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import { usePreferences } from './lib/PreferencesContext.jsx';
import FoundationSettings from './components/FoundationSettings.jsx';

const BodyMap3DAtlas = lazy(() => import('./components/BodyMap3DAtlas'));
const KinesiologyLab = lazy(() => import('./simulations/KinesiologyLab'));
import { modules, placeholderCopy } from './data/modules';
import { evidenceReferences, learningObjectives } from './data/learningObjectives';

// Keep the atlas and shell fast to first interaction. A learning bay is
// loaded only when the student opens it; the offline build inlines these
// chunks back into its self-contained artifact.
const CellLab = lazy(() => import('./simulations/CellLab.jsx'));
const DigestiveLab = lazy(() => import('./simulations/DigestiveLab.jsx'));
const CirculationLab = lazy(() => import('./simulations/CirculationLab.jsx'));
const NervousLab = lazy(() => import('./simulations/NervousLab.jsx'));
const RespirationLab = lazy(() => import('./simulations/RespirationLab.jsx'));
const ExcretionLab = lazy(() => import('./simulations/ExcretionLab.jsx'));
const ReproductionLab = lazy(() => import('./simulations/ReproductionLab.jsx'));
const HeredityLab = lazy(() => import('./simulations/HeredityLab.jsx'));
const EvolutionLab = lazy(() => import('./simulations/EvolutionLab.jsx'));
const EnvironmentLab = lazy(() => import('./simulations/EnvironmentLab.jsx'));
const TissuesLab = lazy(() => import('./simulations/TissuesLab.jsx'));
import { loadProgress, markCompleted, markExplored, markView, progressPercent, recordQuiz, saveProgress } from './lib/progress';
import { soundManager } from './lib/sound';
import { askAI } from './lib/ai';
import { clearAnatomyOfflineDownload, downloadAnatomyForOffline, getAnatomyDownloadEstimate } from './lib/anatomyDownload';
import { startPerformanceTelemetry } from './lib/performance';
import { guidedPath, getGuidedNeighbors, getGuidedPathStep, getGuidedRecommendation, getGuidedStepState } from './lib/guidedPath';

function readReducedMotionPreference() {
  if (typeof window === 'undefined') return false;
  try {
    const saved = window.localStorage.getItem('hbl-reduced-motion');
    if (saved !== null) return saved === 'true';
  } catch { /* storage can be unavailable */ }
  return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches || false;
}

function readAtlasQualityPreference() {
  if (typeof window === 'undefined') return 'auto';
  try {
    const saved = window.localStorage.getItem('hbl-atlas-quality');
    if (['auto', 'sharp', 'balanced', 'battery'].includes(saved)) return saved;
  } catch { /* storage can be unavailable */ }
  return 'auto';
}

export default function App() {
  // The shell renders immediately; the atlas owns its own non-blocking load state.
  const [activeModule, setActiveModule] = useState('home');
  const [activeView, setActiveView] = useState('explore');
  const [progress, setProgress] = useState(loadProgress);
  const [soundOn, setSoundOn] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [progressOpen, setProgressOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(readReducedMotionPreference);
  const [atlasQuality, setAtlasQuality] = useState(readAtlasQualityPreference);
  const [volume, setVolume] = useState(16);
  const [ambient, setAmbient] = useState(false);
  const [atlasEstimate, setAtlasEstimate] = useState(null);
  const [atlasDownload, setAtlasDownload] = useState({ status: 'idle', percent: 0, completedChunks: 0, totalChunks: 0, totalBytes: 0, message: '' });
  const atlasDownloadControllerRef = useRef(null);
  const [aiQuestion, setAiQuestion] = useState('');
  const [installEvt, setInstallEvt] = useState(null);
  const [eraseArmed, setEraseArmed] = useState(false);
  const [online, setOnline] = useState(typeof navigator === 'undefined' ? true : navigator.onLine);
  const [aiAnswer, setAiAnswer] = useState('');

  const { t } = usePreferences();
  const active = modules.find((module) => module.id === activeModule);
  const percent = progressPercent(progress, modules.length);

  useEffect(() => { saveProgress(progress); }, [progress]);
  useEffect(() => startPerformanceTelemetry(), []);

  // Phase 109: install affordance + offline presence.
  useEffect(() => {
    const onPrompt = (e) => { e.preventDefault(); setInstallEvt(e); };
    const onInstalled = () => setInstallEvt(null);
    const onUp = () => setOnline(true);
    const onDown = () => setOnline(false);
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    window.addEventListener('online', onUp);
    window.addEventListener('offline', onDown);
    return () => { window.removeEventListener('beforeinstallprompt', onPrompt); window.removeEventListener('appinstalled', onInstalled); window.removeEventListener('online', onUp); window.removeEventListener('offline', onDown); };
  }, []);

  useEffect(() => {
    if (activeModule !== 'home' && activeView === 'simulate' && active?.status === 'core') {
      setProgress((current) => ({ ...current, simulations: (current.simulations || 0) + 1 }));
    }
  }, [activeModule, activeView]);

  useEffect(() => {
    document.body.classList.toggle('reduce-motion', reducedMotion);
    try { window.localStorage.setItem('hbl-reduced-motion', String(reducedMotion)); } catch { /* storage can be unavailable in sandboxed previews */ }
  }, [reducedMotion]);

  useEffect(() => {
    try { window.localStorage.setItem('hbl-atlas-quality', atlasQuality); } catch { /* storage can be unavailable in sandboxed previews */ }
  }, [atlasQuality]);

  useEffect(() => {
    if (!settingsOpen || atlasEstimate) return undefined;
    const controller = new AbortController();
    getAnatomyDownloadEstimate({ signal: controller.signal }).then(setAtlasEstimate).catch(() => undefined);
    return () => controller.abort();
  }, [settingsOpen, atlasEstimate]);

  useEffect(() => () => atlasDownloadControllerRef.current?.abort(), []);

  useEffect(() => {
    const onKey = (event) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
      if (event.key === 'Escape') { setSettingsOpen(false); setProgressOpen(false); setHelpOpen(false); setAiOpen(false); }
      if (event.key.toLowerCase() === 'h') setHelpOpen((value) => !value);
      if (event.key.toLowerCase() === 'a' && activeModule !== 'home') setAiOpen((value) => !value);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeModule]);

  // Phase 108: hash deep links (#/m/{id}) with browser back/forward support.
  const activeModuleRef = useRef(activeModule);
  activeModuleRef.current = activeModule;
  const applyRoute = (id) => {
    if (id === 'home') { setActiveModule('home'); setActiveView('explore'); setAiOpen(false); return; }
    const resumeView = progress.lastModule === id && ['explore', 'simulate', 'quiz'].includes(progress.lastView) ? progress.lastView : 'explore';
    setActiveModule(id);
    setActiveView(resumeView);
    setProgress((current) => markView(markExplored(current, id), id, resumeView));
    setAiOpen(false);
  };
  const parseHash = () => {
    const m = /^#\/m\/([a-z-]+)/.exec(window.location.hash || '');
    return m && modules.some((x) => x.id === m[1]) ? m[1] : 'home';
  };
  useEffect(() => {
    const initial = parseHash();
    if (initial !== 'home') applyRoute(initial);
    const onHash = () => { const id = parseHash(); if (id !== activeModuleRef.current) applyRoute(id); };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const navigate = (id) => {
    soundManager.playClick();
    const target = id === 'home' ? '' : `#/m/${id}`;
    if ((window.location.hash || '') !== target) window.location.hash = target;
    else applyRoute(id);
    if (id === 'home') { setActiveModule('home'); setActiveView('explore'); setAiOpen(false); return; }
    const resumeView = progress.lastModule === id && ['explore', 'simulate', 'quiz'].includes(progress.lastView) ? progress.lastView : 'explore';
    setActiveModule(id);
    setActiveView(resumeView);
    setProgress((current) => markView(markExplored(current, id), id, resumeView));
    setAiOpen(false);
  };

  const changeView = (view) => {
    setActiveView(view);
    if (activeModule !== 'home') setProgress((current) => markView(current, activeModule, view));
  };

  const setSound = (value) => { setSoundOn(value); soundManager.setEnabled(value); };
  const updateVolume = (value) => { setVolume(value); soundManager.setVolume(value / 100); };
  const updateAmbient = (value) => { setAmbient(value); soundManager.setAmbient(value); };
  const startAtlasOfflineDownload = async () => {
    if (atlasDownloadControllerRef.current) return;
    const controller = new AbortController();
    atlasDownloadControllerRef.current = controller;
    setAtlasDownload((current) => ({ ...current, status: 'downloading', message: 'Preparing explicit offline download…' }));
    try {
      const result = await downloadAnatomyForOffline({ signal: controller.signal, onProgress: setAtlasDownload });
      setAtlasDownload(result);
    } catch (error) {
      if (error?.name === 'AbortError') setAtlasDownload((current) => ({ ...current, status: 'cancelled', message: 'Download cancelled. The shell remains available offline.' }));
      else setAtlasDownload((current) => ({ ...current, status: 'error', message: error?.message || 'Offline download failed.' }));
    } finally {
      atlasDownloadControllerRef.current = null;
    }
  };
  const cancelAtlasOfflineDownload = () => atlasDownloadControllerRef.current?.abort();
  const removeAtlasOfflineDownload = async () => {
    await clearAnatomyOfflineDownload();
    setAtlasDownload({ status: 'idle', percent: 0, completedChunks: 0, totalChunks: 0, totalBytes: 0, message: 'Downloaded anatomy removed from this device.' });
  };
  const completeQuiz = (moduleId, correct, total) => {
    setProgress((current) => {
      const next = recordQuiz(current, moduleId, correct, total);
      return (correct / Math.max(total, 1)) * 100 >= 67 ? markCompleted(next, moduleId) : next;
    });
  };
  const askTutor = () => { setAiOpen(true); setAiAnswer(''); };
  const submitQuestion = async (event) => {
    event?.preventDefault();
    const question = aiQuestion.trim();
    if (!question) return;
    setAiAnswer('Thinking with the current model…');
    try {
      const answer = await askAI({ question, context: { module: active?.title, simulation: activeView, step: 'visual model' } });
      setAiAnswer(answer);
      soundManager.playSuccess();
    } catch (error) {
      setAiAnswer(error.message || 'AI Tutor is temporarily unavailable.');
      soundManager.playError();
    }
  };

  return <div className="app-shell" data-hbl-app="true">
    <a className="skip-link" href="#hbl-main">{t('common.skip')}</a>
    <header className="topbar">
      <button className="brand" onClick={() => navigate('home')} aria-label="Go to Human Biology Lab home"><span className="brand-mark"><span /><span /><span /></span><span className="brand-copy"><strong>HUMAN BIOLOGY</strong><small>LAB <i>·</i> 09</small></span></button>
      <div className="header-context"><span className="context-line" />{activeModule === 'home' ? <><span className="eyebrow">BODY ATLAS</span><strong>{t('header.chooseSystem')}</strong></> : <><span className="eyebrow">{active?.eyebrow}</span><strong>{t(`module.${active?.id}`, active?.title)}</strong></>}</div>
      <div className="header-actions">{!online && <span className="net-chip" role="status" aria-live="polite">offline · cached content</span>}{installEvt && <button className="header-icon-button pwa-only" onClick={() => { installEvt.prompt?.(); setInstallEvt(null); }}><Icon name="download" size={17} /><span>Install app</span></button>}<button className={`header-icon-button ${soundOn ? '' : 'muted'}`} onClick={() => setSound(!soundOn)} title={soundOn ? 'Mute sound' : 'Turn sound on'}><Icon name={soundOn ? 'volume' : 'mute'} size={17} /><span>{soundOn ? t('header.sound') : t('header.muted')}</span></button><button className="header-icon-button" onClick={() => setProgressOpen(true)} title="View progress"><span className="mini-progress"><i style={{ width: `${percent}%` }} /></span><span>{t('header.progress')}</span></button><button className="header-icon-button" onClick={() => setSettingsOpen(true)} title="Open settings"><Icon name="settings" size={17} /><span>{t('header.settings')}</span></button><button className="header-icon-button" onClick={() => setHelpOpen(true)} title="Open help"><Icon name="help" size={17} /><span>{t('header.help')}</span></button></div>
    </header>

    {activeModule === 'home' ? <HomeScreen modules={modules} progress={progress} percent={percent} reducedMotion={reducedMotion} atlasQuality={atlasQuality} onSelect={navigate} /> : <ModuleScreen active={active} activeView={activeView} setActiveView={changeView} progress={progress} reducedMotion={reducedMotion} onBack={() => navigate('home')} onSelect={navigate} onComplete={completeQuiz} onAsk={askTutor} />}

    {activeModule !== 'home' && <button className="ask-ai-fab" aria-label="Ask AI Tutor" onClick={askTutor}><span className="ai-spark"><Icon name="sparkle" size={16} /></span><span>Ask AI Tutor</span><kbd>A</kbd></button>}
    <div className="app-footer"><span>HBL / v1.0 · Built for curious minds</span><span><i className="live-dot" /> Offline-ready learning environment</span></div>

    {settingsOpen && <Modal title={t('settings.title')} onClose={() => setSettingsOpen(false)}><div className="settings-list"><FoundationSettings /><div className="setting-row"><div><strong>{t('settings.reduceMotion')}</strong><span>{t('settings.reduceMotion.help')}</span></div><button className={`toggle ${reducedMotion ? 'on' : ''}`} onClick={() => setReducedMotion((value) => !value)} aria-pressed={reducedMotion}><i /></button></div><div className="setting-row"><div><strong>Atlas rendering quality</strong><span>Auto adapts to the device. Battery Saver lowers GPU work during anatomy rotation.</span></div><select className="quality-select" value={atlasQuality} onChange={(event) => setAtlasQuality(event.target.value)} aria-label="Atlas rendering quality"><option value="auto">Auto</option><option value="sharp">Sharp</option><option value="balanced">Balanced</option><option value="battery">Battery Saver</option></select></div><div className="setting-row"><div><strong>Ambient lab sound</strong><span>Extremely subtle Web Audio hum. Starts after interaction.</span></div><button className={`toggle ${ambient ? 'on' : ''}`} onClick={() => updateAmbient(!ambient)} aria-pressed={ambient}><i /></button></div><label className="volume-setting"><span><strong>Master volume</strong><output>{volume}%</output></span><input aria-label="Master volume" type="range" min="0" max="40" value={volume} onChange={(event) => updateVolume(Number(event.target.value))} /></label><div className="setting-row"><div><strong>Your data</strong><span>Export, import, or erase everything this lab stores on this device (progress, settings, drills, logs).</span></div><div className="data-actions"><button className="outline-button" onClick={() => { const data = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (/^(hbl-|kine-|human-biology-lab)/.test(k)) data[k] = localStorage.getItem(k); } const blob = new Blob([JSON.stringify({ app: 'human-biology-lab', version: 1, exportedAt: new Date().toISOString(), data }, null, 2)], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'human-biology-lab-data.json'; a.click(); URL.revokeObjectURL(a.href); }}>Export</button><label className="outline-button import-label">Import<input type="file" accept="application/json" hidden onChange={(e) => { const f = e.target.files?.[0]; if (!f) return; f.text().then((text) => { const parsed = JSON.parse(text); if (parsed?.app !== 'human-biology-lab' || typeof parsed.data !== 'object') throw new Error('not an HBL backup'); Object.entries(parsed.data).forEach(([k, v]) => { if (/^(hbl-|kine-|human-biology-lab)/.test(k) && typeof v === 'string') localStorage.setItem(k, v); }); window.location.reload(); }).catch(() => {}); }} /></label><button className={`outline-button danger ${eraseArmed ? 'armed' : ''}`} onClick={() => { if (!eraseArmed) { setEraseArmed(true); window.setTimeout(() => setEraseArmed(false), 4000); return; } const keys = []; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (/^(hbl-|kine-|human-biology-lab)/.test(k)) keys.push(k); } keys.forEach((k) => localStorage.removeItem(k)); window.location.reload(); }}>{eraseArmed ? 'Tap again to erase' : 'Erase all'}</button></div></div>
<OfflineAnatomyDownload estimate={atlasEstimate} state={atlasDownload} onStart={startAtlasOfflineDownload} onCancel={cancelAtlasOfflineDownload} onRemove={removeAtlasOfflineDownload} /></div><div className="modal-note"><Icon name="info" size={15} /> {t('settings.note')}</div></Modal>}
    {progressOpen && <Modal title="Biology Lab progress" onClose={() => setProgressOpen(false)}><div className="progress-modal"><div className="big-progress"><span>{percent}%</span><small>overall progress</small><div><i style={{ width: `${percent}%` }} /></div></div><div className="progress-stats"><div><strong>{Object.keys(progress.explored || {}).length}</strong><span>bays explored</span></div><div><strong>{Object.keys(progress.completed || {}).length}</strong><span>checkpoints cleared</span></div><div><strong>{progress.simulations || 0}</strong><span>simulations run</span></div></div><div className="module-progress-list">{modules.map((module) => <div key={module.id}><span className="module-mini-icon" style={{ color: module.accent }}>{module.icon}</span><div><strong>{module.title}</strong><small>{progress.completed?.[module.id] ? 'Checkpoint cleared' : progress.explored?.[module.id] ? 'Explored' : 'Not visited'}</small></div><i className={progress.completed?.[module.id] ? 'complete' : ''}>{progress.completed?.[module.id] ? '✓' : progress.explored?.[module.id] ? '·' : '○'}</i></div>)}</div></div></Modal>}
    {helpOpen && <Modal title="How to use the lab" onClose={() => setHelpOpen(false)}><div className="help-content"><div className="help-hero"><Icon name="lab" size={28} /><div><strong>Think with your hands.</strong><span>Every lab responds to selection, controls, and pause points.</span></div></div><div className="help-grid"><div><kbd>Space</kbd><span>Play / pause</span></div><div><kbd>R</kbd><span>Reset the active simulation</span></div><div><kbd>+</kbd><span>Increase speed</span></div><div><kbd>−</kbd><span>Decrease speed</span></div><div><kbd>Esc</kbd><span>Close panels</span></div><div><kbd>A</kbd><span>Open AI Tutor</span></div></div><p className="modal-note"><Icon name="info" size={15} /> Tip: read the WHAT · HOW · WHY panel after selecting a structure. It stays synced to your current focus.</p></div></Modal>}
    {aiOpen && <AITutor active={active} activeView={activeView} question={aiQuestion} setQuestion={setAiQuestion} answer={aiAnswer} onSubmit={submitQuestion} onClose={() => setAiOpen(false)} />}
  </div>;
}

function HomeScreen({ modules: allModules, progress, percent, reducedMotion, atlasQuality, onSelect }) {
  const { t } = usePreferences();
  const recommendation = getGuidedRecommendation(progress, allModules);
  const nextModule = recommendation?.module || allModules.find((module) => module.status === 'core') || allModules[0];
  return <main id="hbl-main" className="home-main"><section className="atlas-intro"><div><span className="eyebrow accent-eyebrow"><i className="live-dot" /> INTERACTIVE BODY ATLAS · 2026</span><h1>{t('home.title1')}<br /><em>{t('home.title2')}</em></h1><p>{t('home.lead')}</p><div className="intro-actions"><button className="primary-cta" onClick={() => onSelect(nextModule.id)}>{recommendation?.kind === 'review' ? 'Review ' : 'Continue with '}{nextModule.short} <Icon name="arrow" size={16} /></button><span className="intro-hint"><kbd>⌘</kbd> guided path · {allModules.filter((module) => module.status === 'core').length} live bays</span></div></div><div className="intro-meta"><span className="eyebrow">YOUR RESEARCH LOG</span><strong>{percent}%</strong><span>overall learning progress</span><div className="progress-line"><i style={{ width: `${percent}%` }} /></div><small>{Object.keys(progress.explored || {}).length} of {allModules.length} systems visited · {Object.keys(progress.completed || {}).length} checkpoints passed</small></div></section>{recommendation && <UpNextCard recommendation={recommendation} progress={progress} allModules={allModules} onSelect={onSelect} />}<section className="atlas-content"><div className="body-map-column"><Suspense fallback={<AtlasShellLoading />}><ErrorBoundary label="certified anatomy atlas"><BodyMap3DAtlas onSelect={onSelect} visited={progress.explored} reducedMotion={reducedMotion} quality={atlasQuality} /></ErrorBoundary></Suspense></div><aside className="atlas-sidebar"><div className="sidebar-header"><div><span className="eyebrow">LEARNING BAYS</span><h2>Choose your scale</h2></div><span className="sidebar-count">{allModules.filter((module) => module.status === 'core').length} live</span></div><div className="module-list">{allModules.map((module) => <button key={module.id} className={`module-list-item ${module.status === 'preview' ? 'preview' : ''}`} onClick={() => onSelect(module.id)}><span className="module-index">{String(allModules.indexOf(module) + 1).padStart(2, '0')}</span><span className="module-symbol" style={{ color: module.accent }}>{module.icon}</span><span className="module-list-copy"><strong>{module.title}</strong><small>{module.topics.join(' · ')}</small></span><span className={`module-status ${progress.completed?.[module.id] ? 'complete' : ''}`}>{progress.completed?.[module.id] ? '✓' : module.status === 'core' ? 'LIVE' : 'SOON'}</span><Icon name="chevron" size={15} /></button>)}</div><GuidedPath allModules={allModules} progress={progress} onSelect={onSelect} /></aside></section><section className="home-bottom"><div className="quote-mark">“</div><p>Biology becomes easier when you can see what a system is doing, not just memorize its name.</p><span>LAB NOTE 001 / VISUAL THINKING</span></section></main>;
}

function UpNextCard({ recommendation, progress, onSelect }) {
  const { module, reason, kind, meta = {} } = recommendation;
  const step = guidedPath.indexOf(module.id) + 1;
  const state = getGuidedStepState(progress, module.id);
  const action = kind === 'resume' ? 'Resume bay' : kind === 'review' ? 'Review checkpoint' : 'Start bay';
  return <section className={`up-next-card ${kind}`} aria-labelledby="up-next-title"><div className="up-next-kicker"><span className="eyebrow">{kind === 'review' ? 'REVIEW RECOMMENDED' : kind === 'resume' ? 'CONTINUE WHERE YOU LEFT OFF' : 'UP NEXT IN THE GUIDED PATH'}</span><small>STEP {String(step).padStart(2, '0')} / {String(guidedPath.length).padStart(2, '0')}</small></div><div className="up-next-content"><div><span className="eyebrow" style={{ color: module.accent }}>{meta.stage || 'Learning bay'}</span><h2 id="up-next-title">{module.title}</h2><p>{reason}</p>{meta.objective && <small className="up-next-objective">Learning target: {meta.objective}</small>}<span className="up-next-meta">{meta.estimatedMinutes || 8} min · Explore → Simulate → Quiz · {state.label}</span></div><button type="button" className="primary-cta" onClick={() => onSelect(module.id)}>{action} <Icon name="arrow" size={15} /></button></div></section>;
}

function OfflineAnatomyDownload({ estimate, state, onStart, onCancel, onRemove }) {
  const isDownloading = state.status === 'downloading';
  const formatBytes = (bytes = 0) => `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return <section className="offline-anatomy-download" aria-labelledby="offline-anatomy-title"><div><span className="eyebrow">LARGE RESOURCE</span><strong id="offline-anatomy-title">Anatomy for offline use</strong><p>{estimate ? `Explicitly download the ${estimate.chunks}-chunk BodyParts3D atlas (${formatBytes(estimate.bytes)} compressed).` : 'Explicitly download the compressed BodyParts3D anatomy chunks for repeat offline visits.'}</p></div>{isDownloading && <div className="offline-download-progress" role="status" aria-live="polite"><div><span>Downloading anatomy</span><b>{state.percent || 0}%</b></div><div className="offline-progress-track"><i style={{ width: `${state.percent || 0}%` }} /></div><small>{state.completedChunks || 0} of {state.totalChunks || estimate?.chunks || '—'} chunks</small></div>}{state.message && <small className={`offline-download-message ${state.status === 'error' ? 'error' : ''}`}>{state.message}</small>}<div className="offline-download-actions">{isDownloading ? <button type="button" className="outline-button" onClick={onCancel}>Cancel download</button> : state.status === 'complete' ? <><span className="offline-download-complete">✓ Available offline</span><button type="button" className="text-button" onClick={onRemove}>Remove download</button></> : <button type="button" className="outline-button" onClick={onStart}>Download for offline</button>}</div></section>;
}

function ObjectiveStrip({ moduleId }) {
  const objectives = learningObjectives[moduleId] || [];
  const references = moduleId === 'circulation' ? [evidenceReferences.heartAnatomy] : moduleId === 'excretion' ? [evidenceReferences.kidneyAnatomy] : moduleId === 'nervous' ? [evidenceReferences.nervousSystem] : [evidenceReferences.anatomyTerminology];
  if (!objectives.length) return null;
  return <section className="objective-strip" aria-labelledby={`${moduleId}-objectives-title`}><div className="objective-heading"><span className="eyebrow">LEARNING TARGETS</span><h2 id={`${moduleId}-objectives-title`}>By the end of this bay</h2></div><ol>{objectives.map((objective) => <li key={objective}>{objective}</li>)}</ol><div className="objective-sources"><span>REFERENCE NOTES</span>{references.map((reference) => <a key={reference.url} href={reference.url} target="_blank" rel="noreferrer">{reference.label} ↗</a>)}</div></section>;
}

function GuidedPath({ allModules, progress, onSelect, compact = false }) {
  const pathModules = guidedPath.map((id) => allModules.find((module) => module.id === id)).filter(Boolean);
  const passedCount = pathModules.filter((module) => getGuidedStepState(progress, module.id).passed).length;
  const recommendation = getGuidedRecommendation(progress, allModules);
  return <section className={`guided-path ${compact ? 'compact' : ''}`} aria-label={`Guided learning path, ${passedCount} of ${pathModules.length} checkpoints passed`}><div className="guided-path-heading"><Icon name="bulb" size={16} /><div><strong>Guided path</strong><span>{compact ? 'Recommended sequence · choose any step' : 'Build from cell to whole-body systems'}</span></div><small>{passedCount}/{pathModules.length} passed</small></div>{recommendation && <p className="guided-path-recommendation" aria-live="polite"><span>Next</span> {recommendation.module.short} · {recommendation.reason}</p>}<div className="guided-path-steps">{pathModules.map((module, index) => { const state = getGuidedStepState(progress, module.id); const current = progress.lastModule === module.id; const recommended = recommendation?.module?.id === module.id; const views = ['explore', 'simulate', 'quiz'].filter((view) => state.views?.[view]); return <button key={module.id} className={`${state.passed ? 'complete' : ''} ${state.state === 'review' ? 'review' : ''} ${current ? 'current' : ''} ${recommended ? 'recommended' : ''}`} onClick={() => onSelect(module.id)} aria-current={current ? 'step' : undefined} aria-label={`${module.title}, ${state.label}${current ? ', current step' : ''}${recommended ? ', recommended next' : ''}`}><span className="guided-step-index">{state.passed ? '✓' : String(index + 1).padStart(2, '0')}</span><b>{module.short}</b><small>{current ? 'Current' : state.label}</small><i aria-hidden="true">{views.length ? views.map((view) => view[0].toUpperCase()).join(' · ') : '—'}</i></button>; })}</div></section>;
}

function ModuleScreen({ active, activeView, setActiveView, progress, reducedMotion, onBack, onSelect, onComplete, onAsk }) {
  if (active.status === 'preview') return <PreviewModule active={active} onBack={onBack} onSelect={onSelect} />;
  const props = { activeView, onViewChange: setActiveView, onComplete: (correct, total) => onComplete(active.id, correct, total), onAsk, reducedMotion };
  return <main id="hbl-main" className={`module-screen ${active.id}-screen`}><div className="module-header"><button className="back-button" onClick={onBack}><Icon name="back" size={17} /> <span>Body atlas</span></button><div className="module-breadcrumb"><span>HBL /</span><strong>{active.title}</strong><span className="slash">/</span><span>{activeView}</span></div><span className="module-code">BAY / {String(modules.findIndex((item) => item.id === active.id) + 1).padStart(2, '0')}</span></div><section className="module-hero"><div><span className="eyebrow" style={{ color: active.accent }}>{active.eyebrow}</span><h1>{active.title}</h1><p>{active.description}</p></div><div className="module-topic-pills">{active.topics.map((topic) => <span key={topic}>{topic}</span>)}</div></section><ObjectiveStrip moduleId={active.id} /><GuidedPath allModules={modules} progress={progress} onSelect={onSelect} compact /><ModulePathNav activeId={active.id} allModules={modules} onSelect={onSelect} /><GuidedStepCard step={getGuidedPathStep(active.id)} index={guidedPath.indexOf(active.id)} total={guidedPath.length} activeView={activeView} onViewChange={setActiveView} /><Suspense fallback={<SimulationLoading title={active.title} />}>{active.id === 'cell' && <CellLab {...props} />}{active.id === 'tissues' && <TissuesLab {...props} />}{active.id === 'digestion' && <DigestiveLab {...props} />}{active.id === 'circulation' && <CirculationLab {...props} />}{active.id === 'nervous' && <NervousLab {...props} />}{active.id === 'respiration' && <RespirationLab {...props} />}{active.id === 'excretion' && <ExcretionLab {...props} />}{active.id === 'reproduction' && <ReproductionLab {...props} />}{active.id === 'heredity' && <HeredityLab {...props} />}{active.id === 'evolution' && <EvolutionLab {...props} />}{active.id === 'environment' && <EnvironmentLab {...props} />}{active.id === 'kinesiology' && <KinesiologyLab {...props} />}</Suspense><ModuleRail activeId={active.id} onSelect={onSelect} /></main>;
}

function ModulePathNav({ activeId, allModules, onSelect }) {
  const { index, total, previous, next } = getGuidedNeighbors(activeId, allModules);
  return <nav className="module-path-nav" aria-label="Guided path navigation"><button type="button" onClick={() => previous && onSelect(previous.id)} disabled={!previous} aria-label={previous ? `Previous step: ${previous.title}` : 'No previous guided step'}><Icon name="back" size={14} /><span>Previous</span></button><span aria-live="polite"><b>STEP {String(Math.max(index + 1, 1)).padStart(2, '0')} / {String(total).padStart(2, '0')}</b><small>{next ? `Next: ${next.short}` : 'Final guided step'}</small></span><button type="button" onClick={() => next && onSelect(next.id)} disabled={!next} aria-label={next ? `Next step: ${next.title}` : 'Final guided step'}><span>{next ? `Next: ${next.short}` : 'Complete'}</span><Icon name="arrow" size={14} /></button></nav>;
}

function ModuleRail({ activeId, onSelect }) { return <div className="module-rail"><span className="eyebrow">CONTINUE EXPLORING</span>{modules.filter((module) => module.id !== activeId).slice(0, 4).map((module) => <button key={module.id} onClick={() => onSelect(module.id)}><span style={{ color: module.accent }}>{module.icon}</span><strong>{module.short}</strong><Icon name="arrow" size={14} /></button>)}</div>; }

function PreviewModule({ active, onBack, onSelect }) { const copy = placeholderCopy[active.id]; return <main id="hbl-main" className="preview-screen"><div className="module-header"><button className="back-button" onClick={onBack}><Icon name="back" size={17} /> <span>Body atlas</span></button><div className="module-breadcrumb"><span>HBL /</span><strong>{active.title}</strong><span className="slash">/</span><span>calibration</span></div><span className="module-code">BAY / {String(modules.findIndex((item) => item.id === active.id) + 1).padStart(2, '0')}</span></div><div className="preview-content"><div className="preview-orbit" style={{ '--preview-accent': active.accent }}><div className="preview-orbit-core">{active.icon}</div><i /><i /><i /><span>CALIBRATING</span></div><span className="eyebrow" style={{ color: active.accent }}>{active.eyebrow}</span><h1>{copy.title}</h1><p>{copy.body}</p><div className="preview-next"><Icon name="lock" size={15} /><span>{copy.next}</span></div><button className="outline-button" onClick={onBack}><Icon name="back" size={15} /> Return to atlas</button></div><div className="preview-rail">{modules.filter((module) => module.status === 'preview').map((module) => <button key={module.id} className={module.id === active.id ? 'active' : ''} onClick={() => onSelect(module.id)}><span style={{ color: module.accent }}>{module.icon}</span><strong>{module.short}</strong><small>{module.id === active.id ? 'calibrating' : 'visit'}</small></button>)}</div></main>; }

function AtlasShellLoading() {
  return <div className="atlas-shell-loading" role="status" aria-live="polite"><span className="atlas-shell-loading-orbit" aria-hidden="true" /><div><span className="eyebrow">BODY ATLAS</span><strong>Preparing skeletal layer</strong><small>Loading the first anatomy slice…</small></div></div>;
}

function SimulationLoading({ title }) {
  return <div className="simulation-loading" role="status" aria-live="polite"><span className="simulation-loading-orbit" aria-hidden="true" /><div><span className="eyebrow">OPENING LEARNING BAY</span><strong>{title}</strong><small>Loading interactive model…</small></div></div>;
}

function Modal({ title, onClose, children }) {
  const dialogRef = useRef(null);
  useEffect(() => {
    const previous = document.activeElement;
    dialogRef.current?.focus();
    const onKeyDown = (event) => {
      if (event.key !== 'Tab' || !dialogRef.current) return;
      const focusable = [...dialogRef.current.querySelectorAll('button, input, textarea, select, [href], [tabindex]:not([tabindex="-1"])')].filter((element) => !element.disabled);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    dialogRef.current?.addEventListener('keydown', onKeyDown);
    return () => { dialogRef.current?.removeEventListener('keydown', onKeyDown); previous?.focus?.(); };
  }, []);
  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section ref={dialogRef} className="modal-card" role="dialog" aria-modal="true" aria-label={title} tabIndex="-1"><div className="modal-header"><div><span className="eyebrow">HUMAN BIOLOGY LAB</span><h2>{title}</h2></div><button type="button" className="close-button" onClick={onClose} aria-label={`Close ${title}`}><Icon name="close" size={17} /></button></div>{children}</section></div>;
}

function AITutor({ active, activeView, question, setQuestion, answer, onSubmit, onClose }) { return <aside className="ai-drawer" role="dialog" aria-modal="true" aria-label="AI Tutor"><div className="ai-header"><div className="ai-title"><span className="ai-spark"><Icon name="sparkle" size={18} /></span><div><span className="eyebrow">AI TUTOR · MOCK READY</span><strong>Ask the lab</strong></div></div><button type="button" className="close-button" onClick={onClose} aria-label="Close AI Tutor"><Icon name="close" size={17} /></button></div><div className="ai-context"><span>CONTEXT PASSED</span><div><b>{active?.title}</b><i>·</i><b>{activeView}</b><i>·</i><b>visual model</b></div></div><div className="ai-conversation"><div className="ai-message tutor"><span className="message-avatar"><Icon name="sparkle" size={13} /></span><p>I'm looking at the <strong>{active?.title}</strong> model with you. Ask why something moves, where it goes, or what a structure does.</p></div>{answer && <div className="ai-message student"><p>{question}</p></div>}{answer && <div className="ai-message tutor"><span className="message-avatar"><Icon name="sparkle" size={13} /></span><p>{answer}</p></div>}</div><form className="ai-form" onSubmit={onSubmit}><textarea autoFocus value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Why is this step important?" rows="2" maxLength="1200" aria-label="Ask the AI Tutor" /><button aria-label="Send question"><Icon name="arrow" size={17} /></button></form><div className="ai-footnote"><Icon name="info" size={13} /> Mock response layer · connect /api/ai when a backend is ready</div></aside>; }
