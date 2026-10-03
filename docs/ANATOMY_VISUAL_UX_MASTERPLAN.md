# Anatomy Atlas — Visual & Interaction উন্নয়নের Masterplan

**উদ্দেশ্য:** Human Biology Lab-এর 3D anatomy atlas-কে আরও বিশ্বাসযোগ্য, পাঠযোগ্য ও স্পর্শ-বন্ধুসুলভ করা—বিদ্যমান শিক্ষণ-নির্ভুলতা, পারফরম্যান্স এবং accessibility না ভেঙে।  
**পরিধি:** প্রধানত `src/components/BodyMap3DAtlas.jsx`, `src/lib/AnatomySceneManager.js`, `src/lib/atlasRendering.js`, `src/lib/atlasFraming.js`, `src/lib/atlasPostFX.js`, `src/styles.css` এবং সংশ্লিষ্ট QC/visual-review।  
**অগ্রগতি (2026-10-04):** P1 camera/HUD refinements ও initial mobile detail-sheet pass বাস্তবায়িত; verified anatomy anchor ছাড়া নতুন 3D pin যোগ করা হয়নি। সম্পূর্ণ pin system, screenshot-based visual review এবং বাস্তব ফোনে gesture QA এখনও বাকি।

## ১. বর্তমান ভিত্তি ও নীতি

কোডে ইতিমধ্যেই Three.js atlas, ACES tone mapping, Hemisphere + Key/Fill/Rim light, PMREM environment, quality/device tier, demand-driven rendering, reduced-motion-aware camera fly-to, mobile one-finger rotate/two-finger dolly-pan এবং responsive mobile HUD রয়েছে। তাই লক্ষ্য হলো এগুলোকে পরিমিতভাবে পরিশীলিত করা—আবার নতুন করে একই ব্যবস্থা বানানো নয়।

**ডিজাইন নীতি**
- শারীরস্থান ও tissue identity-ই প্রধান; চকচকে “গেম/প্লাস্টিক” চেহারা নয়।
- বাস্তব anatomy-র প্রমাণ নেই এমন texture, capillary, SSS বা অভ্যন্তরীণ detail বানিয়ে দেখানো যাবে না।
- নির্বাচিত অঙ্গকে প্রাধান্য দিতে হবে, কিন্তু আশপাশের দেহের অবস্থান-সম্পর্ক বোধগম্য রাখতে হবে।
- GPU-ব্যয়বহুল সুবিধা ঐচ্ছিক/quality-tier অনুযায়ী; কম ক্ষমতার ডিভাইসে নির্ভরযোগ্য বিকল্প থাকবে।
- প্রতিটি ভিজ্যুয়াল পরিবর্তন desktop, tablet, phone, reduced-motion এবং keyboard/accessibility-তে যাচাই হবে।

## ২. অভিজ্ঞতার লক্ষ্য

1. Tissue material নরম/আর্দ্র দেখাবে, কিন্তু অতিরিক্ত specular বা ভুল রঙে চিকিৎসাগত বিভ্রান্তি সৃষ্টি করবে না।
2. অঙ্গ-নির্বাচন, নাম, পিন এবং ক্যামেরা—একই কাজের ধারাবাহিক অংশ হবে।
3. Glass HUD মডেলকে আড়াল করবে না; তথ্য দরকার হলে সহজে খোলা ও বন্ধ করা যাবে।
4. মোবাইল ব্যবহারকারী এক হাতে অঙ্গ নির্বাচন ও তথ্য পড়তে পারবেন; canvas gesture page scrolling-কে অকারণে আটকে রাখবে না।
5. নিম্নমানের GPU/ব্রাউজারেও graceful fallback থাকবে এবং বিদ্যমান anatomy QC অক্ষুণ্ণ থাকবে।

## ৩. প্রস্তাবিত কাজের ধাপ

### ধাপ A — Baseline, নকশা-চুক্তি ও পরিমাপ
- বর্তমান scene/material/light/camera/interaction এবং `docs/FRONTEND_CG_INSPECTION.md`-এর সুপারিশের সঙ্গে মিলিয়ে ছোট feature inventory বানানো।
- নির্দিষ্ট reference shot: প্রাথমিক skeleton, thorax organs, নির্বাচিত organ + ghost context; 1440×900, 768×1024, 390×844।
- Baseline-এ screenshot, fps/frame-time, draw calls, memory/texture budget এবং interaction checks রেকর্ড।
- Anatomical review-এর জন্য প্রতিটি প্রস্তাবিত material/ghost state-এর palette ও opacity আগে নির্ধারণ; শিক্ষা-লেবেল/সূত্র অক্ষত রাখা।

**সমাপ্তির মানদণ্ড:** তুলনাযোগ্য screenshot ও পরীক্ষার পুনরাবৃত্তিযোগ্য baseline; বর্তমান ভাল আচরণগুলোর regression তালিকা।

