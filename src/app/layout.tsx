import type { ReactNode } from "react";
import { CartProvider } from "@/lib/cart/CartContext";
import { WishlistProvider } from "@/lib/wishlist/WishlistContext";
import ConditionalHeader from "@/components/layout/ConditionalHeader";

export const metadata = {
  title: "VELMORA — Elegance, Redefined.",
  description:
    "A considered clothing house for elegant, effortless dressing. Explore VELMORA's collections.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Fonts: preconnect + high-priority stylesheet instead of a
            render-blocking @import inside CSS. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=Inter:wght@400;500&display=swap"
        />
        {/* Supabase is contacted on first paint for catalog data. */}
        <link rel="preconnect" href={process.env.NEXT_PUBLIC_SUPABASE_URL} />
      </head>
      <body style={{ margin: 0 }}>
        <style>{`
          * { box-sizing: border-box; }
          html, body { margin: 0; overflow-x: hidden; }
          a:focus-visible, button:focus-visible, input:focus-visible, select:focus-visible {
            outline: 2px solid #765C4D;
            outline-offset: 2px;
          }
          @media (max-width: 900px) {
            .desktop-nav { display: none !important; }
            .velmora-stack-2 { grid-template-columns: 1fr !important; gap: 34px !important; }
            .velmora-grid-4 { grid-template-columns: repeat(2, 1fr) !important; }
          }
          @media (prefers-reduced-motion: reduce) {
            * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
          }
        `}</style>
        <CartProvider>
          <WishlistProvider>
            <ConditionalHeader />
            {children}
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}
