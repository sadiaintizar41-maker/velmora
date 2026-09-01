"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { Search, Heart, ShoppingBag, User, Menu, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useCart } from "@/lib/cart/CartContext";
import { useWishlist } from "@/lib/wishlist/WishlistContext";

/* ---------------------------------------------------------
   VELMORA - "Elegance, Redefined."
   Cinematic editorial homepage.
   New Arrivals / Best Sellers receive live catalog data from
   src/app/page.tsx (Supabase). Category tiles, CTA buttons,
   footer links and the newsletter form all point at real
   routes / the newsletter_subscribers table.
---------------------------------------------------------- */

const COLORS = {
  ivory: "#F7F3EC",
  obsidian: "#171515",
  espresso: "#3A2926",
  mocha: "#765C4D",
  champagne: "#C9A878",
  blush: "#E8D8D1",
};

/* ---- live category tiles (slugs match public.categories) ---------- */

const CATEGORIES = [
  {
    id: "c1",
    name: "Dresses",
    slug: "dresses",
    image_url: "/images/dresses.webp",
  },
  {
    id: "c2",
    name: "Tops",
    slug: "tops",
    image_url: "/images/tops.webp",
  },
  {
    id: "c3",
    name: "Bottoms",
    slug: "bottoms",
    image_url: "/images/bottoms.webp",
  },
  {
    id: "c4",
    name: "Bags",
    slug: "bags",
    image_url: "/images/accessories.webp",
  },
];

const formatPKR = (n) => `Rs. ${n.toLocaleString("en-PK")}`;

/* ---- reveal-on-scroll hook, respects prefers-reduced-motion ---- */

function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setVisible(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.unobserve(el);
        }
      },
      { threshold: 0.18 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return [ref, visible];
}

