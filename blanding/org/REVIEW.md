# R11 Review: Blanding 3.0, sprint 1

Reviewer: R11 (Staff). Date: 2026-10-31. Everything below was run, not read, unless it is listed under "Not verified".

# Sprint 2 engine-only confirm (HEAD 3aef714)

**ENGINE: NOT YET** (one rule). The MF-F1 fix is correct and verified: "We pledge to help every student succeed" and "transfer agreements with many schools" no longer get a lede, and haunted/embalmed copy never hears "you opened with the proof". Suite 186/186. My file diff shows only the two MF-F1 flips. Mutants on the changed lines: **5/5 caught**:
- F01: needsStrong ignored
- F02: `strong >= 0`
- F03: haunted guard removed
- F04: guard covers embalmed only
- F05: soft policy terms dropped

Fresh policy-style inputs:

| Input | Score | Result | Verdict |
|-------|-------|--------|---------|
| `Our tuition pledge: if your family earns under $75,000, you pay nothing. 640 students used it in 2025.` | 87 | policy lede, "which is the move" | Correct |
| `We have transfer agreements with Ohio State and Miami University.` | 61 | policy lede | Defensible (named partners) |
| `We pledge to help 10,000 students succeed. ...` | 47 | policy lede; line "then the page buries it under copy any school could sign" | Hedged by the new guard, but the panel still says "a published policy, with terms anyone can check". Weak |
| **`Our pledge to you: 100% commitment, every single day.`** | **85** | **Unmistakable, policy lede, "which is the move: ... you opened with the proof"** | **MF-F2, MUST-FIX** |
| `Our commitment to you is 100% real.` | **85** | Unmistakable, "One line, and it is actually yours." | MF-F2 |

**MF-F2:** `numberWeight` (detect.js) gives any `%` full proof weight (`/^\$|%|percent/` returns 1). So "100%" in a slogan is strong proof, satisfies `needsStrong`, and scores 85. This predates sprint 2, but "100% committed" is common higher-ed copy and now also crowns a policy. Fix: count `100%`/`110%` only when followed by "of" + a noun ("100% of graduates"); otherwise weight 0.2. Pinned by 2 `it.fails`. Re-gate scope: those two tests.

---

# Sprint 2 final gate (HEAD 876ebc0)

## Final verdicts

| Lane | Verdict | Why |
|------|---------|-----|
| ENGINE | **NOT YET** (one regex) | MF-R1 and SF-R2 are fixed and verified. The transfer-policy should-fix introduced a new false crown: MF-F1. |
| EXPERIENCE | **SHIP** | MF-R2 is fixed. Autopsy tags now come only from proofKind: no "PROOF + PROOF: NONE" anywhere, and "EVIDENCE FOR 03" is correct on the mixed sample. |
| DATA | **SHIP** | Unchanged. |
| POSTER | **SHIP** | Unchanged. |

Suite: 182/182 (including my 2 new `it.fails`). Build clean. I diffed my test files: since my last gate the lanes changed only the two `it.fails` to `it()`. No console errors and no overflow at 1280 or 375 across 7 inputs x 2 widths.

## Verified in the real app (screenshots `r11s2c-{1280,375}-{promise,halls,starbucks,mixed,good,pledge,zorblax}-{insight,autopsy}.png`)

| Input | Score | Diagnosis | Mirror / Buried Lede / Autopsy | Verdict |
|-------|-------|-----------|--------------------------------|---------|
| Northfield Promise paragraph | 93 | "You open with 'Northfield Promise covers tuition for 1,200 Ohio families', which is the move..." | Proof-first / policy lede / no tags | **MF-R1 fixed** |
| Smith Hall | 61 | hedged | Place 6% / no lede / "ORPHANED PROMISE + PROOF: NONE" only | **MF-R2 fixed** |
| Starbucks | 49 | hedged | no lede / "ORPHANED + PROOF: RESTATES THE CLAIM" | fixed |
| Mixed sample | 62 | Pierogi Society line | career 39% / Pierogi / "EVIDENCE FOR 03" on the Ruiz sentence | correct |
| Good sample | 89 | "which is the move" | "You did not lead with a promise. You led with proof." / requirement lede | correct, consistent |

## Fresh adversarial inputs

