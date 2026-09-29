import React, { useEffect, useMemo, useState } from 'react';
import { Icon } from '../components/Icons';
import SimulationControls from '../components/SimulationControls';
import InfoPanel from '../components/InfoPanel';
import Quiz from '../components/Quiz';
import { soundManager } from '../lib/sound';
import ConceptualSourceNote from '../components/ConceptualSourceNote';

const structures = {
  chromosome: { name: 'Chromosome pair', eyebrow: 'PACKAGING · HOMOLOGOUS PAIRS', what: 'A chromosome pair carries matching genes at corresponding locations, with one chromosome inherited from each parent.', how: 'During meiosis, homologous chromosomes separate so each gamete receives one allele from the pair.', why: 'This separation explains why an offspring receives one allele from each parent.', accent: '#8bd6e2' },
  gene: { name: 'Gene locus', eyebrow: 'INFORMATION · INHERITABLE UNIT', what: 'A gene is a DNA sequence at a particular locus that can influence a biological trait.', how: 'Cells read DNA information to make RNA and proteins, while different alleles can alter the result.', why: 'Genes connect molecular information with observable characteristics.', accent: '#9d9be8' },
  allele: { name: 'Allele', eyebrow: 'VARIATION · GENE VERSION', what: 'An allele is one version of a gene, such as the simplified A or a used in this model.', how: 'Alleles are carried on homologous chromosomes and segregate into gametes.', why: 'Different allele combinations create inherited variation within a population.', accent: '#f6c978' },
  genotype: { name: 'Genotype', eyebrow: 'COMBINATION · AA, Aa, OR aa', what: 'A genotype describes the allele combination an organism carries for one gene.', how: 'One allele comes from each parent; the pair can be homozygous or heterozygous.', why: 'The genotype is the starting information used to estimate a simple phenotype.', accent: '#f472b6' },
  phenotype: { name: 'Phenotype', eyebrow: 'EXPRESSION · OBSERVABLE RESULT', what: 'A phenotype is an observable characteristic produced by genes interacting with development and environment.', how: 'In this simplified model, an A allele masks a in the phenotype, but real inheritance can be more complex.', why: 'Separating genotype from phenotype prevents a probability model being mistaken for a complete prediction.', accent: '#8de8b4' }
};

const presets = [
  { label: 'Carrier × carrier', first: 'Aa', second: 'Aa' },
  { label: 'Dominant × recessive', first: 'AA', second: 'aa' },
  { label: 'Carrier × recessive', first: 'Aa', second: 'aa' },
  { label: 'Dominant × carrier', first: 'AA', second: 'Aa' }
];

function gametes(genotype) { return [genotype[0], genotype[1]]; }
function tidyGenotype(value) { return value === 'aA' ? 'Aa' : value; }
function phenotype(genotype) { return genotype.includes('A') ? 'Dominant model trait' : 'Recessive model trait'; }

