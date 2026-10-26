/**
 * pages/Cart.jsx
 * ──────────────────────────────────────────────────────────────────
 * Shopping cart page — multi-restaurant grouping.
 *
 * Layout:
 *   - Items grouped by restaurant section
 *   - Per-item quantity stepper (decrement to 0 = remove)
 *   - Per-restaurant subtotal
 *   - Grand total + sticky "Place Order" CTA
 *   - Empty state with links back to browsing
 *
 * Place Order modal:
 *   - Full grouped order summary
 *   - Phone number per restaurant as tappable tel: link
 *   - "Order Placed" → saves to Supabase → clears cart → /orders
 */

import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { saveOrder } from "../services/orders";

// ── Quantity stepper ──────────────────────────────────────────────
function Stepper({ value, onDecrement, onIncrement }) {
  return (
    <div className="flex items-center gap-0 border border-cream-muted rounded-xl overflow-hidden">
      <button
        onClick={onDecrement}
        aria-label="Decrease quantity"
        className="w-9 h-9 flex items-center justify-center text-forest hover:bg-cream
          transition-colors duration-100 font-bold text-lg"
      >
        −
      </button>
      <span className="w-8 text-center font-body font-bold text-ink text-sm tabular-nums">
        {value}
      </span>
      <button
        onClick={onIncrement}
        aria-label="Increase quantity"
        className="w-9 h-9 flex items-center justify-center text-forest hover:bg-cream
          transition-colors duration-100 font-bold text-lg"
      >
        +
      </button>
    </div>
  );
}

// ── Per-restaurant cart section ────────────────────────────────────
function RestaurantSection({ group, onUpdate, onRemove }) {
  const subtotal = group.items.reduce((acc, i) => acc + i.price * i.quantity, 0);

  return (
    <div className="bg-white rounded-3xl overflow-hidden
      shadow-[0_2px_16px_rgba(29,59,42,0.06)] mb-5">

      {/* Header */}
      <div className="px-5 py-4 border-b border-cream-muted bg-cream/50
        flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-2 h-2 rounded-full bg-burntorange shrink-0" />
          <h3 className="font-display font-bold text-forest text-base leading-snug truncate">
            {group.restaurantName}
          </h3>
        </div>
        <span className="font-body text-xs text-ink-faint shrink-0">
          {group.items.length} {group.items.length === 1 ? "item" : "items"}
        </span>
      </div>

      {/* Items */}
      <div className="divide-y divide-cream-muted">
        {group.items.map((item) => (
          <div
            key={`${item.menuItemId}-${item.restaurantId}`}
            className="flex items-center gap-3 px-5 py-4"
          >
            <div className="flex-1 min-w-0">
              <p className="font-body font-semibold text-ink text-sm leading-snug truncate">
                {item.name}
              </p>
              <p className="font-body text-xs text-forest font-bold mt-0.5">
                ₹{item.price}
                {item.quantity > 1 && (
                  <span className="text-ink-faint font-normal">
                    {" "}× {item.quantity} = ₹{item.price * item.quantity}
                  </span>
                )}
              </p>
            </div>
            <Stepper
              value={item.quantity}
              onDecrement={() => {
                if (item.quantity === 1) {
                  onRemove(item.menuItemId, item.restaurantId);
                } else {
                  onUpdate(item.menuItemId, item.restaurantId, item.quantity - 1);
                }
              }}
              onIncrement={() =>
                onUpdate(item.menuItemId, item.restaurantId, item.quantity + 1)
              }
            />
          </div>
        ))}
      </div>

      {/* Subtotal */}
      <div className="px-5 py-3 bg-cream/30 border-t border-cream-muted
        flex items-center justify-between">
        <span className="font-body text-xs font-semibold text-ink-muted uppercase tracking-wide">
          Subtotal
        </span>
        <span className="font-body font-bold text-forest text-sm tabular-nums">
          ₹{subtotal}
        </span>
      </div>
    </div>
  );
}

