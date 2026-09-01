import Link from "next/link";
import { getDashboardStats } from "@/lib/supabase/adminQueries";
import StatCard from "@/components/admin/StatCard";
import { StatusPill } from "@/components/admin/StatusPill";

const formatPKR = (n: number) => `Rs. ${n.toLocaleString("en-PK")}`;

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div>
      <h1 style={heading}>Dashboard</h1>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 40 }}>
        <StatCard label="Total Products" value={String(stats.productCount)} />
        <StatCard label="Total Orders" value={String(stats.orderCount)} />
        <StatCard label="Total Customers" value={String(stats.customerCount)} />
        <StatCard label="Revenue (Paid)" value={formatPKR(stats.revenue)} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 24 }}>
        <section>
          <h2 style={subheading}>Recent Orders</h2>
          {stats.recentOrders.length === 0 ? (
            <p style={muted}>No orders yet.</p>
          ) : (
            <table style={table}>
              <thead>
                <tr>
                  <Th>Customer</Th>
                  <Th>Status</Th>
                  <Th>Payment</Th>
                  <Th>Total</Th>
                  <Th>Date</Th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((o: any) => (
                  <tr key={o.id}>
                    <Td>{o.shipping_name}</Td>
                    <Td><StatusPill value={o.status} /></Td>
                    <Td><StatusPill value={o.payment_status} /></Td>
                    <Td>{formatPKR(o.total_amount)}</Td>
                    <Td>{new Date(o.created_at).toLocaleDateString()}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <Link href="/admin/orders" style={link}>View all orders →</Link>
        </section>

        <section>
          <h2 style={subheading}>Low Stock</h2>
          {stats.lowStockVariants.length === 0 ? (
            <p style={muted}>Nothing is running low.</p>
          ) : (
            <table style={table}>
              <thead>
                <tr>
                  <Th>Product</Th>
                  <Th>Variant</Th>
                  <Th>Stock</Th>
                </tr>
              </thead>
              <tbody>
                {stats.lowStockVariants.map((v: any) => (
                  <tr key={v.id}>
                    <Td>
                      <Link href={`/admin/products/${v.products?.id ?? ""}`} style={{ color: "#171515" }}>
                        {v.products?.name}
                      </Link>
                    </Td>
                    <Td>{v.color_name} / {v.size}</Td>
                    <Td style={{ color: v.stock_quantity === 0 ? "#A32D2D" : "#171515" }}>
                      {v.stock_quantity}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th style={{ textAlign: "left", fontFamily: "Inter, sans-serif", fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "#765C4D", padding: "8px 10px", borderBottom: "1px solid #E8D8D1" }}>
      {children}
    </th>
  );
}

function Td({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <td style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: "#171515", padding: "10px", borderBottom: "1px solid #E8D8D133", ...style }}>
      {children}
    </td>
  );
}

const heading: React.CSSProperties = { fontFamily: "'Cormorant Garamond', serif", fontSize: 32, color: "#171515", margin: "0 0 28px" };
const subheading: React.CSSProperties = { fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: "#171515", margin: "0 0 14px" };
const muted: React.CSSProperties = { fontFamily: "Inter, sans-serif", fontSize: 13, color: "#3A2926" };
const table: React.CSSProperties = { width: "100%", borderCollapse: "collapse" };
const link: React.CSSProperties = { display: "inline-block", marginTop: 14, fontFamily: "Inter, sans-serif", fontSize: 12, color: "#765C4D", textDecoration: "none" };