1. **`We pledge to help every student succeed. Our vibrant community welcomes you.` scores 34, Haunted.** Diagnosis: "You open with 'We pledge to help every student succeed', which is the move: most schools open with a promise, you opened with the proof." Buried Lede: "a published policy, with terms anyone can check." **The Mirror on the same page says "You lead with belonging and community."** `r11s2c-375-pledge-insight.png`. Also `We have transfer agreements with many schools.` is crowned as a policy (39). **MF-F1, MUST-FIX.** Cause: 876ebc0 added bare `pledge` and `transfer agreements?` to the w3 `policy` pattern in `details.js` with no detail requirement. Fix: set `needsDetail: true` on those alternatives, or require a number or a named partner. I checked that the pledge sentence has spec weight 0, so `needsDetail` alone clears it. Pinned by 2 `it.fails`.
2. `Zorblax Quinterfield met Plimbo Varnashire at Grelk Hall...` scores 66, Breathing: "1 of 2 sentences are yours and the detail is spread thin, so pick the best one and put it first." Mirror: no lead promise. Consistent and hedged. Fake names remain the known limit (sprint 1, call 2).
3. Junk (`123 456 789` = 0, phone junk = 23) gets "One line, and any school could sign it." / "We could not find anything here that is only yours". The new survivors=0 template does not fire on junk. Fine.

## MUST-FIX

1. **MF-F1:** the `pledge` / `transfer agreements` policy lede (above). One regex. With it fixed, ENGINE is SHIP. Re-gate scope is the two MF-F1 tests and one pledge run in the app.

---

# Sprint 2 re-gate (HEAD fa5b540)

## Final verdicts

| Lane | Verdict | Why |
|------|---------|-----|
| ENGINE | **NOT YET** (one small fix) | All six earlier sprint-2 must-fixes are fixed and verified. One new self-contradiction remains on good copy: MF-R1. |
| EXPERIENCE | **NOT YET** (one-line fix) | The good sample's Mirror now praises proof-first, and "adeo's" is lowercase. But the Autopsy shows **PROOF** and **PROOF: NONE** on the same sentence: MF-R2. |
| DATA | **SHIP** | PROVENANCE count is fixed (347). Unchanged otherwise. |
| POSTER | **SHIP** | Unchanged. |

Suite: 178/178 pass, `vite build` clean. No console errors and no horizontal overflow at 1280 or 375 on any of the 7 runs.

## MUST-FIX (both small)

1. **MF-R1 (ENGINE, `insight.js` diagnosisLine, final branch): a 93 "Unmistakable" paragraph is told "We could not find a detail only you could write: 0 of 3 sentences would survive a logo swap."** The colon offers "0 survivors" as evidence of the opposite. The input is realistic: `Northfield Promise covers tuition for 1,200 Ohio families. 98 percent of them graduate. Since 2015, 6,400 students have used it.` It is reached when every sentence is non-swappable, there is no lede, and `describesHow` blocks the "All receipts" line (a POLICY word such as covers tuition, pledge or policy). Also hit by `Our policy: 412 families paid nothing in 2025. ...` (95). Fix: when `survivors === 0`, never use the "could not find... N of M survive" template; say something like "Every sentence is yours; we just could not pick one to promote." Pinned by `it.fails` MF-R1 in `insight.review.test.js`. Screenshot: `r11s2b-1280-promise-insight.png`.
2. **MF-R2 (EXPERIENCE, `Autopsy.jsx` tag row): "ORPHANED PROMISE · PROOF · PROOF: NONE" on one sentence.** The bare `Proof` tag still reads `s.isProof` (a name or a number), while ORPHANED and "Proof: X" now come from proofKind. Seen on `Smith Hall, Jones Center and the Brown Quad...` and on the Starbucks sentence ("PROOF · PROOF: RESTATES THE CLAIM"). Any real copy with a proper noun inside a cliché sentence will show it. Fix: drop the bare `Proof` tag on promise sentences (or rename it "Specific"). Screenshot: `r11s2b-375-halls-autopsy.png`.

## Ruling on the edited pins (AVERAGE 54 to 50, PROGRAM 71 to 67)

**They stand, but on substance, not on process.** I traced the cause: in AVERAGE, the one promise (s2, small classes) was previously "backed" by "more than 40 majors" in s3. Now a bare number is not a mechanism, so it is orphaned (proof subscore 60 to 0). In PROGRAM, s2 "dedicated faculty mentor students" was "backed" by an employer list in s3; it is now orphaned (80 to 30). Both are what MF-S6 asked for. AVERAGE 50 now matches the fixture's own stated target ("~50"). The calibration ranges in engine.test.js (45-58, 60-78) were not touched.

