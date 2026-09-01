import { createClient } from "@/lib/supabase/client";

interface SignUpInput {
  email: string;
  password: string;
  fullName: string;
}

// Notice there is no `role` field in SignUpInput and nothing here
// ever sends one. Even if a malicious client crafted a raw request
// with role: "admin" in raw_user_meta_data, it would have no
// effect: handle_new_user() (0002_functions_triggers.sql) always
// inserts role = 'customer' explicitly, ignoring anything else in
// the metadata payload, and the profiles UPDATE policy plus the
// guard_role_escalation trigger both block changing it afterwards
// from a non-admin session.
export async function signUpCustomer({ email, password, fullName }: SignUpInput) {
  const supabase = createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  });

  if (error) throw error;
  return data;
}
