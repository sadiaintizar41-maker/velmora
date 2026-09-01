"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// Every write below goes through the anon-key server client - the
// same one a signed-in customer would get. What makes this safe is
// entirely the products_admin_write / _update / _delete RLS
// policies from Phase 2 (0003_rls_policies.sql), which require
// public.is_admin() to return true for the calling session. If a
// non-admin session somehow reached one of these actions, Supabase
// itself would reject the write - there is no service role key or
// other bypass anywhere in this file.

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export interface ProductInput {
  name: string;
  slug?: string;
  description: string;
  category_id: string | null;
  collection_id: string | null;
  status: "draft" | "published" | "archived";
  is_featured: boolean;
  is_new: boolean;
  is_active: boolean;
}

export async function createProduct(input: ProductInput) {
  const supabase = await createClient();
  const slug = input.slug?.trim() ? slugify(input.slug) : slugify(input.name);

  const { data, error } = await supabase
    .from("products")
    .insert({ ...input, slug })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  return data.id as string;
}

export async function updateProduct(id: string, input: ProductInput) {
  const supabase = await createClient();
  const slug = input.slug?.trim() ? slugify(input.slug) : slugify(input.name);

  const { data: before } = await supabase.from("products").select("slug").eq("id", id).single();

  const { error } = await supabase.from("products").update({ ...input, slug }).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}`);
  revalidatePath("/shop");
  revalidatePath(`/product/${slug}`);
  if (before?.slug && before.slug !== slug) revalidatePath(`/product/${before.slug}`);
}

export async function setProductStatus(id: string, status: "draft" | "published" | "archived") {
  const supabase = await createClient();
  const { error } = await supabase.from("products").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/products");
  revalidatePath("/shop");
}

export async function toggleProductFlag(id: string, flag: "is_featured" | "is_new", value: boolean) {
  const supabase = await createClient();
  const { error } = await supabase.from("products").update({ [flag]: value }).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/products");
  revalidatePath("/shop");
}

// "Delete where appropriate": products can be safely hard-deleted -
// product_images/product_variants cascade, and order_items.product_id
// / .variant_id both use ON DELETE SET NULL, so past orders keep
// their captured product_name/size/color/price and simply lose the
// live reference. Even so, this is a destructive action the UI gates
// behind a confirmation and recommends archiving instead when a
// product has order history.
export async function deleteProduct(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/products");
  revalidatePath("/shop");
}
