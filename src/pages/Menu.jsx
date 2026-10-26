/**
 * pages/Menu.jsx
 * ──────────────────────────────────────────────────────────────────
 * Cross-restaurant menu browser — customer facing.
 *
 * Shows every menu item across all 12 restaurants, grouped by
 * category, with a veg-only toggle and a per-dish outlet modal.
 *
 * Data flow:
 *   1. getAllMenuItems() → flat rows with nested restaurants relation
 *   2. Group by normalised item name (case-insensitive)
 *      → each entry has: name, category, outlets[]
 *   3. Apply veg filter via isVeg() utility
 *   4. Group by category → render section headings + cards
 *   5. Click a card → open ItemOutletModal with that item's outlets
 */

import { useState, useEffect, useMemo } from "react";
import { getAllMenuItems } from "../services/menuItems";
import { isVeg } from "../utils/isVegItem";
import CrossOutletItemCard from "../components/menu/CrossOutletItemCard";
import ItemOutletModal    from "../components/menu/ItemOutletModal";

// ── Veg toggle switch ─────────────────────────────────────────────
function VegToggle({ enabled, onToggle }) {
  return (
    <button
      onClick={onToggle}
      role="switch"
      aria-checked={enabled}
      aria-label="Show vegetarian items only"
      className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border-2 font-body font-semibold text-sm
        transition-all duration-200 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-emerald-500
        ${enabled
          ? "bg-emerald-50 border-emerald-500 text-emerald-700"
          : "bg-white border-cream-muted text-ink-muted hover:border-forest/30 hover:text-ink"
        }`}
    >
      {/* Indian food-app style veg indicator */}
      <span className={`inline-flex items-center justify-center w-4.5 h-4.5 rounded-sm border-2 shrink-0
        ${enabled ? "border-emerald-600" : "border-ink-faint"}`}>
        <span className={`w-2 h-2 rounded-full transition-colors duration-150
          ${enabled ? "bg-emerald-600" : "bg-ink-faint"}`} />
      </span>
      Veg only
      {/* Toggle track */}
      <span className={`ml-1 w-9 h-5 rounded-full flex items-center transition-colors duration-200 shrink-0 px-0.5
        ${enabled ? "bg-emerald-500 justify-end" : "bg-cream-muted justify-start"}`}>
        <span className="w-4 h-4 rounded-full bg-white shadow-sm" />
      </span>
    </button>
  );
}

// ── Category section skeleton ─────────────────────────────────────
function SkeletonSection() {
  return (
    <div className="mb-10 animate-pulse">
      <div className="h-5 w-32 bg-cream-muted rounded mb-4" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-16 bg-white rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

// ── Normalise item name for grouping (lowercase, trimmed) ─────────
function normaliseName(name = "") {
  return name.trim().toLowerCase();
}

// ── Group flat items into cross-outlet dish objects ───────────────
//
// Output shape per unique dish:
// {
//   key:      string  (normalised name — stable map key)
//   name:     string  (display name — first seen)
//   category: string
//   outlets:  Array<{ menuItemId, restaurantId, restaurantName, price }>
// }
function groupItems(rows) {
  const map = new Map(); // normalised name → entry

  for (const row of rows) {
    const key = normaliseName(row.name);
    if (!map.has(key)) {
      map.set(key, {
        key,
        name:     row.name,
        category: row.category || "Other",
        outlets:  [],
      });
    }
    map.get(key).outlets.push({
      menuItemId:     row.id,
      restaurantId:   row.restaurant_id,
      restaurantName: row.restaurants?.restaurant_name ?? "Unknown",
      phoneNumber:    row.restaurants?.phone_number,
      price:          row.price,
    });
  }

  return Array.from(map.values());
}

// ── Main page ─────────────────────────────────────────────────────
export default function Menu() {
  const [allItems,  setAllItems]  = useState([]); // grouped dishes
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [vegOnly,   setVegOnly]   = useState(false); // default: show all
  const [selected,  setSelected]  = useState(null);  // open modal item

  // ── Fetch + group ───────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const rows = await getAllMenuItems();
        setAllItems(groupItems(rows));
      } catch (err) {
        console.error("[Menu] load error:", err);
        setError(err.message || "Failed to load menu items.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // ── Filter + re-group by category ──────────────────────────────
  const categorised = useMemo(() => {
    const filtered = vegOnly ? allItems.filter((d) => isVeg(d.name)) : allItems;

    // Build ordered map: category → dishes[]
    const catMap = new Map();
    for (const dish of filtered) {
      const cat = dish.category;
      if (!catMap.has(cat)) catMap.set(cat, []);
      catMap.get(cat).push(dish);
    }
    return catMap; // Map preserves insertion order (already sorted by Supabase)
  }, [allItems, vegOnly]);

  const totalVisible = useMemo(
    () => Array.from(categorised.values()).reduce((acc, arr) => acc + arr.length, 0),
    [categorised]
  );

  // ── Render ──────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-cream py-10 sm:py-14 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Header ─────────────────────────────────────────── */}
        <div className="mb-8 sm:mb-10 flex flex-col sm:flex-row sm:items-end
          justify-between gap-5">
          <div>
            <p className="font-body text-xs font-bold tracking-[0.2em] uppercase
              text-burntorange mb-2">
              All Dishes
            </p>
            <h1 className="font-display font-black text-forest text-3xl sm:text-4xl">
              Browse by Dish
            </h1>
            <p className="font-body text-ink-muted mt-2 text-sm max-w-md">
              Explore every item available across campus restaurants — tap any
              dish to see which outlets serve it and add to cart.
            </p>
          </div>

          {/* Veg toggle */}
          <div className="shrink-0">
            <VegToggle enabled={vegOnly} onToggle={() => setVegOnly((v) => !v)} />
          </div>
        </div>

        {/* ── Loading state ───────────────────────────────────── */}
        {loading && (
          <>
            <SkeletonSection />
            <SkeletonSection />
            <SkeletonSection />
          </>
        )}

        {/* ── Error state ─────────────────────────────────────── */}
        {!loading && error && (
          <div className="text-center py-20">
            <p className="font-display text-forest text-xl mb-2">
              Couldn't load menu
            </p>
            <p className="font-body text-sm text-ink-muted mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 rounded-xl bg-forest text-cream
                font-body font-semibold text-sm hover:bg-forest-light transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* ── Empty state (zero items match filter) ───────────── */}
        {!loading && !error && totalVisible === 0 && (
          <div className="text-center py-20 space-y-3">
            <div className="text-5xl">🥦</div>
            <p className="font-display text-forest text-xl font-bold">
              No veg items found
            </p>
            <p className="font-body text-sm text-ink-muted max-w-xs mx-auto">
              No vegetarian dishes matched the current filter. Toggle off
              "Veg only" to see all items.
            </p>
            <button
              onClick={() => setVegOnly(false)}
              className="mt-2 font-body text-sm font-semibold text-burntorange hover:underline"
            >
              Show all items
            </button>
          </div>
        )}

        {/* ── Category sections ────────────────────────────────── */}
        {!loading && !error && totalVisible > 0 && (
          <div className="space-y-10">
            {Array.from(categorised.entries()).map(([category, dishes]) => (
              <section key={category} aria-labelledby={`cat-${category}`}>
                <div className="flex items-center gap-3 mb-4">
                  <h2
                    id={`cat-${category}`}
                    className="font-display font-bold text-forest text-xl
                      pl-3 border-l-4 border-burntorange leading-tight"
                  >
                    {category}
                  </h2>
                  <span className="font-body text-xs text-ink-faint tabular-nums">
                    {dishes.length} {dishes.length === 1 ? "item" : "items"}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {dishes.map((dish) => (
                    <CrossOutletItemCard
                      key={dish.key}
                      item={dish}
                      onSelect={setSelected}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

      </div>

      {/* ── Item outlet modal ─────────────────────────────────── */}
      {selected && (
        <ItemOutletModal
          item={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
