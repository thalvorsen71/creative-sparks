// Shared helpers for the scripts in this folder.
import fs from "node:fs";
import path from "node:path";

export const ROOT = path.resolve(import.meta.dirname, "..");
export const PROTOTYPES_DIR = path.join(ROOT, "app", "prototypes");
export const THUMBNAILS_DIR = path.join(ROOT, "public", "thumbnails");
export const OG_DIR = path.join(ROOT, "public", "og");

/** Every prototype folder with its parsed metadata (null if unreadable). */
export function listPrototypes() {
  return fs
    .readdirSync(PROTOTYPES_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("["))
    .map((entry) => {
      const dir = path.join(PROTOTYPES_DIR, entry.name);
      let meta = null;
      try {
        meta = JSON.parse(fs.readFileSync(path.join(dir, "metadata.json"), "utf8"));
      } catch {}
      return { slug: entry.name, dir, meta };
    });
}

export const thumbnailPath = (slug, theme) => path.join(THUMBNAILS_DIR, `${slug}-${theme}.jpg`);
export const hasThumbnails = (slug) =>
  fs.existsSync(thumbnailPath(slug, "light")) && fs.existsSync(thumbnailPath(slug, "dark"));
export const ogImagePath = (slug) => path.join(OG_DIR, `${slug}.png`);
export const hasOgVideo = (slug) =>
  fs.existsSync(path.join(OG_DIR, `${slug}.mp4`)) || fs.existsSync(path.join(OG_DIR, `${slug}.webm`));
