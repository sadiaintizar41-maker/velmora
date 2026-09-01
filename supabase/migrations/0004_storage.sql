-- =========================================================
-- VELMORA — 0004_storage.sql
-- Storage bucket for product imagery. Files themselves live in
-- Storage; product_images / categories.image_url / etc. store
-- only the resulting public URL, never binary data in Postgres.
-- =========================================================

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- Anyone can view images (bucket is public — needed for the
-- storefront to render product photos without auth).
create policy "product_images_bucket_public_read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'product-images');

-- Only admins may upload.
create policy "product_images_bucket_admin_insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'product-images' and public.is_admin());

-- Only admins may replace/rename.
create policy "product_images_bucket_admin_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'product-images' and public.is_admin())
  with check (bucket_id = 'product-images' and public.is_admin());

-- Only admins may delete.
create policy "product_images_bucket_admin_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'product-images' and public.is_admin());

-- Recommended object path convention (enforced by the app's
-- ImageUploader, not the database): products/{product_id}/{uuid}.{ext}
-- so images are easy to browse per-product in the dashboard and
-- easy to bulk-delete when a product is deleted.