function Reveal({ as: Tag = "div", delay = 0, className = "", style = {}, children }) {
  const [ref, visible] = useReveal();
  return (
    <Tag
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0px)" : "translateY(28px)",
        transition: `opacity 1.1s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 1.1s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
        ...style,
      }}
    >
      {children}
    </Tag>
  );
}

/* ---- thin section label ---- */
function Eyebrow({ children, dark = false }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        marginBottom: 22,
      }}
    >
      <span style={{ width: 32, height: 1, background: COLORS.champagne }} />
      <span
        style={{
          fontFamily: "Inter, sans-serif",
          fontSize: 12,
          letterSpacing: "0.22em",
          color: dark ? COLORS.champagne : COLORS.mocha,
          textTransform: "uppercase",
        }}
      >
        {children}
      </span>
    </div>
  );
}

/* =========================== NAVBAR =========================== */

function Navbar({ solid, onMenu, cartCount, wishCount }) {
  const linkStyle = {
    fontFamily: "Inter, sans-serif",
    fontSize: 13,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: solid ? COLORS.obsidian : COLORS.ivory,
    textDecoration: "none",
    opacity: 0.92,
  };

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: solid ? "rgba(247,243,236,0.92)" : "transparent",
        backdropFilter: solid ? "blur(10px)" : "none",
        borderBottom: solid ? `1px solid ${COLORS.champagne}33` : "1px solid transparent",
        transition: "background 0.5s ease, border-color 0.5s ease",
      }}
    >
      <div
        style={{
          maxWidth: 1440,
          margin: "0 auto",
          padding: "20px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <button
          onClick={onMenu}
          aria-label="Open menu"
          className="lg-hide"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: solid ? COLORS.obsidian : COLORS.ivory,
            display: "none",
          }}
        >
          <Menu size={22} strokeWidth={1.4} />
        </button>

       <div
  style={{
    display: "flex",
    alignItems: "center",
    gap: 46,
  }}
>
  <a
    href="#home"
    style={{
      fontFamily: "'Cormorant Garamond', serif",
      fontSize: 26,
      letterSpacing: "0.18em",
      color: solid ? COLORS.obsidian : COLORS.ivory,
      textDecoration: "none",
      fontWeight: 600,
      whiteSpace: "nowrap",
    }}
  >
    VELMORA
  </a>

  <nav
    className="desktop-nav"
    style={{
      display: "flex",
      gap: 34,
      alignItems: "center",
    }}
  >
    <a href="/" style={linkStyle}>Home</a>
    <a href="/shop" style={linkStyle}>Shop</a>
    <a href="/collections" style={linkStyle}>Collections</a>
    <a href="/about" style={linkStyle}>About</a>
    <a href="/contact" style={linkStyle}>Contact</a>
  </nav>
</div>

       <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
  {/* Search */}
  <Link
    href="/shop"
    aria-label="Search"
    style={iconBtnStyle(solid)}
  >
    <Search size={19} strokeWidth={1.4} />
  </Link>

  {/* Wishlist */}
  <Link
    href="/wishlist"
    aria-label={`Wishlist, ${wishCount} items`}
    style={{ ...iconBtnStyle(solid), position: "relative" }}
  >
    <Heart size={19} strokeWidth={1.4} />
    {wishCount > 0 && <Badge solid={solid}>{wishCount}</Badge>}
  </Link>

  {/* Cart */}
  <Link
    href="/cart"
    aria-label={`Bag, ${cartCount} items`}
    style={{ ...iconBtnStyle(solid), position: "relative" }}
  >
    <ShoppingBag size={19} strokeWidth={1.4} />
    {cartCount > 0 && <Badge solid={solid}>{cartCount}</Badge>}
  </Link>

  {/* Account — leave unchanged for now */}
  <button
  aria-label="Account"
  className="lg-only"
  style={iconBtnStyle(solid)}
  onClick={() => {
    window.location.href = "/login";
  }}
>
    <User size={19} strokeWidth={1.4} />
  </button>
</div>
      </div>
    </header>
  );
}

function iconBtnStyle(solid) {
  return {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: solid ? COLORS.obsidian : COLORS.ivory,
    padding: 4,
    display: "flex",
  };
}

function Badge({ children, solid }) {
  return (
    <span
      style={{
        position: "absolute",
        top: -6,
        right: -6,
        background: COLORS.mocha,
        color: COLORS.ivory,
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

function MobileMenu({ open, onClose }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 60,
        background: COLORS.ivory,
        transform: open ? "translateX(0)" : "translateX(-100%)",
        transition: "transform 0.55s cubic-bezier(0.16,1,0.3,1)",
        display: "flex",
        flexDirection: "column",
        padding: "24px 32px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, letterSpacing: "0.14em" }}>
          VELMORA
        </span>
        <button onClick={onClose} aria-label="Close menu" style={{ background: "none", border: "none", cursor: "pointer" }}>
          <X size={24} strokeWidth={1.4} color={COLORS.obsidian} />
        </button>
      </div>
      <nav style={{ marginTop: 60, display: "flex", flexDirection: "column", gap: 28 }}>
        {[
          { label: "Home", href: "/" },
          { label: "Shop", href: "/shop" },
          { label: "Collections", href: "/collections" },
          { label: "About", href: "/about" },
          { label: "Contact", href: "/contact" },
        ].map((l) => (
          <Link
            key={l.label}
            href={l.href}
            onClick={onClose}
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 34,
              color: COLORS.obsidian,
              textDecoration: "none",
            }}
          >
            {l.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}

/* =========================== HERO =========================== */
function Hero() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const zoom = 1 + Math.min(scrollY, 700) / 4500;
  const parallaxY = scrollY * -0.12;
  const fade = 1 - Math.min(scrollY, 500) / 500;
  const contentY = scrollY * -0.08;
  return (
    <section
      id="home"
      style={{
        position: "relative",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      {/* Hero Background */}
      <div
        className="hero-background"
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `linear-gradient(
            180deg,
            rgba(23, 21, 21, 0.35),
            rgba(23, 21, 21, 0.55)
          ), url("/images/velmora-hero.webp")`,
          backgroundSize: "cover",
          backgroundPosition: "center 20%",
          filter: "grayscale(0.25) sepia(0.12)",
          transform: `translate3d(0, ${parallaxY}px, 0) scale(${zoom})`,
willChange: "transform",
        }}
      />

      {/* Hero Content */}
      <div
        style={{
          position: "relative",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          opacity: fade,
      
        }}
      >
        {/* Small Heading */}
        <p
          className="hero-eyebrow"
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: 12,
            letterSpacing: "0.35em",
            color: COLORS.champagne,
            textTransform: "uppercase",
            marginBottom: 22,
          }}
        >
          The Art of Dressing
        </p>

        {/* Main Brand Name */}
        <h1
          className="hero-title"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 500,
            fontSize: "clamp(52px, 11vw, 148px)",
            letterSpacing: "0.06em",
            color: COLORS.ivory,
            lineHeight: 1,
            margin: 0,
          }}
        >
          VELMORA
        </h1>

        {/* Tagline */}
        <p
          className="hero-subtitle"
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: 14,
            letterSpacing: "0.06em",
            color: COLORS.ivory,
            opacity: 0.85,
            marginTop: 22,
          }}
        >
          Elegance, Redefined.
        </p>

        {/* Scroll Indicator */}
        <div
          className="hero-scroll"
          style={{
            position: "absolute",
            bottom: 44,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: 10,
              letterSpacing: "0.3em",
              color: COLORS.ivory,
              opacity: 0.7,
              textTransform: "uppercase",
            }}
          >
            Scroll to Explore
          </span>

          <span
            className="scroll-line"
            style={{
              width: 1,
              height: 46,
              background: `linear-gradient(
                180deg,
                ${COLORS.champagne},
                transparent
              )`,
            }}
          />
        </div>
      </div>
    </section>
  );
}

          

/* =========================== NEW SEASON =========================== */

function NewSeasonSection() {
  return (
    <section style={{ background: COLORS.ivory, padding: "150px 32px", overflow: "hidden" }}>
      <div style={{ maxWidth: 1320, margin: "0 auto", display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 60, alignItems: "center" }} className="grid-stack">
        <Reveal>
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: 12, letterSpacing: "0.3em", color: COLORS.mocha, marginBottom: 18 }}>
            VELMORA / 2026
          </p>
          <h2
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 500,
              fontSize: "clamp(64px, 9vw, 118px)",
              lineHeight: 0.92,
              color: COLORS.obsidian,
              margin: 0,
            }}
          >
            New<br />Season
          </h2>
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: 16, lineHeight: 1.8, color: COLORS.espresso, maxWidth: 380, marginTop: 30 }}>
            A collection built for stillness and movement alike — considered
            silhouettes rendered in warm, quiet tones.
          </p>
        </Reveal>
        <Reveal delay={200}>
          <div style={{ overflow: "hidden", borderRadius: 2 }}>
           <img
  src="/images/velmora-newseason.webp"
  alt="New season editorial look"
  className="new-season-image"
  style={{
    width: "100%",
    height: "auto",
    objectFit: "contain",
    display: "block",
    filter: "grayscale(0.15) sepia(0.08)",
  }}
  loading="lazy"
/>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* =========================== SIGNATURE EDIT =========================== */

function SignatureEdit() {
  return (
   <section
  className="signature-section"
  style={{
    position: "relative",
    width: "100%",
    overflow: "hidden",
  }}
>
     <img
  src="/images/velmora-signature.webp"
  alt="The Signature Edit"
  className="signature-image"
  loading="lazy"
/>

      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(90deg, rgba(23,21,21,0.55), rgba(23,21,21,0.05))",
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
        }}
      >
        <Reveal
          className="signature-copy"
          style={{
            maxWidth: 520,
            padding: "0 60px",
          }}
        >
          <Eyebrow dark>Signature</Eyebrow>

          <h2
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 500,
              fontSize: "clamp(38px, 5vw, 60px)",
              color: COLORS.ivory,
              margin: 0,
              lineHeight: 1.1,
            }}
          >
            The Signature Edit
          </h2>

          <p
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: 15,
              lineHeight: 1.8,
              color: COLORS.ivory,
              opacity: 0.85,
              marginTop: 22,
              maxWidth: 400,
            }}
          >
            A considered collection for effortless days and unforgettable
            evenings.
          </p>

          <Link
  href="/collections/signature-edit"
  style={{ ...outlineBtn(COLORS.ivory), display: "inline-block", textDecoration: "none" }}
>
  Explore Collection
</Link>
        </Reveal>
      </div>
    </section>
  );
}
  
function outlineBtn(color) {
  return {
    marginTop: 34,
    background: "none",
    border: `1px solid ${color}`,
    color,
    fontFamily: "Inter, sans-serif",
    fontSize: 12,
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    padding: "14px 34px",
    cursor: "pointer",
  };
}

/* =========================== CATEGORIES =========================== */

function CategorySection() {
  return (
    <section id="shop" style={{ background: COLORS.ivory, padding: "130px 32px" }}>
      <Reveal style={{ textAlign: "center", marginBottom: 60 }}>
        <Eyebrow>Explore</Eyebrow>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(36px,5vw,56px)", color: COLORS.obsidian, margin: 0 }}>
          Shop by Category
        </h2>
      </Reveal>
      <div style={{ maxWidth: 1320, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 18 }} className="cat-grid">
        {CATEGORIES.map((c, i) => (
          <Reveal key={c.id} delay={i * 90}>
            <Link href={`/shop?category=${c.slug}`} className="cat-card" style={{ display: "block", position: "relative", overflow: "hidden", textDecoration: "none" }}>
              <div style={{ aspectRatio: "3/4", overflow: "hidden" }}>
                <img
                  src={c.image_url}
                  alt={c.name}
                  className="cat-img"
                  style={{ width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(0.2) sepia(0.06)", transition: "transform 0.9s cubic-bezier(0.16,1,0.3,1)" }}
                  loading="lazy"
                />
              </div>
              <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "24px 20px", background: "linear-gradient(180deg, transparent, rgba(23,21,21,0.55))" }}>
                <span style={{ fontFamily: "Inter, sans-serif", fontSize: 13, letterSpacing: "0.16em", color: COLORS.ivory, textTransform: "uppercase" }}>
                  {c.name}
                </span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* =========================== PRODUCT GRID (shared) =========================== */

function HomeProductCard({ p }) {
  const { has, toggle } = useWishlist();
  const isWished = has(p.id);
  const prices = (p.product_variants ?? []).map((v) => v.price);
  const basePrice = prices.length ? Math.min(...prices) : 0;
  const inStock = (p.product_variants ?? []).some((v) => (v.stock_quantity ?? 1) > 0);
  const imageUrl = p.product_images?.[0]?.image_url ?? "/images/velmora-newseason.webp";

  return (
    <div>
      <div style={{ position: "relative", overflow: "hidden" }} className="prod-card">
        <Link href={`/product/${p.slug}`} style={{ display: "block" }}>
          <img
            src={imageUrl}
            alt={p.name}
            className="prod-img"
            style={{ width: "100%", aspectRatio: "3/4", objectFit: "cover", filter: "grayscale(0.15) sepia(0.05)", transition: "transform 0.8s cubic-bezier(0.16,1,0.3,1)" }}
            loading="lazy"
          />
        </Link>
        {!inStock && (
          <span
            style={{
              position: "absolute", top: 14, left: 14, background: "#A32D2D",
              color: COLORS.ivory, fontFamily: "Inter, sans-serif", fontSize: 10,
              letterSpacing: "0.1em", textTransform: "uppercase", padding: "5px 10px",
            }}
          >
            Sold Out
          </span>
        )}
        <button
          onClick={() => toggle(p.id)}
          aria-label={isWished ? `Remove ${p.name} from wishlist` : `Add ${p.name} to wishlist`}
          aria-pressed={isWished}
          style={{
            position: "absolute", top: 14, right: 14, background: "rgba(247,243,236,0.9)",
            border: "none", borderRadius: "50%", width: 34, height: 34, display: "flex",
            alignItems: "center", justifyContent: "center", cursor: "pointer",
          }}
        >
          <Heart size={15} strokeWidth={1.5} color={COLORS.obsidian} fill={isWished ? COLORS.mocha : "none"} />
        </button>
        <Link
          href={`/product/${p.slug}`}
          className="quick-add"
          style={{
            position: "absolute", left: 14, right: 14, bottom: 14,
            background: COLORS.obsidian, color: COLORS.ivory, border: "none",
            padding: "12px 0", fontFamily: "Inter, sans-serif", fontSize: 11,
            letterSpacing: "0.16em", textTransform: "uppercase", cursor: "pointer",
            textDecoration: "none", textAlign: "center",
            opacity: 0, transform: "translateY(8px)", transition: "opacity 0.35s ease, transform 0.35s ease",
          }}
        >
          View Product
        </Link>
      </div>
      <div style={{ marginTop: 16 }}>
        <Link href={`/product/${p.slug}`} style={{ textDecoration: "none", display: "block" }}>
          <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: COLORS.obsidian, margin: 0 }}>{p.name}</h3>
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: 14, color: COLORS.mocha, margin: "6px 0 10px" }}>{formatPKR(basePrice)}</p>
          <div style={{ display: "flex", gap: 6 }}>
            {(p.product_variants ?? []).slice(0, 5).map((v, i) => (
              <span
                key={`${v.color_name}-${i}`}
                title={v.color_name}
                style={{ width: 14, height: 14, borderRadius: "50%", background: v.color_hex, border: `1px solid ${COLORS.champagne}66` }}
              />
            ))}
          </div>
        </Link>
      </div>
    </div>
  );
}

function ProductSection({ id, eyebrow, title, products, cta, ctaHref, emptyText }) {
  return (
    <section id={id} style={{ background: COLORS.ivory, padding: "120px 32px" }}>
      <Reveal style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", maxWidth: 1320, margin: "0 auto 50px" }} className="section-head">
        <div>
          <Eyebrow>{eyebrow}</Eyebrow>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(32px,4.5vw,48px)", color: COLORS.obsidian, margin: 0 }}>
            {title}
          </h2>
        </div>
        <Link href={ctaHref} style={{ ...outlineBtn(COLORS.obsidian), marginTop: 0, display: "inline-block", textDecoration: "none" }}>
          {cta}
        </Link>
      </Reveal>
      {products.length === 0 ? (
        <p style={{ maxWidth: 1320, margin: "0 auto", fontFamily: "Inter, sans-serif", fontSize: 14, color: COLORS.espresso, opacity: 0.7 }}>
          {emptyText}
        </p>
      ) : (
        <div style={{ maxWidth: 1320, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 28 }} className="prod-grid">
          {products.map((p, i) => (
            <Reveal key={p.id} delay={i * 80}>
              <HomeProductCard p={p} />
            </Reveal>
          ))}
        </div>
      )}
    </section>
  );
}

/* =========================== CINEMATIC PRODUCT STORY =========================== */

function ProductStory() {
  return (
    <section style={{ background: COLORS.blush, padding: "0" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: "82vh" }} className="grid-stack">
        <div style={{ overflow: "hidden" }}>
          <img
            src="/images/satin-evening-dress.webp"
            alt="Satin Evening Dress campaign"
            style={{ width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(0.15) sepia(0.08)" }}
            loading="lazy"
          />
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 60 }}>
          <Reveal style={{ maxWidth: 420 }}>
            <Eyebrow>The Evening Story</Eyebrow>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(34px,4.5vw,52px)", color: COLORS.obsidian, margin: 0, lineHeight: 1.1 }}>
              Satin Evening Dress
            </h2>
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: 15, lineHeight: 1.85, color: COLORS.espresso, marginTop: 24 }}>
              Cut on the bias and finished by hand, this is the piece that
              closes the room. Worn low at the shoulder, it moves the way
              silk should — quietly, and only when you do.
            </p>
           <Link
  href="/collections/evening-edit"
  style={{ ...outlineBtn(COLORS.obsidian), display: "inline-block", textDecoration: "none" }}
>
  Shop the Collection
</Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* =========================== OUR STORY =========================== */

function OurStory() {
  return (
    <section id="about" style={{ background: COLORS.ivory, padding: "150px 32px" }}>
      <div style={{ maxWidth: 1320, margin: "0 auto", display: "grid", gridTemplateColumns: "0.9fr 1.1fr", gap: 60, alignItems: "center" }} className="grid-stack">
        <Reveal>
          <div style={{ overflow: "hidden" }}>
           <img
  src="/images/velmora-ourstory.webp"
  alt="Behind the VELMORA atelier"
 style={{
  width: "100%",
  height: "650px",
  display: "block",
  objectFit: "cover",
  objectPosition: "center",
  filter: "grayscale(0.15) sepia(0.08)"
}}
  loading="lazy"
/>
          </div>
        </Reveal>
        <Reveal delay={150}>
          <Eyebrow>Our Story</Eyebrow>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(32px,4.5vw,48px)", color: COLORS.obsidian, margin: 0 }}>
            Style should feel effortless.
          </h2>
          <div
  style={{
    marginTop: 26,
    display: "flex",
    flexDirection: "column",
    gap: 12,
  }}
>
  {["Thoughtful design.", "Considered details.", "Timeless silhouettes."].map((t) => (
    <p
      key={t}
      style={{
        fontFamily: "Inter, sans-serif",
        fontSize: 16,
        color: COLORS.espresso,
        margin: 0,
        lineHeight: 1.5,
      }}
    >
      {t}
    </p>
  ))}
</div>

<div style={{ marginTop: 34 }}>
 <Link
  href="/about"
  style={{
    ...outlineBtn(COLORS.obsidian),
    marginTop: 0,
    display: "inline-block",
    textDecoration: "none",
    position: "relative",
    zIndex: 2,
  }}
>
  Discover VELMORA
</Link>
</div>
        </Reveal>
      </div>
    </section>
  );
}

/* =========================== FEATURED COLLECTION BANNER =========================== */

function FeaturedBanner() {
  return (
    <section id="collections" style={{ position: "relative", height: "70vh", minHeight: 460, overflow: "hidden" }}>
    <img
  src="/images/velmora-eveningedit.webp"
  alt="The Evening Edit"
  style={{
    width: "100%",
    height: "100%",
    objectFit: "contain",
    objectPosition: "center",
    filter: "grayscale(0.2) sepia(0.1)"
  }}
  loading="lazy"
/>
  
      <div style={{ position: "absolute", inset: 0, background: "rgba(23,21,21,0.4)" }} />
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
        <Reveal>
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: 12, letterSpacing: "0.3em", color: COLORS.champagne, marginBottom: 16 }}>
            FEATURED COLLECTION
          </p>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(38px,6vw,72px)", color: COLORS.ivory, margin: 0 }}>
            The Evening Edit
          </h2>
          <Link
            href="/collections/evening-edit"
            style={{ ...outlineBtn(COLORS.ivory), display: "inline-block", textDecoration: "none" }}
          >
            Explore the Collection
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

/* =========================== BRAND PHILOSOPHY =========================== */

function BrandPhilosophy() {
  const items = [
    { t: "Quality", d: "Fabrics sourced for how they wear, not just how they photograph." },
    { t: "Detail", d: "Every seam, hem and closure considered before it's approved." },
    { t: "Timelessness", d: "Pieces designed to outlast the season they were made for." },
  ];
  return (
    <section style={{ background: COLORS.blush, padding: "130px 32px" }}>
      <Reveal style={{ textAlign: "center", marginBottom: 70, maxWidth: 640, margin: "0 auto 70px" }}>
        <Eyebrow>Philosophy</Eyebrow>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(34px,4.5vw,52px)", color: COLORS.obsidian, margin: 0 }}>
          Crafted with Intention
        </h2>
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 15, color: COLORS.espresso, marginTop: 18 }}>
          We believe in pieces that remain long after the season changes.
        </p>
      </Reveal>
      <div style={{ maxWidth: 1000, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 44 }} className="phil-grid">
        {items.map((it, i) => (
          <Reveal key={it.t} delay={i * 120} style={{ textAlign: "center" }}>
            <span style={{ display: "block", width: 32, height: 1, background: COLORS.mocha, margin: "0 auto 20px" }} />
            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, color: COLORS.obsidian, margin: "0 0 12px" }}>{it.t}</h3>
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: 14, lineHeight: 1.8, color: COLORS.espresso, margin: 0 }}>{it.d}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
function SocialGallery() {
  const shots = [
    { src: "/images/velmora-newseason.webp", alt: "VELMORA new season campaign" },
    { src: "/images/velmora-signature.webp", alt: "VELMORA signature campaign" },
    { src: "/images/velmora-ourstory.webp", alt: "Behind the VELMORA atelier" },
    { src: "/images/velmora-eveningedit.webp", alt: "VELMORA evening campaign" },
    { src: "/images/dresses.webp", alt: "VELMORA dresses" },
    { src: "/images/tops.webp", alt: "VELMORA tops" },
  ];
  return (
    <section style={{ background: COLORS.ivory, padding: "130px 32px" }}>
      <Reveal style={{ textAlign: "center", marginBottom: 50 }}>
        <Eyebrow>@velmora</Eyebrow>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(32px,4.5vw,48px)", color: COLORS.obsidian, margin: 0 }}>
          Follow VELMORA
        </h2>
      </Reveal>
      <div style={{ maxWidth: 1320, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 10 }} className="social-grid">
        {shots.map((s, i) => (
          <Reveal key={s.src} delay={i * 60}>
            <div style={{ overflow: "hidden", aspectRatio: "1/1" }} className="social-card">
              <img
                src={s.src}
                alt={s.alt}
                className="social-img"
                style={{ width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(0.2) sepia(0.06)", transition: "transform 0.7s ease" }}
                loading="lazy"
              />
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}


/* =========================== NEWSLETTER =========================== */

function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(null); // null | "loading" | "ok" | "duplicate" | "error" | "invalid"

  const submit = async (e) => {
    e.preventDefault();
    if (status === "loading") return;
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setStatus("invalid");
      return;
    }
    setStatus("loading");
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("newsletter_subscribers")
        .insert({ email: email.trim().toLowerCase() });
      if (!error) {
        setStatus("ok");
        setEmail("");
      } else if (error.code === "23505") {
        setStatus("duplicate");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <section style={{ background: COLORS.espresso, padding: "130px 32px" }}>
      <Reveal style={{ maxWidth: 560, margin: "0 auto", textAlign: "center" }}>
        <Eyebrow dark>Newsletter</Eyebrow>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(32px,4.5vw,48px)", color: COLORS.ivory, margin: 0 }}>
          Join the VELMORA World
        </h2>
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 15, color: COLORS.blush, marginTop: 16, opacity: 0.9 }}>
          New collections. Private edits. First access.
        </p>
        <form onSubmit={submit} style={{ display: "flex", gap: 10, marginTop: 34, justifyContent: "center", flexWrap: "wrap" }}>
          <label htmlFor="nl-email" className="sr-only" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden" }}>Email address</label>
          <input
            id="nl-email"
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setStatus(null); }}
            placeholder="your@email.com"
            disabled={status === "loading"}
            style={{
              background: "transparent",
              border: `1px solid ${COLORS.champagne}66`,
              padding: "14px 18px",
              color: COLORS.ivory,
              fontFamily: "Inter, sans-serif",
              fontSize: 14,
              minWidth: 260,
              outline: "none",
            }}
          />
          <button type="submit" disabled={status === "loading"} style={{ ...outlineBtn(COLORS.champagne), marginTop: 0, opacity: status === "loading" ? 0.6 : 1 }}>
            {status === "loading" ? "Subscribing…" : "Subscribe"}
          </button>
        </form>
        <div style={{ minHeight: 22, marginTop: 12 }} role="status" aria-live="polite">
          {status === "ok" && <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: COLORS.champagne }}>You're on the list. Welcome to VELMORA.</p>}
          {status === "duplicate" && <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: COLORS.champagne }}>You're already subscribed — no need to sign up twice.</p>}
          {status === "invalid" && <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: "#E8A0A0" }}>Enter a valid email address.</p>}
          {status === "error" && <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: "#E8A0A0" }}>Something went wrong. Please try again.</p>}
        </div>
      </Reveal>
    </section>
  );
}

/* =========================== FINAL CTA =========================== */

function FinalCTA() {
  return (
    <section style={{ background: COLORS.obsidian, padding: "160px 32px", textAlign: "center" }}>
      <Reveal>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(46px,7vw,88px)", color: COLORS.ivory, margin: 0, letterSpacing: "0.05em" }}>
          VELMORA
        </h2>
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, letterSpacing: "0.2em", color: COLORS.champagne, marginTop: 14, textTransform: "uppercase" }}>
          Elegance, Redefined.
        </p>
        <Link
          href="/collections"
          style={{ ...outlineBtn(COLORS.ivory), marginTop: 40, display: "inline-block", textDecoration: "none" }}
        >
          Shop the Collection
        </Link>
      </Reveal>
    </section>
  );
}

/* =========================== FOOTER =========================== */

function Footer() {
  return (
    <footer id="contact" style={{ background: COLORS.espresso, padding: "70px 32px 34px" }}>
      <div style={{ maxWidth: 1320, margin: "0 auto", display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1fr", gap: 40 }} className="footer-grid">
        <div>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, color: COLORS.ivory, letterSpacing: "0.14em" }}>VELMORA</span>
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: COLORS.blush, opacity: 0.75, marginTop: 14, maxWidth: 260, lineHeight: 1.7 }}>
            A considered clothing house for elegant, effortless dressing.
          </p>
        </div>
        <FooterCol title="Shop" links={[
          { label: "Dresses", href: "/shop?category=dresses" },
          { label: "Tops", href: "/shop?category=tops" },
          { label: "Bottoms", href: "/shop?category=bottoms" },
          { label: "Bags", href: "/shop?category=bags" },
          { label: "Shop All", href: "/shop" },
        ]} />
        <FooterCol title="Company" links={[
          { label: "About", href: "/about" },
          { label: "Our Story", href: "/about" },
          { label: "Collections", href: "/collections" },
          { label: "Contact", href: "/contact" },
        ]} />
        <FooterCol title="Support" links={[
          { label: "FAQ", href: "/contact" },
          { label: "Shipping & Returns", href: "/contact" },
          { label: "My Orders", href: "/orders" },
          { label: "Wishlist", href: "/wishlist" },
        ]} />
      </div>
      <div style={{ maxWidth: 1320, margin: "50px auto 0", borderTop: `1px solid ${COLORS.champagne}33`, paddingTop: 22, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <span style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: COLORS.blush, opacity: 0.6 }}>© 2026 VELMORA. All rights reserved.</span>
        <span style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: COLORS.blush, opacity: 0.6 }}>hello@velmora.com</span>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }) {
  return (
    <div>
      <p style={{ fontFamily: "Inter, sans-serif", fontSize: 12, letterSpacing: "0.16em", color: COLORS.champagne, textTransform: "uppercase", marginBottom: 18 }}>{title}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {links.map((l) => (
          <Link key={l.label} href={l.href} style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: COLORS.blush, opacity: 0.85, textDecoration: "none" }}>{l.label}</Link>
        ))}
      </div>
    </div>
  );
}

/* =========================== ROOT =========================== */

export default function VelmoraHome({ newArrivals = [], bestSellers = [] }) {
  const [navSolid, setNavSolid] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { count: cartCount } = useCart();
  const { has: wishHas } = useWishlist();
  const wishCount = newArrivals.concat(bestSellers).filter((p) => wishHas(p.id)).length;

  useEffect(() => {
    const onScroll = () => setNavSolid(window.scrollY > window.innerHeight * 0.7);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div style={{ background: COLORS.ivory, width: "100%", overflowX: "hidden" }}>
      <style>{`
        * { box-sizing: border-box; }
        html, body { margin: 0; }
        a:focus-visible, button:focus-visible, input:focus-visible {
          outline: 2px solid ${COLORS.mocha};
          outline-offset: 2px;
        }
        input::placeholder { color: ${COLORS.blush}; opacity: 0.6; }
        .cat-card:hover .cat-img,
.prod-card:hover .prod-img,
.social-card:hover .social-img {
  transform: scale(1.06);
}

.cat-card:hover {
  transform: translateY(-4px);
}

.prod-card:hover {
  transform: translateY(-3px);
}

.social-card:hover {
  transform: translateY(-2px);
}

.prod-card:hover .quick-add {
  opacity: 1 !important;
  transform: translateY(0) !important;
}
.quick-add {
  transition:
    opacity 0.35s ease,
    transform 0.35s ease,
    background 0.35s ease;
}

.quick-add:hover {
  background: #765C4D !important;
  transform: translateY(-2px) !important;
}
button:hover {
  opacity: 0.8;
}

a:hover {
  opacity: 0.75;
}
  .desktop-nav a {
  position: relative;
  transition: opacity 0.3s ease;
}

.desktop-nav a::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: -7px;
  width: 100%;
  height: 1px;
  background: currentColor;
  transform: scaleX(0);
  transform-origin: center;
  transition: transform 0.35s ease;
}

