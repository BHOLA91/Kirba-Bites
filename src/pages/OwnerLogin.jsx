/**
 * pages/OwnerLogin.jsx  —  Restaurant owner login page
 * ─────────────────────────────────────────────────────────────────
 * Owners identify themselves with their Restaurant Unique ID (R-UID)
 * rather than email — this is the ID they set during signup and
 * have memorised for their stall.
 *
 * Layout (mirrors customer Login, same glass panel system):
 *  • Cream background
 *  • "DINE" watermark top-left / "DISCOVER" bottom-right
 *    (same low-opacity display-serif treatment, owner-toned vocabulary)
 *  • AuthCard glass panel:
 *      – KirbaWordmark (sm, no icon, no tagline)
 *      – "Owner Portal" badge to clearly signal context
 *      – R-UID field
 *      – Password field (show/hide)
 *      – Login CTA (forest green)
 *      – Divider + GoogleAuthButton
 *      – Link to Owner Signup
 *      – De-emphasised link back to Customer Login
 *
 * Validation:
 *  • R-UID: required, 3–20 chars, alphanumeric + underscores only
 *  • Password: required, min 6 chars
 *
 * TODO (backend):
 *  • Verify R-UID exists in the owners table             ← backend only
 *  • Verify password hash matches the stored record       ← backend only
 *  • On success: store JWT, set AuthContext with role:"owner"
 *    (AuthContext already has a `role` field — see context/AuthContext.jsx)
 */

import { useState } from "react";
import { Link }     from "react-router-dom";

import AuthCard         from "../components/auth/AuthCard";
import GoogleAuthButton from "../components/auth/GoogleAuthButton";
import FormInput        from "../components/common/FormInput";
import KirbaWordmark    from "../components/common/KirbaWordmark";

// ── Validation ────────────────────────────────────────────────────
const RUID_RE = /^[a-zA-Z0-9_]{3,20}$/;

function validate(fields) {
  const errs = {};
  if (!fields.ruid.trim())
    errs.ruid = "Restaurant ID is required.";
  else if (!RUID_RE.test(fields.ruid))
    errs.ruid = "3–20 characters: letters, numbers, underscores only.";
  if (!fields.password)
    errs.password = "Password is required.";
  else if (fields.password.length < 6)
    errs.password = "Password must be at least 6 characters.";
  return errs;
}

// ── Eye icon ──────────────────────────────────────────────────────
function EyeIcon({ open }) {
  return open ? (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none"
      viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none"
      viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
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

// ── Owner-specific watermark words ────────────────────────────────
function BgWords() {
  const base =
    "pointer-events-none select-none fixed font-display font-black leading-none " +
    "text-forest/[0.055] hidden sm:block";
  return (
    <>
      <span className={`${base} top-[-2vw] left-[-1vw] text-[22vw]`} aria-hidden="true">
        DINE
      </span>
      <span className={`${base} bottom-[-3vw] right-[-1vw] text-[13vw]`} aria-hidden="true">
        DISCOVER
      </span>
    </>
  );
}

// ── Owner portal badge ────────────────────────────────────────────
function OwnerBadge() {
  return (
    <div className="flex justify-center mb-5">
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full
        bg-forest/10 border border-forest/15
        text-forest font-body font-semibold text-[10px] uppercase tracking-widest">
        {/* Store icon */}
        <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none"
          viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 22V12h6v10" />
        </svg>
        Owner Portal
      </span>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────
export default function OwnerLogin() {
  const [fields, setFields]       = useState({ ruid: "", password: "" });
  const [errors, setErrors]       = useState({});
  const [showPw, setShowPw]       = useState(false);
  const [loading, setLoading]     = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setFields((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate(fields);
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      // TODO (backend): POST /auth/owner/login  { ruid, password }
      //  ↳ Server looks up owner by R-UID, compares password hash
      //  ↳ Returns JWT + owner profile
      // const { data } = await api.post("/auth/owner/login", fields);
      // AuthContext.login(data.user, data.token);  // role will be "owner"
      // navigate("/owner/dashboard");
      console.log("[OwnerLogin] submit →", { ruid: fields.ruid });
      await new Promise((r) => setTimeout(r, 800));
      setSubmitted(true);
    } catch (err) {
      setErrors({ form: "Login failed. Check your Restaurant ID and password." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen bg-cream flex items-center justify-center px-4 py-12 overflow-hidden">
      <BgWords />

      <AuthCard className="w-full max-w-sm">

        {/* Wordmark */}
        <div className="flex justify-center mb-6">
          <KirbaWordmark size="sm" showIcon={false} showTagline={false} />
        </div>

        {/* Owner badge */}
        <OwnerBadge />

        {/* Heading */}
        <div className="mb-7 text-center">
          <h1 className="font-display font-bold text-forest text-2xl leading-tight">
            Owner sign in
          </h1>
          <p className="text-ink-muted font-body text-sm mt-1.5">
            Access your restaurant dashboard
          </p>
        </div>

        {/* Stub success */}
        {submitted ? (
          <div className="text-center py-6">
            <p className="text-forest font-body font-semibold text-sm">
              ✓ Signed in! (stub — backend not connected yet)
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">

            {errors.form && (
              <p role="alert" className="text-xs text-red-500 text-center font-body bg-red-50/60 rounded-lg py-2 px-3">
                {errors.form}
              </p>
            )}

            {/* R-UID */}
            <FormInput
              id="owner-login-ruid"
              name="ruid"
              type="text"
              label="Restaurant ID (R-UID)"
              placeholder="e.g. campus_grill_01"
              autoComplete="username"
              value={fields.ruid}
              onChange={handleChange}
              error={errors.ruid}
            />

            {/* Password */}
            <FormInput
              id="owner-login-password"
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

            {/* CTA */}
            <button
              type="submit"
              disabled={loading}
              className="
                w-full py-3 rounded-xl
                bg-forest text-cream font-body font-semibold text-sm
                shadow-md transition-all duration-150
                hover:bg-forest-light hover:shadow-lg hover:-translate-y-px
                active:translate-y-0
                disabled:opacity-60 disabled:cursor-not-allowed
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burntorange/50
              "
            >
              {loading ? "Signing in…" : "Login"}
            </button>

            <OrDivider />

            <GoogleAuthButton label="Continue with Google" />

          </form>
        )}

        {/* Switch to Owner Signup */}
        <p className="mt-8 text-center text-xs text-ink-muted font-body">
          New restaurant on Kirba Bites?{" "}
          <Link
            to="/owner/signup"
            className="text-burntorange font-semibold hover:underline underline-offset-2 transition-colors"
          >
            Register your stall
          </Link>
        </p>

        {/* ── De-emphasised customer link ──────────────────────────
            Muted, small — visible but not competing with the main flow */}
        <p className="mt-3 text-center font-body" style={{ fontSize: "10px" }}>
          <span className="text-ink-faint">Looking to order food instead?{" "}</span>
          <Link
            to="/login"
            className="text-ink-faint underline underline-offset-2 hover:text-ink-muted transition-colors"
          >
            Customer login
          </Link>
        </p>

      </AuthCard>
    </div>
  );
}
