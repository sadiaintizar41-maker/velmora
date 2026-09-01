const COLORS: Record<string, string> = {
  pending: "#C9A878", confirmed: "#765C4D", processing: "#765C4D",
  shipped: "#3A2926", delivered: "#1F7A3D", cancelled: "#A32D2D",
  paid: "#1F7A3D", failed: "#A32D2D", refunded: "#3A2926",
};

export function StatusPill({ value }: { value: string }) {
  const color = COLORS[value] ?? "#171515";
  return (
    <span
      style={{
        fontFamily: "Inter, sans-serif", fontSize: 11, letterSpacing: "0.06em",
        textTransform: "uppercase", color, border: `1px solid ${color}55`, padding: "3px 8px",
        whiteSpace: "nowrap",
      }}
    >
      {value}
    </span>
  );
}
