import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/getUserRole";
import AdminSidebar from "@/components/admin/AdminSidebar";

// Deliberately duplicates the check already done in middleware.ts.
// Two independent checks mean a bug or misconfiguration in one
// (a matcher typo, a caching edge case) doesn't silently open the
// dashboard - this layout wraps every /admin/* page and will
// still redirect even if middleware never ran.
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAdmin = await requireAdmin();

  if (!isAdmin) {
    redirect("/");
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F7F3EC" }}>
      {/* Shared hover states for every admin page rendered inside
          <main>. Inline styles on buttons/links/selects beat plain
          class rules, so color-changing hovers use !important. */}
      <style>{`
        .admin-main button:not(:disabled) {
          transition: opacity 0.2s ease, transform 0.2s ease;
        }
        .admin-main button:not(:disabled):hover {
          opacity: 0.82;
          transform: translateY(-1px);
        }
        .admin-main tbody tr {
          transition: background 0.15s ease;
        }
        .admin-main tbody tr:hover {
          background: #E8D8D133;
        }
        .admin-main a {
          transition: color 0.2s ease;
        }
        .admin-main a:hover {
          color: #765C4D !important;
          text-decoration: underline !important;
        }
        .admin-main select:not(:disabled),
        .admin-main input:not(:disabled):not([type="checkbox"]):not([type="color"]),
        .admin-main textarea:not(:disabled) {
          transition: border-color 0.2s ease;
        }
        .admin-main select:not(:disabled):hover,
        .admin-main input:not(:disabled):not([type="checkbox"]):not([type="color"]):hover,
        .admin-main textarea:not(:disabled):hover {
          border-color: #765C4D !important;
        }
        .admin-stat-card {
          transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
        }
        .admin-stat-card:hover {
          transform: translateY(-3px);
          border-color: #C9A878 !important;
          box-shadow: 0 6px 18px rgba(23, 21, 21, 0.08);
        }
        @media (prefers-reduced-motion: reduce) {
          .admin-main button:not(:disabled),
          .admin-main tbody tr,
          .admin-main a,
          .admin-stat-card {
            transition: none;
          }
          .admin-main button:not(:disabled):hover,
          .admin-stat-card:hover {
            transform: none;
          }
        }
      `}</style>
      <AdminSidebar />
      <main className="admin-main" style={{ flex: 1, padding: "32px 40px" }}>{children}</main>
    </div>
  );
}
