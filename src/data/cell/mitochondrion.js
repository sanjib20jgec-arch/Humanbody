// Cell bay — vertical slice: Mitochondrion (CELL_STRUCTURE_MASTERPLAN §20.1).
// Every number shown comes from a claim in mitochondrionClaims (≥2 sources).
// Bengali: formal WBBSE terminology, English term in parentheses on first use (D22),
// English digits (D26). Levels are cumulative (class9 ⊂ class10 ⊂ class11-12 ⊂ neet).

const NCERT_IX = { kind: 'syllabus', title: 'NCERT Science Class 9 (Exploration, 2026-27), Ch 2 The Fundamental Unit of Life', url: 'https://ncert.nic.in/textbook.php' };
const NCERT_X = { kind: 'syllabus', title: 'NCERT Science Class 10 (Reprint 2026-27), Ch 5 Life Processes', url: 'https://ncert.nic.in/textbook/pdf/jesc1ps.pdf' };
const NCERT_XI_CELL = { kind: 'syllabus', title: 'NCERT Biology Class 11, Ch 8 Cell: The Unit of Life (8.5.5 Mitochondria)', url: 'https://ncert.nic.in/textbook.php?kebo1=8-19' };
const NCERT_XI_RESP = { kind: 'syllabus', title: 'NCERT Biology Class 11, Respiration in Plants (ETS and oxidative phosphorylation)', url: 'https://ncert.nic.in/textbook.php' };
const OPENSTAX_BIO = { kind: 'reference', title: 'OpenStax Biology 2e, 4.3 Eukaryotic Cells — Mitochondria (CC BY 4.0)', url: 'https://openstax.org/books/biology-2e/pages/4-3-eukaryotic-cells' };
const OPENSTAX_OXPHOS = { kind: 'reference', title: 'OpenStax Biology 2e, 7.4 Oxidative Phosphorylation (CC BY 4.0)', url: 'https://openstax.org/books/biology-2e/pages/7-4-oxidative-phosphorylation' };
const ALBERTS = { kind: 'reference', title: 'Alberts et al., Molecular Biology of the Cell, Ch 14 Energy Conversion: Mitochondria and Chloroplasts', citation: 'Alberts B. et al., MBoC, W. W. Norton' };
const BIONUMBERS_ATPASE = { kind: 'database', title: 'BioNumbers — rotation rate of ATP synthase', url: 'https://bionumbers.hms.harvard.edu/search.aspx?task=searchbytrmorg&trm=ATP+synthase+rotation' };
const ANDERSON_1981 = { kind: 'peer-reviewed', title: 'Anderson S. et al. (1981) Sequence and organization of the human mitochondrial genome. Nature 290:457–465', url: 'https://doi.org/10.1038/290457a0' };
const MITOMAP = { kind: 'database', title: 'MITOMAP — human mitochondrial genome database', url: 'https://www.mitomap.org/' };

