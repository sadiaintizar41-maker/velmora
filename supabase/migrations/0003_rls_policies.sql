-- =========================================================
-- VELMORA — 0003_rls_policies.sql
-- Every table has RLS enabled with FORCE, so even the table
-- owner role is subject to policies (defense in depth). No
-- policy anywhere uses `USING (true)` for a write operation.
-- =========================================================

-- ---------------------------------------------------------
-- PROFILES
-- ---------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.profiles force row level security;

create policy "profiles_select_own_or_admin"
  on public.profiles for select
  to authenticated
  using (id = auth.uid() or public.is_admin());

create policy "profiles_update_own_or_admin"
  on public.profiles for update
  to authenticated
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());
  -- role escalation is additionally blocked by the
  -- guard_role_escalation trigger regardless of this policy

-- no insert/delete policies for customers: rows are created only
-- by handle_new_user() (security definer) and are never deleted
-- by the app directly (cascades from auth.users deletion instead).
create policy "profiles_admin_manage"
  on public.profiles for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------
-- CATEGORIES
-- ---------------------------------------------------------

alter table public.categories enable row level security;
alter table public.categories force row level security;

create policy "categories_public_read_active"
  on public.categories for select
  to anon, authenticated
  using (is_active = true or public.is_admin());

create policy "categories_admin_write"
  on public.categories for insert
  to authenticated
  with check (public.is_admin());

create policy "categories_admin_update"
  on public.categories for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "categories_admin_delete"
  on public.categories for delete
  to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------
-- COLLECTIONS
-- ---------------------------------------------------------

alter table public.collections enable row level security;
alter table public.collections force row level security;

create policy "collections_public_read_active"
  on public.collections for select
  to anon, authenticated
  using (is_active = true or public.is_admin());

create policy "collections_admin_write"
  on public.collections for insert
  to authenticated
  with check (public.is_admin());

create policy "collections_admin_update"
  on public.collections for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "collections_admin_delete"
  on public.collections for delete
  to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------
-- PRODUCTS
-- Public storefront only ever sees status = 'published' and
-- is_active = true. Draft and archived products are invisible
-- to anon/authenticated non-admin sessions at the database
-- level — not just hidden by frontend filtering.
-- ---------------------------------------------------------

alter table public.products enable row level security;
alter table public.products force row level security;

create policy "products_public_read_published"
  on public.products for select
  to anon, authenticated
  using (
    (status = 'published' and is_active = true)
    or public.is_admin()
  );

create policy "products_admin_write"
  on public.products for insert
  to authenticated
  with check (public.is_admin());

create policy "products_admin_update"
  on public.products for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "products_admin_delete"
  on public.products for delete
  to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------
-- PRODUCT_IMAGES
-- Readable only when the parent product is publicly visible
-- (or the caller is an admin).
-- ---------------------------------------------------------

alter table public.product_images enable row level security;
alter table public.product_images force row level security;

create policy "product_images_public_read"
  on public.product_images for select
  to anon, authenticated
  using (
    public.is_admin()
    or exists (
      select 1 from public.products p
      where p.id = product_images.product_id
        and p.status = 'published' and p.is_active = true
    )
  );

create policy "product_images_admin_write"
  on public.product_images for insert
  to authenticated
  with check (public.is_admin());

create policy "product_images_admin_update"
  on public.product_images for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "product_images_admin_delete"
  on public.product_images for delete
  to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------
-- PRODUCT_VARIANTS
-- Same visibility rule as product_images. Stock and price are
-- only ever written by admins directly, or decremented by the
-- create_order() SECURITY DEFINER function during checkout.
-- ---------------------------------------------------------

alter table public.product_variants enable row level security;
alter table public.product_variants force row level security;

create policy "product_variants_public_read"
  on public.product_variants for select
  to anon, authenticated
  using (
    public.is_admin()
    or exists (
      select 1 from public.products p
      where p.id = product_variants.product_id
        and p.status = 'published' and p.is_active = true
    )
  );

create policy "product_variants_admin_write"
  on public.product_variants for insert
  to authenticated
  with check (public.is_admin());

create policy "product_variants_admin_update"
  on public.product_variants for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
  -- customer checkout does NOT update this table directly;
  -- stock decrements happen only inside create_order(), which
  -- runs as SECURITY DEFINER and therefore bypasses this policy
  -- by design, under the constraints written into that function.

create policy "product_variants_admin_delete"
  on public.product_variants for delete
  to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------
-- ORDERS
-- Customers: can read and create their own orders only, and
-- can never update status/payment_status/totals after creation
-- (no customer UPDATE policy exists at all — only admins can
-- update orders). Admins: full access.
-- ---------------------------------------------------------

alter table public.orders enable row level security;
alter table public.orders force row level security;

create policy "orders_select_own_or_admin"
  on public.orders for select
  to authenticated
  using (user_id = auth.uid() or public.is_admin());

create policy "orders_admin_update"
  on public.orders for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "orders_admin_delete"
  on public.orders for delete
  to authenticated
  using (public.is_admin());

-- Deliberately no direct customer INSERT policy: orders are
-- created exclusively through public.create_order(), a
-- SECURITY DEFINER RPC that validates stock and ownership
-- server-side (see 0002_functions_triggers.sql). This closes
-- off a class of bugs where a client could otherwise insert an
-- order row with a fabricated total or someone else's user_id.

-- ---------------------------------------------------------
-- ORDER_ITEMS
-- Readable by the owning customer (via their order) or an admin.
-- Written only through create_order(); no direct client policy.
-- ---------------------------------------------------------

alter table public.order_items enable row level security;
alter table public.order_items force row level security;

create policy "order_items_select_own_or_admin"
  on public.order_items for select
  to authenticated
  using (
    public.is_admin()
    or exists (
      select 1 from public.orders o
      where o.id = order_items.order_id and o.user_id = auth.uid()
    )
  );
