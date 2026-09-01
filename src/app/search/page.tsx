"use client";

import { useState } from "react";
import Link from "next/link";

export default function SearchPage() {
  const [query, setQuery] = useState("");

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#F7F3EC",
        padding: "140px 24px 80px",
      }}
    >
      <div
        style={{
          maxWidth: 900,
          margin: "0 auto",
        }}
      >
        {/* Breadcrumb */}
        <div
          style={{
            marginBottom: 45,
            fontFamily: "Inter, sans-serif",
            fontSize: 11,
            letterSpacing: "0.1em",
          }}
        >
          <Link
            href="/"
            style={{
              color: "#765C4D",
              textDecoration: "none",
            }}
          >
            HOME
          </Link>

          <span style={{ color: "#B8A49A", margin: "0 10px" }}>
            /
          </span>

          <span style={{ color: "#171515" }}>
            SEARCH
          </span>
        </div>

        {/* Heading */}
        <div style={{ marginBottom: 45 }}>
          <p
            style={{
              margin: "0 0 12px",
              fontFamily: "Inter, sans-serif",
              fontSize: 11,
              letterSpacing: "0.3em",
              color: "#765C4D",
            }}
          >
            VELMORA
          </p>

          <h1
            style={{
              margin: 0,
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(46px, 7vw, 72px)",
              fontWeight: 400,
              lineHeight: 0.95,
              color: "#171515",
            }}
          >
            Search
          </h1>

          <p
            style={{
              margin: "18px 0 0",
              fontFamily: "Inter, sans-serif",
              fontSize: 13,
              color: "#765C4D",
            }}
          >
            Discover pieces from the VELMORA collection.
          </p>
        </div>

        {/* Search Box */}
        <div
          style={{
            display: "flex",
            borderBottom: "1px solid #171515",
            paddingBottom: 12,
            marginBottom: 50,
          }}
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products..."
            autoFocus
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              background: "transparent",
              fontFamily: "Inter, sans-serif",
              fontSize: 18,
              color: "#171515",
            }}
          />

          <span
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: 10,
              letterSpacing: "0.12em",
              color: "#765C4D",
              textTransform: "uppercase",
            }}
          >
            {query ? "Searching" : "Type to search"}
          </span>
        </div>

        {/* Empty State */}
        {!query && (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              border: "1px solid #E8D8D1",
              background: "#fff",
            }}
          >
            <p
              style={{
                margin: "0 0 12px",
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 28,
                color: "#171515",
              }}
            >
              What are you looking for?
            </p>

            <p
              style={{
                margin: 0,
                fontFamily: "Inter, sans-serif",
                fontSize: 12,
                color: "#9A8980",
              }}
            >
              Search for dresses, collections, or other VELMORA pieces.
            </p>
          </div>
        )}

        {/* Search State */}
        {query && (
          <div
            style={{
              padding: "40px 20px",
              textAlign: "center",
              border: "1px solid #E8D8D1",
              background: "#fff",
            }}
          >
            <p
              style={{
                margin: "0 0 10px",
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 26,
                color: "#171515",
              }}
            >
              Searching for “{query}”
            </p>

            <p
              style={{
                margin: 0,
                fontFamily: "Inter, sans-serif",
                fontSize: 12,
                color: "#9A8980",
              }}
            >
              Product search results will appear here.
            </p>
          </div>
        )}

        {/* Back to Shop */}
        <div
          style={{
            marginTop: 40,
            textAlign: "center",
          }}
        >
          <Link
            href="/shop"
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: 11,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#765C4D",
              textDecoration: "none",
            }}
          >
            Continue Shopping →
          </Link>
        </div>
      </div>
    </main>
  );
}