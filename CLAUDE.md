@AGENTS.md

# Creative Sparks: rules for agents

This repo is a personal prototype playground: one Next.js app that holds many small, self-contained prototypes. The owner asks for new prototypes in plain language, often from a phone, and opens the result from a preview link. Your job is to make each one fast, consistent, and impossible to break the rest of the site with.

Read this whole file before you touch anything. The rules in sections 2 and 3 are non-negotiable. `npm run check` enforces some of them; you are responsible for all of them.

---

## 1. How to create a prototype, start to pull request

Prototypes are only ever created by an agent editing this repo. There is no "new prototype" button and no create API. Do not build one.

1. **Branch.** Work on a branch, never on `main`.
2. **Pick a slug.** Lowercase kebab-case, e.g. `tide-clock`. It becomes the URL: `/prototypes/tide-clock`.
3. **Create the folder** `app/prototypes/<slug>/` with at least:
   - `page.tsx`: thin entry, about 60 lines at most. Usually just renders one root component.
   - `metadata.json`: see section 2.
   - `HOW_IT_WORKS.md`: see section 2.
   - `types.ts`, `data.ts`, pure logic files, and one file per meaningful component.
4. **Copy the shape of `app/prototypes/flow-field/`.** It follows every rule here. Read it first.
5. **Do not add chrome.** `app/prototypes/layout.tsx` already renders the back link, the title, and the theme toggle. Your page starts below that.
6. **API routes**, if needed, go in `app/api/<slug>/...`. Use the slug as the first path segment; the password gate relies on it.
7. **New dependencies** are installed at the repo root (`npm i <pkg>`).
8. **Look at it.** Run `npm run dev` and check the page at 375px wide and at desktop width, in light and dark. Use Playwright to take screenshots if you cannot see a browser.
9. **Capture thumbnails**: `npm run thumbnails -- <slug>`. Open both images and confirm they show the real thing.
10. **Verify**: `npm run verify` (lint, type-check, rules check, production build). All four must pass.
11. **Commit** code, thumbnails, and docs together. Push. Open a pull request.
12. **Post the preview link** for the prototype (`<preview-url>/prototypes/<slug>`) as the last thing you say, so the owner can tap it.

Editing an existing prototype: same loop from step 8, plus bump `updatedAt` and update `HOW_IT_WORKS.md`.

---

## 2. Rules for every prototype

### Metadata

Every prototype has a `metadata.json` with exactly these fields:

```json
{
  "title": "My Prototype",
  "description": "What it does",
  "tags": ["tag1"],
  "createdAt": "YYYY-MM-DD",
  "updatedAt": "ISO timestamp",
  "hidden": false,
  "public": false
}
```

- Bump `updatedAt` to the current ISO timestamp on **every** edit. The gallery sorts by it.
- `hidden: true` keeps it out of the gallery unless the Hidden toggle is on.
- `public` stays `false`. See Privacy below.

### Documentation

Every prototype has a `HOW_IT_WORKS.md`, updated in the same commit as any change:

- **What It Does**: 1 to 2 sentences
- **Architecture**: ASCII data-flow diagram
- **Frontend / API**: bullets on state, shortcuts, responsive behavior, request and response shapes
- **AI Usage** (only if a model is called): model ID, why that model, how it is called, key parameters, system prompt summary, user prompt shape
- **Key Dependencies**, **Component Tree**, **Error Handling**, **File Structure**

### Self-contained and decomposed

- A prototype lives entirely in its own folder. It never imports from another prototype.
- It may import shared code: `components/ui`, `components/controls`, `components/site`, `lib`.
- Never write one giant file. Keep `page.tsx` thin (about 60 lines; the check fails above 80) and split out:
  - `types.ts`: shared types
  - `data.ts`: mock data, constants, config
  - pure logic files (`search.ts`, `utils.ts`): testable without React
  - one file per meaningful UI component, named for what it is

### Design system

