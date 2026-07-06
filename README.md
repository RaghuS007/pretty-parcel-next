# The Pretty Parcel by Neems — Next.js 14 Build

Production-structure e-commerce app: Next.js 14 App Router + TypeScript, with the Drizzle/Neon schema, OTP-only auth, the Recently-Viewed system, and the recommendation engine from the PRD. **Runs locally with zero configuration** — no database or SMS credentials needed.

## Run it

```bash
npm install
npm run dev        # → http://localhost:3000
```

That's it. In dev mode:
- **OTP is always `123456`** (also printed to the server console)
- Data (users, orders, server-side view history) lives in server memory — resets on restart
- Cart, wishlist and guest history live in the browser's localStorage

For a production build: `npm run build && npm start`.

## What's implemented

| Area | Details |
|---|---|
| **Pages** | Home, Shop (filters/search/sort), Product `[id]`, Cart & checkout, OTP Login, Account, Admin |
| **Auth** | `POST /api/auth/send-otp` → `verify-otp` → HMAC-signed httpOnly session cookie (30 days). Rate-limited: 3 OTP sends / 10 min per mobile, 5 verify attempts per OTP, 5-min expiry, hashed OTP at rest |
| **Recently Viewed (PRD §7)** | Guests: localStorage, 20-item FIFO. Logged in: server-side via `/api/recently-viewed` (GET/POST/DELETE). **Guest→account merge with dedupe happens inside `verify-otp`** — the login response reports how many items were synced |
| **Recommendations (PRD §8)** | `GET /api/products/:id/related` — content-based scoring: **category 45 · tag Jaccard 25 · price ±30% 15 · material 10 · collection 5**. `POST /api/recommendations/complete-look` — complementary-category rules (co-purchase matrix takes over in production) |
| **Orders** | `POST /api/orders` recomputes subtotal/coupon/shipping **server-side in integer paise** — client prices are never trusted. Coupons: `NEEMS10`, `PARCEL200`; free shipping ≥ ₹999 |
| **Database blueprint** | `src/db/schema.ts` — 15 Drizzle tables (users, otp_requests, products, orders, product_views, related_scores, co_purchase_scores…), all money as integer paise |

## Project structure

```
src/
├── app/
│   ├── page.tsx                     Home
│   ├── shop/  product/[id]/  cart/  login/  account/  admin/
│   ├── api/
│   │   ├── auth/ send-otp · verify-otp · logout · me
│   │   ├── products/ (+ [id], [id]/related)
│   │   ├── recommendations/complete-look
│   │   ├── recently-viewed          GET / POST / DELETE
│   │   └── orders                   GET / POST
│   └── globals.css                  Design system (brand tokens at top)
├── components/  Header · Footer · ProductCard · ProductImage · RibbonDivider
├── lib/
│   ├── catalogue.ts   Seed products (paise), coupons, complement rules
│   ├── recommend.ts   Scoring engine
│   ├── store.ts       Server state + OTP + sessions (in-memory dev impl)
│   └── client-store.ts localStorage cart/wishlist/guest-RV + hooks
└── db/schema.ts       Drizzle schema for Neon Postgres
```

## Cloudflare Workers

This app is configured for Cloudflare Workers via OpenNext.

```bash
npm run preview   # build and run locally in the Cloudflare workerd runtime
npm run deploy    # build and deploy to Cloudflare Workers
```

For a real account deploy, set `CLOUDFLARE_API_TOKEN` before running `npm run deploy`. The checked-in `wrangler.toml` targets `pretty-parcel-next` and serves static assets from `.open-next/assets`.

## Going to production (in order)

1. **Set `AUTH_SECRET`** to a long random string in Cloudflare Workers secrets or environment variables.
2. **Neon**: create a project (Mumbai/`ap-southeast-1`), set `DATABASE_URL`, run `npm run db:push`, then replace the in-memory calls in `src/lib/store.ts` with Drizzle queries — every swap point is marked `// PROD:`.
3. **MSG91**: complete TRAI DLT registration for the OTP template, set `MSG91_AUTH_KEY` + `MSG91_TEMPLATE_ID` — `sendOtp()` in `store.ts` already calls the MSG91 API when the key is present.
4. **Upstash Redis**: swap the in-memory `rateLimit()` for `@upstash/ratelimit` (same call signature).
5. **Payments**: in `POST /api/orders`, create a Razorpay/Cashfree order before saving, and confirm the order only from the payment webhook.
6. **Photography**: replace `<ProductImage>` with `next/image` from your CDN — it's the only place placeholder art is generated.

## Pre-launch gaps to close (flagged, not yet built)

COD flow, legal pages (Consumer Protection E-Commerce Rules 2020: privacy/refund/shipping/T&C), GST rate mapping per category on invoices, address CRUD, admin product CRUD (currently read-only), and payment webhook handling.
