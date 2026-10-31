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