### ধাপ B — Tissue look ও studio lighting
- বিদ্যমান tissue-type material-গুলোতে roughness, clearcoat ও specular budget পর্যালোচনা; ভেজা অনুভূতি আনতে broad, নরম highlight ব্যবহার, mirror-like চকচকে নয়।
- Fresnel/rim কেবল নির্বাচিত বা silhouette-এ সীমিত ও রঙ-সংযত; সব tissue-তে সমান cyan outline নয়।
- বর্তমান Key/Fill/Rim setup-কে দৃশ্যভিত্তিক tune করা; AO/SSAO কেবল সমর্থিত quality tier-এ, ত্রুটি/অতিরিক্ত noise হলে নীরব fallback।
- SSS বাস্তবায়নের আগে Three.js renderer ও device support যাচাই। প্রকৃত SSS খুব ব্যয়বহুল হলে fake wrap lighting/artist-authored material variant ব্যবহার; “বৈজ্ঞানিক tissue scan” বলে উপস্থাপন নয়।
- আলোর পরিবর্তনে anatomy-র স্বীকৃত রং, silhouette ও দৃশ্যমানতার regression পরীক্ষা।

**সমাপ্তির মানদণ্ড:** reference shot-এ tissue আর প্লাস্টিক/flat না দেখানো; mobile low tier-এ স্থিতিশীল frame rate; material QC ও visual review পাস।

### ধাপ C — Ghost mode ও অঙ্গ-নির্দিষ্ট camera transition
- অঙ্গ নির্বাচনে আশপাশের অনির্বাচিত layer-কে হঠাৎ লুকিয়ে না দিয়ে ধাপে ghost করা: selected organ স্বাভাবিক opacity/depth-এ, প্রাসঙ্গিক context কম opacity-তে, অপ্রাসঙ্গিক স্তর সর্বনিম্নে।
- Depth cue বজায় রাখতে layer-wise alpha/depth attenuation এবং silhouette/outline বেছে নেওয়া; সব mesh-এ `depthWrite=false` দিয়ে flatten না করা।
- 0.8–1.0 সেকেন্ড camera fly-to—বর্তমান tween-এর ওপরই; reduced-motion-এ তাৎক্ষণিক/সংক্ষিপ্ত বিকল্প, user input এলে tween বাতিল।
- Focus target organ-এর bounds/registry data থেকে নির্ধারণ; bounding box অনুপস্থিত হলে camera নড়বে না, নিরাপদ fallback।
- রিসেট/পূর্বের framing, damping ও camera limits যেন সংঘাতে না আসে।

**সমাপ্তির মানদণ্ড:** কোনো আকস্মিক hide/pop নেই; rapid selection ও interruption-এ camera স্থিতিশীল; ghost অবস্থায় selected structure স্পষ্ট ও context পাঠযোগ্য।

### ধাপ D — 3D callout pin ও Glassmorphic HUD
- Anatomy registry/organ region-এর স্থিতিশীল অবস্থান থাকলে সেই data-তেই HTML overlay pin; প্রতিটি frame-এ DOM React re-render নয়—scene update/একটি সীমিত overlay update cycle। নির্ভুল anchor না থাকলে পিন বানিয়ে বসানো নয়।
- Pin-এ সংক্ষিপ্ত নাম, focus/hover state, keyboard focus, বড় touch target; ক্লিকে select + camera focus; occlusion হলে pin hide/attenuate বা edge indicator—অঙ্গের ওপর ভাসমান ভুল অবস্থান নয়।
- বিদ্যমান sidebar/list-কে সম্পূর্ণ বাদ না দিয়ে compact search/list fallback রাখা—পিন অফ/অপ্রাপ্য হলে একই অঙ্গ খুঁজে পাওয়া যাবে।
- HUD-এ semi-transparent dark surface, সূক্ষ্ম border ও সীমিত backdrop blur; fallback solid/translucent color। লেখা/কন্ট্রোলের contrast, focus ring এবং কমপক্ষে ব্যবহারযোগ্য text-size নিশ্চিত।
- Desktop-এ floating compact panels; canvas-এর গুরুত্বপূর্ণ অঞ্চল/label ঢাকলে panel সরানো বা collapse করা যাবে।

**সমাপ্তির মানদণ্ড:** organ list ও pin একই selection state ভাগ করে; keyboard ও touch-এ সমানভাবে কাজ; reduced transparency/unsupported blur-এও readable।

