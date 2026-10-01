// Circulation bay deep-dive packs (docs/bays/CIRCULATION_MASTERPLAN.md).
// Body Fluids & Circulation is in NEET; Transport in Plants was dropped from NEET, so the plant pack stops at Class 11–12.
import { claim, part, chapter, myth, quiz, limitation } from '../packHelpers.js';

const S = {
  NCERT_X: { kind: 'syllabus', title: 'NCERT Science Class 10 (Reprint 2026-27), Ch 5 Life Processes — Transportation', url: 'https://ncert.nic.in/textbook/pdf/jesc105.pdf' },
  NCERT_XI_BF: { kind: 'syllabus', title: 'NCERT Biology Class 11, Body Fluids and Circulation', url: 'https://ncert.nic.in/textbook.php' },
  OS_AP_HEART: { kind: 'reference', title: 'OpenStax Anatomy & Physiology 2e, 19.1 Heart Anatomy (CC BY 4.0)', url: 'https://openstax.org/books/anatomy-and-physiology-2e/pages/19-1-heart-anatomy' },
  OS_AP_CYCLE: { kind: 'reference', title: 'OpenStax Anatomy & Physiology 2e, 19.2 Cardiac Muscle and Electrical Activity (CC BY 4.0)', url: 'https://openstax.org/books/anatomy-and-physiology-2e/pages/19-2-cardiac-muscle-and-electrical-activity' },
  OS_AP_VESSELS: { kind: 'reference', title: 'OpenStax Anatomy & Physiology 2e, 20.1 Structure and Function of Blood Vessels (CC BY 4.0)', url: 'https://openstax.org/books/anatomy-and-physiology-2e/pages/20-1-structure-and-function-of-blood-vessels' },
  OS_AP_BLOOD: { kind: 'reference', title: 'OpenStax Anatomy & Physiology 2e, Ch 18 The Cardiovascular System: Blood (CC BY 4.0)', url: 'https://openstax.org/books/anatomy-and-physiology-2e/pages/18-1-an-overview-of-blood' },
  OS_BIO_PLANT: { kind: 'reference', title: 'OpenStax Biology 2e, 30.5 Transport of Water and Solutes in Plants (CC BY 4.0)', url: 'https://openstax.org/books/biology-2e/pages/30-5-transport-of-water-and-solutes-in-plants' },
  GUYTON: { kind: 'textbook', title: 'Hall J.E., Hall M.E. Guyton and Hall Textbook of Medical Physiology, 14th ed. (2021)', citation: 'Elsevier, ISBN 978-0-323-59712-8' }
};

