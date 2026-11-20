// Canvas drawing. Owns the mutable simulation state for one canvas.

import { BUCKETS } from "./data";
import { advance, angleAt, createField, createRng, resize, spawn } from "./field";
import type { Field, FlowParams, Palette, Particle } from "./types";

export type Renderer = {
  /** Clears the canvas and restarts with a new seed and size. */
  reset: (seed: number, width: number, height: number, background: string) => void;
  /** Simulates and draws one frame. */
  frame: (params: FlowParams, palette: Palette) => void;
};

/**
 * An alpha fade never quite reaches the background on an 8-bit canvas, which
 * leaves a grey haze on light backgrounds. Lift every channel a few levels,
 * then clamp to the background so faint residue disappears completely.
 */
function settle(ctx: CanvasRenderingContext2D, width: number, height: number, background: string) {
  ctx.globalCompositeOperation = "lighter";
  ctx.fillStyle = "rgb(1 1 1)"; // a per-frame step size, not a UI color
  ctx.fillRect(0, 0, width, height);
  ctx.globalCompositeOperation = "darken";
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, width, height);
  ctx.globalCompositeOperation = "source-over";
}

export function createRenderer(ctx: CanvasRenderingContext2D): Renderer {
  let rng = createRng(1);
  let field: Field = createField(rng);
  let particles: Particle[] = [];
  let width = 0;
  let height = 0;
  let time = 0;
  // Reused per frame: one path per color bucket.
  const paths = Array.from({ length: BUCKETS }, () => [] as number[]);

  return {
    reset(seed, nextWidth, nextHeight, background) {
      rng = createRng(seed);
      field = createField(rng);
      particles = [];
      width = nextWidth;
      height = nextHeight;
      time = 0;
      ctx.globalAlpha = 1;
      ctx.fillStyle = background;
      ctx.fillRect(0, 0, width, height);
    },

    frame(params, palette) {
      if (width === 0 || height === 0) return;
      resize(particles, params.count, rng, width, height);
      if (params.evolve) time += 0.003;

      // Fade what is already there toward the background to form trails.
      ctx.globalAlpha = 1 - params.trail;
      ctx.fillStyle = palette.background;
      ctx.fillRect(0, 0, width, height);
      ctx.globalAlpha = 1;
      if (palette.light) settle(ctx, width, height, palette.background);

      for (const path of paths) path.length = 0;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const fromX = p.x;
        const fromY = p.y;
        const angle = angleAt(field, p.x / width, p.y / height, time, params);
        if (advance(p, angle, params.speed, width, height)) {
          paths[p.bucket].push(fromX, fromY, p.x, p.y);
        } else {
          particles[i] = spawn(rng, width, height);
        }
      }

      ctx.lineWidth = params.weight;
      ctx.lineCap = "round";
      for (let b = 0; b < BUCKETS; b++) {
        const path = paths[b];
        if (path.length === 0) continue;
        ctx.strokeStyle = palette.strokes[b];
        ctx.beginPath();
        for (let j = 0; j < path.length; j += 4) {
          ctx.moveTo(path[j], path[j + 1]);
          ctx.lineTo(path[j + 2], path[j + 3]);
        }
        ctx.stroke();
      }
    },
  };
}
