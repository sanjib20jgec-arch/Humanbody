// Heredity bay deep-dive packs (docs/bays/HEREDITY_MASTERPLAN.md; Molecular Basis kept per user decision).
import { claim, part, chapter, myth, quiz, limitation } from '../packHelpers.js';

const S = {
  NCERT_X: { kind: 'syllabus', title: 'NCERT Science Class 10 (Reprint 2026-27), Ch 8 Heredity', url: 'https://ncert.nic.in/textbook/pdf/jesc108.pdf' },
  NCERT_XII_PI: { kind: 'syllabus', title: 'NCERT Biology Class 12, Principles of Inheritance and Variation', url: 'https://ncert.nic.in/textbook.php' },
  NCERT_XII_MB: { kind: 'syllabus', title: 'NCERT Biology Class 12, Molecular Basis of Inheritance', url: 'https://ncert.nic.in/textbook.php' },
  OS_BIO_MENDEL: { kind: 'reference', title: 'OpenStax Biology 2e, 12.1–12.3 Mendel\'s Experiments and Laws of Inheritance (CC BY 4.0)', url: 'https://openstax.org/books/biology-2e/pages/12-1-mendels-experiments-and-the-laws-of-probability' },
  OS_BIO_DNA: { kind: 'reference', title: 'OpenStax Biology 2e, 14.2 DNA Structure and Sequencing (CC BY 4.0)', url: 'https://openstax.org/books/biology-2e/pages/14-2-dna-structure-and-sequencing' },
  OS_BIO_EXPR: { kind: 'reference', title: 'OpenStax Biology 2e, Ch 15 Genes and Proteins (CC BY 4.0)', url: 'https://openstax.org/books/biology-2e/pages/15-introduction' },
  OS_BIO_SEX: { kind: 'reference', title: 'OpenStax Biology 2e, 13.1 Chromosomal Theory and Genetic Linkage — sex chromosomes (CC BY 4.0)', url: 'https://openstax.org/books/biology-2e/pages/13-1-chromosomal-theory-and-genetic-linkage' },
  WATSON_CRICK: { kind: 'peer-reviewed', title: 'Watson J.D., Crick F.H.C. (1953) Molecular structure of nucleic acids. Nature 171:737–738', url: 'https://doi.org/10.1038/171737a0' },
  MESELSON: { kind: 'peer-reviewed', title: 'Meselson M., Stahl F.W. (1958) The replication of DNA in Escherichia coli. PNAS 44:671–682', url: 'https://doi.org/10.1073/pnas.44.7.671' }
};