.desktop-nav a:hover {
  opacity: 1;
}

.desktop-nav a:hover::after {
  transform: scaleX(1);
}
  button {
  transition:
    background 0.35s ease,
    color 0.35s ease,
    border-color 0.35s ease,
    transform 0.35s ease,
    opacity 0.35s ease;
}

button:hover {
  opacity: 1;
  transform: translateY(-2px);
}
  /* Navbar icon hover */
header button:hover,
header a[aria-label="Search"]:hover,
header a[aria-label^="Wishlist"]:hover,
header a[aria-label^="Bag"]:hover {
  transform: translateY(-2px);
  opacity: 1;
}

header svg {
  transition: transform 0.3s ease;
}

header button:hover svg,
header a:hover svg {
  transform: scale(1.12);
}
  /* ================= FOOTER HOVER ================= */

footer a {
  position: relative;
  display: inline-block;
  width: fit-content;
  transition:
    color 0.3s ease,
    opacity 0.3s ease,
    transform 0.3s ease;
}

footer a::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: -4px;
  width: 100%;
  height: 1px;
  background: #C9A878;
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.35s ease;
}

footer a:hover {
  opacity: 1 !important;
  color: #C9A878 !important;
  transform: translateX(3px);
}

footer a:hover::after {
  transform: scaleX(1);
}
        @media (max-width: 900px) {
        
          .desktop-nav { display: none !important; }
          .lg-hide { display: flex !important; }
          .lg-only { display: none !important; }
          .grid-stack { grid-template-columns: 1fr !important; }
          .cat-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .prod-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 18px !important; }
          .social-grid { grid-template-columns: repeat(3, 1fr) !important; }
          .phil-grid { grid-template-columns: 1fr !important; gap: 50px !important; }
          .footer-grid { grid-template-columns: 1fr 1fr !important; gap: 30px !important; }
          .section-head { flex-direction: column !important; align-items: flex-start !important; gap: 20px; }
          .new-season-image {
  height: 520px !important;
  object-position: center center !important;
}

