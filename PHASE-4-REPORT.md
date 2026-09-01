# VELMORA — Phase 4: Admin CRUD System

## How this phase actually went (worth knowing)

Partway through building this, I found a more complete set of Phase 4
files already sitting on disk from an interrupted earlier attempt at this
same turn — a cleaner, per-domain action-file architecture
(`src/lib/actions/{products,variants,productImages,categories,collections,
orders}.ts` + `src/lib/supabase/adminQueries.ts`) than the single-file
version I'd started building fresh. I reviewed it, adopted it instead of
duplicating it, deleted my redundant files (including an unnecessary new
SQL migration — the adopted version computes dashboard/customer stats via
plain RLS-respecting queries instead of new SECURITY DEFINER functions,
which is simpler and adds no new database surface), and built the
remaining pages/components on top of it. Flagging this so the file list
below makes sense as one coherent architecture, not two.

## Files created (27)

```
src/app/admin/
  page.tsx                          Dashboard: stat cards, recent orders,
                                     low-stock table
  products/page.tsx                 Product list (ProductsTable)
  products/new/page.tsx             Create product
  products/[id]/page.tsx            Edit product: details + images + variants
  categories/page.tsx               Category CRUD (CategoryManager)
  collections/page.tsx              Collection CRUD (CollectionManager)
  orders/page.tsx                   Order list (OrderTable)
  customers/page.tsx                Customer list (CustomerTable)
  settings/page.tsx                 Admin's own profile (name/phone only)

src/components/admin/
  ProductForm.tsx                   name/slug/description/category/
                                     collection/status/featured/new/active
  ProductsTable.tsx                 publish toggle, featured/new checkboxes
  VariantEditor.tsx                 add/edit/delete size+color+price+
                                     stock+SKU rows
  ImageUploader.tsx                 upload/preview/remove/reorder against
                                     the product-images storage bucket
  CategoryManager.tsx                create/edit/activate-deactivate
  CollectionManager.tsx              create/edit/activate-deactivate/feature
  OrderTable.tsx                    expandable rows, status + payment
                                     status selects
  CustomerTable.tsx                 name/email/phone/orders/spend/joined —
                                     no credentials
  SettingsForm.tsx                  admin's own profile form
  StatCard.tsx / StatusPill.tsx     small shared display components

src/lib/actions/                    "use server" mutations — every one
  products.ts                       runs under the signed-in admin's own
  variants.ts                       session via the server Supabase
  productImages.ts                  client, never a service-role key
  categories.ts
  collections.ts
  orders.ts
  profile.ts

src/lib/supabase/adminQueries.ts    every admin read: dashboard stats,
                                     low stock, product/category/
                                     collection/order lists, customer stats
```

## Modified

Only `types/shims.d.ts` — the dev-only ambient TypeScript shims, expanded
to cover this phase's new APIs (`useTransition`, `useRef`, `next/cache`).
**Nothing else changed.** Confirmed by diffing every customer-facing file
and every Phase 2 backend file against the Phase 3 output snapshot:

```
UNCHANGED: src/components/home/VelmoraHome.jsx
UNCHANGED: src/app/page.tsx, shop/page.tsx, product/[slug]/page.tsx,
           collections/page.tsx, collections/[slug]/page.tsx,
           cart/page.tsx, checkout/page.tsx,
           order-confirmation/[orderId]/page.tsx, wishlist/page.tsx,
           layout.tsx, not-found.tsx, and every loading/not-found file
UNCHANGED: ShopFilters, ProductCard, ProductGrid, VariantSelector,
           ColorSwatch, SizeSelector, ProductGallery, SiteHeader,
           ConditionalHeader, CartContext, WishlistContext,
           queries.ts, createOrder.ts
UNCHANGED: all four Phase 2 migrations (0001–0004), middleware.ts,
           admin/layout.tsx, admin/login/page.tsx, AdminSidebar.tsx,
           getUserRole.ts, signUp.ts, client.ts, server.ts,
           database.types.ts
```

