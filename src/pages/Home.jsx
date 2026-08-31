/**
 * pages/Home.jsx  —  Customer home / restaurant discovery feed
 * ──────────────────────────────────────────────────────────────────
 * Sections (top → bottom):
 *   1. OffersCarousel  — promotional offer slides from restaurants with offers set
 *   2. Curated Venues  — restaurant grid (from Supabase)
 *   3. SuspendedCravings — popular menu items (placeholder, see component)
 *   4. Testimonials    — "Echoes of the Hungry" customer reviews
 *
 * Layout shell (Navbar + Footer) is provided by Layout.jsx (see AppRoutes).
 * This page only renders its own sections.
 */

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getAllRestaurants } from "../services/restaurants";
import OffersCarousel     from "../components/home/OffersCarousel";
import SuspendedCravings  from "../components/home/SuspendedCravings";
import Testimonials        from "../components/home/Testimonials";
import RestaurantCard      from "../components/restaurant/RestaurantCard";
import { useSlideCarousel } from "../hooks/useSlideCarousel";

// ── Responsive visible count ──────────────────────────────────────
function useVisibleCount() {
  const [vc, setVc] = useState(3.1);
  useEffect(() => {
    function update() {
      const w = window.innerWidth;
      if (w < 640)       setVc(1.25);
      else if (w < 1024) setVc(2.15);
      else               setVc(3.1);
    }
    update();
    window.addEventListener("resize", update, { passive: true });
    return () => window.removeEventListener("resize", update);
  }, []);
  return vc;
}

// ── Arrow button ──────────────────────────────────────────────────
function ArrowBtn({ dir, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={dir === "prev" ? "Previous" : "Next"}
      className={`w-10 h-10 rounded-full border-2 border-forest/25 flex items-center justify-center shrink-0 transition-all duration-150 ${
        disabled 
          ? "opacity-50 cursor-not-allowed text-forest/50" 
          : "text-forest hover:bg-forest hover:text-cream hover:border-forest active:scale-95"
      }`}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d={dir === "prev" ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"} />
      </svg>
    </button>
  );
}

// ── Restaurant grid skeleton card ─────────────────────────────────
function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden bg-white shadow-sm animate-pulse">
      <div className="h-44 sm:h-48 bg-cream-muted" />
      <div className="p-4 space-y-3">
        <div className="h-5 bg-cream-muted rounded-lg w-3/4" />
        <div className="flex gap-2">
          <div className="h-4 bg-cream-muted rounded-full w-16" />
          <div className="h-4 bg-cream-muted rounded-full w-16" />
        </div>
        <div className="h-3.5 bg-cream-muted rounded w-full" />
        <div className="h-3.5 bg-cream-muted rounded w-2/3" />
      </div>
    </div>
  );
}

// ── Section header row ────────────────────────────────────────────
function SectionHeader({ eyebrow, title, subtitle, linkLabel, linkTo }) {
  return (
    <div className="flex items-end justify-between mb-7 sm:mb-9">
      <div>
        {eyebrow && (
          <p className="font-body text-xs font-bold tracking-[0.2em] uppercase
            text-burntorange mb-2">
            {eyebrow}
          </p>
        )}
        <h2 className="font-display font-bold text-forest text-2xl sm:text-3xl leading-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="font-body text-sm text-ink-muted mt-1.5 max-w-md">{subtitle}</p>
        )}
      </div>
      {linkLabel && linkTo && (
        <Link
          to={linkTo}
          className="font-body text-xs font-bold tracking-widest uppercase
            text-forest hover:text-burntorange border-b border-current
            transition-colors duration-150 pb-0.5 shrink-0 ml-4"
        >
          {linkLabel}
        </Link>
      )}
    </div>
  );
}

