"use client";

import { useState, useTransition } from "react";
import { updateOrderStatus, updatePaymentStatus } from "@/lib/actions/orders";
import type { OrderStatus, PaymentStatus } from "@/lib/supabase/database.types";

interface OrderItem {
  id: string;
  product_name: string;
  size: string;
  color: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

interface Order {
  id: string;
  shipping_name: string;
  shipping_email: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  total_amount: number;
  created_at: string;
  order_items: OrderItem[];
}

const ORDER_STATUSES: OrderStatus[] = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];
const PAYMENT_STATUSES: PaymentStatus[] = ["pending", "paid", "failed", "refunded"];
const formatPKR = (n: number) => `Rs. ${n.toLocaleString("en-PK")}`;

export default function OrderTable({ orders }: { orders: Order[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "Inter, sans-serif", fontSize: 13 }}>
      <thead>
        <tr style={{ textAlign: "left", borderBottom: "1px solid #E8D8D1" }}>
          {["Order", "Customer", "Items", "Total", "Status", "Payment", "Date"].map((h) => (
            <th key={h} style={{ padding: "8px 10px", fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "#765C4D" }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {orders.map((o) => (
          <Row key={o.id} order={o} expanded={expanded === o.id} onToggle={() => setExpanded(expanded === o.id ? null : o.id)} />
        ))}
        {orders.length === 0 && (
          <tr><td colSpan={7} style={{ padding: "16px 10px", color: "#3A2926" }}>No orders yet.</td></tr>
        )}
      </tbody>
    </table>
  );
}

function Row({ order: o, expanded, onToggle }: { order: Order; expanded: boolean; onToggle: () => void }) {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState(o.status);
  const [payment, setPayment] = useState(o.payment_status);
  const [error, setError] = useState<string | null>(null);

  function handleStatusChange(next: OrderStatus) {
    setError(null);
    startTransition(async () => {
      try {
        await updateOrderStatus(o.id, next);
        setStatus(next);
      } catch (e: any) {
        setError(e?.message ?? "Could not update status.");
      }
    });
  }

  function handlePaymentChange(next: PaymentStatus) {
    setError(null);
    startTransition(async () => {
      try {
        await updatePaymentStatus(o.id, next);
        setPayment(next);
      } catch (e: any) {
        setError(e?.message ?? "Could not update payment status.");
      }
    });
  }

  return (
    <>
      <tr style={{ borderBottom: "1px solid #E8D8D133", opacity: isPending ? 0.6 : 1 }}>
        <td style={{ padding: "8px 10px", color: "#765C4D" }}>
          <button onClick={onToggle} style={{ background: "none", border: "none", cursor: "pointer", color: "#765C4D", fontFamily: "Inter, sans-serif", fontSize: 12 }}>
            {o.id.slice(0, 8).toUpperCase()} {expanded ? "▲" : "▼"}
          </button>
        </td>
        <td style={{ padding: "8px 10px", color: "#171515" }}>
          {o.shipping_name}<br /><span style={{ color: "#3A2926", fontSize: 11 }}>{o.shipping_email}</span>
        </td>
        <td style={{ padding: "8px 10px", color: "#171515" }}>{o.order_items.length}</td>
        <td style={{ padding: "8px 10px", color: "#171515" }}>{formatPKR(o.total_amount)}</td>
        <td style={{ padding: "8px 10px" }}>
          <select value={status} disabled={isPending} onChange={(e: any) => handleStatusChange(e.target.value)} style={select}>
            {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </td>
        <td style={{ padding: "8px 10px" }}>
          <select value={payment} disabled={isPending} onChange={(e: any) => handlePaymentChange(e.target.value)} style={select}>
            {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </td>
        <td style={{ padding: "8px 10px", color: "#3A2926" }}>{new Date(o.created_at).toLocaleDateString()}</td>
      </tr>
      {expanded && (
        <tr>
          <td colSpan={7} style={{ padding: "10px 10px 16px", background: "#fff" }}>
            {error && <p role="alert" style={{ color: "#A32D2D", fontSize: 12, marginBottom: 8 }}>{error}</p>}
            <table style={{ width: "100%", fontSize: 12 }}>
              <tbody>
                {o.order_items.map((item) => (
                  <tr key={item.id}>
                    <td style={{ padding: "4px 8px", color: "#171515" }}>{item.product_name}</td>
                    <td style={{ padding: "4px 8px", color: "#3A2926" }}>{item.color} / {item.size}</td>
                    <td style={{ padding: "4px 8px", color: "#3A2926" }}>× {item.quantity}</td>
                    <td style={{ padding: "4px 8px", color: "#171515" }}>{formatPKR(item.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </td>
        </tr>
      )}
    </>
  );
}

const select: React.CSSProperties = { fontFamily: "Inter, sans-serif", fontSize: 12, padding: "5px 6px", border: "1px solid #765C4D66" };
