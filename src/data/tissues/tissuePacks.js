// Tissues bay deep-dive packs (TISSUES_MASTERPLAN; TD1 joints & skeleton here, TD2 no frog,
// TD3 UMich slides linked with attribution, TD4 skeletal muscle vertical slice first).
import { claim, part, chapter, myth, quiz, limitation } from '../packHelpers.js';

const S = {
  NCERT_IX: { kind: 'syllabus', title: 'NCERT Science Class 9 (Exploration, 2026-27), Ch 3 Tissues in Action', url: 'https://ncert.nic.in/textbook.php' },
  NCERT_XI_SO: { kind: 'syllabus', title: 'NCERT Biology Class 11, Ch 7 Structural Organisation in Animals (Animal Tissues)', url: 'https://ncert.nic.in/textbook.php' },
  NCERT_XI_ANAT: { kind: 'syllabus', title: 'NCERT Biology Class 11, Ch 6 Anatomy of Flowering Plants', url: 'https://ncert.nic.in/textbook.php' },
  NCERT_XI_LOCO: { kind: 'syllabus', title: 'NCERT Biology Class 11, Locomotion and Movement (muscle, skeleton, joints)', url: 'https://ncert.nic.in/textbook.php' },
  OS_AP_TISSUE: { kind: 'reference', title: 'OpenStax Anatomy & Physiology 2e, Ch 4 The Tissue Level of Organization (CC BY 4.0)', url: 'https://openstax.org/books/anatomy-and-physiology-2e/pages/4-introduction' },
  OS_AP_MUSCLE: { kind: 'reference', title: 'OpenStax Anatomy & Physiology 2e, 10.3 Muscle Fiber Contraction and Relaxation (CC BY 4.0)', url: 'https://openstax.org/books/anatomy-and-physiology-2e/pages/10-3-muscle-fiber-contraction-and-relaxation' },
  OS_AP_BONE: { kind: 'reference', title: 'OpenStax Anatomy & Physiology 2e, 6.3 Bone Structure (CC BY 4.0)', url: 'https://openstax.org/books/anatomy-and-physiology-2e/pages/6-3-bone-structure' },
  OS_AP_JOINTS: { kind: 'reference', title: 'OpenStax Anatomy & Physiology 2e, 9.4 Synovial Joints (CC BY 4.0)', url: 'https://openstax.org/books/anatomy-and-physiology-2e/pages/9-4-synovial-joints' },
  OS_AP_NERVE: { kind: 'reference', title: 'OpenStax Anatomy & Physiology 2e, 12.2 Nervous Tissue (CC BY 4.0)', url: 'https://openstax.org/books/anatomy-and-physiology-2e/pages/12-2-nervous-tissue' },
  OS_BIO_PLANT: { kind: 'reference', title: 'OpenStax Biology 2e, 30.1 The Plant Body (plant tissues) (CC BY 4.0)', url: 'https://openstax.org/books/biology-2e/pages/30-1-the-plant-body' },
  UMICH: { kind: 'database', title: 'University of Michigan Histology Virtual Slide Collection (CC BY-NC-SA; link only)', url: 'https://histology.medicine.umich.edu/' },
  HUXLEY_1954: { kind: 'peer-reviewed', title: 'Huxley A.F., Niedergerke R. (1954) Structural changes in muscle during contraction. Nature 173:971–973', url: 'https://doi.org/10.1038/173971a0' }
};

