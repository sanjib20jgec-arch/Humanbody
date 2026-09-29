import React, { useEffect, useState } from 'react';
import { Icon } from '../components/Icons';
import ReferenceObject3D from '../components/ReferenceObject3D';
import SimulationControls from '../components/SimulationControls';
import InfoPanel from '../components/InfoPanel';
import Quiz from '../components/Quiz';
import { soundManager } from '../lib/sound';

const structures = {
  ovary: { name: 'Ovary and follicle', eyebrow: 'GAMETE FORMATION · FOLLICLE', what: 'An ovary contains follicles, each with an immature oocyte surrounded by support cells.', how: 'A selected follicle grows through the ovarian cycle while its support cells respond to pituitary hormones and produce estrogen.', why: 'Follicle development prepares one oocyte for possible release and fertilization.', accent: '#f472b6' },
  oocyte: { name: 'Oocyte', eyebrow: 'FEMALE GAMETE · HAPLOID PATH', what: 'The oocyte is the developing female gamete released during ovulation.', how: 'The secondary oocyte enters the uterine tube, where meiosis can be completed if fertilization occurs.', why: 'It contributes one set of genetic information to the first cell of a new organism.', accent: '#f6c978' },
  sperm: { name: 'Sperm cell', eyebrow: 'MALE GAMETE · MOTILE CELL', what: 'A small motile gamete with a head carrying genetic material and a flagellum for movement.', how: 'Its streamlined shape and many mitochondria support movement through the reproductive tract.', why: 'It contributes the other haploid set of chromosomes at fertilization.', accent: '#8bd6e2' },
  tube: { name: 'Uterine tube', eyebrow: 'TRANSPORT · FERTILIZATION SITE', what: 'A muscular tube that receives the ovulated oocyte and guides it toward the uterus.', how: 'Cilia and smooth-muscle contractions help move the oocyte and early embryo along the tube.', why: 'Fertilization commonly occurs here before the early embryo reaches the uterus.', accent: '#9d9be8' },
  uterus: { name: 'Uterus and endometrium', eyebrow: 'PREPARATION · NUTRIENT LINING', what: 'A muscular organ with an inner endometrium that changes across the cycle.', how: 'Estrogen helps rebuild the lining after menses, while progesterone supports its secretory state after ovulation.', why: 'A receptive lining is needed for implantation and early development.', accent: '#e995ad' }
};

function getCycleState(day) {
  if (day <= 5) return { label: 'Menses', detail: 'The previous lining is being shed', accent: '#e995ad' };
  if (day <= 13) return { label: 'Follicular phase', detail: 'A dominant follicle is maturing', accent: '#f472b6' };
  if (day === 14) return { label: 'Ovulation', detail: 'An LH surge releases the oocyte', accent: '#f6c978' };
  return { label: 'Luteal phase', detail: 'The corpus luteum supports the lining', accent: '#9d9be8' };
}

function getHormones(day) {
  const fsh = day <= 6 ? 68 - day * 5 : day === 14 ? 34 : 24;
  const lh = day === 14 ? 100 : day >= 11 && day <= 13 ? 30 + (day - 11) * 13 : day > 14 ? 18 : 15;
  const estrogen = day <= 5 ? 18 : day <= 13 ? 24 + (day - 5) * 10 : day === 14 ? 100 : Math.max(30, 72 - (day - 14) * 3);
  const progesterone = day <= 14 ? 10 : Math.round(12 + Math.sin(((day - 14) / 14) * Math.PI) * 72);
  const lining = day <= 5 ? 0.22 + day * 0.035 : day <= 14 ? 0.4 + (day - 5) * 0.045 : Math.max(0.58, 0.82 - (day - 14) * 0.006);
  return { fsh, lh, estrogen, progesterone, lining };
}

