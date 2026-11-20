"use client";

import { useState } from "react";
import { ControlLayout, useControls } from "@/components/controls";
import { controls as schema, STORAGE_KEY } from "./data";
import { FlowCanvas } from "./flow-canvas";
import { FlowToolbar } from "./flow-toolbar";

export function FlowField() {
  const controls = useControls(STORAGE_KEY, schema);
  const [seed, setSeed] = useState(1);
  const [paused, setPaused] = useState(false);

  return (
    <ControlLayout controls={controls}>
      <div className="flex flex-col gap-3">
        <FlowCanvas params={controls.values} seed={seed} paused={paused} />
        <FlowToolbar
          paused={paused}
          onTogglePause={() => setPaused((current) => !current)}
          onRedraw={() => setSeed((current) => current + 1)}
        />
      </div>
    </ControlLayout>
  );
}