## TypeScript result

`npx tsc --noEmit` — **zero errors**, across the entire tree including
every file from Phases 1–4. This required real fixes along the way (a
handful of implicit-`any` callback params, e.g. in `adminQueries.ts`'s
revenue reducer), not just shim patches. As in prior phases, the shims
stand in for `@supabase/ssr`/`next`/`lucide-react` because there's no
network in this sandbox to actually `npm install` them — delete
`types/shims.d.ts` once you do, and the real packages' types take over.

## Security / RLS result

- **No service-role key anywhere.** Grepped the entire `src/` tree for
  `SUPABASE_SERVICE_ROLE`/`service_role`/anything resembling it — zero
  matches. Every admin mutation goes through the server Supabase client
  under the *admin's own authenticated session*.
- **No client-controllable path to `role`.** Grepped `signUp.ts`,
  `SettingsForm.tsx`, and `profile.ts` — none accept or send a `role`
  field. `updateOwnProfile()`'s signature is `{ full_name, phone }` only;
  there's nothing to send even if someone tried. This is on top of, not
  instead of, the Phase 2 protections (RLS policy + `guard_role_escalation`
  trigger) — neither of which this phase touched.
- **Route protection unchanged.** `middleware.ts` and `admin/layout.tsx`
  are byte-identical to Phase 2 — still two independent checks, still
  redirecting a non-admin to `/` rather than an "access denied" page.
- **Every write still ultimately depends on RLS, not app code.** The
  `assertAdmin()`-style checks in the action files (via `requireAdmin()`)
  exist only to give a clean error message — if one were ever accidentally
  removed, the underlying `INSERT`/`UPDATE`/`DELETE` would still be
  rejected by the database for a non-admin session, because the Phase 2
  RLS policies (`products_admin_write`, `categories_admin_update`, etc.)
  are what actually authorize these calls, and none of them were weakened,
  replaced, or bypassed by anything in this phase.
- **Image upload security**: `ImageUploader.tsx` uploads directly to the
  `product-images` bucket using the browser client under the admin's
  session; `storage.objects` INSERT/UPDATE/DELETE policies from
  `0004_storage.sql` (untouched) are what actually block a non-admin —
  the same client code, run by a customer session, would get a storage
  error, not a silent success.
- **One judgment call, documented rather than hidden**: `categories` and
  `collections` only have a single `is_active` boolean in the Phase 2
  schema (no draft/published/archived enum like `products` has). So
  "Archive" and "Activate/Deactivate" for these two tables are the same
  underlying action — I didn't invent a second status column to make them
  feel distinct, since that would duplicate what `is_active` already
  means and diverge from the schema you already reviewed and approved.

## What still requires testing against a real Supabase project

Everything here is code-complete and internally consistent — but, same as
Phases 2 and 3, none of it has run against an actual Postgres/Supabase
instance, because there's no network in this sandbox. Concretely, once
you connect a real project (see `README-BACKEND.md`'s "How to connect it
for real"), still verify:

- A signed-up customer actually gets redirected away from `/admin` (not
  just "the code looks like it would do that").
- Product create/edit/archive/delete actually persist and that deleting a
  product really does cascade to its images/variants while leaving past
  `order_items` intact (the `on delete set null` behavior).
- Image upload actually lands in the `product-images` bucket and the
  resulting public URL actually renders — this is the one piece that
  can't even be partially verified by reading the code, since it depends
  on real Storage bucket behavior.
- Variant unique-constraint violations (duplicate size+color, or a reused
  SKU) surface as a readable error in `VariantEditor` rather than a raw
  Postgres error string.
- Order status/payment status updates from `/admin/orders` actually write
  through and that a customer's own `/order-confirmation/[id]` page
  reflects the change.
- Customer stats (`admin_customer_stats`-equivalent query in
  `adminQueries.ts`) return sensible numbers once there's real order data
  to aggregate — I can reason about the SQL/query logic but can't watch it
  run.