**Process:** this is the second time the engine lane has edited R11-owned pins instead of sending them. The comment even says "R11 to confirm". Next time it gets reverted on sight.

**Contract:** `promiseProof.proofs` now counts evidence sentences that back a promise, not proof sentences, and `orphans` now means "no mechanism-grade proof", not "no proof in the same or next sentence". That is a semantic change to a frozen field. The TL should add it to CONTRACT.md as Amendment 3.

## Re-run: old adversarial set (all earlier sprint-2 bugs)

| Input | Before | Now |
|-------|--------|-----|
| Good sample, Mirror | "We could not find a lead promise... a reader cannot repeat what you did not say" | **"You did not lead with a promise. You led with proof. Most schools do the opposite: 53%... lead with access and affordability."** Agrees with the Diagnosis |
| No-tuition paragraph (90) | "All receipts... none says how anything works" / "Nothing only you could say" | **Lede = the policy, "a published policy, with terms anyone can check"**, "You open with... which is the move" |
| Smith Hall / Jones Center | crowned "a named program" | No lede. Line hedged ("we could not find a detail"). Score 65 to 61 |
| Student Recreation Center / Johnson Center | crowned | No lede |
| `must register by August 1` / bookstore sale | crowned / fragment | No lede |
| Starbucks proof kind | "A real mechanism" | "Restates the claim" / none (but see MF-R2) |
| Nursing clinicals / 48-hour grading | "There is no detail here" | Lede = "Faculty grade every lab report within 48 hours" (structure) |
| MIXED, PROGRAM, GENERIC, STATS, SPECIFIC | | Unchanged and correct |

Every negative line is now hedged ("we could not find"). No line asserts an absence.

## Three-plus new adversarial inputs (never used before)

| Input | Score | Result | Verdict |
|-------|-------|--------|---------|
| `Our faculty include 4 Nobel laureates. Researchers here won $412 million in NSF and NIH grants last year. 91 percent of graduates are employed within six months.` | 95 | "All receipts, no story: ... we could not find one that says how anything here works." Mirror: proof-first | Correct, hedged, funny |
| `Start here, finish anywhere. Credits transfer to all 14 state universities through our guaranteed transfer agreement. Classes cost $142 per credit hour.` | 73 | No lede; "We could not find a detail only you could write: 1 of 3..." | Hedged; misses a real policy (the policy pattern lacks "guaranteed transfer"). SHOULD-FIX |
| `We are not a world-class university. We do not have a vibrant community. We have 12 students and a goat named Kevin.` | 43 | "You lead with prestige and rankings, like 11%..." | Negation is not understood. Funny, not harmful |
| `Every first-year spends a week at the Kessler Farm, and the dining hall serves what they grow. ...` | 53 | **No lede.** "dining hall" in `TRIVIA` vetoes the whole sentence | Hedged, but a real lede is lost. SHOULD-FIX (`it.fails` SF-R2) |
| `Rooted in the Catholic faith since 1872, ... Every student takes two theology courses and serves 40 hours in Toledo.` | 93 | Lead tradition (13%); lede = the requirement | Correct |
| `Northfield Promise covers tuition for 1,200 Ohio families. ...` | 93 | **MF-R1** | Contradiction |

## Mutants on the changed code (details.js, insight.js, index.js)

16 new mutants (R01-R16) on the fix commits. **Shipped tests caught 9/16. With my review tests: 15/16.** R12 (dropping the `TRIVIAL_FIRST` guard) is equivalent: `findDetails` already returns `[]` for trivia, so `per[0].detail` is 0 either way. The guard is dead code.

| R01 trivia filter | R02 facility needs activity | R03 geo needs activity | R04 must w1.5 | R05 fragment to sentence | R06 policy weight | R07 clinical/48h structure | R08 Starbucks not mechanism |
|---|---|---|---|---|---|---|---|
| caught | caught | **killed (new)** | **killed (new)** | caught | caught | **killed (new)** | caught |
| **R09 next-sentence evidence** | **R10 describesHow** | **R11 proof_first** | **R12** | **R13 restated is orphan** | **R14 next-sentence weight** | **R15 first-sentence proof** | **R16 new ORG words** |
| caught | **killed (new)** | caught | equivalent | caught | caught | **killed (new)** | **killed (new)** |

