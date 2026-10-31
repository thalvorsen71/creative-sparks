# Blanding 3.0

Paste your copy. Find out if it could belong to anyone.

A browser-only diagnostic for higher ed marketing copy, by adeo. Nothing leaves the browser.
Works offline once loaded.

```
npm install
npm run dev      # http://localhost:5173
npm test         # 103 engine + review tests
npm run build    # static site in dist/, deploy anywhere
```

## What it does

- **Distinction Score** 0-100 with a band: Embalmed, Haunted, Twitching, Breathing, Unmistakable.
- **The Autopsy**: every cliche highlighted, with what it actually says and the fix.
- **The Logo Swap**: your name replaced with "Literally Any University." Count what survives.
- **Promise vs. Proof**: orphaned promises flagged.
- **Rival Seance**: shared phrases with up to three competitors.
- **The Poster**: a downloadable B-movie poster of the diagnosis.
- **Three Things Only You Can Say**: the AMA takeaway exercise, checked live.

## Where things live

| What | Where |
|------|-------|
| Cliche lexicon (87 entries, translations, fixes) | `src/engine/lexicon.js` |
| Poster titles and taglines | `src/engine/titles.js` |
| Poster jokes (rating box, billing, footer) | `src/poster/renderPoster.js` |
| Scoring weights | `src/engine/index.js` |
| How it was built (agent org, contract, review) | `org/` |

Known limit, say it on stage: it checks that you named something, not that it is true.