.grid-stack {
  gap: 45px !important;
}
        }
@media (max-width: 600px) {
  .new-season-image {
    height: 480px !important;
  }
}
       .signature-image {
  width: 100%;
  height: auto;
  display: block;
  object-fit: contain;
}

/* Mobile: the landscape image alone is too short for the overlay copy,
   so on small screens it fills a taller section (cover-crop) and the
   copy gets fitted padding instead of overflowing/clipping. */
@media (max-width: 900px) {
  .signature-section {
    min-height: 520px;
    display: flex;
    align-items: stretch;
  }
  .signature-section .signature-image {
    position: absolute;
    inset: 0;
    height: 100%;
    width: 100%;
    object-fit: cover;
    object-position: center;
  }
  .signature-section .signature-copy {
    padding: 56px 24px !important;
  }
}

@media (max-width: 600px) {
  .signature-section {
    min-height: 470px;
  }
  .signature-section .signature-copy {
    padding: 48px 20px !important;
  }
}
        @media (prefers-reduced-motion: reduce) {
          .scroll-line { animation: none !important; }
          * { transition-duration: 0.01ms !important; }
        }
        .scroll-line { animation: scrollPulse 2.2s ease-in-out infinite; }
        /* ================= HERO ANIMATIONS ================= */

.hero-eyebrow {
  animation: heroEyebrowReveal 1.5s cubic-bezier(0.16, 1, 0.3, 1) 0.15s both;
  backface-visibility: hidden;
  -webkit-font-smoothing: antialiased;
}

