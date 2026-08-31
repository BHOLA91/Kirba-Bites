/**
 * pages/OwnerSignup.jsx  —  Restaurant owner registration page
 * ─────────────────────────────────────────────────────────────────
 * Registers a new restaurant/stall on Kirba Bites. The R-UID the
 * owner sets here becomes their permanent login identifier.
 *
 * Field order (per brief):
 *  1. Restaurant name
 *  2. Owner name
 *  3. Email
 *  4. Phone number
 *  5. R-UID  (with helperText explaining its dual login + search purpose)
 *  6. Password (with strength bar)
 *  → Create Account CTA
 *  → Google button
 *  → Switch to Owner Login
 *  → De-emphasised link to Customer Signup (very bottom)
 *
 * Validation:
 *  • All fields: required
 *  • Email: RFC format
 *  • Phone: 7–15 digits (allows leading + for country code)
 *  • R-UID: 3–20 chars, alphanumeric + underscores, no spaces
 *  • Password: min 8 chars
 *
 * NOTE on R-UID uniqueness:
 *  Client-side only validates format. Uniqueness is a backend concern.
 *  TODO (backend): POST /auth/owner/signup should return 409 if R-UID
 *  is already taken — handle that error in the catch block below.
 *
 * TODO (auth):
 *  On success: store JWT, set AuthContext with role:"owner"
 *  (AuthContext already scaffolded with role field — context/AuthContext.jsx)
 */

import { useState }                                 from "react";
import { Link, useNavigate }                        from "react-router-dom";
import { signUpOwner, signInWithGoogle }            from "../services/auth";

import AuthCard         from "../components/auth/AuthCard";
import GoogleAuthButton from "../components/auth/GoogleAuthButton";
import FormInput        from "../components/common/FormInput";
import KirbaWordmark    from "../components/common/KirbaWordmark";

// ── Validation ────────────────────────────────────────────────────
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[0-9]{7,15}$/;
const RUID_RE  = /^[a-zA-Z0-9_]{3,20}$/;

function validate(f) {
  const e = {};
  if (!f.restaurantName.trim()) e.restaurantName = "Restaurant name is required.";
  if (!f.ownerName.trim())      e.ownerName      = "Owner name is required.";
  if (!f.email.trim())          e.email          = "Email is required.";
  else if (!EMAIL_RE.test(f.email)) e.email      = "Enter a valid email address.";
  if (!f.phone.trim())          e.phone          = "Phone number is required.";
  else if (!PHONE_RE.test(f.phone.replace(/\s/g, "")))
    e.phone = "Enter a valid phone number (7–15 digits).";
  if (!f.ruid.trim())           e.ruid           = "Restaurant ID is required.";
  else if (!RUID_RE.test(f.ruid))
    e.ruid = "3–20 characters: letters, numbers, underscores only. No spaces.";
  if (!f.password)              e.password       = "Password is required.";
  else if (f.password.length < 8) e.password     = "Password must be at least 8 characters.";
  return e;
}

// ── Password strength ─────────────────────────────────────────────
function getStrength(pw) {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 8)             score++;
  if (/[A-Z]/.test(pw))          score++;
  if (/[0-9]/.test(pw))          score++;
  if (/[^A-Za-z0-9]/.test(pw))  score++;
  return score;
}
const STRENGTH_META = [
  { label: "",       color: "bg-transparent" },
  { label: "Weak",   color: "bg-red-400"     },
  { label: "Fair",   color: "bg-yellow-400"  },
  { label: "Good",   color: "bg-burntorange" },
  { label: "Strong", color: "bg-forest"      },
];

