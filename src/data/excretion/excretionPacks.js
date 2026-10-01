// Excretion bay deep-dive packs (docs/bays/EXCRETION_MASTERPLAN.md).
// Excretory Products and their Elimination is in NEET.
import { claim, part, chapter, myth, quiz, limitation } from '../packHelpers.js';

const S = {
  NCERT_X: { kind: 'syllabus', title: 'NCERT Science Class 10 (Reprint 2026-27), Ch 5 Life Processes — Excretion', url: 'https://ncert.nic.in/textbook/pdf/jesc105.pdf' },
  NCERT_XI_EX: { kind: 'syllabus', title: 'NCERT Biology Class 11, Excretory Products and their Elimination', url: 'https://ncert.nic.in/textbook.php' },
  OS_AP_KID: { kind: 'reference', title: 'OpenStax Anatomy & Physiology 2e, 25.3–25.6 Kidney anatomy, nephrons and filtration (CC BY 4.0)', url: 'https://openstax.org/books/anatomy-and-physiology-2e/pages/25-3-gross-anatomy-of-the-kidney' },
  OS_AP_URINE: { kind: 'reference', title: 'OpenStax Anatomy & Physiology 2e, 25.1 Physical Characteristics of Urine (CC BY 4.0)', url: 'https://openstax.org/books/anatomy-and-physiology-2e/pages/25-1-physical-characteristics-of-urine' },
  OS_BIO_PLANT: { kind: 'reference', title: 'OpenStax Biology 2e, Ch 30 Plant Form and Physiology (CC BY 4.0)', url: 'https://openstax.org/books/biology-2e/pages/30-introduction' },
  NIDDK: { kind: 'official', title: 'NIDDK (US NIH): Hemodialysis', url: 'https://www.niddk.nih.gov/health-information/kidney-disease/kidney-failure/hemodialysis' }
};

