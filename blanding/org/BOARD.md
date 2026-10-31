# Sprint 1 board: closed

| Lane | Owner | Result | R11 verdict |
|------|-------|--------|-------------|
| ENGINE | Staff / Opus | 87-cliche lexicon, proof-aware scoring, rivals, 27 titles, per-sentence swap | SHIP |
| EXPERIENCE | Senior / Sonnet | Full single page, 1280 + 375, keyboard accessible | SHIP |
| POSTER | Senior / Sonnet | Deterministic B-movie poster, triumph mode, download + copy | SHIP |
| R11 | Staff / Opus | 2 gates, 46 mutants (45 caught), adversarial table, 103 tests | n/a |
| Overall TL | Opus | Spec, contract + amendment 1, integration, escalations | n/a |

## Sprint 2 candidates (not started; Tracey's call)
- Vague-noun stoplist: "We have 123 things" still scores 96 (R11 should-fix, pinned with it.fails)
- Scoring floor: Embalmed unreachable, lorem ipsum 49 (WAITING-ON-TRACEY #6)
- Poster download shows no busy state (6.8s headless)
- "A. Smith" initials, ALL CAPS numbers
- Tracey's edit pass on lexicon + poster jokes (WAITING-ON-TRACEY #1, #2)

## What the org learned this sprint
- The reviewer caught the thing that would have embarrassed us on stage (number junk scoring 96). Author tests caught 19/30 mutants. Reviewer tests: 45/46.
- The UI re-implementing engine logic was the integration bug. Fixed at the contract, not patched.
- An author edited the reviewer's pin. It was legitimate this time. Rule going forward: send it to R11, do not edit it.
