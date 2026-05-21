"use client";

import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { publicApi, importerApi, exporterApi, adminApi, authApi } from "./api";
import { useAuth } from "./auth-store";
import type { Role, UserProfile } from "./types";

// ------------------------------- Public --------------------------------------

export const queryKeys = {
  home: ["home"] as const,
  metrics: ["metrics"] as const,
  products: (filters?: object) => ["products", filters ?? {}] as const,
  product: (id: string) => ["product", id] as const,
  categories: ["categories"] as const,
  markets: ["markets"] as const,
  banks: ["banks"] as const,
  logistics: ["logistics"] as const,
  importerPlans: ["plans", "importer"] as const,
  exporterPlans: ["plans", "exporter"] as const,
  importerProfile: ["importer", "profile"] as const,
  importerOrders: ["importer", "orders"] as const,
  importerOrder: (id: string) => ["importer", "orders", id] as const,
  importerFavourites: (page?: number) => ["importer", "favourites", page] as const,
  importerShipping: ["importer", "shipping"] as const,
  importerTransactions: ["importer", "transactions"] as const,
  exporterProfile: ["exporter", "profile"] as const,
  exporterStores: ["exporter", "stores"] as const,
  exporterProducts: ["exporter", "products"] as const,
  adminMarkets: ["admin", "markets"] as const,
  adminBanks: ["admin", "banks"] as const,
  adminCategories: ["admin", "categories"] as const,
  adminLogistics: ["admin", "logistics"] as const,
  adminExporterSubscriptions: ["admin", "subs", "exporter"] as const,
  // v2.5
  importerDisputes: (status?: string) => ["importer", "disputes", status ?? "all"] as const,
  importerDispute: (id: string) => ["importer", "disputes", id] as const,
  exporterDisputes: (status?: string) => ["exporter", "disputes", status ?? "all"] as const,
  exporterDispute: (id: string) => ["exporter", "disputes", id] as const,
  importerSubscription: ["importer", "subscription"] as const,
  exporterSubscription: ["exporter", "subscription"] as const,
  adminDisputes: (status?: string) => ["admin", "disputes", status ?? "all"] as const,
};

export const useHome = () =>
  useQuery({ queryKey: queryKeys.home, queryFn: publicApi.home, staleTime: 5 * 60 * 1000 });

export const useMetrics = () =>
  useQuery({
    queryKey: queryKeys.metrics,
    queryFn: publicApi.metrics,
    // Counts move slowly; refetching every five minutes is plenty.
    staleTime: 5 * 60 * 1000,
  });

export const useProducts = (filters?: Parameters<typeof publicApi.products>[0]) =>
  useQuery({
    queryKey: queryKeys.products(filters),
    queryFn: () => publicApi.products(filters),
    placeholderData: keepPreviousData,
  });

export const useProduct = (id: string | null | undefined) =>
  useQuery({
    queryKey: queryKeys.product(id ?? ""),
    queryFn: () => publicApi.product(id!),
    enabled: Boolean(id),
  });

export const useCategories = () =>
  useQuery({ queryKey: queryKeys.categories, queryFn: publicApi.categories, staleTime: 30 * 60 * 1000 });

export const useMarkets = () =>
  useQuery({ queryKey: queryKeys.markets, queryFn: publicApi.markets, staleTime: 30 * 60 * 1000 });

export const useBanks = () =>
  useQuery({ queryKey: queryKeys.banks, queryFn: publicApi.banks, staleTime: 60 * 60 * 1000 });

export const useLogistics = () =>
  useQuery({
    queryKey: queryKeys.logistics,
    queryFn: publicApi.logistics,
    retry: 0, // backend currently 500s - fail fast and let UI fall back
    staleTime: 5 * 60 * 1000,
  });

export const useImporterPlans = () =>
  useQuery({ queryKey: queryKeys.importerPlans, queryFn: publicApi.importerPlans });