const muscle = {
  id: 'skeletal-muscle', tag: { en: 'animal', bn: 'প্রাণী' },
  title: { en: 'Skeletal muscle', bn: 'কঙ্কালপেশি (Skeletal muscle)' },
  lead: { en: 'Striped, voluntary muscle that moves bones — zoom from a fibre down to the sarcomere.', bn: 'ডোরাকাটা, ঐচ্ছিক পেশি, যা অস্থি নাড়ায় — পেশিতন্তু থেকে সারকোমিয়ার পর্যন্ত বড় করে দেখুন।' },
  claims: [
    claim('tis.mus.three-types', 'class9', 'There are three kinds of muscle tissue: skeletal (striated, voluntary), smooth (unstriated, involuntary) and cardiac (striated, involuntary).', 'পেশিকলা তিন প্রকার: কঙ্কালপেশি (ডোরাকাটা, ঐচ্ছিক), মসৃণ পেশি (ডোরাহীন, অনৈচ্ছিক) ও হৃৎপেশি (ডোরাকাটা, অনৈচ্ছিক)।', [S.NCERT_IX, S.OS_AP_TISSUE]),
    claim('tis.mus.multinucleate', 'class9', 'Skeletal muscle cells are long, cylindrical, unbranched and multinucleate.', 'কঙ্কালপেশির কোশ লম্বা, নলাকার, শাখাহীন ও বহু-নিউক্লিয়াসযুক্ত।', [S.NCERT_IX, S.OS_AP_TISSUE]),
    claim('tis.mus.sliding', 'class11-12', 'In contraction, thin (actin) filaments slide over thick (myosin) filaments: the sarcomere and I band shorten while the A band keeps its length.', 'সংকোচনের সময় সরু (অ্যাক্টিন) তন্তু মোটা (মায়োসিন) তন্তুর ওপর দিয়ে পিছলে যায়: সারকোমিয়ার ও I ব্যান্ড ছোট হয়, কিন্তু A ব্যান্ডের দৈর্ঘ্য একই থাকে।', [S.NCERT_XI_LOCO, S.HUXLEY_1954]),
    claim('tis.mus.calcium', 'neet', 'A nerve signal releases Ca2+ from the sarcoplasmic reticulum; Ca2+ binds troponin, uncovering myosin-binding sites on actin; myosin heads use ATP to pull actin.', 'স্নায়ু সংকেত সারকোপ্লাজমীয় জালিকা থেকে Ca2+ মুক্ত করে; Ca2+ ট্রোপোনিনের সঙ্গে যুক্ত হয়ে অ্যাক্টিনের মায়োসিন-সংযোগস্থল উন্মুক্ত করে; মায়োসিনের মাথা ATP ব্যবহার করে অ্যাক্টিনকে টানে।', [S.NCERT_XI_LOCO, S.OS_AP_MUSCLE]),
    claim('tis.mus.sarcomere-length', 'neet', 'A relaxed human sarcomere is roughly 2–3 µm long (Z line to Z line).', 'শিথিল অবস্থায় মানুষের একটি সারকোমিয়ার প্রায় 2–3 µm লম্বা (Z রেখা থেকে Z রেখা)।', [S.OS_AP_MUSCLE, S.HUXLEY_1954], { value: 2.5, unit: 'µm', range: [2, 3] })
  ],
  parts: [
    part('fibre', 'class9', '#fb7185', 'Muscle fibre', 'পেশিতন্তু (Muscle fibre)', 'One long muscle cell with many nuclei.', 'বহু নিউক্লিয়াসযুক্ত একটি লম্বা পেশিকোশ।', 'class11-12', 'Its cell membrane is the sarcolemma; its cytoplasm is the sarcoplasm.', 'এর কোশপর্দাকে সারকোলেমা এবং সাইটোপ্লাজমকে সারকোপ্লাজম বলে।'),
    part('nuclei', 'class9', '#a78bfa', 'Nuclei', 'নিউক্লিয়াস (Nuclei)', 'Many nuclei lie just under the cell membrane.', 'অনেকগুলি নিউক্লিয়াস কোশপর্দার ঠিক নিচে থাকে।', 'class11-12', 'A fibre forms by fusion of many embryonic cells, so it is multinucleate.', 'বহু ভ্রূণকোশ মিলিত হয়ে একটি তন্তু তৈরি হয়, তাই এটি বহু-নিউক্লিয়াসযুক্ত।'),
    part('myofibril', 'class10', '#fda4af', 'Myofibrils', 'মায়োফাইব্রিল (Myofibrils)', 'Thread-like bundles inside the fibre that show light and dark bands.', 'তন্তুর ভেতরের সুতোর মতো গোছা, যাতে হালকা ও গাঢ় ডোরা দেখা যায়।', 'class11-12', 'Each myofibril is a chain of sarcomeres, the contractile units.', 'প্রতিটি মায়োফাইব্রিল সারকোমিয়ারের একটি শৃঙ্খল; সারকোমিয়ার হলো সংকোচনের একক।'),
    part('actin', 'class11-12', '#38bdf8', 'Actin (thin filament)', 'অ্যাক্টিন (সরু তন্তু)', 'Thin filaments anchored at the Z lines.', 'Z রেখায় আটকানো সরু তন্তু।', 'neet', 'Carries troponin and tropomyosin, which block myosin binding at rest.', 'এতে ট্রোপোনিন ও ট্রোপোমায়োসিন থাকে, যা বিশ্রামের সময় মায়োসিনের সংযোগ আটকে রাখে।'),
    part('myosin', 'class11-12', '#f59e0b', 'Myosin (thick filament)', 'মায়োসিন (মোটা তন্তু)', 'Thick filaments in the middle of the sarcomere; they form the A band.', 'সারকোমিয়ারের মাঝের মোটা তন্তু; এরা A ব্যান্ড তৈরি করে।', 'neet', 'Myosin heads (cross bridges) split ATP and pull actin towards the centre.', 'মায়োসিনের মাথা (ক্রস ব্রিজ) ATP ভেঙে অ্যাক্টিনকে কেন্দ্রের দিকে টানে।'),
    part('zline', 'class11-12', '#e2e8f0', 'Z line', 'Z রেখা (Z line)', 'Boundary between two sarcomeres.', 'দুটি সারকোমিয়ারের সীমানা।', 'class11-12', 'Z lines move closer together when the muscle contracts.', 'পেশি সংকুচিত হলে Z রেখাগুলি কাছাকাছি আসে।')
  ],
  chapters: [
    chapter('overview', 'class9', 16, '1. A striped fibre', '1. ডোরাকাটা তন্তু', 'A skeletal muscle fibre is a long cell with many nuclei and light and dark stripes.', 'কঙ্কালপেশির তন্তু হলো বহু নিউক্লিয়াসযুক্ত লম্বা কোশ, যাতে হালকা ও গাঢ় ডোরা থাকে।'),
    chapter('sliding', 'class11-12', 24, '2. Sliding filaments', '2. তন্তুর পিছলে যাওয়া', 'Actin slides over myosin: Z lines come closer and the I band narrows, but the A band stays the same length.', 'অ্যাক্টিন মায়োসিনের ওপর দিয়ে পিছলে যায়: Z রেখা কাছে আসে ও I ব্যান্ড সরু হয়, কিন্তু A ব্যান্ডের দৈর্ঘ্য একই থাকে।'),
    chapter('crossbridge', 'neet', 26, '3. Ca2+ and cross bridges', '3. Ca2+ ও ক্রস ব্রিজ', 'Ca2+ uncovers binding sites on actin; myosin heads attach, pull and release, each cycle using one ATP.', 'Ca2+ অ্যাক্টিনের সংযোগস্থল উন্মুক্ত করে; মায়োসিনের মাথা যুক্ত হয়, টানে ও ছেড়ে দেয়, প্রতিটি চক্রে একটি ATP খরচ হয়।')
  ],
  myths: [
    myth('class11-12', '"Filaments get shorter when muscle contracts."', '"পেশি সংকোচনে তন্তুগুলি নিজেরাই ছোট হয়ে যায়।"', 'Actin and myosin keep their length; they slide past each other.', 'অ্যাক্টিন ও মায়োসিনের দৈর্ঘ্য একই থাকে; এরা একে অপরের ওপর দিয়ে পিছলে যায়।'),
    myth('neet', '"ATP is needed only to contract, not to relax."', '"কেবল সংকোচনের জন্য ATP লাগে, শিথিলতার জন্য নয়।"', 'ATP is also needed for myosin to let go of actin and to pump Ca2+ back; without ATP muscles stay locked (rigor mortis).', 'মায়োসিনকে অ্যাক্টিন থেকে ছাড়াতে ও Ca2+ ফেরত পাম্প করতেও ATP লাগে; ATP না থাকলে পেশি আটকে থাকে (রাইগর মর্টিস)।')
  ],
  quiz: [
    quiz('mu1', 'class9', 'Skeletal muscle is…', 'কঙ্কালপেশি হলো…', [['Striated and voluntary', 'ডোরাকাটা ও ঐচ্ছিক'], ['Unstriated and involuntary', 'ডোরাহীন ও অনৈচ্ছিক'], ['Striated and involuntary', 'ডোরাকাটা ও অনৈচ্ছিক'], ['Found only in the heart', 'কেবল হৃৎপিণ্ডে থাকে']], 0, 'tis.mus.three-types'),
    quiz('mu2', 'class9', 'Which muscle is found in the walls of the stomach and intestine?', 'পাকস্থলী ও অন্ত্রের প্রাচীরে কোন পেশি থাকে?', [['Smooth muscle', 'মসৃণ পেশি'], ['Skeletal muscle', 'কঙ্কালপেশি'], ['Cardiac muscle', 'হৃৎপেশি'], ['None', 'কোনোটিই না']], 0, 'tis.mus.three-types'),
    quiz('mu3', 'class9', 'A skeletal muscle cell has…', 'কঙ্কালপেশির কোশে থাকে…', [['Many nuclei', 'অনেক নিউক্লিয়াস'], ['No nucleus', 'কোনো নিউক্লিয়াস নেই'], ['A cell wall', 'কোশপ্রাচীর'], ['Chloroplasts', 'ক্লোরোপ্লাস্ট']], 0, 'tis.mus.multinucleate'),
    quiz('mu4', 'class11-12', 'During contraction, which band keeps its length?', 'সংকোচনের সময় কোন ব্যান্ডের দৈর্ঘ্য একই থাকে?', [['A band', 'A ব্যান্ড'], ['I band', 'I ব্যান্ড'], ['H zone', 'H অঞ্চল'], ['Whole sarcomere', 'পুরো সারকোমিয়ার']], 0, 'tis.mus.sliding'),
    quiz('mu5', 'neet', 'Ca2+ starts contraction by binding to…', 'Ca2+ কোনটির সঙ্গে যুক্ত হয়ে সংকোচন শুরু করে?', [['Troponin', 'ট্রোপোনিন'], ['Myosin head', 'মায়োসিনের মাথা'], ['Z line', 'Z রেখা'], ['ATP', 'ATP']], 0, 'tis.mus.calcium')
  ],
  limitation: limitation('Filament counts are greatly reduced; the sarcomere is drawn much larger than the fibre around it.', 'তন্তুর সংখ্যা অনেক কমানো হয়েছে; সারকোমিয়ারকে চারপাশের তন্তুর তুলনায় অনেক বড় করে দেখানো হয়েছে।')
};

