"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { addProductImage, deleteProductImage, reorderProductImages } from "@/lib/actions/productImages";

export interface AdminImage {
  id: string;
  image_url: string;
  alt_text: string | null;
  position: number;
}

interface Props {
  productId: string;
  images: AdminImage[];
}

export default function ImageUploader({ productId, images }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);
    const supabase = createClient();

    try {
      let nextPosition = images.length;
      for (const file of Array.from(files)) {
        const ext = file.name.split(".").pop() || "jpg";
        const path = `products/${productId}/${crypto.randomUUID()}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(path, file, { upsert: false });
        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage.from("product-images").getPublicUrl(path);

        await addProductImage(productId, publicUrlData.publicUrl, file.name, nextPosition);
        nextPosition += 1;
      }
    } catch (e: any) {
      setError(e?.message ?? "Upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleRemove(image: AdminImage) {
    if (!confirm("Remove this image?")) return;
    // Best-effort derive the storage path back out of the public
    // URL so the underlying file is cleaned up too, not just the row.
    const marker = "/product-images/";
    const idx = image.image_url.indexOf(marker);
    const storagePath = idx >= 0 ? image.image_url.slice(idx + marker.length) : null;

    try {
      await deleteProductImage(image.id, productId, storagePath);
    } catch (e: any) {
      setError(e?.message ?? "Could not remove image.");
    }
  }

  async function handleMove(index: number, direction: -1 | 1) {
    const next = [...images].sort((a, b) => a.position - b.position);
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];

    try {
      await reorderProductImages(productId, next.map((i) => i.id));
    } catch (e: any) {
      setError(e?.message ?? "Could not reorder images.");
    }
  }

  const sorted = [...images].sort((a, b) => a.position - b.position);

  return (
    <div>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
        {sorted.map((img, i) => (
          <div key={img.id} style={{ position: "relative", width: 110 }}>
            <img
              src={img.image_url}
              alt={img.alt_text ?? ""}
              style={{ width: 110, height: 140, objectFit: "cover", border: "1px solid #C9A87866" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
              <button type="button" onClick={() => handleMove(i, -1)} disabled={i === 0} style={miniBtn}>←</button>
              <button type="button" onClick={() => handleRemove(img)} style={{ ...miniBtn, color: "#A32D2D" }}>✕</button>
              <button type="button" onClick={() => handleMove(i, 1)} disabled={i === sorted.length - 1} style={miniBtn}>→</button>
            </div>
            {i === 0 && (
              <span style={{ position: "absolute", top: 4, left: 4, background: "#171515", color: "#F7F3EC", fontSize: 9, padding: "2px 6px", fontFamily: "Inter, sans-serif" }}>
                Primary
              </span>
            )}
          </div>
        ))}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFiles(e.target.files)}
        disabled={uploading}
      />
      {uploading && <p style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: "#3A2926" }}>Uploading…</p>}
      {error && <p role="alert" style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: "#A32D2D" }}>{error}</p>}
    </div>
  );
}

const miniBtn: React.CSSProperties = {
  background: "none",
  border: "1px solid #765C4D66",
  cursor: "pointer",
  fontSize: 11,
  padding: "2px 6px",
};
