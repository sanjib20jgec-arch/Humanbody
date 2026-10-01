import { DIGESTIVE_STAGES } from '../lib/DigestiveStageMachine.js';

export const modules = [
  {
    id: 'cell',
    title: 'Cell Structure',
    eyebrow: 'Scale 01 · The living unit',
    short: 'Cell',
    description: 'Step inside an animal cell and watch its organelles work together.',
    accent: '#a78bfa',
    icon: '◉',
    status: 'core',
    topics: ['Organelles', 'Membrane transport', 'Energy']
  },
  {
    id: 'tissues',
    title: 'Tissues',
    eyebrow: 'Scale 02 · Cells in teams',
    short: 'Tissues',
    description: 'Compare how groups of specialized cells build body tissues.',
    accent: '#fb7185',
    icon: '▦',
    status: 'core',
    topics: ['Epithelial', 'Connective', 'Muscular', 'Nervous']
  },
  {
    id: 'digestion',
    title: 'Human Digestion',
    eyebrow: 'System 01 · Fuel in motion',
    short: 'Digestion',
    description: 'Follow a food particle from first bite to nutrient absorption.',
    accent: '#fb923c',
    icon: '◌',
    status: 'core',
    topics: ['Food pathway', 'Enzymes', 'pH zones']
  },
  {
    id: 'respiration',
    title: 'Respiration',
    eyebrow: 'System 02 · Gas exchange',
    short: 'Respiration',
    description: 'See how air reaches alveoli and oxygen enters the blood.',
    accent: '#38bdf8',
    icon: '◒',
    status: 'core',
    topics: ['Breathing', 'Alveoli', 'Gas exchange']
  },
  {
    id: 'circulation',
    title: 'Circulation',
    eyebrow: 'System 03 · The transport loop',
    short: 'Circulation',
    description: 'Trace double circulation through the chambers of the heart.',
    accent: '#ef4444',
    icon: '♥',
    status: 'core',
    topics: ['Heart chambers', 'Blood flow', 'Heartbeat']
  },
  {
    id: 'excretion',
    title: 'Excretion',
    eyebrow: 'System 04 · Filter & balance',
    short: 'Excretion',
    description: 'Zoom into a nephron and track filtration, reabsorption, and urine formation.',
    accent: '#22d3ee',
    icon: '⌁',
    status: 'core',
    topics: ['Nephron', 'Filtration', 'Water balance']
  },
  {
    id: 'nervous',
    title: 'Brain & Nerves',
    eyebrow: 'System 05 · Signals & response',
    short: 'Brain & nerves',
    description: 'Map the central nervous system and trace a protective reflex from stimulus to muscle response.',
    accent: '#c9a4d4',
    icon: '✦',
    status: 'core',
    topics: ['Brain regions', 'Reflex arc', 'Synapse']
  },
  {
    id: 'reproduction',
    title: 'Reproduction',
    eyebrow: 'Continuity · Life cycles',
    short: 'Reproduction',
    description: 'Explore gametes, fertilization, and early cell division.',
    accent: '#f472b6',
    icon: '✣',
    status: 'core',
    topics: ['Gametes', 'Fertilization', 'Cell division']
  },
  {
    id: 'kinesiology',
    title: 'Movement Theater',
    eyebrow: 'Integration · Bodies in motion',
    short: 'Movement',
    description: 'Watch which muscles power walking, running, jumping, waving, handshakes, chewing and talking — from any camera angle.',
    accent: '#e879f9',
    icon: '↯',
    status: 'core',
    topics: ['Muscles in action', 'Gait & motion', 'Camera angles']
  },
  {
    id: 'heredity',
    title: 'Heredity',
    eyebrow: 'Information · Traits',
    short: 'Heredity',
    description: 'Build Punnett squares and predict allele combinations.',
    accent: '#34d399',
    icon: 'Aa',
    status: 'core',
    topics: ['Alleles', 'Genotypes', 'Probability']
  },
  {
    id: 'evolution',
    title: 'Evolution',
    eyebrow: 'Change · Populations',
    short: 'Evolution',
    description: 'Run natural selection on a moth population and compare homologous limbs, fossils and the human family tree.',
    accent: '#fb923c',
    icon: '⟿',
    status: 'core',
    topics: ['Natural selection', 'Evidence', 'Human origins']
  },
  {
    id: 'environment',
    title: 'Environment',
    eyebrow: 'Ecology · Energy flow',
    short: 'Environment',
    description: 'Follow energy up a food chain, explore the Sundarbans mangroves and the ozone layer.',
    accent: '#4ade80',
    icon: '❦',
    status: 'core',
    topics: ['Food chains', '10% law', 'Conservation']
  }
];

