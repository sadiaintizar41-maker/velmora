import { notFound } from "next/navigation";
import { getAdminProductById, getAdminCategories, getAdminCollections } from "@/lib/supabase/adminQueries";
import ProductForm from "@/components/admin/ProductForm";
import VariantEditor from "@/components/admin/VariantEditor";
import ImageUploader from "@/components/admin/ImageUploader";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: PageProps) {
  const { id } = await params;
  const [product, categories, collections] = await Promise.all([
    getAdminProductById(id),
    getAdminCategories(),
    getAdminCollections(),
  ]);

  if (!product) notFound();

  const images = [...(product.product_images ?? [])].sort((a: any, b: any) => a.position - b.position);
  const variants = product.product_variants ?? [];

  return (
    <div>
      <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, color: "#171515", margin: "0 0 8px" }}>
        {product.name}
      </h1>
      <p style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: "#765C4D", marginBottom: 28 }}>
        /product/{product.slug}
      </p>

      <section style={{ marginBottom: 48 }}>
        <SectionHeading>Details</SectionHeading>
        <ProductForm
          mode="edit"
          productId={product.id}
          initial={{
            name: product.name,
            slug: product.slug,
            description: product.description ?? "",
            category_id: product.category_id,
            collection_id: product.collection_id,
            status: product.status,
            is_featured: product.is_featured,
            is_new: product.is_new,
            is_active: product.is_active,
          }}
          categories={categories.map((c: any) => ({ id: c.id, name: c.name }))}
          collections={collections.map((c: any) => ({ id: c.id, name: c.name }))}
        />
      </section>

      <section style={{ marginBottom: 48 }}>
        <SectionHeading>Images</SectionHeading>
        <ImageUploader productId={product.id} images={images} />
      </section>

      <section>
        <SectionHeading>Variants</SectionHeading>
        <VariantEditor productId={product.id} variants={variants} />
      </section>
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: "#171515", margin: "0 0 16px", paddingBottom: 10, borderBottom: "1px solid #E8D8D1" }}>
      {children}
    </h2>
  );
}
