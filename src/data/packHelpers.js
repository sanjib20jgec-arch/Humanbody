// Compact constructors for deep-dive packs (shared by every bay).
export const REVIEWED = '2026-10-01';
export const claim = (id, level, en, bn, sources, extra = {}) => ({ id, level, status: 'verified', reviewed: REVIEWED, text: { en, bn }, sources, ...extra });
export const part = (id, level, color, nameEn, nameBn, whatEn, whatBn, deepLevel, deepEn, deepBn) => ({ id, level, color, name: { en: nameEn, bn: nameBn }, what: { en: whatEn, bn: whatBn }, deepLevel, deep: { en: deepEn, bn: deepBn } });
export const chapter = (id, level, duration, tEn, tBn, cEn, cBn) => ({ id, level, duration, title: { en: tEn, bn: tBn }, caption: { en: cEn, bn: cBn } });
export const myth = (level, wEn, wBn, rEn, rBn) => ({ level, wrong: { en: wEn, bn: wBn }, right: { en: rEn, bn: rBn } });
export const quiz = (id, level, qEn, qBn, opts, answer, claimId) => ({ id, level, q: { en: qEn, bn: qBn }, options: opts.map(([en, bn]) => ({ en, bn })), answer, claim: claimId });
export const limitation = (en, bn) => ({ en: `Teaching model, procedurally generated. ${en} Colours are for identification only. Not to scale.`, bn: `শিক্ষণ মডেল, প্রোগ্রামের মাধ্যমে তৈরি। ${bn} রং কেবল চেনার সুবিধার জন্য। মাপ অনুপাতে নয়।` });
