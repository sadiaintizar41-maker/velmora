"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

function slugify(input: string) {
  return input.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export interface CollectionInput {
  name: string;
  slug?: string;
  description: string;
  image_url: string;
  is_featured: boolean;
}

export async function createCollection(input: CollectionInput) {
  const supabase = await createClient();
  const slug = input.slug?.trim() ? slugify(input.slug) : slugify(input.name);

  const { error } = await supabase.from("collections").insert({ ...input, slug });
  if (error) throw new Error(error.message);

  revalidatePath("/admin/collections");
  revalidatePath("/collections");
}

export async function updateCollection(id: string, input: CollectionInput) {
  const supabase = await createClient();
  const slug = input.slug?.trim() ? slugify(input.slug) : slugify(input.name);

  const { data: before } = await supabase.from("collections").select("slug").eq("id", id).single();

  const { error } = await supabase.from("collections").update({ ...input, slug }).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/collections");
  revalidatePath("/collections");
  revalidatePath(`/collections/${slug}`);
  if (before?.slug && before.slug !== slug) revalidatePath(`/collections/${before.slug}`);
}

export async function setCollectionActive(id: string, isActive: boolean) {
  const supabase = await createClient();
  const { error } = await supabase.from("collections").update({ is_active: isActive }).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/collections");
  revalidatePath("/collections");
}

export async function setCollectionFeatured(id: string, isFeatured: boolean) {
  const supabase = await createClient();
  const { error } = await supabase.from("collections").update({ is_featured: isFeatured }).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/collections");
  revalidatePath("/collections");
}