const system = {
  id: 'urinary-system', tag: { en: 'organ system', bn: 'তন্ত্র' },
  title: { en: 'Human excretory system', bn: 'মানুষের রেচনতন্ত্র' },
  lead: { en: 'Two kidneys filter blood; urine flows down ureters to the bladder and out through the urethra.', bn: 'দুটি বৃক্ক রক্ত পরিস্রুত করে; মূত্র গবিনী দিয়ে মূত্রথলিতে যায় এবং মূত্রনালি দিয়ে বেরিয়ে যায়।' },
  claims: [
    claim('exc.sys.parts', 'class9', 'The human excretory system has a pair of kidneys, a pair of ureters, a urinary bladder and a urethra.', 'মানুষের রেচনতন্ত্রে একজোড়া বৃক্ক, একজোড়া গবিনী, একটি মূত্রথলি ও একটি মূত্রনালি থাকে।', [S.NCERT_X, S.OS_AP_KID]),
    claim('exc.sys.urea', 'class9', 'Kidneys remove nitrogenous wastes such as urea and uric acid from the blood, forming urine.', 'বৃক্ক রক্ত থেকে ইউরিয়া ও ইউরিক অ্যাসিডের মতো নাইট্রোজেনঘটিত বর্জ্য দূর করে মূত্র তৈরি করে।', [S.NCERT_X, S.OS_AP_KID]),
    claim('exc.sys.bladder', 'class10', 'Urine is stored in the muscular bladder, which is under nervous control, until it is released through the urethra.', 'মূত্র পেশিময় মূত্রথলিতে জমা থাকে, যা স্নায়ুর নিয়ন্ত্রণে থাকে, এবং পরে মূত্রনালি দিয়ে বেরিয়ে যায়।', [S.NCERT_X, S.OS_AP_KID]),
    claim('exc.sys.volume', 'neet', 'About 180 L of filtrate forms each day, but over 99% is reabsorbed; an adult passes about 1–1.5 L of urine a day.', 'প্রতিদিন প্রায় 180 L পরিস্রুত তরল তৈরি হয়, কিন্তু তার 99%-এর বেশি পুনঃশোষিত হয়; প্রাপ্তবয়স্ক দিনে প্রায় 1–1.5 L মূত্র ত্যাগ করে।', [S.NCERT_XI_EX, S.OS_AP_URINE], { value: 180, unit: 'L/day', range: [170, 180] })
  ],
  parts: [
    part('kidney', 'class9', '#b91c1c', 'Kidneys', 'বৃক্ক (Kidneys)', 'Bean-shaped organs that filter blood.', 'শিমের মতো অঙ্গ, যা রক্ত পরিস্রুত করে।', 'class11-12', 'Outer cortex and inner medulla.', 'বাইরে কর্টেক্স ও ভেতরে মেডালা।'),
    part('ureter', 'class9', '#fde68a', 'Ureters', 'গবিনী (Ureters)', 'Tubes carrying urine to the bladder.', 'মূত্রথলিতে মূত্র নিয়ে যাওয়ার নল।', 'class10', 'Urine moves down by peristalsis.', 'ক্রমসংকোচনে মূত্র নিচে নামে।'),
    part('bladder', 'class9', '#fbbf24', 'Urinary bladder', 'মূত্রথলি', 'Muscular bag that stores urine.', 'মূত্র জমা রাখার পেশিময় থলি।', 'class10', 'Its emptying is under nervous control.', 'এর খালি হওয়া স্নায়ুর নিয়ন্ত্রণে।'),
    part('urethra', 'class9', '#fcd34d', 'Urethra', 'মূত্রনালি', 'Tube that carries urine out of the body.', 'দেহের বাইরে মূত্র নিয়ে যাওয়ার নল।', 'class10', 'Guarded by sphincter muscles.', 'স্ফিংক্টার পেশি এর মুখ নিয়ন্ত্রণ করে।'),
    part('renal-vessels', 'class10', '#ef4444', 'Renal artery and vein', 'বৃক্কীয় ধমনী ও শিরা', 'Bring blood in and take cleaned blood away.', 'রক্ত নিয়ে আসে এবং পরিষ্কার রক্ত নিয়ে যায়।', 'neet', 'Kidneys receive about a fifth of the heart\'s output.', 'বৃক্ক হৃৎপিণ্ডের নির্গত রক্তের প্রায় এক-পঞ্চমাংশ পায়।')
  ],
  chapters: [
    chapter('overview', 'class9', 14, '1. The organs', '1. অঙ্গগুলি', 'Kidneys, ureters, bladder and urethra.', 'বৃক্ক, গবিনী, মূত্রথলি ও মূত্রনালি।'),
    chapter('flow', 'class9', 20, '2. Follow the urine', '2. মূত্রকে অনুসরণ করুন', 'Blood enters the kidney; urine trickles down the ureters and collects in the bladder.', 'রক্ত বৃক্কে ঢোকে; মূত্র গবিনী দিয়ে নেমে মূত্রথলিতে জমা হয়।')
  ],
  myths: [myth('class9', '"Kidneys only get rid of water."', '"বৃক্ক কেবল জল বের করে দেয়।"', 'Kidneys remove urea and excess salts and also keep useful water and glucose.', 'বৃক্ক ইউরিয়া ও অতিরিক্ত লবণ দূর করে এবং প্রয়োজনীয় জল ও গ্লুকোজ ধরে রাখে।')],
  quiz: [
    quiz('us1', 'class9', 'Urine is stored in the…', 'মূত্র জমা থাকে…', [['Urinary bladder', 'মূত্রথলিতে'], ['Kidney', 'বৃক্কে'], ['Ureter', 'গবিনীতে'], ['Liver', 'যকৃতে']], 0, 'exc.sys.parts'),
    quiz('us2', 'class9', 'Ureters connect the kidneys to the…', 'গবিনী বৃক্ককে যুক্ত করে…', [['Bladder', 'মূত্রথলির সঙ্গে'], ['Heart', 'হৃৎপিণ্ডের সঙ্গে'], ['Lungs', 'ফুসফুসের সঙ্গে'], ['Stomach', 'পাকস্থলীর সঙ্গে']], 0, 'exc.sys.parts'),
    quiz('us3', 'class9', 'The main nitrogenous waste in human urine is…', 'মানুষের মূত্রের প্রধান নাইট্রোজেনঘটিত বর্জ্য…', [['Urea', 'ইউরিয়া'], ['Glucose', 'গ্লুকোজ'], ['Oxygen', 'অক্সিজেন'], ['Starch', 'শ্বেতসার']], 0, 'exc.sys.urea'),
    quiz('us4', 'neet', 'Daily filtrate volume is about…', 'দৈনিক পরিস্রুত তরলের পরিমাণ প্রায়…', [['180 L', '180 L'], ['1.5 L', '1.5 L'], ['18 L', '18 L'], ['1800 L', '1800 L']], 0, 'exc.sys.volume')
  ],
  limitation: limitation('Organs are simplified shapes; sizes are not to scale.', 'অঙ্গগুলি সরল আকারে দেখানো; মাপ অনুপাতে নয়।')
};

