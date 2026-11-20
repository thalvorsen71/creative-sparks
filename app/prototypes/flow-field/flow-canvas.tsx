"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { STILL_FRAMES } from "./data";
import { strokeColors } from "./field";
import { createRenderer } from "./renderer";
import type { FlowParams } from "./types";

type Props = { params: FlowParams; seed: number; paused: boolean };

export function FlowCanvas({ params, seed, paused }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Canvas colors cannot come from CSS classes, so the theme is read here.
  const { resolvedTheme } = useTheme();
  const reducedMotion = useReducedMotion();
  // Under reduced motion the still is redrawn whenever a control changes.
  const stillKey = reducedMotion ? params : null;

  // Latest props for the animation loop, which must not restart on every drag.
  const live = useRef({ params, paused });
  useEffect(() => {
    live.current = { params, paused };
  }, [params, paused]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const renderer = createRenderer(ctx);
    const dark = resolvedTheme !== "light";
    let background = "";
    let raf = 0;

    const palette = () => ({
      background,
      light: !dark,
      strokes: strokeColors(live.current.params, dark),
    });

    function restart() {
      if (!canvas || !ctx) return;
      const { width, height } = canvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      // The canvas element carries bg-card, so this follows the design tokens.
      background = getComputedStyle(canvas).backgroundColor;
      renderer.reset(seed, width, height, background);
      // Reduced motion: draw one finished still instead of animating.
      if (reducedMotion) {
        for (let i = 0; i < STILL_FRAMES; i++) renderer.frame(live.current.params, palette());
      }
    }

    function loop() {
      if (!live.current.paused) renderer.frame(live.current.params, palette());
      raf = requestAnimationFrame(loop);
    }

    const observer = new ResizeObserver(restart);
    observer.observe(canvas);
    if (!reducedMotion) raf = requestAnimationFrame(loop);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [seed, resolvedTheme, reducedMotion, stillKey]);

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label="Animated flow field"
      className="aspect-[4/5] w-full rounded-xl border border-border bg-card sm:aspect-[4/3]"
    />
  );
}
