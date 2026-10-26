/**
 * services/restaurants.js  —  Restaurant data service layer
 * ──────────────────────────────────────────────────────────────────
 * All Supabase queries for restaurants funnelled through here.
 * Components import from this module — nothing calls supabase directly.
 */

import { supabase } from "./supabaseClient";

/**
 * Fetch all restaurants, ordered by creation date (newest first).
 * Returns an array of restaurant rows (or [] on error).
 */
export async function getAllRestaurants() {
  const { data, error } = await supabase
    .from("restaurants")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[getAllRestaurants] error:", error);
    throw new Error("Failed to load restaurants. Please try again.");
  }
  return data ?? [];
}

/**
 * Fetch a single restaurant by its UUID.
 * Returns the row object or null if not found.
 */
export async function getRestaurantById(id) {
  const { data, error } = await supabase
    .from("restaurants")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("[getRestaurantById] error:", error);
    return null;
  }
  return data;
}

/**
 * Fetch a single restaurant by its R-UID.
 * Returns the row object or null if not found.
 */
export async function getRestaurantByRuid(ruid) {
  const { data, error } = await supabase
    .from("restaurants")
    .select("*")
    .eq("r_uid", ruid)
    .maybeSingle();

  if (error) {
    console.error("[getRestaurantByRuid] error:", error);
    return null;
  }
  return data;
}

/**
 * Fetch only restaurants that have an offers field set.
 * Used by the OffersCarousel on the Home page.
 */
export async function getRestaurantsWithOffers() {
  const { data, error } = await supabase
    .from("restaurants")
    .select("id, restaurant_name, r_uid, offers, image_url, description")
    .not("offers", "is", null)
    .neq("offers", "")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[getRestaurantsWithOffers] error:", error);
    return [];
  }
  return data ?? [];
}

/**
 * Fetch the restaurant row owned by the given userId.
 * Returns the row object or null if not found.
 */
export async function getRestaurantByOwnerId(userId) {
  const { data, error } = await supabase
    .from("restaurants")
    .select("*")
    .eq("owner_id", userId)
    .maybeSingle();

  if (error) {
    console.error("[getRestaurantByOwnerId] error:", error);
    return null;
  }
  return data;
}

/**
 * Toggle a restaurant's is_open status.
 * @param {string} restaurantId  — the restaurant's UUID
 * @param {boolean} isOpen       — the NEW value to set
 * Returns { data, error }.
 */
export async function updateIsOpen(restaurantId, isOpen) {
  const { data, error } = await supabase
    .from("restaurants")
    .update({ is_open: isOpen })
    .eq("id", restaurantId)
    .select()
    .single();

  if (error) {
    console.error("[updateIsOpen] error:", error);
  }
  return { data, error };
}