export const mitochondrionClaims = [
  {
    id: 'cell.mito.size', level: 'class11-12', status: 'verified', reviewed: '2026-10-01',
    text: { en: 'Usually sausage-shaped: diameter about 0.2–1.0 µm (average 0.5 µm), length about 1.0–4.1 µm.', bn: 'সাধারণত সসেজ আকৃতির: ব্যাস প্রায় 0.2–1.0 µm (গড় 0.5 µm), দৈর্ঘ্য প্রায় 1.0–4.1 µm।' },
    value: 0.5, unit: 'µm', range: [0.2, 1.0],
    sources: [NCERT_XI_CELL, OPENSTAX_BIO]
  },
  {
    id: 'cell.mito.double-membrane', level: 'class9', status: 'verified', reviewed: '2026-10-01',
    text: { en: 'A mitochondrion has two membranes: a smooth outer membrane and an inner membrane folded into cristae.', bn: 'মাইটোকনড্রিয়ার দুটি পর্দা থাকে: একটি মসৃণ বহিঃপর্দা এবং ক্রিস্টি নামক ভাঁজযুক্ত একটি অন্তঃপর্দা।' },
    sources: [NCERT_IX, OPENSTAX_BIO]
  },
  {
    id: 'cell.mito.atp-site', level: 'class10', status: 'verified', reviewed: '2026-10-01',
    text: { en: 'Aerobic respiration releases far more energy than anaerobic respiration; most of the ATP is made on the inner mitochondrial membrane.', bn: 'সবাত শ্বসনে অবাত শ্বসনের চেয়ে অনেক বেশি শক্তি মুক্ত হয়; বেশিরভাগ ATP তৈরি হয় মাইটোকনড্রিয়ার অন্তঃপর্দায়।' },
    sources: [NCERT_X, OPENSTAX_OXPHOS]
  },
  {
    id: 'cell.mito.own-dna', level: 'class11-12', status: 'verified', reviewed: '2026-10-01',
    text: { en: 'The matrix contains a circular DNA molecule, a few RNA molecules and 70S ribosomes, so mitochondria are called semi-autonomous; they divide by fission.', bn: 'ধাত্রে একটি বৃত্তাকার DNA অণু, কিছু RNA অণু ও 70S রাইবোজোম থাকে, তাই মাইটোকনড্রিয়াকে আধা-স্বয়ংশাসিত অঙ্গাণু বলা হয়; এরা বিভাজন (Fission) পদ্ধতিতে বিভক্ত হয়।' },
    sources: [NCERT_XI_CELL, ALBERTS]
  },
  {
    id: 'cell.mito.atpase-rotation', level: 'neet', status: 'verified', reviewed: '2026-10-01',
    text: { en: 'ATP synthase is a rotary motor: protons flowing through F0 turn the rotor at roughly 100–150 revolutions per second, making 3 ATP per turn in F1.', bn: 'ATP সিন্থেজ একটি ঘূর্ণায়মান যন্ত্র: F0-এর মধ্য দিয়ে প্রোটনের প্রবাহ রোটরটিকে প্রতি সেকেন্ডে প্রায় 100–150 বার ঘোরায়, এবং প্রতি ঘূর্ণনে F1 অংশে 3টি ATP তৈরি হয়।' },
    value: 130, unit: 'rev/s', range: [100, 150],
    sources: [BIONUMBERS_ATPASE, ALBERTS]
  },
  {
    id: 'cell.mito.atp-yield', level: 'neet', status: 'verified', reviewed: '2026-10-01',
    text: { en: 'NCERT counts a net 38 ATP per glucose (theoretical balance sheet). Measured yields in living cells are lower, about 30–32 ATP, because some energy is used to move molecules across the membrane.', bn: 'NCERT প্রতি গ্লুকোজ অণু থেকে মোট 38টি ATP হিসাব করে (তাত্ত্বিক হিসাব)। জীবিত কোশে বাস্তবে পাওয়া যায় কম, প্রায় 30–32টি ATP, কারণ পর্দার মধ্য দিয়ে অণু পরিবহণে কিছু শক্তি খরচ হয়।' },
    value: 31, unit: 'ATP/glucose', range: [30, 38],
    sources: [NCERT_XI_RESP, OPENSTAX_OXPHOS]
  },
  {
    id: 'cell.mito.human-mtdna', level: 'neet', status: 'verified', reviewed: '2026-10-01',
    text: { en: 'Human mitochondrial DNA has 16,569 base pairs and 37 genes (13 for proteins, 22 for tRNA, 2 for rRNA). It is inherited from the mother.', bn: 'মানুষের মাইটোকনড্রিয়াল DNA-তে 16,569টি ক্ষারক-জোড় এবং 37টি জিন থাকে (13টি প্রোটিনের, 22টি tRNA-র, 2টি rRNA-র)। এটি মায়ের কাছ থেকে উত্তরাধিকারসূত্রে আসে।' },
    value: 16569, unit: 'bp', range: [16569, 16569],
    sources: [ANDERSON_1981, MITOMAP]
  },
  {
    id: 'cell.mito.rbc-none', level: 'class9', status: 'verified', reviewed: '2026-10-01',
    text: { en: 'Mature human red blood cells have no mitochondria; they make ATP by glycolysis only, so they do not use up the oxygen they carry.', bn: 'মানুষের পরিণত লোহিত রক্তকণিকায় মাইটোকনড্রিয়া থাকে না; এরা কেবল গ্লাইকোলাইসিসের মাধ্যমে ATP তৈরি করে, তাই নিজের বহন করা অক্সিজেন খরচ করে না।' },
    sources: [{ kind: 'peer-reviewed', title: 'Moras M., Lefevre S.D., Ostuni M.A. (2017) From erythroblasts to mature red blood cells: organelle clearance in mammals. Front. Physiol. 8:1076', url: 'https://doi.org/10.3389/fphys.2017.01076' }, { kind: 'reference', title: 'OpenStax Anatomy & Physiology 2e, 18.3 Erythrocytes (CC BY 4.0)', url: 'https://openstax.org/books/anatomy-and-physiology-2e/pages/18-3-erythrocytes' }]
  }
];

