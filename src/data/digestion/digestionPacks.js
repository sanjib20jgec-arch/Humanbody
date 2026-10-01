// Digestion bay deep-dive packs (docs/bays/DIGESTION_MASTERPLAN.md).
// NEET dropped digestion, so the deepest layer here is the "Advanced" (Class 11–12) layer kept by user decision.
import { claim, part, chapter, myth, quiz, limitation } from '../packHelpers.js';

const S = {
  NCERT_X: { kind: 'syllabus', title: 'NCERT Science Class 10 (Reprint 2026-27), Ch 5 Life Processes — Nutrition', url: 'https://ncert.nic.in/textbook/pdf/jesc105.pdf' },
  NCERT_VII: { kind: 'syllabus', title: 'NCERT Science Class 7, Nutrition in Animals', url: 'https://ncert.nic.in/textbook.php' },
  OS_AP23: { kind: 'reference', title: 'OpenStax Anatomy & Physiology 2e, Ch 23 The Digestive System (CC BY 4.0)', url: 'https://openstax.org/books/anatomy-and-physiology-2e/pages/23-introduction' },
  OS_AP_STOMACH: { kind: 'reference', title: 'OpenStax Anatomy & Physiology 2e, 23.4 The Stomach (CC BY 4.0)', url: 'https://openstax.org/books/anatomy-and-physiology-2e/pages/23-4-the-stomach' },
  OS_AP_SI: { kind: 'reference', title: 'OpenStax Anatomy & Physiology 2e, 23.5 The Small and Large Intestines (CC BY 4.0)', url: 'https://openstax.org/books/anatomy-and-physiology-2e/pages/23-5-the-small-and-large-intestines' },
  OS_AP_CHEM: { kind: 'reference', title: 'OpenStax Anatomy & Physiology 2e, 23.7 Chemical Digestion and Absorption (CC BY 4.0)', url: 'https://openstax.org/books/anatomy-and-physiology-2e/pages/23-7-chemical-digestion-and-absorption-a-closer-look' },
  OS_BIO_ENZ: { kind: 'reference', title: 'OpenStax Biology 2e, 6.5 Enzymes (CC BY 4.0)', url: 'https://openstax.org/books/biology-2e/pages/6-5-enzymes' },
  GUYTON: { kind: 'textbook', title: 'Hall J.E., Hall M.E. Guyton and Hall Textbook of Medical Physiology, 14th ed. (2021), Unit XII Gastrointestinal Physiology', citation: 'Elsevier, ISBN 978-0-323-59712-8' },
  HELANDER: { kind: 'peer-reviewed', title: 'Helander H.F., Fändriks L. (2014) Surface area of the digestive tract – revisited. Scand J Gastroenterol 49:681–689', url: 'https://doi.org/10.3109/00365521.2014.898326' }
};

