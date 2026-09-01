"use client";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signInCustomer } from "@/lib/auth/signIn";
import { signUpCustomer } from "@/lib/auth/signUp";
import { signInWithGoogle } from "@/lib/auth/googleAuth";

type Mode = "signin" | "signup";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmEmailSent, setConfirmEmailSent] = useState(false);

  // Google redirects back here with ?error=google when the user cancels
  // at the consent screen or the OAuth round trip fails. Read from the
  // URL in an effect (not useSearchParams) so the page can stay static.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("error") === "google") {
      setError(
        "Google sign-in was cancelled or failed. Please try again."
      );
      window.history.replaceState(null, "", "/login");
    }
  }, []);

  function switchMode(next: Mode) {
    setMode(next);
    setError(null);
    setConfirmEmailSent(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === "signin") {
        await signInCustomer({ email, password });

const supabase = createClient();

const {
  data: { user },
} = await supabase.auth.getUser();

if (!user) {
  throw new Error("Unable to get logged-in user.");
}

const { data: profile, error: profileError } = await supabase
  .from("profiles")
  .select("role")
  .eq("id", user.id)
  .single();

if (profileError) {
  throw profileError;
}

if (profile.role === "admin") {
  router.push("/admin");
} else {
  router.push("/customer");
}

router.refresh();
      } else {
        const data = await signUpCustomer({
          email,
          password,
          fullName,
        });

        if (!data.session) {
          setConfirmEmailSent(true);
        } else {
           router.push("/admin");
          router.refresh();
        }
      }
    } catch (err: any) {
      setError(
        err?.message ?? "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle(e: React.MouseEvent) {
    e.preventDefault();
    setError(null);
    setGoogleLoading(true);

    try {
      await signInWithGoogle();
      // The browser navigates away to Google's consent screen; nothing
      // to reset unless signInWithGoogle threw before the redirect.
    } catch (err: any) {
      setGoogleLoading(false);
      setError(
        err?.message ??
          "Could not start Google sign-in. Please try again."
      );
    }
  }

  return (
    <div
      style={{
        background: "#F7F3EC",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "140px 24px 80px",
      }}
    >
      <style>{`
        .google-btn { transition: border-color 0.3s ease, opacity 0.3s ease; }
        .google-btn:hover:not(:disabled) { border-color: #765C4D; }
        .google-btn:disabled { cursor: default; }
      `}</style>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div
          style={{
            textAlign: "center",
            marginBottom: 36,
          }}
        >
          <p
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: 12,
              letterSpacing: "0.3em",
              color: "#765C4D",
              marginBottom: 14,
            }}
          >
            {mode === "signin" ? "WELCOME BACK" : "JOIN VELMORA"}
          </p>

          <h1
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(32px,5vw,44px)",
              color: "#171515",
              margin: 0,
            }}
          >
            {mode === "signin" ? "Sign In" : "Create Account"}
          </h1>
        </div>

        {confirmEmailSent ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <p
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: 14,
                lineHeight: 1.8,
                color: "#3A2926",
              }}
            >
              Check <strong>{email}</strong> for a confirmation link to
              finish creating your account.
            </p>

            <button
              onClick={() => switchMode("signin")}
              style={{
                ...secondaryBtn,
                marginTop: 20,
              }}
            >
              Back to Sign In
            </button>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit}>
              {mode === "signup" && (
                <Field label="Full name">
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    style={input}
                  />
                </Field>
              )}

              <Field label="Email">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={input}
                />
              </Field>

              <Field label="Password">
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={input}
                />
              </Field>

              {error && (
                <p
                  role="alert"
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: 13,
                    color: "#A32D2D",
                    marginBottom: 16,
                  }}
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  ...primaryBtn,
                  opacity: loading ? 0.6 : 1,
                }}
              >
                {loading
                  ? "Please wait…"
                  : mode === "signin"
                  ? "Sign In"
                  : "Create Account"}
              </button>
            </form>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                margin: "24px 0",
              }}
              aria-hidden="true"
            >
              <span style={{ flex: 1, height: 1, background: "#765C4D33" }} />
              <span
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: 10,
                  letterSpacing: "0.3em",
                  marginRight: "-0.3em",
                  color: "#765C4D",
                }}
              >
                OR
              </span>
              <span style={{ flex: 1, height: 1, background: "#765C4D33" }} />
            </div>

            <button
              type="button"
              onClick={handleGoogle}
              disabled={googleLoading}
              className="google-btn"
              style={{
                ...googleBtn,
                opacity: googleLoading ? 0.6 : 1,
              }}
            >
              {googleLoading ? (
                "Redirecting…"
              ) : (
                <>
                  <GoogleIcon />
                  Continue with Google
                </>
              )}
            </button>
          </>
        )}

        {!confirmEmailSent && (
          <p
            style={{
              textAlign: "center",
              fontFamily: "Inter, sans-serif",
              fontSize: 13,
              color: "#3A2926",
              marginTop: 24,
            }}
          >
            {mode === "signin" ? (
              <>
                New to VELMORA?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("signup")}
                  style={linkBtn}
                >
                  Create an account
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("signin")}
                  style={linkBtn}
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        )}

        <p
          style={{
            textAlign: "center",
            marginTop: 30,
          }}
        >
          <Link
            href="/"
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: 12,
              color: "#765C4D",
              textDecoration: "none",
            }}
          >
            ← Back to VELMORA
          </Link>
        </p>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label
      style={{
        display: "block",
        marginBottom: 18,
        fontFamily: "Inter, sans-serif",
        fontSize: 11,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: "#765C4D",
      }}
    >
      {label}
      <div style={{ marginTop: 6 }}>{children}</div>
    </label>
  );
}

const input: React.CSSProperties = {
  display: "block",
  width: "100%",
  padding: "12px 14px",
  fontFamily: "Inter, sans-serif",
  fontSize: 14,
  color: "#171515",
  background: "#fff",
  border: "1px solid #765C4D66",
  outline: "none",
};

const primaryBtn: React.CSSProperties = {
  width: "100%",
  background: "#171515",
  color: "#F7F3EC",
  border: "none",
  padding: "15px 0",
  fontFamily: "Inter, sans-serif",
  fontSize: 12,
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  cursor: "pointer",
};

const secondaryBtn: React.CSSProperties = {
  background: "transparent",
  color: "#171515",
  border: "1px solid #171515",
  padding: "12px 26px",
  fontFamily: "Inter, sans-serif",
  fontSize: 12,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  cursor: "pointer",
};

const linkBtn: React.CSSProperties = {
  background: "none",
  border: "none",
  padding: 0,
  cursor: "pointer",
  fontFamily: "Inter, sans-serif",
  fontSize: 13,
  color: "#171515",
  textDecoration: "underline",
};

const googleBtn: React.CSSProperties = {
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 12,
  background: "#fff",
  color: "#171515",
  border: "1px solid #765C4D66",
  padding: "14px 0",
  fontFamily: "Inter, sans-serif",
  fontSize: 12,
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  cursor: "pointer",
};

// Official Google "G" mark (brand guidelines: the four-color G, on white).
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.32A9 9 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.97 10.72a5.41 5.41 0 0 1 0-3.44V4.96H.96a9 9 0 0 0 0 8.08l3.01-2.32z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.9 11.42 0 9 0A9 9 0 0 0 .96 4.96l3.01 2.32C4.68 5.16 6.66 3.58 9 3.58z"
      />
    </svg>
  );
}