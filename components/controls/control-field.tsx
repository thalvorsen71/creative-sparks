"use client";

import { useId } from "react";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import type { Control } from "./schema";

type Props = {
  control: Control;
  value: number | boolean | string;
  onChange: (value: number | boolean | string) => void;
};

/** One row of the panel. Rows are at least 44px tall for touch. */
export function ControlField({ control, value, onChange }: Props) {
  const id = useId();

  if (control.type === "toggle") {
    return (
      <label htmlFor={id} className="flex min-h-11 items-center justify-between gap-3 text-sm">
        {control.label}
        <Switch id={id} checked={value as boolean} onCheckedChange={onChange} />
      </label>
    );
  }

  if (control.type === "select") {
    return (
      <div className="flex min-h-11 items-center justify-between gap-3 text-sm">
        <label htmlFor={id}>{control.label}</label>
        <NativeSelect
          id={id}
          className="w-36"
          value={value as string}
          onChange={(event) => onChange(event.target.value)}
        >
          {control.options.map((option) => (
            <NativeSelectOption key={option.value} value={option.value}>
              {option.label}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </div>
    );
  }

  return (
    <div className="flex min-h-11 flex-col justify-center gap-2 py-1.5 text-sm">
      <div className="flex items-baseline justify-between gap-3">
        <span id={id}>{control.label}</span>
        <span className="text-xs text-muted-foreground tabular-nums">
          {value as number}
          {control.unit}
        </span>
      </div>
      <Slider
        aria-labelledby={id}
        min={control.min}
        max={control.max}
        step={control.step}
        value={value as number}
        onValueChange={(next) => onChange(next as number)}
      />
    </div>
  );
}
