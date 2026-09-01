"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useWishlist } from "@/lib/wishlist/WishlistContext";

interface Variant {
  color_name: string;
  color_hex: string;
  price: number;
  stock_quantity?: number;
}

interface Props {
  productId?: string;
  slug: string;
  name: string;
  imageUrl: string;
  variants: Variant[];
}

const formatPKR = (n: number) => `Rs. ${n.toLocaleString("en-PK")}`;

export default function ProductCard({ productId, slug, name, imageUrl, variants }: Props) {
  const { has, toggle } = useWishlist();
  const wishlistKey = productId ?? slug;
  const isWished = has(wishlistKey);

  const prices = variants.map((v) => v.price);
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const inStock = variants.some((v) => (v.stock_quantity ?? 1) > 0);

  return (
    <div>
      <div style={{ position: "relative", overflow: "hidden" }}>
        <Link href={`/product/${slug}`} style={{ display: "block" }}>
          <img
            src={imageUrl}
            alt={name}
            style={{ width: "100%", aspectRatio: "3/4", objectFit: "cover", filter: "grayscale(0.15) sepia(0.05)" }}
            loading="lazy"
          />
        </Link>

        {!inStock && (
          <span
            style={{
              position: "absolute", top: 14, left: 14, background: "#A32D2D",
              color: "#F7F3EC", fontFamily: "Inter, sans-serif", fontSize: 10,
              letterSpacing: "0.1em", textTransform: "uppercase", padding: "5px 10px",
            }}
          >
            Sold Out
          </span>
        )}

        <button
          onClick={(e: any) => { e.preventDefault(); toggle(wishlistKey); }}
          aria-label={isWished ? `Remove ${name} from wishlist` : `Add ${name} to wishlist`}
          aria-pressed={isWished}
          style={{
            position: "absolute", top: 14, right: 14, background: "rgba(247,243,236,0.9)",
            border: "none", borderRadius: "50%", width: 34, height: 34, display: "flex",
            alignItems: "center", justifyContent: "center", cursor: "pointer",
          }}
        >
          <Heart size={15} strokeWidth={1.5} color="#171515" fill={isWished ? "#765C4D" : "none"} />
        </button>
      </div>

      <Link href={`/product/${slug}`} style={{ textDecoration: "none", display: "block", marginTop: 16 }}>
        <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: "#171515", margin: 0 }}>
          {name}
        </h3>
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 14, color: "#765C4D", margin: "6px 0 10px" }}>
          {formatPKR(minPrice)}
        </p>
        <div style={{ display: "flex", gap: 6 }}>
          {variants.slice(0, 5).map((v, i) => (
            <span
              key={`${v.color_name}-${i}`}
              title={v.color_name}
              style={{ width: 14, height: 14, borderRadius: "50%", background: v.color_hex, border: "1px solid #C9A87866" }}
            />
          ))}
        </div>
      </Link>
    </div>
  );
}