- Always use the shared components in `components/ui` and the design tokens: `bg-background`, `text-foreground`, `bg-card`, `bg-muted`, `text-muted-foreground`, `bg-primary`, `text-primary-foreground`, `border-border`, `text-destructive`, and so on.
- Never hardcode colors: no `bg-black`, no `text-white`, no palette classes like `bg-zinc-900`, no hex values, no inline color styles. The check script fails on these.
- Canvas and WebGL are the one exception, because they cannot use classes. Read the color from a token (`getComputedStyle(el).backgroundColor` on an element with a token class) or compute it from a control value. See `flow-field/flow-canvas.tsx`.
- **Check the component source before assuming a prop exists.** These are shadcn/ui components built on **Base UI, not Radix**. There is no `asChild`; composition uses the `render` prop. Open the file in `components/ui/` and read it.
- `components/ui` is vendored. Do not restyle it for one prototype. Pass `className` instead.

### Clean and minimal by default

- Start with a single centered column: `max-w-2xl mx-auto`. No sidebars, split panels, or tab-heavy layouts unless asked. (The control panel layout below is the one built-in exception.)
- Build only what was asked for. No extra dashboards, charts, settings, or views.
- Fewer elements is better. Every element must justify its existence. Plain badges (`variant="outline"`) over colorful ones. No decorative icons.
- Minimal interface copy. Cut captions that restate labels and hints nobody needed.

### Control panels

- Anything with tunable parameters (speed, color, size, count) gets a control panel, never scattered inputs.
- Use the shared library in `components/controls`:

  ```ts
  // data.ts
  export const controls = defineControls({
    speed: { type: "range", label: "Speed", min: 0, max: 3, step: 0.1, default: 1 },
    mode: { type: "select", label: "Mode", default: "a", options: [{ value: "a", label: "A" }] },
    loop: { type: "toggle", label: "Loop", default: true },
  });
  ```

  ```tsx
  const controls = useControls("<slug>:controls", schema); // typed values, persisted
  return <ControlLayout controls={controls}>{subject}</ControlLayout>;
  ```

- That gives you the panel, persistence, Reset, and **Randomize** for free. Every control panel has Randomize next to Reset. Do not remove it. Use `randomize: false` on a control that should not be shuffled.
- `ControlLayout` puts the panel beside the subject from `lg` up and in a bottom sheet on smaller screens, so it never covers the subject. Do not build your own placement.
- Need a control type that does not exist? Add it to `components/controls` (schema, sanitize, randomize, field) so every prototype gets it.

### Mobile first

- Everything must work at about 375px wide. Check `document.documentElement.scrollWidth <= innerWidth`.
- Tap targets are at least 44×44px. Add the `tap` utility class to buttons and toggles; it enforces the minimum on touch and narrow screens. Inputs: `h-11 sm:h-9`.
- Toolbar and header buttons are icon-only on mobile, with labels from `sm:` up (`<span className="hidden sm:inline">`), and always carry an `aria-label`.
- No hover-only interactions. Every hover state needs a visible touch equivalent.
- Code blocks wrap. No horizontal scrolling anywhere.
- Modals and lightboxes need visible prev/next buttons or swipe on mobile, not only keyboard shortcuts.

### Light and dark mode

- Design dark-first. Light mode must also work, through tokens.
- Never hardcode a `dark` class on a page. The theme is global (`next-themes`, class on `<html>`).
- Use `useTheme()` / `resolvedTheme` only when behavior, not just color, must change with the theme, e.g. canvas or WebGL colors.
- Theme-dependent icons or images switch with CSS (`dark:hidden` / `hidden dark:block`), never with JavaScript, to avoid a flash.

### Motion

