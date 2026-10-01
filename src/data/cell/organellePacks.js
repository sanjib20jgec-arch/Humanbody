// Cell bay deep-dive packs (same shape as the Mitochondrion slice).
// Pack = { id, cell: 'animal'|'plant'|'both', title, lead, claims, parts, chapters, myths, quiz, limitation }.
// Water potential is excluded by owner decision (D8); osmosis is qualitative.
import { SRC } from './sources.js';
import { mitochondrionChapters, mitochondrionClaims, mitochondrionMisconceptions, mitochondrionParts, mitochondrionQuiz, MITO_LIMITATION } from './mitochondrion.js';

const R = '2026-10-01';
const claim = (id, level, en, bn, sources, extra = {}) => ({ id, level, status: 'verified', reviewed: R, text: { en, bn }, sources, ...extra });
const p = (id, level, color, nameEn, nameBn, whatEn, whatBn, deepLevel, deepEn, deepBn) => ({ id, level, color, name: { en: nameEn, bn: nameBn }, what: { en: whatEn, bn: whatBn }, deepLevel, deep: { en: deepEn, bn: deepBn } });
const ch = (id, level, duration, tEn, tBn, cEn, cBn) => ({ id, level, duration, title: { en: tEn, bn: tBn }, caption: { en: cEn, bn: cBn } });
const myth = (level, wEn, wBn, rEn, rBn) => ({ level, wrong: { en: wEn, bn: wBn }, right: { en: rEn, bn: rBn } });
const q = (id, level, qEn, qBn, opts, answer, claimId) => ({ id, level, q: { en: qEn, bn: qBn }, options: opts.map(([en, bn]) => ({ en, bn })), answer, claim: claimId });
const LIMIT = (en, bn) => ({ en: `Teaching model, procedurally generated. ${en} Colours are for identification only. Not to scale.`, bn: `শিক্ষণ মডেল, প্রোগ্রামের মাধ্যমে তৈরি। ${bn} রং কেবল চেনার সুবিধার জন্য। মাপ অনুপাতে নয়।` });

// ---------------- Nucleus ----------------
const nucleus = {
  id: 'nucleus', cell: 'both',
  title: { en: 'Nucleus', bn: 'নিউক্লিয়াস (Nucleus)' },
  lead: { en: 'The control centre: it stores DNA and directs which proteins the cell makes.', bn: 'নিয়ন্ত্রণ কেন্দ্র: এটি DNA সংরক্ষণ করে এবং কোশ কোন প্রোটিন তৈরি করবে তা নির্দেশ করে।' },
  claims: [
    claim('cell.nuc.discovery', 'class11-12', 'The nucleus was first described by Robert Brown in 1831.', 'রবার্ট ব্রাউন 1831 সালে প্রথম নিউক্লিয়াসের বর্ণনা দেন।', [SRC.NCERT_XI_CELL, SRC.OS_EUK]),
    claim('cell.nuc.envelope', 'class9', 'The nucleus is enclosed by a double-membrane nuclear envelope with pores, through which material moves between nucleus and cytoplasm.', 'নিউক্লিয়াস ছিদ্রযুক্ত দ্বিস্তরী নিউক্লীয় পর্দা দিয়ে ঘেরা; এই ছিদ্রের মধ্য দিয়ে নিউক্লিয়াস ও সাইটোপ্লাজমের মধ্যে পদার্থের আদান-প্রদান হয়।', [SRC.NCERT_IX, SRC.OS_EUK]),
    claim('cell.nuc.perinuclear', 'class11-12', 'The two membranes of the envelope are separated by a perinuclear space of about 10–50 nm; the outer membrane is continuous with the endoplasmic reticulum.', 'নিউক্লীয় পর্দার দুটি স্তরের মাঝে প্রায় 10–50 nm চওড়া পেরিনিউক্লীয় গহ্বর থাকে; বহিঃস্তরটি এন্ডোপ্লাজমিক রেটিকুলামের সঙ্গে যুক্ত।', [SRC.NCERT_XI_CELL, SRC.ALBERTS], { value: 30, unit: 'nm', range: [10, 50] }),
    claim('cell.nuc.nucleolus', 'class11-12', 'The nucleolus is not membrane-bound; it is the site of active ribosomal RNA synthesis.', 'নিউক্লিওলাস পর্দাবেষ্টিত নয়; এটি রাইবোজোমাল RNA সংশ্লেষের সক্রিয় স্থান।', [SRC.NCERT_XI_CELL, SRC.OS_EUK]),
    claim('cell.nuc.no-nucleus', 'class11-12', 'Mature mammalian red blood cells and sieve-tube cells of vascular plants lack a nucleus.', 'স্তন্যপায়ীর পরিণত লোহিত রক্তকণিকা এবং সংবহনকারী উদ্ভিদের সীভনল কোশে নিউক্লিয়াস থাকে না।', [SRC.NCERT_XI_CELL, SRC.ALBERTS])
  ],
  parts: [
    p('envelope', 'class9', '#60a5fa', 'Nuclear envelope', 'নিউক্লীয় পর্দা (Nuclear envelope)', 'Double membrane that separates the nucleus from the cytoplasm.', 'দ্বিস্তরী পর্দা, যা নিউক্লিয়াসকে সাইটোপ্লাজম থেকে পৃথক রাখে।', 'class11-12', 'Its outer membrane continues into the endoplasmic reticulum and often carries ribosomes.', 'এর বহিঃস্তর এন্ডোপ্লাজমিক রেটিকুলামের সঙ্গে যুক্ত এবং প্রায়ই এতে রাইবোজোম থাকে।'),
    p('pores', 'class9', '#f472b6', 'Nuclear pores', 'নিউক্লীয় ছিদ্র (Nuclear pores)', 'Openings in the envelope for traffic of RNA and proteins.', 'নিউক্লীয় পর্দার ছিদ্র, যার মধ্য দিয়ে RNA ও প্রোটিন যাতায়াত করে।', 'class11-12', 'Each pore is formed where the two membranes fuse; it is a large protein complex that controls what passes.', 'দুটি স্তর যেখানে মিলিত হয়, সেখানে ছিদ্র তৈরি হয়; এটি একটি বড় প্রোটিন জটিল, যা যাতায়াত নিয়ন্ত্রণ করে।'),
    p('chromatin', 'class9', '#a78bfa', 'Chromatin', 'ক্রোমাটিন (Chromatin)', 'Thread-like DNA with proteins; condenses into chromosomes before division.', 'প্রোটিনযুক্ত সুতোর মতো DNA; কোশ বিভাজনের আগে ঘনীভূত হয়ে ক্রোমোজোম তৈরি করে।', 'class11-12', 'Chromatin contains DNA, basic proteins called histones, some non-histone proteins and RNA.', 'ক্রোমাটিনে DNA, হিস্টোন নামক ক্ষারীয় প্রোটিন, কিছু নন-হিস্টোন প্রোটিন ও RNA থাকে।'),
    p('nucleolus', 'class9', '#fb923c', 'Nucleolus', 'নিউক্লিওলাস (Nucleolus)', 'Dense round body inside the nucleus.', 'নিউক্লিয়াসের ভেতরের ঘন গোলাকার অংশ।', 'class11-12', 'Not membrane-bound; makes ribosomal RNA. Cells that make a lot of protein have larger nucleoli.', 'পর্দাবেষ্টিত নয়; রাইবোজোমাল RNA তৈরি করে। যে কোশ বেশি প্রোটিন তৈরি করে, তাদের নিউক্লিওলাস বড় হয়।'),
    p('nucleoplasm', 'class10', '#38bdf8', 'Nucleoplasm', 'নিউক্লিওপ্লাজম (Nucleoplasm)', 'Fluid matrix inside the nucleus.', 'নিউক্লিয়াসের ভেতরের তরল ধাত্র।', 'class11-12', 'Holds chromatin and the nucleolus, and enzymes for copying DNA and making RNA.', 'এতে ক্রোমাটিন, নিউক্লিওলাস এবং DNA প্রতিলিপি ও RNA তৈরির উৎসেচক থাকে।')
  ],
  chapters: [
    ch('overview', 'class9', 16, '1. Control centre', '1. নিয়ন্ত্রণ কেন্দ্র', 'A double membrane with many pores surrounds the nucleus.', 'অসংখ্য ছিদ্রযুক্ত একটি দ্বিস্তরী পর্দা নিউক্লিয়াসকে ঘিরে রাখে।'),
    ch('cutaway', 'class9', 18, '2. Look inside', '2. ভেতরে দেখুন', 'Inside: thread-like chromatin and a dense nucleolus in the nucleoplasm.', 'ভেতরে: নিউক্লিওপ্লাজমে সুতোর মতো ক্রোমাটিন ও একটি ঘন নিউক্লিওলাস।'),
    ch('export', 'class11-12', 24, '3. Messages leave the nucleus', '3. নিউক্লিয়াস থেকে বার্তা বাইরে যায়', 'RNA copies of genes (mRNA) and ribosome subunits leave through the pores to the cytoplasm, where proteins are made.', 'জিনের RNA প্রতিলিপি (mRNA) ও রাইবোজোমের উপএকক ছিদ্রের মধ্য দিয়ে সাইটোপ্লাজমে যায়, যেখানে প্রোটিন তৈরি হয়।')
  ],
  myths: [
    myth('class9', '"The nucleus is the largest organelle in every cell."', '"প্রতিটি কোশে নিউক্লিয়াসই বৃহত্তম অঙ্গাণু।"', 'In many mature plant cells the central vacuole is far larger.', 'অনেক পরিণত উদ্ভিদকোশে কেন্দ্রীয় গহ্বর নিউক্লিয়াসের চেয়ে অনেক বড়।'),
    myth('class11-12', '"Every cell has exactly one nucleus."', '"প্রতিটি কোশে ঠিক একটি নিউক্লিয়াস থাকে।"', 'Mature red blood cells have none; skeletal muscle fibres have many.', 'পরিণত লোহিত রক্তকণিকায় একটিও নেই; কঙ্কালপেশি তন্তুতে অনেকগুলি থাকে।')
  ],
  quiz: [
    q('nq1', 'class9', 'What lets RNA leave the nucleus?', 'RNA কীভাবে নিউক্লিয়াস থেকে বাইরে যায়?', [['Nuclear pores', 'নিউক্লীয় ছিদ্রের মাধ্যমে'], ['The nucleolus', 'নিউক্লিওলাসের মাধ্যমে'], ['The cell wall', 'কোশপ্রাচীরের মাধ্যমে'], ['Lysosomes', 'লাইসোজোমের মাধ্যমে']], 0, 'cell.nuc.envelope'),
    q('nq2', 'class9', 'How many membranes surround the nucleus?', 'নিউক্লিয়াসকে কয়টি পর্দা ঘিরে রাখে?', [['One', 'একটি'], ['Two', 'দুটি'], ['Three', 'তিনটি'], ['None', 'একটিও না']], 1, 'cell.nuc.envelope'),
    q('nq3', 'class9', 'Chromatin condenses to form…', 'ক্রোমাটিন ঘনীভূত হয়ে কী তৈরি করে?', [['Ribosomes', 'রাইবোজোম'], ['Chromosomes', 'ক্রোমোজোম'], ['Vacuoles', 'গহ্বর'], ['Cristae', 'ক্রিস্টি']], 1, 'cell.nuc.envelope'),
    q('nq4', 'class11-12', 'Which is the active site of rRNA synthesis?', 'rRNA সংশ্লেষের সক্রিয় স্থান কোনটি?', [['Nucleolus', 'নিউক্লিওলাস'], ['Nuclear pore', 'নিউক্লীয় ছিদ্র'], ['Golgi body', 'গলগি বস্তু'], ['Lysosome', 'লাইসোজোম']], 0, 'cell.nuc.nucleolus'),
    q('nq5', 'class11-12', 'Which cell lacks a nucleus?', 'কোন কোশে নিউক্লিয়াস নেই?', [['Sieve-tube cell', 'সীভনল কোশ'], ['Companion cell', 'সঙ্গীকোশ'], ['Liver cell', 'যকৃৎ কোশ'], ['Neuron', 'স্নায়ুকোশ']], 0, 'cell.nuc.no-nucleus')
  ],
  limitation: LIMIT('Pore numbers and chromatin threads are simplified.', 'ছিদ্রের সংখ্যা ও ক্রোমাটিন সুতো সরলীকৃত।')
};

