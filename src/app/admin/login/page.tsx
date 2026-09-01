"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// There is no corresponding "sign up" link or form on this page,
// and no /admin/signup route exists anywhere in the app. Admin
// accounts are created only via public.promote_to_admin(), run
// directly against the database by a trusted operator - see
// supabase/migrations/0002_functions_triggers.sql.
export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError || !data.user) {
      setError("Incorrect email or password.");
      setLoading(false);
      return;
    }

    // Confirm admin role before redirecting - a customer with a
    // valid password should never land in the dashboard, they
    // should see the same "incorrect" message a wrong password
    // would give, so this form doesn't leak who has admin access.
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    if (profile?.role !== "admin") {
      await supabase.auth.signOut();
      setError("Incorrect email or password.");
      setLoading(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#171515",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <style>{`
        .admin-login-input {
          transition: border-color 0.2s ease, background 0.2s ease;
        }
        .admin-login-input:hover {
          border-color: #C9A878 !important;
          background: rgba(201, 168, 120, 0.06) !important;
        }
        .admin-login-btn {
          transition: background 0.25s ease, color 0.25s ease, transform 0.2s ease;
        }
        .admin-login-btn:hover:not(:disabled) {
          background: #C9A878 !important;
          color: #171515 !important;
          transform: translateY(-1px);
        }
        .admin-login-back {
          transition: opacity 0.2s ease;
        }
        .admin-login-back:hover {
          opacity: 1 !important;
          text-decoration: underline !important;
        }
        @media (prefers-reduced-motion: reduce) {
          .admin-login-btn:hover:not(:disabled) {
            transform: none;
          }
          .admin-login-input,
          .admin-login-btn,
          .admin-login-back {
            transition: none;
          }
        }
      `}</style>
      <form
        onSubmit={handleSubmit}
        style={{ width: "100%", maxWidth: 360, display: "flex", flexDirection: "column", gap: 18 }}
      >
        <div style={{ textAlign: "center", marginBottom: 12 }}>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 30, color: "#F7F3EC", letterSpacing: "0.14em" }}>
            VELMORA
          </div>
          <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: "#C9A878", letterSpacing: "0.24em", marginTop: 6 }}>
            ADMIN ACCESS
          </div>
        </div>

        <label style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: "#E8D8D1" }}>
          Email
          <input
            type="email"
            required
            className="admin-login-input"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            style={inputStyle}
          />
        </label>

        <label style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: "#E8D8D1" }}>
          Password
          <input
            type="password"
            required
            className="admin-login-input"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            style={inputStyle}
          />
        </label>

        {error && (
          <p role="alert" style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: "#E8A0A0", margin: 0 }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="admin-login-btn"
          style={{
            marginTop: 8,
            background: "transparent",
            border: "1px solid #C9A878",
            color: "#F7F3EC",
            fontFamily: "Inter, sans-serif",
            fontSize: 12,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            padding: "14px 0",
            cursor: loading ? "default" : "pointer",
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? "Signing in…" : "Sign In"}
        </button>

        <a
          href="/"
          className="admin-login-back"
          style={{
            textAlign: "center",
            fontFamily: "Inter, sans-serif",
            fontSize: 12,
            color: "#E8D8D1",
            opacity: 0.7,
            textDecoration: "none",
            marginTop: 10,
          }}
        >
          Back to VELMORA
        </a>
      </form>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  marginTop: 6,
  background: "transparent",
  border: "1px solid #765C4D",
  color: "#F7F3EC",
  fontFamily: "Inter, sans-serif",
  fontSize: 14,
  padding: "11px 12px",
  outline: "none",
};