export const coreModules = modules.filter((module) => module.status === 'core');
export const guidedPath = ['cell', 'tissues', 'digestion', 'circulation', 'nervous', 'respiration', 'excretion', 'reproduction', 'heredity', 'evolution', 'environment', 'kinesiology'];

export const guidedPathMeta = {
  kinesiology: { stage: 'Integration · movement', estimatedMinutes: 10, pathReason: 'See how every system cooperates when the body moves.' },
  cell: { stage: 'Foundations', estimatedMinutes: 8, pathReason: 'Start with the living unit and selective exchange.' },
  tissues: { stage: 'Foundations', estimatedMinutes: 7, pathReason: 'See how specialized cells cooperate in tissues.' },
  digestion: { stage: 'Systems', estimatedMinutes: 9, pathReason: 'Trace how organs coordinate digestion and absorption.' },
  circulation: { stage: 'Systems', estimatedMinutes: 10, pathReason: 'Connect heart structure with pressure-driven transport.' },
  nervous: { stage: 'Coordination', estimatedMinutes: 9, pathReason: 'Trace how a signal becomes a protective response.' },
  respiration: { stage: 'Systems', estimatedMinutes: 8, pathReason: 'Link ventilation, airways, and gas exchange.' },
  excretion: { stage: 'Systems', estimatedMinutes: 9, pathReason: 'Follow filtration and homeostatic water recovery.' },
  reproduction: { stage: 'Continuity', estimatedMinutes: 8, pathReason: 'Sequence gametes, fertilization, and early development.' },
  heredity: { stage: 'Information', estimatedMinutes: 8, pathReason: 'Use probability to reason about inherited traits.' },
  evolution: { stage: 'Change', estimatedMinutes: 8, pathReason: 'See how inherited variation and selection change populations.' },
  environment: { stage: 'Ecology', estimatedMinutes: 8, pathReason: 'Connect organisms through food chains and energy flow.' }
};

export const cellOrganelles = [
  { id: 'nucleus', name: 'Nucleus', type: 'control', function: 'Stores DNA and coordinates cell activity.', structure: 'A double membrane encloses chromatin and the nucleolus.', why: 'It keeps the instructions for making proteins and directing the cell.', x: 52, y: 45 },
  { id: 'nucleolus', name: 'Nucleolus', type: 'control', function: 'Builds ribosome subunits.', structure: 'A dense region inside the nucleus.', why: 'Ribosomes are needed to assemble proteins.', x: 56, y: 48 },
  { id: 'mitochondria', name: 'Mitochondrion', type: 'energy', function: 'Releases usable energy as ATP during aerobic respiration.', structure: 'An inner membrane folded into cristae.', why: 'Cells use ATP to power active transport, movement, and synthesis.', x: 75, y: 33 },
  { id: 'ribosomes', name: 'Ribosomes', type: 'synthesis', function: 'Assembles amino acids into proteins.', structure: 'Tiny particles, free or attached to rough ER.', why: 'Proteins act as enzymes, structures, receptors, and signals.', x: 29, y: 29 },
  { id: 'rough-er', name: 'Rough ER', type: 'transport', function: 'Folds and transports proteins made by attached ribosomes.', structure: 'A network of membrane sacs dotted with ribosomes.', why: 'It moves new proteins toward the Golgi apparatus.', x: 31, y: 58 },
  { id: 'golgi', name: 'Golgi apparatus', type: 'transport', function: 'Modifies, sorts, and packages cell products.', structure: 'A stack of flattened membrane sacs.', why: 'Vesicles deliver finished molecules to their destinations.', x: 70, y: 65 },
  { id: 'lysosome', name: 'Lysosome', type: 'recycling', function: 'Digests worn-out parts and large molecules.', structure: 'A small enzyme-filled membrane vesicle.', why: 'Recycling materials keeps the cell efficient.', x: 20, y: 68 },
  { id: 'vacuole', name: 'Vacuole', type: 'storage', function: 'Stores water, ions, and other materials.', structure: 'A small membrane-bound storage compartment in an animal cell.', why: 'Storage helps the cell manage materials as conditions change.', x: 82, y: 72 },
  { id: 'membrane', name: 'Cell membrane', type: 'boundary', function: 'Controls movement into and out of the cell.', structure: 'A flexible phospholipid bilayer with proteins.', why: 'Selective transport keeps the internal environment stable.', x: 50, y: 11 },
  { id: 'cytoplasm', name: 'Cytoplasm', type: 'environment', function: 'A watery medium where many cell reactions occur.', structure: 'Cytosol plus the organelles suspended in it.', why: 'It provides the setting for transport and chemical reactions.', x: 11, y: 44 }
];

