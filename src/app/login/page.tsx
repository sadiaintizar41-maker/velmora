"use client";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signInCustomer } from "@/lib/auth/signIn";
import { signUpCustomer } from "@/lib/auth/signUp";

type Mode = "signin" | "signup";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmEmailSent, setConfirmEmailSent] = useState(false);

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