import { createClient } from "@/lib/supabase/client";

interface SignInInput {
  email: string;
  password: string;
}

export async function signInCustomer({
  email,
  password,
}: SignInInput) {
  const supabase = createClient();

  const { data, error } =
    await supabase.auth.signInWithPassword({
      email,
      password,
    });

  if (error) throw error;

  return data;
}