const heart = {
  id: 'heart', tag: { en: 'organ', bn: 'অঙ্গ' },
  title: { en: 'The human heart', bn: 'মানুষের হৃৎপিণ্ড' },
  lead: { en: 'A four-chambered muscular pump with valves that keep blood flowing one way.', bn: 'চার প্রকোষ্ঠবিশিষ্ট পেশিময় পাম্প, যার কপাটিকা রক্তকে একমুখী রাখে।' },
  claims: [
    claim('cir.hrt.chambers', 'class9', 'The human heart has four chambers: two upper atria and two lower ventricles.', 'মানুষের হৃৎপিণ্ডে চারটি প্রকোষ্ঠ: ওপরের দুটি অলিন্দ এবং নিচের দুটি নিলয়।', [S.NCERT_X, S.OS_AP_HEART]),
    claim('cir.hrt.valves', 'class9', 'Valves ensure that blood does not flow backwards when the atria or ventricles contract.', 'অলিন্দ বা নিলয় সংকুচিত হলে কপাটিকা রক্তকে পেছনে ফিরতে দেয় না।', [S.NCERT_X, S.OS_AP_HEART]),
    claim('cir.hrt.lv-wall', 'class10', 'Ventricles have thicker muscular walls than atria because they pump blood into organs; the left ventricle, which pumps to the whole body, has the thickest wall.', 'নিলয়ের পেশিপ্রাচীর অলিন্দের চেয়ে পুরু, কারণ নিলয় বিভিন্ন অঙ্গে রক্ত পাম্প করে; সমগ্র দেহে রক্ত পাঠায় বলে বাম নিলয়ের প্রাচীর সবচেয়ে পুরু।', [S.NCERT_X, S.OS_AP_HEART]),
    claim('cir.hrt.sa-node', 'neet', 'The sino-atrial (SA) node in the right atrium starts each heartbeat and is called the pacemaker; a normal resting adult heart beats about 70–75 times per minute.', 'ডান অলিন্দের সাইনো-অ্যাট্রিয়াল (SA) নোড প্রতিটি হৃৎস্পন্দন শুরু করে, তাই একে পেসমেকার বলে; বিশ্রামরত প্রাপ্তবয়স্কের হৃৎপিণ্ড মিনিটে প্রায় 70–75 বার স্পন্দিত হয়।', [S.NCERT_XI_BF, S.OS_AP_CYCLE], { value: 72, unit: 'beats/min', range: [70, 75] })
  ],
  parts: [
    part('atrium', 'class9', '#f472b6', 'Atria', 'অলিন্দ (Atria)', 'Upper chambers that receive blood.', 'ওপরের প্রকোষ্ঠ, যা রক্ত গ্রহণ করে।', 'class10', 'Right atrium receives deoxygenated blood from the body; left atrium receives oxygenated blood from the lungs.', 'ডান অলিন্দ দেহ থেকে কার্বন ডাইঅক্সাইডযুক্ত রক্ত এবং বাম অলিন্দ ফুসফুস থেকে অক্সিজেনযুক্ত রক্ত গ্রহণ করে।'),
    part('ventricle', 'class9', '#e11d48', 'Ventricles', 'নিলয় (Ventricles)', 'Lower, thick-walled chambers that pump blood out.', 'নিচের পুরু-প্রাচীরযুক্ত প্রকোষ্ঠ, যা রক্ত বাইরে পাম্প করে।', 'class10', 'Left ventricle to the body (aorta); right ventricle to the lungs (pulmonary artery).', 'বাম নিলয় দেহে (মহাধমনী) এবং ডান নিলয় ফুসফুসে (ফুসফুসীয় ধমনী) রক্ত পাঠায়।'),
    part('valve', 'class9', '#fde68a', 'Valves', 'কপাটিকা (Valves)', 'Flaps that let blood pass only one way.', 'পর্দা, যা রক্তকে কেবল একদিকে যেতে দেয়।', 'class11-12', 'Tricuspid (right), bicuspid or mitral (left), and semilunar valves at the exits.', 'ত্রিপত্র (ডানদিকে), দ্বিপত্র বা মাইট্রাল (বামদিকে) এবং নির্গমপথে অর্ধচন্দ্রাকার কপাটিকা।'),
    part('septum', 'class10', '#94a3b8', 'Septum', 'পর্দা (Septum)', 'Wall that keeps left and right sides apart.', 'বাম ও ডান দিককে আলাদা রাখার প্রাচীর।', 'class10', 'It stops oxygenated and deoxygenated blood from mixing.', 'এটি অক্সিজেনযুক্ত ও কার্বন ডাইঅক্সাইডযুক্ত রক্তকে মিশতে দেয় না।'),
    part('sanode', 'neet', '#22d3ee', 'SA node', 'SA নোড (SA node)', 'Natural pacemaker in the right atrium.', 'ডান অলিন্দের প্রাকৃতিক পেসমেকার।', 'neet', 'Its signal spreads to the AV node, bundle of His and Purkinje fibres.', 'এর সংকেত AV নোড, হিসের বান্ডল ও পারকিনজি তন্তুতে ছড়ায়।')
  ],
  chapters: [
    chapter('overview', 'class9', 15, '1. Four chambers', '1. চারটি প্রকোষ্ঠ', 'Two atria above, two ventricles below, separated by a septum.', 'ওপরে দুটি অলিন্দ, নিচে দুটি নিলয়, মাঝখানে পর্দা।'),
    chapter('beat', 'class10', 20, '2. One heartbeat', '2. একটি হৃৎস্পন্দন', 'Atria contract first, then ventricles; valves snap shut to stop backflow.', 'প্রথমে অলিন্দ, তারপর নিলয় সংকুচিত হয়; পেছনে প্রবাহ আটকাতে কপাটিকা বন্ধ হয়।'),
    chapter('pacemaker', 'neet', 18, '3. The pacemaker', '3. পেসমেকার', 'The SA node fires; the wave crosses the atria, pauses at the AV node, then sweeps the ventricles.', 'SA নোড সংকেত দেয়; ঢেউ অলিন্দ পেরিয়ে AV নোডে থামে, তারপর নিলয়ে ছড়িয়ে পড়ে।')
  ],
  myths: [
    myth('class9', '"The heart is on the left side of the chest."', '"হৃৎপিণ্ড বুকের বাঁদিকে থাকে।"', 'It sits near the centre, between the lungs, with its tip pointing to the left.', 'এটি দুই ফুসফুসের মাঝে প্রায় কেন্দ্রে থাকে, কেবল এর অগ্রভাগ বাঁদিকে হেলানো।')
  ],
  quiz: [
    quiz('ht1', 'class9', 'How many chambers does the human heart have?', 'মানুষের হৃৎপিণ্ডে কয়টি প্রকোষ্ঠ?', [['4', '4'], ['2', '2'], ['3', '3'], ['5', '5']], 0, 'cir.hrt.chambers'),
    quiz('ht2', 'class9', 'The upper chambers are called…', 'ওপরের প্রকোষ্ঠগুলিকে বলে…', [['Atria', 'অলিন্দ'], ['Ventricles', 'নিলয়'], ['Valves', 'কপাটিকা'], ['Arteries', 'ধমনী']], 0, 'cir.hrt.chambers'),
    quiz('ht3', 'class9', 'Valves in the heart…', 'হৃৎপিণ্ডের কপাটিকা…', [['Prevent backflow of blood', 'রক্তের পেছনে প্রবাহ আটকায়'], ['Make blood', 'রক্ত তৈরি করে'], ['Store oxygen', 'অক্সিজেন জমায়'], ['Digest food', 'খাদ্য পরিপাক করে']], 0, 'cir.hrt.valves'),
    quiz('ht4', 'class10', 'Which chamber has the thickest wall?', 'কোন প্রকোষ্ঠের প্রাচীর সবচেয়ে পুরু?', [['Left ventricle', 'বাম নিলয়'], ['Right atrium', 'ডান অলিন্দ'], ['Left atrium', 'বাম অলিন্দ'], ['Right ventricle', 'ডান নিলয়']], 0, 'cir.hrt.lv-wall'),
    quiz('ht5', 'neet', 'The pacemaker of the heart is the…', 'হৃৎপিণ্ডের পেসমেকার হলো…', [['SA node', 'SA নোড'], ['AV node', 'AV নোড'], ['Bundle of His', 'হিসের বান্ডল'], ['Purkinje fibres', 'পারকিনজি তন্তু']], 0, 'cir.hrt.sa-node')
  ],
  limitation: limitation('Chambers are drawn as rounded shapes; the real heart is twisted and the chambers overlap.', 'প্রকোষ্ঠগুলিকে গোলাকার আকারে আঁকা হয়েছে; বাস্তব হৃৎপিণ্ড মোচড়ানো এবং প্রকোষ্ঠগুলি একে অপরের ওপর থাকে।')
};

