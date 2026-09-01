import { getAdminCollections } from "@/lib/supabase/adminQueries";
import CollectionManager from "@/components/admin/CollectionManager";

export default async function AdminCollectionsPage() {
  const collections = await getAdminCollections();

  return (
    <div>
      <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, color: "#171515", margin: "0 0 28px" }}>
        Collections
      </h1>
      <CollectionManager collections={collections as any} />
    </div>
  );
}
