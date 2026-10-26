/**
 * pages/OwnerDashboard.jsx
 * ──────────────────────────────────────────────────────────────────
 * The owner's personal view of their restaurant listing.
 *
 * Mirrors the customer-facing RestaurantDetail layout but from the
 * owner's perspective:
 *   - Banner: image, name, description — NO "Call to Order" button
 *   - Open/Closed toggle in the banner area
 *   - Full menu grouped by category, read-only (no Add to Cart)
 *   - Loading / error / no-restaurant states
 *
 * Data:
 *   - Fetches the restaurant where owner_id = current user's id
 *   - is_open toggle calls updateIsOpen() with optimistic UI update
 */

import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getRestaurantByOwnerId, updateIsOpen } from "../services/restaurants";
import { getMenuItemsByRestaurant } from "../services/menuItems";
import { getRestaurantImage } from "../utils/restaurantImageFallbacks";

// ── Last-resort gradient (if image network fails) ─────────────────
const FALLBACK_GRADIENTS = [
  "linear-gradient(135deg, #F4D5B0 0%, #EDD9B8 100%)",
  "linear-gradient(135deg, #E8F0EB 0%, #D4E8DA 100%)",
  "linear-gradient(135deg, #FBE8D3 0%, #F4D5B0 100%)",
];
function fallbackGradient(id = "") {
  return FALLBACK_GRADIENTS[(id?.charCodeAt(0) ?? 0) % FALLBACK_GRADIENTS.length];
}

// ── Open/Closed Toggle ────────────────────────────────────────────
function OpenToggle({ isOpen, onToggle, loading }) {
  return (
    <button
      onClick={onToggle}
      disabled={loading}
      aria-label={isOpen ? "Mark as Closed" : "Mark as Open"}
      className={`flex items-center gap-3 px-5 py-3 rounded-xl font-body font-bold text-sm
        transition-all duration-200 select-none
        ${loading ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:-translate-y-px hover:shadow-md active:translate-y-0"}
        ${isOpen
          ? "bg-emerald-500 text-white shadow-emerald-200 shadow-lg"
          : "bg-ink/80 text-cream shadow-lg"
        }`}
    >
      {/* Status dot */}
      <span
        className={`w-2.5 h-2.5 rounded-full shrink-0
          ${isOpen ? "bg-white animate-pulse" : "bg-cream/50"}`}
      />
      {loading ? "Updating…" : isOpen ? "Open for Orders" : "Closed"}
      {/* Toggle track visual */}
      <span
        className={`ml-1 w-10 h-5 rounded-full flex items-center transition-colors duration-200 shrink-0
          ${isOpen ? "bg-white/30 justify-end pr-0.5" : "bg-cream/20 justify-start pl-0.5"}`}
      >
        <span className="w-4 h-4 rounded-full bg-white" />
      </span>
    </button>
  );
}

