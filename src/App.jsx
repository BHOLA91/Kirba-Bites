/**
 * App.jsx  —  Root component: wraps providers and renders routes
 * ─────────────────────────────────────────────────────────────────
 * Provider hierarchy (outermost → innermost):
 *   BrowserRouter  (React Router)
 *     AuthProvider (AuthContext)
 *       CartProvider (CartContext)
 *         AppRoutes  (all page routes)
 *
 * This ordering means:
 *  • Any route can access auth state (useAuth hook)
 *  • Any route can access cart state (useCart hook)
 *  • Auth context can be checked inside route guards later
 */

import { BrowserRouter } from "react-router-dom";
import { AuthProvider }  from "./context/AuthContext";
import { CartProvider }  from "./context/CartContext";
import AppRoutes         from "./routes/AppRoutes";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <AppRoutes />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
