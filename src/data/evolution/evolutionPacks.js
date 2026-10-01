// Evolution bay deep-dive packs (WBBSE Class 10 Ch 4; NCERT XII Evolution for NEET). Decisions R4 and R5 apply.
import { claim, part, chapter, myth, quiz, limitation } from '../packHelpers.js';

const S = {
  NCERT_XII_EVO: { kind: 'syllabus', title: 'NCERT Biology Class 12, Evolution', url: 'https://ncert.nic.in/textbook.php' },
  WBBSE_X: { kind: 'syllabus', title: 'WBBSE Class 10 Life Science syllabus, Ch 4 Evolution and Adaptation', url: 'https://wbbse.wb.gov.in/' },
  OS_BIO_EVO: { kind: 'reference', title: 'OpenStax Biology 2e, 18.1 Understanding Evolution (CC BY 4.0)', url: 'https://openstax.org/books/biology-2e/pages/18-1-understanding-evolution' },
  OS_BIO_PRIM: { kind: 'reference', title: 'OpenStax Biology 2e, 29.5 Evolution of Primates (CC BY 4.0)', url: 'https://openstax.org/books/biology-2e/pages/29-5-evolution-of-primates' },
  SMITHSONIAN: { kind: 'official', title: 'Smithsonian National Museum of Natural History — Human Origins: Homo sapiens', url: 'https://humanorigins.si.edu/evidence/human-fossils/species/homo-sapiens' },
  HUBLIN: { kind: 'peer-reviewed', title: 'Hublin J.-J. et al. (2017) New fossils from Jebel Irhoud, Morocco and the pan-African origin of Homo sapiens. Nature 546:289–292', url: 'https://doi.org/10.1038/nature22336' },
  COOK: { kind: 'peer-reviewed', title: 'Cook L.M. et al. (2012) Selective bird predation on the peppered moth: the last experiment of Michael Majerus. Biology Letters 8:609–612', url: 'https://doi.org/10.1098/rsbl.2011.1136' },
  MILLER: { kind: 'peer-reviewed', title: 'Miller S.L. (1953) A production of amino acids under possible primitive earth conditions. Science 117:528–529', url: 'https://doi.org/10.1126/science.117.3046.528' }
};

