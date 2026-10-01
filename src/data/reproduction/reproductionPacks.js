// Reproduction bay deep-dive packs (docs/bays/REPRODUCTION_MASTERPLAN.md §1 sensitivity rules):
// schematic textbook-style shapes only, neutral clinical language, level-gated (NEET topics only at NEET),
// health content is educational with a "consult a doctor" note, no personal cycle tracking.
import { claim, part, chapter, myth, quiz, limitation } from '../packHelpers.js';

const S = {
  NCERT_IX: { kind: 'syllabus', title: 'NCERT Science Class 9 (Exploration, 2026-27), Ch 11 Reproduction', url: 'https://ncert.nic.in/textbook.php' },
  NCERT_X: { kind: 'syllabus', title: 'NCERT Science Class 10 (Reprint 2026-27), Ch 7 How do Organisms Reproduce?', url: 'https://ncert.nic.in/textbook/pdf/jesc107.pdf' },
  NCERT_XII_HR: { kind: 'syllabus', title: 'NCERT Biology Class 12, Human Reproduction', url: 'https://ncert.nic.in/textbook.php' },
  NCERT_XII_RH: { kind: 'syllabus', title: 'NCERT Biology Class 12, Reproductive Health', url: 'https://ncert.nic.in/textbook.php' },
  NCERT_XII_FP: { kind: 'syllabus', title: 'NCERT Biology Class 12, Sexual Reproduction in Flowering Plants', url: 'https://ncert.nic.in/textbook.php' },
  OS_BIO_ASEX: { kind: 'reference', title: 'OpenStax Biology 2e, 43.1 Reproduction Methods (CC BY 4.0)', url: 'https://openstax.org/books/biology-2e/pages/43-1-reproduction-methods' },
  OS_BIO_FLOWER: { kind: 'reference', title: 'OpenStax Biology 2e, 32.2 Pollination and Fertilization (CC BY 4.0)', url: 'https://openstax.org/books/biology-2e/pages/32-2-pollination-and-fertilization' },
  OS_AP_REPRO: { kind: 'reference', title: 'OpenStax Anatomy & Physiology 2e, Ch 27 The Reproductive System (CC BY 4.0)', url: 'https://openstax.org/books/anatomy-and-physiology-2e/pages/27-introduction' },
  OS_AP_CYCLE: { kind: 'reference', title: 'OpenStax Anatomy & Physiology 2e, 27.2 Anatomy and Physiology of the Ovarian/Uterine Cycle (CC BY 4.0)', url: 'https://openstax.org/books/anatomy-and-physiology-2e/pages/27-2-anatomy-and-physiology-of-the-female-reproductive-system' },
  LH_TIMING: { kind: 'peer-reviewed', title: 'Documentation of Ovulation (GLOWM): estradiol peaks ~24–48 h before the LH surge; ovulation ~24–36 h after LH onset', url: 'https://www.glowm.com/section-view/heading/Documentation%20of%20Ovulation/item/308' },
  WHO_FP: { kind: 'official', title: 'WHO fact sheet: Family planning/contraception methods', url: 'https://www.who.int/news-room/fact-sheets/detail/family-planning-contraception' },
  PCPNDT: { kind: 'official', title: 'Government of India: Pre-Conception and Pre-Natal Diagnostic Techniques (PCPNDT) Act, 1994', url: 'https://www.indiacode.nic.in/handle/123456789/1817' }
};

