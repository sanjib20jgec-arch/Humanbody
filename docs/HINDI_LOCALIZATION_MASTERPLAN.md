# Hindi (हिन्दी) Localization — Analysis, Research & Implementation Plan

**Status:** Initial implementation is in progress. Hindi selection, page language metadata, core interface strings, module summaries/objectives, selected deep-dive UI strings, and a Devanagari font are implemented. The complete lesson/quiz/atlas/simulation content is **not yet translated**.  
**Scope:** Add Hindi as a third language alongside English and Bengali across the app, including persisted language preference, interface, lessons, quizzes, scientific labels, accessibility metadata and offline/mobile builds.

## Executive summary

The project has a useful foundation: language choice is a persisted preference, strings are centralized in `src/lib/i18n.js`, React consumes the setting through `PreferencesContext`, and the document language is updated before/after rendering. But this is **not yet a complete two-language localization system**. Hindi cannot be enabled by adding only another button or only a third `STRINGS` object:

- The language allow-list currently accepts only `en` and `bn` (`src/lib/preferences.js`).
- `src/lib/i18n.js` has explicit English and Bengali dictionaries and a key-parity smoke test.
- Module metadata has a separate Bengali-only translation layer (`src/data/moduleText.bn.js`).
- Cell deep-dive strings have their own `en`/`bn` dictionaries (`src/data/cell/strings.js`).
- Scientific claims are required by `validateClaim()` to have both `en` and `bn` text (`src/lib/claims.js`); many learning packs also keep bilingual text/options inline.
- Significant text is hard-coded directly in components/simulations, so changing the global language alone will not translate every screen.
- The root `lang` is currently only `bn` or `en`; some 3D atlas controls and auxiliary tools have visible hard-coded English.

**Recommendation:** ship Hindi in staged, explicitly measured coverage. First make the language plumbing safely tri-lingual, then translate the common shell and core modules, then the remaining learning bays and atlas/simulation UI. Never mark a screen “Hindi” while silently presenting its educational body in English without disclosure.

## Implementation progress (2026-10-04)

- **Completed in this pass:** `hi` preference/storage and `<html lang="hi">`; Hindi option in Settings; complete parity-checked Hindi shell dictionary; Hindi summaries and objectives for all listed learning modules; Hindi strings for the cell deep-dive controls; Devanagari Noto Sans font with script-specific Unicode ranges and Hindi line-height; Hindi deep-dive eyebrow/translation disclosure; smoke checks for dictionary parity, preference acceptance, Hindi module coverage and cell-string parity.
- **Verified:** `verify:foundation`, `verify:cell-slice`, `verify:bay-packs`, `verify:curriculum`, `verify:mobile`, `verify:viewport` and production build pass. Build retains the existing large-chunk warning. Browser tests could not execute because the Playwright Chromium executable is not installed in this environment.
- **Still outstanding:** human-reviewed Hindi for lesson claims, parts, chapter captions, quizzes/options/feedback, source descriptions, atlas controls, simulation UI, error/help/progress/dialog surfaces and offline Android visual proof. Those strings continue to use the current English fallback where no Hindi translation exists. Hindi is therefore a partial localization, not yet a fully localized curriculum.

## Repository exploration: implementation touchpoints

| Area | Current implementation | Hindi work required |
|---|---|---|
| Preference validation/storage | `src/lib/preferences.js`, `hbl-language` localStorage key | Add `hi`; preserve existing `en`/`bn` stored values and default/fallback behavior. |
| Early document language | `applyPreferencesToDocument()` sets `<html lang>` | Set `lang="hi"` for Hindi; retain document update before first paint. Use `hi-IN` for locale formatting where needed, not as the language preference code. |
| UI dictionary | `src/lib/i18n.js` (`STRINGS.en`, `STRINGS.bn`) | Add `STRINGS.hi`; enforce complete key parity for all three dictionaries. `translate()` fallback policy must be explicit and testable. |
| Settings switch | `src/components/FoundationSettings.jsx` | Add visible “हिन्दी” option with the right `lang` attribute; ensure switch controls fit narrow phone layout. |
| Module shell | `src/data/moduleText.bn.js`, `src/App.jsx` | Refactor to language-neutral `moduleText` map (`en`/`bn`/`hi`) or a consistent dictionary, and cover titles, short names, descriptions, topics and objectives. |
| Learning claims | `src/lib/claims.js`, `src/data/claims/*` | Extend claim schema/validation to require `hi` only when Hindi content is published, then migrate claim text and quizzes with reviewed Hindi. Do not break existing claim provenance checks. |
| Learning packs | `src/data/*/*Packs.js` | Inventory every prompt, answer, distractor, feedback string and explanation; add `hi` fields and Hindi coverage QC. |
| Cell bay | `src/data/cell/strings.js`, `mitochondrion.js` | Add Hindi strings and content, update parity/smoke scripts. |
| Other bays / atlas | `src/components`, `src/simulations`, `src/components/atlasTools.jsx`, `BodyMap3DAtlas.jsx` | Replace user-visible hard-coded copy with keys/localized data; include accessible names, tooltips, errors, loading messages, quiz feedback and keyboard hints. |
| Typography | `package.json` currently includes Noto Sans Bengali | Validate Devanagari rendering on all target platforms; add an appropriate Devanagari font asset only if system/browser fallback is insufficient. Test mixed Latin scientific names and Hindi. |
| Tests and builds | foundation, cell, curriculum, mobile, offline and visual scripts | Add tri-lingual parity/content coverage checks; test language switching, persistence, offline build and phone layout. |

