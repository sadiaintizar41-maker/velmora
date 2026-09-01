
"use client";

import Link from "next/link";
import { Search, Heart, ShoppingBag, User } from "lucide-react";
import { useCart } from "@/lib/cart/CartContext";
import { useWishlist } from "@/lib/wishlist/WishlistContext";

export default function SiteHeader() {
  const { count: cartCount } = useCart();
  const { count: wishCount } = useWishlist();

  return (
    <>
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          background: "rgba(247,243,236,0.92)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid #C9A87833",
        }}
      >
        <div
          style={{
            maxWidth: 1440,
            margin: "0 auto",
            padding: "18px 32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Navigation */}
          <nav
            style={{
              display: "flex",
              gap: 30,
              alignItems: "center",
            }}
            className="desktop-nav"
          >
            <Link href="/" className="nav-link">
              Home
            </Link>

            <Link href="/shop" className="nav-link">
              Shop
            </Link>

            <Link href="/collections" className="nav-link">
              Collections
            </Link>
          </nav>

          {/* Logo */}
          <Link href="/" className="velmora-logo">
            VELMORA
          </Link>

          {/* Actions */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 20,
            }}
          >
            {/* Search */}
            <Link
              href="/search"
              aria-label="Search"
              className="icon-btn"
            >
              <Search size={18} strokeWidth={1.4} />
            </Link>

            {/* Wishlist */}
            <Link
              href="/wishlist"
              aria-label={`Wishlist, ${wishCount} items`}
              className="icon-btn"
              style={{ position: "relative" }}
            >
              <Heart size={18} strokeWidth={1.4} />

              {wishCount > 0 && <Badge>{wishCount}</Badge>}
            </Link>

            {/* Cart */}
            <Link
              href="/cart"
              aria-label={`Bag, ${cartCount} items`}
              className="icon-btn"
              style={{ position: "relative" }}
            >
              <ShoppingBag size={18} strokeWidth={1.4} />

              {cartCount > 0 && <Badge>{cartCount}</Badge>}
            </Link>

            {/* Account */}
            <Link
              href="/profile"
              aria-label="Account"
              className="icon-btn"
            >
              <User size={18} strokeWidth={1.4} />
            </Link>
          </div>
        </div>
      </header>

      {/* Hover Styles */}
      <style>{`
        /* Navigation links */
        .nav-link {
          font-family: Inter, sans-serif;
          font-size: 13px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #171515;
          text-decoration: none;
          position: relative;
          transition: color 0.3s ease;
        }

        .nav-link::after {
          content: "";
          position: absolute;
          left: 0;
          bottom: -6px;
          width: 0;
          height: 1px;
          background: #765C4D;
          transition: width 0.3s ease;
        }

        .nav-link:hover {
          color: #765C4D;
        }

        .nav-link:hover::after {
          width: 100%;
        }

        /* VELMORA logo */
        .velmora-logo {
          font-family: "Cormorant Garamond", serif;
          font-size: 24px;
          letter-spacing: 0.18em;
          color: #171515;
          text-decoration: none;
          font-weight: 600;
          transition: opacity 0.3s ease, transform 0.3s ease;
        }

        .velmora-logo:hover {
          opacity: 0.65;
          transform: translateY(-1px);
        }

        /* Search, wishlist, cart and account icons */
        .icon-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: #171515;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          transition:
            color 0.25s ease,
            transform 0.25s ease,
            opacity 0.25s ease;
        }

        .icon-btn:hover {
          color: #765C4D;
          transform: translateY(-2px);
        }

        .icon-btn:active {
          transform: translateY(0);
        }

        /* Mobile */
        @media (max-width: 760px) {
          .desktop-nav {
            display: none !important;
          }

          .velmora-logo {
            font-size: 21px;
          }
        }
      `}</style>
    </>
  );
}

const iconBtn: React.CSSProperties = {
  background: "none",
  border: "none",
  cursor: "pointer",
  color: "#171515",
  padding: 4,
  display: "flex",
};

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        position: "absolute",
        top: -6,
        right: -6,
        background: "#765C4D",
        color: "#F7F3EC",
        fontSize: 10,
        fontFamily: "Inter, sans-serif",
        borderRadius: "50%",
        width: 16,
        height: 16,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {children}
    </span>
  );
}

