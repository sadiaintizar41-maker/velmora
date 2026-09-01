# VELMORA

Elegance, Redefined. — a cinematic clothing e-commerce build on Next.js
(App Router) + Supabase (Postgres, Auth, RLS, Storage).

## Status: complete and verified live

This build now runs end-to-end against the live Supabase project and has
been verified in a real browser (2026-08-30):

- `npm run typecheck` and `npm run build` pass clean.
- Storefront: home, shop (with seeded products/filters), collections,
  product detail (gallery, color/size selectors, stock messaging),
  search, cart, wishlist, about, contact all render and work.
- Customer flow verified end-to-end: signup/login → product → add to
  bag → checkout (contact/shipping/delivery steps, Express shipping
  math) → order placed via the `create_order()` RPC → confirmation
  page → My Orders. Stock decremented atomically (verified: 2 → 1).
- Admin: `/admin` protected by middleware + layout. Login, dashboard
  stats, products, categories, collections, orders (status/payment
  updates persist), customers, settings all verified against live data.
- RLS verified: anonymous REST sees zero orders; customers only their
  own; admins see everything.

## Running it

```bash
npm install
npm run dev        # http://localhost:3000  (or: npm run build && npm start)
```

`.env` already contains the project URL + anon key. (There is no
`.env.example`; if you ever rotate the keys, those are the two vars:
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.)

## Accounts (seeded demo)

| Role     | Email                        | Password          | Notes                          |
| -------- | ---------------------------- | ----------------- | ------------------------------ |
| Admin    | `admin@velmora.com`          | `VelmoraAdmin!2026` | created + confirmed + promoted |
| Customer | `velmora.test.9f3k2@gmail.com` | `TestPass!2026x`  | confirmed; owns the demo order |

The project owner's own account (`sadiaintizar41@gmail.com`) was already
promoted to admin previously. To promote any other account:

```sql
select public.promote_to_admin('email@example.com');
```

## Seeded catalog

`supabase/seed.sql` was run against the live project (4 categories,
3 collections, 10 published products, 12 images, 58 variants, PKR
pricing). It is idempotent — re-running is safe. Product images use the
static files in `public/images/`; uploads via the admin ImageUploader
go to the `product-images` storage bucket per `0004_storage.sql`.

To wipe and re-seed the demo catalog, delete the rows whose ids start
with the seed prefixes (`a1000000-…`, `b1000000-…`, `c1000000-…`) in
categories / collections / products (images & variants cascade), then
re-run `supabase/seed.sql`.

## What's in the project

1. **Homepage** — `src/components/home/VelmoraHome.jsx` (cinematic
   editorial landing page, rendered by `src/app/page.tsx`)
2. **Supabase backend** — `supabase/migrations/*.sql` (schema, functions/
   triggers, RLS policies, storage), `src/lib/supabase/*`,
   `src/middleware.ts`, `src/app/admin/(dashboard)/layout.tsx` — see
   `README-BACKEND.md` for the full setup guide and admin-security
   explanation.
3. **Customer shopping flow** — Shop, Collections, Product Detail, Cart,
   Checkout, Order Confirmation, Wishlist — see `PHASE-3-REPORT.md`.
4. **Admin CRUD dashboard** — `/admin/*` — see `PHASE-4-REPORT.md`.

## Fixes made during live verification (2026-08-30)

- `tsconfig.json`: removed `"ignoreDeprecations": "6.0"` (rejected by
  TS 5.9 — typecheck now passes).
- Deleted the empty leftover `src/app/order/` page stub (broke Next 15
  route-type validation); the real route is `/order-confirmation/[id]`.
- `src/app/orders/page.tsx`: typed the query rows and fixed the currency
  format ($35200.00 → `Rs. 35,200`, matching the rest of the site).
- **Admin login deadlock**: `src/app/admin/layout.tsx` guarded *every*
  `/admin/*` route, including `/admin/login`, so anonymous visitors
  were redirected home and no one could ever sign in as admin. The
  guard layout now lives in the `src/app/admin/(dashboard)/` route
  group (covers all dashboard pages, URL-unaffected); `/admin/login`
  sits outside it. Middleware behavior unchanged.

## Note on the original tech spec

The original brief asked for Tailwind CSS. This build uses plain inline
`style` objects (`React.CSSProperties`) throughout instead — there is no
`tailwind.config` or utility-class usage anywhere in the codebase.
Converting to Tailwind would mean touching effectively every component,
which is a redesign, not a bug fix — so it hasn't been done.
