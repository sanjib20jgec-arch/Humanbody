// Brain & Nerves bay deep-dive packs (docs/bays/NERVOUS_MASTERPLAN.md + Class 10 plan:
// Control & Coordination incl. eye, Hormones sub-topic, plant coordination).
// NEET dropped reflex arc and sense organs; those packs stop at Class 11–12.
import { claim, part, chapter, myth, quiz, limitation } from '../packHelpers.js';

const S = {
  NCERT_X6: { kind: 'syllabus', title: 'NCERT Science Class 10 (Reprint 2026-27), Ch 6 Control and Coordination', url: 'https://ncert.nic.in/textbook/pdf/jesc106.pdf' },
  NCERT_X10: { kind: 'syllabus', title: 'NCERT Science Class 10 (Reprint 2026-27), Ch 10 The Human Eye and the Colourful World', url: 'https://ncert.nic.in/textbook/pdf/jesc110.pdf' },
  NCERT_XI_NC: { kind: 'syllabus', title: 'NCERT Biology Class 11, Neural Control and Coordination', url: 'https://ncert.nic.in/textbook.php' },
  NCERT_XI_CC: { kind: 'syllabus', title: 'NCERT Biology Class 11, Chemical Coordination and Integration', url: 'https://ncert.nic.in/textbook.php' },
  OS_AP_SYN: { kind: 'reference', title: 'OpenStax Anatomy & Physiology 2e, 12.5 Communication Between Neurons (CC BY 4.0)', url: 'https://openstax.org/books/anatomy-and-physiology-2e/pages/12-5-communication-between-neurons' },
  OS_AP_CNS: { kind: 'reference', title: 'OpenStax Anatomy & Physiology 2e, 13.2 The Central Nervous System (CC BY 4.0)', url: 'https://openstax.org/books/anatomy-and-physiology-2e/pages/13-2-the-central-nervous-system' },
  OS_AP_REFLEX: { kind: 'reference', title: 'OpenStax Anatomy & Physiology 2e, 14.4 Motor Responses — reflexes (CC BY 4.0)', url: 'https://openstax.org/books/anatomy-and-physiology-2e/pages/14-4-motor-responses' },
  OS_AP_EYE: { kind: 'reference', title: 'OpenStax Anatomy & Physiology 2e, 14.1 Sensory Perception — vision (CC BY 4.0)', url: 'https://openstax.org/books/anatomy-and-physiology-2e/pages/14-1-sensory-perception' },
  OS_AP_ENDO: { kind: 'reference', title: 'OpenStax Anatomy & Physiology 2e, Ch 17 The Endocrine System (CC BY 4.0)', url: 'https://openstax.org/books/anatomy-and-physiology-2e/pages/17-1-an-overview-of-the-endocrine-system' },
  OS_BIO_PLANT: { kind: 'reference', title: 'OpenStax Biology 2e, 30.6 Plant Sensory Systems and Responses (CC BY 4.0)', url: 'https://openstax.org/books/biology-2e/pages/30-6-plant-sensory-systems-and-responses' },
  REFLEX_LATENCY: { kind: 'peer-reviewed', title: 'Nociceptive withdrawal reflex latency (RII ≈ 50–90 ms, RIII ≈ 90–150 ms) — PMC9872115', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC9872115/' }
};

const synapse = {
  id: 'synapse', tag: { en: 'nerve', bn: 'স্নায়ু' },
  title: { en: 'The synapse', bn: 'সাইন্যাপস (Synapse)' },
  lead: { en: 'Where one neuron passes its message to the next — with chemicals.', bn: 'যেখানে একটি নিউরন রাসায়নিক পদার্থের মাধ্যমে পরের নিউরনে বার্তা পাঠায়।' },
  claims: [
    claim('ner.syn.chemical', 'class9', 'At the end of an axon, the electrical impulse releases chemicals that cross the gap (synapse) and start a similar impulse in the next neuron.', 'অ্যাক্সনের প্রান্তে বৈদ্যুতিক আবেগ কিছু রাসায়নিক পদার্থ মুক্ত করে, যা ফাঁক (সাইন্যাপস) পেরিয়ে পরের নিউরনে একই রকম আবেগ শুরু করে।', [S.NCERT_X6, S.OS_AP_SYN]),
    claim('ner.syn.oneway', 'class10', 'Because only the axon end releases the chemicals, impulses cross a synapse in one direction only.', 'কেবল অ্যাক্সনের প্রান্তই রাসায়নিক পদার্থ মুক্ত করে, তাই আবেগ সাইন্যাপস কেবল একদিকে পেরোয়।', [S.NCERT_XI_NC, S.OS_AP_SYN]),
    claim('ner.syn.transmitter', 'neet', 'Neurotransmitters stored in synaptic vesicles are released by exocytosis when Ca2+ enters the terminal; they bind receptors on the post-synaptic membrane and open ion channels.', 'অ্যাক্সন প্রান্তে Ca2+ প্রবেশ করলে সাইন্যাপটিক থলির নিউরোট্রান্সমিটার এক্সোসাইটোসিসের মাধ্যমে মুক্ত হয়; এরা পোস্ট-সাইন্যাপটিক পর্দার গ্রাহকে যুক্ত হয়ে আয়ন-পথ খুলে দেয়।', [S.NCERT_XI_NC, S.OS_AP_SYN])
  ],
  parts: [
    part('terminal', 'class9', '#fbbf24', 'Axon ending', 'অ্যাক্সন প্রান্ত', 'Where the impulse arrives.', 'যেখানে আবেগ এসে পৌঁছায়।', 'class11-12', 'Also called the pre-synaptic knob.', 'একে প্রি-সাইন্যাপটিক নব-ও বলে।'),
    part('vesicle', 'class10', '#f472b6', 'Vesicles', 'থলি (Vesicles)', 'Tiny sacs holding the chemical messenger.', 'রাসায়নিক বার্তাবাহক ভরা ক্ষুদ্র থলি।', 'neet', 'They fuse with the membrane to release their contents.', 'এরা পর্দার সঙ্গে মিশে ভেতরের পদার্থ মুক্ত করে।'),
    part('transmitter', 'class10', '#22d3ee', 'Chemical messenger', 'রাসায়নিক বার্তাবাহক', 'Crosses the gap.', 'ফাঁক পেরিয়ে যায়।', 'neet', 'Examples: acetylcholine, dopamine.', 'উদাহরণ: অ্যাসিটাইলকোলিন, ডোপামিন।'),
    part('receiver', 'class9', '#38bdf8', 'Next neuron', 'পরের নিউরন', 'Its dendrite receives the message.', 'এর ডেনড্রাইট বার্তা গ্রহণ করে।', 'neet', 'Receptors on its membrane bind the transmitter.', 'এর পর্দার গ্রাহক বার্তাবাহককে যুক্ত করে।')
  ],
  chapters: [
    chapter('overview', 'class9', 14, '1. A tiny gap', '1. একটি ক্ষুদ্র ফাঁক', 'Two neurons do not touch; a narrow gap separates them.', 'দুটি নিউরন একে অপরকে স্পর্শ করে না; একটি সরু ফাঁক এদের আলাদা রাখে।'),
    chapter('transmit', 'class10', 20, '2. Electrical to chemical to electrical', '2. বৈদ্যুতিক থেকে রাসায়নিক থেকে বৈদ্যুতিক', 'The impulse arrives, vesicles release messengers, and they start a new impulse in the next neuron.', 'আবেগ পৌঁছায়, থলি বার্তাবাহক মুক্ত করে, এবং তা পরের নিউরনে নতুন আবেগ শুরু করে।')
  ],
  myths: [myth('class9', '"Neurons are joined end to end like wires."', '"তারের মতো নিউরনগুলি পরস্পর জোড়া থাকে।"', 'Most neurons are separated by a synapse; the signal crosses as chemicals.', 'বেশিরভাগ নিউরন সাইন্যাপস দিয়ে আলাদা; সংকেত রাসায়নিক রূপে ফাঁক পেরোয়।')],
  quiz: [
    quiz('sy1', 'class9', 'The gap between two neurons is the…', 'দুটি নিউরনের মাঝের ফাঁককে বলে…', [['Synapse', 'সাইন্যাপস'], ['Axon', 'অ্যাক্সন'], ['Dendrite', 'ডেনড্রাইট'], ['Nucleus', 'নিউক্লিয়াস']], 0, 'ner.syn.chemical'),
    quiz('sy2', 'class9', 'The impulse crosses the synapse as…', 'আবেগ সাইন্যাপস পেরোয়…', [['Chemicals', 'রাসায়নিক পদার্থ রূপে'], ['Light', 'আলো রূপে'], ['Sound', 'শব্দ রূপে'], ['Blood', 'রক্ত রূপে']], 0, 'ner.syn.chemical'),
    quiz('sy3', 'class9', 'Chemicals at a synapse are released by the…', 'সাইন্যাপসে রাসায়নিক পদার্থ মুক্ত করে…', [['Axon ending', 'অ্যাক্সন প্রান্ত'], ['Dendrite of the next neuron', 'পরের নিউরনের ডেনড্রাইট'], ['Blood', 'রক্ত'], ['Muscle', 'পেশি']], 0, 'ner.syn.chemical'),
    quiz('sy4', 'class10', 'Impulses cross a synapse…', 'আবেগ সাইন্যাপস পেরোয়…', [['In one direction only', 'কেবল একদিকে'], ['In both directions', 'দুদিকেই'], ['Randomly', 'এলোমেলোভাবে'], ['Never', 'কখনো না']], 0, 'ner.syn.oneway')
  ],
  limitation: limitation('The gap is drawn hugely enlarged (real width about 20 nm).', 'ফাঁকটিকে বিশালভাবে বড় করে দেখানো হয়েছে (বাস্তবে প্রায় 20 nm চওড়া)।')
};

const reflex = {
  id: 'reflex', tag: { en: 'pathway', bn: 'পথ' },
  title: { en: 'Reflex arc', bn: 'প্রতিবর্ত চাপ (Reflex arc)' },
  lead: { en: 'A fast, automatic response routed through the spinal cord.', bn: 'সুষুম্নাকাণ্ডের মধ্য দিয়ে ঘটা দ্রুত, স্বয়ংক্রিয় সাড়া।' },
  claims: [
    claim('ner.ref.path', 'class9', 'In a reflex arc, a receptor sends an impulse along a sensory neuron to the spinal cord, where a relay neuron passes it to a motor neuron that makes an effector muscle respond.', 'প্রতিবর্ত চাপে গ্রাহক সংবেদী নিউরন দিয়ে সুষুম্নাকাণ্ডে আবেগ পাঠায়, সেখানে রিলে নিউরন তা চেষ্টীয় নিউরনে পাঠায় এবং কারক পেশি সাড়া দেয়।', [S.NCERT_X6, S.OS_AP_REFLEX]),
    claim('ner.ref.fast', 'class10', 'A reflex is quick because the response is made in the spinal cord before the message reaches the brain for thinking.', 'প্রতিবর্ত দ্রুত, কারণ চিন্তার জন্য বার্তা মস্তিষ্কে পৌঁছানোর আগেই সুষুম্নাকাণ্ডে সাড়া তৈরি হয়।', [S.NCERT_X6, S.OS_AP_REFLEX]),
    claim('ner.ref.latency', 'class11-12', 'The withdrawal reflex starts muscle activity about 65–150 ms after a painful stimulus; voluntary reactions usually take longer than 150 ms.', 'ব্যথাদায়ক উদ্দীপনার প্রায় 65–150 ms পরে প্রত্যাহার-প্রতিবর্তে পেশির সক্রিয়তা শুরু হয়; ঐচ্ছিক সাড়ায় সাধারণত 150 ms-এর বেশি সময় লাগে।', [S.REFLEX_LATENCY, S.OS_AP_REFLEX], { value: 90, unit: 'ms', range: [65, 150] })
  ],
  parts: [
    part('receptor', 'class9', '#facc15', 'Receptor', 'গ্রাহক (Receptor)', 'Senses heat in the skin.', 'ত্বকে তাপ অনুভব করে।', 'class11-12', 'Pain receptors (nociceptors) are free nerve endings.', 'ব্যথার গ্রাহক (নোসিসেপ্টর) মুক্ত স্নায়ুপ্রান্ত।'),
    part('sensory', 'class9', '#38bdf8', 'Sensory neuron', 'সংবেদী নিউরন', 'Carries the message to the spinal cord.', 'বার্তা সুষুম্নাকাণ্ডে নিয়ে যায়।', 'class11-12', 'Enters the cord through the dorsal root.', 'পৃষ্ঠমূল দিয়ে সুষুম্নাকাণ্ডে প্রবেশ করে।'),
    part('cord', 'class9', '#cbd5e1', 'Spinal cord', 'সুষুম্নাকাণ্ড', 'Where the reflex is processed.', 'যেখানে প্রতিবর্ত প্রক্রিয়া হয়।', 'class11-12', 'Grey matter inside, white matter outside.', 'ভেতরে ধূসর পদার্থ, বাইরে সাদা পদার্থ।'),
    part('relay', 'class10', '#a78bfa', 'Relay neuron', 'রিলে নিউরন', 'Links sensory and motor neurons.', 'সংবেদী ও চেষ্টীয় নিউরনকে যুক্ত করে।', 'class11-12', 'Also called an interneuron.', 'একে ইন্টারনিউরন-ও বলে।'),
    part('motor', 'class9', '#f472b6', 'Motor neuron', 'চেষ্টীয় নিউরন', 'Carries the command to the muscle.', 'আদেশ পেশিতে নিয়ে যায়।', 'class11-12', 'Leaves the cord through the ventral root.', 'অঙ্কমূল দিয়ে সুষুম্নাকাণ্ড থেকে বেরোয়।'),
    part('effector', 'class9', '#fb7185', 'Effector muscle', 'কারক পেশি', 'Contracts to pull the hand away.', 'সংকুচিত হয়ে হাত সরিয়ে নেয়।', 'class10', 'Glands can also be effectors.', 'গ্রন্থিও কারক হতে পারে।'),
    part('impulse', 'class10', '#22d3ee', 'Impulse', 'আবেগ', 'The travelling signal.', 'চলমান সংকেত।', 'class11-12', 'A wave of electrical change along the neuron.', 'নিউরন বরাবর বৈদ্যুতিক পরিবর্তনের ঢেউ।')
  ],
  chapters: [
    chapter('overview', 'class9', 14, '1. The parts of the arc', '1. চাপের অংশ', 'Receptor, sensory neuron, spinal cord, motor neuron and muscle.', 'গ্রাহক, সংবেদী নিউরন, সুষুম্নাকাণ্ড, চেষ্টীয় নিউরন ও পেশি।'),
    chapter('arc', 'class9', 20, '2. Hand on a hot plate', '2. গরম পাত্রে হাত', 'The impulse runs to the cord and straight back to the muscle; the hand pulls away.', 'আবেগ সুষুম্নাকাণ্ডে গিয়ে সোজা পেশিতে ফিরে আসে; হাত সরে যায়।')
  ],
  myths: [myth('class10', '"The brain decides every reflex."', '"প্রতিটি প্রতিবর্তের সিদ্ধান্ত মস্তিষ্ক নেয়।"', 'Spinal reflexes are made in the cord; the brain is informed afterwards.', 'সুষুম্নাকাণ্ডেই সুষুম্না-প্রতিবর্ত তৈরি হয়; পরে মস্তিষ্ককে জানানো হয়।')],
  quiz: [
    quiz('rf1', 'class9', 'A reflex arc is formed in the…', 'প্রতিবর্ত চাপ তৈরি হয়…', [['Spinal cord', 'সুষুম্নাকাণ্ডে'], ['Heart', 'হৃৎপিণ্ডে'], ['Stomach', 'পাকস্থলীতে'], ['Lungs', 'ফুসফুসে']], 0, 'ner.ref.path'),
    quiz('rf2', 'class9', 'Which neuron carries the impulse to the muscle?', 'কোন নিউরন পেশিতে আবেগ নিয়ে যায়?', [['Motor neuron', 'চেষ্টীয় নিউরন'], ['Sensory neuron', 'সংবেদী নিউরন'], ['Relay neuron', 'রিলে নিউরন'], ['None', 'কোনোটিই না']], 0, 'ner.ref.path'),
    quiz('rf3', 'class9', 'The correct order is…', 'সঠিক ক্রম হলো…', [['Receptor → sensory → cord → motor → muscle', 'গ্রাহক → সংবেদী → সুষুম্নাকাণ্ড → চেষ্টীয় → পেশি'], ['Muscle → motor → receptor', 'পেশি → চেষ্টীয় → গ্রাহক'], ['Brain → receptor → muscle', 'মস্তিষ্ক → গ্রাহক → পেশি'], ['Motor → sensory → receptor', 'চেষ্টীয় → সংবেদী → গ্রাহক']], 0, 'ner.ref.path'),
    quiz('rf4', 'class11-12', 'Withdrawal reflex muscle onset is about…', 'প্রত্যাহার-প্রতিবর্তে পেশির সক্রিয়তা শুরু হয় প্রায়…', [['65–150 ms', '65–150 ms'], ['1–2 s', '1–2 s'], ['5 ms', '5 ms'], ['500–1000 ms', '500–1000 ms']], 0, 'ner.ref.latency')
  ],
  limitation: limitation('One neuron of each type is shown; real reflexes involve many.', 'প্রতি প্রকারের একটি নিউরন দেখানো হয়েছে; বাস্তবে বহু নিউরন যুক্ত থাকে।')
};

const brain = {
  id: 'brain', tag: { en: 'organ', bn: 'অঙ্গ' },
  title: { en: 'The human brain', bn: 'মানুষের মস্তিষ্ক' },
  lead: { en: 'Forebrain, midbrain and hindbrain — each with its own jobs.', bn: 'অগ্রমস্তিষ্ক, মধ্যমস্তিষ্ক ও পশ্চাৎমস্তিষ্ক — প্রত্যেকের নিজস্ব কাজ।' },
  claims: [
    claim('ner.brn.parts', 'class9', 'The brain has three major parts: forebrain, midbrain and hindbrain. The forebrain is the main thinking part.', 'মস্তিষ্কের তিনটি প্রধান অংশ: অগ্রমস্তিষ্ক, মধ্যমস্তিষ্ক ও পশ্চাৎমস্তিষ্ক। অগ্রমস্তিষ্ক প্রধান চিন্তাশীল অংশ।', [S.NCERT_X6, S.OS_AP_CNS]),
    claim('ner.brn.hind', 'class10', 'The cerebellum (hindbrain) keeps posture and balance and makes voluntary actions precise; the medulla controls involuntary actions such as blood pressure, salivation and vomiting.', 'লঘুমস্তিষ্ক (পশ্চাৎমস্তিষ্ক) দেহভঙ্গি ও ভারসাম্য বজায় রাখে এবং ঐচ্ছিক কাজকে নিখুঁত করে; সুষুম্নাশীর্ষক রক্তচাপ, লালাক্ষরণ ও বমির মতো অনৈচ্ছিক কাজ নিয়ন্ত্রণ করে।', [S.NCERT_X6, S.OS_AP_CNS]),
    claim('ner.brn.protect', 'class10', 'The brain sits inside the skull, cushioned by fluid (cerebrospinal fluid) that absorbs shocks.', 'মস্তিষ্ক করোটির ভেতরে থাকে এবং আঘাত শোষণকারী তরল (সেরিব্রোস্পাইনাল তরল) একে সুরক্ষা দেয়।', [S.NCERT_X6, S.OS_AP_CNS]),
    claim('ner.brn.hypothal', 'neet', 'The hypothalamus in the forebrain controls body temperature, hunger and thirst, and regulates the pituitary gland.', 'অগ্রমস্তিষ্কের হাইপোথ্যালামাস দেহের তাপমাত্রা, ক্ষুধা ও তৃষ্ণা নিয়ন্ত্রণ করে এবং পিটুইটারি গ্রন্থিকে নিয়ন্ত্রণ করে।', [S.NCERT_XI_NC, S.OS_AP_CNS])
  ],
  parts: [
    part('forebrain', 'class9', '#f472b6', 'Forebrain (cerebrum)', 'অগ্রমস্তিষ্ক (গুরুমস্তিষ্ক)', 'Thinking, memory, senses and voluntary actions.', 'চিন্তা, স্মৃতি, অনুভূতি ও ঐচ্ছিক কাজ।', 'class11-12', 'Has areas for sight, hearing, smell, speech and movement.', 'এতে দর্শন, শ্রবণ, ঘ্রাণ, বাক ও চলনের নির্দিষ্ট অঞ্চল আছে।'),
    part('midbrain', 'class10', '#fbbf24', 'Midbrain', 'মধ্যমস্তিষ্ক', 'Relays signals; some eye and ear reflexes.', 'সংকেত রিলে করে; চোখ ও কানের কিছু প্রতিবর্ত।', 'class11-12', 'Part of the brainstem.', 'মস্তিষ্ককাণ্ডের অংশ।'),
    part('cerebellum', 'class9', '#34d399', 'Cerebellum', 'লঘুমস্তিষ্ক', 'Balance and posture.', 'ভারসাম্য ও দেহভঙ্গি।', 'class10', 'Lets you ride a bicycle or pick up a pencil precisely.', 'এর জন্য সাইকেল চালানো বা নিখুঁতভাবে পেনসিল তোলা সম্ভব।'),
    part('medulla', 'class9', '#60a5fa', 'Medulla', 'সুষুম্নাশীর্ষক', 'Controls involuntary actions.', 'অনৈচ্ছিক কাজ নিয়ন্ত্রণ করে।', 'class10', 'Blood pressure, salivation, vomiting.', 'রক্তচাপ, লালাক্ষরণ, বমি।'),
    part('spinal', 'class9', '#cbd5e1', 'Spinal cord', 'সুষুম্নাকাণ্ড', 'Continues down from the medulla.', 'সুষুম্নাশীর্ষক থেকে নিচে নেমে গেছে।', 'class10', 'Carries messages between brain and body.', 'মস্তিষ্ক ও দেহের মধ্যে বার্তা বহন করে।')
  ],
  chapters: [
    chapter('overview', 'class9', 15, '1. Three regions', '1. তিনটি অঞ্চল', 'Forebrain on top, midbrain in the middle, hindbrain at the back and base.', 'ওপরে অগ্রমস্তিষ্ক, মাঝে মধ্যমস্তিষ্ক, পেছনে ও নিচে পশ্চাৎমস্তিষ্ক।'),
    chapter('roles', 'class10', 22, '2. Who does what', '2. কে কী করে', 'Each region lights up as its job is named: thinking, relay, balance, involuntary control.', 'প্রতিটি অঞ্চলের কাজের নাম এলে সেটি আলোকিত হয়: চিন্তা, রিলে, ভারসাম্য, অনৈচ্ছিক নিয়ন্ত্রণ।')
  ],
  myths: [myth('class9', '"We use only 10% of our brain."', '"আমরা মস্তিষ্কের মাত্র 10% ব্যবহার করি।"', 'Brain imaging shows almost all regions are active over a day.', 'মস্তিষ্কের চিত্রগ্রহণে দেখা যায় সারাদিনে প্রায় সব অঞ্চলই সক্রিয় থাকে।')],
  quiz: [
    quiz('br1', 'class9', 'The main thinking part of the brain is the…', 'মস্তিষ্কের প্রধান চিন্তাশীল অংশ হলো…', [['Forebrain', 'অগ্রমস্তিষ্ক'], ['Medulla', 'সুষুম্নাশীর্ষক'], ['Cerebellum', 'লঘুমস্তিষ্ক'], ['Spinal cord', 'সুষুম্নাকাণ্ড']], 0, 'ner.brn.parts'),
    quiz('br2', 'class9', 'How many major parts does the brain have?', 'মস্তিষ্কের প্রধান অংশ কয়টি?', [['3', '3'], ['2', '2'], ['4', '4'], ['5', '5']], 0, 'ner.brn.parts'),
    quiz('br3', 'class9', 'Which is NOT a major part of the brain?', 'কোনটি মস্তিষ্কের প্রধান অংশ নয়?', [['Spinal cord', 'সুষুম্নাকাণ্ড'], ['Forebrain', 'অগ্রমস্তিষ্ক'], ['Midbrain', 'মধ্যমস্তিষ্ক'], ['Hindbrain', 'পশ্চাৎমস্তিষ্ক']], 0, 'ner.brn.parts'),
    quiz('br4', 'class10', 'Balance and posture are controlled by the…', 'ভারসাম্য ও দেহভঙ্গি নিয়ন্ত্রণ করে…', [['Cerebellum', 'লঘুমস্তিষ্ক'], ['Forebrain', 'অগ্রমস্তিষ্ক'], ['Medulla', 'সুষুম্নাশীর্ষক'], ['Hypothalamus', 'হাইপোথ্যালামাস']], 0, 'ner.brn.hind'),
    quiz('br5', 'neet', 'Body temperature is regulated by the…', 'দেহের তাপমাত্রা নিয়ন্ত্রণ করে…', [['Hypothalamus', 'হাইপোথ্যালামাস'], ['Cerebellum', 'লঘুমস্তিষ্ক'], ['Medulla', 'সুষুম্নাশীর্ষক'], ['Midbrain', 'মধ্যমস্তিষ্ক']], 0, 'ner.brn.hypothal')
  ],
  limitation: limitation('Regions are simplified blobs; real boundaries are folded and overlapping.', 'অঞ্চলগুলি সরল আকারে দেখানো হয়েছে; বাস্তব সীমানা ভাঁজযুক্ত ও আংশিক মিশ্রিত।')
};

const eye = {
  id: 'eye', tag: { en: 'sense organ', bn: 'ইন্দ্রিয়' },
  title: { en: 'The human eye', bn: 'মানুষের চোখ' },
  lead: { en: 'A living camera: the lens focuses light to form an image on the retina.', bn: 'একটি জীবন্ত ক্যামেরা: লেন্স আলোকে কেন্দ্রীভূত করে রেটিনায় প্রতিবিম্ব তৈরি করে।' },
  claims: [
    claim('ner.eye.image', 'class9', 'The eye lens forms a real, inverted image of an object on the retina.', 'চোখের লেন্স বস্তুর একটি সদ ও অবশীর্ষ প্রতিবিম্ব রেটিনায় তৈরি করে।', [S.NCERT_X10, S.OS_AP_EYE]),
    claim('ner.eye.iris', 'class9', 'The iris controls the size of the pupil, and so the amount of light entering the eye; most refraction happens at the cornea.', 'কনীনিকা (আইরিস) তারারন্ধ্রের আকার এবং চোখে প্রবেশকারী আলোর পরিমাণ নিয়ন্ত্রণ করে; বেশিরভাগ প্রতিসরণ কর্নিয়ায় ঘটে।', [S.NCERT_X10, S.OS_AP_EYE]),
    claim('ner.eye.accommodation', 'class10', 'Ciliary muscles change the curvature and focal length of the lens (accommodation); for a normal young adult the near point is about 25 cm and the far point is infinity.', 'সিলিয়ারি পেশি লেন্সের বক্রতা ও ফোকাস দূরত্ব বদলায় (উপযোজন); স্বাভাবিক তরুণ প্রাপ্তবয়স্কের নিকটবিন্দু প্রায় 25 cm এবং দূরবিন্দু অসীম।', [S.NCERT_X10, S.OS_AP_EYE], { value: 25, unit: 'cm', range: [25, 25] }),
    claim('ner.eye.rods', 'class11-12', 'Rods work in dim light; cones need bright light and give colour vision. The retina converts light into nerve impulses carried by the optic nerve.', 'রড কোশ ক্ষীণ আলোয় কাজ করে; কোন কোশ উজ্জ্বল আলোয় রঙিন দৃষ্টি দেয়। রেটিনা আলোকে স্নায়ু-আবেগে পরিণত করে, যা দর্শন স্নায়ু বহন করে।', [S.NCERT_XI_NC, S.OS_AP_EYE])
  ],
  parts: [
    part('cornea', 'class9', '#bae6fd', 'Cornea', 'কর্নিয়া (Cornea)', 'Clear front window; bends light most.', 'স্বচ্ছ সামনের জানালা; আলোকে সবচেয়ে বেশি বাঁকায়।', 'class10', 'Light enters the eye through it.', 'এর মধ্য দিয়ে আলো চোখে প্রবেশ করে।'),
    part('iris', 'class9', '#a16207', 'Iris and pupil', 'কনীনিকা ও তারারন্ধ্র', 'Coloured ring that adjusts the pupil.', 'রঙিন বলয়, যা তারারন্ধ্রের আকার বদলায়।', 'class10', 'Pupil narrows in bright light, widens in dim light.', 'উজ্জ্বল আলোয় তারারন্ধ্র ছোট হয়, ক্ষীণ আলোয় বড় হয়।'),
    part('lens', 'class9', '#fde68a', 'Lens', 'লেন্স (Lens)', 'Fine-focuses the image.', 'প্রতিবিম্বকে সূক্ষ্মভাবে কেন্দ্রীভূত করে।', 'class10', 'A convex lens of changeable shape.', 'পরিবর্তনশীল আকৃতির উত্তল লেন্স।'),
    part('ciliary', 'class10', '#fb7185', 'Ciliary muscles', 'সিলিয়ারি পেশি', 'Change the lens shape.', 'লেন্সের আকৃতি বদলায়।', 'class10', 'Contract for near objects (thicker lens).', 'কাছের বস্তুর জন্য সংকুচিত হয় (লেন্স পুরু হয়)।'),
    part('retina', 'class9', '#f472b6', 'Retina', 'রেটিনা (Retina)', 'Light-sensitive screen at the back.', 'পেছনের আলোক-সংবেদী পর্দা।', 'class11-12', 'Contains rods and cones.', 'এতে রড ও কোন কোশ থাকে।'),
    part('ray', 'class10', '#facc15', 'Light rays', 'আলোকরশ্মি', 'Travel from the object into the eye.', 'বস্তু থেকে চোখে প্রবেশ করে।', 'class10', 'They cross and form an inverted image.', 'এরা পরস্পরকে ছেদ করে অবশীর্ষ প্রতিবিম্ব তৈরি করে।')
  ],
  chapters: [
    chapter('overview', 'class9', 15, '1. Inside the eye', '1. চোখের ভেতরে', 'Light passes through cornea, pupil and lens to an inverted image on the retina.', 'আলো কর্নিয়া, তারারন্ধ্র ও লেন্স পেরিয়ে রেটিনায় অবশীর্ষ প্রতিবিম্ব তৈরি করে।'),
    chapter('accommodation', 'class10', 22, '2. Focusing near and far', '2. কাছে ও দূরে ফোকাস', 'For a near object the ciliary muscles contract and the lens thickens; for a far object it thins.', 'কাছের বস্তুর জন্য সিলিয়ারি পেশি সংকুচিত হয় ও লেন্স পুরু হয়; দূরের বস্তুর জন্য পাতলা হয়।')
  ],
  myths: [myth('class10', '"The image on the retina is upright."', '"রেটিনার প্রতিবিম্ব সোজা।"', 'It is inverted; the brain interprets it as upright.', 'এটি অবশীর্ষ; মস্তিষ্ক একে সোজা হিসেবে ব্যাখ্যা করে।')],
  quiz: [
    quiz('ey1', 'class9', 'The image on the retina is…', 'রেটিনার প্রতিবিম্ব…', [['Real and inverted', 'সদ ও অবশীর্ষ'], ['Virtual and upright', 'অসদ ও সমশীর্ষ'], ['Real and upright', 'সদ ও সমশীর্ষ'], ['Not formed', 'তৈরি হয় না']], 0, 'ner.eye.image'),
    quiz('ey2', 'class9', 'The size of the pupil is controlled by the…', 'তারারন্ধ্রের আকার নিয়ন্ত্রণ করে…', [['Iris', 'কনীনিকা'], ['Lens', 'লেন্স'], ['Retina', 'রেটিনা'], ['Cornea', 'কর্নিয়া']], 0, 'ner.eye.iris'),
    quiz('ey3', 'class9', 'Most bending of light in the eye occurs at the…', 'চোখে আলোর বেশিরভাগ প্রতিসরণ ঘটে…', [['Cornea', 'কর্নিয়ায়'], ['Retina', 'রেটিনায়'], ['Iris', 'কনীনিকায়'], ['Optic nerve', 'দর্শন স্নায়ুতে']], 0, 'ner.eye.iris'),
    quiz('ey4', 'class10', 'The near point of a normal eye is about…', 'স্বাভাবিক চোখের নিকটবিন্দু প্রায়…', [['25 cm', '25 cm'], ['2.5 cm', '2.5 cm'], ['1 m', '1 m'], ['Infinity', 'অসীম']], 0, 'ner.eye.accommodation'),
    quiz('ey5', 'class11-12', 'Colour vision depends on…', 'রঙিন দৃষ্টি নির্ভর করে…', [['Cones', 'কোন কোশের ওপর'], ['Rods', 'রড কোশের ওপর'], ['Iris', 'কনীনিকার ওপর'], ['Cornea', 'কর্নিয়ার ওপর']], 0, 'ner.eye.rods')
  ],
  limitation: limitation('Ray paths are schematic; real refraction happens at several surfaces.', 'রশ্মিপথ রেখাচিত্র মাত্র; বাস্তবে একাধিক তলে প্রতিসরণ ঘটে।')
};

const hormones = {
  id: 'hormones', tag: { en: 'chemical control', bn: 'রাসায়নিক নিয়ন্ত্রণ' },
  title: { en: 'Hormones', bn: 'হরমোন (Hormones)' },
  lead: { en: 'Chemical messengers released into blood by endocrine glands.', bn: 'অন্তঃক্ষরা গ্রন্থি থেকে রক্তে মুক্ত হওয়া রাসায়নিক বার্তাবাহক।' },
  claims: [
    claim('ner.hor.blood', 'class9', 'Hormones are secreted by endocrine glands directly into the blood and act on target cells away from the gland.', 'অন্তঃক্ষরা গ্রন্থি হরমোন সরাসরি রক্তে নিঃসরণ করে এবং তা গ্রন্থি থেকে দূরের লক্ষ্য কোশে কাজ করে।', [S.NCERT_X6, S.OS_AP_ENDO]),
    claim('ner.hor.examples', 'class9', 'Adrenaline (adrenal gland) prepares the body for emergencies; insulin (pancreas) lowers blood sugar; thyroxin (thyroid) needs iodine; growth hormone comes from the pituitary.', 'অ্যাড্রিনালিন (অ্যাড্রিনাল গ্রন্থি) দেহকে জরুরি অবস্থার জন্য প্রস্তুত করে; ইনসুলিন (অগ্ন্যাশয়) রক্তে শর্করা কমায়; থাইরক্সিন (থাইরয়েড) তৈরিতে আয়োডিন লাগে; বৃদ্ধি হরমোন আসে পিটুইটারি থেকে।', [S.NCERT_X6, S.OS_AP_ENDO]),
    claim('ner.hor.feedback', 'class10', 'The timing and amount of hormone release are regulated by feedback: when blood sugar rises, more insulin is released; as it falls, insulin release drops.', 'হরমোন নিঃসরণের সময় ও পরিমাণ ফিডব্যাক পদ্ধতিতে নিয়ন্ত্রিত: রক্তে শর্করা বাড়লে ইনসুলিন বেশি নিঃসৃত হয়, কমলে নিঃসরণ কমে।', [S.NCERT_X6, S.OS_AP_ENDO]),
    claim('ner.hor.iodine', 'class10', 'Lack of iodine in the diet can cause goitre, a swollen neck due to an enlarged thyroid.', 'খাদ্যে আয়োডিনের অভাবে গলগণ্ড হতে পারে, যাতে থাইরয়েড বড় হয়ে গলা ফুলে যায়।', [S.NCERT_X6, S.OS_AP_ENDO]),
    claim('ner.hor.receptor', 'neet', 'Hormones act only on cells that carry matching receptors; peptide hormones bind surface receptors, steroid hormones enter the cell.', 'যেসব কোশে মানানসই গ্রাহক আছে, হরমোন কেবল সেখানেই কাজ করে; পেপটাইড হরমোন কোশতলের গ্রাহকে যুক্ত হয়, স্টেরয়েড হরমোন কোশের ভেতরে প্রবেশ করে।', [S.NCERT_XI_CC, S.OS_AP_ENDO])
  ],
  parts: [
    part('gland', 'class9', '#f59e0b', 'Endocrine gland', 'অন্তঃক্ষরা গ্রন্থি', 'Ductless gland that releases hormone.', 'নালিহীন গ্রন্থি, যা হরমোন নিঃসরণ করে।', 'class10', 'Example shown: pancreas (islets) releasing insulin.', 'দেখানো উদাহরণ: অগ্ন্যাশয় (আইলেট) থেকে ইনসুলিন নিঃসরণ।'),
    part('vessel', 'class9', '#ef4444', 'Blood vessel', 'রক্তবাহ', 'Carries hormone around the body.', 'হরমোনকে দেহে বহন করে।', 'class10', 'This is why hormones act slowly but widely.', 'তাই হরমোনের ক্রিয়া ধীর কিন্তু ব্যাপক।'),
    part('hormone', 'class9', '#a855f7', 'Hormone', 'হরমোন', 'The chemical messenger.', 'রাসায়নিক বার্তাবাহক।', 'neet', 'Peptide or steroid in nature.', 'প্রকৃতিতে পেপটাইড বা স্টেরয়েড।'),
    part('target', 'class10', '#22c55e', 'Target cells', 'লক্ষ্য কোশ', 'Cells that respond to the hormone.', 'যেসব কোশ হরমোনে সাড়া দেয়।', 'neet', 'Only cells with matching receptors respond.', 'কেবল মানানসই গ্রাহকযুক্ত কোশ সাড়া দেয়।'),
    part('sugar', 'class10', '#facc15', 'Blood sugar', 'রক্তের শর্করা', 'Glucose level that insulin controls.', 'গ্লুকোজের মাত্রা, যা ইনসুলিন নিয়ন্ত্রণ করে।', 'class10', 'Insulin helps cells take up glucose.', 'ইনসুলিন কোশকে গ্লুকোজ গ্রহণে সাহায্য করে।')
  ],
  chapters: [
    chapter('overview', 'class9', 15, '1. Gland to blood to target', '1. গ্রন্থি থেকে রক্ত হয়ে লক্ষ্যে', 'The gland releases hormone into blood; it reaches distant target cells.', 'গ্রন্থি রক্তে হরমোন ছাড়ে; তা দূরের লক্ষ্য কোশে পৌঁছায়।'),
    chapter('feedback', 'class10', 24, '2. Feedback control', '2. ফিডব্যাক নিয়ন্ত্রণ', 'After a meal sugar rises, insulin is released, cells take up sugar, and insulin release falls again.', 'খাবারের পরে শর্করা বাড়ে, ইনসুলিন নিঃসৃত হয়, কোশ শর্করা গ্রহণ করে এবং ইনসুলিন নিঃসরণ আবার কমে।')
  ],
  myths: [myth('class10', '"Hormones act as fast as nerves."', '"হরমোন স্নায়ুর মতোই দ্রুত কাজ করে।"', 'Nerve signals take milliseconds; hormones travel in blood and act over seconds to days.', 'স্নায়ু-সংকেতে মিলিসেকেন্ড লাগে; হরমোন রক্তে চলে এবং সেকেন্ড থেকে দিন পর্যন্ত সময় নিয়ে কাজ করে।')],
  quiz: [
    quiz('ho1', 'class9', 'Hormones are carried by…', 'হরমোন বহন করে…', [['Blood', 'রক্ত'], ['Nerves', 'স্নায়ু'], ['Ducts', 'নালি'], ['Air', 'বায়ু']], 0, 'ner.hor.blood'),
    quiz('ho2', 'class9', 'Insulin is secreted by the…', 'ইনসুলিন নিঃসৃত হয়…', [['Pancreas', 'অগ্ন্যাশয় থেকে'], ['Thyroid', 'থাইরয়েড থেকে'], ['Adrenal gland', 'অ্যাড্রিনাল থেকে'], ['Liver', 'যকৃত থেকে']], 0, 'ner.hor.examples'),
    quiz('ho3', 'class9', 'Which hormone prepares the body for an emergency?', 'কোন হরমোন দেহকে জরুরি অবস্থার জন্য প্রস্তুত করে?', [['Adrenaline', 'অ্যাড্রিনালিন'], ['Insulin', 'ইনসুলিন'], ['Thyroxin', 'থাইরক্সিন'], ['Growth hormone', 'বৃদ্ধি হরমোন']], 0, 'ner.hor.examples'),
    quiz('ho4', 'class10', 'Goitre is linked to lack of…', 'গলগণ্ড কীসের অভাবের সঙ্গে যুক্ত?', [['Iodine', 'আয়োডিন'], ['Iron', 'লোহা'], ['Calcium', 'ক্যালশিয়াম'], ['Vitamin C', 'ভিটামিন সি']], 0, 'ner.hor.iodine')
  ],
  limitation: limitation('Hormone molecules are drawn huge and few; timing is compressed.', 'হরমোন অণু বিশাল ও সংখ্যায় কম করে আঁকা হয়েছে; সময় সংক্ষিপ্ত করা হয়েছে।')
};

const plant = {
  id: 'plant-coordination', tag: { en: 'plant', bn: 'উদ্ভিদ' },
  title: { en: 'Coordination in plants', bn: 'উদ্ভিদে সমন্বয়' },
  lead: { en: 'Plants have no nerves, yet shoots bend towards light — guided by the hormone auxin.', bn: 'উদ্ভিদের স্নায়ু নেই, তবু বিটপ আলোর দিকে বাঁকে — অক্সিন হরমোনের নির্দেশে।' },
  claims: [
    claim('ner.pla.tropism', 'class9', 'Shoots bend towards light (positive phototropism) and roots grow downward with gravity (positive geotropism).', 'বিটপ আলোর দিকে বাঁকে (ধনাত্মক আলোকবৃত্তি) এবং মূল অভিকর্ষের দিকে নিচে বাড়ে (ধনাত্মক অভিকর্ষবৃত্তি)।', [S.NCERT_X6, S.OS_BIO_PLANT]),
    claim('ner.pla.auxin', 'class10', 'Auxin is made at the shoot tip; when light comes from one side it moves to the shaded side, where cells grow longer, so the shoot bends towards light.', 'অক্সিন বিটপের অগ্রভাগে তৈরি হয়; একদিক থেকে আলো এলে তা ছায়ার দিকে সরে যায়, সেখানকার কোশ বেশি লম্বা হয়, তাই বিটপ আলোর দিকে বাঁকে।', [S.NCERT_X6, S.OS_BIO_PLANT]),
    claim('ner.pla.mimosa', 'class10', 'The leaves of the touch-me-not (Mimosa) fold when touched by changing the water content of cells, without growth.', 'লজ্জাবতীর (মিমোসা) পাতা স্পর্শে কোশের জলের পরিমাণ বদলে গুটিয়ে যায়; এতে বৃদ্ধি ঘটে না।', [S.NCERT_X6, S.OS_BIO_PLANT]),
    claim('ner.pla.hormones', 'class11-12', 'Gibberellins help stem growth, cytokinins promote cell division, and abscisic acid inhibits growth and closes stomata.', 'জিব্বেরেলিন কাণ্ডের বৃদ্ধিতে, সাইটোকাইনিন কোশ বিভাজনে সাহায্য করে, আর অ্যাবসিসিক অ্যাসিড বৃদ্ধি বাধা দেয় ও পত্ররন্ধ্র বন্ধ করে।', [S.NCERT_X6, S.OS_BIO_PLANT])
  ],
  parts: [
    part('shoot', 'class9', '#22c55e', 'Shoot', 'বিটপ (Shoot)', 'Grows and bends towards light.', 'বাড়ে এবং আলোর দিকে বাঁকে।', 'class10', 'Bending comes from unequal growth on two sides.', 'দুই পাশের অসম বৃদ্ধির ফলে বাঁকে।'),
    part('tip', 'class10', '#86efac', 'Shoot tip', 'বিটপের অগ্রভাগ', 'Where auxin is made.', 'যেখানে অক্সিন তৈরি হয়।', 'class11-12', 'Darwin showed that covering the tip stops bending.', 'ডারউইন দেখিয়েছিলেন অগ্রভাগ ঢেকে দিলে বাঁকা বন্ধ হয়।'),
    part('auxin', 'class10', '#a855f7', 'Auxin', 'অক্সিন (Auxin)', 'Growth hormone that collects on the shaded side.', 'বৃদ্ধি হরমোন, যা ছায়ার দিকে জমা হয়।', 'class11-12', 'Indole-3-acetic acid is the main natural auxin.', 'ইন্ডোল-3-অ্যাসেটিক অ্যাসিড প্রধান প্রাকৃতিক অক্সিন।'),
    part('light', 'class9', '#facc15', 'Light source', 'আলোর উৎস', 'Light from one side.', 'একদিক থেকে আসা আলো।', 'class10', 'The stimulus for phototropism.', 'আলোকবৃত্তির উদ্দীপক।')
  ],
  chapters: [
    chapter('overview', 'class9', 14, '1. A seedling', '1. একটি চারা', 'A young shoot grows upward with light from above.', 'ওপর থেকে আলো পেলে কচি বিটপ সোজা ওপরে বাড়ে।'),
    chapter('bend', 'class10', 22, '2. Light from one side', '2. একদিক থেকে আলো', 'Auxin moves to the shaded side, those cells elongate, and the shoot bends towards the light.', 'অক্সিন ছায়ার দিকে সরে, সেখানকার কোশ লম্বা হয় এবং বিটপ আলোর দিকে বাঁকে।')
  ],
  myths: [myth('class10', '"Light makes the bright side grow faster."', '"আলো উজ্জ্বল দিকটিকে দ্রুত বাড়ায়।"', 'The shaded side grows faster because auxin collects there.', 'ছায়ার দিকটি দ্রুত বাড়ে, কারণ সেখানে অক্সিন জমা হয়।')],
  quiz: [
    quiz('pc1', 'class9', 'Shoots bending towards light is called…', 'বিটপের আলোর দিকে বাঁকাকে বলে…', [['Phototropism', 'আলোকবৃত্তি'], ['Geotropism', 'অভিকর্ষবৃত্তি'], ['Hydrotropism', 'জলবৃত্তি'], ['Photosynthesis', 'সালোকসংশ্লেষ']], 0, 'ner.pla.tropism'),
    quiz('pc2', 'class9', 'Roots growing downward shows…', 'মূলের নিচের দিকে বৃদ্ধি দেখায়…', [['Positive geotropism', 'ধনাত্মক অভিকর্ষবৃত্তি'], ['Negative geotropism', 'ঋণাত্মক অভিকর্ষবৃত্তি'], ['Phototropism', 'আলোকবৃত্তি'], ['Chemotropism', 'রাসায়নিকবৃত্তি']], 0, 'ner.pla.tropism'),
    quiz('pc3', 'class9', 'Shoots show…', 'বিটপ প্রদর্শন করে…', [['Positive phototropism', 'ধনাত্মক আলোকবৃত্তি'], ['Positive geotropism', 'ধনাত্মক অভিকর্ষবৃত্তি'], ['No response to light', 'আলোয় কোনো সাড়া নেই'], ['Negative phototropism', 'ঋণাত্মক আলোকবৃত্তি']], 0, 'ner.pla.tropism'),
    quiz('pc4', 'class10', 'Auxin collects on the…', 'অক্সিন জমা হয়…', [['Shaded side', 'ছায়ার দিকে'], ['Lit side', 'আলোর দিকে'], ['Root tip only', 'কেবল মূলের অগ্রভাগে'], ['Leaves only', 'কেবল পাতায়']], 0, 'ner.pla.auxin')
  ],
  limitation: limitation('Bending is sped up from hours to seconds.', 'বাঁকা হওয়ার সময় ঘণ্টা থেকে কমিয়ে সেকেন্ডে আনা হয়েছে।')
};

export const nervousPacks = [synapse, reflex, brain, eye, hormones, plant];