- Rows or sections the user adds or removes animate their height open and closed. Use `<Collapse open={...}>` from `components/site/collapse.tsx`. Nothing pops in and makes the page jump.
- Smooth deceleration only: `ease-out-soft` (`cubic-bezier(0.22, 1, 0.36, 1)`). No bouncy overshoot, no spring wobble.
- Respect `prefers-reduced-motion`. CSS transitions are already neutralized globally in `app/globals.css`. For JavaScript animation use `useReducedMotion()` from `lib/use-reduced-motion.ts` and show a finished still instead.
- Verify animations actually run. Check `getComputedStyle(el).transitionDuration` or `animationName` in the browser. Animation utility classes silently do nothing if their CSS is not imported.

### AI-backed prototypes

- Call models server-side through an API route in `app/api/<slug>/`. Never expose keys to the client. Never use a `NEXT_PUBLIC_` variable for a key.
- Use the Anthropic SDK (`@anthropic-ai/sdk`) with `ANTHROPIC_API_KEY`. Check current model IDs before choosing one; do not trust memory.
- If a model generates UI or layout, put explicit layout constraints in the system prompt (max columns, no wide tables, mobile width). Defensive CSS is a backup, not the fix.
- Parse JSON from model output defensively: extract the first `{...}` block, then `JSON.parse` inside try/catch.
- Wrap every API route in try/catch and return proper status codes (400 bad input, 502 upstream failure, 500 otherwise) with a JSON `{ error }` body.

### Storage

- Use `useStoredState(key, fallback, sanitize)` from `lib/storage.ts`. It wraps every `localStorage` access in try/catch, renders the fallback on the server, and loads the stored value after mount.
- If you must touch `localStorage` directly: always inside try/catch, never during server render.
- Namespace keys per prototype: `"<slug>:<name>"`.
- Always sanitize what you read. Stored data may come from an older version of the prototype.

### Thumbnails

- New prototype or any visual change: regenerate that prototype's thumbnails in the same commit (`npm run thumbnails -- <slug>`).
- Global style change (tokens, fonts, layout chrome, shared components): regenerate all (`npm run thumbnails`).
- Only fill gaps: `npm run thumbnails -- --missing`.
- Open the captured images before committing. A stale or broken thumbnail is worse than none. A missing one falls back to a "No preview yet" tile and never breaks the build.
- The gallery shows static images only. Never embed a live prototype in a card or an iframe. It would boot a full app per card and crash mobile browsers as the gallery grows.

### Privacy

- The whole site is behind a password in production (`proxy.ts`, `app/login`, `app/api/auth`, `lib/auth.ts`). The gate fails closed when `SITE_PASSWORD` is not set.
- Every prototype is **private by default**.
- Make a prototype public **only when the owner explicitly asks for that specific prototype**. Never as a convenience, never for testing, never because it "seems shareable".
- To make one public:
  1. Set `"public": true` in its `metadata.json`. It is then served at `/p/<slug>`, rendering the same component.
  2. **Always** create its share assets: `npm run thumbnails -- --og <slug>`. This writes `public/og/<slug>.png` (og:image) and `public/og/<slug>.mp4` (og:video). The check fails without them. Look at both before committing.
  3. Commit the assets with the flag. The link preview tags are generated from the files at build time.
  4. Post the public link: `<url>/p/<slug>`.
- Private and unknown slugs under `/p/` return the same 404, never a login redirect, so private names do not leak. Do not change that.
- A public prototype's API routes at `/api/<slug>/...` are open to the internet. Validate input and never return secrets.

---

## 3. Workflow rules

- Work on a branch, push, and open a pull request when done. The PR triggers the CI check (`.github/workflows/ci.yml`) and a preview deployment.
- Before finishing, run `npm run verify`: lint, type-check, rules check, production build. Fix what fails. Never skip or disable a check to get green.
- End every task by posting the preview link to the prototype, so the owner can open it straight from their phone. Get it from the deployment comment or status on the pull request. If no preview exists, say so plainly instead of guessing a URL.
- When something goes wrong and gets fixed, add the lesson to section 6 of this file in the same pull request, so it never happens again. This file is meant to grow.

---

## 4. Things to know about this codebase

