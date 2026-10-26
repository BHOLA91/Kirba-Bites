/**
 * components/home/OffersCarousel.jsx
 * ──────────────────────────────────────────────────────────────────
 * A full-width promotional carousel that cycles through restaurants
 * that have offers set. Each slide shows:
 *   - Eyebrow label ("TIME SENSITIVE" or parsed from offers text)
 *   - Bold headline (the offer itself, e.g. "20% Off")
 *   - Restaurant name
 *   - Short description
 *   - "CLAIM OFFER" CTA
 *   - Decorative food image (restaurant image_url or placeholder)
 *
 * Key implementation notes:
 *   - Slide content swaps BEFORE the fade transition plays (avoids the
 *     "fades to blank" bug from the Stitch prototype). We use a two-phase
 *     approach: swap content immediately, then run the CSS fade-in on the
 *     new content. The old content is never shown after the index changes.
 *   - Auto-advances every 5 seconds, pauses on hover.
 *   - Prev/next arrows bottom-left (matching reference layout).
 *   - If no restaurants with offers, renders null (hides section).
 *   - Respects prefers-reduced-motion.
 *
 * Props:
 *   restaurants  — array of restaurant rows (all restaurants, filters internally)
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { getOfferImage } from "../../utils/restaurantImageFallbacks";

import hostelDeliveryImg from "../../assets/images/hostel-delivery-meals.jpg";
import byobLoadedChipsImg from "../../assets/images/byob-loaded-chips.jpg";

// ── Arrow buttons ─────────────────────────────────────────────────
function ArrowBtn({ dir, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={dir === "prev" ? "Previous offer" : "Next offer"}
      className="w-10 h-10 rounded-full border-2 border-forest/25 text-forest
        flex items-center justify-center shrink-0
        hover:bg-forest hover:text-cream hover:border-forest
        active:scale-95 transition-all duration-150
        disabled:opacity-40 disabled:cursor-not-allowed"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none"
        viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round"
          d={dir === "prev" ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"} />
      </svg>
    </button>
  );
}

// ── Dot indicators ────────────────────────────────────────────────
function Dots({ count, active, onDotClick }) {
  return (
    <div className="flex items-center gap-1.5" role="tablist" aria-label="Carousel slides">
      {Array.from({ length: count }).map((_, i) => (
        <button
          key={i}
          role="tab"
          aria-selected={i === active}
          aria-label={`Slide ${i + 1}`}
          onClick={() => onDotClick(i)}
          className={`rounded-full transition-all duration-300
            ${i === active
              ? "w-5 h-2 bg-forest"
              : "w-2 h-2 bg-forest/25 hover:bg-forest/50"}`}
        />
      ))}
    </div>
  );
}

// ── Placeholder image (warm gradient when no image_url) ───────────
const PLACEHOLDER_GRADIENT = "linear-gradient(135deg, #F4D5B0 0%, #EDD9B8 50%, #D9711A22 100%)";

// ── Parse offer text into headline + eyebrow ──────────────────────
// Expects offers to be plain text like "20% Off on all orders above ₹150"
// Returns { eyebrow, headline, description }
function parseOffer(offersText, restaurantName) {
  if (!offersText) return null;
  const text = offersText.trim();
  // If the text starts with a percentage or "X% off" pattern, split it
  const percentMatch = text.match(/^(\d+%\s*[Oo]ff)/);
  if (percentMatch) {
    return {
      eyebrow:     "LIMITED TIME OFFER",
      headline:    percentMatch[1],
      description: text.slice(percentMatch[1].length).trim() || `Available at ${restaurantName}`,
    };
  }
  // Generic: treat the whole text as description, generate headline from restaurant name
  return {
    eyebrow:     "SPECIAL OFFER",
    headline:    text.length <= 30 ? text : text.slice(0, 30) + "…",
    description: text.length > 30 ? text : `Available at ${restaurantName}`,
  };
}

// ── Slide content ─────────────────────────────────────────────────
function SlideContent({ restaurant, animate }) {
  const offer = parseOffer(restaurant.offers, restaurant.restaurant_name);
  if (!offer) return null;

  let imageSrc = getOfferImage(restaurant);
  if (restaurant.restaurant_name === "Hot Momos") {
    imageSrc = hostelDeliveryImg;
  } else if (restaurant.restaurant_name === "WOW Fast Food Point") {
    imageSrc = byobLoadedChipsImg;
  }

  return (
    <div
      key={restaurant.id}
      className={`flex flex-col sm:flex-row items-center gap-6 sm:gap-10 w-full
        ${animate ? "animate-fade-in" : ""}`}
      style={{ animationDuration: "0.4s" }}
    >
      {/* Text side */}
      <div className="flex-1 space-y-3 sm:space-y-4 text-center sm:text-left">
        <span className="inline-block font-body text-[10px] font-bold tracking-[0.18em]
          uppercase text-burntorange border border-burntorange/30
          bg-burntorange/8 px-3 py-1 rounded-full">
          {offer.eyebrow}
        </span>

        <div>
          <h2 className="font-display font-black text-forest text-4xl sm:text-5xl
            leading-none tracking-tight">
            {offer.headline}
          </h2>
          <p className="font-display text-forest/70 text-lg mt-1">
            at {restaurant.restaurant_name}
          </p>
        </div>

        <p className="font-body text-ink-muted text-sm max-w-xs sm:max-w-sm leading-relaxed">
          {offer.description}
        </p>

        <Link
          to={`/restaurant/${restaurant.id}`}
          className="inline-flex items-center gap-2 mt-1
            bg-forest text-cream font-body font-bold text-sm tracking-widest uppercase
            px-7 py-3 rounded-full
            hover:bg-forest-light hover:-translate-y-0.5 hover:shadow-lg
            active:translate-y-0 transition-all duration-150"
        >
          Claim Offer
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none"
            viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
      </div>

      {/* Image side — cuisine-matched Unsplash photo (decorative, beside text) */}
      <div className="shrink-0 w-48 h-48 sm:w-56 sm:h-56 lg:w-64 lg:h-64 rounded-3xl overflow-hidden
        shadow-xl border-4 border-cream-muted/40 rotate-3 hover:rotate-0 transition-transform duration-500">
        <img
          src={imageSrc}
          alt={restaurant.restaurant_name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────
export default function OffersCarousel({ restaurants = [] }) {
  // Filter to only restaurants with offers
  const slides = restaurants.filter((r) => r.offers?.trim());

  const [index,    setIndex]    = useState(0);
  const [animate,  setAnimate]  = useState(true);
  const [paused,   setPaused]   = useState(false);
  const timerRef = useRef(null);

  // Respect reduced-motion: never auto-advance
  const prefersReduced = typeof window !== "undefined"
    && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const go = useCallback((next) => {
    setAnimate(false); // remove class for one tick so it re-triggers
    // Use a microtask to flip content immediately, then re-add animate class
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIndex(next);
        setAnimate(true);
      });
    });
  }, []);

  const goNext = useCallback(() => {
    go((index + 1) % slides.length);
  }, [go, index, slides.length]);

  const goPrev = useCallback(() => {
    go((index - 1 + slides.length) % slides.length);
  }, [go, index, slides.length]);

  // Auto-advance timer
  useEffect(() => {
    if (prefersReduced || paused || slides.length <= 1) return;
    timerRef.current = setInterval(goNext, 5000);
    return () => clearInterval(timerRef.current);
  }, [goNext, paused, slides.length, prefersReduced]);

  if (slides.length === 0) return null;

  const currentSlide = slides[index];

  return (
    <section
      aria-label="Featured offers"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {/* Card */}
        <div className="relative bg-gradient-to-br from-cream-dark via-cream to-cream-dark
          rounded-3xl px-8 sm:px-12 py-10 sm:py-14 overflow-hidden
          shadow-[0_8px_48px_rgba(29,59,42,0.10)]">

          {/* Background pattern */}
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            aria-hidden="true"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 50%, #1D3B2A 0%, transparent 60%), " +
                "radial-gradient(circle at 80% 20%, #D9711A 0%, transparent 50%)",
            }}
          />

          {/* Slide content — content swaps BEFORE animation so no blank frame */}
          <div className="relative z-10 min-h-[220px] sm:min-h-[240px] flex items-center">
            <SlideContent restaurant={currentSlide} animate={animate} />
          </div>

          {/* Controls row */}
          {slides.length > 1 && (
            <div className="relative z-10 flex items-center gap-4 mt-8">
              <ArrowBtn dir="prev" onClick={goPrev} />
              <ArrowBtn dir="next" onClick={goNext} />
              <Dots
                count={slides.length}
                active={index}
                onDotClick={(i) => go(i)}
              />
              {/* Slide counter */}
              <span className="ml-auto font-body text-xs text-ink-faint tabular-nums">
                {String(index + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
