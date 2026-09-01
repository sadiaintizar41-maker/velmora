import { getAdminCategories, getAdminCollections } from "@/lib/supabase/adminQueries";
import ProductForm from "@/components/admin/ProductForm";

export default async function NewProductPage() {
  const [categories, collections] = await Promise.all([getAdminCategories(), getAdminCollections()]);

  return (
    <div>
      <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, color: "#171515", margin: "0 0 28px" }}>
        New Product
      </h1>
      <ProductForm
        mode="create"
        categories={categories.map((c: any) => ({ id: c.id, name: c.name }))}
        collections={collections.map((c: any) => ({ id: c.id, name: c.name }))}
      />
      <p style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: "#3A2926", marginTop: 16, maxWidth: 500 }}>
        Pick product images above - they upload automatically when you create the product. Variants (size, color, price, stock, SKU) are added on the product's edit page afterward.
      </p>
    </div>
  );
}