// ---------------- ER + Ribosomes ----------------
const er = {
  id: 'er', cell: 'both',
  title: { en: 'Endoplasmic reticulum & ribosomes', bn: 'এন্ডোপ্লাজমিক রেটিকুলাম (Endoplasmic reticulum) ও রাইবোজোম' },
  lead: { en: 'A network of membranes: the rough part makes proteins, the smooth part makes lipids.', bn: 'পর্দার জালিকা: অমসৃণ অংশ প্রোটিন তৈরি করে, মসৃণ অংশ লিপিড তৈরি করে।' },
  claims: [
    claim('cell.er.rer-ser', 'class9', 'Rough ER carries ribosomes and makes proteins; smooth ER has no ribosomes and makes lipids.', 'অমসৃণ ER-এ রাইবোজোম থাকে এবং প্রোটিন তৈরি হয়; মসৃণ ER-এ রাইবোজোম থাকে না এবং লিপিড তৈরি হয়।', [SRC.NCERT_IX, SRC.OS_ENDO]),
    claim('cell.er.steroids', 'class11-12', 'In animal cells, steroid hormones are made in the smooth ER; rough ER is abundant in cells that secrete proteins.', 'প্রাণীকোশে স্টেরয়েড হরমোন মসৃণ ER-এ তৈরি হয়; যে কোশ প্রোটিন ক্ষরণ করে, তাতে অমসৃণ ER প্রচুর থাকে।', [SRC.NCERT_XI_CELL, SRC.OS_ENDO]),
    claim('cell.ribo.palade', 'class11-12', 'Ribosomes were first seen with the electron microscope as dense particles by George Palade (1953).', 'জর্জ প্যালাড (1953) ইলেকট্রন অণুবীক্ষণ যন্ত্রে প্রথম রাইবোজোমকে ঘন কণা হিসেবে দেখেন।', [SRC.NCERT_XI_CELL, SRC.PALADE_1955]),
    claim('cell.ribo.types', 'class11-12', 'Eukaryotic cytoplasmic ribosomes are 80S (60S + 40S subunits); prokaryotic ribosomes are 70S (50S + 30S). They have no membrane.', 'ইউক্যারিওটিক সাইটোপ্লাজমের রাইবোজোম 80S (60S + 40S উপএকক); প্রোক্যারিওটিক রাইবোজোম 70S (50S + 30S)। এদের কোনো পর্দা নেই।', [SRC.NCERT_XI_CELL, SRC.ALBERTS])
  ],
  parts: [
    p('rer', 'class9', '#60a5fa', 'Rough ER', 'অমসৃণ ER (Rough ER)', 'Flattened membrane sacs studded with ribosomes.', 'রাইবোজোমযুক্ত চ্যাপ্টা পর্দার থলি।', 'class11-12', 'Proteins made here enter the lumen, are folded and sent on to the Golgi in vesicles.', 'এখানে তৈরি প্রোটিন গহ্বরে প্রবেশ করে, ভাঁজ হয় এবং থলির মধ্যে গলগি বস্তুতে যায়।'),
    p('ser', 'class9', '#34d399', 'Smooth ER', 'মসৃণ ER (Smooth ER)', 'Tubular membranes without ribosomes.', 'রাইবোজোমবিহীন নলাকার পর্দা।', 'class11-12', 'Makes lipids and steroid hormones; in liver cells it helps detoxify drugs.', 'লিপিড ও স্টেরয়েড হরমোন তৈরি করে; যকৃৎ কোশে ওষুধ ও বিষাক্ত পদার্থ নিষ্ক্রিয় করতে সাহায্য করে।'),
    p('ribosome', 'class9', '#f472b6', 'Ribosomes', 'রাইবোজোম (Ribosomes)', 'Tiny particles that join amino acids into proteins.', 'ক্ষুদ্র কণা, যা অ্যামাইনো অ্যাসিড জুড়ে প্রোটিন তৈরি করে।', 'class11-12', 'Made of RNA and protein, with no membrane; found free in cytoplasm or attached to rough ER.', 'RNA ও প্রোটিন দিয়ে তৈরি, কোনো পর্দা নেই; সাইটোপ্লাজমে মুক্ত অবস্থায় বা অমসৃণ ER-এর গায়ে থাকে।'),
    p('lumen', 'class10', '#facc15', 'ER lumen', 'ER গহ্বর (Lumen)', 'The space enclosed by the ER membranes.', 'ER পর্দার ভেতরের স্থান।', 'class11-12', 'Separate from the cytoplasm, so new proteins can be folded and modified safely.', 'সাইটোপ্লাজম থেকে পৃথক, তাই নতুন প্রোটিন নিরাপদে ভাঁজ ও পরিবর্তিত হতে পারে।'),
    p('vesicle', 'class10', '#fb923c', 'Transport vesicle', 'পরিবহণ থলি (Vesicle)', 'Small membrane bubble that carries proteins to the Golgi.', 'ছোট পর্দাবেষ্টিত থলি, যা প্রোটিন গলগি বস্তুতে বহন করে।', 'class11-12', 'Buds off the ER and fuses with the cis face of the Golgi.', 'ER থেকে মুকুলিত হয়ে গলগি বস্তুর সিস তলের সঙ্গে মিলিত হয়।')
  ],
  chapters: [
    ch('overview', 'class9', 16, '1. A membrane network', '1. পর্দার জালিকা', 'Rough ER (sheets with ribosomes) and smooth ER (tubes) spread through the cytoplasm.', 'অমসৃণ ER (রাইবোজোমযুক্ত পাত) ও মসৃণ ER (নল) সাইটোপ্লাজম জুড়ে ছড়িয়ে থাকে।'),
    ch('translate', 'class10', 26, '2. Building a protein', '2. প্রোটিন তৈরি', 'A ribosome on the rough ER joins amino acids one by one; the growing chain enters the lumen and leaves in a vesicle.', 'অমসৃণ ER-এর রাইবোজোম একটির পর একটি অ্যামাইনো অ্যাসিড জোড়ে; তৈরি হতে থাকা শৃঙ্খল গহ্বরে প্রবেশ করে এবং একটি থলিতে করে বেরিয়ে যায়।')
  ],
  myths: [
    myth('class9', '"Ribosomes are membrane-bound organelles."', '"রাইবোজোম পর্দাবেষ্টিত অঙ্গাণু।"', 'Ribosomes have no membrane; they are made of RNA and protein.', 'রাইবোজোমের কোনো পর্দা নেই; এরা RNA ও প্রোটিন দিয়ে তৈরি।'),
    myth('class11-12', '"80S = 60S + 40S, so S values simply add up."', '"80S = 60S + 40S, তাই S মান সরাসরি যোগ হয়।"', 'S (Svedberg) measures sedimentation rate, which depends on shape as well as mass, so values do not add.', 'S (স্বেডবার্গ) হলো অধঃক্ষেপণের হার, যা ভর ও আকৃতি দুটির ওপর নির্ভর করে, তাই মানগুলি যোগ হয় না।')
  ],
  quiz: [
    q('eq1', 'class9', 'Which ER makes lipids?', 'কোন ER লিপিড তৈরি করে?', [['Rough ER', 'অমসৃণ ER'], ['Smooth ER', 'মসৃণ ER'], ['Both equally', 'দুটিই সমানভাবে'], ['Neither', 'কোনোটিই না']], 1, 'cell.er.rer-ser'),
    q('eq2', 'class9', 'Why is rough ER "rough"?', 'অমসৃণ ER-কে "অমসৃণ" বলা হয় কেন?', [['It has ribosomes on its surface', 'এর গায়ে রাইবোজোম থাকে'], ['It has a cell wall', 'এর কোশপ্রাচীর আছে'], ['It is folded into cristae', 'এটি ক্রিস্টিতে ভাঁজ হয়'], ['It contains chlorophyll', 'এতে ক্লোরোফিল থাকে']], 0, 'cell.er.rer-ser'),
    q('eq3', 'class9', 'Ribosomes make…', 'রাইবোজোম কী তৈরি করে?', [['Lipids', 'লিপিড'], ['Proteins', 'প্রোটিন'], ['Starch', 'শ্বেতসার'], ['DNA', 'DNA']], 1, 'cell.er.rer-ser'),
    q('eq4', 'class11-12', 'Subunits of a eukaryotic cytoplasmic ribosome are…', 'ইউক্যারিওটিক সাইটোপ্লাজমের রাইবোজোমের উপএকক কী কী?', [['50S + 30S', '50S + 30S'], ['60S + 40S', '60S + 40S'], ['70S + 30S', '70S + 30S'], ['40S + 30S', '40S + 30S']], 1, 'cell.ribo.types'),
    q('eq5', 'class11-12', 'Steroid hormones are made mainly in…', 'স্টেরয়েড হরমোন প্রধানত কোথায় তৈরি হয়?', [['Smooth ER', 'মসৃণ ER'], ['Nucleolus', 'নিউক্লিওলাস'], ['Lysosome', 'লাইসোজোম'], ['Rough ER', 'অমসৃণ ER']], 0, 'cell.er.steroids')
  ],
  limitation: LIMIT('ER is shown as a small isolated patch; in cells it is continuous with the nuclear envelope.', 'ER-কে একটি ছোট বিচ্ছিন্ন অংশ হিসেবে দেখানো হয়েছে; কোশে এটি নিউক্লীয় পর্দার সঙ্গে যুক্ত।')
};