const epithelium = {
  id: 'epithelium', tag: { en: 'animal', bn: 'প্রাণী' },
  title: { en: 'Epithelial tissue', bn: 'আবরণী কলা (Epithelial tissue)' },
  lead: { en: 'Covering and lining tissue: cells packed tightly on a basement membrane.', bn: 'আবরণ ও আস্তরণ সৃষ্টিকারী কলা: ভিত্তিপর্দার ওপর ঘনভাবে সাজানো কোশ।' },
  claims: [
    claim('tis.epi.packed', 'class9', 'Epithelial cells are tightly packed with very little space between them and rest on a basement membrane; they cover the body and line organs.', 'আবরণী কোশগুলি ঘনভাবে সাজানো, মাঝে খুব কম ফাঁক থাকে এবং এরা একটি ভিত্তিপর্দার ওপর থাকে; এরা দেহকে ঢেকে রাখে ও অঙ্গের আস্তরণ তৈরি করে।', [S.NCERT_IX, S.OS_AP_TISSUE]),
    claim('tis.epi.types', 'class9', 'Simple squamous epithelium lines blood vessels and lung alveoli; cuboidal lines kidney tubules and gland ducts; columnar lines the intestine; ciliated columnar lines the respiratory tract.', 'সরল আঁশাকার আবরণী রক্তবাহ ও ফুসফুসের বায়ুথলির আস্তরণ তৈরি করে; ঘনকাকার আবরণী বৃক্কনালিকা ও গ্রন্থিনালির, স্তম্ভাকার আবরণী অন্ত্রের এবং সিলিয়াযুক্ত স্তম্ভাকার আবরণী শ্বাসনালির আস্তরণ তৈরি করে।', [S.NCERT_IX, S.OS_AP_TISSUE]),
    claim('tis.epi.stratified', 'class11-12', 'Compound (stratified) epithelium has several layers and protects against wear, as in the skin and the lining of the mouth.', 'যৌগিক (স্তরীভূত) আবরণীতে কয়েকটি স্তর থাকে এবং এটি ক্ষয় থেকে রক্ষা করে, যেমন ত্বকে ও মুখগহ্বরের আস্তরণে।', [S.NCERT_XI_SO, S.OS_AP_TISSUE])
  ],
  parts: [
    part('squamous', 'class9', '#fda4af', 'Squamous cells', 'আঁশাকার কোশ (Squamous)', 'Thin, flat cells — ideal for diffusion.', 'পাতলা, চ্যাপ্টা কোশ — ব্যাপনের জন্য উপযুক্ত।', 'class11-12', 'One layer in alveoli and capillaries; many layers in skin.', 'বায়ুথলি ও কৈশিকনালিতে একস্তর; ত্বকে বহুস্তর।'),
    part('cuboidal', 'class9', '#fbbf24', 'Cuboidal cells', 'ঘনকাকার কোশ (Cuboidal)', 'Cube-shaped cells that absorb and secrete.', 'ঘনকের মতো কোশ, যা শোষণ ও ক্ষরণ করে।', 'class11-12', 'Line kidney tubules; some have microvilli (brush border).', 'বৃক্কনালিকার আস্তরণ তৈরি করে; কিছু কোশে মাইক্রোভিলাই (ব্রাশ বর্ডার) থাকে।'),
    part('columnar', 'class9', '#34d399', 'Columnar cells', 'স্তম্ভাকার কোশ (Columnar)', 'Tall cells lining the intestine.', 'অন্ত্রের আস্তরণের লম্বা কোশ।', 'class11-12', 'Microvilli on the free surface increase absorption area.', 'মুক্ত তলের মাইক্রোভিলাই শোষণ-তল বাড়ায়।'),
    part('cilia', 'class9', '#38bdf8', 'Cilia', 'সিলিয়া (Cilia)', 'Hair-like projections that beat to move mucus.', 'চুলের মতো প্রবর্ধক, যা আন্দোলিত হয়ে শ্লেষ্মা সরায়।', 'class10', 'In the trachea they sweep dust-laden mucus up towards the throat.', 'শ্বাসনালিতে এরা ধুলোভরা শ্লেষ্মাকে গলার দিকে ঠেলে দেয়।'),
    part('basement', 'class9', '#94a3b8', 'Basement membrane', 'ভিত্তিপর্দা (Basement membrane)', 'Thin non-living layer the cells sit on.', 'পাতলা নির্জীব স্তর, যার ওপর কোশগুলি থাকে।', 'class11-12', 'Separates epithelium from the connective tissue below.', 'আবরণীকে নিচের যোগকলা থেকে পৃথক করে।')
  ],
  chapters: [
    chapter('overview', 'class9', 16, '1. Four shapes', '1. চার রকম আকৃতি', 'Squamous, cuboidal, columnar and ciliated columnar epithelium side by side.', 'আঁশাকার, ঘনকাকার, স্তম্ভাকার ও সিলিয়াযুক্ত স্তম্ভাকার আবরণী পাশাপাশি।'),
    chapter('cilia', 'class10', 18, '2. Cilia at work', '2. সিলিয়ার কাজ', 'Cilia beat in waves, moving mucus and trapped dust in one direction.', 'সিলিয়া ঢেউয়ের মতো আন্দোলিত হয়ে শ্লেষ্মা ও আটকে থাকা ধুলোকে একদিকে সরায়।')
  ],
  myths: [
    myth('class9', '"Epithelium has its own blood vessels."', '"আবরণী কলায় নিজস্ব রক্তবাহ থাকে।"', 'Epithelium has no blood vessels; it gets nutrients by diffusion from the connective tissue below.', 'আবরণী কলায় রক্তবাহ থাকে না; নিচের যোগকলা থেকে ব্যাপনের মাধ্যমে পুষ্টি পায়।')
  ],
  quiz: [
    quiz('ep1', 'class9', 'Lung alveoli are lined by…', 'ফুসফুসের বায়ুথলির আস্তরণ কোন আবরণী?', [['Squamous epithelium', 'আঁশাকার আবরণী'], ['Columnar epithelium', 'স্তম্ভাকার আবরণী'], ['Cartilage', 'তরুণাস্থি'], ['Smooth muscle', 'মসৃণ পেশি']], 0, 'tis.epi.types'),
    quiz('ep2', 'class9', 'Kidney tubules are lined by…', 'বৃক্কনালিকার আস্তরণ কোন আবরণী?', [['Cuboidal epithelium', 'ঘনকাকার আবরণী'], ['Squamous epithelium', 'আঁশাকার আবরণী'], ['Ciliated epithelium', 'সিলিয়াযুক্ত আবরণী'], ['Bone', 'অস্থি']], 0, 'tis.epi.types'),
    quiz('ep3', 'class9', 'Epithelial cells are…', 'আবরণী কোশগুলি…', [['Tightly packed', 'ঘনভাবে সাজানো'], ['Widely separated by matrix', 'ধাত্রের দ্বারা অনেক দূরে দূরে'], ['Fluid', 'তরল'], ['Without nuclei', 'নিউক্লিয়াসবিহীন']], 0, 'tis.epi.packed'),
    quiz('ep4', 'class11-12', 'Skin surface is made of…', 'ত্বকের উপরিতল কী দিয়ে গঠিত?', [['Stratified squamous epithelium', 'স্তরীভূত আঁশাকার আবরণী'], ['Simple cuboidal epithelium', 'সরল ঘনকাকার আবরণী'], ['Cardiac muscle', 'হৃৎপেশি'], ['Blood', 'রক্ত']], 0, 'tis.epi.stratified')
  ],
  limitation: limitation('Each tissue type is shown as a small patch side by side, which does not happen in one organ.', 'প্রতিটি কলাকে পাশাপাশি ছোট অংশ হিসেবে দেখানো হয়েছে, যা একটি অঙ্গে একসঙ্গে ঘটে না।')
};