// Selectable parts in the 3D model. `level` = first level at which the part is taught.
export const mitochondrionParts = [
  { id: 'outer', level: 'class9', color: '#f59e7a',
    name: { en: 'Outer membrane', bn: 'বহিঃপর্দা (Outer membrane)' },
    what: { en: 'Smooth outer boundary that separates the mitochondrion from the cytoplasm.', bn: 'মসৃণ বাইরের আবরণ, যা মাইটোকনড্রিয়াকে সাইটোপ্লাজম থেকে পৃথক রাখে।' },
    deep: { en: 'Contains porin channels, so small molecules pass freely; the real barrier is the inner membrane.', bn: 'এতে পোরিন নামক প্রণালী থাকে, তাই ছোট অণু অবাধে যাতায়াত করে; প্রকৃত বাধা হলো অন্তঃপর্দা।' }, deepLevel: 'class11-12' },
  { id: 'inner', level: 'class9', color: '#facc15',
    name: { en: 'Inner membrane', bn: 'অন্তঃপর্দা (Inner membrane)' },
    what: { en: 'Folded inner membrane; site of the electron transport chain and ATP synthase.', bn: 'ভাঁজযুক্ত ভেতরের পর্দা; এখানে ইলেকট্রন পরিবহণতন্ত্র ও ATP সিন্থেজ অবস্থিত।' },
    deep: { en: 'Almost impermeable to protons — this is what lets a proton gradient build up.', bn: 'প্রোটনের প্রতি প্রায় অভেদ্য — এই কারণেই প্রোটনের ঘনত্বের পার্থক্য তৈরি হতে পারে।' }, deepLevel: 'class11-12' },
  { id: 'cristae', level: 'class9', color: '#fde68a',
    name: { en: 'Cristae', bn: 'ক্রিস্টি (Cristae)' },
    what: { en: 'Infoldings of the inner membrane that greatly increase its surface area.', bn: 'অন্তঃপর্দার ভাঁজ, যা এর তলের ক্ষেত্রফল অনেক গুণ বাড়িয়ে দেয়।' },
    deep: { en: 'More surface means more ATP synthase molecules: active cells such as heart muscle have densely packed cristae.', bn: 'বেশি তল মানে বেশি ATP সিন্থেজ অণু: হৃৎপেশির মতো সক্রিয় কোশে ক্রিস্টি ঘনভাবে সাজানো থাকে।' }, deepLevel: 'class10' },
  { id: 'matrix', level: 'class9', color: '#a78bfa',
    name: { en: 'Matrix', bn: 'ধাত্র (Matrix)' },
    what: { en: 'Gel-like space inside the inner membrane.', bn: 'অন্তঃপর্দার ভেতরের জেলির মতো অংশ।' },
    deep: { en: 'Holds the enzymes of the Krebs cycle, plus mitochondrial DNA and 70S ribosomes.', bn: 'এখানে ক্রেবস চক্রের উৎসেচক, মাইটোকনড্রিয়াল DNA ও 70S রাইবোজোম থাকে।' }, deepLevel: 'class11-12' },
  { id: 'ims', level: 'class11-12', color: '#38bdf8',
    name: { en: 'Intermembrane space', bn: 'আন্তঃপর্দা গহ্বর (Intermembrane space)' },
    what: { en: 'Narrow space between the two membranes.', bn: 'দুটি পর্দার মাঝের সরু স্থান।' },
    deep: { en: 'Protons pumped here make it more acidic than the matrix; their return powers ATP synthase.', bn: 'এখানে প্রোটন পাম্প হওয়ায় এটি ধাত্রের চেয়ে বেশি আম্লিক হয়; প্রোটনের ফিরে আসা ATP সিন্থেজকে চালায়।' }, deepLevel: 'class11-12' },
  { id: 'dna', level: 'class11-12', color: '#34d399',
    name: { en: 'Mitochondrial DNA', bn: 'মাইটোকনড্রিয়াল DNA' },
    what: { en: 'Small circular DNA in the matrix.', bn: 'ধাত্রে অবস্থিত ছোট বৃত্তাকার DNA।' },
    deep: { en: 'Codes some respiratory-chain proteins; most mitochondrial proteins are coded by nuclear genes.', bn: 'শ্বসন-শৃঙ্খলের কিছু প্রোটিনের সংকেত বহন করে; বেশিরভাগ মাইটোকনড্রিয়াল প্রোটিনের সংকেত থাকে নিউক্লিয়াসের জিনে।' }, deepLevel: 'neet' },
  { id: 'ribosome', level: 'class11-12', color: '#f472b6',
    name: { en: '70S ribosomes', bn: '70S রাইবোজোম' },
    what: { en: 'Small ribosomes in the matrix that make some mitochondrial proteins.', bn: 'ধাত্রে অবস্থিত ছোট রাইবোজোম, যা কিছু মাইটোকনড্রিয়াল প্রোটিন তৈরি করে।' },
    deep: { en: 'They resemble bacterial ribosomes — one line of evidence for the endosymbiotic origin of mitochondria.', bn: 'এগুলি ব্যাকটেরিয়ার রাইবোজোমের মতো — মাইটোকনড্রিয়ার অন্তঃমিথোজীবী উৎপত্তির একটি প্রমাণ।' }, deepLevel: 'neet' },
  { id: 'synthase', level: 'class10', color: '#fb923c',
    name: { en: 'ATP synthase (F0–F1 particle)', bn: 'ATP সিন্থেজ (F0–F1 কণা)' },
    what: { en: 'Enzyme on the inner membrane and cristae that makes ATP from ADP and phosphate.', bn: 'অন্তঃপর্দা ও ক্রিস্টিতে অবস্থিত উৎসেচক, যা ADP ও ফসফেট থেকে ATP তৈরি করে।' },
    deep: { en: 'F0 sits in the membrane and lets protons through; F1 projects into the matrix and makes ATP as the rotor turns.', bn: 'F0 পর্দার মধ্যে থাকে এবং প্রোটনকে যেতে দেয়; F1 ধাত্রের দিকে উঁচু হয়ে থাকে এবং রোটর ঘোরার সঙ্গে ATP তৈরি করে।' }, deepLevel: 'neet' }
];

