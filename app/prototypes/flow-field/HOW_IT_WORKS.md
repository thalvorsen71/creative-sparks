# Flow Field

## What It Does

Particles drift through a slowly shifting vector field and leave fading trails on a canvas. A control panel tunes the motion and color.

## Architecture

```
data.ts (control schema)
      │
      ▼
useControls ──── localStorage "flow-field:controls"
      │ values
      ▼
FlowField ── seed, paused ──► FlowCanvas
      │                           │ requestAnimationFrame
      ▼                           ▼
ControlLayout                renderer.ts ──► field.ts (pure maths)
(side panel / bottom sheet)       │
                                  ▼
                            <canvas> 2D context
```

## Frontend

- **State**: control values live in `useControls` (persisted). `seed` and `paused` are plain React state in `FlowField`.
- **Animation loop**: `FlowCanvas` starts one `requestAnimationFrame` loop per seed/theme. Slider changes are read through a ref, so dragging never restarts the drawing.
- **Trails**: each frame paints the background at `1 - trail` opacity over the canvas, then draws one short line segment per particle. Segments are batched into 8 color buckets, one canvas path each.
- **Light mode cleanup**: an alpha fade never fully reaches the background on an 8-bit canvas. On light backgrounds `settle()` lifts every channel one level per frame and clamps to the background color.
- **Theme**: the canvas carries `bg-card`; the renderer reads the computed background color, so it follows the tokens. `resolvedTheme` only picks stroke lightness.
- **Reduced motion**: no loop. 240 frames are simulated at once to show a finished still, redrawn when a control changes.
- **Responsive**: canvas is 4:5 on phones, 4:3 from `sm`. Controls sit beside the canvas from `lg`, in a bottom sheet below that. Toolbar buttons are icon-only on phones.
- **Resize**: a `ResizeObserver` restarts the drawing at the new size. Device pixel ratio is capped at 2.

## API

None. Everything runs in the browser.

## Key Dependencies

- `@/components/controls`: control schema, panel, persistence, Reset, Randomize
- `next-themes`: `resolvedTheme` for stroke lightness
- Canvas 2D API

## Component Tree

```
FlowFieldPage (page.tsx)
└── FlowField
    └── ControlLayout
        ├── FlowCanvas
        ├── FlowToolbar
        └── ControlPanel (side on desktop, bottom sheet on mobile)
```

## Error Handling

- Stored control values are sanitized against the schema on load; anything invalid falls back to its default.
- `localStorage` failures fall back to in-memory state (`lib/storage.ts`).
- A missing 2D context or a zero-size canvas skips drawing instead of throwing.

## File Structure

```
flow-field/
├── page.tsx          thin route entry
├── metadata.json
├── HOW_IT_WORKS.md
├── types.ts          FlowParams, Particle, Field, Palette
├── data.ts           control schema, storage key, constants
├── field.ts          pure maths: PRNG, field, particle stepping, colors
├── renderer.ts       canvas drawing and simulation state
├── flow-field.tsx    client root: state and layout
├── flow-canvas.tsx   canvas element, animation loop, theme, resize
└── flow-toolbar.tsx  Pause and Redraw
```