- **Next.js 16, App Router.** The request interceptor is `proxy.ts`, not `middleware.ts`. Read `node_modules/next/dist/docs/` before using an API you remember from older versions.
- **Tailwind 4.** Tokens and custom utilities live in `app/globals.css`. There is no `tailwind.config`.
- **shadcn/ui on Base UI** (`style: base-nova`). All components are installed. `cn` comes from `@/lib/utils`.
- **Shared helpers**, use these before writing your own:

  | Need | Use |
  |---|---|
  | Control panel | `components/controls` |
  | Persisted state | `lib/storage.ts` `useStoredState` |
  | Height animation | `components/site/collapse.tsx` `Collapse` |
  | Reduced motion | `lib/use-reduced-motion.ts` |
  | 44px tap target | `tap` class |
  | Easing | `ease-out-soft` |
  | Theme toggle | already in the layout; do not add another |

- **How prototypes are discovered:** `lib/prototypes.ts` reads every folder in `app/prototypes/` that has a `metadata.json`. No registry to update.
- **`creative-sparks-starter/`** is the owner's original Vite app, kept for reference. It is excluded from lint and type-check. Do not edit or delete it unless asked.
- **Scripts:** `scripts/thumbnails.mjs` (capture), `scripts/check-prototypes.mjs` (rules check). Both are plain Node, no build step.

---

## 5. Suggested libraries

Add these when a prototype needs them, at the repo root.

| Need | Suggestions |
|---|---|
| 3D / WebGL | three.js, React Three Fiber |
| Physics | Rapier, Matter.js |
| Charts | Recharts (installed), or plain SVG for sparklines |
| Maps | MapLibre GL |
| Text layout / typography effects | `@chenglou/pretext` |
| Audio / synths | Web Audio API, Tone.js |
| AI | Anthropic SDK, server-side |
| Generated UI from JSON | json-render or similar |
| Browser automation | Playwright (installed: thumbnails, visual checks, demo videos) |
| Native app wrapper | Capacitor, if a prototype graduates to the App Store |

---

## 6. Lessons learned

Add to this list whenever a mistake is found and fixed. One line for what went wrong, one for the rule.

- **shadcn is Base UI here, not Radix.** `showSwipeHandle` belongs on `Drawer`, not `DrawerContent`; `asChild` does not exist. Rule: read the file in `components/ui/` before using a prop.
- **Reading a ref during render fails lint** (`react-hooks/refs`), and so does calling `setState` in an effect body (`react-hooks/set-state-in-effect`). Rule: for browser-only values use `useSyncExternalStore` (see `lib/storage.ts`, `lib/use-reduced-motion.ts`); to capture a first-render value use `useState`.
- **Putting live control values in an effect's dependency list restarted the canvas on every slider drag.** Rule: an animation loop reads changing values through a ref; the effect depends only on what truly requires a restart.
- **Alpha-fade trails on a canvas never reach the background** (8-bit rounding) and left a gray haze in light mode. Rule: check canvas work in light mode specifically; see `settle()` in `flow-field/renderer.ts` for the fix.
- **The first thumbnail was captured before a visual fix and went stale.** Rule: capture thumbnails last, after the final visual change, and open them.
- **Share tags are built from files on disk at build time.** Capturing `public/og/*` after the build left the public page without og tags until the next build. Rule: commit the assets, then let the deploy build pick them up.
- **Next does not resolve `og:video` against `metadataBase`.** Rule: pass absolute URLs for videos (see `app/p/[slug]/page.tsx`).
- **`dynamicParams` and an empty `generateStaticParams` do not work with Cache Components.** It is turned off in `next.config.ts`. Rule: do not turn `cacheComponents` on.
- **Controls in a bottom sheet hid Reset and Randomize below the fold.** Rule: primary actions go at the top of a scrolling sheet.
- **A script outside the repo could not import `playwright`.** Rule: keep Playwright scripts inside the repo (or `scripts/`) so module resolution works.
