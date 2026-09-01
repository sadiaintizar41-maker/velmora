import { createClient } from "@/lib/supabase/client";

export interface CheckoutItem {
  variant_id: string;
  product_name: string;
  quantity: number;
}

export interface CheckoutPayload {
  subtotal: number;
  shipping_amount: number;
  total_amount: number;
  shipping_name: string;
  shipping_email: string;
  shipping_phone?: string;
  shipping_address: string;
  city: string;
  postal_code?: string;
}

// Deliberately does NOT insert into `orders` / `order_items` /
// decrement `product_variants.stock_quantity` directly — those
// three writes must happen together or not at all, and stock
// checks must happen under a row lock, which is only guaranteed
// inside the create_order() database function (see
// supabase/migrations/0002_functions_triggers.sql). Doing this as
// three separate client calls would let two customers both "win"
// the last unit of stock in a race.
export async function createOrder(payload: CheckoutPayload, items: CheckoutItem[]) {
  const supabase = createClient();

  const { data: orderId, error } = await supabase.rpc("create_order", {
    payload,
    items,
  });

  if (error) {
    // Surfaces the function's own message, e.g. "Insufficient
    // stock for M/Mocha: only 1 left." — safe and useful to show
    // directly at checkout.
    throw new Error(error.message);
  }

  return orderId as string;
}
