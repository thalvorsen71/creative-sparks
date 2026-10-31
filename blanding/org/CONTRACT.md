# Engine contract (frozen for sprint 1)

Owner: Overall Tech Lead. Changes to this file go through the Overall TL, in one message, with a reason.
Every lane builds against this. The stub in `src/engine/index.js` returns this exact shape today,
so nobody waits on anybody.

## `analyze(text, opts?) => Report`

```js
opts = {
  schoolName?: string,               // "Northfield University". Used for logo-swap + specificity.
  rivals?: Array<{ name: string, text: string }>,  // up to 3
}
```

```js
Report = {
  score: number,            // 0-100 integer. Distinction Score. HIGHER = MORE DISTINCTIVE.
                            // Calibration targets (from 300+ real audits): generic institutional
                            // homepage copy lands 35-58; median ~50; specific, proof-heavy copy 75+.
                            // Nothing should hit 100 unless the text is pure proof. Empty text -> 0.
  band: {
    id: 'embalmed' | 'haunted' | 'twitching' | 'breathing' | 'unmistakable',
                            // 0-29 | 30-49 | 50-64 | 65-79 | 80-100
    label: string,          // "Embalmed"
    verdict: string,        // one dry sentence. e.g. "Technically present. Clinically indistinguishable."
  },
  subscores: {              // each 0-100, higher = better
    cliche: number,         // inverse of cliche density
    specificity: number,    // proper nouns, numbers, named programs/places/people per sentence
    proof: number,          // share of promises that are backed by proof
    swap: number,           // share of sentences that FAIL the logo-swap (i.e. are yours)
  },
  stats: {
    words: number,
    sentences: number,
    clicheHits: number,     // total matches
    clicheDensity: number,  // hits per 100 words, 1 decimal
  },
  sentences: Array<{
    i: number,
    text: string,
    cliches: Array<{ id: string, match: string, start: number, end: number }>, // offsets within sentence text
    isPromise: boolean,     // makes a claim/benefit/superlative ("we prepare", "you will", "world-class")
    isProof: boolean,       // contains evidence: number, %, named person/place/program, date, ranking source
    specifics: string[],    // the tokens that made it specific
    swappable: boolean,     // true = would read fine on any school's site
    swapped: string,        // AMENDMENT 1 (after R11): this sentence with the school name (full + stem,
                            // whole words only) replaced by logoSwap.swapName. UI renders this; it does
                            // not re-implement the swap.
  }>,
  cliches: Array<{          // aggregated, sorted by count desc
    id: string,
    phrase: string,         // canonical phrase "vibrant community"
    count: number,
    translation: string,    // what it actually says. "There are people here."
    fix: string,            // a concrete instruction. "Name the club, the night, the headcount."
    severity: 1 | 2 | 3,    // 3 = terminal
  }>,
  logoSwap: {
    swapName: string,       // the rival name used, default "Literally Any University"
    swappedText: string,    // full text with schoolName (if given) replaced by swapName
    survivors: number[],    // sentence indexes that survive the swap unharmed (swappable)
    total: number,
  },
  promiseProof: {
    promises: number,
    proofs: number,
    orphans: number[],      // sentence indexes: promise with no proof in same or next sentence
  },
  rivals: Array<{
    name: string,
    score: number,
    sharedPhrases: string[],// normalized 2-4 word phrases appearing in both (stopwords stripped), max 12
    overlap: number,        // 0-1 Jaccard over content-word trigrams
  }>,
  diagnosis: {
    title: string,          // horror movie title for the poster. "The Sixth Sentence"
    tagline: string,        // "I see dead copy."
  },
}
```

## `checkDistinction(claim, opts?) => { score: number, passes: boolean, reasons: string[] }`

For the "Three things only you can say" exercise. `passes` = score >= 60.
`reasons` are short, human, and specific ("No proper noun. Any school could say this.",
"Contains a number. Good.", "Contains 'vibrant'. Bad.").

## `LEXICON` (named export)

Array of `{ id, phrase, patterns: RegExp[], translation, fix, severity }`.

## Rules

- Pure functions. No network, no DOM. Must run in Node (vitest) and the browser.
- Deterministic: same input, same output.
- Never throws on empty/whitespace/garbage input. Returns score 0 and empty arrays.
- No em dashes anywhere in user-facing strings. Use colons, commas, periods.

---

# AMENDMENT 2 (sprint 2: the insight layer). Owner: Overall TL.

Direction from Tracey: ignore the old T0 rules (score, fixes, jokes all allowed). Make it amazing:
smart, insightful, funny. Insight comes from REAL corpus data, not vibes.

## Corpus file: `src/corpus/corpus.json` (DATA lane owns; engine imports it)

```js
CORPUS = {
  meta: { source: string, schools: number, sampleNote: string, generated: 'YYYY-MM-DD', files: string[] },
  themes: Array<{ id: string,        // T0 theme label, exact, e.g. 'access / affordability'
                  label: string,     // display label, e.g. 'Access and affordability'
                  count: number, share: number,   // share of schools with an agreed lead promise in this theme
                  examples: string[] }>,          // up to 5 REAL verbatim agreed quotes, NO school names
  support: { backed: number, claim_only: number, split: number },   // shares 0-1 of agreed promises
  proofKinds: Array<{ kind: string, label: string, count: number, share: number }>,
  proofLocation: { homepage: number, oneClick: number, twoClicks: number, total: number, source: string },
}
```

## Report additions (ENGINE lane)

```js
Report += {
  themes: Array<{ id, label, sentences: number[] }>,     // T0 theme ids detected, by sentence
  lead: { themeId: string|null, label: string|null, sentenceIndex: number|null, quote: string|null,
          confidence: 'clear'|'weak'|'none',
          corpusShare: number|null,     // CORPUS share for that theme
          examples: string[] },         // up to 3 CORPUS examples for the same theme (deterministic pick)
  promises: Array<{ sentenceIndex, themeId: string|null,
                    proofKind: 'restated_claim'|'operating_mechanism'|'reported_outcome'|'published_policy'
                             |'example_or_story'|'third_party_recognition'|'none',
                    evidenceIndex: number|null }>,
  buriedLede: null | { sentenceIndex, text, detail: string,   // the most distinctive concrete thing
                       position: 'lead'|'early'|'buried',     // first sentence | first third | later
                       why: string },
  diagnosis += { line: string },  // ONE plain-English sentence a VP understands, built from findings.
                                  // e.g. "You lead with affordability, like 53% of schools we read,
                                  // and your best detail, the Competitive Pierogi Society, is buried in sentence 2."
}
```

Rules: deterministic, no network. Distinctive detail means a mechanism, structure, named program, requirement,
place or first: NOT just a number or a proper noun (the lesson of T0 v3). Corpus examples are shown without school names.
