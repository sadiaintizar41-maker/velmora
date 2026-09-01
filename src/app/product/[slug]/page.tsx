import { notFound } from "next/navigation";
import { getProductBySlug, getRelatedProducts } from "@/lib/supabase/queries";
import ProductGallery from "@/components/product/ProductGallery";
import VariantSelector from "@/components/product/VariantSelector";
import ProductCard from "@/components/shop/ProductCard";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "VELMORA" };
  return {
    title: `${product.name} - VELMORA`,
    description: product.description ?? undefined,
    openGraph: {
      title: `${product.name} - VELMORA`,
      images: product.product_images?.[0]?.image_url ? [product.product_images[0].image_url] : [],
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  // Draft/archived products 404 for everyone except admins, enforced
  // by RLS in getProductBySlug - a non-admin session simply never
  // receives the row, so this looks identical to "doesn't exist."
  if (!product) notFound();

  const images = [...(product.product_images ?? [])].sort((a: any, b: any) => a.position - b.position);
  const variants = product.product_variants ?? [];
  const related = await getRelatedProducts(product.category_id, product.id);

  return (
    <div style={{ background: "#F7F3EC", minHeight: "100vh", padding: "140px 32px 120px" }}>
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1.1fr 0.9fr",
          gap: 70,
        }}
        className="velmora-stack-2"
      >
        <ProductGallery images={images} productName={product.name} />

        <div>
          {(product as any).categories?.name && (
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: 12, letterSpacing: "0.2em", color: "#765C4D", textTransform: "uppercase", margin: 0 }}>
              {(product as any).categories.name}
            </p>
          )}
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(32px,4vw,46px)", color: "#171515", margin: "10px 0 0" }}>
            {product.name}
          </h1>
          {product.description && (
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: 15, lineHeight: 1.8, color: "#3A2926", marginTop: 18, maxWidth: 460 }}>
              {product.description}
            </p>
          )}

          <VariantSelector
            productId={product.id}
            productSlug={product.slug}
            productName={product.name}
            imageUrl={images[0]?.image_url ?? ""}
            variants={variants}
          />
        </div>
      </div>

      {related.length > 0 && (
        <div style={{ maxWidth: 1200, margin: "110px auto 0" }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(28px,3.5vw,38px)", color: "#171515", marginBottom: 34 }}>
            You May Also Like
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24 }} className="velmora-grid-4">
            {related.map((p: any) => (
              <ProductCard
                key={p.id}
                productId={p.id}
                slug={p.slug}
                name={p.name}
                imageUrl={p.product_images?.[0]?.image_url ?? ""}
                variants={p.product_variants ?? []}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