const selection = {
  id: 'selection', tag: { en: 'mechanism', bn: 'প্রক্রিয়া' },
  title: { en: 'Variation and natural selection', bn: 'প্রকরণ ও প্রাকৃতিক নির্বাচন' },
  lead: { en: 'Individuals differ; those whose inherited traits suit the environment leave more offspring.', bn: 'জীবেরা একে অপরের থেকে আলাদা; যাদের বংশগত বৈশিষ্ট্য পরিবেশের উপযোগী, তারা বেশি অপত্য রেখে যায়।' },
  claims: [
    claim('evo.sel.darwin', 'class9', 'Natural selection (Darwin, 1859): organisms produce more offspring than can survive, offspring vary, some variation is inherited, and better-suited variants survive and reproduce more.', 'প্রাকৃতিক নির্বাচন (ডারউইন, 1859): জীব যত অপত্য উৎপন্ন করে তার সবাই বাঁচে না, অপত্যদের মধ্যে প্রকরণ থাকে, কিছু প্রকরণ বংশগত, এবং বেশি উপযোগী প্রকরণযুক্ত জীব বেশি বাঁচে ও জনন করে।', [S.WBBSE_X, S.OS_BIO_EVO]),
    claim('evo.sel.moth', 'class10', 'In polluted industrial areas of England, dark peppered moths became common because birds ate more of the conspicuous pale moths on soot-darkened trees; pale moths returned as air became cleaner.', 'ইংল্যান্ডের দূষিত শিল্পাঞ্চলে ঝুলকালি-মাখা গাছে হালকা মথ সহজে চোখে পড়ায় পাখি সেগুলি বেশি খেত, তাই কালো পেপারড মথ বেশি হয়ে ওঠে; বাতাস পরিষ্কার হলে হালকা মথ আবার ফিরে আসে।', [S.COOK, S.NCERT_XII_EVO]),
    claim('evo.sel.population', 'class11-12', 'Evolution is a change in the inherited traits of a population over generations; individuals do not evolve during their lifetime.', 'বিবর্তন হলো প্রজন্মের পর প্রজন্ম ধরে একটি জনগোষ্ঠীর বংশগত বৈশিষ্ট্যের পরিবর্তন; কোনো একক জীব তার জীবদ্দশায় বিবর্তিত হয় না।', [S.NCERT_XII_EVO, S.OS_BIO_EVO])
  ],
  parts: [
    part('pale', 'class9', '#e2e8f0', 'Pale moth', 'হালকা মথ', 'Well hidden on clean, lichen-covered bark.', 'পরিষ্কার, লাইকেন-ঢাকা গাছের ছালে লুকিয়ে থাকে।', 'class10', 'Common before industrial pollution.', 'শিল্প-দূষণের আগে বেশি দেখা যেত।'),
    part('dark', 'class9', '#334155', 'Dark moth', 'কালো মথ', 'Well hidden on soot-darkened bark.', 'ঝুলকালি-মাখা ছালে লুকিয়ে থাকে।', 'class10', 'Darkness is inherited.', 'কালো রং বংশগত।'),
    part('bark', 'class9', '#78716c', 'Tree bark', 'গাছের ছাল', 'The background that decides who is seen.', 'পটভূমি, যা ঠিক করে কাকে দেখা যাবে।', 'class10', 'Changes with air pollution.', 'বায়ুদূষণে বদলায়।'),
    part('bird', 'class9', '#f97316', 'Predator bird', 'শিকারি পাখি', 'The selecting agent.', 'নির্বাচনের কারক।', 'class11-12', 'Selection acts on phenotype.', 'নির্বাচন ফিনোটাইপের ওপর কাজ করে।')
  ],
  chapters: [
    chapter('overview', 'class9', 20, '1. Clean bark', '1. পরিষ্কার ছাল', 'On pale bark the bird spots dark moths; pale moths survive more.', 'হালকা ছালে পাখি কালো মথ দেখতে পায়; হালকা মথ বেশি বাঁচে।'),
    chapter('soot', 'class9', 22, '2. Sooty bark', '2. ঝুলকালি-মাখা ছাল', 'When bark darkens, the advantage flips and dark moths increase over generations.', 'ছাল কালো হলে সুবিধা উল্টে যায় এবং প্রজন্ম ধরে কালো মথ বাড়ে।')
  ],
  myths: [myth('class9', '"Moths turned dark because they needed to."', '"প্রয়োজন হয়েছিল বলে মথ কালো হয়ে গেল।"', 'Dark moths already existed; selection changed how common they were.', 'কালো মথ আগে থেকেই ছিল; নির্বাচন তাদের সংখ্যা বদলে দিয়েছে।')],
  quiz: [
    quiz('se1', 'class9', 'Natural selection was proposed by…', 'প্রাকৃতিক নির্বাচনের ধারণা দেন…', [['Charles Darwin', 'চার্লস ডারউইন'], ['Gregor Mendel', 'গ্রেগর মেন্ডেল'], ['Louis Pasteur', 'লুই পাস্তুর'], ['Robert Hooke', 'রবার্ট হুক']], 0, 'evo.sel.darwin'),
    quiz('se2', 'class9', 'For selection to change a population, variation must be…', 'নির্বাচনে জনগোষ্ঠী বদলাতে হলে প্রকরণ হতে হবে…', [['Inherited', 'বংশগত'], ['Acquired by exercise', 'ব্যায়ামে অর্জিত'], ['Temporary', 'অস্থায়ী'], ['Absent', 'অনুপস্থিত']], 0, 'evo.sel.darwin'),
    quiz('se3', 'class9', 'Which individuals leave more offspring?', 'কোন জীবেরা বেশি অপত্য রেখে যায়?', [['Those better suited to the environment', 'যারা পরিবেশের বেশি উপযোগী'], ['The largest always', 'সবসময় সবচেয়ে বড়রা'], ['The oldest', 'সবচেয়ে বয়স্করা'], ['All equally', 'সবাই সমান']], 0, 'evo.sel.darwin'),
    quiz('se4', 'class10', 'On soot-darkened trees, birds mostly ate…', 'ঝুলকালি-মাখা গাছে পাখি বেশি খেত…', [['Pale moths', 'হালকা মথ'], ['Dark moths', 'কালো মথ'], ['Both equally', 'দুটোই সমান'], ['Neither', 'কোনোটিই নয়']], 0, 'evo.sel.moth')
  ],
  limitation: limitation('Moths sit on a single trunk; real selection acts across whole regions.', 'মথগুলি একটি গুঁড়িতে বসানো; বাস্তবে নির্বাচন বিশাল অঞ্চল জুড়ে ঘটে।')
};

