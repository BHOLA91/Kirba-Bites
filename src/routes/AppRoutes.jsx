/**
 * routes/AppRoutes.jsx  —  Kirba Bites client-side routing
 * ─────────────────────────────────────────────────────────────
 * All application routes are defined here using React Router v6.
 *
 * Route groups:
 *   Public   — Landing, Login, Signup
 *   Customer — Home, RestaurantDetail, Cart, Checkout, Orders, Account
 *   Owner    — OwnerLogin, OwnerSignup, OwnerDashboard
 *
 * TODO (when auth is wired):
 *   Wrap customer routes with <PrivateRoute role="customer" />
 *   Wrap owner routes with <PrivateRoute role="owner" />
 *   Redirect / → /home when already logged in as customer
 *   Redirect / → /owner/dashboard when already logged in as owner
 */

import { Routes, Route, Navigate } from "react-router-dom";

// ── Pages ──────────────────────────────────────────────────────
import LandingPage       from "../pages/LandingPage";
import Login             from "../pages/Login";
import Signup            from "../pages/Signup";
import Home              from "../pages/Home";
import RestaurantDetail  from "../pages/RestaurantDetail";
import Cart              from "../pages/Cart";
import Checkout          from "../pages/Checkout";
import Orders            from "../pages/Orders";
import Account           from "../pages/Account";
import OwnerLogin        from "../pages/OwnerLogin";
import OwnerSignup       from "../pages/OwnerSignup";
import OwnerDashboard    from "../pages/OwnerDashboard";

export default function AppRoutes() {
  return (
    <Routes>
      {/* ── Public routes ────────────────────────────────────── */}
      <Route path="/"            element={<LandingPage />} />
      <Route path="/login"       element={<Login />} />
      <Route path="/signup"      element={<Signup />} />

      {/* ── Customer routes ──────────────────────────────────── */}
      <Route path="/home"        element={<Home />} />
      <Route path="/restaurant/:id" element={<RestaurantDetail />} />
      <Route path="/cart"        element={<Cart />} />
      <Route path="/checkout"    element={<Checkout />} />
      <Route path="/orders"      element={<Orders />} />
      <Route path="/account"     element={<Account />} />

      {/* ── Owner routes ─────────────────────────────────────── */}
      <Route path="/owner/login"     element={<OwnerLogin />} />
      <Route path="/owner/signup"    element={<OwnerSignup />} />
      <Route path="/owner/dashboard" element={<OwnerDashboard />} />

      {/* ── Fallback ─────────────────────────────────────────── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