// ── Menu item row (read-only — no Add to Cart) ────────────────────
function MenuItemRow({ item }) {
  return (
    <div
      className="bg-white rounded-2xl p-4 sm:p-5
        shadow-[0_2px_16px_rgba(29,59,42,0.04)]
        flex items-center justify-between gap-4"
    >
      <div className="flex-1 min-w-0">
        <h4 className="font-body font-bold text-ink text-base truncate">{item.name}</h4>
        <div className="flex items-center gap-2 mt-1">
          <p className="font-body font-semibold text-forest text-sm">₹{item.price}</p>
          <span className="text-cream-muted text-xs">•</span>
          <p className="font-body text-xs text-ink-faint italic">
            {/* Rating: null → neutral label; will show real value once ratings land */}
            {item.rating != null ? `${item.rating} ★` : "Not yet rated"}
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Skeleton loader ───────────────────────────────────────────────
function Skeleton() {
  return (
    <div className="min-h-screen bg-cream animate-pulse">
      <div className="h-48 sm:h-72 bg-cream-muted w-full" />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10">
        <div className="bg-white rounded-3xl p-6 shadow-sm h-36 mb-8" />
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 bg-white rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────
export default function OwnerDashboard() {
  const { user } = useAuth();

  const [restaurant,    setRestaurant]    = useState(null);
  const [menuItems,     setMenuItems]     = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);
  const [toggleLoading, setToggleLoading] = useState(false);
  const [toggleError,   setToggleError]   = useState(null);

  useEffect(() => {
    if (!user) return;

    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const rest = await getRestaurantByOwnerId(user.id);
        if (!rest) {
          // Owner account exists but no restaurant linked yet
          setRestaurant(null);
          setLoading(false);
          return;
        }
        const [menuData] = await Promise.all([
          getMenuItemsByRestaurant(rest.id),
        ]);
        setRestaurant(rest);
        setMenuItems(menuData);
      } catch (err) {
        console.error("[OwnerDashboard] loadData error:", err);
        setError(err.message || "Failed to load your restaurant data.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [user]);

  // ── Grouped menu ──────────────────────────────────────────────
  const categorizedMenu = useMemo(() => {
    if (!menuItems.length) return {};
    return menuItems.reduce((acc, item) => {
      const cat = item.category || "Other";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(item);
      return acc;
    }, {});
  }, [menuItems]);

  // ── Toggle open/closed ────────────────────────────────────────
  async function handleToggle() {
    if (!restaurant || toggleLoading) return;
    setToggleError(null);
    const newState = !restaurant.is_open;

    // Optimistic update
    setRestaurant((r) => ({ ...r, is_open: newState }));
    setToggleLoading(true);

    const { error: updateErr } = await updateIsOpen(restaurant.id, newState);
    setToggleLoading(false);

    if (updateErr) {
      // Revert on failure
      setRestaurant((r) => ({ ...r, is_open: !newState }));
      setToggleError("Couldn't update status. Please try again.");
    }
  }

  // ── Render states ─────────────────────────────────────────────
  if (loading) return <Skeleton />;

  if (error) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-4 text-center">
        <p className="font-display text-forest text-2xl mb-2">Something went wrong</p>
        <p className="font-body text-ink-muted mb-6">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2.5 rounded-xl bg-forest text-cream font-body font-semibold text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  // No restaurant linked to this owner account
  if (!restaurant) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-4 text-center gap-4">
        <div className="text-5xl">🍽️</div>
        <p className="font-display text-forest text-2xl font-bold">
          No restaurant linked yet
        </p>
        <p className="font-body text-ink-muted max-w-sm">
          Your owner account doesn't have a restaurant attached. Please contact
          support or complete your restaurant registration.
        </p>
        <Link
          to="/contact"
          className="mt-2 px-6 py-3 rounded-xl bg-burntorange text-cream
            font-body font-semibold text-sm hover:bg-[#C26214] transition-colors"
        >
          Contact Support
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream pb-16">

      {/* ── Banner ──────────────────────────────────────────────── */}
      <div className="relative h-48 sm:h-72 w-full overflow-hidden">
        <img
          src={getRestaurantImage(restaurant)}
          alt={restaurant.restaurant_name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.style.display = "none";
            e.target.parentNode.style.background = fallbackGradient(restaurant.id);
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/60 to-transparent" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 sm:-mt-24 relative z-10">

        {/* ── Info Card ───────────────────────────────────────── */}
        <div className="bg-white rounded-3xl p-6 sm:p-8
          shadow-[0_4px_24px_rgba(29,59,42,0.08)] mb-10">

          {/* Status toggle error */}
          {toggleError && (
            <div className="mb-4 px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl
              font-body text-sm text-red-600">
              {toggleError}
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5">
            <div className="flex-1">
              {/* Owner badge */}
              <p className="font-body text-[10px] font-bold tracking-[0.2em] uppercase
                text-burntorange mb-2">
                Your Restaurant
              </p>
              <h1 className="font-display font-black text-forest text-2xl sm:text-3xl lg:text-4xl leading-tight">
                {restaurant.restaurant_name}
              </h1>
              {restaurant.r_uid && (
                <p className="font-body text-xs text-ink-faint mt-1">ID: {restaurant.r_uid}</p>
              )}
              {restaurant.description && (
                <p className="font-body text-sm text-ink-muted mt-3 max-w-xl leading-relaxed">
                  {restaurant.description}
                </p>
              )}
              {restaurant.phone_number && (
                <p className="font-body text-sm text-ink-muted mt-2 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-forest" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  {restaurant.phone_number}
                </p>
              )}
            </div>

            {/* Open/Closed toggle — the dashboard's primary control */}
            <div className="shrink-0">
              <OpenToggle
                isOpen={restaurant.is_open}
                onToggle={handleToggle}
                loading={toggleLoading}
              />
              <p className="font-body text-xs text-ink-faint mt-2 text-center">
                Tap to {restaurant.is_open ? "close" : "open"}
              </p>
            </div>
          </div>
        </div>

        {/* ── Menu section ────────────────────────────────────── */}
        <div className="mb-8">
          <h2 className="font-display font-bold text-forest text-xl mb-6">
            Your Menu
          </h2>

          {Object.keys(categorizedMenu).length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl
              shadow-[0_2px_16px_rgba(29,59,42,0.04)]">
              <p className="text-3xl mb-3">🍽️</p>
              <p className="font-display text-forest text-lg mb-1">No menu items yet</p>
              <p className="font-body text-sm text-ink-muted">
                Contact support to add items to your menu.
              </p>
            </div>
          ) : (
            <div className="space-y-10">
              {Object.entries(categorizedMenu).map(([category, items]) => (
                <div key={category}>
                  <h3 className="font-display font-bold text-forest text-lg mb-4
                    pl-2 border-l-4 border-burntorange">
                    {category}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {items.map((item) => (
                      <MenuItemRow key={item.id} item={item} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