export default function HeredityLab({ activeView, onViewChange, onComplete, onAsk, reducedMotion }) {
  const [selectedId, setSelectedId] = useState('gene');
  const [parentA, setParentA] = useState('Aa');
  const [parentB, setParentB] = useState('Aa');
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [revealIndex, setRevealIndex] = useState(-1);
  const [completedCrosses, setCompletedCrosses] = useState(0);
  const selected = structures[selectedId] || structures.gene;
  const square = useMemo(() => gametes(parentA).flatMap((rowAllele) => gametes(parentB).map((columnAllele) => tidyGenotype(`${rowAllele}${columnAllele}`))), [parentA, parentB]);
  const counts = square.reduce((result, genotype) => { result[genotype] = (result[genotype] || 0) + 1; return result; }, {});
  const dominantCount = square.filter((genotype) => genotype.includes('A')).length;

  useEffect(() => {
    if (reducedMotion || !playing) return undefined;
    const timer = window.setInterval(() => {
      setRevealIndex((current) => {
        if (current >= square.length - 1) { setPlaying(false); setCompletedCrosses((value) => value + 1); return square.length - 1; }
        return current + 1;
      });
    }, Math.max(160, 640 / speed));
    return () => window.clearInterval(timer);
  }, [playing, speed, square.length, reducedMotion]);
  useEffect(() => { if (reducedMotion) setPlaying(false); }, [reducedMotion]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (activeView === 'quiz' || event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement || event.target instanceof HTMLSelectElement) return;
      if (event.key === ' ') { event.preventDefault(); setPlaying((value) => !value); }
      if (event.key.toLowerCase() === 'r') reset();
      if (event.key === '+' || event.key === '=') setSpeed((value) => value === 0.5 ? 1 : 2);
      if (event.key === '-') setSpeed((value) => value === 2 ? 1 : 0.5);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeView]);

  const reset = () => { setPlaying(false); setRevealIndex(-1); setParentA('Aa'); setParentB('Aa'); setSpeed(1); setSelectedId('gene'); };
  const choose = (id) => { setSelectedId(id); soundManager.playClick(); };
  const choosePreset = (preset) => { setParentA(preset.first); setParentB(preset.second); setPlaying(false); setRevealIndex(-1); soundManager.playClick(); };
  const changeParent = (setter, value) => { setter(value); setPlaying(false); setRevealIndex(-1); };

  return <div className="module-layout heredity-layout">
    <div className="module-main">
      <div className="view-switcher"><button className={activeView === 'explore' ? 'active' : ''} onClick={() => onViewChange('explore')}>EXPLORE</button><button className={activeView === 'simulate' ? 'active' : ''} onClick={() => onViewChange('simulate')}>SIMULATE</button><button className={activeView === 'quiz' ? 'active' : ''} onClick={() => onViewChange('quiz')}>QUIZ <span className="tiny-dot" /></button></div>
      {activeView === 'quiz' ? <div className="quiz-view"><div className="view-heading"><span className="eyebrow">KNOWLEDGE CHECK</span><h2>Heredity checkpoint</h2><p>Use genes, alleles, genotypes, and probability to interpret a simple inheritance cross.</p></div><Quiz moduleId="heredity" onComplete={onComplete} onAsk={onAsk} /></div> : activeView === 'simulate' ? <InheritanceSimulation parentA={parentA} parentB={parentB} setParentA={setParentA} setParentB={setParentB} changeParent={changeParent} playing={playing} setPlaying={setPlaying} speed={speed} setSpeed={setSpeed} revealIndex={revealIndex} setRevealIndex={setRevealIndex} reset={reset} square={square} counts={counts} dominantCount={dominantCount} completedCrosses={completedCrosses} choosePreset={choosePreset} /> : <HeredityExplore selectedId={selectedId} onSelect={choose} />}
    </div>
    {activeView !== 'quiz' && <InfoPanel title={selected.name} eyebrow={selected.eyebrow} accent={selected.accent} what={selected.what} how={selected.how} why={selected.why} />}
  </div>;
}

function HeredityExplore({ selectedId, onSelect }) {
  return <div className="heredity-explore"><div className="view-heading"><span className="eyebrow">EXPLORE · INFORMATION AND VARIATION</span><h2>From chromosome to trait</h2><p>Select a node to see how DNA information is packaged, inherited, and expressed. This is a simplified educational model, not a prediction of a person’s traits.</p></div><div className="heredity-board"><div className="heritage-grid" /><button className={`heritage-node chromosome-node ${selectedId === 'chromosome' ? 'active' : ''}`} onClick={() => onSelect('chromosome')} aria-label="Select chromosome pair"><span className="chromosome-shape"><i /><i /></span><b>01</b></button><button className={`heritage-node gene-node ${selectedId === 'gene' ? 'active' : ''}`} onClick={() => onSelect('gene')} aria-label="Select gene locus"><span className="gene-bracket"><i /><i /><i /></span><b>02</b></button><button className={`heritage-node allele-node ${selectedId === 'allele' ? 'active' : ''}`} onClick={() => onSelect('allele')} aria-label="Select allele"><span>A</span><b>03</b></button><button className={`heritage-node genotype-node ${selectedId === 'genotype' ? 'active' : ''}`} onClick={() => onSelect('genotype')} aria-label="Select genotype"><span>Aa</span><b>04</b></button><button className={`heritage-node phenotype-node ${selectedId === 'phenotype' ? 'active' : ''}`} onClick={() => onSelect('phenotype')} aria-label="Select phenotype"><span className="trait-orb" /></button><span className="heritage-label chromosome-label">HOMOLOGOUS PAIR</span><span className="heritage-label gene-label">GENE LOCUS</span><span className="heritage-label allele-label">ALLELE</span><span className="heritage-label genotype-label">GENOTYPE</span><span className="heritage-label phenotype-label">PHENOTYPE</span><div className="inheritance-arrow arrow-one" /><div className="inheritance-arrow arrow-two" /><div className="inheritance-arrow arrow-three" /><div className="heritage-legend"><span><i className="dominant-mark" /> dominant allele</span><span><i className="recessive-mark" /> recessive allele</span></div></div><ConceptualSourceNote moduleId="heredity" /><div className="heritage-principles"><div><span className="eyebrow">PACKAGE</span><strong>DNA sits on chromosomes</strong><small>genes occupy specific loci</small></div><div><span className="eyebrow">SEGREGATE</span><strong>Alleles separate in meiosis</strong><small>each gamete gets one copy</small></div><div><span className="eyebrow">EXPRESS</span><strong>Genotype influences phenotype</strong><small>environment also matters</small></div></div></div>;
}

