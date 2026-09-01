import VelmoraHome from "@/components/home/VelmoraHome";
import { createClient } from "@/lib/supabase/server";

const HOME_SELECT = `id, name, slug,
  product_images ( image_url, alt_text, position ),
  product_variants ( color_name, color_hex, price, stock_quantity )`;

// Homepage rails are driven by the live catalog: New Arrivals pulls
// products flagged is_new, Best Sellers pulls is_featured. RLS keeps
// this limited to status='published' and is_active=true already, so
// no extra visibility filtering is needed here.
async function getHomeProducts(flag: "is_new" | "is_featured") {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select(HOME_SELECT)
      .eq(flag, true)
      .order("created_at", { ascending: false })
      .limit(4);
    if (error) return [];
    return data ?? [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [newArrivals, bestSellers] = await Promise.all([
    getHomeProducts("is_new"),
    getHomeProducts("is_featured"),
  ]);

  return (
    <>
      {/* Hero is the LCP element — start fetching it before React hydrates. */}
      <link
        rel="preload"
        as="image"
        href="/images/velmora-hero.webp"
        fetchPriority="high"
      />
      <VelmoraHome newArrivals={newArrivals} bestSellers={bestSellers} />
    </>
  );
}
