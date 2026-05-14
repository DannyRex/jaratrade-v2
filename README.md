# Jaratrade

A B2B marketplace connecting **Nigerian exporters** with **UK importers**, focused on Fast-Moving Consumer Goods (FMCGs). Built fresh from the ground up against the existing live API.

> **Status**: MVP complete. Wired to the live backend at `https://api.jaratrade.com`. All marketplace, auth, importer, exporter, and admin flows are live.

---

## Tech stack

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 16** (App Router, RSC, Turbopack) | Marketplace SEO needs SSR. App Router for streaming + RSC. |
| Language | **TypeScript** (strict) | Type-safe API contracts mirroring the Python backend. |
| Styling | **Tailwind CSS v4** + brand tokens (OKLCH) | Tokens defined as CSS vars in `globals.css`. |
| Components | **Radix UI** primitives + shadcn-style wrappers | Accessible by default, fully themeable. |
| Server state | **TanStack Query v5** | Caching, stale-while-revalidate, retry logic. |
| Client state | **Zustand** with `persist` middleware | Auth + cart, persisted to localStorage. |
| Forms | **React Hook Form** + **Zod** | Lightweight, accessible, type-safe. |
| Notifications | **Sonner** | Toast pattern. |
| Icons | **Lucide React** | Tree-shakeable, consistent. |
| Dark mode | **next-themes** | System / light / dark. |
| Payments | **Flutterwave Inline JS** | Loaded on-demand from `checkout.flutterwave.com/v3.js`. |
| Hosting | **Vercel** (target) | Optimised for Next.js. |

---

## Project structure

```
src/
├─ app/
│  ├─ (marketplace)/         ← Public marketplace (route group, no URL prefix)
│  │   ├─ layout.tsx         ← Site header + footer
│  │   ├─ page.tsx           ← Home
│  │   ├─ products/          ← Listing + detail
│  │   ├─ categories/
│  │   ├─ sellers/[id]/      ← Exporter profile
│  │   ├─ about, faq, services, search/
│  ├─ auth/                  ← Auth pages (login/register/verify/reset)
│  │   └─ login/[role]/      ← One dynamic route handles importer/exporter/admin
│  ├─ importer/              ← Importer dashboard (AuthGuard role="importer")
│  │   ├─ orders/, cart/, checkout/, favorites/, shipping/, transactions/, account/
│  ├─ exporter/              ← Exporter dashboard
│  │   ├─ products/, stores/, orders/, subscription/, profile/, settings/, help/
│  ├─ admin/                 ← Admin dashboard
│  │   ├─ users/, orders/, markets/, categories/, banks/, plans/, logistics/, compliance/, settings/
│  ├─ layout.tsx             ← Root layout (fonts, providers, metadata)
│  ├─ not-found.tsx
│  ├─ robots.ts
│  └─ sitemap.ts
├─ components/
│  ├─ ui/                    ← Design-system primitives (button, card, dialog, …)
│  ├─ site-header.tsx
│  ├─ site-footer.tsx
│  ├─ dashboard-shell.tsx    ← Shared sidebar+topbar for role dashboards
│  ├─ auth-guard.tsx         ← Client-side role guard
│  ├─ product-card.tsx, exporter-card.tsx, category-pill.tsx, …
├─ lib/
│  ├─ api.ts                 ← Typed API client (publicApi, authApi, importerApi, exporterApi, adminApi)
│  ├─ types.ts               ← API types reverse-engineered from Postman + Angular services
│  ├─ queries.ts             ← TanStack Query hooks
│  ├─ auth-store.ts          ← Zustand auth (persisted)
│  ├─ cart-store.ts          ← Zustand cart (persisted)
│  ├─ format.ts              ← Money/date/ID formatters
│  └─ utils.ts               ← cn helper
└─ hooks/
   ├─ use-debounce.ts
   └─ use-media-query.ts
```

---

## Getting started

```bash
# 1. Install
npm install

# 2. Configure env (already wired up; rotate keys for production)
cp .env.local.example .env.local

# 3. Run dev server (Turbopack)
npm run dev   # http://localhost:3000

# Production
npm run build
npm run start
```

Set in `.env.local`:

```
NEXT_PUBLIC_API_URL=https://api.jaratrade.com
NEXT_PUBLIC_API_KEY=<rotated key>
NEXT_PUBLIC_FLW_PUBLIC_KEY=<flutterwave public key>
```

