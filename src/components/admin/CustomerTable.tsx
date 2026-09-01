interface Customer {
  id: string;
  full_name: string | null;
  email: string;
  phone: string | null;
  created_at: string;
  orderCount: number;
  totalSpending: number;
}

const formatPKR = (n: number) => `Rs. ${n.toLocaleString("en-PK")}`;

export default function CustomerTable({ customers }: { customers: Customer[] }) {
  return (
    <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "Inter, sans-serif", fontSize: 13 }}>
      <thead>
        <tr style={{ textAlign: "left", borderBottom: "1px solid #E8D8D1" }}>
          {["Name", "Email", "Phone", "Orders", "Total Spending", "Joined"].map((h) => (
            <th key={h} style={{ padding: "8px 10px", fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "#765C4D" }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {customers.map((c) => (
          <tr key={c.id} style={{ borderBottom: "1px solid #E8D8D133" }}>
            <td style={{ padding: "8px 10px", color: "#171515" }}>{c.full_name ?? "-"}</td>
            <td style={{ padding: "8px 10px", color: "#171515" }}>{c.email}</td>
            <td style={{ padding: "8px 10px", color: "#3A2926" }}>{c.phone ?? "-"}</td>
            <td style={{ padding: "8px 10px", color: "#171515" }}>{c.orderCount}</td>
            <td style={{ padding: "8px 10px", color: "#171515" }}>{formatPKR(c.totalSpending)}</td>
            <td style={{ padding: "8px 10px", color: "#3A2926" }}>{new Date(c.created_at).toLocaleDateString()}</td>
          </tr>
        ))}
        {customers.length === 0 && (
          <tr><td colSpan={6} style={{ padding: "16px 10px", color: "#3A2926" }}>No customers yet.</td></tr>
        )}
      </tbody>
    </table>
  );
}