const dna = {
  id: 'dna', tag: { en: 'molecule', bn: 'অণু' },
  title: { en: 'Chromosomes, DNA and genes', bn: 'ক্রোমোজোম, DNA ও জিন' },
  lead: { en: 'Chromosomes are made of DNA; a gene is a stretch of DNA that carries instructions.', bn: 'ক্রোমোজোম DNA দিয়ে তৈরি; জিন হলো DNA-এর একটি অংশ, যা নির্দেশ বহন করে।' },
  claims: [
    claim('her.dna.gene', 'class9', 'Chromosomes in the nucleus carry DNA; a section of DNA that provides information for one protein is called a gene, and proteins control characteristics.', 'নিউক্লিয়াসের ক্রোমোজোম DNA বহন করে; DNA-এর যে অংশ একটি প্রোটিন তৈরির তথ্য দেয় তাকে জিন বলে, এবং প্রোটিন বৈশিষ্ট্য নিয়ন্ত্রণ করে।', [S.NCERT_X, S.OS_BIO_DNA]),
    claim('her.dna.helix', 'class10', 'DNA is a double helix: two strands held together by base pairs, adenine with thymine and guanine with cytosine.', 'DNA একটি দ্বি-সর্পিল: দুটি সূত্র ক্ষারক-জোড় দিয়ে যুক্ত থাকে — অ্যাডেনিনের সঙ্গে থাইমিন এবং গুয়ানিনের সঙ্গে সাইটোসিন।', [S.WATSON_CRICK, S.OS_BIO_DNA]),
    claim('her.dna.genome', 'neet', 'The haploid human genome has about 3 × 10⁹ base pairs.', 'মানুষের হ্যাপ্লয়েড জিনোমে প্রায় 3 × 10⁹ ক্ষারক-জোড় আছে।', [S.NCERT_XII_MB, S.OS_BIO_DNA], { value: 3.1e9, unit: 'bp', range: [3.0e9, 3.2e9] })
  ],
  parts: [
    part('chromosome', 'class9', '#a78bfa', 'Chromosome', 'ক্রোমোজোম', 'Thread-like structure of tightly coiled DNA.', 'ঘনভাবে প্যাঁচানো DNA-এর সুতোর মতো গঠন।', 'class11-12', 'DNA is wound around histone proteins.', 'DNA হিস্টোন প্রোটিনের চারপাশে জড়ানো থাকে।'),
    part('helix', 'class9', '#38bdf8', 'DNA double helix', 'DNA দ্বি-সর্পিল', 'Two twisted strands.', 'দুটি পাকানো সূত্র।', 'class10', 'Sugar–phosphate backbones on the outside.', 'বাইরের দিকে শর্করা-ফসফেটের কাঠামো।'),
    part('base', 'class10', '#facc15', 'Base pairs', 'ক্ষারক-জোড়', 'Rungs of the ladder: A–T and G–C.', 'মইয়ের ধাপ: A–T ও G–C।', 'class11-12', 'A–T has two hydrogen bonds, G–C three.', 'A–T-তে দুটি এবং G–C-তে তিনটি হাইড্রোজেন বন্ধন।'),
    part('gene', 'class9', '#22c55e', 'Gene', 'জিন', 'A stretch of DNA with instructions for a protein.', 'DNA-এর একটি অংশ, যাতে প্রোটিন তৈরির নির্দেশ থাকে।', 'neet', 'Has a promoter, coding region and terminator.', 'এতে প্রোমোটার, সংকেতবাহী অংশ ও টার্মিনেটর থাকে।')
  ],
  chapters: [
    chapter('overview', 'class9', 16, '1. Zoom into a chromosome', '1. ক্রোমোজোমের ভেতরে', 'A chromosome unwinds to reveal the DNA double helix; a gene is highlighted.', 'ক্রোমোজোম খুলে DNA দ্বি-সর্পিল দেখা যায়; একটি জিন চিহ্নিত।'),
    chapter('pairs', 'class10', 18, '2. Base pairing', '2. ক্ষারক-জোড়', 'A always pairs with T, and G with C.', 'A সবসময় T-এর সঙ্গে এবং G, C-এর সঙ্গে জোড় বাঁধে।')
  ],
  myths: [myth('class9', '"One gene controls one whole body part."', '"একটি জিন একটি সম্পূর্ণ অঙ্গ নিয়ন্ত্রণ করে।"', 'Most traits depend on many genes and the environment.', 'বেশিরভাগ বৈশিষ্ট্য বহু জিন ও পরিবেশের ওপর নির্ভর করে।')],
  quiz: [
    quiz('dn1', 'class9', 'A gene is a section of…', 'জিন হলো কীসের একটি অংশ?', [['DNA', 'DNA'], ['Protein', 'প্রোটিন'], ['Cell membrane', 'কোশপর্দা'], ['Ribosome', 'রাইবোজোম']], 0, 'her.dna.gene'),
    quiz('dn2', 'class9', 'Chromosomes are found in the…', 'ক্রোমোজোম থাকে…', [['Nucleus', 'নিউক্লিয়াসে'], ['Cell wall', 'কোশপ্রাচীরে'], ['Vacuole', 'কোশগহ্বরে'], ['Blood plasma', 'রক্তরসে']], 0, 'her.dna.gene'),
    quiz('dn3', 'class9', 'Genes control traits through…', 'জিন বৈশিষ্ট্য নিয়ন্ত্রণ করে…', [['Proteins', 'প্রোটিনের মাধ্যমে'], ['Fats', 'স্নেহপদার্থের মাধ্যমে'], ['Water', 'জলের মাধ্যমে'], ['Minerals', 'খনিজের মাধ্যমে']], 0, 'her.dna.gene'),
    quiz('dn4', 'class10', 'Adenine pairs with…', 'অ্যাডেনিন জোড় বাঁধে…', [['Thymine', 'থাইমিনের সঙ্গে'], ['Guanine', 'গুয়ানিনের সঙ্গে'], ['Cytosine', 'সাইটোসিনের সঙ্গে'], ['Adenine', 'অ্যাডেনিনের সঙ্গে']], 0, 'her.dna.helix')
  ],
  limitation: limitation('Coiling levels are compressed; real DNA is about 2 nm wide.', 'প্যাঁচের স্তরগুলি সংক্ষিপ্ত করা হয়েছে; বাস্তব DNA প্রায় 2 nm চওড়া।')
};

