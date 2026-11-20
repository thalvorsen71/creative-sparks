"use client";

import { useMemo, useState } from "react";
import { ThemeToggle } from "@/components/site/theme-toggle";
import type { Prototype } from "@/lib/prototypes";
import { SITE_NAME } from "@/lib/site";
import { useStoredState } from "@/lib/storage";
import { collectTags, filterPrototypes, type GalleryFilter } from "./filter";
import { GalleryToolbar } from "./gallery-toolbar";
import { PrototypeCard } from "./prototype-card";

export function Gallery({ prototypes }: { prototypes: Prototype[] }) {
  const [search, setSearch] = useState({ query: "", tag: null as string | null });
  const [showHidden, setShowHidden] = useStoredState("gallery:show-hidden", false, (v) => v === true);
  const filter: GalleryFilter = useMemo(() => ({ ...search, showHidden }), [search, showHidden]);

  function update({ showHidden: nextHidden, ...rest }: Partial<GalleryFilter>) {
    if (nextHidden !== undefined) setShowHidden(nextHidden);
    setSearch((current) => ({ ...current, ...rest }));
  }

  const listed = useMemo(
    () => prototypes.filter((p) => filter.showHidden || !p.hidden),
    [prototypes, filter.showHidden],
  );
  const tags = useMemo(() => collectTags(listed), [listed]);
  const visible = useMemo(() => filterPrototypes(prototypes, filter), [prototypes, filter]);
  const hiddenCount = prototypes.filter((p) => p.hidden).length;

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 sm:py-10">
      <header className="flex items-center justify-between">
        <h1 className="text-lg font-medium">{SITE_NAME}</h1>
        <ThemeToggle />
      </header>
      <GalleryToolbar filter={filter} tags={tags} hiddenCount={hiddenCount} onChange={update} />
      {visible.length > 0 ? (
        <div className="grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((prototype) => (
            <PrototypeCard key={prototype.slug} prototype={prototype} />
          ))}
        </div>
      ) : (
        <p className="py-16 text-center text-sm text-muted-foreground">
          {prototypes.length === 0 ? "No prototypes yet." : "Nothing matches."}
        </p>
      )}
    </main>
  );
}
