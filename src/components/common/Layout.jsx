/**
 * components/common/Layout.jsx  —  Shared page shell for authenticated routes
 * ──────────────────────────────────────────────────────────────────
 * Wraps page content with Navbar (top) + Footer (bottom).
 * Used by: Home, Orders, Account, Cart, Checkout, RestaurantDetail.
 * NOT used by: auth pages, landing page, CompleteProfile.
 *
 * Usage in AppRoutes.jsx:
 *   <Route path="/home" element={
 *     <ProtectedRoute>
 *       <Layout><Home /></Layout>
 *     </ProtectedRoute>
 *   } />
 */

import Navbar from "./Navbar";
import Footer from "./Footer";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <Navbar />
      {/* pt-16 reserves space for the fixed Navbar (h-16) */}
      <main className="flex-1 pt-16">
        {children}
      </main>
      <Footer />
    </div>
  );
}
