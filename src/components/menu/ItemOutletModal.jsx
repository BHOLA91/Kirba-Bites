/**
 * components/menu/ItemOutletModal.jsx
 * ──────────────────────────────────────────────────────────────────
 * Modal that opens when a cross-outlet item card is clicked.
 *
 * Shows:
 *   - Item name heading
 *   - Veg / Non-veg indicator
 *   - One row per outlet offering this item: restaurant name,
 *     price, and an "Add to Cart" button that reuses CartContext
 *     (including the existing cross-restaurant confirmation prompt)
 *   - Close via ✕ button or clicking the backdrop
 *
 * Props:
 *   item     — grouped dish object { name, category, outlets: [...] }
 *   onClose  — fn to call when the modal should close
 */

import { useEffect } from "react";
import { useCart } from "../../context/CartContext";
import { isVeg } from "../../utils/isVegItem";

// ── Veg / Non-veg dot (Indian food-app convention) ────────────────
function VegDot({ veg }) {
  return (
    <span
      title={veg ? "Vegetarian" : "Non-vegetarian"}
      className={`inline-flex items-center justify-center w-4.5 h-4.5 rounded-sm border-2 shrink-0
        ${veg ? "border-emerald-600" : "border-red-500"}`}
    >
      <span
        className={`w-2 h-2 rounded-full
          ${veg ? "bg-emerald-600" : "bg-red-500"}`}
      />
    </span>
  );
}

export default function ItemOutletModal({ item, onClose }) {
  const { addItem } = useCart();
  const veg = isVeg(item.name);

  // Close on Escape key
  useEffect(() => {
    function onKey(e) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onKey);
    // Prevent body scroll while open
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  function handleAdd(outlet) {
    addItem({
      menuItemId:     outlet.menuItemId,
      name:           item.name,
      price:          outlet.price,
      quantity:       1,
      restaurantId:   outlet.restaurantId,
      restaurantName: outlet.restaurantName,
      phoneNumber:    outlet.phoneNumber,
    });
    onClose();
  }

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center
        bg-ink/50 backdrop-blur-sm px-0 sm:px-4 animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-item-name"
    >
      {/* Panel */}
      <div className="w-full sm:max-w-lg bg-white sm:rounded-3xl rounded-t-3xl
        shadow-2xl overflow-hidden animate-slide-up sm:animate-fade-in">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 p-6 pb-4 border-b border-cream-muted">
          <div className="flex items-center gap-2.5 min-w-0">
            <VegDot veg={veg} />
            <h2
              id="modal-item-name"
              className="font-display font-bold text-forest text-xl leading-snug"
            >
              {item.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0
              text-ink-muted hover:bg-cream hover:text-ink transition-colors duration-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none"
              viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Category badge */}
        <div className="px-6 pt-3 pb-1">
          <span className="font-body text-[10px] font-bold tracking-[0.16em] uppercase
            text-burntorange">
            {item.category}
          </span>
        </div>

        {/* Outlet list */}
        <div className="px-6 pb-6 max-h-[60vh] overflow-y-auto space-y-3 pt-2">
          {item.outlets.map((outlet) => (
            <div
              key={outlet.menuItemId}
              className="flex items-center justify-between gap-3 p-4 rounded-2xl
                bg-cream/70 border border-cream-muted
                hover:border-forest/20 transition-colors duration-150"
            >
              <div className="min-w-0">
                <p className="font-body font-semibold text-ink text-sm truncate">
                  {outlet.restaurantName}
                </p>
                <p className="font-body font-bold text-forest text-base mt-0.5">
                  ₹{outlet.price}
                </p>
              </div>
              <button
                onClick={() => handleAdd(outlet)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl
                  bg-forest text-cream font-body font-bold text-xs tracking-wide uppercase
                  hover:bg-forest-light hover:-translate-y-px hover:shadow-md
                  active:translate-y-0 transition-all duration-150 shrink-0"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none"
                  viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Add
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