const connective = {
  id: 'bone', tag: { en: 'animal', bn: 'প্রাণী' },
  title: { en: 'Connective tissue: bone', bn: 'যোগকলা: অস্থি (Bone)' },
  lead: { en: 'Cells scattered in a matrix — here, compact bone built of osteons.', bn: 'ধাত্রে ছড়ানো কোশ — এখানে অস্টিওন দিয়ে গঠিত নিরেট অস্থি।' },
  claims: [
    claim('tis.con.matrix', 'class9', 'In connective tissue the cells are loosely spaced in a matrix; blood is a fluid connective tissue.', 'যোগকলায় কোশগুলি ধাত্রের মধ্যে দূরে দূরে থাকে; রক্ত হলো তরল যোগকলা।', [S.NCERT_IX, S.OS_AP_TISSUE]),
    claim('tis.con.bone', 'class9', 'Bone is a hard, strong connective tissue; its matrix contains calcium and phosphorus compounds.', 'অস্থি একটি শক্ত ও দৃঢ় যোগকলা; এর ধাত্রে ক্যালসিয়াম ও ফসফরাসের যৌগ থাকে।', [S.NCERT_IX, S.OS_AP_BONE]),
    claim('tis.con.tendon', 'class9', 'Tendons connect muscle to bone; ligaments connect bone to bone.', 'টেন্ডন পেশিকে অস্থির সঙ্গে যুক্ত করে; লিগামেন্ট অস্থিকে অস্থির সঙ্গে যুক্ত করে।', [S.NCERT_IX, S.OS_AP_TISSUE]),
    claim('tis.con.osteon', 'class11-12', 'Compact bone is built of osteons (Haversian systems): rings of matrix (lamellae) around a central canal carrying vessels and nerves, with osteocytes in lacunae.', 'নিরেট অস্থি অস্টিওন (হ্যাভারসিয়ান তন্ত্র) দিয়ে গঠিত: রক্তবাহ ও স্নায়ুযুক্ত কেন্দ্রীয় নালির চারপাশে ধাত্রের বলয় (ল্যামেলি), এবং ল্যাকুনায় অস্টিওসাইট।', [S.NCERT_XI_SO, S.OS_AP_BONE])
  ],
  parts: [
    part('canal', 'class11-12', '#ef4444', 'Central (Haversian) canal', 'কেন্দ্রীয় (হ্যাভারসিয়ান) নালি', 'Channel carrying blood vessels and nerves.', 'রক্তবাহ ও স্নায়ু বহনকারী নালি।', 'class11-12', 'Runs along the length of the bone.', 'অস্থির দৈর্ঘ্য বরাবর বিস্তৃত।'),
    part('lamellae', 'class9', '#fde68a', 'Bone matrix (lamellae)', 'অস্থির ধাত্র (ল্যামেলি)', 'Hard matrix rich in calcium and phosphorus.', 'ক্যালসিয়াম ও ফসফরাস-সমৃদ্ধ শক্ত ধাত্র।', 'class11-12', 'Collagen fibres give flexibility; calcium phosphate gives hardness.', 'কোলাজেন তন্তু নমনীয়তা দেয়; ক্যালসিয়াম ফসফেট কাঠিন্য দেয়।'),
    part('osteocyte', 'class9', '#a78bfa', 'Bone cells (osteocytes)', 'অস্থিকোশ (Osteocytes)', 'Living cells trapped in small spaces in the matrix.', 'ধাত্রের ছোট ছোট গহ্বরে আবদ্ধ জীবিত কোশ।', 'class11-12', 'They sit in lacunae and connect through tiny canals (canaliculi).', 'এরা ল্যাকুনায় থাকে এবং সূক্ষ্ম নালি (ক্যানালিকুলি) দিয়ে পরস্পর যুক্ত।'),
    part('vessel', 'class11-12', '#f87171', 'Blood vessel', 'রক্তবাহ', 'Supplies the living bone cells.', 'জীবিত অস্থিকোশে রক্ত সরবরাহ করে।', 'class11-12', 'Bone is living tissue: it is constantly rebuilt.', 'অস্থি জীবিত কলা: এটি প্রতিনিয়ত পুনর্গঠিত হয়।')
  ],
  chapters: [
    chapter('overview', 'class9', 16, '1. Inside compact bone', '1. নিরেট অস্থির ভেতরে', 'Bone cells lie scattered in a hard matrix arranged in rings.', 'অস্থিকোশগুলি বলয়ে সাজানো শক্ত ধাত্রে ছড়িয়ে থাকে।'),
    chapter('osteon', 'class11-12', 18, '2. The osteon', '2. অস্টিওন', 'Each osteon is a set of rings around a central canal with blood vessels.', 'প্রতিটি অস্টিওন হলো রক্তবাহযুক্ত কেন্দ্রীয় নালির চারপাশে কয়েকটি বলয়।')
  ],
  myths: [
    myth('class9', '"Bone is dead, like stone."', '"অস্থি পাথরের মতো মৃত।"', 'Bone is living tissue with cells and blood vessels; it grows and repairs itself.', 'অস্থি কোশ ও রক্তবাহযুক্ত জীবিত কলা; এটি বৃদ্ধি পায় ও নিজেকে মেরামত করে।')
  ],
  quiz: [
    quiz('bo1', 'class9', 'Which connective tissue is fluid?', 'কোন যোগকলা তরল?', [['Blood', 'রক্ত'], ['Bone', 'অস্থি'], ['Cartilage', 'তরুণাস্থি'], ['Tendon', 'টেন্ডন']], 0, 'tis.con.matrix'),
    quiz('bo2', 'class9', 'Muscle is joined to bone by…', 'পেশি কীসের দ্বারা অস্থির সঙ্গে যুক্ত থাকে?', [['Tendon', 'টেন্ডন'], ['Ligament', 'লিগামেন্ট'], ['Cartilage', 'তরুণাস্থি'], ['Nerve', 'স্নায়ু']], 0, 'tis.con.tendon'),
    quiz('bo3', 'class9', 'Bone matrix is rich in…', 'অস্থির ধাত্রে প্রচুর থাকে…', [['Calcium and phosphorus', 'ক্যালসিয়াম ও ফসফরাস'], ['Iron and iodine', 'লোহা ও আয়োডিন'], ['Starch', 'শ্বেতসার'], ['Chlorophyll', 'ক্লোরোফিল']], 0, 'tis.con.bone'),
    quiz('bo4', 'class11-12', 'The structural unit of compact bone is the…', 'নিরেট অস্থির গঠনগত একক কী?', [['Osteon (Haversian system)', 'অস্টিওন (হ্যাভারসিয়ান তন্ত্র)'], ['Nephron', 'নেফ্রন'], ['Sarcomere', 'সারকোমিয়ার'], ['Alveolus', 'বায়ুথলি']], 0, 'tis.con.osteon')
  ],
  limitation: limitation('Only a few osteons are drawn; canaliculi are omitted.', 'কেবল কয়েকটি অস্টিওন আঁকা হয়েছে; ক্যানালিকুলি বাদ রাখা হয়েছে।')
};

