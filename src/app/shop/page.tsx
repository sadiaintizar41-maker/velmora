import { getShopProducts, getCategories, getCollections, type ShopFilters as Filters } from "@/lib/supabase/queries";
import ShopFilters from "@/components/shop/ShopFilters";
import ProductGrid from "@/components/shop/ProductGrid";
import Link from "next/link";

export const metadata = {
  title: "Shop - VELMORA",
  description: "Considered clothing and accessories from VELMORA. Elegance, Redefined.",
};

interface PageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function ShopPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const filters: Filters = {
    category: params.category,
    collection: params.collection,
    size: params.size,
    color: params.color,
    availability: params.availability === "in_stock" ? "in_stock" : "all",
    sort: (params.sort as Filters["sort"]) ?? "featured",
    search: params.search,
    page: params.page ? Number(params.page) : 1,
  };

  let result: Awaited<ReturnType<typeof getShopProducts>> | null = null;
  let loadError = false;

  try {
    result = await getShopProducts(filters);
  } catch {
    loadError = true;
  }

  const [categories, collections] = await Promise.all([getCategories(), getCollections()]);

  return (
    <div style={{ background: "#F7F3EC", minHeight: "100vh", padding: "140px 32px 100px" }}>
      <div style={{ maxWidth: 1320, margin: "0 auto" }}>
        <h1
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "clamp(40px, 6vw, 64px)",
            color: "#171515",
            margin: "0 0 40px",
          }}
        >
          Shop
        </h1>

        <ShopFilters
          categories={categories}
          collections={collections}
          currentParams={params}
        />

        <ProductGrid
          products={(result?.products ?? []) as any}
          loadError={loadError}
          errorMessage="Unable to load products. Please try again."
        />

        {!loadError && result && result.products.length > 0 && (
          <Pagination
            page={result.page}
            pageSize={result.pageSize}
            total={result.count}
            params={params}
          />
        )}
      </div>
    </div>
  );
}

function Pagination({
  page, pageSize, total, params,
}: { page: number; pageSize: number; total: number; params: Record<string, string | undefined> }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;

  const linkFor = (p: number) => {
    const next = new URLSearchParams(params as Record<string, string>);
    next.set("page", String(p));
    return `/shop?${next.toString()}`;
  };

  return (
    <nav aria-label="Shop pagination" style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 60 }}>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <Link
          key={p}
          href={linkFor(p)}
          aria-current={p === page ? "page" : undefined}
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: 13,
            width: 32,
            height: 32,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textDecoration: "none",
            color: p === page ? "#F7F3EC" : "#171515",
            background: p === page ? "#171515" : "transparent",
            border: "1px solid #171515",
          }}
        >
          {p}
        </Link>
      ))}
    </nav>
  );
}
