import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { Prototype } from "@/lib/prototypes";
import { Thumbnail } from "./thumbnail";

export function PrototypeCard({ prototype }: { prototype: Prototype }) {
  return (
    <Link
      href={`/prototypes/${prototype.slug}`}
      className="group flex flex-col gap-3 rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <Thumbnail prototype={prototype} />
      <div className="flex flex-col gap-1 px-1">
        <div className="flex items-center gap-2">
          <h2 className="min-w-0 truncate text-sm font-medium underline-offset-4 group-hover:underline">
            {prototype.title}
          </h2>
          {prototype.public && <Badge variant="outline">Public</Badge>}
          {prototype.hidden && <Badge variant="outline">Hidden</Badge>}
        </div>
        <p className="line-clamp-2 text-sm text-muted-foreground">{prototype.description}</p>
        {prototype.tags.length > 0 && (
          <p className="text-xs text-muted-foreground">{prototype.tags.join(" · ")}</p>
        )}
      </div>
    </Link>
  );
}
