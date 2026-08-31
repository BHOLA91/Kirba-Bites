/**
 * components/common/KirbaWordmark.jsx  —  Brand wordmark component
 * ──────────────────────────────────────────────────────────────────
 * This component renders the full "Kirba Bites" logo treatment in
 * HTML + CSS — no raster image — so it scales perfectly and can be
 * reused across:
 *
 *  • Landing page (large hero size)
 *  • Navbar / header (compact size via the `size` prop)
 *  • Loading screen (micro size)
 *  • Social share cards or email templates
 *
 * Design spec matched from provided brand logo:
 *  ┌──────────────────────────────────────────────┐
 *  │  🍽  [cloche icon — optional via showIcon]   │
 *  │  KIRBA        [Playfair Display 900 + green] │
 *  │  Bites~~~     [Dancing Script + burnt orange]│
 *  │    · ── GOOD FOOD. GREAT CHOICES. ── ·       │
 *  └──────────────────────────────────────────────┘
 *
 * Props:
 *  size       ("sm" | "md" | "lg") — scales font sizes
 *  variant    ("default" | "on-dark") — color scheme:
 *               "default"  → KIRBA in forest green  (light backgrounds)
 *               "on-dark"  → KIRBA in cream          (dark backgrounds, e.g. Footer)
 *               "Bites" stays burnt-orange in both variants.
 *  showIcon   (bool, default true)  — show/hide the cloche icon above
 *  showTagline (bool, default true) — show/hide the tagline rule
 *  className  (string)              — additional container classes
 */

// ── Leaf accent (small orange leaf near the "i" in Kirba) ────────
function LeafAccent() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 14 16"
      fill="none"
      className="inline-block align-middle"
      style={{ width: "0.5em", height: "0.6em", marginLeft: "0.05em", marginRight: "-0.1em", verticalAlign: "0.15em" }}
      aria-hidden="true"
    >
      <path
        d="M7 14 C7 8 2 4 7 1 C12 4 7 8 7 14Z"
        fill="#D9711A"
        opacity="0.9"
      />
      <line x1="7" y1="14" x2="7" y2="6" stroke="#fff" strokeWidth="0.8" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}

// ── Inline cloche icon (compact, for above the wordmark) ─────────
function ClocheHero({ sizeClass = "w-16 h-12" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 80 60"
      fill="none"
      className={sizeClass}
      aria-hidden="true"
    >
      <path d="M8 40 C8 20 72 20 72 40" stroke="#1D3B2A" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="4" y1="44" x2="76" y2="44" stroke="#1D3B2A" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="40" cy="19" r="3.5" stroke="#1D3B2A" strokeWidth="2" fill="none" />
      {/* Motion lines */}
      <line x1="62" y1="36" x2="68" y2="30" stroke="#1D3B2A" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="65" y1="39" x2="73" y2="35" stroke="#1D3B2A" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

// ── Size scale map ────────────────────────────────────────────────
const SIZES = {
  sm: {
    kirba:   "text-3xl",
    bites:   "text-4xl",
    tagline: "text-[0.55rem]",
    cloche:  "w-10 h-8",
    gap:     "gap-0.5",
    mb:      "mb-1",
  },
  md: {
    kirba:   "text-5xl",
    bites:   "text-6xl",
    tagline: "text-[0.65rem]",
    cloche:  "w-16 h-12",
    gap:     "gap-1",
    mb:      "mb-2",
  },
  lg: {
    kirba:   "text-7xl sm:text-8xl",
    bites:   "text-8xl sm:text-9xl",
    tagline: "text-[0.75rem] sm:text-[0.8rem]",
    cloche:  "w-20 h-16 sm:w-24 sm:h-20",
    gap:     "gap-1.5",
    mb:      "mb-3",
  },
};

// ── Component ─────────────────────────────────────────────────────
export default function KirbaWordmark({
  size       = "lg",
  variant    = "default",   // "default" | "on-dark"
  showIcon   = true,
  showTagline = true,
  className  = "",
}) {
  const isOnDark = variant === "on-dark";
  const s = SIZES[size] ?? SIZES.lg;

  return (
    <div
      className={`flex flex-col items-start select-none ${className}`}
      aria-label="Kirba Bites"
    >
      {/* ── Cloche icon ──────────────────────────────────────────── */}
      {showIcon && (
        <ClocheHero sizeClass={`${s.cloche} ${s.mb}`} />
      )}

      {/* ── "KIRBA" wordmark line ─────────────────────────────────
          Playfair Display 900 (black weight) in deep forest green.
          The leaf SVG is positioned over the dot of the "i" by
          placing it as an inline element right after the "K·i" split.
          Using letter-spacing: -0.01em for tight premium feeling.    */}
      <div className={`leading-none tracking-tight ${s.gap}`}>
        <span
          className={`font-display font-black leading-none ${s.kirba} ${isOnDark ? "text-cream" : "text-forest"}`}
          style={{ letterSpacing: "-0.015em" }}
        >
          {/* "K" + dotless-ı (U+0131) + "rba"
              Using the dotless-i character suppresses the font's own dot
              entirely, so the leaf SVG is the only thing at that position — 
              no layering, no gap, no dot peeking through.                  */}
          K
          <span className="relative inline-block">
            {/* ı = U+0131 LATIN SMALL LETTER DOTLESS I */}
            ı
            {/* Leaf replaces the dot — almond/lens shape (pointed at both
                ends) with a cream center vein, sitting exactly where the
                dot would be, centered over the stem, tilted 12°.
                
                Sizing: width ≈ stem width (~0.18em), height ≈ dot height
                (~0.22em). transformOrigin "center" keeps the tilt centered
                on the dot position rather than rotating around an edge.   */}
            <span
              className="absolute"
              style={{
                top:             "0.02em",
                left:            "50%",
                lineHeight:      0,
                transform:       "translateX(-50%) rotate(12deg)",
                transformOrigin: "center center",
              }}
              aria-hidden="true"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 10 16"
                fill="none"
                style={{ width: "0.22em", height: "0.28em" }}
              >
                {/* Almond/lens leaf: pointed at top and bottom,
                    widest in the middle — matches the logo reference */}
                <path
                  d="M5 1 C9 5 9 11 5 15 C1 11 1 5 5 1Z"
                  fill="#D9711A"
                />
                {/* Center vein — cream tint, subtle */}
                <line
                  x1="5" y1="2.5" x2="5" y2="13.5"
                  stroke="rgba(251,240,225,0.55)"
                  strokeWidth="0.9"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </span>
          rba
        </span>
      </div>

      {/* ── "Bites" script wordmark line ─────────────────────────
          Dancing Script 700 in burnt orange.
          The .bites-swash CSS class (defined in index.css) adds
          the hand-drawn SVG underline swash via ::after.           */}
      <div className="leading-none -mt-1 sm:-mt-2">
        <span
          className={`bites-swash font-script font-bold text-burntorange ${s.bites}`}
          style={{ letterSpacing: "0.01em" }}
        >
          Bites
        </span>
      </div>

      {/* ── Tagline with flanking rules ───────────────────────────
          "GOOD FOOD. GREAT CHOICES." — small-caps, letter-spaced,
          forest green, flanked by thin horizontal rules & dots.
          The .tagline-rule CSS class handles the rule pseudo-elements.*/}
      {showTagline && (
        <p
          className={`tagline-rule font-body font-semibold uppercase tracking-[0.2em] mt-5 ${s.tagline} ${isOnDark ? "text-cream/70" : "text-forest"}`}
          style={{ fontVariant: "small-caps" }}
        >
          Good Food. Great Choices.
        </p>
      )}
    </div>
  );
}
