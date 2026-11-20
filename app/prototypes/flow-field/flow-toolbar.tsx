import { PauseIcon, PlayIcon, RefreshCwIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = { paused: boolean; onTogglePause: () => void; onRedraw: () => void };

/** Icon-only on mobile, labels from `sm` up. */
export function FlowToolbar({ paused, onTogglePause, onRedraw }: Props) {
  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        className="tap"
        aria-label={paused ? "Play" : "Pause"}
        onClick={onTogglePause}
      >
        {paused ? <PlayIcon /> : <PauseIcon />}
        <span className="hidden sm:inline">{paused ? "Play" : "Pause"}</span>
      </Button>
      <Button variant="outline" className="tap" aria-label="Redraw" onClick={onRedraw}>
        <RefreshCwIcon />
        <span className="hidden sm:inline">Redraw</span>
      </Button>
    </div>
  );
}
