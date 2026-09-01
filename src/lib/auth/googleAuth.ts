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

  // Preflight: if the Google provider isn't enabled on the Supabase
  // project, the OAuth redirect would land on a raw JSON error page at
  // supabase.co ("Unsupported provider"). The auth settings endpoint is
  // public (anon key only), so check it first and surface a readable
  // message instead.
  try {
    const settingsRes = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/settings`,
      { headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! } }
    );

    if (settingsRes.ok) {
      const settings = await settingsRes.json();
      if (!settings.external?.google?.enabled) {
        throw new Error(
          "Google sign-in is not available yet. Please sign in with your email and password."
        );
      }
    }
    // If the settings request itself failed, continue - signInWithOAuth
    // will surface any real problem through its own error path.
  } catch (err: any) {
    if (err?.message?.includes("not available yet")) throw err;
  }

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) throw error;
}