// ---------------- Golgi ----------------
const golgi = {
  id: 'golgi', cell: 'both',
  title: { en: 'Golgi apparatus', bn: 'গলগি বস্তু (Golgi apparatus)' },
  lead: { en: 'The cell\'s packaging and dispatch centre.', bn: 'কোশের মোড়ক তৈরি ও প্রেরণ কেন্দ্র।' },
  claims: [
    claim('cell.golgi.discovery', 'class11-12', 'Camillo Golgi (1898) first observed these densely stained structures near the nucleus.', 'ক্যামিলো গলগি (1898) নিউক্লিয়াসের কাছে গাঢ় রঞ্জিত এই গঠন প্রথম পর্যবেক্ষণ করেন।', [SRC.NCERT_XI_CELL, SRC.OS_ENDO]),
    claim('cell.golgi.function', 'class9', 'The Golgi apparatus modifies, packages and dispatches materials made in the ER, and helps form lysosomes.', 'গলগি বস্তু ER-এ তৈরি পদার্থকে পরিবর্তন করে, মোড়কে ভরে বিভিন্ন স্থানে পাঠায় এবং লাইসোজোম গঠনে সাহায্য করে।', [SRC.NCERT_IX, SRC.OS_ENDO]),
    claim('cell.golgi.cisternae', 'class11-12', 'It consists of flat, disc-shaped cisternae about 0.5–1.0 µm in diameter, stacked with a cis (forming) face and a trans (maturing) face.', 'এটি প্রায় 0.5–1.0 µm ব্যাসের চ্যাপ্টা চাকতির মতো সিস্টারনি দিয়ে গঠিত, যা স্তূপাকারে সাজানো থাকে এবং এর একটি সিস (গঠনকারী) তল ও একটি ট্রান্স (পরিণত) তল আছে।', [SRC.NCERT_XI_CELL, SRC.ALBERTS], { value: 0.75, unit: 'µm', range: [0.5, 1.0] }),
    claim('cell.golgi.glyco', 'class11-12', 'The Golgi is an important site of formation of glycoproteins and glycolipids.', 'গলগি বস্তু গ্লাইকোপ্রোটিন ও গ্লাইকোলিপিড গঠনের একটি গুরুত্বপূর্ণ স্থান।', [SRC.NCERT_XI_CELL, SRC.OS_ENDO])
  ],
  parts: [
    p('cisternae', 'class9', '#fbbf24', 'Cisternae', 'সিস্টারনি (Cisternae)', 'Stack of flat membrane sacs.', 'চ্যাপ্টা পর্দার থলির স্তূপ।', 'class11-12', 'Enzymes in successive cisternae add sugar groups step by step.', 'পরপর সিস্টারনির উৎসেচক ধাপে ধাপে শর্করা যুক্ত করে।'),
    p('cis', 'class11-12', '#60a5fa', 'Cis face', 'সিস তল (Cis face)', 'Receiving side, facing the ER.', 'গ্রহণকারী দিক, ER-এর দিকে মুখ করা।', 'class11-12', 'Vesicles from the ER fuse here.', 'ER থেকে আসা থলি এখানে মিলিত হয়।'),
    p('trans', 'class11-12', '#f472b6', 'Trans face', 'ট্রান্স তল (Trans face)', 'Shipping side, facing the plasma membrane.', 'প্রেরণকারী দিক, কোশপর্দার দিকে মুখ করা।', 'class11-12', 'Sorted products leave here in secretory vesicles or as lysosomes.', 'বাছাই করা পদার্থ এখান থেকে ক্ষরণ থলি বা লাইসোজোম হিসেবে বেরিয়ে যায়।'),
    p('vesicle', 'class9', '#fb923c', 'Vesicles', 'থলি (Vesicles)', 'Small membrane bubbles carrying cargo.', 'মালপত্র বহনকারী ছোট পর্দাবেষ্টিত থলি।', 'class10', 'Secretory vesicles fuse with the plasma membrane and release their contents outside (secretion).', 'ক্ষরণ থলি কোশপর্দার সঙ্গে মিলিত হয়ে ভেতরের পদার্থ বাইরে মুক্ত করে (ক্ষরণ)।')
  ],
  chapters: [
    ch('overview', 'class9', 14, '1. A stack of sacs', '1. থলির স্তূপ', 'The Golgi apparatus is a stack of flattened sacs with small vesicles around it.', 'গলগি বস্তু হলো চ্যাপ্টা থলির একটি স্তূপ, যার চারপাশে ছোট থলি থাকে।'),
    ch('traffic', 'class10', 24, '2. Package and ship', '2. মোড়ক ও প্রেরণ', 'Vesicles from the ER arrive on one side; modified products leave from the other side and are secreted at the cell surface.', 'ER থেকে থলি একদিকে আসে; পরিবর্তিত পদার্থ অন্যদিক থেকে বেরিয়ে কোশের তলে ক্ষরিত হয়।')
  ],
  myths: [
    myth('class9', '"The Golgi makes proteins."', '"গলগি বস্তু প্রোটিন তৈরি করে।"', 'Proteins are made by ribosomes; the Golgi modifies and packages them.', 'প্রোটিন তৈরি করে রাইবোজোম; গলগি বস্তু সেগুলিকে পরিবর্তন করে মোড়কে ভরে।')
  ],
  quiz: [
    q('gq1', 'class9', 'Main job of the Golgi apparatus?', 'গলগি বস্তুর প্রধান কাজ কী?', [['Packaging and dispatch', 'মোড়ক তৈরি ও প্রেরণ'], ['Photosynthesis', 'সালোকসংশ্লেষ'], ['Storing DNA', 'DNA সংরক্ষণ'], ['Making ATP', 'ATP তৈরি']], 0, 'cell.golgi.function'),
    q('gq2', 'class9', 'Which organelle does the Golgi help to form?', 'গলগি বস্তু কোন অঙ্গাণু গঠনে সাহায্য করে?', [['Lysosome', 'লাইসোজোম'], ['Mitochondrion', 'মাইটোকনড্রিয়া'], ['Nucleus', 'নিউক্লিয়াস'], ['Chloroplast', 'ক্লোরোপ্লাস্ট']], 0, 'cell.golgi.function'),
    q('gq3', 'class9', 'The Golgi apparatus is made of…', 'গলগি বস্তু কী দিয়ে গঠিত?', [['Stacked flat sacs', 'স্তূপাকার চ্যাপ্টা থলি'], ['Folded cristae', 'ভাঁজযুক্ত ক্রিস্টি'], ['Grana', 'গ্রানা'], ['Chromatin', 'ক্রোমাটিন']], 0, 'cell.golgi.function'),
    q('gq4', 'class11-12', 'Which face of the Golgi receives ER vesicles?', 'গলগি বস্তুর কোন তল ER-এর থলি গ্রহণ করে?', [['Cis', 'সিস'], ['Trans', 'ট্রান্স'], ['Both', 'উভয়'], ['Neither', 'কোনোটিই না']], 0, 'cell.golgi.cisternae')
  ],
  limitation: LIMIT('Number of cisternae and vesicles is simplified.', 'সিস্টারনি ও থলির সংখ্যা সরলীকৃত।')
};

