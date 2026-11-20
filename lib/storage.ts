"use client";

import { useCallback, useMemo, useState, useSyncExternalStore } from "react";

// Safe localStorage for prototypes. Every access is wrapped in try/catch, the
// server render always sees the fallback, and stored values load right after
// hydration. Namespace keys per prototype: "<slug>:<name>".

const listeners = new Map<string, Set<() => void>>();
// Mirrors writes so state still works when storage is blocked (private mode).
const memory = new Map<string, string>();

function read(key: string): string | null {
  const local = memory.get(key);
  if (local !== undefined) return local;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, raw: string | null) {
  try {
    if (raw === null) localStorage.removeItem(key);
    else localStorage.setItem(key, raw);
    memory.delete(key);
  } catch {
    if (raw === null) memory.delete(key);
    else memory.set(key, raw);
  }
  listeners.get(key)?.forEach((notify) => notify());
}

/**
 * useState that persists to localStorage.
 * `sanitize` receives whatever JSON was stored (possibly from an older
 * version of the prototype) and must return a valid value.
 */
export function useStoredState<T>(
  key: string,
  fallback: T,
  sanitize: (stored: unknown) => T = (stored) => stored as T,
): [T, (value: T) => void, () => void] {
  // Captured once: callers may pass fresh objects or closures on every render.
  const [stable] = useState({ fallback, sanitize });

  const subscribe = useCallback(
    (notify: () => void) => {
      const set = listeners.get(key) ?? new Set();
      listeners.set(key, set);
      set.add(notify);
      const onStorage = (event: StorageEvent) => event.key === key && notify();
      window.addEventListener("storage", onStorage);
      return () => {
        set.delete(notify);
        window.removeEventListener("storage", onStorage);
      };
    },
    [key],
  );

  const raw = useSyncExternalStore(
    subscribe,
    () => read(key),
    () => null,
  );

  const value = useMemo(() => {
    if (raw === null) return stable.fallback;
    try {
      return stable.sanitize(JSON.parse(raw));
    } catch {
      return stable.fallback;
    }
  }, [raw, stable]);

  const setValue = useCallback((next: T) => write(key, JSON.stringify(next)), [key]);
  const clear = useCallback(() => write(key, null), [key]);

  return [value, setValue, clear];
}
