"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/collections", label: "Collections" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/customers", label: "Customers" },
  { href: "/admin/messages", label: "Messages" },
  { href: "/admin/subscribers", label: "Subscribers" },
  { href: "/admin/settings", label: "Settings" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <aside
      style={{
        width: 240,
        borderRight: "1px solid #C9A87833",
        padding: "28px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 4,
      }}
    >
      <style>{`
        .admin-nav-link {
          position: relative;
          transition:
            background 0.25s ease,
            color 0.25s ease,
            transform 0.25s ease;
        }
        /* Inline styles on the links beat plain hover rules, so the
           hover state uses !important; active links are excluded so
           their selected background stays intact. */
        .admin-nav-link:not(.admin-active):hover {
          background: #E8D8D166 !important;
          color: #171515 !important;
          transform: translateX(3px);
        }
        .admin-nav-link.admin-active:hover {
          transform: translateX(3px);
        }
        .admin-logout-btn {
          transition:
            background 0.25s ease,
            color 0.25s ease,
            transform 0.25s ease;
        }
        .admin-logout-btn:hover {
          background: #A32D2D14 !important;
          color: #A32D2D !important;
          transform: translateX(3px);
        }
        @media (prefers-reduced-motion: reduce) {
          .admin-nav-link,
          .admin-logout-btn {
            transition: none;
          }
          .admin-nav-link:hover,
          .admin-nav-link.admin-active:hover,
          .admin-logout-btn:hover {
            transform: none;
          }
        }
      `}</style>

      <div
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 22,
          letterSpacing: "0.1em",
          color: "#171515",
          marginBottom: 28,
          padding: "0 12px",
        }}
      >
        VELMORA
        <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: "#765C4D", letterSpacing: "0.14em" }}>
          ADMIN
        </div>
      </div>

      {LINKS.map((l) => {
        const active = pathname === l.href;
        return (
          <Link
            key={l.href}
            href={l.href}
            className={active ? "admin-nav-link admin-active" : "admin-nav-link"}
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: 14,
              padding: "10px 12px",
              borderRadius: 4,
              textDecoration: "none",
              color: active ? "#171515" : "#3A2926",
              background: active ? "#E8D8D1" : "transparent",
            }}
          >
            {l.label}
          </Link>
        );
      })}

      <button
        onClick={handleLogout}
        className="admin-logout-btn"
        style={{
          marginTop: 20,
          textAlign: "left",
          background: "none",
          border: "none",
          cursor: "pointer",
          fontFamily: "Inter, sans-serif",
          fontSize: 14,
          padding: "10px 12px",
          borderRadius: 4,
          color: "#3A2926",
        }}
      >
        Logout
      </button>
    </aside>
  );
}
