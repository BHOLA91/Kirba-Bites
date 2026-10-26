/**
 * utils/restaurantImageFallbacks.js
 * ──────────────────────────────────────────────────────────────────
 * Provides cuisine-matched Unsplash image fallbacks for restaurants
 * that have no image_url set in the database.
 *
 * How it works:
 *  1. Try restaurant.image_url (real upload — use it directly)
 *  2. Scan the restaurant name + description for cuisine keywords
 *     and return a matching Unsplash source URL
 *  3. Last-resort: generic "food" query
 *
 * Unsplash source URLs (https://source.unsplash.com/WIDTHxHEIGHT/?QUERY)
 * are free to embed, require no API key, and return a relevant random
 * photo on each page-load. This is intentional and acceptable while
 * real photos are uploaded via Supabase Storage.
 *
 * Usage:
 *   import { getRestaurantImage } from "../../utils/restaurantImageFallbacks";
 *   const src = getRestaurantImage(restaurant);
 */

import amBiryani from "../assets/images/am-biryani.jpg";
import wowLoadedChips from "../assets/images/byob-loaded-chips.jpg";
import hotMomos from "../assets/images/hot-momos.jpg";
import swarupNoodles from "../assets/images/swarup-noodles.jpg";

const LOCAL_OVERRIDES = {
  "AM": amBiryani,
  "WOW Fast Food Point": wowLoadedChips,
  "Hot Momos": hotMomos,
  "Swarup Fast Food": swarupNoodles,
};

// ── Keyword → Unsplash query mapping ─────────────────────────────
// Order matters: more specific patterns first.
const CUISINE_MAP = [
  // Street food / chaat
  { pattern: /pani.?puri|chaat|bhel|sev|golgappa/i,  query: "chaat,indian-street-food" },
  // Momos / Tibetan / dim sum
  { pattern: /momo|tibetan|dumpling/i,                query: "momos,dumplings" },
  // Biryani / rice
  { pattern: /biryani|dum.?rice|pulao/i,              query: "biryani,rice" },
  // South Indian
  { pattern: /dosa|idli|vada|sambar|south.?indian/i,  query: "dosa,south-indian-food" },
  // Chinese / noodles
  { pattern: /chinese|noodle|wok|manchurian|hakka/i,  query: "chinese-noodles,stir-fry" },
  // Burger / grill
  { pattern: /burger|grill|bbq|smash/i,               query: "burger,grill" },
  // Pizza / pasta / Italian
  { pattern: /pizza|pasta|italian/i,                   query: "pizza,pasta" },
  // Sandwich / wraps
  { pattern: /sandwich|wrap|sub|roll/i,                query: "sandwich,wrap" },
  // Loaded chips / nachos / fast food
  { pattern: /chip|nacho|loaded|fry.?it|fast.?food|wow/i, query: "loaded-nachos,street-food" },
  // Fried chicken
  { pattern: /fried.?chicken|kfc|popcorn.?chicken/i,  query: "fried-chicken" },
  // Shawarma / kebab / Middle-eastern
  { pattern: /shawarma|kebab|kathi/i,                  query: "shawarma,kebab" },
  // Café / coffee / beverages
  { pattern: /cafe|coffee|chai|tea|beverag/i,          query: "coffee,cafe-food" },
  // Sweets / dessert / mithai
  { pattern: /sweet|mithai|halwa|dessert|ice.?cream/i, query: "indian-sweets,dessert" },
  // Thali / Indian meals
  { pattern: /thali|meal|tiffin|dabba/i,               query: "indian-thali,meals" },
  // Veg / health
  { pattern: /veg|salad|health|organic/i,              query: "vegetarian-food,salad" },
];

const BASE = "https://source.unsplash.com/800x600/?";

/**
 * Returns the best image src for a restaurant object.
 * @param {{ image_url?: string, restaurant_name?: string, description?: string }} restaurant
 * @param {string} [size="800x600"]
 * @returns {string} an image URL — either image_url, a cuisine Unsplash URL, or generic food
 */
export function getRestaurantImage(restaurant, size = "800x600") {
  if (!restaurant) return `${BASE}food`;

  // Real upload wins
  if (restaurant.image_url) return restaurant.image_url;

  // Local override check for specific restaurants
  if (restaurant.restaurant_name && LOCAL_OVERRIDES[restaurant.restaurant_name]) {
    return LOCAL_OVERRIDES[restaurant.restaurant_name];
  }

  const text = `${restaurant.restaurant_name ?? ""} ${restaurant.description ?? ""}`;

  for (const { pattern, query } of CUISINE_MAP) {
    if (pattern.test(text)) {
      return `https://source.unsplash.com/${size}/?${query}`;
    }
  }

  // Generic food fallback
  return `https://source.unsplash.com/${size}/?food,restaurant`;
}

/**
 * Returns a cuisine-matched Unsplash URL for an offer (used in the
 * OffersCarousel image element — smaller decorative size).
 * @param {{ offers?: string, restaurant_name?: string, description?: string }} restaurant
 * @returns {string}
 */
export function getOfferImage(restaurant) {
  return getRestaurantImage(restaurant, "600x600");
}
