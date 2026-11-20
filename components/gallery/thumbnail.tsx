/* eslint-disable @next/next/no-img-element -- static files; no optimizer needed */
import type { Prototype } from "@/lib/prototypes";

/**
 * Static preview image. Both themes are in the markup and CSS picks one, so
 * there is no flash on load. Never replace this with a live iframe.
 */
export function Thumbnail({ prototype }: { prototype: Prototype }) {
  const { light, dark } = prototype.thumbnails;
  return (
    <div className="aspect-[16/10] overflow-hidden rounded-lg border border-border bg-muted">
      {light && dark ? (
        <>
          <img src={light} alt="" loading="lazy" className="size-full object-cover dark:hidden" />
          <img src={dark} alt="" loading="lazy" className="hidden size-full object-cover dark:block" />
        </>
      ) : (
        <div className="flex size-full items-center justify-center text-sm text-muted-foreground">
          No preview yet
        </div>
      )}
    </div>
  );
}
