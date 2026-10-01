// Respiration bay deep-dive packs (docs/bays/RESPIRATION_MASTERPLAN.md).
// Breathing & Exchange of Gases is in NEET; plant gas exchange stops at Class 11–12.
import { claim, part, chapter, myth, quiz, limitation } from '../packHelpers.js';

const S = {
  NCERT_X: { kind: 'syllabus', title: 'NCERT Science Class 10 (Reprint 2026-27), Ch 5 Life Processes — Respiration', url: 'https://ncert.nic.in/textbook/pdf/jesc105.pdf' },
  NCERT_XI_BR: { kind: 'syllabus', title: 'NCERT Biology Class 11, Breathing and Exchange of Gases', url: 'https://ncert.nic.in/textbook.php' },
  NCERT_XI_RP: { kind: 'syllabus', title: 'NCERT Biology Class 11, Respiration in Plants', url: 'https://ncert.nic.in/textbook.php' },
  OS_AP_RESP: { kind: 'reference', title: 'OpenStax Anatomy & Physiology 2e, 22.3 The Process of Breathing (CC BY 4.0)', url: 'https://openstax.org/books/anatomy-and-physiology-2e/pages/22-3-the-process-of-breathing' },
  OS_AP_GAS: { kind: 'reference', title: 'OpenStax Anatomy & Physiology 2e, 22.4 Gas Exchange (CC BY 4.0)', url: 'https://openstax.org/books/anatomy-and-physiology-2e/pages/22-4-gas-exchange' },
  OS_BIO_CR: { kind: 'reference', title: 'OpenStax Biology 2e, Ch 7 Cellular Respiration (CC BY 4.0)', url: 'https://openstax.org/books/biology-2e/pages/7-introduction' },
  OS_BIO_LEAF: { kind: 'reference', title: 'OpenStax Biology 2e, 30.4 Leaves — stomata and gas exchange (CC BY 4.0)', url: 'https://openstax.org/books/biology-2e/pages/30-4-leaves' }
};

