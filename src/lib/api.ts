/**
 * Typed API client for the Jaratrade backend (api.jaratrade.com).
 *
 * Design notes:
 *  - The backend wraps successes in `{status, message, payload}`. Some endpoints
 *    double-wrap (e.g. `/public/data/category` returns
 *    `{status, message, payload: {status, message, payload: {rows: [...]}}}`).
 *    `unwrap()` handles both shapes transparently.
 *  - Auth is a Bearer JWT issued by the role-specific login endpoint.
 *    We persist the token + role in cookies (not localStorage) so the server can
 *    read it during SSR.
 *  - All POST/PUT/PATCH mutations expect multipart/form-data bodies.
 *    `multipart()` builds FormData from a plain object, skipping null/undefined.
 */

import Cookies from "js-cookie";
import type {
  ApiEnvelope,
  Bank,
  Category,
  Dispute,
  DisputeReason,
  ExporterPlan,
  ExporterProfile,
  HomeData,
  ImporterPlan,
  LogisticsCompany,
  Market,
  Order,
  PagedData,
  PagedRows,
  ProductDetail,
  ProductSummary,
  Role,
  ShippingAddress,
  Store,
  FlutterwavePaymentSession,
  LoginPayload,
} from "./types";

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://api.jaratrade.com";
export const API_KEY = process.env.NEXT_PUBLIC_API_KEY ?? "";

const TOKEN_COOKIE = "jara_token";
const ROLE_COOKIE = "jara_role";

export class ApiError extends Error {
  status: number;
  payload?: unknown;
  errors?: string[];
  constructor(message: string, status: number, payload?: unknown, errors?: string[]) {
    super(message);
    this.status = status;
    this.payload = payload;
    this.errors = errors;
  }
}

// -----------------------------------------------------------------------------
// Auth state (cookie-backed so SSR can read it)
// -----------------------------------------------------------------------------

export const auth = {
  getToken(): string | null {
    if (typeof document === "undefined") return null;
    return Cookies.get(TOKEN_COOKIE) ?? null;
  },
  getRole(): Role | null {
    if (typeof document === "undefined") return null;
    return (Cookies.get(ROLE_COOKIE) as Role | undefined) ?? null;
  },
  set(token: string, role: Role) {
    Cookies.set(TOKEN_COOKIE, token, {
      expires: 7,
      sameSite: "lax",
      secure: typeof window !== "undefined" && window.location.protocol === "https:",
    });
    Cookies.set(ROLE_COOKIE, role, {
      expires: 7,
      sameSite: "lax",
      secure: typeof window !== "undefined" && window.location.protocol === "https:",
    });
  },
  clear() {
    Cookies.remove(TOKEN_COOKIE);
    Cookies.remove(ROLE_COOKIE);
  },
};

// -----------------------------------------------------------------------------
// Core request
// -----------------------------------------------------------------------------

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: BodyInit | object | null;
  query?: Record<string, string | number | boolean | undefined | null>;
  headers?: Record<string, string>;
  /** When true (default), unwrap the standard {status, message, payload} envelope. */
  unwrap?: boolean;
  /** Skip Authorization header even if a token is set. */
  skipAuth?: boolean;
  /** AbortController signal for cancellation. */
  signal?: AbortSignal;
  /** Cache hint forwarded to fetch (used by RSC). */
  cache?: RequestCache;
  /** Revalidate hint forwarded to next-fetch. */
  next?: { revalidate?: number | false; tags?: string[] };
}

function buildUrl(path: string, query?: RequestOptions["query"]): string {
  const url = new URL(path.startsWith("http") ? path : `${API_URL}${path}`);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v === undefined || v === null || v === "") continue;
      url.searchParams.set(k, String(v));
    }
  }
  return url.toString();
}

function unwrapEnvelope<T>(json: unknown): T {
  // Handle double-wrapped envelopes (some /public/data/* endpoints).
  if (
    json &&
    typeof json === "object" &&
    "payload" in json &&
    json.payload &&
    typeof json.payload === "object" &&
    "status" in (json.payload as object) &&
    "payload" in (json.payload as object)
  ) {
    return (json as ApiEnvelope<ApiEnvelope<T>>).payload.payload;
  }
  if (json && typeof json === "object" && "payload" in json) {
    return (json as ApiEnvelope<T>).payload;
  }
  return json as T;
}

