import { notFound } from "next/navigation";
import Link from "next/link";
import { getOrderById } from "@/lib/supabase/queries";

const formatPKR = (n: number) => `Rs. ${n.toLocaleString("en-PK")}`;

interface PageProps {
  params: Promise<{ orderId: string }>;
}

export default async function OrderConfirmationPage({ params }: PageProps) {
  const { orderId } = await params;
  const order = await getOrderById(orderId);

  // If this order doesn't belong to the signed-in session, RLS
  // simply returns no row — this looks identical to "not found,"
  // which is the correct, non-leaky behavior here.
  if (!order) notFound();

  return (
    <div style={{ background: "#F7F3EC", minHeight: "100vh", padding: "140px 32px 100px" }}>
      <div style={{ maxWidth: 640, margin: "0 auto", textAlign: "center" }}>
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 12, letterSpacing: "0.3em", color: "#765C4D", marginBottom: 16 }}>
          THANK YOU
        </p>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(34px,5vw,52px)", color: "#171515", margin: 0 }}>
          Order Confirmed
        </h1>
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: "#3A2926", marginTop: 14 }}>
          Order #{order.id.slice(0, 8).toUpperCase()}
        </p>

        <div style={{ background: "#E8D8D1", padding: 28, marginTop: 40, textAlign: "left" }}>
          {(order.order_items ?? []).map((item: any) => (
            <div key={item.id} style={{ display: "flex", justifyContent: "space-between", fontFamily: "Inter, sans-serif", fontSize: 13, marginBottom: 10 }}>
              <span>{item.product_name} ({item.color}/{item.size}) × {item.quantity}</span>
              <span>{formatPKR(item.subtotal)}</span>
            </div>
          ))}
          <div style={{ borderTop: "1px solid #17151533", margin: "14px 0" }} />
          <Row label="Subtotal" value={formatPKR(order.subtotal)} />
          <Row label="Shipping" value={order.shipping_amount === 0 ? "Free" : formatPKR(order.shipping_amount)} />
          <Row label="Total" value={formatPKR(order.total_amount)} bold />
          <div style={{ borderTop: "1px solid #17151533", margin: "14px 0" }} />
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, margin: 0 }}>
            {order.shipping_name}<br />
            {order.shipping_address}, {order.city}{order.postal_code ? ` ${order.postal_code}` : ""}
          </p>
        </div>

        <Link
          href="/shop"
          style={{
            display: "inline-block", marginTop: 36, border: "1px solid #171515",
            color: "#171515", fontFamily: "Inter, sans-serif", fontSize: 12,
            letterSpacing: "0.16em", textTransform: "uppercase", padding: "14px 34px",
            textDecoration: "none",
          }}
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}

function Row({ label, value, bold = false }: { label: string; value: string; bold?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
      <span style={{ fontFamily: "Inter, sans-serif", fontSize: bold ? 15 : 13, fontWeight: bold ? 600 : 400 }}>{label}</span>
      <span style={{ fontFamily: "Inter, sans-serif", fontSize: bold ? 15 : 13, fontWeight: bold ? 600 : 400 }}>{value}</span>
    </div>
  );
}
