"use client";

import { useState } from "react";

interface Image {
  id: string;
  image_url: string;
  alt_text: string | null;
}

export default function ProductGallery({ images, productName }: { images: Image[]; productName: string }) {
  const [active, setActive] = useState(0);
  const current = images[active] ?? images[0];

  if (!current) {
    return <div style={{ background: "#E8D8D1", aspectRatio: "3/4" }} />;
  }

  return (
    <div>
      <div style={{ overflow: "hidden", aspectRatio: "3/4", background: "#E8D8D1" }}>
        <img
          key={current.id}
          src={current.image_url}
          alt={current.alt_text ?? productName}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "grayscale(0.1) sepia(0.05)",
            animation: "velmoraFade 0.5s ease",
          }}
        />
      </div>
      {images.length > 1 && (
        <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActive(i)}
              aria-label={`Show image ${i + 1} of ${images.length}`}
              aria-current={i === active}
              style={{
                width: 64,
                height: 80,
                padding: 0,
                border: i === active ? "1px solid #171515" : "1px solid transparent",
                background: "none",
                cursor: "pointer",
                overflow: "hidden",
              }}
            >
              <img
                src={img.image_url}
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(0.1) sepia(0.05)" }}
              />
            </button>
          ))}
        </div>
      )}
      <style>{`@keyframes velmoraFade { from { opacity: 0; } to { opacity: 1; } }`}</style>
    </div>
  );
}