function PasswordStrengthBar({ password }) {
  const strength = getStrength(password);
  const meta     = STRENGTH_META[strength];
  if (!password) return null;
  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1" aria-hidden="true">
        {[1, 2, 3, 4].map((seg) => (
          <div key={seg}
            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
              seg <= strength ? meta.color : "bg-ink-faint/20"
            }`}
          />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
        {[
          { ok: password.length >= 8,          label: "8+ characters"    },
          { ok: /[A-Z]/.test(password),         label: "Uppercase letter" },
          { ok: /[0-9]/.test(password),         label: "Number"           },
          { ok: /[^A-Za-z0-9]/.test(password), label: "Special character"},
        ].map(({ ok, label }) => (
          <span key={label}
            className={`text-[10px] font-body flex items-center gap-1 transition-colors ${
              ok ? "text-forest" : "text-ink-faint"
            }`}>
            <span>{ok ? "✓" : "·"}</span>{label}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Eye icon ──────────────────────────────────────────────────────
function EyeIcon({ open }) {
  return open ? (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none"
      viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none"
      viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
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
        <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none"
          viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 22V12h6v10"/>
        </svg>
        Owner Portal
      </span>
    </div>
  );
}

// ── R-UID helper text (constant) ──────────────────────────────────
const RUID_HELPER =
  "This is your restaurant's unique ID on KIRBA BITES — you'll use it to log in, " +
  "and students may use it to find you directly. Choose something short and memorable " +
  "(e.g. campus_grill, messi_canteen). No spaces allowed.";

// ── Initial state ─────────────────────────────────────────────────
const INITIAL = {
  restaurantName: "",
  ownerName:      "",
  email:          "",
  phone:          "",
  ruid:           "",
  password:       "",
};

// ── Main component ────────────────────────────────────────────────
export default function OwnerSignup() {
  const navigate = useNavigate();
  const [fields,    setFields]    = useState(INITIAL);
  const [errors,    setErrors]    = useState({});
  const [formError, setFormError] = useState("");
  const [showPw,    setShowPw]    = useState(false);
  const [loading,   setLoading]   = useState(false);

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
    setFormError("");
    try {
      await signUpOwner({
        email:          fields.email,
        password:       fields.password,
        ownerName:      fields.ownerName,
        restaurantName: fields.restaurantName,
        ruid:           fields.ruid,
        phone:          fields.phone,
      });
      navigate("/owner/dashboard");
    } catch (err) {
      if (err.field === "ruid") {
        setErrors((p) => ({ ...p, ruid: err.message }));
      } else {
        setFormError(err.message || "Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    try {
      await signInWithGoogle({ intendedRole: "owner" });
    } catch (err) {
      setFormError("Google sign-in failed. Please try again.");
    }
  }

  return (
    <div className="relative min-h-screen bg-cream flex items-center justify-center px-4 py-12 overflow-hidden">
      <BgWords />

      <AuthCard className="w-full max-w-md my-4">

        {/* Wordmark */}
        <div className="flex justify-center mb-6">
          <KirbaWordmark size="sm" showIcon={false} showTagline={false} />
        </div>

        {/* Owner badge */}
        <OwnerBadge />

        {/* Heading */}
        <div className="mb-7 text-center">
          <h1 className="font-display font-bold text-forest text-2xl leading-tight">
            List your restaurant
          </h1>
          <p className="text-ink-muted font-body text-sm mt-1.5">
            Get discovered by every student on campus
          </p>
        </div>


          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">

            {formError && (
              <p role="alert" className="text-xs text-red-500 text-center font-body bg-red-50/60 rounded-lg py-2 px-3">
                {formError}
              </p>
            )}

            {/* 1. Restaurant name */}
            <FormInput
              id="owner-signup-restaurant"
              name="restaurantName"
              type="text"
              label="Restaurant / Stall name"
              placeholder="Campus Grill"
              autoComplete="organization"
              value={fields.restaurantName}
              onChange={handleChange}
              error={errors.restaurantName}
            />

            {/* 2. Owner name */}
            <FormInput
              id="owner-signup-ownername"
              name="ownerName"
              type="text"
              label="Your name"
              placeholder="Ramesh Kumar"
              autoComplete="name"
              value={fields.ownerName}
              onChange={handleChange}
              error={errors.ownerName}
            />

            {/* 3. Email */}
            <FormInput
              id="owner-signup-email"
              name="email"
              type="email"
              label="Email"
              placeholder="restaurant@example.com"
              autoComplete="email"
              value={fields.email}
              onChange={handleChange}
              error={errors.email}
            />

            {/* 4. Phone */}
            <FormInput
              id="owner-signup-phone"
              name="phone"
              type="tel"
              label="Phone number"
              placeholder="+91 98765 43210"
              autoComplete="tel"
              value={fields.phone}
              onChange={handleChange}
              error={errors.phone}
            />

            {/* 5. R-UID — with helperText explaining its dual purpose */}
            <FormInput
              id="owner-signup-ruid"
              name="ruid"
              type="text"
              label="Restaurant ID (R-UID)"
              placeholder="campus_grill_01"
              autoComplete="off"
              value={fields.ruid}
              onChange={handleChange}
              error={errors.ruid}
              helperText={RUID_HELPER}
            />

            {/* 6. Password + strength bar */}
            <div>
              <FormInput
                id="owner-signup-password"
                name="password"
                type={showPw ? "text" : "password"}
                label="Password"
                placeholder="••••••••"
                autoComplete="new-password"
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
              <PasswordStrengthBar password={fields.password} />
            </div>

            {/* CTA */}
            <button
              type="submit"
              disabled={loading}
              className="
                w-full py-3 rounded-xl mt-1
                bg-forest text-cream font-body font-semibold text-sm
                shadow-md transition-all duration-150
                hover:bg-forest-light hover:shadow-lg hover:-translate-y-px
                active:translate-y-0
                disabled:opacity-60 disabled:cursor-not-allowed
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burntorange/50
              "
            >
              {loading ? "Creating account…" : "Create Restaurant Account"}
            </button>

            <OrDivider />

            <GoogleAuthButton label="Sign up with Google" onClick={handleGoogle} />

          </form>

        {/* Switch to Owner Login */}
        <p className="mt-8 text-center text-xs text-ink-muted font-body">
          Already registered your restaurant?{" "}
          <Link
            to="/owner/login"
            className="text-burntorange font-semibold hover:underline underline-offset-2 transition-colors"
          >
            Owner login
          </Link>
        </p>

        {/* ── De-emphasised customer link ──────────────────────────
            Smallest visual weight on the page — customers who landed
            here by mistake can find their way back without it
            competing with the owner registration flow.              */}
        <p className="mt-3 text-center font-body" style={{ fontSize: "10px" }}>
          <span className="text-ink-faint">Looking to order food instead?{" "}</span>
          <Link
            to="/signup"
            className="text-ink-faint underline underline-offset-2 hover:text-ink-muted transition-colors"
          >
            Customer sign up
          </Link>
        </p>

      </AuthCard>
    </div>
  );
}
