"use client";

import React, { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const COLORS = {
  ivory: "#F7F3EC",
  obsidian: "#171515",
  espresso: "#3A2926",
  mocha: "#765C4D",
  champagne: "#C9A878",
  blush: "#E8D8D1",
};

type SendStatus = "idle" | "sending" | "sent" | "error";

export default function ContactPage() {
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState<SendStatus>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  function update(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "sending") return;
    setStatus("sending");
    setErrorMsg(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("contact_messages").insert({
        first_name: form.firstName.trim(),
        last_name: form.lastName.trim(),
        email: form.email.trim(),
        subject: form.subject.trim(),
        message: form.message.trim(),
      });
      if (error) throw error;
      setStatus("sent");
      setForm({ firstName: "", lastName: "", email: "", subject: "", message: "" });
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err?.message ?? "Could not send your message. Please try again.");
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: COLORS.ivory,
        color: COLORS.obsidian,
      }}
    >
      {/* HERO */}
      <section
        style={{
          background: COLORS.obsidian,
          minHeight: "58vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "120px 32px 90px",
        }}
      >
        <div style={{ maxWidth: 800 }}>
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
            Get in Touch
          </p>

          <h1
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(58px, 10vw, 120px)",
              fontWeight: 500,
              lineHeight: 0.95,
              color: COLORS.ivory,
              margin: 0,
            }}
          >
            Contact
            <br />
            VELMORA
          </h1>

          <p
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: 15,
              lineHeight: 1.8,
              color: COLORS.blush,
              maxWidth: 520,
              margin: "30px auto 0",
              opacity: 0.9,
            }}
          >
            Questions about your order, our collections, or simply want to
            say hello? We'd love to hear from you.
          </p>
        </div>
      </section>

      {/* CONTACT CONTENT */}
      <section
        style={{
          padding: "130px 32px",
          background: COLORS.ivory,
        }}
      >
        <div
          style={{
            maxWidth: 1150,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "0.8fr 1.2fr",
            gap: 90,
            alignItems: "start",
          }}
          className="contact-grid"
        >
          {/* CONTACT DETAILS */}
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
                We'd Love to Hear From You
              </span>
            </div>

            <h2
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(38px, 5vw, 58px)",
                fontWeight: 500,
                lineHeight: 1.05,
                margin: 0,
              }}
            >
              Let's start a conversation.
            </h2>

            <p
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: 15,
                lineHeight: 1.9,
                color: COLORS.espresso,
                marginTop: 26,
              }}
            >
              Our team is here to help with anything you need. Send us a
              message and we'll get back to you as soon as possible.
            </p>

            <div
              style={{
                marginTop: 45,
                display: "flex",
                flexDirection: "column",
                gap: 28,
              }}
            >
              <div>
                <span
                  style={{
                    display: "block",
                    fontFamily: "Inter, sans-serif",
                    fontSize: 11,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: COLORS.mocha,
                    marginBottom: 8,
                  }}
                >
                  Email
                </span>

                <a
                  href="mailto:hello@velmora.com"
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: 23,
                    color: COLORS.obsidian,
                    textDecoration: "none",
                  }}
                >
                  hello@velmora.com
                </a>
              </div>

              <div>
                <span
                  style={{
                    display: "block",
                    fontFamily: "Inter, sans-serif",
                    fontSize: 11,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: COLORS.mocha,
                    marginBottom: 8,
                  }}
                >
                  Customer Care
                </span>

                <p
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: 14,
                    color: COLORS.espresso,
                    lineHeight: 1.7,
                    margin: 0,
                  }}
                >
                  Monday - Saturday
                  <br />
                  10:00 AM - 7:00 PM
                </p>
              </div>

              <div>
                <span
                  style={{
                    display: "block",
                    fontFamily: "Inter, sans-serif",
                    fontSize: 11,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: COLORS.mocha,
                    marginBottom: 8,
                  }}
                >
                  Follow
                </span>

                <p
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: 22,
                    color: COLORS.obsidian,
                    margin: 0,
                  }}
                >
                  @velmora
                </p>
              </div>
            </div>
          </div>

          {/* FORM */}
          <div
            style={{
              background: COLORS.blush,
              padding: "50px 45px",
            }}
          >
            {status === "sent" ? (
              <div
                style={{
                  minHeight: 430,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                }}
              >
                <span
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: 54,
                    color: COLORS.mocha,
                  }}
                >
                  ✓
                </span>

                <h2
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: 40,
                    fontWeight: 500,
                    margin: "15px 0 10px",
                  }}
                >
                  Message Sent
                </h2>

                <p
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: 14,
                    lineHeight: 1.7,
                    color: COLORS.espresso,
                    maxWidth: 360,
                  }}
                >
                  Thank you for reaching out. Our team will get back to you
                  shortly.
                </p>

                <button
                  type="button"
                  onClick={() => setStatus("idle")}
                  style={{
                    marginTop: 26,
                    background: "transparent",
                    border: `1px solid ${COLORS.mocha}`,
                    color: COLORS.obsidian,
                    padding: "11px 22px",
                    fontFamily: "Inter, sans-serif",
                    fontSize: 11,
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    cursor: "pointer",
                  }}
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <h2
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: 38,
                    fontWeight: 500,
                    margin: "0 0 35px",
                  }}
                >
                  Send us a message
                </h2>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 20,
                  }}
                  className="contact-name-grid"
                >
                  <Field label="First Name" name="firstName" required value={form.firstName} onChange={(v) => update("firstName", v)} />
                  <Field label="Last Name" name="lastName" required value={form.lastName} onChange={(v) => update("lastName", v)} />
                </div>

                <Field label="Email" name="email" type="email" required value={form.email} onChange={(v) => update("email", v)} />

                <Field label="Subject" name="subject" required value={form.subject} onChange={(v) => update("subject", v)} />

                <label
                  style={{
                    display: "block",
                    fontFamily: "Inter, sans-serif",
                    fontSize: 12,
                    color: COLORS.espresso,
                    marginTop: 20,
                  }}
                >
                  Message

                  <textarea
                    name="message"
                    required
                    rows={6}
                    value={form.message}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => update("message", e.target.value)}
                    style={{
                      width: "100%",
                      display: "block",
                      marginTop: 8,
                      padding: "13px 14px",
                      border: `1px solid ${COLORS.mocha}55`,
                      background: COLORS.ivory,
                      color: COLORS.obsidian,
                      fontFamily: "Inter, sans-serif",
                      fontSize: 14,
                      resize: "vertical",
                      outline: "none",
                    }}
                  />
                </label>

                {status === "error" && (
                  <p role="alert" style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: "#A32D2D", marginTop: 14 }}>
                    {errorMsg ?? "Could not send your message. Please try again."}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={status === "sending"}
                  style={{
                    width: "100%",
                    marginTop: 28,
                    background: COLORS.obsidian,
                    border: "1px solid transparent",
                    color: COLORS.ivory,
                    padding: "15px 20px",
                    fontFamily: "Inter, sans-serif",
                    fontSize: 11,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    cursor: status === "sending" ? "default" : "pointer",
                    opacity: status === "sending" ? 0.7 : 1,
                  }}
                >
                  {status === "sending" ? "Sending…" : "Send Message"}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* FOOTER CTA */}
      <section
        style={{
          background: COLORS.espresso,
          padding: "100px 32px",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: 11,
            letterSpacing: "0.25em",
            color: COLORS.champagne,
            textTransform: "uppercase",
          }}
        >
          VELMORA
        </p>

        <h2
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "clamp(38px, 6vw, 64px)",
            fontWeight: 500,
            color: COLORS.ivory,
            margin: "18px 0 0",
          }}
        >
          Elegance, Redefined.
        </h2>
      </section>

      <style>{`
        @media (max-width: 800px) {
          .contact-grid {
            grid-template-columns: 1fr !important;
            gap: 60px !important;
          }

          .contact-name-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </main>
  );
}

function Field({
  label,
  name,
  type = "text",
  required = false,
  value,
  onChange,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label
      style={{
        display: "block",
        fontFamily: "Inter, sans-serif",
        fontSize: 12,
        color: COLORS.espresso,
        marginTop: 20,
      }}
    >
      {label}

      <input
        name={name}
        type={type}
        required={required}
        value={value}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
        style={{
          width: "100%",
          display: "block",
          marginTop: 8,
          padding: "13px 14px",
          border: `1px solid ${COLORS.mocha}55`,
          background: COLORS.ivory,
          color: COLORS.obsidian,
          fontFamily: "Inter, sans-serif",
          fontSize: 14,
          outline: "none",
        }}
      />
    </label>
  );
}