const asexual = {
  id: 'asexual', tag: { en: 'single parent', bn: 'একক জনিতৃ' },
  title: { en: 'Asexual reproduction', bn: 'অযৌন জনন' },
  lead: { en: 'One parent makes offspring that are copies of itself: fission, budding and more.', bn: 'একটি জনিতৃ নিজের প্রতিরূপ অপত্য তৈরি করে: বিভাজন, মুকুলোদ্গম ইত্যাদি।' },
  claims: [
    claim('rep.asx.fission', 'class9', 'In binary fission, a single-celled organism such as Amoeba splits into two equal halves.', 'দ্বিবিভাজনে অ্যামিবার মতো এককোশী জীব দুটি সমান অংশে বিভক্ত হয়।', [S.NCERT_X, S.OS_BIO_ASEX]),
    claim('rep.asx.budding', 'class9', 'In budding, as in Hydra and yeast, an outgrowth develops into a new individual and then detaches.', 'মুকুলোদ্গমে, যেমন হাইড্রা ও ঈস্টে, একটি উপবৃদ্ধি থেকে নতুন জীব তৈরি হয়ে পরে আলাদা হয়ে যায়।', [S.NCERT_X, S.OS_BIO_ASEX]),
    claim('rep.asx.other', 'class10', 'Other methods include regeneration (Planaria), fragmentation (Spirogyra), spore formation (Rhizopus) and vegetative propagation (Bryophyllum leaf buds).', 'অন্যান্য পদ্ধতির মধ্যে আছে পুনরুৎপাদন (প্ল্যানেরিয়া), খণ্ডীভবন (স্পাইরোগাইরা), রেণু উৎপাদন (রাইজোপাস) ও অঙ্গজ জনন (পাথরকুচির পাতার মুকুল)।', [S.NCERT_X, S.OS_BIO_ASEX]),
    claim('rep.asx.variation', 'class10', 'Offspring of asexual reproduction show very little variation because DNA copying is the only source of change.', 'অযৌন জননে অপত্যদের মধ্যে প্রকরণ খুব কম, কারণ DNA প্রতিলিপির ত্রুটিই পরিবর্তনের একমাত্র উৎস।', [S.NCERT_X, S.OS_BIO_ASEX])
  ],
  parts: [
    part('parent', 'class9', '#a78bfa', 'Parent cell', 'জনিতৃ কোশ', 'The organism that divides.', 'যে জীব বিভাজিত হয়।', 'class10', 'Amoeba shown here.', 'এখানে অ্যামিবা দেখানো হয়েছে।'),
    part('nucleus', 'class9', '#4c1d95', 'Nucleus', 'নিউক্লিয়াস', 'Divides first, so each daughter gets one.', 'প্রথমে বিভাজিত হয়, ফলে প্রতিটি অপত্য একটি করে পায়।', 'class11-12', 'Copies its DNA before dividing.', 'বিভাজনের আগে DNA-এর প্রতিলিপি তৈরি করে।'),
    part('bud', 'class9', '#34d399', 'Bud', 'মুকুল', 'Outgrowth that becomes a new individual.', 'উপবৃদ্ধি, যা নতুন জীবে পরিণত হয়।', 'class10', 'Hydra buds form from regenerative cells.', 'হাইড্রার মুকুল পুনরুৎপাদী কোশ থেকে তৈরি হয়।')
  ],
  chapters: [
    chapter('overview', 'class9', 16, '1. Binary fission', '1. দ্বিবিভাজন', 'The nucleus divides, then the cell pinches into two daughter cells.', 'নিউক্লিয়াস বিভাজিত হয়, তারপর কোশ চেপে দুটি অপত্য কোশে ভাগ হয়।'),
    chapter('budding', 'class9', 18, '2. Budding', '2. মুকুলোদ্গম', 'A bud grows from the parent, matures, and separates.', 'জনিতৃ থেকে মুকুল বেড়ে ওঠে, পরিণত হয় এবং আলাদা হয়ে যায়।')
  ],
  myths: [myth('class10', '"Asexual offspring are always perfectly identical."', '"অযৌন জননের অপত্য সবসময় হুবহু এক।"', 'Small copying errors in DNA create slight variation.', 'DNA প্রতিলিপির ছোট ত্রুটি সামান্য প্রকরণ সৃষ্টি করে।')],
  quiz: [
    quiz('as1', 'class9', 'Amoeba reproduces by…', 'অ্যামিবা জনন করে…', [['Binary fission', 'দ্বিবিভাজনে'], ['Budding', 'মুকুলোদ্গমে'], ['Seeds', 'বীজে'], ['Spores only', 'কেবল রেণুতে']], 0, 'rep.asx.fission'),
    quiz('as2', 'class9', 'Hydra reproduces asexually by…', 'হাইড্রা অযৌনভাবে জনন করে…', [['Budding', 'মুকুলোদ্গমে'], ['Binary fission', 'দ্বিবিভাজনে'], ['Pollination', 'পরাগযোগে'], ['Fragmentation', 'খণ্ডীভবনে']], 0, 'rep.asx.budding'),
    quiz('as3', 'class9', 'Yeast commonly reproduces by…', 'ঈস্ট সাধারণত জনন করে…', [['Budding', 'মুকুলোদ্গমে'], ['Seeds', 'বীজে'], ['Regeneration', 'পুনরুৎপাদনে'], ['Pollination', 'পরাগযোগে']], 0, 'rep.asx.budding'),
    quiz('as4', 'class10', 'Bryophyllum reproduces through…', 'পাথরকুচি জনন করে…', [['Buds on leaf margins', 'পাতার কিনারার মুকুলে'], ['Binary fission', 'দ্বিবিভাজনে'], ['Spores', 'রেণুতে'], ['Budding of cells', 'কোশের মুকুলোদ্গমে']], 0, 'rep.asx.other')
  ],
  limitation: limitation('Division is sped up from minutes or hours to seconds.', 'বিভাজনের সময় মিনিট বা ঘণ্টা থেকে কমিয়ে সেকেন্ডে আনা হয়েছে।')
};