// R7 (F8): digestive stages derive from the audited DigestiveStageMachine so
// captions and pH ranges can never drift between the two data sources.
const digestiveEnrichment = {
  mouth: { enzyme: 'Amylase', color: '#fbbf24' },
  esophagus: { enzyme: 'None added', color: '#f59e0b' },
  stomach: { enzyme: 'Pepsin', color: '#f97316' },
  'small-intestine': { enzyme: 'Amylase · lipase · proteases', color: '#34d399' },
  'large-intestine': { enzyme: 'None — bacterial fermentation', color: '#38bdf8' }
};
export const digestionStages = DIGESTIVE_STAGES.map((stage) => ({
  id: stage.id,
  name: stage.label,
  detail: stage.caption,
  pH: stage.displayPH,
  ...digestiveEnrichment[stage.id]
}));

export const enzymeData = {
  carbohydrate: { label: 'Carbohydrate', substrate: 'Starch', enzyme: 'Amylase', product: 'Maltose + smaller sugars', location: 'Mouth · small intestine', color: '#fbbf24' },
  protein: { label: 'Protein', substrate: 'Protein chain', enzyme: 'Proteases', product: 'Peptides + amino acids', location: 'Stomach · small intestine', color: '#fb7185' },
  fat: { label: 'Fat', substrate: 'Triglyceride', enzyme: 'Lipase', product: '2-monoacylglycerol + fatty acids', location: 'Small intestine', color: '#a78bfa' }
};