const stomach = {
  id: 'stomach', tag: { en: 'organ', bn: 'অঙ্গ' },
  title: { en: 'Stomach and gastric glands', bn: 'পাকস্থলী ও পাচক গ্রন্থি (Gastric glands)' },
  lead: { en: 'A muscular bag that churns food and releases acid, pepsin and mucus.', bn: 'একটি পেশিময় থলি, যা খাদ্য মন্থন করে এবং অ্যাসিড, পেপসিন ও শ্লেষ্মা নিঃসরণ করে।' },
  claims: [
    claim('dig.sto.glands', 'class9', 'Gastric glands in the stomach wall release hydrochloric acid, the protein-digesting enzyme pepsin, and mucus.', 'পাকস্থলীর প্রাচীরের পাচক গ্রন্থি হাইড্রোক্লোরিক অ্যাসিড, প্রোটিন পরিপাককারী উৎসেচক পেপসিন এবং শ্লেষ্মা নিঃসরণ করে।', [S.NCERT_X, S.OS_AP_STOMACH]),
    claim('dig.sto.acid', 'class10', 'Hydrochloric acid makes the stomach contents acidic, which pepsin needs to act, and kills many microbes.', 'হাইড্রোক্লোরিক অ্যাসিড পাকস্থলীর ভেতরের মাধ্যমকে আম্লিক করে, যা পেপসিনের কাজের জন্য প্রয়োজন, এবং বহু জীবাণু ধ্বংস করে।', [S.NCERT_X, S.OS_AP_STOMACH]),
    claim('dig.sto.mucus', 'class10', 'Mucus protects the inner lining of the stomach from the action of the acid.', 'শ্লেষ্মা পাকস্থলীর ভেতরের আস্তরণকে অ্যাসিডের ক্রিয়া থেকে রক্ষা করে।', [S.NCERT_X, S.OS_AP_STOMACH]),
    claim('dig.sto.pepsinogen', 'class11-12', 'Pepsin is secreted as inactive pepsinogen and is activated by hydrochloric acid, so the gland cells are not digested.', 'পেপসিন নিষ্ক্রিয় পেপসিনোজেন রূপে নিঃসৃত হয় এবং হাইড্রোক্লোরিক অ্যাসিড একে সক্রিয় করে, তাই গ্রন্থিকোশ নিজে পরিপাক হয় না।', [S.OS_AP_STOMACH, S.OS_AP_CHEM, S.GUYTON])
  ],
  parts: [
    part('wall', 'class9', '#fb7185', 'Muscular wall', 'পেশিময় প্রাচীর', 'Smooth muscle layers churn and mix food.', 'মসৃণ পেশির স্তর খাদ্যকে মন্থন করে ও মেশায়।', 'class11-12', 'The stomach has an extra oblique muscle layer for strong churning.', 'জোরালো মন্থনের জন্য পাকস্থলীতে একটি অতিরিক্ত তির্যক পেশিস্তর থাকে।'),
    part('rugae', 'class10', '#fda4af', 'Folds (rugae)', 'ভাঁজ (রুগি)', 'Inner folds let the empty stomach expand after a meal.', 'ভেতরের ভাঁজগুলি খাওয়ার পর খালি পাকস্থলীকে প্রসারিত হতে দেয়।', 'class11-12', 'Folds flatten as the stomach fills.', 'পাকস্থলী ভরে উঠলে ভাঁজগুলি সমান হয়ে যায়।'),
    part('glands', 'class9', '#a78bfa', 'Gastric glands', 'পাচক গ্রন্থি', 'Pits in the lining that release gastric juice.', 'আস্তরণের গর্ত, যা পাচকরস নিঃসরণ করে।', 'class11-12', 'Parietal cells release acid; chief cells release pepsinogen.', 'প্যারাইটাল কোশ অ্যাসিড এবং চিফ কোশ পেপসিনোজেন নিঃসরণ করে।'),
    part('acid', 'class10', '#facc15', 'Hydrochloric acid', 'হাইড্রোক্লোরিক অ্যাসিড', 'Makes the medium acidic and kills microbes.', 'মাধ্যমকে আম্লিক করে ও জীবাণু ধ্বংস করে।', 'class11-12', 'It also converts pepsinogen into active pepsin.', 'এটি পেপসিনোজেনকে সক্রিয় পেপসিনে পরিণত করে।'),
    part('mucus', 'class10', '#86efac', 'Mucus layer', 'শ্লেষ্মা স্তর', 'Protects the lining from acid.', 'আস্তরণকে অ্যাসিড থেকে রক্ষা করে।', 'class11-12', 'Mucus traps bicarbonate, keeping the surface nearly neutral.', 'শ্লেষ্মা বাইকার্বনেট ধরে রাখে, ফলে আস্তরণের ঠিক ওপরের তল প্রায় নিরপেক্ষ থাকে।')
  ],
  chapters: [
    chapter('overview', 'class9', 15, '1. A churning bag', '1. মন্থনকারী থলি', 'The stomach wall contracts and relaxes, mixing food with gastric juice.', 'পাকস্থলীর প্রাচীর সংকুচিত ও প্রসারিত হয়ে খাদ্যকে পাচকরসের সঙ্গে মেশায়।'),
    chapter('secretion', 'class10', 20, '2. Acid, pepsin, mucus', '2. অ্যাসিড, পেপসিন, শ্লেষ্মা', 'Gastric glands release acid and pepsin into the cavity while mucus coats the lining.', 'পাচক গ্রন্থি গহ্বরে অ্যাসিড ও পেপসিন ছাড়ে, আর শ্লেষ্মা আস্তরণকে ঢেকে রাখে।')
  ],
  myths: [
    myth('class9', '"Digestion starts in the stomach."', '"পরিপাক পাকস্থলীতে শুরু হয়।"', 'Digestion starts in the mouth: chewing breaks food and salivary amylase begins to digest starch.', 'পরিপাক মুখগহ্বরে শুরু হয়: চর্বণে খাদ্য ভাঙে এবং লালারসের অ্যামাইলেজ শ্বেতসার পরিপাক শুরু করে।'),
    myth('class10', '"The stomach absorbs most of our food."', '"পাকস্থলী আমাদের খাদ্যের বেশিরভাগ শোষণ করে।"', 'Most absorption happens in the small intestine.', 'বেশিরভাগ শোষণ ক্ষুদ্রান্ত্রে ঘটে।')
  ],
  quiz: [
    quiz('st1', 'class9', 'Which enzyme in gastric juice digests proteins?', 'পাচকরসের কোন উৎসেচক প্রোটিন পরিপাক করে?', [['Pepsin', 'পেপসিন'], ['Amylase', 'অ্যামাইলেজ'], ['Lipase', 'লাইপেজ'], ['Bile', 'পিত্ত']], 0, 'dig.sto.glands'),
    quiz('st2', 'class9', 'Which acid is released in the stomach?', 'পাকস্থলীতে কোন অ্যাসিড নিঃসৃত হয়?', [['Hydrochloric acid', 'হাইড্রোক্লোরিক অ্যাসিড'], ['Sulphuric acid', 'সালফিউরিক অ্যাসিড'], ['Nitric acid', 'নাইট্রিক অ্যাসিড'], ['Acetic acid', 'অ্যাসেটিক অ্যাসিড']], 0, 'dig.sto.glands'),
    quiz('st3', 'class9', 'Gastric glands release…', 'পাচক গ্রন্থি নিঃসরণ করে…', [['Acid, pepsin and mucus', 'অ্যাসিড, পেপসিন ও শ্লেষ্মা'], ['Only bile', 'কেবল পিত্ত'], ['Only saliva', 'কেবল লালারস'], ['Insulin', 'ইনসুলিন']], 0, 'dig.sto.glands'),
    quiz('st4', 'class10', 'What protects the stomach lining from acid?', 'কী পাকস্থলীর আস্তরণকে অ্যাসিড থেকে রক্ষা করে?', [['Mucus', 'শ্লেষ্মা'], ['Pepsin', 'পেপসিন'], ['Bile', 'পিত্ত'], ['Villi', 'ভিলাই']], 0, 'dig.sto.mucus'),
    quiz('st5', 'class11-12', 'Pepsinogen is converted to pepsin by…', 'পেপসিনোজেন কীসের দ্বারা পেপসিনে পরিণত হয়?', [['Hydrochloric acid', 'হাইড্রোক্লোরিক অ্যাসিড'], ['Bile', 'পিত্ত'], ['Mucus', 'শ্লেষ্মা'], ['Saliva', 'লালারস']], 0, 'dig.sto.pepsinogen')
  ],
  limitation: limitation('Gland pits and acid particles are enlarged and few in number.', 'গ্রন্থিগর্ত ও অ্যাসিড কণা সংখ্যায় কম এবং আকারে বড় করে দেখানো হয়েছে।')
};

