import { ThemeToggle } from "@/components/site/theme-toggle";

// Public prototypes get no gallery link: visitors cannot reach it anyway.
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="flex justify-end px-2 py-1">
        <ThemeToggle />
      </header>
      <main className="flex-1">{children}</main>
    </>
  );
}
