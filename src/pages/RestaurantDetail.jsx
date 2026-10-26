/**
 * pages/RestaurantDetail.jsx
 * ──────────────────────────────────────────────────────────────────
 * Shows restaurant info and menu items. Handles adding items to cart.
 */

import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { getRestaurantById } from "../services/restaurants";
import { getMenuItemsByRestaurant } from "../services/menuItems";
import { useCart } from "../context/CartContext";
import { getRestaurantImage } from "../utils/restaurantImageFallbacks";

// ── Last-resort gradient (if Unsplash also fails to load) ───────────
const FALLBACK_GRADIENTS = [
  "linear-gradient(135deg, #F4D5B0 0%, #EDD9B8 100%)",
  "linear-gradient(135deg, #E8F0EB 0%, #D4E8DA 100%)",
  "linear-gradient(135deg, #FBE8D3 0%, #F4D5B0 100%)",
];
function fallbackGradient(id = "") {
  return FALLBACK_GRADIENTS[(id?.charCodeAt(0) ?? 0) % FALLBACK_GRADIENTS.length];
}

// ── Menu Item Card ────────────────────────────────────────────────
function MenuItemCard({ item, restaurant }) {
  const { addItem } = useCart();

  function handleAdd() {
    addItem({
      menuItemId: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
      restaurantId: restaurant.id,
      restaurantName: restaurant.restaurant_name,
      phoneNumber: restaurant.phone_number,
    });
  }

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-[0_2px_16px_rgba(29,59,42,0.04)]
      flex items-center justify-between gap-4 transition-all duration-300 hover:shadow-md">
      
      <div className="flex-1 min-w-0">
        <h4 className="font-body font-bold text-ink text-base truncate">{item.name}</h4>
        <div className="flex items-center gap-2 mt-1">
          <p className="font-body font-semibold text-forest text-sm">₹{item.price}</p>
          <span className="text-cream-muted text-xs">•</span>
          {/* Neutral rating state as requested */}
          <p className="font-body text-xs text-ink-faint italic">Not yet rated</p>
        </div>
      </div>

      <button
        onClick={handleAdd}
        className="w-10 h-10 rounded-full bg-forest/10 text-forest hover:bg-forest hover:text-cream
          flex items-center justify-center shrink-0 transition-colors duration-200"
        aria-label={`Add ${item.name} to cart`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  );
}

// ── Cart Summary Bar (Floating) ───────────────────────────────────
function CartSummaryBar() {
  const { itemCount, totalPrice } = useCart();

  if (itemCount === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 p-4 sm:p-6 pointer-events-none animate-slide-up">
      <div className="max-w-3xl mx-auto pointer-events-auto">
        <Link
          to="/cart"
          className="flex items-center justify-between w-full bg-forest text-cream 
            rounded-2xl px-5 py-4 shadow-xl hover:bg-forest-light transition-all duration-200
            focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-burntorange"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-cream/20 flex items-center justify-center font-bold font-body text-sm">
              {itemCount}
            </div>
            <span className="font-body font-semibold">View Cart</span>
          </div>
          <span className="font-body font-bold tracking-wide">₹{totalPrice}</span>
        </Link>
      </div>
    </div>
  );
}


// ── Main Page ─────────────────────────────────────────────────────
export default function RestaurantDetail() {
  const { id } = useParams();
  
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const [restData, menuData] = await Promise.all([
          getRestaurantById(id),
          getMenuItemsByRestaurant(id),
        ]);
        if (!restData) throw new Error("Restaurant not found");
        setRestaurant(restData);
        setMenuItems(menuData);
      } catch (err) {
        console.error("[RestaurantDetail] load error:", err);
        setError(err.message || "Failed to load restaurant details");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  // Group menu items by category
  const categorizedMenu = useMemo(() => {
    if (!menuItems.length) return {};
    return menuItems.reduce((acc, item) => {
      const cat = item.category || "Other";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(item);
      return acc;
    }, {});
  }, [menuItems]);

  if (loading) {
    return (
      <div className="min-h-screen bg-cream animate-pulse">
        <div className="h-48 sm:h-64 bg-cream-muted w-full" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10">
          <div className="bg-white rounded-3xl p-6 shadow-sm h-32 mb-8" />
          <div className="space-y-4">
            <div className="h-24 bg-white rounded-2xl" />
            <div className="h-24 bg-white rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-4 text-center">
        <p className="font-display text-forest text-2xl mb-2">Oops!</p>
        <p className="font-body text-ink-muted mb-6">{error || "Restaurant not found."}</p>
        <Link to="/home" className="text-burntorange hover:underline font-body font-semibold">
          ← Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream pb-32">
      {/* ── Header Banner ─────────────────────────────────────────── */}
      <div className="relative h-48 sm:h-72 w-full overflow-hidden">
        {/* Always use getRestaurantImage — real upload or cuisine-matched Unsplash */}
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
        
        {/* ── Info Card ────────────────────────────────────────── */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_4px_24px_rgba(29,59,42,0.08)] mb-10">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="font-display font-black text-forest text-2xl sm:text-3xl lg:text-4xl">
                  {restaurant.restaurant_name}
                </h1>
                {!restaurant.is_open && (
                  <span className="bg-ink/80 text-cream font-body font-bold text-xs uppercase tracking-wider px-2.5 py-1 rounded-full shrink-0">
                    Closed
                  </span>
                )}
              </div>
              
              {restaurant.description && (
                <p className="font-body text-sm sm:text-base text-ink-muted max-w-xl">
                  {restaurant.description}
                </p>
              )}
            </div>

            {/* Call to Order Button */}
            {restaurant.phone_number && (
              <a
                href={`tel:${restaurant.phone_number}`}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl
                  bg-burntorange text-cream font-body font-semibold text-sm shadow-md
                  hover:bg-[#C26214] transition-all duration-200 shrink-0"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                Call to Order
              </a>
            )}
          </div>
        </div>

        {/* ── Menu Section ─────────────────────────────────────── */}
        <div className="space-y-10">
          {Object.keys(categorizedMenu).length === 0 ? (
            <div className="text-center py-12">
              <p className="font-body text-ink-muted">No menu items found for this restaurant.</p>
            </div>
          ) : (
            Object.entries(categorizedMenu).map(([category, items]) => (
              <div key={category}>
                <h3 className="font-display font-bold text-forest text-xl mb-4 pl-2 border-l-4 border-burntorange">
                  {category}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {items.map(item => (
                    <MenuItemCard key={item.id} item={item} restaurant={restaurant} />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

      </div>

      <CartSummaryBar />
    </div>
  );
}
