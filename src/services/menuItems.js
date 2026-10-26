/**
 * services/menuItems.js  —  Menu items data service layer
 * ─────────────────────────────────────────────────────────────
 * All Supabase interactions for menu_items table.
 */

import { supabase } from "./supabaseClient";

/**
 * Fetch all menu items for a given restaurant.
 * @param {string} restaurantId 
 * @returns {Promise<Array>} Array of menu item objects
 */
export async function getMenuItemsByRestaurant(restaurantId) {
  const { data, error } = await supabase
    .from("menu_items")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .order("category")
    .order("name");

  if (error) {
    console.error("[getMenuItemsByRestaurant] error:", error.message);
    throw new Error(error.message);
  }

  return data || [];
}

/**
 * Fetch ALL menu items across every restaurant, joined with the parent
 * restaurant's id, restaurant_name, and phone_number.
 *
 * Each returned row has the shape:
 *   { id, restaurant_id, name, price, category, rating,
 *     restaurants: { id, restaurant_name, phone_number } }
 *
 * @returns {Promise<Array>}
 */
export async function getAllMenuItems() {
  const { data, error } = await supabase
    .from("menu_items")
    .select(
      "id, restaurant_id, name, price, category, rating, " +
      "restaurants ( id, restaurant_name, phone_number )"
    )
    .order("category")
    .order("name");

  if (error) {
    console.error("[getAllMenuItems] error:", error.message);
    throw new Error(error.message);
  }

  return data || [];
}
