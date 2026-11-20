import type { Prototype } from "@/lib/prototypes";

export type GalleryFilter = { query: string; tag: string | null; showHidden: boolean };

/** Tags across the visible set, most used first. */
export function collectTags(prototypes: Prototype[]): string[] {
  const counts = new Map<string, number>();
  for (const p of prototypes) for (const tag of p.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([tag]) => tag);
}

export function filterPrototypes(prototypes: Prototype[], filter: GalleryFilter): Prototype[] {
  const words = filter.query.toLowerCase().split(/\s+/).filter(Boolean);
  return prototypes.filter((p) => {
    if (p.hidden && !filter.showHidden) return false;
    if (filter.tag && !p.tags.includes(filter.tag)) return false;
    const haystack = `${p.title} ${p.description} ${p.tags.join(" ")} ${p.slug}`.toLowerCase();
    return words.every((word) => haystack.includes(word));
  });
}
