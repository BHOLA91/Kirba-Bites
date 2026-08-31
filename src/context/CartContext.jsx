/**
 * context/CartContext.jsx  —  Shopping cart context skeleton
 * ─────────────────────────────────────────────────────────────
 * Manages the user's in-progress order:
 *   • Items added from a single restaurant's menu
 *   • Quantity adjustments
 *   • Cart clearing on checkout / restaurant switch
 *
 * NOTE: Kirba Bites does NOT process payments — the cart is used
 * to compile an order summary that the customer communicates to
 * the restaurant by phone. The "checkout" step just records that
 * the call was made and stores the order in history.
 *
 * One-restaurant rule: if the user adds an item from a different
 * restaurant than the current cart, warn them and offer to clear.
 * This logic should be enforced in addItem() when backend is ready.
 */

import { createContext, useContext, useReducer, useCallback } from "react";

// ── Cart item shape ───────────────────────────────────────────
// {
//   menuItemId: string,
//   name:       string,
//   price:      number,
//   quantity:   number,
//   restaurantId: string,
//   restaurantName: string,
// }

// ── Reducer ───────────────────────────────────────────────────
function cartReducer(state, action) {
  switch (action.type) {
    case "ADD_ITEM": {
      const existing = state.items.find(
        (i) => i.menuItemId === action.payload.menuItemId
      );
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.menuItemId === action.payload.menuItemId
              ? { ...i, quantity: i.quantity + (action.payload.quantity || 1) }
              : i
          ),
        };
      }
      return {
        ...state,
        restaurantId: action.payload.restaurantId,
        restaurantName: action.payload.restaurantName,
        items: [...state.items, { ...action.payload, quantity: action.payload.quantity || 1 }],
      };
    }

    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter((i) => i.menuItemId !== action.payload),
      };

    case "UPDATE_QUANTITY":
      return {
        ...state,
        items: state.items.map((i) =>
          i.menuItemId === action.payload.menuItemId
            ? { ...i, quantity: Math.max(0, action.payload.quantity) }
            : i
        ).filter((i) => i.quantity > 0),
      };

    case "CLEAR_CART":
      return initialState;

    default:
      return state;
  }
}

const initialState = {
  restaurantId: null,
  restaurantName: null,
  items: [],
};

// ── Context ───────────────────────────────────────────────────
const CartContext = createContext({
  restaurantId: null,
  restaurantName: null,
  items:        [],
  itemCount:    0,
  totalPrice:   0,
  addItem:      () => {},
  removeItem:   () => {},
  updateQty:    () => {},
  clearCart:    () => {},
});

// ── Provider component ────────────────────────────────────────
export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  const addItem = useCallback(
    (item) => {
      if (state.restaurantId && state.restaurantId !== item.restaurantId) {
        const confirmClear = window.confirm(
          `Your cart has items from ${state.restaurantName || "another restaurant"}. Starting a new order will clear it — continue?`
        );
        if (!confirmClear) return;
        dispatch({ type: "CLEAR_CART" });
      }
      dispatch({ type: "ADD_ITEM", payload: item });
    },
    [state.restaurantId, state.restaurantName]
  );

  const removeItem = useCallback((id)   => dispatch({ type: "REMOVE_ITEM",     payload: id }),             []);
  const updateQty  = useCallback((id, qty) => dispatch({ type: "UPDATE_QUANTITY", payload: { menuItemId: id, quantity: qty } }), []);
  const clearCart  = useCallback(()    => dispatch({ type: "CLEAR_CART" }),                                []);

  const itemCount  = state.items.reduce((acc, i) => acc + i.quantity, 0);
  const totalPrice = state.items.reduce((acc, i) => acc + i.price * i.quantity, 0);

  const value = {
    restaurantId: state.restaurantId,
    restaurantName: state.restaurantName,
    items:        state.items,
    itemCount,
    totalPrice,
    addItem,
    removeItem,
    updateQty,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// ── Convenience hook ──────────────────────────────────────────
export function useCart() {
  return useContext(CartContext);
}

export default CartContext;
