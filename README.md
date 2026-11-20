# Creative Sparks

A private playground: one Next.js app holding many small, self-contained prototypes. New prototypes are built by a coding agent, never from inside the app. The agent's rules live in [`CLAUDE.md`](./CLAUDE.md).

## Run it

```bash
npm install
npm run dev          # http://localhost:3000 (no password in development)
```

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Local dev server |
| `npm run verify` | Lint, type-check, prototype rules check, production build |
| `npm run check` | Validates every prototype against the rules |
| `npm run thumbnails` | Captures light and dark gallery thumbnails (see flags in `scripts/thumbnails.mjs`) |
| `npm run thumbnails -- --og <slug>` | Share image and video for a public prototype |

## Deploy

1. Import the repository into Vercel (or any host with per-branch preview deployments).
2. Set `SITE_PASSWORD` for Production and Preview. Without it nobody can sign in.
3. Optionally set `NEXT_PUBLIC_SITE_URL` to the production origin so share links use it.

Every pull request then gets a build check (GitHub Actions) and a preview URL.

## Privacy

- In production the whole site sits behind the password (`proxy.ts`, `/login`, `/api/auth`).
- Every prototype is private. `"public": true` in its `metadata.json` serves it at `/p/<slug>`.
- Private and unknown slugs under `/p/` return the same 404.

## Layout

```
app/prototypes/<slug>/   one folder per prototype
app/p/[slug]/            public route for flagged prototypes
components/ui/           shadcn/ui (Base UI flavor), all components installed
components/controls/     schema-driven control panel with Reset and Randomize
lib/prototypes.ts        discovers prototypes and reads metadata
scripts/                 thumbnail capture and the rules check
creative-sparks-starter/ the original Vite starter, kept for reference
```