const mendel = {
  id: 'mendel', tag: { en: 'inheritance', bn: 'বংশগতি' },
  title: { en: 'Mendel\'s experiments', bn: 'মেন্ডেলের পরীক্ষা' },
  lead: { en: 'Crossing tall and dwarf pea plants revealed dominant and recessive traits and the 3 : 1 ratio.', bn: 'লম্বা ও খর্ব মটর গাছের সংকরায়ণ থেকে প্রকট ও প্রচ্ছন্ন বৈশিষ্ট্য এবং 3 : 1 অনুপাত জানা গেল।' },
  claims: [
    claim('her.men.f1', 'class9', 'When Mendel crossed pure tall (TT) with pure dwarf (tt) pea plants, all F1 plants were tall: tallness is dominant and dwarfness recessive.', 'মেন্ডেল বিশুদ্ধ লম্বা (TT) ও বিশুদ্ধ খর্ব (tt) মটর গাছের সংকরায়ণ করলে F1-এর সব গাছ লম্বা হলো: লম্বা বৈশিষ্ট্য প্রকট এবং খর্ব প্রচ্ছন্ন।', [S.NCERT_X, S.OS_BIO_MENDEL]),
    claim('her.men.f2', 'class9', 'Self-pollinating F1 plants gave F2 plants in a ratio of about 3 tall : 1 dwarf (genotypes 1 TT : 2 Tt : 1 tt).', 'F1 গাছের স্বপরাগযোগে F2-তে প্রায় 3 লম্বা : 1 খর্ব অনুপাতে গাছ হলো (জিনোটাইপ 1 TT : 2 Tt : 1 tt)।', [S.NCERT_X, S.OS_BIO_MENDEL]),
    claim('her.men.dihybrid', 'class10', 'In a cross between round-yellow and wrinkled-green seeds, the F2 ratio is 9 : 3 : 3 : 1, showing that traits are inherited independently.', 'গোল-হলুদ ও কুঞ্চিত-সবুজ বীজের সংকরায়ণে F2 অনুপাত 9 : 3 : 3 : 1, যা দেখায় বৈশিষ্ট্যগুলি স্বাধীনভাবে বংশানুক্রমে সঞ্চারিত হয়।', [S.NCERT_X, S.OS_BIO_MENDEL]),
    claim('her.men.incomplete', 'neet', 'In incomplete dominance, as in snapdragon flower colour, the F1 is intermediate (pink) and the F2 phenotypic ratio is 1 : 2 : 1.', 'অসম্পূর্ণ প্রকটতায়, যেমন স্ন্যাপড্রাগন ফুলের রঙে, F1 মধ্যবর্তী (গোলাপি) হয় এবং F2-এর ফিনোটাইপ অনুপাত 1 : 2 : 1।', [S.NCERT_XII_PI, S.OS_BIO_MENDEL])
  ],
  parts: [
    part('tall', 'class9', '#22c55e', 'Tall plant', 'লম্বা গাছ', 'Shows the dominant trait.', 'প্রকট বৈশিষ্ট্য দেখায়।', 'class10', 'Genotype TT or Tt.', 'জিনোটাইপ TT বা Tt।'),
    part('dwarf', 'class9', '#a3e635', 'Dwarf plant', 'খর্ব গাছ', 'Shows the recessive trait.', 'প্রচ্ছন্ন বৈশিষ্ট্য দেখায়।', 'class10', 'Genotype tt only.', 'জিনোটাইপ কেবল tt।'),
    part('grid', 'class10', '#94a3b8', 'Punnett square', 'পানেট বর্গ', 'Grid that predicts offspring.', 'অপত্য অনুমানের ছক।', 'class11-12', 'Each box has an equal probability.', 'প্রতিটি ঘরের সম্ভাবনা সমান।'),
    part('allele', 'class10', '#facc15', 'Alleles T and t', 'অ্যালিল T ও t', 'Two forms of the height gene.', 'উচ্চতা-জিনের দুটি রূপ।', 'class11-12', 'Each parent passes one allele.', 'প্রত্যেক জনিতৃ একটি করে অ্যালিল দেয়।')
  ],
  chapters: [
    chapter('overview', 'class9', 18, '1. F1: all tall', '1. F1: সব লম্বা', 'TT × tt gives all Tt, which are tall.', 'TT × tt থেকে সব Tt হয়, যারা লম্বা।'),
    chapter('f2', 'class9', 24, '2. F2: 3 : 1', '2. F2: 3 : 1', 'Tt × Tt fills a Punnett square: 1 TT, 2 Tt, 1 tt — three tall to one dwarf.', 'Tt × Tt পানেট বর্গ পূরণ করে: 1 TT, 2 Tt, 1 tt — তিনটি লম্বা, একটি খর্ব।')
  ],
  myths: [myth('class9', '"Recessive traits disappear for ever."', '"প্রচ্ছন্ন বৈশিষ্ট্য চিরতরে হারিয়ে যায়।"', 'They stay hidden in carriers (Tt) and reappear when two recessive alleles meet.', 'এরা বাহকে (Tt) লুকিয়ে থাকে এবং দুটি প্রচ্ছন্ন অ্যালিল মিললে আবার দেখা দেয়।')],
  quiz: [
    quiz('me1', 'class9', 'TT × tt gives F1 plants that are…', 'TT × tt থেকে F1 গাছগুলি…', [['All tall', 'সব লম্বা'], ['All dwarf', 'সব খর্ব'], ['Half tall', 'অর্ধেক লম্বা'], ['Medium', 'মাঝারি']], 0, 'her.men.f1'),
    quiz('me2', 'class9', 'The F2 ratio in a monohybrid cross is…', 'একসংকর জননে F2 অনুপাত…', [['3 : 1', '3 : 1'], ['1 : 1', '1 : 1'], ['9 : 3 : 3 : 1', '9 : 3 : 3 : 1'], ['2 : 1', '2 : 1']], 0, 'her.men.f2'),
    quiz('me3', 'class9', 'A dwarf pea plant has the genotype…', 'খর্ব মটর গাছের জিনোটাইপ…', [['tt', 'tt'], ['TT', 'TT'], ['Tt', 'Tt'], ['TT or Tt', 'TT বা Tt']], 0, 'her.men.f2'),
    quiz('me4', 'class10', 'The dihybrid F2 ratio is…', 'দ্বিসংকর জননে F2 অনুপাত…', [['9 : 3 : 3 : 1', '9 : 3 : 3 : 1'], ['3 : 1', '3 : 1'], ['1 : 2 : 1', '1 : 2 : 1'], ['1 : 1 : 1 : 1', '1 : 1 : 1 : 1']], 0, 'her.men.dihybrid'),
    quiz('me5', 'neet', 'Snapdragon F2 flower colours show the ratio…', 'স্ন্যাপড্রাগনের F2 ফুলের রঙের অনুপাত…', [['1 : 2 : 1', '1 : 2 : 1'], ['3 : 1', '3 : 1'], ['9 : 7', '9 : 7'], ['1 : 1', '1 : 1']], 0, 'her.men.incomplete')
  ],
  limitation: limitation('Ratios are expected values; real counts vary by chance.', 'অনুপাতগুলি প্রত্যাশিত মান; বাস্তব গণনা সম্ভাবনার কারণে আলাদা হয়।')
};