Also: two of my sprint-2 `it.fails` tests went vacuous when the fix changed the line wording (`/none says how anything here actually works/`, `/^There is no detail here.../`). I tightened them to assert substance (the lede kind is `policy` or `structure`). The earlier insight mutants I01-I13 and D01-D08 still die. I03, D10 and R12 are equivalent. D03 is killed by a new mechanism-without-detail test, because the "must" weight change made my old D03 test vacuous.

## Screenshots (`/tmp/claude-0/-home-user-creative-sparks/bce4c815-597f-5f19-a512-b5e87bbbc188/scratchpad/`)

`r11s2b-{1280,375}-{bland,mixed,good,halls,promise,starbucks,notuition}-insight.png`, `r11s2b-{1280,375}-{good,halls}-poster.png`, `r11s2b-{1280,375}-halls-autopsy.png`. I looked at: good 375 (Mirror agrees with the Diagnosis), notuition 1280 (policy lede), promise 1280 (MF-R1), halls autopsy 375 (MF-R2).

## SHOULD-FIX (re-gate)

- `TRIVIA` vetoes whole sentences. Scope it to the clause, or require trivia to be the subject.
- The policy pattern misses "guaranteed transfer", "covers tuition", "pledge".
- Mirror proof-first subline: "Most schools do the opposite: 53%... lead with access" offers one theme's share as evidence for "most". Every school in the sample had a lead promise by construction, so it is true but loosely supported. Consider "The most common lead among the 150 schools we read is access and affordability (53%)."
- Negation ("We are not a world-class university") is read as the cliché. Acceptable for a light tool.
- Earlier SHOULD-FIX items (example curation, theme keywords, nav lines as sentences) are still open.

---

# Sprint 2 gate: the insight layer (HEAD b629c94)

## Verdicts

| Lane | Verdict | Why |
|------|---------|-----|
| ENGINE (insight.js, details.js) | **NOT YET** | It confidently tells a projector false things. It crowns building names as "a named program" and a registration deadline as "a requirement every student does". It tells the best paragraph I wrote that "none says how anything here actually works". |
| EXPERIENCE (Diagnosis, Mirror, Buried Lede) | **NOT YET** | On the **"Try a good one" sample** the Mirror says "We could not find a lead promise... a reader cannot repeat what you did not say", directly under a Diagnosis praising it. On a 90-scoring paragraph the page shows "Unmistakable" and "Nothing only you could say" together. Every run prints "FROM adeo'S BLANDING RESEARCH". |
| DATA (corpus.json, build-corpus.py) | **SHIP** | Deterministic, every number I recomputed from the T0 files matches, and all 40 quotes are verbatim. One doc inconsistency and some curation items (below). |
| POSTER | **SHIP** | Unchanged. Renders for all samples and the adversarial inputs. |

Baseline: `npx vitest run` 161/161 pass (4 files, including my 7 `it.fails` projector bugs). `vite build` is clean (363 kB JS / 122 kB gzip). No console errors and no horizontal overflow at 1280 or 375 on any of the six runs.

## MUST-FIX before AMA (ranked)

1. **MF-S5 (EXPERIENCE + ENGINE): the best copy gets scolded.**
   - *Try a good one* (Harrow, 89 Unmistakable): the Diagnosis says "you opened with the proof". Directly below, the Mirror says "We could not find a lead promise. Nothing in this copy reads as a clear first promise. That is its own finding: a reader cannot repeat what you did not say." (`Mirror.jsx` `none` branch; `lead.confidence === 'none'` because proof-first copy has no `isPromise` sentence.)
   - No-tuition paragraph (`If your family earns under $80,000 a year, you pay no tuition. That has been true since 2019, and 1,140 students used it this fall.`) scores 90 "Nobody else could have written this. Frame it." It also gets "All receipts, no story: ... none says how anything here actually works" (`insight.js` diagnosisLine, the `proofs >= ceil(0.6n) && survivors === 0` branch) and Buried Lede "Nothing only you could say."
   - Three panels contradict the score on the copy we most want to praise. Fix: when there is no promise but the copy is proof (score >= 75 or `survivors === 0`), the Mirror should say something like "You skipped the promise and went straight to proof. Most schools do the opposite." Gate the "All receipts" line on the absence of a mechanism/policy (POLICY regex already exists in insight.js), and let `published_policy` count as a lede kind in details.js.