// ── Place Order modal ─────────────────────────────────────────────
function PlaceOrderModal({ groups, grandTotal, onClose, onConfirm, saving }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center
        bg-ink/50 backdrop-blur-sm px-0 sm:px-4 animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="order-summary-title"
    >
      <div className="w-full sm:max-w-lg bg-white sm:rounded-3xl rounded-t-3xl
        shadow-2xl overflow-hidden">

        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-cream-muted">
          <div>
            <p className="font-body text-[10px] font-bold tracking-[0.18em] uppercase
              text-burntorange mb-0.5">
              Final Summary
            </p>
            <h2
              id="order-summary-title"
              className="font-display font-bold text-forest text-xl"
            >
              Your Order
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-full flex items-center justify-center
              text-ink-muted hover:bg-cream transition-colors duration-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none"
              viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="max-h-[65vh] overflow-y-auto px-6 py-5 space-y-6">
          {groups.map((group, gi) => (
            <div key={group.restaurantId} className="space-y-3">

              {/* Restaurant header — name + phone (the whole point) */}
              <div className="bg-forest/5 rounded-2xl p-4 space-y-2">
                <h3 className="font-display font-bold text-forest text-base leading-snug">
                  {group.restaurantName}
                </h3>
                {group.phoneNumber ? (
                  <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-burntorange shrink-0"
                      viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                    <a
                      href={`tel:${group.phoneNumber}`}
                      className="font-body font-bold text-burntorange text-sm
                        hover:underline active:opacity-80 transition-opacity"
                    >
                      {group.phoneNumber}
                    </a>
                    <span className="font-body text-xs text-ink-faint">
                      (tap to call)
                    </span>
                  </div>
                ) : (
                  <p className="font-body text-xs text-ink-faint italic">
                    Phone number not available
                  </p>
                )}
              </div>

              {/* Items for this restaurant */}
              <div className="space-y-2 pl-1">
                {group.items.map((item) => (
                  <div
                    key={`${item.menuItemId}-${item.restaurantId}`}
                    className="flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-body text-xs text-ink-faint tabular-nums shrink-0">
                        ×{item.quantity}
                      </span>
                      <span className="font-body text-sm text-ink truncate">
                        {item.name}
                      </span>
                    </div>
                    <span className="font-body font-semibold text-forest text-sm tabular-nums shrink-0">
                      ₹{item.price * item.quantity}
                    </span>
                  </div>
                ))}
                {/* Per-restaurant subtotal */}
                <div className="flex items-center justify-between pt-2 border-t border-cream-muted">
                  <span className="font-body text-xs font-semibold text-ink-muted uppercase tracking-wide">
                    Subtotal
                  </span>
                  <span className="font-body font-bold text-forest text-sm tabular-nums">
                    ₹{group.subtotal}
                  </span>
                </div>
              </div>

              {/* Divider between restaurants (not after last) */}
              {gi < groups.length - 1 && (
                <div className="border-t-2 border-dashed border-cream-muted pt-1" />
              )}
            </div>
          ))}
        </div>

        {/* Footer — grand total + confirm */}
        <div className="px-6 py-5 border-t border-cream-muted space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-display font-bold text-forest text-base">Grand Total</span>
            <span className="font-display font-black text-forest text-2xl tabular-nums">
              ₹{grandTotal}
            </span>
          </div>
          <p className="font-body text-xs text-ink-muted leading-relaxed">
            Call each restaurant above to place your order and communicate the
            items listed. Tap the phone number to dial directly.
          </p>
          <button
            onClick={onConfirm}
            disabled={saving}
            className="w-full py-4 rounded-2xl bg-forest text-cream
              font-body font-bold text-sm tracking-wide
              hover:bg-forest-light transition-all duration-150
              disabled:opacity-60 disabled:cursor-not-allowed
              hover:-translate-y-px hover:shadow-lg active:translate-y-0"
          >
            {saving ? "Saving order…" : "✓  Order Placed"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────
export default function Cart() {
  const { items, totalPrice, updateQty, removeItem, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [modalOpen, setModalOpen] = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [saveError, setSaveError] = useState(null);

  // Group cart items by restaurant
  const groups = useMemo(() => {
    const map = new Map();
    for (const item of items) {
      if (!map.has(item.restaurantId)) {
        map.set(item.restaurantId, {
          restaurantId:   item.restaurantId,
          restaurantName: item.restaurantName,
          phoneNumber:    item.phoneNumber ?? null,
          items:          [],
        });
      }
      map.get(item.restaurantId).items.push(item);
    }
    // Attach per-group subtotals
    return Array.from(map.values()).map((g) => ({
      ...g,
      subtotal: g.items.reduce((acc, i) => acc + i.price * i.quantity, 0),
    }));
  }, [items]);

  // ── Handlers ──────────────────────────────────────────────────
  function handleUpdate(menuItemId, restaurantId, qty) {
    updateQty(menuItemId, qty, restaurantId);
  }

  function handleRemove(menuItemId, restaurantId) {
    removeItem({ menuItemId, restaurantId });
  }

  async function handleConfirm() {
    setSaving(true);
    setSaveError(null);

    const orderDetails = {
      groups:     groups.map((g) => ({
        restaurantId:   g.restaurantId,
        restaurantName: g.restaurantName,
        phoneNumber:    g.phoneNumber,
        items:          g.items.map((i) => ({
          name:     i.name,
          price:    i.price,
          quantity: i.quantity,
          subtotal: i.price * i.quantity,
        })),
        subtotal: g.subtotal,
      })),
      grandTotal: totalPrice,
      placedAt:   new Date().toISOString(),
    };

    const { error } = await saveOrder({ userId: user?.id, orderDetails });
    setSaving(false);

    if (error) {
      setSaveError("Couldn't save your order. Please try again.");
      return;
    }

    // Success: close modal, clear cart, go to orders
    setModalOpen(false);
    clearCart();
    navigate("/orders");
  }

  // ── Empty state ────────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center
        p-4 text-center gap-5">
        <div className="text-5xl select-none" aria-hidden="true">🛒</div>
        <div>
          <h1 className="font-display font-black text-forest text-2xl mb-2">
            Your cart is empty
          </h1>
          <p className="font-body text-ink-muted text-sm max-w-xs mx-auto">
            You haven't added anything yet. Browse outlets or the full menu to get started.
          </p>
        </div>
        <div className="flex gap-3 flex-wrap justify-center">
          <Link
            to="/outlets"
            className="px-5 py-2.5 rounded-xl bg-forest text-cream font-body
              font-semibold text-sm hover:bg-forest-light transition-colors duration-150"
          >
            Browse Outlets
          </Link>
          <Link
            to="/menu"
            className="px-5 py-2.5 rounded-xl border-2 border-forest text-forest
              font-body font-semibold text-sm hover:bg-forest hover:text-cream
              transition-all duration-150"
          >
            Browse Menu
          </Link>
        </div>
      </div>
    );
  }

  // ── Filled cart ────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-cream pb-36">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">

        {/* Header */}
        <div className="mb-8">
          <p className="font-body text-xs font-bold tracking-[0.2em] uppercase
            text-burntorange mb-2">
            Review
          </p>
          <h1 className="font-display font-black text-forest text-3xl sm:text-4xl">
            Your Cart
          </h1>
          <p className="font-body text-ink-muted mt-2 text-sm">
            {items.length} {items.length === 1 ? "item" : "items"} across{" "}
            {groups.length} {groups.length === 1 ? "restaurant" : "restaurants"}
          </p>
        </div>

        {/* Restaurant sections */}
        {groups.map((group) => (
          <RestaurantSection
            key={group.restaurantId}
            group={group}
            onUpdate={handleUpdate}
            onRemove={handleRemove}
          />
        ))}

        {/* Grand total */}
        <div className="bg-white rounded-3xl px-6 py-5 mb-6
          shadow-[0_2px_16px_rgba(29,59,42,0.06)]
          flex items-center justify-between">
          <span className="font-display font-bold text-forest text-lg">Grand Total</span>
          <span className="font-display font-black text-forest text-2xl tabular-nums">
            ₹{totalPrice}
          </span>
        </div>

        {/* Save error */}
        {saveError && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl
            font-body text-sm text-red-600">
            {saveError}
          </div>
        )}

      </div>

      {/* Sticky Place Order CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-40 p-4 sm:p-6
        bg-gradient-to-t from-cream via-cream to-transparent pointer-events-none">
        <div className="max-w-2xl mx-auto pointer-events-auto">
          <button
            onClick={() => setModalOpen(true)}
            className="w-full py-4 rounded-2xl bg-forest text-cream
              font-body font-bold text-base tracking-wide shadow-xl
              hover:bg-forest-light hover:-translate-y-0.5 hover:shadow-2xl
              active:translate-y-0 transition-all duration-150
              flex items-center justify-center gap-3"
          >
            <span>Place Order</span>
            <span className="font-body font-black tabular-nums">₹{totalPrice}</span>
          </button>
        </div>
      </div>

      {/* Place Order modal */}
      {modalOpen && (
        <PlaceOrderModal
          groups={groups}
          grandTotal={totalPrice}
          onClose={() => { if (!saving) setModalOpen(false); }}
          onConfirm={handleConfirm}
          saving={saving}
        />
      )}
    </div>
  );
}