export const useExporterPlans = () =>
  useQuery({ queryKey: queryKeys.exporterPlans, queryFn: publicApi.exporterPlans });

// ------------------------------- Auth ----------------------------------------

export function useLogin() {
  const signIn = useAuth((s) => s.signIn);
  return useMutation({
    mutationFn: (vars: { role: Role; email: string; password: string }) =>
      authApi.login(vars.role, vars.email, vars.password),
    onSuccess: (data, vars) => {
      // 2FA challenge: backend returns {requires_2fa: true, email} instead of a token.
      // The login page handles this by switching to a 2FA-code input.
      if ("requires_2fa" in data) return;
      // Email-verification gate: same shape, different flag. Login page
      // redirects to /auth/verify-email; nothing to store here.
      if ("requires_verification" in data) return;
      const { token, ...userFields } = data;
      signIn(token, vars.role, userFields as UserProfile);
    },
  });
}

export function useLoginWith2FA() {
  const signIn = useAuth((s) => s.signIn);
  return useMutation({
    mutationFn: (vars: { role: Role; email: string; password: string; code: string }) =>
      authApi.loginWith2FA(vars.email, vars.password, vars.code),
    onSuccess: (data, vars) => {
      const { token, ...userFields } = data;
      signIn(token, vars.role, userFields as UserProfile);
    },
  });
}

export function useLogout() {
  const signOut = useAuth((s) => s.signOut);
  const qc = useQueryClient();
  return () => {
    signOut();
    qc.clear();
  };
}

// ------------------------------- Importer ------------------------------------

export const useImporterProfile = () => {
  const isAuthed = useAuth((s) => Boolean(s.token) && s.role === "importer");
  return useQuery({
    queryKey: queryKeys.importerProfile,
    queryFn: importerApi.profile,
    enabled: isAuthed,
  });
};

export const useImporterOrders = () => {
  const isAuthed = useAuth((s) => Boolean(s.token) && s.role === "importer");
  return useQuery({
    queryKey: queryKeys.importerOrders,
    queryFn: importerApi.viewOrders,
    enabled: isAuthed,
  });
};

export const useImporterFavourites = (page = 1) => {
  const isAuthed = useAuth((s) => Boolean(s.token) && s.role === "importer");
  return useQuery({
    queryKey: queryKeys.importerFavourites(page),
    queryFn: () => importerApi.favourites(page),
    enabled: isAuthed,
  });
};

export const useImporterShipping = () => {
  const isAuthed = useAuth((s) => Boolean(s.token) && s.role === "importer");
  return useQuery({
    queryKey: queryKeys.importerShipping,
    queryFn: importerApi.getShipping,
    enabled: isAuthed,
  });
};

export const useImporterTransactions = () => {
  const isAuthed = useAuth((s) => Boolean(s.token) && s.role === "importer");
  return useQuery({
    queryKey: queryKeys.importerTransactions,
    queryFn: importerApi.transactionHistory,
    enabled: isAuthed,
  });
};

// ------------------------------- Exporter ------------------------------------

export const useExporterProducts = () => {
  const isAuthed = useAuth((s) => Boolean(s.token) && s.role === "exporter");
  return useQuery({
    queryKey: queryKeys.exporterProducts,
    queryFn: exporterApi.getProducts,
    enabled: isAuthed,
  });
};

export const useExporterStores = () => {
  const isAuthed = useAuth((s) => Boolean(s.token) && s.role === "exporter");
  return useQuery({
    queryKey: queryKeys.exporterStores,
    queryFn: exporterApi.getStores,
    enabled: isAuthed,
  });
};

export const useExporterProfile = (range?: { from?: string; to?: string }) => {
  const isAuthed = useAuth((s) => Boolean(s.token) && s.role === "exporter");
  return useQuery({
    queryKey: [...queryKeys.exporterProfile, range],
    queryFn: () => exporterApi.profile(range),
    enabled: isAuthed,
  });
};