const flower = {
  id: 'flower', tag: { en: 'plant', bn: 'উদ্ভিদ' },
  title: { en: 'Flower, pollination and fertilisation', bn: 'ফুল, পরাগযোগ ও নিষেক' },
  lead: { en: 'Pollen travels to the stigma, a pollen tube grows to the ovule, and fertilisation forms a seed.', bn: 'পরাগরেণু গর্ভমুণ্ডে পৌঁছায়, পরাগনালি ডিম্বকে যায় এবং নিষেকের ফলে বীজ তৈরি হয়।' },
  claims: [
    claim('rep.flw.parts', 'class9', 'The stamen is the male part and produces pollen; the carpel (pistil) is the female part, with stigma, style and ovary containing ovules.', 'পুংকেশর পুরুষ অংশ, যা পরাগরেণু তৈরি করে; গর্ভপত্র (গর্ভকেশর) স্ত্রী অংশ, যাতে গর্ভমুণ্ড, গর্ভদণ্ড ও ডিম্বাশয় থাকে এবং ডিম্বাশয়ে ডিম্বক থাকে।', [S.NCERT_X, S.OS_BIO_FLOWER]),
    claim('rep.flw.pollination', 'class9', 'Transfer of pollen from the stamen to the stigma is pollination; it may be self- or cross-pollination, by wind, water or animals.', 'পুংকেশর থেকে গর্ভমুণ্ডে পরাগরেণুর স্থানান্তর হলো পরাগযোগ; এটি স্বপরাগযোগ বা ইতর পরাগযোগ হতে পারে, বায়ু, জল বা প্রাণীর মাধ্যমে।', [S.NCERT_X, S.OS_BIO_FLOWER]),
    claim('rep.flw.fruit', 'class10', 'A pollen tube grows through the style to the ovule; after fertilisation the zygote forms an embryo, the ovule becomes a seed and the ovary becomes the fruit.', 'পরাগনালি গর্ভদণ্ডের মধ্য দিয়ে ডিম্বকে পৌঁছায়; নিষেকের পরে জাইগোট থেকে ভ্রূণ হয়, ডিম্বক বীজে এবং ডিম্বাশয় ফলে পরিণত হয়।', [S.NCERT_X, S.OS_BIO_FLOWER]),
    claim('rep.flw.double', 'neet', 'Double fertilisation: one male gamete fuses with the egg (zygote, 2n) and the other with the two polar nuclei (primary endosperm nucleus, 3n).', 'দ্বি-নিষেক: একটি পুংগ্যামেট ডিম্বাণুর সঙ্গে মিলে জাইগোট (2n) এবং অন্যটি দুটি মেরু নিউক্লিয়াসের সঙ্গে মিলে প্রাথমিক সস্য নিউক্লিয়াস (3n) তৈরি করে।', [S.NCERT_XII_FP, S.OS_BIO_FLOWER])
  ],
  parts: [
    part('petal', 'class9', '#f472b6', 'Petals', 'পাপড়ি', 'Colourful parts that attract insects.', 'রঙিন অংশ, যা পতঙ্গকে আকর্ষণ করে।', 'class10', 'Not directly involved in fertilisation.', 'নিষেকে সরাসরি অংশ নেয় না।'),
    part('stamen', 'class9', '#facc15', 'Stamen', 'পুংকেশর', 'Male part: filament and anther with pollen.', 'পুরুষ অংশ: পুংদণ্ড ও পরাগরেণুসহ পরাগধানী।', 'class11-12', 'Pollen grains carry the male gametes.', 'পরাগরেণু পুংগ্যামেট বহন করে।'),
    part('carpel', 'class9', '#22c55e', 'Carpel', 'গর্ভপত্র', 'Female part: stigma, style, ovary.', 'স্ত্রী অংশ: গর্ভমুণ্ড, গর্ভদণ্ড, ডিম্বাশয়।', 'class10', 'The sticky stigma traps pollen.', 'আঠালো গর্ভমুণ্ড পরাগরেণু আটকে রাখে।'),
    part('ovule', 'class10', '#fde68a', 'Ovule', 'ডিম্বক', 'Contains the egg; becomes the seed.', 'ডিম্বাণু থাকে; বীজে পরিণত হয়।', 'neet', 'Holds the embryo sac with egg and polar nuclei.', 'এতে ডিম্বাণু ও মেরু নিউক্লিয়াসসহ ভ্রূণস্থলী থাকে।'),
    part('pollen-tube', 'class10', '#fb923c', 'Pollen tube', 'পরাগনালি', 'Grows down the style to the ovule.', 'গর্ভদণ্ড বেয়ে ডিম্বক পর্যন্ত বাড়ে।', 'neet', 'Delivers two male gametes.', 'দুটি পুংগ্যামেট পৌঁছে দেয়।')
  ],
  chapters: [
    chapter('overview', 'class9', 15, '1. Parts of a flower', '1. ফুলের অংশ', 'Petals around stamens and a central carpel.', 'পাপড়ির ভেতরে পুংকেশর এবং মাঝখানে গর্ভপত্র।'),
    chapter('pollinate', 'class10', 24, '2. Pollen to seed', '2. পরাগ থেকে বীজ', 'Pollen lands on the stigma, the tube grows to the ovule, and fertilisation begins seed formation.', 'পরাগরেণু গর্ভমুণ্ডে পড়ে, নালি ডিম্বকে পৌঁছায় এবং নিষেকের পর বীজ গঠন শুরু হয়।')
  ],
  myths: [myth('class10', '"Pollination and fertilisation are the same."', '"পরাগযোগ ও নিষেক একই।"', 'Pollination is transfer of pollen; fertilisation is fusion of gametes, which comes later.', 'পরাগযোগ হলো পরাগরেণুর স্থানান্তর; নিষেক হলো গ্যামেটের মিলন, যা পরে ঘটে।')],
  quiz: [
    quiz('fl1', 'class9', 'The male part of a flower is the…', 'ফুলের পুরুষ অংশ হলো…', [['Stamen', 'পুংকেশর'], ['Carpel', 'গর্ভপত্র'], ['Petal', 'পাপড়ি'], ['Sepal', 'বৃত্যংশ']], 0, 'rep.flw.parts'),
    quiz('fl2', 'class9', 'Pollination is the transfer of pollen to the…', 'পরাগযোগ হলো পরাগরেণুর স্থানান্তর…', [['Stigma', 'গর্ভমুণ্ডে'], ['Petal', 'পাপড়িতে'], ['Root', 'মূলে'], ['Leaf', 'পাতায়']], 0, 'rep.flw.pollination'),
    quiz('fl3', 'class9', 'Ovules are found in the…', 'ডিম্বক থাকে…', [['Ovary', 'ডিম্বাশয়ে'], ['Anther', 'পরাগধানীতে'], ['Petal', 'পাপড়িতে'], ['Filament', 'পুংদণ্ডে']], 0, 'rep.flw.parts'),
    quiz('fl4', 'class10', 'After fertilisation the ovary becomes the…', 'নিষেকের পরে ডিম্বাশয় পরিণত হয়…', [['Fruit', 'ফলে'], ['Seed', 'বীজে'], ['Flower', 'ফুলে'], ['Leaf', 'পাতায়']], 0, 'rep.flw.fruit'),
    quiz('fl5', 'neet', 'The primary endosperm nucleus is…', 'প্রাথমিক সস্য নিউক্লিয়াস হলো…', [['Triploid (3n)', 'ত্রিপ্লয়েড (3n)'], ['Haploid (n)', 'হ্যাপ্লয়েড (n)'], ['Diploid (2n)', 'ডিপ্লয়েড (2n)'], ['Tetraploid (4n)', 'টেট্রাপ্লয়েড (4n)']], 0, 'rep.flw.double')
  ],
  limitation: limitation('A generic flower is shown; real flowers vary widely.', 'একটি সাধারণ ফুল দেখানো হয়েছে; বাস্তব ফুলে বিস্তর ভিন্নতা।')
};