const nervous = {
  id: 'neuron', tag: { en: 'animal', bn: 'প্রাণী' },
  title: { en: 'Nervous tissue: the neuron', bn: 'স্নায়ুকলা: নিউরন (Neuron)' },
  lead: { en: 'Neurons carry electrical signals quickly over long distances.', bn: 'নিউরন দ্রুত দীর্ঘ পথে বৈদ্যুতিক সংকেত বহন করে।' },
  claims: [
    claim('tis.ner.parts', 'class9', 'A neuron has a cell body with a nucleus, short branched dendrites, and one long axon.', 'নিউরনে নিউক্লিয়াসযুক্ত একটি কোশদেহ, ছোট শাখাযুক্ত ডেনড্রাইট এবং একটি লম্বা অ্যাক্সন থাকে।', [S.NCERT_IX, S.OS_AP_NERVE]),
    claim('tis.ner.length', 'class9', 'A single nerve cell can be up to about one metre long.', 'একটি স্নায়ুকোশ প্রায় এক মিটার পর্যন্ত লম্বা হতে পারে।', [S.NCERT_IX, S.OS_AP_NERVE]),
    claim('tis.ner.direction', 'class10', 'A signal is received by dendrites, passes through the cell body and travels along the axon to its end, where it is passed to the next cell.', 'সংকেত ডেনড্রাইটে গৃহীত হয়, কোশদেহের মধ্য দিয়ে অ্যাক্সন বরাবর এর প্রান্তে যায়, যেখান থেকে পরের কোশে পৌঁছায়।', [S.NCERT_IX, S.OS_AP_NERVE]),
    claim('tis.ner.myelin', 'class11-12', 'In myelinated fibres, the impulse jumps from one node of Ranvier to the next, so conduction is faster.', 'মায়েলিনযুক্ত তন্তুতে উদ্দীপনা এক র‍্যানভিয়ারের পর্বসন্ধি থেকে পরেরটিতে লাফিয়ে যায়, তাই পরিবহণ দ্রুত হয়।', [S.NCERT_XI_SO, S.OS_AP_NERVE])
  ],
  parts: [
    part('soma', 'class9', '#a78bfa', 'Cell body', 'কোশদেহ (Cell body)', 'Contains the nucleus and most organelles.', 'নিউক্লিয়াস ও বেশিরভাগ অঙ্গাণু এখানে থাকে।', 'class11-12', 'Contains Nissl granules (rough ER).', 'এতে নিসল দানা (অমসৃণ ER) থাকে।'),
    part('dendrite', 'class9', '#38bdf8', 'Dendrites', 'ডেনড্রাইট (Dendrites)', 'Short branches that receive signals.', 'ছোট শাখা, যা সংকেত গ্রহণ করে।', 'class10', 'Many dendrites let one neuron receive input from many cells.', 'অনেকগুলি ডেনড্রাইট থাকায় একটি নিউরন বহু কোশ থেকে সংকেত পায়।'),
    part('axon', 'class9', '#fbbf24', 'Axon', 'অ্যাক্সন (Axon)', 'Long fibre that carries signals away from the cell body.', 'লম্বা তন্তু, যা কোশদেহ থেকে সংকেত দূরে বহন করে।', 'class11-12', 'Ends in branches with synaptic knobs.', 'এর প্রান্ত সাইন্যাপটিক নবযুক্ত শাখায় শেষ হয়।'),
    part('myelin', 'class11-12', '#e2e8f0', 'Myelin sheath', 'মায়েলিন আবরণ (Myelin sheath)', 'Fatty insulating wrap around the axon.', 'অ্যাক্সনের চারপাশে চর্বিজাতীয় অন্তরক আবরণ।', 'class11-12', 'Gaps between segments are nodes of Ranvier.', 'খণ্ডগুলির মাঝের ফাঁককে র‍্যানভিয়ারের পর্বসন্ধি বলে।'),
    part('signal', 'class10', '#22d3ee', 'Nerve impulse', 'স্নায়ু উদ্দীপনা', 'An electrical signal moving along the neuron.', 'নিউরন বরাবর চলমান বৈদ্যুতিক সংকেত।', 'class11-12', 'In myelinated axons it jumps from node to node.', 'মায়েলিনযুক্ত অ্যাক্সনে এটি এক পর্বসন্ধি থেকে আরেকটিতে লাফিয়ে যায়।')
  ],
  chapters: [
    chapter('overview', 'class9', 14, '1. Parts of a neuron', '1. নিউরনের অংশ', 'Cell body, dendrites and a long axon.', 'কোশদেহ, ডেনড্রাইট ও একটি লম্বা অ্যাক্সন।'),
    chapter('impulse', 'class10', 18, '2. A signal travels', '2. সংকেতের যাত্রা', 'The signal enters at the dendrites, passes the cell body and runs down the axon. (Slowed for viewing.)', 'সংকেত ডেনড্রাইটে প্রবেশ করে, কোশদেহ পেরিয়ে অ্যাক্সন বরাবর যায়। (দেখার জন্য ধীর করা হয়েছে।)')
  ],
  myths: [
    myth('class9', '"Nerve signals travel as fast as electricity in a wire."', '"স্নায়ু সংকেত তারের বিদ্যুতের মতো দ্রুত চলে।"', 'Nerve impulses are much slower — at most about 120 m/s — because they are carried by ion movement.', 'স্নায়ু উদ্দীপনা অনেক ধীর — সর্বোচ্চ প্রায় 120 m/s — কারণ এটি আয়নের চলাচলের মাধ্যমে বাহিত হয়।')
  ],
  quiz: [
    quiz('ne1', 'class9', 'Which part carries signals away from the cell body?', 'কোন অংশ কোশদেহ থেকে সংকেত দূরে বহন করে?', [['Axon', 'অ্যাক্সন'], ['Dendrite', 'ডেনড্রাইট'], ['Nucleus', 'নিউক্লিয়াস'], ['Cell wall', 'কোশপ্রাচীর']], 0, 'tis.ner.parts'),
    quiz('ne2', 'class9', 'A nerve cell can be up to about…', 'একটি স্নায়ুকোশ প্রায় কত লম্বা হতে পারে?', [['1 metre', '1 মিটার'], ['1 millimetre only', 'কেবল 1 মিলিমিটার'], ['10 metres', '10 মিটার'], ['1 kilometre', '1 কিলোমিটার']], 0, 'tis.ner.length'),
    quiz('ne3', 'class9', 'Dendrites…', 'ডেনড্রাইট…', [['Receive signals', 'সংকেত গ্রহণ করে'], ['Make ATP', 'ATP তৈরি করে'], ['Store fat', 'চর্বি সঞ্চয় করে'], ['Digest food', 'খাদ্য পাচন করে']], 0, 'tis.ner.parts'),
    quiz('ne4', 'class11-12', 'Why is conduction faster in myelinated fibres?', 'মায়েলিনযুক্ত তন্তুতে পরিবহণ দ্রুত কেন?', [['Impulse jumps between nodes of Ranvier', 'উদ্দীপনা র‍্যানভিয়ারের পর্বসন্ধির মধ্যে লাফিয়ে যায়'], ['Myelin carries electrons', 'মায়েলিন ইলেকট্রন বহন করে'], ['The axon is shorter', 'অ্যাক্সন ছোট'], ['There is no membrane', 'কোনো পর্দা নেই']], 0, 'tis.ner.myelin')
  ],
  limitation: limitation('The axon is drawn very short compared with real neurons.', 'প্রকৃত নিউরনের তুলনায় অ্যাক্সনটি খুব ছোট করে আঁকা হয়েছে।')
};

