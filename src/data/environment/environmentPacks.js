// Environment bay deep-dive packs (WBBSE Class 10 Ch 5; NCERT X Our Environment; NCERT XII Organisms and Populations / Ecosystem). R6 and R7 apply.
import { claim, part, chapter, myth, quiz, limitation } from '../packHelpers.js';

const S = {
  NCERT_X_ENV: { kind: 'syllabus', title: 'NCERT Science Class 10 (Reprint 2026-27), Our Environment', url: 'https://ncert.nic.in/textbook.php?jesc1=13-13' },
  NCERT_XII_ECO: { kind: 'syllabus', title: 'NCERT Biology Class 12, Ecosystem / Organisms and Populations', url: 'https://ncert.nic.in/textbook.php' },
  WBBSE_X: { kind: 'syllabus', title: 'WBBSE Class 10 Life Science syllabus, Ch 5 Environment, its Resources and their Conservation', url: 'https://wbbse.wb.gov.in/' },
  OS_BIO_ECO: { kind: 'reference', title: 'OpenStax Biology 2e, 46.2 Energy Flow through Ecosystems (CC BY 4.0)', url: 'https://openstax.org/books/biology-2e/pages/46-2-energy-flow-through-ecosystems' },
  OS_BIO_POP: { kind: 'reference', title: 'OpenStax Biology 2e, 45.3 Environmental Limits to Population Growth (CC BY 4.0)', url: 'https://openstax.org/books/biology-2e/pages/45-3-environmental-limits-to-population-growth' },
  LINDEMAN: { kind: 'peer-reviewed', title: 'Lindeman R.L. (1942) The trophic-dynamic aspect of ecology. Ecology 23:399–417', url: 'https://doi.org/10.2307/1930126' },
  UNEP_OZONE: { kind: 'official', title: 'UNEP Ozone Secretariat — The Montreal Protocol on Substances that Deplete the Ozone Layer', url: 'https://ozone.unep.org/treaties/montreal-protocol' },
  TOMLINSON: { kind: 'textbook', title: 'Tomlinson P.B. (2016) The Botany of Mangroves, 2nd ed. Cambridge University Press', url: 'https://doi.org/10.1017/CBO9781139946575' },
  UNESCO_SUND: { kind: 'official', title: 'UNESCO World Heritage Centre — Sundarbans National Park (India), site 452', url: 'https://whc.unesco.org/en/list/452' }
};