export async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, query, headers = {}, unwrap = true, skipAuth, signal, cache, next } = opts;
  const url = buildUrl(path, query);

  const reqHeaders: Record<string, string> = { Accept: "application/json", ...headers };

  if (!skipAuth) {
    const token = auth.getToken();
    if (token) reqHeaders.Authorization = `Bearer ${token}`;
  }
  if (API_KEY && !reqHeaders["X-API-KEY"]) {
    reqHeaders["X-API-KEY"] = API_KEY;
  }

  let bodyInit: BodyInit | null | undefined;
  if (body instanceof FormData || body instanceof URLSearchParams || typeof body === "string" || body === null) {
    bodyInit = body as BodyInit | null;
  } else if (body !== undefined) {
    // Plain object - encode as JSON unless caller passed a FormData
    bodyInit = JSON.stringify(body);
    reqHeaders["Content-Type"] = "application/json";
  }

  const res = await fetch(url, { method, headers: reqHeaders, body: bodyInit, signal, cache, next });
  let json: unknown = null;
  const text = await res.text();
  if (text) {
    try {
      json = JSON.parse(text);
    } catch {
      json = text;
    }
  }

  if (!res.ok) {
    const env = (json && typeof json === "object" ? json : null) as
      | { message?: string; errors?: string[] }
      | null;
    const message = env?.errors?.[0] ?? env?.message ?? `Request failed (${res.status})`;
    throw new ApiError(message, res.status, json, env?.errors);
  }

  // Application-level error (status:false) - surface as ApiError too
  if (json && typeof json === "object" && "status" in json && (json as { status: boolean }).status === false) {
    const env = json as { message?: string; errors?: string[] };
    throw new ApiError(env.message ?? "Request failed", res.status, json, env.errors);
  }

  return unwrap ? unwrapEnvelope<T>(json) : (json as T);
}

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

export function multipart(payload: Record<string, unknown>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(payload)) {
    if (v === undefined || v === null) continue;
    if (Array.isArray(v)) {
      for (const item of v) fd.append(k, item as string | Blob);
    } else if (v instanceof Blob || v instanceof File) {
      fd.append(k, v);
    } else if (typeof v === "object") {
      fd.append(k, JSON.stringify(v));
    } else {
      fd.append(k, String(v));
    }
  }
  return fd;
}

// -----------------------------------------------------------------------------
// Public reference data (no auth required)
// -----------------------------------------------------------------------------

/** Live marketing metrics. Surfaces on the homepage hero + body copy. */
export interface PublicMetrics {
  verified_exporters: number;
  active_skus: number;
  markets: number;
  categories: number;
}

export const publicApi = {
  home: () => request<HomeData>("/public"),
  metrics: () => request<PublicMetrics>("/public/metrics"),
  products: (params?: { category?: string; p?: number; len?: number; sort_by?: string; exporter?: string; store?: string }) =>
    request<PagedData<ProductSummary>>("/public/products", { query: params }),
  product: (id: string) => request<ProductDetail>(`/public/products/${id}`),
  categories: () => request<PagedRows<Category>>("/public/data/category"),
  markets: () => request<PagedRows<Market>>("/public/data/market"),
  banks: () => request<PagedRows<Bank>>("/public/data/bank"),
  logistics: () => request<PagedRows<LogisticsCompany>>("/public/data/logistics"),
  importerPlans: () => request<PagedRows<ImporterPlan>>("/public/data/importer_plan"),
  exporterPlans: () => request<PagedRows<ExporterPlan>>("/public/data/exporter_plan"),
  saveProductView: (id: string) => request(`/public/${id}`, { method: "POST" }),
  support: (payload: { firstname: string; lastname: string; phone: string; email: string; subject: string; message: string }) =>
    request("/public/support", { method: "POST", body: multipart(payload), skipAuth: true }),
  resetPassword: (email: string, user_type: Exclude<Role, "admin">) =>
    request("/public/auth/password_reset", { method: "POST", body: multipart({ email, user_type }), skipAuth: true }),
  changePassword: (payload: { code: string; new_password: string; user_type: Exclude<Role, "admin"> }) =>
    request("/public/auth/change_password", { method: "POST", body: multipart(payload), skipAuth: true }),
  verifyResetCode: (code: string, user_type: Exclude<Role, "admin">) =>
    request("/public/auth/password_reset", { query: { code, user_type }, skipAuth: true }),
};

