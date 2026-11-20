import { defineControls } from "@/components/controls";

export const STORAGE_KEY = "flow-field:controls";

/** Particles are drawn in this many color batches (one canvas path each). */
export const BUCKETS = 8;

/** Frames simulated for the single still image shown under reduced motion. */
export const STILL_FRAMES = 240;

export const controls = defineControls({
  count: { type: "range", label: "Particles", min: 200, max: 3000, step: 100, default: 1200 },
  speed: { type: "range", label: "Speed", min: 0.2, max: 3, step: 0.1, default: 1.2 },
  scale: { type: "range", label: "Scale", min: 0.5, max: 4, step: 0.1, default: 1.6 },
  swirl: { type: "range", label: "Swirl", min: 0.5, max: 4, step: 0.1, default: 1.4 },
  trail: { type: "range", label: "Trail", min: 0.5, max: 0.98, step: 0.01, default: 0.94 },
  weight: { type: "range", label: "Weight", min: 0.5, max: 3, step: 0.1, default: 1, unit: "px" },
  hue: { type: "range", label: "Hue", min: 0, max: 360, step: 1, default: 28, unit: "°" },
  spread: { type: "range", label: "Hue spread", min: 0, max: 180, step: 1, default: 50, unit: "°" },
  evolve: { type: "toggle", label: "Evolve", default: true },
});