// ------------------------------- Admin ---------------------------------------

export const useAdminMarkets = () => {
  const isAuthed = useAuth((s) => Boolean(s.token) && s.role === "admin");
  return useQuery({
    queryKey: queryKeys.adminMarkets,
    queryFn: adminApi.getMarkets,
    enabled: isAuthed,
  });
};

export const useAdminBanks = () => {
  const isAuthed = useAuth((s) => Boolean(s.token) && s.role === "admin");
  return useQuery({
    queryKey: queryKeys.adminBanks,
    queryFn: adminApi.getBanks,
    enabled: isAuthed,
  });
};

export const useAdminCategories = () => {
  const isAuthed = useAuth((s) => Boolean(s.token) && s.role === "admin");
  return useQuery({
    queryKey: queryKeys.adminCategories,
    queryFn: adminApi.getCategories,
    enabled: isAuthed,
  });
};

export const useAdminLogistics = () => {
  const isAuthed = useAuth((s) => Boolean(s.token) && s.role === "admin");
  return useQuery({
    queryKey: queryKeys.adminLogistics,
    queryFn: adminApi.getLogistics,
    enabled: isAuthed,
  });
};

// ------------------------------- Disputes (v2.5) -----------------------------

export const useImporterDisputes = (status?: "open" | "in_review" | "resolved" | "rejected") => {
  const isAuthed = useAuth((s) => Boolean(s.token) && s.role === "importer");
  return useQuery({
    queryKey: queryKeys.importerDisputes(status),
    queryFn: () => importerApi.listDisputes(status ? { status } : undefined),
    enabled: isAuthed,
  });
};

export const useImporterDispute = (id: string | null | undefined) => {
  const isAuthed = useAuth((s) => Boolean(s.token) && s.role === "importer");
  return useQuery({
    queryKey: queryKeys.importerDispute(id ?? ""),
    queryFn: () => importerApi.getDispute(id!),
    enabled: isAuthed && Boolean(id),
  });
};

export const useExporterDisputes = (status?: "open" | "in_review" | "resolved" | "rejected") => {
  const isAuthed = useAuth((s) => Boolean(s.token) && s.role === "exporter");
  return useQuery({
    queryKey: queryKeys.exporterDisputes(status),
    queryFn: () => exporterApi.listDisputes(status ? { status } : undefined),
    enabled: isAuthed,
  });
};

export const useExporterDispute = (id: string | null | undefined) => {
  const isAuthed = useAuth((s) => Boolean(s.token) && s.role === "exporter");
  return useQuery({
    queryKey: queryKeys.exporterDispute(id ?? ""),
    queryFn: () => exporterApi.getDispute(id!),
    enabled: isAuthed && Boolean(id),
  });
};

export const useAdminDisputes = (status?: "open" | "in_review" | "resolved" | "rejected") => {
  const isAuthed = useAuth((s) => Boolean(s.token) && s.role === "admin");
  return useQuery({
    queryKey: queryKeys.adminDisputes(status),
    queryFn: () => adminApi.listDisputes({ status }),
    enabled: isAuthed,
    // Keep the previous tab's data (and dispute counts) on screen while the
    // newly-selected status loads, so the tab counters don't flicker away.
    placeholderData: (prev) => prev,
  });
};

// ------------------------------- Subscription (v2.5) -------------------------

export const useImporterSubscription = () => {
  const isAuthed = useAuth((s) => Boolean(s.token) && s.role === "importer");
  return useQuery({
    queryKey: queryKeys.importerSubscription,
    queryFn: importerApi.getSubscription,
    enabled: isAuthed,
  });
};

export const useExporterSubscription = () => {
  const isAuthed = useAuth((s) => Boolean(s.token) && s.role === "exporter");
  return useQuery({
    queryKey: queryKeys.exporterSubscription,
    queryFn: exporterApi.getSubscription,
    enabled: isAuthed,
  });
};