// -----------------------------------------------------------------------------
// Auth (login + register, per role)
// -----------------------------------------------------------------------------

/**
 * Login response - either a full LoginPayload (token + user fields) OR a 2FA
 * challenge ({requires_2fa: true, email}). The frontend branches on this.
 */
export type LoginResponse =
  | LoginPayload
  | { requires_2fa: true; email: string }
  | { requires_verification: true; email: string; role: Role };

export const authApi = {
  login: (role: Role, email: string, password: string) => {
    const path = role === "admin" ? "/adm/login" : role === "exporter" ? "/exp/login" : "/imp/login";
    return request<LoginResponse>(path, { method: "POST", body: { email, password }, skipAuth: true, unwrap: true });
  },
  loginWith2FA: (email: string, password: string, code: string) =>
    request<LoginPayload>("/auth/2fa/login", { method: "POST", body: { email, password, code }, skipAuth: true }),
  twoFactorEnroll: () =>
    request<{ secret: string; uri: string; issuer: string; label: string }>("/auth/2fa/enroll", { method: "POST" }),
  twoFactorConfirm: (code: string) =>
    request("/auth/2fa/confirm", { method: "POST", body: multipart({ code }) }),
  twoFactorDisable: (password: string) =>
    request("/auth/2fa/disable", { method: "POST", body: multipart({ password }) }),
  registerImporter: (payload: Record<string, unknown>) =>
    request("/imp/register", { method: "PUT", body: multipart(payload), skipAuth: true }),
  registerExporter: (payload: Record<string, unknown>) =>
    request("/exp/register", { method: "PUT", body: multipart(payload), skipAuth: true }),
  registerAdmin: (payload: Record<string, unknown>) =>
    request("/adm/register", { method: "POST", body: multipart(payload) }),
  verifyAccount: (role: Exclude<Role, "admin">, code: string) => {
    const prefix = role === "exporter" ? "/exp" : "/imp";
    return request(`${prefix}/account_verification`, { method: "POST", body: multipart({ code }), skipAuth: true });
  },
  requestVerificationEmail: (role: Exclude<Role, "admin">, email: string) => {
    const prefix = role === "exporter" ? "/exp" : "/imp";
    return request(`${prefix}/account_verification`, { query: { email, u: role }, skipAuth: true });
  },
};

// -----------------------------------------------------------------------------
// Importer
// -----------------------------------------------------------------------------

