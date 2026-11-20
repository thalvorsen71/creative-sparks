"use client";

import { DicesIcon, Undo2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ControlField } from "./control-field";
import type { ControlSchema } from "./schema";
import type { Controls } from "./use-controls";

/**
 * Renders Reset and Randomize, then every control in the schema. The buttons
 * come first so they are reachable in the mobile sheet without scrolling.
 */
export function ControlPanel<S extends ControlSchema>({ controls }: { controls: Controls<S> }) {
  const { schema, values, set, reset, randomize } = controls;
  return (
    <div className="flex flex-col gap-1">
      <div className="mb-2 grid grid-cols-2 gap-2">
        <Button variant="outline" className="tap" onClick={reset}>
          <Undo2Icon data-icon="inline-start" />
          Reset
        </Button>
        <Button variant="outline" className="tap" onClick={randomize}>
          <DicesIcon data-icon="inline-start" />
          Randomize
        </Button>
      </div>
      {Object.keys(schema).map((key) => (
        <ControlField
          key={key}
          control={schema[key]}
          value={values[key]}
          onChange={(value) => set(key, value as never)}
        />
      ))}
    </div>
  );
}