const chain = {
  id: 'food-chain', tag: { en: 'ecosystem', bn: 'বাস্তুতন্ত্র' },
  title: { en: 'Food chains and energy flow', bn: 'খাদ্যশৃঙ্খল ও শক্তিপ্রবাহ' },
  lead: { en: 'Energy enters with sunlight and only about 10% passes to each next level.', bn: 'সূর্যালোকের সঙ্গে শক্তি প্রবেশ করে এবং প্রতিটি পরের স্তরে মাত্র প্রায় 10% যায়।' },
  claims: [
    claim('env.ch.levels', 'class9', 'In a food chain, producers (green plants) make food by photosynthesis; herbivores are primary consumers and carnivores eating them are secondary consumers.', 'খাদ্যশৃঙ্খলে উৎপাদক (সবুজ উদ্ভিদ) সালোকসংশ্লেষে খাদ্য তৈরি করে; তৃণভোজীরা প্রথম স্তরের খাদক এবং তাদের খায় এমন মাংসাশীরা দ্বিতীয় স্তরের খাদক।', [S.NCERT_X_ENV, S.OS_BIO_ECO]),
    claim('env.ch.ten', 'class9', 'Only about 10% of the energy at one trophic level is passed to the next (the 10 per cent law); the rest is used or lost, mainly as heat.', 'এক পুষ্টিস্তরের শক্তির মাত্র প্রায় 10% পরের স্তরে যায় (10 শতাংশ সূত্র); বাকিটা ব্যবহৃত হয় বা প্রধানত তাপ হিসেবে হারায়।', [S.NCERT_X_ENV, S.LINDEMAN], { value: 10, unit: '%', range: [5, 20] }),
    claim('env.ch.one', 'class10', 'Green plants capture only about 1% of the sunlight energy that falls on their leaves.', 'সবুজ উদ্ভিদ পাতায় পড়া সূর্যালোকের শক্তির মাত্র প্রায় 1% গ্রহণ করে।', [S.NCERT_X_ENV, S.OS_BIO_ECO], { value: 1, unit: '%', range: [0.5, 2] }),
    claim('env.ch.magnify', 'class10', 'Non-biodegradable chemicals such as some pesticides become more concentrated at each higher trophic level (biological magnification).', 'কিছু কীটনাশকের মতো অ-জৈব-বিশ্লেষ্য রাসায়নিক প্রতিটি উঁচু পুষ্টিস্তরে বেশি ঘন হয় (জৈব বিবর্ধন)।', [S.NCERT_X_ENV, S.OS_BIO_ECO])
  ],
  parts: [
    part('sun', 'class9', '#facc15', 'Sun', 'সূর্য', 'Source of energy.', 'শক্তির উৎস।', 'class10', 'Plants fix about 1%.', 'উদ্ভিদ প্রায় 1% ধরে রাখে।'),
    part('producer', 'class9', '#22c55e', 'Producer: grass', 'উৎপাদক: ঘাস', 'Makes food from sunlight.', 'সূর্যালোক থেকে খাদ্য তৈরি করে।', 'class10', 'First trophic level.', 'প্রথম পুষ্টিস্তর।'),
    part('herbivore', 'class9', '#fde68a', 'Primary consumer: deer', 'প্রথম খাদক: হরিণ', 'Eats plants.', 'উদ্ভিদ খায়।', 'class10', 'Receives about 10%.', 'প্রায় 10% পায়।'),
    part('carnivore', 'class9', '#f97316', 'Secondary consumer: tiger', 'দ্বিতীয় খাদক: বাঘ', 'Eats herbivores.', 'তৃণভোজী খায়।', 'class10', 'Receives about 1% of producer energy.', 'উৎপাদকের শক্তির প্রায় 1% পায়।'),
    part('heat', 'class9', '#ef4444', 'Heat loss', 'তাপ হিসেবে ক্ষয়', 'Energy lost at every level.', 'প্রতিটি স্তরে শক্তি হারায়।', 'class11-12', 'Energy flow is one-way, not a cycle.', 'শক্তিপ্রবাহ একমুখী, চক্র নয়।')
  ],
  chapters: [
    chapter('overview', 'class9', 20, '1. Build the pyramid', '1. পিরামিড গড়া', 'Sunlight reaches grass, deer and tiger; each step is about one tenth the size.', 'সূর্যালোক ঘাস, হরিণ ও বাঘে পৌঁছায়; প্রতিটি ধাপ প্রায় এক-দশমাংশ।'),
    chapter('magnify', 'class10', 18, '2. Biological magnification', '2. জৈব বিবর্ধন', 'Pesticide dots grow denser at every higher level.', 'প্রতিটি উঁচু স্তরে কীটনাশকের বিন্দু আরও ঘন হয়।')
  ],
  myths: [myth('class9', '"Energy is recycled like nutrients."', '"পুষ্টির মতো শক্তিও পুনরাবর্তিত হয়।"', 'Nutrients cycle, but energy flows one way and leaves as heat.', 'পুষ্টি চক্রাকারে ঘোরে, কিন্তু শক্তি একমুখী প্রবাহিত হয় এবং তাপ হিসেবে বেরিয়ে যায়।')],
  quiz: [
    quiz('fc1', 'class9', 'About how much energy passes to the next level?', 'পরের স্তরে প্রায় কতটা শক্তি যায়?', [['10%', '10%'], ['50%', '50%'], ['90%', '90%'], ['100%', '100%']], 0, 'env.ch.ten'),
    quiz('fc2', 'class9', 'Green plants in a food chain are…', 'খাদ্যশৃঙ্খলে সবুজ উদ্ভিদ…', [['Producers', 'উৎপাদক'], ['Primary consumers', 'প্রথম খাদক'], ['Decomposers', 'বিয়োজক'], ['Secondary consumers', 'দ্বিতীয় খাদক']], 0, 'env.ch.levels'),
    quiz('fc3', 'class9', 'Most energy lost between levels leaves as…', 'স্তরগুলির মধ্যে হারানো শক্তির বেশিরভাগ বেরোয়…', [['Heat', 'তাপ হিসেবে'], ['Light', 'আলো হিসেবে'], ['Sound', 'শব্দ হিসেবে'], ['Water', 'জল হিসেবে']], 0, 'env.ch.ten'),
    quiz('fc4', 'class10', 'Plants capture about … of sunlight falling on leaves.', 'উদ্ভিদ পাতায় পড়া সূর্যালোকের প্রায় … গ্রহণ করে।', [['1%', '1%'], ['10%', '10%'], ['50%', '50%'], ['100%', '100%']], 0, 'env.ch.one'),
    quiz('fc5', 'class10', 'Pesticide concentration is highest in…', 'কীটনাশকের ঘনত্ব সবচেয়ে বেশি…', [['Top carnivores', 'সর্বোচ্চ মাংসাশীতে'], ['Producers', 'উৎপাদকে'], ['Soil', 'মাটিতে'], ['Herbivores', 'তৃণভোজীতে']], 0, 'env.ch.magnify')
  ],
  limitation: limitation('Pyramid steps are drawn to an approximate 10 : 1 scale.', 'পিরামিডের ধাপগুলি আনুমানিক 10 : 1 মাপে আঁকা।')
};

