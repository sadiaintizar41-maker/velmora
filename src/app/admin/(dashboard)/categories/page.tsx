import { getAdminCategories } from "@/lib/supabase/adminQueries";
import CategoryManager from "@/components/admin/CategoryManager";

export default async function AdminCategoriesPage() {
  const categories = await getAdminCategories();

  return (
    <div>
      <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, color: "#171515", margin: "0 0 28px" }}>
        Categories
      </h1>
      <CategoryManager categories={categories as any} />
    </div>
  );
}
