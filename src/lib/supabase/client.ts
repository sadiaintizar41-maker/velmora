import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./database.types";

// Used from client components only. Reads the *public* anon key —
// safe to ship to the browser because every privileged operation is
// enforced by RLS policies and SECURITY DEFINER functions, never by
// trusting the client.
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
