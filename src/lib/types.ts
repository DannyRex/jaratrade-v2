/**
 * Jaratrade API types
 * Reverse-engineered from Postman collection + Angular service files + live API probes.
 *
 * Conventions:
 * - All entity IDs are encrypted Fernet tokens (long base64 strings).
 * - Money values come back as strings (e.g. "3000.00") to preserve precision - coerce in UI.
 * - Boolean-ish fields use 0/1 ints (e.g. status, is_featured).
 * - Some endpoints double-wrap the envelope: {status, message, payload: {status, message, payload}}.
 *   The api client unwraps both layers transparently.
 */

export type Role = "importer" | "exporter" | "admin";

export type RegistrationKind = "individual" | "business";

// =============================================================================
// API envelope
// =============================================================================

export interface ApiEnvelope<T> {
  status: boolean;
  message: string;
  payload: T;
  errors?: string[];
}

export interface PagedRows<T> {
  rows: T[];
  total_length: number;
  page: number;
  len: number;
}

export interface PagedData<T> {
  data: T[];
  meta: { paging: { total: number; page: number; len: number } };
}

// =============================================================================
// Auth
// =============================================================================

export interface BusinessProfile {
  business_name: string;
  business_email: string;
  business_address: string;
  business_reg_number: string;
  business_type: string | null;
  annual_turnover: number | null;
  duration_in_business: number | null;
  documents: string;
  tin: string | null;
  valid_identification: string | null;
}

export interface UserProfile {
  id: string;
  firstname: string;
  middlename: string | null;
  lastname: string;
  phone: string;
  address: string;
  city: string | null;
  state: string | null;
  country: string | null;
  dob: string;
  profile_name: string;
  fav_product: string[];
  product_delivered: number;
  review_count: number;
  status: number;
  business: BusinessProfile;
}

export interface LoginPayload extends UserProfile {
  token: string;
}

export interface AuthSession {
  token: string;
  role: Role;
  user: UserProfile;
}

// =============================================================================
// Marketplace entities
// =============================================================================

export interface Category {
  id: string;
  name: string;
  description: string;
  views: number;
  parent_category: string | null;
  image: string | null;
  is_featured: number;
  cat_count?: number;
  status: number;
  time_created: string;
  time_updated: string;
}

export interface Market {
  id: string;
  name: string;
  location: string;
  lga: string;
  city: string;
  state: string;
  country: string;
  status: number;
  time_created: string;
  time_updated: string;
}

export interface Bank {
  id: string;
  name: string;
  description: string;
  country: string;
  paystack_code: string | null;
  flutter_code: string | null;
  status: number;
}

export interface LogisticsCompany {
  id: string;
  name: string;
  description: string;
  email: string;
  phone: string;
  status: number;
}

export interface ExporterSummary {
  id: string;
  profile_name: string;
  fullname: string;
  email: string;
  phone: string;
  address: string;
  business_name: string;
  passport: string | null;
  exporter_country: string | null;
  business_country: string | null;
  business_email: string;
  business_address: string;
  business_reg_number: string;
  order_count: number;
  is_verified?: boolean;
  kyc_status?: "pending" | "approved" | "rejected";
}

/** Full /exp/profile payload - drives the exporter dashboard + KYC flow. */
export interface ExporterProfile {
  id?: string;
  firstname?: string;
  lastname?: string;
  phone?: string;
  email?: string;
  address?: string;
  country?: string;
  profile_name?: string;
  business_name?: string | null;
  business_email?: string | null;
  business_address?: string | null;
  business_country?: string | null;
  business_reg_number?: string | null;
  business_type?: string | null;
  annual_turnover?: string | null;
  duration_in_business?: number | null;
  tin?: string | null;
  valid_identification?: string | null;
  bank_id?: string | null;
  account_number?: string | null;
  description?: string | null;
  /** Uploaded KYC documents - { id?: url, cac?: url }. */
  documents?: Record<string, string>;
  // KYC lifecycle
  kyc_status?: "pending" | "approved" | "rejected";
  kyc_submitted_at?: string | null;
  kyc_rejection_reason?: string | null;
  kyc_missing_fields?: string[];
  total_orders?: number;
  pending_orders?: number;
  total_revenue?: string;
}

/** Listing-card shape (from /public/products) */
export interface ProductSummary {
  id: string;
  exporter_id?: string;
  exporter_name: string;
  business_name: string;
  product_name: string;
  description: string;
  category: string;
  store: string;
  price: string;
  currency?: string;
  images: string; // JSON-stringified string[]
  properties: string; // JSON-stringified object
  market_name: string;
  location: string;
  is_featured?: number;
  /** Premium-tier sponsored placement flag from the backend (0 | 1). */
  promote?: number;
  status: number;
  /** Inventory tracking (added v2.5) */
  stock_quantity?: number;
  low_stock_threshold?: number;
  last_inventory_update_at?: string | null;
  /** Approximate display in a secondary currency (added v3.6). Currently
   *  always GBP - UK buyers see "₦18,000 / ~£10.40" next to the price. */
  secondary_currency?: string | null;
  secondary_amount?: string | null;
  secondary_rate?: number | null;
}

