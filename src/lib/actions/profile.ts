"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// Deliberately accepts only full_name and phone - there is no
// `role` parameter anywhere in this function's signature, so
// there's nothing here for even a modified client to send that
// could touch it. Role changes are blocked twice regardless (the
// profiles UPDATE RLS policy plus the guard_role_escalation
// trigger, both from Phase 2), but this action doesn't even offer
// the surface.
export async function updateOwnProfile(input: { full_name: string; phone: string }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not signed in.");

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: input.full_name, phone: input.phone })
    .eq("id", user.id);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/settings");
}
