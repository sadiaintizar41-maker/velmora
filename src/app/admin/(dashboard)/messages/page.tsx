import { getContactMessages } from "@/lib/supabase/adminQueries";
import MessagesTable from "@/components/admin/MessagesTable";

export const metadata = { title: "Messages — VELMORA Admin" };

export default async function AdminMessagesPage() {
  let messages: Awaited<ReturnType<typeof getContactMessages>> = [];
  let loadError = false;
  try {
    messages = await getContactMessages();
  } catch {
    loadError = true;
  }

  return (
    <div>
      <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, color: "#171515", margin: "0 0 28px" }}>
        Messages
      </h1>
      {loadError ? (
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 14, color: "#A32D2D" }}>
          Could not load messages. Please try again.
        </p>
      ) : (
        <MessagesTable messages={messages as any} />
      )}
    </div>
  );
}
