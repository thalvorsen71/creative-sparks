import { Gallery } from "@/components/gallery/gallery";
import { getPrototypes } from "@/lib/prototypes";

export default function HomePage() {
  return <Gallery prototypes={getPrototypes()} />;
}
