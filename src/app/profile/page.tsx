
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface Profile {
  full_name: string;
  email: string;
  phone: string;
}

export default function ProfilePage() {
  const router = useRouter();

  const [profile, setProfile] = useState<Profile>({
    full_name: "",
    email: "",
    phone: "",
  });

  const [draft, setDraft] = useState<Profile>({
    full_name: "",
    email: "",
    phone: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, email, phone")
        .eq("id", user.id)
        .single();

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      const currentProfile: Profile = {
        full_name: data?.full_name ?? "",
        email: data?.email ?? user.email ?? "",
        phone: data?.phone ?? "",
      };

      setProfile(currentProfile);
      setDraft(currentProfile);
      setLoading(false);
    }

    loadProfile();
  }, [router]);

  function startEditing() {
    setDraft(profile);
    setMessage("");
    setError("");
    setEditing(true);
  }

  function cancelEditing() {
    setDraft(profile);
    setMessage("");
    setError("");
    setEditing(false);
  }

  async function saveProfile() {
    if (!draft.full_name.trim()) {
      setError("Full name is required.");
      return;
    }

    setSaving(true);
    setMessage("");
    setError("");

    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .update({
        full_name: draft.full_name.trim(),
        phone: draft.phone.trim() || null,
      })
      .eq("id", user.id)
      .select("full_name, email, phone")
      .single();

    if (error) {
      setError(error.message);
      setSaving(false);
      return;
    }

    const updatedProfile: Profile = {
      full_name: data.full_name ?? "",
      email: data.email ?? profile.email,
      phone: data.phone ?? "",
    };

    setProfile(updatedProfile);
    setDraft(updatedProfile);
    setEditing(false);
    setMessage("Profile updated successfully.");
    setSaving(false);
  }

  if (loading) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#F7F3EC",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Inter, sans-serif",
          color: "#765C4D",
          fontSize: 13,
        }}
      >
        Loading your profile...
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#F7F3EC",
        padding: "130px 20px 80px",
      }}
    >
      <div
        style={{
          maxWidth: 1080,
          margin: "0 auto",
        }}
      >
        {/* Breadcrumb */}
        <div
          style={{
            marginBottom: 35,
            fontFamily: "Inter, sans-serif",
            fontSize: 11,
            letterSpacing: "0.08em",
          }}
        >
          <Link
            href="/customer"
            style={{
              color: "#765C4D",
              textDecoration: "none",
            }}
          >
            MY ACCOUNT
          </Link>

          <span style={{ color: "#B8A49A", margin: "0 10px" }}>
            /
          </span>

          <span style={{ color: "#171515" }}>
            PROFILE
          </span>
        </div>

        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            gap: 25,
            flexWrap: "wrap",
            marginBottom: 45,
          }}
        >
          <div>
            <p
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: 11,
                letterSpacing: "0.3em",
                color: "#765C4D",
                margin: "0 0 12px",
              }}
            >
              VELMORA ACCOUNT
            </p>

            <h1
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(42px, 7vw, 68px)",
                lineHeight: 0.95,
                fontWeight: 400,
                color: "#171515",
                margin: 0,
              }}
            >
              My Profile
            </h1>

            <p
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: 13,
                color: "#765C4D",
                margin: "18px 0 0",
                lineHeight: 1.7,
              }}
            >
              Manage your personal information and account details.
            </p>
          </div>

          {!editing && (
            <button
              type="button"
              onClick={startEditing}
              style={editButton}
            >
              Edit Profile
            </button>
          )}
        </div>

        {/* Main layout */}
        <div
  className="profile-layout"
  style={{
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) 300px",
    gap: 24,
    alignItems: "start",
  }}