---

## Brand & design

The colour palette is defined as CSS variables in `src/app/globals.css` using **OKLCH** (P3-capable, perceptually uniform). Shipping with two themes:

- **Primary**: refined indigo-blue (legacy `#247df6`)
- **Accent**: warm orange (legacy `#f59025`) - used for premium / promo surfaces
- **Neutral**: slate

Typography: **Geist Sans** (body + headings) and **Geist Mono** (code/IDs).

Dark mode is fully supported and respects `prefers-color-scheme`. The `prefers-reduced-motion` media query is also honoured globally.

---

## API integration

The Flask backend at `https://api.jaratrade.com` returns responses wrapped in `{ status, message, payload }`. **Some endpoints double-wrap** (e.g. `/public/data/category` returns `{ status, message, payload: { status, message, payload: { rows: [...] } } }`). The `unwrapEnvelope()` helper in `api.ts` handles both shapes transparently.

### Authentication
- Login is per-role (`POST /imp/login`, `/exp/login`, `/adm/login`).
- Successful login returns a Bearer JWT, stored in cookies + Zustand.
- Mutations send `multipart/form-data`. The `multipart()` helper in `api.ts` builds FormData from a plain object.
- IDs are encrypted Fernet tokens (long base64 strings). `shortId()` truncates them for display.

### Endpoint coverage
All 87 endpoints from the Postman collection are typed and wrapped in `api.ts`:
- **Public reference data**: home, products, categories, markets, banks, logistics, plans
- **Auth**: login, register (3 roles), verify-email, reset-password
- **Importer**: cart, orders, payments, shipping, profile, favourites, reviews
- **Exporter**: products (CRUD + images), stores, orders, profile, change-password
- **Admin**: markets, categories, banks, logistics, plans, settings, commission account

### Known backend gaps surfaced in the UI
- `GET /public/data/logistics` currently returns 500 - the checkout falls back to "Importer-arranged" mode and shows a friendly message.
- No `GET /adm/users` endpoint - the admin Users page surfaces this as a "backend gap" notice and shows top exporters as a stopgap.
- The cart sync flow (`POST /imp/cart`) hasn't been wired to the local cart store yet - the checkout page surfaces this with a clear error if the user attempts to place an order without a server-issued cart ID.

---

## Architecture decisions

### Route groups vs role folders
- `(marketplace)/` is a route group - its children render at root URLs (`/`, `/products`, etc.).
- `auth/`, `importer/`, `exporter/`, `admin/` are regular folders - they appear in the URL.
- Each role dashboard wraps its pages in `<AuthGuard role="...">` to enforce client-side access.

### State management
- **Server state** lives in TanStack Query. Stale time of 60s for most resources, 30min for reference data (categories, markets, banks).
- **Auth** is a small Zustand store with `persist` middleware - token + role + user object are kept in localStorage. Cookies mirror the token for SSR.
- **Cart** is also Zustand-persisted. Items are stored locally for fast UX; the server cart ID is added on first sync.

### Performance
- Marketplace pages are statically rendered where possible (38 routes, mix of static + dynamic - see `npm run build` output).
- Images use `next/image` with Cloudinary remote patterns whitelisted.
- Geist fonts loaded with `display: swap`.
- `optimizePackageImports` enabled for `lucide-react` and `date-fns`.

### Accessibility
- All Radix primitives are keyboard navigable + screen-reader friendly out of the box.
- Visible focus rings via `:focus-visible` with brand-coloured outlines.
- `prefers-reduced-motion` disables animations globally.
- Form labels are explicit; password fields have show/hide toggles with proper aria-labels.

### SEO
- Per-page `Metadata` API for titles & descriptions.
- Open Graph + Twitter card tags on the root layout.
- `robots.ts` and `sitemap.ts` configured.
- FAQ page emits JSON-LD `FAQPage` structured data.
- Semantic HTML throughout (`<header>`, `<nav>`, `<main>`, `<article>`, `<section>`, `<footer>`).

---

## What's new in v2.1

