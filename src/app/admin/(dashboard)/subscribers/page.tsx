import { getNewsletterSubscribers } from "@/lib/supabase/adminQueries";

export const metadata = { title: "Subscribers - VELMORA Admin" };

export default async function AdminSubscribersPage() {
  let subscribers: Awaited<ReturnType<typeof getNewsletterSubscribers>> = [];
  let loadError = false;
  try {
    subscribers = await getNewsletterSubscribers();
  } catch {
    loadError = true;
  }

  return (
    <div>
      <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, color: "#171515", margin: "0 0 10px" }}>
        Newsletter Subscribers
      </h1>
      <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: "#765C4D", margin: "0 0 28px" }}>
        {subscribers.length} subscriber{subscribers.length === 1 ? "" : "s"}
      </p>

      {loadError ? (
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 14, color: "#A32D2D" }}>
          Could not load subscribers. Please try again.
        </p>
      ) : subscribers.length === 0 ? (
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 14, color: "#3A2926" }}>
          No subscribers yet. Newsletter signups from the homepage will appear here.
        </p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "Inter, sans-serif", fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid #E8D8D1" }}>
              {["Email", "Subscribed"].map((h) => (
                <th key={h} style={{ padding: "8px 10px", fontWeight: 500, color: "#765C4D", fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {subscribers.map((s: { id: string; email: string; created_at: string }) => (
              <tr key={s.id} style={{ borderBottom: "1px solid #E8D8D133" }}>
                <td style={{ padding: "8px 10px", color: "#171515" }}>{s.email}</td>
                <td style={{ padding: "8px 10px", color: "#3A2926" }}>
                  {new Date(s.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
