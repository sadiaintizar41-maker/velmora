# VELMORA — Backend foundation (Phase 2)

## Status: code complete, not yet connected to a live project

This sandbox has no network access, so I have not run these migrations
against a real Supabase project or installed npm packages here — there is
no live database behind this yet, and nothing in the code claims otherwise.
Everything below is production-ready SQL and TypeScript, checked for
syntax/type correctness (see "Verification" below), ready to run against
your actual Supabase project with the steps in "How to connect it for real."

## How to connect it for real

1. Create a Supabase project (or use an existing one).
2. `npx supabase link --project-ref <your-project-ref>`
3. Run the four migrations **in order**:
   ```
   supabase db push
   ```
   (or paste each file into the SQL editor in order: 0001 → 0002 → 0003 → 0004)
4. Copy `.env.example` to `.env.local` and fill in your project URL + anon key.
5. `npm install @supabase/ssr @supabase/supabase-js next react react-dom`
6. Create your first admin by running, in the SQL editor, after that person
   has signed up once normally as a customer:
   ```sql
   select public.promote_to_admin('owner@velmora.com');
   ```

## Files created this phase

```
supabase/migrations/
  0001_schema.sql              tables, enums, constraints, indexes
  0002_functions_triggers.sql  is_admin(), handle_new_user(), role-escalation
                                guard, promote_to_admin(), create_order()
  0003_rls_policies.sql        RLS policies for every table
  0004_storage.sql             product-images bucket + storage policies

src/lib/supabase/
  client.ts                    browser Supabase client
  server.ts                    server Supabase client (SSR cookies)
  database.types.ts            hand-written types matching 0001 exactly

src/lib/auth/
  getUserRole.ts                server-side role lookup (requireAdmin())
  signUp.ts                     customer signup — no role field, ever

src/lib/checkout/
  createOrder.ts                calls the create_order() RPC

src/middleware.ts               layer 1 of admin route protection
src/app/admin/layout.tsx        layer 2 of admin route protection
src/app/admin/login/page.tsx    admin sign-in (no signup link, no signup route)
src/components/admin/AdminSidebar.tsx

.env.example
tsconfig.json / types/shims.d.ts   dev-only, see "Verification" below

src/components/home/VelmoraHome.jsx   <- Phase 1 homepage, copied over
                                          byte-for-byte, unmodified.
```

Nothing from Phase 1 was changed. `VelmoraHome.jsx` in the outputs folder
from the previous turn and the copy at `src/components/home/VelmoraHome.jsx`
here are identical.

## Admin role setup, explained

**The problem this solves:** an e-commerce admin panel is only as secure as
its weakest of three places — signup, route access, and data access. VELMORA
locks all three independently, so a mistake in one doesn't expose the others.

1. **Signup can never create an admin.** The client-side `signUpCustomer()`
   helper has no `role` field in its input type — there's nothing to send.
   Even if someone bypassed the app and called Supabase Auth's signup API
   directly with a crafted `role: "admin"` in the metadata, it wouldn't
   matter: the `handle_new_user()` trigger fires on **every** row inserted
   into `auth.users`, from any client, and it hard-codes `role = 'customer'`
   — it doesn't read a role from anywhere. There is also no `/admin/signup`
   route in the app at all.

2. **Promotion is a manual, out-of-band SQL call.** `promote_to_admin(email)`
   is the only function that can set `role = 'admin'`, and it is `revoke`d
   from `anon` and `authenticated` — it's only callable by someone running
   SQL directly against the database (Supabase SQL editor or CLI, i.e. a
   project owner). No API route, RPC-from-the-browser, or UI button exists
   that reaches it.

3. **Once a profile exists, its role is locked against self-escalation.**
   The `profiles` UPDATE RLS policy allows a user to update their own row
   (for things like their name or phone), but the `guard_role_escalation`
   trigger independently blocks any UPDATE that changes `role` unless the
   session already belongs to an admin. This is intentionally redundant
   with the RLS policy — two independent mechanisms have to both be wrong
   for a customer to grant themselves admin.

4. **Route protection is two layers, not one.** `src/middleware.ts` runs
   first, on every request matching `/admin/*`: no session → redirect to
   `/admin/login`; session but `role !== 'admin'` → redirect to `/`. Then
   `src/app/admin/layout.tsx`, a server component wrapping every admin
   page, independently re-checks the same thing via `requireAdmin()`. If
   middleware's matcher ever got misconfigured, the layout still catches it.

5. **Data access is enforced at the database, not just the route.** Every
   table has RLS **and** `FORCE ROW LEVEL SECURITY` enabled, so even a
   direct Postgres connection using the table owner role is still subject
   to policies. Public/customer sessions can only ever `SELECT` published,
   active storefront content; every `INSERT`/`UPDATE`/`DELETE` on
   `products`, `categories`, `collections`, `product_images`, and
   `product_variants` requires `public.is_admin()` to return true — there
   is no `USING (true)` anywhere in `0003_rls_policies.sql`.

6. **Orders are never client-inserted.** There's no customer `INSERT`
   policy on `orders` at all. Checkout goes through `create_order()`, a
   `SECURITY DEFINER` function that: requires `auth.uid()` to be set, locks
   each variant row (`FOR UPDATE`) before checking stock, rejects the whole
   order in one transaction if any item is out of stock, and only then
   decrements `stock_quantity` and inserts the order + items. This is also
   what makes stock-keeping race-safe under concurrent checkouts on the
   last unit of a size — two simultaneous buyers can't both "win."

7. **Customers only ever see their own orders.** The `orders` and
   `order_items` `SELECT` policies check `user_id = auth.uid()` (or
   `order_id` belongs to an order they own); admins bypass that via
   `is_admin()`. Customers have no `UPDATE` policy on `orders` at all, so
   an order's status/payment_status can only ever be changed by an admin.

## Verification performed in this sandbox

- **SQL**: parenthesis and `$$`-dollar-quote balance checked programmatically
  across all four migration files — all balanced, no output listed above.
  I have *not* run these against a live Postgres/Supabase instance (no
  network here), so run `supabase db push` against a real project and skim
  the SQL editor output before you rely on it in production.
- **TypeScript**: `npx tsc --noEmit` run against every `.ts`/`.tsx` file in
  `src/`, using minimal ambient shims in `types/shims.d.ts` for
  `@supabase/ssr` and `next/*` (since no network here to `npm install` the
  real packages) — **zero errors**. Once you `npm install` the real
  `@supabase/ssr` and `next`, delete `types/shims.d.ts` — the real packages'
  types are more precise than my stand-ins and should take over.
- **Homepage**: `src/components/home/VelmoraHome.jsx` is an untouched copy
  of the Phase 1 file — nothing in it was rewritten or removed.

## What's next (Phase 3)

Shop page (filters/sort reading from `products`+`product_variants`),
Product Detail page (variant selector wired to real stock), Cart, and
Checkout calling `createOrder()` — all can now sit directly on top of this
schema with no further backend changes required. Say the word and I'll keep
going without stopping for a check-in.
