"use client";

import { SlidersHorizontalIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import { ControlPanel } from "./control-panel";
import type { ControlSchema } from "./schema";
import type { Controls } from "./use-controls";

/**
 * Page shell for anything with tunable parameters. The subject sits in the
 * usual centered column. The panel sits beside it from `lg` up, and moves
 * into a bottom sheet on smaller screens so it never covers the subject
 * unless the user opens it.
 */
export function ControlLayout<S extends ControlSchema>({
  controls,
  children,
}: {
  controls: Controls<S>;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex w-full max-w-5xl items-start gap-8 px-4 py-6 lg:px-6">
      <div className="mx-auto w-full max-w-2xl min-w-0 flex-1">{children}</div>

      <aside className="sticky top-6 hidden w-60 shrink-0 lg:block">
        <ControlPanel controls={controls} />
      </aside>

      <Drawer modal={false} showSwipeHandle>
        <DrawerTrigger
          aria-label="Open controls"
          className={cn(
            buttonVariants({ variant: "default", size: "icon-lg" }),
            "fixed right-4 bottom-4 z-40 size-12 rounded-full shadow-lg lg:hidden",
          )}
        >
          <SlidersHorizontalIcon />
        </DrawerTrigger>
        <DrawerContent className="lg:hidden">
          <DrawerTitle className="sr-only">Controls</DrawerTitle>
          <div className="max-h-[45dvh] overflow-y-auto px-4 pb-6">
            <ControlPanel controls={controls} />
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
