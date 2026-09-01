"use client";

import React from "react";

const COLORS = {
  ivory: "#F7F3EC",
  obsidian: "#171515",
  espresso: "#3A2926",
  mocha: "#765C4D",
  champagne: "#C9A878",
  blush: "#E8D8D1",
};

export default function AboutPage() {
  return (
    <main
      style={{
        background: COLORS.ivory,
        color: COLORS.obsidian,
        minHeight: "100vh",
      }}
    >
      {/* HERO */}
      <section
        style={{
          minHeight: "75vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "120px 32px 90px",
          background: COLORS.obsidian,
        }}
      >
        <div style={{ maxWidth: 900 }}>
          <p
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: 12,
              letterSpacing: "0.3em",
              color: COLORS.champagne,
              textTransform: "uppercase",
              marginBottom: 24,
            }}
          >
            The VELMORA Story
          </p>

          <h1
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(58px, 10vw, 130px)",
              fontWeight: 500,
              lineHeight: 0.95,
              letterSpacing: "0.04em",
              color: COLORS.ivory,
              margin: 0,
            }}
          >
            Elegance,
            <br />
            Redefined.
          </h1>

          <p
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: 15,
              lineHeight: 1.8,
              color: COLORS.blush,
              maxWidth: 560,
              margin: "32px auto 0",
              opacity: 0.9,
            }}
          >
            VELMORA was created around a simple idea - that getting dressed
            should feel effortless, intentional, and entirely your own.
          </p>
        </div>
      </section>

      {/* OUR STORY */}
      <section
        style={{
          padding: "140px 32px",
          background: COLORS.ivory,
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "0.9fr 1.1fr",
            gap: 80,
            alignItems: "center",
          }}
          className="about-story-grid"
        >
          <div>
            <div
              style={{
                width: "100%",
                aspectRatio: "4 / 5",
                background:
                  "linear-gradient(135deg, #765C4D, #3A2926)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "clamp(50px, 7vw, 90px)",
                  color: COLORS.ivory,
                  letterSpacing: "0.08em",
                }}
              >
                V
              </span>
            </div>
          </div>

          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 22,
              }}
            >
              <span
                style={{
                  width: 32,
                  height: 1,
                  background: COLORS.champagne,
                }}
              />

              <span
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: 12,
                  letterSpacing: "0.22em",
                  color: COLORS.mocha,
                  textTransform: "uppercase",
                }}
              >
                Our Story
              </span>
            </div>

            <h2
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(38px, 5vw, 62px)",
                fontWeight: 500,
                lineHeight: 1.05,
                margin: 0,
                color: COLORS.obsidian,
              }}
            >
              Style should feel effortless.
            </h2>

            <div
              style={{
                marginTop: 28,
                display: "flex",
                flexDirection: "column",
                gap: 18,
              }}
            >
              <p
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: 15,
                  lineHeight: 1.9,
                  color: COLORS.espresso,
                  margin: 0,
                }}
              >
                VELMORA is a considered clothing house built around quiet
                confidence. We believe clothing doesn't need to demand
                attention to make an impression.
              </p>

              <p
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: 15,
                  lineHeight: 1.9,
                  color: COLORS.espresso,
                  margin: 0,
                }}
              >
                Every silhouette is designed with balance in mind - refined
                enough for an evening, effortless enough for everyday life.
              </p>

              <p
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: 15,
                  lineHeight: 1.9,
                  color: COLORS.espresso,
                  margin: 0,
                }}
              >
                Our world is built around warm neutrals, thoughtful details,
                and pieces designed to remain relevant beyond a single
                season.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PHILOSOPHY */}
      <section
        style={{
          background: COLORS.blush,
          padding: "130px 32px",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: 700, margin: "0 auto 70px" }}>
          <p
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: 12,
              letterSpacing: "0.3em",
              color: COLORS.mocha,
              textTransform: "uppercase",
              marginBottom: 18,
            }}
          >
            What We Believe
          </p>

          <h2
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(40px, 5vw, 58px)",
              fontWeight: 500,
              margin: 0,
            }}
          >
            Crafted with Intention
          </h2>
        </div>

        <div
          style={{
            maxWidth: 1050,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 50,
          }}
          className="about-values-grid"
        >
          {[
            {
              number: "01",
              title: "Quality",
              text: "Fabrics and finishes chosen for how they feel, wear, and evolve.",
            },
            {
              number: "02",
              title: "Detail",
              text: "Every silhouette is refined through thoughtful proportions and considered details.",
            },
            {
              number: "03",
              title: "Timelessness",
              text: "Pieces designed to live beyond trends and remain part of your wardrobe.",
            },
          ].map((item) => (
            <div key={item.number}>
              <span
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 24,
                  color: COLORS.champagne,
                }}
              >
                {item.number}
              </span>

              <h3
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 28,
                  fontWeight: 500,
                  margin: "16px 0 12px",
                }}
              >
                {item.title}
              </h3>

              <p
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: 14,
                  lineHeight: 1.8,
                  color: COLORS.espresso,
                  margin: 0,
                }}
              >
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CLOSING */}
      <section
        style={{
          background: COLORS.espresso,
          padding: "150px 32px",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: 12,
            letterSpacing: "0.3em",
            color: COLORS.champagne,
            textTransform: "uppercase",
            marginBottom: 20,
          }}
        >
          Welcome to VELMORA
        </p>

        <h2
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "clamp(44px, 7vw, 82px)",
            fontWeight: 500,
            color: COLORS.ivory,
            margin: 0,
          }}
        >
          Dress with intention.
        </h2>

        <p
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: 14,
            color: COLORS.blush,
            marginTop: 20,
          }}
        >
          Elegance, Redefined.
        </p>
      </section>

      <style>{`
        @media (max-width: 800px) {
          .about-story-grid {
            grid-template-columns: 1fr !important;
            gap: 50px !important;
          }

          .about-values-grid {
            grid-template-columns: 1fr !important;
            gap: 45px !important;
          }
        }
      `}</style>
    </main>
  );
}