>
          {/* Profile Card */}
          <section
            style={{
              background: "#fff",
              border: "1px solid #E8D8D1",
              padding: "32px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 20,
                paddingBottom: 20,
                borderBottom: "1px solid #E8D8D1",
                marginBottom: 8,
              }}
            >
              <div>
                <p style={sectionLabel}>PERSONAL INFORMATION</p>
                <p style={sectionDescription}>
                  Your account information
                </p>
              </div>

              <div
                style={{
                  width: 48,
                  height: 48,
                  border: "1px solid #E8D8D1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 21,
                  color: "#765C4D",
                }}
              >
                V
              </div>
            </div>

            <div style={{ marginTop: 20 }}>
              {editing ? (
                <>
                  <ProfileField
                    label="Full Name"
                    value={draft.full_name}
                    onChange={(value) =>
                      setDraft({
                        ...draft,
                        full_name: value,
                      })
                    }
                  />

                  <ProfileField
                    label="Email Address"
                    value={draft.email}
                    disabled
                    onChange={() => {}}
                  />

                  <ProfileField
                    label="Phone Number"
                    value={draft.phone}
                    placeholder="Enter your phone number"
                    onChange={(value) =>
                      setDraft({
                        ...draft,
                        phone: value,
                      })
                    }
                  />
                </>
              ) : (
                <>
                  <InfoRow
                    label="Full Name"
                    value={profile.full_name || "Not provided"}
                  />

                  <InfoRow
                    label="Email Address"
                    value={profile.email || "Not provided"}
                  />

                  <InfoRow
                    label="Phone Number"
                    value={profile.phone || "Not provided"}
                  />
                </>
              )}
            </div>

            {editing && (
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  flexWrap: "wrap",
                  marginTop: 28,
                  paddingTop: 24,
                  borderTop: "1px solid #E8D8D1",
                }}
              >
                <button
                  type="button"
                  onClick={saveProfile}
                  disabled={saving}
                  style={{
                    ...primaryButton,
                    opacity: saving ? 0.6 : 1,
                  }}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>

                <button
                  type="button"
                  onClick={cancelEditing}
                  disabled={saving}
                  style={secondaryButton}
                >
                  Cancel
                </button>
              </div>
            )}

            {message && (
              <p
                style={{
                  margin: "18px 0 0",
                  fontFamily: "Inter, sans-serif",
                  fontSize: 12,
                  color: "#4F6B52",
                }}
              >
                {message}
              </p>
            )}

            {error && (
              <p
                role="alert"
                style={{
                  margin: "18px 0 0",
                  fontFamily: "Inter, sans-serif",
                  fontSize: 12,
                  color: "#A32D2D",
                }}
              >
                {error}
              </p>
            )}
          </section>

          {/* Account Navigation */}
          <aside>
            <div
              style={{
                background: "#171515",
                padding: "28px 24px",
                marginBottom: 16,
              }}
            >
              <p
                style={{
                  margin: "0 0 8px",
                  fontFamily: "Inter, sans-serif",
                  fontSize: 10,
                  letterSpacing: "0.2em",
                  color: "#CDBDB4",
                }}
              >
                VELMORA
              </p>

              <h2
                style={{
                  margin: 0,
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 30,
                  fontWeight: 400,
                  color: "#F7F3EC",
                }}
              >
                Your Account
              </h2>

              <p
                style={{
                  margin: "12px 0 0",
                  fontFamily: "Inter, sans-serif",
                  fontSize: 12,
                  lineHeight: 1.7,
                  color: "#CDBDB4",
                }}
              >
                Everything you need to manage your VELMORA experience.
              </p>
            </div>

            <div
              style={{
                background: "#fff",
                border: "1px solid #E8D8D1",
              }}
            >
              <AccountLink href="/customer" label="Account Overview" />
              <AccountLink href="/orders" label="My Orders" />
              <AccountLink href="/wishlist" label="Wishlist" />
              <AccountLink href="/cart" label="Shopping Bag" />
              <AccountLink
                href="/profile"
                label="Profile"
                active
              />
            </div>
          </aside>
        </div>

        {/* Bottom navigation */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 20,
            flexWrap: "wrap",
            marginTop: 35,
            paddingTop: 24,
            borderTop: "1px solid #E8D8D1",
          }}
        >
          <Link
            href="/customer"
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: 12,
              color: "#765C4D",
              textDecoration: "none",
            }}
          >
            ← Back to My Account
          </Link>

          <Link
            href="/"
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: 12,
              color: "#765C4D",
              textDecoration: "none",
            }}
          >
            Continue Shopping →
          </Link>
        </div>
      </div>

      <style>{`
        @media (max-width: 760px) {
          .profile-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </main>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        padding: "19px 0",
        borderBottom: "1px solid #E8D8D133",
      }}
    >
      <p
        style={{
          margin: "0 0 7px",
          fontFamily: "Inter, sans-serif",
          fontSize: 10,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "#765C4D",
        }}
      >
        {label}
      </p>

      <p
        style={{
          margin: 0,
          fontFamily: "Inter, sans-serif",
          fontSize: 14,
          color: "#171515",
        }}
      >
        {value}
      </p>
    </div>
  );
}

function ProfileField({
  label,
  value,
  onChange,
  placeholder,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <label
      style={{
        display: "block",
        marginBottom: 20,
        fontFamily: "Inter, sans-serif",
      }}
    >
      <span
        style={{
          display: "block",
          marginBottom: 7,
          fontSize: 10,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "#765C4D",
        }}
      >
        {label}
      </span>

      <input
        type="text"
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        style={{
          display: "block",
          width: "100%",
          boxSizing: "border-box",
          padding: "13px 14px",
          border: "1px solid #E8D8D1",
          background: disabled ? "#F3EEE8" : "#fff",
          color: "#171515",
          fontFamily: "Inter, sans-serif",
          fontSize: 13,
          outline: "none",
        }}
      />

      {disabled && (
        <span
          style={{
            display: "block",
            marginTop: 6,
            fontSize: 10,
            color: "#9A8980",
          }}
        >
          Email cannot be changed here.
        </span>
      )}
    </label>
  );
}

function AccountLink({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 18px",
        borderBottom: "1px solid #E8D8D133",
        background: active ? "#F7F3EC" : "#fff",
        color: active ? "#171515" : "#765C4D",
        textDecoration: "none",
        fontFamily: "Inter, sans-serif",
        fontSize: 12,
        letterSpacing: "0.03em",
      }}
    >
      <span>{label}</span>
      <span style={{ fontSize: 14 }}>→</span>
    </Link>
  );
}

const sectionLabel: React.CSSProperties = {
  margin: 0,
  fontFamily: "Inter, sans-serif",
  fontSize: 10,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  color: "#765C4D",
};

const sectionDescription: React.CSSProperties = {
  margin: "7px 0 0",
  fontFamily: "Inter, sans-serif",
  fontSize: 12,
  color: "#9A8980",
};

const editButton: React.CSSProperties = {
  background: "transparent",
  border: "1px solid #171515",
  padding: "12px 22px",
  fontFamily: "Inter, sans-serif",
  fontSize: 11,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: "#171515",
  cursor: "pointer",
};

const primaryButton: React.CSSProperties = {
  background: "#171515",
  color: "#F7F3EC",
  border: "none",
  padding: "13px 24px",
  fontFamily: "Inter, sans-serif",
  fontSize: 11,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  cursor: "pointer",
};

const secondaryButton: React.CSSProperties = {
  background: "transparent",
  color: "#171515",
  border: "1px solid #171515",
  padding: "13px 24px",
  fontFamily: "Inter, sans-serif",
  fontSize: 11,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  cursor: "pointer",
};