const joints = {
  id: 'joints', tag: { en: 'skeleton', bn: 'কঙ্কাল' },
  title: { en: 'Joints & skeleton', bn: 'অস্থিসন্ধি (Joints) ও কঙ্কাল' },
  lead: { en: 'Where bones meet: compare a ball-and-socket joint with a hinge joint.', bn: 'যেখানে অস্থিগুলি মিলিত হয়: বল-সকেট সন্ধি ও কবজা সন্ধির তুলনা করুন।' },
  claims: [
    claim('tis.joint.206', 'class11-12', 'The adult human skeleton has 206 bones: 80 in the axial skeleton and 126 in the appendicular skeleton.', 'প্রাপ্তবয়স্ক মানুষের কঙ্কালে 206টি অস্থি থাকে: অক্ষীয় কঙ্কালে 80টি ও উপাঙ্গীয় কঙ্কালে 126টি।', [S.NCERT_XI_LOCO, S.OS_AP_BONE], { value: 206, unit: 'bones', range: [206, 206] }),
    claim('tis.joint.types', 'class9', 'Joints are fibrous (immovable, as in skull sutures), cartilaginous (slightly movable, as between vertebrae) or synovial (freely movable, with fluid-filled cavity).', 'অস্থিসন্ধি তন্তুময় (অচল, যেমন করোটির সেলাই-সন্ধি), তরুণাস্থিময় (সামান্য সচল, যেমন কশেরুকার মাঝে) বা সাইনোভিয়াল (মুক্তভাবে সচল, তরলপূর্ণ গহ্বরযুক্ত)।', [S.NCERT_XI_LOCO, S.OS_AP_JOINTS]),
    claim('tis.joint.synovial', 'class9', 'Synovial joints include ball-and-socket (shoulder, hip), hinge (knee, elbow), pivot (between atlas and axis), gliding (between carpals) and saddle (carpal–metacarpal of thumb).', 'সাইনোভিয়াল সন্ধির মধ্যে আছে বল-সকেট (কাঁধ, নিতম্ব), কবজা (হাঁটু, কনুই), পিভট (অ্যাটলাস ও অ্যাক্সিসের মাঝে), গ্লাইডিং (কারপালগুলির মাঝে) ও স্যাডল (বুড়ো আঙুলের কারপাল-মেটাকারপাল)।', [S.NCERT_XI_LOCO, S.OS_AP_JOINTS]),
    claim('tis.joint.cartilage', 'class10', 'Bone ends in synovial joints are covered by smooth cartilage and lubricated by synovial fluid, reducing friction.', 'সাইনোভিয়াল সন্ধিতে অস্থির প্রান্ত মসৃণ তরুণাস্থিতে ঢাকা থাকে এবং সাইনোভিয়াল তরলে পিচ্ছিল থাকে, ফলে ঘর্ষণ কমে।', [S.OS_AP_JOINTS, S.NCERT_IX])
  ],
  parts: [
    part('ball', 'class9', '#fde68a', 'Ball-and-socket joint', 'বল-সকেট সন্ধি', 'A rounded head fits in a cup: movement in all directions.', 'গোল মাথা একটি বাটির মধ্যে বসে থাকে: সব দিকে চলন সম্ভব।', 'class11-12', 'Shoulder (humerus–pectoral girdle) and hip (femur–pelvis).', 'কাঁধ (হিউমেরাস–বক্ষ-অস্থিচক্র) ও নিতম্ব (ফিমার–শ্রোণিচক্র)।'),
    part('hinge', 'class9', '#fbbf24', 'Hinge joint', 'কবজা সন্ধি', 'Moves in one plane, like a door hinge.', 'দরজার কবজার মতো একটি তলে চলে।', 'class11-12', 'Knee and elbow.', 'হাঁটু ও কনুই।'),
    part('cartilage', 'class10', '#bae6fd', 'Articular cartilage', 'সন্ধি-তরুণাস্থি', 'Smooth layer covering bone ends.', 'অস্থির প্রান্ত ঢেকে রাখা মসৃণ স্তর।', 'class11-12', 'Has no blood vessels, so it heals slowly.', 'এতে রক্তবাহ নেই, তাই ধীরে সারে।'),
    part('capsule', 'class11-12', '#93c5fd', 'Synovial capsule & fluid', 'সাইনোভিয়াল আবরণী ও তরল', 'Fluid-filled capsule that lubricates the joint.', 'তরলপূর্ণ আবরণী, যা সন্ধিকে পিচ্ছিল রাখে।', 'class11-12', 'Ligaments around the capsule hold bones together.', 'আবরণীর চারপাশের লিগামেন্ট অস্থিগুলিকে ধরে রাখে।'),
    part('bone', 'class9', '#f5f5f4', 'Bones', 'অস্থি', 'Rigid levers moved by muscles.', 'পেশির দ্বারা চালিত দৃঢ় লিভার।', 'class11-12', 'Muscles pull bones via tendons; bones never push.', 'পেশি টেন্ডনের মাধ্যমে অস্থিকে টানে; ঠেলে না।')
  ],
  chapters: [
    chapter('overview', 'class9', 14, '1. Two joints', '1. দুটি সন্ধি', 'A ball-and-socket joint (left) and a hinge joint (right).', 'একটি বল-সকেট সন্ধি (বাঁয়ে) ও একটি কবজা সন্ধি (ডানে)।'),
    chapter('motion', 'class9', 20, '2. Range of movement', '2. চলনের পরিসর', 'The ball-and-socket joint swings and rotates in many directions; the hinge bends only back and forth.', 'বল-সকেট সন্ধি বিভিন্ন দিকে দোলে ও ঘোরে; কবজা সন্ধি কেবল সামনে-পেছনে ভাঁজ হয়।')
  ],
  myths: [
    myth('class9', '"Muscles push bones to straighten a limb."', '"অঙ্গ সোজা করতে পেশি অস্থিকে ঠেলে।"', 'Muscles can only pull; opposite muscles (like biceps and triceps) work in pairs.', 'পেশি কেবল টানতে পারে; বিপরীত পেশি (যেমন বাইসেপস ও ট্রাইসেপস) জোড়ায় কাজ করে।')
  ],
  quiz: [
    quiz('jo1', 'class9', 'The shoulder is a…', 'কাঁধ কোন ধরনের সন্ধি?', [['Ball-and-socket joint', 'বল-সকেট সন্ধি'], ['Hinge joint', 'কবজা সন্ধি'], ['Fixed joint', 'অচল সন্ধি'], ['Pivot joint', 'পিভট সন্ধি']], 0, 'tis.joint.synovial'),
    quiz('jo2', 'class9', 'The knee is a…', 'হাঁটু কোন ধরনের সন্ধি?', [['Hinge joint', 'কবজা সন্ধি'], ['Ball-and-socket joint', 'বল-সকেট সন্ধি'], ['Suture', 'সেলাই-সন্ধি'], ['Gliding joint', 'গ্লাইডিং সন্ধি']], 0, 'tis.joint.synovial'),
    quiz('jo3', 'class9', 'Skull bones are joined by…', 'করোটির অস্থিগুলি কীসের দ্বারা যুক্ত?', [['Immovable fibrous joints', 'অচল তন্তুময় সন্ধি'], ['Ball-and-socket joints', 'বল-সকেট সন্ধি'], ['Hinge joints', 'কবজা সন্ধি'], ['Synovial fluid only', 'কেবল সাইনোভিয়াল তরল']], 0, 'tis.joint.types'),
    quiz('jo4', 'class11-12', 'How many bones are in the adult human skeleton?', 'প্রাপ্তবয়স্ক মানুষের কঙ্কালে কয়টি অস্থি থাকে?', [['206', '206'], ['300', '300'], ['126', '126'], ['80', '80']], 0, 'tis.joint.206')
  ],
  limitation: limitation('Bones are simplified cylinders and spheres; ligaments are not drawn.', 'অস্থিগুলি সরল নল ও গোলক হিসেবে দেখানো হয়েছে; লিগামেন্ট আঁকা হয়নি।')
};