const double = {
  id: 'double-circulation', tag: { en: 'pathway', bn: 'পথ' },
  title: { en: 'Double circulation', bn: 'দ্বি-সংবহন (Double circulation)' },
  lead: { en: 'Blood passes through the heart twice in each full trip around the body.', bn: 'দেহে একবার পূর্ণ পরিক্রমায় রক্ত দুবার হৃৎপিণ্ডের মধ্য দিয়ে যায়।' },
  claims: [
    claim('cir.dbl.twice', 'class9', 'In humans, blood goes through the heart twice during each cycle: once to the lungs and once to the rest of the body. This is double circulation.', 'মানুষের দেহে প্রতিটি চক্রে রক্ত দুবার হৃৎপিণ্ডের মধ্য দিয়ে যায়: একবার ফুসফুসে, একবার দেহের বাকি অংশে। একে দ্বি-সংবহন বলে।', [S.NCERT_X, S.OS_AP_HEART]),
    claim('cir.dbl.separate', 'class10', 'Separating the right and left sides keeps oxygenated and deoxygenated blood apart, giving an efficient oxygen supply needed by warm-blooded animals.', 'ডান ও বাম দিক আলাদা থাকায় অক্সিজেনযুক্ত ও কার্বন ডাইঅক্সাইডযুক্ত রক্ত মেশে না, ফলে উষ্ণ রক্তের প্রাণীর প্রয়োজনীয় দক্ষ অক্সিজেন সরবরাহ হয়।', [S.NCERT_X, S.OS_AP_HEART]),
    claim('cir.dbl.pulm-vein', 'class11-12', 'The pulmonary artery carries deoxygenated blood and the pulmonary vein carries oxygenated blood — arteries and veins are defined by direction, not by oxygen.', 'ফুসফুসীয় ধমনী কার্বন ডাইঅক্সাইডযুক্ত এবং ফুসফুসীয় শিরা অক্সিজেনযুক্ত রক্ত বহন করে — ধমনী ও শিরা প্রবাহের দিক দিয়ে চেনা হয়, অক্সিজেন দিয়ে নয়।', [S.NCERT_XI_BF, S.OS_AP_VESSELS])
  ],
  parts: [
    part('lungs', 'class9', '#93c5fd', 'Lungs (pulmonary loop)', 'ফুসফুস (ফুসফুসীয় পথ)', 'Blood picks up oxygen and gives up carbon dioxide.', 'রক্ত অক্সিজেন গ্রহণ করে ও কার্বন ডাইঅক্সাইড ত্যাগ করে।', 'class10', 'Right ventricle → pulmonary artery → lungs → pulmonary vein → left atrium.', 'ডান নিলয় → ফুসফুসীয় ধমনী → ফুসফুস → ফুসফুসীয় শিরা → বাম অলিন্দ।'),
    part('body', 'class9', '#fca5a5', 'Body (systemic loop)', 'দেহ (সিস্টেমিক পথ)', 'Blood delivers oxygen to the body\'s cells.', 'রক্ত দেহকোশে অক্সিজেন পৌঁছে দেয়।', 'class10', 'Left ventricle → aorta → body → venae cavae → right atrium.', 'বাম নিলয় → মহাধমনী → দেহ → মহাশিরা → ডান অলিন্দ।'),
    part('pump', 'class9', '#e11d48', 'Heart', 'হৃৎপিণ্ড', 'Two pumps side by side.', 'পাশাপাশি দুটি পাম্প।', 'class10', 'Right side pumps to the lungs; left side to the body.', 'ডান দিক ফুসফুসে এবং বাম দিক দেহে পাম্প করে।'),
    part('blood', 'class10', '#ef4444', 'Blood', 'রক্ত', 'Red = oxygenated; blue = deoxygenated (teaching colours).', 'লাল = অক্সিজেনযুক্ত; নীল = কার্বন ডাইঅক্সাইডযুক্ত (শিক্ষণ রং)।', 'class11-12', 'Real deoxygenated blood is dark red, never blue.', 'বাস্তবে কার্বন ডাইঅক্সাইডযুক্ত রক্ত গাঢ় লাল, কখনো নীল নয়।')
  ],
  chapters: [
    chapter('overview', 'class9', 14, '1. Two loops', '1. দুটি পথ', 'A small loop to the lungs and a big loop to the body meet at the heart.', 'ফুসফুসে ছোট পথ এবং দেহে বড় পথ হৃৎপিণ্ডে মিলিত হয়।'),
    chapter('flow', 'class10', 24, '2. Follow the blood', '2. রক্তকে অনুসরণ করুন', 'Watch blood turn oxygen-rich in the lungs and oxygen-poor in the body.', 'দেখুন রক্ত ফুসফুসে অক্সিজেনসমৃদ্ধ এবং দেহে অক্সিজেনহীন হয়।')
  ],
  myths: [
    myth('class11-12', '"Deoxygenated blood is blue."', '"কার্বন ডাইঅক্সাইডযুক্ত রক্ত নীল।"', 'It is dark red; veins only look bluish through the skin.', 'এটি গাঢ় লাল; ত্বকের মধ্য দিয়ে শিরাকে কেবল নীলচে দেখায়।'),
    myth('class11-12', '"All arteries carry oxygenated blood."', '"সব ধমনী অক্সিজেনযুক্ত রক্ত বহন করে।"', 'The pulmonary artery carries deoxygenated blood.', 'ফুসফুসীয় ধমনী কার্বন ডাইঅক্সাইডযুক্ত রক্ত বহন করে।')
  ],
  quiz: [
    quiz('db1', 'class9', 'In double circulation, blood passes through the heart…', 'দ্বি-সংবহনে রক্ত হৃৎপিণ্ডের মধ্য দিয়ে যায়…', [['Twice per cycle', 'প্রতি চক্রে দুবার'], ['Once per cycle', 'প্রতি চক্রে একবার'], ['Never', 'কখনো না'], ['Four times', 'চারবার']], 0, 'cir.dbl.twice'),
    quiz('db2', 'class9', 'Blood picks up oxygen in the…', 'রক্ত অক্সিজেন গ্রহণ করে…', [['Lungs', 'ফুসফুসে'], ['Liver', 'যকৃতে'], ['Kidney', 'বৃক্কে'], ['Stomach', 'পাকস্থলীতে']], 0, 'cir.dbl.twice'),
    quiz('db3', 'class9', 'The two loops of double circulation go to…', 'দ্বি-সংবহনের দুটি পথ যায়…', [['Lungs and body', 'ফুসফুস ও দেহে'], ['Brain and legs', 'মস্তিষ্ক ও পায়ে'], ['Stomach and liver', 'পাকস্থলী ও যকৃতে'], ['Arms only', 'কেবল হাতে']], 0, 'cir.dbl.twice'),
    quiz('db4', 'class11-12', 'Which vessel carries oxygenated blood?', 'কোন বাহ অক্সিজেনযুক্ত রক্ত বহন করে?', [['Pulmonary vein', 'ফুসফুসীয় শিরা'], ['Pulmonary artery', 'ফুসফুসীয় ধমনী'], ['Vena cava', 'মহাশিরা'], ['None', 'কোনোটিই না']], 0, 'cir.dbl.pulm-vein')
  ],
  limitation: limitation('The two loops are drawn as a flat figure of eight; red and blue are teaching colours.', 'দুটি পথকে সমতল আটের আকারে দেখানো হয়েছে; লাল ও নীল শিক্ষণ রং।')
};

