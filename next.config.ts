import fs from "node:fs";
import path from "node:path";
import type { NextConfig } from "next";

// Slugs of prototypes flagged "public": true, resolved at build time so the
// proxy (which cannot read the filesystem cheaply per request) can let their
// API routes through the password gate.
function publicSlugs(): string[] {
  const dir = path.join(process.cwd(), "app", "prototypes");
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((slug) => {
    try {
      const raw = fs.readFileSync(path.join(dir, slug, "metadata.json"), "utf8");
      return JSON.parse(raw).public === true;
    } catch {
      return false;
    }
  });
}

const nextConfig: NextConfig = {
  env: {
    PUBLIC_PROTOTYPE_SLUGS: publicSlugs().join(","),
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
