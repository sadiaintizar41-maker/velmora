export default function ShopLoading() {
  return (
    <div style={{ background: "#F7F3EC", minHeight: "100vh", padding: "140px 32px 100px" }}>
      <div style={{ maxWidth: 1320, margin: "0 auto" }}>
        <div style={{ height: 48, width: 160, background: "#E8D8D1", marginBottom: 40 }} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 28 }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i}>
              <div style={{ aspectRatio: "3/4", background: "#E8D8D1" }} />
              <div style={{ height: 16, width: "70%", background: "#E8D8D1", marginTop: 16 }} />
              <div style={{ height: 12, width: "40%", background: "#E8D8D1", marginTop: 8 }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