const vessels = {
  id: 'vessels', tag: { en: 'structure', bn: 'গঠন' },
  title: { en: 'Arteries, veins and capillaries', bn: 'ধমনী, শিরা ও কৈশিকনালি' },
  lead: { en: 'Three kinds of tubes, each built for its job.', bn: 'তিন রকম নল, প্রতিটি নিজের কাজের উপযোগী গঠনের।' },
  claims: [
    claim('cir.ves.artery', 'class9', 'Arteries carry blood away from the heart; they have thick, elastic walls because the blood is under high pressure.', 'ধমনী হৃৎপিণ্ড থেকে রক্ত দূরে নিয়ে যায়; রক্ত উচ্চ চাপে থাকে বলে এর প্রাচীর পুরু ও স্থিতিস্থাপক।', [S.NCERT_X, S.OS_AP_VESSELS]),
    claim('cir.ves.vein', 'class9', 'Veins bring blood back to the heart; they have thinner walls and valves that keep blood flowing in one direction.', 'শিরা হৃৎপিণ্ডে রক্ত ফিরিয়ে আনে; এর প্রাচীর পাতলা এবং কপাটিকা রক্তকে একমুখী রাখে।', [S.NCERT_X, S.OS_AP_VESSELS]),
    claim('cir.ves.capillary', 'class9', 'Capillaries have walls only one cell thick, so materials are exchanged between blood and surrounding cells.', 'কৈশিকনালির প্রাচীর মাত্র একটি কোশ পুরু, তাই রক্ত ও চারপাশের কোশের মধ্যে পদার্থের আদানপ্রদান ঘটে।', [S.NCERT_X, S.OS_AP_VESSELS]),
    claim('cir.ves.layers', 'neet', 'Arteries and veins have three layers: tunica intima, tunica media (smooth muscle) and tunica externa; the media is much thicker in arteries.', 'ধমনী ও শিরায় তিনটি স্তর: টিউনিকা ইন্টিমা, টিউনিকা মিডিয়া (মসৃণ পেশি) এবং টিউনিকা এক্সটার্না; ধমনীতে মিডিয়া অনেক বেশি পুরু।', [S.NCERT_XI_BF, S.OS_AP_VESSELS])
  ],
  parts: [
    part('artery', 'class9', '#ef4444', 'Artery', 'ধমনী (Artery)', 'Thick, elastic wall; narrow lumen.', 'পুরু স্থিতিস্থাপক প্রাচীর; সরু গহ্বর।', 'class11-12', 'Its elastic wall stretches with each beat — felt as the pulse.', 'প্রতিটি স্পন্দনে এর স্থিতিস্থাপক প্রাচীর প্রসারিত হয় — একেই নাড়ি হিসেবে অনুভব করা যায়।'),
    part('vein', 'class9', '#3b82f6', 'Vein', 'শিরা (Vein)', 'Thinner wall; wide lumen; valves.', 'পাতলা প্রাচীর; চওড়া গহ্বর; কপাটিকা।', 'class11-12', 'Contracting leg muscles squeeze veins and push blood upward.', 'পায়ের পেশি সংকুচিত হয়ে শিরাকে চাপ দেয় এবং রক্তকে ওপরে ঠেলে দেয়।'),
    part('capillary', 'class9', '#a855f7', 'Capillary', 'কৈশিকনালি (Capillary)', 'Wall one cell thick; site of exchange.', 'একটি কোশ পুরু প্রাচীর; আদানপ্রদানের স্থান।', 'class10', 'So narrow that red blood cells pass in single file.', 'এত সরু যে লোহিত রক্তকণিকা একটির পর একটি সারি দিয়ে চলে।'),
    part('media', 'neet', '#f9a8d4', 'Tunica media', 'টিউনিকা মিডিয়া', 'Middle smooth-muscle layer.', 'মাঝের মসৃণ পেশির স্তর।', 'neet', 'Contracts or relaxes to narrow or widen the vessel.', 'সংকুচিত বা শিথিল হয়ে বাহকে সরু বা চওড়া করে।')
  ],
  chapters: [
    chapter('overview', 'class9', 15, '1. Three tubes', '1. তিনটি নল', 'Compare the wall thickness and lumen of an artery, a vein and a capillary.', 'ধমনী, শিরা ও কৈশিকনালির প্রাচীরের পুরুত্ব ও গহ্বর তুলনা করুন।'),
    chapter('pulse', 'class10', 18, '2. Pulse and valves', '2. নাড়ি ও কপাটিকা', 'The artery stretches with each beat; vein valves open forward and close against backflow.', 'প্রতিটি স্পন্দনে ধমনী প্রসারিত হয়; শিরার কপাটিকা সামনের দিকে খোলে এবং পেছনে প্রবাহে বন্ধ হয়।')
  ],
  myths: [
    myth('class9', '"Veins have no valves."', '"শিরায় কোনো কপাটিকা নেই।"', 'Many veins, especially in the limbs, have valves.', 'অনেক শিরায়, বিশেষত হাত-পায়ে, কপাটিকা থাকে।')
  ],
  quiz: [
    quiz('vs1', 'class9', 'Arteries carry blood…', 'ধমনী রক্ত বহন করে…', [['Away from the heart', 'হৃৎপিণ্ড থেকে দূরে'], ['Towards the heart', 'হৃৎপিণ্ডের দিকে'], ['Only to the lungs', 'কেবল ফুসফুসে'], ['Only within the heart', 'কেবল হৃৎপিণ্ডের ভেতরে']], 0, 'cir.ves.artery'),
    quiz('vs2', 'class9', 'Which vessels have valves?', 'কোন বাহে কপাটিকা থাকে?', [['Veins', 'শিরা'], ['Capillaries', 'কৈশিকনালি'], ['Arteries only', 'কেবল ধমনী'], ['None', 'কোনোটিই না']], 0, 'cir.ves.vein'),
    quiz('vs3', 'class9', 'Exchange of materials happens through…', 'পদার্থের আদানপ্রদান ঘটে…', [['Capillaries', 'কৈশিকনালির মাধ্যমে'], ['Arteries', 'ধমনীর মাধ্যমে'], ['Veins', 'শিরার মাধ্যমে'], ['Heart valves', 'হৃৎকপাটিকার মাধ্যমে']], 0, 'cir.ves.capillary'),
    quiz('vs4', 'neet', 'The smooth-muscle layer of a vessel is the…', 'রক্তবাহের মসৃণ পেশির স্তর হলো…', [['Tunica media', 'টিউনিকা মিডিয়া'], ['Tunica intima', 'টিউনিকা ইন্টিমা'], ['Tunica externa', 'টিউনিকা এক্সটার্না'], ['Endocardium', 'এন্ডোকার্ডিয়াম']], 0, 'cir.ves.layers')
  ],
  limitation: limitation('The capillary is drawn much larger than real (real width about one red cell).', 'কৈশিকনালিকে বাস্তবের চেয়ে অনেক বড় দেখানো হয়েছে (বাস্তবে প্রায় একটি লোহিত কণিকার সমান চওড়া)।')
};

