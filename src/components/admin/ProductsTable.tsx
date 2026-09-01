"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { setProductStatus, toggleProductFlag } from "@/lib/actions/products";
import { StatusPill } from "@/components/admin/StatusPill";

interface Product {
  id: string;
  name: string;
  slug: string;
  status: "draft" | "published" | "archived";
  is_featured: boolean;
  is_new: boolean;
  is_active: boolean;
  product_images: { image_url: string; position: number }[];
  product_variants: { id: string; size: string; color_name: string; stock_quantity: number; price: number }[];
  categories: { name: string } | null;
  collections: { name: string } | null;
}

export default function ProductsTable({ products }: { products: Product[] }) {
  return (
    <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "Inter, sans-serif", fontSize: 13 }}>
      <thead>
        <tr style={{ textAlign: "left", borderBottom: "1px solid #E8D8D1" }}>
          {["", "Name", "Category", "Status", "Stock", "Flags", ""].map((h) => (
            <th key={h} style={{ padding: "8px 10px", fontWeight: 500, color: "#765C4D", fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {products.map((p) => (
          <Row key={p.id} product={p} />
        ))}
      </tbody>
    </table>
  );
}

function Row({ product: p }: { product: Product }) {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState(p.status);
  const [featured, setFeatured] = useState(p.is_featured);
  const [isNew, setIsNew] = useState(p.is_new);

  const totalStock = p.product_variants.reduce((sum, v) => sum + v.stock_quantity, 0);
  const outVariants = p.product_variants.filter((v) => v.stock_quantity <= 0);
  const soldOut = totalStock === 0;
  const outTooltip = outVariants.map((v) => `${v.color_name} / ${v.size}`).join(", ");
  const cover = [...p.product_images].sort((a, b) => a.position - b.position)[0]?.image_url;

  function cyclePublish() {
    const next = status === "published" ? "draft" : "published";
    startTransition(async () => {
      await setProductStatus(p.id, next);
      setStatus(next);
    });
  }

  function toggleFeatured() {
    const next = !featured;
    startTransition(async () => {
      await toggleProductFlag(p.id, "is_featured", next);
      setFeatured(next);
    });
  }

  function toggleNew() {
    const next = !isNew;
    startTransition(async () => {
      await toggleProductFlag(p.id, "is_new", next);
      setIsNew(next);
    });
  }

  return (
    <tr style={{ borderBottom: "1px solid #E8D8D133", opacity: isPending ? 0.6 : 1 }}>
      <td style={{ padding: "8px 10px", width: 48 }}>
        {cover ? (
          <img src={cover} alt="" style={{ width: 40, height: 50, objectFit: "cover" }} />
        ) : (
          <div style={{ width: 40, height: 50, background: "#E8D8D1" }} />
        )}
      </td>
      <td style={{ padding: "8px 10px", color: "#171515" }}>
        <Link href={`/admin/products/${p.id}`} style={{ color: "#171515", textDecoration: "none", fontWeight: 500 }}>
          {p.name}
        </Link>
      </td>
      <td style={{ padding: "8px 10px", color: "#3A2926" }}>{p.categories?.name ?? "-"}</td>
      <td style={{ padding: "8px 10px" }}>
        <button onClick={cyclePublish} disabled={isPending} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
          <StatusPill value={status} />
        </button>
      </td>
      <td style={{ padding: "8px 10px", whiteSpace: "nowrap" }}>
        <span style={{ color: soldOut ? "#A32D2D" : totalStock <= 5 ? "#C9A878" : "#171515", fontWeight: totalStock === 0 ? 600 : 400 }}>
          {totalStock}
        </span>
        {soldOut ? (
          <span
            style={{
              marginLeft: 8, background: "#A32D2D", color: "#F7F3EC", fontSize: 10,
              letterSpacing: "0.08em", textTransform: "uppercase", padding: "2px 8px",
            }}
          >
            Sold Out
          </span>
        ) : outVariants.length > 0 ? (
          <span
            title={`Out of stock: ${outTooltip}`}
            style={{ marginLeft: 8, color: "#A32D2D", fontSize: 11 }}
          >
            {outVariants.length} variant{outVariants.length > 1 ? "s" : ""} out
          </span>
        ) : null}
      </td>
      <td style={{ padding: "8px 10px" }}>
        <label style={{ marginRight: 10 }}>
          <input type="checkbox" checked={featured} onChange={toggleFeatured} disabled={isPending} /> Featured
        </label>
        <label>
          <input type="checkbox" checked={isNew} onChange={toggleNew} disabled={isPending} /> New
        </label>
      </td>
      <td style={{ padding: "8px 10px" }}>
        <Link href={`/admin/products/${p.id}`} style={{ color: "#765C4D", fontSize: 12, textDecoration: "none" }}>Edit →</Link>
      </td>
    </tr>
  );
}
