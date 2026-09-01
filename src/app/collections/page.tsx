import Link from "next/link";
import { getCollections } from "@/lib/supabase/queries";

export const metadata = {
  title: "Collections - VELMORA",
  description: "Explore VELMORA's collections — considered edits for every season.",
};

export default async function CollectionsPage() {
  let collections: Awaited<ReturnType<typeof getCollections>> = [];
  let loadError = false;

  try {
    collections = await getCollections();
  } catch {
    loadError = true;
  }

  return (
    <div style={{ background: "#F7F3EC", minHeight: "100vh", padding: "140px 32px 100px" }}>
      <div style={{ maxWidth: 1320, margin: "0 auto" }}>
        <h1
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "clamp(40px, 6vw, 64px)",
            color: "#171515",
            margin: "0 0 50px",
            textAlign: "center",
          }}
        >
          Collections
        </h1>

        {loadError && (
          <p style={{ fontFamily: "Inter, sans-serif", color: "#3A2926", padding: "60px 0", textAlign: "center" }}>
            Unable to load collections. Please try again.
          </p>
        )}

        {!loadError && collections.length === 0 && (
          <p style={{ fontFamily: "Inter, sans-serif", color: "#3A2926", padding: "60px 0", textAlign: "center" }}>
            No collections found.
          </p>
        )}

        {!loadError && collections.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 60 }}>
            {collections.map((c: (typeof collections)[number], i: number) => (
              <Link
                key={c.id}
                href={`/collections/${c.slug}`}
                style={{
                  position: "relative",
                  display: "block",
                  overflow: "hidden",
                  textDecoration: "none",
                  height: "60vh",
                  minHeight: 380,
                }}
              >
                <img
                  src={c.image_url ?? ""}
                  alt={c.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(0.2) sepia(0.1)" }}
                  loading={i === 0 ? "eager" : "lazy"}
                />
                <div style={{ position: "absolute", inset: 0, background: "rgba(23,21,21,0.4)" }} />
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: 24 }}>
                  <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(32px,5vw,56px)", color: "#F7F3EC", margin: 0 }}>
                    {c.name}
                  </h2>
                  {c.description && (
                    <p style={{ fontFamily: "Inter, sans-serif", fontSize: 14, color: "#E8D8D1", maxWidth: 420, marginTop: 14 }}>
                      {c.description}
                    </p>
                  )}
                  <span
                    style={{
                      marginTop: 24, border: "1px solid #F7F3EC", color: "#F7F3EC",
                      fontFamily: "Inter, sans-serif", fontSize: 12, letterSpacing: "0.16em",
                      textTransform: "uppercase", padding: "12px 30px",
                    }}
                  >
                    Explore Collection
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
