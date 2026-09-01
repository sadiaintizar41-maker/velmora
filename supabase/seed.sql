-- =========================================================
-- VELMORA - seed.sql
-- Demo catalog + first admin promotion.
--
-- HOW TO RUN (project owner, ~1 minute):
--   1. Open https://supabase.com/dashboard → pick the Velmora
--      project → SQL Editor → New query.
--   2. Paste this whole file and Run.
--   3. Confirm the two accounts under Authentication → Users
--      (admin@velmora.com and the test customer), or turn off
--      "Confirm email" in Authentication → Sign In / Providers.
--
-- Assumes migrations 0001-0004 are already applied.
-- Safe to re-run: every insert is guarded (on conflict / not exists).
-- =========================================================

-- ---------------------------------------------------------
-- 1. First admin.
-- promote_to_admin() is the only sanctioned path to role='admin'.
-- The auth user admin@velmora.com already exists (signed up
-- through the app's auth endpoint) so its profile row exists.
-- ---------------------------------------------------------
select public.promote_to_admin('admin@velmora.com');

-- ---------------------------------------------------------
-- 2. Categories
-- ---------------------------------------------------------
insert into public.categories (id, name, slug, description, image_url, is_active)
values
  ('a1000000-0000-0000-0000-000000000001', 'Dresses',      'dresses',      'Sculpted silhouettes and flowing forms for every hour of the day.', '/images/dresses.webp',   true),
  ('a1000000-0000-0000-0000-000000000002', 'Tops',         'tops',         'Considered shirting, blouses and layers cut from natural fibres.',  '/images/tops.webp',      true),
  ('a1000000-0000-0000-0000-000000000003', 'Bottoms',      'bottoms',      'Tailored trousers and skirts with an unhurried elegance.',          '/images/bottoms.webp',   true),
  ('a1000000-0000-0000-0000-000000000004', 'Bags',         'bags',         'Finishing notes - leather goods and quiet detail.',                 '/images/accessories.webp', true)
on conflict (slug) do nothing;

-- (Re)align the category name/slug if this seed is re-run over a DB
-- where it was previously named 'Accessories'.
update public.categories
set name = 'Bags', slug = 'bags', updated_at = now()
where id = 'a1000000-0000-0000-0000-000000000004';

-- ---------------------------------------------------------
-- 3. Collections
-- ---------------------------------------------------------
insert into public.collections (id, name, slug, description, image_url, is_featured, is_active)
values
  ('b1000000-0000-0000-0000-000000000001', 'The Signature Edit', 'signature-edit', 'The pieces that define Velmora - enduring shapes, quietly luxurious.', '/images/velmora-signature.webp',  true, true),
  ('b1000000-0000-0000-0000-000000000002', 'New Season',         'new-season',     'The latest arrivals for the season ahead.',                            '/images/velmora-newseason.webp',  true, true),
  ('b1000000-0000-0000-0000-000000000003', 'The Evening Edit',   'evening-edit',   'After-dark dressing - satin, silk and shadow.',                        '/images/velmora-eveningedit.webp', true, true)
on conflict (slug) do nothing;

-- ---------------------------------------------------------
-- 4. Products
-- ---------------------------------------------------------
insert into public.products (id, name, slug, description, category_id, collection_id, status, is_featured, is_new, is_active)
values
  ('c1000000-0000-0000-0000-000000000001', 'The Signature Midi Dress', 'signature-midi-dress', 'Our defining piece. A fluid midi cut on the bias so it moves with you, finished with a hand-rolled hem.', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'published', true,  true,  true),
  ('c1000000-0000-0000-0000-000000000002', 'Satin Evening Gown',      'satin-evening-gown',   'Liquid satin floor-length gown with a low draped back. Made for entrances.',                              'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000003', 'published', true,  false, true),
  ('c1000000-0000-0000-0000-000000000003', 'Classic Shirt Dress',     'classic-shirt-dress',  'Crisp cotton-poplin shirting reimagined as a dress - belted, easy, eternal.',                             'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000002', 'published', false, true,  true),
  ('c1000000-0000-0000-0000-000000000004', 'Linen Overshirt',         'linen-overshirt',      'Washed European linen with mother-of-pearl buttons. Wear it open, or buttoned as a shirt.',               'a1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000002', 'published', false, true,  true),
  ('c1000000-0000-0000-0000-000000000005', 'Silk Blouse',             'silk-blouse',          'Weighted 22-momme mulberry silk with a softly draped neckline.',                                          'a1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000001', 'published', true,  false, true),
  ('c1000000-0000-0000-0000-000000000006', 'Tailored Blazer',         'tailored-blazer',      'Single-breasted, sharp through the shoulder, softly constructed through the body.',                       'a1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000003', 'published', false, false, true),
  ('c1000000-0000-0000-0000-000000000007', 'Wide-Leg Trousers',       'wide-leg-trousers',    'High-waisted and floor-skimming, cut from dry-handle twill that holds its line.',                         'a1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000002', 'published', false, true,  true),
  ('c1000000-0000-0000-0000-000000000008', 'Pleated Maxi Skirt',      'pleated-maxi-skirt',   'Knife pleats fall the full length of washed crepe. Moves beautifully.',                                   'a1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000001', 'published', false, false, true),
  ('c1000000-0000-0000-0000-000000000009', 'Silk Scarf',              'silk-scarf',           'Hand-rolled 90cm silk twill scarf in our seasonal print.',                                                'a1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000003', 'published', false, false, true),
  ('c1000000-0000-0000-0000-00000000000a', 'Leather Belt',            'leather-belt',         'Full-grain leather with a solid brass buckle. Ages with you.',                                            'a1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000002', 'published', false, false, true),
  ('c1000000-0000-0000-0000-00000000000b', 'Minimal Handbag',         'minimal-handbag',      'Structured minimal handbag in full-grain leather with a brushed brass clasp.',                            'a1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000002', 'published', true,  false, true),
  ('c1000000-0000-0000-0000-00000000000c', 'Structured Tote',         'structured-tote',      'A quietly architectural everyday tote that holds its shape.',                                             'a1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000001', 'published', false, true,  true)
on conflict (slug) do nothing;

-- ---------------------------------------------------------
-- 5. Product images (position 0 is the primary/gallery cover)
-- ---------------------------------------------------------
insert into public.product_images (product_id, image_url, alt_text, position)
select 'c1000000-0000-0000-0000-000000000001', '/images/signature-dress.webp',       'The Signature Midi Dress', x.pos from unnest(array[0]) as x(pos)
where not exists (select 1 from public.product_images i where i.product_id = 'c1000000-0000-0000-0000-000000000001' and i.image_url = '/images/signature-dress.webp');

insert into public.product_images (product_id, image_url, alt_text, position)
select 'c1000000-0000-0000-0000-000000000001', '/images/velmora-signature.webp',   'The Signature Midi Dress - campaign', x.pos from unnest(array[1]) as x(pos)
where not exists (select 1 from public.product_images i where i.product_id = 'c1000000-0000-0000-0000-000000000001' and i.image_url = '/images/velmora-signature.webp');

insert into public.product_images (product_id, image_url, alt_text, position)
select 'c1000000-0000-0000-0000-000000000002', '/images/satin-evening-dress.webp', 'Satin Evening Gown', x.pos from unnest(array[0]) as x(pos)
where not exists (select 1 from public.product_images i where i.product_id = 'c1000000-0000-0000-0000-000000000002' and i.image_url = '/images/satin-evening-dress.webp');

insert into public.product_images (product_id, image_url, alt_text, position)
select 'c1000000-0000-0000-0000-000000000002', '/images/velmora-eveningedit.webp', 'Satin Evening Gown - campaign', x.pos from unnest(array[1]) as x(pos)
where not exists (select 1 from public.product_images i where i.product_id = 'c1000000-0000-0000-0000-000000000002' and i.image_url = '/images/velmora-eveningedit.webp');

insert into public.product_images (product_id, image_url, alt_text, position)
select 'c1000000-0000-0000-0000-000000000003', '/images/dresses.webp',            'Classic Shirt Dress', x.pos from unnest(array[0]) as x(pos)
where not exists (select 1 from public.product_images i where i.product_id = 'c1000000-0000-0000-0000-000000000003' and i.image_url = '/images/dresses.webp');

insert into public.product_images (product_id, image_url, alt_text, position)
select 'c1000000-0000-0000-0000-000000000004', '/images/linen-overshirt.avif',     'Linen Overshirt', x.pos from unnest(array[0]) as x(pos)
where not exists (select 1 from public.product_images i where i.product_id = 'c1000000-0000-0000-0000-000000000004' and i.image_url = '/images/linen-overshirt.avif');

insert into public.product_images (product_id, image_url, alt_text, position)
select 'c1000000-0000-0000-0000-000000000005', '/images/tops.webp',               'Silk Blouse', x.pos from unnest(array[0]) as x(pos)
where not exists (select 1 from public.product_images i where i.product_id = 'c1000000-0000-0000-0000-000000000005' and i.image_url = '/images/tops.webp');

insert into public.product_images (product_id, image_url, alt_text, position)
select 'c1000000-0000-0000-0000-000000000006', '/images/velmora-eveningedit.webp', 'Tailored Blazer', x.pos from unnest(array[0]) as x(pos)
where not exists (select 1 from public.product_images i where i.product_id = 'c1000000-0000-0000-0000-000000000006' and i.image_url = '/images/velmora-eveningedit.webp');

insert into public.product_images (product_id, image_url, alt_text, position)
select 'c1000000-0000-0000-0000-000000000007', '/images/wide-leg-trousers.webp',   'Wide-Leg Trousers', x.pos from unnest(array[0]) as x(pos)
where not exists (select 1 from public.product_images i where i.product_id = 'c1000000-0000-0000-0000-000000000007' and i.image_url = '/images/wide-leg-trousers.webp');

insert into public.product_images (product_id, image_url, alt_text, position)
select 'c1000000-0000-0000-0000-000000000008', '/images/bottoms.webp',            'Pleated Maxi Skirt', x.pos from unnest(array[0]) as x(pos)
where not exists (select 1 from public.product_images i where i.product_id = 'c1000000-0000-0000-0000-000000000008' and i.image_url = '/images/bottoms.webp');

insert into public.product_images (product_id, image_url, alt_text, position)
select 'c1000000-0000-0000-0000-000000000009', '/images/accessories.webp',        'Silk Scarf', x.pos from unnest(array[0]) as x(pos)
where not exists (select 1 from public.product_images i where i.product_id = 'c1000000-0000-0000-0000-000000000009' and i.image_url = '/images/accessories.webp');

insert into public.product_images (product_id, image_url, alt_text, position)
select 'c1000000-0000-0000-0000-00000000000a', '/images/accessories.webp',        'Leather Belt', x.pos from unnest(array[0]) as x(pos)
where not exists (select 1 from public.product_images i where i.product_id = 'c1000000-0000-0000-0000-00000000000a' and i.image_url = '/images/accessories.webp');

insert into public.product_images (product_id, image_url, alt_text, position)
select 'c1000000-0000-0000-0000-00000000000b', '/images/accessories.webp',        'Minimal Handbag', x.pos from unnest(array[0]) as x(pos)
where not exists (select 1 from public.product_images i where i.product_id = 'c1000000-0000-0000-0000-00000000000b' and i.image_url = '/images/accessories.webp');

insert into public.product_images (product_id, image_url, alt_text, position)
select 'c1000000-0000-0000-0000-00000000000c', '/images/accessories.webp',        'Structured Tote', x.pos from unnest(array[0]) as x(pos)
where not exists (select 1 from public.product_images i where i.product_id = 'c1000000-0000-0000-0000-00000000000c' and i.image_url = '/images/accessories.webp');

-- ---------------------------------------------------------
-- 6. Product variants
-- Unique per (product, size, color_name) and per sku.
-- ---------------------------------------------------------
insert into public.product_variants (product_id, size, color_name, color_hex, price, compare_at_price, stock_quantity, sku)
values
  -- The Signature Midi Dress - Rs. 18,900 (Noir on sale from 24,500)
  ('c1000000-0000-0000-0000-000000000001', 'XS', 'Ivory',     '#F5EFE2', 18900, null,   8, 'VLM-SMD-XS-IVO'),
  ('c1000000-0000-0000-0000-000000000001', 'XS', 'Noir',      '#1A1816', 18900, 24500, 5, 'VLM-SMD-XS-NOI'),
  ('c1000000-0000-0000-0000-000000000001', 'S',  'Ivory',     '#F5EFE2', 18900, null,  12, 'VLM-SMD-S-IVO'),
  ('c1000000-0000-0000-0000-000000000001', 'S',  'Noir',      '#1A1816', 18900, 24500, 9, 'VLM-SMD-S-NOI'),
  ('c1000000-0000-0000-0000-000000000001', 'S',  'Blush',     '#E8D5C9', 18900, null,   6, 'VLM-SMD-S-BLU'),
  ('c1000000-0000-0000-0000-000000000001', 'M',  'Ivory',     '#F5EFE2', 18900, null,  10, 'VLM-SMD-M-IVO'),
  ('c1000000-0000-0000-0000-000000000001', 'M',  'Noir',      '#1A1816', 18900, 24500, 7, 'VLM-SMD-M-NOI'),
  ('c1000000-0000-0000-0000-000000000001', 'M',  'Blush',     '#E8D5C9', 18900, null,   4, 'VLM-SMD-M-BLU'),
  ('c1000000-0000-0000-0000-000000000001', 'L',  'Ivory',     '#F5EFE2', 18900, null,   6, 'VLM-SMD-L-IVO'),
  ('c1000000-0000-0000-0000-000000000001', 'L',  'Noir',      '#1A1816', 18900, 24500, 3, 'VLM-SMD-L-NOI'),
  ('c1000000-0000-0000-0000-000000000001', 'XL', 'Noir',      '#1A1816', 18900, 24500, 2, 'VLM-SMD-XL-NOI'),
  -- Satin Evening Gown - Rs. 34,500
  ('c1000000-0000-0000-0000-000000000002', 'XS', 'Noir',      '#1A1816', 34500, null,   4, 'VLM-SEG-XS-NOI'),
  ('c1000000-0000-0000-0000-000000000002', 'S',  'Noir',      '#1A1816', 34500, null,   6, 'VLM-SEG-S-NOI'),
  ('c1000000-0000-0000-0000-000000000002', 'S',  'Emerald',   '#1F3D2B', 34500, null,   3, 'VLM-SEG-S-EME'),
  ('c1000000-0000-0000-0000-000000000002', 'M',  'Noir',      '#1A1816', 34500, null,   5, 'VLM-SEG-M-NOI'),
  ('c1000000-0000-0000-0000-000000000002', 'M',  'Champagne', '#C9A878', 34500, null,   2, 'VLM-SEG-M-CHA'),
  ('c1000000-0000-0000-0000-000000000002', 'L',  'Noir',      '#1A1816', 34500, null,   3, 'VLM-SEG-L-NOI'),
  -- Classic Shirt Dress - Rs. 15,900
  ('c1000000-0000-0000-0000-000000000003', 'S',  'Ivory',     '#F5EFE2', 15900, null,   7, 'VLM-CSD-S-IVO'),
  ('c1000000-0000-0000-0000-000000000003', 'S',  'Slate',     '#5A6B7C', 15900, null,   5, 'VLM-CSD-S-SLA'),
  ('c1000000-0000-0000-0000-000000000003', 'M',  'Ivory',     '#F5EFE2', 15900, null,   9, 'VLM-CSD-M-IVO'),
  ('c1000000-0000-0000-0000-000000000003', 'M',  'Slate',     '#5A6B7C', 15900, null,   4, 'VLM-CSD-M-SLA'),
  ('c1000000-0000-0000-0000-000000000003', 'L',  'Ivory',     '#F5EFE2', 15900, null,   6, 'VLM-CSD-L-IVO'),
  ('c1000000-0000-0000-0000-000000000003', 'XL', 'Ivory',     '#F5EFE2', 15900, null,   3, 'VLM-CSD-XL-IVO'),
  -- Linen Overshirt - Rs. 12,500
  ('c1000000-0000-0000-0000-000000000004', 'S',  'Sand',      '#D9CBB4', 12500, null,  10, 'VLM-LOS-S-SAN'),
  ('c1000000-0000-0000-0000-000000000004', 'S',  'Ivory',     '#F5EFE2', 12500, null,   6, 'VLM-LOS-S-IVO'),
  ('c1000000-0000-0000-0000-000000000004', 'M',  'Sand',      '#D9CBB4', 12500, null,   8, 'VLM-LOS-M-SAN'),
  ('c1000000-0000-0000-0000-000000000004', 'L',  'Sand',      '#D9CBB4', 12500, null,   7, 'VLM-LOS-L-SAN'),
  ('c1000000-0000-0000-0000-000000000004', 'XL', 'Sand',      '#D9CBB4', 12500, null,   4, 'VLM-LOS-XL-SAN'),
  -- Silk Blouse - Rs. 14,900
  ('c1000000-0000-0000-0000-000000000005', 'XS', 'Blush',     '#E8D5C9', 14900, null,   5, 'VLM-SLB-XS-BLU'),
  ('c1000000-0000-0000-0000-000000000005', 'S',  'Blush',     '#E8D5C9', 14900, null,   8, 'VLM-SLB-S-BLU'),
  ('c1000000-0000-0000-0000-000000000005', 'S',  'Noir',      '#1A1816', 14900, null,   6, 'VLM-SLB-S-NOI'),
  ('c1000000-0000-0000-0000-000000000005', 'M',  'Champagne', '#C9A878', 14900, 18900,  7, 'VLM-SLB-M-CHA'),
  ('c1000000-0000-0000-0000-000000000005', 'L',  'Noir',      '#1A1816', 14900, null,   4, 'VLM-SLB-L-NOI'),
  ('c1000000-0000-0000-0000-000000000005', 'XL', 'Blush',     '#E8D5C9', 14900, null,   3, 'VLM-SLB-XL-BLU'),
  -- Tailored Blazer - Rs. 27,900
  ('c1000000-0000-0000-0000-000000000006', 'XS', 'Noir',      '#1A1816', 27900, null,   3, 'VLM-TBZ-XS-NOI'),
  ('c1000000-0000-0000-0000-000000000006', 'S',  'Noir',      '#1A1816', 27900, null,   5, 'VLM-TBZ-S-NOI'),
  ('c1000000-0000-0000-0000-000000000006', 'S',  'Camel',     '#B08D6A', 27900, null,   4, 'VLM-TBZ-S-CAM'),
  ('c1000000-0000-0000-0000-000000000006', 'M',  'Noir',      '#1A1816', 27900, null,   6, 'VLM-TBZ-M-NOI'),
  ('c1000000-0000-0000-0000-000000000006', 'M',  'Camel',     '#B08D6A', 27900, null,   3, 'VLM-TBZ-M-CAM'),
  ('c1000000-0000-0000-0000-000000000006', 'L',  'Noir',      '#1A1816', 27900, null,   2, 'VLM-TBZ-L-NOI'),
  -- Wide-Leg Trousers - Rs. 13,900
  ('c1000000-0000-0000-0000-000000000007', 'XS', 'Noir',      '#1A1816', 13900, null,   6, 'VLM-WLT-XS-NOI'),
  ('c1000000-0000-0000-0000-000000000007', 'S',  'Noir',      '#1A1816', 13900, null,  10, 'VLM-WLT-S-NOI'),
  ('c1000000-0000-0000-0000-000000000007', 'S',  'Ivory',     '#F5EFE2', 13900, null,   5, 'VLM-WLT-S-IVO'),
  ('c1000000-0000-0000-0000-000000000007', 'M',  'Noir',      '#1A1816', 13900, null,   9, 'VLM-WLT-M-NOI'),
  ('c1000000-0000-0000-0000-000000000007', 'M',  'Ivory',     '#F5EFE2', 13900, null,   4, 'VLM-WLT-M-IVO'),
  ('c1000000-0000-0000-0000-000000000007', 'L',  'Noir',      '#1A1816', 13900, null,   6, 'VLM-WLT-L-NOI'),
  ('c1000000-0000-0000-0000-000000000007', 'XL', 'Noir',      '#1A1816', 13900, null,   3, 'VLM-WLT-XL-NOI'),
  -- Pleated Maxi Skirt - Rs. 11,900 (low-stock demo on XS Mocha)
  ('c1000000-0000-0000-0000-000000000008', 'XS', 'Mocha',     '#765C4D', 11900, null,   2, 'VLM-PMS-XS-MOC'),
  ('c1000000-0000-0000-0000-000000000008', 'S',  'Mocha',     '#765C4D', 11900, null,   7, 'VLM-PMS-S-MOC'),
  ('c1000000-0000-0000-0000-000000000008', 'S',  'Noir',      '#1A1816', 11900, null,   5, 'VLM-PMS-S-NOI'),
  ('c1000000-0000-0000-0000-000000000008', 'M',  'Mocha',     '#765C4D', 11900, null,   8, 'VLM-PMS-M-MOC'),
  ('c1000000-0000-0000-0000-000000000008', 'L',  'Noir',      '#1A1816', 11900, null,   4, 'VLM-PMS-L-NOI'),
  ('c1000000-0000-0000-0000-000000000008', 'XL', 'Mocha',     '#765C4D', 11900, null,   3, 'VLM-PMS-XL-MOC'),
  -- Silk Scarf - Rs. 6,900 (one size)
  ('c1000000-0000-0000-0000-000000000009', 'One Size', 'Blush',     '#E8D5C9', 6900, null, 15, 'VLM-SCF-OS-BLU'),
  ('c1000000-0000-0000-0000-000000000009', 'One Size', 'Champagne', '#C9A878', 6900, null, 12, 'VLM-SCF-OS-CHA'),
  -- Leather Belt - Rs. 8,900
  ('c1000000-0000-0000-0000-00000000000a', 'S',  'Noir',      '#1A1816', 8900, null,   6, 'VLM-BLT-S-NOI'),
  ('c1000000-0000-0000-0000-00000000000a', 'M',  'Noir',      '#1A1816', 8900, null,   9, 'VLM-BLT-M-NOI'),
  ('c1000000-0000-0000-0000-00000000000a', 'L',  'Noir',      '#1A1816', 8900, null,   5, 'VLM-BLT-L-NOI')
on conflict do nothing;