const human = {
  id: 'fertilisation', tag: { en: 'human', bn: 'মানুষ' },
  title: { en: 'Fertilisation and early development', bn: 'নিষেক ও প্রাথমিক বিকাশ' },
  lead: { en: 'Sperm meets egg in the oviduct; the zygote divides and implants in the uterus.', bn: 'ডিম্বনালিতে শুক্রাণু ও ডিম্বাণুর মিলন ঘটে; জাইগোট বিভাজিত হয়ে জরায়ুতে প্রোথিত হয়।' },
  claims: [
    claim('rep.hum.gametes', 'class10', 'Testes produce sperm and the hormone testosterone; ovaries release eggs and produce hormones such as oestrogen.', 'শুক্রাশয় শুক্রাণু ও টেস্টোস্টেরন হরমোন তৈরি করে; ডিম্বাশয় ডিম্বাণু মুক্ত করে এবং ইস্ট্রোজেনের মতো হরমোন তৈরি করে।', [S.NCERT_X, S.OS_AP_REPRO]),
    claim('rep.hum.oviduct', 'class10', 'Fertilisation takes place in the oviduct (fallopian tube); the zygote divides as it moves to the uterus and becomes implanted in the uterine wall.', 'নিষেক ঘটে ডিম্বনালিতে (ফ্যালোপিয়ান নালি); জাইগোট জরায়ুর দিকে যেতে যেতে বিভাজিত হয় এবং জরায়ুর প্রাচীরে প্রোথিত হয়।', [S.NCERT_X, S.OS_AP_REPRO]),
    claim('rep.hum.placenta', 'class10', 'The embryo gets nutrition from the mother through the placenta, which also removes the embryo\'s wastes.', 'ভ্রূণ অমরার (প্ল্যাসেন্টা) মাধ্যমে মায়ের কাছ থেকে পুষ্টি পায়; অমরা ভ্রূণের বর্জ্যও সরিয়ে দেয়।', [S.NCERT_X, S.OS_AP_REPRO]),
    claim('rep.hum.blastocyst', 'neet', 'Cleavage turns the zygote into a morula and then a blastocyst, which implants in the endometrium about a week after fertilisation.', 'বিদারণের ফলে জাইগোট মরুলা ও পরে ব্লাস্টোসিস্টে পরিণত হয়, যা নিষেকের প্রায় এক সপ্তাহ পরে এন্ডোমেট্রিয়ামে প্রোথিত হয়।', [S.NCERT_XII_HR, S.OS_AP_REPRO])
  ],
  parts: [
    part('egg', 'class10', '#fde68a', 'Egg (ovum)', 'ডিম্বাণু', 'Large female gamete.', 'বড় স্ত্রী-গ্যামেট।', 'neet', 'Surrounded by the zona pellucida.', 'জোনা পেলুসিডা দিয়ে ঘেরা।'),
    part('sperm', 'class10', '#e2e8f0', 'Sperm', 'শুক্রাণু', 'Small motile male gamete.', 'ছোট সচল পুং-গ্যামেট।', 'neet', 'Head with acrosome, midpiece with mitochondria, tail.', 'অ্যাক্রোজোমযুক্ত মস্তক, মাইটোকন্ড্রিয়াযুক্ত মধ্যাংশ ও লেজ।'),
    part('oviduct', 'class10', '#f9a8d4', 'Oviduct', 'ডিম্বনালি', 'Tube where fertilisation happens.', 'যে নালিতে নিষেক ঘটে।', 'neet', 'Usually in the ampulla region.', 'সাধারণত অ্যাম্পুলা অংশে।'),
    part('zygote', 'class10', '#a78bfa', 'Zygote and embryo', 'জাইগোট ও ভ্রূণ', 'Fertilised egg that divides.', 'নিষিক্ত ডিম্বাণু, যা বিভাজিত হয়।', 'neet', 'Morula → blastocyst.', 'মরুলা → ব্লাস্টোসিস্ট।'),
    part('uterus', 'class10', '#fb7185', 'Uterus wall', 'জরায়ুর প্রাচীর', 'Where the embryo implants.', 'যেখানে ভ্রূণ প্রোথিত হয়।', 'neet', 'Inner lining is the endometrium.', 'ভেতরের আস্তরণ এন্ডোমেট্রিয়াম।')
  ],
  chapters: [
    chapter('overview', 'class10', 16, '1. Meeting in the oviduct', '1. ডিম্বনালিতে মিলন', 'Sperm swim to the egg in the oviduct; one fuses with it.', 'শুক্রাণু ডিম্বনালিতে ডিম্বাণুর দিকে সাঁতরে যায়; একটি এর সঙ্গে মিলিত হয়।'),
    chapter('implant', 'class10', 22, '2. To the uterus', '2. জরায়ুর পথে', 'The zygote divides while travelling and implants in the uterine wall.', 'যাত্রাপথে জাইগোট বিভাজিত হয় এবং জরায়ুর প্রাচীরে প্রোথিত হয়।')
  ],
  myths: [myth('class10', '"Many sperm fertilise one egg."', '"অনেক শুক্রাণু একটি ডিম্বাণুকে নিষিক্ত করে।"', 'Only one sperm fuses; the egg then blocks others.', 'কেবল একটি শুক্রাণু মিলিত হয়; তারপর ডিম্বাণু অন্যদের আটকে দেয়।')],
  quiz: [
    quiz('hu1', 'class10', 'Fertilisation in humans occurs in the…', 'মানুষে নিষেক ঘটে…', [['Oviduct', 'ডিম্বনালিতে'], ['Uterus', 'জরায়ুতে'], ['Ovary', 'ডিম্বাশয়ে'], ['Vagina', 'যোনিতে']], 0, 'rep.hum.oviduct'),
    quiz('hu2', 'class10', 'Testes produce…', 'শুক্রাশয় তৈরি করে…', [['Sperm and testosterone', 'শুক্রাণু ও টেস্টোস্টেরন'], ['Eggs', 'ডিম্বাণু'], ['Oestrogen only', 'কেবল ইস্ট্রোজেন'], ['Insulin', 'ইনসুলিন']], 0, 'rep.hum.gametes'),
    quiz('hu3', 'class10', 'The embryo gets nutrition through the…', 'ভ্রূণ পুষ্টি পায়…', [['Placenta', 'অমরার মাধ্যমে'], ['Oviduct', 'ডিম্বনালির মাধ্যমে'], ['Ovary', 'ডিম্বাশয়ের মাধ্যমে'], ['Kidney', 'বৃক্কের মাধ্যমে']], 0, 'rep.hum.placenta'),
    quiz('hu4', 'neet', 'Which stage implants in the endometrium?', 'কোন দশা এন্ডোমেট্রিয়ামে প্রোথিত হয়?', [['Blastocyst', 'ব্লাস্টোসিস্ট'], ['Zygote', 'জাইগোট'], ['Morula', 'মরুলা'], ['Gastrula', 'গ্যাস্ট্রুলা']], 0, 'rep.hum.blastocyst')
  ],
  limitation: limitation('Schematic, textbook-style model; cells are enlarged and the journey (about a week) is compressed.', 'রেখাচিত্রধর্মী পাঠ্যবই-ধাঁচের মডেল; কোশগুলি বড় করে দেখানো এবং প্রায় এক সপ্তাহের যাত্রা সংক্ষিপ্ত করা হয়েছে।')
};

