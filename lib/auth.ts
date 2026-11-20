// Shared by the proxy and the auth API route. Uses Web Crypto only, so it
// runs in any runtime.

export const AUTH_COOKIE = "playground_auth";
export const AUTH_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

/** The gate is on for every production build, including preview deployments. */
export function gateEnabled(): boolean {
  return process.env.NODE_ENV === "production";
}

/** Cookie value for a given password. Never store the password itself. */
export async function tokenFor(password: string): Promise<string> {
  const data = new TextEncoder().encode(`creative-sparks:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Constant-time string comparison. */
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** True when the cookie value matches the configured SITE_PASSWORD. */
export async function isAuthorized(cookieValue: string | undefined): Promise<boolean> {
  const password = process.env.SITE_PASSWORD;
  // Fail closed: no password configured means nobody gets in.
  if (!password || !cookieValue) return false;
  return safeEqual(cookieValue, await tokenFor(password));
}
