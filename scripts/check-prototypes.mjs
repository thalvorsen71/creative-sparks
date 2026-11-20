#!/usr/bin/env node
// Validates every prototype against the rules in CLAUDE.md.
// Errors fail CI. Warnings do not.
//
//   npm run check

import fs from "node:fs";
import path from "node:path";
import { hasOgVideo, hasThumbnails, listPrototypes, ogImagePath } from "./lib.mjs";

const errors = [];
const warnings = [];

const REQUIRED = {
  title: "string",
  description: "string",
  tags: "array",
  createdAt: "string",
  updatedAt: "string",
  hidden: "boolean",
  public: "boolean",
};

// Hardcoded colors: Tailwind palette classes, black/white, hex, inline rgb().
const PALETTE =
  /\b(?:bg|text|border|ring|fill|stroke|from|via|to|outline|decoration|shadow|divide|accent|caret)-(?:black|white|(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3})\b/;
const HEX = /#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/;

function sourceFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(full);
    return /\.(tsx?|css)$/.test(entry.name) ? [full] : [];
  });
}

for (const { slug, dir, meta } of listPrototypes()) {
  const fail = (message) => errors.push(`${slug}: ${message}`);
  const warn = (message) => warnings.push(`${slug}: ${message}`);

  if (!/^[a-z0-9][a-z0-9-]*$/.test(slug)) fail("folder name must be lowercase kebab-case");
  for (const file of ["page.tsx", "metadata.json", "HOW_IT_WORKS.md"]) {
    if (!fs.existsSync(path.join(dir, file))) fail(`missing ${file}`);
  }

  if (!meta) {
    fail("metadata.json is missing or not valid JSON");
  } else {
    for (const [key, type] of Object.entries(REQUIRED)) {
      const value = meta[key];
      const ok = type === "array" ? Array.isArray(value) : typeof value === type;
      if (!ok) fail(`metadata.json: "${key}" must be ${type === "array" ? "an array" : `a ${type}`}`);
    }
    if (typeof meta.createdAt === "string" && !/^\d{4}-\d{2}-\d{2}$/.test(meta.createdAt)) {
      fail('metadata.json: "createdAt" must be YYYY-MM-DD');
    }
    if (typeof meta.updatedAt === "string" && Number.isNaN(Date.parse(meta.updatedAt))) {
      fail('metadata.json: "updatedAt" must be an ISO timestamp');
    }
    if (meta.public === true) {
      if (!fs.existsSync(ogImagePath(slug)) || !hasOgVideo(slug)) {
        fail(`public prototype needs share assets: run "npm run thumbnails -- --og ${slug}"`);
      }
    }
  }

  const pagePath = path.join(dir, "page.tsx");
  if (fs.existsSync(pagePath)) {
    const lines = fs.readFileSync(pagePath, "utf8").split("\n").length;
    if (lines > 80) fail(`page.tsx is ${lines} lines; keep it thin (~60) and split into components`);
  }

  for (const file of sourceFiles(dir)) {
    const relative = path.relative(dir, file);
    fs.readFileSync(file, "utf8")
      .split("\n")
      .forEach((line, index) => {
        if (line.includes("color-ok")) return;
        const match = line.match(PALETTE) ?? line.match(HEX);
        if (match) {
          fail(`${relative}:${index + 1} hardcoded color "${match[0]}". Use design tokens.`);
        }
        if (/className=.*["'\s]dark["'\s]/.test(line) && !line.includes("dark:")) {
          fail(`${relative}:${index + 1} hardcoded "dark" class. The theme is global.`);
        }
      });
  }

  if (!hasThumbnails(slug)) warn(`no thumbnails yet: run "npm run thumbnails -- ${slug}"`);
}

for (const message of warnings) console.warn(`warn  ${message}`);
for (const message of errors) console.error(`error ${message}`);
console.log(
  `\n${listPrototypes().length} prototype(s), ${errors.length} error(s), ${warnings.length} warning(s)`,
);
process.exit(errors.length > 0 ? 1 : 0);
