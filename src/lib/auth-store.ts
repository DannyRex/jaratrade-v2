"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { auth } from "./api";
import type { Role, UserProfile } from "./types";

interface AuthState {
  token: string | null;
  role: Role | null;
  user: UserProfile | null;
  isHydrated: boolean;
  signIn: (token: string, role: Role, user: UserProfile) => void;
  signOut: () => void;
  updateUser: (patch: Partial<UserProfile>) => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      role: null,
      user: null,
      isHydrated: false,
      signIn: (token, role, user) => {
        auth.set(token, role);
        set({ token, role, user });
      },
      signOut: () => {
        auth.clear();
        set({ token: null, role: null, user: null });
      },
      updateUser: (patch) =>
        set((s) => (s.user ? { user: { ...s.user, ...patch } } : s)),
    }),
    {
      name: "jara-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ token: s.token, role: s.role, user: s.user }),
      onRehydrateStorage: () => (state) => {
        if (state) state.isHydrated = true;
      },
    },
  ),
);

export function useIsAuthed() {
  return useAuth((s) => Boolean(s.token));
}