const evidence = {
  id: 'evidence', tag: { en: 'evidence', bn: 'প্রমাণ' },
  title: { en: 'Homologous organs and fossils', bn: 'সমসংস্থ অঙ্গ ও জীবাশ্ম' },
  lead: { en: 'The same bones in different limbs, and fossils in rock layers, point to common ancestry.', bn: 'বিভিন্ন অঙ্গে একই হাড় এবং শিলাস্তরের জীবাশ্ম সাধারণ পূর্বপুরুষের দিকে ইঙ্গিত করে।' },
  claims: [
    claim('evo.ev.homologous', 'class9', 'Homologous organs, such as the forelimbs of humans, whales and bats, share the same basic bones (humerus, radius–ulna, carpals, phalanges) but perform different functions.', 'সমসংস্থ অঙ্গ, যেমন মানুষ, তিমি ও বাদুড়ের অগ্রপদ, একই মৌলিক হাড় (হিউমেরাস, রেডিয়াস-আলনা, কারপাল, ফ্যালাঞ্জেস) বহন করে কিন্তু ভিন্ন কাজ করে।', [S.WBBSE_X, S.OS_BIO_EVO]),
    claim('evo.ev.analogous', 'class10', 'Analogous organs, such as the wings of birds and insects, perform the same function but have different structure and origin.', 'সমবৃত্তীয় অঙ্গ, যেমন পাখি ও পতঙ্গের ডানা, একই কাজ করে কিন্তু গঠন ও উৎপত্তি আলাদা।', [S.WBBSE_X, S.OS_BIO_EVO]),
    claim('evo.ev.archaeopteryx', 'class10', 'Archaeopteryx, a fossil about 150 million years old, had feathers and wings like a bird and teeth, claws and a long bony tail like a reptile.', 'আর্কিওপটেরিক্স নামের প্রায় 150 মিলিয়ন বছরের পুরোনো জীবাশ্মে পাখির মতো পালক ও ডানা এবং সরীসৃপের মতো দাঁত, নখ ও লম্বা হাড়ের লেজ ছিল।', [S.NCERT_XII_EVO, S.OS_BIO_EVO], { value: 150, unit: 'million years', range: [145, 152] })
  ],
  parts: [
    part('humerus', 'class9', '#f59e0b', 'Humerus', 'হিউমেরাস', 'Single upper-arm bone.', 'বাহুর ওপরের একক হাড়।', 'class10', 'Present in every tetrapod forelimb.', 'প্রতিটি চতুষ্পদীর অগ্রপদে থাকে।'),
    part('radius', 'class9', '#22c55e', 'Radius and ulna', 'রেডিয়াস ও আলনা', 'Paired forearm bones.', 'প্রকোষ্ঠের জোড়া হাড়।', 'class10', 'Shortened in whales.', 'তিমিতে ছোট।'),
    part('digits', 'class9', '#38bdf8', 'Carpals and phalanges', 'কারপাল ও ফ্যালাঞ্জেস', 'Wrist and finger bones.', 'কবজি ও আঙুলের হাড়।', 'class10', 'Very long in bats to support the wing.', 'বাদুড়ে ডানা ধরে রাখতে খুব লম্বা।'),
    part('membrane', 'class10', '#a78bfa', 'Wing membrane', 'ডানার পর্দা', 'Skin stretched between bat fingers.', 'বাদুড়ের আঙুলের মাঝে টানা চামড়া।', 'class11-12', 'An adaptation, not a new bone set.', 'এটি অভিযোজন, নতুন হাড় নয়।')
  ],
  chapters: [
    chapter('overview', 'class9', 20, '1. Three forelimbs', '1. তিনটি অগ্রপদ', 'Human arm, whale flipper and bat wing light up bone by bone.', 'মানুষের হাত, তিমির ফ্লিপার ও বাদুড়ের ডানা হাড় ধরে ধরে আলোকিত হয়।'),
    chapter('compare', 'class10', 18, '2. Same plan, new jobs', '2. একই নকশা, নতুন কাজ', 'The bones stretch or shrink to grasp, swim or fly.', 'ধরা, সাঁতার বা ওড়ার জন্য হাড় লম্বা বা ছোট হয়।')
  ],
  myths: [myth('class9', '"Similar function means close relatives."', '"একই কাজ মানেই নিকট আত্মীয়।"', 'Bird and insect wings do the same job but evolved separately (analogous).', 'পাখি ও পতঙ্গের ডানা একই কাজ করে কিন্তু আলাদাভাবে বিবর্তিত (সমবৃত্তীয়)।')],
  quiz: [
    quiz('ev1', 'class9', 'Human arm and whale flipper are…', 'মানুষের হাত ও তিমির ফ্লিপার…', [['Homologous organs', 'সমসংস্থ অঙ্গ'], ['Analogous organs', 'সমবৃত্তীয় অঙ্গ'], ['Vestigial organs', 'নিষ্ক্রিয় অঙ্গ'], ['Unrelated', 'সম্পর্কহীন']], 0, 'evo.ev.homologous'),
    quiz('ev2', 'class9', 'Homologous organs share…', 'সমসংস্থ অঙ্গে মিল থাকে…', [['Basic bone structure', 'মৌলিক হাড়ের গঠনে'], ['Function only', 'কেবল কাজে'], ['Colour', 'রঙে'], ['Size', 'আকারে']], 0, 'evo.ev.homologous'),
    quiz('ev3', 'class9', 'The single upper-arm bone is the…', 'বাহুর ওপরের একক হাড়…', [['Humerus', 'হিউমেরাস'], ['Femur', 'ফিমার'], ['Ulna', 'আলনা'], ['Tibia', 'টিবিয়া']], 0, 'evo.ev.homologous'),
    quiz('ev4', 'class10', 'Bird and insect wings are…', 'পাখি ও পতঙ্গের ডানা…', [['Analogous', 'সমবৃত্তীয়'], ['Homologous', 'সমসংস্থ'], ['Vestigial', 'নিষ্ক্রিয়'], ['Identical', 'অভিন্ন']], 0, 'evo.ev.analogous'),
    quiz('ev5', 'class10', 'Archaeopteryx links reptiles with…', 'আর্কিওপটেরিক্স সরীসৃপকে যুক্ত করে…', [['Birds', 'পাখির সঙ্গে'], ['Fish', 'মাছের সঙ্গে'], ['Mammals', 'স্তন্যপায়ীর সঙ্গে'], ['Insects', 'পতঙ্গের সঙ্গে']], 0, 'evo.ev.archaeopteryx')
  ],
  limitation: limitation('Bones are simplified rods; proportions are approximate.', 'হাড়গুলি সরল দণ্ড; অনুপাত আনুমানিক।')
};

