/**
 * pages/LandingPage.jsx  —  Kirba Bites entry point for new visitors
 * ──────────────────────────────────────────────────────────────────
 * Layout (top → bottom):
 *
 *  ① Background — slow warm-toned gradient blobs (prefers-reduced-motion safe)
 *  ② Full-screen centred hero section:
 *     • KirbaWordmark (large) with cloche icon + leaf accent
 *     • Tagline: "GOOD FOOD. GREAT CHOICES."
 *     • Sub-copy: human, campus-specific one-liner
 *     • CTA buttons: "Login" (filled forest) + "Sign Up" (outlined orange)
 *  ③ Minimal footer credit line
 *
 * Notes:
 *  • All text fades in sequentially after the loader disappears.
 *  • Blob animation is paused when prefers-reduced-motion: reduce.
 *  • No Navbar here — the landing page is intentionally minimal / focused
 *    on conversion. Navbar is shown after login on /home etc.
 */

import { useEffect, useState } from "react";
import { Link }                from "react-router-dom";
import Loader                  from "../components/common/Loader";
import KirbaWordmark           from "../components/common/KirbaWordmark";

// ─────────────────────────────────────────────────────────────────
// BackgroundBlobs — slow, organic warm-gradient orbs
// ─────────────────────────────────────────────────────────────────
/**
 * Three large blurred blobs that drift very slowly across the cream
 * background. They suggest warmth and life without being distracting.
 * The animation is disabled via CSS media query in index.css when
 * the user prefers reduced motion.
 */