const sundarbans = {
  id: 'sundarbans', tag: { en: 'West Bengal', bn: 'পশ্চিমবঙ্গ' },
  title: { en: 'Sundarbans mangroves', bn: 'সুন্দরবনের ম্যানগ্রোভ' },
  lead: { en: 'Breathing roots and live-born seedlings let mangroves survive salty, airless mud.', bn: 'শ্বাসমূল ও জরায়ুজ অঙ্কুরোদ্গম ম্যানগ্রোভকে লবণাক্ত, বায়ুহীন কাদায় টিকে থাকতে সাহায্য করে।' },
  claims: [
    claim('env.su.largest', 'class9', 'The Sundarbans, shared by India and Bangladesh, is the largest mangrove forest in the world and a home of the Bengal tiger.', 'ভারত ও বাংলাদেশ জুড়ে বিস্তৃত সুন্দরবন পৃথিবীর বৃহত্তম ম্যানগ্রোভ অরণ্য এবং বাংলার বাঘের বাসস্থান।', [S.UNESCO_SUND, S.WBBSE_X]),
    claim('env.su.roots', 'class9', 'Mangroves such as Sundari have pneumatophores — roots that grow upward out of waterlogged mud to take in air.', 'সুন্দরীর মতো ম্যানগ্রোভ গাছের শ্বাসমূল থাকে — জলমগ্ন কাদা থেকে ওপরের দিকে বেরিয়ে আসা মূল, যা বাতাস গ্রহণ করে।', [S.WBBSE_X, S.TOMLINSON]),
    claim('env.su.vivipary', 'class10', 'Many mangroves show vivipary: the seed germinates while the fruit is still attached to the parent tree.', 'অনেক ম্যানগ্রোভে জরায়ুজ অঙ্কুরোদ্গম দেখা যায়: ফল মাতৃগাছে লেগে থাকা অবস্থাতেই বীজ অঙ্কুরিত হয়।', [S.WBBSE_X, S.TOMLINSON])
  ],
  parts: [
    part('mud', 'class9', '#78716c', 'Salty tidal mud', 'লবণাক্ত জোয়ারের কাদা', 'Waterlogged and low in oxygen.', 'জলমগ্ন ও অক্সিজেন কম।', 'class10', 'Flooded twice daily by tides.', 'দিনে দুবার জোয়ারে ডোবে।'),
    part('trunk', 'class9', '#92400e', 'Sundari tree', 'সুন্দরী গাছ', 'Tree that gives the forest its name.', 'যে গাছ থেকে অরণ্যের নাম।', 'class10', 'Salt-tolerant.', 'লবণ-সহনশীল।'),
    part('pneumatophore', 'class9', '#a3e635', 'Breathing roots', 'শ্বাসমূল', 'Pencil-like roots poking up from the mud.', 'কাদা থেকে উঁচু পেনসিলের মতো মূল।', 'class10', 'Have pores called lenticels.', 'এতে লেন্টিসেল নামের ছিদ্র থাকে।'),
    part('seedling', 'class10', '#22c55e', 'Viviparous seedling', 'জরায়ুজ চারা', 'Germinates on the tree.', 'গাছেই অঙ্কুরিত হয়।', 'class11-12', 'Drops and lodges in the mud.', 'পড়ে গিয়ে কাদায় গেঁথে যায়।'),
    part('water', 'class9', '#38bdf8', 'Tide water', 'জোয়ারের জল', 'Rises and falls each day.', 'প্রতিদিন ওঠে ও নামে।', 'class10', 'Brings salt and nutrients.', 'লবণ ও পুষ্টি আনে।')
  ],
  chapters: [
    chapter('overview', 'class9', 20, '1. High tide, low tide', '1. জোয়ার-ভাটা', 'Water rises around the tree while breathing roots stay above it.', 'গাছের চারপাশে জল ওঠে, কিন্তু শ্বাসমূল তার ওপরে থাকে।'),
    chapter('seed', 'class10', 16, '2. Born on the tree', '2. গাছেই জন্ম', 'A seedling grows from the fruit, drops and plants itself in the mud.', 'ফল থেকে চারা বেরোয়, নিচে পড়ে নিজেই কাদায় গেঁথে যায়।')
  ],
  myths: [myth('class9', '"Mangrove roots are only for support."', '"ম্যানগ্রোভের মূল শুধু ঠেকনা দেয়।"', 'Pneumatophores take in air for roots buried in airless mud.', 'শ্বাসমূল বায়ুহীন কাদায় থাকা মূলের জন্য বাতাস নেয়।')],
  quiz: [
    quiz('su1', 'class9', 'Pneumatophores help mangroves to…', 'শ্বাসমূল ম্যানগ্রোভকে সাহায্য করে…', [['Take in air', 'বাতাস নিতে'], ['Store salt', 'লবণ জমাতে'], ['Catch insects', 'পতঙ্গ ধরতে'], ['Make flowers', 'ফুল তৈরিতে']], 0, 'env.su.roots'),
    quiz('su2', 'class9', 'The Sundarbans is the world\'s largest…', 'সুন্দরবন পৃথিবীর বৃহত্তম…', [['Mangrove forest', 'ম্যানগ্রোভ অরণ্য'], ['Desert', 'মরুভূমি'], ['Coral reef', 'প্রবালপ্রাচীর'], ['Grassland', 'তৃণভূমি']], 0, 'env.su.largest'),
    quiz('su3', 'class9', 'Which big cat lives in the Sundarbans?', 'সুন্দরবনে কোন বড় বিড়াল বাস করে?', [['Bengal tiger', 'বাংলার বাঘ'], ['Lion', 'সিংহ'], ['Snow leopard', 'তুষার চিতা'], ['Cheetah', 'চিতা']], 0, 'env.su.largest'),
    quiz('su4', 'class10', 'Germination of seed on the parent tree is called…', 'মাতৃগাছেই বীজের অঙ্কুরোদ্গমকে বলে…', [['Vivipary', 'জরায়ুজ অঙ্কুরোদ্গম'], ['Pollination', 'পরাগযোগ'], ['Dormancy', 'সুপ্তাবস্থা'], ['Grafting', 'জোড়কলম']], 0, 'env.su.vivipary')
  ],
  limitation: limitation('One tree stands for a whole forest; tide speed is accelerated.', 'একটি গাছ পুরো অরণ্যের প্রতিনিধি; জোয়ারের গতি দ্রুত করা হয়েছে।')
};

