"use client";

import Link from "next/link";
import { useCart, type CartItem } from "@/lib/cart/CartContext";

const formatPKR = (n: number) => `Rs. ${n.toLocaleString("en-PK")}`;
const FREE_SHIPPING_THRESHOLD = 10000;
const SHIPPING_FLAT_RATE = 350;

export default function CartPage() {
  const { items, removeItem, setQuantity, subtotal } = useCart();
  const shipping = items.length === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT_RATE;
  const total = subtotal + shipping;

  return (
    <div style={{ background: "#F7F3EC", minHeight: "100vh", padding: "140px 32px 100px" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(36px,5vw,54px)", color: "#171515", margin: "0 0 40px" }}>
          Your Bag
        </h1>

        {items.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: 15, color: "#3A2926", marginBottom: 24 }}>
              Your bag is empty.
            </p>
            <Link
              href="/shop"
              style={{
                fontFamily: "Inter, sans-serif", fontSize: 12, letterSpacing: "0.16em",
                textTransform: "uppercase", color: "#171515", border: "1px solid #171515",
                padding: "14px 34px", textDecoration: "none",
              }}
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 60 }} className="velmora-stack-2">
            <div>
              {items.map((item: CartItem) => (
                <div
                  key={item.variant_id}
                  style={{ display: "flex", gap: 20, padding: "22px 0", borderBottom: "1px solid #C9A87833" }}
                >
                  <img
                    src={item.image_url}
                    alt={item.product_name}
                    style={{ width: 92, height: 116, objectFit: "cover", filter: "grayscale(0.1) sepia(0.05)" }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: "#171515", margin: 0 }}>
                        {item.product_name}
                      </h3>
                      <button
                        onClick={() => removeItem(item.variant_id)}
                        aria-label={`Remove ${item.product_name} from bag`}
                        style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "Inter, sans-serif", fontSize: 12, color: "#765C4D" }}
                      >
                        Remove
                      </button>
                    </div>
                    <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: "#3A2926", margin: "6px 0" }}>
                      {item.color_name} / {item.size}
                    </p>
                    <p style={{ fontFamily: "Inter, sans-serif", fontSize: 14, color: "#765C4D", margin: "6px 0 12px" }}>
                      {formatPKR(item.unit_price)}
                    </p>
                    <label style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: "#3A2926" }}>
                      Qty{" "}
                      <select
                        value={item.quantity}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setQuantity(item.variant_id, Number(e.target.value))}
                        style={{ fontFamily: "Inter, sans-serif", fontSize: 13, padding: "4px 8px" }}
                      >
                        {Array.from({ length: item.stock_quantity }, (_, i) => i + 1).map((q) => (
                          <option key={q} value={q}>{q}</option>
                        ))}
                      </select>
                    </label>
                    {item.quantity >= item.stock_quantity && (
                      <p style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: "#A32D2D", marginTop: 6 }}>
                        Maximum available quantity reached.
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ background: "#E8D8D1", padding: 28, height: "fit-content" }}>
              <SummaryRow label="Subtotal" value={formatPKR(subtotal)} />
              <SummaryRow label="Shipping" value={shipping === 0 ? "Free" : formatPKR(shipping)} />
              <div style={{ borderTop: "1px solid #17151533", margin: "16px 0" }} />
              <SummaryRow label="Total" value={formatPKR(total)} bold />
              <Link
                href="/checkout"
                style={{
                  display: "block", textAlign: "center", marginTop: 24,
                  background: "#171515", color: "#F7F3EC", padding: "16px 0",
                  fontFamily: "Inter, sans-serif", fontSize: 12, letterSpacing: "0.16em",
                  textTransform: "uppercase", textDecoration: "none",
                }}
              >
                Proceed to Checkout
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryRow({ label, value, bold = false }: { label: string; value: string; bold?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
      <span style={{ fontFamily: "Inter, sans-serif", fontSize: bold ? 15 : 13, color: "#171515", fontWeight: bold ? 600 : 400 }}>
        {label}
      </span>
      <span style={{ fontFamily: "Inter, sans-serif", fontSize: bold ? 15 : 13, color: "#171515", fontWeight: bold ? 600 : 400 }}>
        {value}
      </span>
    </div>
  );
}
