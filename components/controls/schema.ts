// Pure control-schema logic. No React, safe to unit test.

type Base = {
  label: string;
  /** Set false to keep this control out of Randomize. */
  randomize?: boolean;
};

export type RangeControl = Base & {
  type: "range";
  min: number;
  max: number;
  step: number;
  default: number;
  /** Shown after the value, e.g. "px" or "°". */
  unit?: string;
};

export type ToggleControl = Base & { type: "toggle"; default: boolean };

export type SelectControl = Base & {
  type: "select";
  options: readonly { value: string; label: string }[];
  default: string;
};

export type Control = RangeControl | ToggleControl | SelectControl;
export type ControlSchema = Record<string, Control>;

export type ControlValues<S extends ControlSchema> = {
  [K in keyof S]: S[K] extends RangeControl ? number : S[K] extends ToggleControl ? boolean : string;
};

/** Identity helper that keeps literal types for inference. */
export function defineControls<const S extends ControlSchema>(schema: S): S {
  return schema;
}

function snap(control: RangeControl, value: number): number {
  const clamped = Math.min(control.max, Math.max(control.min, value));
  const steps = Math.round((clamped - control.min) / control.step);
  const decimals = (String(control.step).split(".")[1] ?? "").length;
  return Number((control.min + steps * control.step).toFixed(decimals));
}

export function defaultValues<S extends ControlSchema>(schema: S): ControlValues<S> {
  const values: Record<string, unknown> = {};
  for (const key in schema) values[key] = schema[key].default;
  return values as ControlValues<S>;
}

/** Keeps valid stored values, falls back to defaults for anything else. */
export function sanitizeValues<S extends ControlSchema>(schema: S, stored: unknown): ControlValues<S> {
  const input = (stored && typeof stored === "object" ? stored : {}) as Record<string, unknown>;
  const values: Record<string, unknown> = {};
  for (const key in schema) {
    const control = schema[key];
    const value = input[key];
    if (control.type === "range") {
      values[key] = typeof value === "number" && Number.isFinite(value) ? snap(control, value) : control.default;
    } else if (control.type === "toggle") {
      values[key] = typeof value === "boolean" ? value : control.default;
    } else {
      values[key] = control.options.some((o) => o.value === value) ? value : control.default;
    }
  }
  return values as ControlValues<S>;
}

export function randomValues<S extends ControlSchema>(
  schema: S,
  current: ControlValues<S>,
  random: () => number = Math.random,
): ControlValues<S> {
  const values: Record<string, unknown> = { ...current };
  for (const key in schema) {
    const control = schema[key];
    if (control.randomize === false) continue;
    if (control.type === "range") {
      values[key] = snap(control, control.min + random() * (control.max - control.min));
    } else if (control.type === "toggle") {
      values[key] = random() < 0.5;
    } else {
      values[key] = control.options[Math.floor(random() * control.options.length)].value;
    }
  }
  return values as ControlValues<S>;
}
