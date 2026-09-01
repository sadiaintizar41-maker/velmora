"use client";

import { useState, useTransition } from "react";
import { setMessageRead, deleteContactMessage } from "@/lib/actions/contactMessages";

export interface ContactMessage {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export default function MessagesTable({ messages }: { messages: ContactMessage[] }) {
  const [items, setItems] = useState(messages);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  const unreadCount = items.filter((m) => !m.is_read).length;

  function toggleRead(m: ContactMessage) {
    startTransition(async () => {
      try {
        await setMessageRead(m.id, !m.is_read);
        setItems((prev) => prev.map((x) => (x.id === m.id ? { ...x, is_read: !m.is_read } : x)));
      } catch (e: any) {
        setError(e?.message ?? "Could not update the message.");
      }
    });
  }

  function remove(m: ContactMessage) {
    if (!confirm("Delete this message permanently?")) return;
    startTransition(async () => {
      try {
        await deleteContactMessage(m.id);
        setItems((prev) => prev.filter((x) => x.id !== m.id));
      } catch (e: any) {
        setError(e?.message ?? "Could not delete the message.");
      }
    });
  }

  if (items.length === 0) {
    return (
      <p style={{ fontFamily: "Inter, sans-serif", fontSize: 14, color: "#3A2926" }}>
        No messages yet. Messages sent from the contact page will appear here.
      </p>
    );
  }

  return (
    <div style={{ opacity: pending ? 0.7 : 1 }}>
      <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: "#3A2926", margin: "0 0 18px" }}>
        {unreadCount > 0 ? (
          <span style={{ color: "#A32D2D", fontWeight: 600 }}>{unreadCount} unread</span>
        ) : (
          "All messages read"
        )}
      </p>

      {error && <p role="alert" style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: "#A32D2D", margin: "0 0 14px" }}>{error}</p>}

      <div style={{ display: "grid", gap: 14 }}>
        {items.map((m) => {
          const isOpen = openId === m.id;
          return (
            <div
              key={m.id}
              style={{
                background: "#fff",
                border: m.is_read ? "1px solid #E8D8D1" : "1px solid #C9A878",
                padding: "18px 20px",
              }}
            >
              <div
                onClick={() => setOpenId(isOpen ? null : m.id)}
                style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, cursor: "pointer", flexWrap: "wrap" }}
              >
                <div>
                  <p style={{ margin: 0, fontFamily: "Inter, sans-serif", fontSize: 14, color: "#171515", fontWeight: m.is_read ? 400 : 600 }}>
                    {!m.is_read && <span style={{ color: "#A32D2D", marginRight: 8 }}>●</span>}
                    {m.subject}
                  </p>
                  <p style={{ margin: "5px 0 0", fontFamily: "Inter, sans-serif", fontSize: 12, color: "#765C4D" }}>
                    {m.first_name} {m.last_name} · {m.email} · {new Date(m.created_at).toLocaleString()}
                  </p>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <button
                    type="button"
                    onClick={(e: React.MouseEvent) => { e.stopPropagation(); toggleRead(m); }}
                    style={actionBtn}
                  >
                    {m.is_read ? "Mark Unread" : "Mark Read"}
                  </button>
                  <button
                    type="button"
                    onClick={(e: React.MouseEvent) => { e.stopPropagation(); remove(m); }}
                    style={{ ...actionBtn, color: "#A32D2D", borderColor: "#A32D2D66" }}
                  >
                    Delete
                  </button>
                </div>
              </div>

              {isOpen && (
                <p style={{ margin: "14px 0 0", paddingTop: 14, borderTop: "1px solid #E8D8D1", fontFamily: "Inter, sans-serif", fontSize: 14, lineHeight: 1.8, color: "#3A2926", whiteSpace: "pre-wrap" }}>
                  {m.message}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const actionBtn: React.CSSProperties = {
  background: "none",
  border: "1px solid #765C4D66",
  color: "#171515",
  fontFamily: "Inter, sans-serif",
  fontSize: 11,
  padding: "5px 10px",
  cursor: "pointer",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
};
