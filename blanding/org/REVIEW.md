# R11 Review: Blanding 3.0, sprint 1

Reviewer: R11 (Staff). Date: 2026-10-31. Everything below was run, not read, unless it is listed under "Not verified".

# Re-gate, round 2 (after f4e0238 engine fixes, UI fixes in 1ca7f1a/6ac46c0)

## Final verdicts

| Lane | Verdict | Why |
|------|---------|-----|
| ENGINE | **SHIP** | MF1, MF2 and MF6 are fixed and verified by real scores (table below). The two gaming routes that remain need a deliberately built sentence, and the cliché cap keeps cliché copy out of Breathing. |
| EXPERIENCE | **SHIP** | MF3, MF4 and MF5 were verified in the browser at 1280 and 375. No console errors, no horizontal overflow, download works, the ladder banner fires. |
| POSTER | **SHIP** | Unchanged. "Excellence" now gets a real diagnosis poster instead of "The Blank Page". |

Suite: 103/103 pass (2 files), including 3 `it.fails` known-limit tests. `vite build` is clean.

## The two calls the TL asked for

**1. SPECIFIC pin 91 to 89: legitimate, not goalpost-moving.** I checked the cause instead of trusting the comment. I applied only `isYear` weight 0.4 to 1 to the new engine. SPECIFIC went straight back to 91 / specificity 86, and the engine was restored afterwards. So the whole 2-point drop comes from "In 2024" becoming a weak year, which is exactly the MF1 rule I asked for. The calibration range test (78-95) was not touched, the other five pins are unchanged, and the edit is commented in place. Accepted. One process note: the pin lives in an R11-owned file. Next time, send the change to R11 instead of editing it, even when it is right.

**2. "GENERIC + Dr. Bob Smith" = 64: an acceptable limit, not a must-fix.** An offline tool cannot tell a real professor from an invented one, and no rule I can write would separate "Dr. Bob Smith" from "Dr. Ruth Abara". The fix commit already bounds the damage: when the cliché subscore is under 25 the score is capped at 64. That puts it in Twitching ("Something moved. Could have been the wind."), not a triumph poster. Clean invented names with no clichés reach 66 (Zorblax case), so the ceiling for fake names is the bottom of Breathing. My recommendation is one line on stage: "It checks that you named something, not that it's true. Your boss checks that."

## Re-run adversarial (new engine, real scores)