// ---------------- Lysosome ----------------
const lysosome = {
  id: 'lysosome', cell: 'animal',
  title: { en: 'Lysosome', bn: 'লাইসোজোম (Lysosome)' },
  lead: { en: 'The digestive compartment: breaks down worn-out parts and engulfed material.', bn: 'পাচন কক্ষ: জীর্ণ অংশ ও গৃহীত পদার্থ ভেঙে ফেলে।' },
  claims: [
    claim('cell.lyso.enzymes', 'class9', 'Lysosomes are membrane-bound sacs full of digestive enzymes that break down worn-out cell parts and foreign material.', 'লাইসোজোম হলো পাচক উৎসেচকে ভরা পর্দাবেষ্টিত থলি, যা জীর্ণ কোশ-অংশ ও বাইরের পদার্থ ভেঙে ফেলে।', [SRC.NCERT_IX, SRC.OS_ENDO]),
    claim('cell.lyso.acid', 'class11-12', 'Lysosomes form by packaging in the Golgi; their hydrolytic enzymes (lipases, proteases, carbohydrases) are most active at acidic pH.', 'লাইসোজোম গলগি বস্তুতে মোড়কবদ্ধ হয়ে তৈরি হয়; এদের আর্দ্রবিশ্লেষক উৎসেচক (লাইপেজ, প্রোটিয়েজ, কার্বোহাইড্রেজ) আম্লিক pH-এ সবচেয়ে সক্রিয়।', [SRC.NCERT_XI_CELL, SRC.OS_ENDO]),
    claim('cell.lyso.ph', 'neet', 'The lysosome interior is kept at about pH 4.5–5.0 by proton pumps in its membrane, while the cytoplasm is near pH 7.2.', 'লাইসোজোমের পর্দার প্রোটন পাম্প এর ভেতরের pH প্রায় 4.5–5.0 রাখে, যেখানে সাইটোপ্লাজমের pH প্রায় 7.2।', [SRC.ALBERTS, SRC.OS_ENDO, SRC.NCERT_XI_CELL], { value: 4.8, unit: 'pH', range: [4.5, 5.0] })
  ],
  parts: [
    p('membrane', 'class9', '#f472b6', 'Lysosome membrane', 'লাইসোজোমের পর্দা', 'Single membrane that keeps the enzymes away from the rest of the cell.', 'একস্তরী পর্দা, যা উৎসেচকগুলিকে কোশের বাকি অংশ থেকে আলাদা রাখে।', 'neet', 'It contains proton pumps that keep the inside acidic.', 'এতে প্রোটন পাম্প থাকে, যা ভেতরটা আম্লিক রাখে।'),
    p('enzymes', 'class9', '#facc15', 'Digestive enzymes', 'পাচক উৎসেচক', 'Enzymes that break large molecules into small ones.', 'বড় অণুকে ছোট অণুতে ভাঙে এমন উৎসেচক।', 'class11-12', 'Hydrolases: lipases, proteases and carbohydrases, active at acidic pH.', 'আর্দ্রবিশ্লেষক উৎসেচক: লাইপেজ, প্রোটিয়েজ ও কার্বোহাইড্রেজ, যা আম্লিক pH-এ সক্রিয়।'),
    p('target', 'class10', '#fb923c', 'Worn-out organelle', 'জীর্ণ অঙ্গাণু', 'A damaged mitochondrion being recycled.', 'পুনর্ব্যবহারের জন্য একটি ক্ষতিগ্রস্ত মাইটোকনড্রিয়া।', 'class11-12', 'Recycling the cell\'s own parts is called autophagy.', 'কোশের নিজের অংশ পুনর্ব্যবহারকে অটোফ্যাজি বলে।')
  ],
  chapters: [
    ch('overview', 'class9', 14, '1. A bag of enzymes', '1. উৎসেচকের থলি', 'A lysosome is a small sac with one membrane, filled with digestive enzymes.', 'লাইসোজোম হলো একস্তরী পর্দাযুক্ত ছোট থলি, যা পাচক উৎসেচকে ভরা।'),
    ch('digest', 'class10', 24, '2. Recycling', '2. পুনর্ব্যবহার', 'A worn-out mitochondrion is wrapped in membrane, fuses with a lysosome and is broken down; the small molecules are reused.', 'একটি জীর্ণ মাইটোকনড্রিয়া পর্দায় মোড়া হয়, লাইসোজোমের সঙ্গে মিলিত হয় এবং ভেঙে যায়; ছোট অণুগুলি আবার ব্যবহৃত হয়।')
  ],
  myths: [
    myth('class9', '"Lysosomes are only \'suicide bags\' that kill the cell."', '"লাইসোজোম কেবল কোশকে মেরে ফেলার \'আত্মঘাতী থলি\'।"', 'Their everyday job is recycling and digestion; the name refers to what can happen when a cell is badly damaged.', 'এদের প্রতিদিনের কাজ হলো পুনর্ব্যবহার ও পাচন; কোশ গুরুতরভাবে ক্ষতিগ্রস্ত হলে যা ঘটতে পারে, নামটি তা নির্দেশ করে।')
  ],
  quiz: [
    q('lq1', 'class9', 'Lysosomes contain…', 'লাইসোজোমে কী থাকে?', [['Digestive enzymes', 'পাচক উৎসেচক'], ['Chlorophyll', 'ক্লোরোফিল'], ['DNA only', 'কেবল DNA'], ['Starch', 'শ্বেতসার']], 0, 'cell.lyso.enzymes'),
    q('lq2', 'class9', 'What do lysosomes break down?', 'লাইসোজোম কী ভেঙে ফেলে?', [['Worn-out cell parts', 'জীর্ণ কোশ-অংশ'], ['Sunlight', 'সূর্যালোক'], ['Cell wall of the same cell only', 'কেবল নিজের কোশপ্রাচীর'], ['Nothing', 'কিছুই না']], 0, 'cell.lyso.enzymes'),
    q('lq3', 'class9', 'Lysosomal enzymes stay safe from the cell because…', 'লাইসোজোমের উৎসেচক কোশের ক্ষতি করে না কারণ…', [['A membrane encloses them', 'একটি পর্দা এগুলিকে ঘিরে রাখে'], ['They are inactive forever', 'এগুলি চিরকাল নিষ্ক্রিয়'], ['They stay in the nucleus', 'এগুলি নিউক্লিয়াসে থাকে'], ['The cell wall blocks them', 'কোশপ্রাচীর এগুলিকে আটকায়']], 0, 'cell.lyso.enzymes'),
    q('lq4', 'class11-12', 'Lysosomal enzymes work best at…', 'লাইসোজোমের উৎসেচক কোন অবস্থায় সবচেয়ে ভালো কাজ করে?', [['Acidic pH', 'আম্লিক pH'], ['Strongly alkaline pH', 'তীব্র ক্ষারীয় pH'], ['Neutral pH only', 'কেবল প্রশম pH'], ['Any pH equally', 'যেকোনো pH-এ সমানভাবে']], 0, 'cell.lyso.acid')
  ],
  limitation: LIMIT('Lysosome size and enzyme particles are exaggerated so they can be seen.', 'দেখার সুবিধার জন্য লাইসোজোমের আকার ও উৎসেচক কণা বড় করে দেখানো হয়েছে।')
};

