/**
 * components/home/SuspendedCravings.jsx
 * ──────────────────────────────────────────────────────────────────
 * "SUSPENDED CRAVINGS" section — featured/popular menu items
 * displayed as circular food photos with name + price below.
 *
 * ⚠️  PLACEHOLDER DATA — Replace with a real Supabase query once the
 * menu_items table exists. The query should look something like:
 *
 *   supabase
 *     .from("menu_items")
 *     .select("id, name, price, image_url, restaurant_id, restaurants(restaurant_name)")
 *     .eq("is_featured", true)
 *     .limit(8)
 *
 * The component shape is already data-driven; swap PLACEHOLDER_ITEMS
 * for real data from a useEffect / service call.
 */

import { Link } from "react-router-dom";

// ── PLACEHOLDER DATA ──────────────────────────────────────────────
// TODO: replace with real Supabase query when menu_items table is created.
const PLACEHOLDER_ITEMS = [
  {
    id: "p1",
    name: "Butter Chicken",
    price: 180,
    image_url: null,
    emoji: "🍗",
    bg: "linear-gradient(135deg, #F4D5B0 0%, #D9711A33 100%)",
    restaurantId: null,
  },
  {
    id: "p2",
    name: "Veg Biryani",
    price: 120,
    image_url: null,
    emoji: "🍚",
    bg: "linear-gradient(135deg, #E8F0EB 0%, #1D3B2A22 100%)",
    restaurantId: null,
  },
  {
    id: "p3",
    name: "Masala Dosa",
    price: 80,
    image_url: null,
    emoji: "🥞",
    bg: "linear-gradient(135deg, #FBE8D3 0%, #E8893B33 100%)",
    restaurantId: null,
  },
  {
    id: "p4",
    name: "Paneer Wrap",
    price: 100,
    image_url: null,
    emoji: "🌯",
    bg: "linear-gradient(135deg, #EDD9B8 0%, #D9711A22 100%)",
    restaurantId: null,
  },
  {
    id: "p5",
    name: "Cold Coffee",
    price: 60,
    image_url: null,
    emoji: "☕",
    bg: "linear-gradient(135deg, #F5E3C8 0%, #5C574622 100%)",
    restaurantId: null,
  },
  {
    id: "p6",
    name: "Cheese Burger",
    price: 140,
    image_url: null,
    emoji: "🍔",
    bg: "linear-gradient(135deg, #FBF0E1 0%, #D9711A22 100%)",
    restaurantId: null,
  },
  {
    id: "p7",
    name: "Mango Lassi",
    price: 50,
    image_url: null,
    emoji: "🥭",
    bg: "linear-gradient(135deg, #F4D5B0 0%, #E8893B22 100%)",
    restaurantId: null,
  },
  {
    id: "p8",
    name: "Aloo Tikki",
    price: 45,
    image_url: null,
    emoji: "🥔",
    bg: "linear-gradient(135deg, #E8F0EB 0%, #1D3B2A11 100%)",
    restaurantId: null,
  },
];

// ── Item circle card ──────────────────────────────────────────────
function ItemCard({ item }) {
  const inner = (
    <>
      {/* Circle */}
      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden mx-auto
        shadow-md hover:shadow-xl transition-shadow duration-300
        group-hover:scale-105 transition-transform duration-300">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl"
            style={{ background: item.bg }}>
            <span role="img" aria-label={item.name}>{item.emoji}</span>
          </div>
        )}
      </div>

      {/* Text */}
      <div className="text-center mt-3">
        <p className="font-body font-semibold text-sm text-ink leading-snug line-clamp-1">
          {item.name}
        </p>
        <p className="font-body text-xs text-burntorange font-bold mt-0.5">
          ₹{item.price}
        </p>
      </div>
    </>
  );

  // Link to restaurant detail if we have a restaurantId, otherwise just a div
  if (item.restaurantId) {
    return (
      <Link
        to={`/restaurant/${item.restaurantId}`}
        className="group flex flex-col items-center w-full cursor-pointer"
      >
        {inner}
      </Link>
    );
  }
  return <div className="group flex flex-col items-center w-full">{inner}</div>;
}

// ── Main section ──────────────────────────────────────────────────
export default function SuspendedCravings() {
  return (
    <section className="py-12 sm:py-16" aria-labelledby="cravings-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <div className="flex items-end justify-between mb-8 sm:mb-10">
          <div>
            <p className="font-body text-xs font-bold tracking-[0.2em] uppercase
              text-burntorange mb-2">
              Popular Right Now
            </p>
            <h2 id="cravings-heading"
              className="font-display font-bold text-forest text-2xl sm:text-3xl leading-tight">
              Suspended Cravings
            </h2>
            <p className="font-body text-sm text-ink-muted mt-1.5 max-w-md">
              The most-ordered dishes on campus today
            </p>
          </div>
          <Link
            to="/home"
            className="font-body text-xs font-bold tracking-widest uppercase
              text-forest hover:text-burntorange border-b border-current
              transition-colors duration-150 pb-0.5 shrink-0 ml-4"
          >
            See All
          </Link>
        </div>

        {/* Horizontal scroll on mobile, grid on desktop */}
        <div className="flex gap-5 overflow-x-auto sm:overflow-visible pb-4 sm:pb-0
          sm:grid sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 sm:gap-6
          scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
          {PLACEHOLDER_ITEMS.map((item) => (
            <div key={item.id} className="shrink-0 w-28 sm:w-auto">
              <ItemCard item={item} />
            </div>
          ))}
        </div>

        {/* Placeholder notice (visible in dev, easy to remove) */}
        <p className="mt-6 font-body text-[10px] text-ink-faint text-center">
          {/* TODO: Remove when menu_items table and real data query are implemented */}
          Showing curated placeholder items — wire to <code>menu_items</code> table when available.
        </p>
      </div>
    </section>
  );
}