const villus = {
  id: 'villus', tag: { en: 'absorption', bn: 'শোষণ' },
  title: { en: 'Villi of the small intestine', bn: 'ক্ষুদ্রান্ত্রের ভিলাই (Villi)' },
  lead: { en: 'Finger-like folds that give the small intestine a huge absorbing surface.', bn: 'আঙুলের মতো প্রবর্ধক, যা ক্ষুদ্রান্ত্রকে বিশাল শোষণ-তল দেয়।' },
  claims: [
    claim('dig.vil.area', 'class9', 'The inner lining of the small intestine has many finger-like projections called villi, which increase the surface area for absorption.', 'ক্ষুদ্রান্ত্রের ভেতরের আস্তরণে ভিলাই নামে অসংখ্য আঙুলের মতো প্রবর্ধক থাকে, যা শোষণের তল বাড়ায়।', [S.NCERT_X, S.OS_AP_SI]),
    claim('dig.vil.blood', 'class9', 'Villi are richly supplied with blood vessels, which carry absorbed food to every cell of the body.', 'ভিলাইতে প্রচুর রক্তবাহ থাকে, যা শোষিত খাদ্যকে দেহের প্রতিটি কোশে পৌঁছে দেয়।', [S.NCERT_X, S.OS_AP_SI]),
    claim('dig.vil.lacteal', 'class11-12', 'Glucose and amino acids enter the blood capillaries of a villus, while digested fats enter its central lymph vessel (lacteal).', 'গ্লুকোজ ও অ্যামাইনো অ্যাসিড ভিলাসের রক্তজালকে প্রবেশ করে, কিন্তু পরিপাক হওয়া স্নেহপদার্থ এর কেন্দ্রীয় লসিকানালিতে (ল্যাকটিয়াল) প্রবেশ করে।', [S.OS_AP_CHEM, S.OS_AP_SI, S.GUYTON]),
    claim('dig.vil.surface', 'class11-12', 'Measured with modern methods, the total inner surface of the adult small intestine is about 30 m² (whole gut about 32 m²) — far less than the older "tennis court" estimate.', 'আধুনিক পদ্ধতিতে মাপলে প্রাপ্তবয়স্কের ক্ষুদ্রান্ত্রের মোট ভেতরের তল প্রায় 30 m² (সমগ্র পৌষ্টিকনালি প্রায় 32 m²) — পুরোনো "টেনিস কোর্ট" অনুমানের চেয়ে অনেক কম।', [S.HELANDER, S.OS_AP_SI], { value: 30, unit: 'm²', range: [30, 32] })
  ],
  parts: [
    part('villus', 'class9', '#fda4af', 'Villus', 'ভিলাস (Villus)', 'A finger-like fold of the lining.', 'আস্তরণের আঙুলের মতো একটি প্রবর্ধক।', 'class11-12', 'Its surface is a single layer of columnar cells.', 'এর তল একস্তর স্তম্ভাকার কোশ দিয়ে তৈরি।'),
    part('capillary', 'class9', '#ef4444', 'Blood capillaries', 'রক্তজালক', 'Take up absorbed sugars and amino acids.', 'শোষিত শর্করা ও অ্যামাইনো অ্যাসিড গ্রহণ করে।', 'class11-12', 'Blood from villi goes first to the liver.', 'ভিলাইয়ের রক্ত প্রথমে যকৃতে যায়।'),
    part('lacteal', 'class10', '#fef08a', 'Lacteal', 'ল্যাকটিয়াল (Lacteal)', 'Central lymph vessel of the villus.', 'ভিলাসের কেন্দ্রীয় লসিকানালি।', 'class11-12', 'Absorbs fats packed as tiny lipoprotein particles.', 'ক্ষুদ্র লাইপোপ্রোটিন কণা রূপে স্নেহপদার্থ শোষণ করে।'),
    part('microvilli', 'class11-12', '#38bdf8', 'Microvilli', 'মাইক্রোভিলাই (Microvilli)', 'Tiny projections on each surface cell.', 'প্রতিটি তলকোশের ওপরের অতি ক্ষুদ্র প্রবর্ধক।', 'class11-12', 'They form the brush border and carry some digestive enzymes.', 'এরা ব্রাশ বর্ডার তৈরি করে এবং কিছু পাচক উৎসেচক বহন করে।'),
    part('nutrient', 'class10', '#22c55e', 'Nutrients', 'পুষ্টি উপাদান', 'Small digested molecules being absorbed.', 'শোষিত হতে থাকা ছোট পরিপাক-হওয়া অণু।', 'class11-12', 'Green: sugars and amino acids; yellow: fats.', 'সবুজ: শর্করা ও অ্যামাইনো অ্যাসিড; হলুদ: স্নেহপদার্থ।')
  ],
  chapters: [
    chapter('overview', 'class9', 15, '1. A forest of villi', '1. ভিলাইয়ের অরণ্য', 'Thousands of villi line the small intestine and greatly increase its surface.', 'হাজার হাজার ভিলাই ক্ষুদ্রান্ত্রের আস্তরণ তৈরি করে এবং এর তল বহুগুণ বাড়ায়।'),
    chapter('absorb', 'class10', 22, '2. Into blood and lymph', '2. রক্ত ও লসিকায়', 'Sugars and amino acids pass into blood capillaries; fats pass into the lacteal.', 'শর্করা ও অ্যামাইনো অ্যাসিড রক্তজালকে এবং স্নেহপদার্থ ল্যাকটিয়ালে প্রবেশ করে।')
  ],
  myths: [
    myth('class11-12', '"The gut lining is as big as a tennis court."', '"পৌষ্টিকনালির আস্তরণ একটি টেনিস কোর্টের সমান।"', 'Modern measurements give about 30 m² — roughly half a badminton court.', 'আধুনিক পরিমাপ অনুযায়ী এটি প্রায় 30 m² — মোটামুটি অর্ধেক ব্যাডমিন্টন কোর্ট।')
  ],
  quiz: [
    quiz('vi1', 'class9', 'Villi mainly help in…', 'ভিলাই প্রধানত সাহায্য করে…', [['Absorption', 'শোষণে'], ['Chewing', 'চর্বণে'], ['Breathing', 'শ্বাসকার্যে'], ['Making bile', 'পিত্ত তৈরিতে']], 0, 'dig.vil.area'),
    quiz('vi2', 'class9', 'Villi increase the…', 'ভিলাই বাড়ায়…', [['Surface area', 'তলের ক্ষেত্রফল'], ['Acidity', 'আম্লিকতা'], ['Length of the stomach', 'পাকস্থলীর দৈর্ঘ্য'], ['Number of teeth', 'দাঁতের সংখ্যা']], 0, 'dig.vil.area'),
    quiz('vi3', 'class9', 'Absorbed food is carried from villi by…', 'ভিলাই থেকে শোষিত খাদ্য বহন করে…', [['Blood vessels', 'রক্তবাহ'], ['Nerves', 'স্নায়ু'], ['Muscles', 'পেশি'], ['Bones', 'অস্থি']], 0, 'dig.vil.blood'),
    quiz('vi4', 'class11-12', 'Digested fats are absorbed mainly into…', 'পরিপাক হওয়া স্নেহপদার্থ প্রধানত কোথায় শোষিত হয়?', [['Lacteals', 'ল্যাকটিয়ালে'], ['Blood capillaries only', 'কেবল রক্তজালকে'], ['Stomach wall', 'পাকস্থলীর প্রাচীরে'], ['Gallbladder', 'পিত্তথলিতে']], 0, 'dig.vil.lacteal')
  ],
  limitation: limitation('Villi are shown much larger and fewer than real; particle speeds are slowed.', 'ভিলাইকে বাস্তবের চেয়ে অনেক বড় ও সংখ্যায় কম দেখানো হয়েছে; কণার গতি ধীর করা হয়েছে।')
};

