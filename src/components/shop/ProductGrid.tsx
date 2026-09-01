import ProductCard from "./ProductCard";

interface Product {
  id: string;
  slug: string;
  name: string;
  is_new?: boolean;
  product_images?: { image_url: string; position?: number }[];
  product_variants?: { color_name: string; color_hex: string; price: number; stock_quantity?: number }[];
}

interface Props {
  products: Product[];
  loadError?: boolean;
  emptyMessage?: string;
  errorMessage?: string;
}

export default function ProductGrid({
  products,
  loadError = false,
  emptyMessage = "No pieces found.",
  errorMessage = "Unable to load products. Please try again.",
}: Props) {
  if (loadError) {
    return (
      <p style={{ fontFamily: "Inter, sans-serif", color: "#3A2926", padding: "60px 0", textAlign: "center" }}>
        {errorMessage}
      </p>
    );
  }

  if (products.length === 0) {
    return (
      <p style={{ fontFamily: "Inter, sans-serif", color: "#3A2926", padding: "60px 0", textAlign: "center" }}>
        {emptyMessage}
      </p>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
        gap: 28,
      }}
    >
      {products.map((p) => (
        <div key={p.id} style={{ position: "relative" }}>
          {p.is_new && (
            <span
              style={{
                position: "absolute", top: 14, left: 14, zIndex: 1,
                background: "#765C4D", color: "#F7F3EC", fontFamily: "Inter, sans-serif",
                fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", padding: "5px 10px",
              }}
            >
              New
            </span>
          )}
          <ProductCard
            productId={p.id}
            slug={p.slug}
            name={p.name}
            imageUrl={
              [...(p.product_images ?? [])].sort((a, b) => (a.position ?? 0) - (b.position ?? 0))[0]?.image_url ?? ""
            }
            variants={p.product_variants ?? []}
          />
        </div>
      ))}
    </div>
  );
}
