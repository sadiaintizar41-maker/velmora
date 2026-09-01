"use client";

interface SizeOption {
  id: string;
  size: string;
  stock_quantity: number;
}

interface Props {
  sizes: SizeOption[];
  selected: string;
  onSelect: (size: string) => void;
}

export default function SizeSelector({ sizes, selected, onSelect }: Props) {
  return (
    <div style={{ display: "flex", gap: 8 }}>
      {sizes.map((v) => {
        const outOfStock = v.stock_quantity <= 0;
        const isSelected = v.size === selected;
        return (
          <button
            key={v.id}
            type="button"
            disabled={outOfStock}
            onClick={() => onSelect(v.size)}
            aria-pressed={isSelected}
            aria-label={outOfStock ? `${v.size} — out of stock` : v.size}
            title={outOfStock ? `${v.size} — out of stock` : v.size}
            style={{
              position: "relative",
              minWidth: 46,
              padding: "10px 6px",
              fontFamily: "Inter, sans-serif",
              fontSize: 13,
              border: isSelected ? "1px solid #171515" : "1px solid #765C4D66",
              background: isSelected ? "#171515" : "transparent",
              color: outOfStock ? "#3A292666" : isSelected ? "#F7F3EC" : "#171515",
              overflow: "hidden",
              cursor: outOfStock ? "not-allowed" : "pointer",
            }}
          >
            {v.size}
            {outOfStock && (
              /* Red diagonal strike-through over the size, indicating
                 this size is unavailable. */
              <span
                aria-hidden="true"
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(135deg, transparent 44%, #A32D2D 44%, #A32D2D 56%, transparent 56%)",
                  pointerEvents: "none",
                }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