const human = {
  id: 'human-evolution', tag: { en: 'humans', bn: 'মানুষ' },
  title: { en: 'Human evolution: a branching tree', bn: 'মানুষের বিবর্তন: শাখাযুক্ত বৃক্ষ' },
  lead: { en: 'Humans and chimpanzees share an ancestor; human evolution is a bush, not a ladder.', bn: 'মানুষ ও শিম্পাঞ্জির একটি সাধারণ পূর্বপুরুষ আছে; মানুষের বিবর্তন একটি ঝোপের মতো, মই নয়।' },
  claims: [
    claim('evo.hu.ancestor', 'class9', 'Humans did not evolve from chimpanzees; both lineages descend from a common ancestor that lived roughly 6–7 million years ago.', 'মানুষ শিম্পাঞ্জি থেকে বিবর্তিত হয়নি; দুটি বংশধারাই প্রায় 6–7 মিলিয়ন বছর আগের এক সাধারণ পূর্বপুরুষ থেকে এসেছে।', [S.SMITHSONIAN, S.OS_BIO_PRIM]),
    claim('evo.hu.sapiens', 'class10', 'The oldest known fossils of our species, Homo sapiens, are about 300,000 years old, from Jebel Irhoud in Morocco, Africa.', 'আমাদের প্রজাতি হোমো স্যাপিয়েন্স-এর সবচেয়ে পুরোনো জানা জীবাশ্ম প্রায় 300,000 বছরের পুরোনো, আফ্রিকার মরক্কোর জেবেল ইরহুদ থেকে পাওয়া।', [S.HUBLIN, S.SMITHSONIAN], { value: 300000, unit: 'years', range: [280000, 350000] }),
    claim('evo.hu.bush', 'class11-12', 'Several hominin species, such as Homo neanderthalensis and Homo sapiens, lived at the same time, so the human family tree branches.', 'একাধিক হোমিনিন প্রজাতি, যেমন নিয়ানডারথাল ও হোমো স্যাপিয়েন্স, একই সময়ে বাস করত, তাই মানব-পরিবারের বৃক্ষ শাখাযুক্ত।', [S.SMITHSONIAN, S.NCERT_XII_EVO])
  ],
  parts: [
    part('root', 'class9', '#a8a29e', 'Common ancestor', 'সাধারণ পূর্বপুরুষ', 'Shared by chimpanzees and humans.', 'শিম্পাঞ্জি ও মানুষের সাধারণ।', 'class10', 'About 6–7 million years ago.', 'প্রায় 6–7 মিলিয়ন বছর আগে।'),
    part('chimp', 'class9', '#f97316', 'Chimpanzee branch', 'শিম্পাঞ্জি শাখা', 'Our closest living relatives.', 'আমাদের নিকটতম জীবিত আত্মীয়।', 'class11-12', 'Evolved for as long as we have.', 'আমাদের মতোই দীর্ঘ সময় ধরে বিবর্তিত।'),
    part('hominin', 'class9', '#facc15', 'Extinct hominins', 'বিলুপ্ত হোমিনিন', 'Side branches that died out.', 'যে পার্শ্বশাখাগুলি বিলুপ্ত হয়েছে।', 'class11-12', 'Includes Australopithecus and Homo erectus.', 'অস্ট্রালোপিথেকাস ও হোমো ইরেক্টাস এর মধ্যে পড়ে।'),
    part('sapiens', 'class9', '#22c55e', 'Homo sapiens', 'হোমো স্যাপিয়েন্স', 'The only surviving human species.', 'একমাত্র টিকে থাকা মানব প্রজাতি।', 'class10', 'Arose in Africa.', 'আফ্রিকায় উদ্ভূত।')
  ],
  chapters: [
    chapter('overview', 'class9', 22, '1. Grow the tree', '1. বৃক্ষ গজানো', 'From one ancestor the tree splits into chimpanzee and human lines, and the human line branches again.', 'একটি পূর্বপুরুষ থেকে বৃক্ষ শিম্পাঞ্জি ও মানব শাখায় ভাগ হয়, এবং মানব শাখা আবার বিভক্ত হয়।'),
    chapter('prune', 'class10', 16, '2. Only one survives', '2. টিকে থাকে একটিই', 'Side branches end in extinction; only Homo sapiens remains.', 'পার্শ্বশাখাগুলি বিলুপ্তিতে শেষ হয়; কেবল হোমো স্যাপিয়েন্স টিকে আছে।')
  ],
  myths: [myth('class9', '"Humans evolved from today\'s monkeys."', '"আজকের বানর থেকে মানুষ এসেছে।"', 'We share ancestors with living apes; they are our cousins, not our ancestors.', 'জীবিত বনমানুষের সঙ্গে আমাদের পূর্বপুরুষ এক; তারা আমাদের তুতো ভাই, পূর্বপুরুষ নয়।')],
  quiz: [
    quiz('hu1', 'class9', 'Humans and chimpanzees…', 'মানুষ ও শিম্পাঞ্জি…', [['Share a common ancestor', 'একটি সাধারণ পূর্বপুরুষ ভাগ করে'], ['Humans came from chimpanzees', 'মানুষ শিম্পাঞ্জি থেকে এসেছে'], ['Are unrelated', 'সম্পর্কহীন'], ['Are the same species', 'একই প্রজাতি']], 0, 'evo.hu.ancestor'),
    quiz('hu2', 'class9', 'The common ancestor lived roughly…', 'সাধারণ পূর্বপুরুষ বাস করত প্রায়…', [['6–7 million years ago', '6–7 মিলিয়ন বছর আগে'], ['6,000 years ago', '6,000 বছর আগে'], ['600 million years ago', '600 মিলিয়ন বছর আগে'], ['60 years ago', '60 বছর আগে']], 0, 'evo.hu.ancestor'),
    quiz('hu3', 'class9', 'Human evolution is best drawn as a…', 'মানুষের বিবর্তন সবচেয়ে ভালো আঁকা যায়…', [['Branching tree', 'শাখাযুক্ত বৃক্ষ হিসেবে'], ['Straight ladder', 'সোজা মই হিসেবে'], ['Circle', 'বৃত্ত হিসেবে'], ['Single line', 'একক রেখা হিসেবে']], 0, 'evo.hu.ancestor'),
    quiz('hu4', 'class10', 'The oldest Homo sapiens fossils come from…', 'হোমো স্যাপিয়েন্স-এর প্রাচীনতম জীবাশ্ম পাওয়া গেছে…', [['Africa', 'আফ্রিকায়'], ['Europe', 'ইউরোপে'], ['Australia', 'অস্ট্রেলিয়ায়'], ['South America', 'দক্ষিণ আমেরিকায়']], 0, 'evo.hu.sapiens')
  ],
  limitation: limitation('Only a few branches are drawn; dates are approximate.', 'কয়েকটি শাখাই আঁকা হয়েছে; সময় আনুমানিক।')
};

