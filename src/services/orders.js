/**
 * services/orders.js  —  Order history service layer
 * ──────────────────────────────────────────────────────────────────
 * Saves completed orders to the `orders` table.
 *
 * Design rationale for JSONB over normalized tables:
 * An order here is a point-in-time phone-call summary: the user
 * looks at the summary, calls each restaurant, and that's it.
 * The data never needs to be joined against live menu_items or
 * restaurants rows — prices and names may change, but the order
 * snapshot should be immutable. A single `order_details` JSONB
 * column captures the full snapshot cheaply, keeps the schema
 * simple, and makes the Orders page trivial to render without
 * multi-table joins.
 *
 * Required SQL (run once in Supabase SQL Editor):
 * See the SQL artifact: orders_sql.md
 */

import { supabase } from "./supabaseClient";

/**
 * Save a completed order.
 *
 * @param {{
 *   userId: string,
 *   orderDetails: {
 *     groups: Array<{
 *       restaurantId: string,
 *       restaurantName: string,
 *       phoneNumber: string|null,
 *       items: Array<{ name, price, quantity, subtotal }>,
 *       subtotal: number,
 *     }>,
 *     grandTotal: number,
 *     placedAt: string,   // ISO timestamp
 *   }
 * }} payload
 * @returns {Promise<{ data, error }>}
 */
export async function saveOrder({ userId, orderDetails }) {
  const { data, error } = await supabase
    .from("orders")
    .insert({
      user_id:       userId,
      order_details: orderDetails,
    })
    .select()
    .single();

  if (error) {
    console.error("[saveOrder] error:", error);
  }
  return { data, error };
}

/**
 * Fetch all orders for the current user, newest first.
 * @param {string} userId
 * @returns {Promise<Array>}
 */
export async function getOrdersByUser(userId) {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[getOrdersByUser] error:", error);
    return [];
  }
  return data ?? [];
}