2. **MF-S1 (ENGINE, details.js `ORG`): buildings, rec centers and libraries are "named programs".** `ORG` includes Hall, House, Center, Library, Museum, etc.
   - `Smith Hall, Jones Center and the Brown Quad are at the heart of campus.` gives the Diagnosis "You open with Smith Hall, which is the move: most schools open with a promise, you opened with the proof." The Buried Lede says "It is a named program, not an adjective." The score is 65 Breathing.
   - `...includes a Starbucks, a Chick-fil-A and the Student Recreation Center` crowns "the Student Recreation Center".
   - `Visit the Johnson Center, the Miller Library...` crowns "the Johnson Center".
   - Fix: drop building nouns (Hall, House, Center/Centre, Library, Museum, Theater/Theatre, Studio) from `ORG`, or accept them only together with a verb of activity in the same sentence.
3. **MF-S2 (ENGINE, details.js `PATTERNS`): trivial rules and events are crowned.**
   - `Students must register for classes by August 1.` gives "a requirement, something every student actually does", plus the "you opened with the proof" line.
   - `Every year since 1985, the bookstore has held a sale in May.` gives "a ritual with a start date", and the detail shown in 5xl type is the dangling clause "Every year since 1985" (`clauseAround` cut at the comma).
   - Fix: never let the `must` requirement pattern alone produce a lede (needsDetail is satisfied by any date). When a clause has fewer than 5 words, extend it to the whole sentence.
4. **MF-S6 (ENGINE + EXPERIENCE): "Proof: A real mechanism" on a Starbucks.** `proofKindFor` falls back to `operating_mechanism` whenever `isProof` is true, and any proper noun makes `isProof` true. So `Our vibrant community includes a Starbucks...` and `Smith Hall, Jones Center...` are tagged **PROOF: A REAL MECHANISM** in the Autopsy. Fix: the fallback should be a neutral label (for example "A name or a number") unless `findDetails` returned a mechanism, structure, requirement or ritual.
5. **MF-S4 (ENGINE, diagnosisLine): "There is no detail here only you could write" is stated as fact when it only means the detector found nothing.** `Nursing students start clinical rotations in their first semester instead of their third. Faculty grade every lab report within 48 hours.` gets exactly that line. The mechanism verb list misses "start" and "grade". The Buried Lede panel already hedges ("We did not find it on this page"); the line should too ("We could not find a detail only you could write").
6. **MF-S7 (EXPERIENCE, Mirror.jsx footer): "FROM adeo'S BLANDING RESEARCH".** The `normal-case` span wraps only `adeo`, so the `'s` is uppercased. It shows on every run (`r11s2-1280-good-insight.png`). Move the `'s` inside the span.

Items 1, 2, 3 and 5 are pinned by `it.fails` tests in `src/engine/insight.review.test.js`. Flip each to `it()` when it is fixed.

## Fooling the buried lede and the diagnosis (engine called directly; the starred rows were also run in the browser)

