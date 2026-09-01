# VELMORA — Phase 3: Customer Shopping Experience

## Status: code complete against the Phase 2 schema, not yet run against a live Supabase project

Same caveat as Phase 2: no network in this sandbox, so nothing here has been
executed against a real database. What's verified below is real (TypeScript
compiles cleanly, no hard-coded product data, routing is consistent) — what
isn't verified is anything that requires an actual Postgres/Supabase
instance to observe (a real query returning real rows, RLS denying a real
unauthorized request, etc.).

## 1–3. Files created this phase

```
src/app/
  layout.tsx                        root layout: fonts, CartProvider,
                                     WishlistProvider, conditional header
  page.tsx                          "/" — renders VelmoraHome.jsx, untouched
  not-found.tsx                     site-wide on-brand 404

  shop/page.tsx                     Shop — filters, sort, pagination
  shop/loading.tsx

  collections/page.tsx              Collections index (cinematic covers)
  collections/loading.tsx
  collections/[slug]/page.tsx       Collection detail
  collections/[slug]/loading.tsx

  product/[slug]/page.tsx           Product detail
  product/[slug]/loading.tsx
  product/[slug]/not-found.tsx

  cart/page.tsx                     Bag
  checkout/page.tsx                 Contact → Shipping → Delivery → Payment
  order-confirmation/[orderId]/page.tsx
  wishlist/page.tsx

src/components/
  shop/ProductCard.tsx              image, name, price, colors, New badge,
                                     wishlist heart — reused everywhere
  shop/ProductGrid.tsx              grid + built-in empty/error states
  shop/ShopFilters.tsx              search/category/collection/size/
                                     availability/sort, drives URL params

  product/ProductGallery.tsx        position-ordered images, click-to-switch
  product/ColorSwatch.tsx           extracted, reusable
  product/SizeSelector.tsx          extracted, reusable, disables 0-stock
  product/VariantSelector.tsx       color+size → exact variant → price/
                                     stock/SKU, wired to cart + wishlist

  layout/SiteHeader.tsx             shared nav for every route except "/"
  layout/ConditionalHeader.tsx      hides SiteHeader on "/" (homepage has
                                     its own embedded Navbar)

src/lib/
  supabase/queries.ts               every Supabase read for this phase:
                                     getShopProducts, getProductBySlug,
                                     getRelatedProducts, getCategories,
                                     getCollections, getCollectionBySlug,
                                     getProductsByCollection,
                                     getProductsByIds, getOrderById
  cart/CartContext.tsx               client cart, localStorage-persisted
  wishlist/WishlistContext.tsx       client wishlist, localStorage-persisted
```

## Modified from Phase 2

Only `types/shims.d.ts` — expanded with the same dev-only ambient types
(now covering `useEffect`/`useMemo`/`useCallback`/`createContext`/
`useContext`, `notFound`, `lucide-react`) so this phase's files typecheck
too. **Nothing else from Phase 2 changed** — the four SQL migrations, the
RLS policies, `create_order()`, the admin middleware/layout, and the admin
login page are byte-identical to what you already reviewed.

## Homepage

`src/components/home/VelmoraHome.jsx` is byte-for-byte identical to the
Phase 1 file (diffed above — confirmed unchanged). `src/app/page.tsx` is a
new, one-line file that renders it; nothing inside the component itself
was touched. `src/components/layout/ConditionalHeader.tsx` exists
specifically so the new shared `SiteHeader` never appears on `/` and never
duplicates the homepage's own Navbar.

## Variant logic, concretely

`VariantSelector` (`src/components/product/VariantSelector.tsx`):
- Colors are derived from the product's variants; picking a color filters
  to that color's sizes.
- Picking size + color looks up the **one** matching row in
  `product_variants` (this is exactly what the Phase 2 schema's
  `unique (product_id, size, color_name)` constraint guarantees exists).
