import { createClient } from "@/lib/supabase/server";

export interface ShopFilters {
  category?: string; // category slug
  collection?: string; // collection slug
  size?: string;
  color?: string;
  minPrice?: number;
  maxPrice?: number;
  availability?: "in_stock" | "all";
  sort?: "featured" | "newest" | "price_asc" | "price_desc" | "best_selling";
  search?: string;
  page?: number;
  pageSize?: number;
}

// Fetches the storefront product grid. RLS already restricts this
// to status = 'published' AND is_active = true for non-admin
// sessions, so no extra filtering for that is needed here — the
// database is the source of truth for what's publicly visible.
export async function getShopProducts(filters: ShopFilters = {}) {
  const supabase = await createClient();
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 12;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("products")
    .select(
      `id, name, slug, is_featured, is_new, created_at,
       product_images ( image_url, alt_text, position ),
       product_variants ( id, size, color_name, color_hex, price, stock_quantity ),
       categories ( slug ),
       collections ( slug )`,
      { count: "exact" }
    );

  if (filters.category) query = query.eq("categories.slug", filters.category);
  if (filters.collection) query = query.eq("collections.slug", filters.collection);
  if (filters.search) query = query.ilike("name", `%${filters.search}%`);

  switch (filters.sort) {
    case "newest":
      query = query.order("created_at", { ascending: false });
      break;
    case "featured":
    default:
      query = query.order("is_featured", { ascending: false }).order("created_at", { ascending: false });
      break;
    // price_asc / price_desc / best_selling are applied client-side
    // below once variant prices are available, since price lives on
    // product_variants, not products.
  }

  const { data, error, count } = await query.range(from, to);
  if (error) throw error;

  let products = data ?? [];

  if (filters.size) {
    products = products.filter((p: any) =>
      p.product_variants?.some((v: any) => v.size === filters.size)
    );
  }
  if (filters.color) {
    products = products.filter((p: any) =>
      p.product_variants?.some((v: any) => v.color_name === filters.color)
    );
  }
  if (filters.availability === "in_stock") {
    products = products.filter((p: any) =>
      p.product_variants?.some((v: any) => v.stock_quantity > 0)
    );
  }
  if (filters.minPrice != null) {
    products = products.filter((p: any) =>
      p.product_variants?.some((v: any) => v.price >= (filters.minPrice as number))
    );
  }
  if (filters.maxPrice != null) {
    products = products.filter((p: any) =>
      p.product_variants?.some((v: any) => v.price <= (filters.maxPrice as number))
    );
  }
  if (filters.sort === "price_asc" || filters.sort === "price_desc") {
    const dir = filters.sort === "price_asc" ? 1 : -1;
    products = [...products].sort((a: any, b: any) => {
      const minA = Math.min(...a.product_variants.map((v: any) => v.price));
      const minB = Math.min(...b.product_variants.map((v: any) => v.price));
      return (minA - minB) * dir;
    });
  }

  return { products, count: count ?? 0, page, pageSize };
}

export async function getProductBySlug(slug: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select(
      `*,
       product_images ( id, image_url, alt_text, position ),
       product_variants ( id, size, color_name, color_hex, price, compare_at_price, stock_quantity, sku ),
       categories ( name, slug ),
       collections ( name, slug )`
    )
    .eq("slug", slug)
    .single();

  if (error) return null;
  return data;
}

export async function getRelatedProducts(categoryId: string | null, excludeProductId: string) {
  if (!categoryId) return [];
  const supabase = await createClient();

  const { data } = await supabase
    .from("products")
    .select(
      `id, name, slug,
       product_images ( image_url, position ),
       product_variants ( color_name, color_hex, price )`
    )
    .eq("category_id", categoryId)
    .neq("id", excludeProductId)
    .limit(4);

  return data ?? [];
}

export async function getCollectionBySlug(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("collections")
    .select("*")
    .eq("slug", slug)
    .single();
  if (error) return null;
  return data;
}

export async function getProductsByCollection(collectionId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      `id, name, slug, is_new,
       product_images ( image_url, position ),
       product_variants ( color_name, color_hex, price, stock_quantity )`
    )
    .eq("collection_id", collectionId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getProductsByIds(ids: string[]) {
  if (ids.length === 0) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      `id, name, slug, is_new,
       product_images ( image_url, position ),
       product_variants ( color_name, color_hex, price, stock_quantity )`
    )
    .in("id", ids);
  if (error) throw error;
  return data ?? [];
}

export async function getOrderById(orderId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select(`*, order_items ( * )`)
    .eq("id", orderId)
    .single();
  if (error) return null;
  return data;
}

export async function getCategories() {
  const supabase = await createClient();
  const { data } = await supabase.from("categories").select("*").eq("is_active", true);
  return data ?? [];
}

export async function getCollections() {
  const supabase = await createClient();
  const { data } = await supabase.from("collections").select("*").eq("is_active", true);
  return data ?? [];
}
