-- =========================================================
-- VELMORA — 0001_schema.sql
-- Core tables, enums, constraints, indexes.
-- Run in order: 0001_schema.sql -> 0002_functions_triggers.sql
--   -> 0003_rls_policies.sql -> 0004_storage.sql
-- =========================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------
-- ENUMS
-- ---------------------------------------------------------

create type public.user_role as enum ('customer', 'admin');

create type public.product_status as enum ('draft', 'published', 'archived');

create type public.order_status as enum (
  'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'
);

create type public.payment_status as enum ('pending', 'paid', 'failed', 'refunded');

-- ---------------------------------------------------------
-- PROFILES
-- One row per auth.users row. role defaults to 'customer' and
-- is only ever set to 'admin' by a trusted server-side/SQL path
-- (see 0002_functions_triggers.sql and 0003_rls_policies.sql).
-- ---------------------------------------------------------

create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text,
  email       text not null,
  avatar_url  text,
  role        public.user_role not null default 'customer',
  phone       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create unique index profiles_email_key on public.profiles (email);
create index profiles_role_idx on public.profiles (role);

-- ---------------------------------------------------------
-- CATEGORIES
-- ---------------------------------------------------------

create table public.categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null,
  description text,
  image_url   text,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint categories_slug_key unique (slug)
);

create index categories_is_active_idx on public.categories (is_active);

-- ---------------------------------------------------------
-- COLLECTIONS
-- ---------------------------------------------------------

create table public.collections (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null,
  description text,
  image_url   text,
  is_featured boolean not null default false,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint collections_slug_key unique (slug)
);

create index collections_is_active_idx on public.collections (is_active);
create index collections_is_featured_idx on public.collections (is_featured);

-- ---------------------------------------------------------
-- PRODUCTS
-- ---------------------------------------------------------

create table public.products (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  slug          text not null,
  description   text,
  category_id   uuid references public.categories (id) on delete set null,
  collection_id uuid references public.collections (id) on delete set null,
  status        public.product_status not null default 'draft',
  is_featured   boolean not null default false,
  is_new        boolean not null default false,
  -- kept for the brief's "is_active" language; a product is publicly
  -- visible only when status = 'published' AND is_active = true
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint products_slug_key unique (slug)
);

create index products_category_id_idx on public.products (category_id);
create index products_collection_id_idx on public.products (collection_id);
create index products_status_idx on public.products (status);
create index products_storefront_idx on public.products (status, is_active, is_featured, is_new);

-- ---------------------------------------------------------
-- PRODUCT IMAGES
-- ---------------------------------------------------------

create table public.product_images (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products (id) on delete cascade,
  image_url   text not null,
  alt_text    text,
  position    integer not null default 0,
  created_at  timestamptz not null default now()
);

create index product_images_product_id_idx on public.product_images (product_id, position);

-- ---------------------------------------------------------
-- PRODUCT VARIANTS
-- Size + color + price + stock live at the variant level.
-- A (product_id, size, color_name) combination is unique so the
-- storefront can map a selected size/color to exactly one row.
-- ---------------------------------------------------------

create table public.product_variants (
  id                uuid primary key default gen_random_uuid(),
  product_id        uuid not null references public.products (id) on delete cascade,
  size              text not null,
  color_name        text not null,
  color_hex         text not null,
  price             numeric(10, 2) not null check (price >= 0),
  compare_at_price  numeric(10, 2) check (compare_at_price is null or compare_at_price >= 0),
  stock_quantity    integer not null default 0 check (stock_quantity >= 0),
  sku               text not null,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  constraint product_variants_sku_key unique (sku),
  constraint product_variants_product_size_color_key unique (product_id, size, color_name)
);

create index product_variants_product_id_idx on public.product_variants (product_id);
create index product_variants_stock_idx on public.product_variants (product_id, stock_quantity);

-- ---------------------------------------------------------
-- ORDERS
-- ---------------------------------------------------------

create table public.orders (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid references public.profiles (id) on delete set null,
  status           public.order_status not null default 'pending',
  payment_status   public.payment_status not null default 'pending',
  subtotal         numeric(10, 2) not null check (subtotal >= 0),
  shipping_amount  numeric(10, 2) not null default 0 check (shipping_amount >= 0),
  total_amount     numeric(10, 2) not null check (total_amount >= 0),
  shipping_name    text not null,
  shipping_email   text not null,
  shipping_phone   text,
  shipping_address text not null,
  city             text not null,
  postal_code      text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index orders_user_id_idx on public.orders (user_id);
create index orders_status_idx on public.orders (status);
create index orders_payment_status_idx on public.orders (payment_status);
create index orders_created_at_idx on public.orders (created_at desc);

-- ---------------------------------------------------------
-- ORDER ITEMS
-- product_name / size / color / unit_price are captured at the
-- time of purchase so the order stays accurate even if the
-- product or variant is edited or deleted later.
-- ---------------------------------------------------------

create table public.order_items (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid not null references public.orders (id) on delete cascade,
  product_id    uuid references public.products (id) on delete set null,
  variant_id    uuid references public.product_variants (id) on delete set null,
  product_name  text not null,
  size          text not null,
  color         text not null,
  quantity      integer not null check (quantity > 0),
  unit_price    numeric(10, 2) not null check (unit_price >= 0),
  subtotal      numeric(10, 2) not null check (subtotal >= 0)
);

create index order_items_order_id_idx on public.order_items (order_id);
create index order_items_product_id_idx on public.order_items (product_id);
create index order_items_variant_id_idx on public.order_items (variant_id);