const alveoli = {
  id: 'alveoli', tag: { en: 'organ', bn: 'অঙ্গ' },
  title: { en: 'Alveoli and gas exchange', bn: 'বায়ুথলি ও গ্যাস বিনিময়' },
  lead: { en: 'Millions of tiny air sacs where oxygen enters blood and carbon dioxide leaves.', bn: 'লক্ষ লক্ষ ক্ষুদ্র বায়ুথলি, যেখানে অক্সিজেন রক্তে ঢোকে ও কার্বন ডাইঅক্সাইড বেরিয়ে যায়।' },
  claims: [
    claim('res.alv.exchange', 'class9', 'In the lungs, air passages end in balloon-like alveoli surrounded by blood capillaries; oxygen diffuses into the blood and carbon dioxide diffuses out.', 'ফুসফুসে শ্বাসপথ বেলুনের মতো বায়ুথলিতে শেষ হয়, যাদের ঘিরে থাকে রক্তজালক; অক্সিজেন ব্যাপিত হয়ে রক্তে যায় এবং কার্বন ডাইঅক্সাইড বেরিয়ে আসে।', [S.NCERT_X, S.OS_AP_GAS]),
    claim('res.alv.area', 'class10', 'If all the alveoli were spread out, they would cover about 80 m².', 'সব বায়ুথলি বিছিয়ে দিলে প্রায় 80 m² জায়গা জুড়বে।', [S.NCERT_X, S.OS_AP_GAS], { value: 80, unit: 'm²', range: [70, 80] }),
    claim('res.alv.hb', 'class10', 'Haemoglobin in red blood cells has a high affinity for oxygen and carries it; carbon dioxide is more soluble and is mostly carried dissolved in blood.', 'লোহিত কণিকার হিমোগ্লোবিনের অক্সিজেনের প্রতি তীব্র আসক্তি, তাই এটি অক্সিজেন বহন করে; কার্বন ডাইঅক্সাইড বেশি দ্রাব্য, তাই বেশিরভাগই রক্তে দ্রবীভূত হয়ে চলে।', [S.NCERT_X, S.OS_AP_GAS]),
    claim('res.alv.partial', 'neet', 'Gases move by diffusion down partial-pressure gradients: alveolar pO2 ≈ 104 mm Hg vs ≈ 40 mm Hg in deoxygenated blood; pCO2 ≈ 45 mm Hg in blood vs ≈ 40 mm Hg in alveoli.', 'গ্যাস আংশিক চাপের নতিমাত্রা অনুযায়ী ব্যাপিত হয়: বায়ুথলিতে pO2 ≈ 104 mm Hg, কার্বন ডাইঅক্সাইডযুক্ত রক্তে ≈ 40 mm Hg; রক্তে pCO2 ≈ 45 mm Hg, বায়ুথলিতে ≈ 40 mm Hg।', [S.NCERT_XI_BR, S.OS_AP_GAS])
  ],
  parts: [
    part('alveolus', 'class9', '#f9a8d4', 'Alveoli', 'বায়ুথলি (Alveoli)', 'Tiny thin-walled air sacs.', 'পাতলা প্রাচীরের ক্ষুদ্র বায়ুথলি।', 'class11-12', 'The wall is a single layer of flat cells.', 'প্রাচীরটি একস্তর চ্যাপ্টা কোশ দিয়ে তৈরি।'),
    part('bronchiole', 'class9', '#e2e8f0', 'Bronchiole', 'ক্ষুদ্র শ্বাসনালি (Bronchiole)', 'Small air tube leading to the alveoli.', 'বায়ুথলিতে যাওয়ার সরু বায়ুনল।', 'class10', 'Trachea → bronchi → bronchioles → alveoli.', 'শ্বাসনালি → ব্রঙ্কাই → ব্রঙ্কিওল → বায়ুথলি।'),
    part('capillary', 'class9', '#ef4444', 'Capillary network', 'রক্তজালক', 'Blood vessels wrapped around each alveolus.', 'প্রতিটি বায়ুথলিকে জড়িয়ে থাকা রক্তবাহ।', 'class10', 'Blood arrives low in oxygen and leaves rich in oxygen.', 'রক্ত কম অক্সিজেন নিয়ে আসে এবং বেশি অক্সিজেন নিয়ে বেরিয়ে যায়।'),
    part('gas', 'class10', '#22d3ee', 'O2 and CO2', 'O2 ও CO2', 'Cyan: oxygen in; grey: carbon dioxide out.', 'নীলাভ: অক্সিজেন ভেতরে; ধূসর: কার্বন ডাইঅক্সাইড বাইরে।', 'neet', 'Each moves from higher to lower partial pressure.', 'প্রতিটি উচ্চ থেকে নিম্ন আংশিক চাপের দিকে যায়।')
  ],
  chapters: [
    chapter('overview', 'class9', 14, '1. A bunch of grapes', '1. আঙুরের থোকা', 'Bronchioles end in clusters of alveoli covered with capillaries.', 'ব্রঙ্কিওল রক্তজালকে ঢাকা বায়ুথলির থোকায় শেষ হয়।'),
    chapter('exchange', 'class9', 20, '2. Swap the gases', '2. গ্যাসের অদলবদল', 'Oxygen diffuses into the blood while carbon dioxide diffuses into the alveoli.', 'অক্সিজেন রক্তে এবং কার্বন ডাইঅক্সাইড বায়ুথলিতে ব্যাপিত হয়।')
  ],
  myths: [myth('class9', '"We breathe out only carbon dioxide."', '"আমরা কেবল কার্বন ডাইঅক্সাইড ত্যাগ করি।"', 'Exhaled air is still mostly nitrogen and has about 16% oxygen.', 'নিঃশ্বাসের বায়ুতে এখনও বেশিরভাগ নাইট্রোজেন এবং প্রায় 16% অক্সিজেন থাকে।')],
  quiz: [
    quiz('al1', 'class9', 'Gas exchange in the lungs happens in the…', 'ফুসফুসে গ্যাস বিনিময় ঘটে…', [['Alveoli', 'বায়ুথলিতে'], ['Trachea', 'শ্বাসনালিতে'], ['Nose', 'নাকে'], ['Diaphragm', 'মধ্যচ্ছদায়']], 0, 'res.alv.exchange'),
    quiz('al2', 'class9', 'Gases cross the alveolar wall by…', 'বায়ুথলির প্রাচীর দিয়ে গ্যাস যায়…', [['Diffusion', 'ব্যাপনের মাধ্যমে'], ['Digestion', 'পরিপাকের মাধ্যমে'], ['Filtration', 'পরিস্রাবণের মাধ্যমে'], ['Peristalsis', 'ক্রমসংকোচনের মাধ্যমে']], 0, 'res.alv.exchange'),
    quiz('al3', 'class9', 'Alveoli are surrounded by…', 'বায়ুথলিকে ঘিরে থাকে…', [['Blood capillaries', 'রক্তজালক'], ['Bones', 'অস্থি'], ['Villi', 'ভিলাই'], ['Nerves only', 'কেবল স্নায়ু']], 0, 'res.alv.exchange'),
    quiz('al4', 'class10', 'Spread out, the alveoli would cover about…', 'বিছিয়ে দিলে বায়ুথলি জুড়বে প্রায়…', [['80 m²', '80 m²'], ['8 m²', '8 m²'], ['800 m²', '800 m²'], ['1 m²', '1 m²']], 0, 'res.alv.area'),
    quiz('al5', 'neet', 'Alveolar pO2 is about…', 'বায়ুথলিতে pO2 প্রায়…', [['104 mm Hg', '104 mm Hg'], ['40 mm Hg', '40 mm Hg'], ['760 mm Hg', '760 mm Hg'], ['10 mm Hg', '10 mm Hg']], 0, 'res.alv.partial')
  ],
  limitation: limitation('Only a few alveoli are shown; gas molecules are drawn as large dots.', 'কয়েকটি বায়ুথলি দেখানো হয়েছে; গ্যাসের অণুকে বড় বিন্দু হিসেবে আঁকা হয়েছে।')
};