const sex = {
  id: 'sex-determination', tag: { en: 'human', bn: 'মানুষ' },
  title: { en: 'Sex determination in humans', bn: 'মানুষের লিঙ্গ নির্ধারণ' },
  lead: { en: 'The X or Y chromosome in the sperm decides whether the child is a girl or a boy.', bn: 'শুক্রাণুর X বা Y ক্রোমোজোম ঠিক করে সন্তান মেয়ে না ছেলে হবে।' },
  claims: [
    claim('her.sex.xy', 'class9', 'Humans have 23 pairs of chromosomes; one pair are sex chromosomes — XX in females and XY in males.', 'মানুষের 23 জোড়া ক্রোমোজোম আছে; এর একটি জোড়া লিঙ্গ-ক্রোমোজোম — মহিলাদের XX এবং পুরুষদের XY।', [S.NCERT_X, S.OS_BIO_SEX]),
    claim('her.sex.father', 'class9', 'All eggs carry an X chromosome; a sperm carries either X or Y, so the child\'s sex depends on the sperm, with about equal chances.', 'সব ডিম্বাণু X ক্রোমোজোম বহন করে; শুক্রাণু X অথবা Y বহন করে, তাই সন্তানের লিঙ্গ শুক্রাণুর ওপর নির্ভর করে, সম্ভাবনা প্রায় সমান।', [S.NCERT_X, S.OS_BIO_SEX]),
    claim('her.sex.other', 'class10', 'In some animals sex is set by the environment, for example by egg incubation temperature in some reptiles.', 'কিছু প্রাণীতে লিঙ্গ পরিবেশ দিয়ে নির্ধারিত হয়, যেমন কিছু সরীসৃপে ডিম ফোটানোর তাপমাত্রা দিয়ে।', [S.NCERT_X, S.OS_BIO_SEX])
  ],
  parts: [
    part('x', 'class9', '#f472b6', 'X chromosome', 'X ক্রোমোজোম', 'Carried by every egg and half the sperm.', 'প্রতিটি ডিম্বাণু ও অর্ধেক শুক্রাণু বহন করে।', 'class11-12', 'Larger, with many genes.', 'বড় এবং এতে অনেক জিন আছে।'),
    part('y', 'class9', '#38bdf8', 'Y chromosome', 'Y ক্রোমোজোম', 'Carried by half the sperm; leads to male development.', 'অর্ধেক শুক্রাণু বহন করে; পুরুষ বিকাশ ঘটায়।', 'class11-12', 'Small, with the SRY gene.', 'ছোট, এতে SRY জিন থাকে।'),
    part('egg', 'class9', '#fde68a', 'Egg', 'ডিম্বাণু', 'Always carries X.', 'সবসময় X বহন করে।', 'class10', 'Haploid: 22 + X.', 'হ্যাপ্লয়েড: 22 + X।'),
    part('sperm', 'class9', '#e2e8f0', 'Sperm', 'শুক্রাণু', 'Carries X or Y.', 'X বা Y বহন করে।', 'class10', 'Haploid: 22 + X or 22 + Y.', 'হ্যাপ্লয়েড: 22 + X অথবা 22 + Y।')
  ],
  chapters: [
    chapter('overview', 'class9', 16, '1. XX and XY', '1. XX ও XY', 'Mother XX, father XY; eggs all X, sperm half X and half Y.', 'মা XX, বাবা XY; সব ডিম্বাণু X, শুক্রাণুর অর্ধেক X ও অর্ধেক Y।'),
    chapter('cross', 'class9', 20, '2. Girl or boy?', '2. মেয়ে না ছেলে?', 'X sperm + egg → XX (girl); Y sperm + egg → XY (boy).', 'X শুক্রাণু + ডিম্বাণু → XX (মেয়ে); Y শুক্রাণু + ডিম্বাণু → XY (ছেলে)।')
  ],
  myths: [myth('class9', '"The mother decides whether the baby is a boy or a girl."', '"ছেলে না মেয়ে হবে তা মা ঠিক করেন।"', 'The egg always carries X; the father\'s sperm (X or Y) decides.', 'ডিম্বাণু সবসময় X বহন করে; বাবার শুক্রাণু (X বা Y) ঠিক করে।')],
  quiz: [
    quiz('sx1', 'class9', 'Human males have sex chromosomes…', 'পুরুষের লিঙ্গ-ক্রোমোজোম…', [['XY', 'XY'], ['XX', 'XX'], ['YY', 'YY'], ['XO', 'XO']], 0, 'her.sex.xy'),
    quiz('sx2', 'class9', 'The sex of a child is determined by…', 'সন্তানের লিঙ্গ নির্ধারণ করে…', [["The father's sperm", 'বাবার শুক্রাণু'], ["The mother's egg", 'মায়ের ডিম্বাণু'], ['Diet', 'খাদ্য'], ['Season', 'ঋতু']], 0, 'her.sex.father'),
    quiz('sx3', 'class9', 'How many pairs of chromosomes do humans have?', 'মানুষের কত জোড়া ক্রোমোজোম?', [['23', '23'], ['46', '46'], ['22', '22'], ['24', '24']], 0, 'her.sex.xy'),
    quiz('sx4', 'class10', 'In some reptiles sex depends on…', 'কিছু সরীসৃপে লিঙ্গ নির্ভর করে…', [['Incubation temperature', 'ডিম ফোটানোর তাপমাত্রার ওপর'], ['Y chromosome only', 'কেবল Y ক্রোমোজোমের ওপর'], ['Food', 'খাদ্যের ওপর'], ['Light', 'আলোর ওপর']], 0, 'her.sex.other')
  ],
  limitation: limitation('Chromosomes are drawn as letter-shaped blocks for clarity.', 'স্পষ্টতার জন্য ক্রোমোজোমকে অক্ষরের মতো ব্লকে আঁকা হয়েছে।')
};