const peristalsis = {
  id: 'peristalsis', tag: { en: 'movement', bn: 'চলন' },
  title: { en: 'Peristalsis', bn: 'ক্রমসংকোচন (Peristalsis)' },
  lead: { en: 'Waves of muscle contraction push food along the gut, even upside down.', bn: 'পেশির সংকোচনের ঢেউ খাদ্যকে পৌষ্টিকনালি বরাবর ঠেলে নিয়ে যায়, এমনকি উল্টো অবস্থাতেও।' },
  claims: [
    claim('dig.per.wave', 'class9', 'Rhythmic contraction of the muscles lining the gut pushes food forward; this movement is called peristalsis.', 'পৌষ্টিকনালির প্রাচীরের পেশির ছন্দময় সংকোচন খাদ্যকে সামনে ঠেলে দেয়; এই চলনকে ক্রমসংকোচন বলে।', [S.NCERT_X, S.OS_AP23]),
    claim('dig.per.smooth', 'class10', 'Peristalsis is produced by smooth (involuntary) muscle, so we do not control it consciously.', 'ক্রমসংকোচন মসৃণ (অনৈচ্ছিক) পেশির দ্বারা ঘটে, তাই আমরা একে ইচ্ছামতো নিয়ন্ত্রণ করি না।', [S.NCERT_X, S.OS_AP23]),
    claim('dig.per.layers', 'class11-12', 'Behind the food, circular muscle contracts and squeezes; ahead of it, the gut relaxes, so the bolus moves one way.', 'খাদ্যের পেছনে বৃত্তাকার পেশি সংকুচিত হয়ে চাপ দেয়; সামনে নালি শিথিল থাকে, তাই খাদ্যপিণ্ড একদিকে এগোয়।', [S.OS_AP23, S.OS_AP_SI, S.GUYTON])
  ],
  parts: [
    part('tube', 'class9', '#fda4af', 'Oesophagus', 'গ্রাসনালি (Oesophagus)', 'Muscular tube from throat to stomach.', 'গলা থেকে পাকস্থলী পর্যন্ত পেশিময় নল।', 'class11-12', 'Its upper part has skeletal muscle, the lower part smooth muscle.', 'এর ওপরের অংশে কঙ্কালপেশি এবং নিচের অংশে মসৃণ পেশি থাকে।'),
    part('ring', 'class9', '#f43f5e', 'Muscle ring', 'পেশিবলয়', 'Circular muscle that squeezes behind the food.', 'বৃত্তাকার পেশি, যা খাদ্যের পেছনে চাপ দেয়।', 'class11-12', 'Longitudinal muscle shortens the segment ahead.', 'অনুদৈর্ঘ্য পেশি সামনের অংশকে ছোট করে।'),
    part('bolus', 'class9', '#f59e0b', 'Bolus', 'খাদ্যপিণ্ড (Bolus)', 'Chewed food rolled with saliva.', 'লালারস মিশ্রিত চর্বিত খাদ্যের দলা।', 'class10', 'Saliva moistens and lubricates it for swallowing.', 'লালারস একে ভিজিয়ে পিচ্ছিল করে, ফলে গেলা সহজ হয়।')
  ],
  chapters: [
    chapter('overview', 'class9', 14, '1. The food pipe', '1. খাদ্যনালি', 'A soft muscular tube carries the bolus from the mouth to the stomach.', 'একটি নরম পেশিময় নল খাদ্যপিণ্ডকে মুখ থেকে পাকস্থলীতে নিয়ে যায়।'),
    chapter('wave', 'class9', 20, '2. The squeeze wave', '2. সংকোচনের ঢেউ', 'A ring of contraction travels down the tube, pushing the bolus ahead of it.', 'সংকোচনের একটি বলয় নল বরাবর নিচে নামে এবং খাদ্যপিণ্ডকে সামনে ঠেলে দেয়।')
  ],
  myths: [
    myth('class9', '"Food falls to the stomach by gravity."', '"খাদ্য অভিকর্ষের টানে পাকস্থলীতে পড়ে।"', 'Peristalsis moves food even when you lie down or hang upside down.', 'শুয়ে থাকলে বা উল্টো ঝুললেও ক্রমসংকোচন খাদ্যকে সরায়।')
  ],
  quiz: [
    quiz('pe1', 'class9', 'Peristalsis is…', 'ক্রমসংকোচন হলো…', [['Rhythmic muscle contraction that moves food', 'খাদ্য সরানোর জন্য পেশির ছন্দময় সংকোচন'], ['Chewing', 'চর্বণ'], ['Digestion of fat', 'স্নেহপদার্থের পরিপাক'], ['Absorption of water', 'জল শোষণ']], 0, 'dig.per.wave'),
    quiz('pe2', 'class9', 'Peristalsis occurs in…', 'ক্রমসংকোচন ঘটে…', [['The whole gut', 'সমগ্র পৌষ্টিকনালিতে'], ['Only the mouth', 'কেবল মুখগহ্বরে'], ['The lungs', 'ফুসফুসে'], ['The kidneys', 'বৃক্কে']], 0, 'dig.per.wave'),
    quiz('pe3', 'class9', 'Can you swallow while hanging upside down?', 'উল্টো ঝুলে থাকলে কি গেলা যায়?', [['Yes, because of peristalsis', 'হ্যাঁ, ক্রমসংকোচনের জন্য'], ['No, gravity is needed', 'না, অভিকর্ষ প্রয়োজন'], ['Only liquids', 'কেবল তরল'], ['Only in sleep', 'কেবল ঘুমের মধ্যে']], 0, 'dig.per.wave'),
    quiz('pe4', 'class10', 'Peristalsis is caused by…', 'ক্রমসংকোচন ঘটায়…', [['Smooth muscle', 'মসৃণ পেশি'], ['Skeletal muscle of the arm', 'হাতের কঙ্কালপেশি'], ['Cardiac muscle', 'হৃৎপেশি'], ['Bone', 'অস্থি']], 0, 'dig.per.smooth')
  ],
  limitation: limitation('The wave is shown much faster and the wall much thinner than real.', 'ঢেউকে বাস্তবের চেয়ে অনেক দ্রুত এবং প্রাচীরকে অনেক পাতলা দেখানো হয়েছে।')
};

