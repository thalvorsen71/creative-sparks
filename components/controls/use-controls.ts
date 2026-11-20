"use client";

import { useCallback, useMemo } from "react";
import { useStoredState } from "@/lib/storage";
import {
  defaultValues,
  randomValues,
  sanitizeValues,
  type ControlSchema,
  type ControlValues,
} from "./schema";

export type Controls<S extends ControlSchema> = {
  schema: S;
  values: ControlValues<S>;
  set: <K extends keyof S>(key: K, value: ControlValues<S>[K]) => void;
  reset: () => void;
  randomize: () => void;
};

/**
 * State for a control schema, persisted to localStorage.
 * `storageKey` must be namespaced per prototype, e.g. "flow-field:controls".
 * Define `schema` at module level (data.ts) so its identity is stable.
 */
export function useControls<S extends ControlSchema>(storageKey: string, schema: S): Controls<S> {
  const defaults = useMemo(() => defaultValues(schema), [schema]);
  const [values, setValues, clear] = useStoredState(storageKey, defaults, (stored) =>
    sanitizeValues(schema, stored),
  );

  const set = useCallback(
    <K extends keyof S>(key: K, value: ControlValues<S>[K]) => setValues({ ...values, [key]: value }),
    [values, setValues],
  );
  const randomize = useCallback(
    () => setValues(randomValues(schema, values)),
    [schema, values, setValues],
  );

  return { schema, values, set, reset: clear, randomize };
}
