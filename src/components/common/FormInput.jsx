/**
 * components/common/FormInput.jsx  —  Reusable labeled form input
 * ──────────────────────────────────────────────────────────────────
 * Used by Login, Signup, and any future auth or settings forms.
 *
 * Features:
 *  • Label above the input
 *  • Default / focus (brand orange ring) / error visual states
 *  • Optional right-side slot (used for password show/hide toggle)
 *  • Error message rendered below the field in a standard red tint
 *  • Fully controlled (value + onChange come from parent)
 *  • Forwards all standard <input> props via rest spread
 *
 * Props:
 *  id          (string, required)  — links <label> and <input>
 *  label       (string, required)  — visible label text
 *  error       (string)            — if truthy, shows error state + message
 *  helperText  (string)            — optional muted hint rendered below the input
 *                                    (shown only when there is no error)
 *  rightSlot   (ReactNode)         — optional element inside the right edge
 *                                    (e.g. the eye icon for password fields)
 *  className   (string)            — extra classes on the outer wrapper
 *  ...rest     — all other <input> props (type, value, onChange, placeholder…)
 */

import { forwardRef } from "react";

const FormInput = forwardRef(function FormInput(
  { id, label, error, helperText, rightSlot, className = "", ...rest },
  ref
) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {/* ── Label ──────────────────────────────────────────────── */}
      <label
        htmlFor={id}
        className="text-xs font-semibold uppercase tracking-widest text-forest/70 font-body select-none"
      >
        {label}
      </label>

      {/* ── Input wrapper (positions the rightSlot absolutely) ─── */}
      <div className="relative">
        <input
          ref={ref}
          id={id}
          className={[
            // Base
            "w-full rounded-xl px-4 py-3 font-body text-sm text-ink",
            "bg-cream/60 placeholder-ink-faint/60",
            "border transition-all duration-150 outline-none",
            // Right padding when there's a slot (eye icon etc.)
            rightSlot ? "pr-11" : "",
            // State-based border + ring
            error
              ? "border-red-400 ring-2 ring-red-300/50"
              : "border-white/40 focus:border-burntorange/60 focus:ring-2 focus:ring-burntorange/20",
          ]
            .filter(Boolean)
            .join(" ")}
          aria-describedby={error ? `${id}-error` : undefined}
          aria-invalid={!!error}
          {...rest}
        />

        {/* ── Right slot (e.g. password toggle) ─────────────────── */}
        {rightSlot && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            {rightSlot}
          </div>
        )}
      </div>

      {/* ── Helper text (shown when no error) ───────────────────── */}
      {helperText && !error && (
        <p className="text-[11px] text-ink-faint font-body leading-relaxed mt-0.5">
          {helperText}
        </p>
      )}

      {/* ── Error message (replaces helper text when present) ────── */}
      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className="text-xs text-red-500 font-body mt-0.5 flex items-center gap-1"
        >
          {/* Small inline error dot */}
          <span className="inline-block w-1 h-1 rounded-full bg-red-500 flex-shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
});

export default FormInput;