// Animation chapters (D17: each ≤ 30 s). Text per level; scene state is a pure function of (chapter, t).
export const mitochondrionChapters = [
  { id: 'overview', duration: 18, level: 'class9',
    title: { en: '1. The powerhouse', bn: '1. কোশের শক্তিঘর' },
    caption: { en: 'A rod-shaped organelle with two membranes. It releases energy from food as ATP — the cell\'s energy currency.', bn: 'দুটি পর্দাযুক্ত দণ্ডাকার অঙ্গাণু। এটি খাদ্য থেকে শক্তি মুক্ত করে ATP রূপে জমা রাখে — ATP হলো কোশের শক্তির মুদ্রা।' } },
  { id: 'cutaway', duration: 20, level: 'class9',
    title: { en: '2. Look inside', bn: '2. ভেতরে দেখুন' },
    caption: { en: 'Cutting it open shows the inner membrane folded into cristae, surrounding the matrix.', bn: 'কেটে খুললে দেখা যায় অন্তঃপর্দা ভাঁজ হয়ে ক্রিস্টি তৈরি করেছে, যা ধাত্রকে ঘিরে রেখেছে।' } },
  { id: 'synthase', duration: 30, level: 'class10',
    title: { en: '3. Making ATP', bn: '3. ATP তৈরি' },
    caption: { en: 'Electron-transport proteins pump protons (H+) out of the matrix. As they flow back through ATP synthase, its rotor spins and ATP is made. (Shown about 1000× slower than real.)', bn: 'ইলেকট্রন পরিবহণকারী প্রোটিনগুলি ধাত্র থেকে প্রোটন (H+) বাইরে পাম্প করে। প্রোটন ATP সিন্থেজের মধ্য দিয়ে ফিরে আসার সময় এর রোটর ঘোরে এবং ATP তৈরি হয়। (বাস্তবের চেয়ে প্রায় 1000 গুণ ধীরে দেখানো হয়েছে।)' } },
  { id: 'fission', duration: 16, level: 'class11-12',
    title: { en: '4. Dividing by fission', bn: '4. বিভাজনের মাধ্যমে সংখ্যাবৃদ্ধি' },
    caption: { en: 'Mitochondria grow and pinch in two, copying their own circular DNA — new mitochondria come only from existing ones.', bn: 'মাইটোকনড্রিয়া বড় হয়ে মাঝখান থেকে দুভাগ হয় এবং নিজের বৃত্তাকার DNA-র প্রতিলিপি তৈরি করে — নতুন মাইটোকনড্রিয়া কেবল পুরোনো মাইটোকনড্রিয়া থেকেই আসে।' } }
];