const blood = {
  id: 'blood', tag: { en: 'fluid tissue', bn: 'তরল কলা' },
  title: { en: 'Blood', bn: 'রক্ত' },
  lead: { en: 'A fluid connective tissue: plasma carrying red cells, white cells and platelets.', bn: 'তরল যোগকলা: প্লাজমা, যা লোহিত কণিকা, শ্বেত কণিকা ও অণুচক্রিকা বহন করে।' },
  claims: [
    claim('cir.bld.parts', 'class9', 'Blood is a fluid connective tissue made of plasma, red blood cells, white blood cells and platelets.', 'রক্ত একটি তরল যোগকলা, যা প্লাজমা, লোহিত রক্তকণিকা, শ্বেত রক্তকণিকা ও অণুচক্রিকা দিয়ে গঠিত।', [S.NCERT_X, S.OS_AP_BLOOD]),
    claim('cir.bld.rbc', 'class9', 'Red blood cells contain haemoglobin, which carries oxygen; plasma carries food, carbon dioxide and wastes in dissolved form.', 'লোহিত রক্তকণিকায় হিমোগ্লোবিন থাকে, যা অক্সিজেন বহন করে; প্লাজমা খাদ্য, কার্বন ডাইঅক্সাইড ও বর্জ্য দ্রবীভূত অবস্থায় বহন করে।', [S.NCERT_X, S.OS_AP_BLOOD]),
    claim('cir.bld.platelets', 'class10', 'Platelets help blood to clot at a wound, preventing loss of blood.', 'অণুচক্রিকা ক্ষতস্থানে রক্ত জমাট বাঁধতে সাহায্য করে, ফলে রক্তক্ষরণ বন্ধ হয়।', [S.NCERT_X, S.OS_AP_BLOOD]),
    claim('cir.bld.count', 'neet', 'A healthy adult has about 5–5.5 million red cells per mm³ of blood; human red cells have no nucleus and live about 120 days.', 'সুস্থ প্রাপ্তবয়স্কের প্রতি mm³ রক্তে প্রায় 5–5.5 মিলিয়ন লোহিত কণিকা থাকে; মানুষের লোহিত কণিকায় নিউক্লিয়াস নেই এবং এরা প্রায় 120 দিন বাঁচে।', [S.NCERT_XI_BF, S.OS_AP_BLOOD], { value: 5, unit: 'million/mm³', range: [5, 5.5] })
  ],
  parts: [
    part('plasma', 'class9', '#fde68a', 'Plasma', 'প্লাজমা (Plasma)', 'Pale yellow liquid part of blood.', 'রক্তের হালকা হলুদ তরল অংশ।', 'neet', 'About 90–92% water, with proteins such as albumin and fibrinogen.', 'প্রায় 90–92% জল, সঙ্গে অ্যালবুমিন ও ফাইব্রিনোজেনের মতো প্রোটিন।'),
    part('rbc', 'class9', '#dc2626', 'Red blood cells', 'লোহিত রক্তকণিকা', 'Disc-shaped cells that carry oxygen.', 'চাকতির মতো কোশ, যা অক্সিজেন বহন করে।', 'neet', 'Biconcave shape gives a large surface for gas exchange.', 'দ্বি-অবতল আকৃতি গ্যাস বিনিময়ের জন্য বড় তল দেয়।'),
    part('wbc', 'class9', '#e2e8f0', 'White blood cells', 'শ্বেত রক্তকণিকা', 'Defend the body against germs.', 'জীবাণুর বিরুদ্ধে দেহকে রক্ষা করে।', 'class11-12', 'They have nuclei; some engulf microbes, others make antibodies.', 'এদের নিউক্লিয়াস থাকে; কিছু জীবাণু গ্রাস করে, কিছু অ্যান্টিবডি তৈরি করে।'),
    part('platelet', 'class10', '#c084fc', 'Platelets', 'অণুচক্রিকা (Platelets)', 'Cell fragments that start clotting.', 'কোশখণ্ড, যা রক্ত জমাট বাঁধা শুরু করে।', 'class11-12', 'They release factors that turn fibrinogen into a fibrin mesh.', 'এরা এমন উপাদান ছাড়ে, যা ফাইব্রিনোজেনকে ফাইব্রিনের জালে পরিণত করে।')
  ],
  chapters: [
    chapter('overview', 'class9', 15, '1. What is in blood?', '1. রক্তে কী আছে?', 'Red cells, white cells and platelets float in liquid plasma.', 'লোহিত কণিকা, শ্বেত কণিকা ও অণুচক্রিকা তরল প্লাজমায় ভাসে।'),
    chapter('clot', 'class10', 20, '2. Sealing a wound', '2. ক্ষত বন্ধ করা', 'Platelets gather at a cut and a fibrin mesh traps red cells to form a clot.', 'কাটা জায়গায় অণুচক্রিকা জড়ো হয় এবং ফাইব্রিনের জাল লোহিত কণিকা আটকে জমাট তৈরি করে।')
  ],
  myths: [
    myth('neet', '"All blood cells have a nucleus."', '"সব রক্তকণিকায় নিউক্লিয়াস থাকে।"', 'Mature human red cells and platelets have no nucleus.', 'পরিণত মানব লোহিত কণিকা ও অণুচক্রিকায় নিউক্লিয়াস থাকে না।')
  ],
  quiz: [
    quiz('bl1', 'class9', 'Oxygen is carried mainly by…', 'অক্সিজেন প্রধানত বহন করে…', [['Haemoglobin in red cells', 'লোহিত কণিকার হিমোগ্লোবিন'], ['Platelets', 'অণুচক্রিকা'], ['White cells', 'শ্বেত কণিকা'], ['Bile', 'পিত্ত']], 0, 'cir.bld.rbc'),
    quiz('bl2', 'class9', 'The liquid part of blood is…', 'রক্তের তরল অংশ হলো…', [['Plasma', 'প্লাজমা'], ['Lymph', 'লসিকা'], ['Serum only', 'কেবল সিরাম'], ['Water only', 'কেবল জল']], 0, 'cir.bld.parts'),
    quiz('bl3', 'class9', 'Blood is a…', 'রক্ত হলো একটি…', [['Fluid connective tissue', 'তরল যোগকলা'], ['Muscle tissue', 'পেশিকলা'], ['Nervous tissue', 'স্নায়ুকলা'], ['Epithelium', 'আবরণী কলা']], 0, 'cir.bld.parts'),
    quiz('bl4', 'class10', 'Which help in clotting?', 'কোনগুলি রক্ত জমাট বাঁধতে সাহায্য করে?', [['Platelets', 'অণুচক্রিকা'], ['Red cells', 'লোহিত কণিকা'], ['Plasma water', 'প্লাজমার জল'], ['Valves', 'কপাটিকা']], 0, 'cir.bld.platelets'),
    quiz('bl5', 'neet', 'The lifespan of a human red cell is about…', 'মানব লোহিত কণিকার আয়ু প্রায়…', [['120 days', '120 দিন'], ['12 days', '12 দিন'], ['1 year', '1 বছর'], ['7 days', '7 দিন']], 0, 'cir.bld.count')
  ],
  limitation: limitation('Cell proportions are changed for clarity; real blood has about 600 red cells for each white cell.', 'স্পষ্টতার জন্য কোশের অনুপাত বদলানো হয়েছে; বাস্তবে প্রতি শ্বেত কণিকায় প্রায় 600টি লোহিত কণিকা থাকে।')
};

