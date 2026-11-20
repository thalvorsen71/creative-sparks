import { cn } from "@/lib/utils";

type Props = { side: "left" | "right"; children: React.ReactNode };

/** Corner label. Its parent layer clips it at the divider. */
export function SideLabel({ side, children }: Props) {
  return (
    <span
      className={cn(
        "pointer-events-none absolute top-3 rounded-md bg-background/85 px-2 py-1 text-xs font-medium text-foreground backdrop-blur-sm",
        side === "left" ? "left-3" : "right-3",
      )}
    >
      {children}
    </span>
  );
}
