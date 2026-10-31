# How this product is built

Modeled on Miguel Ríos Berríos's agents-as-an-engineering-org experiment (Parcha, Oct 2026), with the lessons from it applied up front, not learned the hard way.

```
                    Tracey (CEO, final call)
                           │
              Overall Tech Lead  (Opus, high effort)
     owns: spec, contracts, board, merges, escalations
        ┌──────────────┬──────────────┬──────────────┐
   ENGINE lane     EXPERIENCE lane   POSTER lane     R11 (Staff Reviewer)
   Staff / Opus    Senior / Sonnet   Senior / Sonnet  Staff / Opus
   src/engine/**   src/App.jsx       src/poster/**    runs it, breaks it,
   scoring, lexicon src/components/** horror poster   gates it
```

## Rules of the org

1. **Flat.** Tech lead to engineers. No middle-manager agents. (The article's first casualty was a manager agent that spent its whole life checking in and never heard a message.)
2. **Contracts before code.** `org/CONTRACT.md` is frozen for the sprint. A working stub ships on day zero so no lane waits on another.
3. **File ownership is exclusive.** One lane writes one set of paths. Crossing a lane boundary is a message to the Overall TL, not an edit.
4. **Independently verifiable.** Every lane's work can be tested without the others. Engine has unit tests. UI renders against the stub. Poster renders from a fixture report.
5. **R11 runs it, not reads it.** The reviewer writes a test that fails first, plants small bugs (mutants) to see whether tests notice, and boots the real app. A PASS from R11 means R11 checked it. R11 will not lend its name to work it did not gate.
6. **Escalate, do not guess.** Product, taste, and voice questions go to `org/WAITING-ON-TRACEY.md`, one line per ask. Engineers keep working on whatever is not blocked.
7. **A comment is not a policy.** Feedback on one screen applies to that screen. Nobody turns "no rounded corners here" into a law for the whole codebase.
8. **No padded deadlines, no polling loops.** Done when done. Report when done.
9. **Voice.** No em dashes in any user-facing string. Dry, specific, a little mean to the copy and never to the person.

## Lane briefs

See `org/BOARD.md` for status and `org/PRODUCT.md` for what we are building and why.