export default function ReproductionLab({ activeView, onViewChange, onComplete, onAsk, reducedMotion }) {
  const [selectedId, setSelectedId] = useState('ovary');
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [day, setDay] = useState(1);
  const [cycleCount, setCycleCount] = useState(0);
  const selected = structures[selectedId] || structures.ovary;
  const cycle = getCycleState(day);
  const hormones = getHormones(day);

  useEffect(() => {
    if (reducedMotion || !playing) return undefined;
    const timer = window.setInterval(() => {
      setDay((current) => {
        if (current >= 28) { setCycleCount((value) => value + 1); return 1; }
        return current + 1;
      });
    }, Math.max(120, 520 / speed));
    return () => window.clearInterval(timer);
  }, [playing, speed, reducedMotion]);
  useEffect(() => { if (reducedMotion) setPlaying(false); }, [reducedMotion]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (activeView === 'quiz' || event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
      if (event.key === ' ') { event.preventDefault(); setPlaying((value) => !value); }
      if (event.key.toLowerCase() === 'r') reset();
      if (event.key === '+' || event.key === '=') setSpeed((value) => value === 0.5 ? 1 : 2);
      if (event.key === '-') setSpeed((value) => value === 2 ? 1 : 0.5);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeView]);

  const reset = () => { setPlaying(false); setDay(1); setCycleCount(0); setSpeed(1); setSelectedId('ovary'); };
  const choose = (id) => { setSelectedId(id); soundManager.playClick(); };

  return <div className="module-layout reproduction-layout">
    <div className="module-main">
      <div className="view-switcher"><button className={activeView === 'explore' ? 'active' : ''} onClick={() => onViewChange('explore')}>EXPLORE</button><button className={activeView === 'simulate' ? 'active' : ''} onClick={() => onViewChange('simulate')}>SIMULATE</button><button className={activeView === 'quiz' ? 'active' : ''} onClick={() => onViewChange('quiz')}>QUIZ <span className="tiny-dot" /></button></div>
      {activeView === 'quiz' ? <div className="quiz-view"><div className="view-heading"><span className="eyebrow">KNOWLEDGE CHECK</span><h2>Reproduction checkpoint</h2><p>Connect gametes, ovulation, fertilization, and early development without memorizing isolated labels.</p></div><Quiz moduleId="reproduction" onComplete={onComplete} onAsk={onAsk} /></div> : activeView === 'simulate' ? <CycleSimulation playing={playing} setPlaying={setPlaying} day={day} setDay={setDay} cycleCount={cycleCount} speed={speed} setSpeed={setSpeed} reset={reset} cycle={cycle} hormones={hormones} /> : <ReproductionExplore selectedId={selectedId} onSelect={choose} reducedMotion={reducedMotion} />}
    </div>
    {activeView !== 'quiz' && <InfoPanel title={selected.name} eyebrow={selected.eyebrow} accent={selected.accent} what={selected.what} how={selected.how} why={selected.why} />}
  </div>;
}

function ReproductionExplore({ selectedId, onSelect, reducedMotion }) {
  return <div className="reproduction-explore"><div className="view-heading"><span className="eyebrow">EXPLORE · REPRODUCTIVE ANATOMY + GAMETES</span><h2>Inspect source anatomy, then trace the cycle</h2><p>Select a source-derived reproductive structure. Gamete shape, meiosis, fertilization, and cycle timing remain separate labelled teaching models.</p></div><ReferenceObject3D registryId="reproductive-macro" label="Reproductive macro-anatomy" systems={['reproductive']} source="BodyParts3D 4.0 adult-male reference atlas" sourceUrl="https://dbarchive.biosciencedbc.jp/en/bodyparts3d/desc.html" limitation="The source is an adult-male macro-anatomy reference; gametes, ovarian timing, hormones, and pregnancy are separate educational models and are not implied by the mesh." reducedMotion={reducedMotion} /><div className="reproduction-board"><div className="repro-grid" /><button className={`repro-structure repro-ovary ${selectedId === 'ovary' ? 'active' : ''}`} onClick={() => onSelect('ovary')} aria-label="Select ovary and follicle"><span className="ovary-core"><i /><i /><i /></span></button><button className={`repro-structure repro-oocyte ${selectedId === 'oocyte' ? 'active' : ''}`} onClick={() => onSelect('oocyte')} aria-label="Select oocyte"><span /></button><button className={`repro-structure repro-sperm ${selectedId === 'sperm' ? 'active' : ''}`} onClick={() => onSelect('sperm')} aria-label="Select sperm cell"><span /><i /></button><button className={`repro-structure repro-tube ${selectedId === 'tube' ? 'active' : ''}`} onClick={() => onSelect('tube')} aria-label="Select uterine tube"><span /></button><button className={`repro-structure repro-uterus ${selectedId === 'uterus' ? 'active' : ''}`} onClick={() => onSelect('uterus')} aria-label="Select uterus and endometrium"><span /></button><span className="repro-label repro-label-ovary">OVARY · FOLLICLE</span><span className="repro-label repro-label-oocyte">OOCYTE</span><span className="repro-label repro-label-sperm">SPERM</span><span className="repro-label repro-label-tube">UTERINE TUBE</span><span className="repro-label repro-label-uterus">UTERUS · ENDOMETRIUM</span><div className="repro-legend"><span><i className="gamete-mark" /> gamete pathway</span><span><i className="hormone-mark" /> hormone-responsive tissue</span></div></div><div className="repro-principles"><div><span className="eyebrow">GAMETES</span><strong>Carry one chromosome set</strong><small>formed through meiosis</small></div><div><span className="eyebrow">FERTILIZATION</span><strong>Combine genetic material</strong><small>two haploid cells form a zygote</small></div><div><span className="eyebrow">DEVELOPMENT</span><strong>Begin coordinated division</strong><small>early cells travel toward the uterus</small></div></div></div>;
}