const nephron = {
  id: 'nephron', tag: { en: 'functional unit', bn: 'কার্যকরী একক' },
  title: { en: 'The nephron', bn: 'নেফ্রন (Nephron)' },
  lead: { en: 'The filtering unit of the kidney: filter first, then take back what is useful.', bn: 'বৃক্কের পরিস্রাবণ একক: প্রথমে ছাঁকা, তারপর প্রয়োজনীয় অংশ ফিরিয়ে নেওয়া।' },
  claims: [
    claim('exc.nep.unit', 'class9', 'Each kidney has a large number of filtration units called nephrons; each starts as a cup-shaped Bowman\'s capsule holding a cluster of capillaries (glomerulus).', 'প্রতিটি বৃক্কে নেফ্রন নামে বহু পরিস্রাবণ একক থাকে; প্রতিটি শুরু হয় একটি পেয়ালাকার বাওম্যান্স ক্যাপসুল দিয়ে, যার মধ্যে থাকে কৈশিকনালির গুচ্ছ (গ্লোমেরুলাস)।', [S.NCERT_X, S.OS_AP_KID]),
    claim('exc.nep.reabsorb', 'class10', 'As the filtrate flows along the tubule, useful substances such as glucose, amino acids, salts and much of the water are selectively reabsorbed.', 'পরিস্রুত তরল নালিকা বরাবর যাওয়ার সময় গ্লুকোজ, অ্যামাইনো অ্যাসিড, লবণ ও বেশিরভাগ জলের মতো প্রয়োজনীয় পদার্থ নির্বাচিতভাবে পুনঃশোষিত হয়।', [S.NCERT_X, S.OS_AP_KID]),
    claim('exc.nep.count', 'neet', 'Each human kidney has about one million nephrons; formation of urine involves glomerular filtration, reabsorption and tubular secretion.', 'মানুষের প্রতিটি বৃক্কে প্রায় 10 লক্ষ নেফ্রন থাকে; মূত্র তৈরিতে গ্লোমেরুলার পরিস্রাবণ, পুনঃশোষণ ও নালিকা-ক্ষরণ ঘটে।', [S.NCERT_XI_EX, S.OS_AP_KID], { value: 1000000, unit: 'nephrons', range: [800000, 1200000] }),
    claim('exc.nep.adh', 'neet', 'ADH from the posterior pituitary increases water reabsorption in the collecting duct, so urine becomes more concentrated when the body needs to save water.', 'পশ্চাৎ পিটুইটারির ADH সংগ্রাহী নালিতে জলের পুনঃশোষণ বাড়ায়, তাই দেহের জল বাঁচানোর প্রয়োজন হলে মূত্র আরও গাঢ় হয়।', [S.NCERT_XI_EX, S.OS_AP_KID])
  ],
  parts: [
    part('glomerulus', 'class9', '#ef4444', 'Glomerulus', 'গ্লোমেরুলাস', 'Knot of capillaries where blood is filtered.', 'কৈশিকনালির গুচ্ছ, যেখানে রক্ত ছাঁকা হয়।', 'class11-12', 'High pressure pushes fluid out; cells and large proteins stay in.', 'উচ্চ চাপে তরল বেরিয়ে আসে; কোশ ও বড় প্রোটিন থেকে যায়।'),
    part('capsule', 'class9', '#fda4af', 'Bowman\'s capsule', 'বাওম্যান্স ক্যাপসুল', 'Cup that collects the filtrate.', 'পেয়ালা, যা পরিস্রুত তরল সংগ্রহ করে।', 'class11-12', 'Glomerulus + capsule = renal corpuscle.', 'গ্লোমেরুলাস + ক্যাপসুল = বৃক্কীয় কণিকা।'),
    part('tubule', 'class9', '#fde68a', 'Tubule', 'নালিকা', 'Long tube where useful substances are reabsorbed.', 'দীর্ঘ নল, যেখানে প্রয়োজনীয় পদার্থ পুনঃশোষিত হয়।', 'neet', 'Proximal tubule, loop of Henle, distal tubule.', 'নিকটবর্তী নালিকা, হেনলির লুপ, দূরবর্তী নালিকা।'),
    part('collecting', 'class10', '#f59e0b', 'Collecting duct', 'সংগ্রাহী নালি', 'Carries urine towards the ureter.', 'মূত্রকে গবিনীর দিকে নিয়ে যায়।', 'neet', 'ADH controls how much water it reabsorbs.', 'ADH এর জল পুনঃশোষণের পরিমাণ নিয়ন্ত্রণ করে।'),
    part('solute', 'class10', '#22c55e', 'Reabsorbed substances', 'পুনঃশোষিত পদার্থ', 'Green: glucose and water returning to blood; yellow: urea staying in urine.', 'সবুজ: রক্তে ফেরা গ্লুকোজ ও জল; হলুদ: মূত্রে থেকে যাওয়া ইউরিয়া।', 'class11-12', 'Normally all filtered glucose is reabsorbed.', 'স্বাভাবিক অবস্থায় পরিস্রুত সমস্ত গ্লুকোজ পুনঃশোষিত হয়।')
  ],
  chapters: [
    chapter('overview', 'class9', 15, '1. A tiny filter', '1. একটি ক্ষুদ্র ছাঁকনি', 'Glomerulus in Bowman\'s capsule, followed by a long tubule.', 'বাওম্যান্স ক্যাপসুলের মধ্যে গ্লোমেরুলাস, তারপর দীর্ঘ নালিকা।'),
    chapter('filter', 'class10', 24, '2. Filter, then reabsorb', '2. ছাঁকা, তারপর পুনঃশোষণ', 'Fluid is pushed into the capsule; along the tubule glucose and water return to blood, leaving urea in urine.', 'তরল ক্যাপসুলে ঠেলে দেওয়া হয়; নালিকা বরাবর গ্লুকোজ ও জল রক্তে ফেরে, ইউরিয়া মূত্রে থেকে যায়।')
  ],
  myths: [myth('class10', '"Everything filtered leaves as urine."', '"যা ছাঁকা হয় তার সবই মূত্র হয়ে বেরিয়ে যায়।"', 'Over 99% of the filtered fluid is reabsorbed.', 'পরিস্রুত তরলের 99%-এর বেশি পুনঃশোষিত হয়।')],
  quiz: [
    quiz('np1', 'class9', 'The functional unit of the kidney is the…', 'বৃক্কের কার্যকরী একক হলো…', [['Nephron', 'নেফ্রন'], ['Neuron', 'নিউরন'], ['Alveolus', 'বায়ুথলি'], ['Villus', 'ভিলাস']], 0, 'exc.nep.unit'),
    quiz('np2', 'class9', 'Blood is filtered in the…', 'রক্ত ছাঁকা হয়…', [['Glomerulus', 'গ্লোমেরুলাসে'], ['Bladder', 'মূত্রথলিতে'], ['Urethra', 'মূত্রনালিতে'], ['Ureter', 'গবিনীতে']], 0, 'exc.nep.unit'),
    quiz('np3', 'class9', 'The cup around the glomerulus is the…', 'গ্লোমেরুলাসকে ঘিরে থাকা পেয়ালা হলো…', [["Bowman's capsule", 'বাওম্যান্স ক্যাপসুল'], ['Loop of Henle', 'হেনলির লুপ'], ['Collecting duct', 'সংগ্রাহী নালি'], ['Ureter', 'গবিনী']], 0, 'exc.nep.unit'),
    quiz('np4', 'class10', 'Which is reabsorbed from the filtrate?', 'পরিস্রুত তরল থেকে কোনটি পুনঃশোষিত হয়?', [['Glucose', 'গ্লুকোজ'], ['Urea only', 'কেবল ইউরিয়া'], ['Red blood cells', 'লোহিত কণিকা'], ['Nothing', 'কিছুই না']], 0, 'exc.nep.reabsorb'),
    quiz('np5', 'neet', 'ADH acts mainly on the…', 'ADH প্রধানত কাজ করে…', [['Collecting duct', 'সংগ্রাহী নালিতে'], ['Glomerulus', 'গ্লোমেরুলাসে'], ['Ureter', 'গবিনীতে'], ['Bladder', 'মূত্রথলিতে']], 0, 'exc.nep.adh')
  ],
  limitation: limitation('One nephron is shown uncoiled; real tubules are folded and much longer.', 'একটি নেফ্রনকে খোলা অবস্থায় দেখানো হয়েছে; বাস্তব নালিকা ভাঁজযুক্ত ও অনেক দীর্ঘ।')
};

