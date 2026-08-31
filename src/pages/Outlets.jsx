/**
 * pages/Outlets.jsx  —  All restaurants list view
 * ──────────────────────────────────────────────────────────────────
 * Displays all restaurants in a simple vertical list.
 */

import { useState, useEffect } from "react";
import { getAllRestaurants } from "../services/restaurants";
import RestaurantCard from "../components/restaurant/RestaurantCard";

function SkeletonRow() {
  return (
    <div className="flex h-32 rounded-2xl overflow-hidden bg-white shadow-sm animate-pulse">
      <div className="w-32 bg-cream-muted shrink-0" />
      <div className="p-4 space-y-3 flex-1 flex flex-col justify-center">
        <div className="h-5 bg-cream-muted rounded-lg w-1/3" />
        <div className="flex gap-2">
          <div className="h-4 bg-cream-muted rounded-full w-16" />
          <div className="h-4 bg-cream-muted rounded-full w-16" />
        </div>
        <div className="h-3.5 bg-cream-muted rounded w-3/4" />
      </div>
    </div>
  );
}

export default function Outlets() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function fetchRestaurants() {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllRestaurants();
      setRestaurants(data);
    } catch (err) {
      console.error("[Outlets] fetchRestaurants error:", err);
      setError(err.message || "Failed to load restaurants.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRestaurants();
  }, []);

  return (
    <div className="min-h-screen bg-cream py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-10 sm:mb-12">
          <p className="font-body text-xs font-bold tracking-[0.2em] uppercase text-burntorange mb-2">
            Campus Directory
          </p>
          <h1 className="font-display font-black text-forest text-3xl sm:text-4xl leading-tight">
            All Outlets
          </h1>
          <p className="font-body text-ink-muted mt-2 text-sm max-w-lg">
            Browse every food stall and restaurant available on campus.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="text-center py-12">
            <p className="font-display text-forest text-xl mb-2">Couldn't load outlets</p>
            <p className="font-body text-sm text-ink-muted mb-6">{error}</p>
            <button
              onClick={fetchRestaurants}
              className="px-6 py-2.5 rounded-xl bg-forest text-cream font-body font-semibold text-sm hover:bg-forest-light transition-colors duration-150"
            >
              Try again
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && !error && (
          <div className="flex flex-col gap-5">
            {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}
          </div>
        )}

        {/* Empty */}
        {!loading && !error && restaurants.length === 0 && (
          <div className="text-center py-16 space-y-3">
            <div className="text-5xl mb-4" role="img" aria-label="cooking pot">🍲</div>
            <p className="font-display text-forest text-xl font-bold">
              No restaurants yet
            </p>
            <p className="font-body text-sm text-ink-muted max-w-xs mx-auto">
              Looks like no stalls have signed up yet. Check back soon!
            </p>
          </div>
        )}

        {/* List */}
        {!loading && !error && restaurants.length > 0 && (
          <div className="flex flex-col gap-5">
            {restaurants.map((r) => (
              <RestaurantCard key={r.id} restaurant={r} variant="list" />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
