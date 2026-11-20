// Pure simulation logic. No React, no DOM.

import { BUCKETS } from "./data";
import type { Field, FlowParams, Palette, Particle } from "./types";

/** Small seeded PRNG (mulberry32). Returns numbers in [0, 1). */
export function createRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createField(rng: () => number): Field {
  return [1, 2.1, 3.7].map((octave) => ({
    fx: (0.6 + rng() * 0.8) * octave * (rng() < 0.5 ? -1 : 1),
    fy: (0.6 + rng() * 0.8) * octave * (rng() < 0.5 ? -1 : 1),
    phase: rng() * Math.PI * 2,
  }));
}

/** Direction of flow at a point. `u` and `v` are 0 to 1 across the canvas. */
export function angleAt(field: Field, u: number, v: number, time: number, params: FlowParams): number {
  let sum = 0;
  let weight = 1;
  for (const wave of field) {
    sum += weight * Math.sin((u * wave.fx + v * wave.fy) * params.scale * Math.PI + wave.phase + time);
    weight *= 0.5;
  }
  return sum * params.swirl * Math.PI;
}

export function spawn(rng: () => number, width: number, height: number): Particle {
  return {
    x: rng() * width,
    y: rng() * height,
    life: 40 + Math.floor(rng() * 160),
    bucket: Math.floor(rng() * BUCKETS),
  };
}

/** Grows or shrinks the particle list to `count` without restarting it. */
export function resize(
  particles: Particle[],
  count: number,
  rng: () => number,
  width: number,
  height: number,
): void {
  particles.length = Math.min(particles.length, count);
  while (particles.length < count) particles.push(spawn(rng, width, height));
}

/** Moves a particle one frame. Returns false when it should respawn. */
export function advance(particle: Particle, angle: number, speed: number, width: number, height: number): boolean {
  particle.x += Math.cos(angle) * speed;
  particle.y += Math.sin(angle) * speed;
  particle.life -= 1;
  return (
    particle.life > 0 && particle.x >= 0 && particle.x <= width && particle.y >= 0 && particle.y <= height
  );
}

/** Stroke colors spread evenly around the base hue. Lighter on dark. */
export function strokeColors(params: FlowParams, dark: boolean): Palette["strokes"] {
  const lightness = dark ? 68 : 40;
  return Array.from({ length: BUCKETS }, (_, i) => {
    const offset = (i / (BUCKETS - 1) - 0.5) * 2 * params.spread;
    const hue = (((params.hue + offset) % 360) + 360) % 360;
    return `hsl(${hue.toFixed(1)} 72% ${lightness}% / 0.7)`;
  });
}
