import { getAdminCustomers } from "@/lib/supabase/adminQueries";
import CustomerTable from "@/components/admin/CustomerTable";

export default async function AdminCustomersPage() {
  const customers = await getAdminCustomers();

  return (
    <div>
      <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, color: "#171515", margin: "0 0 10px" }}>
        Customers
      </h1>
      <p style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: "#3A2926", marginBottom: 28 }}>
        Only account details relevant to store management are shown here. Passwords and authentication
        credentials are never accessible outside Supabase Auth itself.
      </p>
      <CustomerTable customers={customers as any} />
    </div>
  );
}
