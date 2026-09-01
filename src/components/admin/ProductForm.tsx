"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { createProduct, updateProduct, setProductStatus, toggleProductFlag, deleteProduct, type ProductInput } from "@/lib/actions/products";
import { addProductImage } from "@/lib/actions/productImages";

export interface CategoryOption { id: string; name: string; }
export interface CollectionOption { id: string; name: string; }

interface Props {
  mode: "create" | "edit";
  productId?: string;
  initial?: Partial<ProductInput> & { slug?: string };
  categories: CategoryOption[];
  collections: CollectionOption[];
}

const EMPTY: ProductInput = {
  name: "", description: "", category_id: null, collection_id: null,
  status: "draft", is_featured: false, is_new: false, is_active: true,
};

export default function ProductForm({ mode, productId, initial, categories, collections }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<ProductInput>({ ...EMPTY, ...initial });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Create mode only: images picked before the product exists are
  // staged client-side and uploaded to storage right after create.
  const [stagedFiles, setStagedFiles] = useState<File[]>([]);
  const [stagedPreviews, setStagedPreviews] = useState<{ name: string; url: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function addStaged(files: FileList | null) {
    if (!files || files.length === 0) return;
    const next = Array.from(files).filter((f) => f.type.startsWith("image/"));
    setStagedFiles((prev) => [...prev, ...next]);
    setStagedPreviews((prev) => [
      ...prev,
      ...next.map((f) => ({ name: f.name, url: URL.createObjectURL(f) })),
    ]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeStaged(index: number) {
    URL.revokeObjectURL(stagedPreviews[index].url);
    setStagedFiles((prev) => prev.filter((_, i) => i !== index));
    setStagedPreviews((prev) => prev.filter((_, i) => i !== index));
  }

  async function uploadStaged(productId: string) {
    const supabase = createClient();
    let position = 0;
    for (const file of stagedFiles) {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `products/${productId}/${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(path, file, { upsert: false });
      if (uploadError) throw uploadError;
      const { data: publicUrlData } = supabase.storage.from("product-images").getPublicUrl(path);
      await addProductImage(productId, publicUrlData.publicUrl, file.name, position);
      position += 1;
    }
    setStagedFiles([]);
    setStagedPreviews([]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setError("Product name is required."); return; }
    setSaving(true);
    setError(null);
    try {
      if (mode === "create") {
        const id = await createProduct(form);
        if (stagedFiles.length > 0) {
          await uploadStaged(id);
        }
        router.push(`/admin/products/${id}`);
      } else if (productId) {
        await updateProduct(productId, form);
        router.refresh();
      }
    } catch (e: any) {
      setError(e?.message ?? "Could not save product.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!productId) return;
    if (!confirm("Delete this product permanently? Consider archiving instead if it has order history.")) return;
    try {
      await deleteProduct(productId);
      router.push("/admin/products");
    } catch (e: any) {
      setError(e?.message ?? "Could not delete product.");
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 640 }}>
      <Field label="Product Name" required>
        <input
          value={form.name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, name: e.target.value })}
          style={inputStyle}
        />
      </Field>

      <Field label="Description">
        <textarea
          value={form.description}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm({ ...form, description: e.target.value })}
          rows={4}
          style={{ ...inputStyle, resize: "vertical" }}
        />
      </Field>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Field label="Category">
          <select
            value={form.category_id ?? ""}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setForm({ ...form, category_id: e.target.value || null })}
            style={inputStyle}
          >
            <option value="">None</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </Field>
        <Field label="Collection">
          <select
            value={form.collection_id ?? ""}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setForm({ ...form, collection_id: e.target.value || null })}
            style={inputStyle}
          >
            <option value="">None</option>
            {collections.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </Field>
      </div>

      <Field label="Status">
        <select
          value={form.status}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setForm({ ...form, status: e.target.value as ProductInput["status"] })}
          style={inputStyle}
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
      </Field>

      <div style={{ display: "flex", gap: 24, margin: "16px 0" }}>
        <Checkbox label="Featured" checked={form.is_featured} onChange={(v) => setForm({ ...form, is_featured: v })} />
        <Checkbox label="New Arrival" checked={form.is_new} onChange={(v) => setForm({ ...form, is_new: v })} />
        <Checkbox label="Active (visible when published)" checked={form.is_active} onChange={(v) => setForm({ ...form, is_active: v })} />
      </div>

      {mode === "create" && (
        <Field label="Product Images">
          <div
            onClick={() => fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e: React.KeyboardEvent) => { if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click(); }}
            style={{
              border: "1px dashed #765C4D", background: "#fff", padding: "26px 16px",
              textAlign: "center", cursor: "pointer", fontFamily: "Inter, sans-serif",
              fontSize: 13, color: "#765C4D",
            }}
          >
            <div style={{ fontSize: 22, marginBottom: 6 }}>🖼</div>
            Choose files or click to pick images
            <div style={{ fontSize: 11, color: "#3A2926", opacity: 0.7, marginTop: 4 }}>
              JPG, PNG, WebP or AVIF - you can select several
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => addStaged(e.target.files)}
            style={{ display: "none" }}
          />
          {stagedPreviews.length > 0 && (
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
              {stagedPreviews.map((p, i) => (
                <div key={p.url} style={{ position: "relative", width: 92 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.url}
                    alt={p.name}
                    style={{ width: 92, height: 116, objectFit: "cover", border: "1px solid #C9A87866", display: "block" }}
                  />
                  <button
                    type="button"
                    onClick={(e: React.MouseEvent) => { e.stopPropagation(); removeStaged(i); }}
                    aria-label={`Remove ${p.name}`}
                    style={{
                      position: "absolute", top: 4, right: 4, width: 20, height: 20,
                      background: "#171515", color: "#F7F3EC", border: "none",
                      cursor: "pointer", fontSize: 11, lineHeight: "20px", padding: 0,
                    }}
                  >
                    ✕
                  </button>
                  {i === 0 && (
                    <span style={{ position: "absolute", bottom: 4, left: 4, background: "#171515", color: "#F7F3EC", fontSize: 9, padding: "2px 6px", fontFamily: "Inter, sans-serif" }}>
                      Primary
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: "#3A2926", opacity: 0.7, marginTop: 8 }}>
            Images are uploaded when you create the product. You can reorder or remove them afterwards on the edit page.
          </p>
        </Field>
      )}

      {error && <p role="alert" style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: "#A32D2D" }}>{error}</p>}

      <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
        <button type="submit" disabled={saving} style={primaryBtn}>
          {saving
            ? mode === "create" && stagedFiles.length > 0
              ? "Creating & uploading images…"
              : "Saving…"
            : mode === "create" ? "Create Product" : "Save Changes"}
        </button>
        {mode === "edit" && productId && (
          <>
            {form.status !== "archived" ? (
              <button
                type="button"
                onClick={async () => { await setProductStatus(productId, "archived"); router.refresh(); }}
                style={secondaryBtn}
              >
                Archive
              </button>
            ) : (
              <button
                type="button"
                onClick={async () => { await setProductStatus(productId, "draft"); router.refresh(); }}
                style={secondaryBtn}
              >
                Restore to Draft
              </button>
            )}
            <button type="button" onClick={handleDelete} style={{ ...secondaryBtn, color: "#A32D2D", borderColor: "#A32D2D" }}>
              Delete
            </button>
          </>
        )}
      </div>
    </form>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label style={{ display: "block", marginBottom: 16, fontFamily: "Inter, sans-serif", fontSize: 12, color: "#3A2926" }}>
      {label}{required ? " *" : ""}
      <div style={{ marginTop: 6 }}>{children}</div>
    </label>
  );
}

function Checkbox({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "Inter, sans-serif", fontSize: 13, color: "#171515" }}>
      <input type="checkbox" checked={checked} onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.checked)} />
      {label}
    </label>
  );
}

const inputStyle: React.CSSProperties = {
  display: "block", width: "100%", padding: "10px 12px",
  fontFamily: "Inter, sans-serif", fontSize: 14, border: "1px solid #765C4D66", background: "#fff",
};
const primaryBtn: React.CSSProperties = { background: "#171515", color: "#F7F3EC", border: "none", padding: "12px 28px", fontFamily: "Inter, sans-serif", fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer" };
const secondaryBtn: React.CSSProperties = { background: "none", color: "#171515", border: "1px solid #171515", padding: "12px 22px", fontFamily: "Inter, sans-serif", fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer" };
