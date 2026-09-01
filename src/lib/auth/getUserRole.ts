import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/supabase/database.types";

/**
 * Resolves the signed-in user's role directly from `profiles`,
 * server-side, on every call. Never trust a role passed in from
 * the client (a query param, a cookie you set yourself, form
 * data, etc.) — this is the one source of truth, and it's itself
 * protected by RLS (a user can only ever read their own profile
 * row unless they're already an admin).
 */
export async function getCurrentUserRole(): Promise<UserRole | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  return profile?.role ?? null;
}

export async function requireAdmin() {
  const role = await getCurrentUserRole();
  return role === "admin";
}
