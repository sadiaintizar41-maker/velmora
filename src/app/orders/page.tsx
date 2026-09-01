import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

interface OrderItemRow {
  id: string;
  product_name: string;
  size: string;
  color: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

interface OrderRow {
  id: string;
  status: string;
  payment_status: string;
  total_amount: number;
  shipping_name: string;
  shipping_email: string;
  created_at: string;
  order_items: OrderItemRow[];
}

export default async function OrdersPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#F7F3EC",
          padding: "140px 24px 80px",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
          <h1
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 44,
              fontWeight: 400,
              color: "#171515",
            }}
          >
            Please sign in
          </h1>

          <Link
            href="/login"
            style={{
              color: "#171515",
              textDecoration: "underline",
            }}
          >
            Go to Sign In
          </Link>
        </div>
      </main>
    );
  }

  const { data: orders, error } = await supabase
    .from("orders")
    .select(`
      id,
      status,
      payment_status,
      total_amount,
      shipping_name,
      shipping_email,
      created_at,
      order_items (
        id,
        product_name,
        size,
        color,
        quantity,
        unit_price,
        subtotal
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const typedOrders = (orders ?? []) as OrderRow[];

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
          maxWidth: 1000,
          margin: "0 auto",
        }}
      >
        <div style={{ marginBottom: 45 }}>
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
              fontSize: "clamp(38px, 6vw, 58px)",
              fontWeight: 400,
              color: "#171515",
              margin: 0,
            }}
          >
            My Orders
          </h1>
        </div>

        {typedOrders.length > 0 ? (
          <div style={{ display: "grid", gap: 20 }}>
            {typedOrders.map((order) => (
              <div
                key={order.id}
                style={{
                  background: "#fff",
                  border: "1px solid #E8D8D1",
                  padding: "24px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 20,
                    flexWrap: "wrap",
                    borderBottom: "1px solid #E8D8D1",
                    paddingBottom: 18,
                    marginBottom: 18,
                  }}
                >
                  <div>
                    <p
                      style={{
                        margin: 0,
                        fontFamily: "Inter, sans-serif",
                        fontSize: 10,
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        color: "#765C4D",
                      }}
                    >
                      Order
                    </p>

                    <p
                      style={{
                        margin: "5px 0 0",
                        fontFamily: "Inter, sans-serif",
                        fontSize: 13,
                        color: "#171515",
                      }}
                    >
                      #{order.id.slice(0, 8).toUpperCase()}
                    </p>
                  </div>

                  <div>
                    <p
                      style={{
                        margin: 0,
                        fontFamily: "Inter, sans-serif",
                        fontSize: 10,
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        color: "#765C4D",
                      }}
                    >
                      Date
                    </p>

                    <p
                      style={{
                        margin: "5px 0 0",
                        fontFamily: "Inter, sans-serif",
                        fontSize: 13,
                        color: "#171515",
                      }}
                    >
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <div>
                    <p
                      style={{
                        margin: 0,
                        fontFamily: "Inter, sans-serif",
                        fontSize: 10,
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        color: "#765C4D",
                      }}
                    >
                      Status
                    </p>

                    <p
                      style={{
                        margin: "5px 0 0",
                        fontFamily: "Inter, sans-serif",
                        fontSize: 13,
                        color: "#171515",
                        textTransform: "capitalize",
                      }}
                    >
                      {order.status}
                    </p>
                  </div>

                  <div>
                    <p
                      style={{
                        margin: 0,
                        fontFamily: "Inter, sans-serif",
                        fontSize: 10,
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        color: "#765C4D",
                      }}
                    >
                      Payment
                    </p>

                    <p
                      style={{
                        margin: "5px 0 0",
                        fontFamily: "Inter, sans-serif",
                        fontSize: 13,
                        color: "#171515",
                        textTransform: "capitalize",
                      }}
                    >
                      {order.payment_status}
                    </p>
                  </div>

                  <div>
                    <p
                      style={{
                        margin: 0,
                        fontFamily: "Inter, sans-serif",
                        fontSize: 10,
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        color: "#765C4D",
                      }}
                    >
                      Total
                    </p>

                    <p
                      style={{
                        margin: "5px 0 0",
                        fontFamily: "Inter, sans-serif",
                        fontSize: 14,
                        color: "#171515",
                      }}
                    >
                      Rs. {Number(order.total_amount).toLocaleString("en-PK")}
                    </p>
                  </div>
                </div>

                <div>
                  <p
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: 10,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: "#765C4D",
                      marginBottom: 12,
                    }}
                  >
                    Items
                  </p>

                  {(order.order_items ?? []).map((item: OrderItemRow) => (
                    <div
                      key={item.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 20,
                        padding: "10px 0",
                        borderBottom: "1px solid #E8D8D133",
                        fontFamily: "Inter, sans-serif",
                        fontSize: 13,
                      }}
                    >
                      <div>
                        <span style={{ color: "#171515" }}>
                          {item.product_name}
                        </span>

                        <span
                          style={{
                            display: "block",
                            marginTop: 4,
                            fontSize: 11,
                            color: "#765C4D",
                          }}
                        >
                          {item.size} · {item.color} · Qty {item.quantity}
                        </span>
                      </div>

                      <span style={{ color: "#171515" }}>
                        Rs. {Number(item.subtotal).toLocaleString("en-PK")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            style={{
              background: "#fff",
              border: "1px solid #E8D8D1",
              padding: "50px 24px",
              textAlign: "center",
            }}
          >
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 30,
                fontWeight: 400,
                color: "#171515",
                margin: 0,
              }}
            >
              No orders yet
            </h2>

            <p
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: 13,
                color: "#765C4D",
                margin: "12px 0 24px",
              }}
            >
              Your orders will appear here after you make a purchase.
            </p>

            <Link
              href="/"
              style={{
                display: "inline-block",
                background: "#171515",
                color: "#F7F3EC",
                padding: "13px 24px",
                fontFamily: "Inter, sans-serif",
                fontSize: 11,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                textDecoration: "none",
              }}
            >
              Continue Shopping
            </Link>
          </div>
        )}

        <div style={{ marginTop: 30 }}>
          <Link
            href="/customer"
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: 12,
              color: "#765C4D",
              textDecoration: "none",
            }}
          >
            ← Back to My Account
          </Link>
        </div>
      </div>
    </main>
  );
}

