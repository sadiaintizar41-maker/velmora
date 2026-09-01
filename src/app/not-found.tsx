import Link from "next/link";

export default function GlobalNotFound() {
  return (
    <div
      style={{
        background: "#171515",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: 24,
      }}
    >
      <p style={{ fontFamily: "Inter, sans-serif", fontSize: 12, letterSpacing: "0.3em", color: "#C9A878", marginBottom: 18 }}>
        404
      </p>
      <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(32px,5vw,52px)", color: "#F7F3EC", margin: 0 }}>
        VELMORA
      </h1>
      <p style={{ fontFamily: "Inter, sans-serif", fontSize: 14, color: "#E8D8D1", opacity: 0.8, marginTop: 14 }}>
        This page doesn't exist, or has moved.
      </p>
      <Link
        href="/"
        style={{
          marginTop: 30, border: "1px solid #C9A878", color: "#F7F3EC",
          fontFamily: "Inter, sans-serif", fontSize: 12, letterSpacing: "0.16em",
          textTransform: "uppercase", padding: "14px 34px", textDecoration: "none",
        }}
      >
        Return Home
      </Link>
    </div>
  );
}