const dialysis = {
  id: 'dialysis', tag: { en: 'health', bn: 'স্বাস্থ্য' },
  title: { en: 'Artificial kidney (haemodialysis)', bn: 'কৃত্রিম বৃক্ক (হিমোডায়ালিসিস)' },
  lead: { en: 'When kidneys fail, a machine filters blood through a semi-permeable membrane.', bn: 'বৃক্ক বিকল হলে একটি যন্ত্র অর্ধভেদ্য পর্দার মাধ্যমে রক্ত পরিস্রুত করে।' },
  claims: [
    claim('exc.dia.principle', 'class10', 'An artificial kidney passes blood through long tubes with semi-permeable walls suspended in dialysing fluid; wastes diffuse out into the fluid and the cleaned blood is returned.', 'কৃত্রিম বৃক্কে রক্তকে ডায়ালাইসিস তরলে ডোবানো অর্ধভেদ্য প্রাচীরের দীর্ঘ নলের মধ্য দিয়ে পাঠানো হয়; বর্জ্য ব্যাপিত হয়ে তরলে চলে যায় এবং পরিষ্কার রক্ত দেহে ফেরানো হয়।', [S.NCERT_X, S.NIDDK]),
    claim('exc.dia.fluid', 'class10', 'The dialysing fluid has the same osmotic pressure as blood but contains no nitrogenous wastes, so urea moves out while useful substances stay.', 'ডায়ালাইসিস তরলের অভিস্রবণ চাপ রক্তের সমান কিন্তু এতে নাইট্রোজেনঘটিত বর্জ্য নেই, তাই ইউরিয়া বেরিয়ে যায় অথচ প্রয়োজনীয় পদার্থ থেকে যায়।', [S.NCERT_X, S.NIDDK]),
    claim('exc.dia.noreabsorb', 'class11-12', 'Unlike a real kidney, dialysis has no reabsorption step; it is usually done about three times a week, a few hours each session.', 'আসল বৃক্কের মতো নয়, ডায়ালাইসিসে পুনঃশোষণের ধাপ নেই; সাধারণত সপ্তাহে প্রায় তিনবার, প্রতিবার কয়েক ঘণ্টা ধরে এটি করা হয়।', [S.NIDDK, S.NCERT_X])
  ],
  parts: [
    part('tube', 'class10', '#fca5a5', 'Semi-permeable tubes', 'অর্ধভেদ্য নল', 'Blood flows through them.', 'এর মধ্য দিয়ে রক্ত প্রবাহিত হয়।', 'class11-12', 'Pores let small molecules out but keep cells and proteins.', 'ছিদ্র ছোট অণু বের হতে দেয় কিন্তু কোশ ও প্রোটিন আটকে রাখে।'),
    part('fluid', 'class10', '#93c5fd', 'Dialysing fluid', 'ডায়ালাইসিস তরল', 'Bath that receives wastes.', 'যে তরলে বর্জ্য চলে যায়।', 'class11-12', 'Flows opposite to the blood to keep the gradient high.', 'নতিমাত্রা বেশি রাখতে রক্তের বিপরীত দিকে প্রবাহিত হয়।'),
    part('urea', 'class10', '#facc15', 'Urea', 'ইউরিয়া', 'Waste that diffuses out.', 'বর্জ্য, যা ব্যাপিত হয়ে বেরিয়ে যায়।', 'class11-12', 'Its level in blood falls during a session.', 'প্রতিবার ডায়ালাইসিসে রক্তে এর মাত্রা কমে।'),
    part('cells', 'class10', '#dc2626', 'Blood cells', 'রক্তকণিকা', 'Too large to pass; stay in blood.', 'অনেক বড়, তাই পেরোতে পারে না; রক্তে থেকে যায়।', 'class11-12', 'Proteins also stay.', 'প্রোটিনও থেকে যায়।')
  ],
  chapters: [
    chapter('overview', 'class10', 14, '1. The machine', '1. যন্ত্রটি', 'Blood flows through tubes bathed in dialysing fluid.', 'ডায়ালাইসিস তরলে ডোবানো নলের মধ্য দিয়ে রক্ত চলে।'),
    chapter('diffuse', 'class10', 20, '2. Wastes diffuse out', '2. বর্জ্যের ব্যাপন', 'Urea crosses the membrane into the fluid; blood cells stay inside.', 'ইউরিয়া পর্দা পেরিয়ে তরলে যায়; রক্তকণিকা ভেতরে থাকে।')
  ],
  myths: [myth('class10', '"Dialysis cures kidney failure."', '"ডায়ালাইসিস বৃক্ক বিকলতা সারিয়ে দেয়।"', 'It replaces filtering only while it runs; it does not repair the kidney.', 'যতক্ষণ চলে ততক্ষণ কেবল ছাঁকার কাজ করে; বৃক্ককে সারায় না।')],
  quiz: [
    quiz('di1', 'class10', 'Dialysis works mainly by…', 'ডায়ালাইসিস প্রধানত কাজ করে…', [['Diffusion through a membrane', 'পর্দার মধ্য দিয়ে ব্যাপনে'], ['Digestion', 'পরিপাকে'], ['Breathing', 'শ্বাসকার্যে'], ['Peristalsis', 'ক্রমসংকোচনে']], 0, 'exc.dia.principle'),
    quiz('di2', 'class10', 'Dialysing fluid lacks…', 'ডায়ালাইসিস তরলে থাকে না…', [['Nitrogenous wastes', 'নাইট্রোজেনঘটিত বর্জ্য'], ['Water', 'জল'], ['Salts', 'লবণ'], ['Glucose', 'গ্লুকোজ']], 0, 'exc.dia.fluid'),
    quiz('di3', 'class10', 'Which stays in the blood during dialysis?', 'ডায়ালাইসিসে কোনটি রক্তে থেকে যায়?', [['Blood cells', 'রক্তকণিকা'], ['Urea', 'ইউরিয়া'], ['Excess salt', 'অতিরিক্ত লবণ'], ['None', 'কোনোটিই না']], 0, 'exc.dia.principle'),
    quiz('di4', 'class11-12', 'Which kidney step is missing in dialysis?', 'ডায়ালাইসিসে বৃক্কের কোন ধাপ নেই?', [['Reabsorption', 'পুনঃশোষণ'], ['Filtration', 'পরিস্রাবণ'], ['Diffusion', 'ব্যাপন'], ['Blood flow', 'রক্তপ্রবাহ']], 0, 'exc.dia.noreabsorb')
  ],
  limitation: limitation('The dialyser is drawn as a few tubes; real ones contain thousands of hollow fibres.', 'ডায়ালাইজারকে কয়েকটি নল হিসেবে আঁকা হয়েছে; বাস্তবে হাজার হাজার ফাঁপা তন্তু থাকে।')
};

