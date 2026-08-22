/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // ─── Brand Colour Palette ───────────────────────────────────────────────
      // All brand-specific colours live here so every component references a
      // named token instead of a hardcoded hex value.
      colors: {
        cream: {
          DEFAULT: "#FBF0E1",   // warm base / background
          dark:    "#F5E3C8",   // slightly deeper for cards / surfaces
          muted:   "#EDD9B8",   // borders, dividers
        },
        forest: {
          DEFAULT: "#1D3B2A",   // primary brand green / "Kirba" wordmark
          light:   "#2A5440",   // hover / focus states
          faint:   "#E8F0EB",   // very light tint for backgrounds
        },
        burntorange: {
          DEFAULT: "#D9711A",   // "Bites" wordmark / CTA accent
          light:   "#E8893B",   // hover state
          muted:   "#F4D5B0",   // soft tint for chips / badges
        },
        // Neutral scale (all warm-tinted so nothing looks cold)
        ink: {
          DEFAULT: "#1A1A12",   // body text
          muted:   "#5C5746",   // secondary text / captions
          faint:   "#A09880",   // placeholders / disabled
        },
      },

      // ─── Brand Typography Scale ─────────────────────────────────────────────
      fontFamily: {
        // Playfair Display → headings, wordmark "Kirba", premium serif labels
        display: ['"Playfair Display"', "Georgia", "serif"],
        // Dancing Script  → "Bites" wordmark, decorative accents
        script:  ['"Dancing Script"', "cursive"],
        // Inter           → all body copy, UI labels, buttons, navigation
        body:    ["Inter", "system-ui", "sans-serif"],
      },

      // ─── Custom Keyframe Animations ─────────────────────────────────────────
      keyframes: {
        // Slow, organic blob drift for the landing page background
        "blob-drift": {
          "0%, 100%": { transform: "translate(0px, 0px) scale(1)" },
          "33%":       { transform: "translate(30px, -20px) scale(1.05)" },
          "66%":       { transform: "translate(-20px, 15px) scale(0.97)" },
        },
        // Gentle fade-in used for page transitions and the wordmark entrance
        "fade-in": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        // Loader cloche "lift" animation
        "cloche-lift": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%":      { transform: "translateY(-10px)" },
        },
        // Steam-puff for loader
        "steam": {
          "0%":   { opacity: "0.8", transform: "translateY(0) scaleX(1)" },
          "100%": { opacity: "0",   transform: "translateY(-14px) scaleX(0.6)" },
        },
      },
      animation: {
        "blob-drift":       "blob-drift 18s ease-in-out infinite",
        "blob-drift-delay": "blob-drift 22s ease-in-out infinite 4s",
        "blob-drift-slow":  "blob-drift 28s ease-in-out infinite 9s",
        "fade-in":          "fade-in 0.7s ease forwards",
        "fade-in-delay":    "fade-in 0.7s ease 0.2s forwards",
        "fade-in-long":     "fade-in 0.7s ease 0.4s forwards",
        "cloche-lift":      "cloche-lift 1.8s ease-in-out infinite",
        "steam-1":          "steam 1.4s ease-out infinite 0.1s",
        "steam-2":          "steam 1.4s ease-out infinite 0.4s",
        "steam-3":          "steam 1.4s ease-out infinite 0.7s",
      },
    },
  },
  plugins: [],
};
