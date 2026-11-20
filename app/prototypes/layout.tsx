import { PrototypeHeader } from "@/components/site/prototype-header";
import { getPrototypes } from "@/lib/prototypes";

export default function PrototypesLayout({ children }: { children: React.ReactNode }) {
  const titles = Object.fromEntries(getPrototypes().map((p) => [p.slug, p.title]));
  return (
    <>
      <PrototypeHeader titles={titles} />
      <main className="flex-1">{children}</main>
    </>
  );
}