function CycleSimulation({ playing, setPlaying, day, setDay, cycleCount, speed, setSpeed, reset, cycle, hormones }) {
  const follicleSize = Math.min(1, 0.24 + Math.max(0, Math.min(day, 14) - 1) * 0.055);
  const ovulating = day === 14;
  const oocytePosition = `${Math.max(21, Math.min(84, 21 + Math.max(0, day - 13) * 5.2))}%`;
  return <div className="cycle-simulation"><div className="visual-heading"><div><span className="eyebrow">OVARIAN CYCLE ENGINE · HORMONE MODEL</span><h2>{cycle.label} · day {day}</h2><p>Advance a simplified 28-day cycle to see follicle growth, the LH surge, ovulation, and endometrial change.</p></div><span className="status-chip"><i className="live-dot" /> {playing ? 'cycle live' : 'paused'}</span></div><div className="cycle-board"><div className="cycle-grid" /><div className="cycle-orbit"><div className="cycle-ovary"><div className="follicle" style={{ transform: `scale(${follicleSize})` }}><i /><i /><i /></div><span className="ovary-caption">follicle</span></div><div className={`cycle-tube ${ovulating ? 'pulse' : ''}`} /><div className="cycle-uterus"><div className="uterus-lining" style={{ transform: `scaleY(${hormones.lining})` }} /><span>uterus</span></div><div className="oocyte-travel" style={{ left: oocytePosition, opacity: day >= 14 ? 1 : 0 }}><span /></div><div className="cycle-event"><span className="eyebrow">CURRENT EVENT</span><strong>{cycle.detail}</strong><small>{ovulating ? 'LH surge · oocyte released' : `${Math.round(hormones.estrogen)}% relative estrogen signal`}</small></div></div><div className="cycle-timeline" aria-label="Cycle day timeline">{Array.from({ length: 28 }, (_, index) => { const value = index + 1; return <button key={value} className={`${value === day ? 'active' : ''} ${value === 14 ? 'ovulation-day' : ''}`} onClick={() => { setPlaying(false); setDay(value); }} aria-label={`Set cycle day ${value}`}>{value}</button>; })}</div></div><div className="hormone-metrics"><div><span>FSH SIGNAL</span><strong>{Math.round(hormones.fsh)}<small>%</small></strong><i style={{ '--bar': `${hormones.fsh}%` }} /></div><div className="lh-metric"><span>LH SIGNAL</span><strong>{Math.round(hormones.lh)}<small>%</small></strong><i style={{ '--bar': `${hormones.lh}%` }} /></div><div><span>ESTROGEN</span><strong>{Math.round(hormones.estrogen)}<small>%</small></strong><i style={{ '--bar': `${hormones.estrogen}%` }} /></div><div className="progesterone-metric"><span>PROGESTERONE</span><strong>{Math.round(hormones.progesterone)}<small>%</small></strong><i style={{ '--bar': `${hormones.progesterone}%` }} /></div></div><div className="cycle-readouts"><div><span>ENDOMETRIUM</span><strong>{Math.round(hormones.lining * 100)}<small>% prepared</small></strong></div><div><span>OVULATION</span><strong>{ovulating ? 'NOW' : day < 14 ? `in ${14 - day} days` : 'passed'}</strong></div><div><span>COMPLETED CYCLES</span><strong>{cycleCount}</strong></div></div><SimulationControls playing={playing} onToggle={() => setPlaying((value) => !value)} onReset={reset} onStep={() => { setPlaying(false); setDay((value) => value >= 28 ? 1 : value + 1); }} speed={speed} onSpeedChange={setSpeed} label="Reproductive cycle simulation controls" stepLabel="Advance one cycle day" /><div className="reproduction-note"><Icon name="info" size={15} /><span><strong>Simplified educational model:</strong> cycle timing and hormone curves vary between people. This model is for learning about relationships among ovarian phases, hormones, ovulation, and the uterine lining, not for predicting fertility or making health decisions.</span></div></div>;
}