// ---------------- Plasma membrane ----------------
const membrane = {
  id: 'membrane', cell: 'both',
  title: { en: 'Plasma membrane', bn: 'কোশপর্দা (Plasma membrane)' },
  lead: { en: 'A thin, flexible, selectively permeable boundary around every cell.', bn: 'প্রতিটি কোশের চারপাশে পাতলা, নমনীয়, প্রভেদক ভেদ্য সীমানা।' },
  claims: [
    claim('cell.mem.selective', 'class9', 'The plasma membrane is selectively permeable: it lets some substances pass and stops others. Water moves across it by osmosis.', 'কোশপর্দা প্রভেদক ভেদ্য: কিছু পদার্থকে যেতে দেয় এবং কিছুকে আটকায়। অভিস্রবণের মাধ্যমে জল এর মধ্য দিয়ে যাতায়াত করে।', [SRC.NCERT_IX, SRC.OS_MEMB]),
    claim('cell.mem.fluid-mosaic', 'class11-12', 'The fluid mosaic model (Singer and Nicolson, 1972) describes the membrane as a fluid lipid bilayer with proteins that can move sideways.', 'তরল মোজাইক মডেল (সিঙ্গার ও নিকলসন, 1972) অনুযায়ী কোশপর্দা হলো একটি তরল লিপিড দ্বিস্তর, যাতে প্রোটিনগুলি পাশাপাশি সরতে পারে।', [SRC.NCERT_XI_CELL, SRC.SINGER_1972]),
    claim('cell.mem.rbc-composition', 'neet', 'The human red blood cell membrane has about 52% protein and 40% lipids.', 'মানুষের লোহিত রক্তকণিকার পর্দায় প্রায় 52% প্রোটিন ও 40% লিপিড থাকে।', [SRC.NCERT_XI_CELL, SRC.ALBERTS], { value: 52, unit: '% protein', range: [52, 52] }),
    claim('cell.mem.nak-pump', 'neet', 'The Na+/K+ pump uses one ATP to move 3 Na+ out of the cell and 2 K+ in — an example of active transport.', 'Na+/K+ পাম্প একটি ATP ব্যবহার করে 3টি Na+ কোশের বাইরে ও 2টি K+ ভেতরে আনে — এটি সক্রিয় পরিবহণের উদাহরণ।', [SRC.OS_ACTIVE, SRC.ALBERTS, SRC.NCERT_XI_CELL])
  ],
  parts: [
    p('heads', 'class9', '#60a5fa', 'Phospholipid heads', 'ফসফোলিপিডের মাথা', 'Water-loving heads face the watery inside and outside.', 'জলপ্রিয় মাথাগুলি ভেতরের ও বাইরের জলীয় অংশের দিকে মুখ করে থাকে।', 'class11-12', 'Polar (hydrophilic) heads form the two surfaces of the bilayer.', 'ধ্রুবীয় (জলাকর্ষী) মাথা দ্বিস্তরের দুটি তল গঠন করে।'),
    p('tails', 'class10', '#facc15', 'Lipid tails', 'লিপিডের লেজ', 'Water-fearing tails hide in the middle of the membrane.', 'জলবিদ্বেষী লেজগুলি পর্দার মাঝখানে লুকিয়ে থাকে।', 'class11-12', 'Non-polar (hydrophobic) tails block ions and most large polar molecules.', 'অধ্রুবীয় (জলবিকর্ষী) লেজ আয়ন ও বেশিরভাগ বড় ধ্রুবীয় অণুকে আটকায়।'),
    p('protein', 'class9', '#f472b6', 'Membrane proteins', 'পর্দার প্রোটিন', 'Proteins that work as channels, carriers, pumps and receptors.', 'প্রোটিন, যা প্রণালী, বাহক, পাম্প ও গ্রাহক হিসেবে কাজ করে।', 'class11-12', 'Integral proteins span the bilayer; peripheral proteins sit on its surface.', 'অবিচ্ছেদ্য প্রোটিন দ্বিস্তর ভেদ করে থাকে; প্রান্তীয় প্রোটিন তলের ওপর থাকে।'),
    p('pump', 'neet', '#fb923c', 'Na+/K+ pump', 'Na+/K+ পাম্প', 'Moves ions against their concentration gradient using ATP.', 'ATP ব্যবহার করে আয়নকে ঘনত্বের বিপরীতে সরায়।', 'neet', '3 Na+ out and 2 K+ in per ATP.', 'প্রতি ATP-তে 3টি Na+ বাইরে ও 2টি K+ ভেতরে।'),
    p('gas', 'class9', '#34d399', 'O2 and CO2', 'O2 ও CO2', 'Small gas molecules diffuse straight through the bilayer.', 'ছোট গ্যাস অণু সরাসরি দ্বিস্তরের মধ্য দিয়ে ব্যাপিত হয়।', 'class10', 'They move from higher to lower concentration without using energy (passive).', 'এরা শক্তি খরচ ছাড়াই বেশি ঘনত্ব থেকে কম ঘনত্বের দিকে যায় (নিষ্ক্রিয় পরিবহণ)।')
  ],
  chapters: [
    ch('overview', 'class9', 14, '1. The boundary', '1. কোশের সীমানা', 'A double layer of lipids with proteins floating in it.', 'লিপিডের দ্বিস্তর, যার মধ্যে প্রোটিন ভাসমান অবস্থায় থাকে।'),
    ch('diffusion', 'class9', 18, '2. Diffusion', '2. ব্যাপন', 'Oxygen enters and carbon dioxide leaves by diffusion — from higher to lower concentration, with no energy used.', 'অক্সিজেন প্রবেশ করে ও কার্বন ডাইঅক্সাইড বেরিয়ে যায় ব্যাপনের মাধ্যমে — বেশি ঘনত্ব থেকে কম ঘনত্বে, কোনো শক্তি খরচ ছাড়া।'),
    ch('pump', 'neet', 24, '3. Active transport', '3. সক্রিয় পরিবহণ', 'The Na+/K+ pump spends one ATP to push 3 Na+ out and pull 2 K+ in, against their gradients.', 'Na+/K+ পাম্প একটি ATP খরচ করে ঘনত্বের বিপরীতে 3টি Na+ বাইরে পাঠায় ও 2টি K+ ভেতরে আনে।')
  ],
  myths: [
    myth('class9', '"The cell membrane is a rigid wall."', '"কোশপর্দা একটি দৃঢ় প্রাচীর।"', 'It is fluid and flexible; the rigid layer in plants is the separate cell wall.', 'এটি তরল ও নমনীয়; উদ্ভিদের দৃঢ় স্তরটি হলো আলাদা কোশপ্রাচীর।')
  ],
  quiz: [
    q('pq1', 'class9', 'The plasma membrane is…', 'কোশপর্দা হলো…', [['Selectively permeable', 'প্রভেদক ভেদ্য'], ['Fully permeable', 'সম্পূর্ণ ভেদ্য'], ['Impermeable', 'অভেদ্য'], ['Made of cellulose', 'সেলুলোজ দিয়ে তৈরি']], 0, 'cell.mem.selective'),
    q('pq2', 'class9', 'How does O2 enter a cell?', 'O2 কীভাবে কোশে প্রবেশ করে?', [['By diffusion', 'ব্যাপনের মাধ্যমে'], ['By active pumping only', 'কেবল সক্রিয় পাম্পের মাধ্যমে'], ['Through the nucleus', 'নিউক্লিয়াসের মধ্য দিয়ে'], ['It cannot enter', 'প্রবেশ করতে পারে না']], 0, 'cell.mem.selective'),
    q('pq3', 'class9', 'Movement of water across a selectively permeable membrane is called…', 'প্রভেদক ভেদ্য পর্দার মধ্য দিয়ে জলের চলাচলকে কী বলে?', [['Osmosis', 'অভিস্রবণ'], ['Photosynthesis', 'সালোকসংশ্লেষ'], ['Secretion', 'ক্ষরণ'], ['Fission', 'বিভাজন']], 0, 'cell.mem.selective'),
    q('pq4', 'class11-12', 'Who proposed the fluid mosaic model?', 'তরল মোজাইক মডেল কারা প্রস্তাব করেন?', [['Singer and Nicolson', 'সিঙ্গার ও নিকলসন'], ['Watson and Crick', 'ওয়াটসন ও ক্রিক'], ['Schleiden and Schwann', 'শ্লাইডেন ও শোয়ান'], ['Robert Brown', 'রবার্ট ব্রাউন']], 0, 'cell.mem.fluid-mosaic'),
    q('pq5', 'neet', 'Per ATP, the Na+/K+ pump moves…', 'প্রতি ATP-তে Na+/K+ পাম্প কী সরায়?', [['3 Na+ out, 2 K+ in', '3টি Na+ বাইরে, 2টি K+ ভেতরে'], ['2 Na+ out, 3 K+ in', '2টি Na+ বাইরে, 3টি K+ ভেতরে'], ['1 Na+ out, 1 K+ in', '1টি Na+ বাইরে, 1টি K+ ভেতরে'], ['3 K+ out, 2 Na+ in', '3টি K+ বাইরে, 2টি Na+ ভেতরে']], 0, 'cell.mem.nak-pump')
  ],
  limitation: LIMIT('Lipids and proteins are drawn as simple shapes; cholesterol and carbohydrate chains are omitted.', 'লিপিড ও প্রোটিন সরল আকারে দেখানো হয়েছে; কোলেস্টেরল ও শর্করা শৃঙ্খল বাদ রাখা হয়েছে।')
};

