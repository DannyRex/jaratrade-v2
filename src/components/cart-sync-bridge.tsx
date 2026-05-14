"use client";

/**
 * Watches the local cart and syncs it to the server (debounced) for authed importers.
 * Mounts once in providers tree.
 */
import { useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth-store";
import { useCart } from "@/lib/cart-store";

const SYNC_DEBOUNCE_MS = 800;

export function CartSyncBridge() {
  const items = useCart((s) => s.items);
  const syncToServer = useCart((s) => s.syncToServer);
  const token = useAuth((s) => s.token);
  const role = useAuth((s) => s.role);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!token || role !== "importer") return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      syncToServer();
    }, SYNC_DEBOUNCE_MS);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [items, token, role, syncToServer]);

  return null;
}
