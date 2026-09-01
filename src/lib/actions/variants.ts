"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface VariantInput {
  size: string;
  color_name: string;
  color_hex: string;
  price: number;
  compare_at_price: number | null;
  stock_quantity: number;
  sku: string;
}

export async function createVariant(productId: string, input: VariantInput) {
  const supabase = await createClient();
  const { error } = await supabase.from("product_variants").insert({ product_id: productId, ...input });
  if (error) throw new Error(error.message);

  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/shop");
}

export async function updateVariant(variantId: string, productId: string, input: VariantInput) {
  const supabase = await createClient();
  const { error } = await supabase.from("product_variants").update(input).eq("id", variantId);
  if (error) throw new Error(error.message);

  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/shop");
}

export async function deleteVariant(variantId: string, productId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("product_variants").delete().eq("id", variantId);
  if (error) throw new Error(error.message);

  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/shop");
}