const ozone = {
  id: 'ozone', tag: { en: 'atmosphere', bn: 'বায়ুমণ্ডল' },
  title: { en: 'The ozone layer', bn: 'ওজোন স্তর' },
  lead: { en: 'Ozone high in the atmosphere absorbs harmful ultraviolet rays; CFCs damage it.', bn: 'বায়ুমণ্ডলের উঁচুতে থাকা ওজোন ক্ষতিকর অতিবেগুনি রশ্মি শোষণ করে; ক্লোরোফ্লুরোকার্বন একে ক্ষতিগ্রস্ত করে।' },
  claims: [
    claim('env.oz.shield', 'class9', 'Ozone (O₃) in the upper atmosphere shields the Earth\'s surface from ultraviolet radiation from the Sun.', 'বায়ুমণ্ডলের ওপরের স্তরের ওজোন (O₃) পৃথিবীর পৃষ্ঠকে সূর্যের অতিবেগুনি বিকিরণ থেকে রক্ষা করে।', [S.NCERT_X_ENV, S.UNEP_OZONE]),
    claim('env.oz.cfc', 'class10', 'Chlorofluorocarbons (CFCs) used in refrigerants caused ozone depletion; the 1987 Montreal Protocol phased them out and the layer is recovering.', 'হিমায়কে ব্যবহৃত ক্লোরোফ্লুরোকার্বন (CFC) ওজোন ক্ষয় ঘটিয়েছিল; 1987 সালের মন্ট্রিয়ল প্রোটোকল এগুলি ধাপে ধাপে বন্ধ করে এবং স্তরটি পুনরুদ্ধার হচ্ছে।', [S.UNEP_OZONE, S.NCERT_X_ENV])
  ],
  parts: [
    part('earth', 'class9', '#38bdf8', 'Earth', 'পৃথিবী', 'Surface protected by ozone.', 'ওজোন দ্বারা সুরক্ষিত পৃষ্ঠ।', 'class10', 'UV harms skin and eyes.', 'অতিবেগুনি রশ্মি ত্বক ও চোখের ক্ষতি করে।'),
    part('layer', 'class9', '#a78bfa', 'Ozone layer', 'ওজোন স্তর', 'A shell of ozone high above.', 'অনেক ওপরে ওজোনের খোলস।', 'class10', 'Mostly in the stratosphere.', 'প্রধানত স্ট্র্যাটোস্ফিয়ারে।'),
    part('uv', 'class9', '#f472b6', 'Ultraviolet rays', 'অতিবেগুনি রশ্মি', 'Absorbed by the ozone layer.', 'ওজোন স্তর শোষণ করে।', 'class10', 'Pass through where ozone is thin.', 'যেখানে ওজোন পাতলা সেখানে ঢোকে।'),
    part('cfc', 'class10', '#94a3b8', 'CFC molecules', 'CFC অণু', 'Release chlorine that breaks ozone.', 'ক্লোরিন ছাড়ে, যা ওজোন ভাঙে।', 'class11-12', 'One chlorine atom can destroy many ozone molecules.', 'একটি ক্লোরিন পরমাণু বহু ওজোন অণু ভাঙতে পারে।')
  ],
  chapters: [
    chapter('overview', 'class9', 16, '1. The shield', '1. ঢাল', 'Ultraviolet rays stop at the ozone layer.', 'অতিবেগুনি রশ্মি ওজোন স্তরে থেমে যায়।'),
    chapter('hole', 'class10', 20, '2. Thinning and recovery', '2. ক্ষয় ও পুনরুদ্ধার', 'CFCs thin the layer and rays leak through; after the ban the layer thickens again.', 'CFC স্তর পাতলা করে ও রশ্মি ঢোকে; নিষেধাজ্ঞার পরে স্তর আবার পুরু হয়।')
  ],
  myths: [myth('class9', '"The ozone hole causes global warming."', '"ওজোন গহ্বর বিশ্ব উষ্ণায়ন ঘটায়।"', 'They are different problems: ozone loss raises UV; warming is from greenhouse gases.', 'এ দুটি আলাদা সমস্যা: ওজোন ক্ষয়ে অতিবেগুনি বাড়ে; উষ্ণায়ন হয় গ্রিনহাউস গ্যাসের জন্য।')],
  quiz: [
    quiz('oz1', 'class9', 'The ozone layer absorbs…', 'ওজোন স্তর শোষণ করে…', [['Ultraviolet rays', 'অতিবেগুনি রশ্মি'], ['Radio waves', 'বেতার তরঙ্গ'], ['Sound', 'শব্দ'], ['Oxygen', 'অক্সিজেন']], 0, 'env.oz.shield'),
    quiz('oz2', 'class9', 'An ozone molecule has … oxygen atoms.', 'একটি ওজোন অণুতে … অক্সিজেন পরমাণু থাকে।', [['3', '3'], ['2', '2'], ['1', '1'], ['4', '4']], 0, 'env.oz.shield'),
    quiz('oz3', 'class9', 'The ozone layer protects…', 'ওজোন স্তর রক্ষা করে…', [['Life on Earth\'s surface', 'পৃথিবীপৃষ্ঠের জীবকে'], ['The Moon', 'চাঁদকে'], ['Only oceans', 'কেবল সমুদ্রকে'], ['Nothing', 'কিছুই না']], 0, 'env.oz.shield'),
    quiz('oz4', 'class10', 'The treaty that phased out CFCs is the…', 'যে চুক্তি CFC বন্ধ করে…', [['Montreal Protocol', 'মন্ট্রিয়ল প্রোটোকল'], ['Kyoto Protocol', 'কিয়োটো প্রোটোকল'], ['Paris Agreement', 'প্যারিস চুক্তি'], ['Ramsar Convention', 'রামসার কনভেনশন']], 0, 'env.oz.cfc')
  ],
  limitation: limitation('Layer thickness is exaggerated so it can be seen.', 'দেখার সুবিধার জন্য স্তরের পুরুত্ব বাড়িয়ে দেখানো হয়েছে।')
};