// ── Curated Venues section ────────────────────────────────────────
function CuratedVenues({ restaurants, loading, error, onRetry }) {
  const visibleCount = useVisibleCount();
  const GAP = 20;

  const {
    index,
    goNext,
    goPrev,
    containerRef,
    translateX,
    itemWidthStyle,
    maxIndex,
  } = useSlideCarousel({
    count: restaurants.length,
    visibleCount,
    gap: GAP,
    autoMs: 0, // Manual only
    loop: false,
  });

  return (
    <section className="py-12 sm:py-16" aria-labelledby="venues-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          id="venues-heading"
          eyebrow="On Campus"
          title="Curated Venues"
          subtitle="Every stall and restaurant available for order right now"
          linkLabel="See More"
          linkTo="/outlets"
        />

        {/* Error state */}
        {error && (
          <div className="text-center py-12">
            <p className="font-display text-forest text-xl mb-2">Couldn't load restaurants</p>
            <p className="font-body text-sm text-ink-muted mb-6">{error}</p>
            <button
              onClick={onRetry}
              className="px-6 py-2.5 rounded-xl bg-forest text-cream font-body font-semibold text-sm
                hover:bg-forest-light transition-colors duration-150"
            >
              Try again
            </button>
          </div>
        )}

        {/* Loading state */}
        {loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && restaurants.length === 0 && (
          <div className="text-center py-16 space-y-3">
            <div className="text-5xl mb-4" role="img" aria-label="cooking pot">🍲</div>
            <p className="font-display text-forest text-xl font-bold">
              No restaurants yet
            </p>
            <p className="font-body text-sm text-ink-muted max-w-xs mx-auto">
              Looks like no stalls have signed up yet. Check back soon — great food is on its way!
            </p>
          </div>
        )}

        {/* Restaurant Carousel */}
        {!loading && !error && restaurants.length > 0 && (
          <div className="relative">
            <div ref={containerRef} className="overflow-hidden pb-4">
              <div
                style={{
                  display: "flex",
                  gap: `${GAP}px`,
                  transform: translateX,
                  transition: "transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                  willChange: "transform",
                }}
              >
                {restaurants.map((r) => (
                  <div key={r.id} style={{ width: itemWidthStyle, flexShrink: 0 }}>
                    <RestaurantCard restaurant={r} />
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Arrows */}
            <div className="flex items-center gap-4 mt-6">
              <ArrowBtn dir="prev" onClick={goPrev} disabled={index === 0} />
              <ArrowBtn dir="next" onClick={goNext} disabled={index >= maxIndex} />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

// ── Main page ─────────────────────────────────────────────────────
export default function Home() {
  const { profile } = useAuth();

  const [restaurants, setRestaurants] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);

  async function fetchRestaurants() {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllRestaurants();
      setRestaurants(data);
    } catch (err) {
      console.error("[Home] fetchRestaurants error:", err);
      setError(err.message || "Failed to load restaurants.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchRestaurants(); }, []);

  const firstName = profile?.first_name ? `, ${profile.first_name.split(" ")[0]}` : "";

  return (
    <div className="bg-cream">
      {/* ── Hero greeting strip ────────────────────────────────── */}
      <div className="bg-gradient-to-b from-cream-dark/60 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-2">
          <div>
            <p className="font-body text-xs font-bold tracking-[0.2em] uppercase
              text-burntorange mb-1">
              Welcome back{firstName}
            </p>
            <h1 className="font-display font-black text-forest text-3xl sm:text-4xl lg:text-5xl leading-tight">
              What are you craving <span className="text-burntorange">today?</span>
            </h1>
            <p className="font-body text-ink-muted mt-2 text-sm sm:text-base max-w-lg">
              Browse campus restaurants, explore today's offers, and order in minutes.
            </p>
          </div>
        </div>
      </div>

      {/* ── Offers carousel ───────────────────────────────────── */}
      <OffersCarousel restaurants={restaurants} />

      {/* ── Divider ───────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <hr className="border-cream-muted" />
      </div>

      {/* ── Curated Venues ────────────────────────────────────── */}
      <CuratedVenues
        restaurants={restaurants}
        loading={loading}
        error={error}
        onRetry={fetchRestaurants}
      />

      {/* ── Divider ───────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <hr className="border-cream-muted" />
      </div>

      {/* ── Suspended Cravings ────────────────────────────────── */}
      <SuspendedCravings />

      {/* ── Divider ───────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <hr className="border-cream-muted" />
      </div>

      {/* ── Testimonials ──────────────────────────────────────── */}
      <Testimonials />
    </div>
  );
}
