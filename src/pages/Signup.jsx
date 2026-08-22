/**
 * pages/Signup.jsx  —  Customer registration page
 * ─────────────────────────────────────────────────────────────────
 * Layout:
 *  • Cream background + "EAT" / "EXPLORE" watermark words (shared with Login)
 *  • Centered AuthCard glass panel — scrollable on mobile for the longer form
 *  • KirbaWordmark (sm, no icon, no tagline)
 *  • Fields: firstName, lastName, username, email, address, password
 *  • Password strength bar (visual only, no library needed)
 *  • Create Account CTA (forest green)
 *  • Divider + GoogleAuthButton
 *  • Link to Login
 *
 * Validation (client-side):
 *  • All fields required
 *  • Email: RFC format check
 *  • Username: 3–20 alphanumeric / underscore chars
 *  • Password: min 8 chars
 *
 * Submit handler: console.logs form data.
 * Replace the TODO block with api.js call when backend is ready.
 */

import { useState, useMemo } from "react";
import { Link }              from "react-router-dom";

import AuthCard         from "../components/auth/AuthCard";
import GoogleAuthButton from "../components/auth/GoogleAuthButton";
import FormInput        from "../components/common/FormInput";
import KirbaWordmark    from "../components/common/KirbaWordmark";

// ── Validation ────────────────────────────────────────────────────
const EMAIL_RE    = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/;

function validate(f) {
  const e = {};
  if (!f.firstName.trim())             e.firstName = "First name is required.";
  if (!f.lastName.trim())              e.lastName  = "Last name is required.";
  if (!f.username.trim())              e.username  = "Username is required.";
  else if (!USERNAME_RE.test(f.username))
    e.username = "3–20 characters: letters, numbers, underscores only.";
  if (!f.email.trim())                 e.email     = "Email is required.";
  else if (!EMAIL_RE.test(f.email))    e.email     = "Enter a valid email address.";
  if (!f.address.trim())               e.address   = "Address is required.";
  if (!f.password)                     e.password  = "Password is required.";
  else if (f.password.length < 8)      e.password  = "Password must be at least 8 characters.";
  return e;
}

// ── Password strength ─────────────────────────────────────────────
function getStrength(pw) {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 8)              score++;
  if (/[A-Z]/.test(pw))           score++;
  if (/[0-9]/.test(pw))           score++;
  if (/[^A-Za-z0-9]/.test(pw))   score++;
  return score; // 0–4
}

const STRENGTH_META = [
  { label: "",        color: "bg-transparent" },
  { label: "Weak",    color: "bg-red-400" },
  { label: "Fair",    color: "bg-yellow-400" },
  { label: "Good",    color: "bg-burntorange" },
  { label: "Strong",  color: "bg-forest" },
];