/** Detail shape (from /public/products/:id) */
export interface ProductDetail {
  id: string;
  product_name: string;
  description: string;
  category_id: string;
  store_id: string;
  price: string;
  currency: string;
  images: string;
  short_video_link: string;
  min_order_quantity: number;
  max_order_quantity: number;
  properties: string;
  views: number;
  has_tax: number;
  is_featured: number;
  status: number;
  time_created: string;
  time_updated: string;
  exporter_id: string;
  promote: number;
  name: string; // category name
  store: string; // store label
  view_counts: number;
  market_name: string;
  market_location: string;
  market_id: string;
  /** Inventory (added v2.5) */
  stock_quantity?: number;
  low_stock_threshold?: number;
  last_inventory_update_at?: string | null;
  /** Secondary-currency display (added v3.6) */
  secondary_currency?: string | null;
  secondary_amount?: string | null;
  secondary_rate?: number | null;
}

export interface Store {
  id: string;
  market_id: string;
  market_name: string;
  state: string;
  city: string;
  address: string;
  status: number;
  is_default?: number;
}

// =============================================================================
// Subscription plans
// =============================================================================

export interface ImporterPlan {
  id: string;
  title: string;
  description: string;
  monthly_subscription_fee: string;
  annual_subscription_fee: string;
  transaction_limit: string; // -1 = unlimited
  commission_value: string;
  commission_percent: string;
  product_limit: number;
  currency: string;
  is_default: number;
  status: number;
  time_created: string;
  time_updated: string;
}

export interface ExporterPlan extends Omit<ImporterPlan, "product_limit"> {
  product_promotion: number;
  max_product_promotion: number;
  max_market: number;
  max_store: number;
  max_store_per_market: number;
  max_product_per_store: number;
  max_product: number;
  support_priority_level: string;
}

// =============================================================================
// Cart, Orders, Payments
// =============================================================================

export interface CartItem {
  id?: string;
  product_id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  unit: string;
  subtotal: number;
  exporter_id?: string;
  exporter_name?: string;
  store_id?: string;
  image?: string;
  added_at: string;
}

export interface Order {
  id: string;
  order_id?: string;
  importer_id?: string;
  exporter_id?: string;
  total: string;
  currency: string;
  status: string;
  shipping_method: "self" | "logistics";
  logistics_id?: string;
  delivery_info?: Record<string, unknown>;
  items?: OrderItem[];
  time_created: string;
  time_updated: string;
  /** ISO timestamp set when the buyer explicitly confirmed receipt -
   *  immediate-payout signal. Null until the buyer presses the button. */
  confirmed_received_at?: string | null;
}

export interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: string;
  subtotal: string;
}

export interface ShippingAddress {
  id: string;
  recipient_name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postal_code?: string;
  is_default: number;
}

export interface FlutterwavePaymentSession {
  public_key: string;
  tx_ref: string;
  amount: string;
  currency: string;
  payment_options: string;
  customer: { email: string; phone_number: string; name: string };
  customizations: { title: string; description: string; logo: boolean | string };
  split: Array<{ id: string; transaction_charge_type: string; transaction_charge: string }>;
}

export interface PaymentTransaction {
  id: string;
  tx_ref: string;
  order_id: string;
  amount: string;
  currency: string;
  status: "pending" | "successful" | "failed";
  time_created: string;
}

// =============================================================================
// Home page aggregate
// =============================================================================

export interface HomeData {
  top_exporter: ExporterSummary[];
  top_products: ProductSummary[];
  top_categories: Category[];
}

// =============================================================================
// Helpers for parsing JSON-stringified fields
// =============================================================================

/**
 * Some product fields (`images`, `properties`) come as JSON-stringified.
 * Use this helper to parse safely.
 */
export function parseProductImages(raw: string | undefined | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((s) => typeof s === "string") : [];
  } catch {
    return [];
  }
}

export function parseProductProperties(raw: string | undefined | null): Record<string, unknown> {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed !== null ? (parsed as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

// =============================================================================
// Disputes (added v2.5)
// =============================================================================

export type DisputeReason = "damaged" | "wrong_item" | "not_received" | "quality" | "other";
export type DisputeStatus = "open" | "in_review" | "resolved" | "rejected";
export type DisputeResolution = "refund" | "replacement" | "dismissed";

export interface Dispute {
  id: string;
  order_id: string;
  order_number?: string;
  importer_id: string;
  exporter_id: string;
  reason: DisputeReason;
  description: string;
  status: DisputeStatus;
  resolution: DisputeResolution | null;
  refund_amount: string | null;
  refund_currency: string | null;
  refund_tx_ref: string | null;
  replacement_order_id: string | null;
  admin_notes: string | null;
  reviewed_at: string | null;
  resolved_at: string | null;
  time_created: string;
  time_updated: string;
}
