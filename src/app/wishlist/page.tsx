"use client";

import { useEffect, useState } from "react";
import { useWishlist } from "@/lib/wishlist/WishlistContext";
import { createClient } from "@/lib/supabase/client";
import ProductGrid from "@/components/shop/ProductGrid";

export default function WishlistPage() {
  const { ids } = useWishlist();
  const [products, setProducts] = useState<any[] | null>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    const idList = Array.from(ids);
    if (idList.length === 0) {
      setProducts([]);
      return;
    }
    const supabase = createClient();
    supabase
      .from("products")
      .select(
        `id, name, slug, is_new,
         product_images ( image_url, position ),
         product_variants ( color_name, color_hex, price, stock_quantity )`
      )
      .in("id", idList)
      .then(({ data, error }: { data: any; error: any }) => {
        if (error) { setLoadError(true); return; }
        setProducts(data ?? []);
      });
  }, [ids]);

  return (
    <div style={{ background: "#F7F3EC", minHeight: "100vh", padding: "140px 32px 100px" }}>
      <div style={{ maxWidth: 1320, margin: "0 auto" }}>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(36px,5vw,54px)", color: "#171515", margin: "0 0 40px" }}>
          Your Wishlist
        </h1>

        {products === null ? (
          <p style={{ fontFamily: "Inter, sans-serif", color: "#3A2926", padding: "60px 0", textAlign: "center" }}>
            Loading…
          </p>
        ) : (
          <ProductGrid
            products={products}
            loadError={loadError}
            emptyMessage="Your wishlist is empty."
            errorMessage="Unable to load your wishlist. Please try again."
          />
        )}
      </div>
    </div>
  );
}