function PasswordStrengthBar({ password }) {
  const strength = getStrength(password);
  const meta     = STRENGTH_META[strength];
  if (!password) return null;
  return (
    <div className="mt-2 space-y-1.5">
      {/* 4-segment bar */}
      <div className="flex gap-1" aria-hidden="true">
        {[1, 2, 3, 4].map((seg) => (
          <div
            key={seg}
            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
              seg <= strength ? meta.color : "bg-ink-faint/20"
            }`}
          />
        ))}
      </div>
      {/* Requirement hints */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
        {[
          { ok: password.length >= 8,           label: "8+ characters" },
          { ok: /[A-Z]/.test(password),          label: "Uppercase letter" },
          { ok: /[0-9]/.test(password),          label: "Number" },
          { ok: /[^A-Za-z0-9]/.test(password),  label: "Special character" },
        ].map(({ ok, label }) => (
          <span
            key={label}
            className={`text-[10px] font-body flex items-center gap-1 transition-colors ${
              ok ? "text-forest" : "text-ink-faint"
            }`}
          >
            <span>{ok ? "✓" : "·"}</span>
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Eye icon ──────────────────────────────────────────────────────
function EyeIcon({ open }) {
  return open ? (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ) : (
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

// ── Initial field state ───────────────────────────────────────────
const INITIAL = {
  firstName: "",
  lastName:  "",
  username:  "",
  email:     "",
  address:   "",
  password:  "",
};

// ── Main component ────────────────────────────────────────────────
export default function Signup() {
  const [fields, setFields]       = useState(INITIAL);
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
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    try {
      // TODO: replace with real API call
      // const { data } = await api.post("/auth/signup", fields);
      // AuthContext.login(data.user, data.token);
      // navigate("/home");
      console.log("[Signup] submit →", fields);
      await new Promise((r) => setTimeout(r, 900)); // stub latency
      setSubmitted(true);
    } catch (err) {
      setErrors({ form: "Sign up failed. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen bg-cream flex items-center justify-center px-4 py-12 overflow-hidden">
      {/* ── Watermark background words ──────────────────────── */}
      <BgWords />

      {/* ── Glass card ─────────────────────────────────────── */}
      <AuthCard className="w-full max-w-md my-4">

        {/* ── Wordmark ─────────────────────────────────────── */}
        <div className="flex justify-center mb-7">
          <KirbaWordmark size="sm" showIcon={false} showTagline={false} />
        </div>

        {/* ── Heading ──────────────────────────────────────── */}
        <div className="mb-7 text-center">
          <h1 className="font-display font-bold text-forest text-2xl leading-tight">
            Create your account
          </h1>
          <p className="text-ink-muted font-body text-sm mt-1.5">
            Find and order from every stall on campus
          </p>
        </div>

        {/* ── Stub success ──────────────────────────────────── */}
        {submitted ? (
          <div className="text-center py-6">
            <p className="text-forest font-body font-semibold text-sm">
              ✓ Account created! (stub — backend not connected yet)
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

            {/* ── Name row ───────────────────────────────── */}
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                id="signup-firstname"
                name="firstName"
                type="text"
                label="First name"
                placeholder="Priya"
                autoComplete="given-name"
                value={fields.firstName}
                onChange={handleChange}
                error={errors.firstName}
              />
              <FormInput
                id="signup-lastname"
                name="lastName"
                type="text"
                label="Last name"
                placeholder="Sharma"
                autoComplete="family-name"
                value={fields.lastName}
                onChange={handleChange}
                error={errors.lastName}
              />
            </div>

            {/* ── Username ───────────────────────────────── */}
            <FormInput
              id="signup-username"
              name="username"
              type="text"
              label="Username"
              placeholder="priya_s"
              autoComplete="username"
              value={fields.username}
              onChange={handleChange}
              error={errors.username}
            />

            {/* ── Email ──────────────────────────────────── */}
            <FormInput
              id="signup-email"
              name="email"
              type="email"
              label="Email"
              placeholder="you@university.edu"
              autoComplete="email"
              value={fields.email}
              onChange={handleChange}
              error={errors.email}
            />

            {/* ── Address ────────────────────────────────── */}
            <FormInput
              id="signup-address"
              name="address"
              type="text"
              label="Address / Hostel"
              placeholder="Block C, Room 204"
              autoComplete="street-address"
              value={fields.address}
              onChange={handleChange}
              error={errors.address}
            />

            {/* ── Password ───────────────────────────────── */}
            <div>
              <FormInput
                id="signup-password"
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
              {/* Strength bar — only visible while user is typing */}
              <PasswordStrengthBar password={fields.password} />
            </div>

            {/* ── Create Account CTA ─────────────────────── */}
            <button
              type="submit"
              disabled={loading}
              className="
                w-full py-3 rounded-xl mt-1
                bg-forest text-cream font-body font-semibold text-sm
                shadow-md
                transition-all duration-150
                hover:bg-forest-light hover:shadow-lg hover:-translate-y-px
                active:translate-y-0
                disabled:opacity-60 disabled:cursor-not-allowed
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burntorange/50
              "
            >
              {loading ? "Creating account…" : "Create Account"}
            </button>

            {/* ── Divider ────────────────────────────────── */}
            <OrDivider />

            {/* ── Google ─────────────────────────────────── */}
            <GoogleAuthButton label="Sign up with Google" />

          </form>
        )}

        {/* ── Switch to Login ──────────────────────────────── */}
        <p className="mt-8 text-center text-xs text-ink-muted font-body">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-burntorange font-semibold hover:underline underline-offset-2 transition-colors"
          >
            Log in
          </Link>
        </p>
      </AuthCard>
    </div>
  );
}
