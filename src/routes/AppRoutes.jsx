/**
 * routes/AppRoutes.jsx  —  Kirba Bites client-side routing
 * ──────────────────────────────────────────────────────────────────
 * Route groups:
 *   Public     — Landing, Login, Signup, OwnerLogin, OwnerSignup
 *   Onboarding — /complete-profile (incomplete-profile gate)
 *                /oauth-complete   (Supabase redirect → aliases to above)
 *   Customer   — Home, RestaurantDetail, Cart, Checkout, Orders, Account
 *                (all gated by <ProtectedRoute> + wrapped in <Layout>)
 *   Owner      — OwnerDashboard
 *                (gated by <ProtectedRoute requiredRole="owner"> + <Layout>)
 *   Fallback   — * → /
 *
 * Layout.jsx adds Navbar + Footer to all authenticated routes.
 * Auth pages and landing page have their own full-page layouts — no Layout.
 *
 * ProtectedRoute checks (in order):
 *  1. loading          → shows loader
 *  2. !user            → /login or /owner/login
 *  3. !profileComplete → /complete-profile
 *  4. requiredRole mismatch → /
 *  5. renders children
 */

import { Routes, Route, Navigate } from "react-router-dom";

// ── Auth / shell ───────────────────────────────────────────────────
import ProtectedRoute   from "../components/auth/ProtectedRoute";
import Layout           from "../components/common/Layout";

// ── Pages ──────────────────────────────────────────────────────────
import LandingPage      from "../pages/LandingPage";
import Login            from "../pages/Login";
import Signup           from "../pages/Signup";
import OAuthComplete    from "../pages/OAuthComplete";
import Home             from "../pages/Home";
import Outlets          from "../pages/Outlets";
import RestaurantDetail from "../pages/RestaurantDetail";
import Cart             from "../pages/Cart";
import Checkout         from "../pages/Checkout";
import Orders           from "../pages/Orders";
import Account          from "../pages/Account";
import OwnerLogin       from "../pages/OwnerLogin";
import OwnerSignup      from "../pages/OwnerSignup";
import OwnerDashboard   from "../pages/OwnerDashboard";

// ── Helper: wrap a page in ProtectedRoute + Layout ────────────────
function AppPage({ children, requiredRole }) {
  return (
    <ProtectedRoute requiredRole={requiredRole}>
      <Layout>{children}</Layout>
    </ProtectedRoute>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* ── Public routes ────────────────────────────────────── */}
      <Route path="/"             element={<LandingPage />} />
      <Route path="/login"        element={<Login />} />
      <Route path="/signup"       element={<Signup />} />
      <Route path="/owner/login"  element={<OwnerLogin />} />
      <Route path="/owner/signup" element={<OwnerSignup />} />

      {/* ── Profile completion / Google OAuth onboarding ─────── */}
      {/* Not behind ProtectedRoute — handled internally by the page */}
      <Route path="/complete-profile" element={<OAuthComplete />} />
      <Route path="/oauth-complete"   element={<Navigate to="/complete-profile" replace />} />

      {/* ── Customer routes ───────────────────────────────────── */}
      <Route path="/home"           element={<AppPage><Home /></AppPage>} />
      <Route path="/outlets"        element={<AppPage><Outlets /></AppPage>} />
      <Route path="/restaurant/:id" element={<AppPage><RestaurantDetail /></AppPage>} />
      <Route path="/cart"           element={<AppPage><Cart /></AppPage>} />
      <Route path="/checkout"       element={<AppPage><Checkout /></AppPage>} />
      <Route path="/orders"         element={<AppPage><Orders /></AppPage>} />
      <Route path="/account"        element={<AppPage><Account /></AppPage>} />

      {/* ── Owner routes ──────────────────────────────────────── */}
      <Route
        path="/owner/dashboard"
        element={<AppPage requiredRole="owner"><OwnerDashboard /></AppPage>}
      />

      {/* ── Fallback ─────────────────────────────────────────── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
