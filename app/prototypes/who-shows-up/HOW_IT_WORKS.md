# Who Shows Up

## What It Does

Shows two crowd photographs in one frame with a draggable divider: athletes in the theater audience on opening night, and theater and art students in the stands on game night. Below the frame, shot notes describe each photograph so the pair can brief a real shoot.

## Architecture

```
data.ts (two sides: image, label, alt, shot notes)
      │
      ▼
page.tsx ──► CompareSlider ── position (0 to 100, React state)
      │            │
      │            ├── right photo (full frame)
      │            ├── left photo (clip-path inset by position)
      │            ├── SideLabel x2
      │            └── divider + handle
      ▼
ShotNotes x2
```

## Frontend

- **State**: one number, `position`, in `CompareSlider`. Not persisted; it resets to the middle on load.
- **Reveal**: two full-frame layers, each holding a photo and its label. The left layer is clipped with `clip-path: inset(0 <100 - position>% 0 0)` and the right with the mirror of it, so nothing is resized while dragging and a label never crosses the divider.
- **Pointer**: pointer events with pointer capture on the frame. Press anywhere to jump the divider there, then drag. `touch-action: pan-y` keeps vertical page scrolling working when a swipe starts on the photo.
- **Keyboard**: the frame is a `role="slider"`. Left/Right (or Down/Up) move 5 points, Home and End jump to either photo.
- **Responsive**: 4:3 frame on phones, 16:9 from `sm`. Shot notes stack on phones and sit side by side from `sm`.
- **Images**: statically imported from `images/`, so they ship with the build and need no public folder.

## API

None.

## Image Sources

The two frames are AI-generated concept images, labeled as such on the page. The files currently checked in are low-resolution placeholders (upscaled from 200px previews); the full-size originals are 2720 x 1536. They stand in for photographs that do not exist yet. Replace `images/theater.jpg` and `images/rink.jpg` to swap them (16:9, about 2400px wide).

## Key Dependencies

- `lucide-react`: handle icon
- No other dependencies beyond the shared design system

## Component Tree

```
WhoShowsUpPage (page.tsx)
├── CompareSlider
│   └── SideLabel (x2)
└── ShotNotes (x2)
```

## Error Handling

- A zero-width frame returns the middle position instead of dividing by zero.
- Positions are clamped to 0 to 100.
- Unhandled keys fall through to the browser.

## File Structure

```
who-shows-up/
├── page.tsx            thin route entry and layout
├── metadata.json
├── HOW_IT_WORKS.md
├── types.ts            Side
├── data.ts             the two sides, labels, shot notes, constants
├── position.ts         pure slider maths
├── compare-slider.tsx  frame, pointer and keyboard handling
├── side-label.tsx      corner label
├── shot-notes.tsx      direction for one photograph
└── images/             theater.jpg, rink.jpg
```
