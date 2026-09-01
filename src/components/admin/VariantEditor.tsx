"use client";

import { useState } from "react";
import { createVariant, updateVariant, deleteVariant, type VariantInput } from "@/lib/actions/variants";

export interface AdminVariant {
  id: string;
  size: string;
  color_name: string;
  color_hex: string;
  price: number;
  compare_at_price: number | null;
  stock_quantity: number;
  sku: string;
}

const EMPTY: VariantInput = {
  size: "M",
  color_name: "",
  color_hex: "#765C4D",
  price: 0,
  compare_at_price: null,
  stock_quantity: 0,
  sku: "",
};

export default function VariantEditor({ productId, variants }: { productId: string; variants: AdminVariant[] }) {
  const [draft, setDraft] = useState<VariantInput>(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function startEdit(v: AdminVariant) {
    setEditingId(v.id);
    setDraft({
      size: v.size, color_name: v.color_name, color_hex: v.color_hex,
      price: v.price, compare_at_price: v.compare_at_price,
      stock_quantity: v.stock_quantity, sku: v.sku,
    });
  }

  function resetDraft() {
    setEditingId(null);
    setDraft(EMPTY);
  }

  async function handleSave() {
    setError(null);
    if (!draft.color_name || !draft.sku) {
      setError("Color name and SKU are required.");
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await updateVariant(editingId, productId, draft);
      } else {
        await createVariant(productId, draft);
      }
      resetDraft();
    } catch (e: any) {
      setError(e?.message ?? "Could not save variant.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this variant? This cannot be undone.")) return;
    try {
      await deleteVariant(id, productId);
    } catch (e: any) {
      setError(e?.message ?? "Could not delete variant.");
    }
  }

  return (
    <div>
      <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "Inter, sans-serif", fontSize: 13 }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "1px solid #C9A87866" }}>
            {["Size", "Color", "Price", "Compare At", "Stock", "SKU", ""].map((h) => (
              <th key={h} style={{ padding: "8px 6px", fontWeight: 500, color: "#765C4D" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {variants.map((v) => (
            <tr key={v.id} style={{ borderBottom: "1px solid #C9A87833" }}>
              <td style={cell}>{v.size}</td>
              <td style={cell}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 12, height: 12, borderRadius: "50%", background: v.color_hex, display: "inline-block" }} />
                  {v.color_name}
                </span>
              </td>
              <td style={cell}>Rs. {v.price.toLocaleString("en-PK")}</td>
              <td style={cell}>{v.compare_at_price ? `Rs. ${v.compare_at_price.toLocaleString("en-PK")}` : "-"}</td>
              <td style={{ ...cell, whiteSpace: "nowrap" }}>
                <span style={{ color: v.stock_quantity === 0 ? "#A32D2D" : v.stock_quantity <= 5 ? "#B8860B" : "#171515", fontWeight: v.stock_quantity === 0 ? 600 : 400 }}>
                  {v.stock_quantity}
                </span>
                {v.stock_quantity === 0 && (
                  <span
                    style={{
                      marginLeft: 6, background: "#A32D2D", color: "#F7F3EC", fontSize: 9,
                      letterSpacing: "0.08em", textTransform: "uppercase", padding: "2px 6px",
                    }}
                  >
                    Out
                  </span>
                )}
              </td>
              <td style={cell}>{v.sku}</td>
              <td style={cell}>
                <button type="button" onClick={() => startEdit(v)} style={linkBtn}>Edit</button>{" "}
                <button type="button" onClick={() => handleDelete(v.id)} style={{ ...linkBtn, color: "#A32D2D" }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: 20, padding: 16, background: "#F7F3EC", border: "1px solid #C9A87866" }}>
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", color: "#765C4D", marginBottom: 12 }}>
          {editingId ? "Edit Variant" : "Add Variant"}
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 10 }}>
          <label style={fieldLabel}>
            Size
            <select value={draft.size} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setDraft({ ...draft, size: e.target.value })} style={fieldInput}>
              {["XS", "S", "M", "L", "XL"].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
          <label style={fieldLabel}>
            Color name
            <input value={draft.color_name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDraft({ ...draft, color_name: e.target.value })} style={fieldInput} />
          </label>
          <label style={fieldLabel}>
            Color hex
            <input type="color" value={draft.color_hex} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDraft({ ...draft, color_hex: e.target.value })} style={{ ...fieldInput, padding: 2, height: 34 }} />
          </label>
          <label style={fieldLabel}>
            Price (PKR)
            <input type="number" min={0} value={draft.price} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDraft({ ...draft, price: Number(e.target.value) })} style={fieldInput} />
          </label>
          <label style={fieldLabel}>
            Stock
            <input type="number" min={0} value={draft.stock_quantity} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDraft({ ...draft, stock_quantity: Number(e.target.value) })} style={fieldInput} />
          </label>
          <label style={fieldLabel}>
            SKU
            <input value={draft.sku} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDraft({ ...draft, sku: e.target.value })} style={fieldInput} />
          </label>
        </div>

        {error && <p role="alert" style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: "#A32D2D", marginTop: 10 }}>{error}</p>}

        <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
          <button type="button" onClick={handleSave} disabled={saving} style={primaryBtn}>
            {saving ? "Saving…" : editingId ? "Save Changes" : "Add Variant"}
          </button>
          {editingId && <button type="button" onClick={resetDraft} style={secondaryBtn}>Cancel</button>}
        </div>
      </div>
    </div>
  );
}

const cell: React.CSSProperties = { padding: "8px 6px", color: "#171515" };
const linkBtn: React.CSSProperties = { background: "none", border: "none", cursor: "pointer", fontFamily: "Inter, sans-serif", fontSize: 12, color: "#765C4D", padding: 0 };
const fieldLabel: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 4, fontFamily: "Inter, sans-serif", fontSize: 11, color: "#3A2926" };
const fieldInput: React.CSSProperties = { fontFamily: "Inter, sans-serif", fontSize: 13, padding: "7px 8px", border: "1px solid #765C4D66" };
const primaryBtn: React.CSSProperties = { background: "#171515", color: "#F7F3EC", border: "none", padding: "10px 22px", fontFamily: "Inter, sans-serif", fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer" };
const secondaryBtn: React.CSSProperties = { background: "none", color: "#171515", border: "1px solid #171515", padding: "10px 22px", fontFamily: "Inter, sans-serif", fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer" };
