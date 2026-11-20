"use client";

import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import { useSelectedLayoutSegment } from "next/navigation";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Slim bar above every prototype: back to the gallery, title, theme. */
export function PrototypeHeader({ titles }: { titles: Record<string, string> }) {
  const segment = useSelectedLayoutSegment();
  const title = segment ? titles[segment] : undefined;

  return (
    <header className="flex items-center gap-1 border-b border-border px-2 py-1">
      <Link
        href="/"
        aria-label="Back to gallery"
        className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "tap")}
      >
        <ArrowLeftIcon />
      </Link>
      <h1 className="min-w-0 flex-1 truncate text-sm font-medium">{title}</h1>
      <ThemeToggle />
    </header>
  );
}
