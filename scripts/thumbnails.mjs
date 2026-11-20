#!/usr/bin/env node
// Captures static gallery thumbnails (light + dark) from a production build,
// and share assets (og image + video) for public prototypes.
//
//   npm run thumbnails                      every prototype
//   npm run thumbnails -- flow-field        one
//   npm run thumbnails -- one two three     several
//   npm run thumbnails -- --missing         only those without thumbnails
//   npm run thumbnails -- --og flow-field   share image + video (public only)
//   npm run thumbnails -- --og              share assets for every public prototype
//
// Options: --no-build (reuse the existing .next build), --wait=<ms> (settle
// time before the screenshot, default 2500), --port=<n> (default 4319).

import { execFileSync, spawn, spawnSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";
import {
  hasThumbnails,
  listPrototypes,
  OG_DIR,
  ogImagePath,
  ROOT,
  THUMBNAILS_DIR,
  thumbnailPath,
} from "./lib.mjs";

const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${name}`);
const option = (name, fallback) => {
  const hit = args.find((arg) => arg.startsWith(`--${name}=`));
  return hit ? hit.split("=")[1] : fallback;
};
const requested = args.filter((arg) => !arg.startsWith("--"));
const ogMode = flag("og");
const port = Number(option("port", 4319));
const wait = Number(option("wait", 2500));
const origin = `http://127.0.0.1:${port}`;
const nextBin = path.join(ROOT, "node_modules", "next", "dist", "bin", "next");

// Thumbnails render the desktop layout, saved at half size.
const THUMB = { viewport: { width: 1280, height: 800 }, deviceScaleFactor: 0.5 };
const OG = { width: 1200, height: 630 };
const VIDEO_SECONDS = 6;

function selectPrototypes() {
  const all = listPrototypes().filter((p) => p.meta);
  const unknown = requested.filter((slug) => !all.some((p) => p.slug === slug));
  if (unknown.length) throw new Error(`Unknown prototype(s): ${unknown.join(", ")}`);

  let selected = requested.length ? all.filter((p) => requested.includes(p.slug)) : all;
  if (flag("missing")) selected = selected.filter((p) => !hasThumbnails(p.slug));
  if (ogMode) {
    const priv = selected.filter((p) => p.meta.public !== true);
    if (requested.length && priv.length) {
      throw new Error(
        `Not public: ${priv.map((p) => p.slug).join(", ")}. Share assets are only made for prototypes with "public": true.`,
      );
    }
    selected = selected.filter((p) => p.meta.public === true);
  }
  return selected;
}

async function startServer(password) {
  const server = spawn(process.execPath, [nextBin, "start", "-p", String(port)], {
    cwd: ROOT,
    env: { ...process.env, NODE_ENV: "production", SITE_PASSWORD: password },
    stdio: ["ignore", "ignore", "inherit"],
  });
  for (let attempt = 0; attempt < 80; attempt++) {
    if (server.exitCode !== null) throw new Error("next start exited early");
    try {
      await fetch(`${origin}/login`);
      return server;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  }
  server.kill();
  throw new Error("Server did not start in time");
}

/** New browser context, signed in through the real password gate. */
async function openContext(browser, password, theme, extra) {
  const context = await browser.newContext({ colorScheme: theme, ...extra });
  const login = await context.request.post(`${origin}/api/auth`, { data: { password } });
  if (!login.ok()) throw new Error(`Login failed with status ${login.status()}`);
  // next-themes reads this before first paint.
  await context.addInitScript((value) => {
    try {
      localStorage.setItem("theme", value);
    } catch {}
  }, theme);
  return context;
}

async function visit(page, url) {
  const response = await page.goto(url, { waitUntil: "networkidle" });
  if (!response || !response.ok()) throw new Error(`${url} returned ${response?.status()}`);
  await page.waitForTimeout(wait);
}

async function captureThumbnails(browser, password, slug) {
  for (const theme of ["light", "dark"]) {
    const context = await openContext(browser, password, theme, THUMB);
    const page = await context.newPage();
    await visit(page, `${origin}/prototypes/${slug}`);
    await page.screenshot({ path: thumbnailPath(slug, theme), type: "jpeg", quality: 82 });
    await context.close();
  }
  console.log(`thumbnails  ${slug}`);
}

async function captureOg(browser, password, slug) {
  const context = await openContext(browser, password, "dark", {
    viewport: OG,
    recordVideo: { dir: OG_DIR, size: OG },
  });
  const page = await context.newPage();
  // The public route, exactly as a visitor following the link sees it.
  await visit(page, `${origin}/p/${slug}`);
  await page.screenshot({ path: ogImagePath(slug), type: "png" });
  await page.waitForTimeout(VIDEO_SECONDS * 1000);
  const video = page.video();
  await context.close();

  const webm = path.join(OG_DIR, `${slug}.webm`);
  const mp4 = path.join(OG_DIR, `${slug}.mp4`);
  fs.renameSync(await video.path(), webm);
  // mp4 plays in far more link previews than webm. Needs ffmpeg on PATH.
  const hasFfmpeg = spawnSync("ffmpeg", ["-version"]).status === 0;
  if (hasFfmpeg) {
    execFileSync("ffmpeg", [
      "-y", "-loglevel", "error", "-sseof", `-${VIDEO_SECONDS}`, "-i", webm,
      "-c:v", "libx264", "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an", mp4,
    ]);
    fs.rmSync(webm);
  } else {
    console.warn(`ffmpeg not found: kept ${slug}.webm instead of mp4`);
  }
  console.log(`share       ${slug}`);
}

async function main() {
  const selected = selectPrototypes();
  if (selected.length === 0) {
    console.log(ogMode ? "No public prototypes to capture." : "Nothing to capture.");
    return;
  }

  fs.mkdirSync(THUMBNAILS_DIR, { recursive: true });
  fs.mkdirSync(OG_DIR, { recursive: true });

  if (!flag("no-build")) {
    console.log("Building...");
    execFileSync(process.execPath, [nextBin, "build"], { cwd: ROOT, stdio: "inherit" });
  }

  // A throwaway password: the capture goes through the same gate as production.
  const password = crypto.randomBytes(16).toString("hex");
  const server = await startServer(password);
  const browser = await chromium.launch();
  try {
    for (const { slug } of selected) {
      if (ogMode) await captureOg(browser, password, slug);
      else await captureThumbnails(browser, password, slug);
    }
  } finally {
    await browser.close();
    server.kill();
  }
  console.log("Done. Look at the images before committing.");
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
