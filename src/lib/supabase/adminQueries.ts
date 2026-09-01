import { createClient } from "@/lib/supabase/server";

// Every function here relies entirely on RLS to restrict results to
// what an admin session is allowed to see (e.g. draft/archived
// products, all orders, all profiles) - none of it uses a service
// role key. If the calling session isn't actually an admin, these
// simply return the same restricted rows a customer would get,
// because that's what the database itself enforces.

export async function getDashboardStats() {
  const supabase = await createClient();

  const [
    { count: productCount },
    { count: orderCount },
    { count: customerCount },
    { data: paidOrders },
    { data: recentOrders },
    { data: variants },
  ] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase.from("orders").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "customer"),
    // Revenue is computed only from orders that have actually been
    // paid - not from every order ever created (which would count
    // pending/cancelled/unpaid carts as revenue).
    supabase.from("orders").select("total_amount").eq("payment_status", "paid"),
    supabase
      .from("orders")
      .select("id, shipping_name, shipping_email, status, payment_status, total_amount, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("product_variants")
      .select("id, size, color_name, stock_quantity, sku, products ( id, name, slug )")
      .lte("stock_quantity", 5)
      .order("stock_quantity", { ascending: true })
      .limit(10),
  ]);

  const revenue = (paidOrders ?? []).reduce((sum: number, o: any) => sum + Number(o.total_amount), 0);

  return {
    productCount: productCount ?? 0,
    orderCount: orderCount ?? 0,
    customerCount: customerCount ?? 0,
    revenue,
    recentOrders: recentOrders ?? [],
    lowStockVariants: variants ?? [],
  };
}

export async function getAdminProducts() {
  const supabase = await createClient();
  // Deliberately no .eq('status', 'published') filter - an admin
  // session sees draft and archived products too, which is exactly
  // what the products_public_read_published RLS policy allows once
  // public.is_admin() returns true for this session.
  const { data, error } = await supabase
    .from("products")
    .select(
      `id, name, slug, status, is_featured, is_new, is_active, created_at,
       product_images ( image_url, position ),
       product_variants ( id, size, color_name, stock_quantity, price ),
       categories ( name ),
       collections ( name )`
    )
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getAdminProductById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      `*,
       product_images ( id, image_url, alt_text, position ),
       product_variants ( id, size, color_name, color_hex, price, compare_at_price, stock_quantity, sku )`
    )
    .eq("id", id)
    .single();
  if (error) return null;
  return data;
}

export async function getAdminCategories() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getAdminCollections() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("collections")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getAdminOrders() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select(`*, order_items ( id, product_name, size, color, quantity, unit_price, subtotal )`)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getAdminCustomers() {
  const supabase = await createClient();

  const [{ data: profiles, error: profilesError }, { data: orders, error: ordersError }] =
    await Promise.all([
      // Never selects a password/credential column - profiles has none;
      // Supabase Auth stores credentials separately and inaccessibly
      // via the public schema regardless.
      supabase
        .from("profiles")
        .select("id, full_name, email, phone, role, created_at")
        .eq("role", "customer")
        .order("created_at", { ascending: false }),
      supabase.from("orders").select("user_id, total_amount, payment_status"),
    ]);

  if (profilesError) throw profilesError;
  if (ordersError) throw ordersError;

  const byUser = new Map<string, { count: number; total: number }>();
  for (const o of orders ?? []) {
    if (!o.user_id) continue;
    const entry = byUser.get(o.user_id) ?? { count: 0, total: 0 };
    entry.count += 1;
    if (o.payment_status === "paid") entry.total += Number(o.total_amount);
    byUser.set(o.user_id, entry);
  }

  return (profiles ?? []).map((p: any) => ({
    ...p,
    orderCount: byUser.get(p.id)?.count ?? 0,
    totalSpending: byUser.get(p.id)?.total ?? 0,
  }));
}

export async function getContactMessages() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getNewsletterSubscribers() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("newsletter_subscribers")
    .select("id, email, created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}
