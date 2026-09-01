-- =========================================================
-- VELMORA — 0002_functions_triggers.sql
-- =========================================================

-- ---------------------------------------------------------
-- updated_at maintenance
-- ---------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.categories
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.collections
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.products
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.product_variants
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.orders
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------
-- is_admin()
-- SECURITY DEFINER so it can read profiles.role without
-- re-triggering RLS on the profiles table (which would recurse).
-- search_path is pinned to prevent function hijacking.
-- ---------------------------------------------------------

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated, anon;

-- ---------------------------------------------------------
-- handle_new_user()
-- Fires on every auth.users insert (i.e. every signup, regardless
-- of which client called it). Always creates the profile with
-- role = 'customer'. There is deliberately no code path anywhere
-- that lets a signup request set role = 'admin' — admin accounts
-- are promoted afterwards, out-of-band, by an existing admin
-- (see "Admin role setup" notes / promote_to_admin below).
-- ---------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    'customer'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------
-- prevent_role_escalation()
-- Belt-and-braces alongside the RLS UPDATE policy on profiles:
-- even if a future policy change is made in error, a non-admin
-- can never flip their own (or anyone's) role via a normal
-- UPDATE. Only a session already carrying role = 'admin', or a
-- service-role/SQL call (which bypasses triggers only if run as
-- superuser — normal service-role calls still pass through this),
-- may change the role column.
-- ---------------------------------------------------------

create or replace function public.prevent_role_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role and not public.is_admin() then
    raise exception 'Only an admin can change a profile role.';
  end if;
  return new;
end;
$$;

create trigger guard_role_escalation
  before update on public.profiles
  for each row execute function public.prevent_role_escalation();

-- ---------------------------------------------------------
-- promote_to_admin(target_email text)
-- The ONLY sanctioned way to create an admin: run this manually
-- from the Supabase SQL editor (or via the service role) as a
-- trusted operator action. It is intentionally not exposed to
-- any customer-facing API or RPC role.
-- Usage:  select public.promote_to_admin('owner@velmora.com');
-- ---------------------------------------------------------

create or replace function public.promote_to_admin(target_email text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles set role = 'admin' where email = target_email;
end;
$$;

revoke all on function public.promote_to_admin(text) from public, authenticated, anon;
-- Deliberately: no grant to authenticated/anon. Only callable by
-- the service role / a project owner running SQL directly.

-- ---------------------------------------------------------
-- generate_order_number()  (human-readable order reference)
-- Stored as text on demand by the app layer if needed; orders.id
-- (uuid) remains the primary key / source of truth.
-- ---------------------------------------------------------

create or replace function public.generate_order_number()
returns text
language sql
stable
as $$
  select 'VLM-' || to_char(now(), 'YYMMDD') || '-' ||
         upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));
$$;

-- ---------------------------------------------------------
-- create_order(payload jsonb, items jsonb)
-- Creates an order and its order_items, and decrements variant
-- stock atomically and safely under concurrent checkouts:
--   - each variant row is locked with SELECT ... FOR UPDATE
--   - stock is re-checked after the lock is acquired
--   - the whole call runs in one transaction (implicit, as a
--     single function call), so a failure rolls everything back
-- This is the function the app's checkout flow should call via
-- supabase.rpc('create_order', { payload, items }) instead of
-- doing separate INSERT + UPDATE calls from the client, which
-- would be vulnerable to a race between two simultaneous
-- checkouts on the last unit of stock.
-- ---------------------------------------------------------

create or replace function public.create_order(payload jsonb, items jsonb)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_order_id uuid;
  item         jsonb;
  v_variant    public.product_variants%rowtype;
  v_subtotal   numeric(10,2) := 0;
begin
  if auth.uid() is null then
    raise exception 'Must be signed in to place an order.';
  end if;

  insert into public.orders (
    user_id, status, payment_status, subtotal, shipping_amount, total_amount,
    shipping_name, shipping_email, shipping_phone, shipping_address, city, postal_code
  ) values (
    auth.uid(), 'pending', 'pending',
    (payload ->> 'subtotal')::numeric,
    coalesce((payload ->> 'shipping_amount')::numeric, 0),
    (payload ->> 'total_amount')::numeric,
    payload ->> 'shipping_name',
    payload ->> 'shipping_email',
    payload ->> 'shipping_phone',
    payload ->> 'shipping_address',
    payload ->> 'city',
    payload ->> 'postal_code'
  )
  returning id into new_order_id;

  for item in select * from jsonb_array_elements(items)
  loop
    select * into v_variant
      from public.product_variants
      where id = (item ->> 'variant_id')::uuid
      for update; -- lock the row for the duration of this transaction

    if not found then
      raise exception 'Variant % not found.', item ->> 'variant_id';
    end if;

    if v_variant.stock_quantity < (item ->> 'quantity')::integer then
      raise exception 'Insufficient stock for %/%: only % left.',
        v_variant.size, v_variant.color_name, v_variant.stock_quantity;
    end if;

    update public.product_variants
      set stock_quantity = stock_quantity - (item ->> 'quantity')::integer
      where id = v_variant.id;

    insert into public.order_items (
      order_id, product_id, variant_id, product_name, size, color,
      quantity, unit_price, subtotal
    ) values (
      new_order_id, v_variant.product_id, v_variant.id,
      item ->> 'product_name', v_variant.size, v_variant.color_name,
      (item ->> 'quantity')::integer, v_variant.price,
      v_variant.price * (item ->> 'quantity')::integer
    );
  end loop;

  return new_order_id;
end;
$$;

revoke all on function public.create_order(jsonb, jsonb) from public, anon;
grant execute on function public.create_order(jsonb, jsonb) to authenticated;
