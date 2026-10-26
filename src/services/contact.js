/**
 * services/contact.js  —  Contact message service layer
 * ──────────────────────────────────────────────────────────────────
 * Writes contact form submissions to the `contact_messages` table.
 *
 * Required SQL (run once in Supabase SQL Editor):
 * See the SQL block in the implementation walkthrough.
 */

import { supabase } from "./supabaseClient";

/**
 * Submit a contact message.
 * @param {{ userId?: string, email: string, message: string }} payload
 * @returns {Promise<{ error: object|null }>}
 */
export async function submitContactMessage({ userId, email, message }) {
  const { error } = await supabase
    .from("contact_messages")
    .insert({
      user_id: userId ?? null,
      email:   email.trim(),
      message: message.trim(),
    });

  if (error) {
    console.error("[submitContactMessage] error:", error);
  }
  return { error };
}
