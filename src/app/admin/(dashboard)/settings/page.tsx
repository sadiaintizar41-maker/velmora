import { createClient } from "@/lib/supabase/server";
import SettingsForm from "@/components/admin/SettingsForm";

export default async function AdminSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase.from("profiles").select("full_name, email, phone").eq("id", user.id).single()
    : { data: null };

  return (
    <div>
      <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, color: "#171515", margin: "0 0 28px" }}>
        Settings
      </h1>
      <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: "#3A2926", marginBottom: 24, maxWidth: 480 }}>
        This updates your own admin profile only. There is no in-app way to grant another
        account admin access - see <code>promote_to_admin()</code> in the Phase 2 migrations,
        which is intentionally only callable by SQL run directly against the database.
      </p>
      {profile && <SettingsForm initial={{ full_name: profile.full_name ?? "", phone: profile.phone ?? "" }} email={profile.email} />}
    </div>
  );
}
