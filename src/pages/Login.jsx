/**
 * pages/Login.jsx  —  Customer login page
 * ─────────────────────────────────────────────────────────────────
 * Layout:
 *  • Cream background (matches landing page)
 *  • "EAT" watermark text — top-left, low-opacity display serif
 *  • "EXPLORE" watermark text — bottom-right, low-opacity display serif
 *  • Centered AuthCard glass panel containing:
 *      – KirbaWordmark (sm, no icon, no tagline)
 *      – Email + Password fields (show/hide toggle)
 *      – "Forgot password?" link (placeholder)
 *      – Login CTA button (forest green)
 *      – Divider
 *      – GoogleAuthButton
 *      – Link to Signup
 *
 * Validation (client-side, no backend needed):
 *  • Email: required + basic RFC format check
 *  • Password: required + min 6 chars
 *
 * Submit handler: logs form data and sets a stub success state.
 * Replace the TODO block with an api.js call when backend is ready.
 */

import { useState } from "react";
import { Link }     from "react-router-dom";

import AuthCard         from "../components/auth/AuthCard";
import GoogleAuthButton from "../components/auth/GoogleAuthButton";
import FormInput        from "../components/common/FormInput";
import KirbaWordmark    from "../components/common/KirbaWordmark";

// ── Validation helpers ────────────────────────────────────────────
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(fields) {
  const errs = {};
  if (!fields.email.trim())           errs.email    = "Email is required.";
  else if (!EMAIL_RE.test(fields.email)) errs.email = "Enter a valid email address.";
  if (!fields.password)               errs.password = "Password is required.";
  else if (fields.password.length < 6) errs.password = "Password must be at least 6 characters.";
  return errs;
}

// ── Eye icon (show / hide password toggle) ───────────────────────
function EyeIcon({ open }) {
  return open ? (
    /* eye-open */
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ) : (
    /* eye-closed */
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  );
}

// ── Divider ───────────────────────────────────────────────────────
function OrDivider() {
  return (
    <div className="flex items-center gap-3 my-1" aria-hidden="true">
      <hr className="flex-1 border-white/30" />
      <span className="text-xs text-ink-faint font-body tracking-widest uppercase select-none">or</span>
      <hr className="flex-1 border-white/30" />
    </div>
  );
}

// ── Background watermark words ────────────────────────────────────
function BgWords() {
  const base =
    "pointer-events-none select-none fixed font-display font-black leading-none " +
    "text-forest/[0.055] hidden sm:block";
  return (
    <>
      <span className={`${base} top-[-2vw] left-[-1vw] text-[22vw]`} aria-hidden="true">
        EAT
      </span>
      <span className={`${base} bottom-[-3vw] right-[-1vw] text-[16vw]`} aria-hidden="true">
        EXPLORE
      </span>
    </>
  );
}

// ── Main component ────────────────────────────────────────────────
export default function Login() {
  const [fields, setFields]     = useState({ email: "", password: "" });
  const [errors, setErrors]     = useState({});
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setFields((prev) => ({ ...prev, [name]: value }));
    // Clear the error for this field as the user types
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate(fields);
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    try {
      // TODO: replace with real API call
      // const { data } = await api.post("/auth/login", fields);
      // AuthContext.login(data.user, data.token);
      // navigate("/home");
      console.log("[Login] submit →", fields);
      await new Promise((r) => setTimeout(r, 800)); // stub latency
      setSubmitted(true);
    } catch (err) {
      setErrors({ form: "Login failed. Please check your credentials." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen bg-cream flex items-center justify-center px-4 py-12 overflow-hidden">
      {/* ── Watermark background words ──────────────────────── */}
      <BgWords />

      {/* ── Glass card ─────────────────────────────────────── */}
      <AuthCard className="w-full max-w-sm">

        {/* ── Wordmark ─────────────────────────────────────── */}
        <div className="flex justify-center mb-8">
          <KirbaWordmark size="sm" showIcon={false} showTagline={false} />
        </div>

        {/* ── Heading ──────────────────────────────────────── */}
        <div className="mb-7 text-center">
          <h1 className="font-display font-bold text-forest text-2xl leading-tight">
            Welcome back
          </h1>
          <p className="text-ink-muted font-body text-sm mt-1.5">
            Sign in to your Kirba Bites account
          </p>
        </div>

        {/* ── Stub success state ────────────────────────────── */}
        {submitted ? (
          <div className="text-center py-6">
            <p className="text-forest font-body font-semibold text-sm">
              ✓ Logged in! (stub — backend not connected yet)
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">

            {/* Form-level error */}
            {errors.form && (
              <p role="alert" className="text-xs text-red-500 text-center font-body bg-red-50/60 rounded-lg py-2 px-3">
                {errors.form}
              </p>
            )}

            {/* ── Email ──────────────────────────────────── */}
            <FormInput
              id="login-email"
              name="email"
              type="email"
              label="Email"
              placeholder="you@university.edu"
              autoComplete="email"
              value={fields.email}
              onChange={handleChange}
              error={errors.email}
            />

            {/* ── Password ───────────────────────────────── */}
            <div className="flex flex-col gap-1">
              <FormInput
                id="login-password"
                name="password"
                type={showPw ? "text" : "password"}
                label="Password"
                placeholder="••••••••"
                autoComplete="current-password"
                value={fields.password}
                onChange={handleChange}
                error={errors.password}
                rightSlot={
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="text-ink-faint hover:text-forest transition-colors"
                    aria-label={showPw ? "Hide password" : "Show password"}
                  >
                    <EyeIcon open={showPw} />
                  </button>
                }
              />
              {/* Forgot password — placeholder link */}
              <div className="flex justify-end mt-0.5">
                <span
                  role="button"
                  tabIndex={0}
                  className="text-xs text-ink-faint font-body cursor-not-allowed select-none"
                  title="Password reset coming soon"
                  aria-disabled="true"
                >
                  Forgot password?
                </span>
              </div>
            </div>

            {/* ── Login CTA ──────────────────────────────── */}
            <button
              type="submit"
              disabled={loading}
              className="
                w-full py-3 rounded-xl
                bg-forest text-cream font-body font-semibold text-sm
                shadow-md
                transition-all duration-150
                hover:bg-forest-light hover:shadow-lg hover:-translate-y-px
                active:translate-y-0
                disabled:opacity-60 disabled:cursor-not-allowed
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burntorange/50
              "
            >
              {loading ? "Signing in…" : "Login"}
            </button>

            {/* ── Divider ────────────────────────────────── */}
            <OrDivider />

            {/* ── Google ─────────────────────────────────── */}
            <GoogleAuthButton />

          </form>
        )}

        {/* ── Switch to Signup ─────────────────────────────── */}
        <p className="mt-8 text-center text-xs text-ink-muted font-body">
          New to Kirba Bites?{" "}
          <Link
            to="/signup"
            className="text-burntorange font-semibold hover:underline underline-offset-2 transition-colors"
          >
            Create an account
          </Link>
        </p>
      </AuthCard>
    </div>
  );
}