// Misconceptions to address explicitly (accuracy framework, CELL plan §21).
export const mitochondrionMisconceptions = [
  { level: 'class9', wrong: { en: '"Mitochondria make energy."', bn: '"মাইটোকনড্রিয়া শক্তি তৈরি করে।"' },
    right: { en: 'Energy cannot be created. Mitochondria release energy stored in food and store it in ATP.', bn: 'শক্তি সৃষ্টি করা যায় না। মাইটোকনড্রিয়া খাদ্যে সঞ্চিত শক্তি মুক্ত করে এবং ATP-তে জমা রাখে।' } },
  { level: 'class9', wrong: { en: '"Every cell has mitochondria."', bn: '"প্রতিটি কোশে মাইটোকনড্রিয়া থাকে।"' },
    right: { en: 'Mature red blood cells and bacteria have none.', bn: 'পরিণত লোহিত রক্তকণিকা ও ব্যাকটেরিয়ায় মাইটোকনড্রিয়া থাকে না।' } },
  { level: 'class10', wrong: { en: '"All of respiration happens in mitochondria."', bn: '"শ্বসনের সমস্ত ধাপ মাইটোকনড্রিয়ায় ঘটে।"' },
    right: { en: 'Glycolysis happens in the cytoplasm; only the later aerobic steps happen in mitochondria.', bn: 'গ্লাইকোলাইসিস সাইটোপ্লাজমে ঘটে; কেবল পরবর্তী সবাত ধাপগুলি মাইটোকনড্রিয়ায় ঘটে।' } }
];