export const importerApi = {
  profile: () => request<unknown>("/imp/profile"),
  updateProfile: (payload: Record<string, unknown>) =>
    request("/imp/profile", { method: "POST", body: multipart(payload) }),
  favourites: (page = 1, size = 12) =>
    request<unknown>("/imp/profile", { query: { fav_prod: 1, p: page, size } }),
  reviews: () => request<unknown>("/imp/profile", { query: { reviews: 1 } }),
  postReview: (payload: { exporter_id: string; rating: number; comment?: string; order_id?: string }) =>
    request("/imp/profile/review", { method: "POST", body: multipart(payload) }),

  // Cart
  addToCart: (payload: { product_id: string; quantity: number; unit?: string }) =>
    request<{ cart_id: string }>("/imp/cart", { method: "POST", body: multipart(payload) }),
  syncCart: (items: Array<{ product_id: string; quantity: number; unit?: string }>, replace = true) =>
    request<{ id: string; items: Array<unknown>; total: string }>("/imp/cart/sync", {
      method: "POST",
      body: { items, replace },
    }),
  removeFromCart: (cartId: string, product_id: string) =>
    request(`/imp/cart/${cartId}`, { method: "DELETE", query: { product_id } }),
  clearCart: (cartId: string) => request(`/imp/cart/${cartId}`, { method: "DELETE" }),
  viewCart: (cartId: string) => request<unknown>(`/imp/cart/${cartId}`),
  viewAllCarts: () => request<unknown>("/imp/cart"),

  // Orders
  createOrder: (payload: { cart_id: string; logistic_id?: string; delivery_info: Record<string, unknown> }) =>
    request<{ order_id: string }>("/imp/order", { method: "POST", body: multipart(payload) }),
  viewOrders: () => request<PagedData<Order>>("/imp/order"),
  getOrder: (id: string) => request<Order>(`/imp/order/${id}`),
  deleteOrder: (id: string) => request(`/imp/order/${id}`, { method: "DELETE" }),
  /** Buyer confirms they received the order - releases payout immediately. */
  confirmReceipt: (id: string) =>
    request<{ confirmed_received_at: string; already_confirmed: boolean }>(
      `/imp/order/${id}/confirm-receipt`,
      { method: "POST" },
    ),

  // Payments
  initPayment: (orderId: string) =>
    request<FlutterwavePaymentSession>("/imp/payment/init", { method: "POST", body: multipart({ order_id: orderId }) }),
  verifyPayment: (txRef: string) => request("/imp/payment/verify", { query: { tx_ref: txRef } }),
  /** Flutterwave Standard (hosted) checkout - server creates a session,
   *  returns a URL the browser redirects to. Used when the inline
   *  modal can't load reliably (CDN flakes, browser extensions, etc). */
  initPaymentStandard: (orderId: string) =>
    request<{ link: string; tx_ref: string }>("/imp/payment/init_standard", {
      method: "POST",
      body: multipart({ order_id: orderId }),
    }),
  transactionHistory: () => request<PagedData<unknown>>("/imp/payment"),

  // Shipping
  getShipping: () => request<ShippingAddress[]>("/imp/shipping"),
  addShipping: (payload: Omit<ShippingAddress, "id">) =>
    request("/imp/shipping", { method: "POST", body: multipart(payload) }),
  updateShipping: (id: string, payload: Partial<ShippingAddress>) =>
    request(`/imp/shipping/${id}`, { method: "PATCH", body: multipart(payload) }),

  // Subscription
  getSubscription: () => request<SubscriptionState>("/imp/subscription"),
  upgradeSubscription: (planId: string) =>
    request<SubscriptionUpgradeResponse>("/imp/subscription/upgrade", {
      method: "POST",
      body: multipart({ plan_id: planId }),
    }),
  verifySubscription: (txRef: string) =>
    request<SubscriptionDTO>("/imp/subscription/verify", { method: "POST", body: multipart({ tx_ref: txRef }) }),
  cancelSubscription: () =>
    request<SubscriptionDTO>("/imp/subscription/cancel", { method: "POST" }),

  // Disputes (added v2.5)
  raiseDispute: (
    orderId: string,
    payload: { reason: DisputeReason; description: string },
  ) =>
    request<Dispute>(`/imp/order/${orderId}/dispute`, {
      method: "POST",
      body: multipart(payload),
    }),
  listDisputes: (params?: { status?: "open" | "in_review" | "resolved" | "rejected" }) =>
    request<PagedRows<Dispute>>("/imp/disputes", { query: params }),
  getDispute: (id: string) => request<Dispute>(`/imp/disputes/${id}`),
};

// -----------------------------------------------------------------------------
// Exporter
// -----------------------------------------------------------------------------

