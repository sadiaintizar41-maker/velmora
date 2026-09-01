import { getAdminOrders } from "@/lib/supabase/adminQueries";
import OrderTable from "@/components/admin/OrderTable";

export default async function AdminOrdersPage() {
  const orders = await getAdminOrders();

  return (
    <div>
      <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, color: "#171515", margin: "0 0 28px" }}>
        Orders
      </h1>
      <OrderTable orders={orders as any} />
    </div>
  );
}
