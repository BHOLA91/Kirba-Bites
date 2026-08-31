/**
 * components/sections/HeroSection.jsx
 * ──────────────────────────────────────────────────────────────────
 * Full-viewport hero — dark atmospheric food photograph with a
 * forest-green-tinted overlay, left-aligned content.
 *
 * No GSAP / ScrollTrigger. The bowl image that was previously used
 * as the animation start point has been removed; the bowl now lives
 * in ProblemStatement in its settled position.
 *
 * Layout:
 *  Desktop: text takes up the left ~55%, right side open/atmospheric
 *  Mobile:  text full-width, still fully legible over the dark bg
 */

import { Link }      from "react-router-dom";
import KirbaWordmark from "../common/KirbaWordmark";
import heroBg        from "../../assets/images/hero-bg-spices.jpg";

// ── CTA Button ────────────────────────────────────────────────────
function CTAButton({ to, children, variant = "filled" }) {
  const base =
    "inline-flex items-center justify-center px-7 py-3.5 rounded-full " +
    "font-body font-semibold text-sm tracking-wide " +
    "transition-all duration-200 focus-visible:outline-none " +
    "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-burntorange";

  const variants = {
    filled:
      "bg-burntorange text-cream shadow-lg " +
      "hover:bg-burntorange-light hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0",
    outline:
      "border-2 border-cream/60 text-cream bg-transparent " +
      "hover:bg-cream/10 hover:-translate-y-0.5 active:translate-y-0",
  };

  return (
    <Link to={to} className={`${base} ${variants[variant]}`}>
      {children}
    </Link>
  );
}



// ── Main component ────────────────────────────────────────────────
export default function HeroSection() {
  return (
    <section
      id="hero"
      aria-label="Kirba Bites — campus food ordering"
      className="relative w-full h-screen min-h-[600px] overflow-hidden flex items-center"
    >
      {/* Background food photograph */}
      <img
        src={heroBg}
        alt=""
        role="presentation"
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover object-center select-none pointer-events-none"
        draggable={false}
        fetchpriority="high"
      />

      {/* Vignette — permanent edge darkening */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(10,20,15,0.55) 100%)",
        }}
        aria-hidden="true"
      />

      {/* Main tinted overlay — forest-green-tinted dark wash */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(110deg, rgba(10,22,16,0.82) 0%, rgba(10,22,16,0.68) 55%, rgba(10,22,16,0.30) 100%)",
        }}
        aria-hidden="true"
      />

      {/* Left-side text content */}
      <div
        className="
          relative z-10
          w-full
          px-6 sm:px-10 lg:px-20
          md:max-w-[55%]
          flex flex-col items-start
        "
      >
        <div className="mb-2 -ml-1">
          <KirbaWordmark size="md" showIcon={false} showTagline={false} />
        </div>

        <p
          className="
            tagline-rule
            text-cream/70 font-body font-semibold
            text-[0.62rem] uppercase tracking-[0.22em]
            mb-8 mt-1
          "
          style={{ fontVariant: "small-caps" }}
        >
          Good Food. Great Choices.
        </p>

        <p className="font-body text-cream/80 text-base sm:text-lg leading-relaxed max-w-md mb-10">
          Browse menus from every canteen, stall, and café on campus.
          Check prices, ratings, and timings — then just call to order.
          No delivery fee. No queue.
        </p>

        <div className="flex flex-wrap items-center gap-4">
          <CTAButton to="/login" variant="filled">Login</CTAButton>
          <CTAButton to="/signup" variant="outline">Sign Up</CTAButton>
        </div>

        <p className="mt-7 font-body text-[11px] text-cream/40">
          Own a restaurant or stall?{" "}
          <Link
            to="/owner/login"
            className="text-cream/60 underline underline-offset-2 hover:text-cream/80 transition-colors"
          >
            Manage your listing →
          </Link>
        </p>
      </div>

    </section>
  );
}
