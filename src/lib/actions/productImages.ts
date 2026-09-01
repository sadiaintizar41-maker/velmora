"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// The actual file bytes are uploaded client-side, directly to the
// product-images Storage bucket, by ImageUploader.tsx - Storage
// uploads need a File object, which doesn't cross a Server Action
// boundary cleanly. That upload is itself governed by the
// product_images_bucket_admin_insert Storage policy from Phase 2
// (0004_storage.sql), so it's just as RLS-protected as this file.
// These actions only manage the resulting product_images rows once
// a public URL exists.

export async function addProductImage(
  productId: string,
  imageUrl: string,
  altText: string,
  position: number
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("product_images")
    .insert({ product_id: productId, image_url: imageUrl, alt_text: altText, position });
  if (error) throw new Error(error.message);

  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/shop");
}

export async function deleteProductImage(imageId: string, productId: string, storagePath: string | null) {
  const supabase = await createClient();

  if (storagePath) {
    await supabase.storage.from("product-images").remove([storagePath]);
  }

  const { error } = await supabase.from("product_images").delete().eq("id", imageId);
  if (error) throw new Error(error.message);

  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/shop");
}

export async function reorderProductImages(productId: string, orderedIds: string[]) {
  const supabase = await createClient();

  // Applied sequentially rather than in one batch call, since the
  // Supabase JS client doesn't expose a single-round-trip "bulk
  // update by id list" - fine at the scale of a product's image set.
  for (let i = 0; i < orderedIds.length; i++) {
    const { error } = await supabase
      .from("product_images")
      .update({ position: i })
      .eq("id", orderedIds[i]);
    if (error) throw new Error(error.message);
  }

  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/shop");
}
