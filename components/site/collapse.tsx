import { cn } from "@/lib/utils";

/**
 * Animates its children's height open and closed, so added or removed rows
 * never make the page jump. Keep the element mounted and flip `open`.
 */
export function Collapse({
  open,
  className,
  children,
}: {
  open: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("collapse-grid", className)} data-open={open} aria-hidden={!open} inert={!open}>
      <div>{children}</div>
    </div>
  );
}