const breathing = {
  id: 'breathing', tag: { en: 'mechanism', bn: 'কৌশল' },
  title: { en: 'Breathing mechanism', bn: 'শ্বাসক্রিয়ার কৌশল' },
  lead: { en: 'The diaphragm and rib muscles change chest volume, so air flows in and out.', bn: 'মধ্যচ্ছদা ও পঞ্জরাস্থির পেশি বক্ষের আয়তন বদলায়, ফলে বায়ু ভেতরে ঢোকে ও বেরোয়।' },
  claims: [
    claim('res.brt.inhale', 'class9', 'When we breathe in, the ribs are lifted and the diaphragm flattens; the chest cavity becomes larger and air is sucked into the lungs.', 'শ্বাস নেওয়ার সময় পঞ্জরাস্থি ওপরে ওঠে ও মধ্যচ্ছদা চ্যাপ্টা হয়; বক্ষগহ্বর বড় হয় এবং বায়ু ফুসফুসে টেনে নেওয়া হয়।', [S.NCERT_X, S.OS_AP_RESP]),
    claim('res.brt.residual', 'class10', 'The lungs always hold some air (residual volume), so there is time for oxygen to be absorbed and carbon dioxide released.', 'ফুসফুসে সবসময় কিছু বায়ু থাকে (অবশিষ্ট আয়তন), ফলে অক্সিজেন শোষণ ও কার্বন ডাইঅক্সাইড ত্যাগের সময় পাওয়া যায়।', [S.NCERT_X, S.OS_AP_RESP]),
    claim('res.brt.rate', 'neet', 'A healthy adult breathes 12–16 times per minute; the tidal volume is about 500 mL.', 'সুস্থ প্রাপ্তবয়স্ক মিনিটে 12–16 বার শ্বাস নেয়; জোয়ার আয়তন প্রায় 500 mL।', [S.NCERT_XI_BR, S.OS_AP_RESP], { value: 14, unit: 'breaths/min', range: [12, 16] })
  ],
  parts: [
    part('diaphragm', 'class9', '#fb7185', 'Diaphragm', 'মধ্যচ্ছদা (Diaphragm)', 'Dome-shaped muscle under the lungs.', 'ফুসফুসের নিচে গম্বুজাকার পেশি।', 'class10', 'Contracts and flattens during inhalation.', 'শ্বাস গ্রহণের সময় সংকুচিত হয়ে চ্যাপ্টা হয়।'),
    part('ribs', 'class9', '#f5f5f4', 'Ribs', 'পঞ্জরাস্থি (Ribs)', 'Bony cage protecting the lungs.', 'ফুসফুস রক্ষাকারী অস্থির খাঁচা।', 'neet', 'External intercostal muscles lift them up and out.', 'বহিঃস্থ ইন্টারকস্টাল পেশি এদের ওপরে ও বাইরে তোলে।'),
    part('lung', 'class9', '#f9a8d4', 'Lungs', 'ফুসফুস', 'Expand and shrink with the chest.', 'বক্ষের সঙ্গে প্রসারিত ও সংকুচিত হয়।', 'class10', 'They follow the chest wall passively.', 'এরা নিষ্ক্রিয়ভাবে বক্ষপ্রাচীরকে অনুসরণ করে।'),
    part('airflow', 'class10', '#22d3ee', 'Airflow', 'বায়ুপ্রবাহ', 'Air moving in or out.', 'ভেতরে বা বাইরে চলা বায়ু।', 'neet', 'Air flows from higher to lower pressure.', 'বায়ু উচ্চ থেকে নিম্ন চাপের দিকে যায়।')
  ],
  chapters: [
    chapter('overview', 'class9', 14, '1. The chest', '1. বক্ষ', 'Lungs sit in a cage of ribs, with the dome of the diaphragm below.', 'ফুসফুস পঞ্জরাস্থির খাঁচায় থাকে, নিচে মধ্যচ্ছদার গম্বুজ।'),
    chapter('cycle', 'class9', 20, '2. In and out', '2. ভেতরে ও বাইরে', 'Diaphragm down and ribs up: air in. Diaphragm up and ribs down: air out.', 'মধ্যচ্ছদা নিচে, পঞ্জরাস্থি ওপরে: বায়ু ভেতরে। মধ্যচ্ছদা ওপরে, পঞ্জরাস্থি নিচে: বায়ু বাইরে।')
  ],
  myths: [myth('class10', '"The lungs pull air in by themselves."', '"ফুসফুস নিজেই বায়ু টেনে নেয়।"', 'Lungs have no muscle for this; the diaphragm and rib muscles do the work.', 'এর জন্য ফুসফুসে পেশি নেই; মধ্যচ্ছদা ও পঞ্জরাস্থির পেশি কাজটি করে।')],
  quiz: [
    quiz('bt1', 'class9', 'During inhalation the diaphragm…', 'শ্বাস গ্রহণের সময় মধ্যচ্ছদা…', [['Flattens', 'চ্যাপ্টা হয়'], ['Rises', 'ওপরে ওঠে'], ['Disappears', 'অদৃশ্য হয়'], ['Does not move', 'নড়ে না']], 0, 'res.brt.inhale'),
    quiz('bt2', 'class9', 'When the chest cavity enlarges, air…', 'বক্ষগহ্বর বড় হলে বায়ু…', [['Enters the lungs', 'ফুসফুসে ঢোকে'], ['Leaves the lungs', 'ফুসফুস থেকে বেরোয়'], ['Stops moving', 'চলা থামায়'], ['Turns to water', 'জলে পরিণত হয়']], 0, 'res.brt.inhale'),
    quiz('bt3', 'class9', 'During inhalation the ribs…', 'শ্বাস গ্রহণের সময় পঞ্জরাস্থি…', [['Are lifted', 'ওপরে ওঠে'], ['Are lowered', 'নিচে নামে'], ['Break', 'ভাঙে'], ['Stay still', 'স্থির থাকে']], 0, 'res.brt.inhale'),
    quiz('bt4', 'neet', 'Normal tidal volume is about…', 'স্বাভাবিক জোয়ার আয়তন প্রায়…', [['500 mL', '500 mL'], ['50 mL', '50 mL'], ['5 L', '5 L'], ['1500 mL', '1500 mL']], 0, 'res.brt.rate')
  ],
  limitation: limitation('Rib and diaphragm movements are exaggerated.', 'পঞ্জরাস্থি ও মধ্যচ্ছদার চলন অতিরঞ্জিত করা হয়েছে।')
};