const plant = {
  id: 'plant-excretion', tag: { en: 'plant', bn: 'উদ্ভিদ' },
  title: { en: 'Excretion in plants', bn: 'উদ্ভিদে রেচন' },
  lead: { en: 'Plants have no excretory organs; they store, shed or release their wastes.', bn: 'উদ্ভিদের রেচন অঙ্গ নেই; এরা বর্জ্য জমা রাখে, ঝরিয়ে দেয় বা ত্যাগ করে।' },
  claims: [
    claim('exc.pla.ways', 'class9', 'Plants get rid of excess water by transpiration; many wastes are stored in vacuoles or in leaves that later fall off.', 'উদ্ভিদ বাষ্পমোচনের মাধ্যমে অতিরিক্ত জল ত্যাগ করে; অনেক বর্জ্য কোশগহ্বরে বা পাতায় জমা থাকে, যা পরে ঝরে যায়।', [S.NCERT_X, S.OS_BIO_PLANT]),
    claim('exc.pla.resin', 'class10', 'Some wastes are stored as resins and gums, especially in old xylem; some are released into the soil around the roots.', 'কিছু বর্জ্য রজন ও আঠা রূপে জমা থাকে, বিশেষত পুরোনো জাইলেমে; কিছু মূলের চারপাশের মাটিতে ত্যাগ করা হয়।', [S.NCERT_X, S.OS_BIO_PLANT]),
    claim('exc.pla.gas', 'class10', 'Oxygen from photosynthesis and carbon dioxide from respiration leave through stomata.', 'সালোকসংশ্লেষের অক্সিজেন ও শ্বসনের কার্বন ডাইঅক্সাইড পত্ররন্ধ্র দিয়ে বেরিয়ে যায়।', [S.NCERT_X, S.OS_BIO_PLANT])
  ],
  parts: [
    part('leaf', 'class9', '#22c55e', 'Leaves', 'পাতা', 'Old leaves carry stored wastes away when they fall.', 'পুরোনো পাতা ঝরে গেলে জমা বর্জ্য নিয়ে যায়।', 'class10', 'Yellowing leaves may hold more waste.', 'হলুদ হয়ে যাওয়া পাতায় বেশি বর্জ্য থাকতে পারে।'),
    part('vacuole', 'class9', '#a855f7', 'Vacuole', 'কোশগহ্বর', 'Stores wastes inside cells.', 'কোশের ভেতরে বর্জ্য জমা রাখে।', 'class11-12', 'May store crystals such as calcium oxalate.', 'ক্যালশিয়াম অক্সালেটের মতো কেলাস জমা রাখতে পারে।'),
    part('resin', 'class10', '#d97706', 'Resins and gums', 'রজন ও আঠা', 'Stored in old xylem.', 'পুরোনো জাইলেমে জমা থাকে।', 'class11-12', 'Useful to humans, e.g. gum arabic.', 'মানুষের কাজে লাগে, যেমন গঁদ।'),
    part('vapour', 'class9', '#bae6fd', 'Water vapour', 'জলীয় বাষ্প', 'Excess water leaves by transpiration.', 'বাষ্পমোচনে অতিরিক্ত জল বেরিয়ে যায়।', 'class10', 'Mainly through stomata.', 'প্রধানত পত্ররন্ধ্র দিয়ে।')
  ],
  chapters: [
    chapter('overview', 'class9', 14, '1. No kidneys here', '1. এখানে বৃক্ক নেই', 'Wastes are stored in vacuoles, leaves and old xylem.', 'বর্জ্য কোশগহ্বর, পাতা ও পুরোনো জাইলেমে জমা থাকে।'),
    chapter('shed', 'class10', 18, '2. Shed and release', '2. ঝরানো ও ত্যাগ', 'An old leaf falls with its wastes; water vapour leaves the stomata.', 'পুরোনো পাতা বর্জ্যসহ ঝরে পড়ে; পত্ররন্ধ্র দিয়ে জলীয় বাষ্প বেরিয়ে যায়।')
  ],
  myths: [myth('class9', '"Plants produce no waste."', '"উদ্ভিদ কোনো বর্জ্য তৈরি করে না।"', 'Plants do produce wastes; they just handle them without special organs.', 'উদ্ভিদও বর্জ্য তৈরি করে; কেবল বিশেষ অঙ্গ ছাড়াই তা সামলায়।')],
  quiz: [
    quiz('pe1', 'class9', 'Plants lose excess water by…', 'উদ্ভিদ অতিরিক্ত জল ত্যাগ করে…', [['Transpiration', 'বাষ্পমোচনে'], ['Urination', 'মূত্রত্যাগে'], ['Digestion', 'পরিপাকে'], ['Photosynthesis only', 'কেবল সালোকসংশ্লেষে']], 0, 'exc.pla.ways'),
    quiz('pe2', 'class9', 'Plant wastes may be stored in…', 'উদ্ভিদের বর্জ্য জমা থাকতে পারে…', [['Vacuoles', 'কোশগহ্বরে'], ['Kidneys', 'বৃক্কে'], ['Bladder', 'মূত্রথলিতে'], ['Lungs', 'ফুসফুসে']], 0, 'exc.pla.ways'),
    quiz('pe3', 'class9', 'Falling leaves help plants to…', 'পাতা ঝরা উদ্ভিদকে সাহায্য করে…', [['Remove stored wastes', 'জমা বর্জ্য দূর করতে'], ['Make food', 'খাদ্য তৈরি করতে'], ['Absorb water', 'জল শোষণ করতে'], ['Grow roots', 'মূল বাড়াতে']], 0, 'exc.pla.ways'),
    quiz('pe4', 'class10', 'Resins and gums are stored in…', 'রজন ও আঠা জমা থাকে…', [['Old xylem', 'পুরোনো জাইলেমে'], ['Phloem only', 'কেবল ফ্লোয়েমে'], ['Root hairs', 'মূলরোমে'], ['Flowers', 'ফুলে']], 0, 'exc.pla.resin')
  ],
  limitation: limitation('Leaf fall is sped up from weeks to seconds.', 'পাতা ঝরার সময় সপ্তাহ থেকে কমিয়ে সেকেন্ডে আনা হয়েছে।')
};

export const excretionPacks = [system, nephron, dialysis, plant];