export const exporterApi = {
  profile: (range?: { from?: string; to?: string }) =>
    request<ExporterProfile>("/exp/profile", { query: range }),
  updateProfile: (payload: Record<string, unknown>) =>
    request("/exp/profile", { method: "POST", body: multipart(payload) }),
  changePassword: (payload: { old_password: string; new_password: string }) =>
    request("/exp/change_password", { method: "POST", body: multipart(payload) }),
  /** Hand the completed business profile to admin for KYC review. */
  submitForReview: () =>
    request<{ kyc_status: string; kyc_submitted_at: string }>(
      "/exp/submit-for-review",
      { method: "POST" },
    ),
  /** Upload a KYC proof document. docType: "id" (means of ID) or "cac"
   *  (registration certificate). Returns the stored URL + full doc map. */
  uploadKycDocument: (docType: "id" | "cac", file: File) =>
    request<{ doc_type: string; url: string; documents: Record<string, string> }>(
      "/exp/kyc-document",
      { method: "POST", body: multipart({ doc_type: docType, file }) },
    ),

  // Stores
  getStores: () => request<PagedData<Store>>("/exp/store"),
  createStore: (payload: { market_id: string; address: string }) =>
    request("/exp/store", { method: "PUT", body: multipart(payload) }),
  deleteStore: (id: string) => request(`/exp/store/${id}`, { method: "DELETE" }),

  // Products
  getProducts: () => request<PagedData<ProductSummary>>("/exp/product"),
  addProduct: (payload: Record<string, unknown>) =>
    request("/exp/product", { method: "PUT", body: multipart(payload) }),
  updateProduct: (id: string, payload: Record<string, unknown>) =>
    request(`/exp/product/${id}`, { method: "PATCH", body: multipart(payload) }),
  deleteProduct: (id: string) => request(`/exp/product/${id}`, { method: "DELETE" }),
  addProductImages: (id: string, images: File[]) => {
    const fd = new FormData();
    for (const img of images) fd.append("images[]", img);
    return request(`/exp/product/image/${id}`, { method: "POST", body: fd });
  },
  deleteProductImage: (id: string, image_path: string) =>
    request(`/exp/product/image/${id}`, { method: "DELETE", query: { image_path } }),

  // Orders
  updateOrderStatus: (payload: { order_id: string; status: string }) =>
    request("/exp/update_order", { method: "POST", body: multipart(payload) }),

  // Subscription (mirrors importerApi)
  getSubscription: () => request<SubscriptionState>("/exp/subscription"),
  upgradeSubscription: (planId: string) =>
    request<SubscriptionUpgradeResponse>("/exp/subscription/upgrade", {
      method: "POST",
      body: multipart({ plan_id: planId }),
    }),
  verifySubscription: (txRef: string) =>
    request<SubscriptionDTO>("/exp/subscription/verify", { method: "POST", body: multipart({ tx_ref: txRef }) }),
  cancelSubscription: () =>
    request<SubscriptionDTO>("/exp/subscription/cancel", { method: "POST" }),

  // Inventory (added v2.5)
  confirmInventory: (
    productId: string,
    payload?: { stock_quantity?: number; low_stock_threshold?: number },
  ) =>
    request<ProductSummary>(`/exp/product/${productId}/confirm-inventory`, {
      method: "POST",
      body: multipart(payload ?? {}),
    }),
  confirmInventoryAll: () =>
    request<{ confirmed: number }>("/exp/product/confirm-inventory-all", { method: "POST" }),

  // Disputes - read-only view of disputes filed against this seller (added v2.5.1)
  listDisputes: (params?: { status?: "open" | "in_review" | "resolved" | "rejected" }) =>
    request<PagedRows<Dispute>>("/exp/disputes", { query: params }),
  getDispute: (id: string) => request<Dispute>(`/exp/disputes/${id}`),
};

// -----------------------------------------------------------------------------
// Admin
// -----------------------------------------------------------------------------