.hero-title {
  animation: heroTitleReveal 1.8s cubic-bezier(0.22, 1, 0.36, 1) 0.35s both;
}

.hero-subtitle {
  animation: heroSubtitleReveal 1.6s cubic-bezier(0.16, 1, 0.3, 1) 0.65s both;
  backface-visibility: hidden;
  -webkit-font-smoothing: antialiased;
}

.hero-scroll {
  animation: heroScrollReveal 1.3s cubic-bezier(0.22, 1, 0.36, 1) 1.15s both;
}
/* Small heading animation */
@keyframes heroEyebrowReveal {
  0% {
    opacity: 0;
    transform: translateY(14px);
  }

  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
/* VELMORA animation */

@keyframes heroTitleReveal {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Tagline animation */
@keyframes heroSubtitleReveal {
  0% {
    opacity: 0;
    transform: translateY(18px);
  }

  100% {
    opacity: 0.85;
    transform: translateY(0);
  }
}

/* Scroll indicator animation */
@keyframes heroScrollReveal {
  from {
    opacity: 0;
    transform: translate3d(0, 12px, 0);
  }

  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}
        @keyframes scrollPulse { 0%,100% { opacity: 0.35; } 50% { opacity: 1; } }
      `}</style>

      <Navbar solid={navSolid} onMenu={() => setMenuOpen(true)} cartCount={cartCount} wishCount={wishCount} />
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />

      <Hero />
      <NewSeasonSection />
      <SignatureEdit />
      <CategorySection />
      <ProductSection
        id="new-arrivals"
        eyebrow="Just In"
        title="New Arrivals"
        products={newArrivals}
        cta="View All"
        ctaHref="/shop?sort=newest"
        emptyText="New pieces are on their way — check back soon."
      />
      <ProductStory />
      <OurStory />
      <FeaturedBanner />
      <ProductSection
        id="best-sellers"
        eyebrow="Loved"
        title="Best Sellers"
        products={bestSellers}
        cta="Shop All"
        ctaHref="/shop"
        emptyText="Our most-loved pieces are being restocked — check back soon."
      />
      <BrandPhilosophy />
      <SocialGallery />
      <Newsletter />
      <FinalCTA />
      <Footer />
    </div>
  );
}
