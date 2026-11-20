/* eslint-disable @next/next/no-img-element -- statically imported, fixed size */
"use client";

import { useRef, useState } from "react";
import { ChevronsLeftRightIcon } from "lucide-react";
import { KEY_STEP, START_POSITION } from "./data";
import { positionFromKey, positionFromPointer } from "./position";
import { SideLabel } from "./side-label";
import type { Side } from "./types";

/** Two photos in one frame. Drag, tap, or use arrow keys to move the divider. */
export function CompareSlider({ left, right }: { left: Side; right: Side }) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(START_POSITION);
  const [dragging, setDragging] = useState(false);

  function moveTo(clientX: number) {
    const rect = frameRef.current?.getBoundingClientRect();
    if (rect) setPosition(positionFromPointer(clientX, rect.left, rect.width));
  }

  return (
    <div
      ref={frameRef}
      role="slider"
      tabIndex={0}
      aria-label={`Reveal ${left.label} or ${right.label}`}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(position)}
      aria-valuetext={position >= 50 ? left.label : right.label}
      // pan-y keeps vertical page scrolling working when a swipe starts on the photo.
      className="relative aspect-[4/3] w-full cursor-ew-resize touch-pan-y overflow-hidden rounded-xl border border-border bg-muted outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/50 sm:aspect-video"
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        setDragging(true);
        moveTo(event.clientX);
      }}
      onPointerMove={(event) => dragging && moveTo(event.clientX)}
      onPointerUp={() => setDragging(false)}
      onPointerCancel={() => setDragging(false)}
      onKeyDown={(event) => {
        const next = positionFromKey(event.key, position, KEY_STEP);
        if (next === null) return;
        event.preventDefault();
        setPosition(next);
      }}
    >
      {/* Each layer is clipped at the divider, so a label never crosses onto the other photo. */}
      <div className="absolute inset-0" style={{ clipPath: `inset(0 0 0 ${position}%)` }}>
        <img src={right.image.src} alt={right.alt} draggable={false} className="size-full object-cover" />
        <SideLabel side="right">{right.label}</SideLabel>
      </div>
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}>
        <img src={left.image.src} alt={left.alt} draggable={false} className="size-full object-cover" />
        <SideLabel side="left">{left.label}</SideLabel>
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 w-0.5 -translate-x-1/2 bg-background"
        style={{ left: `${position}%` }}
      >
        <div className="absolute top-1/2 left-1/2 flex size-11 -translate-1/2 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-md">
          <ChevronsLeftRightIcon className="size-5" />
        </div>
      </div>
    </div>
  );
}
