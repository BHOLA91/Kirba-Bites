/**
 * components/auth/AuthCard.jsx  —  Glassmorphism form container
 * ──────────────────────────────────────────────────────────────────
 * The shared visual container for all auth pages (Login, Signup,
 * OwnerLogin, OwnerSignup). Keeps the glassmorphism styling in one
 * place so it never gets duplicated.
 *
 * Design:
 *  • Semi-transparent cream/white frosted-glass panel
 *  • backdrop-blur for the glass effect
 *  • Thin light border to catch the "glass edge"
 *  • Soft shadow for lift
 *  • Rounded corners (2xl) — friendly, consistent with brand language
 *  • Entrance slide-up + fade-in animation (disabled on prefers-reduced-motion)
 *
 * Props:
 *  children   (ReactNode) — form content
 *  className  (string)    — extra utility classes (e.g. max-width overrides)
 */

export default function AuthCard({ children, className = "" }) {
  return (
    <div
      className={[
        // ── Glassmorphism surface ──────────────────────────────
        "bg-white/[0.14] backdrop-blur-md",
        "border border-white/30",
        "shadow-[0_8px_40px_rgba(29,59,42,0.10)]",
        "rounded-3xl",

        // ── Spacing ───────────────────────────────────────────
        "px-7 py-9 sm:px-10 sm:py-11",
        "w-full",

        // ── Entrance animation (slide-up fade-in) ─────────────
        // Uses Tailwind's animate-fade-in defined in tailwind.config.js.
        // prefers-reduced-motion: handled globally in index.css
        "animate-fade-in",

        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}