const origin = {
  id: 'origin-of-life', tag: { en: 'origin', bn: 'উৎপত্তি' },
  title: { en: 'Origin of life: Miller–Urey experiment', bn: 'প্রাণের উৎপত্তি: মিলার-উরে পরীক্ষা' },
  lead: { en: 'Electric sparks in a simple gas mixture produced amino acids — evidence that life\'s building blocks can form without life.', bn: 'সরল গ্যাস-মিশ্রণে বৈদ্যুতিক স্ফুলিঙ্গ অ্যামাইনো অ্যাসিড তৈরি করেছিল — প্রমাণ যে প্রাণ ছাড়াই প্রাণের উপাদান তৈরি হতে পারে।' },
  claims: [
    claim('evo.or.miller', 'class11-12', 'In 1953 Stanley Miller passed electric sparks through methane, ammonia, hydrogen and water vapour in a closed apparatus and obtained amino acids.', '1953 সালে স্ট্যানলি মিলার একটি বদ্ধ যন্ত্রে মিথেন, অ্যামোনিয়া, হাইড্রোজেন ও জলীয় বাষ্পের মধ্যে বৈদ্যুতিক স্ফুলিঙ্গ চালিয়ে অ্যামাইনো অ্যাসিড পান।', [S.MILLER, S.NCERT_XII_EVO]),
    claim('evo.or.limits', 'neet', 'The experiment shows that simple organic molecules can form abiotically; it does not create life, and the exact composition of the early atmosphere is still debated.', 'পরীক্ষাটি দেখায় সরল জৈব অণু অজৈবভাবে তৈরি হতে পারে; এটি প্রাণ সৃষ্টি করে না, এবং আদি বায়ুমণ্ডলের সঠিক গঠন নিয়ে এখনও বিতর্ক আছে।', [S.OS_BIO_EVO, S.NCERT_XII_EVO])
  ],
  parts: [
    part('flask', 'class11-12', '#38bdf8', 'Boiling water flask', 'ফুটন্ত জলের ফ্লাস্ক', 'Represents the early ocean.', 'আদি সমুদ্রের প্রতিনিধি।', 'neet', 'Supplies water vapour.', 'জলীয় বাষ্প জোগায়।'),
    part('chamber', 'class11-12', '#a78bfa', 'Gas chamber', 'গ্যাস-কক্ষ', 'Methane, ammonia and hydrogen.', 'মিথেন, অ্যামোনিয়া ও হাইড্রোজেন।', 'neet', 'A model of a reducing atmosphere.', 'বিজারক বায়ুমণ্ডলের মডেল।'),
    part('spark', 'class11-12', '#facc15', 'Electrodes', 'তড়িৎদ্বার', 'Sparks imitate lightning.', 'স্ফুলিঙ্গ বজ্রপাতের অনুকরণ।', 'neet', 'Energy source for reactions.', 'বিক্রিয়ার শক্তির উৎস।'),
    part('trap', 'class11-12', '#22c55e', 'Condenser and trap', 'ঘনীভবক ও সংগ্রাহক', 'Collects products such as amino acids.', 'অ্যামাইনো অ্যাসিডের মতো উৎপাদ জমা করে।', 'neet', 'Analysed by chromatography.', 'ক্রোমাটোগ্রাফি দিয়ে বিশ্লেষণ করা হয়।')
  ],
  chapters: [
    chapter('overview', 'class11-12', 20, '1. Spark the gases', '1. গ্যাসে স্ফুলিঙ্গ', 'Water boils, gases circulate past the sparks, and droplets collect in the trap.', 'জল ফোটে, গ্যাস স্ফুলিঙ্গের পাশ দিয়ে ঘোরে, এবং ফোঁটা সংগ্রাহকে জমে।'),
    chapter('products', 'neet', 16, '2. What it does and does not show', '2. কী দেখায়, কী দেখায় না', 'Amino acids appear in the trap — building blocks, not living cells.', 'সংগ্রাহকে অ্যামাইনো অ্যাসিড আসে — উপাদান, জীবিত কোশ নয়।')
  ],
  myths: [myth('class11-12', '"Miller created life in a flask."', '"মিলার ফ্লাস্কে প্রাণ সৃষ্টি করেছিলেন।"', 'Only simple organic molecules formed.', 'কেবল সরল জৈব অণু তৈরি হয়েছিল।')],
  quiz: [
    quiz('or1', 'class11-12', 'The Miller experiment produced…', 'মিলারের পরীক্ষায় তৈরি হয়েছিল…', [['Amino acids', 'অ্যামাইনো অ্যাসিড'], ['Living cells', 'জীবিত কোশ'], ['DNA', 'DNA'], ['Bacteria', 'ব্যাকটেরিয়া']], 0, 'evo.or.miller'),
    quiz('or2', 'class11-12', 'Electric sparks imitated…', 'বৈদ্যুতিক স্ফুলিঙ্গ অনুকরণ করেছিল…', [['Lightning', 'বজ্রপাত'], ['Sunlight only', 'কেবল সূর্যালোক'], ['Earthquakes', 'ভূমিকম্প'], ['Rain', 'বৃষ্টি']], 0, 'evo.or.miller'),
    quiz('or3', 'class11-12', 'Which gas was NOT in the mixture?', 'কোন গ্যাস মিশ্রণে ছিল না?', [['Free oxygen', 'মুক্ত অক্সিজেন'], ['Methane', 'মিথেন'], ['Ammonia', 'অ্যামোনিয়া'], ['Hydrogen', 'হাইড্রোজেন']], 0, 'evo.or.miller'),
    quiz('or4', 'neet', 'The experiment shows that…', 'পরীক্ষাটি দেখায়…', [['Organic molecules can form abiotically', 'জৈব অণু অজৈবভাবে তৈরি হতে পারে'], ['Life arose in 1953', '1953 সালে প্রাণ এসেছে'], ['The early atmosphere is known exactly', 'আদি বায়ুমণ্ডল সঠিকভাবে জানা'], ['Cells form in a week', 'এক সপ্তাহে কোশ তৈরি হয়']], 0, 'evo.or.limits')
  ],
  limitation: limitation('Glassware is simplified; the real run lasted about a week.', 'কাচের যন্ত্র সরল করা হয়েছে; আসল পরীক্ষা প্রায় এক সপ্তাহ চলেছিল।')
};

export const evolutionPacks = [selection, evidence, human, origin];
