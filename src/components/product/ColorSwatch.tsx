"use client";

interface ColorOption {
  color_name: string;
  color_hex: string;
  available: boolean;
  /** Tooltip/aria text shown when unavailable, e.g. "Noir - not available in M". */
  unavailableLabel?: string;
}

interface Props {
  colors: ColorOption[];
  selected: string;
  onSelect: (colorName: string) => void;
}

export default function ColorSwatch({ colors, selected, onSelect }: Props) {
  return (
    <div style={{ display: "flex", gap: 10 }}>
      {colors.map((c) => {
        const out = !c.available;
        const isSelected = c.color_name === selected;
        return (
          <button
            key={c.color_name}
            type="button"
            onClick={() => onSelect(c.color_name)}
            disabled={out}
            aria-pressed={isSelected}
            aria-label={out ? c.unavailableLabel ?? `${c.color_name} - out of stock` : c.color_name}
            title={out ? c.unavailableLabel ?? `${c.color_name} - out of stock` : c.color_name}
            style={{
              position: "relative",
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: c.color_hex,
              border: isSelected ? "2px solid #171515" : "1px solid #C9A87866",
              cursor: out ? "not-allowed" : "pointer",
              padding: 0,
              opacity: out ? 0.45 : 1,
              overflow: "hidden",
            }}
          >
            {out && (
              /* Red diagonal strike-through over the color, indicating
                 this color is unavailable. */
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
