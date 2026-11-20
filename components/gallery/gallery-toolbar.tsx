"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Toggle } from "@/components/ui/toggle";
import type { GalleryFilter } from "./filter";

type Props = {
  filter: GalleryFilter;
  tags: string[];
  hiddenCount: number;
  onChange: (patch: Partial<GalleryFilter>) => void;
};

export function GalleryToolbar({ filter, tags, hiddenCount, onChange }: Props) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-4">
        <Input
          type="search"
          aria-label="Search prototypes"
          placeholder="Search"
          className="h-11 sm:h-9"
          value={filter.query}
          onChange={(event) => onChange({ query: event.target.value })}
        />
        {hiddenCount > 0 && (
          <Label className="tap flex shrink-0 items-center gap-2 text-sm text-muted-foreground">
            <Switch
              checked={filter.showHidden}
              onCheckedChange={(showHidden) => onChange({ showHidden })}
            />
            Hidden
          </Label>
        )}
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <Toggle
              key={tag}
              variant="outline"
              size="sm"
              className="tap"
              pressed={filter.tag === tag}
              onPressedChange={(pressed) => onChange({ tag: pressed ? tag : null })}
            >
              {tag}
            </Toggle>
          ))}
        </div>
      )}
    </div>
  );
}
