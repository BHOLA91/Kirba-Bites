/**
 * components/restaurant/RestaurantCard.jsx
 * ──────────────────────────────────────────────────────────────────
 * A rich card for displaying a restaurant in the Home page grid.
 * Clicking navigates to /restaurant/:id.
 *
 * Props:
 *   restaurant  — row from the restaurants table
 *   {
 *     id, restaurant_name, r_uid, description, image_url,
 *     is_open, phone_number, created_at
 *   }
 */

import { Link } from "react-router-dom";
import { getRestaurantImage } from "../../utils/restaurantImageFallbacks";

// ── Star icon ─────────────────────────────────────────────────────
function StarIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 24 24"
      fill="currentColor" aria-hidden="true">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

// ── Tag pill ──────────────────────────────────────────────────────
function TagPill({ label }) {
  return (
    <span className="inline-block px-2 py-0.5 rounded-full
      bg-cream border border-cream-muted
      font-body font-semibold text-[10px] uppercase tracking-widest text-ink-muted">
      {label}
    </span>
  );
}

// ── Derive category tags from restaurant data ─────────────────────
// Since there's no dedicated category field yet, we infer from name/description.
// Replace this with a real categories field when the schema supports it.
function inferTags(restaurant) {
  const text = `${restaurant.restaurant_name} ${restaurant.description ?? ""}`.toLowerCase();
  const tags = [];
  if (/spice|curry|masala|desi/i.test(text))   tags.push("Spicy");
  if (/cafe|coffee|tea|chai/i.test(text))       tags.push("Café");
  if (/burger|grill|bbq/i.test(text))           tags.push("Grill");
  if (/pizza|pasta|italian/i.test(text))         tags.push("Italian");
  if (/chinese|noodle|wok/i.test(text))          tags.push("Chinese");
  if (/health|salad|vegan|veggie/i.test(text))   tags.push("Healthy");
  if (tags.length === 0)                         tags.push("All Day");
  return tags.slice(0, 2); // max 2 tags
}

// ── Real ratings will go here when available ───────────────────────
// When the menu_items or restaurant table supports ratings, fetch the
// real rating and pass it to this component.

// ── Last-resort gradient (only if network image also fails to load) ─
const FALLBACK_GRADIENTS = [
  "linear-gradient(135deg, #F4D5B0 0%, #EDD9B8 100%)",
  "linear-gradient(135deg, #E8F0EB 0%, #D4E8DA 100%)",
  "linear-gradient(135deg, #FBE8D3 0%, #F4D5B0 100%)",
];
function fallbackGradient(id = "") {
  return FALLBACK_GRADIENTS[id.charCodeAt(0) % FALLBACK_GRADIENTS.length];
}
function handleImgError(e, id, name) {
  // Replace broken img with a gradient+letter div
  const parent = e.target.parentNode;
  const div    = document.createElement("div");
  div.style.cssText = `width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:${fallbackGradient(id)}`;
  div.innerHTML = `<span style="font-size:3.5rem;font-weight:900;color:rgba(29,59,42,0.20);user-select:none">${(name?.[0] ?? "K").toUpperCase()}</span>`;
  parent.replaceChild(div, e.target);
}

// ── Main component ────────────────────────────────────────────────
export default function RestaurantCard({ restaurant, variant = "grid" }) {
  if (!restaurant) return null;

  const {
    id,
    restaurant_name,
    description,
    image_url,
    is_open = true,
  } = restaurant;

  const tags   = inferTags(restaurant);
  const isList = variant === "list";

  return (
    <Link
      to={`/restaurant/${id}`}
      className={`group block rounded-2xl overflow-hidden bg-white
        shadow-[0_2px_16px_rgba(29,59,42,0.07)]
        hover:shadow-[0_8px_32px_rgba(29,59,42,0.14)]
        hover:-translate-y-1 transition-all duration-300 focus-visible:ring-2
        focus-visible:ring-burntorange focus-visible:ring-offset-2
        ${isList ? "flex h-32" : ""}`}
      aria-label={`View ${restaurant_name}`}
    >
      {/* ── Image ───────────────────────────────────────────── */}
      <div className={`relative overflow-hidden ${isList ? "w-32 h-full flex-shrink-0" : "h-44 sm:h-48"}`}>
        {/* Always render an <img>: real URL if set, else cuisine-matched Unsplash fallback.
            onError last-resort: if even Unsplash fails, swap in gradient+letter. */}
        <img
          src={getRestaurantImage(restaurant)}
          alt={restaurant_name}
          className="w-full h-full object-cover group-hover:scale-105
            transition-transform duration-500 ease-out"
          loading="lazy"
          onError={(e) => handleImgError(e, id, restaurant_name)}
        />

        {/* Open/closed badge */}
        {!is_open && (
          <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm flex items-center justify-center">
            <span className="font-body font-bold text-sm text-cream tracking-wider uppercase
              bg-ink/60 px-4 py-1.5 rounded-full">
              Closed
            </span>
          </div>
        )}
      </div>

      {/* ── Body ────────────────────────────────────────────── */}
      <div className="p-4 space-y-2 flex flex-col justify-center">
        <h3 className="font-display font-bold text-forest text-lg leading-snug
          group-hover:text-forest-light transition-colors duration-150 line-clamp-1">
          {restaurant_name}
        </h3>

        {/* Tags */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {tags.map((tag) => <TagPill key={tag} label={tag} />)}
        </div>

        {/* Description */}
        {description && (
          <p className="font-body text-sm text-ink-muted leading-relaxed line-clamp-2">
            {description}
          </p>
        )}
      </div>
    </Link>
  );
}