export const adminApi = {
  // Subscriptions
  exporterSubscriptions: () => request<unknown>("/adm/exporter_subscription"),
  createExporterPlan: (payload: Record<string, unknown>) =>
    request("/adm/exporter_plan", { method: "PUT", body: multipart(payload) }),
  createImporterPlan: (payload: Record<string, unknown>) =>
    request("/adm/importer_plan", { method: "PUT", body: multipart(payload) }),

  // Markets
  getMarkets: () => request<PagedRows<Market>>("/adm/market"),
  createMarket: (payload: Omit<Market, "id" | "status" | "time_created" | "time_updated">) =>
    request("/adm/market", { method: "PUT", body: multipart(payload) }),
  updateMarket: (id: string, payload: Partial<Market>) =>
    request(`/adm/market/${id}`, { method: "POST", body: multipart(payload) }),
  deleteMarket: (id: string) => request(`/adm/market/${id}`, { method: "DELETE" }),

  // Banks
  getBanks: () => request<PagedRows<Bank>>("/adm/bank"),
  addBank: (payload: Omit<Bank, "id" | "status">) =>
    request("/adm/bank", { method: "PUT", body: multipart(payload) }),
  updateBank: (id: string, payload: Partial<Bank>) =>
    request(`/bank/${id}`, { method: "PATCH", body: multipart(payload) }),
  deleteBank: (id: string) => request(`/bank/${id}`, { method: "DELETE" }),

  // Categories
  getCategories: () => request<PagedRows<Category>>("/adm/category"),
  createCategory: (payload: { name: string; description: string; parent_category?: string | null; image?: string | null }) =>
    request("/adm/category", { method: "PUT", body: multipart(payload) }),
  updateCategory: (id: string, payload: Partial<Category>) =>
    request(`/adm/category/${id}`, { method: "POST", body: multipart(payload) }),
  deleteCategory: (id: string) =>
    request(`/adm/category/${id}`, { method: "POST", body: multipart({ delete: 1 }) }),

  // Orders (admin overview)
  listOrders: (filters?: {
    status?: string;
    q?: string;
    p?: number;
    len?: number;
  }) =>
    request<{
      rows: AdminOrderRow[];
      total_length: number;
      page: number;
      len: number;
    }>("/adm/orders", { query: filters }),
  orderStats: () =>
    request<{
      total_orders: number;
      by_status: Record<string, number>;
      gmv: string;
      pending_payouts: number;
      open_disputes: number;
    }>("/adm/orders/stats"),
  getOrder: (id: string) => request<AdminOrderDetail>(`/adm/orders/${id}`),

  // Logistics
  getLogistics: () => request<PagedRows<LogisticsCompany>>("/adm/logistics"),
  createLogistics: (payload: Omit<LogisticsCompany, "id" | "status">) =>
    request("/adm/logistics", { method: "PUT", body: multipart(payload) }),
  updateLogistics: (id: string, payload: Partial<LogisticsCompany>) =>
    request(`/adm/logistics/${id}`, { method: "POST", body: multipart(payload) }),
  deleteLogistics: (id: string) => request(`/adm/logistics/${id}`, { method: "DELETE" }),
  addLogisticsRate: (payload: Record<string, unknown>) =>
    request("/adm/logistics_rate", { method: "PUT", body: multipart(payload) }),
  viewLogisticsOrders: (filters?: { exporter_id?: string; importer_id?: string; order_id?: string; q?: string }) =>
    request<unknown>("/adm/logistics", { query: filters }),
  updateDeliveryStatus: (orderId: string, payload: { status: string }) =>
    request(`/adm/logistics/${orderId}`, { method: "PATCH", body: multipart(payload) }),

  // Settings — commission account (reference record)
  getCommissionAccount: () =>
    request<{ bank_name?: string; account_name?: string; account_number?: string }>(
      "/settings/commision_account",
    ),
  updateCommissionAccount: (payload: Record<string, unknown>) =>
    request("/settings/commision_account", { method: "PUT", body: multipart(payload) }),

  // Settings — commission rate (the % FLW splits to the platform on every order)
  getCommissionRate: () =>
    request<{
      percent: number;
      decimal_rate: number;
      default: number;
      min: number;
      max: number;
    }>("/settings/commission_rate"),
  updateCommissionRate: (percent: number) =>
    request<{ percent: number; decimal_rate: number }>(
      "/settings/commission_rate",
      { method: "PUT", body: multipart({ percent }) },
    ),

  // Settings — FX rate (NGN ↔ GBP for buyer-side display)
  getFxRate: (from_currency = "NGN", to_currency = "GBP") =>
    request<{
      from: string;
      to: string;
      effective_rate: number | null;
      override_rate: number | null;
      live_rate: number | null;
      fallback_rate: number | null;
      example_1000: number | null;
    }>("/settings/fx_rate", { query: { from_currency, to_currency } }),
  updateFxRate: (from_currency: string, to_currency: string, rate: number) =>
    request<{ from: string; to: string; rate: number }>(
      "/settings/fx_rate",
      { method: "PUT", body: multipart({ from_currency, to_currency, rate }) },
    ),
  clearFxRate: (from_currency = "NGN", to_currency = "GBP") =>
    request("/settings/fx_rate", {
      method: "DELETE",
      query: { from_currency, to_currency },
    }),

  // Subaccount management (v3.5 — Flutterwave integration)
  reprovisionSubaccount: (userId: string) =>
    request<AdminUser>(`/adm/users/${userId}/reprovision-subaccount`, { method: "POST" }),

  // Payouts (v3.5 — manual seller disbursement)
  listPayouts: (params?: { status?: "pending" | "sent" | "completed" | "failed"; p?: number; len?: number }) =>
    request<PagedRows<PayoutRow>>("/adm/payouts", { query: params }),
  eligiblePayouts: () =>
    request<PagedRows<EligiblePayout>>("/adm/payouts/eligible"),
  sendPayout: (orderId: string) =>
    request<PayoutRow>(`/adm/payouts/${orderId}/send`, { method: "POST" }),

  // Logs (logistics-partner-facing - no auth needed in production but token-gated here)
  logsViewOrders: (filters?: { from?: string; to?: string; status?: string }) =>
    request<unknown>("/logs/orders", { query: filters }),
  logsUpdateOrder: (payload: Record<string, unknown>) =>
    request("/logs/orders", { method: "POST", body: multipart(payload) }),

  // Users + KYC (added in v2.1)
  searchUsers: (params?: { role?: Role; is_active?: boolean; kyc_status?: string; q?: string; p?: number; len?: number }) =>
    request<PagedRows<AdminUser>>("/adm/users", { query: params as Record<string, string | number | boolean | undefined | null> }),
  getUser: (id: string) => request<AdminUser>(`/adm/users/${id}`),
  kycQueue: () => request<PagedRows<AdminUser>>("/adm/kyc/queue"),
  kycApprove: (id: string) => request<AdminUser>(`/adm/kyc/${id}/approve`, { method: "POST" }),
  kycReject: (id: string, reason: string) =>
    request<AdminUser>(`/adm/kyc/${id}/reject`, { method: "POST", body: multipart({ reason }) }),
  suspendUser: (id: string, reason?: string) =>
    request(`/adm/users/${id}/suspend`, { method: "POST", body: multipart({ reason: reason ?? "" }) }),
  reactivateUser: (id: string) => request(`/adm/users/${id}/reactivate`, { method: "POST" }),
  /** Manually re-fire the "account approved" email. Useful when the original
   *  send failed silently (SMTP outage, blocked port, etc) and the exporter
   *  is sitting in their inbox waiting on a welcome email that never came. */
  resendApprovalEmail: (id: string) =>
    request<{ sent: boolean }>(`/adm/users/${id}/resend-approval-email`, { method: "POST" }),

  // Disputes (added v2.5)
  listDisputes: (params?: { status?: "open" | "in_review" | "resolved" | "rejected"; p?: number; len?: number }) =>
    request<
      PagedRows<Dispute & { importer_email?: string | null; importer_name?: string | null }> & {
        // Tally of every dispute by status (ignores the status filter) so the
        // admin UI can show counts on each tab.
        counts?: Record<"open" | "in_review" | "resolved" | "rejected", number>;
      }
    >("/adm/disputes", { query: params }),
  acknowledgeDispute: (id: string) =>
    request<Dispute>(`/adm/disputes/${id}/acknowledge`, { method: "POST" }),
  resolveDispute: (
    id: string,
    payload: { resolution: "refund" | "replacement" | "dismissed"; refund_amount?: string; admin_notes?: string },
  ) =>
    request<Dispute>(`/adm/disputes/${id}/resolve`, { method: "POST", body: multipart(payload) }),
  rejectDispute: (id: string, admin_notes?: string) =>
    request<Dispute>(`/adm/disputes/${id}/reject`, { method: "POST", body: multipart({ admin_notes: admin_notes ?? "" }) }),
};

