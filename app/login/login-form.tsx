"use client";

import { useState } from "react";
import { Collapse } from "@/components/site/collapse";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SITE_NAME } from "@/lib/site";

/** Only same-site paths are allowed as a post-login destination. */
function nextPath(): string {
  const next = new URLSearchParams(window.location.search).get("next");
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
}

export function LoginForm() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (response.ok) {
        window.location.assign(nextPath());
        return;
      }
      const body = await response.json().catch(() => null);
      setError(body?.error ?? "Could not sign in.");
    } catch {
      setError("Could not reach the server.");
    }
    setPending(false);
  }

  return (
    <form onSubmit={submit} className="flex w-full max-w-xs flex-col gap-3">
      <h1 className="text-base font-medium">{SITE_NAME}</h1>
      <Input
        type="password"
        name="password"
        aria-label="Password"
        placeholder="Password"
        autoComplete="current-password"
        autoFocus
        required
        className="h-11"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        aria-invalid={error ? true : undefined}
      />
      <Collapse open={!!error}>
        <p role="alert" className="text-sm text-destructive">
          {error || " "}
        </p>
      </Collapse>
      <Button type="submit" size="lg" className="h-11" disabled={pending}>
        {pending ? "Signing in" : "Sign in"}
      </Button>
    </form>
  );
}
