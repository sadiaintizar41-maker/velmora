
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function CustomerPage() {
  const router = useRouter();
  const [userName, setUserName] = useState("Customer");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setEmail(user.email ?? "");

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, role")
        .eq("id", user.id)
        .single();

      if (profile?.role === "admin") {
        router.push("/admin");
        return;
      }

      setUserName(profile?.full_name || "Customer");
      setLoading(false);
    }

    loadUser();
  }, [router]);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#F7F3EC",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Inter, sans-serif",
          color: "#765C4D",
        }}
      >
        Loading...
      </div>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#F7F3EC",
        padding: "140px 24px 80px",
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
        }}
      >
        <div style={{ marginBottom: 50 }}>
          <p
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: 11,
              letterSpacing: "0.25em",
              color: "#765C4D",
              marginBottom: 12,
            }}
          >
            MY ACCOUNT
          </p>

          <h1
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(38px, 6vw, 60px)",
              fontWeight: 400,
              color: "#171515",
              margin: 0,
            }}
          >
            Welcome, {userName}
          </h1>

          <p
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: 14,
              color: "#765C4D",
              marginTop: 12,
            }}
          >
            {email}
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 16,
          }}
        >
          <AccountCard
            title="My Orders"
            description="View your orders and track their status."
            href="/orders"
          />

          <AccountCard
            title="Wishlist"
            description="View the pieces you've saved."
            href="/wishlist"
          />

          <AccountCard
            title="Shopping Bag"
            description="Review your selected items."
            href="/cart"
          />

          <AccountCard
            title="Profile"
            description="Manage your account information."
            href="/profile"
          />
        </div>

        <div
          style={{
            marginTop: 40,
            paddingTop: 25,
            borderTop: "1px solid #E8D8D1",
          }}
        >
          <button
            type="button"
            onClick={handleLogout}
            style={{
              background: "transparent",
              border: "1px solid #171515",
              padding: "12px 24px",
              fontFamily: "Inter, sans-serif",
              fontSize: 11,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              cursor: "pointer",
              color: "#171515",
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </main>
  );
}

function AccountCard({
  title,
  description,
  href,
}: {
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      style={{
        textDecoration: "none",
        color: "inherit",
        background: "#fff",
        border: "1px solid #E8D8D1",
        padding: "28px 24px",
        minHeight: 150,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <div>
        <h2
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 26,
            fontWeight: 400,
            margin: 0,
            color: "#171515",
          }}
        >
          {title}
        </h2>

        <p
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: 13,
            lineHeight: 1.7,
            color: "#765C4D",
            marginTop: 10,
          }}
        >
          {description}
        </p>
      </div>

      <span
        style={{
          fontFamily: "Inter, sans-serif",
          fontSize: 11,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "#171515",
          marginTop: 20,
        }}
      >
        View →
      </span>
    </Link>
  );
}