const bile = {
  id: 'bile', tag: { en: 'chemistry', bn: 'রসায়ন' },
  title: { en: 'Bile and fat digestion', bn: 'পিত্ত ও স্নেহপদার্থের পরিপাক' },
  lead: { en: 'Bile breaks large fat globules into tiny droplets so lipase can work faster.', bn: 'পিত্ত বড় স্নেহবিন্দুকে ক্ষুদ্র বিন্দুতে ভাঙে, ফলে লাইপেজ দ্রুত কাজ করতে পারে।' },
  claims: [
    claim('dig.bil.source', 'class9', 'Bile is made in the liver and stored in the gallbladder; it enters the small intestine.', 'পিত্ত যকৃতে তৈরি হয় এবং পিত্তথলিতে জমা থাকে; এটি ক্ষুদ্রান্ত্রে প্রবেশ করে।', [S.NCERT_X, S.OS_AP23]),
    claim('dig.bil.emulsify', 'class10', 'Bile salts break large fat globules into smaller globules (emulsification), increasing the efficiency of lipase; bile also makes the medium alkaline for pancreatic enzymes.', 'পিত্তলবণ বড় স্নেহবিন্দুকে ছোট ছোট বিন্দুতে ভাঙে (অবদ্রবণ), ফলে লাইপেজের কার্যকারিতা বাড়ে; পিত্ত অগ্ন্যাশয়ের উৎসেচকের জন্য মাধ্যমকে ক্ষারীয় করে।', [S.NCERT_X, S.OS_AP_CHEM]),
    claim('dig.bil.lipase', 'class10', 'Pancreatic lipase breaks down emulsified fats into fatty acids and glycerol.', 'অগ্ন্যাশয়ের লাইপেজ অবদ্রবিত স্নেহপদার্থকে ফ্যাটি অ্যাসিড ও গ্লিসারলে ভাঙে।', [S.NCERT_X, S.OS_AP_CHEM]),
    claim('dig.bil.not-enzyme', 'class11-12', 'Bile contains no digestive enzyme; emulsification is a physical change, not a chemical breakdown.', 'পিত্তে কোনো পাচক উৎসেচক নেই; অবদ্রবণ একটি ভৌত পরিবর্তন, রাসায়নিক ভাঙন নয়।', [S.OS_AP_CHEM, S.OS_AP23, S.GUYTON])
  ],
  parts: [
    part('fat', 'class9', '#fde047', 'Fat globule', 'স্নেহবিন্দু', 'Large drops of fat from food.', 'খাদ্যের বড় স্নেহবিন্দু।', 'class10', 'Fat does not mix with water, so it forms globules.', 'স্নেহপদার্থ জলে মেশে না, তাই বিন্দু তৈরি করে।'),
    part('bilesalt', 'class9', '#4ade80', 'Bile salts', 'পিত্তলবণ', 'Coat fat and split it into small droplets.', 'স্নেহপদার্থকে ঢেকে ছোট বিন্দুতে ভাঙে।', 'class11-12', 'One end attracts water and the other attracts fat, like soap.', 'এর এক প্রান্ত জলকে এবং অন্য প্রান্ত স্নেহপদার্থকে আকর্ষণ করে, সাবানের মতো।'),
    part('lipase', 'class10', '#c084fc', 'Lipase', 'লাইপেজ (Lipase)', 'Enzyme that digests fats.', 'স্নেহপদার্থ পরিপাককারী উৎসেচক।', 'class11-12', 'Works on the surface of droplets, so more surface means faster digestion.', 'বিন্দুর তলে কাজ করে, তাই তল বেশি হলে পরিপাক দ্রুত হয়।')
  ],
  chapters: [
    chapter('overview', 'class9', 14, '1. Fat does not mix', '1. স্নেহপদার্থ মেশে না', 'Big fat globules float in the watery intestinal contents.', 'বড় স্নেহবিন্দু অন্ত্রের জলীয় উপাদানে ভেসে থাকে।'),
    chapter('emulsify', 'class10', 22, '2. Emulsify, then digest', '2. অবদ্রবণ, তারপর পরিপাক', 'Bile salts split the globules into tiny droplets; lipase then works on the much larger surface.', 'পিত্তলবণ বিন্দুগুলিকে ক্ষুদ্র বিন্দুতে ভাঙে; তারপর লাইপেজ অনেক বড় তলে কাজ করে।')
  ],
  myths: [
    myth('class10', '"Bile is a digestive enzyme."', '"পিত্ত একটি পাচক উৎসেচক।"', 'Bile has no enzyme; it only emulsifies fat and neutralises acid.', 'পিত্তে কোনো উৎসেচক নেই; এটি কেবল স্নেহপদার্থের অবদ্রবণ ঘটায় ও অ্যাসিড প্রশমিত করে।')
  ],
  quiz: [
    quiz('bi1', 'class9', 'Bile is produced by the…', 'পিত্ত উৎপন্ন হয়…', [['Liver', 'যকৃতে'], ['Gallbladder', 'পিত্তথলিতে'], ['Stomach', 'পাকস্থলীতে'], ['Pancreas', 'অগ্ন্যাশয়ে']], 0, 'dig.bil.source'),
    quiz('bi2', 'class9', 'Bile is stored in the…', 'পিত্ত জমা থাকে…', [['Gallbladder', 'পিত্তথলিতে'], ['Liver', 'যকৃতে'], ['Small intestine', 'ক্ষুদ্রান্ত্রে'], ['Mouth', 'মুখগহ্বরে']], 0, 'dig.bil.source'),
    quiz('bi3', 'class9', 'Bile enters the…', 'পিত্ত প্রবেশ করে…', [['Small intestine', 'ক্ষুদ্রান্ত্রে'], ['Stomach', 'পাকস্থলীতে'], ['Large intestine', 'বৃহদন্ত্রে'], ['Oesophagus', 'গ্রাসনালিতে']], 0, 'dig.bil.source'),
    quiz('bi4', 'class10', 'Emulsification means…', 'অবদ্রবণ মানে…', [['Breaking fat into small droplets', 'স্নেহপদার্থকে ক্ষুদ্র বিন্দুতে ভাঙা'], ['Digesting starch', 'শ্বেতসার পরিপাক'], ['Absorbing water', 'জল শোষণ'], ['Making acid', 'অ্যাসিড তৈরি']], 0, 'dig.bil.emulsify'),
    quiz('bi5', 'class10', 'Lipase converts fats into…', 'লাইপেজ স্নেহপদার্থকে পরিণত করে…', [['Fatty acids and glycerol', 'ফ্যাটি অ্যাসিড ও গ্লিসারলে'], ['Glucose', 'গ্লুকোজে'], ['Amino acids', 'অ্যামাইনো অ্যাসিডে'], ['Bile', 'পিত্তে']], 0, 'dig.bil.lipase')
  ],
  limitation: limitation('Droplet sizes and counts are simplified.', 'বিন্দুর আকার ও সংখ্যা সরল করা হয়েছে।')
};