// ---------------- Chloroplast (plant) ----------------
const chloroplast = {
  id: 'chloroplast', cell: 'plant',
  title: { en: 'Chloroplast', bn: 'ক্লোরোপ্লাস্ট (Chloroplast)' },
  lead: { en: 'Where plants capture light energy and make food by photosynthesis.', bn: 'যেখানে উদ্ভিদ আলোক শক্তি গ্রহণ করে সালোকসংশ্লেষের মাধ্যমে খাদ্য তৈরি করে।' },
  claims: [
    claim('cell.chl.photosynthesis', 'class9', 'Chloroplasts contain chlorophyll and are the site of photosynthesis in plant cells.', 'ক্লোরোপ্লাস্টে ক্লোরোফিল থাকে এবং এটি উদ্ভিদকোশে সালোকসংশ্লেষের স্থান।', [SRC.NCERT_IX, SRC.OS_PS]),
    claim('cell.chl.structure', 'class11-12', 'A chloroplast has a double membrane; inside, the stroma surrounds stacks of thylakoids called grana. It has its own circular DNA and 70S ribosomes.', 'ক্লোরোপ্লাস্টের দ্বিস্তরী পর্দা আছে; ভেতরে স্ট্রোমা গ্রানা নামক থাইলাকয়েডের স্তূপকে ঘিরে থাকে। এর নিজস্ব বৃত্তাকার DNA ও 70S রাইবোজোম আছে।', [SRC.NCERT_XI_CELL, SRC.OS_PS]),
    claim('cell.chl.size', 'class11-12', 'Chloroplasts are mostly lens-shaped, about 5–10 µm long and 2–4 µm wide; numbers range from 1 per cell (Chlamydomonas) to 20–40 per mesophyll cell.', 'ক্লোরোপ্লাস্ট সাধারণত লেন্সের মতো, প্রায় 5–10 µm লম্বা ও 2–4 µm চওড়া; প্রতি কোশে সংখ্যা 1টি (ক্ল্যামাইডোমোনাস) থেকে মেসোফিল কোশে 20–40টি পর্যন্ত।', [SRC.NCERT_XI_CELL, SRC.ALBERTS], { value: 7, unit: 'µm', range: [5, 10] }),
    claim('cell.chl.sites', 'class11-12', 'Light reactions happen on the thylakoid membranes (releasing O2); CO2 is fixed into sugar in the stroma.', 'আলোক দশা থাইলাকয়েড পর্দায় ঘটে (O2 মুক্ত হয়); স্ট্রোমায় CO2 আবদ্ধ হয়ে শর্করা তৈরি হয়।', [SRC.NCERT_XI_PS, SRC.OS_PS])
  ],
  parts: [
    p('envelope', 'class9', '#86efac', 'Envelope (double membrane)', 'আবরণী (দ্বিস্তরী পর্দা)', 'Two membranes enclose the chloroplast.', 'দুটি পর্দা ক্লোরোপ্লাস্টকে ঘিরে রাখে।', 'class11-12', 'Like mitochondria, chloroplasts are semi-autonomous and divide by fission.', 'মাইটোকনড্রিয়ার মতো ক্লোরোপ্লাস্টও আধা-স্বয়ংশাসিত এবং বিভাজনের মাধ্যমে সংখ্যাবৃদ্ধি করে।'),
    p('grana', 'class9', '#16a34a', 'Grana (thylakoid stacks)', 'গ্রানা (থাইলাকয়েডের স্তূপ)', 'Stacks of disc-like thylakoids holding chlorophyll.', 'ক্লোরোফিলযুক্ত চাকতির মতো থাইলাকয়েডের স্তূপ।', 'class11-12', 'Light energy is trapped here; water is split and oxygen is released.', 'এখানে আলোক শক্তি আবদ্ধ হয়; জল বিশ্লিষ্ট হয়ে অক্সিজেন মুক্ত হয়।'),
    p('stroma', 'class9', '#bef264', 'Stroma', 'স্ট্রোমা (Stroma)', 'Fluid matrix around the grana.', 'গ্রানার চারপাশের তরল ধাত্র।', 'class11-12', 'Enzymes here fix CO2 into sugar (Calvin cycle); also holds DNA and 70S ribosomes.', 'এখানকার উৎসেচক CO2 আবদ্ধ করে শর্করা তৈরি করে (ক্যালভিন চক্র); এখানে DNA ও 70S রাইবোজোমও থাকে।'),
    p('lamellae', 'class11-12', '#4ade80', 'Stroma lamellae', 'স্ট্রোমা ল্যামেলি (Stroma lamellae)', 'Flat membrane tubules that connect the grana.', 'চ্যাপ্টা পর্দার নল, যা গ্রানাগুলিকে যুক্ত করে।', 'class11-12', 'They connect thylakoids of different grana into one membrane system.', 'এগুলি বিভিন্ন গ্রানার থাইলাকয়েডকে একটি পর্দাতন্ত্রে যুক্ত করে।')
  ],
  chapters: [
    ch('overview', 'class9', 14, '1. The food factory', '1. খাদ্য তৈরির কারখানা', 'A green, lens-shaped plastid found in leaf cells.', 'পাতার কোশে পাওয়া সবুজ, লেন্সাকার প্লাস্টিড।'),
    ch('cutaway', 'class9', 16, '2. Look inside', '2. ভেতরে দেখুন', 'Inside: stacks of thylakoids (grana) in a fluid stroma.', 'ভেতরে: তরল স্ট্রোমায় থাইলাকয়েডের স্তূপ (গ্রানা)।'),
    ch('photo', 'class10', 26, '3. Photosynthesis', '3. সালোকসংশ্লেষ', 'Light is absorbed by chlorophyll; water is split and O2 is released; CO2 is turned into glucose.', 'ক্লোরোফিল আলো শোষণ করে; জল বিশ্লিষ্ট হয়ে O2 মুক্ত হয়; CO2 থেকে গ্লুকোজ তৈরি হয়।')
  ],
  myths: [
    myth('class10', '"The oxygen released in photosynthesis comes from CO2."', '"সালোকসংশ্লেষে মুক্ত অক্সিজেন CO2 থেকে আসে।"', 'It comes from splitting water.', 'এটি জল বিশ্লিষ্ট হয়ে আসে।'),
    myth('class9', '"Plants do photosynthesis instead of respiration."', '"উদ্ভিদ শ্বসনের পরিবর্তে সালোকসংশ্লেষ করে।"', 'Plant cells have mitochondria and respire all the time, day and night.', 'উদ্ভিদকোশে মাইটোকনড্রিয়া আছে এবং দিনরাত সবসময় শ্বসন চলে।')
  ],
  quiz: [
    q('cq1', 'class9', 'Chloroplasts are found in…', 'ক্লোরোপ্লাস্ট কোথায় পাওয়া যায়?', [['Plant cells', 'উদ্ভিদকোশে'], ['Human red blood cells', 'মানুষের লোহিত রক্তকণিকায়'], ['All animal cells', 'সব প্রাণীকোশে'], ['Bacteria only', 'কেবল ব্যাকটেরিয়ায়']], 0, 'cell.chl.photosynthesis'),
    q('cq2', 'class9', 'The green pigment in chloroplasts is…', 'ক্লোরোপ্লাস্টের সবুজ রঞ্জক কোনটি?', [['Chlorophyll', 'ক্লোরোফিল'], ['Haemoglobin', 'হিমোগ্লোবিন'], ['Melanin', 'মেলানিন'], ['Keratin', 'কেরাটিন']], 0, 'cell.chl.photosynthesis'),
    q('cq3', 'class9', 'Stacks of thylakoids are called…', 'থাইলাকয়েডের স্তূপকে কী বলে?', [['Grana', 'গ্রানা'], ['Cristae', 'ক্রিস্টি'], ['Cisternae', 'সিস্টারনি'], ['Chromatin', 'ক্রোমাটিন']], 0, 'cell.chl.photosynthesis'),
    q('cq4', 'class11-12', 'Where is CO2 fixed into sugar?', 'CO2 কোথায় আবদ্ধ হয়ে শর্করা তৈরি হয়?', [['Stroma', 'স্ট্রোমা'], ['Thylakoid lumen', 'থাইলাকয়েড গহ্বর'], ['Outer membrane', 'বহিঃপর্দা'], ['Nucleus', 'নিউক্লিয়াস']], 0, 'cell.chl.sites')
  ],
  limitation: LIMIT('Grana count and thylakoid spacing are simplified.', 'গ্রানার সংখ্যা ও থাইলাকয়েডের দূরত্ব সরলীকৃত।')
};

