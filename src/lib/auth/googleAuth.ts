import { createClient } from "@/lib/supabase/client";

// Starts Google OAuth. @supabase/ssr's browser client uses the PKCE flow
// (flowType: "pkce"), so this redirects the user to Google and they return
// to /auth/callback with a ?code= param that the server route handler
// (src/app/auth/callback/route.ts) exchanges for a session.
//
// window.location.origin resolves to localhost:3000 in development and
// the deployed domain in production, so the redirect URL is correct in
// both environments without any hardcoded value here.
export async function signInWithGoogle() {
  const supabase = createClient();

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) throw error;
}
