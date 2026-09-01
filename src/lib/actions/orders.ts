"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { OrderStatus, PaymentStatus } from "@/lib/supabase/database.types";

// There is deliberately no customer-facing path to either of
// these - orders_admin_update is the only UPDATE policy on
// `orders` (0003_rls_policies.sql), so a non-admin session calling
// this action would be rejected by Postgres itself, not just by
// this file declining to call it.

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const supabase = await createClient();
  const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/orders");
  revalidatePath(`/order-confirmation/${orderId}`);
}

export async function updatePaymentStatus(orderId: string, paymentStatus: PaymentStatus) {
  const supabase = await createClient();
  const { error } = await supabase.from("orders").update({ payment_status: paymentStatus }).eq("id", orderId);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/orders");
  revalidatePath("/admin"); // revenue on the dashboard depends on payment_status
}
