/**
 * components/menu/CrossOutletItemCard.jsx
 * ──────────────────────────────────────────────────────────────────
 * Card for a single grouped dish in the cross-restaurant Menu page.
 *
 * Shows:
 *   - Veg/non-veg indicator dot
 *   - Item name
 *   - "from ₹X" (lowest price) or single price if one outlet only
 *   - "X outlets" badge if multiple restaurants carry this dish
 *
 * Clicking the card fires onSelect() to open the outlet detail modal.
 *
 * Props:
 *   item      — grouped dish { name, category, outlets: [...] }
 *   onSelect  — fn(item) called when the card is clicked
 */

import { isVeg } from "../../utils/isVegItem";

// ── Veg / Non-veg indicator (Indian food convention) ──────────────
function VegDot({ veg }) {
  return (
    <span
      title={veg ? "Vegetarian" : "Non-vegetarian"}
      className={`inline-flex items-center justify-center w-4 h-4 rounded-sm border-2 shrink-0
        ${veg ? "border-emerald-600" : "border-red-500"}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${veg ? "bg-emerald-600" : "bg-red-500"}`} />
    </span>
  );
}

export default function CrossOutletItemCard({ item, onSelect }) {
  const veg = isVeg(item.name);

  // Price display: "from ₹X" when multiple outlets, else single price
  const prices = item.outlets.map((o) => o.price);
  const minPrice = Math.min(...prices);
  const priceLabel = item.outlets.length > 1
    ? `from ₹${minPrice}`
    : `₹${prices[0]}`;

  return (
    <button
      onClick={() => onSelect(item)}
      className="group w-full text-left bg-white rounded-2xl p-4
        shadow-[0_2px_12px_rgba(29,59,42,0.05)]
        hover:shadow-[0_6px_24px_rgba(29,59,42,0.12)]
        hover:-translate-y-0.5 transition-all duration-200
        focus-visible:ring-2 focus-visible:ring-burntorange focus-visible:ring-offset-2
        flex items-center justify-between gap-3"
      aria-label={`${item.name} — ${priceLabel}`}
    >
      {/* Left: indicator + name + price */}
      <div className="flex items-start gap-2.5 min-w-0 flex-1">
        <span className="mt-0.5 shrink-0">
          <VegDot veg={veg} />
        </span>
        <div className="min-w-0">
          <p className="font-body font-semibold text-ink text-sm leading-snug
            group-hover:text-forest transition-colors duration-150 truncate">
            {item.name}
          </p>
          <p className="font-body font-bold text-forest text-sm mt-0.5">
            {priceLabel}
          </p>
        </div>
      </div>

      {/* Right: outlet count badge + chevron */}
      <div className="flex items-center gap-2 shrink-0">
        {item.outlets.length > 1 && (
          <span className="font-body text-[10px] font-bold tracking-wide uppercase
            text-burntorange bg-burntorange/10 px-2 py-0.5 rounded-full whitespace-nowrap">
            {item.outlets.length} outlets
          </span>
        )}
        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-ink-faint
          group-hover:text-forest transition-colors duration-150" fill="none"
          viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </button>
  );
}
