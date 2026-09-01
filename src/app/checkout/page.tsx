"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart, type CartItem } from "@/lib/cart/CartContext";
import { createOrder } from "@/lib/checkout/createOrder";

const formatPKR = (n: number) => `Rs. ${n.toLocaleString("en-PK")}`;
const FREE_SHIPPING_THRESHOLD = 10000;
const SHIPPING_FLAT_RATE = 350;
const STEPS = ["Contact", "Shipping", "Delivery", "Payment"] as const;

interface FormState {
  email: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  delivery: "standard" | "express";
}

export default function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({
    email: "", fullName: "", phone: "", address: "", city: "", postalCode: "", delivery: "standard",
  });

  const shipping = form.delivery === "express" ? SHIPPING_FLAT_RATE * 2
    : subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT_RATE;
  const total = subtotal + shipping;

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function validateStep(): string | null {
    if (step === 0 && (!form.email || !form.fullName)) return "Enter your name and email to continue.";
    if (step === 1 && (!form.address || !form.city)) return "Enter your shipping address and city to continue.";
    return null;
  }

  function handleNext() {
    const validationError = validateStep();
    if (validationError) { setError(validationError); return; }
    setError(null);
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  async function handlePlaceOrder() {
    if (items.length === 0) { setError("Your bag is empty."); return; }
    setSubmitting(true);
    setError(null);
    try {
      const orderId = await createOrder(
        {
          subtotal,
          shipping_amount: shipping,
          total_amount: total,
          shipping_name: form.fullName,
          shipping_email: form.email,
          shipping_phone: form.phone || undefined,
          shipping_address: form.address,
          city: form.city,
          postal_code: form.postalCode || undefined,
        },
        items.map((i: CartItem) => ({
          variant_id: i.variant_id,
          product_name: i.product_name,
          quantity: i.quantity,
        }))
      );
      clear();
      router.push(`/order-confirmation/${orderId}`);
    } catch (e: any) {
      setError(e?.message ?? "Something went wrong placing your order. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div style={{ background: "#F7F3EC", minHeight: "100vh", padding: "140px 32px 100px" }}>
      <div style={{ maxWidth: 960, margin: "0 auto", display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 60 }} className="velmora-stack-2">
        <div>
          <ol style={{ display: "flex", gap: 18, listStyle: "none", padding: 0, marginBottom: 40 }}>
            {STEPS.map((s, i) => (
              <li
                key={s}
                style={{
                  fontFamily: "Inter, sans-serif", fontSize: 12, letterSpacing: "0.1em",
                  textTransform: "uppercase", color: i <= step ? "#171515" : "#3A292666",
                  fontWeight: i === step ? 600 : 400,
                }}
              >
                {s}
              </li>
            ))}
          </ol>

          {step === 0 && (
            <Fieldset legend="Contact Information">
              <Field label="Full name" value={form.fullName} onChange={(v) => update("fullName", v)} required />
              <Field label="Email" type="email" value={form.email} onChange={(v) => update("email", v)} required />
              <Field label="Phone" type="tel" value={form.phone} onChange={(v) => update("phone", v)} />
            </Fieldset>
          )}

          {step === 1 && (
            <Fieldset legend="Shipping Address">
              <Field label="Address" value={form.address} onChange={(v) => update("address", v)} required />
              <Field label="City" value={form.city} onChange={(v) => update("city", v)} required />
              <Field label="Postal code" value={form.postalCode} onChange={(v) => update("postalCode", v)} />
            </Fieldset>
          )}

          {step === 2 && (
            <Fieldset legend="Delivery">
              {(["standard", "express"] as const).map((opt) => (
                <label key={opt} style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: "Inter, sans-serif", fontSize: 14, color: "#171515", marginBottom: 12 }}>
                  <input
                    type="radio"
                    name="delivery"
                    checked={form.delivery === opt}
                    onChange={() => update("delivery", opt)}
                  />
                  {opt === "standard" ? "Standard (3–5 days)" : "Express (1–2 days)"} —{" "}
                  {opt === "standard"
                    ? (subtotal >= FREE_SHIPPING_THRESHOLD ? "Free" : formatPKR(SHIPPING_FLAT_RATE))
                    : formatPKR(SHIPPING_FLAT_RATE * 2)}
                </label>
              ))}
            </Fieldset>
          )}

          {step === 3 && (
            <Fieldset legend="Payment">
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: 14, lineHeight: 1.8, color: "#3A2926" }}>
                A payment gateway isn't connected yet. Placing your order now will create it with{" "}
                <strong>payment_status = pending</strong> — the checkout flow, order record, and stock
                reservation are fully live; only the card/payment step is pending integration
                (e.g. Stripe), which can be added here without changing anything upstream.
              </p>
            </Fieldset>
          )}

          {error && (
            <p role="alert" style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: "#A32D2D", marginTop: 16 }}>
              {error}
            </p>
          )}

          <div style={{ display: "flex", gap: 12, marginTop: 30 }}>
            {step > 0 && (
              <button onClick={() => setStep((s) => s - 1)} style={secondaryBtn}>Back</button>
            )}
            {step < STEPS.length - 1 ? (
              <button onClick={handleNext} style={primaryBtn}>Continue</button>
            ) : (
              <button onClick={handlePlaceOrder} disabled={submitting} style={{ ...primaryBtn, opacity: submitting ? 0.6 : 1 }}>
                {submitting ? "Placing Order…" : "Place Order"}
              </button>
            )}
          </div>
        </div>

        <div style={{ background: "#E8D8D1", padding: 28, height: "fit-content" }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, margin: "0 0 18px" }}>Order Summary</h2>
          {items.map((i: CartItem) => (
            <div key={i.variant_id} style={{ display: "flex", justifyContent: "space-between", fontFamily: "Inter, sans-serif", fontSize: 13, marginBottom: 8 }}>
              <span>{i.product_name} ({i.color_name}/{i.size}) × {i.quantity}</span>
              <span>{formatPKR(i.unit_price * i.quantity)}</span>
            </div>
          ))}
          <div style={{ borderTop: "1px solid #17151533", margin: "14px 0" }} />
          <SummaryRow label="Subtotal" value={formatPKR(subtotal)} />
          <SummaryRow label="Shipping" value={shipping === 0 ? "Free" : formatPKR(shipping)} />
          <SummaryRow label="Total" value={formatPKR(total)} bold />
        </div>
      </div>
    </div>
  );
}