const cellular = {
  id: 'cellular-respiration', tag: { en: 'cell', bn: 'কোশ' },
  title: { en: 'Cellular respiration', bn: 'কোশীয় শ্বসন' },
  lead: { en: 'Glucose is broken down in steps to release energy as ATP — with or without oxygen.', bn: 'গ্লুকোজ ধাপে ধাপে ভেঙে ATP রূপে শক্তি মুক্ত হয় — অক্সিজেনের উপস্থিতিতে বা অনুপস্থিতিতে।' },
  claims: [
    claim('res.cel.pyruvate', 'class9', 'The first step, breaking glucose (6 carbon) into pyruvate (3 carbon), happens in the cytoplasm.', 'প্রথম ধাপে, গ্লুকোজ (6 কার্বন) ভেঙে পাইরুভেট (3 কার্বন) তৈরি হয় সাইটোপ্লাজমে।', [S.NCERT_X, S.OS_BIO_CR]),
    claim('res.cel.aerobic', 'class9', 'With oxygen, pyruvate is broken down in the mitochondria into carbon dioxide and water, releasing much more energy (aerobic respiration).', 'অক্সিজেনের উপস্থিতিতে মাইটোকন্ড্রিয়ায় পাইরুভেট ভেঙে কার্বন ডাইঅক্সাইড ও জল তৈরি হয় এবং অনেক বেশি শক্তি মুক্ত হয় (সবাত শ্বসন)।', [S.NCERT_X, S.OS_BIO_CR]),
    claim('res.cel.anaerobic', 'class10', 'Without oxygen, yeast converts pyruvate to ethanol and carbon dioxide; during heavy exercise our muscles convert it to lactic acid, which can cause cramps.', 'অক্সিজেনের অনুপস্থিতিতে ঈস্ট পাইরুভেটকে ইথানল ও কার্বন ডাইঅক্সাইডে পরিণত করে; ভারী ব্যায়ামের সময় আমাদের পেশি একে ল্যাকটিক অ্যাসিডে পরিণত করে, যা পেশিতে টান ধরাতে পারে।', [S.NCERT_X, S.OS_BIO_CR]),
    claim('res.cel.atp', 'class10', 'Energy released in respiration is used to make ATP, the energy currency of the cell.', 'শ্বসনে মুক্ত শক্তি ATP তৈরিতে ব্যবহৃত হয়, যা কোশের শক্তি-মুদ্রা।', [S.NCERT_X, S.OS_BIO_CR]),
    claim('res.cel.glycolysis', 'class11-12', 'Glycolysis gives a net gain of 2 ATP per glucose; aerobic respiration as a whole yields far more (NCERT counts 38; modern measured estimates are about 30–32).', 'গ্লাইকোলাইসিসে প্রতি গ্লুকোজে নিট 2 ATP লাভ হয়; সম্পূর্ণ সবাত শ্বসনে অনেক বেশি পাওয়া যায় (NCERT অনুযায়ী 38; আধুনিক পরিমাপে প্রায় 30–32)।', [S.NCERT_XI_RP, S.OS_BIO_CR])
  ],
  parts: [
    part('glucose', 'class9', '#facc15', 'Glucose', 'গ্লুকোজ', 'The fuel: a 6-carbon sugar.', 'জ্বালানি: 6 কার্বনের শর্করা।', 'class10', 'Comes from digested food.', 'পরিপাক হওয়া খাদ্য থেকে আসে।'),
    part('cytoplasm', 'class9', '#bae6fd', 'Cytoplasm', 'সাইটোপ্লাজম', 'Where glucose is split into pyruvate.', 'যেখানে গ্লুকোজ ভেঙে পাইরুভেট হয়।', 'class11-12', 'This step is called glycolysis.', 'এই ধাপকে গ্লাইকোলাইসিস বলে।'),
    part('mito', 'class9', '#fb923c', 'Mitochondrion', 'মাইটোকন্ড্রিয়া', 'Completes aerobic respiration.', 'সবাত শ্বসন সম্পূর্ণ করে।', 'class11-12', 'Krebs cycle in the matrix; ATP made on the inner membrane.', 'ধাত্রে ক্রেবস চক্র; অন্তঃপর্দায় ATP তৈরি হয়।'),
    part('atp', 'class10', '#22c55e', 'ATP', 'ATP', 'Energy packets released for cell work.', 'কোশের কাজের জন্য মুক্ত শক্তির প্যাকেট।', 'class11-12', 'ATP → ADP + phosphate releases usable energy.', 'ATP → ADP + ফসফেট বিক্রিয়ায় ব্যবহারযোগ্য শক্তি মুক্ত হয়।'),
    part('waste', 'class10', '#94a3b8', 'Products', 'উৎপন্ন পদার্থ', 'CO2 and water — or lactic acid / ethanol without oxygen.', 'CO2 ও জল — অক্সিজেন না থাকলে ল্যাকটিক অ্যাসিড বা ইথানল।', 'class11-12', 'Anaerobic pathways give only 2 ATP per glucose.', 'অবাত পথে প্রতি গ্লুকোজে কেবল 2 ATP পাওয়া যায়।')
  ],
  chapters: [
    chapter('overview', 'class9', 14, '1. Splitting glucose', '1. গ্লুকোজের ভাঙন', 'In the cytoplasm, glucose is split into two pyruvate molecules.', 'সাইটোপ্লাজমে গ্লুকোজ ভেঙে দুটি পাইরুভেট অণু তৈরি হয়।'),
    chapter('aerobic', 'class9', 20, '2. With oxygen', '2. অক্সিজেনসহ', 'Pyruvate enters the mitochondrion; CO2, water and many ATP come out.', 'পাইরুভেট মাইটোকন্ড্রিয়ায় ঢোকে; CO2, জল ও অনেক ATP বেরিয়ে আসে।'),
    chapter('anaerobic', 'class10', 18, '3. Without oxygen', '3. অক্সিজেন ছাড়া', 'Pyruvate stays in the cytoplasm and becomes lactic acid (muscle) or ethanol + CO2 (yeast); little ATP.', 'পাইরুভেট সাইটোপ্লাজমেই থেকে ল্যাকটিক অ্যাসিড (পেশি) বা ইথানল + CO2 (ঈস্ট) হয়; ATP সামান্য।')
  ],
  myths: [myth('class9', '"Respiration means breathing."', '"শ্বসন মানে শ্বাস নেওয়া।"', 'Breathing moves air; respiration is the chemical release of energy inside cells.', 'শ্বাসকার্যে বায়ু চলাচল করে; শ্বসন হলো কোশের ভেতরে রাসায়নিকভাবে শক্তি মুক্ত হওয়া।')],
  quiz: [
    quiz('cr1', 'class9', 'Glucose is first broken into pyruvate in the…', 'গ্লুকোজ প্রথমে পাইরুভেটে ভাঙে…', [['Cytoplasm', 'সাইটোপ্লাজমে'], ['Mitochondria', 'মাইটোকন্ড্রিয়ায়'], ['Nucleus', 'নিউক্লিয়াসে'], ['Lungs', 'ফুসফুসে']], 0, 'res.cel.pyruvate'),
    quiz('cr2', 'class9', 'Aerobic respiration is completed in the…', 'সবাত শ্বসন সম্পূর্ণ হয়…', [['Mitochondria', 'মাইটোকন্ড্রিয়ায়'], ['Ribosome', 'রাইবোজোমে'], ['Chloroplast', 'ক্লোরোপ্লাস্টে'], ['Cell wall', 'কোশপ্রাচীরে']], 0, 'res.cel.aerobic'),
    quiz('cr3', 'class9', 'Products of aerobic respiration are…', 'সবাত শ্বসনের উৎপন্ন পদার্থ…', [['CO2, water and energy', 'CO2, জল ও শক্তি'], ['Ethanol only', 'কেবল ইথানল'], ['Lactic acid only', 'কেবল ল্যাকটিক অ্যাসিড'], ['Glucose', 'গ্লুকোজ']], 0, 'res.cel.aerobic'),
    quiz('cr4', 'class10', 'Muscle cramps after a sprint are due to…', 'দৌড়ের পরে পেশিতে টানের কারণ…', [['Lactic acid', 'ল্যাকটিক অ্যাসিড'], ['Ethanol', 'ইথানল'], ['Too much oxygen', 'অতিরিক্ত অক্সিজেন'], ['Glucose', 'গ্লুকোজ']], 0, 'res.cel.anaerobic'),
    quiz('cr5', 'class10', 'The energy currency of the cell is…', 'কোশের শক্তি-মুদ্রা হলো…', [['ATP', 'ATP'], ['DNA', 'DNA'], ['Glucose', 'গ্লুকোজ'], ['Water', 'জল']], 0, 'res.cel.atp')
  ],
  limitation: limitation('Many enzyme steps are compressed into a few moves.', 'বহু উৎসেচক-ধাপকে কয়েকটি চলনে সংক্ষিপ্ত করা হয়েছে।')
};