### ধাপ E — Mobile bottom sheet ও touch ergonomics
- মোবাইলে অঙ্গ-বিবরণ ও control panel-কে নিচের sheet-এ সাজানো: collapsed summary, expanded detail, স্পষ্ট drag handle/close action; বর্তমান mobile HUD state-গুলোর সঙ্গে একীভূত করা, দ্বিতীয় প্রতিদ্বন্দ্বী panel নয়।
- Sheet drag এবং canvas orbit gesture-এর boundary নির্ধারণ; sheet-এর ওপর gesture sheet-এ, canvas-এ এক আঙুল rotate এবং দুই আঙুল zoom/pan।
- `touch-action`, pointer capture, passive listener ও OrbitControls-এর আচরণ বাস্তব ডিভাইসে পরীক্ষা; canvas-এর বাইরে page scroll স্বাভাবিক থাকবে।
- 44×44 CSS px-এর কাছাকাছি touch target, safe-area inset, landscape orientation এবং virtual keyboard/স্ক্রিন রিডার যাচাই।
- Drag gesture-এর পাশাপাশি tap-ভিত্তিক expand/collapse ও keyboard-accessible controls রাখা।

**সমাপ্তির মানদণ্ড:** phone-এ sheet ও canvas gesture দ্বন্দ্বহীন; page scroll আটকে থাকে না; selection, zoom, pan এবং তথ্যপাঠে ব্যবহারকারী আটকে যান না।

### ধাপ F — Integration, performance ও release gate
- বিদ্যমান `verify:materials`, `verify:rendering`, `verify:framing`, `verify:mobile`, `verify:viewport`, `verify:reduced-motion`, `verify:interaction`, `verify:visual` এবং `report:visual-review` চালানো; প্রয়োজন হলে focused QC যোগ করা।
- Visual changes-এর আগে/পরে screenshot তুলনা; desktop ও phone-এর অন্তত একটি golden reference; অপ্রত্যাশিত পরিবর্তন হলে release আটকে review।
- নিম্ন tier-এ post-processing/AO/blur বন্ধ করা, pixel ratio সীমিত রাখা; স্থির দৃশ্যে demand-driven render বজায় রাখা।
- কোনো console error, GPU resource leak, selection/camera state drift বা accessibility regression থাকলে ধাপটি সম্পূর্ণ নয়।

## ৪. অগ্রাধিকার ও নির্ভরতা

| অগ্রাধিকার | কাজ | কারণ/নির্ভরতা |
|---|---|---|
| P0 | baseline + existing mobile interaction audit | বর্তমান implementation-এর ওপর নিরাপদে কাজ করার পূর্বশর্ত |
| P1 | material/light polish + ghost depth | সবচেয়ে দৃশ্যমান CG উন্নতি; anatomy/material QC আবশ্যক |
| P1 | camera focus transition edge cases | বিদ্যমান fly-to-কে সমৃদ্ধ করা; reduced-motion বজায় রাখতে হবে |
| P2 | pins + compact glass HUD | নির্ভরযোগ্য anatomy anchors/registry data আবশ্যক |
| P2 | mobile bottom sheet refinement | বর্তমান mobile HUD-র সঙ্গে একীভূত করে বাস্তব ডিভাইসে যাচাই |
| P3 | SSS/উন্নত AO | কেবল প্রমাণিত লাভ ও device budget থাকলে; default requirement নয় |

## ৫. ঝুঁকি ও প্রতিরোধ

- **ভুল anatomical cue:** visual polish কোনো অঙ্গের আকার/রং/অবস্থান বদলাবে না; source/identity QC এবং anatomy reviewer approval।
- **অতিরিক্ত GPU খরচ:** feature flag/quality tier, mobile fallback, profiler baseline; default-এ সর্বোচ্চ ব্যয় নয়।
- **পিনের ভুল অবস্থান:** শুধু যাচাইকৃত anchor বা mesh hit-point; অনুমানভিত্তিক অবস্থানের পরিবর্তে list fallback।
- **HUD readability কমে যাওয়া:** blur-কে অলংকার হিসেবে নয়—contrast/solid fallback বাধ্যতামূলক।
- **Gesture সংঘাত:** canvas, sheet ও page—তিনটি আলাদা gesture zone; phone/tablet smoke test।
- **Motion sickness/accessibility:** reduced-motion, interruptible tween, keyboard এবং non-motion selection বিকল্প।

## ৬. বাস্তবায়নের প্রস্তাবিত টিকিট

1. `visual-baseline`: screenshots, device tiers, perf ও regression checklist।
2. `tissue-lighting-pass`: material tuning, rim restraint এবং optional AO/SSS spike আলাদা করে।
3. `organ-focus-ghost`: layer opacity/depth policy ও camera interruption tests।
4. `atlas-callouts-hud`: verified anchors, accessible pins, floating HUD এবং list fallback।
5. `mobile-sheet-gestures`: bottom sheet, safe-area, touch boundary ও device testing।
6. `visual-regression-gate`: golden screenshot + existing QC scripts-এ নতুন আচরণের guard।

**সুপারিশ:** প্রথম delivery-তে P0 → P1 সম্পন্ন করুন। P2-র pin এবং bottom sheet একসঙ্গে UI architecture review-এর পর করুন। SSS-কে আলাদা গবেষণা/benchmark spike হিসেবে রাখুন—প্রমাণিত performance ও visual benefit না থাকলে চালু করবেন না।