// ---------------- Plant cell wall + vacuole ----------------
const plantBoundary = {
  id: 'wall-vacuole', cell: 'plant',
  title: { en: 'Cell wall & vacuole', bn: 'কোশপ্রাচীর (Cell wall) ও গহ্বর (Vacuole)' },
  lead: { en: 'Plant cells have a rigid wall outside the membrane and a large central vacuole.', bn: 'উদ্ভিদকোশে কোশপর্দার বাইরে একটি দৃঢ় প্রাচীর ও একটি বড় কেন্দ্রীয় গহ্বর থাকে।' },
  claims: [
    claim('cell.wall.cellulose', 'class9', 'The plant cell wall lies outside the plasma membrane and is made mainly of cellulose; it gives shape and mechanical support.', 'উদ্ভিদের কোশপ্রাচীর কোশপর্দার বাইরে থাকে এবং প্রধানত সেলুলোজ দিয়ে তৈরি; এটি আকৃতি ও যান্ত্রিক দৃঢ়তা দেয়।', [SRC.NCERT_IX, SRC.OS_EUK]),
    claim('cell.wall.layers', 'class11-12', 'The wall contains cellulose, hemicellulose, pectins and proteins; neighbouring cells are glued by the middle lamella (mainly calcium pectate) and connected by plasmodesmata.', 'প্রাচীরে সেলুলোজ, হেমিসেলুলোজ, পেকটিন ও প্রোটিন থাকে; পাশাপাশি কোশগুলি মধ্যপর্দা (প্রধানত ক্যালসিয়াম পেকটেট) দিয়ে জোড়া থাকে এবং প্লাসমোডেসমাটা দিয়ে যুক্ত থাকে।', [SRC.NCERT_XI_CELL, SRC.ALBERTS]),
    claim('cell.vac.volume', 'class11-12', 'In plant cells the vacuole, bounded by the tonoplast, can occupy up to 90% of the cell volume.', 'উদ্ভিদকোশে টোনোপ্লাস্ট দিয়ে ঘেরা গহ্বর কোশের আয়তনের 90% পর্যন্ত জায়গা নিতে পারে।', [SRC.NCERT_XI_CELL, SRC.OS_EUK], { value: 90, unit: '% of volume', range: [30, 90] }),
    claim('cell.vac.plasmolysis', 'class9', 'In a strong salt or sugar solution, a plant cell loses water by osmosis and the membrane shrinks away from the wall (plasmolysis); in plain water it becomes firm (turgid).', 'গাঢ় লবণ বা চিনির দ্রবণে উদ্ভিদকোশ অভিস্রবণের মাধ্যমে জল হারায় এবং কোশপর্দা প্রাচীর থেকে সরে যায় (প্লাসমোলাইসিস); বিশুদ্ধ জলে কোশ টানটান (রসস্ফীত) হয়।', [SRC.NCERT_IX, SRC.OS_MEMB])
  ],
  parts: [
    p('wall', 'class9', '#a3e635', 'Cell wall', 'কোশপ্রাচীর (Cell wall)', 'Rigid outer layer made mainly of cellulose.', 'প্রধানত সেলুলোজ দিয়ে তৈরি দৃঢ় বাইরের স্তর।', 'class11-12', 'Fully permeable; it resists bursting when the cell takes in water.', 'সম্পূর্ণ ভেদ্য; কোশ জল গ্রহণ করলে এটি কোশকে ফেটে যাওয়া থেকে রক্ষা করে।'),
    p('membrane', 'class9', '#60a5fa', 'Plasma membrane', 'কোশপর্দা (Plasma membrane)', 'Selectively permeable membrane just inside the wall.', 'প্রাচীরের ঠিক ভেতরের প্রভেদক ভেদ্য পর্দা।', 'class10', 'It decides what enters; the wall does not.', 'কী প্রবেশ করবে তা এটিই ঠিক করে, প্রাচীর নয়।'),
    p('vacuole', 'class9', '#38bdf8', 'Central vacuole', 'কেন্দ্রীয় গহ্বর (Vacuole)', 'Large sac of cell sap: water, salts, sugars and wastes.', 'কোশরসে ভরা বড় থলি: জল, লবণ, শর্করা ও বর্জ্য পদার্থ।', 'class11-12', 'Bounded by the tonoplast; pushes the cytoplasm against the wall and keeps the cell turgid.', 'টোনোপ্লাস্ট দিয়ে ঘেরা; সাইটোপ্লাজমকে প্রাচীরের দিকে ঠেলে রাখে এবং কোশকে রসস্ফীত রাখে।'),
    p('lamella', 'class11-12', '#facc15', 'Middle lamella', 'মধ্যপর্দা (Middle lamella)', 'Layer that cements neighbouring cells together.', 'যে স্তর পাশাপাশি কোশগুলিকে জুড়ে রাখে।', 'class11-12', 'Made mainly of calcium pectate.', 'প্রধানত ক্যালসিয়াম পেকটেট দিয়ে তৈরি।'),
    p('cytoplasm', 'class9', '#bef264', 'Cytoplasm', 'সাইটোপ্লাজম (Cytoplasm)', 'Thin layer of cytoplasm pressed between vacuole and membrane.', 'গহ্বর ও কোশপর্দার মাঝে চাপা পাতলা সাইটোপ্লাজমের স্তর।', 'class10', 'Chloroplasts and the nucleus sit in this thin layer.', 'ক্লোরোপ্লাস্ট ও নিউক্লিয়াস এই পাতলা স্তরে থাকে।')
  ],
  chapters: [
    ch('overview', 'class9', 14, '1. The plant cell boundary', '1. উদ্ভিদকোশের সীমানা', 'Outside: a rigid cellulose wall. Inside: the membrane and a large vacuole.', 'বাইরে: দৃঢ় সেলুলোজের প্রাচীর। ভেতরে: কোশপর্দা ও একটি বড় গহ্বর।'),
    ch('plasmolysis', 'class9', 24, '2. Plasmolysis', '2. প্লাসমোলাইসিস', 'In strong salt solution water leaves by osmosis; the vacuole shrinks and the membrane pulls away from the wall. Back in water, it recovers.', 'গাঢ় লবণ দ্রবণে অভিস্রবণের মাধ্যমে জল বেরিয়ে যায়; গহ্বর সংকুচিত হয় এবং কোশপর্দা প্রাচীর থেকে সরে যায়। আবার জলে রাখলে কোশ আগের অবস্থায় ফেরে।')
  ],
  myths: [
    myth('class9', '"The cell wall controls what enters the cell."', '"কোশপ্রাচীর নিয়ন্ত্রণ করে কী কোশে প্রবেশ করবে।"', 'The wall is fully permeable; the plasma membrane is the selective barrier.', 'প্রাচীর সম্পূর্ণ ভেদ্য; কোশপর্দাই নির্বাচনকারী বাধা।'),
    myth('class9', '"Animal cells have no vacuoles."', '"প্রাণীকোশে কোনো গহ্বর থাকে না।"', 'Animal cells have small vacuoles; plant cells usually have one large central vacuole.', 'প্রাণীকোশে ছোট গহ্বর থাকে; উদ্ভিদকোশে সাধারণত একটি বড় কেন্দ্রীয় গহ্বর থাকে।')
  ],
  quiz: [
    q('wq1', 'class9', 'The plant cell wall is made mainly of…', 'উদ্ভিদের কোশপ্রাচীর প্রধানত কী দিয়ে তৈরি?', [['Cellulose', 'সেলুলোজ'], ['Protein only', 'কেবল প্রোটিন'], ['Chitin', 'কাইটিন'], ['Lipid', 'লিপিড']], 0, 'cell.wall.cellulose'),
    q('wq2', 'class9', 'In strong salt solution a plant cell…', 'গাঢ় লবণ দ্রবণে উদ্ভিদকোশ…', [['Loses water and plasmolyses', 'জল হারিয়ে প্লাসমোলাইসিস দেখায়'], ['Bursts', 'ফেটে যায়'], ['Gains water', 'জল গ্রহণ করে'], ['Stays unchanged', 'অপরিবর্তিত থাকে']], 0, 'cell.vac.plasmolysis'),
    q('wq3', 'class9', 'Why does a plant cell not burst in plain water?', 'বিশুদ্ধ জলে উদ্ভিদকোশ ফেটে যায় না কেন?', [['The rigid cell wall resists it', 'দৃঢ় কোশপ্রাচীর বাধা দেয়'], ['It has no membrane', 'এর কোশপর্দা নেই'], ['Water cannot enter', 'জল প্রবেশ করতে পারে না'], ['The nucleus stops it', 'নিউক্লিয়াস থামিয়ে দেয়']], 0, 'cell.wall.cellulose'),
    q('wq4', 'class11-12', 'The membrane around the vacuole is the…', 'গহ্বরকে ঘিরে থাকা পর্দাকে কী বলে?', [['Tonoplast', 'টোনোপ্লাস্ট'], ['Middle lamella', 'মধ্যপর্দা'], ['Thylakoid', 'থাইলাকয়েড'], ['Cristae', 'ক্রিস্টি']], 0, 'cell.vac.volume')
  ],
  limitation: LIMIT('The cell is shown as a box; real plant cells vary in shape. Osmosis is shown qualitatively.', 'কোশটিকে বাক্সের মতো দেখানো হয়েছে; প্রকৃত উদ্ভিদকোশের আকৃতি বিভিন্ন। অভিস্রবণ গুণগতভাবে দেখানো হয়েছে।')
};

export const mitochondrionPack = {
  id: 'mitochondrion', cell: 'both',
  title: { en: 'Mitochondrion', bn: 'মাইটোকনড্রিয়া (Mitochondrion)' },
  lead: { en: 'Rotate, zoom and tap any part. Play a chapter to watch it work.', bn: 'ঘোরান, বড় করুন এবং যেকোনো অংশে স্পর্শ করুন। কীভাবে কাজ করে দেখতে একটি অধ্যায় চালু করুন।' },
  claims: mitochondrionClaims, parts: mitochondrionParts, chapters: mitochondrionChapters,
  myths: mitochondrionMisconceptions, quiz: mitochondrionQuiz, limitation: MITO_LIMITATION
};

export const organellePacks = [membrane, nucleus, mitochondrionPack, er, golgi, lysosome, chloroplast, plantBoundary];
