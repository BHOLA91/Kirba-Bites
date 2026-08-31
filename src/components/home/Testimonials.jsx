/**
 * components/home/Testimonials.jsx
 * ──────────────────────────────────────────────────────────────────
 * "Echoes of the Hungry" — continuous CSS marquee testimonials.
 *
 * Technique:
 *  - Cards rendered TWICE back-to-back in one flex track.
 *  - Track animates translateX(0) → translateX(-50%) via linear CSS
 *    keyframe, then repeats. Because the second copy is identical to
 *    the first, the loop seam is invisible.
 *  - Pause on hover/focus via animation-play-state: paused.
 *  - Left/right edge fade via CSS mask-image gradient.
 *  - prefers-reduced-motion: animation is not applied; cards render
 *    as a static responsive grid instead.
 *
 * No buttons, no dots, no discrete slide positions — pure ticker.
 *
 * Duration tuning:
 *   MARQUEE_DURATION controls seconds for one full loop.
 *   At ~5 cards × ~280px wide ≈ 1400px of content,
 *   35 s gives ≈ 40 px/s which is comfortable to read at a glance.
 *   Adjust if you add more cards.
 */

// ── Star rating ───────────────────────────────────────────────────
function Stars({ count = 5 }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${count} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          xmlns="http://www.w3.org/2000/svg"
          className={`w-3.5 h-3.5 ${i < count ? "text-burntorange" : "text-cream-muted"}`}
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

// ── Avatar initials ───────────────────────────────────────────────
function Avatar({ name, color }) {
  const initials = name
    .trim()
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div
      className="w-9 h-9 rounded-full flex items-center justify-center
        font-body font-bold text-cream text-sm shrink-0"
      style={{ background: color }}
      aria-hidden="true"
    >
      {initials}
    </div>
  );
}

// ── Testimonial data ──────────────────────────────────────────────
// Swap for a Supabase query when a `testimonials` table exists.
const TESTIMONIALS = [
  {
    id: 1,
    stars: 5,
    quote:
      "Kirba Bites completely changed how I eat on campus. No more waiting in queues — I order from my dorm and it's ready when I get there.",
    name: "Priya Sharma",
    role: "2nd Year, CS",
    color: "#1D3B2A",
  },
  {
    id: 2,
    stars: 5,
    quote:
      "The variety is incredible. From masala dosa to pasta — every stall on campus, one app. I use it every single day.",
    name: "Rohan Mehta",
    role: "3rd Year, ECE",
    color: "#D9711A",
  },
  {
    id: 3,
    stars: 5,
    quote:
      "As someone who's always between classes, this has been a lifesaver. Quick, reliable, and the food is always warm.",
    name: "Ananya Kapoor",
    role: "1st Year, MBA",
    color: "#5C5746",
  },
  {
    id: 4,
    stars: 4,
    quote:
      "Love the curated offers — got 20% off my favourite restaurant last week. The interface is clean and actually pleasant to use.",
    name: "Dev Patel",
    role: "4th Year, Mech",
    color: "#2A5440",
  },
  {
    id: 5,
    stars: 5,
    quote:
      "Never thought ordering campus food could feel this premium. Kirba Bites is leagues ahead of anything else on campus.",
    name: "Meera Nair",
    role: "2nd Year, Design",
    color: "#D9711A",
  },
];

// How long (seconds) one full loop takes.
// At 5 cards the track is ~1500 px wide; 35 s ≈ 43 px/s — readable.
const MARQUEE_DURATION = 35;