function BackgroundBlobs() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden="true"
    >
      {/* Blob 1 — soft forest green, top-left */}
      <div
        className="animate-blob-drift absolute rounded-full opacity-[0.12]"
        style={{
          width: "min(60vw, 480px)",
          height: "min(60vw, 480px)",
          top: "-15%",
          left: "-10%",
          background:
            "radial-gradient(circle at 40% 40%, #2A5440 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      {/* Blob 2 — burnt orange, bottom-right */}
      <div
        className="animate-blob-drift-delay absolute rounded-full opacity-[0.13]"
        style={{
          width: "min(55vw, 440px)",
          height: "min(55vw, 440px)",
          bottom: "-12%",
          right: "-8%",
          background:
            "radial-gradient(circle at 60% 60%, #D9711A 0%, transparent 70%)",
          filter: "blur(55px)",
        }}
      />

      {/* Blob 3 — warm amber, center-bottom — anchors the composition */}
      <div
        className="animate-blob-drift-slow absolute rounded-full opacity-[0.08]"
        style={{
          width: "min(45vw, 360px)",
          height: "min(45vw, 360px)",
          bottom: "10%",
          left: "25%",
          background:
            "radial-gradient(circle at 50% 50%, #E8893B 0%, transparent 70%)",
          filter: "blur(50px)",
        }}
      />

      {/* Faint food-motif line art — grain/texture overlay for warmth */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.025]"
        xmlns="http://www.w3.org/2000/svg"
        style={{ mixBlendMode: "multiply" }}
      >
        <defs>
          <pattern
            id="foodgrid"
            x="0"
            y="0"
            width="80"
            height="80"
            patternUnits="userSpaceOnUse"
          >
            {/* Small fork silhouette, repeated as a subtle texture */}
            <path
              d="M20 10 L20 30 M17 10 L17 20 M23 10 L23 20 M17 20 Q20 26 20 30"
              stroke="#1D3B2A"
              strokeWidth="1"
              fill="none"
              strokeLinecap="round"
            />
            {/* Small leaf */}
            <path
              d="M55 20 C55 14 50 11 55 8 C60 11 55 14 55 20Z"
              fill="#D9711A"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#foodgrid)" />
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// CTAButton — Landing page call-to-action button styles
// ─────────────────────────────────────────────────────────────────
/**
 * Two variants:
 *  "filled"  → forest green bg, cream text  (primary CTA)
 *  "outline" → burnt-orange border + text   (secondary CTA)
 *
 * Both use React Router <Link> so they route without page reload.
 */
function CTAButton({ to, children, variant = "filled" }) {
  const base =
    "inline-flex items-center justify-center px-8 py-3.5 rounded-full " +
    "font-body font-semibold text-base tracking-wide " +
    "transition-all duration-200 focus-visible:ring-2 " +
    "focus-visible:ring-offset-2 focus-visible:ring-burntorange";

  const variants = {
    filled:
      "bg-forest text-cream shadow-md hover:bg-forest-light " +
      "hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0",
    outline:
      "border-2 border-burntorange text-burntorange bg-transparent " +
      "hover:bg-burntorange hover:text-cream hover:-translate-y-0.5 " +
      "active:translate-y-0",
  };

  return (
    <Link to={to} className={`${base} ${variants[variant]}`}>
      {children}
    </Link>
  );
}

// ─────────────────────────────────────────────────────────────────
// LandingPage
// ─────────────────────────────────────────────────────────────────
export default function LandingPage() {
  // ── Loader state ──────────────────────────────────────────────
  // showLoader  — whether the Loader component is rendered at all
  // loaderVisible — controls the loader's opacity (for its fade-out)
  const [showLoader,    setShowLoader]    = useState(true);
  const [loaderVisible, setLoaderVisible] = useState(true);
  const [pageVisible,   setPageVisible]   = useState(false);

  useEffect(() => {
    // Phase 1 (0 → 1800ms): loader is fully visible
    const startFadeOut = setTimeout(() => {
      setLoaderVisible(false); // triggers loader's own opacity → 0 transition
    }, 1800);

    // Phase 2 (1800ms → 2300ms): loader CSS transition plays (500ms)
    // After that, unmount the loader and reveal the landing page
    const unmountLoader = setTimeout(() => {
      setShowLoader(false);
      setPageVisible(true);
    }, 2300);

    return () => {
      clearTimeout(startFadeOut);
      clearTimeout(unmountLoader);
    };
  }, []);

  return (
    <>
      {/* ── Loader overlay (unmounts after ~2.3s) ──────────────── */}
      {showLoader && <Loader isVisible={loaderVisible} />}

      {/* ── Main landing page ───────────────────────────────────── */}
      <main
        className="relative min-h-screen bg-cream flex flex-col"
        style={{
          opacity:    pageVisible ? 1 : 0,
          transition: "opacity 0.7s ease",
        }}
      >
        {/* ── Background blobs ─────────────────────────────────── */}
        <BackgroundBlobs />

        {/* ── Hero section (vertically + horizontally centred) ─── */}
        <section
          className="
            relative z-10
            flex-1 flex flex-col items-center justify-center
            px-6 py-16 sm:px-12
            text-center
          "
        >
          {/* ── Wordmark (with cloche + leaf + tagline) ──────────
              KirbaWordmark handles all brand typography internally.
              The sequential CSS animations are applied to each
              child wrapper so they stagger on entrance.            */}
          <div
            className="opacity-0 animate-fade-in"
            style={{ animationFillMode: "forwards" }}
          >
            <KirbaWordmark size="lg" showIcon showTagline />
          </div>

          {/* ── Campus-specific descriptor copy ──────────────────
              Written to feel genuine, not like startup marketing.
              Specific to the university context.                   */}
          <p
            className="
              opacity-0 animate-fade-in-delay
              mt-7 max-w-xs sm:max-w-sm
              text-ink-muted font-body text-sm sm:text-base
              leading-relaxed
            "
            style={{ animationFillMode: "forwards" }}
          >
            Browse menus from every canteen, stall, and café on campus —
            check prices, ratings, and timings, then just call to order.
            No app. No delivery fee. Just your campus food, organised.
          </p>

          {/* ── CTA buttons ──────────────────────────────────────── */}
          <div
            className="
              opacity-0 animate-fade-in-long
              mt-9 flex flex-col sm:flex-row
              items-center gap-4
            "
            style={{ animationFillMode: "forwards" }}
          >
            <CTAButton to="/login" variant="filled">
              Login
            </CTAButton>
            <CTAButton to="/signup" variant="outline">
              Sign Up
            </CTAButton>
          </div>

          {/* ── Owner entry point (subtle, below the fold-ish) ───
              Low-visual-weight link so it doesn't compete with the
              main student CTA, but owners can find it.            */}
          <p
            className="
              opacity-0 animate-fade-in-long
              mt-8 text-xs text-ink-faint font-body
            "
            style={{ animationFillMode: "forwards" }}
          >
            Own a restaurant or stall?{" "}
            <Link
              to="/owner/login"
              className="text-forest underline underline-offset-2 hover:text-forest-light transition-colors"
            >
              Manage your listing →
            </Link>
          </p>
        </section>
      </main>
    </>
  );
}