export const mitochondrionQuiz = [
  { id: 'mq1', level: 'class9',
    q: { en: 'Why is the mitochondrion called the powerhouse of the cell?', bn: 'মাইটোকনড্রিয়াকে কোশের শক্তিঘর বলা হয় কেন?' },
    options: [
      { en: 'It creates energy from nothing', bn: 'এটি শূন্য থেকে শক্তি সৃষ্টি করে' },
      { en: 'It releases energy from food and stores it as ATP', bn: 'এটি খাদ্য থেকে শক্তি মুক্ত করে ATP রূপে জমা রাখে' },
      { en: 'It stores the cell\'s DNA', bn: 'এটি কোশের DNA জমা রাখে' },
      { en: 'It makes all the proteins of the cell', bn: 'এটি কোশের সমস্ত প্রোটিন তৈরি করে' }
    ], answer: 1, claim: 'cell.mito.atp-site' },
  { id: 'mq2', level: 'class9',
    q: { en: 'What are cristae?', bn: 'ক্রিস্টি কী?' },
    options: [
      { en: 'Folds of the outer membrane', bn: 'বহিঃপর্দার ভাঁজ' },
      { en: 'Folds of the inner membrane', bn: 'অন্তঃপর্দার ভাঁজ' },
      { en: 'Pores in the nucleus', bn: 'নিউক্লিয়াসের ছিদ্র' },
      { en: 'Granules in the cytoplasm', bn: 'সাইটোপ্লাজমের দানা' }
    ], answer: 1, claim: 'cell.mito.double-membrane' },
  { id: 'mq3', level: 'class9',
    q: { en: 'Which human cell has no mitochondria?', bn: 'মানুষের কোন কোশে মাইটোকনড্রিয়া থাকে না?' },
    options: [
      { en: 'Heart muscle cell', bn: 'হৃৎপেশি কোশ' },
      { en: 'Liver cell', bn: 'যকৃৎ কোশ' },
      { en: 'Mature red blood cell', bn: 'পরিণত লোহিত রক্তকণিকা' },
      { en: 'Nerve cell', bn: 'স্নায়ুকোশ' }
    ], answer: 2, claim: 'cell.mito.rbc-none' },
  { id: 'mq4', level: 'class10',
    q: { en: 'Where in the mitochondrion is most ATP made?', bn: 'মাইটোকনড্রিয়ার কোথায় সবচেয়ে বেশি ATP তৈরি হয়?' },
    options: [
      { en: 'Outer membrane', bn: 'বহিঃপর্দা' },
      { en: 'Inner membrane (cristae)', bn: 'অন্তঃপর্দা (ক্রিস্টি)' },
      { en: 'Cytoplasm outside it', bn: 'বাইরের সাইটোপ্লাজম' },
      { en: 'Mitochondrial DNA', bn: 'মাইটোকনড্রিয়াল DNA' }
    ], answer: 1, claim: 'cell.mito.atp-site' },
  { id: 'mq5', level: 'class11-12',
    q: { en: 'Why are mitochondria called semi-autonomous?', bn: 'মাইটোকনড্রিয়াকে আধা-স্বয়ংশাসিত বলা হয় কেন?' },
    options: [
      { en: 'They can live outside the cell', bn: 'এরা কোশের বাইরে বাঁচতে পারে' },
      { en: 'They have their own DNA and 70S ribosomes, yet need nuclear genes', bn: 'এদের নিজস্ব DNA ও 70S রাইবোজোম আছে, তবুও নিউক্লিয়াসের জিনের প্রয়োজন হয়' },
      { en: 'They have no membrane', bn: 'এদের কোনো পর্দা নেই' },
      { en: 'They are made by the Golgi body', bn: 'এগুলি গলগি বস্তু তৈরি করে' }
    ], answer: 1, claim: 'cell.mito.own-dna' },
  { id: 'mq6', level: 'neet',
    q: { en: 'What directly drives rotation of ATP synthase?', bn: 'ATP সিন্থেজের ঘূর্ণন সরাসরি কী দ্বারা চালিত হয়?' },
    options: [
      { en: 'Electrons passing through F1', bn: 'F1-এর মধ্য দিয়ে ইলেকট্রনের প্রবাহ' },
      { en: 'Protons flowing back into the matrix through F0', bn: 'F0-এর মধ্য দিয়ে ধাত্রে প্রোটনের ফিরে আসা' },
      { en: 'Hydrolysis of ATP', bn: 'ATP-এর আর্দ্রবিশ্লেষণ' },
      { en: 'Oxygen binding to F0', bn: 'F0-তে অক্সিজেনের যুক্ত হওয়া' }
    ], answer: 1, claim: 'cell.mito.atpase-rotation' }
];

export const MITO_LIMITATION = {
  en: 'Teaching model, procedurally generated. Shape, membrane spacing and particle counts are simplified; colours are for identification only (real mitochondria are colourless). Not to scale.',
  bn: 'শিক্ষণ মডেল, প্রোগ্রামের মাধ্যমে তৈরি। আকৃতি, পর্দার দূরত্ব ও কণার সংখ্যা সরলীকৃত; রং কেবল চেনার সুবিধার জন্য (প্রকৃত মাইটোকনড্রিয়া বর্ণহীন)। মাপ অনুপাতে নয়।'
};