const plantTissue = {
  id: 'plant-tissue', tag: { en: 'plant', bn: 'উদ্ভিদ' },
  title: { en: 'Plant tissues', bn: 'উদ্ভিদ কলা (Plant tissues)' },
  lead: { en: 'Dividing meristem at the tip, and conducting xylem and phloem in the stem.', bn: 'অগ্রভাগে বিভাজনক্ষম ভাজক কলা, এবং কাণ্ডে পরিবহণকারী জাইলেম ও ফ্লোয়েম।' },
  claims: [
    claim('tis.pl.meristem', 'class9', 'Meristematic tissue has actively dividing cells and is found at growing tips of roots and stems (apical meristem).', 'ভাজক কলার কোশগুলি সক্রিয়ভাবে বিভাজিত হয় এবং মূল ও কাণ্ডের বর্ধনশীল অগ্রভাগে (অগ্রস্থ ভাজক কলা) থাকে।', [S.NCERT_IX, S.OS_BIO_PLANT]),
    claim('tis.pl.xylem', 'class9', 'Xylem carries water and minerals upward; it has tracheids, vessels, xylem parenchyma and xylem fibres.', 'জাইলেম জল ও খনিজ লবণ ওপরের দিকে বহন করে; এতে ট্রাকিড, ভেসেল, জাইলেম প্যারেনকাইমা ও জাইলেম তন্তু থাকে।', [S.NCERT_IX, S.OS_BIO_PLANT]),
    claim('tis.pl.phloem', 'class9', 'Phloem carries food from leaves to other parts in both directions; it has sieve tubes, companion cells, phloem parenchyma and phloem fibres.', 'ফ্লোয়েম পাতা থেকে খাদ্য অন্যান্য অংশে উভয় দিকে বহন করে; এতে সীভনল, সঙ্গীকোশ, ফ্লোয়েম প্যারেনকাইমা ও ফ্লোয়েম তন্তু থাকে।', [S.NCERT_IX, S.OS_BIO_PLANT]),
    claim('tis.pl.dead', 'class11-12', 'Mature tracheids, vessels and phloem fibres are dead; sieve tubes are living but lack a nucleus.', 'পরিণত ট্রাকিড, ভেসেল ও ফ্লোয়েম তন্তু মৃত; সীভনল জীবিত কিন্তু নিউক্লিয়াসবিহীন।', [S.NCERT_XI_ANAT, S.OS_BIO_PLANT])
  ],
  parts: [
    part('meristem', 'class9', '#86efac', 'Apical meristem', 'অগ্রস্থ ভাজক কলা', 'Small, dense, dividing cells at the tip.', 'অগ্রভাগের ছোট, ঘন, বিভাজনক্ষম কোশ।', 'class11-12', 'Cells have dense cytoplasm, thin walls and no vacuoles.', 'কোশে ঘন সাইটোপ্লাজম, পাতলা প্রাচীর থাকে এবং গহ্বর থাকে না।'),
    part('xylem', 'class9', '#60a5fa', 'Xylem vessels', 'জাইলেম ভেসেল', 'Hollow tubes carrying water upward.', 'ফাঁপা নল, যা জল ওপরের দিকে বহন করে।', 'class11-12', 'Walls thickened with lignin; mature cells are dead.', 'প্রাচীর লিগনিনে পুরু; পরিণত কোশ মৃত।'),
    part('phloem', 'class9', '#fb923c', 'Phloem sieve tubes', 'ফ্লোয়েম সীভনল', 'Living tubes carrying food.', 'খাদ্য বহনকারী জীবিত নল।', 'class11-12', 'Sieve plates connect cells; companion cells support them.', 'সীভপ্লেট কোশগুলিকে যুক্ত করে; সঙ্গীকোশ এদের সাহায্য করে।'),
    part('parenchyma', 'class9', '#bef264', 'Parenchyma', 'প্যারেনকাইমা (Parenchyma)', 'Living, thin-walled packing cells that store food.', 'জীবিত, পাতলা প্রাচীরযুক্ত কোশ, যা খাদ্য সঞ্চয় করে।', 'class10', 'With chloroplasts it is called chlorenchyma.', 'ক্লোরোপ্লাস্টযুক্ত হলে একে ক্লোরেনকাইমা বলে।')
  ],
  chapters: [
    chapter('overview', 'class9', 14, '1. Growing tip and stem', '1. বর্ধনশীল অগ্রভাগ ও কাণ্ড', 'Dividing cells at the tip; conducting tubes further down.', 'অগ্রভাগে বিভাজনক্ষম কোশ; নিচে পরিবহণকারী নল।'),
    chapter('transport', 'class9', 18, '2. Two-way traffic', '2. দুই দিকের পরিবহণ', 'Water rises in xylem; food moves in phloem both up and down.', 'জাইলেমে জল ওপরে ওঠে; ফ্লোয়েমে খাদ্য ওপরে ও নিচে দুই দিকেই যায়।')
  ],
  myths: [
    myth('class9', '"Phloem carries food only downward."', '"ফ্লোয়েম কেবল নিচের দিকে খাদ্য বহন করে।"', 'Phloem moves food both ways — to wherever it is needed or stored.', 'ফ্লোয়েম উভয় দিকে খাদ্য বহন করে — যেখানে প্রয়োজন বা সঞ্চয় হয়।')
  ],
  quiz: [
    quiz('pt1', 'class9', 'Water moves up the plant in…', 'উদ্ভিদে জল কোন কলার মধ্য দিয়ে ওপরে ওঠে?', [['Xylem', 'জাইলেম'], ['Phloem', 'ফ্লোয়েম'], ['Meristem', 'ভাজক কলা'], ['Epidermis', 'ত্বক']], 0, 'tis.pl.xylem'),
    quiz('pt2', 'class9', 'Food is carried by…', 'খাদ্য বহন করে…', [['Phloem', 'ফ্লোয়েম'], ['Xylem', 'জাইলেম'], ['Cork', 'কর্ক'], ['Sclerenchyma', 'স্ক্লেরেনকাইমা']], 0, 'tis.pl.phloem'),
    quiz('pt3', 'class9', 'Growth in length happens at the…', 'দৈর্ঘ্যে বৃদ্ধি কোথায় ঘটে?', [['Apical meristem', 'অগ্রস্থ ভাজক কলা'], ['Phloem', 'ফ্লোয়েম'], ['Xylem fibres', 'জাইলেম তন্তু'], ['Cork', 'কর্ক']], 0, 'tis.pl.meristem'),
    quiz('pt4', 'class11-12', 'Which is living but has no nucleus at maturity?', 'কোনটি জীবিত কিন্তু পরিণত অবস্থায় নিউক্লিয়াসবিহীন?', [['Sieve tube', 'সীভনল'], ['Vessel', 'ভেসেল'], ['Tracheid', 'ট্রাকিড'], ['Phloem fibre', 'ফ্লোয়েম তন্তু']], 0, 'tis.pl.dead')
  ],
  limitation: limitation('Tip and stem are joined in one view; cell sizes are not proportional.', 'অগ্রভাগ ও কাণ্ড একটি দৃশ্যে জোড়া হয়েছে; কোশের আকার আনুপাতিক নয়।')
};

export const tissuePacks = [muscle, epithelium, connective, nervous, joints, plantTissue];