// -----------------------------------------------------------------------------
// Admin User DTO (matches backend `_serialize_user`)
// -----------------------------------------------------------------------------

// -----------------------------------------------------------------------------
// Subscription DTOs (matches backend `_serialize_subscription` + the upgrade
// endpoint's Flutterwave Inline config)
// -----------------------------------------------------------------------------

export interface SubscriptionDTO {
  id: string;
  user_id: string;
  plan_id: string;
  plan_role: "importer" | "exporter";
  plan_title: string | null;
  status: "pending" | "active" | "cancelled" | "expired";
  period_start: string | null;
  period_end: string | null;
  amount: string;
  currency: string;
  tx_ref: string | null;
  cancelled_at: string | null;
  time_created: string;
  /** Stored card metadata (added v2.5) - never the raw token, only the
   * display bits needed for "Visa •4242" UX. */
  card_last4: string | null;
  card_brand: string | null;
  has_payment_token: boolean;
  renewal_failure_count: number;
  last_renewal_attempt_at: string | null;
}

export interface SubscriptionState {
  subscription: SubscriptionDTO | null;
  current_plan: {
    id: string | null;
    title: string | null;
    monthly_subscription_fee: string | null;
    currency: string | null;
    is_default: number | null;
  } | null;
  plan_renewal_date: string | null;
  plan_auto_renew: boolean;
}

