/**
 * components/auth/ProtectedRoute.jsx
 * ──────────────────────────────────────────────────────────────────
 * Route guard for authenticated (and optionally role-gated) routes.
 *
 * Usage in AppRoutes.jsx:
 *
 *   // Any authenticated user:
 *   <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
 *
 *   // Owner-only:
 *   <Route
 *     path="/owner/dashboard"
 *     element={<ProtectedRoute requiredRole="owner"><OwnerDashboard /></ProtectedRoute>}
 *   />
 *
 * Behavior (checked in order):
 *  1. loading         → shows a full-screen loader (avoids flash-redirect on refresh)
 *  2. !user           → redirects to /login (or /owner/login for owner routes)
 *  3. !profileComplete → redirects to /complete-profile (first-time Google OAuth user)
 *  4. requiredRole mismatch → redirects to / (landing page)
 *  5. All clear       → renders children
 *
 * Props:
 *  children      ReactNode   — the page component to render if auth passes
 *  requiredRole  "customer" | "owner" | undefined — if set, also checks role
 */

import { Navigate }  from "react-router-dom";
import { useAuth }   from "../../context/AuthContext";
import Loader        from "../common/Loader";

export default function ProtectedRoute({ children, requiredRole }) {
  const { user, role, profileComplete, loading } = useAuth();

  // ── 1. Still resolving the initial session ─────────────────────
  // Show a loader instead of flashing a redirect on page refresh.
  if (loading) {
    return (
      <div className="fixed inset-0 bg-cream flex items-center justify-center">
        <Loader isVisible />
      </div>
    );
  }

  // ── 2. Not authenticated at all ───────────────────────────────
  if (!user) {
    const loginPath = requiredRole === "owner" ? "/owner/login" : "/login";
    return <Navigate to={loginPath} replace />;
  }

  // ── 3. Authenticated but profile is incomplete ────────────────
  // This catches first-time Google OAuth users who signed in but
  // haven't gone through the /complete-profile onboarding form yet.
  // Their profiles row exists (created by trigger) but role/username
  // are still NULL.
  if (!profileComplete) {
    return <Navigate to="/complete-profile" replace />;
  }

  // ── 4. Authenticated but wrong role ───────────────────────────
  // e.g. a customer trying to reach /owner/dashboard
  if (requiredRole && role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  // ── 5. All checks passed ──────────────────────────────────────
  return children;
}
