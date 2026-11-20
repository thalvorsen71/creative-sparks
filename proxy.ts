import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIE, gateEnabled, isAuthorized } from "@/lib/auth";

// Built into the bundle by next.config.ts from each prototype's metadata.json.
const PUBLIC_SLUGS = (process.env.PUBLIC_PROTOTYPE_SLUGS ?? "").split(",").filter(Boolean);

function isOpenPath(pathname: string): boolean {
  if (pathname === "/login" || pathname === "/api/auth") return true;
  // Public prototype pages decide for themselves: flagged slugs render,
  // everything else is a plain 404 so private names never leak.
  if (pathname.startsWith("/p/") || pathname.startsWith("/og/")) return true;
  // API routes of public prototypes live at /api/<slug>/...
  return PUBLIC_SLUGS.some(
    (slug) => pathname === `/api/${slug}` || pathname.startsWith(`/api/${slug}/`),
  );
}

export async function proxy(request: NextRequest) {
  if (!gateEnabled()) return NextResponse.next();

  const { pathname, search } = request.nextUrl;
  if (isOpenPath(pathname)) return NextResponse.next();
  if (await isAuthorized(request.cookies.get(AUTH_COOKIE)?.value)) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const login = new URL("/login", request.url);
  if (pathname !== "/") login.searchParams.set("next", pathname + search);
  return NextResponse.redirect(login);
}

export const config = {
  // Everything except Next's own static assets. Thumbnails stay gated.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
