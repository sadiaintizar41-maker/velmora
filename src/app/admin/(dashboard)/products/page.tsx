import Link from "next/link";
import { getAdminProducts } from "@/lib/supabase/adminQueries";
import ProductsTable from "@/components/admin/ProductsTable";

export default async function AdminProductsPage() {
  const products = await getAdminProducts();

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, color: "#171515", margin: 0 }}>
          Products
        </h1>
        <Link
          href="/admin/products/new"
          style={{
            background: "#171515", color: "#F7F3EC", padding: "11px 22px",
            fontFamily: "Inter, sans-serif", fontSize: 12, letterSpacing: "0.1em",
            textTransform: "uppercase", textDecoration: "none",
          }}
        >
          + New Product
        </Link>
      </div>

      {products.length === 0 ? (
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 14, color: "#3A2926" }}>
          No products yet. Create your first one.
        </p>
      ) : (
        <ProductsTable products={products as any} />
      )}
    </div>
  );
}
