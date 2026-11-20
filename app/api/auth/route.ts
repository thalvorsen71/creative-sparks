import { NextResponse } from "next/server";
import { AUTH_COOKIE, AUTH_MAX_AGE, safeEqual, tokenFor } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const expected = process.env.SITE_PASSWORD;
    if (!expected) {
      return NextResponse.json(
        { error: "SITE_PASSWORD is not set on the server." },
        { status: 503 },
      );
    }

    const body = await request.json().catch(() => null);
    const password = typeof body?.password === "string" ? body.password : "";

    const [given, wanted] = await Promise.all([tokenFor(password), tokenFor(expected)]);
    if (!safeEqual(given, wanted)) {
      // Slow down guessing a little.
      await new Promise((resolve) => setTimeout(resolve, 600));
      return NextResponse.json({ error: "Wrong password." }, { status: 401 });
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set(AUTH_COOKIE, wanted, {
      httpOnly: true,
      sameSite: "lax",
      secure: new URL(request.url).protocol === "https:" || !!process.env.VERCEL,
      path: "/",
      maxAge: AUTH_MAX_AGE,
    });
    return response;
  } catch (error) {
    console.error("[auth] login failed:", error);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(AUTH_COOKIE);
  return response;
}