const stomata = {
  id: 'stomata', tag: { en: 'plant', bn: 'উদ্ভিদ' },
  title: { en: 'Gas exchange in plants', bn: 'উদ্ভিদে গ্যাস বিনিময়' },
  lead: { en: 'Leaves exchange gases through stomata, opened and closed by guard cells.', bn: 'পাতা পত্ররন্ধ্রের মাধ্যমে গ্যাস বিনিময় করে; রক্ষীকোশ এদের খোলে ও বন্ধ করে।' },
  claims: [
    claim('res.sto.exchange', 'class9', 'Plants exchange gases through stomata in leaves by diffusion; every living plant cell respires all the time.', 'উদ্ভিদ পাতার পত্ররন্ধ্র দিয়ে ব্যাপনের মাধ্যমে গ্যাস বিনিময় করে; উদ্ভিদের প্রতিটি জীবিত কোশ সবসময় শ্বসন করে।', [S.NCERT_X, S.OS_BIO_LEAF]),
    claim('res.sto.daynight', 'class10', 'At night there is no photosynthesis, so plants give out CO2; in daytime CO2 from respiration is used in photosynthesis and oxygen is released.', 'রাতে সালোকসংশ্লেষ হয় না, তাই উদ্ভিদ CO2 ত্যাগ করে; দিনের বেলা শ্বসনের CO2 সালোকসংশ্লেষে ব্যবহৃত হয় এবং অক্সিজেন মুক্ত হয়।', [S.NCERT_X, S.OS_BIO_LEAF]),
    claim('res.sto.guard', 'class10', 'Guard cells swell when water flows in, opening the pore; they shrink when they lose water, closing it.', 'জল ঢুকলে রক্ষীকোশ ফুলে ওঠে ও রন্ধ্র খোলে; জল হারালে চুপসে যায় ও রন্ধ্র বন্ধ হয়।', [S.NCERT_X, S.OS_BIO_LEAF])
  ],
  parts: [
    part('guard', 'class9', '#22c55e', 'Guard cells', 'রক্ষীকোশ (Guard cells)', 'Pair of bean-shaped cells around the pore.', 'রন্ধ্রের চারপাশে শিমের মতো একজোড়া কোশ।', 'class10', 'They contain chloroplasts, unlike other epidermal cells.', 'অন্য ত্বককোশের মতো নয়, এদের ক্লোরোপ্লাস্ট থাকে।'),
    part('pore', 'class9', '#0f172a', 'Stomatal pore', 'পত্ররন্ধ্র', 'Opening for gases and water vapour.', 'গ্যাস ও জলীয় বাষ্পের পথ।', 'class10', 'Mostly on the lower surface of leaves.', 'বেশিরভাগ পাতার নিচের তলে থাকে।'),
    part('epidermis', 'class9', '#bbf7d0', 'Epidermis', 'ত্বক (Epidermis)', 'Outer layer of the leaf.', 'পাতার বাইরের স্তর।', 'class11-12', 'Covered by a waxy cuticle.', 'মোমের মতো কিউটিকলে ঢাকা।'),
    part('gas', 'class10', '#22d3ee', 'Gases', 'গ্যাস', 'Cyan: O2; grey: CO2.', 'নীলাভ: O2; ধূসর: CO2।', 'class10', 'Direction depends on day or night.', 'দিক নির্ভর করে দিন না রাত তার ওপর।')
  ],
  chapters: [
    chapter('overview', 'class9', 14, '1. A stoma', '1. একটি পত্ররন্ধ্র', 'Two guard cells surround a pore in the leaf epidermis.', 'পাতার ত্বকে দুটি রক্ষীকোশ একটি রন্ধ্রকে ঘিরে থাকে।'),
    chapter('daynight', 'class10', 24, '2. Day and night', '2. দিন ও রাত', 'Day: the pore opens, CO2 goes in, O2 comes out. Night: the pore narrows and CO2 comes out.', 'দিন: রন্ধ্র খোলে, CO2 ঢোকে, O2 বেরোয়। রাত: রন্ধ্র সরু হয় এবং CO2 বেরোয়।')
  ],
  myths: [myth('class9', '"Plants do not respire; they only photosynthesise."', '"উদ্ভিদ শ্বসন করে না, কেবল সালোকসংশ্লেষ করে।"', 'Plants respire day and night; photosynthesis happens only in light.', 'উদ্ভিদ দিন-রাত শ্বসন করে; সালোকসংশ্লেষ কেবল আলোয় হয়।')],
  quiz: [
    quiz('so1', 'class9', 'Plants exchange gases mainly through…', 'উদ্ভিদ প্রধানত গ্যাস বিনিময় করে…', [['Stomata', 'পত্ররন্ধ্র দিয়ে'], ['Xylem', 'জাইলেম দিয়ে'], ['Flowers', 'ফুল দিয়ে'], ['Roots only', 'কেবল মূল দিয়ে']], 0, 'res.sto.exchange'),
    quiz('so2', 'class9', 'Do plants respire?', 'উদ্ভিদ কি শ্বসন করে?', [['Yes, all the time', 'হ্যাঁ, সবসময়'], ['Only at night', 'কেবল রাতে'], ['Only in daytime', 'কেবল দিনে'], ['Never', 'কখনো না']], 0, 'res.sto.exchange'),
    quiz('so3', 'class9', 'Gases move through stomata by…', 'পত্ররন্ধ্র দিয়ে গ্যাস চলে…', [['Diffusion', 'ব্যাপনের মাধ্যমে'], ['Pumping', 'পাম্পের মাধ্যমে'], ['Digestion', 'পরিপাকের মাধ্যমে'], ['Peristalsis', 'ক্রমসংকোচনের মাধ্যমে']], 0, 'res.sto.exchange'),
    quiz('so4', 'class10', 'At night, plants mainly give out…', 'রাতে উদ্ভিদ প্রধানত ত্যাগ করে…', [['CO2', 'CO2'], ['O2', 'O2'], ['Glucose', 'গ্লুকোজ'], ['Nitrogen', 'নাইট্রোজেন']], 0, 'res.sto.daynight')
  ],
  limitation: limitation('One stoma is shown at huge magnification.', 'একটি পত্ররন্ধ্রকে বিশাল বিবর্ধনে দেখানো হয়েছে।')
};

export const respirationPacks = [alveoli, breathing, cellular, stomata];