const population = {
  id: 'population', tag: { en: 'population', bn: 'জনসংখ্যা' },
  title: { en: 'Population growth: J and S curves', bn: 'জনসংখ্যা বৃদ্ধি: J ও S লেখ' },
  lead: { en: 'With unlimited resources a population explodes (J); limits bend the curve to a plateau (S).', bn: 'সীমাহীন সম্পদে জনসংখ্যা দ্রুত বাড়ে (J); সীমাবদ্ধতা লেখটিকে একটি স্থির মানে বাঁকিয়ে দেয় (S)।' },
  claims: [
    claim('env.po.j', 'class10', 'When resources are unlimited, a population grows exponentially, giving a J-shaped curve.', 'সম্পদ সীমাহীন হলে জনসংখ্যা সূচকীয় হারে বাড়ে এবং J-আকৃতির লেখ তৈরি হয়।', [S.NCERT_XII_ECO, S.OS_BIO_POP]),
    claim('env.po.s', 'class10', 'With limited resources growth slows and levels off at the carrying capacity (K), giving an S-shaped (logistic) curve.', 'সম্পদ সীমিত হলে বৃদ্ধি কমে ধারণক্ষমতায় (K) স্থির হয় এবং S-আকৃতির (লজিস্টিক) লেখ তৈরি হয়।', [S.NCERT_XII_ECO, S.OS_BIO_POP]),
    claim('env.po.eq', 'neet', 'Exponential growth follows dN/dt = rN; logistic growth follows dN/dt = rN(K − N)/K.', 'সূচকীয় বৃদ্ধি (dN/dt = rN) মেনে চলে; লজিস্টিক বৃদ্ধি (dN/dt = rN(K − N)/K) মেনে চলে।', [S.NCERT_XII_ECO, S.OS_BIO_POP])
  ],
  parts: [
    part('jcurve', 'class10', '#ef4444', 'J curve', 'J লেখ', 'Unlimited growth.', 'সীমাহীন বৃদ্ধি।', 'neet', 'Equation: dN/dt = rN.', 'সমীকরণ: (dN/dt = rN)।'),
    part('scurve', 'class10', '#22c55e', 'S curve', 'S লেখ', 'Growth that levels off.', 'যে বৃদ্ধি স্থির হয়ে যায়।', 'neet', 'Logistic model.', 'লজিস্টিক মডেল।'),
    part('capacity', 'class10', '#facc15', 'Carrying capacity K', 'ধারণক্ষমতা K', 'Largest population the habitat can support.', 'বাসস্থান সর্বোচ্চ যত জীব ধরে রাখতে পারে।', 'neet', 'Set by food, space and other limits.', 'খাদ্য, স্থান ও অন্যান্য সীমা দ্বারা নির্ধারিত।'),
    part('axes', 'class10', '#94a3b8', 'Axes', 'অক্ষ', 'Time across, population up.', 'আনুভূমিকে সময়, উল্লম্বে জনসংখ্যা।', 'neet', 'N against t.', 'জনসংখ্যা (N) বনাম সময় (t)।')
  ],
  chapters: [
    chapter('overview', 'class10', 18, '1. Two curves', '1. দুটি লেখ', 'Both start together; the J shoots up while the S bends towards K.', 'দুটিই একসঙ্গে শুরু; J দ্রুত ওঠে, S বেঁকে K-এর দিকে যায়।'),
    chapter('limit', 'neet', 16, '2. Change K', '2. K বদলানো', 'Raising or lowering the carrying capacity moves the plateau.', 'ধারণক্ষমতা বাড়ালে বা কমালে স্থির মান সরে যায়।')
  ],
  myths: [myth('class10', '"Populations can grow for ever."', '"জনসংখ্যা চিরকাল বাড়তে পারে।"', 'Resources are limited, so real populations level off or crash.', 'সম্পদ সীমিত, তাই বাস্তব জনসংখ্যা স্থির হয় বা হঠাৎ কমে।')],
  quiz: [
    quiz('po1', 'class10', 'Unlimited resources give a…', 'সীমাহীন সম্পদে হয়…', [['J-shaped curve', 'J-আকৃতির লেখ'], ['S-shaped curve', 'S-আকৃতির লেখ'], ['Flat line', 'সমতল রেখা'], ['Falling line', 'নিম্নগামী রেখা']], 0, 'env.po.j'),
    quiz('po2', 'class10', 'K stands for…', 'K বোঝায়…', [['Carrying capacity', 'ধারণক্ষমতা'], ['Birth rate', 'জন্মহার'], ['Death rate', 'মৃত্যুহার'], ['Time', 'সময়']], 0, 'env.po.s'),
    quiz('po3', 'class10', 'Logistic growth levels off because of…', 'লজিস্টিক বৃদ্ধি স্থির হয়…', [['Limited resources', 'সীমিত সম্পদের জন্য'], ['Unlimited food', 'সীমাহীন খাদ্যের জন্য'], ['No deaths', 'মৃত্যু না থাকায়'], ['More space', 'বেশি স্থানের জন্য']], 0, 'env.po.s'),
    quiz('po4', 'neet', 'Exponential growth is written as…', 'সূচকীয় বৃদ্ধি লেখা হয়…', [['dN/dt = rN', '(dN/dt = rN)'], ['dN/dt = 0', '(dN/dt = 0)'], ['N = K', '(N = K)'], ['dN/dt = −rN', '(dN/dt = −rN)']], 0, 'env.po.eq')
  ],
  limitation: limitation('Smooth model curves; real populations fluctuate.', 'মসৃণ মডেল লেখ; বাস্তব জনসংখ্যা ওঠানামা করে।')
};

export const environmentPacks = [chain, sundarbans, ozone, population];