## Research and localization decisions

### Language identifiers and metadata

Use **`hi`** as the language preference/content dictionary key and page language tag; use **`hi-IN`** when a region-specific locale is needed for formatting. Hindi content uses Devanagari Unicode text. W3C guidance describes BCP 47 tags for identifying language and locale, and its internationalization guidance recommends associating natural-language content with language metadata and using locale-aware APIs for locale-sensitive behavior: [W3C Language Tags and Locale Identifiers](https://w3c.github.io/ltli/) and [W3C Internationalization Best Practices](https://www.w3.org/TR/international-specs/).

Do not conflate language with curriculum: Hindi is a display language, while WBBSE/NCERT remains a separate syllabus preference. Hindi should not automatically switch a user's curriculum.

### Hindi terminology and editorial method

Use current NCERT Hindi-medium biology terminology as the primary school-level reference where it matches the chosen curriculum; preserve accepted English/Latin scientific terms in parentheses at first use when that improves recognition (for example, an agreed Hindi term followed by the English term). NEET/high-school terminology should remain consistent with the selected syllabus and standard scientific usage. The web search surfaced examples of Hindi NCERT Biology terms, but some results were third-party mirrors/aggregators rather than authoritative primary documents. Therefore, implementation must verify terminology against the current official NCERT/CBSE textbook or syllabus edition before adoption; do not treat search snippets or unofficial PDFs as the editorial source of truth. NCERT’s publication/textbook portal should be checked during the content work: [NCERT](https://ncert.nic.in/).

### Numerals, dates and scientific notation

The app currently has an explicit English-digit policy (`formatNumber()` uses `en-IN`; Bengali content QC prohibits Bengali numerals). For predictable parity across three languages, retain ASCII digits 0–9 for the first Hindi release, unless product/editorial review explicitly changes this policy. Format dates and locale-sensitive numbers through `Intl.*` with a deliberate locale; keep stored/interchange values locale-neutral. Do not localize identifiers, units, Latin binomial names, chemical notation, or machine-readable values.

### Translation quality and authorship

Use human-reviewed Hindi, not unreviewed machine translation. Maintain a glossary with preferred Hindi term, accepted English/Latin term, definition/context, class level, source, reviewer and review date. Translate science for meaning and learner level, not word-for-word; keep claims, uncertainty, sources and caveats identical in all languages. Hindi strings containing English should be limited to agreed scientific terms/acronyms—not conversational Hinglish.

## Product behavior and fallback policy

1. Selecting Hindi updates interface copy, lesson copy, quizzes and accessibility text in the supported coverage area; persists across reloads and works offline.
2. A user can always switch back to English or Bengali from Settings.
3. For any not-yet-localized learning bay, choose one honest policy before rollout: (a) do not list Hindi as fully supported until all core learner-facing text is translated, or (b) expose a clear “Hindi translation in progress” notice and provide a deliberate English fallback for that bay. Never mix partial Hindi and English invisibly.
4. `translate()` should fall back predictably (proposed order: selected language → English → supplied fallback/key), with missing Hindi keys reported by QC rather than hidden in production.
5. Scientific names and canonical IDs remain language-independent; user-facing common names can be localized while the canonical Latin/English name remains available as a secondary label.

## Phased implementation plan

### Phase 0 — Coverage inventory and glossary
- Run repository-wide inventory for user-visible literals, `STRINGS_*`, `.en`/`.bn` data and `claim()`/quiz packs.
- Classify strings: shell/navigation, errors/accessibility, lesson content, scientific labels, curriculum-specific text, non-translatable identifiers.
- Create a Hindi glossary and source/reviewer record; validate current official Hindi textbook terminology for WBBSE/NCERT scope.
- Define release coverage threshold and fallback policy. Identify the first release slice, recommended: settings + home/navigation + Class 9/10 core shell, then each bay as a complete unit.

**Gate:** every string has an owner/category; science term list and editorial rules approved.

### Phase 1 — Tri-lingual infrastructure
- Add `hi` to `PREFERENCE_SCHEMA.language.values`; preserve `hbl-language` storage compatibility.
- Add `STRINGS.hi`; update `translate()` and all parity tests to compare en/bn/hi key sets.
- Update `FoundationSettings` language label and `applyPreferencesToDocument()` (`lang="hi"`).
- Introduce a consistent locale map (`en → en-IN`, `bn → en-IN` for current digit policy, `hi → hi-IN` where relevant) and test formatting behavior separately from translation.
- Refactor the Bengali-only module localization into language-indexed data without changing current English/Bengali output.

**Gate:** switching languages updates page metadata and persists; existing en/bn smoke tests remain green; no unexpected translation fallback.

### Phase 2 — Shell and app-wide UI
- Translate settings, navigation, home, progress, help, dialogs, loading/error states, guided path labels and common actions.
- Add Devanagari typography validation: font fallback, line height, button wrapping, text scaling 100/115/130%, focus/tooltip clipping and mobile safe areas.
- Mark embedded foreign-language runs with appropriate `lang` where screen-reader pronunciation benefits; keep root language accurate.

**Gate:** shell has complete Hindi coverage; keyboard/screen reader and desktop/tablet/phone checks pass.

### Phase 3 — Educational content by complete bay
- Start with a bounded core group (recommended cell/tissues/respiration/circulation) and translate every user-facing text surface in each bay: claims, objectives, prompt, options, feedback, labels, accessible names, notes and sources’ explanatory copy.
- Extend claim schema and `validateClaim()` so published claims carry en/bn/hi text; update every claim source record and claim QC. During migration, allow an explicit staged status rather than silently equating absent Hindi with correct Hindi.
- Add per-bay Hindi coverage reports and prohibit “fully localized” status until the entire learner path in that bay is covered.
- Continue remaining bays, simulations, atlas controls and specialist/NEET layers in explicit batches.

**Gate:** Hindi translation reviewed by a Hindi science educator and a biology subject reviewer; claim accuracy/source parity and answer-key parity verified.

### Phase 4 — Fonts, visual QA and accessibility
- Check Noto/system Devanagari coverage and shaping on Android WebView/Capacitor, Chrome, Firefox and Safari targets; verify conjuncts, matras, punctuation and mixed-script strings.
- If bundling a font is necessary, review license, bundle cost, offline availability and subset only required glyphs; do not add a large font without performance measurement.
- Test longer Hindi labels at narrow widths, screen-reader language announcement, text scale, contrast, zoom, keyboard operation and reduced motion.

**Gate:** no clipping/overlap, no missing glyph boxes, accessible controls and acceptable first-load/offline bundle budget.

### Phase 5 — Release and governance
- Run build + online/offline builds and relevant suites: `verify:foundation`, `verify:cell-slice`, `verify:bay-packs`, `verify:curriculum`, `verify:mobile`, `verify:viewport`, `verify:interaction`, `verify:deployment`, plus visual review.
- Add automated checks: language key parity; Hindi missing-key report; no accidental Banglish in authored Hindi (allow glossary entries); claim language completeness; numeric policy; module/bay coverage; locale metadata; no untranslated high-priority controls.
- Conduct manual Hindi proofread and medical/scientific review. Release the supported Hindi coverage and known limitations in the app/README.

## Acceptance criteria

- `hi` is a valid persisted preference; old `en`/`bn` settings still work and invalid settings safely fall back.
- `<html lang>` is exactly `hi` when Hindi is selected and switches correctly without reload.
- No empty Hindi strings or missing dictionary keys in required release surfaces; English fallback is measured and reported.
- Published Hindi claims and quiz answers preserve scientific meaning, numeric values, uncertainty, sources and answer keys.
- Scientific names/IDs remain stable; localized common labels do not break search, shared links, saved progress or atlas selection.
- Devanagari is readable at all supported text scales and viewport sizes; no clipping and no missing glyphs in browser or offline Android build.
- All language-specific UI remains usable by keyboard, screen readers and touch; tests cover screen switches and persistence.

## Priority and dependency summary

| Priority | Work | Dependency |
|---|---|---|
| P0 | Inventory, editorial policy, glossary and coverage definition | None |
| P1 | Preference/i18n/root-lang/module architecture | P0; preserve en/bn parity |
| P1 | Shell translation + Devanagari layout QA | P1 infrastructure |
| P2 | Complete content translation, bay by bay; extend claims and pack QC | Approved glossary/reviewer; content provenance |
| P2 | Atlas, simulation, accessibility and offline strings | Stable common localization API |
| P3 | Additional locale formatting or bundled Devanagari font | Evidence from QA; avoid unnecessary scope |

## Research references

- W3C, *Language Tags and Locale Identifiers for the World Wide Web*: https://w3c.github.io/ltli/ — language/locale identifiers and Unicode locale practices.
- W3C, *Internationalization Best Practices for Spec Developers*: https://www.w3.org/TR/international-specs/ — BCP 47 metadata and locale-sensitive handling.
- NCERT official portal: https://ncert.nic.in/ — primary point to verify current Hindi-medium terminology/textbook editions during the content phase. Search results also included secondary educational portals; these are discovery leads, not approval-quality sources.
