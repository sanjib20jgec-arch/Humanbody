// Seed claims: the round-10 corrections, recorded in the accuracy framework so
// bays reuse one verified value. Bays add their own files next to this one.
export const foundationClaims = [
  {
    id: 'nervous.reflex.withdrawal-latency',
    level: 'class10',
    text: {
      en: 'A withdrawal reflex begins in roughly 65–150 ms — faster than a voluntary reaction (usually over 150 ms), because the signal is routed through the spinal cord without waiting for the brain.',
      bn: 'প্রত্যাহার প্রতিবর্তক্রিয়া প্রায় 65–150 ms-এর মধ্যে শুরু হয় — ইচ্ছাকৃত প্রতিক্রিয়ার (সাধারণত 150 ms-এর বেশি) চেয়ে দ্রুত, কারণ সংকেতটি মস্তিষ্কের অপেক্ষা না করে সুষুম্নাকাণ্ডের মধ্য দিয়ে যায়।'
    },
    value: 91, unit: 'ms', range: [65, 150],
    sources: [
      { kind: 'peer-reviewed', title: 'Nociceptive withdrawal reflex RII/RIII latencies', url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9872115/' },
      { kind: 'syllabus', title: 'NCERT Science Class 10, Ch 6 Control and Coordination (Reprint 2026-27)', url: 'https://ncert.nic.in/textbook/pdf/jesc1ps.pdf' }
    ],
    status: 'verified', reviewed: '2026-10-01'
  },
  {
    id: 'excretion.urine.daily-volume',
    level: 'class11-12',
    text: {
      en: 'Healthy kidneys can vary urine output from about 0.8 L/day (maximally concentrated) up to about 20 L/day (maximally dilute), with urine osmolality between 50 and 1200 mOsm/kg.',
      bn: 'সুস্থ বৃক্ক মূত্রের পরিমাণ প্রায় 0.8 L/দিন (সর্বাধিক গাঢ়) থেকে প্রায় 20 L/দিন (সর্বাধিক লঘু) পর্যন্ত পরিবর্তন করতে পারে; মূত্রের অসমোলালিটি 50 থেকে 1200 mOsm/kg।'
    },
    value: 1.5, unit: 'L/day', range: [0.8, 20],
    sources: [
      { kind: 'reference', title: 'Medscape — Diabetes insipidus: urine osmolality and volume', url: 'https://emedicine.medscape.com/article/117648-overview' },
      { kind: 'syllabus', title: 'NCERT Biology Class 11, Excretory Products and their Elimination', citation: 'NCERT XI Biology (2026-27)' }
    ],
    status: 'verified', reviewed: '2026-10-01'
  },
  {
    id: 'reproduction.cycle.lh-ovulation-delay',
    level: 'neet',
    text: {
      en: 'Estradiol peaks about 1 day before the LH surge; ovulation follows the start of the LH surge by about 24–36 h.',
      bn: 'LH-এর আকস্মিক বৃদ্ধির প্রায় 1 দিন আগে ইস্ট্রাডায়োলের মাত্রা সর্বোচ্চ হয়; LH বৃদ্ধি শুরুর প্রায় 24–36 ঘণ্টা পরে ডিম্বস্ফোটন ঘটে।'
    },
    value: 30, unit: 'h', range: [24, 36],
    sources: [
      { kind: 'reference', title: 'GLOWM — Documentation of Ovulation', url: 'https://www.glowm.com/section-view/item/290' },
      { kind: 'syllabus', title: 'NCERT Biology Class 12, Human Reproduction (menstrual cycle)', citation: 'NCERT XII Biology (2026-27)' }
    ],
    status: 'verified', reviewed: '2026-10-01'
  }
];
