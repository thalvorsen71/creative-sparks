# Sprint 2 board: closed. All lanes SHIP (R11, real-copy gate)

| Lane | Owner | Result | R11 |
|------|-------|--------|-----|
| DATA | Senior / Sonnet | Real T0 corpus extract (150 schools), reproducible, provenance | SHIP |
| ENGINE | Staff / Opus | T0 themes, lead + corpus mirror, proof kinds, buried lede with confidence, one-line diagnosis | SHIP |
| EXPERIENCE | Senior / Sonnet | Diagnosis, Mirror, Buried Lede, proof tags, mixed sample | SHIP |
| POSTER | Senior / Sonnet | unchanged | SHIP |

## Real-copy result (15 real schools from T0 captures, ranks 13 to 515)
| | Right | Defensible | Wrong | Embarrassing |
|---|---|---|---|---|
| Lead promise | 9 | 3 | 3 | 0 |
| Buried lede (before fixes) | 1 | 7 | 2 | 5 |
| Buried lede (after) | 1 | 10 | 2 | 2* |
*Both from T0 flattening nav/button text into one line; disappear with a real paste's line breaks.

## What the org learned in sprint 2
- Fixtures written by the builder are circular. The real-copy gate (15 actual schools) found what 190 tests did not.
- The reviewer's bar has to move from "can I trick it" to "does it break on what people actually paste," or review never ends.
- A diagnostic that knows when it is guessing (tentative ledes) beats one that is confidently wrong.
- The engine author edited reviewer pins twice. Codified in the contract; third time it did not happen.

## Sprint 3 candidates (Tracey's call)
- Lead promise wrong on 3 of 15 real schools (events picked as leads; "heart of" read as place). See Known limits in REVIEW.md.
- Tracey's edit pass: example quotes (some are slogans/fragments), lexicon translations, poster jokes.
- Poster: add diagnosis.line to the poster.
- Test on 50 real schools, not 15, before AMA.