export const quizSets = {
  cell: [
    { question: 'Which organelle is the main site of ATP synthesis in aerobic respiration?', choices: ['Nucleus', 'Mitochondrion', 'Golgi apparatus', 'Lysosome'], answer: 1, explanation: 'Mitochondria transfer energy from food molecules into ATP, the cell\'s usable energy currency.' },
    { question: 'A selectively permeable membrane mainly helps a cell to…', choices: ['Store DNA', 'Control exchange with its surroundings', 'Make ribosomes', 'Digest proteins'], answer: 1, explanation: 'Membrane proteins and the phospholipid bilayer regulate what enters and leaves the cell.' },
    { question: 'Where are proteins assembled?', choices: ['Ribosomes', 'Vacuoles', 'Nucleolus', 'Lysosomes'], answer: 0, explanation: 'Ribosomes join amino acids in the order specified by genetic information.' }
  ],
  digestion: [
    { question: 'Where does most nutrient absorption happen?', choices: ['Mouth', 'Stomach', 'Small intestine', 'Large intestine'], answer: 2, explanation: 'The small intestine has folds and villi that provide a large surface for absorption.' },
    { question: 'Which enzyme begins starch digestion in the mouth?', choices: ['Lipase', 'Amylase', 'Pepsin', 'Trypsin'], answer: 1, explanation: 'Salivary amylase begins breaking starch into smaller carbohydrates.' },
    { question: 'Why is the stomach strongly acidic?', choices: ['To absorb water', 'To activate pepsin and help kill microbes', 'To make bile', 'To produce insulin'], answer: 1, explanation: 'The acidic environment activates pepsin and helps create a hostile environment for many microbes.' }
  ],
  circulation: [
    { question: 'Which chamber pumps oxygen-rich blood into the aorta?', choices: ['Right atrium', 'Right ventricle', 'Left atrium', 'Left ventricle'], answer: 3, explanation: 'The muscular left ventricle pushes oxygen-rich blood through the aorta to the body.' },
    { question: 'What is the main job of valves in the heart?', choices: ['Make oxygen', 'Prevent backflow', 'Make red blood cells', 'Cool the blood'], answer: 1, explanation: 'Valves open in the direction of flow and close to stop blood moving backward.' },
    { question: 'Which blood component helps clot a damaged vessel?', choices: ['Platelet', 'Red blood cell', 'Plasma protein only', 'White blood cell'], answer: 0, explanation: 'Platelets gather at a damaged site and help form a clot.' }
  ],
  respiration: [
    { question: 'Where does most oxygen and carbon dioxide exchange occur?', choices: ['Trachea', 'Alveoli', 'Diaphragm', 'Nasal cavity'], answer: 1, explanation: 'Alveoli provide a large, thin, moist surface surrounded by capillaries for diffusion.' },
    { question: 'What happens to thoracic pressure when the diaphragm contracts and flattens?', choices: ['It falls, drawing air in', 'It rises, drawing air in', 'It stays exactly the same', 'It stops diffusion'], answer: 0, explanation: 'Increasing thoracic volume lowers pressure relative to the atmosphere, so air flows inward.' },
    { question: 'Which expression estimates minute ventilation in this model?', choices: ['Rate ÷ tidal volume', 'Rate × tidal volume', 'Oxygen × carbon dioxide', 'Pressure ÷ surface area'], answer: 1, explanation: 'Minute ventilation is respiratory rate multiplied by tidal volume, with units converted to litres per minute.' }
  ],
  excretion: [
    { question: 'What is the first major step in urine formation?', choices: ['Filtration at the glomerulus', 'Storage in the bladder', 'Digestion in the tubule', 'Gas exchange in the medulla'], answer: 0, explanation: 'The glomerulus filters water and small solutes from blood into Bowman’s capsule to form filtrate.' },
    { question: 'Which process returns useful substances from the tubule to the blood?', choices: ['Filtration', 'Reabsorption', 'Secretion', 'Micturition'], answer: 1, explanation: 'Tubular reabsorption recovers water, ions, glucose, amino acids, and other substances the body still needs.' },
    { question: 'What does ADH mainly change in the collecting duct?', choices: ['The number of red blood cells', 'Water permeability and recovery', 'The size of the glomerulus', 'The amount of oxygen in the lungs'], answer: 1, explanation: 'ADH promotes aquaporin channels so more water can move from the collecting duct back into the blood.' }
  ],
  reproduction: [
    { question: 'What event is triggered by the mid-cycle LH surge in this model?', choices: ['Digestion', 'Ovulation', 'Blood clotting', 'Filtration'], answer: 1, explanation: 'A surge in luteinizing hormone is associated with ovulation, when a secondary oocyte is released from a mature follicle.' },
    { question: 'Where does fertilization most often occur?', choices: ['Ovary', 'Uterine tube', 'Uterus lining', 'Kidney'], answer: 1, explanation: 'The uterine tube, also called the oviduct, is the usual meeting place for sperm and an ovulated oocyte.' },
    { question: 'What is a zygote?', choices: ['A mature sperm cell', 'A hormone signal', 'The first diploid cell formed after fertilization', 'A uterine muscle'], answer: 2, explanation: 'Fertilization combines genetic material from two haploid gametes to form a diploid zygote.' }
  ],
  heredity: [
    { question: 'What is an allele?', choices: ['A version of a gene', 'A whole organism', 'A type of cell membrane', 'A hormone pulse'], answer: 0, explanation: 'Alleles are alternative versions of a gene that can contribute to different forms of a trait.' },
    { question: 'In a simple dominant–recessive model, which genotype expresses the recessive phenotype?', choices: ['AA', 'Aa', 'aa', 'A'], answer: 2, explanation: 'The recessive phenotype is expressed when both inherited alleles are recessive: aa.' },
    { question: 'What does a Punnett square estimate?', choices: ['Exact future children', 'Expected genotype and phenotype proportions', 'The number of chromosomes in a cell', 'The speed of DNA replication'], answer: 1, explanation: 'A Punnett square lists possible allele combinations and their expected proportions for a defined cross.' }
  ],
  evolution: [
    { question: 'Which condition is essential for natural selection to change a population?', choices: ['Inherited variation', 'Traits gained by exercise', 'Identical individuals', 'Unlimited survival'], answer: 0, explanation: 'Selection can only change a population when individuals differ in traits that are passed on to offspring.' },
    { question: 'On soot-darkened trees, which peppered moths became more common?', choices: ['Pale moths', 'Dark moths', 'Neither', 'Only caterpillars'], answer: 1, explanation: 'Birds found the pale moths more easily on dark bark, so dark moths survived and reproduced more.' },
    { question: 'The forelimbs of humans, whales and bats are examples of…', choices: ['Analogous organs', 'Homologous organs', 'Vestigial organs', 'Unrelated organs'], answer: 1, explanation: 'They share the same basic bone plan inherited from a common ancestor but perform different functions.' }
  ],
  environment: [
    { question: 'About what fraction of energy passes from one trophic level to the next?', choices: ['10%', '50%', '90%', '100%'], answer: 0, explanation: 'Under the 10 per cent law, most energy is used or lost as heat and only about one tenth reaches the next level.' },
    { question: 'Which organisms form the first trophic level?', choices: ['Herbivores', 'Carnivores', 'Producers', 'Decomposers'], answer: 2, explanation: 'Green plants fix sunlight energy by photosynthesis and form the base of the food chain.' },
    { question: 'What do the breathing roots of Sundarbans mangroves do?', choices: ['Take in air from above the mud', 'Store salt', 'Catch insects', 'Attract pollinators'], answer: 0, explanation: 'Pneumatophores grow up out of waterlogged, oxygen-poor mud and take in air through small pores.' }
  ],
  tissues: [
    { question: 'Which tissue type mainly covers surfaces and lines cavities?', choices: ['Epithelial', 'Connective', 'Muscle', 'Nervous'], answer: 0, explanation: 'Epithelial tissue forms coverings, linings, and many glands, helping protect and control exchange.' },
    { question: 'What distinguishes connective tissue in this model?', choices: ['It always contracts', 'Cells are supported by an extracellular matrix', 'It only conducts impulses', 'It has no supporting material'], answer: 1, explanation: 'Connective tissues vary widely, but their cells are supported and separated by an extracellular matrix.' },
    { question: 'Which tissue specializes in rapid communication?', choices: ['Epithelial', 'Connective', 'Muscle', 'Nervous'], answer: 3, explanation: 'Nervous tissue receives, processes, and propagates electrochemical signals.' }
  ],
  nervous: [
    { question: 'Which structure carries signals between the brain and much of the body and also participates in fast reflexes?', choices: ['Cerebellum', 'Spinal cord', 'Synapse', 'Sensory receptor'], answer: 1, explanation: 'The spinal cord connects the brain with the body and contains circuits that can organize many rapid reflexes.' },
    { question: 'What is the role of a synapse?', choices: ['Protect the brain', 'Connect bone to muscle', 'Pass a signal between cells', 'Pump blood'], answer: 2, explanation: 'At a synapse, one neuron communicates with another neuron or an effector cell using chemical or electrical signals.' },
    { question: 'Why can a withdrawal reflex happen before you consciously feel heat?', choices: ['The skin has no nerves', 'The spinal cord can organize a fast response before brain processing finishes', 'Muscles decide independently', 'The cerebellum pumps the blood'], answer: 1, explanation: 'A spinal reflex circuit reduces delay; the brain still receives the information so the sensation can be recognized.' }
  ],
  kinesiology: [
    { question: 'During walking push-off, which muscles are the prime movers?', choices: ['Gastrocnemius and soleus', 'Tibialis anterior', 'Hamstrings', 'Rectus abdominis'], answer: 0, explanation: 'The calf muscles (gastrocnemius and soleus) plantarflex the ankle to propel the body forward.' },
    { question: 'Which muscle controls "foot slap" just after heel strike?', choices: ['Tibialis anterior', 'Gluteus maximus', 'Masseter', 'Deltoid'], answer: 0, explanation: 'Tibialis anterior contracts eccentrically to lower the foot gently onto the ground.' },
    { question: 'Chewing closes the jaw mainly via which muscles?', choices: ['Masseter and temporalis', 'Lateral pterygoid only', 'Digastric', 'Serratus anterior'], answer: 0, explanation: 'Masseter and temporalis elevate the mandible; the digastric opens the jaw.' }
  ]
};

export const placeholderCopy = {
  tissues: { title: 'Tissues bay is live', body: 'Compare epithelial, connective, muscle, and nervous tissues, then activate a simplified cell-pattern model to see how organization supports function.', next: 'Live now · Four tissue types' },
  respiration: { title: 'Respiration bay is live', body: 'Follow air from the nasal cavity to the alveoli, then test how respiratory rate and tidal volume change minute ventilation.', next: 'Live now · Airway and breathing model' },
  excretion: { title: 'Excretion bay is live', body: 'Follow a filtrate molecule through the nephron, then test how filtration rate and ADH alter final urine output.', next: 'Live now · Nephron homeostasis model' },
  reproduction: { title: 'Reproduction bay is live', body: 'Explore gametes and the reproductive cycle, then watch a simplified ovulation and fertilization timeline.', next: 'Live now · Gamete and cycle model' },
  heredity: { title: 'Heredity bay is live', body: 'Explore how genes, alleles, and chromosomes connect, then run a dynamic Punnett square to estimate inheritance outcomes.', next: 'Live now · Trait probability model' }
};