| Input | Before | Now | Band now |
|-------|--------|-----|----------|
| `123 456 789` | 96 | **0** | Embalmed |
| `4 8 15 16 23 42. 7 11 13...` | 96 | **0** | Embalmed |
| Phone/zip junk | 87 | **23** | Embalmed |
| HTML with digit attributes | 96 | **45** | Haunted (tags stripped) |
| CMS hero HTML | 33 | 32 | Haunted. Tags and `&nbsp;` gone from Autopsy |
| GENERIC + " in 2025" per sentence | 69 | **34** | Haunted |
| GENERIC + "(N0 students)" per sentence | n/a | 64 | Twitching (cliché cap) |
| GENERIC + ", says Dr. Bob Smith." | 68 | **64** | Twitching (cliché cap) |
| 4 clichés + real counts (`world-class faculty of 400...`) | 76 | **64** | Twitching (cap) |
| `•`/`-`/`*`/`—`/`1.` cliché bullets | 71 | **31** | Haunted |
| Inline `•` bullets Title Case | 54 | 32 | Haunted |
| `Excellence` / `World-class faculty` | 0, Blank Page | **31** | Haunted, "The Exorcism of Excellence" / "Texas Chainsaw Mission Statement" |
| `world‑class` (U+2011) | missed | caught | |
| Fake proper nouns, no clichés | 66 | 66 | Breathing (limit, see call 2) |
| **`We have 123 things and 456 others and 789 more.`** | 96 | **96** | **Unmistakable** (SHOULD-FIX R1) |
| `We offer great programs for 300 students. ... 12 buildings. ... 5 dining halls.` | n/a | 85 | Unmistakable. Real counts, bland claims. Defensible. |
| SPECIFIC / STATS / good narrative / lowercase specifics | 91/92/77/79 | 89/92/77/79 | unchanged bands |
| ALL CAPS SPECIFIC | 87 | **74** | Breathing (SHOULD-FIX R3) |
| Lorem ipsum / Spanish / Chinese | 49/49/0 | 49/49/49 | Haunted (WAITING #6) |
| 84,000 words | 328 ms | 374 ms | fine |

## Re-run mutants

46 mutants: the original 30 (M07 and M09 re-targeted at the new code) plus 16 new ones (N01-N16) on numberWeight, the junk and cliché caps, stripHtml, list markers, firstWordAt, Unicode hyphens, `swapped`, and entity decoding. Before my round-2 tests: **39/46** caught. Survivors: N02 (filler word attaches a number), N03 (digit-heavy sentence keeps number credit), N04 (bare number is full proof), N06 (firstWordAt reverted), N11 (inline tags not stripped), N16 (`&mdash;` decodes to an em dash), and M09. I added a kill test for each to `engine.review.test.js`. **After: 45/46.** M09 is still equivalent (the max raw score is 96). `git diff src/engine` was empty after every mutant, apart from my test file.

## Browser (vite :5180, Playwright, 1280 and 375, server killed after)

- Swap on the bland sample: 2 LITERALLY ANY UNIVERSITY stamps, including "At LITERALLY ANY UNIVERSITY, you will...". No "Northfield" left. Swap off restores both names. `r11b-1280-swap-bland.png`, `r11b-375-swap-bland.png`
- Active cliché: solid blood `rgb(193,39,45)` with paper text, readable. `r11b-375-active-cliche.png`, `r11b-1280-active-cliche.png`
- `Excellence`: 31 Haunted, 1 Autopsy row, poster "The Exorcism of Excellence / It said the word until the priest left. / Rated G: Contains strong language: 'excellence.'" `r11b-1280-poster-excellence.png`, `r11b-375-poster-excellence.png`
- "by adeo" / "Built by adeo." render lowercase at both widths.
- Console errors: none. Overflow: none. Rivals x2, three-things banner and download all work.

## Remaining SHOULD-FIX (none blocks the talk)

- **R1. Vague counted nouns.** `numberWeight` (`detect.js`) attaches a number to any following non-filler word, so `123 things`, `456 others` and `789 more` all count, and the sentence scores 96 Unmistakable. A small stoplist (`things others more stuff ways items reasons people options`) would close it. Cheap; do it before the talk if anyone has 10 minutes. `it.fails` test in place.
- **R2. A capital initial is eaten as a list marker.** `LIST_MARKER` in `text.js` takes `[a-zA-Z][.)]`, so "A. Smith founded the college in 1891." displays as "Smith founded...". Limit it to lowercase letters, or to `[a-z])`. `it.fails` test in place.
- **R3. ALL CAPS numbers lose credit.** The `next` regex in `numberWeight` is lowercase-only (`[a-z]`), so "112 BOOKS" is not attached. Add the `i` flag. `it.fails` test in place.
- R4. A bullet glued to its word ("•World-class") is scored correctly, but the bullet still shows in the Autopsy text.
- R5. The round-1 SHOULD-FIX items below are still open, except SF4 (HTML, done) and SF10 (Unicode hyphen, done). Embalmed is now reachable, but only by junk; real cliché copy still floors at 31 (WAITING #6).

---

# Round 1 (original gate, kept for the record)

## Verdicts

| Lane | Verdict | One line |
|------|---------|----------|
| ENGINE | **PASS WITH FIXES** | Solid, deterministic, fast, never throws. But a skeptic can get 96 "Unmistakable" with `123 456 789` and 71 "Breathing" with a bulleted list of three clichés. Fix MF1 and MF2 before anyone pastes live. |
| EXPERIENCE | **PASS WITH FIXES** | Flows work at 1280 and 375, no console errors, no horizontal overflow. The Logo Swap disagrees with the engine on the bland sample itself, the clicked cliché goes invisible, and "adeo" renders as "ADEO". |
| POSTER | **PASS** | Renders and downloads at 1080x1350, tagline pools never cross bands (dead copy taglines only on embalmed/haunted). Polish items listed under SHOULD-FIX. |

Baseline: `npx vitest run` 70/70 pass (85/85 with review tests). `npx vite build` clean, 331 kB JS (110 kB gzip).

## Mutation testing (src/engine/**)

30 mutants, one at a time, original restored after each (`git diff --stat src/engine` empty afterwards, verified). Harness: scratchpad `mutate.mjs`.

| # | File | Mutant | Original suite | With engine.review.test.js |
|---|------|--------|----------------|----------------------------|
| M01 | index.js | band threshold 80 to 81 | caught | caught |
| M02 | index.js | `isProof: strong >= 1` to `> 1` | caught | caught |
| M03 | index.js | swappable `&&` to `\|\|` | caught | caught |
| M04 | index.js | next-sentence proof looks at `i - 1` | caught | caught |
| M05 | index.js | invert own-sentence proof | caught | caught |
| M06 | index.js | swap proof/cliché weights | **missed** | caught (fixture pin) |
| M07 | index.js | MIN_WORDS 3 to 2 | caught | caught |
| M08 | index.js | density off by 10x | caught | caught |
| M09 | index.js | allow 100 for non-pure-proof | **missed** | missed: **equivalent mutant**. Max raw score is 31+43+8+14 = 96, so the 99/100 clamp and `pureProof` are dead code. 100 is unreachable. |
| M10 | index.js | dominant cliché on ties | **missed** | caught |
| M11 | index.js | specificity target per 6 words, not 9 | **missed** | caught (fixture pin) |
| M12 | text.js | drop stem name form | caught | caught |
| M13 | text.js | `escapeRe` no-op | **missed** | caught (`St. Mary's (MD)`, `A+B University`) |
| M14 | text.js | name regex case-sensitive | caught | caught |
| M15 | text.js | drop `st` abbreviation | caught | caught |
| M16 | lexicon.js | lexicon flags `gi` to `g` | caught | caught |
| M17 | detect.js | cliché `end` off by one | caught | caught |
| M18 | detect.js | shortest overlap wins | caught | caught |
| M19 | detect.js | school name counts as specific | caught | caught |
| M20 | detect.js | headline capShare 0.75 to 0.95 | **missed** | caught |
| M21 | detect.js | one cliché is not a promise | caught | caught |
| M22 | detect.js | sentence-initial capital counts as a name | caught | caught |
| M23 | detect.js | concrete nouns count as proof | **missed** | caught |
| M24 | distinction.js | passes `>= 60` to `> 60` | **missed** | caught |
| M25 | distinction.js | no superlative penalty | **missed** | caught |
| M26 | rivals.js | Jaccard union without `- inter` | caught | caught |
| M27 | rivals.js | prefer 2-grams over 4-grams | caught | caught |
| M28 | titles.js | cliché-themed title on any band | **missed** | caught |
| M29 | index.js | rivals cap 4 | caught | caught |
| M30 | rivals.js | own name not stripped before rival compare | **missed** | caught |

**Score: 19/30 on the shipped suite. 29/30 with review tests. The one survivor is equivalent.**
Note: the fixture-pin test is deliberately brittle. If the engine is retuned on purpose, update the pinned numbers in the same commit.

`src/engine/engine.review.test.js` also has 5 `it.fails` tests that document the live bugs below (MF1, MF2, MF6). They pass today because the bug exists. When a bug is fixed, its test will fail: change it to a plain `it()`.

## Adversarial inputs (real scores, engine called directly; spot-checked in the browser)

| Input | School name | Score | Band | Verdict |
|-------|-------------|-------|------|---------|
| `123 456 789` | none | **96** | Unmistakable | **Gamed.** Poster: "IT LIVES. Nobody else could have written this. Starring Actual Proper Nouns. Rated A for Actual." |
| `4 8 15 16 23 42. 7 11 13 17 19. 2024 2025 2026.` | none | **96** | Unmistakable | Gamed |
| `Call 555-123-4567. Zip 90210. Room 101. Code 42.` | none | **87** | Unmistakable | Gamed |
| `<div class="col-12 mt-4" data-id="98234"><p>We offer a great education.</p></div>` | none | **96** | Unmistakable | Gamed by HTML attributes |
| GENERIC fixture with " in 2025" added to each sentence | Northfield University | **69** (from 31) | Breathing | Gamed. Cliché subscore 5, still Breathing |
| GENERIC with ", says Dr. Bob Smith." on each sentence | Northfield University | 68 | Breathing | Gamed |
| `• World-class faculty` / `• Vibrant community` / `• Hands-on learning` | Northfield University | **71** | Breathing | **Gamed.** Poster: "Rated S for Specific. Rival schools may find this upsetting." Same with `*` bullets or a leading em dash. Without bullets: 31. |
| `Welcome to our school.` + 4 bullets (Small class sizes, Caring faculty, Beautiful campus, Career services) | none | 54 | Twitching | Inflated by bullets |
| `Our world-class faculty of 400 prepare you for the future. 98% of our vibrant community of 12,000 thrives.` | none | 76 | Breathing | 4 clichés in 2 sentences, still Breathing |
| Fake proper nouns (`Zorblax Quinterfield met Plimbo Varnashire at Grelk Hall...`) | none | 66 | Breathing | Mildly gamed |
| List of names (`John Smith. Mary Jones. ...`) | none | 49 | Haunted | Fine (each line starts with the name, skipped as grammar) |
| ALL CAPS generic | none | 31 | Haunted | Fine |
| ALL CAPS of SPECIFIC fixture | Harrow College | 87 | Unmistakable | Fine |
| Lorem ipsum | none | 49 | Haunted | Scores 18 points above real generic copy |
| GENERIC fixture | Northfield University | 31 | Haunted | Fine. Note: 31 is the floor for any real text (see SF1) |
| SPECIFIC fixture | Harrow College | 91 | Unmistakable | Fine |
| Good narrative paragraph (Maria, Dr. Ruth Abara, Mercy General) | Wexley College | 77 | Breathing | Fine |
| Good lowercase specifics (river tests, lead in two wells, by August) | Wexley College | 79 | Breathing | Fine |
| Good paragraph, no caps, no digits (first-years on the farm, milk cows at dawn) | Wexley College | 51 | Twitching | Under-rewarded but defensible |
| `Excellence` (1 word) | any | 0 | Embalmed | Poster says "The Blank Page / In an empty text box, no one can hear you scream". Box is not empty. Autopsy empty. |
| `World-class faculty` (2 words) | any | 0 | Embalmed | Same as above. Contains a terminal cliché, finds none. |
| `World-class faculty here.` (3 words) | none | 31 | Haunted | Fine |
| 84,000 words (GENERIC x1000) | Northfield University | 31 | Haunted | 328 ms. Fine |
| 12,960 words + 2 large rivals | Harrow College | 91 | Unmistakable | 554 ms. Fine |
| CMS HTML (`<div class="hero"><h1>Welcome to Northfield University</h1>...&nbsp;...`) | Northfield University | 33 | Haunted | Score OK, but tags and `&nbsp;` show in the Autopsy |
| Smart quotes, curly apostrophes, non-breaking hyphen | none | 41 | Haunted | No crash. But `world‑class` with U+2011 is NOT caught; the only hit is "thrive" |
| Bullets without periods (5 clichés, sentence case after `•`) | none | **71** | Breathing | See MF2 |
| Hyphen bullets with numbers | none | 91 | Unmistakable | Fine (real numbers) |
| Spanish generic copy | none | 49 | Haunted | English-only lexicon. Finds 0 clichés |
| French generic copy | none | 49 | Haunted | Same |
| Chinese | none | 0 | Embalmed | "The Blank Page" (no Latin words counted) |
| `St. Mary's (MD) is a vibrant community...` | `St. Mary's (MD)` | 42 | Haunted | No crash. Full name swapped. Bare "St. Mary's" not swapped and counted as a proper-noun specific |
| `Florida is a great place...` | University of Florida | 57 | Twitching | "Florida" (your own name) counted as proof. See SF2 |
| `Penn is in Pennsylvania...` | Penn | 43 | Haunted | Engine fine. **UI swap broken**, see MF3 |
| `A+B University (Online) is great.` | A+B University (Online) | 62 | Twitching | No crash, swapped correctly |

**How easy is gaming?** Trivially. Any digits score as proof and make a sentence non-swappable. A string of three numbers is the highest-scoring input I found (96). Starting a cliché with a bullet glyph turns it into a "proper noun". Both take under ten seconds to try, and someone in a room of 100 marketers will try them.

## Integration seams

1. **Logo Swap: engine vs UI disagree (MF3).** Engine (`text.js nameRegex`) swaps the full name plus the stem with Unicode word boundaries. `LogoSwap.jsx:11` builds its own regex: full name only, no stem, no boundaries. Seen live on the "Try a bland one" sample: sentence 4 reads "At Northfield, you will discover your passion..." with the name still there, marked "Could be anyone's". With school name `Penn`, the UI renders "LITERALLY ANY UNIVERSITY is in LITERALLY ANY UNIVERSITYsylvania." (screenshot `r11-1280-swap-penn.png`). `report.logoSwap.swappedText` is computed and never used by the UI.
2. **Poster vs band.** Tagline pools are band-keyed and the cliché-themed pairs are limited to embalmed/haunted (now covered by M28's test). No "dead copy" tagline reaches a triumph poster. The rest of the poster takes its cue from the band, not the content, so gamed scores get gamed posters ("Starring Actual Proper Nouns" for `123 456 789`; `"World-Class", "Vibrant Community" and "Hands-On Learning" AS THEMSELVES, FOR ONCE` on the bullet case). The root cause is the engine (MF1, MF2).
3. Rivals: the UI shows the engine's stopword-stripped grams verbatim ("hands learning", "state art", "community world class faculty"). This matches the contract and reads like typos on a projector (SF5).
4. Distinction exercise uses `run?.schoolName ?? schoolName`. Consistent with the engine.

## Live app (Playwright, vite dev on :5180, then killed)

Driven at 1280x900 and 375x900: samples, run, click cliché, swap toggle (aria-checked flips), Rival Séance with 2 rivals, three-things until the "ladder up" banner, poster download.
- Console errors/warnings: **none** at either width. Horizontal overflow: **none** (landing, results, end).
- Keyboard: 7 Tabs from the top reaches the first cliché button. The 2px blood `focus-visible` outline shows. Enter opens the panel.
- Download: works at both widths, `blanding-northfield-university.png`, 1080x1350 RGBA. It took **6.8 s** in headless Chromium with no busy state (SF7).
- Screenshots (all under `/tmp/claude-0/-home-user-creative-sparks/bce4c815-597f-5f19-a512-b5e87bbbc188/scratchpad/`): `r11-1280-landing.png`, `r11-1280-score.png`, `r11-1280-autopsy.png`, `r11-1280-swap-on.png`, `r11-1280-swap-penn.png`, `r11-1280-active-cliche.png`, `r11-1280-hitlist.png`, `r11-1280-rivals.png`, `r11-1280-poster.png`, `r11-1280-poster-good.png`, `r11-1280-poster-download.png`, `r11-1280-poster-junk.png`, `r11-1280-poster-bullets.png`, `r11-1280-three-things.png`, and the same `r11-375-*` set.

## Voice

- Em dash / en dash (U+2014 / U+2013) in `src/**` and `index.html`: **zero**.
- "adeo" is lowercase in source everywhere (`Masthead.jsx:6`, `Footer.jsx:6`, `renderPoster.js:403`). **But both UI instances sit inside `uppercase` CSS and render as "BY ADEO" and "BUILT BY ADEO."** (visible in `r11-1280-landing.png`, `r11-375-three-things.png`). The poster's "adeo presents" is correct.

## MUST-FIX before the talk (ranked)

1. **ENGINE: bare digits are proof.** `detect.js:87` counts every number as `strong += 1`. Result: `123 456 789` = 96 Unmistakable, phone/zip junk = 87, digits in HTML attributes = 96, and GENERIC + "in 2025" per sentence = 69 Breathing. Suggested: a number counts only next to a counted noun or unit (`214 clubs`, `94 percent`, `$18,450`, `Class of 2025`). A sentence that is mostly digits scores nothing. Cap the total when the cliché subscore is very low (e.g. clicheSub < 25 caps the score at 64). Tests: the `it.fails` blocks in `engine.review.test.js`.
2. **ENGINE: list markers defeat the sentence-start check.** `detect.js:104` `firstWordAt` only skips whitespace, quotes and `(`. For `• World-class faculty`, "World-class" is not at the start, so it becomes a proper noun. Three cliché bullets = 71 Breathing, "Rated S for Specific". Fix: skip `•·▪‣◦*-–—>` and `\d+[.)]` in `firstWordAt`, or strip list markers per line in `splitSentences`. Real homepage paste always has bullets.
3. **EXPERIENCE: Logo Swap re-implements the swap wrongly.** `LogoSwap.jsx:10-11`: no stem, no word boundary. The bland sample shows "At Northfield" unswapped. "Penn" produces "...UNIVERSITYsylvania". Fix: import `nameRegex` from `src/engine/text.js` (TL to allow the cross-lane import, or export it from `index.js`). Wrap the regex source in a capture group for `split`.
4. **EXPERIENCE: the clicked cliché disappears.** `Autopsy.jsx:48` applies both `bg-blood/15` and `bg-blood`. `bg-blood/15` wins in the CSS order, so the active state is `rgb(244,239,230)` text on a 15% blood tint, about 1.2:1 contrast (`r11-1280-active-cliche.png`). Fix: make the base and active class sets exclusive.
5. **VOICE: "adeo" renders as "ADEO".** `Masthead.jsx:6`, `Footer.jsx:6`: wrap the word in `<span className="normal-case">adeo</span>`.
6. **ENGINE/EXPERIENCE: 1-2 word inputs report "The Blank Page".** `index.js:12` `MIN_WORDS = 3` returns `emptyReport`, so `Excellence` gets score 0, an empty Autopsy, and a poster saying the text box is empty. Someone will type one word first. Fix: a "Too short to diagnose. Paste a paragraph." state in the UI when `stats.words === 0 && text.trim()`, and a different diagnosis than Blank Page.

## SHOULD-FIX

1. **Embalmed is unreachable for real text.** `index.js:30` `base: 31` puts the floor at 31. Pure cliché soup (GENERIC, `WHERE LEADERS BEGIN`) gets 31 Haunted, and the Embalmed band, poster pools and "B for Bland" ratings never show. Meanwhile lorem ipsum, Spanish copy and any zero-signal text get 49, i.e. 18 points *better* than real generic copy. Taste call for Tracey (related to WAITING #3).
2. **Own name counted as specific for "University of X" and "St. Mary's College of Maryland".** `text.js:66-67` only derives a stem when the name *ends* in University/College. Add `University of X` to `X`, and `X College of Y` to `X`.
3. **checkDistinction passes thin claims.** `Our library has 900 chairs for everyone to use.` = 60, passes, and the filler reason is "Survives the logo swap." (`distinction.js:70`), which is false. Day names count as names: "Names something real: Thursday. Good." (seen live on a passing claim).
4. **HTML paste:** tags and `&nbsp;` are not stripped. They show in the Autopsy and their digits score (see MF1). Strip tags and decode entities before `analyze`.
5. **Rival phrases display stopword-stripped grams** ("hands learning", "state art"). Show the original surface phrase.
6. **Poster polish:** the Unmistakable "It Lives." title is followed by an "IT LIVES." banner (`renderPoster.js:463`). "Starring Actual Proper Nouns" is a constant on every high band, even with none (`:478`). Clichés on high bands get "AS THEMSELVES, FOR ONCE" (`:496`).
7. **Poster download has no busy state.** 6.8 s headless before the file appears. Disable the button and show "Developing..." while `toBlob` runs.
8. **HitList.jsx:12:** an odd number of clichés leaves a solid black cell (the `bg-ink` gap trick), visible with 1 cliché at 1280.
9. **Offline:** fonts come from Google Fonts. On dead conference Wi-Fi the UI and poster fall back to Georgia/system fonts. Self-host the three families.
10. `world‑class` with a non-breaking hyphen (U+2011, common in Word/CMS paste) is not caught. Let `H` in `lexicon.js` include `‐‑`.
11. At 375 the period after an inline cliché button can wrap onto its own line (`r11-375-swap-on.png`, sentence 6).

## Not verified

- Safari and Firefox, and real projector resolution/contrast. Only headless Chromium was tested.
- Poster download speed on real hardware. 6.8 s is headless software rendering.
- Clipboard "Copy diagnosis" result (headless has no clipboard permission). The button state was not checked either.
- Screen reader behavior beyond the aria attributes I read. `prefers-reduced-motion` was not exercised.
- Offline behavior. I did not cut the network.
- The 87 lexicon translations/fixes and poster jokes for taste (WAITING #1, #2). I only checked them for dashes and banned words.
- Production build in a browser. I drove `vite` dev. `vite build` succeeds but `dist/` was not served.
- Rival Séance with 3 rivals and the remove-rival button.