const enzyme = {
  id: 'enzyme', tag: { en: 'chemistry', bn: 'রসায়ন' },
  title: { en: 'Digestive enzymes', bn: 'পাচক উৎসেচক (Digestive enzymes)' },
  lead: { en: 'Each enzyme fits only certain food molecules and splits them into smaller ones.', bn: 'প্রতিটি উৎসেচক কেবল নির্দিষ্ট খাদ্য-অণুর সঙ্গে খাপ খায় এবং তাদের ছোট অণুতে ভাঙে।' },
  claims: [
    claim('dig.enz.break', 'class9', 'Enzymes are biological catalysts that break large, complex food molecules into small, simple ones that can be absorbed.', 'উৎসেচক হলো জৈব অনুঘটক, যা বড় জটিল খাদ্য-অণুকে শোষণযোগ্য ছোট সরল অণুতে ভাঙে।', [S.NCERT_X, S.OS_BIO_ENZ]),
    claim('dig.enz.amylase', 'class9', 'Salivary amylase in the mouth breaks starch into sugar.', 'মুখগহ্বরের লালারসের অ্যামাইলেজ শ্বেতসারকে শর্করায় ভাঙে।', [S.NCERT_X, S.OS_AP_CHEM]),
    claim('dig.enz.specific', 'class10', 'Enzymes are specific: an enzyme acts on a particular substrate, which fits its active site; the enzyme is not used up.', 'উৎসেচক নির্দিষ্ট: একটি উৎসেচক একটি নির্দিষ্ট সাবস্ট্রেটের ওপর কাজ করে, যা এর সক্রিয় স্থানে খাপ খায়; উৎসেচক নিজে খরচ হয় না।', [S.OS_BIO_ENZ, S.OS_AP_CHEM, S.GUYTON]),
    claim('dig.enz.induced', 'class11-12', 'The active site changes shape slightly when the substrate binds (induced fit), improving the fit.', 'সাবস্ট্রেট যুক্ত হলে সক্রিয় স্থানের আকৃতি সামান্য বদলায় (আবিষ্ট খাপ), ফলে খাপ আরও ভালো হয়।', [S.OS_BIO_ENZ, S.OS_AP_CHEM, S.GUYTON])
  ],
  parts: [
    part('enzyme', 'class9', '#c084fc', 'Enzyme', 'উৎসেচক (Enzyme)', 'A protein that speeds up a reaction.', 'একটি প্রোটিন, যা বিক্রিয়ার গতি বাড়ায়।', 'class10', 'It can be used again and again.', 'একে বারবার ব্যবহার করা যায়।'),
    part('substrate', 'class9', '#f59e0b', 'Substrate (starch)', 'সাবস্ট্রেট (শ্বেতসার)', 'The molecule the enzyme acts on.', 'যে অণুর ওপর উৎসেচক কাজ করে।', 'class10', 'Starch is a long chain of glucose units.', 'শ্বেতসার গ্লুকোজ এককের একটি দীর্ঘ শৃঙ্খল।'),
    part('product', 'class10', '#22c55e', 'Products (sugar)', 'উৎপন্ন পদার্থ (শর্করা)', 'Smaller molecules released after the reaction.', 'বিক্রিয়ার পরে মুক্ত হওয়া ছোট অণু।', 'class11-12', 'Amylase produces mainly maltose, a two-unit sugar.', 'অ্যামাইলেজ প্রধানত মল্টোজ (দুই এককের শর্করা) তৈরি করে।')
  ],
  chapters: [
    chapter('overview', 'class9', 14, '1. Lock and key', '1. তালা ও চাবি', 'The substrate fits into the enzyme\'s active site like a key in a lock.', 'সাবস্ট্রেট উৎসেচকের সক্রিয় স্থানে তালায় চাবির মতো খাপ খায়।'),
    chapter('catalysis', 'class10', 20, '2. Split and release', '2. ভাঙন ও মুক্তি', 'The enzyme splits the chain, releases the products, and is ready for the next molecule.', 'উৎসেচক শৃঙ্খলটি ভাঙে, উৎপন্ন পদার্থ ছেড়ে দেয় এবং পরের অণুর জন্য প্রস্তুত হয়।')
  ],
  myths: [
    myth('class10', '"Enzymes are used up in the reaction."', '"বিক্রিয়ায় উৎসেচক খরচ হয়ে যায়।"', 'An enzyme comes out unchanged and can act again.', 'উৎসেচক অপরিবর্তিত থাকে এবং আবার কাজ করতে পারে।')
  ],
  quiz: [
    quiz('en1', 'class9', 'Salivary amylase digests…', 'লালারসের অ্যামাইলেজ পরিপাক করে…', [['Starch', 'শ্বেতসার'], ['Protein', 'প্রোটিন'], ['Fat', 'স্নেহপদার্থ'], ['Vitamins', 'ভিটামিন']], 0, 'dig.enz.amylase'),
    quiz('en2', 'class9', 'Enzymes are…', 'উৎসেচক হলো…', [['Biological catalysts', 'জৈব অনুঘটক'], ['Vitamins', 'ভিটামিন'], ['Minerals', 'খনিজ'], ['Hormones', 'হরমোন']], 0, 'dig.enz.break'),
    quiz('en3', 'class9', 'Digestion changes food into…', 'পরিপাক খাদ্যকে পরিণত করে…', [['Small, absorbable molecules', 'ছোট, শোষণযোগ্য অণুতে'], ['Larger molecules', 'বড় অণুতে'], ['Bone', 'অস্থিতে'], ['Air', 'বায়ুতে']], 0, 'dig.enz.break'),
    quiz('en4', 'class10', 'Why can amylase not digest protein?', 'অ্যামাইলেজ কেন প্রোটিন পরিপাক করতে পারে না?', [['Enzymes are specific', 'উৎসেচক নির্দিষ্ট'], ['Protein is too small', 'প্রোটিন খুব ছোট'], ['Amylase is used up', 'অ্যামাইলেজ খরচ হয়ে যায়'], ['Protein is a fat', 'প্রোটিন একটি স্নেহপদার্থ']], 0, 'dig.enz.specific')
  ],
  limitation: limitation('Molecules are drawn as simple shapes; real enzymes are folded protein chains.', 'অণুগুলিকে সরল আকারে আঁকা হয়েছে; বাস্তব উৎসেচক ভাঁজ-করা প্রোটিন শৃঙ্খল।')
};

export const digestionPacks = [stomach, villus, peristalsis, bile, enzyme];