// ── Single card ───────────────────────────────────────────────────
function TestimonialCard({ item }) {
  return (
    <article
      // Fixed width so cards are uniform and spacing is predictable.
      // 300 px is comfortable at all breakpoints; the container clips the rest.
      className="bg-white rounded-2xl p-6
        shadow-[0_2px_16px_rgba(29,59,42,0.07)]
        flex flex-col gap-4 shrink-0"
      style={{ width: "300px" }}
    >
      <Stars count={item.stars} />
      <blockquote className="font-body text-sm text-ink-muted leading-relaxed italic flex-1">
        "{item.quote}"
      </blockquote>
      <div className="flex items-center gap-3 pt-1 border-t border-cream-muted">
        <Avatar name={item.name} color={item.color} />
        <div>
          <p className="font-body font-semibold text-sm text-ink leading-none">
            {item.name}
          </p>
          <p className="font-body text-xs text-ink-faint mt-0.5">{item.role}</p>
        </div>
      </div>
    </article>
  );
}

// ── Main section ──────────────────────────────────────────────────
export default function Testimonials() {
  return (
    <section
      className="py-14 sm:py-20 bg-cream-dark/40 overflow-hidden"
      aria-labelledby="testimonials-heading"
    >
      {/*
        Inject the @keyframes rule and the pause-on-hover behaviour.
        A <style> tag is the cleanest way to add a custom keyframe
        without modifying tailwind.config or index.css.
      */}
      <style>{`
        @keyframes kb-marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }

        .kb-marquee-track {
          animation: kb-marquee ${MARQUEE_DURATION}s linear infinite;
          will-change: transform;
        }

        /* Pause on hover or focus-within */
        .kb-marquee-container:hover  .kb-marquee-track,
        .kb-marquee-container:focus-within .kb-marquee-track {
          animation-play-state: paused;
        }

        /* Respect reduced-motion: remove animation entirely */
        @media (prefers-reduced-motion: reduce) {
          .kb-marquee-track {
            animation: none !important;
          }
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-10 sm:mb-14 space-y-2">
          <p className="font-body text-xs font-bold tracking-[0.2em] uppercase text-burntorange">
            What Students Say
          </p>
          <h2
            id="testimonials-heading"
            className="font-script text-forest"
            style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", lineHeight: 1.1 }}
          >
            Echoes of the Hungry
          </h2>
          <p className="font-body text-sm text-ink-muted max-w-md mx-auto mt-3">
            Real words from real campus food lovers
          </p>
        </div>
      </div>

      {/*
        The marquee viewport sits OUTSIDE the max-w-7xl container so it
        bleeds edge-to-edge, giving the ticker a full-width feel.
        overflow-hidden clips the track; mask-image fades the edges.
      */}
      <div
        className="kb-marquee-container overflow-hidden"
        style={{
          // Edge fade: transparent → opaque over ~80 px on each side
          maskImage:
            "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
        }}
        aria-label="Testimonials marquee — hover to pause"
      >
        {/*
          Track: cards rendered TWICE.
          The keyframe moves the track by exactly -50% of its own width,
          which equals the width of ONE copy of the cards — so at 50%
          the position is visually identical to 0%, creating a seamless loop.
        */}
        <div
          className="kb-marquee-track flex gap-5 w-max"
          // w-max makes the track as wide as its content (both copies).
          // The keyframe then shifts it left by half that width.
        >
          {/* First copy */}
          {TESTIMONIALS.map((item) => (
            <TestimonialCard key={`a-${item.id}`} item={item} />
          ))}
          {/* Second copy (identical — provides the seamless loop) */}
          {TESTIMONIALS.map((item) => (
            <TestimonialCard key={`b-${item.id}`} item={item} aria-hidden="true" />
          ))}
        </div>
      </div>

      {/*
        Reduced-motion fallback: when animation is disabled, the track is
        stationary and only the first copy's cards are visible in the
        overflow-hidden container. For these users we show a normal grid.
      */}
      <div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8"
        style={{ display: "none" }}
        // Hidden by default; revealed only by reduced-motion CSS below.
      >
        <style>{`
          @media (prefers-reduced-motion: reduce) {
            .kb-marquee-fallback { display: grid !important; }
            .kb-marquee-container { display: none; }
          }
        `}</style>
        <div
          className="kb-marquee-fallback grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {TESTIMONIALS.map((item) => (
            <TestimonialCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
