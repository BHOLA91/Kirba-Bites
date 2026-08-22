/**
 * components/common/Loader.jsx  —  On-brand splash / loading screen
 * ─────────────────────────────────────────────────────────────────
 * Shown for ~1.8s on first app load, then fades out as the landing
 * page fades in. Designed to feel like a premium restaurant reveal:
 *
 *  • Cream (#FBF0E1) full-screen background
 *  • Animated forest-green cloche (food dome) icon with lift motion
 *  • Steam wisps in burnt-orange that fade up and repeat
 *  • "Kirba Bites" micro-wordmark below the icon
 *  • Full screen fade-out transition before unmounting
 *
 * Props:
 *  isVisible (bool) — when false, triggers fade-out CSS class
 */

import { useEffect, useState } from "react";

// ── Cloche SVG (inline so no extra request and easy to animate) ──
// Line-art food dome with motion lines — forest green, thin strokes.
function ClocheIcon({ className = "" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 80 60"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      {/* Dome body */}
      <path
        d="M8 40 C8 20 72 20 72 40"
        stroke="#1D3B2A"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Base plate */}
      <line x1="4" y1="44" x2="76" y2="44" stroke="#1D3B2A" strokeWidth="2.5" strokeLinecap="round" />
      {/* Knob on top */}
      <circle cx="40" cy="19" r="3.5" stroke="#1D3B2A" strokeWidth="2" fill="none" />
      {/* Motion lines (right side — suggest warmth / just lifted) */}
      <line x1="62" y1="36" x2="68" y2="30" stroke="#1D3B2A" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="65" y1="39" x2="73" y2="35" stroke="#1D3B2A" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

// ── Steam wisps ──────────────────────────────────────────────────
function SteamWisp({ className = "" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 10 20"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M5 18 C2 14 8 10 5 6 C2 2 8 0 5 0"
        stroke="#D9711A"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ── Main Loader component ────────────────────────────────────────
export default function Loader({ isVisible }) {
  // Local opacity state drives the CSS transition for mount/unmount
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    if (!isVisible) {
      // Trigger a CSS fade-out before the parent unmounts this component
      setOpacity(0);
    }
  }, [isVisible]);

  return (
    <div
      role="status"
      aria-label="Loading Kirba Bites"
      style={{
        opacity,
        transition: "opacity 0.5s ease",
        pointerEvents: isVisible ? "all" : "none",
      }}
      className="
        fixed inset-0 z-50
        flex flex-col items-center justify-center
        bg-cream
      "
    >
      {/* ── Steam wisps (above the cloche) ─────────────────────── */}
      <div className="flex gap-3 mb-1 h-8 items-end">
        <SteamWisp className="w-2 h-6 animate-steam-1 opacity-0" />
        <SteamWisp className="w-2 h-7 animate-steam-2 opacity-0" />
        <SteamWisp className="w-2 h-5 animate-steam-3 opacity-0" />
      </div>

      {/* ── Cloche icon with lift animation ────────────────────── */}
      <ClocheIcon className="w-20 h-16 animate-cloche-lift" />

      {/* ── Micro wordmark ──────────────────────────────────────── */}
      <div className="mt-5 flex items-baseline gap-1.5">
        <span
          className="font-display font-bold text-forest tracking-tight"
          style={{ fontSize: "1.35rem" }}
        >
          Kirba
        </span>
        <span
          className="font-script text-burntorange"
          style={{ fontSize: "1.5rem" }}
        >
          Bites
        </span>
      </div>

      {/* ── Subtle pulse dot indicator ──────────────────────────── */}
      <div className="flex gap-1.5 mt-4">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-forest/40"
            style={{
              animation: "pulse 1.4s ease-in-out infinite",
              animationDelay: `${i * 0.22}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