function InheritanceSimulation({ parentA, parentB, setParentA, setParentB, changeParent, playing, setPlaying, speed, setSpeed, revealIndex, setRevealIndex, reset, square, counts, dominantCount, completedCrosses, choosePreset }) {
  const visibleCount = Math.max(0, revealIndex + 1);
  return <div className="inheritance-simulation"><div className="visual-heading"><div><span className="eyebrow">MENDELIAN CROSS ENGINE · PROBABILITY MODEL</span><h2>Build a Punnett square</h2><p>Choose two parent genotypes, reveal each possible combination, and compare expected outcomes.</p></div><span className="status-chip"><i className="live-dot" /> {playing ? 'cross running' : visibleCount === square.length ? 'cross revealed' : 'ready'}</span></div><div className="cross-presets"><span className="eyebrow">QUICK CROSSES</span>{presets.map((preset) => <button key={preset.label} onClick={() => choosePreset(preset)}>{preset.label}</button>)}</div><div className="parent-selectors"><label><span>Parent A genotype</span><select value={parentA} onChange={(event) => changeParent(setParentA, event.target.value)}><option value="AA">AA · homozygous dominant</option><option value="Aa">Aa · heterozygous</option><option value="aa">aa · homozygous recessive</option></select></label><div className="cross-symbol">×</div><label><span>Parent B genotype</span><select value={parentB} onChange={(event) => changeParent(setParentB, event.target.value)}><option value="AA">AA · homozygous dominant</option><option value="Aa">Aa · heterozygous</option><option value="aa">aa · homozygous recessive</option></select></label></div><div className="punnett-stage"><div className="parent-gametes top-gametes"><span>Parent B gametes</span><div><b>{parentB[0]}</b><b>{parentB[1]}</b></div></div><div className="parent-gametes side-gametes"><span>Parent A gametes</span><div><b>{parentA[0]}</b><b>{parentA[1]}</b></div></div><div className="punnett-grid">{square.map((genotype, index) => <div key={`${genotype}-${index}`} className={`punnett-cell ${index <= revealIndex ? 'revealed' : ''} ${genotype === 'aa' ? 'recessive-cell' : 'dominant-cell'}`} aria-label={index <= revealIndex ? `${genotype}, ${phenotype(genotype)}` : 'Possible outcome not revealed'}><span>{index <= revealIndex ? genotype : '?'}</span><small>{index <= revealIndex ? phenotype(genotype) : 'tap step'}</small></div>)}</div><div className="cross-status"><span className="eyebrow">OUTCOME PROGRESS</span><strong>{visibleCount} / 4 combinations revealed</strong><small>{completedCrosses} completed cross{completedCrosses === 1 ? '' : 'es'}</small></div></div><div className="genotype-metrics"><div><span>AA</span><strong>{Math.round(((counts.AA || 0) / 4) * 100)}<small>%</small></strong><i style={{ '--metric': `${((counts.AA || 0) / 4) * 100}%` }} /></div><div><span>Aa</span><strong>{Math.round(((counts.Aa || 0) / 4) * 100)}<small>%</small></strong><i style={{ '--metric': `${((counts.Aa || 0) / 4) * 100}%` }} /></div><div><span>aa</span><strong>{Math.round(((counts.aa || 0) / 4) * 100)}<small>%</small></strong><i style={{ '--metric': `${((counts.aa || 0) / 4) * 100}%` }} /></div><div className="phenotype-metric"><span>DOMINANT PHENOTYPE</span><strong>{Math.round((dominantCount / 4) * 100)}<small>%</small></strong><i style={{ '--metric': `${(dominantCount / 4) * 100}%` }} /></div></div><SimulationControls playing={playing} onToggle={() => setPlaying((value) => !value)} onReset={reset} onStep={() => { setPlaying(false); setRevealIndex((current) => Math.min(square.length - 1, current + 1)); }} speed={speed} onSpeedChange={setSpeed} label="Punnett square simulation controls" stepLabel="Reveal next outcome" /><div className="heredity-note"><Icon name="info" size={15} /><span><strong>Simplified educational model:</strong> one gene, two alleles, and complete dominance. Punnett squares estimate proportions across many offspring; they cannot predict an individual child or capture complex, polygenic, or environment-sensitive traits.</span></div></div>;
}