| Input | Score | Diagnosis line / buried lede | Verdict |
|-------|-------|------------------------------|---------|
| MIXED sample* | 62 | "...the Competitive Pierogi Society, is stuck in sentence 2 behind 'vibrant community'." | Correct, and the best line in the product |
| PROGRAM fixture | 71 | "...the Pelican Point Field Station, shows up one sentence too late." | Correct |
| Mechanism, no proper noun: `every first-year takes the same two seminars, taught by pairs of professors...` | 42 | Lede = that clause, "waits until sentence 3 of 4" | Correct |
| Mechanism, no proper noun: nursing clinicals in semester 1, lab reports graded in 48 hours | 47 | "There is no detail here only you could write" | **Wrong, stated as fact** (MF-S4) |
| `Our vibrant community includes a Starbucks. ...` | 42 | No lede; Autopsy tag "Proof: A real mechanism" | Lede right, tag wrong (MF-S6) |
| `...a Starbucks, a Chick-fil-A and the Student Recreation Center` * | 53 | Lede "the Student Recreation Center", "a named program" | **Wrong** (MF-S1) |
| `Smith Hall, Jones Center and the Brown Quad are at the heart of campus.` * | 65 | "You open with Smith Hall, which is the move" | **Wrong, total confidence** (MF-S1) |
| `Every student gets a free T-shirt at orientation.` | 44 | No lede | Correct |
| `the only university in the county with a Panera` | 54 | No lede | Correct |
| `first college in the state to offer online parking permits` | 36 | No lede | Correct |
| `Students must register for classes by August 1.` | 50 | "You open with 'Students must register...', which is the move" | **Wrong** (MF-S2) |
| `Every year since 1985, the bookstore has held a sale in May.` | 56 | Lede "Every year since 1985", "a ritual" | **Wrong + fragment** (MF-S2) |
| Tagline `Where Leaders Begin.` | 31 | "One line, and it is career outcomes: the lead promise at 39% of the schools we read." | OK. "a lead promise" would be more exact |
| Tagline `Rise.` / `Affordable. Accessible. Excellent.` | 49 | "One line, and any school could sign it." / "Nothing here is only yours." | Correct |
| `The only college where every student rows.` | 45 | "you opened with the proof" | A claim, not proof. Minor |
| No-tuition policy paragraph* | 90 | "All receipts, no story... none says how anything here actually works" | **Wrong** (MF-S5) |
| STATS fixture | 92 | "All receipts, no story" | Correct, and funny |
| 27-line homepage paste (nav, news, footer) | 45 | Lede "Lake Erie" (from a news headline), "behind 16 sentences any school could sign" | Defensible. Nav items ("Apply Now", "Give") count as sentences. SHOULD-FIX |
| `We are not like other schools.` + clichés | 32 | "You lead with career outcomes... every sentence would survive a logo swap." | Correct |
| Spanish copy | 49 | "Nothing here is only yours." | English-only. Acceptable |

Grammar: every line I generated (about 40) was one well-formed sentence with no dashes. The only awkward ones were "waits until sentence 2 of 2" and "the lead promise at 39%".

## Corpus honesty

- **Determinism:** I ran `python3 -I src/corpus/build-corpus.py /home/user/blanding-t0 <out>` twice. Both outputs and the committed `corpus.json` have the same SHA-256 (`f7615d1d...`).
- **Spot checks, recomputed independently from the T0 files (not with the build script).** All match:

| Number | Corpus | My recount from T0 |
|--------|--------|--------------------|
| Schools with an agreed promise | 150 | 150 (151 keys, 1 empty) |
| Access/affordability | 80, 0.533 | 80 / 150 |
| Career outcomes | 59, 0.393 | 59 / 150 |
| Support backed | 0.781 | 271 / 347 |
| Proof spans, operational_practice | 130 of 582 | 130 of 582 (all 7 kinds match) |
| Proof location | 11 / 160 / 68 of 239 | 11 / 160 / 68 of 239 |

- **Doc inconsistency (SHOULD-FIX):** `PROVENANCE.md` says support is over **344** promises (269/36/39), copied from the stale T0 `_meta`. The data and `meta.sampleNote` use **347** (271/37/39). T0's own `_meta.agreed_types` is also stale (access 79, purpose 30, rigor 5 vs 80/31/6 in the per-school data). The shares are right; fix the PROVENANCE sentence.
- **"Lead with" wording is supported.** T0 `config/promise_rules_v3.md` defines 0 to 3 "lead promises" per school, and `SPEC.md` uses "41% lead with the same promise". So "39% of the 150 schools we read lead with the same promise" is what was measured: share of schools with an agreed lead promise in that theme. A school has 1 to 3 of them, so the shares sum to 231%. Nobody should add them up on stage.
- **"About 1 in 5 pieces of 'evidence' just restated the claim"** (Autopsy): 109/582 = 18.7%. Accurate. Spans from both readers are counted, as PROVENANCE says.
- **"Of 239 concrete details our readers found across 150 schools, 11 were on a homepage. The rest were one or two clicks down."** (Buried Lede): this matches T0 `details` depth 0/1/2, and it says "found", not "exclusive". Accurate.
- **Examples:** all 40 are verbatim agreed quotes. I traced each to exactly one source school. One differs only by a newline that was normalized. None names a school. Curation issues for Tracey's skim (not false, but they will read badly or be recognizable on a projector):
  - *Recognizable slogans:* "Dream it, learn it, do it." (alma.edu), "Discovery is not a solo sport." (osu.edu), "In a world of the common, we are the uncommon." (vcu.edu), "Leaving your comfort zone to land somewhere better." (ncsu.edu), "Big enough to take you anywhere." (ucwv.edu). A room of higher ed marketers may recognize these.
  - *Context-dependent fragments:* "One that is poised for growth, innovation, and opportunity." (purpose), "That means we are dedicated to..." (career; **shown on the bland sample**), "It's not just our motto, it's our practice." (hands-on).
  - *Off-theme:* "Here, you're surrounded by people who genuinely care..." is filed under tradition/faith but reads as belonging. "One that is poised for growth, innovation..." is filed under purpose.

