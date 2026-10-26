/**
 * utils/isVegItem.js
 * ──────────────────────────────────────────────────────────────────
 * Client-side heuristic to classify a menu item as veg or non-veg.
 *
 * An item is NON-VEG if its name contains any of the keywords below
 * (case-insensitive). Everything else is treated as VEG.
 *
 * This is intentionally simple — when a real `is_veg` column lands
 * in the menu_items table, replace this utility with a direct field
 * read and update all call sites.
 *
 * @param {string} itemName  — the menu item's name
 * @returns {boolean}        — true if the item is classified as veg
 */

const NON_VEG_KEYWORDS = /chicken|egg|mutton|prawn|fish|meat/i;

/**
 * Returns true if the item is considered vegetarian.
 * @param {string} itemName
 * @returns {boolean}
 */
export function isVeg(itemName) {
  if (!itemName) return true;
  return !NON_VEG_KEYWORDS.test(itemName);
}
