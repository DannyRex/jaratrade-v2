"use client";

import { useSyncExternalStore } from "react";

/**
 * Subscribes to a media query. SSR-safe (always returns `false` on the server).
 *
 * Implemented via `useSyncExternalStore` so we don't trip React 19's
 * `react-hooks/set-state-in-effect` rule — `matchMedia` is exactly the kind
 * of external store this hook is designed for.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = (onChange: () => void) => {
    if (typeof window === "undefined") return () => {};
    const m = window.matchMedia(query);
    m.addEventListener("change", onChange);
    return () => m.removeEventListener("change", onChange);
  };

  const getSnapshot = () => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(query).matches;
  };

  const getServerSnapshot = () => false;

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
