import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Google (or any OAuth provider) redirects back here with a PKCE ?code=
// param. Exchanging it for a session server-side is what sets the auth
// cookies that the middleware and RLS policies rely on.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Route by role, mirroring the email/password sign-in flow.
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        return NextResponse.redirect(
          `${origin}${profile?.role === "admin" ? "/admin" : "/customer"}`
        );
      }
    }
  }

  // No code (the user cancelled at Google) or the exchange failed -
  // back to the sign-in page with a flag the page surfaces as a message.
  return NextResponse.redirect(`${origin}/login?error=google`);
}
