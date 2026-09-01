"use client";

import { useState } from "react";
import { updateOwnProfile } from "@/lib/actions/profile";

export default function SettingsForm({ initial, email }: { initial: { full_name: string; phone: string }; email: string }) {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await updateOwnProfile(form);
      setSaved(true);
    } catch (e: any) {
      setError(e?.message ?? "Could not save changes.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 420 }}>
      <Field label="Email">
        <input value={email} disabled style={{ ...input, opacity: 0.6 }} />
      </Field>
      <Field label="Full name">
        <input value={form.full_name} onChange={(e: any) => setForm({ ...form, full_name: e.target.value })} style={input} />
      </Field>
      <Field label="Phone">
        <input value={form.phone} onChange={(e: any) => setForm({ ...form, phone: e.target.value })} style={input} />
      </Field>

      {error && <p role="alert" style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: "#A32D2D" }}>{error}</p>}
      {saved && <p style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: "#1F7A3D" }}>Saved.</p>}

      <button type="submit" disabled={saving} style={primaryBtn}>{saving ? "Saving…" : "Save Changes"}</button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "block", marginBottom: 14, fontFamily: "Inter, sans-serif", fontSize: 11, color: "#3A2926" }}>
      {label}
      <div style={{ marginTop: 4 }}>{children}</div>
    </label>
  );
}

const input: React.CSSProperties = { display: "block", width: "100%", padding: "9px 11px", fontFamily: "Inter, sans-serif", fontSize: 13, border: "1px solid #765C4D66" };
const primaryBtn: React.CSSProperties = { background: "#171515", color: "#F7F3EC", border: "none", padding: "11px 26px", fontFamily: "Inter, sans-serif", fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer", marginTop: 6 };
