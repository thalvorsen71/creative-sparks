import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPrototype, getPrototypes } from "@/lib/prototypes";
import { siteUrl } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

// Only prototypes flagged "public": true are built. Every other slug,
// private or unknown, is the same 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return getPrototypes()
    .filter((p) => p.public)
    .map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const prototype = getPrototype(slug);
  if (!prototype?.public) return {};

  const { title, description, og } = prototype;
  return {
    title,
    description,
    robots: { index: true, follow: true },
    openGraph: {
      type: "website",
      title,
      description,
      url: `/p/${slug}`,
      images: og.image ? [{ url: og.image, width: 1200, height: 630, alt: title }] : undefined,
      videos:
        og.video && og.videoType
          ? [{ url: new URL(og.video, siteUrl()).toString(), width: 1200, height: 630, type: og.videoType }]
          : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: og.image ? [og.image] : undefined,
    },
  };
}

export default async function PublicPrototypePage({ params }: Props) {
  const { slug } = await params;
  if (!getPrototype(slug)?.public) notFound();

  // Same component the private route renders.
  const { default: Prototype } = await import(`@/app/prototypes/${slug}/page`);
  return <Prototype />;
}