function Fieldset({ legend, children }: { legend: string; children: React.ReactNode }) {
  return (
    <fieldset style={{ border: "none", padding: 0, margin: 0 }}>
      <legend style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, color: "#171515", marginBottom: 20, padding: 0 }}>
        {legend}
      </legend>
      {children}
    </fieldset>
  );
}

function Field({
  label, value, onChange, type = "text", required = false,
}: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean }) {
  return (
    <label style={{ display: "block", marginBottom: 16, fontFamily: "Inter, sans-serif", fontSize: 12, color: "#3A2926" }}>
      {label}{required ? " *" : ""}
      <input
        type={type}
        value={value}
        required={required}
        onChange={(e: any) => onChange(e.target.value)}
        style={{
          display: "block", width: "100%", marginTop: 6, padding: "11px 12px",
          fontFamily: "Inter, sans-serif", fontSize: 14, border: "1px solid #765C4D66",
          background: "#F7F3EC", color: "#171515",
        }}
      />
    </label>
  );
}

function SummaryRow({ label, value, bold = false }: { label: string; value: string; bold?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
      <span style={{ fontFamily: "Inter, sans-serif", fontSize: bold ? 15 : 13, fontWeight: bold ? 600 : 400 }}>{label}</span>
      <span style={{ fontFamily: "Inter, sans-serif", fontSize: bold ? 15 : 13, fontWeight: bold ? 600 : 400 }}>{value}</span>
    </div>
  );
}

const primaryBtn: React.CSSProperties = {
  background: "#171515", color: "#F7F3EC", border: "none", padding: "15px 34px",
  fontFamily: "Inter, sans-serif", fontSize: 12, letterSpacing: "0.16em", textTransform: "uppercase", cursor: "pointer",
};

const secondaryBtn: React.CSSProperties = {
  background: "transparent", color: "#171515", border: "1px solid #171515", padding: "15px 34px",
  fontFamily: "Inter, sans-serif", fontSize: 12, letterSpacing: "0.16em", textTransform: "uppercase", cursor: "pointer",
};
