"use client";

import { useState } from "react";
import { createCategory, updateCategory, setCategoryActive, type CategoryInput } from "@/lib/actions/categories";

interface Category extends CategoryInput {
  id: string;
  is_active: boolean;
  slug: string;
}

const EMPTY: CategoryInput = { name: "", description: "", image_url: "" };

export default function CategoryManager({ categories }: { categories: Category[] }) {
  const [list, setList] = useState(categories);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<CategoryInput>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function startEdit(c: Category) {
    setEditingId(c.id);
    setDraft({ name: c.name, slug: c.slug, description: c.description ?? "", image_url: c.image_url ?? "" });
  }

  function resetDraft() {
    setEditingId(null);
    setDraft(EMPTY);
  }

  async function handleSave() {
    if (!draft.name.trim()) { setError("Name is required."); return; }
    setSaving(true);
    setError(null);
    try {
      if (editingId) {
        await updateCategory(editingId, draft);
        setList((prev) => prev.map((c) => (c.id === editingId ? { ...c, ...draft, slug: draft.slug || c.slug } : c)));
      } else {
        await createCategory(draft);
        window.location.reload(); // pick up the new row + server-generated slug
      }
      resetDraft();
    } catch (e: any) {
      setError(e?.message ?? "Could not save category.");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleActive(c: Category) {
    const next = !c.is_active;
    setList((prev) => prev.map((x) => (x.id === c.id ? { ...x, is_active: next } : x)));
    try {
      await setCategoryActive(c.id, next);
    } catch (e: any) {
      setError(e?.message ?? "Could not update category.");
      setList((prev) => prev.map((x) => (x.id === c.id ? { ...x, is_active: c.is_active } : x)));
    }
  }

  return (
    <div>
      <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "Inter, sans-serif", fontSize: 13, marginBottom: 30 }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "1px solid #E8D8D1" }}>
           {["image", "Name", "Slug", "Active", "actions"].map((h) => (
  <th
    key={h}
    style={{
      padding: "8px 10px",
      fontSize: 11,
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      color: "#765C4D",
    }}
  >
    {h === "image" || h === "actions" ? "" : h}
  </th>
))}
          </tr>
        </thead>
        <tbody>
          {list.map((c) => (
            <tr key={c.id} style={{ borderBottom: "1px solid #E8D8D133" }}>
              <td style={{ padding: "8px 10px", width: 48 }}>
                {c.image_url ? <img src={c.image_url} alt="" style={{ width: 40, height: 40, objectFit: "cover" }} /> : <div style={{ width: 40, height: 40, background: "#E8D8D1" }} />}
              </td>
              <td style={{ padding: "8px 10px", color: "#171515" }}>{c.name}</td>
              <td style={{ padding: "8px 10px", color: "#765C4D" }}>{c.slug}</td>
              <td style={{ padding: "8px 10px" }}>
                <label>
                  <input type="checkbox" checked={c.is_active} onChange={() => handleToggleActive(c)} /> Active
                </label>
              </td>
              <td style={{ padding: "8px 10px" }}>
                <button type="button" onClick={() => startEdit(c)} style={linkBtn}>Edit</button>
              </td>
            </tr>
          ))}
          {list.length === 0 && (
            <tr><td colSpan={5} style={{ padding: "16px 10px", color: "#3A2926" }}>No categories yet.</td></tr>
          )}
        </tbody>
      </table>

      <div style={{ padding: 16, background: "#fff", border: "1px solid #E8D8D1", maxWidth: 520 }}>
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", color: "#765C4D", marginBottom: 12 }}>
          {editingId ? "Edit Category" : "New Category"}
        </p>
        <Field label="Name">
          <input value={draft.name} onChange={(e: any) => setDraft({ ...draft, name: e.target.value })} style={input} />
        </Field>
        <Field label="Slug (optional - generated from name if left blank)">
          <input value={draft.slug ?? ""} onChange={(e: any) => setDraft({ ...draft, slug: e.target.value })} style={input} />
        </Field>
        <Field label="Description">
          <textarea value={draft.description} onChange={(e: any) => setDraft({ ...draft, description: e.target.value })} rows={3} style={{ ...input, resize: "vertical" }} />
        </Field>
        <Field label="Image URL">
          <input value={draft.image_url} onChange={(e: any) => setDraft({ ...draft, image_url: e.target.value })} style={input} />
        </Field>

        {error && <p role="alert" style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: "#A32D2D" }}>{error}</p>}

        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
          <button type="button" onClick={handleSave} disabled={saving} style={primaryBtn}>
            {saving ? "Saving…" : editingId ? "Save Changes" : "Create Category"}
          </button>
          {editingId && <button type="button" onClick={resetDraft} style={secondaryBtn}>Cancel</button>}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "block", marginBottom: 12, fontFamily: "Inter, sans-serif", fontSize: 11, color: "#3A2926" }}>
      {label}
      <div style={{ marginTop: 4 }}>{children}</div>
    </label>
  );
}

const input: React.CSSProperties = { display: "block", width: "100%", padding: "8px 10px", fontFamily: "Inter, sans-serif", fontSize: 13, border: "1px solid #765C4D66" };
const linkBtn: React.CSSProperties = { background: "none", border: "none", cursor: "pointer", fontFamily: "Inter, sans-serif", fontSize: 12, color: "#765C4D", padding: 0 };
const primaryBtn: React.CSSProperties = { background: "#171515", color: "#F7F3EC", border: "none", padding: "10px 22px", fontFamily: "Inter, sans-serif", fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer" };
const secondaryBtn: React.CSSProperties = { background: "none", color: "#171515", border: "1px solid #171515", padding: "10px 22px", fontFamily: "Inter, sans-serif", fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer" };
