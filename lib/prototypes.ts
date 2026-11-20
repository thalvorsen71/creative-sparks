import "server-only";
import fs from "node:fs";
import path from "node:path";

export type PrototypeMeta = {
  title: string;
  description: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  hidden: boolean;
  public: boolean;
};

export type Prototype = PrototypeMeta & {
  slug: string;
  /** Static preview images under /thumbnails, or null when not captured yet. */
  thumbnails: { light: string | null; dark: string | null };
  /** Share assets under /og. Only generated for public prototypes. */
  og: { image: string | null; video: string | null; videoType: string | null };
};

const PROTOTYPES_DIR = path.join(process.cwd(), "app", "prototypes");
const PUBLIC_DIR = path.join(process.cwd(), "public");

/** Returns "/file?v=mtime" if the file exists in public/, else null. */
function publicAsset(relative: string): string | null {
  try {
    const stat = fs.statSync(path.join(PUBLIC_DIR, relative));
    return `/${relative}?v=${Math.floor(stat.mtimeMs / 1000)}`;
  } catch {
    return null;
  }
}

function readPrototype(slug: string): Prototype | null {
  const metaPath = path.join(PROTOTYPES_DIR, slug, "metadata.json");
  if (!fs.existsSync(metaPath)) return null;

  let raw: Partial<PrototypeMeta> = {};
  try {
    raw = JSON.parse(fs.readFileSync(metaPath, "utf8"));
  } catch (error) {
    // A broken metadata file must not take the whole gallery down.
    // `npm run check` reports it as an error in CI.
    console.warn(`[prototypes] invalid metadata.json for "${slug}":`, error);
  }

  const mp4 = publicAsset(`og/${slug}.mp4`);
  const webm = publicAsset(`og/${slug}.webm`);

  return {
    slug,
    title: raw.title ?? slug,
    description: raw.description ?? "",
    tags: Array.isArray(raw.tags) ? raw.tags : [],
    createdAt: raw.createdAt ?? "",
    updatedAt: raw.updatedAt ?? raw.createdAt ?? "",
    hidden: raw.hidden === true,
    public: raw.public === true,
    thumbnails: {
      light: publicAsset(`thumbnails/${slug}-light.jpg`),
      dark: publicAsset(`thumbnails/${slug}-dark.jpg`),
    },
    og: {
      image: publicAsset(`og/${slug}.png`),
      video: mp4 ?? webm,
      videoType: mp4 ? "video/mp4" : webm ? "video/webm" : null,
    },
  };
}

/** Every prototype, most recently updated first. */
export function getPrototypes(): Prototype[] {
  if (!fs.existsSync(PROTOTYPES_DIR)) return [];
  return fs
    .readdirSync(PROTOTYPES_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("["))
    .map((entry) => readPrototype(entry.name))
    .filter((p): p is Prototype => p !== null)
    .sort((a, b) => Date.parse(b.updatedAt || "0") - Date.parse(a.updatedAt || "0"));
}

export function getPrototype(slug: string): Prototype | null {
  if (!/^[a-z0-9][a-z0-9-]*$/.test(slug)) return null;
  return readPrototype(slug);
}