const cycle = {
  id: 'menstrual-cycle', tag: { en: 'human', bn: 'মানুষ' },
  title: { en: 'Menstrual cycle', bn: 'ঋতুচক্র' },
  lead: { en: 'A roughly monthly cycle that prepares the uterus lining for a possible pregnancy.', bn: 'প্রায় মাসিক একটি চক্র, যা সম্ভাব্য গর্ভধারণের জন্য জরায়ুর আস্তরণ প্রস্তুত করে।' },
  claims: [
    claim('rep.cyc.lining', 'class10', 'Each month the uterus lining thickens to receive a fertilised egg; if the egg is not fertilised, the lining breaks down and is shed as menstruation, which usually lasts a few days.', 'প্রতি মাসে নিষিক্ত ডিম্বাণু গ্রহণের জন্য জরায়ুর আস্তরণ পুরু হয়; ডিম্বাণু নিষিক্ত না হলে আস্তরণ ভেঙে রক্তস্রাব রূপে বেরিয়ে যায়, যাকে ঋতুস্রাব বলে; এটি সাধারণত কয়েক দিন স্থায়ী হয়।', [S.NCERT_X, S.OS_AP_CYCLE]),
    claim('rep.cyc.length', 'class11-12', 'The average cycle is about 28 days, with ovulation around the middle (about day 14); normal cycles vary between individuals.', 'গড় চক্র প্রায় 28 দিনের, মাঝামাঝি (প্রায় 14তম দিনে) ডিম্বস্ফোটন ঘটে; স্বাভাবিক চক্রের দৈর্ঘ্য ব্যক্তিভেদে আলাদা হয়।', [S.NCERT_XII_HR, S.OS_AP_CYCLE], { value: 28, unit: 'days', range: [21, 35] }),
    claim('rep.cyc.hormones', 'neet', 'Rising oestrogen from the growing follicle peaks about a day before a mid-cycle LH surge; ovulation follows about 24–36 h after the LH surge begins; the corpus luteum then secretes progesterone, which maintains the endometrium.', 'বর্ধনশীল ফলিকলের ইস্ট্রোজেন মধ্যচক্রের LH সার্জের প্রায় এক দিন আগে সর্বোচ্চ হয়; LH সার্জ শুরুর প্রায় 24–36 ঘণ্টা পরে ডিম্বস্ফোটন ঘটে; এরপর কর্পাস লুটিয়াম প্রোজেস্টেরন নিঃসরণ করে, যা এন্ডোমেট্রিয়াম বজায় রাখে।', [S.LH_TIMING, S.NCERT_XII_HR])
  ],
  parts: [
    part('endometrium', 'class10', '#fb7185', 'Uterus lining', 'জরায়ুর আস্তরণ', 'Thickens, then is shed if no pregnancy.', 'পুরু হয়, গর্ভধারণ না হলে ঝরে যায়।', 'neet', 'Called the endometrium.', 'একে এন্ডোমেট্রিয়াম বলে।'),
    part('follicle', 'class10', '#fde68a', 'Follicle and egg', 'ফলিকল ও ডিম্বাণু', 'Egg matures inside a follicle in the ovary.', 'ডিম্বাশয়ের ফলিকলের মধ্যে ডিম্বাণু পরিণত হয়।', 'neet', 'After ovulation the follicle becomes the corpus luteum.', 'ডিম্বস্ফোটনের পরে ফলিকল কর্পাস লুটিয়ামে পরিণত হয়।'),
    part('hormone-bars', 'class11-12', '#a855f7', 'Hormone levels', 'হরমোনের মাত্রা', 'Bars show relative oestrogen, LH and progesterone.', 'স্তম্ভগুলি ইস্ট্রোজেন, LH ও প্রোজেস্টেরনের আপেক্ষিক মাত্রা দেখায়।', 'neet', 'Relative teaching values, not lab units.', 'আপেক্ষিক শিক্ষণ মান, পরীক্ষাগারের একক নয়।'),
    part('day', 'class10', '#22d3ee', 'Cycle day marker', 'চক্রের দিন নির্দেশক', 'Moves around the 28-day ring.', '28 দিনের বলয়ে ঘোরে।', 'class11-12', 'Day 1 = first day of menstruation.', 'দিন 1 = ঋতুস্রাবের প্রথম দিন।')
  ],
  chapters: [
    chapter('overview', 'class10', 18, '1. Build up and shed', '1. গঠন ও ক্ষরণ', 'The lining thickens over the cycle and is shed if no fertilisation occurs.', 'চক্রজুড়ে আস্তরণ পুরু হয় এবং নিষেক না হলে ঝরে যায়।'),
    chapter('hormones', 'neet', 28, '2. The hormone timeline', '2. হরমোনের সময়রেখা', 'Oestrogen rises and peaks just before the LH surge; ovulation follows; progesterone rises in the luteal phase.', 'ইস্ট্রোজেন বেড়ে LH সার্জের ঠিক আগে সর্বোচ্চ হয়; তারপর ডিম্বস্ফোটন; লুটিয়াল দশায় প্রোজেস্টেরন বাড়ে।')
  ],
  myths: [myth('class10', '"Menstruation is impure or a sign of illness."', '"ঋতুস্রাব অশুচি বা অসুস্থতার লক্ষণ।"', 'It is a normal biological process of a healthy body.', 'এটি সুস্থ দেহের একটি স্বাভাবিক জৈবিক প্রক্রিয়া।')],
  quiz: [
    quiz('cy1', 'class10', 'If the egg is not fertilised, the uterus lining…', 'ডিম্বাণু নিষিক্ত না হলে জরায়ুর আস্তরণ…', [['Breaks down and is shed', 'ভেঙে বেরিয়ে যায়'], ['Turns into a placenta', 'অমরায় পরিণত হয়'], ['Becomes thicker forever', 'চিরকাল পুরু থাকে'], ['Becomes an egg', 'ডিম্বাণুতে পরিণত হয়']], 0, 'rep.cyc.lining'),
    quiz('cy2', 'class10', 'The uterus lining thickens to…', 'জরায়ুর আস্তরণ পুরু হয়…', [['Receive a fertilised egg', 'নিষিক্ত ডিম্বাণু গ্রহণের জন্য'], ['Digest food', 'খাদ্য পরিপাকের জন্য'], ['Make blood', 'রক্ত তৈরির জন্য'], ['Store urine', 'মূত্র জমানোর জন্য']], 0, 'rep.cyc.lining'),
    quiz('cy3', 'class10', 'Menstruation is…', 'ঋতুস্রাব হলো…', [['A normal biological process', 'একটি স্বাভাবিক জৈবিক প্রক্রিয়া'], ['A disease', 'একটি রোগ'], ['An infection', 'একটি সংক্রমণ'], ['Caused by food', 'খাদ্যের কারণে']], 0, 'rep.cyc.lining'),
    quiz('cy4', 'neet', 'Ovulation is triggered by a surge of…', 'ডিম্বস্ফোটন ঘটায় কোন হরমোনের আকস্মিক বৃদ্ধি?', [['LH', 'LH'], ['Progesterone', 'প্রোজেস্টেরন'], ['Insulin', 'ইনসুলিন'], ['Thyroxin', 'থাইরক্সিন']], 0, 'rep.cyc.hormones')
  ],
  limitation: limitation('Educational model of an average cycle, not for tracking or medical decisions; consult a doctor for health questions.', 'গড় চক্রের শিক্ষণ মডেল, হিসাব রাখা বা চিকিৎসা-সিদ্ধান্তের জন্য নয়; স্বাস্থ্য-প্রশ্নে চিকিৎসকের পরামর্শ নিন।')
};