## Theme classifier (30 sentences I wrote, 10 per theme)

| Theme | Right | Abstained (null) | Wrong |
|-------|-------|------------------|-------|
| Access and affordability | 5 | 4 | 1 ("within reach for every family" was read as belonging) |
| Career outcomes | 7 | 3 | 0 |
| Belonging and community | 7 | 3 | 0 |
| **Total** | **19/30 (63%)** | 10 | 1 |

Precision is 19/20 when it answers. It fails safe (abstains) far more than it mislabels. The misses are keyword gaps: "price", "paying for", "full demonstrated need", "resume", "recruiters", "friendships", "each other".

## Mutation testing, sprint 2

23 mutants on `insight.js` (13) and `details.js` (10), one at a time, file restored after each, `git diff src/engine` empty afterwards. **Shipped suite: 4/23 caught.** The insight tests check shapes, not decisions. I added kill tests in `src/engine/insight.review.test.js`. **After: 21/23.** The 2 survivors are equivalent: I03 (every detail weight is at least 2, so a lede threshold of 2 vs 1 cannot differ) and D10 (ORG/GEO need capitals, so an uppercase-token guard is redundant).

| | I01 lead threshold | I02 early boundary | I04 cliché nudge | I05 lede tie order | I06 kind order | I07 evidence backward | I08 restated any theme | I09 example rotation | I10 pct floor | I11 receipts ignores survivors | I12 behind-count | I13 firsts quoted |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| shipped | miss | miss | miss | miss | miss | **caught** | miss | miss | miss | miss | miss | miss |
| + review | caught | caught | caught | caught | caught | caught | caught | caught | caught | caught | caught | caught |

| | D01 program weight | D02 generic firsts | D03 needsDetail | D04 clause cut | D05 multi-kind bonus | D06 "the" prefix | D07 tie order | D08 no-majors | D09 place weight |
|---|---|---|---|---|---|---|---|---|---|
| shipped | **caught** | **caught** | miss | miss | miss | miss | miss | **caught** | miss |
| + review | caught | caught | caught | caught | caught | caught | caught | caught | caught |

Sprint 1 mutant set (46) re-run on HEAD: 44/46 before, **45/46 after**. M10 had come back to life: my sprint-1 test compared `r.diagnosis` to `{title, tagline}`, and Amendment 2 added `line`, so the test passed vacuously. I fixed the assertion in `engine.review.test.js`. M09 is still equivalent.

## SHOULD-FIX

- PROVENANCE.md: 344 vs 347 (above).
- Curate the slogan and fragment examples (above). A human skim before AMA, as PROVENANCE itself advises.
- Theme keywords: price, paying, demonstrated need, resume, recruiters, friendships.
- Homepage paste: nav and footer lines ("Apply Now", "Give", "Privacy Policy | Accessibility") count as sentences and as "sentences any school could sign".
- The Autopsy "Proof: X" tag on sentence i can describe evidence that sits in sentence i+1. Add "(next sentence)".
- "Where Leaders Begin." gives "the lead promise at 39%"; "a lead promise" is more exact.

## Screenshots (scratchpad `/tmp/claude-0/-home-user-creative-sparks/bce4c815-597f-5f19-a512-b5e87bbbc188/scratchpad/`)

`r11s2-{1280,375}-{bland,mixed,good,halls,starbucks,notuition}-insight.png`, `r11s2-{1280,375}-{good,halls}-poster.png`. The key ones are `r11s2-1280-good-insight.png` (Mirror contradiction plus "adeo'S"), `r11s2-375-halls-insight.png` (Smith Hall crowned) and `r11s2-375-notuition-insight.png` (90 Unmistakable next to "Nothing only you could say").

## Not verified (sprint 2)

- T0 example quotes in their original page context, beyond tracing each to its school.
- Whether T0's Haiku-labelled proof kinds are themselves right (PROVENANCE flags this).
- Rival Séance and three-things flows on the new build. Unchanged code paths, not re-driven this round.
- Safari, Firefox, the real projector, offline.

---

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
