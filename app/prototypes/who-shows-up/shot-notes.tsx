import type { Side } from "./types";

const ROWS = [
  ["Who", "who"],
  ["Where", "where"],
  ["Moment", "moment"],
  ["Leave out", "avoid"],
] as const;

/** The direction for one photograph, written for the shoot. */
export function ShotNotes({ side }: { side: Side }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-sm font-medium">{side.label}</h2>
      <dl className="flex flex-col gap-1.5 text-sm">
        {ROWS.map(([term, key]) => (
          <div key={key} className="grid grid-cols-[5.5rem_1fr] gap-2">
            <dt className="text-muted-foreground">{term}</dt>
            <dd>{side.shot[key]}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