/**
 * Response from POST /imp|exp/subscription/upgrade.
 *
 *  - free-tier downgrade: `{ requires_payment: false, plan_id, plan_title }`
 *  - paid plan: full Flutterwave Inline config (public_key, tx_ref, amount, ...)
 *    with our `meta.subscription_id` attached.
 */
export type SubscriptionUpgradeResponse =
  | { requires_payment: false; plan_id: string; plan_title: string }
  | (FlutterwavePaymentSession & {
      requires_payment: true;
      subscription_id: string;
      meta: { type: "subscription"; subscription_id: string; plan_id: string; plan_role: string };
    });

export interface AdminUser {
  id: string;
  role: Role;
  kind: string;
  email: string;
  firstname: string;
  lastname: string;
  fullname: string;
  phone: string | null;
  country: string | null;
  profile_name: string | null;
  is_active: boolean;
  email_verified: boolean;
  kyc_status: "pending" | "approved" | "rejected";
  kyc_submitted_at: string | null;
  kyc_reviewed_at: string | null;
  kyc_rejection_reason: string | null;
  totp_enabled: boolean;
  plan_id: string | null;
  monthly_spent: string;
  review_count: number;
  product_delivered: number;
  business_name: string | null;
  business_email: string | null;
  business_address: string | null;
  business_country: string | null;
  business_reg_number: string | null;
  business_type: string | null;
  annual_turnover: string | null;
  duration_in_business: number | null;
  tin: string | null;
  valid_identification: string | null;
  bank_id: string | null;
  account_name: string | null;
  account_number: string | null;
  /** Uploaded KYC documents — { id?: url, cac?: url }. */
  documents: Record<string, string>;
  flw_subaccount_id?: string | null;
  time_created: string;
}

// v3.5 — Flutterwave payout types
export interface PayoutRow {
  id: string;
  order_id: string;
  order_number: string | null;
  seller_id: string;
  seller_name?: string | null;
  amount: string;
  currency: string;
  reference: string;
  status: "pending" | "sent" | "completed" | "failed";
  failure_reason: string | null;
  initiated_by: string | null;
  time_created: string;
  time_updated: string;
}

/** A single row from GET /adm/orders. Enriched with buyer/seller +
 *  payment/payout state so the admin grid can render everything in one go. */
export interface AdminOrderRow {
  id: string;
  order_id: string;
  status: string;
  total: string;
  currency: string;
  items_count: number;
  time_created: string;
  time_updated: string;
  confirmed_received_at: string | null;
  buyer: { id: string | null; name: string | null; email: string | null };
  seller: { id: string | null; business_name: string | null; email: string | null };
  payment_status: string | null;
  payout_status: "pending" | "sent" | "completed" | "failed" | null;
  has_dispute: boolean;
}

/** Full detail from GET /adm/orders/{id}. Used in the admin detail drawer. */
export interface AdminOrderDetail extends AdminOrderRow {
  platform_fee: string;
  logistics_fee: string;
  shipping_mode: string;
  logistics_id: string | null;
  delivery_info: Record<string, unknown>;
  buyer: AdminOrderRow["buyer"] & { phone: string | null };
  seller: AdminOrderRow["seller"] & { phone: string | null };
  items: Array<{
    id: string;
    product_id: string;
    product_name: string;
    quantity: number;
    unit_price: string;
    subtotal: string;
  }>;
  payments: Array<{
    id: string;
    tx_ref: string;
    amount: string;
    currency: string;
    status: string;
    provider: string;
    time_created: string;
  }>;
  payouts: Array<{
    id: string;
    reference: string;
    amount: string;
    currency: string;
    status: string;
    failure_reason: string | null;
    time_created: string;
  }>;
  dispute: { id: string; status: string; reason: string | null } | null;
}

export interface EligiblePayout {
  order_id: string;
  order_number: string;
  delivered_at: string;
  gross_total: string;
  commission_rate_percent: number;
  seller_share: string;
  currency: string;
  seller_id: string;
  seller_name: string | null;
  seller_bank: string | null;
  seller_account_number: string | null;
  flw_subaccount_id: string | null;
  bank_code: string | null;
}
