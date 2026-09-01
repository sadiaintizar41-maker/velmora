"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

function slugify(input: string) {
  return input.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export interface CategoryInput {
  name: string;
  slug?: string;
  description: string;
  image_url: string;
}

export async function createCategory(input: CategoryInput) {
  const supabase = await createClient();
  const slug = input.slug?.trim() ? slugify(input.slug) : slugify(input.name);

  const { error } = await supabase.from("categories").insert({ ...input, slug });
  if (error) throw new Error(error.message);

  revalidatePath("/admin/categories");
  revalidatePath("/shop");
}

export async function updateCategory(id: string, input: CategoryInput) {
  const supabase = await createClient();
  const slug = input.slug?.trim() ? slugify(input.slug) : slugify(input.name);

  const { error } = await supabase.from("categories").update({ ...input, slug }).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/categories");
  revalidatePath("/shop");
}

export async function setCategoryActive(id: string, isActive: boolean) {
  const supabase = await createClient();
  const { error } = await supabase.from("categories").update({ is_active: isActive }).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/categories");
  revalidatePath("/shop");
}
