import { notFound } from "next/navigation";
import { getCollectionBySlug, getProductsByCollection } from "@/lib/supabase/queries";
import ProductGrid from "@/components/shop/ProductGrid";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);
  if (!collection) return { title: "VELMORA" };
  return {
    title: `${collection.name} - VELMORA`,
    description: collection.description ?? undefined,
  };
}

export default async function CollectionDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);

  if (!collection) notFound();

  let products: Awaited<ReturnType<typeof getProductsByCollection>> = [];
  let loadError = false;
  try {
    products = await getProductsByCollection(collection.id);
  } catch {
    loadError = true;
  }

  return (
    <div style={{ background: "#F7F3EC", minHeight: "100vh" }}>
      <div style={{ position: "relative", height: "56vh", minHeight: 360, overflow: "hidden" }}>
        <img
          src={collection.image_url ?? ""}
          alt={collection.name}
          style={{ width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(0.2) sepia(0.1)" }}
        />
        <div style={{ position: "absolute", inset: 0, background: "rgba(23,21,21,0.42)" }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: 24 }}>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(38px,6vw,68px)", color: "#F7F3EC", margin: 0 }}>
            {collection.name}
          </h1>
          {collection.description && (
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: 15, color: "#E8D8D1", maxWidth: 480, marginTop: 16 }}>
              {collection.description}
            </p>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 1320, margin: "0 auto", padding: "90px 32px" }}>
        <ProductGrid
          products={products as any}
          loadError={loadError}
          emptyMessage="No pieces in this collection yet."
          errorMessage="Unable to load this collection. Please try again."
        />
      </div>
    </div>
  );
}