const health = {
  id: 'reproductive-health', tag: { en: 'health', bn: 'স্বাস্থ্য' },
  title: { en: 'Reproductive health', bn: 'প্রজনন স্বাস্থ্য' },
  lead: { en: 'Informed choices, protection from infections, and the law against sex selection.', bn: 'সচেতন সিদ্ধান্ত, সংক্রমণ থেকে সুরক্ষা এবং লিঙ্গ নির্বাচনের বিরুদ্ধে আইন।' },
  claims: [
    claim('rep.hlt.methods', 'class10', 'Contraceptive methods include barrier methods (such as condoms), hormonal pills, intra-uterine devices (such as the copper-T) and surgical methods.', 'গর্ভনিরোধক পদ্ধতির মধ্যে আছে বাধা পদ্ধতি (যেমন কনডোম), হরমোনযুক্ত বড়ি, জরায়ুর ভেতরের যন্ত্র (যেমন কপার-টি) এবং শল্য পদ্ধতি।', [S.NCERT_X, S.WHO_FP]),
    claim('rep.hlt.sti', 'class10', 'Some diseases spread by sexual contact: bacterial (gonorrhoea, syphilis) and viral (warts, HIV-AIDS); barrier methods such as condoms reduce the risk.', 'কিছু রোগ যৌন সংসর্গের মাধ্যমে ছড়ায়: ব্যাকটেরিয়াঘটিত (গনোরিয়া, সিফিলিস) এবং ভাইরাসঘটিত (আঁচিল, এইচআইভি-এইডস); কনডোমের মতো বাধা পদ্ধতি ঝুঁকি কমায়।', [S.NCERT_X, S.WHO_FP]),
    claim('rep.hlt.law', 'class10', 'Prenatal sex determination is illegal in India under the PCPNDT Act, 1994, to stop female foeticide and protect a healthy sex ratio.', 'কন্যাভ্রূণ হত্যা রোধ ও সুস্থ লিঙ্গ অনুপাত রক্ষার জন্য ভারতে PCPNDT আইন, 1994 অনুযায়ী জন্মের আগে লিঙ্গ নির্ধারণ বেআইনি।', [S.PCPNDT, S.NCERT_X]),
    claim('rep.hlt.art', 'neet', 'Assisted reproductive technologies include IVF with embryo transfer, ZIFT, GIFT, ICSI and artificial insemination.', 'সহায়ক প্রজনন প্রযুক্তির মধ্যে আছে ভ্রূণ স্থানান্তরসহ IVF, ZIFT, GIFT, ICSI ও কৃত্রিম গর্ভাধান।', [S.NCERT_XII_RH, S.WHO_FP])
  ],
  parts: [
    part('barrier', 'class10', '#38bdf8', 'Barrier methods', 'বাধা পদ্ধতি', 'Physically block gametes; condoms also cut infection risk.', 'গ্যামেটকে সরাসরি আটকায়; কনডোম সংক্রমণের ঝুঁকিও কমায়।', 'class11-12', 'Only barrier methods protect against infections.', 'কেবল বাধা পদ্ধতি সংক্রমণ থেকে রক্ষা করে।'),
    part('hormonal', 'class10', '#a855f7', 'Hormonal methods', 'হরমোন পদ্ধতি', 'Pills that change the hormone balance.', 'বড়ি, যা হরমোনের ভারসাম্য বদলায়।', 'class11-12', 'May have side effects; medical advice is needed.', 'পার্শ্বপ্রতিক্রিয়া থাকতে পারে; চিকিৎসকের পরামর্শ প্রয়োজন।'),
    part('iud', 'class10', '#f59e0b', 'Copper-T (IUD)', 'কপার-টি (IUD)', 'Device placed in the uterus by a doctor.', 'চিকিৎসক জরায়ুতে স্থাপন করেন।', 'class11-12', 'Copper ions reduce sperm motility.', 'তামার আয়ন শুক্রাণুর গতিশীলতা কমায়।'),
    part('pathogen', 'class10', '#ef4444', 'Infection agents', 'সংক্রমণের জীবাণু', 'Bacteria and viruses that cause STIs.', 'যৌনবাহিত রোগ সৃষ্টিকারী ব্যাকটেরিয়া ও ভাইরাস।', 'class11-12', 'Early testing and treatment matter.', 'দ্রুত পরীক্ষা ও চিকিৎসা গুরুত্বপূর্ণ।')
  ],
  chapters: [
    chapter('overview', 'class10', 16, '1. Kinds of methods', '1. পদ্ধতির প্রকার', 'Barrier, hormonal, intra-uterine and surgical methods side by side.', 'বাধা, হরমোন, জরায়ুর ভেতরের এবং শল্য পদ্ধতি পাশাপাশি।'),
    chapter('protect', 'class10', 18, '2. Barrier protection', '2. বাধার সুরক্ষা', 'A barrier stops infection agents from passing; other methods do not.', 'বাধা সংক্রমণের জীবাণুকে আটকায়; অন্য পদ্ধতি তা পারে না।')
  ],
  myths: [myth('class10', '"Contraceptive pills protect against HIV."', '"গর্ভনিরোধক বড়ি এইচআইভি থেকে রক্ষা করে।"', 'Only barrier methods such as condoms reduce the risk of infections.', 'কেবল কনডোমের মতো বাধা পদ্ধতি সংক্রমণের ঝুঁকি কমায়।')],
  quiz: [
    quiz('rh1', 'class10', 'Which method also reduces infection risk?', 'কোন পদ্ধতি সংক্রমণের ঝুঁকিও কমায়?', [['Condom', 'কনডোম'], ['Pills', 'বড়ি'], ['Copper-T', 'কপার-টি'], ['Surgery', 'শল্যচিকিৎসা']], 0, 'rep.hlt.sti'),
    quiz('rh2', 'class10', 'HIV-AIDS is caused by a…', 'এইচআইভি-এইডসের কারণ…', [['Virus', 'ভাইরাস'], ['Bacterium', 'ব্যাকটেরিয়া'], ['Fungus', 'ছত্রাক'], ['Worm', 'কৃমি']], 0, 'rep.hlt.sti'),
    quiz('rh3', 'class10', 'Prenatal sex determination in India is…', 'ভারতে জন্মের আগে লিঙ্গ নির্ধারণ…', [['Illegal', 'বেআইনি'], ['Compulsory', 'বাধ্যতামূলক'], ['Encouraged', 'উৎসাহিত'], ['Allowed for all', 'সবার জন্য অনুমোদিত']], 0, 'rep.hlt.law'),
    quiz('rh4', 'neet', 'IVF stands for…', 'IVF-এর পূর্ণরূপ…', [['In vitro fertilisation', 'ইন ভিট্রো ফার্টিলাইজেশন (দেহের বাইরে নিষেক)'], ['Internal vaginal fertilisation', 'ইন্টারনাল ভ্যাজাইনাল ফার্টিলাইজেশন'], ['Induced viral fusion', 'ইনডিউসড ভাইরাল ফিউশন'], ['None', 'কোনোটিই না']], 0, 'rep.hlt.art')
  ],
  limitation: limitation('Abstract tokens represent methods; this is general education, not medical advice — consult a doctor.', 'বিমূর্ত প্রতীক দিয়ে পদ্ধতিগুলি দেখানো হয়েছে; এটি সাধারণ শিক্ষা, চিকিৎসা-পরামর্শ নয় — চিকিৎসকের পরামর্শ নিন।')
};

export const reproductionPacks = [asexual, flower, human, cycle, health];
