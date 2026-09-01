export default function ProductLoading() {
  return (
    <div style={{ background: "#F7F3EC", minHeight: "100vh", padding: "140px 32px 120px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 70 }}>
        <div style={{ aspectRatio: "3/4", background: "#E8D8D1" }} />
        <div>
          <div style={{ height: 14, width: 100, background: "#E8D8D1" }} />
          <div style={{ height: 40, width: "80%", background: "#E8D8D1", marginTop: 16 }} />
          <div style={{ height: 24, width: 120, background: "#E8D8D1", marginTop: 24 }} />
        </div>
      </div>
    </div>
  );
}
