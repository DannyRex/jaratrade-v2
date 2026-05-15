"use client";

import { useSyncExternalStore } from "react";

/**
 * Returns `false` during SSR and the first client render, then `true` after
 * hydration. Use this when you need to conditionally render client-only state
 * (auth, cart counts, theme) without tripping React 19's
 * `react-hooks/set-state-in-effect` lint rule.
 *
 * Idiomatic alternative to `useEffect(() => setMounted(true), [])`.
 */
const noopSubscribe = () => () => {};

export function useHydrated(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,   // client snapshot
    () => false,  // server snapshot - keeps SSR markup stable
  );
}
