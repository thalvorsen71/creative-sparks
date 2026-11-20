import type { ControlValues } from "@/components/controls";
import type { controls } from "./data";

export type FlowParams = ControlValues<typeof controls>;

export type Particle = {
  x: number;
  y: number;
  /** Frames left before the particle respawns. */
  life: number;
  /** Color bucket, 0 to BUCKETS - 1. */
  bucket: number;
};

/** Three layered waves; phases and frequencies come from the seed. */
export type Field = { fx: number; fy: number; phase: number }[];

export type Palette = {
  background: string;
  /** Light backgrounds need an extra cleanup pass; see renderer.ts. */
  light: boolean;
  /** One stroke color per bucket. */
  strokes: string[];
};