const expression = {
  id: 'gene-expression', tag: { en: 'molecular basis', bn: 'আণবিক ভিত্তি' },
  title: { en: 'Replication and gene expression', bn: 'প্রতিলিপিকরণ ও জিন প্রকাশ' },
  lead: { en: 'DNA copies itself; genes are transcribed into RNA and translated into protein.', bn: 'DNA নিজের প্রতিলিপি তৈরি করে; জিন থেকে RNA প্রতিলিখিত হয় এবং তা প্রোটিনে অনূদিত হয়।' },
  claims: [
    claim('her.exp.copy', 'class10', 'Before a cell divides, its DNA is copied so that each daughter cell receives a full set; small copying errors create variation.', 'কোশ বিভাজনের আগে DNA-এর প্রতিলিপি তৈরি হয়, ফলে প্রতিটি অপত্য কোশ পূর্ণ সেট পায়; প্রতিলিপির ছোট ত্রুটি প্রকরণ সৃষ্টি করে।', [S.NCERT_X, S.OS_BIO_DNA]),
    claim('her.exp.semi', 'neet', 'DNA replication is semi-conservative: each new double helix keeps one old strand and one new strand (Meselson and Stahl, 1958).', 'DNA প্রতিলিপিকরণ অর্ধ-সংরক্ষণশীল: প্রতিটি নতুন দ্বি-সর্পিলে একটি পুরোনো ও একটি নতুন সূত্র থাকে (মেসেলসন ও স্টাল, 1958)।', [S.MESELSON, S.NCERT_XII_MB]),
    claim('her.exp.dogma', 'neet', 'Central dogma: DNA → (transcription) → mRNA → (translation at ribosomes) → protein; three bases form one codon.', 'কেন্দ্রীয় মতবাদ: DNA → (প্রতিলিখন) → mRNA → (রাইবোজোমে অনুবাদ) → প্রোটিন; তিনটি ক্ষারক মিলে একটি কোডন।', [S.NCERT_XII_MB, S.OS_BIO_EXPR])
  ],
  parts: [
    part('template', 'class10', '#38bdf8', 'Parent DNA', 'জনিতৃ DNA', 'Original double helix.', 'মূল দ্বি-সর্পিল।', 'neet', 'Unzipped by helicase.', 'হেলিকেজ একে খুলে দেয়।'),
    part('newstrand', 'class10', '#22c55e', 'New strand', 'নতুন সূত্র', 'Built on each old strand.', 'প্রতিটি পুরোনো সূত্রের ওপর তৈরি হয়।', 'neet', 'Made by DNA polymerase, 5′ → 3′.', 'DNA পলিমারেজ 5′ → 3′ দিকে তৈরি করে।'),
    part('mrna', 'neet', '#f472b6', 'mRNA', 'mRNA', 'Copy of a gene that leaves the nucleus.', 'জিনের প্রতিলিপি, যা নিউক্লিয়াস ছেড়ে যায়।', 'neet', 'Uses uracil instead of thymine.', 'থাইমিনের বদলে ইউরাসিল থাকে।'),
    part('ribosome', 'neet', '#fb923c', 'Ribosome and protein', 'রাইবোজোম ও প্রোটিন', 'Reads codons and joins amino acids.', 'কোডন পড়ে অ্যামাইনো অ্যাসিড জোড়ে।', 'neet', 'tRNA brings each amino acid.', 'tRNA প্রতিটি অ্যামাইনো অ্যাসিড নিয়ে আসে।')
  ],
  chapters: [
    chapter('overview', 'class10', 18, '1. Copying DNA', '1. DNA-এর প্রতিলিপি', 'The helix unzips and each strand is used to build a new partner.', 'সর্পিল খুলে যায় এবং প্রতিটি সূত্র দিয়ে নতুন সঙ্গী সূত্র তৈরি হয়।'),
    chapter('express', 'neet', 24, '2. DNA → RNA → protein', '2. DNA → RNA → প্রোটিন', 'A gene is transcribed into mRNA, which a ribosome translates into a chain of amino acids.', 'একটি জিন mRNA-তে প্রতিলিখিত হয়, যা রাইবোজোম অ্যামাইনো অ্যাসিডের শৃঙ্খলে অনুবাদ করে।')
  ],
  myths: [myth('neet', '"Replication makes one all-new DNA and keeps the old one intact."', '"প্রতিলিপিকরণে একটি সম্পূর্ণ নতুন DNA তৈরি হয় এবং পুরোনোটি অক্ষত থাকে।"', 'Each copy has one old and one new strand.', 'প্রতিটি প্রতিলিপিতে একটি পুরোনো ও একটি নতুন সূত্র থাকে।')],
  quiz: [
    quiz('ex1', 'class10', 'DNA is copied before…', 'DNA-এর প্রতিলিপি তৈরি হয়…', [['Cell division', 'কোশ বিভাজনের আগে'], ['Digestion', 'পরিপাকের আগে'], ['Breathing', 'শ্বাসের আগে'], ['Excretion', 'রেচনের আগে']], 0, 'her.exp.copy'),
    quiz('ex2', 'class10', 'Small DNA copying errors cause…', 'DNA প্রতিলিপির ছোট ত্রুটি সৃষ্টি করে…', [['Variation', 'প্রকরণ'], ['Digestion', 'পরিপাক'], ['Respiration', 'শ্বসন'], ['Nothing', 'কিছুই না']], 0, 'her.exp.copy'),
    quiz('ex3', 'class10', 'Each daughter cell gets…', 'প্রতিটি অপত্য কোশ পায়…', [['A full copy of DNA', 'DNA-এর পূর্ণ প্রতিলিপি'], ['Half the DNA', 'অর্ধেক DNA'], ['No DNA', 'কোনো DNA নয়'], ['Only RNA', 'কেবল RNA']], 0, 'her.exp.copy'),
    quiz('ex4', 'neet', 'Replication of DNA is…', 'DNA প্রতিলিপিকরণ…', [['Semi-conservative', 'অর্ধ-সংরক্ষণশীল'], ['Conservative', 'সংরক্ষণশীল'], ['Dispersive', 'বিক্ষিপ্ত'], ['Random', 'এলোমেলো']], 0, 'her.exp.semi'),
    quiz('ex5', 'neet', 'Translation takes place on…', 'অনুবাদ ঘটে…', [['Ribosomes', 'রাইবোজোমে'], ['Nucleolus', 'নিউক্লিওলাসে'], ['Golgi body', 'গলজি বস্তুতে'], ['Lysosome', 'লাইসোজোমে']], 0, 'her.exp.dogma')
  ],
  limitation: limitation('Enzymes are omitted; only a few base pairs are shown.', 'উৎসেচক বাদ দেওয়া হয়েছে; কয়েকটি ক্ষারক-জোড় দেখানো হয়েছে।')
};

export const heredityPacks = [dna, mendel, sex, expression];