- Price, stock message ("Available" / "only N left" / "Out of Stock"), and
  the variant used for Add to Bag all update from that single row — not
  from the product as a whole.
- Sizes with `stock_quantity = 0` render disabled (`SizeSelector.tsx`) and
  can't be selected at all.
- "Add to Bag" is blocked with an inline error if: no variant resolves, the
  resolved variant has 0 stock, or the customer's cart already holds the
  full available quantity for that variant — so a customer can never queue
  up more than what Supabase reports as in stock. The real, final check
  still happens server-side in `create_order()` under a row lock, since a
  client-side check alone can't protect against two customers checking out
  at once.

## Error/loading/empty states

Every route that reads from Supabase has all three:

| Route | Loading | Empty | Error |
|---|---|---|---|
| Shop | `shop/loading.tsx` skeleton | "No pieces found." | "Unable to load products. Please try again." |
| Collections | `collections/loading.tsx` | "No collections found." | "Unable to load collections. Please try again." |
| Collection detail | `collections/[slug]/loading.tsx` | "No pieces in this collection yet." | "Unable to load this collection. Please try again." |
| Product detail | `product/[slug]/loading.tsx` | — (404 instead, correctly) | "Product Not Found" (`not-found.tsx`) |
| Wishlist | inline "Loading…" | "Your wishlist is empty." | "Unable to load your wishlist. Please try again." |
| Cart | — (instant, client state) | "Your bag is empty." | n/a (no network call) |

## 4. Verification performed

1. **TypeScript**: `npx tsc --noEmit` across the entire `src/` tree —
   **zero errors**. This required real fixes along the way (e.g. explicit
   `CartItem` typing instead of implicit `any` on a couple of `.map`
   callbacks), not just shim patches — see the diff history in this
   conversation if you want the specifics.
2. **Broken imports**: none — every component import resolves to a file
   that exists in the tree above; confirmed by the clean typecheck (a
   missing file would be a hard `tsc` error, not a warning).
3. **Routing**: every `<Link>`/`redirect()`/`router.push()` target in this
   phase resolves to a real route file — including `/order-confirmation/
   [orderId]`, which checkout redirects to and which didn't exist until
   this phase (would otherwise have been a dead link).
4. **Responsive / no horizontal overflow**: `ProductGrid` uses
   `repeat(auto-fill, minmax(240px, 1fr))`, which reflows without ever
   overflowing at any width. The three two-column layouts that don't
   self-reflow that way (Product detail's gallery/info split, Cart, and
   Checkout) now carry a `velmora-stack-2` class that collapses them to a
   single column under 900px (added to the global stylesheet in
   `layout.tsx`, same pattern the homepage already used). Related-products
   and the shop grid both step down column counts on mobile too.
5. **Homepage intact**: confirmed above, byte-for-byte diff.
6. **Products fetched from Supabase**: confirmed above — grepped the new
   route/component files for hard-coded product arrays; none exist. Every
   product-bearing page imports from `src/lib/supabase/queries.ts`.
7. **Variant selection**: see "Variant logic" above.
8. **Out-of-stock blocking**: see "Variant logic" above — blocked at three
   layers (disabled size button, Add-to-Bag guard, and the database-level
   `create_order()` stock check from Phase 2).
9. Reported here, as requested.

## Honesty note on what "confirmed" means here

I have **not** connected this to a live Supabase project, so I can't show
you an actual query returning actual rows, or an actual RLS denial. What I
can and did verify in this sandbox: the code compiles cleanly, contains no
hard-coded product substitutes, and every read path goes through the
Phase 2 schema and RLS as designed. The real end-to-end proof — "I searched
'linen' and got back my actual seeded products" — only happens once you
run the Phase 2 migrations against a real project and point `.env.local`
at it.

## What's next (Phase 4)

Admin CRUD (`/admin/products`, `/admin/categories`, `/admin/collections`,
`/admin/orders`, `/admin/customers`) sitting on the same schema and RLS —
say the word and I'll keep going.
