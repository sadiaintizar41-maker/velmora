"use client";

import { useMemo, useState } from "react";
import { useCart, type CartItem } from "@/lib/cart/CartContext";
import { useWishlist } from "@/lib/wishlist/WishlistContext";
import ColorSwatch from "./ColorSwatch";
import SizeSelector from "./SizeSelector";

interface Variant {
  id: string;
  size: string;
  color_name: string;
  color_hex: string;
  price: number;
  compare_at_price: number | null;
  stock_quantity: number;
}

interface Props {
  productId: string;
  productSlug: string;
  productName: string;
  imageUrl: string;
  variants: Variant[];
}

const SIZE_ORDER = ["XS", "S", "M", "L", "XL"];
const formatPKR = (n: number) => `Rs. ${n.toLocaleString("en-PK")}`;

export default function VariantSelector({ productId, productSlug, productName, imageUrl, variants }: Props) {
  const { addItem, items } = useCart();
  const { has, toggle } = useWishlist();
  const wished = has(productId);

  const colors = useMemo(
    () =>
      Array.from(
        new Map(variants.map((v) => [v.color_name, { ...v, available: true }])).values()
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [variants.map((v) => v.color_name + v.color_hex + v.stock_quantity).join("|")]
  );

  const [selectedColor, setSelectedColor] = useState(
    (colors.find((c) => variants.some((v) => v.color_name === c.color_name && v.stock_quantity > 0)) ?? colors[0])?.color_name ?? ""
  );

  const sizesForColor = useMemo(
    () =>
      variants
        .filter((v) => v.color_name === selectedColor)
        .sort((a, b) => SIZE_ORDER.indexOf(a.size) - SIZE_ORDER.indexOf(b.size)),
    [variants, selectedColor]
  );

  const [selectedSize, setSelectedSize] = useState(
    sizesForColor.find((v) => v.stock_quantity > 0)?.size ?? sizesForColor[0]?.size ?? ""
  );

  const selectedVariant = variants.find(
    (v) => v.color_name === selectedColor && v.size === selectedSize
  );

  // A color is selectable only if it has at least one size in stock.
  // If the chosen size has no stock in this color, the swatch gets
  // the red strike-through as well (that exact combo is unavailable).
  const colorsWithAvailability = colors.map((c) => {
    const forColor = variants.filter((v) => v.color_name === c.color_name);
    const anyInStock = forColor.some((v) => v.stock_quantity > 0);
    const hasSelectedSize = forColor.some(
      (v) => v.size === selectedSize && v.stock_quantity > 0
    );
    return {
      color_name: c.color_name,
      color_hex: c.color_hex,
      available: anyInStock && hasSelectedSize,
      unavailableLabel: anyInStock
        ? `${c.color_name} — not available in ${selectedSize}`
        : `${c.color_name} — out of stock`,
    };
  });

  const allOutOfStock = variants.every((v) => v.stock_quantity <= 0);

  const [added, setAdded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openPanel, setOpenPanel] = useState<string | null>(null);

  function handleColorChange(colorName: string) {
    setSelectedColor(colorName);
    const nextSizes = variants
      .filter((v) => v.color_name === colorName)
      .sort((a, b) => SIZE_ORDER.indexOf(a.size) - SIZE_ORDER.indexOf(b.size));
    setSelectedSize(nextSizes.find((v) => v.stock_quantity > 0)?.size ?? nextSizes[0]?.size ?? "");
    setError(null);
    setAdded(false);
  }

  function handleAddToBag() {
    if (!selectedVariant) {
      setError("Select a size and color first.");
      return;
    }
    if (selectedVariant.stock_quantity <= 0) {
      setError("This size is currently out of stock.");
      return;
    }

    const alreadyInCart = items.find((i: CartItem) => i.variant_id === selectedVariant.id)?.quantity ?? 0;
    if (alreadyInCart >= selectedVariant.stock_quantity) {
      setError("You already have the maximum available quantity in your bag.");
      return;
    }

    addItem({
      variant_id: selectedVariant.id,
      product_id: productId,
      product_slug: productSlug,
      product_name: productName,
      image_url: imageUrl,
      size: selectedVariant.size,
      color_name: selectedVariant.color_name,
      color_hex: selectedVariant.color_hex,
      unit_price: selectedVariant.price,
      quantity: 1,
      stock_quantity: selectedVariant.stock_quantity,
    });
    setError(null);
    setAdded(true);
  }

  return (
    <div>
      {allOutOfStock && (
        <p
          style={{
            display: "inline-block",
            background: "#A32D2D",
            color: "#F7F3EC",
            fontFamily: "Inter, sans-serif",
            fontSize: 11,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            padding: "5px 12px",
            margin: "0 0 10px",
          }}
        >
          Sold Out
        </p>
      )}
      <p style={{ fontFamily: "Inter, sans-serif", fontSize: 22, color: "#765C4D", margin: "10px 0 26px" }}>
        {selectedVariant ? formatPKR(selectedVariant.price) : ""}
        {selectedVariant?.compare_at_price && (
          <span style={{ marginLeft: 10, textDecoration: "line-through", color: "#3A292680", fontSize: 16 }}>
            {formatPKR(selectedVariant.compare_at_price)}
          </span>
        )}
      </p>

      <fieldset style={{ border: "none", padding: 0, margin: "0 0 26px" }}>
        <legend style={legendStyle}>Color — {selectedColor}</legend>
        <ColorSwatch
          colors={colorsWithAvailability}
          selected={selectedColor}
          onSelect={handleColorChange}
        />
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: "#3A2926", opacity: 0.65, marginTop: 8 }}>
          Crossed-out colors are unavailable.
        </p>
      </fieldset>

      <fieldset style={{ border: "none", padding: 0, margin: "0 0 30px" }}>
        <legend style={legendStyle}>Size</legend>
        <SizeSelector
          sizes={sizesForColor}
          selected={selectedSize}
          onSelect={(size) => { setSelectedSize(size); setError(null); setAdded(false); }}
        />
        {selectedVariant && (
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: selectedVariant.stock_quantity > 0 ? "#3A2926" : "#A32D2D", marginTop: 10 }}>
            {allOutOfStock
              ? "This product is sold out."
              : selectedVariant.stock_quantity > 0
                ? `Available${selectedVariant.stock_quantity <= 3 ? ` — only ${selectedVariant.stock_quantity} left` : ""}`
                : "Out of Stock"}
          </p>
        )}
      </fieldset>

      <div style={{ display: "flex", gap: 12 }}>
        <button onClick={handleAddToBag} disabled={allOutOfStock} style={{ ...primaryBtn, ...(allOutOfStock ? disabledPrimary : {}) }}>
          {allOutOfStock ? "Sold Out" : added ? "Added to Bag" : "Add to Bag"}
        </button>
        <button
          onClick={() => toggle(productId)}
          aria-pressed={wished}
          aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
          style={secondaryBtn}
        >
          {wished ? "Wishlisted" : "Add to Wishlist"}
        </button>
      </div>

      {error && (
        <p role="alert" style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: "#A32D2D", marginTop: 12 }}>
          {error}
        </p>
      )}

      <div style={{ marginTop: 40, borderTop: "1px solid #C9A87833" }}>
        {["Size Guide", "Shipping & Returns", "Product Details"].map((panel) => (
          <div key={panel} style={{ borderBottom: "1px solid #C9A87833" }}>
            <button
              onClick={() => setOpenPanel((p) => (p === panel ? null : panel))}
              aria-expanded={openPanel === panel}
              style={{
                width: "100%",
                textAlign: "left",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "16px 0",
                fontFamily: "Inter, sans-serif",
                fontSize: 13,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#171515",
              }}
            >
              {panel} {openPanel === panel ? "–" : "+"}
            </button>
            {openPanel === panel && (
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: 14, lineHeight: 1.8, color: "#3A2926", paddingBottom: 18 }}>
                {panel === "Size Guide" && "Model is 5'9\" wearing a size S. True to size across XS–XL."}
                {panel === "Shipping & Returns" && "Free standard shipping across Pakistan on orders over Rs. 10,000. Returns accepted within 14 days, unworn and tagged."}
                {panel === "Product Details" && "Made from responsibly sourced fabric, finished by hand. Care instructions are included on the garment label."}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const legendStyle: React.CSSProperties = {
  fontFamily: "Inter, sans-serif",
  fontSize: 11,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "#765C4D",
  marginBottom: 12,
  padding: 0,
};

const primaryBtn: React.CSSProperties = {
  flex: 1,
  background: "#171515",
  color: "#F7F3EC",
  border: "none",
  padding: "16px 0",
  fontFamily: "Inter, sans-serif",
  fontSize: 12,
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  cursor: "pointer",
};

const disabledPrimary: React.CSSProperties = {
  background: "#3A292666",
  cursor: "not-allowed",
};

const secondaryBtn: React.CSSProperties = {
  flex: 1,
  background: "transparent",
  color: "#171515",
  border: "1px solid #171515",
  padding: "16px 0",
  fontFamily: "Inter, sans-serif",
  fontSize: 12,
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  cursor: "pointer",
};
