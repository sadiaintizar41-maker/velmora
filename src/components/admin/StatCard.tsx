export default function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="admin-stat-card" style={{ background: "#fff", border: "1px solid #E8D8D1", padding: "22px 24px" }}>
      <p style={{ fontFamily: "Inter, sans-serif", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "#765C4D", margin: 0 }}>
        {label}
      </p>
      <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, color: "#171515", margin: "10px 0 0" }}>
        {value}
      </p>
    </div>
  );
}