const plant = {
  id: 'plant-transport', tag: { en: 'plant', bn: 'উদ্ভিদ' },
  title: { en: 'Transport in plants', bn: 'উদ্ভিদে পরিবহণ' },
  lead: { en: 'Water rises in xylem pulled by transpiration; food moves in phloem.', bn: 'বাষ্পমোচনের টানে জাইলেমে জল ওঠে; ফ্লোয়েমে খাদ্য চলাচল করে।' },
  claims: [
    claim('cir.pla.xylem', 'class9', 'Xylem carries water and minerals from the roots to the leaves; phloem carries food made in the leaves to other parts.', 'জাইলেম মূল থেকে পাতায় জল ও খনিজ বহন করে; ফ্লোয়েম পাতায় তৈরি খাদ্য অন্যান্য অংশে বহন করে।', [S.NCERT_X, S.OS_BIO_PLANT]),
    claim('cir.pla.transpiration', 'class10', 'Loss of water vapour from the aerial parts of a plant, mainly through stomata, is transpiration; it creates a suction that pulls water up the xylem.', 'উদ্ভিদের বায়বীয় অংশ, প্রধানত পত্ররন্ধ্র, থেকে জলীয় বাষ্প বেরিয়ে যাওয়াকে বাষ্পমোচন বলে; এটি এমন টান তৈরি করে, যা জাইলেমে জলকে ওপরে তোলে।', [S.NCERT_X, S.OS_BIO_PLANT]),
    claim('cir.pla.translocation', 'class10', 'Transport of food in phloem (translocation) uses energy from ATP and can go upward or downward.', 'ফ্লোয়েমে খাদ্যের পরিবহণ (স্থানান্তর) ATP থেকে শক্তি ব্যবহার করে এবং ওপরে বা নিচে দুদিকেই হতে পারে।', [S.NCERT_X, S.OS_BIO_PLANT]),
    claim('cir.pla.cohesion', 'class11-12', 'Water molecules stick to each other (cohesion) and to xylem walls (adhesion), so the transpiration pull lifts an unbroken water column.', 'জলের অণু একে অপরের সঙ্গে (সংসক্তি) এবং জাইলেমের প্রাচীরের সঙ্গে (আসঞ্জন) লেগে থাকে, তাই বাষ্পমোচনের টান একটি অবিচ্ছিন্ন জলস্তম্ভকে ওপরে তোলে।', [S.OS_BIO_PLANT, S.NCERT_X])
  ],
  parts: [
    part('root', 'class9', '#a16207', 'Root', 'মূল (Root)', 'Absorbs water and minerals from soil.', 'মাটি থেকে জল ও খনিজ শোষণ করে।', 'class10', 'Root hairs give a large surface for absorption.', 'মূলরোম শোষণের জন্য বড় তল দেয়।'),
    part('xylem', 'class9', '#60a5fa', 'Xylem', 'জাইলেম (Xylem)', 'Carries water upward.', 'জলকে ওপরে বহন করে।', 'class11-12', 'Vessels and tracheids are dead, hollow tubes.', 'ভেসেল ও ট্র্যাকিড মৃত, ফাঁপা নল।'),
    part('phloem', 'class9', '#fb923c', 'Phloem', 'ফ্লোয়েম (Phloem)', 'Carries food both ways.', 'খাদ্যকে দুদিকে বহন করে।', 'class11-12', 'Sieve tubes are living cells helped by companion cells.', 'সিভনল জীবিত কোশ, সহকারী কোশ এদের সাহায্য করে।'),
    part('leaf', 'class9', '#22c55e', 'Leaf and stomata', 'পাতা ও পত্ররন্ধ্র', 'Water vapour escapes through stomata.', 'পত্ররন্ধ্র দিয়ে জলীয় বাষ্প বেরিয়ে যায়।', 'class10', 'Guard cells open and close the stomata.', 'রক্ষীকোশ পত্ররন্ধ্র খোলে ও বন্ধ করে।')
  ],
  chapters: [
    chapter('overview', 'class9', 14, '1. Two pipelines', '1. দুটি নালিপথ', 'Xylem and phloem run from root to leaf.', 'জাইলেম ও ফ্লোয়েম মূল থেকে পাতা পর্যন্ত বিস্তৃত।'),
    chapter('transpiration', 'class10', 22, '2. Transpiration pull', '2. বাষ্পমোচনের টান', 'Vapour leaves the stomata; water is pulled up the xylem; sugar moves in the phloem.', 'পত্ররন্ধ্র দিয়ে বাষ্প বেরোয়; জাইলেমে জল টেনে তোলা হয়; ফ্লোয়েমে শর্করা চলাচল করে।')
  ],
  myths: [
    myth('class10', '"Roots push water all the way to the top of tall trees."', '"মূল জলকে ঠেলে উঁচু গাছের মাথা পর্যন্ত তোলে।"', 'Root pressure helps mainly at night; in daytime the transpiration pull is the main force.', 'মূলজ চাপ প্রধানত রাতে সাহায্য করে; দিনের বেলায় বাষ্পমোচনের টানই প্রধান শক্তি।')
  ],
  quiz: [
    quiz('pt1', 'class9', 'Water is carried by…', 'জল বহন করে…', [['Xylem', 'জাইলেম'], ['Phloem', 'ফ্লোয়েম'], ['Stomata', 'পত্ররন্ধ্র'], ['Cambium', 'ক্যাম্বিয়াম']], 0, 'cir.pla.xylem'),
    quiz('pt2', 'class9', 'Food is carried by…', 'খাদ্য বহন করে…', [['Phloem', 'ফ্লোয়েম'], ['Xylem', 'জাইলেম'], ['Root hair', 'মূলরোম'], ['Cuticle', 'কিউটিকল']], 0, 'cir.pla.xylem'),
    quiz('pt3', 'class9', 'Xylem carries water from…', 'জাইলেম জল বহন করে…', [['Roots to leaves', 'মূল থেকে পাতায়'], ['Leaves to roots', 'পাতা থেকে মূলে'], ['Flower to fruit', 'ফুল থেকে ফলে'], ['Nowhere', 'কোথাও না']], 0, 'cir.pla.xylem'),
    quiz('pt4', 'class10', 'Transpiration mainly occurs through…', 'বাষ্পমোচন প্রধানত ঘটে…', [['Stomata', 'পত্ররন্ধ্র দিয়ে'], ['Roots', 'মূল দিয়ে'], ['Phloem', 'ফ্লোয়েম দিয়ে'], ['Seeds', 'বীজ দিয়ে']], 0, 'cir.pla.transpiration')
  ],
  limitation: limitation('Only two tubes of each kind are shown; flow speeds are not to scale.', 'প্রতি রকমের কেবল দুটি নল দেখানো হয়েছে; প্রবাহের গতি অনুপাতে নয়।')
};

export const circulationPacks = [heart, double, vessels, blood, plant];