| Area | What changed |
|---|---|
| **2FA login** | `/auth/login/[role]` detects the `requires_2fa` response and switches to a 6-digit OTP input. |
| **2FA management** | New `TwoFactorCard` (`src/components/two-factor-card.tsx`) on the importer account → Security tab. Renders a QR via Google Charts (no extra deps), confirms with a code, supports password-gated disable. |
| **KYC admin queue** | `/admin/kyc` lists pending exporters with approve / reject (with reason). Approval activates + emails the applicant. |
| **Real users page** | `/admin/users` swaps the placeholder for live data from `GET /adm/users`, with role/status filters, search, and per-row suspend/reactivate. |
| **Cart sync** | `CartSyncBridge` (always mounted in providers tree) debounces local cart changes and pushes to `POST /imp/cart/sync` when the user is an authed importer. |
| **Login response shape** | API client union types `LoginResponse = LoginPayload | { requires_2fa, email }` — TS-safe branching everywhere it's used. |
| **Hero polish** | Real product photo asset, no gradients (kept from v2.0.1). |
| **Sponsored badge** | `ProductCard` renders a "SPONSORED" badge on products with `promote=1`. |
| **Reviews UI** | New `RatingStars` (interactive stars, accessible) + `ReviewPromptCard`. The order detail page renders the card on `delivered` orders, calling `POST /imp/profile/review`. |
| **Playwright E2E** | `e2e/marketplace.spec.ts` (public smoke) and `e2e/checkout.spec.ts` (full importer login → cart → checkout → pay). `npm run e2e:install && npm run e2e`. |
| **Sentry** | `@sentry/nextjs` wired with separate client / server / edge configs + Next.js `instrumentation.ts` hooks. Source-map upload baked into the build via `withSentryConfig`. All env-driven — completely no-op when `NEXT_PUBLIC_SENTRY_DSN` is unset. |
| **Subscription billing** | New `/importer/subscription` page (added to importer nav) and full upgrade flow on `/exporter/subscription`. Shared `SubscriptionPage` component renders current plan + auto-renew status, plan picker, Flutterwave Inline launch on upgrade, and one-click cancel. |

## Observability

`@sentry/nextjs` is wired but inert until you set `NEXT_PUBLIC_SENTRY_DSN` (browser) and `SENTRY_DSN` (server). Three layers are already configured:

- **Browser** (`sentry.client.config.ts`) — uncaught errors, navigation traces, session replay (privacy-first: text masked, media blocked), release tagging.
- **Server** (`sentry.server.config.ts`) — uncaught errors in route handlers, server components, server actions.
- **Edge** (`sentry.edge.config.ts`) — middleware + edge route handlers.

Build-time source-map upload runs automatically when `SENTRY_AUTH_TOKEN` + `SENTRY_ORG` + `SENTRY_PROJECT` are available (typically only in CI / Vercel). Source maps are not bundled into the public artifacts — they're uploaded and removed.

The browser config sets `tracePropagationTargets` to your API host so the client trace ID is attached as a header on outbound fetches; the backend's OpenTelemetry FastAPI instrumentation reads it back and continues the trace, giving you a single waterfall across browser → API → database.

## Deployment

### Vercel
1. `vercel link`
2. Set env vars in the Vercel dashboard:
   - `NEXT_PUBLIC_API_URL` → your deployed API URL
   - `NEXT_PUBLIC_FLW_PUBLIC_KEY` → Flutterwave public key
3. `vercel --prod`

`vercel.json` already pins the framework, build command, and adds security headers.

### CI
`.github/workflows/web.yml` runs `npm ci`, `npm run lint`, and `npm run build` against `NEXT_PUBLIC_API_URL=https://api.jaratrade.com` on every PR.

## What's left for production

1. **Rotate keys**: the `.env.local` shipped with this repo carries TEST credentials. Rotate before production.
2. **Image upload polish**: the exporter "Add product" page accepts images; the upload calls `POST /exp/product/image/:id` which is wired but not tested end-to-end against live Cloudinary.
3. **Auto-recurring subscriptions**: the upgrade flow charges once and tracks `period_end`. A nightly cron downgrades lapsed users + sends 3-day-out renewal reminders. Auto re-charge on renewal needs Flutterwave card-tokenization (one extra step in `subscriptions.upgrade` to capture `flw_ref`/`token`, then a charge call from the cron).
5. **E2E tests**: a Playwright suite for login → checkout → pay → see order would catch regressions automatically.

---

## License

Proprietary - Jaratrade Ltd.
